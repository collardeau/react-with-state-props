import * as React from "react";
import * as renderer from "react-test-renderer";
import Container from "../src/index";

function renderComp(props) {
  return renderer.create(
    <Container {...props} render={renderProps => <div {...renderProps} />} />
  );
}

function getProps(props) {
  const comp = renderComp(props);
  const tree = comp.toJSON();
  return tree && tree.props;
}

test("creates state", () => {
  const state = {
    counter: 0,
    loaded: false
  };
  const comp = renderComp({ state });
  let tree = comp.toJSON();
  expect(tree.props.loaded).toBe(false);
  expect(tree.props.counter).toBe(0);
});

test("creates setState handler", () => {
  const state = { counter: 0 };
  const comp = renderComp({ state });
  let tree = comp.toJSON();
  expect(tree.props.counter).toBe(0);
  expect(tree.props.setCounter).toBeDefined();
  tree.props.setCounter(10);
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(10);
  // // check setState callback
  const spy = jest.fn();
  tree.props.setCounter(20, spy);
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(20);
  expect(spy).toBeCalled();
});

test("derives state", () => {
  const state = {
    counter: 0
  };
  const deriveState = [
    {
      onStateChange: ["counter"],
      derive: state => ({
        started: state.counter > 0,
        isMoreThan9: state.counter > 9
      })
    },
    {
      onStateChange: ["started"],
      derive: state => ({
        notStarted: !state.started
      })
    }
  ];
  const comp = renderComp({ state, deriveState });
  let tree = comp.toJSON();
  expect(tree.props.counter).toBe(0);
  expect(tree.props.started).toBe(false);
  expect(tree.props.notStarted).toBe(true);
  tree.props.setCounter(10);
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(10);
  expect(tree.props.started).toBe(true);
  expect(tree.props.isMoreThan9).toBe(true);
  expect(tree.props.notStarted).toBe(false);
});

test("derives state from 2 listeners", () => {
  const state = {
    numA: 1,
    numB: 1
  };
  const deriveState = [
    {
      onStateChange: ["numA", "numB"],
      derive: ({ numA, numB }) => ({
        sum: numA + numB
      })
    }
  ];
  const comp = renderComp({ state, deriveState });
  let tree = comp.toJSON();
  expect(tree.props.sum).toBe(2);
  tree.props.setNumA(2);
  tree = comp.toJSON();
  expect(tree.props.sum).toBe(3);
  tree.props.setNumB(2);
  tree = comp.toJSON();
  expect(tree.props.sum).toBe(4);
});

test("creates handlers", () => {
  const state = {
    counter: 0
  };
  const withHandlers = {
    add: ({ setCounter, counter }) => num => {
      setCounter(num + counter);
    },
    add10: ({ add }) => () => {
      add(10);
    },
    reset: ({ setCounter }) => () => {
      setCounter(0);
    }
  };
  const comp = renderComp({ state, withHandlers });
  let tree = comp.toJSON();
  expect(tree.props.add).toBeDefined();
  expect(tree.props.add10).toBeDefined();
  expect(tree.props.reset).toBeDefined();
  tree.props.add(10);
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(10);
  tree.props.add(20);
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(30);
  tree.props.add10();
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(40);
  tree.props.reset();
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(0);
});

test("passes user props", () => {
  const comp = renderComp({
    state: { counter: 0 },
    deriveState: [],
    withHandlers: {},
    myProp: "thing"
  });
  let tree = comp.toJSON();
  expect(tree.props.state).toBeUndefined();
  expect(tree.props.deriveState).toBeUndefined();
  expect(tree.props.withHandlers).toBeUndefined();
  expect(tree.props.myProp).toBeDefined();
});

describe("propTypes", () => {
  test("handles bad props", () => {
    // console.error = jest.fn();
    // const spy = jest
    //   .spyOn(global.console, "error")
    //   .mockImplementation(() => {});
    // expect(spy).toHaveBeenCalledTimes(0);
    // renderComp({}); // no props at all
    // expect(spy).toHaveBeenCalledTimes(1);
    // expect(spy).toHaveBeenCalledTimes(2);
    // expect(console.error).toHaveBeenCalledTimes(0);
    // renderComp({ state: {} }); // no props at all
    // expect(console.error).toHaveBeenCalledTimes(1);
  });
});
