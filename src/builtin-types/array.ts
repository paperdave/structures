import { DataType } from '../DataType';

class ArrayDataType<T> extends DataType<T[]> {
  constructor(private type: DataType<T>) {
    super([(value) => Array.isArray(value) && value.every((x) => type.validate(x))]);
  }

  toJSON(instance: T[]): unknown {
    return instance.map((x) => this.type.toJSON(x));
  }

  fromJSON(json: unknown[]): T[] {
    return json.map((x) => this.type.fromJSON(x));
  }
}

export function ArrayOf<T>(type: DataType<T>) {
  return new ArrayDataType<T>(type);
}
