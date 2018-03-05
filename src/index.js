import React from "react";
import omit from "ramda/src/omit";

class Store extends React.Component {
  static defaultProps = {
    seeds: [],
    withHandlers: {},
    render: props => <div {...props} />
  };
  createHandlers({
    name,
    init = null,
    handlers = [],
    setable = true,
    toggleable = false,
    resetable = false,
    mergeable = false,
    loadable = false
  }) {
    const stateName = capFirstLetter(name);
    const loadedName = `${name}Loaded`;
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
    let sennaHandlers = {}; // to aggregrate handlers
    // create default handlers
    if (loadable) {
      sennaHandlers[`set${capFirstLetter(loadedName)}`] = bool => {
        setLoadedState(bool);
      };
    }
    if (setable) {
      sennaHandlers[`set${stateName}`] = st => {
        setState(st);
        loadable && sennaHandlers[`set${loadedName}`](true);
      };
    }
    if (resetable) {
      sennaHandlers[`reset${stateName}`] = () => {
        setState(init);
      };
    }
    if (toggleable) {
      sennaHandlers[`toggle${stateName}`] = () => {
        setState(!this.state[name]);
      };
    }
    if (mergeable) {
      sennaHandlers[`merge${stateName}`] = update => {
        setState({ ...this.state[name], ...update });
      };
    }
    // inject state into user handlers
    Object.keys(handlers).forEach(fnName => {
      sennaHandlers[`${fnName}${stateName}`] = () => {
        const fn = handlers[fnName];
        setState(fn(this.state[name]));
      };
    });
    return sennaHandlers;
  }

  createState() {
    return this.props.seeds.reduce((acc, seed = {}) => {
      const loadedState = !seed.loadable
        ? null
        : {
            [`${seed.name}Loaded`]: false
          };

      return {
        ...acc,
        [seed.name]: seed.init,
        ...loadedState,
        handlers: {
          ...acc.handlers,
          ...this.createHandlers(seed)
        }
      };
    }, {});
  }

  createUserHandlers(state) {
    let userHandlers = {};
    const { withHandlers } = this.props;
    Object.keys(withHandlers).forEach(key => {
      userHandlers[key] = (...params) => withHandlers[key](state)(...params);
    });
    return userHandlers;
  }

  initState() {
    const state = this.createState();
    return {
      ...state,
      handlers: {
        ...state.handlers,
        ...this.createUserHandlers(state)
      }
    };
  }

  state = this.initState();

  render() {
    const userProps = omit(["seeds", "render", "withHandlers"], this.props);
    return this.props.render({ ...this.state, ...userProps });
  }
}

// helpers

function capFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default Store;
