import React from "react";
import PropTypes from "prop-types";
import { cap, isObj, throwError, omit } from "./utils";

export class Store extends React.Component {
  static defaultProps = {
    withState: [],
    compoundActions: {},
    omitActions: [],
    render: props => <div {...props} />,
    _onError: throwError
  };
  static propTypes = {
    withState: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        createActions: PropTypes.objectOf(PropTypes.func),
        setable: PropTypes.bool,
        resetable: PropTypes.bool,
        toggleable: PropTypes.bool,
        mergeable: PropTypes.bool,
        loadable: PropTypes.bool
      })
    ).isRequired,
    omitActions: PropTypes.array,
    render: PropTypes.func.isRequired,
    compoundActions: PropTypes.objectOf(PropTypes.func),
    flatten: PropTypes.bool,
    _onError: PropTypes.func
  };
  createActions({
    name,
    initialState = null,
    createActions = {},
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
    let actions = {}; // aggregrate actions
    // create default actions
    if (loadable) {
      actions[setLoadedName] = setLoadedState;
    }
    if (setable) {
      actions[`set${capName}`] = (state, cb) => {
        if (mergeable && typeof state !== typeof initialState) {
          onError(
            `cannot set ${name} because of a mergeable state cannot change type from its initialState`
          );
        }
        setState(state, cb);
      };
    }
    if (resetable) {
      actions[`reset${capName}`] = cb => {
        setState(initialState, cb);
      };
    }
    if (toggleable) {
      actions[`toggle${capName}`] = cb => {
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
      actions[`merge${capName}`] = (update, cb) => {
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
    Object.keys(createActions).forEach(fnName => {
      actions[`${fnName}${capName}`] = () => {
        const fn = createActions[fnName];
        setState(fn(this.state[name]));
      };
    });
    return actions;
  }

  createCompoundActions() {
    const { compoundActions: fns } = this.props;
    let actions = {};
    Object.keys(fns).forEach(key => {
      actions[key] = (...params) => {
        fns[key](this.state)(...params);
      };
    });
    return actions;
  }

  createState() {
    return this.props.withState.reduce((acc, state = {}) => {
      const stateName = state.name;
      const actions = this.createActions(state);

      const maybeLoadedState = state.loadable
        ? {
            [`${stateName}Loaded`]: false
          }
        : null;

      return {
        ...acc,
        [stateName]: state.initialState,
        ...maybeLoadedState,
        actions: {
          ...acc.actions,
          ...actions
        }
      };
    }, {});
  }

  initState() {
    const { omitActions, flatten } = this.props;
    const state = this.createState();
    const compoundActions = this.createCompoundActions();
    const actions = omit(omitActions, { ...state.actions, ...compoundActions });
    return flatten
      ? {
          ...omit("actions", state),
          ...actions
        }
      : {
          ...state,
          actions
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
        "compoundActions",
        "omitActions",
        "flatten",
        "_onError"
      ],
      this.props
    );
    return this.props.render({ ...this.state, ...userProps });
  }
}
