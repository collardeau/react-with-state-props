[![Build Status](https://travis-ci.org/collardeau/react-with-state-props.svg?branch=master)](https://travis-ci.org/collardeau/react-with-state-props)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-with-state-props/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-with-state-props?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# react-with-state-props

A store component to quickly initialize state and actions in React.

## Installation

`npm install react-with-state-props`

## Usage

```javascript
import React from "react";
import { Store } from "react-with-state-props";

// describe the state you want in a `withState` array, for example:
const withState = [
  {
    name: "todos",
    initialState: []
  }
];

// Use the Store component to initiate React state and setState actions
  <Store
    withState={withState}
    render={props => {
      // render whatever you want with the state and action you just created!
      return <MyApp {...props} />;
    }}
  />
/*
your render function will be passed these props:
{
  todos: []
  actions: {
    setTodos: [Function]
  }
}
*/
```
You can easily create more actions out of the box. Read on!

# Props API

The Store component accepts the following props: `render`, `withState`, `compoundActions`, `omitActions` and `flatten`.

## render `func.isRequired`

Your render function which will receive state and actions props!

## withState `array.isRequired`

An array of objects that will initialize the store, which have **the following keys**:

#### name `string.isRequired`

The name of the state to be created.

#### initialState `any`

The initial (and reset) value of the state being initiated.

#### createActions `objOf(func)`

Here, you can create actions using the current state as a parameter:

```javascript
const withState = [
  {
    name: "counter",
    initialState: 0,
    createActions: {
      incr: state => state + 1
    }
  }
];
/*
results in these props:
{
  counter: 0,
  actions: {
    setCounter: [Function],
    incrCounter: [Function]  <-- new action
  }
}
*/
```

The resulting `props.actions.incrCounter` function increments the `counter` state by 1

#### toggleable `bool` default: `false`

`toggleable: true` will create a action that will set the state to its opposite:

```javascript
const withState = [
  {
    name: "isActive",
    initialState: false,
    toggleable: true
  }
];
/*
results in these props:
{
  isActive: false,
  actions: {
    setIsActive: [Function],
    toggleIsActive: [Function],  <-- new action
  }
}
*/
```

The resulting `props.actions.toggleIsActive` will flip the state of `isActive`

In fact, `toggleable: true` is a shortcut for `{ createAction: { toggle: state => !state } }`

#### loadable `bool` default: `false`

`loadable: true` creates an additional loaded state:

```javascript
const withState = [
  {
    name: "users",
    initialState: {},
    loadable: true
  }
];
/*
results in these props:
{
  users: {},
  usersLoaded: false   <-- new state
  actions: {
    setUsers: [Function],
    setUsersLoaded: [Function],  <-- new action
  }
}
*/
```

`usersLoaded` is automatically set to `true` when `users` is updated.

#### resetable `bool` default: `false`

`resetable: true` will create a action that will set the state to its initialState. For example, `actions.resetCounter`.

## compoundActions `objOf(func)`

`compoundActions` takes an object of high-order functions.

Here you can access the newly-created props so you can you create more complex state changes.
For example, controlling two separate counter states:

```javascript
const withState = [
  {
    name: "counterA",
    initialState: 0
  },
  {
    name: "counterB",
    initialState: 0
  }
];

const compoundActions = {
  setAll: ({ actions }) => num => {
    // run multiple actions
    actions.setCounterA(num);
    actions.setCounterB(num);
  }
};

const AppState = () => (
  <Store
    withState={withState}
    compoundActions={compoundActions}
    // use new `props.actions.setAll` in render:
    render={({ actions, counterA, counterB }) => (
       <div>
        A: {counterA}
        <br />
        B: {counterB}
        <br />
        <button onClick={() => actions.setAll(10)}>
          set all counters to 10
        </button>
      </div
    )}
  />
)
```

## omitActions `array`

Remove actions before the props are passed on to the render function. This is good place to remove actions you used in `compoundActions` but don't want to pass forward:

```javascript
const withState = [
  {
    name: "movies",
    initialState: {}
  }
];
const compoundActions = {
  fetchMovies: ({ actions }) => () => {
    // some imaginary db
    db.fetchMovies().then(movies => {
      actions.setMovies(movies);
    });
  }
};

// we want to drop `setMOvies` (and only pass on `fetchMovies`)
const omitActions = ["setMovies"];

const AppState = () => (
  <Store
    withState={withState}
    compoundActions={compoundActions}
    omitActions={omitActions}
    render={props => {
      console.log(props);
      /*
                        {
                          movies: {}
                          actions: {   <-- without `setMovies`
                            fetchMovies: [Function]
                          }
                        }
                        do as you please with the props:
                        */
      return <MyApp {...props} />;
    }}
  />
);
```

## flatten `bool`

default: `false`

If you don't want the `actions` key in your state, you don't have to use it:

```javascript
const withState = [
  {
    name: "movies",
    initialState: {}
  }
];

const AppState = () => (
  <Store
    withState={withState}
    flatten={true}
    render={props => {
      console.log(props);
      /*
                        {
                          movies: {},
                          setMovies: [Function]   <-- without the `actions` key
                        }
                        */
      return <MyApp {...props} />;
    }}
  />
);
```

# Inspirations

* Andrew Clark's [recompose](https://github.com/acdlite/recompose) library
* Kent C. Dodds Advanced React Component Patterns [Egghead course](https://egghead.io/courses/advanced-react-component-patterns)
* Never Write Another HOC [talk](https://www.youtube.com/watch?v=BcVAq3YFiuc) by Michael Jackson
