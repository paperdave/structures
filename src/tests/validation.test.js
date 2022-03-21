import { types } from '.';
import { Structure } from './Structure';

describe('Structure validation and errors', () => {
  test('shows all validation errors in fromJSON', () => {
    const Test = new Structure('Test') //
      .prop('hello', types.String.maxLength(5))
      .prop('world', types.Integer)
      .create();

    expect(() => {
      Test.fromJSON({ hello: 'hello world', world: 4.5 });
    }).toThrowErrorMatchingInlineSnapshot(`
      "Data validation failed for new Test
       - .hello must be at most 5 characters
       - .world must be an integer"
    `);

    expect(() => {
      Test.fromJSON({ hello: 'hello', world: '4' });
    }).toThrowErrorMatchingInlineSnapshot(`
      "Data validation failed for new Test
       - .world must be a number
       - .world must be an integer"
    `);
  });

  test('shows all validation errors in constructor', () => {
    const Test = new Structure('Test') //
      .prop('hello', types.String.maxLength(5))
      .prop('world', types.Integer)
      .create();

    expect(() => {
      new Test({ hello: 'hello world', world: 4.5 });
    }).toThrowErrorMatchingInlineSnapshot(`
      "Data validation failed for new Test
       - .hello must be at most 5 characters
       - .world must be an integer"
    `);

    expect(() => {
      new Test({ hello: 'hello', world: '4' });
    }).toThrowErrorMatchingInlineSnapshot(`
      "Data validation failed for new Test
       - .world must be a number
       - .world must be an integer"
    `);
  });

  test('assigning a property throws right error', () => {
    const Test = new Structure('Test') //
      .prop('hello', types.String.maxLength(5))
      .prop('world', types.Integer)
      .create();

    const test = new Test({ hello: 'hello', world: 4 });

    expect(() => {
      test.hello = 'hello world';
    }).toThrowErrorMatchingInlineSnapshot(`
      "Data validation failed when modifying Test.hello: hello world
       - must be at most 5 characters"
    `);

    expect(() => {
      test.world = '4';
    }).toThrowErrorMatchingInlineSnapshot(`
      "Data validation failed when modifying Test.world: 4
       - must be a number
       - must be an integer"
    `);
  });
});
