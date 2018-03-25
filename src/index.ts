import * as React from "react";
import * as PropTypes from "prop-types";
import * as R from "ramda";

// TYPES

interface State {
  [name: string]: any;
}

interface StateItem {
  name: string;
  init: State;
}

type HandlerItem = (Props: {}) => (...args: any[]) => {};
type DeriveStateItem = [string[], Function];

type Render = (props: object) => JSX.Element;

interface Props {
  render: Render;
  withState: StateItem[];
  deriveState: DeriveStateItem[];
  withHandlers: HandlerItem[];
}

// FUNCTIONS

const setHandler = (comp: any, name: string) => ({
  [`set${cap(name)}`]: (val: State, cb: Function = noop) => {
    comp.setState(
      {
        [name]: val
      },
      cb
    );
  }
});

const reduceStates = (comp: any, stateDefs: StateItem[]) =>
  R.reduce(
    (acc, { name, init }: StateItem) =>
      R.mergeAll([acc, { [name]: init }, setHandler(comp, name)]),
    {}
  )(stateDefs);

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
    withState: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        init: PropTypes.any.isRequired
      })
    ).isRequired,
    deriveState: PropTypes.array
  };
  // static defaultProps = {
  //   deriveState: []
  // };
  componentDidMount() {
    const { withState, withHandlers } = this.props;
    const state = reduceStates(this, this.props.withState || []);
    const handlers = R.map(
      fn => (...args: any[]) => fn(this.state)(...args),
      withHandlers || {}
    );
    this.setState({ ...state, ...handlers });
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
