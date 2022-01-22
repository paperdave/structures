export interface Serializer<T> {
  toJSON(instance: T): unknown;
  fromJSON(json: unknown): T;
}

export type Validator<T> = (instance: T) => boolean;
export type Interceptor<T> = (instance: T) => T;
export type Instance<T extends DataType<any>> = T extends DataType<infer U> ? U : never;

export abstract class DataType<T = any> implements Serializer<T> {
  constructor(
    private validators: Validator<T>[] = [],
    private interceptors: Interceptor<T>[] = []
  ) {}

  abstract toJSON(instance: T): unknown;
  abstract fromJSON(json: unknown): T;

  validate(value: T) {
    return this.validators.every((validator) => validator(value));
  }

  intercept(value: T) {
    return this.interceptors.reduce((value, interceptor) => interceptor(value), value);
  }

  clone() {
    const cloned = { ...this };
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

  get nullable(): DataType<T | null> {
    return new NullableDataType(this);
  }

  mustEqual(value: T): DataType<T> {
    return this.withValidator((v) => v === value);
  }
}

export class NullableDataType<T> extends DataType<T | null> {
  constructor(private type: DataType<T>) {
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

  toJSON(instance: T | null): unknown {
    if (instance === null) {
      return null;
    } else {
      return this.type.toJSON(instance);
    }
  }

  fromJSON(json: unknown): T | null {
    if (json === undefined || json === null) {
      return null;
    } else {
      return this.type.fromJSON(json);
    }
  }
}
