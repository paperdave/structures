/**
 * Due to the absurd complexity of this class, the implmentation and the typings are separate. It
 * may not look simpler than having one ts file, but I promise you, it is.
 *
 * To reduce issues:
 *
 * - There is an extensive test suite covering every line of code in this class, ensuring bug-free code.
 * - There is a stupid amount of comments, increasing understanding and maintainability.
 *
 * Have fun reading,
 *
 * - Dave Caruso
 */
import { DataType, NullableDataType } from './DataType';

const DataTypePrototype = Object.getOwnPropertyNames(DataType.prototype) //
  .reduce((acc, key) => ({ ...acc, [key]: DataType.prototype[key] }), {});

export class Structure {
  constructor(name = 'Structure') {
    this.name = name;
    this.properties = {};
    this.methods = {};
  }

  prop(key, type, options = {}) {
    this.properties[key] = { type, ...options };
    return this;
  }

  method(key, impl) {
    this.methods[key] = impl;
    return this;
  }

  mixin(mixin) {
    mixin = mixin.__structure ?? mixin;
    this.properties = { ...this.properties, ...mixin.properties };
    this.methods = { ...this.methods, ...mixin.methods };
    return this;
  }

  create(options = {}) {
    const structure = this;
    const abstractExtensions = [];

    let Proxied;

    const defaultSerializer = {
      toJSON(instance) {
        const data = {};
        for (const key in structure.properties) {
          data[key] = structure.properties[key].type.toJSON(instance[key]);
        }
        return data;
      },
      fromJSON(json) {
        if (options.abstract) {
          // abstract mode searches for an extension
          let constructed = null;

          abstractExtensions.find((x) => {
            try {
              constructed = x.fromJSON(json);
            } catch (error) {
              return false;
            }
          });

          if (constructed) {
            return constructed;
          }
        }

        const data = {};
        for (const key in structure.properties) {
          data[key] = structure.properties[key].type.fromJSON(json[key]);
        }
        return new Proxied(data);
      },
    };

    // Create the basic object
    const Type = Object.assign(
      class {
        static [Symbol.hasInstance](instance) {
          return Type.validate(instance);
        }
      },
      DataTypePrototype,
      options.customSerializer ?? defaultSerializer
    );

    // Create the prototype assigned to instances
    const prototype = {
      ...structure.methods,
      toJSON() {
        return Type.toJSON(this);
      },
    };

    Type.validators = [(x) => typeof x.toJSON === 'function'];
    Type.interceptors = [(x) => (x.__proto__ === prototype ? x : new Type(x))];
    Type.types = {};
    Type.extend = (name) => {
      const extension = new Structure(name).mixin(structure);
      if (options.abstract) {
        extension.oncreate = (x) => abstractExtensions.push(x);
      }
      return extension;
    };
    Type.__structure = structure;
    Object.defineProperty(Type, 'name', { value: structure.name });

    // Loop over properties and add them to `prototype` and `Type`
    for (const [key, prop] of Object.entries(structure.properties)) {
      Type.types[key] = prop.type;
      Type.validators.push((x) => prop.type.validate(x[key]));
    }

    // Loop over methods and add to validators
    for (const [key, prop] of Object.entries(structure.methods)) {
      // very loose validation is done here
      Type.validators.push((x) => typeof x[key] === typeof prop);
    }

    Object.defineProperty(Type, 'nullable', {
      get: () => new NullableDataType(Type),
    });

    const instanceProxyHandlers = {
      set(target, key, value) {
        value = Type.types[key].intercept(value);
        if (Type.types[key].validate(value)) {
          target[key] = value;
        } else {
          throw new Error(`Data validation failed for ${structure.name}.${key}: ${value}`);
        }
        return true;
      },
    };

    // Use a proxy to overwrite the constructor
    Proxied = new Proxy(Type, {
      construct(_, [data]) {
        const target = { __proto__: prototype };

        for (const key in structure.properties) {
          const prop = structure.properties[key];

          target[key] = prop.type.intercept(
            data[key] ?? (typeof prop.default === 'function' ? prop.default() : prop.default)
          );
        }

        const constructed = new Proxy(target, instanceProxyHandlers);

        if (!Type.validate(constructed)) {
          throw new Error(`Data validation failed for new ${structure.name}`);
        }

        return constructed;
      },
    });

    prototype.constructor = Proxied;

    if (this.oncreate) {
      this.oncreate(Proxied);
    }

    return Proxied;
  }
}
