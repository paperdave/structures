/**
 * Due to the absurd complexity of this class, the implmentation and the typings are separate. It
 * may not look simpler than having one ts file, but I promise you, it is.
 *
 * To reduce issues:
 *
 * - There is an extensive test suite covering every line of code in this class, ensuring bug-free code.
 * - There is a stupid amount of comments, increasing understanding and maintainability.
 *
 * Have fun reading,
 *
 * - Dave Caruso
 */
import { DataType, Serializer } from './DataType';
import {
  AnyFunction,
  Identity,
  KeyNamesOf,
  ObjectWithMethod,
  UnionToIntersection,
} from './helper-types';

/**
 * @internal Box type for the definition of a property on a structure. Do not pass a DataType,
 * but rather the underlying type.
 */
interface Prop<Type, Serialized, HasDefault extends boolean = false> {
  Type: Type;
  Serialized: Serialized;
  HasDefault: HasDefault;
}

/** @internal Unwraps the type T out of Prop<T> */
type UnwrapPropType<T> = T extends Prop<infer Type, infer Serialized, infer HasDefault>
  ? Type
  : never;

/** @internal Unwraps the serialized T out of Prop<T> */
type UnwrapPropSerialized<T> = T extends Prop<infer Type, infer Serialized, infer HasDefault>
  ? Type
  : never;

/** @internal Converts a Prop to a DataType */
type GetPropDataType<T> = T extends Prop<infer Type, infer Serialized, infer HasDefault>
  ? DataType<Type, Serialized>
  : never;

/** @internal Box type for the definition of a method on a structure. */
interface Method<M extends AnyFunction> {
  Function: M;
}

/** @internal Unwraps the type M out of Method<M> */
type UnwrapMethod<T> = T extends Method<infer M> ? M : never;

/** Options passed as an optional third argument to Structure.prop */
export interface StructurePropOptions<T> {
  /**
   * Provide a default value or function to return the default value.Properties with default values
   * or nullable data types do not have to be passed during the constructor.
   */
  default?: T | (() => T);
}

/** Options passed as an optional argument to Structure.create */
export interface StructureCreateOptions<I> {
  customSerializer?: Serializer<StructureInstance<I>>;
}

/**
 * Builder-style class for custom object structures. Chain properties with `.prop`, then convert it
 * to a DataType class with `.create`. The resulting class can be used to create instances of the
 * structure using the `new` keyword, or via serialization methods `fromJSON` and `toJSON`.
 */
// The type argument `Properties` is an object of either Prop or Method objects, which determine the
// signature of the created object. Calling `prop` or `method` will add a property or method to the
// type parameter. When calling `create`, the properties and methods will passed onto
// `StructureType` and `StructureInstance` so they show the built types.
export declare class Structure<Properties = {}> {
  constructor(name?: string);

  /** The name of this structure */
  readonly name: string;

  /** Add a property to this structure, then return itself. */
  prop<
    // We need to grab everything as a type paramteter, so we can use it for the return value.
    Key extends string,
    Type, // (Type refers to the underlying type of the property)
    Opts extends StructurePropOptions<any>
  >(
    key: Key,
    type: DataType<Type, Serialized>,
    options: Opts
  ): Structure<
    // Identity is used to clean up the type that is shown in the hover-ui.
    // instead of { x: Prop<...> } & { y: Prop<...> }, we want { x: Prop<...>, y: Prop<...> }
    Identity<
      // The main logic of this return type is combining the existing properties
      // with one new property. We do that with a simple "mapped" type.
      Properties & {
        [K in Key]: Prop<
          Type,
          Serialized,
          // Check for default in the options, which is used to alter the types slightly.
          Opts['default'] extends Type | (() => Type)
            ? true
            : // If the type includes null or undefined, default is set to true
            Extract<Type, null | undefined> extends never
            ? false
            : true
        >;
      }
    >
  >;

  /** Add a property to this structure, then return itself. */
  // This is a simplified version of the above prop method, which is used for the case where there
  // is no options object. It's impossible to pass a default value this way, so it is a LOT simpler.
  prop<Key extends string, Type, Serialized>(
    key: Key,
    type: DataType<Type, Serialized>
  ): Structure<
    // See above for how this works
    Identity<
      Properties & {
        [K in Key]: Prop<
          Type,
          Serialized,
          Extract<Type, null | undefined> extends never ? false : true
        >;
      }
    >
  >;

  /** Add a method to this structure, then return itself. */
  // Implementation for this type is extremely simple, especially after seeing the above ones.
  method<
    Key extends string,
    Func extends (this: StructureInstance<Properties>, ...args: any[]) => any
  >(key: Key, func: Func): Structure<Identity<Properties & { [K in Key]: Method<Func> }>>;

  /** Applies a mixin to this structure, copying every property and method from the mixin to this structure. */
  mixin<M>(mixin: Structure<M> | StructureClass<M>): Structure<Properties & M>;

  /** Finalize building and return the structure class */
  create(opts?: StructureCreateOptions<Properties>): StructureClass<Properties>;
}

/** @internal with structure properties object, returns union of key names for all property names */
type PropKeyNames<I> = KeyNamesOf<I, Prop<any, any, boolean>>;
/** @internal with structure properties object, returns union of key names for all required property names */
type RequiredPropKeyNames<I> = KeyNamesOf<I, Prop<any, any, false>>;
/** @internal with structure properties object, returns union of key names for all optional property names */
type OptionalPropKeyNames<I> = KeyNamesOf<I, Prop<any, any, true>>;
/** @internal with structure properties object, returns union of key names for all method names */
type MethodKeyNames<I> = KeyNamesOf<I, Method<any>>;

/**
 * The class type of a custom-built structure. See `Structure` for more information on how to create
 * and use these.
 */
export type StructureClass<I> =
  // This extends DataType, so it is intersected with the other properties in this types.
  DataType<StructureInstance<I>, SerializedStructure<I>> &
    // This is a constructor itself, but passing an argument depends on if there are any required
    // properties (something which has no null and no default function)
    (RequiredPropKeyNames<I> extends never
      ? {
          new (data?: StructureOptions<I>): StructureInstance<I>;
        }
      : {
          new (data: StructureOptions<I>): StructureInstance<I>;
        }) & {
      // The other two properties are really simple, so i wont explain them.

      /**
       * Extend this structure, essentially creating a new `Structure` builder out of the
       * configuration this structure has.
       */
      extend(name?: string): Structure<I>;

      /** Reference property types that this structure uses. An object of `DataType`s */
      types: {
        [K in PropKeyNames<I>]: GetPropDataType<I[K]>;
      };
    };

/**
 * An instance of a `StructureClass`, which contains all validated properties methods. See
 * `Structure` for more information on how to create and use these.
 */
// The implementation on this is quite simple, just copy over the properties and methods.
export type StructureInstance<I> = Identity<
  {
    toJSON(): unknown;
  } & {
    [K in PropKeyNames<I>]: UnwrapPropType<I[K]>;
  } & {
    // Methods are very funky (so is prettier formatting this comment block)
    //
    // If you do not declare a method using { method(): void } notation, it will show the property
    // icon in VSCode, so instead i get around this using a helper type `ObjectWithMethod` which gets
    // around this.
  } & UnionToIntersection<
      {
        [K in MethodKeyNames<I>]: ObjectWithMethod<K, UnwrapMethod<I[K]>>;
      }[MethodKeyNames<I>]
    >
>;

/** An serialized instance of a `StructureClass` */
export type SerializedStructure<I> = Identity<{
  [K in PropKeyNames<I>]: UnwrapPropSerialized<I[K]>;
}>;

/** Options to pass to the constructor for a `StructureClass` */
// This is a simple type. Just make the required properties required, and the optional optional.
export type StructureOptions<I> = Identity<
  {
    [K in RequiredPropKeyNames<I>]: UnwrapPropType<I[K]>;
  } & {
    [K in OptionalPropKeyNames<I>]?: UnwrapPropType<I[K]>;
  }
>;
