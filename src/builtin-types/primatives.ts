import { DataType } from '../DataType';

export class PrimativeDataType<T> extends DataType<T> {
  constructor(type: string) {
    super([(value) => typeof value === type]);
  }

  // serialization
  toJSON(value: T): unknown {
    return value;
  }

  fromJSON(value: unknown): T {
    return value as T;
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
    return this.withValidator((value) => value.length >= minLength);
  }

  maxLength(maxLength: number) {
    return this.withValidator((value) => value.length <= maxLength);
  }

  length(length: number) {
    return this.withValidator((value) => value.length === length);
  }

  mustMatch(regex: RegExp) {
    return this.withValidator((value) => regex.test(value));
  }

  mustNotMatch(regex: RegExp) {
    return this.withValidator((value) => !regex.test(value));
  }

  mustInclude(...values: string[]) {
    return this.withValidator((value) => values.includes(value));
  }
}

export class NumberDataType extends PrimativeDataType<number> {
  constructor() {
    super('number');
  }

  // validators
  min(min: number) {
    return this.withValidator((value) => value >= min);
  }

  max(max: number) {
    return this.withValidator((value) => value <= max);
  }

  mustBeInteger() {
    return this.withValidator((value) => Number.isInteger(value));
  }

  mustBeFinite() {
    return this.withValidator((value) => Number.isFinite(value));
  }

  mustBePositive() {
    return this.withValidator((value) => value >= 0);
  }

  mustBeNegative() {
    return this.withValidator((value) => value < 0);
  }

  cannotBeZero() {
    return this.withValidator((value) => value !== 0);
  }

  // interceptors
  autoRound(decimals = 0) {
    return this.withInterceptor((value) => Math.round(value * 10 ** decimals) / 10 ** decimals);
  }

  autoFloor(decimals = 0) {
    return this.withInterceptor((value) => Math.floor(value * 10 ** decimals) / 10 ** decimals);
  }
}
