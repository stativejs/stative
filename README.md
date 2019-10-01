# stative

A simple to use reactive state.

### Installation

```sh
npm install stative
```

### Usage

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

state.subscribe((state) => console.log('state', state));
state.subscribe('menus.about', (about) =>
  console.log('about has changed', about)
);
state.subscribe('articles', (articles) =>
  console.log('articles has changed', articles)
);

state.set('menus.about', 'selected');
state.set('articles', [1, 2, 3]);

var currentState = state.get();
console.log(currentState);

var articles = state.get('articles');
console.log(articles);
```

## Frameworks

### React

A simple Todo list example of Stative working in React can be verified in this [repo](https://github.com/bsgiovanini/react-stative). Soon, a plugin will be available.

### Vue
A plugin is available to ease the interation between application state and Vue components. It can be check [it](https://github.com/alandecastros/vue-stative) out

