[![Build Status](https://travis-ci.org/collardeau/react-senna.svg?branch=master)](https://travis-ci.org/collardeau/react-senna)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-senna/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-senna?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# react-senna

A store component to quickly initialize state and `setState` handlers in React.

## Installation

`npm install react-senna`

## Usage

```javascript
import React from "react";
import { Store } from "react-senna";

// describe the state you want in a `seeds` array, for example:
const seeds = [
  {
    name: "counter",
    initialState: 0,
    resetable: true,
    handlers: {
      incr: state => state + 1
    }
  }
];

// Use the Store component to initiate React state, with handlers to update that state
const App = () => (
  <Store
    seeds={seeds}
    render={props => {
      console.log(props);
      /*
      {
        counter: 0
        handlers: {
          setCounter: [Function],
          incrCounter: [Function],
          resetCounter: [Function]
        }
      }
      */
      return <div />; // render whatever you want with the state and handlers you just created!
    }}
  />
)

```

# Available Props

A Senna store takes in the following props:

## render

The component to render which will receive Senna props!

## seeds

`PropTypes.array.isRequired`

An array of seed objects that will initialize the Senna store, with the following keys:

- name
`PropTypes.string.isRequired`

The name of the state to be created.

- initialState
`PropTypes.any`

The initial (and reset) value of the state in question.

- handlers

`PropTypes.objOf(PropTypes.func)`

To create custom handlers with the current state as a param.

For example a seed with:

`{ name: 'counter', initialState: 0, handlers: {incr: state => state + 1}`
will create `handlers.incrCounter` as a `prop`, which as suggested would increment the `counter` state by 1.

- resetable

`PropTypes.objOf(PropTypes.bool)`

default: `false`

`resetable: true` will create a handler that will set the state to its initial value.

- toggleable

`PropTypes.objOf(PropTypes.bool)`

default: `false`

`toggleable: true` will create a handler that will set the state to its opposite.

For example a seed with:

`{ name: 'isActive', initialState: false, toggleable: true }`
will create `handlers.toggleIsActive` as a `prop`, which will flip the state (`!state`)

`toggleable: true` is a shorcut for `{ handlers: { toggle: state => !state } }`

## withHandlers

`PropTypes.objOf(PropTypes.func)`

`withHandlers` takes an object of high-order functions.

Here you can access the `react-senna` props so you can you create more complex state changes.
For example:

```javascript

const seeds = [
  {
    name: "counterA",
    initialState: 0
  },
  {
    name: "counterA",
    initialState: 0
  }
];

const withHandlers = {
  setAll: ({ handlers }) => num => {
    // run multiple react-senna handlers
    setCounterA(num);
    setCounterB(num);
  }
};

const App = () => (
  <Store
    seeds={seeds}
    withHandlers={withHandlers}
    // use new `props.handlers.setAll` in render:
    render={({ handlers }) => (
      <button onClick={() => handlers.setAll(10)}>set all counters to 10</button>
    )}
  />
)
```
