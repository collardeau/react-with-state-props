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

test("create some state", () => {
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

test("create some simple actions", () => {
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
  expect(tree.props.setCounter).toBeDefined();
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
