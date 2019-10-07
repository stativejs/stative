# stative

Easy to use reactive state.

## Installation

```sh
npm install stative
```

## Usage

```ts
import state from 'stative';

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

const stateSubscription = state.subscribe((state) => console.log('state', state));
const menuAboutSubscription = state.subscribe('menus.about', (about) =>
  console.log('about has changed', about)
);
const articlesSubscription = state.subscribe('articles', (articles) =>
  console.log('articles has changed', articles)
);

state.set('menus.about', 'selected');
state.set('articles', currentArticles => {
  return { ...{ id: 4, title: 'Using Stative!' }, ...currentArticles };
});

var currentState = state.get();
console.log(currentState);

var articles = state.get('articles');
console.log(articles);

// don't forget to unsubscribe!
stateSubscription.unsubscribe();
menuAboutSubscription.unsubscribe();
articlesSubscription.unsubscribe();
```

## Frameworks

### React

A simple Todo list example of Stative working in React can be verified in this [repo](https://github.com/bsgiovanini/react-stative). Soon, a plugin will be available.

### Vue
A plugin is available to ease the interation between application state and Vue components. It can be check [it](https://github.com/alandecastros/vue-stative) out

