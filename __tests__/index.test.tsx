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

test("create state", () => {
  const withState = [
    {
      name: "counter",
      init: 0
    },
    {
      name: "loaded",
      init: false
    }
  ];
  const comp = renderComp({ withState });
  let tree = comp.toJSON();
  expect(tree.props.loaded).toBe(false);
  expect(tree.props.counter).toBe(0);
});

test("creates setState handler", () => {
  const withState = [
    {
      name: "counter",
      init: 0
    }
  ];
  const comp = renderComp({ withState });
  let tree = comp.toJSON();
  console.log(tree.props);
  expect(tree.props.counter).toBe(0);
  tree.props.setCounter(10);
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(10);
  // check setState callback
  const spy = jest.fn();
  tree.props.setCounter(20, spy);
  tree = comp.toJSON();
  expect(tree.props.counter).toBe(20);
  expect(spy).toBeCalled();
});

test("derive state", () => {
  const withState = [
    {
      name: "counter",
      init: 0
    }
  ];
  const deriveState = [
    [
      ["counter"],
      state => ({
        started: state.counter > 0,
        isMoreThan9: state.counter > 9
      })
    ],
    [
      ["started"],
      state => ({
        notStarted: !state.started
      })
    ]
  ];

  const comp = renderComp({ withState, deriveState });
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

test("derive state from 2 listeners", () => {
  const withState = [
    {
      name: "numA",
      init: 1
    },
    {
      name: "numB",
      init: 1
    }
  ];
  const deriveState = [
    [
      ["numA", "numB"],
      state => ({
        sum: state.numA + state.numB
      })
    ]
  ];

  const comp = renderComp({ withState, deriveState });
  let tree = comp.toJSON();
  expect(tree.props.sum).toBe(2);
  tree.props.setNumA(2);
  tree = comp.toJSON();
  expect(tree.props.sum).toBe(3);
  tree.props.setNumB(2);
  tree = comp.toJSON();
  expect(tree.props.sum).toBe(4);
});

test("with handlers", () => {
  const withState = [
    {
      name: "counter",
      init: 0
    }
  ];
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
  const comp = renderComp({ withState, withHandlers });
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
