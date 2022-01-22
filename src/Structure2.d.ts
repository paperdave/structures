import { types } from '.';
import { DataType, Serializer } from './DataType';
import { AnyFunction, Identity, ObjectWithMethod } from './helper-types';

interface Prop<Type, HasDefault extends boolean = false> {
  Type: Type;
  HasDefault: HasDefault;
}

type UnwrapProp<T> = T extends Prop<infer Type, infer HasDefault> ? Type : never;

interface Method<M extends AnyFunction> {
  Function: M;
}

export interface StructurePropOptions<T> {
  default?: T | (() => T);
}

export interface StructureCreateOptions<I> {
  customSerializer?: Serializer<StructureInstance<I>>;
  abstract?: boolean;
}

/** Builder class for custom structures. */
export declare class Structure<Properties = {}> {
  readonly name: string;

  prop<Key extends string, Type, Opts extends StructurePropOptions<T>>(
    key: Key,
    type: DataType<Type>,
    options: Opts
  ): Structure<
    Identity<
      Properties & {
        [K in Key]: Prop<Type, Opts['default'] extends Type | (() => Type) ? true : false>;
      }
    >
  >;

  prop<Key extends string, Type>(
    key: Key,
    type: DataType<Type>
  ): Structure<Identity<Properties & { [K in Key]: Prop<Type> }>>;

  method<
    Key extends string,
    Func extends (this: StructureInstance<Properties>, ...args: any[]) => any
  >(key: Key, func: Func): Structure<Identity<Properties>, Identity<{ [K in Key]: Method<Func> }>>;

  mixin<M>(mixin: Structure<M> | StructureType<M>): Structure<T & M>;

  create(opts?: StructureCreateOptions): StructureType<Properties>;
}

type KeyNamesOf<Object, Match> = {
  [K in keyof Object]: Object[K] extends Match ? K : never;
}[keyof Object];

type PropKeyNames<I> = KeyNamesOf<I, Prop<any, boolean>>;
type RequiredPropKeyNames<I> = KeyNamesOf<I, Prop<any, true>>;

export type StructureType<I> = DataType<StructureInstance<I>> &
  (RequiredPropKeyNames<I> extends never
    ? {
        new (data?: StructureOptions<I>): StructureInstance<I>;
      }
    : {
        new (data: StructureOptions<I>): StructureInstance<I>;
      }) & {
    extend(name?: string): Structure<I>;
    types: {
      [K in PropKeyNames<I>]: DataType<UnwrapProp<I[K]>>;
    };
  };

export type StructureInstance<I> = null;

export type StructureOptions<I> = null;

const x = new Structure()
  .prop('x', types.Number, {})
  .prop('y', types.Number, { default: () => 0 })
  .create();

new x();
