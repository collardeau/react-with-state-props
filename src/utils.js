export function isObj(thing) {
  return (
    thing === Object(thing) &&
    Object.prototype.toString.call(thing) !== "[object Array]" &&
    typeof thing !== "function"
  );
}

export function omit(blacklisted, obj) {
  return Object.keys(obj)
    .filter(key => blacklisted.indexOf(key) < 0)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {});
}

export function cap(string) {
  // capitalize first letter
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function throwError(msg) {
  throw new Error(`react-senna: ${msg}`);
}
