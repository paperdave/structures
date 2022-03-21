import { Structure, types } from '..';

describe('DataType', () => {
  test('nullable', () => {
    const NullableString = types.String.nullable;

    expect(NullableString.isValid(null)).toBe(true);
    // allowed but types do not
    expect(NullableString.isValid(undefined)).toBe(true);
    expect(NullableString.isValid('')).toBe(true);
    expect(NullableString.isValid('hello')).toBe(true);
    expect(NullableString.isValid(0)).toBe(false);

    expect(NullableString.intercept(null)).toBe(null);
    expect(NullableString.intercept(undefined)).toBe(null);
    expect(NullableString.intercept('')).toBe('');
    expect(NullableString.intercept('hello')).toBe('hello');

    expect(NullableString.toJSON(null)).toBe(null);
    expect(NullableString.toJSON(undefined)).toBe(null);
    expect(NullableString.toJSON('')).toBe('');
    expect(NullableString.toJSON('hello')).toBe('hello');

    expect(NullableString.fromJSON(null)).toBe(null);
    expect(NullableString.fromJSON(undefined)).toBe(null);
    expect(NullableString.fromJSON('')).toBe('');
    expect(NullableString.fromJSON('hello')).toBe('hello');
  });

  test('nullable works when combined with custom structures', () => {
    const Struct = new Structure('Struct').prop('hello', types.String).create();
    const NullableStruct = Struct.nullable;

    expect(NullableStruct.isValid(null)).toBe(true);
    expect(NullableStruct.isValid(undefined)).toBe(true);
    expect(NullableStruct.isValid(new Struct({ hello: 'hello' }))).toBe(true);

    expect(NullableStruct.intercept(null)).toBe(null);
    expect(NullableStruct.intercept(undefined)).toBe(null);
    expect(NullableStruct.intercept(new Struct({ hello: 'hello' }))?.toJSON()).toEqual({
      hello: 'hello',
    });
  });
});
