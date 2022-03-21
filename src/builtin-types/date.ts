import { DataType } from '../DataType';

export class DateDataType extends DataType<Date, number> {
  constructor() {
    super([(value) => (value instanceof Date ? true : 'must be a Date')]);
  }

  // serialization
  toJSON(instance: Date): number {
    return instance.getTime();
  }

  fromJSON(number: number): Date {
    return new Date(number);
  }

  // validators
  mustBeAfter(date: Date) {
    return this.withValidator((value) =>
      value.getTime() > date.getTime() ? true : `must be after ${date}`
    );
  }

  mustBeBefore(date: Date) {
    return this.withValidator((value) =>
      value.getTime() < date.getTime() ? true : `must be before ${date}`
    );
  }

  // interceptors
  discardTime() {
    return this.withInterceptor(
      (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate())
    );
  }

  discardSeconds() {
    return this.withInterceptor(
      (value) =>
        new Date(
          value.getFullYear(),
          value.getMonth(),
          value.getDate(),
          value.getHours(),
          value.getMinutes(),
          0,
          0
        )
    );
  }

  discardMilliseconds() {
    return this.withInterceptor(
      (value) =>
        new Date(
          value.getFullYear(),
          value.getMonth(),
          value.getDate(),
          value.getHours(),
          value.getMinutes(),
          value.getSeconds(),
          0
        )
    );
  }
}
