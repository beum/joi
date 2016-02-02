;(function (global, factory) {
 typeof exports === 'object' && typeof module !== 'undefined'
  ? module.exports = factory() :
typeof define === 'function' && define.amd ? define(factory) :
global.Joi = factory();
}(this, function () {
  var requireCache = {};
  function require (name) {
    return requireCache[name];
  }

'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

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

        if (ctor === undefined || ctor === null) throw new TypeError('The constructor to "inherits" must not be ' + 'null or undefined');

        if (superCtor === undefined || superCtor === null) throw new TypeError('The super constructor to "inherits" must not ' + 'be null or undefined');

        if (superCtor.prototype === undefined) throw new TypeError('The super constructor to "inherits" must ' + 'have a prototype');

        ctor.super_ = superCtor;
        Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
    };

    'use strict';

    // Declare internals

    var internals = {};

    exports.escapeJavaScript = function (input) {

        if (!input) {
            return '';
        }

        var escaped = '';

        for (var i = 0; i < input.length; ++i) {

            var charCode = input.charCodeAt(i);

            if (internals.isSafe(charCode)) {
                escaped += input[i];
            } else {
                escaped += internals.escapeJavaScriptChar(charCode);
            }
        }

        return escaped;
    };

    exports.escapeHtml = function (input) {

        if (!input) {
            return '';
        }

        var escaped = '';

        for (var i = 0; i < input.length; ++i) {

            var charCode = input.charCodeAt(i);

            if (internals.isSafe(charCode)) {
                escaped += input[i];
            } else {
                escaped += internals.escapeHtmlChar(charCode);
            }
        }

        return escaped;
    };

    internals.escapeJavaScriptChar = function (charCode) {

        if (charCode >= 256) {
            return '\\u' + internals.padLeft('' + charCode, 4);
        }

        var hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
        return '\\x' + internals.padLeft(hexValue, 2);
    };

    internals.escapeHtmlChar = function (charCode) {

        var namedEscape = internals.namedHtml[charCode];
        if (typeof namedEscape !== 'undefined') {
            return namedEscape;
        }

        if (charCode >= 256) {
            return '&#' + charCode + ';';
        }

        var hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
        return '&#x' + internals.padLeft(hexValue, 2) + ';';
    };

    internals.padLeft = function (str, len) {

        while (str.length < len) {
            str = '0' + str;
        }

        return str;
    };

    internals.isSafe = function (charCode) {

        return typeof internals.safeCharCodes[charCode] !== 'undefined';
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

        var safe = {};

        for (var i = 32; i < 123; ++i) {

            if (i >= 97 || // a-z
            i >= 65 && i <= 90 || // A-Z
            i >= 48 && i <= 57 || // 0-9
            i === 32 || // space
            i === 46 || // .
            i === 44 || // ,
            i === 45 || // -
            i === 58 || // :
            i === 95) {
                // _

                safe[i] = null;
            }
        }

        return safe;
    })();

    exports.assert = function (condition /*, msg1, msg2, msg3 */) {

        if (condition) {
            return;
        }

        if (arguments.length === 2 && arguments[1] instanceof Error) {
            throw arguments[1];
        }

        var msgs = [];
        for (var i = 1; i < arguments.length; ++i) {
            if (arguments[i] !== '') {
                msgs.push(arguments[i]); // Avoids Array.slice arguments leak, allowing for V8 optimizations
            }
        }

        msgs = msgs.map(function (msg) {

            return typeof msg === 'string' ? msg : msg instanceof Error ? msg.message : exports.stringify(msg);
        });

        throw new Error(msgs.join(' ') || 'Unknown error');
    };

    // Flatten array

    exports.flatten = function (array, target) {

        var result = target || [];

        for (var i = 0; i < array.length; ++i) {
            if (Array.isArray(array[i])) {
                exports.flatten(array[i], result);
            } else {
                result.push(array[i]);
            }
        }

        return result;
    };

    // Convert an object key chain string ('a.b.c') to reference (object[a][b][c])

    exports.reach = function (obj, chain, options) {

        if (chain === false || chain === null || typeof chain === 'undefined') {

            return obj;
        }

        options = options || {};
        if (typeof options === 'string') {
            options = { separator: options };
        }

        var path = chain.split(options.separator || '.');
        var ref = obj;
        for (var i = 0; i < path.length; ++i) {
            var key = path[i];
            if (key[0] === '-' && Array.isArray(ref)) {
                key = key.slice(1, key.length);
                key = ref.length - key;
            }

            if (!ref || !(((typeof ref === 'undefined' ? 'undefined' : _typeof(ref)) === 'object' || typeof ref === 'function') && key in ref) || (typeof ref === 'undefined' ? 'undefined' : _typeof(ref)) !== 'object' && options.functions === false) {
                // Only object and function can have properties

                exports.assert(!options.strict || i + 1 === path.length, 'Missing segment', key, 'in reach path ', chain);
                exports.assert((typeof ref === 'undefined' ? 'undefined' : _typeof(ref)) === 'object' || options.functions === true || typeof ref !== 'function', 'Invalid segment', key, 'in reach path ', chain);
                ref = options.default;
                break;
            }

            ref = ref[key];
        }

        return ref;
    };

    // Clone object or array

    exports.clone = function (obj, seen) {

        if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) {

            return obj;
        }

        seen = seen || { orig: [], copy: [] };

        var lookup = seen.orig.indexOf(obj);
        if (lookup !== -1) {
            return seen.copy[lookup];
        }

        var newObj = undefined;
        var cloneDeep = false;

        if (!Array.isArray(obj)) {
            if (obj instanceof Date) {
                newObj = new Date(obj.getTime());
            } else if (obj instanceof RegExp) {
                newObj = new RegExp(obj);
            } else {
                var proto = Object.getPrototypeOf(obj);
                if (proto && proto.isImmutable) {

                    newObj = obj;
                } else {
                    newObj = Object.create(proto);
                    cloneDeep = true;
                }
            }
        } else {
            newObj = [];
            cloneDeep = true;
        }

        seen.orig.push(obj);
        seen.copy.push(newObj);

        if (cloneDeep) {
            var keys = Object.getOwnPropertyNames(obj);
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                var descriptor = Object.getOwnPropertyDescriptor(obj, key);
                if (descriptor && (descriptor.get || descriptor.set)) {

                    Object.defineProperty(newObj, key, descriptor);
                } else {
                    newObj[key] = exports.clone(obj[key], seen);
                }
            }
        }

        return newObj;
    };

    exports.applyToDefaults = function (defaults, options, isNullOverride) {

        exports.assert(defaults && (typeof defaults === 'undefined' ? 'undefined' : _typeof(defaults)) === 'object', 'Invalid defaults value: must be an object');
        exports.assert(!options || options === true || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object', 'Invalid options value: must be true, falsy or an object');

        if (!options) {
            // If no options, return null
            return null;
        }

        var copy = exports.clone(defaults);

        if (options === true) {
            // If options is set to true, use defaults
            return copy;
        }

        return exports.merge(copy, options, isNullOverride === true, false);
    };

    // Merge all the properties of source into target, source wins in conflict, and by default null and undefined from source are applied

    /*eslint-disable */
    exports.merge = function (target, source, isNullOverride /* = true */, isMergeArrays /* = true */) {
        /*eslint-enable */

        exports.assert(target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object', 'Invalid target value: must be an object');
        exports.assert(source === null || source === undefined || (typeof source === 'undefined' ? 'undefined' : _typeof(source)) === 'object', 'Invalid source value: must be null, undefined, or an object');

        if (!source) {
            return target;
        }

        if (Array.isArray(source)) {
            exports.assert(Array.isArray(target), 'Cannot merge array onto an object');
            if (isMergeArrays === false) {
                // isMergeArrays defaults to true
                target.length = 0; // Must not change target assignment
            }

            for (var i = 0; i < source.length; ++i) {
                target.push(exports.clone(source[i]));
            }

            return target;
        }

        var keys = Object.keys(source);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var value = source[key];
            if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {

                if (!target[key] || _typeof(target[key]) !== 'object' || Array.isArray(target[key]) ^ Array.isArray(value) || value instanceof Date || Buffer.isBuffer(value) || value instanceof RegExp) {

                    target[key] = exports.clone(value);
                } else {
                    exports.merge(target[key], value, isNullOverride, isMergeArrays);
                }
            } else {
                if (value !== null && value !== undefined) {
                    // Explicit to preserve empty strings

                    target[key] = value;
                } else if (isNullOverride !== false) {
                    // Defaults to true
                    target[key] = value;
                }
            }
        }

        return target;
    };

    // Deep object or array comparison

    exports.deepEqual = function (obj, ref, options, seen) {

        options = options || { prototype: true };

        var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);

        if (type !== (typeof ref === 'undefined' ? 'undefined' : _typeof(ref))) {
            return false;
        }

        if (type !== 'object' || obj === null || ref === null) {

            if (obj === ref) {
                // Copied from Deep-eql, copyright(c) 2013 Jake Luer, jake@alogicalparadox.com, MIT Licensed, https://github.com/chaijs/deep-eql
                return obj !== 0 || 1 / obj === 1 / ref; // -0 / +0
            }

            return obj !== obj && ref !== ref; // NaN
        }

        seen = seen || [];
        if (seen.indexOf(obj) !== -1) {
            return true; // If previous comparison failed, it would have stopped execution
        }

        seen.push(obj);

        if (Array.isArray(obj)) {
            if (!Array.isArray(ref)) {
                return false;
            }

            if (!options.part && obj.length !== ref.length) {
                return false;
            }

            for (var i = 0; i < obj.length; ++i) {
                if (options.part) {
                    var found = false;
                    for (var j = 0; j < ref.length; ++j) {
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
            return ref instanceof Date && obj.getTime() === ref.getTime();
        }

        if (obj instanceof RegExp) {
            return ref instanceof RegExp && obj.toString() === ref.toString();
        }

        if (options.prototype) {
            if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf(ref)) {
                return false;
            }
        }

        var keys = Object.getOwnPropertyNames(obj);

        if (!options.part && keys.length !== Object.getOwnPropertyNames(ref).length) {
            return false;
        }

        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var descriptor = Object.getOwnPropertyDescriptor(obj, key);
            if (descriptor.get) {
                if (!exports.deepEqual(descriptor, Object.getOwnPropertyDescriptor(ref, key), options, seen)) {
                    return false;
                }
            } else if (!exports.deepEqual(obj[key], ref[key], options, seen)) {
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

        var obj = {};
        for (var i = 0; i < array.length; ++i) {
            if (key) {
                if (array[i][key]) {
                    obj[array[i][key]] = true;
                }
            } else {
                obj[array[i]] = true;
            }
        }

        return obj;
    };

    exports.isInteger = function (value) {

        return typeof value === 'number' && parseFloat(value) === parseInt(value, 10) && !isNaN(value);
    };

    exports.escapeRegex = function (string) {

        // Escape ^$.*+-?=!:|\/()[]{},
        return string.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&');
    };

    cache["hoek"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    //const Dns = require('dns');

    // Declare internals

    var internals = {
        hasOwn: Object.prototype.hasOwnProperty,
        indexOf: Array.prototype.indexOf,
        defaultThreshold: 16,
        maxIPv6Groups: 8,

        categories: {
            valid: 1,
            dnsWarn: 7,
            rfc5321: 15,
            cfws: 31,
            deprecated: 63,
            rfc5322: 127,
            error: 255
        },

        diagnoses: {

            // Address is valid

            valid: 0,

            // Address is valid, but the DNS check failed

            dnsWarnNoMXRecord: 5,
            dnsWarnNoRecord: 6,

            // Address is valid for SMTP but has unusual elements

            rfc5321TLD: 9,
            rfc5321TLDNumeric: 10,
            rfc5321QuotedString: 11,
            rfc5321AddressLiteral: 12,

            // Address is valid for message, but must be modified for envelope

            cfwsComment: 17,
            cfwsFWS: 18,

            // Address contains deprecated elements, but may still be valid in some contexts

            deprecatedLocalPart: 33,
            deprecatedFWS: 34,
            deprecatedQTEXT: 35,
            deprecatedQP: 36,
            deprecatedComment: 37,
            deprecatedCTEXT: 38,
            deprecatedIPv6: 39,
            deprecatedCFWSNearAt: 49,

            // Address is only valid according to broad definition in RFC 5322, but is otherwise invalid

            rfc5322Domain: 65,
            rfc5322TooLong: 66,
            rfc5322LocalTooLong: 67,
            rfc5322DomainTooLong: 68,
            rfc5322LabelTooLong: 69,
            rfc5322DomainLiteral: 70,
            rfc5322DomainLiteralOBSDText: 71,
            rfc5322IPv6GroupCount: 72,
            rfc5322IPv62x2xColon: 73,
            rfc5322IPv6BadCharacter: 74,
            rfc5322IPv6MaxGroups: 75,
            rfc5322IPv6ColonStart: 76,
            rfc5322IPv6ColonEnd: 77,

            // Address is invalid for any purpose

            errExpectingDTEXT: 129,
            errNoLocalPart: 130,
            errNoDomain: 131,
            errConsecutiveDots: 132,
            errATEXTAfterCFWS: 133,
            errATEXTAfterQS: 134,
            errATEXTAfterDomainLiteral: 135,
            errExpectingQPair: 136,
            errExpectingATEXT: 137,
            errExpectingQTEXT: 138,
            errExpectingCTEXT: 139,
            errBackslashEnd: 140,
            errDotStart: 141,
            errDotEnd: 142,
            errDomainHyphenStart: 143,
            errDomainHyphenEnd: 144,
            errUnclosedQuotedString: 145,
            errUnclosedComment: 146,
            errUnclosedDomainLiteral: 147,
            errFWSCRLFx2: 148,
            errFWSCRLFEnd: 149,
            errCRNoLF: 150,
            errUnknownTLD: 160,
            errDomainTooShort: 161
        },

        components: {
            localpart: 0,
            domain: 1,
            literal: 2,
            contextComment: 3,
            contextFWS: 4,
            contextQuotedString: 5,
            contextQuotedPair: 6
        }
    };

    // $lab:coverage:off$
    internals.defer = typeof process !== 'undefined' && process && typeof process.nextTick === 'function' ? process.nextTick.bind(process) : function (callback) {

        return setTimeout(callback, 0);
    };
    // $lab:coverage:on$

    internals.specials = (function () {

        var specials = '()<>[]:;@\\,."'; // US-ASCII visible characters not valid for atext (http://tools.ietf.org/html/rfc5322#section-3.2.3)
        var lookup = new Array(0x100);
        for (var i = 0xff; i >= 0; --i) {
            lookup[i] = false;
        }

        for (var i = 0; i < specials.length; ++i) {
            lookup[specials.charCodeAt(i)] = true;
        }

        var body = 'return function (code) {\n  return lookup[code];\n}';
        return new Function('lookup', body)(lookup);
    })();

    internals.regex = {
        ipV4: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
        ipV6: /^[a-fA-F\d]{0,4}$/
    };

    internals.checkIpV6 = function (items) {

        return items.every(function (value) {
            return internals.regex.ipV6.test(value);
        });
    };

    internals.validDomain = function (tldAtom, options) {

        if (options.tldBlacklist) {
            if (Array.isArray(options.tldBlacklist)) {
                return internals.indexOf.call(options.tldBlacklist, tldAtom) === -1;
            }

            return !internals.hasOwn.call(options.tldBlacklist, tldAtom);
        }

        if (Array.isArray(options.tldWhitelist)) {
            return internals.indexOf.call(options.tldWhitelist, tldAtom) !== -1;
        }

        return internals.hasOwn.call(options.tldWhitelist, tldAtom);
    };

    /**
     * Check that an email address conforms to RFCs 5321, 5322 and others
     *
     * We distinguish clearly between a Mailbox as defined by RFC 5321 and an
     * addr-spec as defined by RFC 5322. Depending on the context, either can be
     * regarded as a valid email address. The RFC 5321 Mailbox specification is
     * more restrictive (comments, white space and obsolete forms are not allowed).
     *
     * @param {string} email The email address to check. See README for specifics.
     * @param {Object} options The (optional) options:
     *   {boolean} checkDNS If true then will check DNS for MX records. If
     *     true this call to isEmail _will_ be asynchronous.
     *   {*} errorLevel Determines the boundary between valid and invalid
     *     addresses.
     *   {*} tldBlacklist The set of domains to consider invalid.
     *   {*} tldWhitelist The set of domains to consider valid.
     *   {*} minDomainAtoms The minimum number of domain atoms which must be present
     *     for the address to be valid.
     * @param {function(number|boolean)} callback The (optional) callback handler.
     * @return {*}
     */

    exports.validate = internals.validate = function (email, options, callback) {

        options = options || {};

        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        if (typeof callback !== 'function') {
            if (options.checkDNS) {
                throw new TypeError('expected callback function for checkDNS option');
            }

            callback = null;
        }

        var diagnose = undefined;
        var threshold = undefined;

        if (typeof options.errorLevel === 'number') {
            diagnose = true;
            threshold = options.errorLevel;
        } else {
            diagnose = !!options.errorLevel;
            threshold = internals.diagnoses.valid;
        }

        if (options.tldWhitelist) {
            if (typeof options.tldWhitelist === 'string') {
                options.tldWhitelist = [options.tldWhitelist];
            } else if (_typeof(options.tldWhitelist) !== 'object') {
                throw new TypeError('expected array or object tldWhitelist');
            }
        }

        if (options.tldBlacklist) {
            if (typeof options.tldBlacklist === 'string') {
                options.tldBlacklist = [options.tldBlacklist];
            } else if (_typeof(options.tldBlacklist) !== 'object') {
                throw new TypeError('expected array or object tldBlacklist');
            }
        }

        if (options.minDomainAtoms && (options.minDomainAtoms !== (+options.minDomainAtoms | 0) || options.minDomainAtoms < 0)) {
            throw new TypeError('expected positive integer minDomainAtoms');
        }

        var maxResult = internals.diagnoses.valid;
        var updateResult = function updateResult(value) {

            if (value > maxResult) {
                maxResult = value;
            }
        };

        var context = {
            now: internals.components.localpart,
            prev: internals.components.localpart,
            stack: [internals.components.localpart]
        };

        var prevToken = '';

        var parseData = {
            local: '',
            domain: ''
        };
        var atomData = {
            locals: [''],
            domains: ['']
        };

        var elementCount = 0;
        var elementLength = 0;
        var crlfCount = 0;
        var charCode = undefined;

        var hyphenFlag = false;
        var assertEnd = false;

        var emailLength = email.length;

        var token = undefined; // Token is used outside the loop, must declare similarly
        for (var i = 0; i < emailLength; ++i) {
            token = email[i];

            switch (context.now) {
                // Local-part
                case internals.components.localpart:
                    // http://tools.ietf.org/html/rfc5322#section-3.4.1
                    //   local-part      =   dot-atom / quoted-string / obs-local-part
                    //
                    //   dot-atom        =   [CFWS] dot-atom-text [CFWS]
                    //
                    //   dot-atom-text   =   1*atext *("." 1*atext)
                    //
                    //   quoted-string   =   [CFWS]
                    //                       DQUOTE *([FWS] qcontent) [FWS] DQUOTE
                    //                       [CFWS]
                    //
                    //   obs-local-part  =   word *("." word)
                    //
                    //   word            =   atom / quoted-string
                    //
                    //   atom            =   [CFWS] 1*atext [CFWS]
                    switch (token) {
                        // Comment
                        case '(':
                            if (elementLength === 0) {
                                // Comments are OK at the beginning of an element
                                updateResult(elementCount === 0 ? internals.diagnoses.cfwsComment : internals.diagnoses.deprecatedComment);
                            } else {
                                updateResult(internals.diagnoses.cfwsComment);
                                // Cannot start a comment in an element, should be end
                                assertEnd = true;
                            }

                            context.stack.push(context.now);
                            context.now = internals.components.contextComment;
                            break;

                        // Next dot-atom element
                        case '.':
                            if (elementLength === 0) {
                                // Another dot, already?
                                updateResult(elementCount === 0 ? internals.diagnoses.errDotStart : internals.diagnoses.errConsecutiveDots);
                            } else {
                                // The entire local-part can be a quoted string for RFC 5321; if one atom is quoted it's an RFC 5322 obsolete form
                                if (assertEnd) {
                                    updateResult(internals.diagnoses.deprecatedLocalPart);
                                }

                                // CFWS & quoted strings are OK again now we're at the beginning of an element (although they are obsolete forms)
                                assertEnd = false;
                                elementLength = 0;
                                ++elementCount;
                                parseData.local += token;
                                atomData.locals[elementCount] = '';
                            }

                            break;

                        // Quoted string
                        case '"':
                            if (elementLength === 0) {
                                // The entire local-part can be a quoted string for RFC 5321; if one atom is quoted it's an RFC 5322 obsolete form
                                updateResult(elementCount === 0 ? internals.diagnoses.rfc5321QuotedString : internals.diagnoses.deprecatedLocalPart);

                                parseData.local += token;
                                atomData.locals[elementCount] += token;
                                ++elementLength;

                                // Quoted string must be the entire element
                                assertEnd = true;
                                context.stack.push(context.now);
                                context.now = internals.components.contextQuotedString;
                            } else {
                                updateResult(internals.diagnoses.errExpectingATEXT);
                            }

                            break;

                        // Folding white space
                        case '\r':
                            if (emailLength === ++i || email[i] !== '\n') {
                                // Fatal error
                                updateResult(internals.diagnoses.errCRNoLF);
                                break;
                            }

                        // Fallthrough

                        case ' ':
                        case '\t':
                            if (elementLength === 0) {
                                updateResult(elementCount === 0 ? internals.diagnoses.cfwsFWS : internals.diagnoses.deprecatedFWS);
                            } else {
                                // We can't start FWS in the middle of an element, better be end
                                assertEnd = true;
                            }

                            context.stack.push(context.now);
                            context.now = internals.components.contextFWS;
                            prevToken = token;
                            break;

                        case '@':
                            // At this point we should have a valid local-part
                            // $lab:coverage:off$
                            if (context.stack.length !== 1) {
                                throw new Error('unexpected item on context stack');
                            }
                            // $lab:coverage:on$

                            if (parseData.local.length === 0) {
                                // Fatal error
                                updateResult(internals.diagnoses.errNoLocalPart);
                            } else if (elementLength === 0) {
                                // Fatal error
                                updateResult(internals.diagnoses.errDotEnd);
                            }
                            // http://tools.ietf.org/html/rfc5321#section-4.5.3.1.1 the maximum total length of a user name or other local-part is 64
                            //    octets
                            else if (parseData.local.length > 64) {
                                    updateResult(internals.diagnoses.rfc5322LocalTooLong);
                                }
                                // http://tools.ietf.org/html/rfc5322#section-3.4.1 comments and folding white space SHOULD NOT be used around "@" in the
                                //    addr-spec
                                //
                                // http://tools.ietf.org/html/rfc2119
                                // 4. SHOULD NOT this phrase, or the phrase "NOT RECOMMENDED" mean that there may exist valid reasons in particular
                                //    circumstances when the particular behavior is acceptable or even useful, but the full implications should be understood
                                //    and the case carefully weighed before implementing any behavior described with this label.
                                else if (context.prev === internals.components.contextComment || context.prev === internals.components.contextFWS) {
                                        updateResult(internals.diagnoses.deprecatedCFWSNearAt);
                                    }

                            // Clear everything down for the domain parsing
                            context.now = internals.components.domain;
                            context.stack[0] = internals.components.domain;
                            elementCount = 0;
                            elementLength = 0;
                            assertEnd = false; // CFWS can only appear at the end of the element
                            break;

                        // ATEXT
                        default:
                            // http://tools.ietf.org/html/rfc5322#section-3.2.3
                            //    atext = ALPHA / DIGIT / ; Printable US-ASCII
                            //            "!" / "#" /     ;  characters not including
                            //            "$" / "%" /     ;  specials.  Used for atoms.
                            //            "&" / "'" /
                            //            "*" / "+" /
                            //            "-" / "/" /
                            //            "=" / "?" /
                            //            "^" / "_" /
                            //            "`" / "{" /
                            //            "|" / "}" /
                            //            "~"
                            if (assertEnd) {
                                // We have encountered atext where it is no longer valid
                                switch (context.prev) {
                                    case internals.components.contextComment:
                                    case internals.components.contextFWS:
                                        updateResult(internals.diagnoses.errATEXTAfterCFWS);
                                        break;

                                    case internals.components.contextQuotedString:
                                        updateResult(internals.diagnoses.errATEXTAfterQS);
                                        break;

                                    // $lab:coverage:off$
                                    default:
                                        throw new Error('more atext found where none is allowed, but unrecognized prev context: ' + context.prev);
                                    // $lab:coverage:on$
                                }
                            } else {
                                    context.prev = context.now;
                                    charCode = token.charCodeAt(0);

                                    // Especially if charCode == 10
                                    if (charCode < 33 || charCode > 126 || internals.specials(charCode)) {

                                        // Fatal error
                                        updateResult(internals.diagnoses.errExpectingATEXT);
                                    }

                                    parseData.local += token;
                                    atomData.locals[elementCount] += token;
                                    ++elementLength;
                                }
                    }

                    break;

                case internals.components.domain:
                    // http://tools.ietf.org/html/rfc5322#section-3.4.1
                    //   domain          =   dot-atom / domain-literal / obs-domain
                    //
                    //   dot-atom        =   [CFWS] dot-atom-text [CFWS]
                    //
                    //   dot-atom-text   =   1*atext *("." 1*atext)
                    //
                    //   domain-literal  =   [CFWS] "[" *([FWS] dtext) [FWS] "]" [CFWS]
                    //
                    //   dtext           =   %d33-90 /          ; Printable US-ASCII
                    //                       %d94-126 /         ;  characters not including
                    //                       obs-dtext          ;  "[", "]", or "\"
                    //
                    //   obs-domain      =   atom *("." atom)
                    //
                    //   atom            =   [CFWS] 1*atext [CFWS]

                    // http://tools.ietf.org/html/rfc5321#section-4.1.2
                    //   Mailbox        = Local-part "@" ( Domain / address-literal )
                    //
                    //   Domain         = sub-domain *("." sub-domain)
                    //
                    //   address-literal  = "[" ( IPv4-address-literal /
                    //                    IPv6-address-literal /
                    //                    General-address-literal ) "]"
                    //                    ; See Section 4.1.3

                    // http://tools.ietf.org/html/rfc5322#section-3.4.1
                    //      Note: A liberal syntax for the domain portion of addr-spec is
                    //      given here.  However, the domain portion contains addressing
                    //      information specified by and used in other protocols (e.g.,
                    //      [RFC1034], [RFC1035], [RFC1123], [RFC5321]).  It is therefore
                    //      incumbent upon implementations to conform to the syntax of
                    //      addresses for the context in which they are used.
                    //
                    // is_email() author's note: it's not clear how to interpret this in
                    // he context of a general email address validator. The conclusion I
                    // have reached is this: "addressing information" must comply with
                    // RFC 5321 (and in turn RFC 1035), anything that is "semantically
                    // invisible" must comply only with RFC 5322.
                    switch (token) {
                        // Comment
                        case '(':
                            if (elementLength === 0) {
                                // Comments at the start of the domain are deprecated in the text, comments at the start of a subdomain are obs-domain
                                // http://tools.ietf.org/html/rfc5322#section-3.4.1
                                updateResult(elementCount === 0 ? internals.diagnoses.deprecatedCFWSNearAt : internals.diagnoses.deprecatedComment);
                            } else {
                                // We can't start a comment mid-element, better be at the end
                                assertEnd = true;
                                updateResult(internals.diagnoses.cfwsComment);
                            }

                            context.stack.push(context.now);
                            context.now = internals.components.contextComment;
                            break;

                        // Next dot-atom element
                        case '.':
                            if (elementLength === 0) {
                                // Another dot, already? Fatal error.
                                updateResult(elementCount === 0 ? internals.diagnoses.errDotStart : internals.diagnoses.errConsecutiveDots);
                            } else if (hyphenFlag) {
                                // Previous subdomain ended in a hyphen. Fatal error.
                                updateResult(internals.diagnoses.errDomainHyphenEnd);
                            } else if (elementLength > 63) {
                                // Nowhere in RFC 5321 does it say explicitly that the domain part of a Mailbox must be a valid domain according to the
                                // DNS standards set out in RFC 1035, but this *is* implied in several places. For instance, wherever the idea of host
                                // routing is discussed the RFC says that the domain must be looked up in the DNS. This would be nonsense unless the
                                // domain was designed to be a valid DNS domain. Hence we must conclude that the RFC 1035 restriction on label length
                                // also applies to RFC 5321 domains.
                                //
                                // http://tools.ietf.org/html/rfc1035#section-2.3.4
                                // labels          63 octets or less

                                updateResult(internals.diagnoses.rfc5322LabelTooLong);
                            }

                            // CFWS is OK again now we're at the beginning of an element (although
                            // it may be obsolete CFWS)
                            assertEnd = false;
                            elementLength = 0;
                            ++elementCount;
                            atomData.domains[elementCount] = '';
                            parseData.domain += token;

                            break;

                        // Domain literal
                        case '[':
                            if (parseData.domain.length === 0) {
                                // Domain literal must be the only component
                                assertEnd = true;
                                ++elementLength;
                                context.stack.push(context.now);
                                context.now = internals.components.literal;
                                parseData.domain += token;
                                atomData.domains[elementCount] += token;
                                parseData.literal = '';
                            } else {
                                // Fatal error
                                updateResult(internals.diagnoses.errExpectingATEXT);
                            }

                            break;

                        // Folding white space
                        case '\r':
                            if (emailLength === ++i || email[i] !== '\n') {
                                // Fatal error
                                updateResult(internals.diagnoses.errCRNoLF);
                                break;
                            }

                        // Fallthrough

                        case ' ':
                        case '\t':
                            if (elementLength === 0) {
                                updateResult(elementCount === 0 ? internals.diagnoses.deprecatedCFWSNearAt : internals.diagnoses.deprecatedFWS);
                            } else {
                                // We can't start FWS in the middle of an element, so this better be the end
                                updateResult(internals.diagnoses.cfwsFWS);
                                assertEnd = true;
                            }

                            context.stack.push(context.now);
                            context.now = internals.components.contextFWS;
                            prevToken = token;
                            break;

                        // This must be ATEXT
                        default:
                            // RFC 5322 allows any atext...
                            // http://tools.ietf.org/html/rfc5322#section-3.2.3
                            //    atext = ALPHA / DIGIT / ; Printable US-ASCII
                            //            "!" / "#" /     ;  characters not including
                            //            "$" / "%" /     ;  specials.  Used for atoms.
                            //            "&" / "'" /
                            //            "*" / "+" /
                            //            "-" / "/" /
                            //            "=" / "?" /
                            //            "^" / "_" /
                            //            "`" / "{" /
                            //            "|" / "}" /
                            //            "~"

                            // But RFC 5321 only allows letter-digit-hyphen to comply with DNS rules
                            //   (RFCs 1034 & 1123)
                            // http://tools.ietf.org/html/rfc5321#section-4.1.2
                            //   sub-domain     = Let-dig [Ldh-str]
                            //
                            //   Let-dig        = ALPHA / DIGIT
                            //
                            //   Ldh-str        = *( ALPHA / DIGIT / "-" ) Let-dig
                            //
                            if (assertEnd) {
                                // We have encountered ATEXT where it is no longer valid
                                switch (context.prev) {
                                    case internals.components.contextComment:
                                    case internals.components.contextFWS:
                                        updateResult(internals.diagnoses.errATEXTAfterCFWS);
                                        break;

                                    case internals.components.literal:
                                        updateResult(internals.diagnoses.errATEXTAfterDomainLiteral);
                                        break;

                                    // $lab:coverage:off$
                                    default:
                                        throw new Error('more atext found where none is allowed, but unrecognized prev context: ' + context.prev);
                                    // $lab:coverage:on$
                                }
                            }

                            charCode = token.charCodeAt(0);
                            // Assume this token isn't a hyphen unless we discover it is
                            hyphenFlag = false;

                            if (charCode < 33 || charCode > 126 || internals.specials(charCode)) {
                                // Fatal error
                                updateResult(internals.diagnoses.errExpectingATEXT);
                            } else if (token === '-') {
                                if (elementLength === 0) {
                                    // Hyphens cannot be at the beginning of a subdomain, fatal error
                                    updateResult(internals.diagnoses.errDomainHyphenStart);
                                }

                                hyphenFlag = true;
                            }
                            // Check if it's a neither a number nor a latin letter
                            else if (charCode < 48 || charCode > 122 || charCode > 57 && charCode < 65 || charCode > 90 && charCode < 97) {
                                    // This is not an RFC 5321 subdomain, but still OK by RFC 5322
                                    updateResult(internals.diagnoses.rfc5322Domain);
                                }

                            parseData.domain += token;
                            atomData.domains[elementCount] += token;
                            ++elementLength;
                    }

                    break;

                // Domain literal
                case internals.components.literal:
                    // http://tools.ietf.org/html/rfc5322#section-3.4.1
                    //   domain-literal  =   [CFWS] "[" *([FWS] dtext) [FWS] "]" [CFWS]
                    //
                    //   dtext           =   %d33-90 /          ; Printable US-ASCII
                    //                       %d94-126 /         ;  characters not including
                    //                       obs-dtext          ;  "[", "]", or "\"
                    //
                    //   obs-dtext       =   obs-NO-WS-CTL / quoted-pair
                    switch (token) {
                        // End of domain literal
                        case ']':
                            if (maxResult < internals.categories.deprecated) {
                                // Could be a valid RFC 5321 address literal, so let's check

                                // http://tools.ietf.org/html/rfc5321#section-4.1.2
                                //   address-literal  = "[" ( IPv4-address-literal /
                                //                    IPv6-address-literal /
                                //                    General-address-literal ) "]"
                                //                    ; See Section 4.1.3
                                //
                                // http://tools.ietf.org/html/rfc5321#section-4.1.3
                                //   IPv4-address-literal  = Snum 3("."  Snum)
                                //
                                //   IPv6-address-literal  = "IPv6:" IPv6-addr
                                //
                                //   General-address-literal  = Standardized-tag ":" 1*dcontent
                                //
                                //   Standardized-tag  = Ldh-str
                                //                     ; Standardized-tag MUST be specified in a
                                //                     ; Standards-Track RFC and registered with IANA
                                //
                                //   dcontent      = %d33-90 / ; Printable US-ASCII
                                //                 %d94-126 ; excl. "[", "\", "]"
                                //
                                //   Snum          = 1*3DIGIT
                                //                 ; representing a decimal integer
                                //                 ; value in the range 0 through 255
                                //
                                //   IPv6-addr     = IPv6-full / IPv6-comp / IPv6v4-full / IPv6v4-comp
                                //
                                //   IPv6-hex      = 1*4HEXDIG
                                //
                                //   IPv6-full     = IPv6-hex 7(":" IPv6-hex)
                                //
                                //   IPv6-comp     = [IPv6-hex *5(":" IPv6-hex)] "::"
                                //                 [IPv6-hex *5(":" IPv6-hex)]
                                //                 ; The "::" represents at least 2 16-bit groups of
                                //                 ; zeros.  No more than 6 groups in addition to the
                                //                 ; "::" may be present.
                                //
                                //   IPv6v4-full   = IPv6-hex 5(":" IPv6-hex) ":" IPv4-address-literal
                                //
                                //   IPv6v4-comp   = [IPv6-hex *3(":" IPv6-hex)] "::"
                                //                 [IPv6-hex *3(":" IPv6-hex) ":"]
                                //                 IPv4-address-literal
                                //                 ; The "::" represents at least 2 16-bit groups of
                                //                 ; zeros.  No more than 4 groups in addition to the
                                //                 ; "::" and IPv4-address-literal may be present.

                                var index = -1;
                                var addressLiteral = parseData.literal;
                                var matchesIP = internals.regex.ipV4.exec(addressLiteral);

                                // Maybe extract IPv4 part from the end of the address-literal
                                if (matchesIP) {
                                    index = matchesIP.index;
                                    if (index !== 0) {
                                        // Convert IPv4 part to IPv6 format for futher testing
                                        addressLiteral = addressLiteral.slice(0, index) + '0:0';
                                    }
                                }

                                if (index === 0) {
                                    // Nothing there except a valid IPv4 address, so...
                                    updateResult(internals.diagnoses.rfc5321AddressLiteral);
                                } else if (addressLiteral.slice(0, 5).toLowerCase() !== 'ipv6:') {
                                    updateResult(internals.diagnoses.rfc5322DomainLiteral);
                                } else {
                                    var match = addressLiteral.slice(5);
                                    var maxGroups = internals.maxIPv6Groups;
                                    var groups = match.split(':');
                                    index = match.indexOf('::');

                                    if (! ~index) {
                                        // Need exactly the right number of groups
                                        if (groups.length !== maxGroups) {
                                            updateResult(internals.diagnoses.rfc5322IPv6GroupCount);
                                        }
                                    } else if (index !== match.lastIndexOf('::')) {
                                        updateResult(internals.diagnoses.rfc5322IPv62x2xColon);
                                    } else {
                                        if (index === 0 || index === match.length - 2) {
                                            // RFC 4291 allows :: at the start or end of an address with 7 other groups in addition
                                            ++maxGroups;
                                        }

                                        if (groups.length > maxGroups) {
                                            updateResult(internals.diagnoses.rfc5322IPv6MaxGroups);
                                        } else if (groups.length === maxGroups) {
                                            // Eliding a single "::"
                                            updateResult(internals.diagnoses.deprecatedIPv6);
                                        }
                                    }

                                    // IPv6 testing strategy
                                    if (match[0] === ':' && match[1] !== ':') {
                                        updateResult(internals.diagnoses.rfc5322IPv6ColonStart);
                                    } else if (match[match.length - 1] === ':' && match[match.length - 2] !== ':') {
                                        updateResult(internals.diagnoses.rfc5322IPv6ColonEnd);
                                    } else if (internals.checkIpV6(groups)) {
                                        updateResult(internals.diagnoses.rfc5321AddressLiteral);
                                    } else {
                                        updateResult(internals.diagnoses.rfc5322IPv6BadCharacter);
                                    }
                                }
                            } else {
                                updateResult(internals.diagnoses.rfc5322DomainLiteral);
                            }

                            parseData.domain += token;
                            atomData.domains[elementCount] += token;
                            ++elementLength;
                            context.prev = context.now;
                            context.now = context.stack.pop();
                            break;

                        case '\\':
                            updateResult(internals.diagnoses.rfc5322DomainLiteralOBSDText);
                            context.stack.push(context.now);
                            context.now = internals.components.contextQuotedPair;
                            break;

                        // Folding white space
                        case '\r':
                            if (emailLength === ++i || email[i] !== '\n') {
                                updateResult(internals.diagnoses.errCRNoLF);
                                break;
                            }

                        // Fallthrough

                        case ' ':
                        case '\t':
                            updateResult(internals.diagnoses.cfwsFWS);

                            context.stack.push(context.now);
                            context.now = internals.components.contextFWS;
                            prevToken = token;
                            break;

                        // DTEXT
                        default:
                            // http://tools.ietf.org/html/rfc5322#section-3.4.1
                            //   dtext         =   %d33-90 /  ; Printable US-ASCII
                            //                     %d94-126 / ;  characters not including
                            //                     obs-dtext  ;  "[", "]", or "\"
                            //
                            //   obs-dtext     =   obs-NO-WS-CTL / quoted-pair
                            //
                            //   obs-NO-WS-CTL =   %d1-8 /    ; US-ASCII control
                            //                     %d11 /     ;  characters that do not
                            //                     %d12 /     ;  include the carriage
                            //                     %d14-31 /  ;  return, line feed, and
                            //                     %d127      ;  white space characters
                            charCode = token.charCodeAt(0);

                            // '\r', '\n', ' ', and '\t' have already been parsed above
                            if (charCode > 127 || charCode === 0 || token === '[') {
                                // Fatal error
                                updateResult(internals.diagnoses.errExpectingDTEXT);
                                break;
                            } else if (charCode < 33 || charCode === 127) {
                                updateResult(internals.diagnoses.rfc5322DomainLiteralOBSDText);
                            }

                            parseData.literal += token;
                            parseData.domain += token;
                            atomData.domains[elementCount] += token;
                            ++elementLength;
                    }

                    break;

                // Quoted string
                case internals.components.contextQuotedString:
                    // http://tools.ietf.org/html/rfc5322#section-3.2.4
                    //   quoted-string = [CFWS]
                    //                   DQUOTE *([FWS] qcontent) [FWS] DQUOTE
                    //                   [CFWS]
                    //
                    //   qcontent      = qtext / quoted-pair
                    switch (token) {
                        // Quoted pair
                        case '\\':
                            context.stack.push(context.now);
                            context.now = internals.components.contextQuotedPair;
                            break;

                        // Folding white space. Spaces are allowed as regular characters inside a quoted string - it's only FWS if we include '\t' or '\r\n'
                        case '\r':
                            if (emailLength === ++i || email[i] !== '\n') {
                                // Fatal error
                                updateResult(internals.diagnoses.errCRNoLF);
                                break;
                            }

                        // Fallthrough

                        case '\t':
                            // http://tools.ietf.org/html/rfc5322#section-3.2.2
                            //   Runs of FWS, comment, or CFWS that occur between lexical tokens in
                            //   a structured header field are semantically interpreted as a single
                            //   space character.

                            // http://tools.ietf.org/html/rfc5322#section-3.2.4
                            //   the CRLF in any FWS/CFWS that appears within the quoted-string [is]
                            //   semantically "invisible" and therefore not part of the
                            //   quoted-string

                            parseData.local += ' ';
                            atomData.locals[elementCount] += ' ';
                            ++elementLength;

                            updateResult(internals.diagnoses.cfwsFWS);
                            context.stack.push(context.now);
                            context.now = internals.components.contextFWS;
                            prevToken = token;
                            break;

                        // End of quoted string
                        case '"':
                            parseData.local += token;
                            atomData.locals[elementCount] += token;
                            ++elementLength;
                            context.prev = context.now;
                            context.now = context.stack.pop();
                            break;

                        // QTEXT
                        default:
                            // http://tools.ietf.org/html/rfc5322#section-3.2.4
                            //   qtext          =   %d33 /             ; Printable US-ASCII
                            //                      %d35-91 /          ;  characters not including
                            //                      %d93-126 /         ;  "\" or the quote character
                            //                      obs-qtext
                            //
                            //   obs-qtext      =   obs-NO-WS-CTL
                            //
                            //   obs-NO-WS-CTL  =   %d1-8 /            ; US-ASCII control
                            //                      %d11 /             ;  characters that do not
                            //                      %d12 /             ;  include the carriage
                            //                      %d14-31 /          ;  return, line feed, and
                            //                      %d127              ;  white space characters
                            charCode = token.charCodeAt(0);

                            if (charCode > 127 || charCode === 0 || charCode === 10) {
                                updateResult(internals.diagnoses.errExpectingQTEXT);
                            } else if (charCode < 32 || charCode === 127) {
                                updateResult(internals.diagnoses.deprecatedQTEXT);
                            }

                            parseData.local += token;
                            atomData.locals[elementCount] += token;
                            ++elementLength;
                    }

                    // http://tools.ietf.org/html/rfc5322#section-3.4.1
                    //   If the string can be represented as a dot-atom (that is, it contains
                    //   no characters other than atext characters or "." surrounded by atext
                    //   characters), then the dot-atom form SHOULD be used and the quoted-
                    //   string form SHOULD NOT be used.

                    break;
                // Quoted pair
                case internals.components.contextQuotedPair:
                    // http://tools.ietf.org/html/rfc5322#section-3.2.1
                    //   quoted-pair     =   ("\" (VCHAR / WSP)) / obs-qp
                    //
                    //   VCHAR           =  %d33-126   ; visible (printing) characters
                    //   WSP             =  SP / HTAB  ; white space
                    //
                    //   obs-qp          =   "\" (%d0 / obs-NO-WS-CTL / LF / CR)
                    //
                    //   obs-NO-WS-CTL   =   %d1-8 /   ; US-ASCII control
                    //                       %d11 /    ;  characters that do not
                    //                       %d12 /    ;  include the carriage
                    //                       %d14-31 / ;  return, line feed, and
                    //                       %d127     ;  white space characters
                    //
                    // i.e. obs-qp       =  "\" (%d0-8, %d10-31 / %d127)
                    charCode = token.charCodeAt(0);

                    if (charCode > 127) {
                        // Fatal error
                        updateResult(internals.diagnoses.errExpectingQPair);
                    } else if (charCode < 31 && charCode !== 9 || charCode === 127) {
                        // ' ' and '\t' are allowed
                        updateResult(internals.diagnoses.deprecatedQP);
                    }

                    // At this point we know where this qpair occurred so we could check to see if the character actually needed to be quoted at all.
                    // http://tools.ietf.org/html/rfc5321#section-4.1.2
                    //   the sending system SHOULD transmit the form that uses the minimum quoting possible.

                    context.prev = context.now;
                    // End of qpair
                    context.now = context.stack.pop();
                    token = '\\' + token;

                    switch (context.now) {
                        case internals.components.contextComment:
                            break;

                        case internals.components.contextQuotedString:
                            parseData.local += token;
                            atomData.locals[elementCount] += token;

                            // The maximum sizes specified by RFC 5321 are octet counts, so we must include the backslash
                            elementLength += 2;
                            break;

                        case internals.components.literal:
                            parseData.domain += token;
                            atomData.domains[elementCount] += token;

                            // The maximum sizes specified by RFC 5321 are octet counts, so we must include the backslash
                            elementLength += 2;
                            break;

                        // $lab:coverage:off$
                        default:
                            throw new Error('quoted pair logic invoked in an invalid context: ' + context.now);
                        // $lab:coverage:on$
                    }
                    break;

                // Comment
                case internals.components.contextComment:
                    // http://tools.ietf.org/html/rfc5322#section-3.2.2
                    //   comment  = "(" *([FWS] ccontent) [FWS] ")"
                    //
                    //   ccontent = ctext / quoted-pair / comment
                    switch (token) {
                        // Nested comment
                        case '(':
                            // Nested comments are ok
                            context.stack.push(context.now);
                            context.now = internals.components.contextComment;
                            break;

                        // End of comment
                        case ')':
                            context.prev = context.now;
                            context.now = context.stack.pop();
                            break;

                        // Quoted pair
                        case '\\':
                            context.stack.push(context.now);
                            context.now = internals.components.contextQuotedPair;
                            break;

                        // Folding white space
                        case '\r':
                            if (emailLength === ++i || email[i] !== '\n') {
                                // Fatal error
                                updateResult(internals.diagnoses.errCRNoLF);
                                break;
                            }

                        // Fallthrough

                        case ' ':
                        case '\t':
                            updateResult(internals.diagnoses.cfwsFWS);

                            context.stack.push(context.now);
                            context.now = internals.components.contextFWS;
                            prevToken = token;
                            break;

                        // CTEXT
                        default:
                            // http://tools.ietf.org/html/rfc5322#section-3.2.3
                            //   ctext         = %d33-39 /  ; Printable US-ASCII
                            //                   %d42-91 /  ;  characters not including
                            //                   %d93-126 / ;  "(", ")", or "\"
                            //                   obs-ctext
                            //
                            //   obs-ctext     = obs-NO-WS-CTL
                            //
                            //   obs-NO-WS-CTL = %d1-8 /    ; US-ASCII control
                            //                   %d11 /     ;  characters that do not
                            //                   %d12 /     ;  include the carriage
                            //                   %d14-31 /  ;  return, line feed, and
                            //                   %d127      ;  white space characters
                            charCode = token.charCodeAt(0);

                            if (charCode > 127 || charCode === 0 || charCode === 10) {
                                // Fatal error
                                updateResult(internals.diagnoses.errExpectingCTEXT);
                                break;
                            } else if (charCode < 32 || charCode === 127) {
                                updateResult(internals.diagnoses.deprecatedCTEXT);
                            }
                    }

                    break;

                // Folding white space
                case internals.components.contextFWS:
                    // http://tools.ietf.org/html/rfc5322#section-3.2.2
                    //   FWS     =   ([*WSP CRLF] 1*WSP) /  obs-FWS
                    //                                   ; Folding white space

                    // But note the erratum:
                    // http://www.rfc-editor.org/errata_search.php?rfc=5322&eid=1908:
                    //   In the obsolete syntax, any amount of folding white space MAY be
                    //   inserted where the obs-FWS rule is allowed.  This creates the
                    //   possibility of having two consecutive "folds" in a line, and
                    //   therefore the possibility that a line which makes up a folded header
                    //   field could be composed entirely of white space.
                    //
                    //   obs-FWS =   1*([CRLF] WSP)

                    if (prevToken === '\r') {
                        if (token === '\r') {
                            // Fatal error
                            updateResult(internals.diagnoses.errFWSCRLFx2);
                            break;
                        }

                        if (++crlfCount > 1) {
                            // Multiple folds => obsolete FWS
                            updateResult(internals.diagnoses.deprecatedFWS);
                        } else {
                            crlfCount = 1;
                        }
                    }

                    switch (token) {
                        case '\r':
                            if (emailLength === ++i || email[i] !== '\n') {
                                // Fatal error
                                updateResult(internals.diagnoses.errCRNoLF);
                            }

                            break;

                        case ' ':
                        case '\t':
                            break;

                        default:
                            if (prevToken === '\r') {
                                // Fatal error
                                updateResult(internals.diagnoses.errFWSCRLFEnd);
                            }

                            crlfCount = 0;

                            // End of FWS
                            context.prev = context.now;
                            context.now = context.stack.pop();

                            // Look at this token again in the parent context
                            --i;
                    }

                    prevToken = token;
                    break;

                // Unexpected context
                // $lab:coverage:off$
                default:
                    throw new Error('unknown context: ' + context.now);
                // $lab:coverage:on$
            } // Primary state machine

            if (maxResult > internals.categories.rfc5322) {
                // Fatal error, no point continuing
                break;
            }
        } // Token loop

        // Check for errors
        if (maxResult < internals.categories.rfc5322) {
            // Fatal errors
            if (context.now === internals.components.contextQuotedString) {
                updateResult(internals.diagnoses.errUnclosedQuotedString);
            } else if (context.now === internals.components.contextQuotedPair) {
                updateResult(internals.diagnoses.errBackslashEnd);
            } else if (context.now === internals.components.contextComment) {
                updateResult(internals.diagnoses.errUnclosedComment);
            } else if (context.now === internals.components.literal) {
                updateResult(internals.diagnoses.errUnclosedDomainLiteral);
            } else if (token === '\r') {
                updateResult(internals.diagnoses.errFWSCRLFEnd);
            } else if (parseData.domain.length === 0) {
                updateResult(internals.diagnoses.errNoDomain);
            } else if (elementLength === 0) {
                updateResult(internals.diagnoses.errDotEnd);
            } else if (hyphenFlag) {
                updateResult(internals.diagnoses.errDomainHyphenEnd);
            }

            // Other errors
            else if (parseData.domain.length > 255) {
                    // http://tools.ietf.org/html/rfc5321#section-4.5.3.1.2
                    //   The maximum total length of a domain name or number is 255 octets.
                    updateResult(internals.diagnoses.rfc5322DomainTooLong);
                } else if (parseData.local.length + parseData.domain.length + /* '@' */1 > 254) {
                    // http://tools.ietf.org/html/rfc5321#section-4.1.2
                    //   Forward-path   = Path
                    //
                    //   Path           = "<" [ A-d-l ":" ] Mailbox ">"
                    //
                    // http://tools.ietf.org/html/rfc5321#section-4.5.3.1.3
                    //   The maximum total length of a reverse-path or forward-path is 256 octets (including the punctuation and element separators).
                    //
                    // Thus, even without (obsolete) routing information, the Mailbox can only be 254 characters long. This is confirmed by this verified
                    // erratum to RFC 3696:
                    //
                    // http://www.rfc-editor.org/errata_search.php?rfc=3696&eid=1690
                    //   However, there is a restriction in RFC 2821 on the length of an address in MAIL and RCPT commands of 254 characters.  Since
                    //   addresses that do not fit in those fields are not normally useful, the upper limit on address lengths should normally be considered
                    //   to be 254.
                    updateResult(internals.diagnoses.rfc5322TooLong);
                } else if (elementLength > 63) {
                    // http://tools.ietf.org/html/rfc1035#section-2.3.4
                    // labels   63 octets or less
                    updateResult(internals.diagnoses.rfc5322LabelTooLong);
                } else if (options.minDomainAtoms && atomData.domains.length < options.minDomainAtoms) {
                    updateResult(internals.diagnoses.errDomainTooShort);
                } else if (options.tldWhitelist || options.tldBlacklist) {
                    var tldAtom = atomData.domains[elementCount];

                    if (!internals.validDomain(tldAtom, options)) {
                        updateResult(internals.diagnoses.errUnknownTLD);
                    }
                }
        } // Check for errors

        var dnsPositive = false;
        var finishImmediately = false;

        var finish = function finish() {

            if (!dnsPositive && maxResult < internals.categories.dnsWarn) {
                // Per RFC 5321, domain atoms are limited to letter-digit-hyphen, so we only need to check code <= 57 to check for a digit
                var code = atomData.domains[elementCount].charCodeAt(0);
                if (code <= 57) {
                    updateResult(internals.diagnoses.rfc5321TLDNumeric);
                } else if (elementCount === 0) {
                    updateResult(internals.diagnoses.rfc5321TLD);
                }
            }

            if (maxResult < threshold) {
                maxResult = internals.diagnoses.valid;
            }

            var finishResult = diagnose ? maxResult : maxResult < internals.defaultThreshold;

            if (callback) {
                if (finishImmediately) {
                    callback(finishResult);
                } else {
                    internals.defer(callback.bind(null, finishResult));
                }
            }

            return finishResult;
        }; // Finish

        if (options.checkDNS && maxResult < internals.categories.dnsWarn) {
            // http://tools.ietf.org/html/rfc5321#section-2.3.5
            //   Names that can be resolved to MX RRs or address (i.e., A or AAAA) RRs (as discussed in Section 5) are permitted, as are CNAME RRs whose
            //   targets can be resolved, in turn, to MX or address RRs.
            //
            // http://tools.ietf.org/html/rfc5321#section-5.1
            //   The lookup first attempts to locate an MX record associated with the name.  If a CNAME record is found, the resulting name is processed
            //   as if it were the initial name. ... If an empty list of MXs is returned, the address is treated as if it was associated with an implicit
            //   MX RR, with a preference of 0, pointing to that host.
            //
            // isEmail() author's note: We will regard the existence of a CNAME to be sufficient evidence of the domain's existence. For performance
            // reasons we will not repeat the DNS lookup for the CNAME's target, but we will raise a warning because we didn't immediately find an MX
            // record.
            if (elementCount === 0) {
                // Checking TLD DNS only works if you explicitly check from the root
                parseData.domain += '.';
            }

            var dnsDomain = parseData.domain;
            /*
             TODO: Brandon edit - removed for client-side port
             Dns.resolveMx(dnsDomain, (err, mxRecords) => {
               // If we have a fatal error, then we must assume that there are no records
              if (err && err.code !== Dns.NODATA) {
                updateResult(internals.diagnoses.dnsWarnNoRecord);
                return finish();
              }
               if (mxRecords && mxRecords.length) {
                dnsPositive = true;
                return finish();
              }
               let count = 3;
              let done = false;
              updateResult(internals.diagnoses.dnsWarnNoMXRecord);
               const handleRecords = (err, records) => {
                 if (done) {
                  return;
                }
                 --count;
                 if (records && records.length) {
                  done = true;
                  return finish();
                }
                 if (count === 0) {
                  // No usable records for the domain can be found
                  updateResult(internals.diagnoses.dnsWarnNoRecord);
                  done = true;
                  finish();
                }
              };
               Dns.resolveCname(dnsDomain, handleRecords);
              Dns.resolve4(dnsDomain, handleRecords);
              Dns.resolve6(dnsDomain, handleRecords);
            });*/

            finishImmediately = true;
        } else {
            var result = finish();
            finishImmediately = true;
            return result;
        } // CheckDNS
    };

    exports.diagnoses = internals.validate.diagnoses = (function () {

        var diag = {};
        var keys = Object.keys(internals.diagnoses);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            diag[key] = internals.diagnoses[key];
        }

        return diag;
    })();

    cache["isemail"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    //! moment.js
    //! version : 2.11.0
    //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
    //! license : MIT
    //! momentjs.com

    ;(function (global, factory) {
        (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.moment = factory();
    })(this, function () {
        'use strict';

        var hookCallback;

        function utils_hooks__hooks() {
            return hookCallback.apply(null, arguments);
        }

        // This is done to register the method called with moment()
        // without creating circular dependencies.
        function setHookCallback(callback) {
            hookCallback = callback;
        }

        function isArray(input) {
            return Object.prototype.toString.call(input) === '[object Array]';
        }

        function isDate(input) {
            return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
        }

        function map(arr, fn) {
            var res = [],
                i;
            for (i = 0; i < arr.length; ++i) {
                res.push(fn(arr[i], i));
            }
            return res;
        }

        function hasOwnProp(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b);
        }

        function extend(a, b) {
            for (var i in b) {
                if (hasOwnProp(b, i)) {
                    a[i] = b[i];
                }
            }

            if (hasOwnProp(b, 'toString')) {
                a.toString = b.toString;
            }

            if (hasOwnProp(b, 'valueOf')) {
                a.valueOf = b.valueOf;
            }

            return a;
        }

        function create_utc__createUTC(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, true).utc();
        }

        function defaultParsingFlags() {
            // We need to deep clone this object.
            return {
                empty: false,
                unusedTokens: [],
                unusedInput: [],
                overflow: -2,
                charsLeftOver: 0,
                nullInput: false,
                invalidMonth: null,
                invalidFormat: false,
                userInvalidated: false,
                iso: false
            };
        }

        function getParsingFlags(m) {
            if (m._pf == null) {
                m._pf = defaultParsingFlags();
            }
            return m._pf;
        }

        function valid__isValid(m) {
            if (m._isValid == null) {
                var flags = getParsingFlags(m);
                m._isValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.empty && !flags.invalidMonth && !flags.invalidWeekday && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated;

                if (m._strict) {
                    m._isValid = m._isValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
                }
            }
            return m._isValid;
        }

        function valid__createInvalid(flags) {
            var m = create_utc__createUTC(NaN);
            if (flags != null) {
                extend(getParsingFlags(m), flags);
            } else {
                getParsingFlags(m).userInvalidated = true;
            }

            return m;
        }

        function isUndefined(input) {
            return input === void 0;
        }

        // Plugins that add properties should also add the key here (null value),
        // so we can properly clone ourselves.
        var momentProperties = utils_hooks__hooks.momentProperties = [];

        function copyConfig(to, from) {
            var i, prop, val;

            if (!isUndefined(from._isAMomentObject)) {
                to._isAMomentObject = from._isAMomentObject;
            }
            if (!isUndefined(from._i)) {
                to._i = from._i;
            }
            if (!isUndefined(from._f)) {
                to._f = from._f;
            }
            if (!isUndefined(from._l)) {
                to._l = from._l;
            }
            if (!isUndefined(from._strict)) {
                to._strict = from._strict;
            }
            if (!isUndefined(from._tzm)) {
                to._tzm = from._tzm;
            }
            if (!isUndefined(from._isUTC)) {
                to._isUTC = from._isUTC;
            }
            if (!isUndefined(from._offset)) {
                to._offset = from._offset;
            }
            if (!isUndefined(from._pf)) {
                to._pf = getParsingFlags(from);
            }
            if (!isUndefined(from._locale)) {
                to._locale = from._locale;
            }

            if (momentProperties.length > 0) {
                for (i in momentProperties) {
                    prop = momentProperties[i];
                    val = from[prop];
                    if (!isUndefined(val)) {
                        to[prop] = val;
                    }
                }
            }

            return to;
        }

        var updateInProgress = false;

        // Moment prototype object
        function Moment(config) {
            copyConfig(this, config);
            this._d = new Date(config._d != null ? config._d.getTime() : NaN);
            // Prevent infinite loop in case updateOffset creates new moment
            // objects.
            if (updateInProgress === false) {
                updateInProgress = true;
                utils_hooks__hooks.updateOffset(this);
                updateInProgress = false;
            }
        }

        function isMoment(obj) {
            return obj instanceof Moment || obj != null && obj._isAMomentObject != null;
        }

        function absFloor(number) {
            if (number < 0) {
                return Math.ceil(number);
            } else {
                return Math.floor(number);
            }
        }

        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion,
                value = 0;

            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                value = absFloor(coercedNumber);
            }

            return value;
        }

        // compare two arrays, return the number of differences
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length),
                lengthDiff = Math.abs(array1.length - array2.length),
                diffs = 0,
                i;
            for (i = 0; i < len; i++) {
                if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }

        function Locale() {}

        // internal storage for locale config files
        var locales = {};
        var globalLocale;

        function normalizeLocale(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }

        // pick the locale from the array
        // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        function chooseLocale(names) {
            var i = 0,
                j,
                next,
                locale,
                split;

            while (i < names.length) {
                split = normalizeLocale(names[i]).split('-');
                j = split.length;
                next = normalizeLocale(names[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    locale = loadLocale(split.slice(0, j).join('-'));
                    if (locale) {
                        return locale;
                    }
                    if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                        //the next array item is better than a shallower substring of this one
                        break;
                    }
                    j--;
                }
                i++;
            }
            return null;
        }

        function loadLocale(name) {
            var oldLocale = null;
            // TODO: Find a better way to register and load all the locales in Node
            if (!locales[name] && !isUndefined(module) && module && module.exports) {
                try {
                    oldLocale = globalLocale._abbr;
                    require('./locale/' + name);
                    // because defineLocale currently also sets the global locale, we
                    // want to undo that for lazy loaded locales
                    locale_locales__getSetGlobalLocale(oldLocale);
                } catch (e) {}
            }
            return locales[name];
        }

        // This function will load locale and then set the global locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        function locale_locales__getSetGlobalLocale(key, values) {
            var data;
            if (key) {
                if (isUndefined(values)) {
                    data = locale_locales__getLocale(key);
                } else {
                    data = defineLocale(key, values);
                }

                if (data) {
                    // moment.duration._locale = moment._locale = data;
                    globalLocale = data;
                }
            }

            return globalLocale._abbr;
        }

        function defineLocale(name, values) {
            if (values !== null) {
                values.abbr = name;
                locales[name] = locales[name] || new Locale();
                locales[name].set(values);

                // backwards compat for now: also set the locale
                locale_locales__getSetGlobalLocale(name);

                return locales[name];
            } else {
                // useful for testing
                delete locales[name];
                return null;
            }
        }

        // returns locale data
        function locale_locales__getLocale(key) {
            var locale;

            if (key && key._locale && key._locale._abbr) {
                key = key._locale._abbr;
            }

            if (!key) {
                return globalLocale;
            }

            if (!isArray(key)) {
                //short-circuit everything else
                locale = loadLocale(key);
                if (locale) {
                    return locale;
                }
                key = [key];
            }

            return chooseLocale(key);
        }

        var aliases = {};

        function addUnitAlias(unit, shorthand) {
            var lowerCase = unit.toLowerCase();
            aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
        }

        function normalizeUnits(units) {
            return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
        }

        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {},
                normalizedProp,
                prop;

            for (prop in inputObject) {
                if (hasOwnProp(inputObject, prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }

            return normalizedInput;
        }

        function isFunction(input) {
            return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
        }

        function makeGetSet(unit, keepTime) {
            return function (value) {
                if (value != null) {
                    get_set__set(this, unit, value);
                    utils_hooks__hooks.updateOffset(this, keepTime);
                    return this;
                } else {
                    return get_set__get(this, unit);
                }
            };
        }

        function get_set__get(mom, unit) {
            return mom.isValid() ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
        }

        function get_set__set(mom, unit, value) {
            if (mom.isValid()) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }

        // MOMENTS

        function getSet(units, value) {
            var unit;
            if ((typeof units === 'undefined' ? 'undefined' : _typeof(units)) === 'object') {
                for (unit in units) {
                    this.set(unit, units[unit]);
                }
            } else {
                units = normalizeUnits(units);
                if (isFunction(this[units])) {
                    return this[units](value);
                }
            }
            return this;
        }

        function zeroFill(number, targetLength, forceSign) {
            var absNumber = '' + Math.abs(number),
                zerosToFill = targetLength - absNumber.length,
                sign = number >= 0;
            return (sign ? forceSign ? '+' : '' : '-') + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
        }

        var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

        var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

        var formatFunctions = {};

        var formatTokenFunctions = {};

        // token:    'M'
        // padded:   ['MM', 2]
        // ordinal:  'Mo'
        // callback: function () { this.month() + 1 }
        function addFormatToken(token, padded, ordinal, callback) {
            var func = callback;
            if (typeof callback === 'string') {
                func = function () {
                    return this[callback]();
                };
            }
            if (token) {
                formatTokenFunctions[token] = func;
            }
            if (padded) {
                formatTokenFunctions[padded[0]] = function () {
                    return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
                };
            }
            if (ordinal) {
                formatTokenFunctions[ordinal] = function () {
                    return this.localeData().ordinal(func.apply(this, arguments), token);
                };
            }
        }

        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }

        function makeFormatFunction(format) {
            var array = format.match(formattingTokens),
                i,
                length;

            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }

            return function (mom) {
                var output = '';
                for (i = 0; i < length; i++) {
                    output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
                }
                return output;
            };
        }

        // format date using native date object
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.localeData().invalidDate();
            }

            format = expandFormat(format, m.localeData());
            formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

            return formatFunctions[format](m);
        }

        function expandFormat(format, locale) {
            var i = 5;

            function replaceLongDateFormatTokens(input) {
                return locale.longDateFormat(input) || input;
            }

            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }

            return format;
        }

        var match1 = /\d/; //       0 - 9
        var match2 = /\d\d/; //      00 - 99
        var match3 = /\d{3}/; //     000 - 999
        var match4 = /\d{4}/; //    0000 - 9999
        var match6 = /[+-]?\d{6}/; // -999999 - 999999
        var match1to2 = /\d\d?/; //       0 - 99
        var match3to4 = /\d\d\d\d?/; //     999 - 9999
        var match5to6 = /\d\d\d\d\d\d?/; //   99999 - 999999
        var match1to3 = /\d{1,3}/; //       0 - 999
        var match1to4 = /\d{1,4}/; //       0 - 9999
        var match1to6 = /[+-]?\d{1,6}/; // -999999 - 999999

        var matchUnsigned = /\d+/; //       0 - inf
        var matchSigned = /[+-]?\d+/; //    -inf - inf

        var matchOffset = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
        var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

        var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

        // any word (or two) characters or numbers including two/three word month in arabic.
        // includes scottish gaelic two word and hyphenated months
        var matchWord = /[0-9]*(a[mn]\s?)?['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\-]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

        var regexes = {};

        function addRegexToken(token, regex, strictRegex) {
            regexes[token] = isFunction(regex) ? regex : function (isStrict) {
                return isStrict && strictRegex ? strictRegex : regex;
            };
        }

        function getParseRegexForToken(token, config) {
            if (!hasOwnProp(regexes, token)) {
                return new RegExp(unescapeFormat(token));
            }

            return regexes[token](config._strict, config._locale);
        }

        // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
        function unescapeFormat(s) {
            return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
                return p1 || p2 || p3 || p4;
            }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        var tokens = {};

        function addParseToken(token, callback) {
            var i,
                func = callback;
            if (typeof token === 'string') {
                token = [token];
            }
            if (typeof callback === 'number') {
                func = function (input, array) {
                    array[callback] = toInt(input);
                };
            }
            for (i = 0; i < token.length; i++) {
                tokens[token[i]] = func;
            }
        }

        function addWeekParseToken(token, callback) {
            addParseToken(token, function (input, array, config, token) {
                config._w = config._w || {};
                callback(input, config._w, config, token);
            });
        }

        function addTimeToArrayFromToken(token, input, config) {
            if (input != null && hasOwnProp(tokens, token)) {
                tokens[token](input, config._a, config, token);
            }
        }

        var YEAR = 0;
        var MONTH = 1;
        var DATE = 2;
        var HOUR = 3;
        var MINUTE = 4;
        var SECOND = 5;
        var MILLISECOND = 6;
        var WEEK = 7;
        var WEEKDAY = 8;

        function daysInMonth(year, month) {
            return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        }

        // FORMATTING

        addFormatToken('M', ['MM', 2], 'Mo', function () {
            return this.month() + 1;
        });

        addFormatToken('MMM', 0, 0, function (format) {
            return this.localeData().monthsShort(this, format);
        });

        addFormatToken('MMMM', 0, 0, function (format) {
            return this.localeData().months(this, format);
        });

        // ALIASES

        addUnitAlias('month', 'M');

        // PARSING

        addRegexToken('M', match1to2);
        addRegexToken('MM', match1to2, match2);
        addRegexToken('MMM', matchWord);
        addRegexToken('MMMM', matchWord);

        addParseToken(['M', 'MM'], function (input, array) {
            array[MONTH] = toInt(input) - 1;
        });

        addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
            var month = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (month != null) {
                array[MONTH] = month;
            } else {
                getParsingFlags(config).invalidMonth = input;
            }
        });

        // LOCALES

        var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/;
        var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
        function localeMonths(m, format) {
            return isArray(this._months) ? this._months[m.month()] : this._months[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
        }

        var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sept_Oct_Nov_Dec'.split('_');
        function localeMonthsShort(m, format) {
            return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
        }

        function localeMonthsParse(monthName, format, strict) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = create_utc__createUTC([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this._monthsParse[i]) {
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function setMonth(mom, value) {
            var dayOfMonth;

            if (!mom.isValid()) {
                // No op
                return mom;
            }

            // TODO: Move this out of here!
            if (typeof value === 'string') {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (typeof value !== 'number') {
                    return mom;
                }
            }

            dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }

        function getSetMonth(value) {
            if (value != null) {
                setMonth(this, value);
                utils_hooks__hooks.updateOffset(this, true);
                return this;
            } else {
                return get_set__get(this, 'Month');
            }
        }

        function getDaysInMonth() {
            return daysInMonth(this.year(), this.month());
        }

        function checkOverflow(m) {
            var overflow;
            var a = m._a;

            if (a && getParsingFlags(m).overflow === -2) {
                overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;

                if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                    overflow = DATE;
                }
                if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                    overflow = WEEK;
                }
                if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                    overflow = WEEKDAY;
                }

                getParsingFlags(m).overflow = overflow;
            }

            return m;
        }

        function warn(msg) {
            if (utils_hooks__hooks.suppressDeprecationWarnings === false && !isUndefined(console) && console.warn) {
                console.warn('Deprecation warning: ' + msg);
            }
        }

        function deprecate(msg, fn) {
            var firstTime = true;

            return extend(function () {
                if (firstTime) {
                    warn(msg + '\nArguments: ' + Array.prototype.slice.call(arguments).join(', ') + '\n' + new Error().stack);
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }

        var deprecations = {};

        function deprecateSimple(name, msg) {
            if (!deprecations[name]) {
                warn(msg);
                deprecations[name] = true;
            }
        }

        utils_hooks__hooks.suppressDeprecationWarnings = false;

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
        var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;

        var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

        var isoDates = [['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/], ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/], ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/], ['GGGG-[W]WW', /\d{4}-W\d\d/, false], ['YYYY-DDD', /\d{4}-\d{3}/], ['YYYY-MM', /\d{4}-\d\d/, false], ['YYYYYYMMDD', /[+-]\d{10}/], ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/], ['GGGG[W]WW', /\d{4}W\d{2}/, false], ['YYYYDDD', /\d{7}/]];

        // iso time formats and regexes
        var isoTimes = [['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/], ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/], ['HH:mm:ss', /\d\d:\d\d:\d\d/], ['HH:mm', /\d\d:\d\d/], ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/], ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/], ['HHmmss', /\d\d\d\d\d\d/], ['HHmm', /\d\d\d\d/], ['HH', /\d\d/]];

        var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

        // date from iso format
        function configFromISO(config) {
            var i,
                l,
                string = config._i,
                match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
                allowTime,
                dateFormat,
                timeFormat,
                tzFormat;

            if (match) {
                getParsingFlags(config).iso = true;

                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(match[1])) {
                        dateFormat = isoDates[i][0];
                        allowTime = isoDates[i][2] !== false;
                        break;
                    }
                }
                if (dateFormat == null) {
                    config._isValid = false;
                    return;
                }
                if (match[3]) {
                    for (i = 0, l = isoTimes.length; i < l; i++) {
                        if (isoTimes[i][1].exec(match[3])) {
                            // match[2] should be 'T' or space
                            timeFormat = (match[2] || ' ') + isoTimes[i][0];
                            break;
                        }
                    }
                    if (timeFormat == null) {
                        config._isValid = false;
                        return;
                    }
                }
                if (!allowTime && timeFormat != null) {
                    config._isValid = false;
                    return;
                }
                if (match[4]) {
                    if (tzRegex.exec(match[4])) {
                        tzFormat = 'Z';
                    } else {
                        config._isValid = false;
                        return;
                    }
                }
                config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
                configFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }

        // date from iso format or fallback
        function configFromString(config) {
            var matched = aspNetJsonRegex.exec(config._i);

            if (matched !== null) {
                config._d = new Date(+matched[1]);
                return;
            }

            configFromISO(config);
            if (config._isValid === false) {
                delete config._isValid;
                utils_hooks__hooks.createFromInputFallback(config);
            }
        }

        utils_hooks__hooks.createFromInputFallback = deprecate('moment construction falls back to js Date. This is ' + 'discouraged and will be removed in upcoming major ' + 'release. Please refer to ' + 'https://github.com/moment/moment/issues/1407 for more info.', function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        });

        function createDate(y, m, d, h, M, s, ms) {
            //can't just apply() to create a date:
            //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
            var date = new Date(y, m, d, h, M, s, ms);

            //the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
            return date;
        }

        function createUTCDate(y) {
            var date = new Date(Date.UTC.apply(null, arguments));

            //the Date.UTC function remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
            return date;
        }

        // FORMATTING

        addFormatToken(0, ['YY', 2], 0, function () {
            return this.year() % 100;
        });

        addFormatToken(0, ['YYYY', 4], 0, 'year');
        addFormatToken(0, ['YYYYY', 5], 0, 'year');
        addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

        // ALIASES

        addUnitAlias('year', 'y');

        // PARSING

        addRegexToken('Y', matchSigned);
        addRegexToken('YY', match1to2, match2);
        addRegexToken('YYYY', match1to4, match4);
        addRegexToken('YYYYY', match1to6, match6);
        addRegexToken('YYYYYY', match1to6, match6);

        addParseToken(['YYYYY', 'YYYYYY'], YEAR);
        addParseToken('YYYY', function (input, array) {
            array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
        });
        addParseToken('YY', function (input, array) {
            array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
        });

        // HELPERS

        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }

        function isLeapYear(year) {
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        }

        // HOOKS

        utils_hooks__hooks.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };

        // MOMENTS

        var getSetYear = makeGetSet('FullYear', false);

        function getIsLeapYear() {
            return isLeapYear(this.year());
        }

        // start-of-first-week - start-of-year
        function firstWeekOffset(year, dow, doy) {
            var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,

            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

            return -fwdlw + fwd - 1;
        }

        //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
        function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
            var localWeekday = (7 + weekday - dow) % 7,
                weekOffset = firstWeekOffset(year, dow, doy),
                dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
                resYear,
                resDayOfYear;

            if (dayOfYear <= 0) {
                resYear = year - 1;
                resDayOfYear = daysInYear(resYear) + dayOfYear;
            } else if (dayOfYear > daysInYear(year)) {
                resYear = year + 1;
                resDayOfYear = dayOfYear - daysInYear(year);
            } else {
                resYear = year;
                resDayOfYear = dayOfYear;
            }

            return {
                year: resYear,
                dayOfYear: resDayOfYear
            };
        }

        function weekOfYear(mom, dow, doy) {
            var weekOffset = firstWeekOffset(mom.year(), dow, doy),
                week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
                resWeek,
                resYear;

            if (week < 1) {
                resYear = mom.year() - 1;
                resWeek = week + weeksInYear(resYear, dow, doy);
            } else if (week > weeksInYear(mom.year(), dow, doy)) {
                resWeek = week - weeksInYear(mom.year(), dow, doy);
                resYear = mom.year() + 1;
            } else {
                resYear = mom.year();
                resWeek = week;
            }

            return {
                week: resWeek,
                year: resYear
            };
        }

        function weeksInYear(year, dow, doy) {
            var weekOffset = firstWeekOffset(year, dow, doy),
                weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
            return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
        }

        // Pick the first defined of two or three arguments.
        function defaults(a, b, c) {
            if (a != null) {
                return a;
            }
            if (b != null) {
                return b;
            }
            return c;
        }

        function currentDateArray(config) {
            // hooks is actually the exported moment object
            var nowValue = new Date(utils_hooks__hooks.now());
            if (config._useUTC) {
                return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
            }
            return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
        }

        // convert an array to a date.
        // the array should mirror the parameters below
        // note: all values past the year are optional and will default to the lowest possible value.
        // [year, month, day , hour, minute, second, millisecond]
        function configFromArray(config) {
            var i,
                date,
                input = [],
                currentDate,
                yearToUse;

            if (config._d) {
                return;
            }

            currentDate = currentDateArray(config);

            //compute day of the year from weeks and weekdays
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }

            //if the day of the year is set, figure out what it is
            if (config._dayOfYear) {
                yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

                if (config._dayOfYear > daysInYear(yearToUse)) {
                    getParsingFlags(config)._overflowDayOfYear = true;
                }

                date = createUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }

            // Default to current date.
            // * if no year, month, day of month are given, default to today
            // * if day of month is given, default month and year
            // * if month is given, default only year
            // * if year is given, don't default anything
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }

            // Zero out whatever was not defaulted, including time
            for (; i < 7; i++) {
                config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
            }

            // Check for 24:00:00.000
            if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
                config._nextDay = true;
                config._a[HOUR] = 0;
            }

            config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
            // Apply timezone offset from input. The actual utcOffset can be changed
            // with parseZone.
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
            }

            if (config._nextDay) {
                config._a[HOUR] = 24;
            }
        }

        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;

                // TODO: We need to take the current isoWeekYear, but that depends on
                // how we interpret now (local, utc, fixed offset). So create
                // a now version of current config (take local/utc/offset flags, and
                // create now).
                weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
                week = defaults(w.W, 1);
                weekday = defaults(w.E, 1);
                if (weekday < 1 || weekday > 7) {
                    weekdayOverflow = true;
                }
            } else {
                dow = config._locale._week.dow;
                doy = config._locale._week.doy;

                weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
                week = defaults(w.w, 1);

                if (w.d != null) {
                    // weekday -- low day numbers are considered next week
                    weekday = w.d;
                    if (weekday < 0 || weekday > 6) {
                        weekdayOverflow = true;
                    }
                } else if (w.e != null) {
                    // local weekday -- counting starts from begining of week
                    weekday = w.e + dow;
                    if (w.e < 0 || w.e > 6) {
                        weekdayOverflow = true;
                    }
                } else {
                    // default to begining of week
                    weekday = dow;
                }
            }
            if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
                getParsingFlags(config)._overflowWeeks = true;
            } else if (weekdayOverflow != null) {
                getParsingFlags(config)._overflowWeekday = true;
            } else {
                temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
                config._a[YEAR] = temp.year;
                config._dayOfYear = temp.dayOfYear;
            }
        }

        // constant that refers to the ISO standard
        utils_hooks__hooks.ISO_8601 = function () {};

        // date from string and format string
        function configFromStringAndFormat(config) {
            // TODO: Move this to another part of the creation flow to prevent circular deps
            if (config._f === utils_hooks__hooks.ISO_8601) {
                configFromISO(config);
                return;
            }

            config._a = [];
            getParsingFlags(config).empty = true;

            // This array is used to make a Date, either with `new Date` or `Date.UTC`
            var string = '' + config._i,
                i,
                parsedInput,
                tokens,
                token,
                skipped,
                stringLength = string.length,
                totalParsedInputLength = 0;

            tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        getParsingFlags(config).unusedInput.push(skipped);
                    }
                    string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                    totalParsedInputLength += parsedInput.length;
                }
                // don't parse if it's not a known token
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        getParsingFlags(config).empty = false;
                    } else {
                        getParsingFlags(config).unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                } else if (config._strict && !parsedInput) {
                    getParsingFlags(config).unusedTokens.push(token);
                }
            }

            // add remaining unparsed input length to the string
            getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
            if (string.length > 0) {
                getParsingFlags(config).unusedInput.push(string);
            }

            // clear _12h flag if hour is <= 12
            if (getParsingFlags(config).bigHour === true && config._a[HOUR] <= 12 && config._a[HOUR] > 0) {
                getParsingFlags(config).bigHour = undefined;
            }
            // handle meridiem
            config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

            configFromArray(config);
            checkOverflow(config);
        }

        function meridiemFixWrap(locale, hour, meridiem) {
            var isPm;

            if (meridiem == null) {
                // nothing to do
                return hour;
            }
            if (locale.meridiemHour != null) {
                return locale.meridiemHour(hour, meridiem);
            } else if (locale.isPM != null) {
                // Fallback
                isPm = locale.isPM(meridiem);
                if (isPm && hour < 12) {
                    hour += 12;
                }
                if (!isPm && hour === 12) {
                    hour = 0;
                }
                return hour;
            } else {
                // this is not supposed to happen
                return hour;
            }
        }

        // date from string and array of format strings
        function configFromStringAndArray(config) {
            var tempConfig, bestMoment, scoreToBeat, i, currentScore;

            if (config._f.length === 0) {
                getParsingFlags(config).invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }

            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                tempConfig = copyConfig({}, config);
                if (config._useUTC != null) {
                    tempConfig._useUTC = config._useUTC;
                }
                tempConfig._f = config._f[i];
                configFromStringAndFormat(tempConfig);

                if (!valid__isValid(tempConfig)) {
                    continue;
                }

                // if there is any input that was not parsed add a penalty for that format
                currentScore += getParsingFlags(tempConfig).charsLeftOver;

                //or tokens
                currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

                getParsingFlags(tempConfig).score = currentScore;

                if (scoreToBeat == null || currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }

            extend(config, bestMoment || tempConfig);
        }

        function configFromObject(config) {
            if (config._d) {
                return;
            }

            var i = normalizeObjectUnits(config._i);
            config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
                return obj && parseInt(obj, 10);
            });

            configFromArray(config);
        }

        function createFromConfig(config) {
            var res = new Moment(checkOverflow(prepareConfig(config)));
            if (res._nextDay) {
                // Adding is smart enough around DST
                res.add(1, 'd');
                res._nextDay = undefined;
            }

            return res;
        }

        function prepareConfig(config) {
            var input = config._i,
                format = config._f;

            config._locale = config._locale || locale_locales__getLocale(config._l);

            if (input === null || format === undefined && input === '') {
                return valid__createInvalid({ nullInput: true });
            }

            if (typeof input === 'string') {
                config._i = input = config._locale.preparse(input);
            }

            if (isMoment(input)) {
                return new Moment(checkOverflow(input));
            } else if (isArray(format)) {
                configFromStringAndArray(config);
            } else if (format) {
                configFromStringAndFormat(config);
            } else if (isDate(input)) {
                config._d = input;
            } else {
                configFromInput(config);
            }

            if (!valid__isValid(config)) {
                config._d = null;
            }

            return config;
        }

        function configFromInput(config) {
            var input = config._i;
            if (input === undefined) {
                config._d = new Date(utils_hooks__hooks.now());
            } else if (isDate(input)) {
                config._d = new Date(+input);
            } else if (typeof input === 'string') {
                configFromString(config);
            } else if (isArray(input)) {
                config._a = map(input.slice(0), function (obj) {
                    return parseInt(obj, 10);
                });
                configFromArray(config);
            } else if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object') {
                configFromObject(config);
            } else if (typeof input === 'number') {
                // from milliseconds
                config._d = new Date(input);
            } else {
                utils_hooks__hooks.createFromInputFallback(config);
            }
        }

        function createLocalOrUTC(input, format, locale, strict, isUTC) {
            var c = {};

            if (typeof locale === 'boolean') {
                strict = locale;
                locale = undefined;
            }
            // object construction must be done this way.
            // https://github.com/moment/moment/issues/1423
            c._isAMomentObject = true;
            c._useUTC = c._isUTC = isUTC;
            c._l = locale;
            c._i = input;
            c._f = format;
            c._strict = strict;

            return createFromConfig(c);
        }

        function local__createLocal(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, false);
        }

        var prototypeMin = deprecate('moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548', function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return valid__createInvalid();
            }
        });

        var prototypeMax = deprecate('moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548', function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return valid__createInvalid();
            }
        });

        // Pick a moment m from moments so that m[fn](other) is true for all
        // other. This relies on the function fn to be transitive.
        //
        // moments should either be an array of moment objects or an array, whose
        // first element is an array of moment objects.
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return local__createLocal();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (!moments[i].isValid() || moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }

        // TODO: Use [].sort instead?
        function min() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isBefore', args);
        }

        function max() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isAfter', args);
        }

        var now = Date.now || function () {
            return +new Date();
        };

        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration),
                years = normalizedInput.year || 0,
                quarters = normalizedInput.quarter || 0,
                months = normalizedInput.month || 0,
                weeks = normalizedInput.week || 0,
                days = normalizedInput.day || 0,
                hours = normalizedInput.hour || 0,
                minutes = normalizedInput.minute || 0,
                seconds = normalizedInput.second || 0,
                milliseconds = normalizedInput.millisecond || 0;

            // representation for dateAddRemove
            this._milliseconds = +milliseconds + seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = +days + weeks * 7;
            // It is impossible translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = +months + quarters * 3 + years * 12;

            this._data = {};

            this._locale = locale_locales__getLocale();

            this._bubble();
        }

        function isDuration(obj) {
            return obj instanceof Duration;
        }

        // FORMATTING

        function offset(token, separator) {
            addFormatToken(token, 0, 0, function () {
                var offset = this.utcOffset();
                var sign = '+';
                if (offset < 0) {
                    offset = -offset;
                    sign = '-';
                }
                return sign + zeroFill(~ ~(offset / 60), 2) + separator + zeroFill(~ ~offset % 60, 2);
            });
        }

        offset('Z', ':');
        offset('ZZ', '');

        // PARSING

        addRegexToken('Z', matchShortOffset);
        addRegexToken('ZZ', matchShortOffset);
        addParseToken(['Z', 'ZZ'], function (input, array, config) {
            config._useUTC = true;
            config._tzm = offsetFromString(matchShortOffset, input);
        });

        // HELPERS

        // timezone chunker
        // '+10:00' > ['10',  '00']
        // '-1530'  > ['-15', '30']
        var chunkOffset = /([\+\-]|\d\d)/gi;

        function offsetFromString(matcher, string) {
            var matches = (string || '').match(matcher) || [];
            var chunk = matches[matches.length - 1] || [];
            var parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
            var minutes = +(parts[1] * 60) + toInt(parts[2]);

            return parts[0] === '+' ? minutes : -minutes;
        }

        // Return a moment from input, that is local/utc/zone equivalent to model.
        function cloneWithOffset(input, model) {
            var res, diff;
            if (model._isUTC) {
                res = model.clone();
                diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - +res;
                // Use low-level api, because this fn is low-level api.
                res._d.setTime(+res._d + diff);
                utils_hooks__hooks.updateOffset(res, false);
                return res;
            } else {
                return local__createLocal(input).local();
            }
        }

        function getDateOffset(m) {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
        }

        // HOOKS

        // This function will be called whenever a moment is mutated.
        // It is intended to keep the offset in sync with the timezone.
        utils_hooks__hooks.updateOffset = function () {};

        // MOMENTS

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        function getSetOffset(input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            if (input != null) {
                if (typeof input === 'string') {
                    input = offsetFromString(matchShortOffset, input);
                } else if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = getDateOffset(this);
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        utils_hooks__hooks.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
                return this;
            } else {
                return this._isUTC ? offset : getDateOffset(this);
            }
        }

        function getSetZone(input, keepLocalTime) {
            if (input != null) {
                if (typeof input !== 'string') {
                    input = -input;
                }

                this.utcOffset(input, keepLocalTime);

                return this;
            } else {
                return -this.utcOffset();
            }
        }

        function setOffsetToUTC(keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        }

        function setOffsetToLocal(keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(getDateOffset(this), 'm');
                }
            }
            return this;
        }

        function setOffsetToParsedOffset() {
            if (this._tzm) {
                this.utcOffset(this._tzm);
            } else if (typeof this._i === 'string') {
                this.utcOffset(offsetFromString(matchOffset, this._i));
            }
            return this;
        }

        function hasAlignedHourOffset(input) {
            if (!this.isValid()) {
                return false;
            }
            input = input ? local__createLocal(input).utcOffset() : 0;

            return (this.utcOffset() - input) % 60 === 0;
        }

        function isDaylightSavingTime() {
            return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
        }

        function isDaylightSavingTimeShifted() {
            if (!isUndefined(this._isDSTShifted)) {
                return this._isDSTShifted;
            }

            var c = {};

            copyConfig(c, this);
            c = prepareConfig(c);

            if (c._a) {
                var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
                this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
            } else {
                this._isDSTShifted = false;
            }

            return this._isDSTShifted;
        }

        function isLocal() {
            return this.isValid() ? !this._isUTC : false;
        }

        function isUtcOffset() {
            return this.isValid() ? this._isUTC : false;
        }

        function isUtc() {
            return this.isValid() ? this._isUTC && this._offset === 0 : false;
        }

        // ASP.NET json date format regex
        var aspNetRegex = /(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        var isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

        function create__createDuration(input, key) {
            var duration = input,

            // matching against regexp is expensive, do it on demand
            match = null,
                sign,
                ret,
                diffRes;

            if (isDuration(input)) {
                duration = {
                    ms: input._milliseconds,
                    d: input._days,
                    M: input._months
                };
            } else if (typeof input === 'number') {
                duration = {};
                if (key) {
                    duration[key] = input;
                } else {
                    duration.milliseconds = input;
                }
            } else if (!!(match = aspNetRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: 0,
                    d: toInt(match[DATE]) * sign,
                    h: toInt(match[HOUR]) * sign,
                    m: toInt(match[MINUTE]) * sign,
                    s: toInt(match[SECOND]) * sign,
                    ms: toInt(match[MILLISECOND]) * sign
                };
            } else if (!!(match = isoRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: parseIso(match[2], sign),
                    M: parseIso(match[3], sign),
                    d: parseIso(match[4], sign),
                    h: parseIso(match[5], sign),
                    m: parseIso(match[6], sign),
                    s: parseIso(match[7], sign),
                    w: parseIso(match[8], sign)
                };
            } else if (duration == null) {
                // checks for null or undefined
                duration = {};
            } else if ((typeof duration === 'undefined' ? 'undefined' : _typeof(duration)) === 'object' && ('from' in duration || 'to' in duration)) {
                diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

                duration = {};
                duration.ms = diffRes.milliseconds;
                duration.M = diffRes.months;
            }

            ret = new Duration(duration);

            if (isDuration(input) && hasOwnProp(input, '_locale')) {
                ret._locale = input._locale;
            }

            return ret;
        }

        create__createDuration.fn = Duration.prototype;

        function parseIso(inp, sign) {
            // We'd normally use ~~inp for this, but unfortunately it also
            // converts floats to ints.
            // inp may be undefined, so careful calling replace on it.
            var res = inp && parseFloat(inp.replace(',', '.'));
            // apply sign while we're at it
            return (isNaN(res) ? 0 : res) * sign;
        }

        function positiveMomentsDifference(base, other) {
            var res = { milliseconds: 0, months: 0 };

            res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
            if (base.clone().add(res.months, 'M').isAfter(other)) {
                --res.months;
            }

            res.milliseconds = +other - +base.clone().add(res.months, 'M');

            return res;
        }

        function momentsDifference(base, other) {
            var res;
            if (!(base.isValid() && other.isValid())) {
                return { milliseconds: 0, months: 0 };
            }

            other = cloneWithOffset(other, base);
            if (base.isBefore(other)) {
                res = positiveMomentsDifference(base, other);
            } else {
                res = positiveMomentsDifference(other, base);
                res.milliseconds = -res.milliseconds;
                res.months = -res.months;
            }

            return res;
        }

        // TODO: remove 'name' arg after deprecation is removed
        function createAdder(direction, name) {
            return function (val, period) {
                var dur, tmp;
                //invert the arguments, but complain about it
                if (period !== null && !isNaN(+period)) {
                    deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                    tmp = val;val = period;period = tmp;
                }

                val = typeof val === 'string' ? +val : val;
                dur = create__createDuration(val, period);
                add_subtract__addSubtract(this, dur, direction);
                return this;
            };
        }

        function add_subtract__addSubtract(mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds,
                days = duration._days,
                months = duration._months;

            if (!mom.isValid()) {
                // No op
                return;
            }

            updateOffset = updateOffset == null ? true : updateOffset;

            if (milliseconds) {
                mom._d.setTime(+mom._d + milliseconds * isAdding);
            }
            if (days) {
                get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
            }
            if (months) {
                setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
            }
            if (updateOffset) {
                utils_hooks__hooks.updateOffset(mom, days || months);
            }
        }

        var add_subtract__add = createAdder(1, 'add');
        var add_subtract__subtract = createAdder(-1, 'subtract');

        function moment_calendar__calendar(time, formats) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're local/utc/offset or not.
            var now = time || local__createLocal(),
                sod = cloneWithOffset(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';

            var output = formats && (isFunction(formats[format]) ? formats[format]() : formats[format]);

            return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
        }

        function clone() {
            return new Moment(this);
        }

        function isAfter(input, units) {
            var localInput = isMoment(input) ? input : local__createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
            if (units === 'millisecond') {
                return +this > +localInput;
            } else {
                return +localInput < +this.clone().startOf(units);
            }
        }

        function isBefore(input, units) {
            var localInput = isMoment(input) ? input : local__createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
            if (units === 'millisecond') {
                return +this < +localInput;
            } else {
                return +this.clone().endOf(units) < +localInput;
            }
        }

        function isBetween(from, to, units) {
            return this.isAfter(from, units) && this.isBefore(to, units);
        }

        function isSame(input, units) {
            var localInput = isMoment(input) ? input : local__createLocal(input),
                inputMs;
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                return +this === +localInput;
            } else {
                inputMs = +localInput;
                return +this.clone().startOf(units) <= inputMs && inputMs <= +this.clone().endOf(units);
            }
        }

        function isSameOrAfter(input, units) {
            return this.isSame(input, units) || this.isAfter(input, units);
        }

        function isSameOrBefore(input, units) {
            return this.isSame(input, units) || this.isBefore(input, units);
        }

        function diff(input, units, asFloat) {
            var that, zoneDelta, delta, output;

            if (!this.isValid()) {
                return NaN;
            }

            that = cloneWithOffset(input, this);

            if (!that.isValid()) {
                return NaN;
            }

            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month' || units === 'quarter') {
                output = monthDiff(this, that);
                if (units === 'quarter') {
                    output = output / 3;
                } else if (units === 'year') {
                    output = output / 12;
                }
            } else {
                delta = this - that;
                output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
            }
            return asFloat ? output : absFloor(output);
        }

        function monthDiff(a, b) {
            // difference in months
            var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),

            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
                anchor2,
                adjust;

            if (b - anchor < 0) {
                anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor - anchor2);
            } else {
                anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor2 - anchor);
            }

            return -(wholeMonthDiff + adjust);
        }

        utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

        function toString() {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        }

        function moment_format__toISOString() {
            var m = this.clone().utc();
            if (0 < m.year() && m.year() <= 9999) {
                if (isFunction(Date.prototype.toISOString)) {
                    // native implementation is ~50x faster, use it when we can
                    return this.toDate().toISOString();
                } else {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        }

        function format(inputString) {
            var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
            return this.localeData().postformat(output);
        }

        function from(time, withoutSuffix) {
            if (this.isValid() && (isMoment(time) && time.isValid() || local__createLocal(time).isValid())) {
                return create__createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function fromNow(withoutSuffix) {
            return this.from(local__createLocal(), withoutSuffix);
        }

        function to(time, withoutSuffix) {
            if (this.isValid() && (isMoment(time) && time.isValid() || local__createLocal(time).isValid())) {
                return create__createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function toNow(withoutSuffix) {
            return this.to(local__createLocal(), withoutSuffix);
        }

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        function locale(key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = locale_locales__getLocale(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        }

        var lang = deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        });

        function localeData() {
            return this._locale;
        }

        function startOf(units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
                case 'year':
                    this.month(0);
                /* falls through */
                case 'quarter':
                case 'month':
                    this.date(1);
                /* falls through */
                case 'week':
                case 'isoWeek':
                case 'day':
                    this.hours(0);
                /* falls through */
                case 'hour':
                    this.minutes(0);
                /* falls through */
                case 'minute':
                    this.seconds(0);
                /* falls through */
                case 'second':
                    this.milliseconds(0);
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            }
            if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        }

        function endOf(units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }
            return this.startOf(units).add(1, units === 'isoWeek' ? 'week' : units).subtract(1, 'ms');
        }

        function to_type__valueOf() {
            return +this._d - (this._offset || 0) * 60000;
        }

        function unix() {
            return Math.floor(+this / 1000);
        }

        function toDate() {
            return this._offset ? new Date(+this) : this._d;
        }

        function toArray() {
            var m = this;
            return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
        }

        function toObject() {
            var m = this;
            return {
                years: m.year(),
                months: m.month(),
                date: m.date(),
                hours: m.hours(),
                minutes: m.minutes(),
                seconds: m.seconds(),
                milliseconds: m.milliseconds()
            };
        }

        function toJSON() {
            // JSON.stringify(new Date(NaN)) === 'null'
            return this.isValid() ? this.toISOString() : 'null';
        }

        function moment_valid__isValid() {
            return valid__isValid(this);
        }

        function parsingFlags() {
            return extend({}, getParsingFlags(this));
        }

        function invalidAt() {
            return getParsingFlags(this).overflow;
        }

        function creationData() {
            return {
                input: this._i,
                format: this._f,
                locale: this._locale,
                isUTC: this._isUTC,
                strict: this._strict
            };
        }

        // FORMATTING

        addFormatToken(0, ['gg', 2], 0, function () {
            return this.weekYear() % 100;
        });

        addFormatToken(0, ['GG', 2], 0, function () {
            return this.isoWeekYear() % 100;
        });

        function addWeekYearFormatToken(token, getter) {
            addFormatToken(0, [token, token.length], 0, getter);
        }

        addWeekYearFormatToken('gggg', 'weekYear');
        addWeekYearFormatToken('ggggg', 'weekYear');
        addWeekYearFormatToken('GGGG', 'isoWeekYear');
        addWeekYearFormatToken('GGGGG', 'isoWeekYear');

        // ALIASES

        addUnitAlias('weekYear', 'gg');
        addUnitAlias('isoWeekYear', 'GG');

        // PARSING

        addRegexToken('G', matchSigned);
        addRegexToken('g', matchSigned);
        addRegexToken('GG', match1to2, match2);
        addRegexToken('gg', match1to2, match2);
        addRegexToken('GGGG', match1to4, match4);
        addRegexToken('gggg', match1to4, match4);
        addRegexToken('GGGGG', match1to6, match6);
        addRegexToken('ggggg', match1to6, match6);

        addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
            week[token.substr(0, 2)] = toInt(input);
        });

        addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
            week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
        });

        // MOMENTS

        function getSetWeekYear(input) {
            return getSetWeekYearHelper.call(this, input, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
        }

        function getSetISOWeekYear(input) {
            return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
        }

        function getISOWeeksInYear() {
            return weeksInYear(this.year(), 1, 4);
        }

        function getWeeksInYear() {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        }

        function getSetWeekYearHelper(input, week, weekday, dow, doy) {
            var weeksTarget;
            if (input == null) {
                return weekOfYear(this, dow, doy).year;
            } else {
                weeksTarget = weeksInYear(input, dow, doy);
                if (week > weeksTarget) {
                    week = weeksTarget;
                }
                return setWeekAll.call(this, input, week, weekday, dow, doy);
            }
        }

        function setWeekAll(weekYear, week, weekday, dow, doy) {
            var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
                date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

            // console.log("got", weekYear, week, weekday, "set", date.toISOString());
            this.year(date.getUTCFullYear());
            this.month(date.getUTCMonth());
            this.date(date.getUTCDate());
            return this;
        }

        // FORMATTING

        addFormatToken('Q', 0, 'Qo', 'quarter');

        // ALIASES

        addUnitAlias('quarter', 'Q');

        // PARSING

        addRegexToken('Q', match1);
        addParseToken('Q', function (input, array) {
            array[MONTH] = (toInt(input) - 1) * 3;
        });

        // MOMENTS

        function getSetQuarter(input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        }

        // FORMATTING

        addFormatToken('w', ['ww', 2], 'wo', 'week');
        addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

        // ALIASES

        addUnitAlias('week', 'w');
        addUnitAlias('isoWeek', 'W');

        // PARSING

        addRegexToken('w', match1to2);
        addRegexToken('ww', match1to2, match2);
        addRegexToken('W', match1to2);
        addRegexToken('WW', match1to2, match2);

        addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
            week[token.substr(0, 1)] = toInt(input);
        });

        // HELPERS

        // LOCALES

        function localeWeek(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        }

        var defaultLocaleWeek = {
            dow: 0, // Sunday is the first day of the week.
            doy: 6 // The week that contains Jan 1st is the first week of the year.
        };

        function localeFirstDayOfWeek() {
            return this._week.dow;
        }

        function localeFirstDayOfYear() {
            return this._week.doy;
        }

        // MOMENTS

        function getSetWeek(input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        function getSetISOWeek(input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        // FORMATTING

        addFormatToken('D', ['DD', 2], 'Do', 'date');

        // ALIASES

        addUnitAlias('date', 'D');

        // PARSING

        addRegexToken('D', match1to2);
        addRegexToken('DD', match1to2, match2);
        addRegexToken('Do', function (isStrict, locale) {
            return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
        });

        addParseToken(['D', 'DD'], DATE);
        addParseToken('Do', function (input, array) {
            array[DATE] = toInt(input.match(match1to2)[0], 10);
        });

        // MOMENTS

        var getSetDayOfMonth = makeGetSet('Date', true);

        // FORMATTING

        addFormatToken('d', 0, 'do', 'day');

        addFormatToken('dd', 0, 0, function (format) {
            return this.localeData().weekdaysMin(this, format);
        });

        addFormatToken('ddd', 0, 0, function (format) {
            return this.localeData().weekdaysShort(this, format);
        });

        addFormatToken('dddd', 0, 0, function (format) {
            return this.localeData().weekdays(this, format);
        });

        addFormatToken('e', 0, 0, 'weekday');
        addFormatToken('E', 0, 0, 'isoWeekday');

        // ALIASES

        addUnitAlias('day', 'd');
        addUnitAlias('weekday', 'e');
        addUnitAlias('isoWeekday', 'E');

        // PARSING

        addRegexToken('d', match1to2);
        addRegexToken('e', match1to2);
        addRegexToken('E', match1to2);
        addRegexToken('dd', matchWord);
        addRegexToken('ddd', matchWord);
        addRegexToken('dddd', matchWord);

        addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
            var weekday = config._locale.weekdaysParse(input, token, config._strict);
            // if we didn't get a weekday name, mark the date as invalid
            if (weekday != null) {
                week.d = weekday;
            } else {
                getParsingFlags(config).invalidWeekday = input;
            }
        });

        addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
            week[token] = toInt(input);
        });

        // HELPERS

        function parseWeekday(input, locale) {
            if (typeof input !== 'string') {
                return input;
            }

            if (!isNaN(input)) {
                return parseInt(input, 10);
            }

            input = locale.weekdaysParse(input);
            if (typeof input === 'number') {
                return input;
            }

            return null;
        }

        // LOCALES

        var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
        function localeWeekdays(m, format) {
            return isArray(this._weekdays) ? this._weekdays[m.day()] : this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
        }

        var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
        function localeWeekdaysShort(m) {
            return this._weekdaysShort[m.day()];
        }

        var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
        function localeWeekdaysMin(m) {
            return this._weekdaysMin[m.day()];
        }

        function localeWeekdaysParse(weekdayName, format, strict) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._minWeekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._fullWeekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already

                mom = local__createLocal([2000, 1]).day(i);
                if (strict && !this._fullWeekdaysParse[i]) {
                    this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                    this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                    this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
                }
                if (!this._weekdaysParse[i]) {
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function getSetDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        }

        function getSetLocaleDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        }

        function getSetISODayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        }

        // FORMATTING

        addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

        // ALIASES

        addUnitAlias('dayOfYear', 'DDD');

        // PARSING

        addRegexToken('DDD', match1to3);
        addRegexToken('DDDD', match3);
        addParseToken(['DDD', 'DDDD'], function (input, array, config) {
            config._dayOfYear = toInt(input);
        });

        // HELPERS

        // MOMENTS

        function getSetDayOfYear(input) {
            var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
        }

        // FORMATTING

        function hFormat() {
            return this.hours() % 12 || 12;
        }

        addFormatToken('H', ['HH', 2], 0, 'hour');
        addFormatToken('h', ['hh', 2], 0, hFormat);

        addFormatToken('hmm', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
        });

        addFormatToken('hmmss', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
        });

        addFormatToken('Hmm', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2);
        });

        addFormatToken('Hmmss', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
        });

        function meridiem(token, lowercase) {
            addFormatToken(token, 0, 0, function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
            });
        }

        meridiem('a', true);
        meridiem('A', false);

        // ALIASES

        addUnitAlias('hour', 'h');

        // PARSING

        function matchMeridiem(isStrict, locale) {
            return locale._meridiemParse;
        }

        addRegexToken('a', matchMeridiem);
        addRegexToken('A', matchMeridiem);
        addRegexToken('H', match1to2);
        addRegexToken('h', match1to2);
        addRegexToken('HH', match1to2, match2);
        addRegexToken('hh', match1to2, match2);

        addRegexToken('hmm', match3to4);
        addRegexToken('hmmss', match5to6);
        addRegexToken('Hmm', match3to4);
        addRegexToken('Hmmss', match5to6);

        addParseToken(['H', 'HH'], HOUR);
        addParseToken(['a', 'A'], function (input, array, config) {
            config._isPm = config._locale.isPM(input);
            config._meridiem = input;
        });
        addParseToken(['h', 'hh'], function (input, array, config) {
            array[HOUR] = toInt(input);
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmmss', function (input, array, config) {
            var pos1 = input.length - 4;
            var pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('Hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
        });
        addParseToken('Hmmss', function (input, array, config) {
            var pos1 = input.length - 4;
            var pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
        });

        // LOCALES

        function localeIsPM(input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return (input + '').toLowerCase().charAt(0) === 'p';
        }

        var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
        function localeMeridiem(hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        }

        // MOMENTS

        // Setting the hour should keep the time, because the user explicitly
        // specified which hour he wants. So trying to maintain the same hour (in
        // a new timezone) makes sense. Adding/subtracting hours does not follow
        // this rule.
        var getSetHour = makeGetSet('Hours', true);

        // FORMATTING

        addFormatToken('m', ['mm', 2], 0, 'minute');

        // ALIASES

        addUnitAlias('minute', 'm');

        // PARSING

        addRegexToken('m', match1to2);
        addRegexToken('mm', match1to2, match2);
        addParseToken(['m', 'mm'], MINUTE);

        // MOMENTS

        var getSetMinute = makeGetSet('Minutes', false);

        // FORMATTING

        addFormatToken('s', ['ss', 2], 0, 'second');

        // ALIASES

        addUnitAlias('second', 's');

        // PARSING

        addRegexToken('s', match1to2);
        addRegexToken('ss', match1to2, match2);
        addParseToken(['s', 'ss'], SECOND);

        // MOMENTS

        var getSetSecond = makeGetSet('Seconds', false);

        // FORMATTING

        addFormatToken('S', 0, 0, function () {
            return ~ ~(this.millisecond() / 100);
        });

        addFormatToken(0, ['SS', 2], 0, function () {
            return ~ ~(this.millisecond() / 10);
        });

        addFormatToken(0, ['SSS', 3], 0, 'millisecond');
        addFormatToken(0, ['SSSS', 4], 0, function () {
            return this.millisecond() * 10;
        });
        addFormatToken(0, ['SSSSS', 5], 0, function () {
            return this.millisecond() * 100;
        });
        addFormatToken(0, ['SSSSSS', 6], 0, function () {
            return this.millisecond() * 1000;
        });
        addFormatToken(0, ['SSSSSSS', 7], 0, function () {
            return this.millisecond() * 10000;
        });
        addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
            return this.millisecond() * 100000;
        });
        addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
            return this.millisecond() * 1000000;
        });

        // ALIASES

        addUnitAlias('millisecond', 'ms');

        // PARSING

        addRegexToken('S', match1to3, match1);
        addRegexToken('SS', match1to3, match2);
        addRegexToken('SSS', match1to3, match3);

        var token;
        for (token = 'SSSS'; token.length <= 9; token += 'S') {
            addRegexToken(token, matchUnsigned);
        }

        function parseMs(input, array) {
            array[MILLISECOND] = toInt(('0.' + input) * 1000);
        }

        for (token = 'S'; token.length <= 9; token += 'S') {
            addParseToken(token, parseMs);
        }
        // MOMENTS

        var getSetMillisecond = makeGetSet('Milliseconds', false);

        // FORMATTING

        addFormatToken('z', 0, 0, 'zoneAbbr');
        addFormatToken('zz', 0, 0, 'zoneName');

        // MOMENTS

        function getZoneAbbr() {
            return this._isUTC ? 'UTC' : '';
        }

        function getZoneName() {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        }

        var momentPrototype__proto = Moment.prototype;

        momentPrototype__proto.add = add_subtract__add;
        momentPrototype__proto.calendar = moment_calendar__calendar;
        momentPrototype__proto.clone = clone;
        momentPrototype__proto.diff = diff;
        momentPrototype__proto.endOf = endOf;
        momentPrototype__proto.format = format;
        momentPrototype__proto.from = from;
        momentPrototype__proto.fromNow = fromNow;
        momentPrototype__proto.to = to;
        momentPrototype__proto.toNow = toNow;
        momentPrototype__proto.get = getSet;
        momentPrototype__proto.invalidAt = invalidAt;
        momentPrototype__proto.isAfter = isAfter;
        momentPrototype__proto.isBefore = isBefore;
        momentPrototype__proto.isBetween = isBetween;
        momentPrototype__proto.isSame = isSame;
        momentPrototype__proto.isSameOrAfter = isSameOrAfter;
        momentPrototype__proto.isSameOrBefore = isSameOrBefore;
        momentPrototype__proto.isValid = moment_valid__isValid;
        momentPrototype__proto.lang = lang;
        momentPrototype__proto.locale = locale;
        momentPrototype__proto.localeData = localeData;
        momentPrototype__proto.max = prototypeMax;
        momentPrototype__proto.min = prototypeMin;
        momentPrototype__proto.parsingFlags = parsingFlags;
        momentPrototype__proto.set = getSet;
        momentPrototype__proto.startOf = startOf;
        momentPrototype__proto.subtract = add_subtract__subtract;
        momentPrototype__proto.toArray = toArray;
        momentPrototype__proto.toObject = toObject;
        momentPrototype__proto.toDate = toDate;
        momentPrototype__proto.toISOString = moment_format__toISOString;
        momentPrototype__proto.toJSON = toJSON;
        momentPrototype__proto.toString = toString;
        momentPrototype__proto.unix = unix;
        momentPrototype__proto.valueOf = to_type__valueOf;
        momentPrototype__proto.creationData = creationData;

        // Year
        momentPrototype__proto.year = getSetYear;
        momentPrototype__proto.isLeapYear = getIsLeapYear;

        // Week Year
        momentPrototype__proto.weekYear = getSetWeekYear;
        momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

        // Quarter
        momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

        // Month
        momentPrototype__proto.month = getSetMonth;
        momentPrototype__proto.daysInMonth = getDaysInMonth;

        // Week
        momentPrototype__proto.week = momentPrototype__proto.weeks = getSetWeek;
        momentPrototype__proto.isoWeek = momentPrototype__proto.isoWeeks = getSetISOWeek;
        momentPrototype__proto.weeksInYear = getWeeksInYear;
        momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

        // Day
        momentPrototype__proto.date = getSetDayOfMonth;
        momentPrototype__proto.day = momentPrototype__proto.days = getSetDayOfWeek;
        momentPrototype__proto.weekday = getSetLocaleDayOfWeek;
        momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
        momentPrototype__proto.dayOfYear = getSetDayOfYear;

        // Hour
        momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

        // Minute
        momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

        // Second
        momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

        // Millisecond
        momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

        // Offset
        momentPrototype__proto.utcOffset = getSetOffset;
        momentPrototype__proto.utc = setOffsetToUTC;
        momentPrototype__proto.local = setOffsetToLocal;
        momentPrototype__proto.parseZone = setOffsetToParsedOffset;
        momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
        momentPrototype__proto.isDST = isDaylightSavingTime;
        momentPrototype__proto.isDSTShifted = isDaylightSavingTimeShifted;
        momentPrototype__proto.isLocal = isLocal;
        momentPrototype__proto.isUtcOffset = isUtcOffset;
        momentPrototype__proto.isUtc = isUtc;
        momentPrototype__proto.isUTC = isUtc;

        // Timezone
        momentPrototype__proto.zoneAbbr = getZoneAbbr;
        momentPrototype__proto.zoneName = getZoneName;

        // Deprecations
        momentPrototype__proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
        momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
        momentPrototype__proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
        momentPrototype__proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

        var momentPrototype = momentPrototype__proto;

        function moment__createUnix(input) {
            return local__createLocal(input * 1000);
        }

        function moment__createInZone() {
            return local__createLocal.apply(null, arguments).parseZone();
        }

        var defaultCalendar = {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L'
        };

        function locale_calendar__calendar(key, mom, now) {
            var output = this._calendar[key];
            return isFunction(output) ? output.call(mom, now) : output;
        }

        var defaultLongDateFormat = {
            LTS: 'h:mm:ss A',
            LT: 'h:mm A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A'
        };

        function longDateFormat(key) {
            var format = this._longDateFormat[key],
                formatUpper = this._longDateFormat[key.toUpperCase()];

            if (format || !formatUpper) {
                return format;
            }

            this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
                return val.slice(1);
            });

            return this._longDateFormat[key];
        }

        var defaultInvalidDate = 'Invalid date';

        function invalidDate() {
            return this._invalidDate;
        }

        var defaultOrdinal = '%d';
        var defaultOrdinalParse = /\d{1,2}/;

        function ordinal(number) {
            return this._ordinal.replace('%d', number);
        }

        function preParsePostFormat(string) {
            return string;
        }

        var defaultRelativeTime = {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years'
        };

        function relative__relativeTime(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return isFunction(output) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
        }

        function pastFuture(diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return isFunction(format) ? format(output) : format.replace(/%s/i, output);
        }

        function locale_set__set(config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (isFunction(prop)) {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _ordinalParseLenient.
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
        }

        var prototype__proto = Locale.prototype;

        prototype__proto._calendar = defaultCalendar;
        prototype__proto.calendar = locale_calendar__calendar;
        prototype__proto._longDateFormat = defaultLongDateFormat;
        prototype__proto.longDateFormat = longDateFormat;
        prototype__proto._invalidDate = defaultInvalidDate;
        prototype__proto.invalidDate = invalidDate;
        prototype__proto._ordinal = defaultOrdinal;
        prototype__proto.ordinal = ordinal;
        prototype__proto._ordinalParse = defaultOrdinalParse;
        prototype__proto.preparse = preParsePostFormat;
        prototype__proto.postformat = preParsePostFormat;
        prototype__proto._relativeTime = defaultRelativeTime;
        prototype__proto.relativeTime = relative__relativeTime;
        prototype__proto.pastFuture = pastFuture;
        prototype__proto.set = locale_set__set;

        // Month
        prototype__proto.months = localeMonths;
        prototype__proto._months = defaultLocaleMonths;
        prototype__proto.monthsShort = localeMonthsShort;
        prototype__proto._monthsShort = defaultLocaleMonthsShort;
        prototype__proto.monthsParse = localeMonthsParse;

        // Week
        prototype__proto.week = localeWeek;
        prototype__proto._week = defaultLocaleWeek;
        prototype__proto.firstDayOfYear = localeFirstDayOfYear;
        prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

        // Day of Week
        prototype__proto.weekdays = localeWeekdays;
        prototype__proto._weekdays = defaultLocaleWeekdays;
        prototype__proto.weekdaysMin = localeWeekdaysMin;
        prototype__proto._weekdaysMin = defaultLocaleWeekdaysMin;
        prototype__proto.weekdaysShort = localeWeekdaysShort;
        prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
        prototype__proto.weekdaysParse = localeWeekdaysParse;

        // Hours
        prototype__proto.isPM = localeIsPM;
        prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
        prototype__proto.meridiem = localeMeridiem;

        function lists__get(format, index, field, setter) {
            var locale = locale_locales__getLocale();
            var utc = create_utc__createUTC().set(setter, index);
            return locale[field](utc, format);
        }

        function list(format, index, field, count, setter) {
            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';

            if (index != null) {
                return lists__get(format, index, field, setter);
            }

            var i;
            var out = [];
            for (i = 0; i < count; i++) {
                out[i] = lists__get(format, i, field, setter);
            }
            return out;
        }

        function lists__listMonths(format, index) {
            return list(format, index, 'months', 12, 'month');
        }

        function lists__listMonthsShort(format, index) {
            return list(format, index, 'monthsShort', 12, 'month');
        }

        function lists__listWeekdays(format, index) {
            return list(format, index, 'weekdays', 7, 'day');
        }

        function lists__listWeekdaysShort(format, index) {
            return list(format, index, 'weekdaysShort', 7, 'day');
        }

        function lists__listWeekdaysMin(format, index) {
            return list(format, index, 'weekdaysMin', 7, 'day');
        }

        locale_locales__getSetGlobalLocale('en', {
            monthsParse: [/^jan/i, /^feb/i, /^mar/i, /^apr/i, /^may/i, /^jun/i, /^jul/i, /^aug/i, /^sep/i, /^oct/i, /^nov/i, /^dec/i],
            longMonthsParse: [/^january$/i, /^february$/i, /^march$/i, /^april$/i, /^may$/i, /^june$/i, /^july$/i, /^august$/i, /^september$/i, /^october$/i, /^november$/i, /^december$/i],
            shortMonthsParse: [/^jan$/i, /^feb$/i, /^mar$/i, /^apr$/i, /^may$/i, /^jun$/i, /^jul$/i, /^aug/i, /^sept?$/i, /^oct$/i, /^nov$/i, /^dec$/i],
            ordinalParse: /\d{1,2}(th|st|nd|rd)/,
            ordinal: function ordinal(number) {
                var b = number % 10,
                    output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
                return number + output;
            }
        });

        // Side effect imports
        utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
        utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

        var mathAbs = Math.abs;

        function duration_abs__abs() {
            var data = this._data;

            this._milliseconds = mathAbs(this._milliseconds);
            this._days = mathAbs(this._days);
            this._months = mathAbs(this._months);

            data.milliseconds = mathAbs(data.milliseconds);
            data.seconds = mathAbs(data.seconds);
            data.minutes = mathAbs(data.minutes);
            data.hours = mathAbs(data.hours);
            data.months = mathAbs(data.months);
            data.years = mathAbs(data.years);

            return this;
        }

        function duration_add_subtract__addSubtract(duration, input, value, direction) {
            var other = create__createDuration(input, value);

            duration._milliseconds += direction * other._milliseconds;
            duration._days += direction * other._days;
            duration._months += direction * other._months;

            return duration._bubble();
        }

        // supports only 2.0-style add(1, 's') or add(duration)
        function duration_add_subtract__add(input, value) {
            return duration_add_subtract__addSubtract(this, input, value, 1);
        }

        // supports only 2.0-style subtract(1, 's') or subtract(duration)
        function duration_add_subtract__subtract(input, value) {
            return duration_add_subtract__addSubtract(this, input, value, -1);
        }

        function absCeil(number) {
            if (number < 0) {
                return Math.floor(number);
            } else {
                return Math.ceil(number);
            }
        }

        function bubble() {
            var milliseconds = this._milliseconds;
            var days = this._days;
            var months = this._months;
            var data = this._data;
            var seconds, minutes, hours, years, monthsFromDays;

            // if we have a mix of positive and negative values, bubble down first
            // check: https://github.com/moment/moment/issues/2166
            if (!(milliseconds >= 0 && days >= 0 && months >= 0 || milliseconds <= 0 && days <= 0 && months <= 0)) {
                milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
                days = 0;
                months = 0;
            }

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absFloor(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absFloor(seconds / 60);
            data.minutes = minutes % 60;

            hours = absFloor(minutes / 60);
            data.hours = hours % 24;

            days += absFloor(hours / 24);

            // convert days to months
            monthsFromDays = absFloor(daysToMonths(days));
            months += monthsFromDays;
            days -= absCeil(monthsToDays(monthsFromDays));

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;

            return this;
        }

        function daysToMonths(days) {
            // 400 years have 146097 days (taking into account leap year rules)
            // 400 years have 12 months === 4800
            return days * 4800 / 146097;
        }

        function monthsToDays(months) {
            // the reverse of daysToMonths
            return months * 146097 / 4800;
        }

        function as(units) {
            var days;
            var months;
            var milliseconds = this._milliseconds;

            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + milliseconds / 864e5;
                months = this._months + daysToMonths(days);
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(monthsToDays(this._months));
                switch (units) {
                    case 'week':
                        return days / 7 + milliseconds / 6048e5;
                    case 'day':
                        return days + milliseconds / 864e5;
                    case 'hour':
                        return days * 24 + milliseconds / 36e5;
                    case 'minute':
                        return days * 1440 + milliseconds / 6e4;
                    case 'second':
                        return days * 86400 + milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond':
                        return Math.floor(days * 864e5) + milliseconds;
                    default:
                        throw new Error('Unknown unit ' + units);
                }
            }
        }

        // TODO: Use this.as('ms')?
        function duration_as__valueOf() {
            return this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + toInt(this._months / 12) * 31536e6;
        }

        function makeAs(alias) {
            return function () {
                return this.as(alias);
            };
        }

        var asMilliseconds = makeAs('ms');
        var asSeconds = makeAs('s');
        var asMinutes = makeAs('m');
        var asHours = makeAs('h');
        var asDays = makeAs('d');
        var asWeeks = makeAs('w');
        var asMonths = makeAs('M');
        var asYears = makeAs('y');

        function duration_get__get(units) {
            units = normalizeUnits(units);
            return this[units + 's']();
        }

        function makeGetter(name) {
            return function () {
                return this._data[name];
            };
        }

        var milliseconds = makeGetter('milliseconds');
        var seconds = makeGetter('seconds');
        var minutes = makeGetter('minutes');
        var hours = makeGetter('hours');
        var days = makeGetter('days');
        var months = makeGetter('months');
        var years = makeGetter('years');

        function weeks() {
            return absFloor(this.days() / 7);
        }

        var round = Math.round;
        var thresholds = {
            s: 45, // seconds to minute
            m: 45, // minutes to hour
            h: 22, // hours to day
            d: 26, // days to month
            M: 11 // months to year
        };

        // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
            return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }

        function duration_humanize__relativeTime(posNegDuration, withoutSuffix, locale) {
            var duration = create__createDuration(posNegDuration).abs();
            var seconds = round(duration.as('s'));
            var minutes = round(duration.as('m'));
            var hours = round(duration.as('h'));
            var days = round(duration.as('d'));
            var months = round(duration.as('M'));
            var years = round(duration.as('y'));

            var a = seconds < thresholds.s && ['s', seconds] || minutes <= 1 && ['m'] || minutes < thresholds.m && ['mm', minutes] || hours <= 1 && ['h'] || hours < thresholds.h && ['hh', hours] || days <= 1 && ['d'] || days < thresholds.d && ['dd', days] || months <= 1 && ['M'] || months < thresholds.M && ['MM', months] || years <= 1 && ['y'] || ['yy', years];

            a[2] = withoutSuffix;
            a[3] = +posNegDuration > 0;
            a[4] = locale;
            return substituteTimeAgo.apply(null, a);
        }

        // This function allows you to set a threshold for relative time strings
        function duration_humanize__getSetRelativeTimeThreshold(threshold, limit) {
            if (thresholds[threshold] === undefined) {
                return false;
            }
            if (limit === undefined) {
                return thresholds[threshold];
            }
            thresholds[threshold] = limit;
            return true;
        }

        function humanize(withSuffix) {
            var locale = this.localeData();
            var output = duration_humanize__relativeTime(this, !withSuffix, locale);

            if (withSuffix) {
                output = locale.pastFuture(+this, output);
            }

            return locale.postformat(output);
        }

        var iso_string__abs = Math.abs;

        function iso_string__toISOString() {
            // for ISO strings we do not use the normal bubbling rules:
            //  * milliseconds bubble up until they become hours
            //  * days do not bubble at all
            //  * months bubble up until they become years
            // This is because there is no context-free conversion between hours and days
            // (think of clock changes)
            // and also not between days and months (28-31 days per month)
            var seconds = iso_string__abs(this._milliseconds) / 1000;
            var days = iso_string__abs(this._days);
            var months = iso_string__abs(this._months);
            var minutes, hours, years;

            // 3600 seconds -> 60 minutes -> 1 hour
            minutes = absFloor(seconds / 60);
            hours = absFloor(minutes / 60);
            seconds %= 60;
            minutes %= 60;

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var Y = years;
            var M = months;
            var D = days;
            var h = hours;
            var m = minutes;
            var s = seconds;
            var total = this.asSeconds();

            if (!total) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (total < 0 ? '-' : '') + 'P' + (Y ? Y + 'Y' : '') + (M ? M + 'M' : '') + (D ? D + 'D' : '') + (h || m || s ? 'T' : '') + (h ? h + 'H' : '') + (m ? m + 'M' : '') + (s ? s + 'S' : '');
        }

        var duration_prototype__proto = Duration.prototype;

        duration_prototype__proto.abs = duration_abs__abs;
        duration_prototype__proto.add = duration_add_subtract__add;
        duration_prototype__proto.subtract = duration_add_subtract__subtract;
        duration_prototype__proto.as = as;
        duration_prototype__proto.asMilliseconds = asMilliseconds;
        duration_prototype__proto.asSeconds = asSeconds;
        duration_prototype__proto.asMinutes = asMinutes;
        duration_prototype__proto.asHours = asHours;
        duration_prototype__proto.asDays = asDays;
        duration_prototype__proto.asWeeks = asWeeks;
        duration_prototype__proto.asMonths = asMonths;
        duration_prototype__proto.asYears = asYears;
        duration_prototype__proto.valueOf = duration_as__valueOf;
        duration_prototype__proto._bubble = bubble;
        duration_prototype__proto.get = duration_get__get;
        duration_prototype__proto.milliseconds = milliseconds;
        duration_prototype__proto.seconds = seconds;
        duration_prototype__proto.minutes = minutes;
        duration_prototype__proto.hours = hours;
        duration_prototype__proto.days = days;
        duration_prototype__proto.weeks = weeks;
        duration_prototype__proto.months = months;
        duration_prototype__proto.years = years;
        duration_prototype__proto.humanize = humanize;
        duration_prototype__proto.toISOString = iso_string__toISOString;
        duration_prototype__proto.toString = iso_string__toISOString;
        duration_prototype__proto.toJSON = iso_string__toISOString;
        duration_prototype__proto.locale = locale;
        duration_prototype__proto.localeData = localeData;

        // Deprecations
        duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
        duration_prototype__proto.lang = lang;

        // Side effect imports

        // FORMATTING

        addFormatToken('X', 0, 0, 'unix');
        addFormatToken('x', 0, 0, 'valueOf');

        // PARSING

        addRegexToken('x', matchSigned);
        addRegexToken('X', matchTimestamp);
        addParseToken('X', function (input, array, config) {
            config._d = new Date(parseFloat(input, 10) * 1000);
        });
        addParseToken('x', function (input, array, config) {
            config._d = new Date(toInt(input));
        });

        // Side effect imports

        utils_hooks__hooks.version = '2.11.0';

        setHookCallback(local__createLocal);

        utils_hooks__hooks.fn = momentPrototype;
        utils_hooks__hooks.min = min;
        utils_hooks__hooks.max = max;
        utils_hooks__hooks.now = now;
        utils_hooks__hooks.utc = create_utc__createUTC;
        utils_hooks__hooks.unix = moment__createUnix;
        utils_hooks__hooks.months = lists__listMonths;
        utils_hooks__hooks.isDate = isDate;
        utils_hooks__hooks.locale = locale_locales__getSetGlobalLocale;
        utils_hooks__hooks.invalid = valid__createInvalid;
        utils_hooks__hooks.duration = create__createDuration;
        utils_hooks__hooks.isMoment = isMoment;
        utils_hooks__hooks.weekdays = lists__listWeekdays;
        utils_hooks__hooks.parseZone = moment__createInZone;
        utils_hooks__hooks.localeData = locale_locales__getLocale;
        utils_hooks__hooks.isDuration = isDuration;
        utils_hooks__hooks.monthsShort = lists__listMonthsShort;
        utils_hooks__hooks.weekdaysMin = lists__listWeekdaysMin;
        utils_hooks__hooks.defineLocale = defineLocale;
        utils_hooks__hooks.weekdaysShort = lists__listWeekdaysShort;
        utils_hooks__hooks.normalizeUnits = normalizeUnits;
        utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
        utils_hooks__hooks.prototype = momentPrototype;

        var _moment = utils_hooks__hooks;

        return _moment;
    });

    cache["moment"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Hoek = require('hoek');

    // Declare internals

    var internals = {};

    exports = module.exports = internals.Topo = function () {
        this._items = [];
        this.nodes = [];
    };

    internals.Topo.prototype.add = function (nodes, options) {
        var _this = this;

        options = options || {};

        // Validate rules

        var before = [].concat(options.before || []);
        var after = [].concat(options.after || []);
        var group = options.group || '?';
        var sort = options.sort || 0; // Used for merging only

        Hoek.assert(before.indexOf(group) === -1, 'Item cannot come before itself:', group);
        Hoek.assert(before.indexOf('?') === -1, 'Item cannot come before unassociated items');
        Hoek.assert(after.indexOf(group) === -1, 'Item cannot come after itself:', group);
        Hoek.assert(after.indexOf('?') === -1, 'Item cannot come after unassociated items');

        [].concat(nodes).forEach(function (node, i) {

            var item = {
                seq: _this._items.length,
                sort: sort,
                before: before,
                after: after,
                group: group,
                node: node
            };

            _this._items.push(item);
        });

        // Insert event

        var error = this._sort();
        Hoek.assert(!error, 'item', group !== '?' ? 'added into group ' + group : '', 'created a dependencies error');

        return this.nodes;
    };

    internals.Topo.prototype.merge = function (others) {

        others = [].concat(others);
        for (var i = 0; i < others.length; ++i) {
            var other = others[i];
            if (other) {
                for (var j = 0; j < other._items.length; ++j) {
                    var item = Hoek.shallow(other._items[j]);
                    this._items.push(item);
                }
            }
        }

        // Sort items

        this._items.sort(internals.mergeSort);
        for (var i = 0; i < this._items.length; ++i) {
            this._items[i].seq = i;
        }

        var error = this._sort();
        Hoek.assert(!error, 'merge created a dependencies error');

        return this.nodes;
    };

    internals.mergeSort = function (a, b) {

        return a.sort === b.sort ? 0 : a.sort < b.sort ? -1 : 1;
    };

    internals.Topo.prototype._sort = function () {

        // Construct graph

        var groups = {};
        var graph = {};
        var graphAfters = {};

        for (var i = 0; i < this._items.length; ++i) {
            var item = this._items[i];
            var seq = item.seq; // Unique across all items
            var group = item.group;

            // Determine Groups

            groups[group] = groups[group] || [];
            groups[group].push(seq);

            // Build intermediary graph using 'before'

            graph[seq] = item.before;

            // Build second intermediary graph with 'after'

            var after = item.after;
            for (var j = 0; j < after.length; ++j) {
                graphAfters[after[j]] = (graphAfters[after[j]] || []).concat(seq);
            }
        }

        // Expand intermediary graph

        var graphNodes = Object.keys(graph);
        for (var i = 0; i < graphNodes.length; ++i) {
            var node = graphNodes[i];
            var expandedGroups = [];

            var graphNodeItems = Object.keys(graph[node]);
            for (var j = 0; j < graphNodeItems.length; ++j) {
                var group = graph[node][graphNodeItems[j]];
                groups[group] = groups[group] || [];

                for (var k = 0; k < groups[group].length; ++k) {

                    expandedGroups.push(groups[group][k]);
                }
            }
            graph[node] = expandedGroups;
        }

        // Merge intermediary graph using graphAfters into final graph

        var afterNodes = Object.keys(graphAfters);
        for (var i = 0; i < afterNodes.length; ++i) {
            var group = afterNodes[i];

            if (groups[group]) {
                for (var j = 0; j < groups[group].length; ++j) {
                    var node = groups[group][j];
                    graph[node] = graph[node].concat(graphAfters[group]);
                }
            }
        }

        // Compile ancestors

        var children = undefined;
        var ancestors = {};
        graphNodes = Object.keys(graph);
        for (var i = 0; i < graphNodes.length; ++i) {
            var node = graphNodes[i];
            children = graph[node];

            for (var j = 0; j < children.length; ++j) {
                ancestors[children[j]] = (ancestors[children[j]] || []).concat(node);
            }
        }

        // Topo sort

        var visited = {};
        var sorted = [];

        for (var i = 0; i < this._items.length; ++i) {
            var next = i;

            if (ancestors[i]) {
                next = null;
                for (var j = 0; j < this._items.length; ++j) {
                    if (visited[j] === true) {
                        continue;
                    }

                    if (!ancestors[j]) {
                        ancestors[j] = [];
                    }

                    var shouldSeeCount = ancestors[j].length;
                    var seenCount = 0;
                    for (var k = 0; k < shouldSeeCount; ++k) {
                        if (sorted.indexOf(ancestors[j][k]) >= 0) {
                            ++seenCount;
                        }
                    }

                    if (seenCount === shouldSeeCount) {
                        next = j;
                        break;
                    }
                }
            }

            if (next !== null) {
                next = next.toString(); // Normalize to string TODO: replace with seq
                visited[next] = true;
                sorted.push(next);
            }
        }

        if (sorted.length !== this._items.length) {
            return new Error('Invalid dependencies');
        }

        var seqIndex = {};
        for (var i = 0; i < this._items.length; ++i) {
            var item = this._items[i];
            seqIndex[item.seq] = item;
        }

        var sortedNodes = [];
        this._items = sorted.map(function (value) {

            var sortedItem = seqIndex[value];
            sortedNodes.push(sortedItem.node);
            return sortedItem;
        });

        this.nodes = sortedNodes;
    };

    cache["topo"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    // Delcare internals

    var internals = {
        rfc3986: {}
    };

    internals.generate = function () {

        /**
         * elements separated by forward slash ("/") are alternatives.
         */
        var or = '|';

        /**
         * DIGIT = %x30-39 ; 0-9
         */
        var digit = '0-9';
        var digitOnly = '[' + digit + ']';

        /**
         * ALPHA = %x41-5A / %x61-7A   ; A-Z / a-z
         */
        var alpha = 'a-zA-Z';
        var alphaOnly = '[' + alpha + ']';

        /**
         * cidr       = DIGIT                ; 0-9
         *            / %x31-32 DIGIT         ; 10-29
         *            / "3" %x30-32           ; 30-32
         */
        internals.rfc3986.cidr = digitOnly + or + '[1-2]' + digitOnly + or + '3' + '[0-2]';

        /**
         * HEXDIG = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
         */
        var hexDigit = digit + 'A-Fa-f';
        var hexDigitOnly = '[' + hexDigit + ']';

        /**
         * unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
         */
        var unreserved = alpha + digit + '-\\._~';

        /**
         * sub-delims = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
         */
        var subDelims = '!\\$&\'\\(\\)\\*\\+,;=';

        /**
         * pct-encoded = "%" HEXDIG HEXDIG
         */
        var pctEncoded = '%' + hexDigit;

        /**
         * pchar = unreserved / pct-encoded / sub-delims / ":" / "@"
         */
        var pchar = unreserved + pctEncoded + subDelims + ':@';
        var pcharOnly = '[' + pchar + ']';

        /**
         * Rule to support zero-padded addresses.
         */
        var zeroPad = '0?';

        /**
         * dec-octet   = DIGIT                 ; 0-9
         *            / %x31-39 DIGIT         ; 10-99
         *            / "1" 2DIGIT            ; 100-199
         *            / "2" %x30-34 DIGIT     ; 200-249
         *            / "25" %x30-35          ; 250-255
         */
        var decOctect = '(?:' + zeroPad + zeroPad + digitOnly + or + zeroPad + '[1-9]' + digitOnly + or + '1' + digitOnly + digitOnly + or + '2' + '[0-4]' + digitOnly + or + '25' + '[0-5])';

        /**
         * IPv4address = dec-octet "." dec-octet "." dec-octet "." dec-octet
         */
        internals.rfc3986.IPv4address = '(?:' + decOctect + '\\.){3}' + decOctect;

        /**
         * h16 = 1*4HEXDIG ; 16 bits of address represented in hexadecimal
         * ls32 = ( h16 ":" h16 ) / IPv4address ; least-significant 32 bits of address
         * IPv6address =                            6( h16 ":" ) ls32
         *             /                       "::" 5( h16 ":" ) ls32
         *             / [               h16 ] "::" 4( h16 ":" ) ls32
         *             / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
         *             / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
         *             / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
         *             / [ *4( h16 ":" ) h16 ] "::"              ls32
         *             / [ *5( h16 ":" ) h16 ] "::"              h16
         *             / [ *6( h16 ":" ) h16 ] "::"
         */
        var h16 = hexDigitOnly + '{1,4}';
        var ls32 = '(?:' + h16 + ':' + h16 + '|' + internals.rfc3986.IPv4address + ')';
        var IPv6SixHex = '(?:' + h16 + ':){6}' + ls32;
        var IPv6FiveHex = '::(?:' + h16 + ':){5}' + ls32;
        var IPv6FourHex = h16 + '::(?:' + h16 + ':){4}' + ls32;
        var IPv6ThreeHex = '(?:' + h16 + ':){0,1}' + h16 + '::(?:' + h16 + ':){3}' + ls32;
        var IPv6TwoHex = '(?:' + h16 + ':){0,2}' + h16 + '::(?:' + h16 + ':){2}' + ls32;
        var IPv6OneHex = '(?:' + h16 + ':){0,3}' + h16 + '::' + h16 + ':' + ls32;
        var IPv6NoneHex = '(?:' + h16 + ':){0,4}' + h16 + '::' + ls32;
        var IPv6NoneHex2 = '(?:' + h16 + ':){0,5}' + h16 + '::' + h16;
        var IPv6NoneHex3 = '(?:' + h16 + ':){0,6}' + h16 + '::';
        internals.rfc3986.IPv6address = '(?:' + IPv6SixHex + or + IPv6FiveHex + or + IPv6FourHex + or + IPv6ThreeHex + or + IPv6TwoHex + or + IPv6OneHex + or + IPv6NoneHex + or + IPv6NoneHex2 + or + IPv6NoneHex3 + ')';

        /**
         * IPvFuture = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
         */
        internals.rfc3986.IPvFuture = 'v' + hexDigitOnly + '+\\.[' + unreserved + subDelims + ':]+';

        /**
         * scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
         */
        internals.rfc3986.scheme = alphaOnly + '[' + alpha + digit + '+-\\.]*';

        /**
         * userinfo = *( unreserved / pct-encoded / sub-delims / ":" )
         */
        var userinfo = '[' + unreserved + pctEncoded + subDelims + ':]*';

        /**
         * IP-literal = "[" ( IPv6address / IPvFuture  ) "]"
         */
        var IPLiteral = '\\[(?:' + internals.rfc3986.IPv6address + or + internals.rfc3986.IPvFuture + ')\\]';

        /**
         * reg-name = *( unreserved / pct-encoded / sub-delims )
         */
        var regName = '[' + unreserved + pctEncoded + subDelims + ']{0,255}';

        /**
         * host = IP-literal / IPv4address / reg-name
         */
        var host = '(?:' + IPLiteral + or + internals.rfc3986.IPv4address + or + regName + ')';

        /**
         * port = *DIGIT
         */
        var port = digitOnly + '*';

        /**
         * authority   = [ userinfo "@" ] host [ ":" port ]
         */
        var authority = '(?:' + userinfo + '@)?' + host + '(?::' + port + ')?';

        /**
         * segment       = *pchar
         * segment-nz    = 1*pchar
         * path          = path-abempty    ; begins with "/" or is empty
         *               / path-absolute   ; begins with "/" but not "//"
         *               / path-noscheme   ; begins with a non-colon segment
         *               / path-rootless   ; begins with a segment
         *               / path-empty      ; zero characters
         * path-abempty  = *( "/" segment )
         * path-absolute = "/" [ segment-nz *( "/" segment ) ]
         * path-rootless = segment-nz *( "/" segment )
         */
        var segment = pcharOnly + '*';
        var segmentNz = pcharOnly + '+';
        var pathAbEmpty = '(?:\\/' + segment + ')*';
        var pathAbsolute = '\\/(?:' + segmentNz + pathAbEmpty + ')?';
        var pathRootless = segmentNz + pathAbEmpty;

        /**
         * hier-part = "//" authority path
         */
        internals.rfc3986.hierPart = '(?:\\/\\/' + authority + pathAbEmpty + or + pathAbsolute + or + pathRootless + ')';

        /**
         * query = *( pchar / "/" / "?" )
         */
        internals.rfc3986.query = '[' + pchar + '\\/\\?]*(?=#|$)'; //Finish matching either at the fragment part or end of the line.

        /**
         * fragment = *( pchar / "/" / "?" )
         */
        internals.rfc3986.fragment = '[' + pchar + '\\/\\?]*';
    };

    internals.generate();

    module.exports = internals.rfc3986;

    cache["./rfc3986"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var RFC3986 = require('./rfc3986');

    // Declare internals

    var internals = {
        Ip: {
            cidrs: {
                required: '\\/(?:' + RFC3986.cidr + ')',
                optional: '(?:\\/(?:' + RFC3986.cidr + '))?',
                forbidden: ''
            },
            versions: {
                ipv4: RFC3986.IPv4address,
                ipv6: RFC3986.IPv6address,
                ipvfuture: RFC3986.IPvFuture
            }
        }
    };

    internals.Ip.createIpRegex = function (versions, cidr) {

        var regex = undefined;
        for (var i = 0; i < versions.length; ++i) {
            var version = versions[i];
            if (!regex) {
                regex = '^(?:' + internals.Ip.versions[version];
            }
            regex = regex + '|' + internals.Ip.versions[version];
        }

        return new RegExp(regex + ')' + internals.Ip.cidrs[cidr] + '$');
    };

    module.exports = internals.Ip;

    cache["./string/ip"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load Modules

    var RFC3986 = require('./rfc3986');

    // Declare internals

    var internals = {
        Uri: {
            createUriRegex: function createUriRegex(optionalScheme) {

                var scheme = RFC3986.scheme;

                // If we were passed a scheme, use it instead of the generic one
                if (optionalScheme) {

                    // Have to put this in a non-capturing group to handle the OR statements
                    scheme = '(?:' + optionalScheme + ')';
                }

                /**
                 * URI = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
                 */
                return new RegExp('^' + scheme + ':' + RFC3986.hierPart + '(?:\\?' + RFC3986.query + ')?' + '(?:#' + RFC3986.fragment + ')?$');
            }
        }
    };

    module.exports = internals.Uri;

    cache["./string/uri"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    // Declare internals

    var internals = {};

    exports.errors = {
        root: 'value',
        key: '"{{!key}}" ',
        messages: {
            wrapArrays: true
        },
        any: {
            unknown: 'is not allowed',
            invalid: 'contains an invalid value',
            empty: 'is not allowed to be empty',
            required: 'is required',
            allowOnly: 'must be one of {{valids}}',
            default: 'threw an error when running default method'
        },
        alternatives: {
            base: 'not matching any of the allowed alternatives'
        },
        array: {
            base: 'must be an array',
            includes: 'at position {{pos}} does not match any of the allowed types',
            includesSingle: 'single value of "{{!key}}" does not match any of the allowed types',
            includesOne: 'at position {{pos}} fails because {{reason}}',
            includesOneSingle: 'single value of "{{!key}}" fails because {{reason}}',
            includesRequiredUnknowns: 'does not contain {{unknownMisses}} required value(s)',
            includesRequiredKnowns: 'does not contain {{knownMisses}}',
            includesRequiredBoth: 'does not contain {{knownMisses}} and {{unknownMisses}} other required value(s)',
            excludes: 'at position {{pos}} contains an excluded value',
            excludesSingle: 'single value of "{{!key}}" contains an excluded value',
            min: 'must contain at least {{limit}} items',
            max: 'must contain less than or equal to {{limit}} items',
            length: 'must contain {{limit}} items',
            ordered: 'at position {{pos}} fails because {{reason}}',
            orderedLength: 'at position {{pos}} fails because array must contain at most {{limit}} items',
            sparse: 'must not be a sparse array',
            unique: 'position {{pos}} contains a duplicate value'
        },
        boolean: {
            base: 'must be a boolean'
        },
        binary: {
            base: 'must be a buffer or a string',
            min: 'must be at least {{limit}} bytes',
            max: 'must be less than or equal to {{limit}} bytes',
            length: 'must be {{limit}} bytes'
        },
        date: {
            base: 'must be a number of milliseconds or valid date string',
            min: 'must be larger than or equal to "{{limit}}"',
            max: 'must be less than or equal to "{{limit}}"',
            isoDate: 'must be a valid ISO 8601 date',
            ref: 'references "{{ref}}" which is not a date'
        },
        function: {
            base: 'must be a Function',
            arity: 'must have an arity of {{n}}',
            minArity: 'must have an arity greater or equal to {{n}}',
            maxArity: 'must have an arity lesser or equal to {{n}}'
        },
        object: {
            base: 'must be an object',
            child: 'child "{{!key}}" fails because {{reason}}',
            min: 'must have at least {{limit}} children',
            max: 'must have less than or equal to {{limit}} children',
            length: 'must have {{limit}} children',
            allowUnknown: 'is not allowed',
            with: 'missing required peer "{{peer}}"',
            without: 'conflict with forbidden peer "{{peer}}"',
            missing: 'must contain at least one of {{peers}}',
            xor: 'contains a conflict between exclusive peers {{peers}}',
            or: 'must contain at least one of {{peers}}',
            and: 'contains {{present}} without its required peers {{missing}}',
            nand: '!!"{{main}}" must not exist simultaneously with {{peers}}',
            assert: '!!"{{ref}}" validation failed because "{{ref}}" failed to {{message}}',
            rename: {
                multiple: 'cannot rename child "{{from}}" because multiple renames are disabled and another key was already renamed to "{{to}}"',
                override: 'cannot rename child "{{from}}" because override is disabled and target "{{to}}" exists'
            },
            type: 'must be an instance of "{{type}}"'
        },
        number: {
            base: 'must be a number',
            min: 'must be larger than or equal to {{limit}}',
            max: 'must be less than or equal to {{limit}}',
            less: 'must be less than {{limit}}',
            greater: 'must be greater than {{limit}}',
            float: 'must be a float or double',
            integer: 'must be an integer',
            negative: 'must be a negative number',
            positive: 'must be a positive number',
            precision: 'must have no more than {{limit}} decimal places',
            ref: 'references "{{ref}}" which is not a number',
            multiple: 'must be a multiple of {{multiple}}'
        },
        string: {
            base: 'must be a string',
            min: 'length must be at least {{limit}} characters long',
            max: 'length must be less than or equal to {{limit}} characters long',
            length: 'length must be {{limit}} characters long',
            alphanum: 'must only contain alpha-numeric characters',
            token: 'must only contain alpha-numeric and underscore characters',
            regex: {
                base: 'with value "{{!value}}" fails to match the required pattern: {{pattern}}',
                name: 'with value "{{!value}}" fails to match the {{name}} pattern'
            },
            email: 'must be a valid email',
            uri: 'must be a valid uri',
            uriCustomScheme: 'must be a valid uri with a scheme matching the {{scheme}} pattern',
            isoDate: 'must be a valid ISO 8601 date',
            guid: 'must be a valid GUID',
            hex: 'must only contain hexadecimal characters',
            hostname: 'must be a valid hostname',
            lowercase: 'must only contain lowercase characters',
            uppercase: 'must only contain uppercase characters',
            trim: 'must not have leading or trailing whitespace',
            creditCard: 'must be a credit card',
            ref: 'references "{{ref}}" which is not a number',
            ip: 'must be a valid ip address with a {{cidr}} CIDR',
            ipVersion: 'must be a valid ip address of one of the following versions {{version}} with a {{cidr}} CIDR'
        }
    };

    cache["./language"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Hoek = require('hoek');
    var Language = require('./language');

    // Declare internals

    var internals = {};

    internals.stringify = function (value, wrapArrays) {

        var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

        if (value === null) {
            return 'null';
        }

        if (type === 'string') {
            return value;
        }

        if (value instanceof internals.Err || type === 'function') {
            return value.toString();
        }

        if (type === 'object') {
            if (Array.isArray(value)) {
                var partial = '';

                for (var i = 0; i < value.length; ++i) {
                    partial = partial + (partial.length ? ', ' : '') + internals.stringify(value[i], wrapArrays);
                }

                return wrapArrays ? '[' + partial + ']' : partial;
            }

            return value.toString();
        }

        return JSON.stringify(value);
    };

    internals.Err = function (type, context, state, options) {

        this.isJoi = true;
        this.type = type;
        this.context = context || {};
        this.context.key = state.key;
        this.path = state.path;
        this.options = options;
    };

    internals.Err.prototype.toString = function () {
        var _this2 = this;

        var localized = this.options.language;

        if (localized.label) {
            this.context.key = localized.label;
        } else if (this.context.key === '' || this.context.key === null) {
            this.context.key = localized.root || Language.errors.root;
        }

        var format = Hoek.reach(localized, this.type) || Hoek.reach(Language.errors, this.type);
        var hasKey = /\{\{\!?key\}\}/.test(format);
        var skipKey = format.length > 2 && format[0] === '!' && format[1] === '!';

        if (skipKey) {
            format = format.slice(2);
        }

        if (!hasKey && !skipKey) {
            format = (Hoek.reach(localized, 'key') || Hoek.reach(Language.errors, 'key')) + format;
        }

        var wrapArrays = Hoek.reach(localized, 'messages.wrapArrays');
        if (typeof wrapArrays !== 'boolean') {
            wrapArrays = Language.errors.messages.wrapArrays;
        }

        var message = format.replace(/\{\{(\!?)([^}]+)\}\}/g, function ($0, isSecure, name) {

            var value = Hoek.reach(_this2.context, name);
            var normalized = internals.stringify(value, wrapArrays);
            return isSecure ? Hoek.escapeHtml(normalized) : normalized;
        });

        return message;
    };

    exports.create = function (type, context, state, options) {

        return new internals.Err(type, context, state, options);
    };

    exports.process = function (errors, object) {

        if (!errors || !errors.length) {
            return null;
        }

        // Construct error

        var message = '';
        var details = [];

        var processErrors = function processErrors(localErrors, parent) {

            for (var i = 0; i < localErrors.length; ++i) {
                var item = localErrors[i];

                var detail = {
                    message: item.toString(),
                    path: internals.getPath(item),
                    type: item.type,
                    context: item.context
                };

                if (!parent) {
                    message = message + (message ? '. ' : '') + detail.message;
                }

                // Do not push intermediate errors, we're only interested in leafs
                if (item.context.reason && item.context.reason.length) {
                    processErrors(item.context.reason, item.path);
                } else {
                    details.push(detail);
                }
            }
        };

        processErrors(errors);

        var error = new Error(message);
        error.isJoi = true;
        error.name = 'ValidationError';
        error.details = details;
        error._object = object;
        error.annotate = internals.annotate;
        return error;
    };

    internals.getPath = function (item) {

        var recursePath = function recursePath(it) {

            var reachedItem = Hoek.reach(it, 'context.reason.0');
            if (reachedItem && reachedItem.context) {
                return recursePath(reachedItem);
            }

            return it.path;
        };

        return recursePath(item) || item.context.key;
    };

    // Inspired by json-stringify-safe
    internals.safeStringify = function (obj, spaces) {

        return JSON.stringify(obj, internals.serializer(), spaces);
    };

    internals.serializer = function () {

        var keys = [];
        var stack = [];

        var cycleReplacer = function cycleReplacer(key, value) {

            if (stack[0] === value) {
                return '[Circular ~]';
            }

            return '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']';
        };

        return function (key, value) {

            if (stack.length > 0) {
                var thisPos = stack.indexOf(this);
                if (~thisPos) {
                    stack.length = thisPos + 1;
                    keys.length = thisPos + 1;
                    keys[thisPos] = key;
                } else {
                    stack.push(this);
                    keys.push(key);
                }

                if (~stack.indexOf(value)) {
                    value = cycleReplacer.call(this, key, value);
                }
            } else {
                stack.push(value);
            }

            if (Array.isArray(value) && value.placeholders) {
                var placeholders = value.placeholders;
                var arrWithPlaceholders = [];
                for (var i = 0; i < value.length; ++i) {
                    if (placeholders[i]) {
                        arrWithPlaceholders.push(placeholders[i]);
                    }
                    arrWithPlaceholders.push(value[i]);
                }

                value = arrWithPlaceholders;
            }

            return value;
        };
    };

    internals.annotate = function () {

        if (_typeof(this._object) !== 'object') {
            return this.details[0].message;
        }

        var obj = Hoek.clone(this._object || {});

        var lookup = {};
        for (var i = this.details.length - 1; i >= 0; --i) {
            // Reverse order to process deepest child first
            var pos = this.details.length - i;
            var error = this.details[i];
            var path = error.path.split('.');
            var ref = obj;
            for (var j = 0; j < path.length && ref; ++j) {
                var seg = path[j];
                if (j + 1 < path.length) {
                    ref = ref[seg];
                } else {
                    var value = ref[seg];
                    if (Array.isArray(ref)) {
                        var arrayLabel = '_$idx$_' + (i + 1) + '_$end$_';
                        if (!ref.placeholders) {
                            ref.placeholders = {};
                        }

                        if (ref.placeholders[seg]) {
                            ref.placeholders[seg] = ref.placeholders[seg].replace('_$end$_', ', ' + (i + 1) + '_$end$_');
                        } else {
                            ref.placeholders[seg] = arrayLabel;
                        }
                    } else {
                        if (value !== undefined) {
                            delete ref[seg];
                            var objectLabel = seg + '_$key$_' + pos + '_$end$_';
                            ref[objectLabel] = value;
                            lookup[error.path] = objectLabel;
                        } else if (lookup[error.path]) {
                            var replacement = lookup[error.path];
                            var appended = replacement.replace('_$end$_', ', ' + pos + '_$end$_');
                            ref[appended] = ref[replacement];
                            lookup[error.path] = appended;
                            delete ref[replacement];
                        } else {
                            ref['_$miss$_' + seg + '|' + pos + '_$end$_'] = '__missing__';
                        }
                    }
                }
            }
        }

        var message = internals.safeStringify(obj, 2).replace(/_\$key\$_([, \d]+)_\$end\$_\"/g, function ($0, $1) {

            return '" \u001b[31m[' + $1 + ']\u001b[0m';
        }).replace(/\"_\$miss\$_([^\|]+)\|(\d+)_\$end\$_\"\: \"__missing__\"/g, function ($0, $1, $2) {

            return '\u001b[41m"' + $1 + '"\u001b[0m\u001b[31m [' + $2 + ']: -- missing --\u001b[0m';
        }).replace(/\s*\"_\$idx\$_([, \d]+)_\$end\$_\",?\n(.*)/g, function ($0, $1, $2) {

            return '\n' + $2 + ' \u001b[31m[' + $1 + ']\u001b[0m';
        });

        message = message + '\n\u001b[31m';

        for (var i = 0; i < this.details.length; ++i) {
            message = message + '\n[' + (i + 1) + '] ' + this.details[i].message;
        }

        message = message + '\u001b[0m';

        return message;
    };

    cache["./errors"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Hoek = require('hoek');

    // Declare internals

    var internals = {};

    exports.create = function (key, options) {

        Hoek.assert(typeof key === 'string', 'Invalid reference key:', key);

        var settings = Hoek.clone(options); // options can be reused and modified

        var ref = function ref(value, validationOptions) {

            return Hoek.reach(ref.isContext ? validationOptions.context : value, ref.key, settings);
        };

        ref.isContext = key[0] === (settings && settings.contextPrefix || '$');
        ref.key = ref.isContext ? key.slice(1) : key;
        ref.path = ref.key.split(settings && settings.separator || '.');
        ref.depth = ref.path.length;
        ref.root = ref.path[0];
        ref.isJoi = true;

        ref.toString = function () {

            return (ref.isContext ? 'context:' : 'ref:') + ref.key;
        };

        return ref;
    };

    exports.isRef = function (ref) {

        return typeof ref === 'function' && ref.isJoi;
    };

    exports.push = function (array, ref) {

        if (exports.isRef(ref) && !ref.isContext) {

            array.push(ref.root);
        }
    };

    cache["./ref"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Hoek = require('hoek');
    var Ref = require('./ref');

    // Type modules are delay-loaded to prevent circular dependencies

    // Declare internals

    var internals = {
        any: null,
        date: require('./date'),
        string: require('./string'),
        number: require('./number'),
        boolean: require('./boolean'),
        alt: null,
        object: null
    };

    exports.schema = function (config) {

        internals.any = internals.any || new (require('./any'))();
        internals.alt = internals.alt || require('./alternatives');
        internals.object = internals.object || require('./object');

        if (config && (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {

            if (config.isJoi) {
                return config;
            }

            if (Array.isArray(config)) {
                return internals.alt.try(config);
            }

            if (config instanceof RegExp) {
                return internals.string.regex(config);
            }

            if (config instanceof Date) {
                return internals.date.valid(config);
            }

            return internals.object.keys(config);
        }

        if (typeof config === 'string') {
            return internals.string.valid(config);
        }

        if (typeof config === 'number') {
            return internals.number.valid(config);
        }

        if (typeof config === 'boolean') {
            return internals.boolean.valid(config);
        }

        if (Ref.isRef(config)) {
            return internals.any.valid(config);
        }

        Hoek.assert(config === null, 'Invalid schema content:', config);

        return internals.any.valid(null);
    };

    exports.ref = function (id) {

        return Ref.isRef(id) ? id : Ref.create(id);
    };

    cache["./cast"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Hoek = require('hoek');
    var Ref = require('./ref');
    var Errors = require('./errors');
    var Alternatives = null; // Delay-loaded to prevent circular dependencies
    var Cast = null;

    // Declare internals

    var internals = {};

    internals.defaults = {
        abortEarly: true,
        convert: true,
        allowUnknown: false,
        skipFunctions: false,
        stripUnknown: false,
        language: {},
        presence: 'optional',
        raw: false,
        strip: false,
        noDefaults: false

        // context: null
    };

    internals.checkOptions = function (options) {

        var optionType = {
            abortEarly: 'boolean',
            convert: 'boolean',
            allowUnknown: 'boolean',
            skipFunctions: 'boolean',
            stripUnknown: 'boolean',
            language: 'object',
            presence: ['string', 'required', 'optional', 'forbidden', 'ignore'],
            raw: 'boolean',
            context: 'object',
            strip: 'boolean',
            noDefaults: 'boolean'
        };

        var keys = Object.keys(options);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var opt = optionType[key];
            var type = opt;
            var values = null;

            if (Array.isArray(opt)) {
                type = opt[0];
                values = opt.slice(1);
            }

            Hoek.assert(type, 'unknown key ' + key);
            Hoek.assert(_typeof(options[key]) === type, key + ' should be of type ' + type);
            if (values) {
                Hoek.assert(values.indexOf(options[key]) >= 0, key + ' should be one of ' + values.join(', '));
            }
        }
    };

    module.exports = internals.Any = function () {

        Cast = Cast || require('./cast');

        this.isJoi = true;
        this._type = 'any';
        this._settings = null;
        this._valids = new internals.Set();
        this._invalids = new internals.Set();
        this._tests = [];
        this._refs = [];
        this._flags = {/*
                       presence: 'optional',                   // optional, required, forbidden, ignore
                       allowOnly: false,
                       allowUnknown: undefined,
                       default: undefined,
                       forbidden: false,
                       encoding: undefined,
                       insensitive: false,
                       trim: false,
                       case: undefined,                        // upper, lower
                       empty: undefined,
                       func: false
                       */};

        this._description = null;
        this._unit = null;
        this._notes = [];
        this._tags = [];
        this._examples = [];
        this._meta = [];

        this._inner = {}; // Hash of arrays of immutable objects
    };

    internals.Any.prototype.createError = Errors.create;

    internals.Any.prototype.isImmutable = true; // Prevents Hoek from deep cloning schema objects

    internals.Any.prototype.clone = function () {

        var obj = Object.create(Object.getPrototypeOf(this));

        obj.isJoi = true;
        obj._type = this._type;
        obj._settings = internals.concatSettings(this._settings);
        obj._valids = Hoek.clone(this._valids);
        obj._invalids = Hoek.clone(this._invalids);
        obj._tests = this._tests.slice();
        obj._refs = this._refs.slice();
        obj._flags = Hoek.clone(this._flags);

        obj._description = this._description;
        obj._unit = this._unit;
        obj._notes = this._notes.slice();
        obj._tags = this._tags.slice();
        obj._examples = this._examples.slice();
        obj._meta = this._meta.slice();

        obj._inner = {};
        var inners = Object.keys(this._inner);
        for (var i = 0; i < inners.length; ++i) {
            var key = inners[i];
            obj._inner[key] = this._inner[key] ? this._inner[key].slice() : null;
        }

        return obj;
    };

    internals.Any.prototype.concat = function (schema) {

        Hoek.assert(schema && schema.isJoi, 'Invalid schema object');
        Hoek.assert(this._type === 'any' || schema._type === 'any' || schema._type === this._type, 'Cannot merge type', this._type, 'with another type:', schema._type);

        var obj = this.clone();

        if (this._type === 'any' && schema._type !== 'any') {

            // Reset values as if we were "this"
            var tmpObj = schema.clone();
            var keysToRestore = ['_settings', '_valids', '_invalids', '_tests', '_refs', '_flags', '_description', '_unit', '_notes', '_tags', '_examples', '_meta', '_inner'];

            for (var i = 0; i < keysToRestore.length; ++i) {
                tmpObj[keysToRestore[i]] = obj[keysToRestore[i]];
            }

            obj = tmpObj;
        }

        obj._settings = obj._settings ? internals.concatSettings(obj._settings, schema._settings) : schema._settings;
        obj._valids.merge(schema._valids, schema._invalids);
        obj._invalids.merge(schema._invalids, schema._valids);
        obj._tests = obj._tests.concat(schema._tests);
        obj._refs = obj._refs.concat(schema._refs);
        Hoek.merge(obj._flags, schema._flags);

        obj._description = schema._description || obj._description;
        obj._unit = schema._unit || obj._unit;
        obj._notes = obj._notes.concat(schema._notes);
        obj._tags = obj._tags.concat(schema._tags);
        obj._examples = obj._examples.concat(schema._examples);
        obj._meta = obj._meta.concat(schema._meta);

        var inners = Object.keys(schema._inner);
        var isObject = obj._type === 'object';
        for (var i = 0; i < inners.length; ++i) {
            var key = inners[i];
            var source = schema._inner[key];
            if (source) {
                var target = obj._inner[key];
                if (target) {
                    if (isObject && key === 'children') {
                        var keys = {};

                        for (var j = 0; j < target.length; ++j) {
                            keys[target[j].key] = j;
                        }

                        for (var j = 0; j < source.length; ++j) {
                            var sourceKey = source[j].key;
                            if (keys[sourceKey] >= 0) {
                                target[keys[sourceKey]] = {
                                    key: sourceKey,
                                    schema: target[keys[sourceKey]].schema.concat(source[j].schema)
                                };
                            } else {
                                target.push(source[j]);
                            }
                        }
                    } else {
                        obj._inner[key] = obj._inner[key].concat(source);
                    }
                } else {
                    obj._inner[key] = source.slice();
                }
            }
        }

        return obj;
    };

    internals.Any.prototype._test = function (name, arg, func) {

        Hoek.assert(!this._flags.allowOnly, 'Cannot define rules when valid values specified');

        var obj = this.clone();
        obj._tests.push({ func: func, name: name, arg: arg });
        return obj;
    };

    internals.Any.prototype.options = function (options) {

        Hoek.assert(!options.context, 'Cannot override context');
        internals.checkOptions(options);

        var obj = this.clone();
        obj._settings = internals.concatSettings(obj._settings, options);
        return obj;
    };

    internals.Any.prototype.strict = function (isStrict) {

        var obj = this.clone();
        obj._settings = obj._settings || {};
        obj._settings.convert = isStrict === undefined ? false : !isStrict;
        return obj;
    };

    internals.Any.prototype.raw = function (isRaw) {

        var obj = this.clone();
        obj._settings = obj._settings || {};
        obj._settings.raw = isRaw === undefined ? true : isRaw;
        return obj;
    };

    internals.Any.prototype._allow = function () {

        var values = Hoek.flatten(Array.prototype.slice.call(arguments));
        for (var i = 0; i < values.length; ++i) {
            var value = values[i];

            Hoek.assert(value !== undefined, 'Cannot call allow/valid/invalid with undefined');
            this._invalids.remove(value);
            this._valids.add(value, this._refs);
        }
    };

    internals.Any.prototype.allow = function () {

        var obj = this.clone();
        obj._allow.apply(obj, arguments);
        return obj;
    };

    internals.Any.prototype.valid = internals.Any.prototype.only = internals.Any.prototype.equal = function () {

        Hoek.assert(!this._tests.length, 'Cannot set valid values when rules specified');

        var obj = this.allow.apply(this, arguments);
        obj._flags.allowOnly = true;
        return obj;
    };

    internals.Any.prototype.invalid = internals.Any.prototype.disallow = internals.Any.prototype.not = function (value) {

        var obj = this.clone();
        var values = Hoek.flatten(Array.prototype.slice.call(arguments));
        for (var i = 0; i < values.length; ++i) {
            value = values[i];

            Hoek.assert(value !== undefined, 'Cannot call allow/valid/invalid with undefined');
            obj._valids.remove(value);
            obj._invalids.add(value, this._refs);
        }

        return obj;
    };

    internals.Any.prototype.required = internals.Any.prototype.exist = function () {

        var obj = this.clone();
        obj._flags.presence = 'required';
        return obj;
    };

    internals.Any.prototype.optional = function () {

        var obj = this.clone();
        obj._flags.presence = 'optional';
        return obj;
    };

    internals.Any.prototype.forbidden = function () {

        var obj = this.clone();
        obj._flags.presence = 'forbidden';
        return obj;
    };

    internals.Any.prototype.strip = function () {

        var obj = this.clone();
        obj._flags.strip = true;
        return obj;
    };

    internals.Any.prototype.applyFunctionToChildren = function (children, fn, args, root) {

        children = [].concat(children);

        if (children.length !== 1 || children[0] !== '') {
            root = root ? root + '.' : '';

            var extraChildren = (children[0] === '' ? children.slice(1) : children).map(function (child) {

                return root + child;
            });

            throw new Error('unknown key(s) ' + extraChildren.join(', '));
        }

        return this[fn].apply(this, args);
    };

    internals.Any.prototype.default = function (value, description) {

        if (typeof value === 'function' && !Ref.isRef(value)) {

            if (!value.description && description) {

                value.description = description;
            }

            if (!this._flags.func) {
                Hoek.assert(typeof value.description === 'string' && value.description.length > 0, 'description must be provided when default value is a function');
            }
        }

        var obj = this.clone();
        obj._flags.default = value;
        Ref.push(obj._refs, value);
        return obj;
    };

    internals.Any.prototype.empty = function (schema) {

        var obj = this.clone();
        obj._flags.empty = schema === undefined ? undefined : Cast.schema(schema);
        return obj;
    };

    internals.Any.prototype.when = function (ref, options) {

        Hoek.assert(options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object', 'Invalid options');
        Hoek.assert(options.then !== undefined || options.otherwise !== undefined, 'options must have at least one of "then" or "otherwise"');

        var then = options.then ? this.concat(Cast.schema(options.then)) : this;
        var otherwise = options.otherwise ? this.concat(Cast.schema(options.otherwise)) : this;

        Alternatives = Alternatives || require('./alternatives');
        var obj = Alternatives.when(ref, { is: options.is, then: then, otherwise: otherwise });
        obj._flags.presence = 'ignore';
        return obj;
    };

    internals.Any.prototype.description = function (desc) {

        Hoek.assert(desc && typeof desc === 'string', 'Description must be a non-empty string');

        var obj = this.clone();
        obj._description = desc;
        return obj;
    };

    internals.Any.prototype.notes = function (notes) {

        Hoek.assert(notes && (typeof notes === 'string' || Array.isArray(notes)), 'Notes must be a non-empty string or array');

        var obj = this.clone();
        obj._notes = obj._notes.concat(notes);
        return obj;
    };

    internals.Any.prototype.tags = function (tags) {

        Hoek.assert(tags && (typeof tags === 'string' || Array.isArray(tags)), 'Tags must be a non-empty string or array');

        var obj = this.clone();
        obj._tags = obj._tags.concat(tags);
        return obj;
    };

    internals.Any.prototype.meta = function (meta) {

        Hoek.assert(meta !== undefined, 'Meta cannot be undefined');

        var obj = this.clone();
        obj._meta = obj._meta.concat(meta);
        return obj;
    };

    internals.Any.prototype.example = function (value) {

        Hoek.assert(arguments.length, 'Missing example');
        var result = this._validate(value, null, internals.defaults);
        Hoek.assert(!result.errors, 'Bad example:', result.errors && Errors.process(result.errors, value));

        var obj = this.clone();
        obj._examples = obj._examples.concat(value);
        return obj;
    };

    internals.Any.prototype.unit = function (name) {

        Hoek.assert(name && typeof name === 'string', 'Unit name must be a non-empty string');

        var obj = this.clone();
        obj._unit = name;
        return obj;
    };

    internals._try = function (fn, arg) {

        var err = undefined;
        var result = undefined;

        try {
            result = fn.call(null, arg);
        } catch (e) {
            err = e;
        }

        return {
            value: result,
            error: err
        };
    };

    internals.Any.prototype._validate = function (value, state, options, reference) {
        var _this3 = this;

        var originalValue = value;

        // Setup state and settings

        state = state || { key: '', path: '', parent: null, reference: reference };

        if (this._settings) {
            options = internals.concatSettings(options, this._settings);
        }

        var errors = [];
        var finish = function finish() {

            var finalValue = undefined;

            if (!_this3._flags.strip) {
                if (value !== undefined) {
                    finalValue = options.raw ? originalValue : value;
                } else if (options.noDefaults) {
                    finalValue = originalValue;
                } else if (Ref.isRef(_this3._flags.default)) {
                    finalValue = _this3._flags.default(state.parent, options);
                } else if (typeof _this3._flags.default === 'function' && !(_this3._flags.func && !_this3._flags.default.description)) {

                    var arg = undefined;

                    if (state.parent !== null && _this3._flags.default.length > 0) {

                        arg = Hoek.clone(state.parent);
                    }

                    var defaultValue = internals._try(_this3._flags.default, arg);
                    finalValue = defaultValue.value;
                    if (defaultValue.error) {
                        errors.push(_this3.createError('any.default', defaultValue.error, state, options));
                    }
                } else {
                    finalValue = Hoek.clone(_this3._flags.default);
                }
            }

            return {
                value: finalValue,
                errors: errors.length ? errors : null
            };
        };

        // Check presence requirements

        var presence = this._flags.presence || options.presence;
        if (presence === 'optional') {
            if (value === undefined) {
                var isDeepDefault = this._flags.hasOwnProperty('default') && this._flags.default === undefined;
                if (isDeepDefault && this._type === 'object') {
                    value = {};
                } else {
                    return finish();
                }
            }
        } else if (presence === 'required' && value === undefined) {

            errors.push(this.createError('any.required', null, state, options));
            return finish();
        } else if (presence === 'forbidden') {
            if (value === undefined) {
                return finish();
            }

            errors.push(this.createError('any.unknown', null, state, options));
            return finish();
        }

        if (this._flags.empty && !this._flags.empty._validate(value, null, internals.defaults).errors) {
            value = undefined;
            return finish();
        }

        // Check allowed and denied values using the original value

        if (this._valids.has(value, state, options, this._flags.insensitive)) {
            return finish();
        }

        if (this._invalids.has(value, state, options, this._flags.insensitive)) {
            errors.push(this.createError(value === '' ? 'any.empty' : 'any.invalid', null, state, options));
            if (options.abortEarly || value === undefined) {
                // No reason to keep validating missing value

                return finish();
            }
        }

        // Convert value and validate type

        if (this._base) {
            var base = this._base.call(this, value, state, options);
            if (base.errors) {
                value = base.value;
                errors = errors.concat(base.errors);
                return finish(); // Base error always aborts early
            }

            if (base.value !== value) {
                value = base.value;

                // Check allowed and denied values using the converted value

                if (this._valids.has(value, state, options, this._flags.insensitive)) {
                    return finish();
                }

                if (this._invalids.has(value, state, options, this._flags.insensitive)) {
                    errors.push(this.createError('any.invalid', null, state, options));
                    if (options.abortEarly) {
                        return finish();
                    }
                }
            }
        }

        // Required values did not match

        if (this._flags.allowOnly) {
            errors.push(this.createError('any.allowOnly', { valids: this._valids.values({ stripUndefined: true }) }, state, options));
            if (options.abortEarly) {
                return finish();
            }
        }

        // Helper.validate tests

        for (var i = 0; i < this._tests.length; ++i) {
            var test = this._tests[i];
            var err = test.func.call(this, value, state, options);
            if (err) {
                errors.push(err);
                if (options.abortEarly) {
                    return finish();
                }
            }
        }

        return finish();
    };

    internals.Any.prototype._validateWithOptions = function (value, options, callback) {

        if (options) {
            internals.checkOptions(options);
        }

        var settings = internals.concatSettings(internals.defaults, options);
        var result = this._validate(value, null, settings);
        var errors = Errors.process(result.errors, value);

        if (callback) {
            return callback(errors, result.value);
        }

        return { error: errors, value: result.value };
    };

    internals.Any.prototype.validate = function (value, callback) {

        var result = this._validate(value, null, internals.defaults);
        var errors = Errors.process(result.errors, value);

        if (callback) {
            return callback(errors, result.value);
        }

        return { error: errors, value: result.value };
    };

    internals.Any.prototype.describe = function () {

        var description = {
            type: this._type
        };

        var flags = Object.keys(this._flags);
        if (flags.length) {
            if (this._flags.empty) {
                description.flags = {};
                for (var i = 0; i < flags.length; ++i) {
                    var flag = flags[i];
                    description.flags[flag] = flag === 'empty' ? this._flags[flag].describe() : this._flags[flag];
                }
            } else {
                description.flags = this._flags;
            }
        }

        if (this._description) {
            description.description = this._description;
        }

        if (this._notes.length) {
            description.notes = this._notes;
        }

        if (this._tags.length) {
            description.tags = this._tags;
        }

        if (this._meta.length) {
            description.meta = this._meta;
        }

        if (this._examples.length) {
            description.examples = this._examples;
        }

        if (this._unit) {
            description.unit = this._unit;
        }

        var valids = this._valids.values();
        if (valids.length) {
            description.valids = valids;
        }

        var invalids = this._invalids.values();
        if (invalids.length) {
            description.invalids = invalids;
        }

        description.rules = [];

        for (var i = 0; i < this._tests.length; ++i) {
            var validator = this._tests[i];
            var item = { name: validator.name };
            if (validator.arg !== void 0) {
                item.arg = validator.arg;
            }
            description.rules.push(item);
        }

        if (!description.rules.length) {
            delete description.rules;
        }

        var label = Hoek.reach(this._settings, 'language.label');
        if (label) {
            description.label = label;
        }

        return description;
    };

    internals.Any.prototype.label = function (name) {

        Hoek.assert(name && typeof name === 'string', 'Label name must be a non-empty string');

        var obj = this.clone();
        var options = { language: { label: name } };

        // If language.label is set, it should override this label
        obj._settings = internals.concatSettings(options, obj._settings);
        return obj;
    };

    // Set

    internals.Set = function () {

        this._set = [];
    };

    internals.Set.prototype.add = function (value, refs) {

        Hoek.assert(value === null || value === undefined || value instanceof Date || /*Buffer.isBuffer(value) ||*/Ref.isRef(value) || typeof value !== 'function' && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object', 'Value cannot be an object or function');

        if (typeof value !== 'function' && this.has(value, null, null, false)) {

            return;
        }

        Ref.push(refs, value);
        this._set.push(value);
    };

    internals.Set.prototype.merge = function (add, remove) {

        for (var i = 0; i < add._set.length; ++i) {
            this.add(add._set[i]);
        }

        for (var i = 0; i < remove._set.length; ++i) {
            this.remove(remove._set[i]);
        }
    };

    internals.Set.prototype.remove = function (value) {

        this._set = this._set.filter(function (item) {
            return value !== item;
        });
    };

    internals.Set.prototype.has = function (value, state, options, insensitive) {

        for (var i = 0; i < this._set.length; ++i) {
            var items = this._set[i];

            if (Ref.isRef(items)) {
                items = items(state.reference || state.parent, options);
            }

            if (!Array.isArray(items)) {
                items = [items];
            }

            for (var j = 0; j < items.length; ++j) {
                var item = items[j];
                if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== (typeof item === 'undefined' ? 'undefined' : _typeof(item))) {
                    continue;
                }

                if (value === item || value instanceof Date && item instanceof Date && value.getTime() === item.getTime() || insensitive && typeof value === 'string' && value.toLowerCase() === item.toLowerCase() /*||
                                                                                                                                                                                                                    (Buffer.isBuffer(value) && Buffer.isBuffer(item) && value.length === item.length && value.toString('binary') === item.toString('binary'))*/) {

                        return true;
                    }
            }
        }

        return false;
    };

    internals.Set.prototype.values = function (options) {

        if (options && options.stripUndefined) {
            var values = [];

            for (var i = 0; i < this._set.length; ++i) {
                var item = this._set[i];
                if (item !== undefined) {
                    values.push(item);
                }
            }

            return values;
        }

        return this._set.slice();
    };

    internals.concatSettings = function (target, source) {

        // Used to avoid cloning context

        if (!target && !source) {

            return null;
        }

        var obj = {};

        if (target) {
            Object.assign(obj, target);
        }

        if (source) {
            var sKeys = Object.keys(source);
            for (var i = 0; i < sKeys.length; ++i) {
                var key = sKeys[i];
                if (key !== 'language' || !obj.hasOwnProperty(key)) {

                    obj[key] = source[key];
                } else {
                    obj[key] = Hoek.applyToDefaults(obj[key], source[key]);
                }
            }
        }

        return obj;
    };

    cache["./any"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Hoek = require('hoek');
    var Any = require('./any');
    var Cast = require('./cast');
    var Ref = require('./ref');

    // Declare internals

    var internals = {};

    internals.Alternatives = function () {

        Any.call(this);
        this._type = 'alternatives';
        this._invalids.remove(null);

        this._inner.matches = [];
    };

    Hoek.inherits(internals.Alternatives, Any);

    internals.Alternatives.prototype._base = function (value, state, options) {

        var errors = [];
        for (var i = 0; i < this._inner.matches.length; ++i) {
            var item = this._inner.matches[i];
            var schema = item.schema;
            if (!schema) {
                var failed = item.is._validate(item.ref(state.parent, options), null, options, state.parent).errors;
                schema = failed ? item.otherwise : item.then;
                if (!schema) {
                    continue;
                }
            }

            var result = schema._validate(value, state, options);
            if (!result.errors) {
                // Found a valid match
                return result;
            }

            errors = errors.concat(result.errors);
        }

        return { errors: errors.length ? errors : this.createError('alternatives.base', null, state, options) };
    };

    internals.Alternatives.prototype.try = function () /* schemas */{

        var schemas = Hoek.flatten(Array.prototype.slice.call(arguments));
        Hoek.assert(schemas.length, 'Cannot add other alternatives without at least one schema');

        var obj = this.clone();

        for (var i = 0; i < schemas.length; ++i) {
            var cast = Cast.schema(schemas[i]);
            if (cast._refs.length) {
                obj._refs = obj._refs.concat(cast._refs);
            }
            obj._inner.matches.push({ schema: cast });
        }

        return obj;
    };

    internals.Alternatives.prototype.when = function (ref, options) {

        Hoek.assert(Ref.isRef(ref) || typeof ref === 'string', 'Invalid reference:', ref);
        Hoek.assert(options, 'Missing options');
        Hoek.assert((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object', 'Invalid options');
        Hoek.assert(options.hasOwnProperty('is'), 'Missing "is" directive');
        Hoek.assert(options.then !== undefined || options.otherwise !== undefined, 'options must have at least one of "then" or "otherwise"');

        var obj = this.clone();
        var is = Cast.schema(options.is);

        if (options.is === null || !options.is.isJoi) {

            // Only apply required if this wasn't already a schema, we'll suppose people know what they're doing
            is = is.required();
        }

        var item = {
            ref: Cast.ref(ref),
            is: is,
            then: options.then !== undefined ? Cast.schema(options.then) : undefined,
            otherwise: options.otherwise !== undefined ? Cast.schema(options.otherwise) : undefined
        };

        Ref.push(obj._refs, item.ref);
        obj._refs = obj._refs.concat(item.is._refs);

        if (item.then && item.then._refs) {
            obj._refs = obj._refs.concat(item.then._refs);
        }

        if (item.otherwise && item.otherwise._refs) {
            obj._refs = obj._refs.concat(item.otherwise._refs);
        }

        obj._inner.matches.push(item);

        return obj;
    };

    internals.Alternatives.prototype.describe = function () {

        var description = Any.prototype.describe.call(this);
        var alternatives = [];
        for (var i = 0; i < this._inner.matches.length; ++i) {
            var item = this._inner.matches[i];
            if (item.schema) {

                // try()

                alternatives.push(item.schema.describe());
            } else {

                // when()

                var when = {
                    ref: item.ref.toString(),
                    is: item.is.describe()
                };

                if (item.then) {
                    when.then = item.then.describe();
                }

                if (item.otherwise) {
                    when.otherwise = item.otherwise.describe();
                }

                alternatives.push(when);
            }
        }

        description.alternatives = alternatives;
        return description;
    };

    module.exports = new internals.Alternatives();

    cache["./alternatives"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Any = require('./any');
    var Cast = require('./cast');
    var Hoek = require('hoek');

    // Declare internals

    var internals = {};

    internals.fastSplice = function (arr, i) {

        var pos = i;
        while (pos < arr.length) {
            arr[pos++] = arr[pos];
        }

        --arr.length;
    };

    internals.Array = function () {

        Any.call(this);
        this._type = 'array';
        this._inner.items = [];
        this._inner.ordereds = [];
        this._inner.inclusions = [];
        this._inner.exclusions = [];
        this._inner.requireds = [];
        this._flags.sparse = false;
    };

    Hoek.inherits(internals.Array, Any);

    internals.Array.prototype._base = function (value, state, options) {

        var result = {
            value: value
        };

        if (typeof value === 'string' && options.convert) {

            try {
                var converted = JSON.parse(value);
                if (Array.isArray(converted)) {
                    result.value = converted;
                }
            } catch (e) {}
        }

        var isArray = Array.isArray(result.value);
        var wasArray = isArray;
        if (options.convert && this._flags.single && !isArray) {
            result.value = [result.value];
            isArray = true;
        }

        if (!isArray) {
            result.errors = this.createError('array.base', null, state, options);
            return result;
        }

        if (this._inner.inclusions.length || this._inner.exclusions.length || !this._flags.sparse) {

            // Clone the array so that we don't modify the original
            if (wasArray) {
                result.value = result.value.slice(0);
            }

            result.errors = internals.checkItems.call(this, result.value, wasArray, state, options);

            if (result.errors && wasArray && options.convert && this._flags.single) {

                // Attempt a 2nd pass by putting the array inside one.
                var previousErrors = result.errors;

                result.value = [result.value];
                result.errors = internals.checkItems.call(this, result.value, wasArray, state, options);

                if (result.errors) {

                    // Restore previous errors and value since this didn't validate either.
                    result.errors = previousErrors;
                    result.value = result.value[0];
                }
            }
        }

        return result;
    };

    internals.checkItems = function (items, wasArray, state, options) {

        var errors = [];
        var errored = undefined;

        var requireds = this._inner.requireds.slice();
        var ordereds = this._inner.ordereds.slice();
        var inclusions = this._inner.inclusions.concat(requireds);

        var il = items.length;
        for (var i = 0; i < il; ++i) {
            errored = false;
            var item = items[i];
            var isValid = false;
            var localState = { key: i, path: (state.path ? state.path + '.' : '') + i, parent: items, reference: state.reference };
            var res = undefined;

            // Sparse

            if (!this._flags.sparse && item === undefined) {
                errors.push(this.createError('array.sparse', null, { key: state.key, path: localState.path }, options));

                if (options.abortEarly) {
                    return errors;
                }

                continue;
            }

            // Exclusions

            for (var j = 0; j < this._inner.exclusions.length; ++j) {
                res = this._inner.exclusions[j]._validate(item, localState, {}); // Not passing options to use defaults

                if (!res.errors) {
                    errors.push(this.createError(wasArray ? 'array.excludes' : 'array.excludesSingle', { pos: i, value: item }, { key: state.key, path: localState.path }, options));
                    errored = true;

                    if (options.abortEarly) {
                        return errors;
                    }

                    break;
                }
            }

            if (errored) {
                continue;
            }

            // Ordered
            if (this._inner.ordereds.length) {
                if (ordereds.length > 0) {
                    var ordered = ordereds.shift();
                    res = ordered._validate(item, localState, options);
                    if (!res.errors) {
                        if (ordered._flags.strip) {
                            internals.fastSplice(items, i);
                            --i;
                            --il;
                        } else {
                            items[i] = res.value;
                        }
                    } else {
                        errors.push(this.createError('array.ordered', { pos: i, reason: res.errors, value: item }, { key: state.key, path: localState.path }, options));
                        if (options.abortEarly) {
                            return errors;
                        }
                    }
                    continue;
                } else if (!this._inner.items.length) {
                    errors.push(this.createError('array.orderedLength', { pos: i, limit: this._inner.ordereds.length }, { key: state.key, path: localState.path }, options));
                    if (options.abortEarly) {
                        return errors;
                    }
                    continue;
                }
            }

            // Requireds

            var requiredChecks = [];
            var jl = requireds.length;
            for (var j = 0; j < jl; ++j) {
                res = requiredChecks[j] = requireds[j]._validate(item, localState, options);
                if (!res.errors) {
                    items[i] = res.value;
                    isValid = true;
                    internals.fastSplice(requireds, j);
                    --j;
                    --jl;
                    break;
                }
            }

            if (isValid) {
                continue;
            }

            // Inclusions

            jl = inclusions.length;
            for (var j = 0; j < jl; ++j) {
                var inclusion = inclusions[j];

                // Avoid re-running requireds that already didn't match in the previous loop
                var previousCheck = requireds.indexOf(inclusion);
                if (previousCheck !== -1) {
                    res = requiredChecks[previousCheck];
                } else {
                    res = inclusion._validate(item, localState, options);

                    if (!res.errors) {
                        if (inclusion._flags.strip) {
                            internals.fastSplice(items, i);
                            --i;
                            --il;
                        } else {
                            items[i] = res.value;
                        }
                        isValid = true;
                        break;
                    }
                }

                // Return the actual error if only one inclusion defined
                if (jl === 1) {
                    if (options.stripUnknown) {
                        internals.fastSplice(items, i);
                        --i;
                        --il;
                        isValid = true;
                        break;
                    }

                    errors.push(this.createError(wasArray ? 'array.includesOne' : 'array.includesOneSingle', { pos: i, reason: res.errors, value: item }, { key: state.key, path: localState.path }, options));
                    errored = true;

                    if (options.abortEarly) {
                        return errors;
                    }

                    break;
                }
            }

            if (errored) {
                continue;
            }

            if (this._inner.inclusions.length && !isValid) {
                if (options.stripUnknown) {
                    internals.fastSplice(items, i);
                    --i;
                    --il;
                    continue;
                }

                errors.push(this.createError(wasArray ? 'array.includes' : 'array.includesSingle', { pos: i, value: item }, { key: state.key, path: localState.path }, options));

                if (options.abortEarly) {
                    return errors;
                }
            }
        }

        if (requireds.length) {
            internals.fillMissedErrors.call(this, errors, requireds, state, options);
        }

        if (ordereds.length) {
            internals.fillOrderedErrors.call(this, errors, ordereds, state, options);
        }

        return errors.length ? errors : null;
    };

    internals.fillMissedErrors = function (errors, requireds, state, options) {

        var knownMisses = [];
        var unknownMisses = 0;
        for (var i = 0; i < requireds.length; ++i) {
            var label = Hoek.reach(requireds[i], '_settings.language.label');
            if (label) {
                knownMisses.push(label);
            } else {
                ++unknownMisses;
            }
        }

        if (knownMisses.length) {
            if (unknownMisses) {
                errors.push(this.createError('array.includesRequiredBoth', { knownMisses: knownMisses, unknownMisses: unknownMisses }, { key: state.key, path: state.patk }, options));
            } else {
                errors.push(this.createError('array.includesRequiredKnowns', { knownMisses: knownMisses }, { key: state.key, path: state.path }, options));
            }
        } else {
            errors.push(this.createError('array.includesRequiredUnknowns', { unknownMisses: unknownMisses }, { key: state.key, path: state.path }, options));
        }
    };

    internals.fillOrderedErrors = function (errors, ordereds, state, options) {

        var requiredOrdereds = [];

        for (var i = 0; i < ordereds.length; ++i) {
            var presence = Hoek.reach(ordereds[i], '_flags.presence');
            if (presence === 'required') {
                requiredOrdereds.push(ordereds[i]);
            }
        }

        if (requiredOrdereds.length) {
            internals.fillMissedErrors.call(this, errors, requiredOrdereds, state, options);
        }
    };

    internals.Array.prototype.describe = function () {

        var description = Any.prototype.describe.call(this);

        if (this._inner.ordereds.length) {
            description.orderedItems = [];

            for (var i = 0; i < this._inner.ordereds.length; ++i) {
                description.orderedItems.push(this._inner.ordereds[i].describe());
            }
        }

        if (this._inner.items.length) {
            description.items = [];

            for (var i = 0; i < this._inner.items.length; ++i) {
                description.items.push(this._inner.items[i].describe());
            }
        }

        return description;
    };

    internals.Array.prototype.items = function () {

        var obj = this.clone();

        Hoek.flatten(Array.prototype.slice.call(arguments)).forEach(function (type, index) {

            try {
                type = Cast.schema(type);
            } catch (castErr) {
                if (castErr.hasOwnProperty('path')) {
                    castErr.path = index + '.' + castErr.path;
                } else {
                    castErr.path = index;
                }
                castErr.message = castErr.message + '(' + castErr.path + ')';
                throw castErr;
            }

            obj._inner.items.push(type);

            if (type._flags.presence === 'required') {
                obj._inner.requireds.push(type);
            } else if (type._flags.presence === 'forbidden') {
                obj._inner.exclusions.push(type.optional());
            } else {
                obj._inner.inclusions.push(type);
            }
        });

        return obj;
    };

    internals.Array.prototype.ordered = function () {

        var obj = this.clone();

        Hoek.flatten(Array.prototype.slice.call(arguments)).forEach(function (type, index) {

            try {
                type = Cast.schema(type);
            } catch (castErr) {
                if (castErr.hasOwnProperty('path')) {
                    castErr.path = index + '.' + castErr.path;
                } else {
                    castErr.path = index;
                }
                castErr.message = castErr.message + '(' + castErr.path + ')';
                throw castErr;
            }
            obj._inner.ordereds.push(type);
        });

        return obj;
    };

    internals.Array.prototype.min = function (limit) {
        var _this4 = this;

        Hoek.assert(Hoek.isInteger(limit) && limit >= 0, 'limit must be a positive integer');

        return this._test('min', limit, function (value, state, options) {

            if (value.length >= limit) {
                return null;
            }

            return _this4.createError('array.min', { limit: limit, value: value }, state, options);
        });
    };

    internals.Array.prototype.max = function (limit) {
        var _this5 = this;

        Hoek.assert(Hoek.isInteger(limit) && limit >= 0, 'limit must be a positive integer');

        return this._test('max', limit, function (value, state, options) {

            if (value.length <= limit) {
                return null;
            }

            return _this5.createError('array.max', { limit: limit, value: value }, state, options);
        });
    };

    internals.Array.prototype.length = function (limit) {
        var _this6 = this;

        Hoek.assert(Hoek.isInteger(limit) && limit >= 0, 'limit must be a positive integer');

        return this._test('length', limit, function (value, state, options) {

            if (value.length === limit) {
                return null;
            }

            return _this6.createError('array.length', { limit: limit, value: value }, state, options);
        });
    };

    internals.Array.prototype.unique = function () {
        var _this7 = this;

        return this._test('unique', undefined, function (value, state, options) {

            var found = {
                string: {},
                number: {},
                undefined: {},
                boolean: {},
                object: [],
                function: []
            };

            for (var i = 0; i < value.length; ++i) {
                var item = value[i];
                var type = typeof item === 'undefined' ? 'undefined' : _typeof(item);
                var records = found[type];

                // All available types are supported, so it's not possible to reach 100% coverage without ignoring this line.
                // I still want to keep the test for future js versions with new types (eg. Symbol).
                if ( /* $lab:coverage:off$ */records /* $lab:coverage:on$ */) {
                        if (Array.isArray(records)) {
                            for (var j = 0; j < records.length; ++j) {
                                if (Hoek.deepEqual(records[j], item)) {
                                    return _this7.createError('array.unique', { pos: i, value: item }, state, options);
                                }
                            }

                            records.push(item);
                        } else {
                            if (records[item]) {
                                return _this7.createError('array.unique', { pos: i, value: item }, state, options);
                            }

                            records[item] = true;
                        }
                    }
            }

            return null;
        });
    };

    internals.Array.prototype.sparse = function (enabled) {

        var obj = this.clone();
        obj._flags.sparse = enabled === undefined ? true : !!enabled;
        return obj;
    };

    internals.Array.prototype.single = function (enabled) {

        var obj = this.clone();
        obj._flags.single = enabled === undefined ? true : !!enabled;
        return obj;
    };

    module.exports = new internals.Array();

    cache["./array"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Any = require('./any');
    var Hoek = require('hoek');

    // Declare internals

    var internals = {};

    internals.Boolean = function () {

        Any.call(this);
        this._type = 'boolean';
    };

    Hoek.inherits(internals.Boolean, Any);

    internals.Boolean.prototype._base = function (value, state, options) {

        var result = {
            value: value
        };

        if (typeof value === 'string' && options.convert) {

            var lower = value.toLowerCase();
            result.value = lower === 'true' || lower === 'yes' || lower === 'on' ? true : lower === 'false' || lower === 'no' || lower === 'off' ? false : value;
        }

        result.errors = typeof result.value === 'boolean' ? null : this.createError('boolean.base', null, state, options);
        return result;
    };

    module.exports = new internals.Boolean();

    cache["./boolean"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Any = require('./any');
    var Ref = require('./ref');
    var Hoek = require('hoek');
    var Moment = require('../dependencies/moment.js');

    // Declare internals

    var internals = {};

    internals.isoDate = /^(?:\d{4}(?!\d{2}\b))(?:(-?)(?:(?:0[1-9]|1[0-2])(?:\1(?:[12]\d|0[1-9]|3[01]))?|W(?:[0-4]\d|5[0-2])(?:-?[1-7])?|(?:00[1-9]|0[1-9]\d|[12]\d{2}|3(?:[0-5]\d|6[1-6])))(?![T]$|[T][\d]+Z$)(?:[T\s](?:(?:(?:[01]\d|2[0-3])(?:(:?)[0-5]\d)?|24\:?00)(?:[.,]\d+(?!:))?)(?:\2[0-5]\d(?:[.,]\d+)?)?(?:[Z]|(?:[+-])(?:[01]\d|2[0-3])(?::?[0-5]\d)?)?)?)?$/;
    internals.invalidDate = new Date('');
    internals.isIsoDate = (function () {

        var isoString = internals.isoDate.toString();

        return function (date) {

            return date && date.toString() === isoString;
        };
    })();

    internals.Date = function () {

        Any.call(this);
        this._type = 'date';
    };

    Hoek.inherits(internals.Date, Any);

    internals.Date.prototype._base = function (value, state, options) {

        var result = {
            value: options.convert && internals.toDate(value, this._flags.format) || value
        };

        if (result.value instanceof Date && !isNaN(result.value.getTime())) {
            result.errors = null;
        } else {
            result.errors = this.createError(internals.isIsoDate(this._flags.format) ? 'date.isoDate' : 'date.base', null, state, options);
        }

        return result;
    };

    internals.toDate = function (value, format) {

        if (value instanceof Date) {
            return value;
        }

        if (typeof value === 'string' || Hoek.isInteger(value)) {

            if (typeof value === 'string' && /^[+-]?\d+$/.test(value)) {

                value = parseInt(value, 10);
            }

            var date = undefined;
            if (format) {
                if (internals.isIsoDate(format)) {
                    date = format.test(value) ? new Date(value) : internals.invalidDate;
                } else {
                    date = Moment(value, format, true);
                    date = date.isValid() ? date.toDate() : internals.invalidDate;
                }
            } else {
                date = new Date(value);
            }

            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        return null;
    };

    internals.compare = function (type, compare) {

        return function (date) {
            var _this8 = this;

            var isNow = date === 'now';
            var isRef = Ref.isRef(date);

            if (!isNow && !isRef) {
                date = internals.toDate(date);
            }

            Hoek.assert(date, 'Invalid date format');

            return this._test(type, date, function (value, state, options) {

                var compareTo = undefined;
                if (isNow) {
                    compareTo = Date.now();
                } else if (isRef) {
                    compareTo = internals.toDate(date(state.parent, options));

                    if (!compareTo) {
                        return _this8.createError('date.ref', { ref: date.key }, state, options);
                    }

                    compareTo = compareTo.getTime();
                } else {
                    compareTo = date.getTime();
                }

                if (compare(value.getTime(), compareTo)) {
                    return null;
                }

                return _this8.createError('date.' + type, { limit: new Date(compareTo) }, state, options);
            });
        };
    };

    internals.Date.prototype.min = internals.compare('min', function (value, date) {
        return value >= date;
    });
    internals.Date.prototype.max = internals.compare('max', function (value, date) {
        return value <= date;
    });

    internals.Date.prototype.format = function (format) {

        Hoek.assert(typeof format === 'string' || Array.isArray(format) && format.every(function (f) {
            return typeof f === 'string';
        }), 'Invalid format.');

        var obj = this.clone();
        obj._flags.format = format;
        return obj;
    };

    internals.Date.prototype.iso = function () {

        var obj = this.clone();
        obj._flags.format = internals.isoDate;
        return obj;
    };

    internals.Date.prototype._isIsoDate = function (value) {

        return internals.isoDate.test(value);
    };

    module.exports = new internals.Date();

    cache["./date"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Any = require('./any');
    var Ref = require('./ref');
    var Hoek = require('hoek');

    // Declare internals

    var internals = {};

    internals.Number = function () {

        Any.call(this);
        this._type = 'number';
        this._invalids.add(Infinity);
        this._invalids.add(-Infinity);
    };

    Hoek.inherits(internals.Number, Any);

    internals.compare = function (type, compare) {

        return function (limit) {
            var _this9 = this;

            var isRef = Ref.isRef(limit);
            var isNumber = typeof limit === 'number' && !isNaN(limit);

            Hoek.assert(isNumber || isRef, 'limit must be a number or reference');

            return this._test(type, limit, function (value, state, options) {

                var compareTo = undefined;
                if (isRef) {
                    compareTo = limit(state.parent, options);

                    if (!(typeof compareTo === 'number' && !isNaN(compareTo))) {
                        return _this9.createError('number.ref', { ref: limit.key }, state, options);
                    }
                } else {
                    compareTo = limit;
                }

                if (compare(value, compareTo)) {
                    return null;
                }

                return _this9.createError('number.' + type, { limit: compareTo, value: value }, state, options);
            });
        };
    };

    internals.Number.prototype._base = function (value, state, options) {

        var result = {
            errors: null,
            value: value
        };

        if (typeof value === 'string' && options.convert) {

            var number = parseFloat(value);
            result.value = isNaN(number) || !isFinite(value) ? NaN : number;
        }

        var isNumber = typeof result.value === 'number' && !isNaN(result.value);

        if (options.convert && 'precision' in this._flags && isNumber) {

            // This is conceptually equivalent to using toFixed but it should be much faster
            var precision = Math.pow(10, this._flags.precision);
            result.value = Math.round(result.value * precision) / precision;
        }

        result.errors = isNumber ? null : this.createError('number.base', null, state, options);
        return result;
    };

    internals.Number.prototype.min = internals.compare('min', function (value, limit) {
        return value >= limit;
    });
    internals.Number.prototype.max = internals.compare('max', function (value, limit) {
        return value <= limit;
    });
    internals.Number.prototype.greater = internals.compare('greater', function (value, limit) {
        return value > limit;
    });
    internals.Number.prototype.less = internals.compare('less', function (value, limit) {
        return value < limit;
    });

    internals.Number.prototype.multiple = function (base) {
        var _this10 = this;

        Hoek.assert(Hoek.isInteger(base), 'multiple must be an integer');
        Hoek.assert(base > 0, 'multiple must be greater than 0');

        return this._test('multiple', base, function (value, state, options) {

            if (value % base === 0) {
                return null;
            }

            return _this10.createError('number.multiple', { multiple: base, value: value }, state, options);
        });
    };

    internals.Number.prototype.integer = function () {
        var _this11 = this;

        return this._test('integer', undefined, function (value, state, options) {

            return Hoek.isInteger(value) ? null : _this11.createError('number.integer', { value: value }, state, options);
        });
    };

    internals.Number.prototype.negative = function () {
        var _this12 = this;

        return this._test('negative', undefined, function (value, state, options) {

            if (value < 0) {
                return null;
            }

            return _this12.createError('number.negative', { value: value }, state, options);
        });
    };

    internals.Number.prototype.positive = function () {
        var _this13 = this;

        return this._test('positive', undefined, function (value, state, options) {

            if (value > 0) {
                return null;
            }

            return _this13.createError('number.positive', { value: value }, state, options);
        });
    };

    internals.precisionRx = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;

    internals.Number.prototype.precision = function (limit) {
        var _this14 = this;

        Hoek.assert(Hoek.isInteger(limit), 'limit must be an integer');
        Hoek.assert(!('precision' in this._flags), 'precision already set');

        var obj = this._test('precision', limit, function (value, state, options) {

            var places = value.toString().match(internals.precisionRx);
            var decimals = Math.max((places[1] ? places[1].length : 0) - (places[2] ? parseInt(places[2], 10) : 0), 0);
            if (decimals <= limit) {
                return null;
            }

            return _this14.createError('number.precision', { limit: limit, value: value }, state, options);
        });

        obj._flags.precision = limit;
        return obj;
    };

    module.exports = new internals.Number();

    cache["./number"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Hoek = require('hoek');
    var Topo = require('topo');
    var Any = require('./any');
    var Cast = require('./cast');

    // Declare internals

    var internals = {};

    internals.Object = function () {

        Any.call(this);
        this._type = 'object';
        this._inner.children = null;
        this._inner.renames = [];
        this._inner.dependencies = [];
        this._inner.patterns = [];
    };

    Hoek.inherits(internals.Object, Any);

    internals.Object.prototype._base = function (value, state, options) {

        var target = value;
        var errors = [];
        var finish = function finish() {

            return {
                value: target,
                errors: errors.length ? errors : null
            };
        };

        if (typeof value === 'string' && options.convert) {

            try {
                value = JSON.parse(value);
            } catch (parseErr) {}
        }

        var type = this._flags.func ? 'function' : 'object';
        if (!value || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== type || Array.isArray(value)) {

            errors.push(this.createError(type + '.base', null, state, options));
            return finish();
        }

        // Skip if there are no other rules to test

        if (!this._inner.renames.length && !this._inner.dependencies.length && !this._inner.children && // null allows any keys
        !this._inner.patterns.length) {

            target = value;
            return finish();
        }

        // Ensure target is a local copy (parsed) or shallow copy

        if (target === value) {
            if (type === 'object') {
                target = Object.create(Object.getPrototypeOf(value));
            } else {
                target = function () {

                    return value.apply(this, arguments);
                };

                target.prototype = Hoek.clone(value.prototype);
            }

            var valueKeys = Object.keys(value);
            for (var i = 0; i < valueKeys.length; ++i) {
                target[valueKeys[i]] = value[valueKeys[i]];
            }
        } else {
            target = value;
        }

        // Rename keys

        var renamed = {};
        for (var i = 0; i < this._inner.renames.length; ++i) {
            var item = this._inner.renames[i];

            if (item.options.ignoreUndefined && target[item.from] === undefined) {
                continue;
            }

            if (!item.options.multiple && renamed[item.to]) {

                errors.push(this.createError('object.rename.multiple', { from: item.from, to: item.to }, state, options));
                if (options.abortEarly) {
                    return finish();
                }
            }

            if (Object.prototype.hasOwnProperty.call(target, item.to) && !item.options.override && !renamed[item.to]) {

                errors.push(this.createError('object.rename.override', { from: item.from, to: item.to }, state, options));
                if (options.abortEarly) {
                    return finish();
                }
            }

            if (target[item.from] === undefined) {
                delete target[item.to];
            } else {
                target[item.to] = target[item.from];
            }

            renamed[item.to] = true;

            if (!item.options.alias) {
                delete target[item.from];
            }
        }

        // Validate schema

        if (!this._inner.children && // null allows any keys
        !this._inner.patterns.length && !this._inner.dependencies.length) {

            return finish();
        }

        var unprocessed = Hoek.mapToObject(Object.keys(target));

        if (this._inner.children) {
            for (var i = 0; i < this._inner.children.length; ++i) {
                var child = this._inner.children[i];
                var key = child.key;
                var item = target[key];

                delete unprocessed[key];

                var localState = { key: key, path: (state.path || '') + (state.path && key ? '.' : '') + key, parent: target, reference: state.reference };
                var result = child.schema._validate(item, localState, options);
                if (result.errors) {
                    errors.push(this.createError('object.child', { key: key, reason: result.errors }, localState, options));

                    if (options.abortEarly) {
                        return finish();
                    }
                }

                if (child.schema._flags.strip || result.value === undefined && result.value !== item) {
                    delete target[key];
                } else if (result.value !== undefined) {
                    target[key] = result.value;
                }
            }
        }

        // Unknown keys

        var unprocessedKeys = Object.keys(unprocessed);
        if (unprocessedKeys.length && this._inner.patterns.length) {

            for (var i = 0; i < unprocessedKeys.length; ++i) {
                var key = unprocessedKeys[i];

                for (var j = 0; j < this._inner.patterns.length; ++j) {
                    var pattern = this._inner.patterns[j];

                    if (pattern.regex.test(key)) {
                        delete unprocessed[key];

                        var item = target[key];
                        var localState = { key: key, path: (state.path ? state.path + '.' : '') + key, parent: target, reference: state.reference };
                        var result = pattern.rule._validate(item, localState, options);
                        if (result.errors) {
                            errors.push(this.createError('object.child', { key: key, reason: result.errors }, localState, options));

                            if (options.abortEarly) {
                                return finish();
                            }
                        }

                        if (result.value !== undefined) {
                            target[key] = result.value;
                        }
                    }
                }
            }

            unprocessedKeys = Object.keys(unprocessed);
        }

        if ((this._inner.children || this._inner.patterns.length) && unprocessedKeys.length) {
            if (options.stripUnknown || options.skipFunctions) {

                for (var i = 0; i < unprocessedKeys.length; ++i) {
                    var key = unprocessedKeys[i];

                    if (options.stripUnknown) {
                        delete target[key];
                        delete unprocessed[key];
                    } else if (typeof target[key] === 'function') {
                        delete unprocessed[key];
                    }
                }

                unprocessedKeys = Object.keys(unprocessed);
            }

            if (unprocessedKeys.length && (this._flags.allowUnknown !== undefined ? !this._flags.allowUnknown : !options.allowUnknown)) {

                for (var i = 0; i < unprocessedKeys.length; ++i) {
                    errors.push(this.createError('object.allowUnknown', null, { key: unprocessedKeys[i], path: state.path + (state.path ? '.' : '') + unprocessedKeys[i] }, options));
                }
            }
        }

        // Validate dependencies

        for (var i = 0; i < this._inner.dependencies.length; ++i) {
            var dep = this._inner.dependencies[i];
            var err = internals[dep.type].call(this, dep.key !== null && value[dep.key], dep.peers, target, { key: dep.key, path: (state.path || '') + (dep.key ? '.' + dep.key : '') }, options);
            if (err) {
                errors.push(err);
                if (options.abortEarly) {
                    return finish();
                }
            }
        }

        return finish();
    };

    internals.Object.prototype._func = function () {

        var obj = this.clone();
        obj._flags.func = true;
        return obj;
    };

    internals.Object.prototype.keys = function (schema) {

        Hoek.assert(schema === null || schema === undefined || (typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object', 'Object schema must be a valid object');
        Hoek.assert(!schema || !schema.isJoi, 'Object schema cannot be a joi schema');

        var obj = this.clone();

        if (!schema) {
            obj._inner.children = null;
            return obj;
        }

        var children = Object.keys(schema);

        if (!children.length) {
            obj._inner.children = [];
            return obj;
        }

        var topo = new Topo();
        if (obj._inner.children) {
            for (var i = 0; i < obj._inner.children.length; ++i) {
                var child = obj._inner.children[i];

                // Only add the key if we are not going to replace it later
                if (children.indexOf(child.key) === -1) {
                    topo.add(child, { after: child._refs, group: child.key });
                }
            }
        }

        for (var i = 0; i < children.length; ++i) {
            var key = children[i];
            var child = schema[key];
            try {
                var cast = Cast.schema(child);
                topo.add({ key: key, schema: cast }, { after: cast._refs, group: key });
            } catch (castErr) {
                if (castErr.hasOwnProperty('path')) {
                    castErr.path = key + '.' + castErr.path;
                } else {
                    castErr.path = key;
                }
                throw castErr;
            }
        }

        obj._inner.children = topo.nodes;

        return obj;
    };

    internals.Object.prototype.unknown = function (allow) {

        var obj = this.clone();
        obj._flags.allowUnknown = allow !== false;
        return obj;
    };

    internals.Object.prototype.length = function (limit) {
        var _this15 = this;

        Hoek.assert(Hoek.isInteger(limit) && limit >= 0, 'limit must be a positive integer');

        return this._test('length', limit, function (value, state, options) {

            if (Object.keys(value).length === limit) {
                return null;
            }

            return _this15.createError('object.length', { limit: limit }, state, options);
        });
    };

    internals.Object.prototype.arity = function (n) {
        var _this16 = this;

        Hoek.assert(Hoek.isInteger(n) && n >= 0, 'n must be a positive integer');

        return this._test('arity', n, function (value, state, options) {

            if (value.length === n) {
                return null;
            }

            return _this16.createError('function.arity', { n: n }, state, options);
        });
    };

    internals.Object.prototype.minArity = function (n) {
        var _this17 = this;

        Hoek.assert(Hoek.isInteger(n) && n > 0, 'n must be a strict positive integer');

        return this._test('minArity', n, function (value, state, options) {

            if (value.length >= n) {
                return null;
            }

            return _this17.createError('function.minArity', { n: n }, state, options);
        });
    };

    internals.Object.prototype.maxArity = function (n) {
        var _this18 = this;

        Hoek.assert(Hoek.isInteger(n) && n >= 0, 'n must be a positive integer');

        return this._test('maxArity', n, function (value, state, options) {

            if (value.length <= n) {
                return null;
            }

            return _this18.createError('function.maxArity', { n: n }, state, options);
        });
    };

    internals.Object.prototype.min = function (limit) {
        var _this19 = this;

        Hoek.assert(Hoek.isInteger(limit) && limit >= 0, 'limit must be a positive integer');

        return this._test('min', limit, function (value, state, options) {

            if (Object.keys(value).length >= limit) {
                return null;
            }

            return _this19.createError('object.min', { limit: limit }, state, options);
        });
    };

    internals.Object.prototype.max = function (limit) {
        var _this20 = this;

        Hoek.assert(Hoek.isInteger(limit) && limit >= 0, 'limit must be a positive integer');

        return this._test('max', limit, function (value, state, options) {

            if (Object.keys(value).length <= limit) {
                return null;
            }

            return _this20.createError('object.max', { limit: limit }, state, options);
        });
    };

    internals.Object.prototype.pattern = function (pattern, schema) {

        Hoek.assert(pattern instanceof RegExp, 'Invalid regular expression');
        Hoek.assert(schema !== undefined, 'Invalid rule');

        pattern = new RegExp(pattern.source, pattern.ignoreCase ? 'i' : undefined); // Future version should break this and forbid unsupported regex flags

        try {
            schema = Cast.schema(schema);
        } catch (castErr) {
            if (castErr.hasOwnProperty('path')) {
                castErr.message = castErr.message + '(' + castErr.path + ')';
            }

            throw castErr;
        }

        var obj = this.clone();
        obj._inner.patterns.push({ regex: pattern, rule: schema });
        return obj;
    };

    internals.Object.prototype.with = function (key, peers) {

        return this._dependency('with', key, peers);
    };

    internals.Object.prototype.without = function (key, peers) {

        return this._dependency('without', key, peers);
    };

    internals.Object.prototype.xor = function () {

        var peers = Hoek.flatten(Array.prototype.slice.call(arguments));
        return this._dependency('xor', null, peers);
    };

    internals.Object.prototype.or = function () {

        var peers = Hoek.flatten(Array.prototype.slice.call(arguments));
        return this._dependency('or', null, peers);
    };

    internals.Object.prototype.and = function () {

        var peers = Hoek.flatten(Array.prototype.slice.call(arguments));
        return this._dependency('and', null, peers);
    };

    internals.Object.prototype.nand = function () {

        var peers = Hoek.flatten(Array.prototype.slice.call(arguments));
        return this._dependency('nand', null, peers);
    };

    internals.Object.prototype.requiredKeys = function (children) {

        children = Hoek.flatten(Array.prototype.slice.call(arguments));
        return this.applyFunctionToChildren(children, 'required');
    };

    internals.Object.prototype.optionalKeys = function (children) {

        children = Hoek.flatten(Array.prototype.slice.call(arguments));
        return this.applyFunctionToChildren(children, 'optional');
    };

    internals.renameDefaults = {
        alias: false, // Keep old value in place
        multiple: false, // Allow renaming multiple keys into the same target
        override: false // Overrides an existing key
    };

    internals.Object.prototype.rename = function (from, to, options) {

        Hoek.assert(typeof from === 'string', 'Rename missing the from argument');
        Hoek.assert(typeof to === 'string', 'Rename missing the to argument');
        Hoek.assert(to !== from, 'Cannot rename key to same name:', from);

        for (var i = 0; i < this._inner.renames.length; ++i) {
            Hoek.assert(this._inner.renames[i].from !== from, 'Cannot rename the same key multiple times');
        }

        var obj = this.clone();

        obj._inner.renames.push({
            from: from,
            to: to,
            options: Hoek.applyToDefaults(internals.renameDefaults, options || {})
        });

        return obj;
    };

    internals.groupChildren = function (children) {

        children.sort();

        var grouped = {};

        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            Hoek.assert(typeof child === 'string', 'children must be strings');
            var group = child.split('.')[0];
            var childGroup = grouped[group] = grouped[group] || [];
            childGroup.push(child.substring(group.length + 1));
        }

        return grouped;
    };

    internals.Object.prototype.applyFunctionToChildren = function (children, fn, args, root) {

        children = [].concat(children);
        Hoek.assert(children.length > 0, 'expected at least one children');

        var groupedChildren = internals.groupChildren(children);
        var obj = undefined;

        if ('' in groupedChildren) {
            obj = this[fn].apply(this, args);
            delete groupedChildren[''];
        } else {
            obj = this.clone();
        }

        if (obj._inner.children) {
            root = root ? root + '.' : '';

            for (var i = 0; i < obj._inner.children.length; ++i) {
                var child = obj._inner.children[i];
                var group = groupedChildren[child.key];

                if (group) {
                    obj._inner.children[i] = {
                        key: child.key,
                        _refs: child._refs,
                        schema: child.schema.applyFunctionToChildren(group, fn, args, root + child.key)
                    };

                    delete groupedChildren[child.key];
                }
            }
        }

        var remaining = Object.keys(groupedChildren);
        Hoek.assert(remaining.length === 0, 'unknown key(s)', remaining.join(', '));

        return obj;
    };

    internals.Object.prototype._dependency = function (type, key, peers) {

        peers = [].concat(peers);
        for (var i = 0; i < peers.length; ++i) {
            Hoek.assert(typeof peers[i] === 'string', type, 'peers must be a string or array of strings');
        }

        var obj = this.clone();
        obj._inner.dependencies.push({ type: type, key: key, peers: peers });
        return obj;
    };

    internals.with = function (value, peers, parent, state, options) {

        if (value === undefined) {
            return null;
        }

        for (var i = 0; i < peers.length; ++i) {
            var peer = peers[i];
            if (!Object.prototype.hasOwnProperty.call(parent, peer) || parent[peer] === undefined) {

                return this.createError('object.with', { peer: peer }, state, options);
            }
        }

        return null;
    };

    internals.without = function (value, peers, parent, state, options) {

        if (value === undefined) {
            return null;
        }

        for (var i = 0; i < peers.length; ++i) {
            var peer = peers[i];
            if (Object.prototype.hasOwnProperty.call(parent, peer) && parent[peer] !== undefined) {

                return this.createError('object.without', { peer: peer }, state, options);
            }
        }

        return null;
    };

    internals.xor = function (value, peers, parent, state, options) {

        var present = [];
        for (var i = 0; i < peers.length; ++i) {
            var peer = peers[i];
            if (Object.prototype.hasOwnProperty.call(parent, peer) && parent[peer] !== undefined) {

                present.push(peer);
            }
        }

        if (present.length === 1) {
            return null;
        }

        if (present.length === 0) {
            return this.createError('object.missing', { peers: peers }, state, options);
        }

        return this.createError('object.xor', { peers: peers }, state, options);
    };

    internals.or = function (value, peers, parent, state, options) {

        for (var i = 0; i < peers.length; ++i) {
            var peer = peers[i];
            if (Object.prototype.hasOwnProperty.call(parent, peer) && parent[peer] !== undefined) {
                return null;
            }
        }

        return this.createError('object.missing', { peers: peers }, state, options);
    };

    internals.and = function (value, peers, parent, state, options) {

        var missing = [];
        var present = [];
        var count = peers.length;
        for (var i = 0; i < count; ++i) {
            var peer = peers[i];
            if (!Object.prototype.hasOwnProperty.call(parent, peer) || parent[peer] === undefined) {

                missing.push(peer);
            } else {
                present.push(peer);
            }
        }

        var aon = missing.length === count || present.length === count;
        return !aon ? this.createError('object.and', { present: present, missing: missing }, state, options) : null;
    };

    internals.nand = function (value, peers, parent, state, options) {

        var present = [];
        for (var i = 0; i < peers.length; ++i) {
            var peer = peers[i];
            if (Object.prototype.hasOwnProperty.call(parent, peer) && parent[peer] !== undefined) {

                present.push(peer);
            }
        }

        var values = Hoek.clone(peers);
        var main = values.splice(0, 1)[0];
        var allPresent = present.length === peers.length;
        return allPresent ? this.createError('object.nand', { main: main, peers: values }, state, options) : null;
    };

    internals.Object.prototype.describe = function (shallow) {

        var description = Any.prototype.describe.call(this);

        if (this._inner.children && !shallow) {

            description.children = {};
            for (var i = 0; i < this._inner.children.length; ++i) {
                var child = this._inner.children[i];
                description.children[child.key] = child.schema.describe();
            }
        }

        if (this._inner.dependencies.length) {
            description.dependencies = Hoek.clone(this._inner.dependencies);
        }

        if (this._inner.patterns.length) {
            description.patterns = [];

            for (var i = 0; i < this._inner.patterns.length; ++i) {
                var pattern = this._inner.patterns[i];
                description.patterns.push({ regex: pattern.regex.toString(), rule: pattern.rule.describe() });
            }
        }

        return description;
    };

    internals.Object.prototype.assert = function (ref, schema, message) {
        var _this21 = this;

        ref = Cast.ref(ref);
        Hoek.assert(ref.isContext || ref.depth > 1, 'Cannot use assertions for root level references - use direct key rules instead');
        message = message || 'pass the assertion test';

        var cast = undefined;
        try {
            cast = Cast.schema(schema);
        } catch (castErr) {
            if (castErr.hasOwnProperty('path')) {
                castErr.message = castErr.message + '(' + castErr.path + ')';
            }

            throw castErr;
        }

        var key = ref.path[ref.path.length - 1];
        var path = ref.path.join('.');

        return this._test('assert', { cast: cast, ref: ref }, function (value, state, options) {

            var result = cast._validate(ref(value), null, options, value);
            if (!result.errors) {
                return null;
            }

            var localState = Hoek.merge({}, state);
            localState.key = key;
            localState.path = path;
            return _this21.createError('object.assert', { ref: localState.path, message: message }, localState, options);
        });
    };

    internals.Object.prototype.type = function (constructor, name) {
        var _this22 = this;

        Hoek.assert(typeof constructor === 'function', 'type must be a constructor function');
        name = name || constructor.name;

        return this._test('type', name, function (value, state, options) {

            if (value instanceof constructor) {
                return null;
            }

            return _this22.createError('object.type', { type: name }, state, options);
        });
    };

    module.exports = new internals.Object();

    cache["./object"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    //const Net = require('net');
    var Hoek = require('hoek');
    var Isemail = require('isemail');
    var Any = require('./any');
    var Ref = require('./ref');
    var JoiDate = require('./date');
    var Uri = require('./string/uri');
    var Ip = require('./string/ip');

    // Declare internals

    var internals = {
        uriRegex: Uri.createUriRegex(),
        ipRegex: Ip.createIpRegex(['ipv4', 'ipv6', 'ipvfuture'], 'optional')
    };

    internals.String = function () {

        Any.call(this);
        this._type = 'string';
        this._invalids.add('');
    };

    Hoek.inherits(internals.String, Any);

    internals.compare = function (type, compare) {

        return function (limit, encoding) {
            var _this23 = this;

            var isRef = Ref.isRef(limit);

            Hoek.assert(Hoek.isInteger(limit) && limit >= 0 || isRef, 'limit must be a positive integer or reference');
            //Hoek.assert(!encoding || Buffer.isEncoding(encoding), 'Invalid encoding:', encoding);

            return this._test(type, limit, function (value, state, options) {

                var compareTo = undefined;
                if (isRef) {
                    compareTo = limit(state.parent, options);

                    if (!Hoek.isInteger(compareTo)) {
                        return _this23.createError('string.ref', { ref: limit.key }, state, options);
                    }
                } else {
                    compareTo = limit;
                }

                if (compare(value, compareTo, encoding)) {
                    return null;
                }

                return _this23.createError('string.' + type, { limit: compareTo, value: value, encoding: encoding }, state, options);
            });
        };
    };

    internals.String.prototype._base = function (value, state, options) {

        if (typeof value === 'string' && options.convert) {

            if (this._flags.case) {
                value = this._flags.case === 'upper' ? value.toLocaleUpperCase() : value.toLocaleLowerCase();
            }

            if (this._flags.trim) {
                value = value.trim();
            }

            if (this._inner.replacements) {

                for (var i = 0; i < this._inner.replacements.length; ++i) {
                    var replacement = this._inner.replacements[i];
                    value = value.replace(replacement.pattern, replacement.replacement);
                }
            }
        }

        return {
            value: value,
            errors: typeof value === 'string' ? null : this.createError('string.base', { value: value }, state, options)
        };
    };

    internals.String.prototype.insensitive = function () {

        var obj = this.clone();
        obj._flags.insensitive = true;
        return obj;
    };

    internals.String.prototype.min = internals.compare('min', function (value, limit, encoding) {
        //const length = encoding ? Buffer.byteLength(value, encoding) : value.length;
        var length = value.length;
        return length >= limit;
    });

    internals.String.prototype.max = internals.compare('max', function (value, limit, encoding) {
        //const length = encoding ? Buffer.byteLength(value, encoding) : value.length;
        var length = value.length;
        return length <= limit;
    });

    internals.String.prototype.creditCard = function () {
        var _this24 = this;

        return this._test('creditCard', undefined, function (value, state, options) {

            var i = value.length;
            var sum = 0;
            var mul = 1;

            while (i--) {
                var char = value.charAt(i) * mul;
                sum = sum + (char - (char > 9) * 9);
                mul = mul ^ 3;
            }

            var check = sum % 10 === 0 && sum > 0;
            return check ? null : _this24.createError('string.creditCard', { value: value }, state, options);
        });
    };

    internals.String.prototype.length = internals.compare('length', function (value, limit, encoding) {
        //const length = encoding ? Buffer.byteLength(value, encoding) : value.length;
        var length = value.length;
        return length === limit;
    });

    internals.String.prototype.regex = function (pattern, name) {
        var _this25 = this;

        Hoek.assert(pattern instanceof RegExp, 'pattern must be a RegExp');

        pattern = new RegExp(pattern.source, pattern.ignoreCase ? 'i' : undefined); // Future version should break this and forbid unsupported regex flags

        return this._test('regex', pattern, function (value, state, options) {

            if (pattern.test(value)) {
                return null;
            }

            return _this25.createError(name ? 'string.regex.name' : 'string.regex.base', { name: name, pattern: pattern, value: value }, state, options);
        });
    };

    internals.String.prototype.alphanum = function () {
        var _this26 = this;

        return this._test('alphanum', undefined, function (value, state, options) {

            if (/^[a-zA-Z0-9]+$/.test(value)) {
                return null;
            }

            return _this26.createError('string.alphanum', { value: value }, state, options);
        });
    };

    internals.String.prototype.token = function () {
        var _this27 = this;

        return this._test('token', undefined, function (value, state, options) {

            if (/^\w+$/.test(value)) {
                return null;
            }

            return _this27.createError('string.token', { value: value }, state, options);
        });
    };

    internals.String.prototype.email = function (isEmailOptions) {
        var _this28 = this;

        if (isEmailOptions) {
            Hoek.assert((typeof isEmailOptions === 'undefined' ? 'undefined' : _typeof(isEmailOptions)) === 'object', 'email options must be an object');
            Hoek.assert(typeof isEmailOptions.checkDNS === 'undefined', 'checkDNS option is not supported');
            Hoek.assert(typeof isEmailOptions.tldWhitelist === 'undefined' || _typeof(isEmailOptions.tldWhitelist) === 'object', 'tldWhitelist must be an array or object');
            Hoek.assert(typeof isEmailOptions.minDomainAtoms === 'undefined' || Hoek.isInteger(isEmailOptions.minDomainAtoms) && isEmailOptions.minDomainAtoms > 0, 'minDomainAtoms must be a positive integer');
            Hoek.assert(typeof isEmailOptions.errorLevel === 'undefined' || typeof isEmailOptions.errorLevel === 'boolean' || Hoek.isInteger(isEmailOptions.errorLevel) && isEmailOptions.errorLevel >= 0, 'errorLevel must be a non-negative integer or boolean');
        }

        return this._test('email', isEmailOptions, function (value, state, options) {

            try {
                var result = Isemail.validate(value, isEmailOptions);
                if (result === true || result === 0) {
                    return null;
                }
            } catch (e) {}

            return _this28.createError('string.email', { value: value }, state, options);
        });
    };

    internals.String.prototype.ip = function (ipOptions) {
        var _this29 = this;

        var regex = internals.ipRegex;
        ipOptions = ipOptions || {};
        Hoek.assert((typeof ipOptions === 'undefined' ? 'undefined' : _typeof(ipOptions)) === 'object', 'options must be an object');

        if (ipOptions.cidr) {
            Hoek.assert(typeof ipOptions.cidr === 'string', 'cidr must be a string');
            ipOptions.cidr = ipOptions.cidr.toLowerCase();

            Hoek.assert(ipOptions.cidr in Ip.cidrs, 'cidr must be one of ' + Object.keys(Ip.cidrs).join(', '));

            // If we only received a `cidr` setting, create a regex for it. But we don't need to create one if `cidr` is "optional" since that is the default
            if (!ipOptions.version && ipOptions.cidr !== 'optional') {
                regex = Ip.createIpRegex(['ipv4', 'ipv6', 'ipvfuture'], ipOptions.cidr);
            }
        } else {

            // Set our default cidr strategy
            ipOptions.cidr = 'optional';
        }

        var versions = undefined;
        if (ipOptions.version) {
            if (!Array.isArray(ipOptions.version)) {
                ipOptions.version = [ipOptions.version];
            }

            Hoek.assert(ipOptions.version.length >= 1, 'version must have at least 1 version specified');

            versions = [];
            for (var i = 0; i < ipOptions.version.length; ++i) {
                var version = ipOptions.version[i];
                Hoek.assert(typeof version === 'string', 'version at position ' + i + ' must be a string');
                version = version.toLowerCase();
                Hoek.assert(Ip.versions[version], 'version at position ' + i + ' must be one of ' + Object.keys(Ip.versions).join(', '));
                versions.push(version);
            }

            // Make sure we have a set of versions
            versions = Hoek.unique(versions);

            regex = Ip.createIpRegex(versions, ipOptions.cidr);
        }

        return this._test('ip', ipOptions, function (value, state, options) {

            if (regex.test(value)) {
                return null;
            }

            if (versions) {
                return _this29.createError('string.ipVersion', { value: value, cidr: ipOptions.cidr, version: versions }, state, options);
            }

            return _this29.createError('string.ip', { value: value, cidr: ipOptions.cidr }, state, options);
        });
    };

    internals.String.prototype.uri = function (uriOptions) {
        var _this30 = this;

        var customScheme = '';
        var regex = internals.uriRegex;

        if (uriOptions) {
            Hoek.assert((typeof uriOptions === 'undefined' ? 'undefined' : _typeof(uriOptions)) === 'object', 'options must be an object');

            if (uriOptions.scheme) {
                Hoek.assert(uriOptions.scheme instanceof RegExp || typeof uriOptions.scheme === 'string' || Array.isArray(uriOptions.scheme), 'scheme must be a RegExp, String, or Array');

                if (!Array.isArray(uriOptions.scheme)) {
                    uriOptions.scheme = [uriOptions.scheme];
                }

                Hoek.assert(uriOptions.scheme.length >= 1, 'scheme must have at least 1 scheme specified');

                // Flatten the array into a string to be used to match the schemes.
                for (var i = 0; i < uriOptions.scheme.length; ++i) {
                    var scheme = uriOptions.scheme[i];
                    Hoek.assert(scheme instanceof RegExp || typeof scheme === 'string', 'scheme at position ' + i + ' must be a RegExp or String');

                    // Add OR separators if a value already exists
                    customScheme = customScheme + (customScheme ? '|' : '');

                    // If someone wants to match HTTP or HTTPS for example then we need to support both RegExp and String so we don't escape their pattern unknowingly.
                    if (scheme instanceof RegExp) {
                        customScheme = customScheme + scheme.source;
                    } else {
                        Hoek.assert(/[a-zA-Z][a-zA-Z0-9+-\.]*/.test(scheme), 'scheme at position ' + i + ' must be a valid scheme');
                        customScheme = customScheme + Hoek.escapeRegex(scheme);
                    }
                }
            }
        }

        if (customScheme) {
            regex = Uri.createUriRegex(customScheme);
        }

        return this._test('uri', uriOptions, function (value, state, options) {

            if (regex.test(value)) {
                return null;
            }

            if (customScheme) {
                return _this30.createError('string.uriCustomScheme', { scheme: customScheme, value: value }, state, options);
            }

            return _this30.createError('string.uri', { value: value }, state, options);
        });
    };

    internals.String.prototype.isoDate = function () {
        var _this31 = this;

        return this._test('isoDate', undefined, function (value, state, options) {

            if (JoiDate._isIsoDate(value)) {
                return null;
            }

            return _this31.createError('string.isoDate', { value: value }, state, options);
        });
    };

    internals.String.prototype.guid = function () {
        var _this32 = this;

        var regex = /^[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}$/i;
        var regex2 = /^\{[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}\}$/i;

        return this._test('guid', undefined, function (value, state, options) {

            if (regex.test(value) || regex2.test(value)) {
                return null;
            }

            return _this32.createError('string.guid', { value: value }, state, options);
        });
    };

    internals.String.prototype.hex = function () {
        var _this33 = this;

        var regex = /^[a-f0-9]+$/i;

        return this._test('hex', regex, function (value, state, options) {

            if (regex.test(value)) {
                return null;
            }

            return _this33.createError('string.hex', { value: value }, state, options);
        });
    };

    internals.String.prototype.hostname = function () {
        var _this34 = this;

        var regex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
        var ipV6Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
        return this._test('hostname', undefined, function (value, state, options) {

            if (value.length <= 255 && regex.test(value) || ipV6Regex.test(value)) {
                return null;
            }

            return _this34.createError('string.hostname', { value: value }, state, options);
        });
    };

    internals.String.prototype.lowercase = function () {
        var _this35 = this;

        var obj = this._test('lowercase', undefined, function (value, state, options) {

            if (options.convert || value === value.toLocaleLowerCase()) {

                return null;
            }

            return _this35.createError('string.lowercase', { value: value }, state, options);
        });

        obj._flags.case = 'lower';
        return obj;
    };

    internals.String.prototype.uppercase = function () {
        var _this36 = this;

        var obj = this._test('uppercase', undefined, function (value, state, options) {

            if (options.convert || value === value.toLocaleUpperCase()) {

                return null;
            }

            return _this36.createError('string.uppercase', { value: value }, state, options);
        });

        obj._flags.case = 'upper';
        return obj;
    };

    internals.String.prototype.trim = function () {
        var _this37 = this;

        var obj = this._test('trim', undefined, function (value, state, options) {

            if (options.convert || value === value.trim()) {

                return null;
            }

            return _this37.createError('string.trim', { value: value }, state, options);
        });

        obj._flags.trim = true;
        return obj;
    };

    internals.String.prototype.replace = function (pattern, replacement) {

        if (typeof pattern === 'string') {
            pattern = new RegExp(Hoek.escapeRegex(pattern), 'g');
        }

        Hoek.assert(pattern instanceof RegExp, 'pattern must be a RegExp');
        Hoek.assert(typeof replacement === 'string', 'replacement must be a String');

        // This can not be considere a test like trim, we can't "reject"
        // anything from this rule, so just clone the current object
        var obj = this.clone();

        if (!obj._inner.replacements) {
            obj._inner.replacements = [];
        }

        obj._inner.replacements.push({
            pattern: pattern,
            replacement: replacement
        });

        return obj;
    };

    module.exports = new internals.String();

    cache["./string"] = module.exports;
})(requireCache, require);

!(function (cache, require) {
    var module = { exports: {} };
    var exports = module.exports;

    'use strict';

    // Load modules

    var Any = require('./any');
    var Cast = require('./cast');
    var Ref = require('./ref');

    // Declare internals

    var internals = {
        alternatives: require('./alternatives'),
        array: require('./array'),
        boolean: require('./boolean'),
        //binary: require('./binary'), - REMOVED from client side port
        date: require('./date'),
        number: require('./number'),
        object: require('./object'),
        string: require('./string')
    };

    internals.root = function () {

        var any = new Any();

        var root = any.clone();
        root.any = function () {

            return any;
        };

        root.alternatives = root.alt = function () {

            return arguments.length ? internals.alternatives.try.apply(internals.alternatives, arguments) : internals.alternatives;
        };

        root.array = function () {

            return internals.array;
        };

        root.boolean = root.bool = function () {

            return internals.boolean;
        };

        root.binary = function () {

            return internals.binary;
        };

        root.date = function () {

            return internals.date;
        };

        root.func = function () {

            return internals.object._func();
        };

        root.number = function () {

            return internals.number;
        };

        root.object = function () {

            return arguments.length ? internals.object.keys.apply(internals.object, arguments) : internals.object;
        };

        root.string = function () {

            return internals.string;
        };

        root.ref = function () {

            return Ref.create.apply(null, arguments);
        };

        root.isRef = function (ref) {

            return Ref.isRef(ref);
        };

        root.validate = function (value /*, [schema], [options], callback */) {

            var last = arguments[arguments.length - 1];
            var callback = typeof last === 'function' ? last : null;

            var count = arguments.length - (callback ? 1 : 0);
            if (count === 1) {
                return any.validate(value, callback);
            }

            var options = count === 3 ? arguments[2] : {};
            var schema = root.compile(arguments[1]);

            return schema._validateWithOptions(value, options, callback);
        };

        root.describe = function () {

            var schema = arguments.length ? root.compile(arguments[0]) : any;
            return schema.describe();
        };

        root.compile = function (schema) {

            try {
                return Cast.schema(schema);
            } catch (err) {
                if (err.hasOwnProperty('path')) {
                    err.message = err.message + '(' + err.path + ')';
                }
                throw err;
            }
        };

        root.assert = function (value, schema, message) {

            root.attempt(value, schema, message);
        };

        root.attempt = function (value, schema, message) {

            var result = root.validate(value, schema);
            var error = result.error;
            if (error) {
                if (!message) {
                    error.message = error.annotate();
                    throw error;
                }

                if (!(message instanceof Error)) {
                    error.message = message + ' ' + error.annotate();
                    throw error;
                }

                throw message;
            }

            return result.value;
        };

        return root;
    };

    module.exports = internals.root();

    cache["./index"] = module.exports;
})(requireCache, require);

  return requireCache["./index"];
}));
