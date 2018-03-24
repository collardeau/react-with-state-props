import * as React from "react";
import * as PropTypes from "prop-types";
import * as R from "ramda";

// types

interface State {
  [name: string]: any;
}

interface StateDef {
  name: string;
  init: State;
}

interface Props {
  render: (props: object) => JSX.Element;
  withState: StateDef[];
}

// functions

const noop = () => {};
const cap = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

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

const reduceStates = R.curry((comp: any, stateDefs: StateDef[]) =>
  R.reduce(
    (acc, { name, init }: StateDef) =>
      R.mergeAll([acc, { [name]: init }, setHandler(comp, name)]),
    {}
  )(stateDefs)
);

// React

export default class Container extends React.Component<Props, {}> {
  state = {};
  componentWillMount() {
    R.pipe(reduceStates(this), R.tap(state => this.setState(state)))(
      this.props.withState
    );
  }
  render() {
    return this.props.render({ ...this.state });
  }
}
