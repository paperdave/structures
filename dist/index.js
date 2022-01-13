#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/builtin-types/index.ts
var builtin_types_exports = {};
__export(builtin_types_exports, {
  ArrayOf: () => ArrayOf,
  Boolean: () => Boolean,
  Date: () => Date2,
  Enum: () => Enum,
  Integer: () => Integer,
  Number: () => Number2,
  SetOf: () => SetOf,
  String: () => String
});

// src/DataType.ts
var DataType = class {
  constructor(validators = [], interceptors = []) {
    this.validators = validators;
    this.interceptors = interceptors;
  }
  validate(value) {
    return this.validators.every((validator) => validator(value));
  }
  intercept(value) {
    return this.interceptors.reduce((value2, interceptor) => interceptor(value2), value);
  }
  clone() {
    const cloned = __spreadValues({}, this);
    cloned.__proto__ = this.__proto__;
    return cloned;
  }
  withValidator(validator) {
    const cloned = this.clone();
    cloned.validators.push(validator);
    return cloned;
  }
  withInterceptor(interceptor) {
    const cloned = this.clone();
    cloned.interceptors.push(interceptor);
    return cloned;
  }
  nullable() {
    return new NullableDataType(this);
  }
  mustEqual(value) {
    return this.withValidator((v) => v === value);
  }
};
var NullableDataType = class extends DataType {
  constructor(type) {
    super([
      (instance) => instance === null || instance === void 0 || this.type.validate(instance)
    ], [
      (instance) => instance === null || instance === void 0 ? null : this.type.intercept(instance)
    ]);
    this.type = type;
  }
  toJSON(instance) {
    if (instance === null) {
      return null;
    } else {
      return this.type.toJSON(instance);
    }
  }
  fromJSON(json) {
    if (json === void 0 || json === null) {
      return null;
    } else {
      return this.type.fromJSON(json);
    }
  }
};

// src/builtin-types/date.ts
var DateDataType = class extends DataType {
  constructor() {
    super([(value) => value instanceof Date]);
  }
  toJSON(instance) {
    return instance.getTime();
  }
  fromJSON(number) {
    return new Date(number);
  }
  mustBeAfter(date) {
    return this.withValidator((value) => value.getTime() > date.getTime());
  }
  mustBeBefore(date) {
    return this.withValidator((value) => value.getTime() < date.getTime());
  }
  discardTime() {
    return this.withInterceptor((value) => new Date(value.getFullYear(), value.getMonth(), value.getDate()));
  }
  discardSeconds() {
    return this.withInterceptor((value) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes(), 0, 0));
  }
  discardMilliseconds() {
    return this.withInterceptor((value) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes(), value.getSeconds(), 0));
  }
};

// src/builtin-types/primatives.ts
var PrimativeDataType = class extends DataType {
  constructor(type) {
    super([(value) => typeof value === type]);
  }
  toJSON(value) {
    return value;
  }
  fromJSON(value) {
    return value;
  }
};
var BooleanDataType = class extends PrimativeDataType {
  constructor() {
    super("boolean");
  }
};
var StringDataType = class extends PrimativeDataType {
  constructor() {
    super("string");
  }
  minLength(minLength) {
    return this.withValidator((value) => value.length >= minLength);
  }
  maxLength(maxLength) {
    return this.withValidator((value) => value.length <= maxLength);
  }
  length(length) {
    return this.withValidator((value) => value.length === length);
  }
  mustMatch(regex) {
    return this.withValidator((value) => regex.test(value));
  }
  mustNotMatch(regex) {
    return this.withValidator((value) => !regex.test(value));
  }
  mustInclude(...values) {
    return this.withValidator((value) => values.includes(value));
  }
};
var NumberDataType = class extends PrimativeDataType {
  constructor() {
    super("number");
  }
  min(min) {
    return this.withValidator((value) => value >= min);
  }
  max(max) {
    return this.withValidator((value) => value <= max);
  }
  mustBeInteger() {
    return this.withValidator((value) => Number.isInteger(value));
  }
  mustBeFinite() {
    return this.withValidator((value) => Number.isFinite(value));
  }
  mustBePositive() {
    return this.withValidator((value) => value >= 0);
  }
  mustBeNegative() {
    return this.withValidator((value) => value < 0);
  }
  cannotBeZero() {
    return this.withValidator((value) => value !== 0);
  }
  autoRound(decimals = 0) {
    return this.withInterceptor((value) => Math.round(value * 10 ** decimals) / 10 ** decimals);
  }
  autoFloor(decimals = 0) {
    return this.withInterceptor((value) => Math.floor(value * 10 ** decimals) / 10 ** decimals);
  }
};

// src/builtin-types/enum.ts
var EnumDataTypeClass = class extends DataType {
  constructor(values) {
    super([(value) => values.includes(value)]);
    this.values = values;
    for (const value of values) {
      this[value] = value;
    }
  }
  fromJSON(json) {
    return json;
  }
  toJSON(instance) {
    return instance;
  }
};
function Enum(...values) {
  return new EnumDataTypeClass(values);
}

// src/builtin-types/set.ts
var SetDataType = class extends DataType {
  constructor(type) {
    super([(value) => value instanceof Set && [...value].every((x) => type.validate(x))]);
    this.type = type;
  }
  toJSON(instance) {
    return [...instance].map((x) => this.type.toJSON(x));
  }
  fromJSON(json) {
    return new Set(json.map((x) => this.type.fromJSON(x)));
  }
};
function SetOf(type) {
  return new SetDataType(type);
}

// src/builtin-types/array.ts
var ArrayDataType = class extends DataType {
  constructor(type) {
    super([(value) => Array.isArray(value) && value.every((x) => type.validate(x))]);
    this.type = type;
  }
  toJSON(instance) {
    return instance.map((x) => this.type.toJSON(x));
  }
  fromJSON(json) {
    return json.map((x) => this.type.fromJSON(x));
  }
};
function ArrayOf(type) {
  return new ArrayDataType(type);
}

// src/builtin-types/index.ts
var Boolean = new BooleanDataType();
var String = new StringDataType();
var Number2 = new NumberDataType();
var Date2 = new DateDataType();
var Integer = new NumberDataType().mustBeInteger();

// src/Structure.js
var StructureData = Symbol.for("RealStructureData");
var DataTypePrototype = Object.getOwnPropertyNames(DataType.prototype).reduce((acc, key) => __spreadProps(__spreadValues({}, acc), { [key]: DataType.prototype[key] }), {});
function getDefaultSerializer(structure2) {
  return {
    toJSON(instance) {
      const data = {};
      for (const key in structure2.properties) {
        data[key] = structure2.properties[key].type.toJSON(instance[key]);
      }
      return data;
    },
    fromJSON(json) {
      const data = {};
      for (const key in structure2.properties) {
        data[key] = structure2.properties[key].type.fromJSON(json[key]);
      }
      return new Proxied(data);
    }
  };
}
var Structure = class {
  constructor(name = "Structure") {
    this.name = name;
    this.properties = {};
    this.methods = {};
  }
  prop(key, type, options = {}) {
    this.properties[key] = __spreadValues({ type }, options);
    return this;
  }
  method(key, impl) {
    this.methods[key] = impl;
    return this;
  }
  mixin(mixin) {
    this.properties = __spreadValues(__spreadValues({}, this.properties), mixin.properties);
    this.methods = __spreadValues(__spreadValues({}, this.methods), mixin.methods);
    return this;
  }
  create(options = {}) {
    const Type = Object.assign(class {
    }, DataTypePrototype, options.customSerializer ?? getDefaultSerializer(this));
    Type.validators = [];
    Type.interceptors = [];
    Type.types = {};
    Object.defineProperty(Type, "name", { value: this.name });
    const prototype = __spreadProps(__spreadValues({}, structure.methods), {
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return __spreadProps(__spreadValues({}, this[StructureData]), {
          __proto__: Type.prototype
        });
      }
    });
    for (const [key, prop] of Object.entries(structure.properties)) {
      Object.defineProperty(prototype, key, {
        get() {
          return this[StructureData][key];
        },
        set(value) {
          value = prop.type.intercept(value);
          if (prop.type.validate(value)) {
            this[StructureData][key] = value;
          } else {
            throw new Error(`Data validation failed for ${structure.name}.${key}: ${value}`);
          }
        }
      });
      Type.types[key] = prop.type;
      Type.validators.push((x) => prop.type.validate(x[key]));
    }
    const Proxied2 = new Proxy(Type, {
      construct(_, [data]) {
        const target = {};
        for (const key in structure.properties) {
          const _a = structure.properties[key], { type } = _a, prop = __objRest(_a, ["type"]);
          target[key] = prop.type.intercept(data[key] ?? typeof prop.default === "function" ? prop.default() : prop.default);
        }
        const constructed = { __proto__: prototype, [StructureData]: target };
        if (!Type.validate(constructed)) {
          throw new Error(`Data validation failed for new ${structure.name}`);
        }
        return constructed;
      }
    });
    prototype.constructor = Proxied2;
    return Proxied2;
  }
};
export {
  DataType,
  Structure,
  builtin_types_exports as types
};
