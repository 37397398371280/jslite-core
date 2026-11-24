const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;
const slice = Array.prototype.slice;

export const version = "1.1.2";

export const era = {
  detect() {
    const caps = {
      es3: true,
      es5: typeof Object.defineProperty === "function" && typeof Array.isArray === "function",
      es6: typeof Symbol === "function" && typeof Promise === "function" && typeof Map === "function",
      es2016: typeof Array.prototype.includes === "function",
      es2017: typeof Object.entries === "function" && typeof String.prototype.padStart === "function",
      es2018: typeof Promise.prototype.finally === "function",
      es2019: typeof Array.prototype.flat === "function" && typeof Object.fromEntries === "function",
      es2020: typeof BigInt === "function" && typeof globalThis === "object",
      es2021: typeof String.prototype.replaceAll === "function" && typeof Promise.any === "function",
      es2022: typeof Array.prototype.at === "function" && typeof Object.hasOwn === "function",
      es2023: typeof Array.prototype.findLast === "function" && typeof Array.prototype.toSorted === "function",
      es2024: typeof Object.groupBy === "function" && typeof Promise.withResolvers === "function",
      es2025: typeof Set.prototype.union === "function" && typeof RegExp.escape === "function",
      es2026: typeof Math.sumPrecise === "function" || typeof Temporal === "object"
    };
    let highest = "ES3";
    const order = [
      ["ES5", caps.es5],
      ["ES6", caps.es6],
      ["ES2016", caps.es2016],
      ["ES2017", caps.es2017],
      ["ES2018", caps.es2018],
      ["ES2019", caps.es2019],
      ["ES2020", caps.es2020],
      ["ES2021", caps.es2021],
      ["ES2022", caps.es2022],
      ["ES2023", caps.es2023],
      ["ES2024", caps.es2024],
      ["ES2025", caps.es2025],
      ["ES2026", caps.es2026]
    ];
    for (let i = 0; i < order.length; i++) {
      if (order[i][1]) highest = order[i][0];
    }
    return { highest, capabilities: caps };
  },
  isAtLeast(yearOrVer) {
    const info = era.detect().capabilities;
    let key = String(yearOrVer).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (key === "es2015") key = "es6";
    return Boolean(info[key]);
  }
};

export function typeOf(val) {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  const t = typeof val;
  if (t === "object" || t === "function") {
    const tag = toStr.call(val);
    if (tag === "[object Array]") return "array";
    if (tag === "[object Date]") return "date";
    if (tag === "[object RegExp]") return "regexp";
    if (tag === "[object Number]") return "number";
    if (tag === "[object String]") return "string";
    if (tag === "[object Boolean]") return "boolean";
    if (tag === "[object Function]") return "function";
    if (tag === "[object Error]") return "error";
    if (tag === "[object Map]") return "map";
    if (tag === "[object Set]") return "set";
    if (tag === "[object WeakMap]") return "weakmap";
    if (tag === "[object WeakSet]") return "weakset";
    if (tag === "[object Promise]") return "promise";
  }
  return t;
}

export function isNil(v) { return v === null || v === undefined; }
export function isObj(v) { return v !== null && (typeof v === "object" || typeof v === "function"); }
export function isPlainObj(v) {
  if (!v || typeOf(v) !== "object") return false;
  const proto = Object.getPrototypeOf ? Object.getPrototypeOf(v) : v.constructor && v.constructor.prototype;
  return !proto || proto === Object.prototype;
}
export function isFn(v) { return typeof v === "function"; }
export function isArr(v) { return Array.isArray ? Array.isArray(v) : toStr.call(v) === "[object Array]"; }
export function isNum(v) { return typeof v === "number" && !Number.isNaN(v) && Number.isFinite(v); }
export function isStr(v) { return typeof v === "string"; }
export function isBool(v) { return v === true || v === false; }
export function isEmpty(v) {
  if (isNil(v)) return true;
  if (isStr(v) || isArr(v)) return v.length === 0;
  if (typeof Set === "function" && v instanceof Set) return v.size === 0;
  if (typeof Map === "function" && v instanceof Map) return v.size === 0;
  if (isObj(v)) {
    for (const k in v) {
      if (hasOwn.call(v, k)) return false;
    }
    return true;
  }
  return false;
}

function indexOfRef(list, target) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === target) return i;
  }
  return -1;
}

export function each(collection, iteratee) {
  if (isNil(collection)) return collection;
  if (isArr(collection) || isStr(collection) || (collection && isNum(collection.length))) {
    for (let i = 0, len = collection.length; i < len; i++) {
      if (iteratee(collection[i], i, collection) === false) break;
    }
  } else if (typeof Map === "function" && collection instanceof Map) {
    collection.forEach((val, k) => { iteratee(val, k, collection); });
  } else if (typeof Set === "function" && collection instanceof Set) {
    let idx = 0;
    collection.forEach((val) => { iteratee(val, idx++, collection); });
  } else if (isObj(collection)) {
    for (const key in collection) {
      if (hasOwn.call(collection, key)) {
        if (iteratee(collection[key], key, collection) === false) break;
      }
    }
  }
  return collection;
}

export function map(collection, iteratee) {
  const fn = isFn(iteratee) ? iteratee : (item) => (isNil(item) ? undefined : item[iteratee]);
  const out = [];
  each(collection, (val, key, col) => { out.push(fn(val, key, col)); });
  return out;
}

export function filter(collection, predicate) {
  const out = [];
  each(collection, (val, key, col) => { if (predicate(val, key, col)) out.push(val); });
  return out;
}

export function reject(collection, predicate) {
  return filter(collection, (val, key, col) => !predicate(val, key, col));
}

export function reduce(collection, reducer, initial) {
  const hasInit = arguments.length >= 3 && initial !== undefined;
  let acc = hasInit ? initial : undefined;
  let started = hasInit;
  each(collection, (val, key, col) => {
    if (!started) { acc = val; started = true; }
    else { acc = reducer(acc, val, key, col); }
  });
  return acc;
}

export function find(collection, predicate) {
  let found;
  each(collection, (val, key, col) => {
    if (predicate(val, key, col)) { found = val; return false; }
  });
  return found;
}

export function findLast(arr, predicate) {
  if (!isArr(arr)) return undefined;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) return arr[i];
  }
  return undefined;
}

export function some(collection, predicate) {
  let matched = false;
  each(collection, (val, key, col) => {
    if (predicate(val, key, col)) { matched = true; return false; }
  });
  return matched;
}

export function every(collection, predicate) {
  let all = true;
  each(collection, (val, key, col) => {
    if (!predicate(val, key, col)) { all = false; return false; }
  });
  return all;
}

export function includes(arr, item, fromIndex) {
  if (!isArr(arr)) return false;
  const start = fromIndex ? (fromIndex < 0 ? Math.max(0, arr.length + fromIndex) : fromIndex) : 0;
  for (let i = start; i < arr.length; i++) {
    if (arr[i] === item || (typeof arr[i] === "number" && typeof item === "number" && Number.isNaN(arr[i]) && Number.isNaN(item))) {
      return true;
    }
  }
  return false;
}

export function at(arrOrStr, index) {
  if (isNil(arrOrStr) || (!isArr(arrOrStr) && !isStr(arrOrStr))) return undefined;
  const idx = index < 0 ? arrOrStr.length + index : index;
  if (idx < 0 || idx >= arrOrStr.length) return undefined;
  return isStr(arrOrStr) ? arrOrStr.charAt(idx) : arrOrStr[idx];
}

export function flatten(arr, depth = 1) {
  const walk = (list, d) => {
    let out = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (isArr(item) && d > 0) out = out.concat(walk(item, d - 1));
      else out.push(item);
    }
    return out;
  };
  return walk(arr || [], depth);
}

export function flatMap(arr, fn) { return flatten(map(arr, fn), 1); }

export function chunk(arr, size) {
  const n = Math.max(1, size || 1);
  const out = [];
  for (let i = 0; i < (arr || []).length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export function compact(arr) { return filter(arr || [], (x) => Boolean(x)); }

export function unique(arr, keyFn) {
  const fn = isFn(keyFn) ? keyFn : (x) => x;
  const seen = [];
  const out = [];
  each(arr || [], (item) => {
    const k = fn(item);
    if (!includes(seen, k)) { seen.push(k); out.push(item); }
  });
  return out;
}

export function groupBy(arr, keyOrFn) {
  const fn = isFn(keyOrFn) ? keyOrFn : (item) => (isNil(item) ? "undefined" : item[keyOrFn]);
  const out = {};
  each(arr || [], (item) => {
    const k = String(fn(item));
    if (!hasOwn.call(out, k)) out[k] = [];
    out[k].push(item);
  });
  return out;
}

export function countBy(arr, keyOrFn) {
  const fn = isFn(keyOrFn) ? keyOrFn : (item) => (isNil(item) ? "undefined" : item[keyOrFn]);
  const out = {};
  each(arr || [], (item) => {
    const k = String(fn(item));
    out[k] = (hasOwn.call(out, k) ? out[k] : 0) + 1;
  });
  return out;
}

export function keyBy(arr, keyOrFn) {
  const fn = isFn(keyOrFn) ? keyOrFn : (item) => (isNil(item) ? "undefined" : item[keyOrFn]);
  const out = {};
  each(arr || [], (item) => { out[String(fn(item))] = item; });
  return out;
}

export function sortBy(arr, keyOrFn, descending) {
  const fn = isFn(keyOrFn) ? keyOrFn : (item) => (isNil(item) ? "" : item[keyOrFn]);
  const dir = descending ? -1 : 1;
  const copy = (arr || []).slice(0);
  copy.sort((a, b) => {
    const va = fn(a);
    const vb = fn(b);
    if (va === vb) return 0;
    return va > vb ? 1 * dir : -1 * dir;
  });
  return copy;
}

export function zip(...arrays) {
  let maxLen = 0;
  for (let i = 0; i < arrays.length; i++) {
    if (isArr(arrays[i]) && arrays[i].length > maxLen) maxLen = arrays[i].length;
  }
  const out = [];
  for (let i = 0; i < maxLen; i++) {
    const row = [];
    for (let j = 0; j < arrays.length; j++) row.push(isArr(arrays[j]) ? arrays[j][i] : undefined);
    out.push(row);
  }
  return out;
}

export function range(start, end, step) {
  const s = isNum(end) ? start : 0;
  const e = isNum(end) ? end : start;
  const st = isNum(step) && step !== 0 ? step : (s <= e ? 1 : -1);
  const out = [];
  let cur = s;
  if (st > 0) { while (cur < e) { out.push(cur); cur += st; } }
  else { while (cur > e) { out.push(cur); cur += st; } }
  return out;
}

export const setOps = {
  toArray(s) {
    if (isArr(s)) return unique(s);
    const out = [];
    if (typeof Set === "function" && s instanceof Set) s.forEach((v) => { out.push(v); });
    return out;
  },
  union(a, b) { return unique(setOps.toArray(a).concat(setOps.toArray(b))); },
  intersection(a, b) {
    const arrB = setOps.toArray(b);
    return filter(setOps.toArray(a), (x) => includes(arrB, x));
  },
  difference(a, b) {
    const arrB = setOps.toArray(b);
    return filter(setOps.toArray(a), (x) => !includes(arrB, x));
  },
  symmetricDifference(a, b) { return setOps.union(setOps.difference(a, b), setOps.difference(b, a)); },
  isSubsetOf(a, b) {
    const arrB = setOps.toArray(b);
    return every(setOps.toArray(a), (x) => includes(arrB, x));
  },
  isSupersetOf(a, b) { return setOps.isSubsetOf(b, a); },
  isDisjointFrom(a, b) {
    const arrB = setOps.toArray(b);
    return !some(setOps.toArray(a), (x) => includes(arrB, x));
  }
};

export function get(obj, path, fallback) {
  if (!isObj(obj) || !isStr(path)) return fallback;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const k = parts[i];
    if (!k) continue;
    if (isNil(cur) || !isObj(cur) || !(k in cur)) return fallback;
    cur = cur[k];
  }
  return cur === undefined ? fallback : cur;
}

export function set(obj, path, value) {
  if (!isObj(obj) || !isStr(path)) return obj;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const k = parts[i];
    if (!k) continue;
    if (i === parts.length - 1) cur[k] = value;
    else {
      const nextK = parts[i + 1];
      if (!isObj(cur[k])) cur[k] = /^\d+$/.test(nextK) ? [] : {};
      cur = cur[k];
    }
  }
  return obj;
}

export function keysOf(obj) {
  if (!isObj(obj)) return [];
  if (Object.keys) return Object.keys(obj);
  const out = [];
  for (const k in obj) if (hasOwn.call(obj, k)) out.push(k);
  return out;
}

export function valuesOf(obj) { return map(keysOf(obj), (k) => obj[k]); }
export function entriesOf(obj) { return map(keysOf(obj), (k) => [k, obj[k]]); }
export function fromEntries(entries) {
  const out = {};
  each(entries || [], (pair) => {
    if (isArr(pair) && pair.length >= 2) out[String(pair[0])] = pair[1];
  });
  return out;
}

export function pick(obj, keys) {
  const out = {};
  each(keys || [], (k) => { if (isObj(obj) && hasOwn.call(obj, k)) out[k] = obj[k]; });
  return out;
}

export function omit(obj, keys) {
  const out = {};
  each(keysOf(obj), (k) => { if (!includes(keys || [], k)) out[k] = obj[k]; });
  return out;
}

function cloneWithSeen(val, deep, seenSources, seenClones) {
  if (!isObj(val)) return val;
  const existingIdx = indexOfRef(seenSources, val);
  if (existingIdx !== -1) return seenClones[existingIdx];

  if (val instanceof Date) return new Date(val.getTime());
  if (val instanceof RegExp) {
    return new RegExp(val.source, (val.global ? "g" : "") + (val.ignoreCase ? "i" : "") + (val.multiline ? "m" : ""));
  }
  if (isArr(val)) {
    const arrCopy = [];
    seenSources.push(val);
    seenClones.push(arrCopy);
    for (let i = 0; i < val.length; i++) {
      arrCopy.push(deep ? cloneWithSeen(val[i], true, seenSources, seenClones) : val[i]);
    }
    return arrCopy;
  }

  const objCopy = {};
  seenSources.push(val);
  seenClones.push(objCopy);
  const ks = keysOf(val);
  for (let j = 0; j < ks.length; j++) {
    const k = ks[j];
    objCopy[k] = deep ? cloneWithSeen(val[k], true, seenSources, seenClones) : val[k];
  }
  return objCopy;
}

export function clone(val, deep) {
  return cloneWithSeen(val, Boolean(deep), [], []);
}

export function merge(...sources) {
  const target = {};
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    if (!isObj(src)) continue;
    for (const k in src) {
      if (!hasOwn.call(src, k)) continue;
      if (isPlainObj(src[k]) && isPlainObj(target[k])) target[k] = merge(target[k], src[k]);
      else target[k] = clone(src[k], true);
    }
  }
  return target;
}

function equalWithSeen(a, b, seenA, seenB) {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b)) return true;
  if (isNil(a) || isNil(b) || typeof a !== typeof b) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();

  if (isArr(a) && isArr(b)) {
    if (a.length !== b.length) return false;
    const idxA = indexOfRef(seenA, a);
    const idxB = indexOfRef(seenB, b);
    if (idxA !== -1 || idxB !== -1) return idxA === idxB && seenB[idxA] === b;
    seenA.push(a);
    seenB.push(b);
    for (let i = 0; i < a.length; i++) {
      if (!equalWithSeen(a[i], b[i], seenA, seenB)) return false;
    }
    return true;
  }

  if (isObj(a) && isObj(b)) {
    const ka = keysOf(a);
    const kb = keysOf(b);
    if (ka.length !== kb.length) return false;
    const pIdxA = indexOfRef(seenA, a);
    const pIdxB = indexOfRef(seenB, b);
    if (pIdxA !== -1 || pIdxB !== -1) return pIdxA === pIdxB && seenB[pIdxA] === b;
    seenA.push(a);
    seenB.push(b);
    for (let j = 0; j < ka.length; j++) {
      const key = ka[j];
      if (!hasOwn.call(b, key) || !equalWithSeen(a[key], b[key], seenA, seenB)) return false;
    }
    return true;
  }

  return false;
}

export function equal(a, b) {
  return equalWithSeen(a, b, [], []);
}

export function trim(str) {
  if (isNil(str)) return "";
  const s = String(str);
  return s.trim ? s.trim() : s.replace(/^\s+|\s+$/g, "");
}

export function padStart(str, targetLength, padString = " ") {
  const s = String(isNil(str) ? "" : str);
  const pad = isNil(padString) || padString === "" ? " " : String(padString);
  if (s.length >= targetLength) return s;
  const needed = targetLength - s.length;
  let filler = "";
  while (filler.length < needed) filler += pad;
  return filler.slice(0, needed) + s;
}

export function padEnd(str, targetLength, padString = " ") {
  const s = String(isNil(str) ? "" : str);
  const pad = isNil(padString) || padString === "" ? " " : String(padString);
  if (s.length >= targetLength) return s;
  const needed = targetLength - s.length;
  let filler = "";
  while (filler.length < needed) filler += pad;
  return s + filler.slice(0, needed);
}

export function replaceAll(str, search, replacement) {
  const s = String(isNil(str) ? "" : str);
  const sub = String(search);
  const rep = isFn(replacement) ? replacement : String(replacement);
  if (sub === "") {
    if (isFn(rep)) {
      const chars = s.split("");
      const outChars = [];
      for (let idx = 0; idx <= chars.length; idx++) {
        outChars.push(rep("", idx, s));
        if (idx < chars.length) outChars.push(chars[idx]);
      }
      return outChars.join("");
    }
    return rep + s.split("").join(rep) + rep;
  }
  if (isFn(rep)) {
    return s.split(sub).reduce((acc, part, i, arr) => {
      if (i === arr.length - 1) return acc + part;
      return acc + part + rep(sub, acc.length + part.length, s);
    }, "");
  }
  return s.split(sub).join(rep);
}

export function escapeRegex(str) {
  const s = String(isNil(str) ? "" : str);
  if (typeof RegExp !== "undefined" && isFn(RegExp.escape)) return RegExp.escape(s);
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function camelCase(str) {
  const clean = trim(String(isNil(str) ? "" : str))
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^A-Za-z0-9]+/g, " ");
  const parts = clean.split(/\s+/);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i].toLowerCase();
    if (!w) continue;
    if (!out) out = w;
    else out += w.charAt(0).toUpperCase() + w.slice(1);
  }
  return out;
}

export function kebabCase(str) {
  return trim(String(isNil(str) ? "" : str))
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function snakeCase(str) { return replaceAll(kebabCase(str), "-", "_"); }
export function capitalize(str) {
  const s = String(isNil(str) ? "" : str);
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

export function template(str, data) {
  const s = String(isNil(str) ? "" : str);
  return s.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, path) => {
    const val = get(data || {}, path);
    return isNil(val) ? "" : String(val);
  });
}

export const query = {
  parse(qs) {
    const raw = trim(String(isNil(qs) ? "" : qs)).replace(/^\?/, "");
    const out = {};
    if (!raw) return out;
    const pairs = raw.split("&");
    for (let i = 0; i < pairs.length; i++) {
      if (!pairs[i]) continue;
      const eqIdx = pairs[i].indexOf("=");
      const k = decodeURIComponent((eqIdx >= 0 ? pairs[i].slice(0, eqIdx) : pairs[i]).replace(/\+/g, " "));
      const v = decodeURIComponent((eqIdx >= 0 ? pairs[i].slice(eqIdx + 1) : "").replace(/\+/g, " "));
      if (hasOwn.call(out, k)) {
        if (!isArr(out[k])) out[k] = [out[k]];
        out[k].push(v);
      } else { out[k] = v; }
    }
    return out;
  },
  stringify(obj) {
    const parts = [];
    each(keysOf(obj || {}), (k) => {
      const val = obj[k];
      if (isNil(val)) return;
      if (isArr(val)) {
        each(val, (item) => {
          if (!isNil(item)) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(item))}`);
        });
      } else {
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(val))}`);
      }
    });
    return parts.join("&");
  }
};

export function clamp(num, min, max) { return num < min ? min : (num > max ? max : num); }

export function sumPrecise(values) {
  if (typeof Math !== "undefined" && isFn(Math.sumPrecise)) return Math.sumPrecise(values);
  let sum = 0;
  let comp = 0;
  for (let i = 0; i < (values || []).length; i++) {
    const y = Number(values[i]) - comp;
    const t = sum + y;
    comp = (t - sum) - y;
    sum = t;
  }
  return sum;
}

export function roundTo(num, decimals = 0) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

export function randomInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export function once(fn) {
  let called = false;
  let result;
  return function () {
    if (!called) { called = true; result = fn.apply(this, arguments); }
    return result;
  };
}

export function memoize(fn, resolver) {
  const cache = {};
  return function () {
    const args = slice.call(arguments);
    const key = isFn(resolver) ? String(resolver.apply(this, args)) : JSON.stringify(args);
    if (hasOwn.call(cache, key)) return cache[key];
    cache[key] = fn.apply(this, args);
    return cache[key];
  };
}

export function pipe(...fns) {
  return (initial) => reduce(fns, (acc, fn) => fn(acc), initial);
}

export function compose(...fns) {
  const reversed = fns.slice().reverse();
  return (initial) => reduce(reversed, (acc, fn) => fn(acc), initial);
}

export function debounce(fn, wait = 200) {
  const ms = isNum(wait) ? wait : 200;
  let timer = null;
  return function () {
    const ctx = this;
    const args = slice.call(arguments);
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; fn.apply(ctx, args); }, ms);
  };
}

export function throttle(fn, limit = 200) {
  const ms = isNum(limit) ? limit : 200;
  let busy = false;
  let queuedArgs = null;
  let queuedCtx = null;
  return function () {
    const ctx = this;
    const args = slice.call(arguments);
    if (!busy) {
      busy = true;
      fn.apply(ctx, args);
      setTimeout(() => {
        busy = false;
        if (queuedArgs !== null) {
          const a = queuedArgs;
          const c = queuedCtx;
          queuedArgs = null;
          queuedCtx = null;
          fn.apply(c, a);
        }
      }, ms);
    } else { queuedArgs = args; queuedCtx = ctx; }
  };
}

export function uid(prefix = "lite") {
  const pfx = isStr(prefix) && prefix ? prefix : "lite";
  return `${pfx}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36).slice(-4)}`;
}

function hasPromise() { return typeof Promise === "function" && isFn(Promise.resolve); }

export function withResolvers() {
  if (hasPromise() && isFn(Promise.withResolvers)) return Promise.withResolvers();
  let resolveFn;
  let rejectFn;
  const promise = hasPromise() ? new Promise((res, rej) => { resolveFn = res; rejectFn = rej; }) : null;
  return { promise, resolve: resolveFn, reject: rejectFn };
}

export function sleep(ms, cb) {
  if (hasPromise()) {
    return new Promise((resolve) => {
      setTimeout(() => { if (isFn(cb)) cb(); resolve(ms); }, ms);
    });
  }
  setTimeout(() => { if (isFn(cb)) cb(); }, ms);
  return undefined;
}

export function retry(fn, opts, cb) {
  const options = opts || {};
  const retries = isNum(options.retries) ? options.retries : 3;
  const delay = isNum(options.delay) ? options.delay : 200;
  const factor = isNum(options.backoff) ? options.backoff : 2;

  if (!hasPromise()) {
    let attempt = 0;
    const runSync = () => {
      try {
        const res = fn(attempt);
        if (isFn(cb)) cb(null, res);
        return res;
      } catch (err) {
        if (attempt < retries) { attempt++; return runSync(); }
        if (isFn(cb)) cb(err);
        throw err;
      }
    };
    return runSync();
  }

  return new Promise((resolve, reject) => {
    const step = (attempt) => {
      let p;
      try { p = Promise.resolve(fn(attempt)); }
      catch (syncErr) { p = Promise.reject(syncErr); }
      p.then(
        (val) => resolve(val),
        (err) => {
          if (attempt < retries) {
            const waitMs = delay * Math.pow(factor, attempt);
            setTimeout(() => step(attempt + 1), waitMs);
          } else { reject(err); }
        }
      );
    };
    step(0);
  });
}

const memStore = {};
export const storage = {
  get(key, fallback) {
    const defVal = arguments.length >= 2 ? fallback : null;
    try {
      if (typeof localStorage !== "undefined" && localStorage) {
        const raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) return defVal;
        return typeof JSON !== "undefined" && JSON.parse ? JSON.parse(raw) : raw;
      }
    } catch (e) {}
    return hasOwn.call(memStore, key) ? clone(memStore[key], true) : defVal;
  },
  set(key, value) {
    try {
      if (typeof localStorage !== "undefined" && localStorage) {
        const payload = typeof JSON !== "undefined" && JSON.stringify ? JSON.stringify(value) : String(value);
        localStorage.setItem(key, payload);
        return true;
      }
    } catch (e) {}
    memStore[key] = clone(value, true);
    return true;
  },
  remove(key) {
    try {
      if (typeof localStorage !== "undefined" && localStorage) localStorage.removeItem(key);
    } catch (e) {}
    if (hasOwn.call(memStore, key)) {
      try { delete memStore[key]; } catch (e2) { memStore[key] = undefined; }
    }
  }
};

function hasDoc() {
  return typeof document !== "undefined" && document && isFn(document.createElement);
}

function dollar(selector, scope) {
  if (!isStr(selector)) return null;
  const rootEl = isObj(scope) && isFn(scope.querySelector) ? scope : (hasDoc() && isFn(document.querySelector) ? document : null);
  if (!rootEl) return null;
  try { return rootEl.querySelector(selector); } catch (e) { return null; }
}

function dollarAll(selector, scope) {
  if (!isStr(selector)) return [];
  const rootEl = isObj(scope) && isFn(scope.querySelectorAll) ? scope : (hasDoc() && isFn(document.querySelectorAll) ? document : null);
  if (!rootEl) return [];
  try {
    const list = rootEl.querySelectorAll(selector);
    const out = [];
    for (let i = 0; i < list.length; i++) out.push(list[i]);
    return out;
  } catch (e) { return []; }
}

function on(target, eventName, handler, opts) {
  if (!target || !isStr(eventName) || !isFn(handler)) return () => {};
  if (isFn(target.addEventListener)) {
    target.addEventListener(eventName, handler, opts || false);
    return () => target.removeEventListener(eventName, handler, opts || false);
  }
  if (isFn(target.attachEvent)) {
    const legacyName = `on${eventName}`;
    const wrapper = () => {
      const ev = typeof window !== "undefined" && window.event ? window.event : {};
      if (!ev.target) ev.target = ev.srcElement;
      return handler.call(target, ev);
    };
    target.attachEvent(legacyName, wrapper);
    return () => target.detachEvent(legacyName, wrapper);
  }
  return () => {};
}

function create(tagName, attrs, children) {
  if (!hasDoc() || !isStr(tagName)) return null;
  const el = document.createElement(tagName);
  if (isObj(attrs)) {
    each(keysOf(attrs), (k) => {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class" || k === "className") {
        el.className = isArr(v) ? v.join(" ") : String(v);
      } else if (k === "text") {
        el.appendChild(document.createTextNode(String(v)));
      } else if (k === "html") {
        el.innerHTML = String(v);
      } else if (k === "style" && isObj(v)) {
        each(keysOf(v), (sk) => {
          try { el.style[sk] = String(v[sk]); } catch (e) {}
        });
      } else if (k.indexOf("on") === 0 && isFn(v)) {
        on(el, k.slice(2).toLowerCase(), v);
      } else if (v === true) {
        el.setAttribute(k, "");
      } else {
        el.setAttribute(k, String(v));
      }
    });
  }
  if (children !== undefined && children !== null) {
    const childList = isArr(children) ? children : [children];
    each(childList, (ch) => {
      if (ch === null || ch === undefined || ch === false) return;
      if (isStr(ch) || isNum(ch) || isBool(ch)) {
        el.appendChild(document.createTextNode(String(ch)));
      } else if (isObj(ch) && ch.nodeType) {
        el.appendChild(ch);
      }
    });
  }
  return el;
}

function copyTextFallback(str) {
  if (!hasDoc() || !document.body) return false;
  const ta = document.createElement("textarea");
  ta.value = str;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  let selected = false;
  try {
    ta.select();
    if (isFn(ta.setSelectionRange)) ta.setSelectionRange(0, str.length);
    if (isFn(document.execCommand)) selected = Boolean(document.execCommand("copy"));
  } catch (e) {
    selected = false;
  }
  try { document.body.removeChild(ta); } catch (e2) {}
  return selected;
}

function copyText(text) {
  const str = String(isNil(text) ? "" : text);
  if (typeof navigator !== "undefined" && navigator && navigator.clipboard && isFn(navigator.clipboard.writeText) && hasPromise()) {
    return navigator.clipboard.writeText(str).then(() => true, () => copyTextFallback(str));
  }
  const ok = copyTextFallback(str);
  return hasPromise() ? Promise.resolve(ok) : ok;
}

export const dom = {
  $: dollar,
  $$: dollarAll,
  on,
  create,
  copyText
};

function toDate(input) {
  if (input instanceof Date) return new Date(input.getTime());
  if (isNum(input)) return new Date(input);
  if (isStr(input)) {
    const parsed = Date.parse(input);
    return Number.isNaN(parsed) ? new Date(NaN) : new Date(parsed);
  }
  return new Date();
}

export const date = {
  now() { return Date.now(); },
  isValid(input) {
    const d = input instanceof Date ? input : toDate(input);
    const t = d.getTime();
    return typeof t === "number" && !Number.isNaN(t) && Number.isFinite(t);
  },
  format(input, pattern = "YYYY-MM-DD", useUtc = false) {
    const d = toDate(input);
    if (!date.isValid(d)) return "";
    const fmt = isStr(pattern) && pattern ? pattern : "YYYY-MM-DD";
    const year = useUtc ? d.getUTCFullYear() : d.getFullYear();
    const month = (useUtc ? d.getUTCMonth() : d.getMonth()) + 1;
    const day = useUtc ? d.getUTCDate() : d.getDate();
    const hours = useUtc ? d.getUTCHours() : d.getHours();
    const mins = useUtc ? d.getUTCMinutes() : d.getMinutes();
    const secs = useUtc ? d.getUTCSeconds() : d.getSeconds();
    const ms = useUtc ? d.getUTCMilliseconds() : d.getMilliseconds();

    const tokens = {
      YYYY: padStart(Math.abs(year), 4, "0"),
      YY: padStart(Math.abs(year) % 100, 2, "0"),
      MM: padStart(month, 2, "0"),
      M: String(month),
      DD: padStart(day, 2, "0"),
      D: String(day),
      HH: padStart(hours, 2, "0"),
      H: String(hours),
      mm: padStart(mins, 2, "0"),
      m: String(mins),
      ss: padStart(secs, 2, "0"),
      s: String(secs),
      SSS: padStart(ms, 3, "0")
    };

    return fmt.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|SSS/g, (tok) => (hasOwn.call(tokens, tok) ? tokens[tok] : tok));
  },
  addDays(input, days) {
    const d = toDate(input);
    if (!date.isValid(d)) return new Date(NaN);
    const n = isNum(days) ? days : 0;
    return new Date(d.getTime() + n * 86400000);
  },
  diffDays(startInput, endInput) {
    const a = toDate(startInput);
    const b = toDate(endInput);
    if (!date.isValid(a) || !date.isValid(b)) return NaN;
    return (b.getTime() - a.getTime()) / 86400000;
  },
  startOfDay(input, useUtc = false) {
    const d = toDate(input);
    if (!date.isValid(d)) return new Date(NaN);
    if (useUtc) return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }
};

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function utf8Encode(str) {
  const s = String(isNil(str) ? "" : str);
  const out = [];
  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < s.length) {
      const next = s.charCodeAt(i + 1);
      if (next >= 0xDC00 && next <= 0xDFFF) {
        code = 0x10000 + ((code - 0xD800) << 10) + (next - 0xDC00);
        i++;
      }
    }
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
    } else if (code < 0x10000) {
      out.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
    } else {
      out.push(
        0xF0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3F),
        0x80 | ((code >> 6) & 0x3F),
        0x80 | (code & 0x3F)
      );
    }
  }
  return out;
}

export function utf8Decode(bytes) {
  const list = isArr(bytes) ? bytes : [];
  let out = "";
  let i = 0;
  while (i < list.length) {
    const b1 = list[i++] & 0xFF;
    if (b1 < 0x80) {
      out += String.fromCharCode(b1);
    } else if (b1 >= 0xC0 && b1 < 0xE0 && i < list.length) {
      const b2 = list[i++] & 0x3F;
      out += String.fromCharCode(((b1 & 0x1F) << 6) | b2);
    } else if (b1 >= 0xE0 && b1 < 0xF0 && i + 1 < list.length) {
      const b2 = list[i++] & 0x3F;
      const b3 = list[i++] & 0x3F;
      out += String.fromCharCode(((b1 & 0x0F) << 12) | (b2 << 6) | b3);
    } else if (b1 >= 0xF0 && i + 2 < list.length) {
      const b2 = list[i++] & 0x3F;
      const b3 = list[i++] & 0x3F;
      const b4 = list[i++] & 0x3F;
      const cp = (((b1 & 0x07) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000;
      out += String.fromCharCode(0xD800 + ((cp >> 10) & 0x3FF), 0xDC00 + (cp & 0x3FF));
    } else {
      out += String.fromCharCode(b1);
    }
  }
  return out;
}

function bytesToBase64(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i] & 0xFF;
    const b2 = i + 1 < bytes.length ? bytes[i + 1] & 0xFF : NaN;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] & 0xFF : NaN;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 0x03) << 4) | (Number.isNaN(b2) ? 0 : (b2 >> 4));
    const enc3 = Number.isNaN(b2) ? 64 : (((b2 & 0x0F) << 2) | (Number.isNaN(b3) ? 0 : (b3 >> 6)));
    const enc4 = Number.isNaN(b3) ? 64 : (b3 & 0x3F);

    out += B64_CHARS.charAt(enc1) + B64_CHARS.charAt(enc2);
    out += enc3 === 64 ? "=" : B64_CHARS.charAt(enc3);
    out += enc4 === 64 ? "=" : B64_CHARS.charAt(enc4);
  }
  return out;
}

function base64ToBytes(b64) {
  const clean = String(isNil(b64) ? "" : b64).replace(/[^A-Za-z0-9+/=]/g, "");
  const out = [];
  let i = 0;
  while (i < clean.length) {
    const c1 = clean.charAt(i++);
    const c2 = i < clean.length ? clean.charAt(i++) : "=";
    const c3 = i < clean.length ? clean.charAt(i++) : "=";
    const c4 = i < clean.length ? clean.charAt(i++) : "=";

    const e1 = B64_CHARS.indexOf(c1);
    const e2 = B64_CHARS.indexOf(c2);
    const e3 = c3 === "=" ? 64 : B64_CHARS.indexOf(c3);
    const e4 = c4 === "=" ? 64 : B64_CHARS.indexOf(c4);

    if (e1 < 0 || e2 < 0 || (c3 !== "=" && e3 < 0) || (c4 !== "=" && e4 < 0)) break;

    out.push(((e1 << 2) | (e2 >> 4)) & 0xFF);
    if (e3 !== 64) out.push((((e2 & 0x0F) << 4) | (e3 >> 2)) & 0xFF);
    if (e4 !== 64) out.push((((e3 & 0x03) << 6) | e4) & 0xFF);
  }
  return out;
}

function bytesToHex(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i] & 0xFF;
    out += (b < 16 ? "0" : "") + b.toString(16);
  }
  return out;
}

function hexToBytes(hex) {
  const clean = trim(String(isNil(hex) ? "" : hex)).replace(/^0x/i, "");
  const out = [];
  for (let i = 0; i < clean.length; i += 2) {
    if (i + 1 >= clean.length) break;
    const val = parseInt(clean.slice(i, i + 2), 16);
    if (Number.isNaN(val)) break;
    out.push(val & 0xFF);
  }
  return out;
}

export const encoding = {
  utf8Encode,
  utf8Decode,
  base64Encode(str) { return bytesToBase64(utf8Encode(str)); },
  base64Decode(b64) { return utf8Decode(base64ToBytes(b64)); },
  base64EncodeBytes: bytesToBase64,
  base64DecodeBytes: base64ToBytes,
  hexEncode(str) { return bytesToHex(utf8Encode(str)); },
  hexDecode(hex) { return utf8Decode(hexToBytes(hex)); },
  hexEncodeBytes: bytesToHex,
  hexDecodeBytes: hexToBytes
};

const JS_KEYWORDS = new Set([
  "break", "case", "catch", "class", "const", "continue",
  "debugger", "default", "delete", "do", "else", "enum",
  "export", "extends", "false", "finally", "for", "function",
  "if", "import", "in", "instanceof", "let", "new",
  "null", "return", "super", "switch", "this", "throw",
  "true", "try", "typeof", "var", "void", "while", "with",
  "yield", "await", "async"
]);

function isIdentStart(ch) {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_" || ch === "$";
}

function isIdentPart(ch) {
  return isIdentStart(ch) || (ch >= "0" && ch <= "9");
}

function makeShortName(index) {
  const first = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
  const rest = `${first}0123456789`;
  let n = index;
  let name = first.charAt(n % first.length);
  n = Math.floor(n / first.length);
  while (n > 0) {
    n--;
    name += rest.charAt(n % rest.length);
    n = Math.floor(n / rest.length);
  }
  return name;
}

function tokenizeJsForCompress(src) {
  const tokens = [];
  let i = 0;
  const len = src.length;
  let lastMeaningful = "";

  while (i < len) {
    const ch = src.charAt(i);
    const next = i + 1 < len ? src.charAt(i + 1) : "";

    if (ch === "/" && next === "/") {
      i += 2;
      while (i < len && src.charAt(i) !== "\n" && src.charAt(i) !== "\r") i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      i += 2;
      while (i < len && !(src.charAt(i) === "*" && i + 1 < len && src.charAt(i + 1) === "/")) i++;
      i += 2;
      tokens.push({ type: "ws", value: " " });
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      const start = i;
      i++;
      while (i < len) {
        const qch = src.charAt(i);
        if (qch === "\\") {
          i += 2;
          continue;
        }
        i++;
        if (qch === quote) break;
      }
      const lit = src.slice(start, i);
      tokens.push({ type: "string", value: lit });
      lastMeaningful = lit;
      continue;
    }

    if (ch === "/" && next !== "/" && next !== "*") {
      const canBeRegex = !lastMeaningful ||
        /[=(![{?:;,~&|^+-<>/*%]$/.test(lastMeaningful) ||
        lastMeaningful === "return" || lastMeaningful === "case" ||
        lastMeaningful === "throw" || lastMeaningful === "typeof" ||
        lastMeaningful === "void" || lastMeaningful === "delete" ||
        lastMeaningful === "in" || lastMeaningful === "instanceof" ||
        lastMeaningful === "new" || lastMeaningful === "of";
      if (canBeRegex) {
        const rStart = i;
        i++;
        let inClass = false;
        while (i < len) {
          const rch = src.charAt(i);
          if (rch === "\\") {
            i += 2;
            continue;
          }
          if (rch === "[") inClass = true;
          else if (rch === "]") inClass = false;
          else if (rch === "/" && !inClass) {
            i++;
            while (i < len && isIdentPart(src.charAt(i))) i++;
            break;
          }
          i++;
        }
        const rx = src.slice(rStart, i);
        tokens.push({ type: "regex", value: rx });
        lastMeaningful = rx;
        continue;
      }
    }

    if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
      let hasNewline = false;
      while (i < len && (src.charAt(i) === " " || src.charAt(i) === "\t" || src.charAt(i) === "\r" || src.charAt(i) === "\n")) {
        if (src.charAt(i) === "\n" || src.charAt(i) === "\r") hasNewline = true;
        i++;
      }
      tokens.push({ type: "ws", value: hasNewline ? "\n" : " " });
      continue;
    }

    if (isIdentStart(ch)) {
      const idStart = i;
      i++;
      while (i < len && isIdentPart(src.charAt(i))) i++;
      const word = src.slice(idStart, i);
      const kind = JS_KEYWORDS.has(word) ? "keyword" : "ident";
      tokens.push({ type: kind, value: word });
      lastMeaningful = word;
      continue;
    }

    const three = i + 2 < len ? src.slice(i, i + 3) : "";
    const two = i + 1 < len ? src.slice(i, i + 2) : "";
    let op = ch;
    if (three === "===" || three === "!==" || three === ">>>" || three === "<<=" || three === ">>=") {
      op = three;
      i += 3;
    } else if (
      two === "==" || two === "!=" || two === "<=" || two === ">=" ||
      two === "&&" || two === "||" || two === "??" || two === "++" ||
      two === "--" || two === "+=" || two === "-=" || two === "*=" ||
      two === "/=" || two === "%=" || two === "**" || two === "=>" ||
      two === "?." || two === "<<" || two === ">>"
    ) {
      op = two;
      i += 2;
    } else {
      i += 1;
    }
    tokens.push({ type: "punct", value: op });
    lastMeaningful = op;
  }

  return tokens;
}

function needsSpaceBetween(prev, curr) {
  if (!prev || !curr) return false;
  const pIsWord = prev.type === "ident" || prev.type === "keyword";
  const cIsWord = curr.type === "ident" || curr.type === "keyword";
  const pIsNum = prev.type === "number";
  const cIsNum = curr.type === "number";

  if ((pIsWord || pIsNum) && (cIsWord || cIsNum)) return true;
  if (prev.value === "+" && curr.value.indexOf("+") === 0) return true;
  if (prev.value === "-" && curr.value.indexOf("-") === 0) return true;
  if (prev.value === "/" && curr.type === "regex") return true;
  return false;
}

export function compress(code, opts = {}) {
  const source = String(isNil(code) ? "" : code);
  const shouldMangle = opts.mangle !== false;
  const tokens = tokenizeJsForCompress(source);

  const declCounts = {};
  if (shouldMangle) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "keyword" && (tokens[i].value === "var" || tokens[i].value === "let" || tokens[i].value === "const")) {
        let j = i + 1;
        while (j < tokens.length) {
          if (tokens[j].type === "ws") { j++; continue; }
          if (tokens[j].type === "ident") {
            const varName = tokens[j].value;
            declCounts[varName] = (hasOwn.call(declCounts, varName) ? declCounts[varName] : 0) + 1;
          }
          if (tokens[j].value === ";" || tokens[j].value === "\n") break;
          j++;
        }
      }
    }
  }

  const reservedNames = new Set();
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "ident" && !hasOwn.call(declCounts, tokens[i].value)) {
      reservedNames.add(tokens[i].value);
    }
  }

  const renameMap = {};
  let nextShortIdx = 0;
  if (shouldMangle) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "ident") {
        const name = tokens[i].value;
        if (hasOwn.call(declCounts, name) && !hasOwn.call(renameMap, name)) {
          let candidate;
          do {
            candidate = makeShortName(nextShortIdx++);
          } while (JS_KEYWORDS.has(candidate) || reservedNames.has(candidate) || hasOwn.call(renameMap, candidate));
          renameMap[name] = candidate.length < name.length ? candidate : name;
        }
      }
    }
  }

  const compacted = tokens.map((tk) => {
    if (tk.type === "ident" && hasOwn.call(renameMap, tk.value)) {
      return { type: "ident", value: renameMap[tk.value] };
    }
    if (/^\d+(\.\d+)?([eE][+-]?\d+)?$/.test(tk.value) && tk.type === "ident") {
      return { type: "number", value: tk.value };
    }
    return tk;
  });

  let out = "";
  let lastOutToken = null;
  let pendingNewline = false;

  for (let i = 0; i < compacted.length; i++) {
    const cur = compacted[i];
    if (cur.type === "ws") {
      if (cur.value === "\n") pendingNewline = true;
      continue;
    }

    if (pendingNewline && lastOutToken) {
      const canDropNewline =
        /[{([=+\-*/%&|^?:;,~<>!]$/.test(lastOutToken.value) ||
        /^[})\]=+\-*/%&|^?:;,~<>!]/.test(cur.value) ||
        cur.value === "else";
      if (!canDropNewline && needsSpaceBetween(lastOutToken, cur)) {
        out += "\n";
      }
    } else if (needsSpaceBetween(lastOutToken, cur)) {
      out += " ";
    }

    out += cur.value;
    lastOutToken = cur;
    pendingNewline = false;
  }

  out = trim(out);

  const originalBytes = utf8Encode(source).length;
  const compressedBytes = utf8Encode(out).length;
  const savedBytes = originalBytes - compressedBytes;
  const ratio = originalBytes > 0 ? roundTo((savedBytes / originalBytes) * 100, 2) : 0;

  return {
    code: out,
    originalBytes,
    compressedBytes,
    savedBytes,
    ratio,
    renamed: renameMap
  };
}

export const minify = compress;

const lite = {
  version,
  era,
  typeOf,
  isNil,
  isObj,
  isPlainObj,
  isFn,
  isArr,
  isNum,
  isStr,
  isBool,
  isEmpty,
  each,
  map,
  filter,
  reject,
  reduce,
  find,
  findLast,
  some,
  every,
  includes,
  at,
  flatten,
  flatMap,
  chunk,
  compact,
  unique,
  groupBy,
  countBy,
  keyBy,
  sortBy,
  zip,
  range,
  setOps,
  get,
  set,
  keysOf,
  valuesOf,
  entriesOf,
  fromEntries,
  pick,
  omit,
  clone,
  merge,
  equal,
  trim,
  padStart,
  padEnd,
  replaceAll,
  escapeRegex,
  camelCase,
  kebabCase,
  snakeCase,
  capitalize,
  template,
  query,
  clamp,
  sumPrecise,
  roundTo,
  randomInt,
  once,
  memoize,
  pipe,
  compose,
  debounce,
  throttle,
  uid,
  withResolvers,
  sleep,
  retry,
  storage,
  dom,
  date,
  encoding,
  compress,
  minify
};

export default lite;
