[![Build Status](https://travis-ci.org/collardeau/react-with-state-props.svg?branch=master)](https://travis-ci.org/collardeau/react-with-state-props)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-with-state-props/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-with-state-props?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# react-with-state-props

A container component to initialize state, derived state, and state handlers in React.

## Installation

`npm install react-with-state-props --save`

## Examples

Create some state, and set handlers for each key on your state:

```javascript
import Container from "react-with-state-props"

// ...

<Container
  state={{ counter: 0 }}
  render={props => {
    // props ready to go!
    // { counter: 0, setCounter: [Function] }
    return <MyApp {...props} />;
    // render your JSX with the newly-created state props
  }}
/>;
```

Create custom state handlers:

```javascript

<Container
  state={{ counter: 0 }}
  withHandlers={{
    incrBy1: props => () => {
      props.setCounter(props.counter + 1)
    }
  }}
  render={props => {
    // { counter: 0, setCounter: [Function], incrBy1: [Function] }
    return <Counter {...props} />; // your JSX
  }}
/>;

// another example:

<Container
  state={{ counter: 0 }}
  withHandlers={{
    reset: ({ setCounter }) => () => setCounter(0),
    incr: ({ counter, setCounter }) => num => setCounter(counter + num),
    incrBy1: ({ incr }) => () => incr(1) // using custom handler just defined
  }}
  omitProps={["setCounter"]} // drop props before the render function
  render={props => {
    console.log(props);
    // { counter: 0, incr: [Function], incrBy1: [Function] }
    return <Counter {...props} />; // your JSX
  }}
/>;

```

Derive state from your initial state:

```javascript
<Container
  state={{ counter: 0 }}
  deriveState={[
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

```

You can derive state from derived state, if that strikes your fancy:

```javascript
<Container
  state={{ counter: 1 }}
  deriveState={[
    {
      onStateChange: ["counter"],
      derive: state => ({
        isOdd: Boolean(state.counter % 2)
      })
    },
    {
      onStateChange: ["isOdd"],
      derive: state => ({
        isEven: !state.isOdd
      })
    }
  ]}
  render={props => {
    // { counter: 0, setCounter: [Function], isOdd: true, isEven: false }
    return <Counter {...props} />; // your JSX
  }}
/>;

```

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


## Development

`react-with-state-props` is build in Typescript.
PR and Issues welcomed!

# Inspirations

* Andrew Clark's [recompose](https://github.com/acdlite/recompose) library
* Kent C. Dodds Advanced React Component Patterns [Egghead course](https://egghead.io/courses/advanced-react-component-patterns)
* Never Write Another HOC [talk](https://www.youtube.com/watch?v=BcVAq3YFiuc) by Michael Jackson
