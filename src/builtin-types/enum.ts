import { DataType } from '../DataType';

type EnumDataType<T extends string> = EnumDataTypeClass<T> & Record<T, T>;

class EnumDataTypeClass<T extends string> extends DataType<T, T> {
  constructor(public values: T[]) {
    super([(value) => values.includes(value)]);

    for (const value of values) {
      (this as any)[value] = value;
    }
  }

  fromJSON(json: T): T {
    return json;
  }

  toJSON(instance: T): T {
    return instance;
  }
}

export function Enum<T extends string>(...values: T[]) {
  return new EnumDataTypeClass(values) as EnumDataType<T>;
}
