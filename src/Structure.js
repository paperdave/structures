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

// THIS VERSION OF THE CODE IS NOT AT ALL UP TO DATE. THERES A COMMIT ON
// ANOTHER MACHINE WITH UP TO DATE CODE.

// in fact, i dont think the below stuff even works, but its *close*

import { DataType } from './DataType';

const StructureData = Symbol.for('RealStructureData');

const DataTypePrototype = Object.getOwnPropertyNames(DataType.prototype) //
  .reduce((acc, key) => ({ ...acc, [key]: DataType.prototype[key] }), {});

function getDefaultSerializer(structure) {
  return {
    toJSON(instance) {
      const data = {};
      for (const key in structure.properties) {
        data[key] = structure.properties[key].type.toJSON(instance[key]);
      }
      return data;
    },
    fromJSON(json) {
      const data = {};
      for (const key in structure.properties) {
        data[key] = structure.properties[key].type.fromJSON(json[key]);
      }
      return new Proxied(data);
    },
  };
}

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
    this.properties = { ...this.properties, ...mixin.properties };
    this.methods = { ...this.methods, ...mixin.methods };
    return this;
  }

  create(options = {}) {
    // Create the basic object
    const Type = Object.assign(
      class {},
      DataTypePrototype,
      options.customSerializer ?? getDefaultSerializer(this)
    );

    Type.validators = [];
    Type.interceptors = [];
    Type.types = {};
    Object.defineProperty(Type, 'name', { value: this.name });

    // Create the prototype assigned to instances
    const prototype = {
      ...structure.methods,
      [Symbol.for('nodejs.util.inspect.custom')]() {
        return {
          ...this[StructureData],
          __proto__: Type.prototype,
        };
      },
    };

    // Loop over properties and add them to `prototype` and `Type`
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
        },
      });

      Type.types[key] = prop.type;
      Type.validators.push((x) => prop.type.validate(x[key]));
    }

    // Use a proxy to overwrite the constructor
    const Proxied = new Proxy(Type, {
      construct(_, [data]) {
        const target = {};

        for (const key in structure.properties) {
          const { type, ...prop } = structure.properties[key];

          target[key] = prop.type.intercept(
            data[key] ?? typeof prop.default === 'function' ? prop.default() : prop.default
          );
        }

        const constructed = { __proto__: prototype, [StructureData]: target };

        if (!Type.validate(constructed)) {
          throw new Error(`Data validation failed for new ${structure.name}`);
        }

        return constructed;
      },
    });

    prototype.constructor = Proxied;

    return Proxied;
  }
}
