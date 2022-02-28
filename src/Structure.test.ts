import util from 'util';
import { DataType, Structure, types } from './index';

describe('Structure', () => {
  function getTest() {
    return new Structure() //
      .prop('hello', types.String)
      .prop('world', types.Integer)
      .create();
  }

  function getMethodStruct() {
    return new Structure() //
      .prop('hello', types.String)
      .method('method', function (arg1: number) {
        return `${this.hello.toUpperCase()} ${arg1}`;
      })
      .create();
  }

  test('basic integration test', () => {
    const Test = getTest();
    const test1 = new Test({ hello: 'hello', world: 4 });
    expect(test1.hello).toBe('hello');
    expect(test1.world).toBe(4);
    expect(Test.validate(test1)).toBe(true);
    expect(Test.toJSON(test1)).toEqual({ hello: 'hello', world: 4 });

    const test2 = Test.fromJSON({ hello: 'hello', world: 4 });
    expect(test2.hello).toBe('hello');
    expect(test2.world).toBe(4);
    expect(Test.validate(test2)).toBe(true);

    test2.hello = 'world2';
    expect(test2.hello).toBe('world2');

    expect(Test.validate(test2)).toBe(true);

    expect(Test.toJSON(test2)).toEqual({ hello: 'world2', world: 4 });
    expect(test2.toJSON()).toEqual({ hello: 'world2', world: 4 });
  });

  test('property assignment must validate or throw', () => {
    const Test = getTest();
    const test2 = new Test({ hello: 'hello', world: 4 });

    test2.hello = 'world2';
    expect(test2.hello).toBe('world2');

    expect(() => {
      (test2 as any).world = '5';
    }).toThrow();

    expect(test2.world).toBe(4);
  });

  test('property assignment must run intercept', () => {
    const Test2 = new Structure() //
      .prop(
        'hello',
        types.String.withInterceptor((x) => x.toUpperCase())
      )
      .create();

    const test2 = new Test2({ hello: 'hello' });
    expect(test2.hello).toBe('HELLO');

    test2.hello = 'world';
    expect(test2.hello).toBe('WORLD');
  });

  test('raw objects can not validate due to prototype', () => {
    const Test = getMethodStruct();
    expect(Test.validate({ hello: 'hello' } as any)).toBe(false);
    expect(Test.validate(new Test({ hello: 'hello' }))).toBe(true);
    expect(Test.validate(Test.fromJSON({ hello: 'hello' }))).toBe(true);
  });

  test('methods must function', () => {
    const MS = getMethodStruct();
    const ms = new MS({ hello: 'hello' });
    expect(ms.method(4)).toBe('HELLO 4');
    expect(ms.method(5)).toBe('HELLO 5');
  });

  test('methods must be implemented via prototypes', () => {
    const MS = getMethodStruct();
    const ms = new MS({ hello: 'hello' });
    const ms2 = new MS({ hello: 'world' });

    expect(ms.method === ms2.method).toBe(true);
  });

  test('creted structure must have `.types` with validators', () => {
    const Test = getTest();
    expect(Test.types.hello).toBeInstanceOf(DataType);
    expect(Test.types.world).toBeInstanceOf(DataType);
    expect(Test.types.hello.validate('hello')).toBe(true);
    expect(Test.types.world.validate('world' as any)).toBe(false);
  });

  test('mixins', () => {
    const DateMixin = new Structure().prop('date', types.Date).create();

    const Test = new Structure() //
      .prop('hello', types.String)
      .mixin(DateMixin)
      .create();

    const x = new Test({ hello: 'hello', date: new Date() });
    expect(x.date).toBeInstanceOf(Date);
  });

  test('bug: spread syntax on structures', () => {
    // this was fixed by using a Proxy to implement interception and validation
    // prior, the properties would not spread and new Test would fail.

    const Test = getTest();
    const test = new Test({ hello: 'hello', world: 4 });
    const test2 = { ...test };
    expect(test2.hello).toBe('hello');
    expect(test2.world).toBe(4);
  });

  test('extend', () => {
    const Base = getTest();

    const Extended = Base.extend() //
      .prop('hello2', types.String)
      .create();

    const base1 = new Base({ hello: 'hello', world: 4 });
    const extended1 = new Extended({ hello: 'hello', hello2: 'hello2', world: 4 });
    const extended2 = new Extended({ ...base1, hello2: 'hello3' });

    expect(base1.hello).toBe('hello');
    expect(base1.world).toBe(4);
    expect(extended1.hello).toBe('hello');
    expect(extended1.hello2).toBe('hello2');
    expect(extended1.world).toBe(4);
    expect(extended2.hello).toBe('hello');
    expect(extended2.hello2).toBe('hello3');
    expect(extended2.world).toBe(4);

    expect(Base.validate(base1)).toBe(true);
    expect(Base.validate(extended1)).toBe(true);
    expect(Base.validate(extended2)).toBe(true);

    expect(Extended.validate(base1 as any)).toBe(false);
    expect(Extended.validate(extended1)).toBe(true);
    expect(Extended.validate(extended2)).toBe(true);
  });

  test('instanceof should work', () => {
    const Test = getTest();
    const test = new Test({ hello: 'hello', world: 4 });
    expect(test instanceof Test).toBe(true);
  });

  test('should throw if invalid data in constructor', () => {
    const Test = getTest();
    expect(() => new Test({ hello: 'hello', world: null } as any)).toThrow();
  });

  test('custom util.inspect functionality', () => {
    const Test = getTest();
    const test = new Test({ hello: 'hello', world: 4 });

    expect(util.inspect(test)).toMatchInlineSnapshot(`"Structure { hello: 'hello', world: 4 }"`);
  });

  test('default properties literal', () => {
    const Test = new Structure('Test').prop('hello', types.String, { default: 'hello' }).create();

    const x = new Test({});
    expect(x.hello).toBe('hello');
  });

  test('default properties function', () => {
    const Test = new Structure('Test')
      .prop('hello', types.String, { default: () => 'hello' })
      .create();

    const x = new Test({});
    expect(x.hello).toBe('hello');
  });

  test('custom serializer', () => {
    const Test = new Structure('Test').prop('hello', types.String).create({
      customSerializer: {
        fromJSON(value: string) {
          return new Test({ hello: value });
        },
        toJSON(value) {
          return value.hello;
        },
      },
    });

    const x = new Test({ hello: 'hello' });
    expect(x.hello).toBe('hello');
    expect(new Test(x).hello).toBe('hello');
    expect(x.toJSON()).toBe('hello');
    expect(Test.toJSON(x)).toBe('hello');
    expect(Test.fromJSON('hello')).toBeInstanceOf(Test);
    expect(Test.fromJSON('hello').hello).toBe('hello');
  });

  test('abstract', () => {
    const Base = new Structure('Base') //
      .prop('type', types.String)
      .create({ abstract: true });
    const Type1 = Base.extend('Type1') //
      .prop('type', types.String.mustEqual('one'))
      .create();
    const Type2 = Base.extend('Type2')
      .prop('type', types.String.mustEqual('two'))
      .prop('num', types.Number)
      .create();

    new Base({ type: 'unknown' });
    new Type1({ type: 'one' });
    new Type2({ type: 'two', num: 2 });

    // casting to sub-type
    new Type1(new Base({ type: 'one' }));

    new Type2({
      ...new Base({ type: 'two' }),
      num: 2,
    });

    const type1fromJson = Base.fromJSON({ type: 'one' });
    expect(type1fromJson instanceof Type1).toBe(true);

    const type2fromJson = Base.fromJSON({ type: 'two', num: 5 });
    expect(type2fromJson instanceof Type2).toBe(true);
  });
});
