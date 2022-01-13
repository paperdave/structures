import { DataType } from '../DataType';

class SetDataType<T> extends DataType<Set<T>> {
  constructor(private type: DataType<T>) {
    super([(value) => value instanceof Set && [...value].every((x) => type.validate(x))]);
  }

  toJSON(instance: Set<T>): unknown {
    return [...instance].map((x) => this.type.toJSON(x));
  }

  fromJSON(json: unknown[]): Set<T> {
    return new Set(json.map((x) => this.type.fromJSON(x)));
  }
}

export function SetOf<T>(type: DataType<T>) {
  return new SetDataType<T>(type);
}
