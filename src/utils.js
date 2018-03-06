export function isObj(thing) {
  return (
    thing === Object(thing) &&
    Object.prototype.toString.call(thing) !== "[object Array]" &&
    typeof thing !== "function"
  );
}

export function cap(string) {
  // capitalize first letter
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function throwError(msg) {
  throw new Error(`react-senna: ${msg}`);
}
