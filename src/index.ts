import * as React from "react";
import * as PropTypes from "prop-types";
import * as map from "ramda/src/map";
import * as omit from "ramda/src/omit";

// TYPES

type Render = React.StatelessComponent<State>;
type Comp = React.Component;
type HandlerItem = (Props: {}) => (...args: any[]) => {};

interface State {
  [name: string]: any;
}

interface Functions {
  [name: string]: Function;
}

interface DeriveStateItem {
  onStateChange: string[] | string;
  derive: (state: State) => State;
}

interface ContainerProps {
  render: Render;
  state: State;
  deriveState?: DeriveStateItem[];
  withHandlers?: Functions;
  omitProps?: string[];
}

const propTypes = {
  render: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  withHandlers: PropTypes.objectOf(PropTypes.func),
  omitProps: PropTypes.arrayOf(PropTypes.string),
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

const defaultProps = {
  state: {},
  withHandlers: {},
  deriveState: [] as DeriveStateItem[],
  omitProps: [] as string[],
  render: () => {
    warn("Please pass in a render function to your container");
    return null as null;
  }
};

// LOGIC

let watchers: State = {}; // todo: typings

const reduceWatchers = (defs: any[]) =>
  flatten(
    defs
      .map(def => def.onStateChange)
      .map(on => (typeof on === "string" ? [on] : on))
  ).reduce((acc: object, next: string) => ({ ...acc, [next]: true }), {});

const reduceState = (defs: any[], state: State = {}, all: Boolean = false) =>
  defs.reduce((acc, { onStateChange: on, derive }) => {
    if (typeof on === "string") on = [on];
    const shouldUpdate = all || on.some((o: string) => watchers[o]);
    if (shouldUpdate) return { ...acc, ...derive(acc) };
    return acc;
  }, state);

const createSetters = (state: State, updater: Function) => {
  const setters: Functions = {};
  Object.keys(state).forEach(key => {
    setters[`set${cap(key)}`] = (newState: State, cb: () => {}) => {
      updater(
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

export class Container extends React.Component<ContainerProps, {}> {
  static propTypes = propTypes;
  static defaultProps = defaultProps;
  constructor(props: any) {
    super(props);
    const { state, withHandlers, deriveState } = this.props;
    if (!Object.keys(state).length) {
      return warn("Please pass in a state object to your container.");
    }
    watchers = reduceWatchers(deriveState);
    const initialState = {
      ...reduceState(deriveState, state, true),
      ...createSetters(state, (changes: State, cb: () => {}) => {
        this.setState(
          reduceState(deriveState, { ...this.state, ...changes }),
          cb
        );
      }),
      ...createHandlers(this, withHandlers)
    };
    this.state = initialState;
  }
  render() {
    const { render, omitProps } = this.props;
    if (typeof render !== "function") return null;
    const userProps = omit(Object.keys(propTypes), this.props);
    const state = { ...omit(["_loaded"], this.state), ...userProps };
    return render(omitProps.length ? omit(omitProps, state) : state);
  }
}

// HELPERS

const warn = (msg: string) => {
  console.warn(`[react-with-state-props]: ${msg}`);
  return null as null;
};

const flatten = (arr: any[]) =>
  arr.reduce((acc, next) => [...acc, ...next], []);

const cap = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export default Container;
