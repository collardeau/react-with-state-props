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

describe("Props Handling", () => {
  test("no props given", () => {
    expect(getProps()).toMatchSnapshot();
  });

  test("passes user props", () => {
    expect(getProps({ a: "thing" }).a).toBe("thing");
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
          { name: "users", initialState: {}, loadable: true },
          { name: "isVisible", initialState: false, toggleable: true }
        ]
      })
    ).toMatchSnapshot();
  });
});

describe("Flags", () => {
  test("loaded flag", () => {
    const comp = renderComp({
      seeds: [
        {
          name: "users",
          initialState: {},
          loadable: true
        }
      ]
    });
    let tree = comp.toJSON();
    expect(tree.props).toMatchSnapshot();
    expect(tree.props.usersLoaded).toBe(false);
    tree.props.handlers.setUsers({ uid: "some-uid" });
    tree = comp.toJSON();
    expect(tree.props.usersLoaded).toBe(true);
  });

  test("mergeable with objects", () => {
    const comp = renderComp({
      seeds: [
        {
          name: "users",
          initialState: {},
          mergeable: true
        }
      ]
    });
    let tree = comp.toJSON();
    tree.props.handlers.setUsers({ a: "a" });
    tree.props.handlers.mergeUsers({ b: "b" });
    tree = comp.toJSON();
    expect(tree.props.users.a).toBe("a");
    expect(tree.props.users.b).toBe("b");
  });

  test("mergeable with arrays", () => {
    const comp = renderComp({
      seeds: [
        {
          name: "users",
          initialState: [],
          mergeable: true
        }
      ]
    });
    let tree = comp.toJSON();
    tree.props.handlers.setUsers(["a"]);
    tree.props.handlers.mergeUsers(["b"]);
    tree = comp.toJSON();
    expect(tree.props.users[0]).toBe("a");
    expect(tree.props.users[1]).toBe("b");
  });
});
describe("Errors", () => {
  test("mergeable with num for initial state", () => {
    const spy = jest.fn();
    const comp = renderComp({
      seeds: [
        {
          name: "x",
          initialState: 0,
          mergeable: true
        }
      ],
      _onError: spy
    });
    expect(spy).toBeCalled();
  });
  test("mergeable with string for initial state", () => {
    const spy = jest.fn();
    const comp = renderComp({
      seeds: [
        {
          name: "users",
          initialState: "hi",
          mergeable: true
        }
      ],
      _onError: spy
    });
    expect(spy).toBeCalled();
  });
  test("set a mergeable state to a num", () => {
    const spy = jest.fn();
    const comp = renderComp({
      seeds: [
        {
          name: "users",
          initialState: {},
          mergeable: true
        }
      ],
      _onError: spy
    });
    const tree = comp.toJSON();
    tree.props.handlers.setUsers(0);
    expect(spy).toBeCalled();
  });
  test("set a mergeable state to a string", () => {
    const spy = jest.fn();
    const comp = renderComp({
      seeds: [
        {
          name: "users",
          initialState: {},
          mergeable: true
        }
      ],
      _onError: spy
    });
    const tree = comp.toJSON();
    tree.props.handlers.setUsers("hi");
    expect(spy).toBeCalled();
  });
});

describe("Use cases", () => {
  test("toggle example using toggeable", () => {
    const comp = renderComp({
      seeds: [
        {
          name: "active",
          initialState: false,
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
    tree.props.handlers.toggleActive();
    tree = comp.toJSON();
    expect(tree.props.active).toBe(false);
  });

  test("counter example using resetable and custom handlers", () => {
    const comp = renderComp({
      seeds: [
        {
          name: "count",
          initialState: 0,
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

  test("using compound handlers", () => {
    const comp = renderComp({
      seeds: [
        {
          name: "countA",
          initialState: 0
        },
        {
          name: "countB",
          initialState: 0
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
});
