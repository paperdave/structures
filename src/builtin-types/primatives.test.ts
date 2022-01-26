import { BooleanDataType, StringDataType } from './primatives';

describe('builtin-types/primatives/BooleanDataType', () => {
  it('validates properly', () => {
    const validator = new BooleanDataType();
    expect(validator.validate(true)).toBe(true);
    expect(validator.validate(false)).toBe(true);
    expect(validator.validate(null as any)).toBe(false);
    expect(validator.validate('invalid' as any)).toBe(false);
    expect(validator.validate(Symbol() as any)).toBe(false);
    expect(validator.validate(validator as any)).toBe(false);
    expect(validator.validate(4321 as any)).toBe(false);
  });
});

describe('builtin-types/primatives/StringDataType', () => {
  it('validates properly', () => {
    const validator = new StringDataType();
    expect(validator.validate('')).toBe(true);
    expect(validator.validate('Hello world')).toBe(true);
    expect(validator.validate(new String('z') as any)).toBe(false);
    expect(validator.validate(false as any)).toBe(false);
  });

  it('minLength', () => {
    const validator = new StringDataType();

    expect(validator.minLength(5).validate('Hello')).toBe(true);
    expect(validator.minLength(5).validate('Hello world')).toBe(true);
    expect(validator.minLength(5).validate('v')).toBe(false);
    expect(validator.minLength(5).validate(null as any)).toBe(false);
  });
});
