import React from "react";
import omit from "ramda/src/omit";

function createUserHandlers(state, fns) {
  let handlers = {};
  Object.keys(fns).forEach(key => {
    handlers[key] = (...params) => fns[key](state)(...params);
  });
  return handlers;
}

class Store extends React.Component {
  static defaultProps = {
    seeds: [],
    withHandlers: {},
    render: props => <div {...props} />
  };
  createSeedHandlers({
    name,
    initialState = null,
    handlers: customHandlers = [],
    setable = true,
    toggleable = false,
    resetable = false,
    mergeable = false,
    loadable = false
  }) {
    const capName = cap(name);
    const loadedName = `${name}Loaded`;
    const setLoadedName = `set${cap(loadedName)}`;
    // state setters for the seed
    const setState = state => {
      this.setState({
        [name]: state
      });
    };
    const setLoadedState = state => {
      this.setState({
        [loadedName]: state
      });
    };
    let handlers = {}; // aggregrate handlers
    // create default handlers
    if (loadable) {
      handlers[setLoadedName] = bool => {
        setLoadedState(bool);
      };
    }
    if (setable) {
      handlers[`set${capName}`] = st => {
        setState(st);
        loadable && handlers[setLoadedName](true);
      };
    }
    if (resetable) {
      handlers[`reset${capName}`] = () => {
        setState(initialState);
      };
    }
    if (toggleable) {
      handlers[`toggle${capName}`] = () => {
        setState(!this.state[name]);
      };
    }
    if (mergeable) {
      handlers[`merge${capName}`] = update => {
        setState({ ...this.state[name], ...update });
      };
    }
    Object.keys(customHandlers).forEach(fnName => {
      handlers[`${fnName}${capName}`] = () => {
        const fn = customHandlers[fnName];
        setState(fn(this.state[name]));
      };
    });
    return handlers;
  }

  createStateFromSeeds(seeds) {
    return seeds.reduce((acc, seed = {}) => {
      const stateName = seed.name;
      const handlers = this.createSeedHandlers(seed);

      const maybeLoadedState = seed.loadable
        ? {
            [`${stateName}Loaded`]: false
          }
        : null;

      return {
        ...acc,
        [stateName]: seed.initialState,
        ...maybeLoadedState,
        handlers: {
          ...acc.handlers,
          ...handlers
        }
      };
    }, {});
  }

  init() {
    const { seeds, withHandlers } = this.props;
    const state = this.createStateFromSeeds(seeds);
    const handlers = createUserHandlers(state, withHandlers);
    return {
      ...state,
      handlers: {
        ...state.handlers,
        ...handlers
      }
    };
  }

  state = this.init();

  render() {
    const userProps = omit(["seeds", "render", "withHandlers"], this.props);
    return this.props.render({ ...this.state, ...userProps });
  }
}

// helpers

function cap(string) {
  // capitalize first letter
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default Store;
