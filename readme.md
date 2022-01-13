# @davecode/structures \[beta/wip]

Structures is a TypeScript library for easily building data structure classes that are

- **Serializable**: Can convert rich objects to JSON objects or Uint8Arrays.
- **Validatable**: All structures have built-in validation which can include custom validations.
- **Fully Typed**: Custom structures' properties are fully typed, and even nullable ones are maked
  optional.

This library is custom-built for [davecode.net](https://github.com/davecaruso/davecode.net) for all
of the types in our database and on the API layer.

My usage of the library in my site is public and you can view them
[here](https://github.com/davecaruso/davecode.net/tree/main/src/lib/structures)

```
yarn add @davecode/structures
```

## Usage

Let's take a look at defining a custom structure.

```ts
import { Structure, types } from '@davecode/structures';

const Person = new Structure('Person')
  .prop('name', types.String)
  .prop('age', types.Number)
  .prop('occupation', types.String.nullable())
  .method('sayHello', function () {
    console.log(`${this.name} says Hello.`);
  })
  .create();

// For TypeScript users
type Person = InstanceType<typeof Person>;

// Creating a structure
const dave = new Person({
  // name and age are REQUIRED here (will cause compile and runtime error)
  // however occupation is OPTIONAL here, since it is nullable
  name: 'dave caruso',
  age: 17,
});
```

`Person`, `types.String`, and many others are instances of `DataType<T>`, which provide
serialization and validation.

```ts
Person.validate(person); // true

const json = Person.toJSON(person);
const person2 = Person.fromJSON(json);

types.ArrayOf(types.String).validate(['hello']); // true
types.ArrayOf(types.String).validate([124]); // false
```

See the [nonexistant docs] for more information on what is available.
