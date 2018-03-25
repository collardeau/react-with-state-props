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

type DeriveStateItem = [string[], Function];
type Render = (props: object) => JSX.Element;

interface Props {
  render: Render;
  withState: StateItem[];
  deriveState: DeriveStateItem[];
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

const reduceStates = R.curry((comp: any, stateDefs: StateItem[]) =>
  R.reduce(
    (acc, { name, init }: StateItem) =>
      R.mergeAll([acc, { [name]: init }, setHandler(comp, name)]),
    {}
  )(stateDefs)
);

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
    R.pipe(reduceStates(this), R.tap(state => this.setState(state)))(
      this.props.withState
    );
  }
  componentDidUpdate(prevProps: object, prevState: State) {
    const { deriveState } = this.props;
    if (!deriveState) return;
    const dState = reduceDeriveState(prevState, this.state, deriveState);
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
