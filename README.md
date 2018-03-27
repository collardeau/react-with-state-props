[![Build Status](https://travis-ci.org/collardeau/react-with-state-props.svg?branch=master)](https://travis-ci.org/collardeau/react-with-state-props)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-with-state-props/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-with-state-props?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# react-with-state-props

A container render-prop component to initialize, handle and derive state in React.

## Installation

`npm install react-with-state-props --save`

## Examples

Create some state:

```javascript
import Container from "react-with-state-props"

// ...

<Container
  state={{ counter: 0 }}
  render={props => {
    // props ready-to-go based on the state you provided:
    console.log(props);
    // { counter: 0, setCounter: [Function] }
    // props.setCounter is automatically generated
    return <MyApp {...props} />; // whatever JSX/Comp you want
  }}
/>;
```

You can derive state (and keep your original state as simple as possible):

```javascript
<Container
  state={{ counter: 0 }} // original state
  deriveState={[
    // derive `isOdd` when `counter` changes
    {
      onStateChange: ["counter"],
      derive: state => ({
        isOdd: Boolean(state.counter % 2)
      })
    }
  ]}
  render={props => {
    // { counter: 0, setCounter: [Function], isOdd: false }
    return <Counter {...props} />; // your JSX
  }}
/>;

// You can derive state from derived state:

<Container
  state={{ counter: 1 }}
  deriveState={[
    {
      onStateChange: ["counter"],
      derive: ({ counter }) => ({
        isOdd: Boolean(counter % 2)
      })
    },
    {
      onStateChange: ["isOdd"], // now react to `isOdd` changes
      derive: ({ isOdd }) => ({
        isEven: !isOdd
      })
    }
  ]}
  render={props => {
    // { counter: 0, setCounter: [Function], isOdd: true, isEven: false }
    return <Counter {...props} />; // your JSX
  }}
/>;

```

You can also create custom state handlers:

```javascript

<Container
  state={{ counter: 0 }}
  withHandlers={{
    add1: props => () => {
      // props.setCounter was created in Container
      props.setCounter(props.counter + 1)
    }
  }}
  render={props => {
    console.log(props);
    // { counter: 0, add1: [Function], setCounter: [Function] }
    return <Counter {...props} />; // your JSX
  }}
/>;

// another example with multiple handlers and some syntax shorthand:

<Container
  state={{ counter: 0 }}
  withHandlers={{
    incr: ({ counter, setCounter }) => num => setCounter(counter + num),
    incrBy1: ({ incr }) => () => incr(1), // using custom handler just defined
    incrBy10: ({ incr }) => () => incr(10),
    reset: ({ setCounter }) => () => setCounter(0)
  }}
  omitProps={["setCounter", "incr"]} // drop props before the render function
  render={props => {
    console.log(props);
    // { counter: 0, incrBy1: [Function], incrBy10: [Function], reset: [Function] }
    return <Counter {...props} />; // your JSX
  }}
/>;

```

**Putting it all together**, here is a basic Todo App example:

```javascript

import React from "react";
import Container from "react-with-state-props";

// define state, derived state and state handlers

const state = {
  todos: {},
  newInput: ""
};

const deriveState = [
  {
    onStateChange: "todos", // when `state.todos` change
    derive: ({ todos }) => ({
      // derive `todosByDate` array
      todosByDate: Object.keys(todos)
        .map(key => todos[key])
        .sort((a, b) => b.stamp - a.stamp)
    })
  }
];

const withHandlers = {
  changeInput: ({ setNewInput }) => e => {
    // controlled text input
    setNewInput(e.target.value); // setNewInput is created from `newInput` state
  },
  mergeTodos: ({ setTodos, todos }) => newTodos => {
    // other handlers will use this
    setTodos({ ...todos, ...newTodos }); // setTodos is created from `todos` state
  },
  submit: ({ mergeTodos, setNewInput, newInput }) => () => {
    // submit new todo
    if (!newInput) return;
    const title = newInput.trim();
    mergeTodos(createTodo(title));
    setNewInput(""); // reset input
  },
  toggleTodo: ({ mergeTodos, todos }) => id => {
    // toggle done state
    const todo = todos[id];
    mergeTodos({
      [id]: {
        ...todo,
        done: !todo.done
      }
    });
  }
};

// Components

const Todos = ({ todosByDate, newInput, changeInput, submit, toggleTodo }) => (
  <div>
    <input type="text" value={newInput} onChange={changeInput} />
    <button onClick={submit}>Submit</button>
    {todosByDate.map(({ id, done, title }) => (
      <div key={id} onClick={() => toggleTodo(id)}>
        {title} {done && " - done"}
      </div>
    ))}
  </div>
);

const App = () => (
  <Container
    state={state}
    deriveState={deriveState}
    withHandlers={withHandlers}
    omitProps={["setTodos", "setNewInput", "mergeTodos"]}
    render={Todos}
  />
);

// implementation details

const uuid = require('uuid');

function createTodo(title) {
  const id = uuid().slice(0, 5);
  return {
    [id]: {
      title,
      id,
      done: false,
      stamp: Date.now()
    }
  };
}

export default App;

```

That's about it. Enjoy!

## Usage

```javascript

const propTypes = {
  render: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  withHandlers: PropTypes.objectOf(PropTypes.func),
  omitProps: PropTypes.arrayOf(PropTypes.string),
  deriveState: PropTypes.arrayOf(
    PropTypes.shape({
      onStateChange: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string
      ]).isRequired,
      derive: PropTypes.func.isRequired
    })
  )
};

```


# Development

`react-with-state-props` is build in Typescript.
PR and Issues welcomed!

# Inspirations

* Andrew Clark's [recompose](https://github.com/acdlite/recompose) library
* Kent C. Dodds Advanced React Component Patterns [Egghead course](https://egghead.io/courses/advanced-react-component-patterns)
* Never Write Another HOC [talk](https://www.youtube.com/watch?v=BcVAq3YFiuc) by Michael Jackson
