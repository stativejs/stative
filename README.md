# stative

[![NPM version](https://badge.fury.io/js/stative.svg)](http://badge.fury.io/js/stative)

Easy to use reactive state.

### Motivation

Most solutions of state management in javascript are not as simple as it should be.

Stative was created to be an easy and unique way to manage state in any javascript application.

### Installation

#### NPM

```bash
npm install stative
```

#### Yarn

```bash
yarn add stative
```

### Usage

Stative gives you a global state object that you can access anytime in your application.

```js
import state from 'stative';

// Create your initial app state
state.set({
  loading: false,
  menus: {
    home: 'selected',
    about: 'not-selected',
    contact: 'not-selected',
  },
  articles: [
    { id: 1, title: 'Simple state management' },
    { id: 2, title: 'Reactive state' },
    { id: 3, title: 'RxJS' },
  ],
});

const appState = state.get(); // Access it anytime you want

// Change only the things you want
state.set('menus.about', 'selected');
state.set('articles', [1, 2, 3]);

// Or change the whole state
state.set({
  loading: true
});
```

You can subscribe to any change in the state or just in some part of it.

```js
import state from 'stative';

// Create your initial app state
state.set({
  loading: false,
  menus: {
    home: 'selected',
    about: 'not-selected',
    contact: 'not-selected',
  },
  articles: [
    { id: 1, title: 'Simple state management' },
    { id: 2, title: 'Reactive state' },
    { id: 3, title: 'RxJS' },
  ],
});

state.subscribe(appState => {
  console.log(appState);
})

state.subscribe('menus', menus => {
  console.log(menus);
});

state.subscribe('menus.home', menuHome => {
  console.log(menuHome);
});

// When you change menus.home, all of your subscribers will fire.
state.set('menus.home', 'not-selected');
```

### API

#### `set(obj)`

Changes the state value.

If you have a subscriber to a key that does not exist anymore it will receive an `undefined` value.

```js
state.set({
  counter: 1,
  loading: false,
  user: {
    name: 'Alan',
    age: 32
  }
});
```

#### `set(path, value)`

Changes a value inside your state. If it doesn't exist it will create a new one.

```js
state.set('user.name', 'Bruno');
```

#### `get()`

Returns the current state value.

```js
state.set({
  counter: 1,
  loading: false,
  user: {
    name: 'Alan',
    age: 32
  }
});

const appState = state.get();

// appState is {
//  counter: 1,
//  loading: false,
//  user: {
//    name: 'Alan',
//    age: 32
//  }
//}
```

#### `get(path)`

Returns the value of the object's path.

```js
state.set({
  counter: 1,
  loading: false,
  user: {
    name: 'Alan',
    age: 32
  }
});

const userAge = state.get('user.age');

// userAge is 32
```

#### subscribe(fn)

Subscribe to any change on the whole state.

```js
state.set({
  counter: 1,
  loading: false,
  user: {
    name: 'Alan',
    age: 32
  }
});

state.subscribe(currState => {
  console.log(currState); // in this state user.age will be 45
})

const userAge = state.set('user.age', 45);
```

#### subscribe(path, fn)

Subscribe to a change only in some part of the state

```js
state.set({
  counter: 1,
  loading: false,
  user: {
    name: 'Alan',
    age: 32
  }
});

state.subscribe('user.name', userName => {
  console.log(userName); // userName will be 'Giovanini'
});

const userAge = state.set('user.name', 'Giovanini');
```

### Frameworks

#### React

Checkout [react-stative](https://github.com/stativejs/react-stative).

#### Vue
Checkout [vue-stative](https://github.com/stativejs/vue-stative).

