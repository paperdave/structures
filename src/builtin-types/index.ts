import { DateDataType } from './date';
import { BooleanDataType, NumberDataType, StringDataType } from './primatives';

export const Boolean = new BooleanDataType();
export const String = new StringDataType();
export const Number = new NumberDataType();
export const Date = new DateDataType();
export const Integer = new NumberDataType().mustBeInteger();

export { Enum } from './enum';
export { SetOf } from './set';
export { ArrayOf } from './array';
