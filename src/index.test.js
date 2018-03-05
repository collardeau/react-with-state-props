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
