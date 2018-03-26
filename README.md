[![Build Status](https://travis-ci.org/collardeau/react-with-state-props.svg?branch=master)](https://travis-ci.org/collardeau/react-with-state-props)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-with-state-props/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-with-state-props?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# react-with-state-props

A container component to initialize state, derived state, and state handlers in React.

`react-with-state-props` is written in Typescript.

## Installation

`npm install react-with-state-props --save`

## Example

```javascript
import Container from "react-with-state-props"

// ...

<Container
  state={{ counter: 0 }}
  withHandlers={{
    // `counter` and `setCounter` are available props
    incr: props => () => props.setCounter(props.counter++)
  }}
  render={props => {
    console.log(props);
    // props ready to go!
    // { counter: 0, setCounter: [Function], incr: [Function] }
    return <Counter {...props} />;
    // render your JSX with the newly-created by state props
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
# Inspirations

* Andrew Clark's [recompose](https://github.com/acdlite/recompose) library
* Kent C. Dodds Advanced React Component Patterns [Egghead course](https://egghead.io/courses/advanced-react-component-patterns)
* Never Write Another HOC [talk](https://www.youtube.com/watch?v=BcVAq3YFiuc) by Michael Jackson
