# @davecode/structures \[beta/wip]

Structures is a TypeScript library for easily building data structure classes that are

- **Serializable**: Can convert rich objects to JSON objects or Uint8Arrays.
- **Validatable**: All structures have built-in validation which can include custom validations.
- **Fully Typed**: Custom structures' properties are fully typed, and even nullable ones are maked
  optional.

i'm still exploring applications of this library. it was originally intended to structure my database tables, but i stopped that after implementing "partial" structures and the fact it performs a validation every time a property is changed. i use prisma's generated types for my database structures, though the idea of having a defined class you can add arbitrary methods on such as `.toURL()` is still extremely interesting to me, and i'll figure something out eventually.

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
  .prop('occupation', types.String.nullable)
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
