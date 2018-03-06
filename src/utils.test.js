import { isObj } from "./utils";

test("isObject", () => {
  expect(isObj({})).toBe(true);
  expect(isObj({ a: "thing" })).toBe(true);
  expect(isObj([])).toBe(false);
  expect(isObj(0)).toBe(false);
  expect(isObj(1)).toBe(false);
  expect(isObj("hi")).toBe(false);
  expect(isObj(() => {})).toBe(false);
  expect(isObj(null)).toBe(false);
  expect(isObj(undefined)).toBe(false);
});
