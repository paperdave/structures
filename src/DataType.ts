export interface Serializer<T, S = unknown> {
  toJSON(instance: T): S;
  fromJSON(json: S): T;
}

export type Validator<T> = (instance: T) => boolean;
export type Interceptor<T> = (instance: T) => T;
export type Instance<T extends DataType<any>> = T extends DataType<infer U> ? U : never;

export abstract class DataType<T = any, S = unknown> implements Serializer<T, S> {
  constructor(
    private validators: Validator<T>[] = [],
    private interceptors: Interceptor<T>[] = []
  ) {}

  abstract toJSON(instance: T): S;
  abstract fromJSON(json: S): T;

  validate(value: T) {
    return this.validators.every((validator) => validator(value));
  }

  intercept(value: T) {
    return this.interceptors.reduce((value, interceptor) => interceptor(value), value);
  }

  clone() {
    const cloned = {
      validators: [...this.validators],
      interceptors: [...this.interceptors],
    };
    (cloned as any).__proto__ = (this as any).__proto__;
    return cloned as unknown as this;
  }

  withValidator(validator: Validator<T>) {
    const cloned = this.clone();
    cloned.validators.push(validator);
    return cloned;
  }

  withInterceptor(interceptor: Interceptor<T>) {
    const cloned = this.clone();
    cloned.interceptors.push(interceptor);
    return cloned;
  }

  get nullable(): NullableDataType<T, S> {
    return new NullableDataType(this);
  }

  mustEqual(value: T): DataType<T> {
    return this.withValidator((v) => v === value);
  }
}

export class NullableDataType<T, S = unknown> extends DataType<T | null, S | null> {
  constructor(private type: DataType<T, S>) {
    super(
      [
        (instance: T | null) =>
          instance === null || instance === undefined || this.type.validate(instance),
      ],
      [
        (instance: T | null) =>
          instance === null || instance === undefined ? null : this.type.intercept(instance),
      ]
    );
  }

  toJSON(instance: T | null): S | null {
    if (instance === null || instance === undefined) {
      return null;
    } else {
      return this.type.toJSON(instance);
    }
  }

  fromJSON(json: S | null): T | null {
    if (json === null || json === undefined) {
      return null;
    } else {
      return this.type.fromJSON(json);
    }
  }
}
