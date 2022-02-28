export type Dict<T> = Record<string, T>;

export type AnyFunction = (...args: any[]) => any;
export type AnyFunctionAs<T> = (this: T, ...args: any[]) => any;

export type ObjectWithMethod<
  Key extends PropertyKey,
  Value extends (args: any[]) => any,
  Obj = {
    method(...args: Parameters<Value>): ReturnType<Value>;
  }
> = { [K in keyof Obj as Key]: Obj[K] };

export type Identity<T> = T extends Record<string, unknown>
  ? { [P in keyof T]: Identity<T[P]> }
  : T;

export type KeyNamesOf<Object, Match> = {
  [K in keyof Object]: Object[K] extends Match ? K : never;
}[keyof Object];

// From: https://fettblog.eu/typescript-union-to-intersection/
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
) => any
  ? R
  : never;
