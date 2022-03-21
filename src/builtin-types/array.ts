import { DataType } from '../DataType';

class ArrayDataType<T, S> extends DataType<T[], S[]> {
  constructor(private type: DataType<T, S>) {
    super([
      (value) => {
        if (!Array.isArray(value)) {
          return 'must be an array';
        }
        const validations = value.map((x) => this.type.validate(x));
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
