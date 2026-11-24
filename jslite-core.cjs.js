/* jscore-lite v1.0.0 | ES3-to-ES2026 Universal Lite Runtime | Zero Dependencies */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = factory();
  } else {
    root.lite = factory();
  }
}(this, function () {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var toStr = Object.prototype.toString;
  var slice = Array.prototype.slice;

  // --- Era & Capability Detection (ES3 through ES2026) ---
  var era = {
    detect: function () {
      var caps = {
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
      var highest = "ES3";
      var order = [
        ["ES5", caps.es5],
        ["ES6 (ES2015)", caps.es6],
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
      var i;
      for (i = 0; i < order.length; i++) {
        if (order[i][1]) highest = order[i][0];
      }
      return {
        highest: highest,
        capabilities: caps
      };
    },
    isAtLeast: function (yearOrVer) {
      var info = era.detect().capabilities;
      var key = String(yearOrVer).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (key === "es2015") key = "es6";
      return !!info[key];
    }
  };

  // --- Type & Guard Helpers ---
  var typeOf = function (val) {
    if (val === null) return "null";
    if (val === undefined) return "undefined";
    var t = typeof val;
    if (t === "object" || t === "function") {
      var tag = toStr.call(val);
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
  };

  var isNil = function (v) { return v === null || v === undefined; };
  var isObj = function (v) { return v !== null && (typeof v === "object" || typeof v === "function"); };
  var isPlainObj = function (v) {
    if (!v || typeOf(v) !== "object") return false;
    var proto = Object.getPrototypeOf ? Object.getPrototypeOf(v) : v.constructor && v.constructor.prototype;
    return !proto || proto === Object.prototype;
  };
  var isFn = function (v) { return typeof v === "function"; };
  var isArr = function (v) {
    if (Array.isArray) return Array.isArray(v);
    return toStr.call(v) === "[object Array]";
  };
  var isNum = function (v) { return typeof v === "number" && !isNaN(v) && isFinite(v); };
  var isStr = function (v) { return typeof v === "string"; };
  var isBool = function (v) { return v === true || v === false; };
  var isEmpty = function (v) {
    if (isNil(v)) return true;
    if (isStr(v) || isArr(v)) return v.length === 0;
    if (typeof Set === "function" && v instanceof Set) return v.size === 0;
    if (typeof Map === "function" && v instanceof Map) return v.size === 0;
    if (isObj(v)) {
      var k;
      for (k in v) {
        if (hasOwn.call(v, k)) return false;
      }
      return true;
    }
    return false;
  };

  // --- Iteration & Collection Helpers ---
  var each = function (collection, iteratee) {
    if (isNil(collection)) return collection;
    var i, len, key;
    if (isArr(collection) || isStr(collection) || (collection && isNum(collection.length))) {
      for (i = 0, len = collection.length; i < len; i++) {
        if (iteratee(collection[i], i, collection) === false) break;
      }
    } else if (typeof Map === "function" && collection instanceof Map) {
      collection.forEach(function (val, k) {
        iteratee(val, k, collection);
      });
    } else if (typeof Set === "function" && collection instanceof Set) {
      var idx = 0;
      collection.forEach(function (val) {
        iteratee(val, idx++, collection);
      });
    } else if (isObj(collection)) {
      for (key in collection) {
        if (hasOwn.call(collection, key)) {
          if (iteratee(collection[key], key, collection) === false) break;
        }
      }
    }
    return collection;
  };

  var map = function (collection, iteratee) {
    var fn = isFn(iteratee) ? iteratee : function (item) { return isNil(item) ? undefined : item[iteratee]; };
    var out = [];
    each(collection, function (val, key, col) {
      out.push(fn(val, key, col));
    });
    return out;
  };

  var filter = function (collection, predicate) {
    var out = [];
    each(collection, function (val, key, col) {
      if (predicate(val, key, col)) out.push(val);
    });
    return out;
  };

  var reject = function (collection, predicate) {
    return filter(collection, function (val, key, col) { return !predicate(val, key, col); });
  };

  var reduce = function (collection, reducer, initial) {
    var hasInit = arguments.length >= 3 && initial !== undefined;
    var acc = hasInit ? initial : undefined;
    var started = hasInit;
    each(collection, function (val, key, col) {
      if (!started) {
        acc = val;
        started = true;
      } else {
        acc = reducer(acc, val, key, col);
      }
    });
    return acc;
  };

  var find = function (collection, predicate) {
    var found;
    each(collection, function (val, key, col) {
      if (predicate(val, key, col)) {
        found = val;
        return false;
      }
    });
    return found;
  };

  var findLast = function (arr, predicate) {
    if (!isArr(arr)) return undefined;
    var i;
    for (i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i], i, arr)) return arr[i];
    }
    return undefined;
  };

  var some = function (collection, predicate) {
    var matched = false;
    each(collection, function (val, key, col) {
      if (predicate(val, key, col)) {
        matched = true;
        return false;
      }
    });
    return matched;
  };

  var every = function (collection, predicate) {
    var all = true;
    each(collection, function (val, key, col) {
      if (!predicate(val, key, col)) {
        all = false;
        return false;
      }
    });
    return all;
  };

  var includes = function (arr, item, fromIndex) {
    if (!isArr(arr)) return false;
    var start = fromIndex ? (fromIndex < 0 ? Math.max(0, arr.length + fromIndex) : fromIndex) : 0;
    var i;
    for (i = start; i < arr.length; i++) {
      if (arr[i] === item || (typeof arr[i] === "number" && typeof item === "number" && isNaN(arr[i]) && isNaN(item))) {
        return true;
      }
    }
    return false;
  };

  var at = function (arrOrStr, index) {
    if (isNil(arrOrStr) || (!isArr(arrOrStr) && !isStr(arrOrStr))) return undefined;
    var idx = index < 0 ? arrOrStr.length + index : index;
    if (idx < 0 || idx >= arrOrStr.length) return undefined;
    return isStr(arrOrStr) ? arrOrStr.charAt(idx) : arrOrStr[idx];
  };

  var flatten = function (arr, depth) {
    var maxDepth = isNil(depth) ? 1 : depth;
    var walk = function (list, d) {
      var out = [];
      var i, item;
      for (i = 0; i < list.length; i++) {
        item = list[i];
        if (isArr(item) && d > 0) {
          out = out.concat(walk(item, d - 1));
        } else {
          out.push(item);
        }
      }
      return out;
    };
    return walk(arr || [], maxDepth);
  };

  var flatMap = function (arr, fn) {
    return flatten(map(arr, fn), 1);
  };

  var chunk = function (arr, size) {
    var n = Math.max(1, size || 1);
    var out = [];
    var i;
    for (i = 0; i < (arr || []).length; i += n) {
      out.push(arr.slice(i, i + n));
    }
    return out;
  };

  var compact = function (arr) {
    return filter(arr || [], function (x) { return !!x; });
  };

  var unique = function (arr, keyFn) {
    var fn = isFn(keyFn) ? keyFn : function (x) { return x; };
    var seen = [];
    var out = [];
    each(arr || [], function (item) {
      var k = fn(item);
      if (!includes(seen, k)) {
        seen.push(k);
        out.push(item);
      }
    });
    return out;
  };

  var groupBy = function (arr, keyOrFn) {
    var fn = isFn(keyOrFn) ? keyOrFn : function (item) { return isNil(item) ? "undefined" : item[keyOrFn]; };
    var out = {};
    each(arr || [], function (item) {
      var k = String(fn(item));
      if (!hasOwn.call(out, k)) out[k] = [];
      out[k].push(item);
    });
    return out;
  };

  var countBy = function (arr, keyOrFn) {
    var fn = isFn(keyOrFn) ? keyOrFn : function (item) { return isNil(item) ? "undefined" : item[keyOrFn]; };
    var out = {};
    each(arr || [], function (item) {
      var k = String(fn(item));
      out[k] = (hasOwn.call(out, k) ? out[k] : 0) + 1;
    });
    return out;
  };

  var keyBy = function (arr, keyOrFn) {
    var fn = isFn(keyOrFn) ? keyOrFn : function (item) { return isNil(item) ? "undefined" : item[keyOrFn]; };
    var out = {};
    each(arr || [], function (item) {
      out[String(fn(item))] = item;
    });
    return out;
  };

  var sortBy = function (arr, keyOrFn, descending) {
    var fn = isFn(keyOrFn) ? keyOrFn : function (item) { return isNil(item) ? "" : item[keyOrFn]; };
    var dir = descending ? -1 : 1;
    var copy = (arr || []).slice(0);
    copy.sort(function (a, b) {
      var va = fn(a);
      var vb = fn(b);
      if (va === vb) return 0;
      if (va > vb) return 1 * dir;
      return -1 * dir;
    });
    return copy;
  };

  var zip = function () {
    var arrays = slice.call(arguments);
    var maxLen = 0;
    var i, j, row;
    for (i = 0; i < arrays.length; i++) {
      if (isArr(arrays[i]) && arrays[i].length > maxLen) maxLen = arrays[i].length;
    }
    var out = [];
    for (i = 0; i < maxLen; i++) {
      row = [];
      for (j = 0; j < arrays.length; j++) {
        row.push(isArr(arrays[j]) ? arrays[j][i] : undefined);
      }
      out.push(row);
    }
    return out;
  };

  var range = function (start, end, step) {
    var s = isNum(end) ? start : 0;
    var e = isNum(end) ? end : start;
    var st = isNum(step) && step !== 0 ? step : (s <= e ? 1 : -1);
    var out = [];
    var cur = s;
    if (st > 0) {
      while (cur < e) { out.push(cur); cur += st; }
    } else {
      while (cur > e) { out.push(cur); cur += st; }
    }
    return out;
  };

  // --- Set Algebra ---
  var setOps = {
    toArray: function (s) {
      if (isArr(s)) return unique(s);
      var out = [];
      if (typeof Set === "function" && s instanceof Set) {
        s.forEach(function (v) { out.push(v); });
      }
      return out;
    },
    union: function (a, b) {
      return unique(setOps.toArray(a).concat(setOps.toArray(b)));
    },
    intersection: function (a, b) {
      var arrB = setOps.toArray(b);
      return filter(setOps.toArray(a), function (x) { return includes(arrB, x); });
    },
    difference: function (a, b) {
      var arrB = setOps.toArray(b);
      return filter(setOps.toArray(a), function (x) { return !includes(arrB, x); });
    },
    symmetricDifference: function (a, b) {
      return setOps.union(setOps.difference(a, b), setOps.difference(b, a));
    },
    isSubsetOf: function (a, b) {
      var arrB = setOps.toArray(b);
      return every(setOps.toArray(a), function (x) { return includes(arrB, x); });
    },
    isSupersetOf: function (a, b) {
      return setOps.isSubsetOf(b, a);
    },
    isDisjointFrom: function (a, b) {
      var arrB = setOps.toArray(b);
      return !some(setOps.toArray(a), function (x) { return includes(arrB, x); });
    }
  };

  // --- Object, Path & Immutability Helpers ---
  var get = function (obj, path, fallback) {
    if (!isObj(obj) || !isStr(path)) return fallback;
    var normalized = path.replace(/\[(\d+)\]/g, ".$1");
    var parts = normalized.split(".");
    var cur = obj;
    var i, k;
    for (i = 0; i < parts.length; i++) {
      k = parts[i];
      if (!k) continue;
      if (isNil(cur) || !isObj(cur) || !(k in cur)) return fallback;
      cur = cur[k];
    }
    return cur === undefined ? fallback : cur;
  };

  var set = function (obj, path, value) {
    if (!isObj(obj) || !isStr(path)) return obj;
    var normalized = path.replace(/\[(\d+)\]/g, ".$1");
    var parts = normalized.split(".");
    var cur = obj;
    var i, k, nextK, isNextIndex;
    for (i = 0; i < parts.length; i++) {
      k = parts[i];
      if (!k) continue;
      if (i === parts.length - 1) {
        cur[k] = value;
      } else {
        nextK = parts[i + 1];
        isNextIndex = /^\d+$/.test(nextK);
        if (!isObj(cur[k])) {
          cur[k] = isNextIndex ? [] : {};
        }
        cur = cur[k];
      }
    }
    return obj;
  };

  var keysOf = function (obj) {
    if (!isObj(obj)) return [];
    if (Object.keys) return Object.keys(obj);
    var out = [];
    var k;
    for (k in obj) {
      if (hasOwn.call(obj, k)) out.push(k);
    }
    return out;
  };

  var valuesOf = function (obj) {
    return map(keysOf(obj), function (k) { return obj[k]; });
  };

  var entriesOf = function (obj) {
    return map(keysOf(obj), function (k) { return [k, obj[k]]; });
  };

  var fromEntries = function (entries) {
    var out = {};
    each(entries || [], function (pair) {
      if (isArr(pair) && pair.length >= 2) {
        out[String(pair[0])] = pair[1];
      }
    });
    return out;
  };

  var pick = function (obj, keys) {
    var out = {};
    each(keys || [], function (k) {
      if (isObj(obj) && hasOwn.call(obj, k)) {
        out[k] = obj[k];
      }
    });
    return out;
  };

  var omit = function (obj, keys) {
    var out = {};
    each(keysOf(obj), function (k) {
      if (!includes(keys || [], k)) {
        out[k] = obj[k];
      }
    });
    return out;
  };

  var clone = function (val, deep) {
    if (!isObj(val)) return val;
    if (val instanceof Date) return new Date(val.getTime());
    if (val instanceof RegExp) return new RegExp(val.source, (val.global ? "g" : "") + (val.ignoreCase ? "i" : "") + (val.multiline ? "m" : ""));
    if (isArr(val)) {
      return map(val, function (item) { return deep ? clone(item, true) : item; });
    }
    var out = {};
    each(keysOf(val), function (k) {
      out[k] = deep ? clone(val[k], true) : val[k];
    });
    return out;
  };

  var merge = function () {
    var sources = slice.call(arguments);
    var target = {};
    var i, k, src;
    for (i = 0; i < sources.length; i++) {
      src = sources[i];
      if (!isObj(src)) continue;
      for (k in src) {
        if (!hasOwn.call(src, k)) continue;
        if (isPlainObj(src[k]) && isPlainObj(target[k])) {
          target[k] = merge(target[k], src[k]);
        } else {
          target[k] = clone(src[k], true);
        }
      }
    }
    return target;
  };

  var equal = function (a, b) {
    if (a === b) return true;
    if (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)) return true;
    if (isNil(a) || isNil(b) || typeof a !== typeof b) return false;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();
    if (isArr(a) && isArr(b)) {
      if (a.length !== b.length) return false;
      var i;
      for (i = 0; i < a.length; i++) {
        if (!equal(a[i], b[i])) return false;
      }
      return true;
    }
    if (isObj(a) && isObj(b)) {
      var ka = keysOf(a);
      var kb = keysOf(b);
      var j, key;
      if (ka.length !== kb.length) return false;
      for (j = 0; j < ka.length; j++) {
        key = ka[j];
        if (!hasOwn.call(b, key) || !equal(a[key], b[key])) return false;
      }
      return true;
    }
    return false;
  };

  // --- String, RegExp & Encoding Helpers ---
  var trim = function (str) {
    if (isNil(str)) return "";
    var s = String(str);
    if (s.trim) return s.trim();
    return s.replace(/^\s+|\s+$/g, "");
  };

  var padStart = function (str, targetLength, padString) {
    var s = String(isNil(str) ? "" : str);
    var pad = isNil(padString) || padString === "" ? " " : String(padString);
    if (s.length >= targetLength) return s;
    var needed = targetLength - s.length;
    var filler = "";
    while (filler.length < needed) filler += pad;
    return filler.slice(0, needed) + s;
  };

  var padEnd = function (str, targetLength, padString) {
    var s = String(isNil(str) ? "" : str);
    var pad = isNil(padString) || padString === "" ? " " : String(padString);
    if (s.length >= targetLength) return s;
    var needed = targetLength - s.length;
    var filler = "";
    while (filler.length < needed) filler += pad;
    return s + filler.slice(0, needed);
  };

  var replaceAll = function (str, search, replacement) {
    var s = String(isNil(str) ? "" : str);
    var sub = String(search);
    var rep = isFn(replacement) ? replacement : String(replacement);
    if (sub === "") {
      if (isFn(rep)) {
        var chars = s.split("");
        var outChars = [];
        var idx;
        for (idx = 0; idx <= chars.length; idx++) {
          outChars.push(rep("", idx, s));
          if (idx < chars.length) outChars.push(chars[idx]);
        }
        return outChars.join("");
      }
      return rep + s.split("").join(rep) + rep;
    }
    if (isFn(rep)) {
      return s.split(sub).reduce(function (acc, part, i, arr) {
        if (i === arr.length - 1) return acc + part;
        return acc + part + rep(sub, acc.length + part.length, s);
      }, "");
    }
    return s.split(sub).join(rep);
  };

  var escapeRegex = function (str) {
    var s = String(isNil(str) ? "" : str);
    if (typeof RegExp !== "undefined" && isFn(RegExp.escape)) {
      return RegExp.escape(s);
    }
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  var camelCase = function (str) {
    var clean = trim(String(isNil(str) ? "" : str))
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[^A-Za-z0-9]+/g, " ");
    var parts = clean.split(/\s+/);
    var out = "";
    var i, w;
    for (i = 0; i < parts.length; i++) {
      w = parts[i].toLowerCase();
      if (!w) continue;
      if (!out) out = w;
      else out += w.charAt(0).toUpperCase() + w.slice(1);
    }
    return out;
  };

  var kebabCase = function (str) {
    return trim(String(isNil(str) ? "" : str))
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  };

  var snakeCase = function (str) {
    return replaceAll(kebabCase(str), "-", "_");
  };

  var capitalize = function (str) {
    var s = String(isNil(str) ? "" : str);
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  };

  var template = function (str, data) {
    var s = String(isNil(str) ? "" : str);
    return s.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (_, path) {
      var val = get(data || {}, path);
      return isNil(val) ? "" : String(val);
    });
  };

  var query = {
    parse: function (qs) {
      var raw = trim(String(isNil(qs) ? "" : qs)).replace(/^\?/, "");
      var out = {};
      if (!raw) return out;
      var pairs = raw.split("&");
      var i, eqIdx, k, v;
      for (i = 0; i < pairs.length; i++) {
        if (!pairs[i]) continue;
        eqIdx = pairs[i].indexOf("=");
        k = decodeURIComponent((eqIdx >= 0 ? pairs[i].slice(0, eqIdx) : pairs[i]).replace(/\+/g, " "));
        v = decodeURIComponent((eqIdx >= 0 ? pairs[i].slice(eqIdx + 1) : "").replace(/\+/g, " "));
        if (hasOwn.call(out, k)) {
          if (!isArr(out[k])) out[k] = [out[k]];
          out[k].push(v);
        } else {
          out[k] = v;
        }
      }
      return out;
    },
    stringify: function (obj) {
      var parts = [];
      each(keysOf(obj || {}), function (k) {
        var val = obj[k];
        if (isNil(val)) return;
        if (isArr(val)) {
          each(val, function (item) {
            if (!isNil(item)) {
              parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(item)));
            }
          });
        } else {
          parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(val)));
        }
      });
      return parts.join("&");
    }
  };

  // --- Math & Number Helpers ---
  var clamp = function (num, min, max) {
    if (num < min) return min;
    if (num > max) return max;
    return num;
  };

  var sumPrecise = function (values) {
    if (typeof Math !== "undefined" && isFn(Math.sumPrecise)) {
      return Math.sumPrecise(values);
    }
    var sum = 0;
    var comp = 0;
    var i, y, t;
    for (i = 0; i < (values || []).length; i++) {
      y = Number(values[i]) - comp;
      t = sum + y;
      comp = (t - sum) - y;
      sum = t;
    }
    return sum;
  };

  var roundTo = function (num, decimals) {
    var factor = Math.pow(10, decimals || 0);
    return Math.round(num * factor) / factor;
  };

  var randomInt = function (min, max) {
    var lo = Math.ceil(min);
    var hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  };

  // --- Function & Timing Controls ---
  var once = function (fn) {
    var called = false;
    var result;
    return function () {
      if (!called) {
        called = true;
        result = fn.apply(this, arguments);
      }
      return result;
    };
  };

  var memoize = function (fn, resolver) {
    var cache = {};
    return function () {
      var args = slice.call(arguments);
      var key = isFn(resolver) ? String(resolver.apply(this, args)) : JSON.stringify(args);
      if (hasOwn.call(cache, key)) return cache[key];
      cache[key] = fn.apply(this, args);
      return cache[key];
    };
  };

  var pipe = function () {
    var fns = slice.call(arguments);
    return function (initial) {
      return reduce(fns, function (acc, fn) { return fn(acc); }, initial);
    };
  };

  var compose = function () {
    var fns = slice.call(arguments).reverse();
    return function (initial) {
      return reduce(fns, function (acc, fn) { return fn(acc); }, initial);
    };
  };

  var debounce = function (fn, wait) {
    var ms = isNum(wait) ? wait : 200;
    var timer = null;
    return function () {
      var ctx = this;
      var args = slice.call(arguments);
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        fn.apply(ctx, args);
      }, ms);
    };
  };

  var throttle = function (fn, limit) {
    var ms = isNum(limit) ? limit : 200;
    var busy = false;
    var queuedArgs = null;
    var queuedCtx = null;
    return function () {
      var ctx = this;
      var args = slice.call(arguments);
      if (!busy) {
        busy = true;
        fn.apply(ctx, args);
        setTimeout(function () {
          busy = false;
          if (queuedArgs !== null) {
            var a = queuedArgs;
            var c = queuedCtx;
            queuedArgs = null;
            queuedCtx = null;
            fn.apply(c, a);
          }
        }, ms);
      } else {
        queuedArgs = args;
        queuedCtx = ctx;
      }
    };
  };

  var uid = function (prefix) {
    var pfx = isStr(prefix) && prefix ? prefix : "lite";
    return pfx + "_" + Math.random().toString(36).slice(2, 8) + "_" + (new Date().getTime()).toString(36).slice(-4);
  };

  // --- Promise / Async / Callback Bridge ---
  var hasPromise = function () {
    return typeof Promise === "function" && isFn(Promise.resolve);
  };

  var withResolvers = function () {
    if (hasPromise() && isFn(Promise.withResolvers)) {
      return Promise.withResolvers();
    }
    var resolveFn, rejectFn;
    var promise = hasPromise() ? new Promise(function (res, rej) {
      resolveFn = res;
      rejectFn = rej;
    }) : null;
    return {
      promise: promise,
      resolve: resolveFn,
      reject: rejectFn
    };
  };

  var sleep = function (ms, cb) {
    if (hasPromise()) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          if (isFn(cb)) cb();
          resolve(ms);
        }, ms);
      });
    }
    setTimeout(function () {
      if (isFn(cb)) cb();
    }, ms);
    return undefined;
  };

  var retry = function (fn, opts, cb) {
    var options = opts || {};
    var retries = isNum(options.retries) ? options.retries : 3;
    var delay = isNum(options.delay) ? options.delay : 200;
    var factor = isNum(options.backoff) ? options.backoff : 2;

    if (!hasPromise()) {
      var attempt = 0;
      var runSync = function () {
        try {
          var res = fn(attempt);
          if (isFn(cb)) cb(null, res);
          return res;
        } catch (err) {
          if (attempt < retries) {
            attempt++;
            return runSync();
          }
          if (isFn(cb)) cb(err);
          throw err;
        }
      };
      return runSync();
    }

    return new Promise(function (resolve, reject) {
      var step = function (attempt) {
        var p;
        try {
          p = Promise.resolve(fn(attempt));
        } catch (syncErr) {
          p = Promise.reject(syncErr);
        }
        p.then(
          function (val) { resolve(val); },
          function (err) {
            if (attempt < retries) {
              var waitMs = delay * Math.pow(factor, attempt);
              setTimeout(function () { step(attempt + 1); }, waitMs);
            } else {
              reject(err);
            }
          }
        );
      };
      step(0);
    });
  };

  // --- Safe Storage Adapter ---
  var memStore = {};
  var storage = {
    get: function (key, fallback) {
      var defVal = arguments.length >= 2 ? fallback : null;
      try {
        if (typeof localStorage !== "undefined" && localStorage) {
          var raw = localStorage.getItem(key);
          if (raw === null || raw === undefined) return defVal;
          return typeof JSON !== "undefined" && JSON.parse ? JSON.parse(raw) : raw;
        }
      } catch (e) { /* fallback */ }
      return hasOwn.call(memStore, key) ? clone(memStore[key], true) : defVal;
    },
    set: function (key, value) {
      try {
        if (typeof localStorage !== "undefined" && localStorage) {
          var payload = typeof JSON !== "undefined" && JSON.stringify ? JSON.stringify(value) : String(value);
          localStorage.setItem(key, payload);
          return true;
        }
      } catch (e) { /* fallback */ }
      memStore[key] = clone(value, true);
      return true;
    },
    remove: function (key) {
      try {
        if (typeof localStorage !== "undefined" && localStorage) {
          localStorage.removeItem(key);
        }
      } catch (e) { /* fallback */ }
      if (hasOwn.call(memStore, key)) {
        try { delete memStore[key]; } catch (e2) { memStore[key] = undefined; }
      }
    }
  };

  return {
    version: "2.0.0",
    era: era,
    typeOf: typeOf,
    isNil: isNil,
    isObj: isObj,
    isPlainObj: isPlainObj,
    isFn: isFn,
    isArr: isArr,
    isNum: isNum,
    isStr: isStr,
    isBool: isBool,
    isEmpty: isEmpty,
    each: each,
    map: map,
    filter: filter,
    reject: reject,
    reduce: reduce,
    find: find,
    findLast: findLast,
    some: some,
    every: every,
    includes: includes,
    at: at,
    flatten: flatten,
    flatMap: flatMap,
    chunk: chunk,
    compact: compact,
    unique: unique,
    groupBy: groupBy,
    countBy: countBy,
    keyBy: keyBy,
    sortBy: sortBy,
    zip: zip,
    range: range,
    setOps: setOps,
    get: get,
    set: set,
    keysOf: keysOf,
    valuesOf: valuesOf,
    entriesOf: entriesOf,
    fromEntries: fromEntries,
    pick: pick,
    omit: omit,
    clone: clone,
    merge: merge,
    equal: equal,
    trim: trim,
    padStart: padStart,
    padEnd: padEnd,
    replaceAll: replaceAll,
    escapeRegex: escapeRegex,
    camelCase: camelCase,
    kebabCase: kebabCase,
    snakeCase: snakeCase,
    capitalize: capitalize,
    template: template,
    query: query,
    clamp: clamp,
    sumPrecise: sumPrecise,
    roundTo: roundTo,
    randomInt: randomInt,
    once: once,
    memoize: memoize,
    pipe: pipe,
    compose: compose,
    debounce: debounce,
    throttle: throttle,
    uid: uid,
    withResolvers: withResolvers,
    sleep: sleep,
    retry: retry,
    storage: storage
  };
}));
