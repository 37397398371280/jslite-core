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
      var i;
      for (i = 0; i < order.length; i++) {
        if (order[i][1]) highest = order[i][0];
      }
      return { highest: highest, capabilities: caps };
    },
    isAtLeast: function (yearOrVer) {
      var info = era.detect().capabilities;
      var key = String(yearOrVer).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (key === "es2015") key = "es6";
      return !!info[key];
    }
  };

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

  var indexOfRef = function (list, target) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === target) return i;
    }
    return -1;
  };

  var each = function (collection, iteratee) {
    if (isNil(collection)) return collection;
    var i, len, key;
    if (isArr(collection) || isStr(collection) || (collection && isNum(collection.length))) {
      for (i = 0, len = collection.length; i < len; i++) {
        if (iteratee(collection[i], i, collection) === false) break;
      }
    } else if (typeof Map === "function" && collection instanceof Map) {
      collection.forEach(function (val, k) { iteratee(val, k, collection); });
    } else if (typeof Set === "function" && collection instanceof Set) {
      var idx = 0;
      collection.forEach(function (val) { iteratee(val, idx++, collection); });
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
    each(collection, function (val, key, col) { out.push(fn(val, key, col)); });
    return out;
  };

  var filter = function (collection, predicate) {
    var out = [];
    each(collection, function (val, key, col) { if (predicate(val, key, col)) out.push(val); });
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
      if (!started) { acc = val; started = true; }
      else { acc = reducer(acc, val, key, col); }
    });
    return acc;
  };

  var find = function (collection, predicate) {
    var found;
    each(collection, function (val, key, col) {
      if (predicate(val, key, col)) { found = val; return false; }
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
      if (predicate(val, key, col)) { matched = true; return false; }
    });
    return matched;
  };

  var every = function (collection, predicate) {
    var all = true;
    each(collection, function (val, key, col) {
      if (!predicate(val, key, col)) { all = false; return false; }
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
        if (isArr(item) && d > 0) out = out.concat(walk(item, d - 1));
        else out.push(item);
      }
      return out;
    };
    return walk(arr || [], maxDepth);
  };

  var flatMap = function (arr, fn) { return flatten(map(arr, fn), 1); };

  var chunk = function (arr, size) {
    var n = Math.max(1, size || 1);
    var out = [];
    var i;
    for (i = 0; i < (arr || []).length; i += n) out.push(arr.slice(i, i + n));
    return out;
  };

  var compact = function (arr) { return filter(arr || [], function (x) { return !!x; }); };

  var unique = function (arr, keyFn) {
    var fn = isFn(keyFn) ? keyFn : function (x) { return x; };
    var seen = [];
    var out = [];
    each(arr || [], function (item) {
      var k = fn(item);
      if (!includes(seen, k)) { seen.push(k); out.push(item); }
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
    each(arr || [], function (item) { out[String(fn(item))] = item; });
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
      for (j = 0; j < arrays.length; j++) row.push(isArr(arrays[j]) ? arrays[j][i] : undefined);
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
    if (st > 0) { while (cur < e) { out.push(cur); cur += st; } }
    else { while (cur > e) { out.push(cur); cur += st; } }
    return out;
  };

  var setOps = {
    toArray: function (s) {
      if (isArr(s)) return unique(s);
      var out = [];
      if (typeof Set === "function" && s instanceof Set) s.forEach(function (v) { out.push(v); });
      return out;
    },
    union: function (a, b) { return unique(setOps.toArray(a).concat(setOps.toArray(b))); },
    intersection: function (a, b) {
      var arrB = setOps.toArray(b);
      return filter(setOps.toArray(a), function (x) { return includes(arrB, x); });
    },
    difference: function (a, b) {
      var arrB = setOps.toArray(b);
      return filter(setOps.toArray(a), function (x) { return !includes(arrB, x); });
    },
    symmetricDifference: function (a, b) { return setOps.union(setOps.difference(a, b), setOps.difference(b, a)); },
    isSubsetOf: function (a, b) {
      var arrB = setOps.toArray(b);
      return every(setOps.toArray(a), function (x) { return includes(arrB, x); });
    },
    isSupersetOf: function (a, b) { return setOps.isSubsetOf(b, a); },
    isDisjointFrom: function (a, b) {
      var arrB = setOps.toArray(b);
      return !some(setOps.toArray(a), function (x) { return includes(arrB, x); });
    }
  };

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
      if (i === parts.length - 1) cur[k] = value;
      else {
        nextK = parts[i + 1];
        isNextIndex = /^\d+$/.test(nextK);
        if (!isObj(cur[k])) cur[k] = isNextIndex ? [] : {};
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
    for (k in obj) if (hasOwn.call(obj, k)) out.push(k);
    return out;
  };

  var valuesOf = function (obj) { return map(keysOf(obj), function (k) { return obj[k]; }); };
  var entriesOf = function (obj) { return map(keysOf(obj), function (k) { return [k, obj[k]]; }); };
  var fromEntries = function (entries) {
    var out = {};
    each(entries || [], function (pair) {
      if (isArr(pair) && pair.length >= 2) out[String(pair[0])] = pair[1];
    });
    return out;
  };

  var pick = function (obj, keys) {
    var out = {};
    each(keys || [], function (k) { if (isObj(obj) && hasOwn.call(obj, k)) out[k] = obj[k]; });
    return out;
  };

  var omit = function (obj, keys) {
    var out = {};
    each(keysOf(obj), function (k) { if (!includes(keys || [], k)) out[k] = obj[k]; });
    return out;
  };

  var cloneWithSeen = function (val, deep, seenSources, seenClones) {
    if (!isObj(val)) return val;
    var existingIdx = indexOfRef(seenSources, val);
    if (existingIdx !== -1) return seenClones[existingIdx];

    if (val instanceof Date) return new Date(val.getTime());
    if (val instanceof RegExp) {
      return new RegExp(val.source, (val.global ? "g" : "") + (val.ignoreCase ? "i" : "") + (val.multiline ? "m" : ""));
    }
    if (isArr(val)) {
      var arrCopy = [];
      seenSources.push(val);
      seenClones.push(arrCopy);
      var i;
      for (i = 0; i < val.length; i++) {
        arrCopy.push(deep ? cloneWithSeen(val[i], true, seenSources, seenClones) : val[i]);
      }
      return arrCopy;
    }

    var objCopy = {};
    seenSources.push(val);
    seenClones.push(objCopy);
    var ks = keysOf(val);
    var j, k;
    for (j = 0; j < ks.length; j++) {
      k = ks[j];
      objCopy[k] = deep ? cloneWithSeen(val[k], true, seenSources, seenClones) : val[k];
    }
    return objCopy;
  };

  var clone = function (val, deep) {
    return cloneWithSeen(val, !!deep, [], []);
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
        if (isPlainObj(src[k]) && isPlainObj(target[k])) target[k] = merge(target[k], src[k]);
        else target[k] = clone(src[k], true);
      }
    }
    return target;
  };

  var equalWithSeen = function (a, b, seenA, seenB) {
    if (a === b) return true;
    if (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)) return true;
    if (isNil(a) || isNil(b) || typeof a !== typeof b) return false;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();

    if (isArr(a) && isArr(b)) {
      if (a.length !== b.length) return false;
      var idxA = indexOfRef(seenA, a);
      var idxB = indexOfRef(seenB, b);
      if (idxA !== -1 || idxB !== -1) return idxA === idxB && seenB[idxA] === b;
      seenA.push(a);
      seenB.push(b);
      var i;
      for (i = 0; i < a.length; i++) {
        if (!equalWithSeen(a[i], b[i], seenA, seenB)) return false;
      }
      return true;
    }

    if (isObj(a) && isObj(b)) {
      var ka = keysOf(a);
      var kb = keysOf(b);
      if (ka.length !== kb.length) return false;
      var pIdxA = indexOfRef(seenA, a);
      var pIdxB = indexOfRef(seenB, b);
      if (pIdxA !== -1 || pIdxB !== -1) return pIdxA === pIdxB && seenB[pIdxA] === b;
      seenA.push(a);
      seenB.push(b);
      var j, key;
      for (j = 0; j < ka.length; j++) {
        key = ka[j];
        if (!hasOwn.call(b, key) || !equalWithSeen(a[key], b[key], seenA, seenB)) return false;
      }
      return true;
    }

    return false;
  };

  var equal = function (a, b) {
    return equalWithSeen(a, b, [], []);
  };

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
    if (typeof RegExp !== "undefined" && isFn(RegExp.escape)) return RegExp.escape(s);
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

  var snakeCase = function (str) { return replaceAll(kebabCase(str), "-", "_"); };
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
        } else { out[k] = v; }
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
            if (!isNil(item)) parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(item)));
          });
        } else {
          parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(val)));
        }
      });
      return parts.join("&");
    }
  };

  var clamp = function (num, min, max) { return num < min ? min : (num > max ? max : num); };

  var sumPrecise = function (values) {
    if (typeof Math !== "undefined" && isFn(Math.sumPrecise)) return Math.sumPrecise(values);
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

  var once = function (fn) {
    var called = false;
    var result;
    return function () {
      if (!called) { called = true; result = fn.apply(this, arguments); }
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
    return function (initial) { return reduce(fns, function (acc, fn) { return fn(acc); }, initial); };
  };

  var compose = function () {
    var fns = slice.call(arguments).reverse();
    return function (initial) { return reduce(fns, function (acc, fn) { return fn(acc); }, initial); };
  };

  var debounce = function (fn, wait) {
    var ms = isNum(wait) ? wait : 200;
    var timer = null;
    return function () {
      var ctx = this;
      var args = slice.call(arguments);
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; fn.apply(ctx, args); }, ms);
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
      } else { queuedArgs = args; queuedCtx = ctx; }
    };
  };

  var uid = function (prefix) {
    var pfx = isStr(prefix) && prefix ? prefix : "lite";
    return pfx + "_" + Math.random().toString(36).slice(2, 8) + "_" + (new Date().getTime()).toString(36).slice(-4);
  };

  var hasPromise = function () { return typeof Promise === "function" && isFn(Promise.resolve); };

  var withResolvers = function () {
    if (hasPromise() && isFn(Promise.withResolvers)) return Promise.withResolvers();
    var resolveFn, rejectFn;
    var promise = hasPromise() ? new Promise(function (res, rej) { resolveFn = res; rejectFn = rej; }) : null;
    return { promise: promise, resolve: resolveFn, reject: rejectFn };
  };

  var sleep = function (ms, cb) {
    if (hasPromise()) {
      return new Promise(function (resolve) {
        setTimeout(function () { if (isFn(cb)) cb(); resolve(ms); }, ms);
      });
    }
    setTimeout(function () { if (isFn(cb)) cb(); }, ms);
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
          if (attempt < retries) { attempt++; return runSync(); }
          if (isFn(cb)) cb(err);
          throw err;
        }
      };
      return runSync();
    }

    return new Promise(function (resolve, reject) {
      var step = function (attempt) {
        var p;
        try { p = Promise.resolve(fn(attempt)); }
        catch (syncErr) { p = Promise.reject(syncErr); }
        p.then(
          function (val) { resolve(val); },
          function (err) {
            if (attempt < retries) {
              var waitMs = delay * Math.pow(factor, attempt);
              setTimeout(function () { step(attempt + 1); }, waitMs);
            } else { reject(err); }
          }
        );
      };
      step(0);
    });
  };

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
      } catch (e) {}
      return hasOwn.call(memStore, key) ? clone(memStore[key], true) : defVal;
    },
    set: function (key, value) {
      try {
        if (typeof localStorage !== "undefined" && localStorage) {
          var payload = typeof JSON !== "undefined" && JSON.stringify ? JSON.stringify(value) : String(value);
          localStorage.setItem(key, payload);
          return true;
        }
      } catch (e) {}
      memStore[key] = clone(value, true);
      return true;
    },
    remove: function (key) {
      try {
        if (typeof localStorage !== "undefined" && localStorage) localStorage.removeItem(key);
      } catch (e) {}
      if (hasOwn.call(memStore, key)) {
        try { delete memStore[key]; } catch (e2) { memStore[key] = undefined; }
      }
    }
  };

  var hasDoc = function () {
    return typeof document !== "undefined" && document && isFn(document.createElement);
  };

  var dollar = function (selector, scope) {
    if (!isStr(selector)) return null;
    var rootEl = isObj(scope) && isFn(scope.querySelector) ? scope : (hasDoc() && isFn(document.querySelector) ? document : null);
    if (!rootEl) return null;
    try { return rootEl.querySelector(selector); } catch (e) { return null; }
  };

  var dollarAll = function (selector, scope) {
    if (!isStr(selector)) return [];
    var rootEl = isObj(scope) && isFn(scope.querySelectorAll) ? scope : (hasDoc() && isFn(document.querySelectorAll) ? document : null);
    if (!rootEl) return [];
    try {
      var list = rootEl.querySelectorAll(selector);
      var out = [];
      var i;
      for (i = 0; i < list.length; i++) out.push(list[i]);
      return out;
    } catch (e) { return []; }
  };

  var on = function (target, eventName, handler, opts) {
    if (!target || !isStr(eventName) || !isFn(handler)) return function () {};
    if (isFn(target.addEventListener)) {
      target.addEventListener(eventName, handler, opts || false);
      return function () { target.removeEventListener(eventName, handler, opts || false); };
    }
    if (isFn(target.attachEvent)) {
      var legacyName = "on" + eventName;
      var wrapper = function () {
        var ev = typeof window !== "undefined" && window.event ? window.event : {};
        if (!ev.target) ev.target = ev.srcElement;
        return handler.call(target, ev);
      };
      target.attachEvent(legacyName, wrapper);
      return function () { target.detachEvent(legacyName, wrapper); };
    }
    return function () {};
  };

  var create = function (tagName, attrs, children) {
    if (!hasDoc() || !isStr(tagName)) return null;
    var el = document.createElement(tagName);
    if (isObj(attrs)) {
      each(keysOf(attrs), function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class" || k === "className") {
          el.className = isArr(v) ? v.join(" ") : String(v);
        } else if (k === "text") {
          el.appendChild(document.createTextNode(String(v)));
        } else if (k === "html") {
          el.innerHTML = String(v);
        } else if (k === "style" && isObj(v)) {
          each(keysOf(v), function (sk) {
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
      var childList = isArr(children) ? children : [children];
      each(childList, function (ch) {
        if (ch === null || ch === undefined || ch === false) return;
        if (isStr(ch) || isNum(ch) || isBool(ch)) {
          el.appendChild(document.createTextNode(String(ch)));
        } else if (isObj(ch) && ch.nodeType) {
          el.appendChild(ch);
        }
      });
    }
    return el;
  };

  var copyText = function (text) {
    var str = String(isNil(text) ? "" : text);
    if (typeof navigator !== "undefined" && navigator && navigator.clipboard && isFn(navigator.clipboard.writeText) && hasPromise()) {
      return navigator.clipboard.writeText(str).then(function () { return true; }, function () {
        return copyTextFallback(str);
      });
    }
    var ok = copyTextFallback(str);
    return hasPromise() ? Promise.resolve(ok) : ok;
  };

  var copyTextFallback = function (str) {
    if (!hasDoc() || !document.body) return false;
    var ta = document.createElement("textarea");
    ta.value = str;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    var selected = false;
    try {
      ta.select();
      if (isFn(ta.setSelectionRange)) ta.setSelectionRange(0, str.length);
      if (isFn(document.execCommand)) selected = !!document.execCommand("copy");
    } catch (e) {
      selected = false;
    }
    try { document.body.removeChild(ta); } catch (e2) {}
    return selected;
  };

  var toDate = function (input) {
    if (input instanceof Date) return new Date(input.getTime());
    if (isNum(input)) return new Date(input);
    if (isStr(input)) {
      var parsed = Date.parse(input);
      return isNaN(parsed) ? new Date(NaN) : new Date(parsed);
    }
    return new Date();
  };

  var dateUtils = {
    now: function () {
      return new Date().getTime();
    },
    isValid: function (input) {
      var d = input instanceof Date ? input : toDate(input);
      var t = d.getTime();
      return typeof t === "number" && !isNaN(t) && isFinite(t);
    },
    format: function (input, pattern, useUtc) {
      var d = toDate(input);
      if (!dateUtils.isValid(d)) return "";
      var fmt = isStr(pattern) && pattern ? pattern : "YYYY-MM-DD";
      var year = useUtc ? d.getUTCFullYear() : d.getFullYear();
      var month = (useUtc ? d.getUTCMonth() : d.getMonth()) + 1;
      var day = useUtc ? d.getUTCDate() : d.getDate();
      var hours = useUtc ? d.getUTCHours() : d.getHours();
      var mins = useUtc ? d.getUTCMinutes() : d.getMinutes();
      var secs = useUtc ? d.getUTCSeconds() : d.getSeconds();
      var ms = useUtc ? d.getUTCMilliseconds() : d.getMilliseconds();

      var tokens = {
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

      return fmt.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|SSS/g, function (tok) {
        return hasOwn.call(tokens, tok) ? tokens[tok] : tok;
      });
    },
    addDays: function (input, days) {
      var d = toDate(input);
      if (!dateUtils.isValid(d)) return new Date(NaN);
      var n = isNum(days) ? days : 0;
      return new Date(d.getTime() + n * 86400000);
    },
    diffDays: function (startInput, endInput) {
      var a = toDate(startInput);
      var b = toDate(endInput);
      if (!dateUtils.isValid(a) || !dateUtils.isValid(b)) return NaN;
      return (b.getTime() - a.getTime()) / 86400000;
    },
    startOfDay: function (input, useUtc) {
      var d = toDate(input);
      if (!dateUtils.isValid(d)) return new Date(NaN);
      if (useUtc) return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    }
  };

  var B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var utf8Encode = function (str) {
    var s = String(isNil(str) ? "" : str);
    var out = [];
    var i, code;
    for (i = 0; i < s.length; i++) {
      code = s.charCodeAt(i);
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < s.length) {
        var next = s.charCodeAt(i + 1);
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
  };

  var utf8Decode = function (bytes) {
    var list = isArr(bytes) ? bytes : [];
    var out = "";
    var i = 0;
    var b1, b2, b3, b4, cp;
    while (i < list.length) {
      b1 = list[i++] & 0xFF;
      if (b1 < 0x80) {
        out += String.fromCharCode(b1);
      } else if (b1 >= 0xC0 && b1 < 0xE0 && i < list.length) {
        b2 = list[i++] & 0x3F;
        out += String.fromCharCode(((b1 & 0x1F) << 6) | b2);
      } else if (b1 >= 0xE0 && b1 < 0xF0 && i + 1 < list.length) {
        b2 = list[i++] & 0x3F;
        b3 = list[i++] & 0x3F;
        out += String.fromCharCode(((b1 & 0x0F) << 12) | (b2 << 6) | b3);
      } else if (b1 >= 0xF0 && i + 2 < list.length) {
        b2 = list[i++] & 0x3F;
        b3 = list[i++] & 0x3F;
        b4 = list[i++] & 0x3F;
        cp = (((b1 & 0x07) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000;
        out += String.fromCharCode(0xD800 + ((cp >> 10) & 0x3FF), 0xDC00 + (cp & 0x3FF));
      } else {
        out += String.fromCharCode(b1);
      }
    }
    return out;
  };

  var bytesToBase64 = function (bytes) {
    var out = "";
    var i, b1, b2, b3, enc1, enc2, enc3, enc4;
    for (i = 0; i < bytes.length; i += 3) {
      b1 = bytes[i] & 0xFF;
      b2 = i + 1 < bytes.length ? bytes[i + 1] & 0xFF : NaN;
      b3 = i + 2 < bytes.length ? bytes[i + 2] & 0xFF : NaN;

      enc1 = b1 >> 2;
      enc2 = ((b1 & 0x03) << 4) | (isNaN(b2) ? 0 : (b2 >> 4));
      enc3 = isNaN(b2) ? 64 : (((b2 & 0x0F) << 2) | (isNaN(b3) ? 0 : (b3 >> 6)));
      enc4 = isNaN(b3) ? 64 : (b3 & 0x3F);

      out += B64_CHARS.charAt(enc1) + B64_CHARS.charAt(enc2);
      out += enc3 === 64 ? "=" : B64_CHARS.charAt(enc3);
      out += enc4 === 64 ? "=" : B64_CHARS.charAt(enc4);
    }
    return out;
  };

  var base64ToBytes = function (b64) {
    var clean = String(isNil(b64) ? "" : b64).replace(/[^A-Za-z0-9+/=]/g, "");
    var out = [];
    var i = 0;
    var c1, c2, c3, c4, e1, e2, e3, e4;
    while (i < clean.length) {
      c1 = clean.charAt(i++);
      c2 = i < clean.length ? clean.charAt(i++) : "=";
      c3 = i < clean.length ? clean.charAt(i++) : "=";
      c4 = i < clean.length ? clean.charAt(i++) : "=";

      e1 = B64_CHARS.indexOf(c1);
      e2 = B64_CHARS.indexOf(c2);
      e3 = c3 === "=" ? 64 : B64_CHARS.indexOf(c3);
      e4 = c4 === "=" ? 64 : B64_CHARS.indexOf(c4);

      if (e1 < 0 || e2 < 0 || (c3 !== "=" && e3 < 0) || (c4 !== "=" && e4 < 0)) break;

      out.push(((e1 << 2) | (e2 >> 4)) & 0xFF);
      if (e3 !== 64) {
        out.push((((e2 & 0x0F) << 4) | (e3 >> 2)) & 0xFF);
      }
      if (e4 !== 64) {
        out.push((((e3 & 0x03) << 6) | e4) & 0xFF);
      }
    }
    return out;
  };

  var bytesToHex = function (bytes) {
    var out = "";
    var i, b;
    for (i = 0; i < bytes.length; i++) {
      b = bytes[i] & 0xFF;
      out += (b < 16 ? "0" : "") + b.toString(16);
    }
    return out;
  };

  var hexToBytes = function (hex) {
    var clean = trim(String(isNil(hex) ? "" : hex)).replace(/^0x/i, "");
    var out = [];
    var i, val;
    for (i = 0; i < clean.length; i += 2) {
      if (i + 1 >= clean.length) break;
      val = parseInt(clean.slice(i, i + 2), 16);
      if (isNaN(val)) break;
      out.push(val & 0xFF);
    }
    return out;
  };

  var encoding = {
    utf8Encode: utf8Encode,
    utf8Decode: utf8Decode,
    base64Encode: function (str) { return bytesToBase64(utf8Encode(str)); },
    base64Decode: function (b64) { return utf8Decode(base64ToBytes(b64)); },
    base64EncodeBytes: bytesToBase64,
    base64DecodeBytes: base64ToBytes,
    hexEncode: function (str) { return bytesToHex(utf8Encode(str)); },
    hexDecode: function (hex) { return utf8Decode(hexToBytes(hex)); },
    hexEncodeBytes: bytesToHex,
    hexDecodeBytes: hexToBytes
  };

  var JS_KEYWORDS = {
    "break": 1, "case": 1, "catch": 1, "class": 1, "const": 1, "continue": 1,
    "debugger": 1, "default": 1, "delete": 1, "do": 1, "else": 1, "enum": 1,
    "export": 1, "extends": 1, "false": 1, "finally": 1, "for": 1, "function": 1,
    "if": 1, "import": 1, "in": 1, "instanceof": 1, "let": 1, "new": 1,
    "null": 1, "return": 1, "super": 1, "switch": 1, "this": 1, "throw": 1,
    "true": 1, "try": 1, "typeof": 1, "var": 1, "void": 1, "while": 1, "with": 1,
    "yield": 1, "await": 1, "async": 1
  };

  var isIdentStart = function (ch) {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_" || ch === "$";
  };

  var isIdentPart = function (ch) {
    return isIdentStart(ch) || (ch >= "0" && ch <= "9");
  };

  var makeShortName = function (index) {
    var first = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
    var rest = first + "0123456789";
    var n = index;
    var name = first.charAt(n % first.length);
    n = Math.floor(n / first.length);
    while (n > 0) {
      n--;
      name += rest.charAt(n % rest.length);
      n = Math.floor(n / rest.length);
    }
    return name;
  };

  var tokenizeJsForCompress = function (src) {
    var tokens = [];
    var i = 0;
    var len = src.length;
    var lastMeaningful = "";

    while (i < len) {
      var ch = src.charAt(i);
      var next = i + 1 < len ? src.charAt(i + 1) : "";

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
        var quote = ch;
        var start = i;
        i++;
        while (i < len) {
          var qch = src.charAt(i);
          if (qch === "\\") {
            i += 2;
            continue;
          }
          i++;
          if (qch === quote) break;
        }
        var lit = src.slice(start, i);
        tokens.push({ type: "string", value: lit });
        lastMeaningful = lit;
        continue;
      }

      if (ch === "/" && next !== "/" && next !== "*") {
        var canBeRegex = !lastMeaningful ||
          /[=(![{?:;,~&|^+-<>/*%]$/.test(lastMeaningful) ||
          lastMeaningful === "return" || lastMeaningful === "case" ||
          lastMeaningful === "throw" || lastMeaningful === "typeof" ||
          lastMeaningful === "void" || lastMeaningful === "delete" ||
          lastMeaningful === "in" || lastMeaningful === "instanceof" ||
          lastMeaningful === "new" || lastMeaningful === "of";
        if (canBeRegex) {
          var rStart = i;
          i++;
          var inClass = false;
          while (i < len) {
            var rch = src.charAt(i);
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
          var rx = src.slice(rStart, i);
          tokens.push({ type: "regex", value: rx });
          lastMeaningful = rx;
          continue;
        }
      }

      if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
        var hasNewline = false;
        while (i < len && (src.charAt(i) === " " || src.charAt(i) === "\t" || src.charAt(i) === "\r" || src.charAt(i) === "\n")) {
          if (src.charAt(i) === "\n" || src.charAt(i) === "\r") hasNewline = true;
          i++;
        }
        tokens.push({ type: "ws", value: hasNewline ? "\n" : " " });
        continue;
      }

      if (isIdentStart(ch)) {
        var idStart = i;
        i++;
        while (i < len && isIdentPart(src.charAt(i))) i++;
        var word = src.slice(idStart, i);
        var kind = hasOwn.call(JS_KEYWORDS, word) ? "keyword" : "ident";
        tokens.push({ type: kind, value: word });
        lastMeaningful = word;
        continue;
      }

      var three = i + 2 < len ? src.slice(i, i + 3) : "";
      var two = i + 1 < len ? src.slice(i, i + 2) : "";
      var op = ch;
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
  };

  var needsSpaceBetween = function (prev, curr) {
    if (!prev || !curr) return false;
    var pIsWord = prev.type === "ident" || prev.type === "keyword";
    var cIsWord = curr.type === "ident" || curr.type === "keyword";
    var pIsNum = prev.type === "number";
    var cIsNum = curr.type === "number";

    if ((pIsWord || pIsNum) && (cIsWord || cIsNum)) return true;
    if (prev.value === "+" && curr.value.indexOf("+") === 0) return true;
    if (prev.value === "-" && curr.value.indexOf("-") === 0) return true;
    if (prev.value === "/" && curr.type === "regex") return true;
    return false;
  };

  var compress = function (code, opts) {
    var options = opts || {};
    var source = String(isNil(code) ? "" : code);
    var shouldMangle = options.mangle !== false;
    var tokens = tokenizeJsForCompress(source);

    var declCounts = {};
    var i;
    if (shouldMangle) {
      for (i = 0; i < tokens.length; i++) {
        if (tokens[i].type === "keyword" && (tokens[i].value === "var" || tokens[i].value === "let" || tokens[i].value === "const")) {
          var j = i + 1;
          while (j < tokens.length) {
            if (tokens[j].type === "ws") { j++; continue; }
            if (tokens[j].type === "ident") {
              var varName = tokens[j].value;
              declCounts[varName] = (hasOwn.call(declCounts, varName) ? declCounts[varName] : 0) + 1;
            }
            if (tokens[j].value === ";" || tokens[j].value === "\n") break;
            j++;
          }
        }
      }
    }

    var reservedNames = {};
    for (i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "ident") {
        var id = tokens[i].value;
        if (!hasOwn.call(declCounts, id)) reservedNames[id] = true;
      }
    }

    var renameMap = {};
    var nextShortIdx = 0;
    if (shouldMangle) {
      for (i = 0; i < tokens.length; i++) {
        if (tokens[i].type === "ident") {
          var name = tokens[i].value;
          if (hasOwn.call(declCounts, name) && !hasOwn.call(renameMap, name)) {
            var candidate;
            do {
              candidate = makeShortName(nextShortIdx++);
            } while (hasOwn.call(JS_KEYWORDS, candidate) || hasOwn.call(reservedNames, candidate) || hasOwn.call(renameMap, candidate));
            if (candidate.length < name.length) renameMap[name] = candidate;
            else renameMap[name] = name;
          }
        }
      }
    }

    var compacted = [];
    for (i = 0; i < tokens.length; i++) {
      var tk = tokens[i];
      if (tk.type === "ident" && hasOwn.call(renameMap, tk.value)) {
        compacted.push({ type: "ident", value: renameMap[tk.value] });
      } else if (/^\d+(\.\d+)?([eE][+-]?\d+)?$/.test(tk.value) && tk.type === "ident") {
        compacted.push({ type: "number", value: tk.value });
      } else {
        compacted.push(tk);
      }
    }

    var out = "";
    var lastOutToken = null;
    var pendingNewline = false;

    for (i = 0; i < compacted.length; i++) {
      var cur = compacted[i];
      if (cur.type === "ws") {
        if (cur.value === "\n") pendingNewline = true;
        continue;
      }

      if (pendingNewline && lastOutToken) {
        var canDropNewline =
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

    var originalBytes = utf8Encode(source).length;
    var compressedBytes = utf8Encode(out).length;
    var savedBytes = originalBytes - compressedBytes;
    var ratio = originalBytes > 0 ? roundTo((savedBytes / originalBytes) * 100, 2) : 0;

    return {
      code: out,
      originalBytes: originalBytes,
      compressedBytes: compressedBytes,
      savedBytes: savedBytes,
      ratio: ratio,
      renamed: renameMap
    };
  };

  return {
    version: "1.1.1",
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
    storage: storage,
    dom: {
      $: dollar,
      $$: dollarAll,
      on: on,
      create: create,
      copyText: copyText
    },
    date: dateUtils,
    encoding: encoding,
    compress: compress,
    minify: compress
  };
}));
