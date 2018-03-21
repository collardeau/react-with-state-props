import React from "react";
import { Store } from "./index";
import renderer from "react-test-renderer";

function renderComp(props = {}) {
  return renderer.create(<Store {...props} />);
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
        withState: [{ name: "users" }]
      })
    ).toMatchSnapshot();
  });

  test("normal case", () => {
    expect(
      getProps({
        withState: [
          { name: "users", initialState: {}, loadable: true },
          { name: "isVisible", initialState: false, toggleable: true }
        ]
      })
    ).toMatchSnapshot();
  });
});

describe("setState callback", () => {
  test("with setable", () => {
    const spy = jest.fn();
    const comp = renderComp({
      withState: [
        {
          name: "users",
          setable: true
        }
      ]
    });
    let tree = comp.toJSON();
    tree.props.actions.setUsers({}, spy);
    expect(spy).toBeCalled();
  });
  test("with resetable", () => {
    const spy = jest.fn();
    const comp = renderComp({
      withState: [
        {
          name: "users",
          resetable: true
        }
      ]
    });
    const tree = comp.toJSON();
    tree.props.actions.resetUsers(spy);
    expect(spy).toBeCalled();
  });
  test("with mergeable", () => {
    const spy = jest.fn();
    const comp = renderComp({
      withState: [
        {
          name: "users",
          initialState: [],
          mergeable: true
        }
      ]
    });
    const tree = comp.toJSON();
    tree.props.actions.mergeUsers(["user"], spy);
    expect(spy).toBeCalled();
  });

  test("with toggleable", () => {
    const spy = jest.fn();
    const comp = renderComp({
      withState: [
        {
          name: "active",
          toggleable: true
        }
      ]
    });
    const tree = comp.toJSON();
    tree.props.actions.toggleActive(spy);
    expect(spy).toBeCalled();
  });
});

describe("loaded Flag", () => {
  test("with set", () => {
    const comp = renderComp({
      withState: [
        {
          name: "users",
          initialState: {},
          loadable: true
        }
      ]
    });
    let tree = comp.toJSON();
    expect(tree.props.usersLoaded).toBe(false);
    tree.props.actions.setUsers({ uid: "some-uid" });
    tree = comp.toJSON();
    expect(tree.props.usersLoaded).toBe(true);
  });
  test("with toggle", () => {
    const comp = renderComp({
      withState: [
        {
          name: "isLoggedIn",
          initialState: false,
          loadable: true,
          toggleable: true
        }
      ]
    });
    let tree = comp.toJSON();
    expect(tree.props.isLoggedInLoaded).toBe(false);
    tree.props.actions.toggleIsLoggedIn();
    tree = comp.toJSON();
    expect(tree.props.isLoggedInLoaded).toBe(true);
  });
  test("with merge", () => {
    const comp = renderComp({
      withState: [
        {
          name: "users",
          initialState: {},
          loadable: true,
          mergeable: true
        }
      ]
    });
    let tree = comp.toJSON();
    expect(tree.props.usersLoaded).toBe(false);
    tree.props.actions.mergeUsers({ some: "users" });
    tree = comp.toJSON();
    expect(tree.props.usersLoaded).toBe(true);
  });
});

describe("mergeable", () => {
  test("with objects", () => {
    const comp = renderComp({
      withState: [
        {
          name: "users",
          initialState: {},
          mergeable: true
        }
      ]
    });
    let tree = comp.toJSON();
    tree.props.actions.setUsers({ a: "a" });
    tree.props.actions.mergeUsers({ b: "b" });
    tree = comp.toJSON();
    expect(tree.props.users.a).toBe("a");
    expect(tree.props.users.b).toBe("b");
  });

  test("with arrays", () => {
    const comp = renderComp({
      withState: [
        {
          name: "users",
          initialState: [],
          mergeable: true
        }
      ]
    });
    let tree = comp.toJSON();
    tree.props.actions.setUsers(["a"]);
    tree.props.actions.mergeUsers(["b"]);
    tree = comp.toJSON();
    expect(tree.props.users[0]).toBe("a");
    expect(tree.props.users[1]).toBe("b");
  });
});
describe("Errors", () => {
  test("mergeable with num for initial state", () => {
    const spy = jest.fn();
    const comp = renderComp({
      withState: [
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
      withState: [
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
      withState: [
        {
          name: "users",
          initialState: {},
          mergeable: true
        }
      ],
      _onError: spy
    });
    const tree = comp.toJSON();
    tree.props.actions.setUsers(0);
    expect(spy).toBeCalled();
  });
  test("set a mergeable state to a string", () => {
    const spy = jest.fn();
    const comp = renderComp({
      withState: [
        {
          name: "users",
          initialState: {},
          mergeable: true
        }
      ],
      _onError: spy
    });
    const tree = comp.toJSON();
    tree.props.actions.setUsers("hi");
    expect(spy).toBeCalled();
  });
  test("mergeable and toggleable", () => {
    const spy = jest.fn();
    const comp = renderComp({
      withState: [
        {
          name: "users",
          initialState: {},
          mergeable: true,
          toggleable: true
        }
      ],
      _onError: spy
    });
    expect(spy).toBeCalled();
  });
});

describe("compoundActions Prop", () => {
  test("use updated props", () => {
    const comp = renderComp({
      withState: [
        {
          name: "countA",
          initialState: 0
        }
      ],
      compoundActions: {
        addOne: props => num => {
          props.actions.setCountA(props.countA + 1);
        }
      }
    });
    let tree = comp.toJSON();
    tree.props.actions.addOne();
    tree = comp.toJSON();
    expect(tree.props.countA).toBe(1);
    tree.props.actions.addOne();
    tree = comp.toJSON();
    expect(tree.props.countA).toBe(2);
  });
});

describe("omitActions Prop", () => {
  test("omit case with toggeable", () => {
    const comp = renderComp({
      withState: [
        {
          name: "active",
          initialState: false,
          toggeable: true
        }
      ],
      omitActions: ["setActive"]
    });

    let tree = comp.toJSON();
    expect(tree.props.actions.setActive).toBe(undefined);
  });
  test("omit case using compoundActions", () => {
    const comp = renderComp({
      withState: [
        {
          name: "countA",
          initialState: 0
        },
        {
          name: "countB",
          initialState: 0
        }
      ],
      compoundActions: {
        resetAll: props => () => {
          props.actions.setCountA(0);
          props.actions.setCountB(0);
        }
      },
      omitActions: ["setCountA", "setCountB"]
    });

    let tree = comp.toJSON();
    tree = comp.toJSON();
    expect(tree.props.actions.resetAll).toBeDefined();
    expect(tree.props.actions.setCountA).toBe(undefined);
    expect(tree.props.actions.setCountB).toBe(undefined);
  });
});

describe("flatten", () => {
  test("typical flatten actions case", () => {
    const comp = renderComp({
      withState: [
        {
          name: "todos",
          initialState: []
        }
      ],
      flatten: true
    });
    let tree = comp.toJSON();
    expect(tree.props.setTodos).toBeDefined();
    expect(tree.props.actions).toBeUndefined();
  });
});

describe("Use cases", () => {
  test("toggle example using toggeable", () => {
    const comp = renderComp({
      withState: [
        {
          name: "active",
          initialState: false,
          toggleable: true
        }
      ]
    });
    let tree = comp.toJSON();
    expect(tree.props.active).toBe(false);
    tree.props.actions.toggleActive();
    tree = comp.toJSON();
    expect(tree.props.active).toBe(true);
    tree.props.actions.toggleActive();
    tree = comp.toJSON();
    expect(tree.props.active).toBe(false);
  });

  test("counter example using resetable and compound actions", () => {
    const comp = renderComp({
      withState: [
        {
          name: "count",
          initialState: 0,
          resetable: true,
          // incr: st => st + 1
          createActions: {
            incr: st => st + 1
          }
          // createActions: [
          //   {
          //     name: "incrCount",
          //     action: st => st + 1
          //   }
          // ]
        }
      ]
    });
    let tree = comp.toJSON();
    expect(tree.props.count).toBe(0);
    tree.props.actions.incrCount();
    tree = comp.toJSON();
    expect(tree.props.count).toBe(1);
    tree.props.actions.incrCount();
    tree = comp.toJSON();
    expect(tree.props.count).toBe(2);
    tree.props.actions.resetCount();
    tree = comp.toJSON();
    expect(tree.props.count).toBe(0);
  });

  test("using compound actions", () => {
    const comp = renderComp({
      withState: [
        {
          name: "countA",
          initialState: 0
        },
        {
          name: "countB",
          initialState: 0
        }
      ],
      compoundActions: {
        setAll: props => num => {
          props.actions.setCountA(num);
          props.actions.setCountB(num);
        }
      }
    });
    let tree = comp.toJSON();
    tree.props.actions.setAll(10);
    tree = comp.toJSON();
    expect(tree.props.countA).toBe(10);
    expect(tree.props.countB).toBe(10);
  });
});
