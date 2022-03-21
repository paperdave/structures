import { DataType } from '../DataType';

class SetDataType<T, S = unknown> extends DataType<Set<T>, S[]> {
  constructor(private type: DataType<T, S>) {
    super([
      (value) => {
        if (!(value instanceof Set)) {
          return 'must be a set';
        }
        const validations = [...value].map((x) => this.type.validate(x));
        const isValid = validations.every((x) => x.valid);
        return isValid
          ? true
          : {
              valid: false,
              errors: validations.map((x) => x.errors ?? []).flat(),
            };
      },
    ]);
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
