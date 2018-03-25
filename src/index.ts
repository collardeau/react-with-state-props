import * as React from "react";
import * as PropTypes from "prop-types";
import * as R from "ramda";

// TYPES

type HandlerItem = (Props: {}) => (...args: any[]) => {};
type DeriveStateItem = [string[], Function];
type Render = (props: object) => JSX.Element;

interface State {
  [name: string]: any;
}
interface Setters {
  [name: string]: Function;
}
interface Props {
  render: Render;
  state: State;
  deriveState: DeriveStateItem[];
  withHandlers: HandlerItem[];
}

// FUNCTIONS

const reduceDeriveState = (
  prevState: State,
  state: State,
  deriveState: DeriveStateItem[]
) =>
  R.reduce((acc, [on, fn]) => {
    const hasChanged = R.reduce(
      (bool, next: string) => bool || prevState[next] !== state[next],
      false
    )(on);
    if (!hasChanged) return acc;
    return fn({ ...state, ...acc });
  }, {})(deriveState);

// REACT

export default class Container extends React.Component<Props, {}> {
  state = {};
  static propTypes = {
    render: PropTypes.func.isRequired,
    state: PropTypes.object.isRequired,
    deriveState: PropTypes.array
  };

  componentDidMount() {
    const { state, withHandlers } = this.props;
    const setters: Setters = {};
    Object.keys(state).forEach(key => {
      setters[`set${cap(key)}`] = (newState: State, cb: () => {}) => {
        this.setState(
          {
            [key]: newState
          },
          cb
        );
      };
    });
    const handlers = R.map(
      fn => (...args: any[]) => fn(this.state)(...args),
      withHandlers || {}
    );
    this.setState({ ...state, ...setters, ...handlers });
  }
  componentDidUpdate(prevProps: object, prevState: State) {
    const dState = reduceDeriveState(
      prevState,
      this.state,
      this.props.deriveState || []
    );
    Object.keys(dState).length && this.setState(dState);
  }
  render() {
    return this.props.render({ ...this.state });
  }
}

// HELPERS

const noop = () => {};
const cap = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);
