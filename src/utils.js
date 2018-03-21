export function isObj(thing) {
  return (
    thing === Object(thing) &&
    Object.prototype.toString.call(thing) !== "[object Array]" &&
    typeof thing !== "function"
  );
}

export function omit(blacklisted, data) {
  return Object.keys(data)
    .filter(key => !blacklisted.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});
}

export function cap(string) {
  // capitalize first letter
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function throwError(msg) {
  throw new Error(`react-with-state-props: ${msg}`);
}
