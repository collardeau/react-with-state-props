import React from "react";
import PropTypes from "prop-types";
import omit from "ramda/src/omit";
import { cap, isObj, throwError } from "./utils";

function createUserHandlers(state, fns) {
  let handlers = {};
  Object.keys(fns).forEach(key => {
    handlers[key] = (...params) => fns[key](state)(...params);
  });
  return handlers;
}

export class Store extends React.Component {
  static defaultProps = {
    seeds: [],
    withHandlers: {},
    render: props => <div {...props} />,
    _onError: throwError
  };
  static propTypes = {
    seeds: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired
      })
    ).isRequired,
    render: PropTypes.func.isRequired,
    withHandlers: PropTypes.objectOf(PropTypes.func),
    _onError: PropTypes.func
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
    const { _onError: onError } = this.props;
    // state setters for the seed
    const setState = (state, cb) => {
      this.setState(
        {
          [name]: state
        },
        cb
      );
    };
    const setLoadedState = state => {
      this.setState({
        [loadedName]: state
      });
    };
    let handlers = {}; // aggregrate handlers
    // create default handlers
    if (loadable) {
      handlers[setLoadedName] = setLoadedState;
    }
    if (setable) {
      handlers[`set${capName}`] = (state, cb) => {
        if (mergeable && typeof state !== typeof initialState) {
          onError(
            `cannot set ${name} because of a mergeable state cannot change type from its initialState`
          );
        }
        setState(state, cb);
        loadable && handlers[setLoadedName](true);
      };
    }
    if (resetable) {
      handlers[`reset${capName}`] = cb => {
        setState(initialState, cb);
      };
    }
    if (toggleable) {
      handlers[`toggle${capName}`] = cb => {
        setState(!this.state[name], cb);
      };
    }
    if (mergeable) {
      if (!Array.isArray(initialState) && !isObj(initialState)) {
        onError(
          `Your ${name} state is mergeable but the initialState is ${initialState}; it should be an object or array`
        );
      }
      handlers[`merge${capName}`] = (update, cb) => {
        const state = this.state[name];
        if (Array.isArray(state) && Array.isArray(update)) {
          return setState([...state, ...update], cb);
        }
        if (isObj(state) && isObj(update)) {
          return setState({ ...state, ...update }, cb);
        }
        onError(
          `Cannot merge ${name} because of mismatched types. Please pass an ${
            isObj(state) ? "object" : "array"
          } to merge${capName}.`
        );
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
    const userProps = omit(
      ["seeds", "render", "withHandlers", "_onError"],
      this.props
    );
    return this.props.render({ ...this.state, ...userProps });
  }
}
