[![Build Status](https://travis-ci.org/microstates/microstates.js.svg?branch=master)](https://travis-ci.org/microstates/microstates.js)
[![Coverage Status](https://coveralls.io/repos/github/microstates/microstates.js/badge.svg?branch=master)](https://coveralls.io/github/microstates/microstates.js?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Gitter](https://badges.gitter.im/microstates/microstates.js.svg)](https://gitter.im/microstates/microstates.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Microstates

Composable State Primitives with GraphQL inspired API     

Microstates is a pure JavaScript model authoring system designed to ease state management in component based applications.

By combining lazy execution, algebraic data types and structural sharing, we created
a tool that provides a tiny API to describe complex data structures and provide a
mechanism to change the value in immutable way.

## Features

With microstates added to your project, you get: 

- 🍣 Atomic composable type system
- 🍱 Effortless composition of types
- 💎 Pure immutable state transitions without reducers
- 🔭 Optional integration with Observables
- 🎯 Transpilation free type system
- ⚛ Use in Node.js and web applications
- 🦋 Easiest way to express state machines

But, most imporantly, Microstates makes working with **state fun**. 

## 🤗 Having fun with state 

When was the last time you had fun working with state in JavaScript applications? For many, the answer is probably never because state management in JavaScript is an endless game of choosing from compromises. You can choose to go fully immutable and end up writing endless reducers. You can go mutable and everything magically becomes an observable. Or you can `setState` and loose the benefit of serialization and time travel debugging. 

Unlike the view layer, where most frameworks agree on some variation of React components, state management is alloot less certain. It's less certain because none of the available tools strike the balance that React components introduced to the view layer. 

React components have a tiny API, they are functional, simple and extremely reusable. The tiny API gives you high productivity for little necessary knowledge. Functional components are predictable and easy to reason about. They are conceptually simple, but simplicity hides architecture that makes them performant. Their simplicity, predictability and isolation makes them composable and reusable.

These factors combined is what makes React style components easy to work with and ultimately fun to write. Tiny API abstracting sophisticated architecture that delivers performance and is equaly useful on small and big projects is the outcome that we set out to achieve for state management with Microstates. 

It's not easy to find the right balance between simplicity and power, but considering the importance of state management in web applications, we believe it's a worthy challenge.

## What is a Microstate?

A Microstate is an JavaScript object that is created from a Microstate type. Microstate types are similar to JavaScript classes except instances created from Microstate types are immutable, which means that they can not be modified after they were created. To modify an immutable object, you must create a copy of the original object with the change that you wish to make.

Let's consider the implication of this for a minute. JavaScript objects are mutable. If you create an instance of a JavaScript class, the created objects are mutable. 

**🤔 How does an immutable class instances work?**

This is the not the question that we set out to answer when we started working on Microstates in 2016, but it's one of the question that we believe Microstates is answering.

The challenge with answering this question is that it uproots a lot of what we know about working with JavaScript classes. Let's consider some of these and see where it takes us.

### Instance Methods

Instance methods are functions that can modify properties of the object. For example, `setFirstName` might modify the `firstName` on an instance of `Person`.

```js
// typical JavaScript class (not Microstate)
class Person {
  constructor({ firstName, lastName }) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  setFirstName(firstName) {
    this.firstName = firstName;
  }
}

let homer = new Person({ firstName: 'Homer', lastName: 'Simpson' });

homer.setFirstName('Homer J');
```

But what if the instance is immutable, `setFirstName` must return a new instance of `Person` class without modifying the original object. This raises another question, how do you create a copy of an instance of a class? I won't answer this question here, but I'll just say that Microstates does it.

Let's see what this would look like with a Microstate.

```js
// this is a Microstate type
class Person {
  firstName = String;
  lastName = String;

  setFirstName(firstName) {
    return this.firstName.set(firstName);
  }
}

import { create } from 'microstates';

let homer = create(Person, { firstName: 'Homer', lastName: 'Simpson' });

// original homer is unmodified
let homerJ = homer.setFirstName('Homer J');
```

Unlike a regular JavaScript class methods which imperatively mutate objects they have access to, Microstates types declaratively describe what should be different in the copy that's returned from the method.

### Getters

Getters on JavaScript objects are evaluated everytime that a getter is read. This can very wasteful when properties of an object haven't changed. Frameworks like Ember and Vue have *computed properties* which memoize computations and automatically recompute when a property changes. 

Tracking property changes is not possible in pure JavaScript, as a result there is no safe way to cache getters on JavaScript objects. This limitation of getters can lead to very suble performance problems when used in frameworks like React that use shallow equality to determine if components need to rerender.

Consider the following example,

```js
// regular JavaScript class
class Shop {
  constructor({ products, filter }) {
    this.products = products;
    this.filter = filter;
  }

  get filtered() {
    return this.products.filter(product => product.category === this.filter);
  }
}

let filter = 'clothing';
let products = [ 
  { name: 'Pants', category: 'clothing' },
  { name: 'Shirt', category: 'clothing' },
  { name: 'Watch', category: 'accessory' }
]

let shop = new Shop({ products, filter });

shop.filtered === shop.filtered
//> false
```

If you passed `shop.filtered` to a React component, this React component would re-render every time that the parent component's render function is called even though neither `products` nor `filter` is changed.

This is a very different story in Microstates because Microstate instances are 
immutable. There is no need for property tracking, since properties can not change. It's safe to automatically cache getters because for any state they can only ever have one result. 

Here is how this example would look in Microstates,

```js
// Microstate type 
// (these annotations are for the readers, they don't do anything special)
class Shop {
  products = [Product]
  filter = String

  get filtered() {
    return this.products.filter(product => product.category === this.filter);
  }
}

class Product {
  name = String;
  category = String;
}

let filter = 'clothing';
let products = [ 
  { name: 'Pants', category: 'clothing' },
  { name: 'Shirt', category: 'clothing' },
  { name: 'Watch', category: 'accessory' }
]

import { create } from 'microstates';

let shop = create(Shop, { products, filter });

shop.state.filtered === shop.state.filtered
//> true
```

Cached getters in Microstates make cached computed properties available in all frameworks, not just Vue and Ember. For those familiar with Reselect, cached getters can replace Reselect for most applications.

### Serialization & Deserialization

Serialization is the process of converting class instances into plain JavaScript objects (aka POJOs) that can be saved as JSON. Deserialization is the opposite process of converting the JSON to JavaScript class instances. 

**How can you serialize a JavaScript class instances?**

In JavaScript, all objects have a `valueOf` method. [According to MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf), *the valueOf() method returns the primitive value of the specified object*. In theory, we should be able to take the primitive value of a class, serialize it to JSON, then restore with `JSON.parse`. 

We can't expect to get same objects, but we should at least get instances of classes so we use methods and getters on these objects.

Let's see what that actually does. You can play with this example in [▶ RunKit](https://runkit.com/taras/valueof-javascript-class).

```js
// regular JavaScript class
class Shop {
  constructor({ products, filter }) {
    this.products = products.map(product => new Product(product));
    this.filter = filter;
  }

  get filtered() {
    return this.products.filter(product => product.category === this.filter);
  }
}

class Product {
    constructor({ name, category }) {
        this.name = name;
        this.category = category;
    }
}

let filter = 'clothing';
let products = [ 
  { name: 'Pants', category: 'clothing' },
  { name: 'Shirt', category: 'clothing' },
  { name: 'Watch', category: 'accessory' }
]

let shop = new Shop({ products, filter });

let restored = JSON.parse(JSON.stringify(shop.valueOf()));

restored instanceof Shop
//> false
```

`shop.valueOf()` doesn't give you a primitive value, because `valueOf` class instance returns the shop object. It doesn't return a primivite value of the object, it returns the same object. `JSON.parse/JSON.stringify` are not enough because these functions don't know how to convert your POJOs into instances. If you look closely, you'll see that actually deserialization is done manually in the constructor. This gets very complicated with complex data structures and inpractical when you have complex relationships between data.

We need an easier way to serialize and deserialize complex data structures. Microstates can do this for you because Microstates are designed to be serializable. Let's see what that would look like. You can run this example in [▶ RunKit](https://runkit.com/taras/serializing-deserializing-a-microstate)

```js
class Shop {
  products = [Product]
  filter = String

  get filtered() {
      return this.products.filter(product => product.category === this.filter);
  }
}

class Product {
  name = String;
  category = String;
}

let filter = 'clothing';
let products = [ 
  { name: 'Pants', category: 'clothing' },
  { name: 'Shirt', category: 'clothing' },
  { name: 'Watch', category: 'accessory' }
]

import { create } from 'microstates';

let shop = create(Shop, { products, filter });

shop.valueOf();
// give you the value that can be used to restore the state
```

Microstates actually does deserialization by default. When you create a Microstate object, you provide the `create` function with the type and a POJO that represents the value. Microstates internally will create all of the instances using the type as a blueprint for the final state. 

As discussed earlier, Microstates methods return copies that are derived from original microstate. These copies will have a new value. This allows to serialize/deserialize a type to any derived state. 

For those familiar with tools like ReactDevTools and time travel debugging, Microstates makes it possible to use these kinds of tools on individual Microstate level. Microstates can work like tiny Redux stores where you don't have to write reducers while still get the benefits of time travel debugging.

In summary, Microstates are immutable JavaScript objects that are serializable, allow you to cache getters and provide a mechanism to declaratively derive next state using class like instance methods. They look like regular JavaScript classes but they hold conventions and performance improvements for state composed of many smaller states.

## Why Microstates?

Out tools effect how we solve problems and collaborate. Two tools can serve the same purpose but foster a completely different kind of ecosystem. Take jQuery plugins and React components as an example. Both of these tools provided a way to add custom behaviour to a DOM element but they fostered very different communities. 

In React world today, we see many special purpose components that are easy to combine to create sophisticated user experiences. These components tends to have few options but provide just the right API for you to build what you need. 

jQuery plugins on the other hand offer endsless list of options that are difficult get just right. In jQuery ecosystem, libraries tended to be monolithic because plugins from different libraries often did not work well together. 

As a result, in React ecosystem we see components like [react-virtualized](https://github.com/bvaughn/react-virtualized) and [react-dnd](https://github.com/react-dnd/react-dnd) that are made by experienced React developers. These components save companies and developers millions of dollars in wasted development by eliminating the need for everyone to re-invent these components to build their user experiences.  

The ability to leverage the experience of other developers that they made available as packages elevates our entire ecosystem. We call this *standing on the shoulders of giants*. Our goal is to bring this level of collaboration to state management. 

### What would an ecosystem of shared state primitives give us?

### Shared Solutions

Imagine never having to write another normalized data store again because someone made a normalized data store Microstate that you can compose into your app's Microstate. 

It might look something like this,

```js
import Normalized from 'future-normalized-microstate';

class MyApp {
  store = Normalized.of(Product, User, Category)
}
```

The knowledge about building normalized data stores is available in libraries like [Ember Data](https://github.com/emberjs/data), [Orbit.js](https://github.com/orbitjs/orbit), [Apollo](https://www.apollographql.com) and [urql](https://github.com/FormidableLabs/urql), yet many companies end up rolling their own because these tools are coupled to other stacks.

### Added Flexibility

Imagine if your favourite Calendar component came with a Microstate that allowed you to customized the logic of the calendar without touching the rendered output. It might looks something like this,

```js
import Calendar from 'awesome-calendar';

class MyCalendar extends Calendar.Model {
  // make days as events
  days = Day.of([Event])

  // component renders days from this property
  get visibleDays() {
    return this.days.filter(day => day.status !== 'finished');
  }
}

<Calendar.Component model={MyCalendar}/>
```

We don't know if any of these APIs would stand the test of time, but we'd love to get the conversation started and find out. 

### Framework Agnostic Solutions

Competition moves our industry forward but concensus builds ecosystems. 

Unfortunately, when it comes to the M(odel) of the MVC pattern, we are seeing neither compentition nor concesus. Every framework has it's own model layer that is not compatible with another. This makes it difficult to create trully portable solutions that can be used on all frameworks. 

It creates lockin that is detremental to businesses that use these frameworks and developers who are forced to make career altering decisions before they fully understand their choices. 

We don't expect everyone to agree that Microstates is the right solution, but we would like to start the conversation about what a shared primitive for state management in JavaScript might look like. Microstates is our proposed solution.

In many ways, Microstates is a beginning. We hope you'll join us for the ride and help us create a future where building stateful applications in JavaScript is much easier than it is today.



<!-- ## API

Microstates API gives developers a way to declaratively express the relationship between different fragments of state and how that state can change. To say it another way, Microstates gives a way to compose state and describe operations that you can perform on that state. This combination of composed state and operations are referred to as *type*. 

Types can be composed from types that are built into JavaScript and custom types that you write yourself. Currently, Microstate supports `Boolean`, `Number`, `String`, `Object` and `Array` types which come from JavaScript. These are what we call *primitive* types, meaning that they do not contain other types. 

These primitive types can be combined into more complex types. For example, we can describe a `Person` by their `name` which is a `String` and their `age` which is just a `Number`. You can express `Person` type you define a JavaScript class.

```js
class Person {
  name = String;
  age = Number;
}
```

By itself, this type is not very useful. It's only a way to describe the structure of the data. To make this  -->


## FAQ

### What if I can't use class syntax?

Classes are functions in JavaScript, so you should be able to use a function to do most of the same things as you would with classes.

```js
class Person {
  name = String;
  age = Number;
}
```

☝️ is equivalent to 👇

```js
function Person() {
  this.name = String;
  this.age = Number;
}
```

### What if I can't use Class Properties?

Babel compiles Class Properties into class constructors. If you can't use Class Properties, then you
can try the following.

```js
class Person {
  constructor() {
    this.name = String;
    this.age = Number;
  }
}

class Employee extends Person {
  constructor() {
    super();
    this.boss = Person;
  }
}
```

## Run Tests

```shell
$ npm install
$ npm test
```
