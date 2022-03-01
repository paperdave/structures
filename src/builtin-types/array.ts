import { DataType } from '../DataType';

class ArrayDataType<T, S> extends DataType<T[], S[]> {
  constructor(private type: DataType<T, S>) {
    super([(value) => Array.isArray(value) && value.every((x) => type.validate(x))]);
  }

  toJSON(instance: T[]): S[] {
    return instance.map((x) => this.type.toJSON(x));
  }

  fromJSON(json: S[]): T[] {
    return json.map((x) => this.type.fromJSON(x));
  }
}

export function ArrayOf<T>(type: DataType<T>) {
  return new ArrayDataType(type);
}
