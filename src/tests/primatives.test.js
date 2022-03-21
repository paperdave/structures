import { BooleanDataType, StringDataType } from './primatives';

describe('builtin-types/primatives/BooleanDataType', () => {
  it('validates properly', () => {
    const validator = new BooleanDataType();
    expect(validator.isValid(true)).toBe(true);
    expect(validator.isValid(false)).toBe(true);
    expect(validator.isValid(null)).toBe(false);
    expect(validator.isValid('invalid')).toBe(false);
    expect(validator.isValid(Symbol())).toBe(false);
    expect(validator.isValid(validator)).toBe(false);
    expect(validator.isValid(4321)).toBe(false);
  });
});

describe('builtin-types/primatives/StringDataType', () => {
  it('validates properly', () => {
    const validator = new StringDataType();
    expect(validator.isValid('')).toBe(true);
    expect(validator.isValid('Hello world')).toBe(true);
    expect(validator.isValid(new String('z'))).toBe(false);
    expect(validator.isValid(false)).toBe(false);
  });

  it('minLength', () => {
    const validator = new StringDataType();

    expect(validator.minLength(5).isValid('Hello')).toBe(true);
    expect(validator.minLength(5).isValid('Hello world')).toBe(true);
    expect(validator.minLength(5).isValid('v')).toBe(false);
    expect(validator.minLength(5).isValid(null)).toBe(false);
  });
});
