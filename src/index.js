import React from "react";
import PropTypes from "prop-types";
import { cap, isObj, throwError, omit } from "./utils";

export class Store extends React.Component {
  static defaultProps = {
    withState: [],
    withHandlers: {},
    omitHandlers: [],
    render: props => <div {...props} />,
    _onError: throwError
  };
  static propTypes = {
    withState: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        handlers: PropTypes.objectOf(PropTypes.func),
        setable: PropTypes.bool,
        resetable: PropTypes.bool,
        toggleable: PropTypes.bool,
        mergeable: PropTypes.bool,
        loadable: PropTypes.bool
      })
    ).isRequired,
    omitHandlers: PropTypes.array,
    render: PropTypes.func.isRequired,
    withHandlers: PropTypes.objectOf(PropTypes.func),
    flatten: PropTypes.bool,
    _onError: PropTypes.func
  };
  createStateHandlers({
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
    // state setters
    const setLoadedState = (state, cb) => {
      if (loadable) {
        this.setState({
          [loadedName]: true
        });
      }
    };
    const setState = (state, cb) => {
      this.setState(
        {
          [name]: state
        },
        cb
      );
      setLoadedState();
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
      if (toggleable) {
        onError(
          `State cannot be both mergeable and toggleable. Check your "${name}" state.`
        );
      }
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

  createUserHandlers() {
    const { withHandlers: fns } = this.props;
    let handlers = {};
    Object.keys(fns).forEach(key => {
      handlers[key] = (...params) => {
        fns[key](this.state)(...params);
      };
    });
    return handlers;
  }

  createState() {
    return this.props.withState.reduce((acc, state = {}) => {
      const stateName = state.name;
      const handlers = this.createStateHandlers(state);

      const maybeLoadedState = state.loadable
        ? {
            [`${stateName}Loaded`]: false
          }
        : null;

      return {
        ...acc,
        [stateName]: state.initialState,
        ...maybeLoadedState,
        handlers: {
          ...acc.handlers,
          ...handlers
        }
      };
    }, {});
  }

  initState() {
    const { omitHandlers, flatten } = this.props;
    const state = this.createState();
    const userHandlers = this.createUserHandlers();
    const handlers = omit(omitHandlers, { ...state.handlers, ...userHandlers });
    return flatten
      ? {
          ...omit("handlers", state),
          ...handlers
        }
      : {
          ...state,
          handlers
        };
  }

  state = {};

  componentWillMount() {
    this.setState(this.initState);
  }

  render() {
    const userProps = omit(
      [
        "withState",
        "render",
        "withHandlers",
        "omitHandlers",
        "flatten",
        "_onError"
      ],
      this.props
    );
    return this.props.render({ ...this.state, ...userProps });
  }
}
