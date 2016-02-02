'use strict';

/**
 * A fake version of Hoek that has only what Joi uses - otherwise it is not
 * very browser friendly.
 */

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 * @throws {TypeError} Will error if either constructor is null, or if
 *     the super constructor lacks a prototype.
 */
exports.inherits = function (ctor, superCtor) {

  if (ctor === undefined || ctor === null)
    throw new TypeError('The constructor to "inherits" must not be ' +
      'null or undefined');

  if (superCtor === undefined || superCtor === null)
    throw new TypeError('The super constructor to "inherits" must not ' +
      'be null or undefined');

  if (superCtor.prototype === undefined)
    throw new TypeError('The super constructor to "inherits" must ' +
      'have a prototype');

  ctor.super_ = superCtor;
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
};

'use strict';

// Declare internals

const internals = {};


exports.escapeJavaScript = function (input) {

    if (!input) {
        return '';
    }

    let escaped = '';

    for (let i = 0; i < input.length; ++i) {

        const charCode = input.charCodeAt(i);

        if (internals.isSafe(charCode)) {
            escaped += input[i];
        }
        else {
            escaped += internals.escapeJavaScriptChar(charCode);
        }
    }

    return escaped;
};


exports.escapeHtml = function (input) {

    if (!input) {
        return '';
    }

    let escaped = '';

    for (let i = 0; i < input.length; ++i) {

        const charCode = input.charCodeAt(i);

        if (internals.isSafe(charCode)) {
            escaped += input[i];
        }
        else {
            escaped += internals.escapeHtmlChar(charCode);
        }
    }

    return escaped;
};


internals.escapeJavaScriptChar = function (charCode) {

    if (charCode >= 256) {
        return '\\u' + internals.padLeft('' + charCode, 4);
    }

    const hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
    return '\\x' + internals.padLeft(hexValue, 2);
};


internals.escapeHtmlChar = function (charCode) {

    const namedEscape = internals.namedHtml[charCode];
    if (typeof namedEscape !== 'undefined') {
        return namedEscape;
    }

    if (charCode >= 256) {
        return '&#' + charCode + ';';
    }

    const hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
    return '&#x' + internals.padLeft(hexValue, 2) + ';';
};


internals.padLeft = function (str, len) {

    while (str.length < len) {
        str = '0' + str;
    }

    return str;
};


internals.isSafe = function (charCode) {

    return (typeof internals.safeCharCodes[charCode] !== 'undefined');
};


internals.namedHtml = {
    '38': '&amp;',
    '60': '&lt;',
    '62': '&gt;',
    '34': '&quot;',
    '160': '&nbsp;',
    '162': '&cent;',
    '163': '&pound;',
    '164': '&curren;',
    '169': '&copy;',
    '174': '&reg;'
};


internals.safeCharCodes = (function () {

    const safe = {};

    for (let i = 32; i < 123; ++i) {

        if ((i >= 97) ||                    // a-z
            (i >= 65 && i <= 90) ||         // A-Z
            (i >= 48 && i <= 57) ||         // 0-9
            i === 32 ||                     // space
            i === 46 ||                     // .
            i === 44 ||                     // ,
            i === 45 ||                     // -
            i === 58 ||                     // :
            i === 95) {                     // _

            safe[i] = null;
        }
    }

    return safe;
}());

exports.assert = function (condition /*, msg1, msg2, msg3 */) {

  if (condition) {
    return;
  }

  if (arguments.length === 2 && arguments[1] instanceof Error) {
    throw arguments[1];
  }

  let msgs = [];
  for (let i = 1; i < arguments.length; ++i) {
    if (arguments[i] !== '') {
      msgs.push(arguments[i]);            // Avoids Array.slice arguments leak, allowing for V8 optimizations
    }
  }

  msgs = msgs.map((msg) => {

    return typeof msg === 'string' ? msg : msg instanceof Error ? msg.message
      : exports.stringify(msg);
  });

  throw new Error(msgs.join(' ') || 'Unknown error');
};


// Flatten array

exports.flatten = function (array, target) {

  const result = target || [];

  for (let i = 0; i < array.length; ++i) {
    if (Array.isArray(array[i])) {
      exports.flatten(array[i], result);
    }
    else {
      result.push(array[i]);
    }
  }

  return result;
};


// Convert an object key chain string ('a.b.c') to reference (object[a][b][c])

exports.reach = function (obj, chain, options) {

  if (chain === false ||
    chain === null ||
    typeof chain === 'undefined') {

    return obj;
  }

  options = options || {};
  if (typeof options === 'string') {
    options = {separator: options};
  }

  const path = chain.split(options.separator || '.');
  let ref = obj;
  for (let i = 0; i < path.length; ++i) {
    let key = path[i];
    if (key[0] === '-' && Array.isArray(ref)) {
      key = key.slice(1, key.length);
      key = ref.length - key;
    }

    if (!ref || !((typeof ref === 'object' || typeof ref === 'function') && key in ref) ||
      (typeof ref !== 'object' && options.functions === false)) {         // Only object and function can have properties

      exports.assert(!options.strict || i + 1 === path.length, 'Missing segment', key, 'in reach path ', chain);
      exports.assert(typeof ref === 'object' || options.functions === true || typeof ref !== 'function', 'Invalid segment', key, 'in reach path ', chain);
      ref = options.default;
      break;
    }

    ref = ref[key];
  }

  return ref;
};


// Clone object or array

exports.clone = function (obj, seen) {

  if (typeof obj !== 'object' ||
    obj === null) {

    return obj;
  }

  seen = seen || {orig: [], copy: []};

  const lookup = seen.orig.indexOf(obj);
  if (lookup !== -1) {
    return seen.copy[lookup];
  }

  let newObj;
  let cloneDeep = false;

  if (!Array.isArray(obj)) {
    if (obj instanceof Date) {
      newObj = new Date(obj.getTime());
    }
    else if (obj instanceof RegExp) {
      newObj = new RegExp(obj);
    }
    else {
      const proto = Object.getPrototypeOf(obj);
      if (proto &&
        proto.isImmutable) {

        newObj = obj;
      }
      else {
        newObj = Object.create(proto);
        cloneDeep = true;
      }
    }
  }
  else {
    newObj = [];
    cloneDeep = true;
  }

  seen.orig.push(obj);
  seen.copy.push(newObj);

  if (cloneDeep) {
    const keys = Object.getOwnPropertyNames(obj);
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      if (descriptor &&
        (descriptor.get ||
        descriptor.set)) {

        Object.defineProperty(newObj, key, descriptor);
      }
      else {
        newObj[key] = exports.clone(obj[key], seen);
      }
    }
  }

  return newObj;
};


exports.applyToDefaults = function (defaults, options, isNullOverride) {

  exports.assert(defaults && typeof defaults === 'object', 'Invalid defaults value: must be an object');
  exports.assert(!options || options === true || typeof options === 'object', 'Invalid options value: must be true, falsy or an object');

  if (!options) {                                                 // If no options, return null
    return null;
  }

  const copy = exports.clone(defaults);

  if (options === true) {                                         // If options is set to true, use defaults
    return copy;
  }

  return exports.merge(copy, options, isNullOverride === true, false);
};

// Merge all the properties of source into target, source wins in conflict, and by default null and undefined from source are applied

/*eslint-disable */
exports.merge = function (target, source, isNullOverride /* = true */, isMergeArrays /* = true */) {
  /*eslint-enable */

  exports.assert(target && typeof target === 'object', 'Invalid target value: must be an object');
  exports.assert(source === null || source === undefined || typeof source === 'object', 'Invalid source value: must be null, undefined, or an object');

  if (!source) {
    return target;
  }

  if (Array.isArray(source)) {
    exports.assert(Array.isArray(target), 'Cannot merge array onto an object');
    if (isMergeArrays === false) {                                                  // isMergeArrays defaults to true
      target.length = 0;                                                          // Must not change target assignment
    }

    for (let i = 0; i < source.length; ++i) {
      target.push(exports.clone(source[i]));
    }

    return target;
  }

  const keys = Object.keys(source);
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const value = source[key];
    if (value &&
      typeof value === 'object') {

      if (!target[key] ||
        typeof target[key] !== 'object' ||
        (Array.isArray(target[key]) ^ Array.isArray(value)) ||
        value instanceof Date ||
        Buffer.isBuffer(value) ||
        value instanceof RegExp) {

        target[key] = exports.clone(value);
      }
      else {
        exports.merge(target[key], value, isNullOverride, isMergeArrays);
      }
    }
    else {
      if (value !== null &&
        value !== undefined) {                              // Explicit to preserve empty strings

        target[key] = value;
      }
      else if (isNullOverride !== false) {                    // Defaults to true
        target[key] = value;
      }
    }
  }

  return target;
};


// Deep object or array comparison

exports.deepEqual = function (obj, ref, options, seen) {

  options = options || {prototype: true};

  const type = typeof obj;

  if (type !== typeof ref) {
    return false;
  }

  if (type !== 'object' ||
    obj === null ||
    ref === null) {

    if (obj === ref) {                                                      // Copied from Deep-eql, copyright(c) 2013 Jake Luer, jake@alogicalparadox.com, MIT Licensed, https://github.com/chaijs/deep-eql
      return obj !== 0 || 1 / obj === 1 / ref;        // -0 / +0
    }

    return obj !== obj && ref !== ref;                  // NaN
  }

  seen = seen || [];
  if (seen.indexOf(obj) !== -1) {
    return true;                            // If previous comparison failed, it would have stopped execution
  }

  seen.push(obj);

  if (Array.isArray(obj)) {
    if (!Array.isArray(ref)) {
      return false;
    }

    if (!options.part && obj.length !== ref.length) {
      return false;
    }

    for (let i = 0; i < obj.length; ++i) {
      if (options.part) {
        let found = false;
        for (let j = 0; j < ref.length; ++j) {
          if (exports.deepEqual(obj[i], ref[j], options)) {
            found = true;
            break;
          }
        }

        return found;
      }

      if (!exports.deepEqual(obj[i], ref[i], options)) {
        return false;
      }
    }

    return true;
  }

  if (obj instanceof Date) {
    return (ref instanceof Date && obj.getTime() === ref.getTime());
  }

  if (obj instanceof RegExp) {
    return (ref instanceof RegExp && obj.toString() === ref.toString());
  }

  if (options.prototype) {
    if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf(ref)) {
      return false;
    }
  }

  const keys = Object.getOwnPropertyNames(obj);

  if (!options.part && keys.length !== Object.getOwnPropertyNames(ref).length) {
    return false;
  }

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor.get) {
      if (!exports.deepEqual(descriptor, Object.getOwnPropertyDescriptor(ref, key), options, seen)) {
        return false;
      }
    }
    else if (!exports.deepEqual(obj[key], ref[key], options, seen)) {
      return false;
    }
  }

  return true;
};


// Convert array into object

exports.mapToObject = function (array, key) {

  if (!array) {
    return null;
  }

  const obj = {};
  for (let i = 0; i < array.length; ++i) {
    if (key) {
      if (array[i][key]) {
        obj[array[i][key]] = true;
      }
    }
    else {
      obj[array[i]] = true;
    }
  }

  return obj;
};

exports.isInteger = function (value) {

  return (typeof value === 'number' &&
  parseFloat(value) === parseInt(value, 10) && !isNaN(value));
};


exports.escapeRegex = function (string) {

  // Escape ^$.*+-?=!:|\/()[]{},
  return string.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&');
};