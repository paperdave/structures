import { DataType } from '../DataType';

export class PrimativeDataType<T> extends DataType<T, T> {
  constructor(type: string) {
    super([(value) => (typeof value === type ? true : `must be a ${type}`)]);
  }

  // serialization
  toJSON(value: T): T {
    return value;
  }

  fromJSON(value: T): T {
    return value;
  }
}

export class BooleanDataType extends PrimativeDataType<boolean> {
  constructor() {
    super('boolean');
  }
  // booleans don't have anything special
}

export class StringDataType extends PrimativeDataType<string> {
  constructor() {
    super('string');
  }

  // validators
  minLength(minLength: number) {
    return this.withValidator((value) =>
      value.length >= minLength ? true : `must be at least ${minLength} characters`
    );
  }

  maxLength(maxLength: number) {
    return this.withValidator((value) =>
      value.length <= maxLength ? true : `must be at most ${maxLength} characters`
    );
  }

  length(length: number) {
    return this.withValidator((value) =>
      value.length === length ? true : `must be exactly ${length} characters`
    );
  }

  mustMatch(regex: RegExp) {
    return this.withValidator((value) =>
      regex.test(value) ? true : `must match expression: "${regex}"`
    );
  }

  mustNotMatch(regex: RegExp) {
    return this.withValidator((value) =>
      !regex.test(value) ? true : `must not match expression: "${regex}"`
    );
  }
}

export class NumberDataType extends PrimativeDataType<number> {
  constructor() {
    super('number');
  }

  // validators
  min(min: number) {
    return this.withValidator((value) => (value >= min ? true : `must be at least ${min}`));
  }

  max(max: number) {
    return this.withValidator((value) => (value <= max ? true : `must be at most ${max}`));
  }

  mustBeInteger() {
    return this.withValidator((value) => (Number.isInteger(value) ? true : `must be an integer`));
  }

  mustBePositive() {
    return this.withValidator((value) => (value >= 0 ? true : `must be a positive number`));
  }

  mustBeNegative() {
    return this.withValidator((value) => (value < 0 ? true : `must be a negative number`));
  }

  cannotBeZero() {
    return this.withValidator((value) => (value !== 0 ? true : `cannot be zero`));
  }

  // interceptors
  autoRound(decimals = 0) {
    return this.withInterceptor((value) => Math.round(value * 10 ** decimals) / 10 ** decimals);
  }

  autoFloor(decimals = 0) {
    return this.withInterceptor((value) => Math.floor(value * 10 ** decimals) / 10 ** decimals);
  }
}
