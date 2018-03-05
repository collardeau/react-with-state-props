import React from "react";
import Senna from "./index";
import renderer from "react-test-renderer";

function renderComp(props = {}) {
  return renderer.create(<Senna {...props} />);
}

function getProps(props) {
  const comp = renderComp(props);
  const tree = comp.toJSON();
  return tree && tree.props;
}

test("without any config", () => {
  expect(getProps()).toMatchSnapshot();
});

test("basic case", () => {
  expect(
    getProps({
      seeds: [{ name: "users" }]
    })
  ).toMatchSnapshot();
});

test("normal case", () => {
  expect(
    getProps({
      seeds: [
        { name: "users", init: {}, loadable: true },
        { name: "isVisible", init: false, toggleable: true }
      ]
    })
  ).toMatchSnapshot();
});

test("toggle example", () => {
  const comp = renderComp({
    seeds: [
      {
        name: "active",
        init: false,
        toggleable: true
      }
    ]
  });
  let tree = comp.toJSON();
  expect(tree.props.active).toBe(false);
  tree.props.handlers.toggleActive();
  tree = comp.toJSON();
  expect(tree.props.active).toBe(true);
  expect(tree.props).toMatchSnapshot();
});

test("counter example", () => {
  const comp = renderComp({
    seeds: [
      {
        name: "count",
        init: 0,
        resetable: true,
        handlers: {
          incr: st => st + 1
        }
      }
    ]
  });
  let tree = comp.toJSON();
  expect(tree.props.count).toBe(0);
  tree.props.handlers.incrCount();
  tree = comp.toJSON();
  expect(tree.props.count).toBe(1);
  expect(tree.props).toMatchSnapshot();
  tree.props.handlers.resetCount();
  tree = comp.toJSON();
  expect(tree.props.count).toBe(0);
});

test("withHandlers example", () => {
  const comp = renderComp({
    seeds: [
      {
        name: "countA",
        init: 0
      },
      {
        name: "countB",
        init: 0
      }
    ],
    withHandlers: {
      setAll: props => num => {
        props.handlers.setCountA(num);
        props.handlers.setCountB(num);
      }
    }
  });
  let tree = comp.toJSON();
  expect(tree.props).toMatchSnapshot();
  tree.props.handlers.setAll(10);
  tree = comp.toJSON();
  expect(tree.props.countA).toBe(10);
  expect(tree.props.countB).toBe(10);
});
