// this was taken from an earlier version of the codebase where i wrote Structure as a single ts file
// now, to make it simpler, the implementation and the definitions are split into separate files
// however, the these defs can certainly be simplified. until then, i REFUSE to publicly export anything besides `Structure`

import { DataType, Serializer } from "./DataType";
import { Dict } from "./helper-types";

interface PropertyOptions<T = any> {
    default?: T | (() => T);
}
export interface StructureProperty<Type = any, Required extends boolean = false> {
    type: DataType<Type>;
    default?: Type | (() => Type);
}
declare type ObjWithMethod<Key extends PropertyKey, Value extends (args: any[]) => any, Obj = {
    method(...args: Parameters<Value>): ReturnType<Value>;
}> = {
    [K in keyof Obj as Key]: Obj[K];
};
export declare type Identity<T> = T extends Record<string, unknown> ? {
    [P in keyof T]: Identity<T[P]>;
} : T;
export interface CreateOptions<T extends Dict<StructureProperty>, M> {
    customSerializer?: Serializer<StructureInstance<T, M>>;
    abstract?: boolean;
}
export declare class Structure<Props extends Dict<StructureProperty> = {}, Methods = {}> {
    readonly name: string;
    private properties;
    private methods;
    constructor(name?: string);
    prop<Key extends string, Type>(key: Key, type: DataType<Type>): Structure<Props & {
        [key in Key]: StructureProperty<Type, Extract<Type, null | undefined> extends never ? true : false>;
    }, Methods>;
    prop<Key extends string, Type, Options extends PropertyOptions<Type>>(key: Key, type: DataType<Type>, options: Options): Structure<Props & {
        [key in Key]: StructureProperty<Type, Options['default'] extends undefined ? Type extends null | undefined ? false : true : false>;
    }, Methods>;
    method<Key extends string, Func extends (this: StructureInstance<Props, Methods>, ...args: any[]) => any>(key: Key, func: Func): Structure<Props, Methods & ObjWithMethod<Key, Func>>;
    mixin<T2 extends Dict<StructureProperty>, M2>(mixin: Structure<T2, M2> | StructureType<T2, M2>): Structure<Props & T2, Methods & M2>;
    create(opts?: CreateOptions<Props, Methods>): StructureType<Props, Methods>;
}
declare type StructureType<T extends Dict<StructureProperty>, M> = DataType<StructureInstance<T, M>> & {
    new (data: StructureOptions<T>): StructureInstance<T, M>;
    extend(name: string): Structure<T, M>;
    types: {
        [key in keyof T]: T[key]['type'];
    };
    properties: T;
    methods: M;
};
declare type StructureInstance<T extends Dict<StructureProperty>, M> = Identity<{
    [K in keyof T]: T[K] extends StructureProperty<infer Type> ? Type : never;
} & M>;
export declare type RequiredKeyNames<T, A> = {
    [K in keyof T]: T[K] extends StructureProperty<infer T, infer R> ? R extends A ? K : never : never;
}[keyof T];
export declare type StructureOptions<T extends Dict<StructureProperty>> = Identity<{
    [K in RequiredKeyNames<T, true>]: T[K] extends StructureProperty<infer Type> ? Type : never;
} & {
    [K in RequiredKeyNames<T, false>]?: T[K] extends StructureProperty<infer Type> ? Type : never;
}>;