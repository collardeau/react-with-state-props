import * as React from "react";
import * as PropTypes from "prop-types";
import * as map from "ramda/src/map";
import * as omit from "ramda/src/omit";

// TYPES

type Render = React.StatelessComponent<State>;
type Comp = React.Component;
type HandlerItem = (Props: {}) => (...args: any[]) => {};

interface State {
  // react state
  [name: string]: any;
}

interface Functions {
  [name: string]: Function;
}

interface DeriveStateItem {
  onStateChange: string[] | string;
  derive: (state: State) => State;
}

interface Props {
  render: Render;
  state: State;
  deriveState: DeriveStateItem[];
  withHandlers: Functions;
}

// FUNCTIONS

const stateHasChanged = (list: string[], prevState: State, state: State) =>
  Array.isArray(list) &&
  list.reduce(
    (bool, next: string) => bool || prevState[next] !== state[next],
    false
  );

const reduceDerivedState = (
  prevState: State,
  state: State,
  deriveState: DeriveStateItem[] = []
) =>
  deriveState.reduce((acc, { onStateChange, derive }) => {
    if (typeof onStateChange === "string") onStateChange = [onStateChange];
    if (!stateHasChanged(onStateChange, prevState, state)) return acc;
    return derive({ ...state, ...acc });
  }, {});

const createSetters = (comp: Comp, state: State = {}) => {
  const setters: Functions = {};
  Object.keys(state).forEach(key => {
    setters[`set${cap(key)}`] = (newState: State, cb: () => {}) => {
      comp.setState(
        {
          [key]: newState
        },
        cb
      );
    };
  });
  return setters;
};

const createHandlers = (comp: Comp, withHandlers: Functions = {}) =>
  map(fn => (...args: any[]) => fn(comp.state)(...args), withHandlers);

// REACT

const propTypes = {
  render: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  // todo: custom propType to check withHandlers functions return functions
  withHandlers: PropTypes.objectOf(PropTypes.func),
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

export default class Container extends React.Component<Props, {}> {
  state = {};
  static propTypes = propTypes;
  componentDidMount() {
    const { state, withHandlers } = this.props;
    const setters = createSetters(this, state);
    const handlers = createHandlers(this, withHandlers);
    this.setState({ ...state, ...setters, ...handlers });
  }
  componentDidUpdate(prevProps: object, prevState: State) {
    const derivedState = reduceDerivedState(
      prevState,
      this.state,
      this.props.deriveState
    );
    if (Object.keys(derivedState).length) {
      this.setState(derivedState);
    }
  }
  render() {
    const userProps = omit(Object.keys(propTypes))(this.props);
    return this.props.render({ ...this.state, ...userProps });
  }
}

// HELPERS

const cap = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);
