import { DataType } from '../DataType';

class SetDataType<T, S = unknown> extends DataType<Set<T>, S[]> {
  constructor(private type: DataType<T, S>) {
    super([(value) => value instanceof Set && [...value].every((x) => type.validate(x))]);
  }

  toJSON(instance: Set<T>): S[] {
    return [...instance].map((x) => this.type.toJSON(x));
  }

  fromJSON(json: S[]): Set<T> {
    return new Set(json.map((x) => this.type.fromJSON(x)));
  }
}

export function SetOf<T, S>(type: DataType<T, S>) {
  return new SetDataType(type);
}
