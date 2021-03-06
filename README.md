# Deprecated!

As of Sept 15th 2020, stative is fully deprecated.

# stative

[![NPM version](https://badge.fury.io/js/stative.svg)](http://badge.fury.io/js/stative)
[![Build Status](https://travis-ci.org/stativejs/stative.png?branch=master)](https://travis-ci.org/stativejs/stative)
[![codecov](https://codecov.io/gh/stativejs/stative/branch/master/graph/badge.svg)](https://codecov.io/gh/stativejs/stative)

Easy to use reactive state.

### Motivation

Most solutions of state management in javascript are not as simple as it should be.

Stative was created to be an easy and unique way to manage state in any javascript application.

## Installation

#### NPM

```bash
npm install stative
```

#### Yarn

```bash
yarn add stative
```

### Usage

Stative gives you a global state object that you can access anywhere and anytime in your application.

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

state.set('articles', currentArticles => {
  return { ...{ id: 4, title: 'Using Stative!' }, ...currentArticles };
});

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
  }
});

const stateSubscription = state.subscribe(appState => {
  console.log(appState);
})

const menusSubscription = state.subscribe('menus', menus => {
  console.log(menus);
});

const menuHomeSubscription = state.subscribe('menus.home', menuHome => {
  console.log(menuHome);
});

// When you change menus.home, all of your subscribers will fire.
state.set('menus.home', 'not-selected');

// don't forget to unsubscribe!
stateSubscription.unsubscribe();
menusSubscription.unsubscribe();
menuHomeSubscription.unsubscribe();
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

#### `set(fn)`

Changes the state value. 

`fn` must return a value.

If you have a subscriber to a key that does not exist anymore it will receive an `undefined` value.

```js
state.set(currentState => {
  return { ...{ newProp: 99 }, ...currentState };
});
```

#### `set(path, value)`

Changes a value inside your state. If it doesn't exist it will create a new one.

```js
state.set('user.name', 'Bruno');
```

#### `set(path, fn)`

Changes a value inside your state. If it doesn't exist it will create a new one.

`fn` must return a value.

```js
state.set('user.name', 'Bruno');
state.set('user.name', currentName => `${currentName} Giovanini`); // New value will be Bruno Giovanini
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

#### `subscribe(fn)`

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

const subscription = state.subscribe(currState => {
  console.log(currState); // in this state user.age will be 45
})

const userAge = state.set('user.age', 45);

subscription.unsubscribe();
```

#### `subscribe(path, fn)`

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

const subscription = state.subscribe('user.name', userName => {
  console.log(userName); // userName will be 'Giovanini'
});

const userAge = state.set('user.name', 'Giovanini');

subscription.unsubscribe();
```

### Frameworks

* [React](https://github.com/stativejs/react-stative)
* [Vue](https://github.com/stativejs/vue-stative)
