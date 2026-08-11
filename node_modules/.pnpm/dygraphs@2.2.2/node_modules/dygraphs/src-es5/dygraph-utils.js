'use strict';

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */

/**
 * @fileoverview This file contains utility functions used by dygraphs. These
 * are typically static (i.e. not related to any particular dygraph). Examples
 * include date/time formatting functions, basic algorithms (e.g. binary
 * search) and generic DOM-manipulation functions.
 */

/*global Dygraph:false, Node:false */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HORIZONTAL = exports.DateAccessorsUTC = exports.DateAccessorsLocal = exports.DOT_DASH_LINE = exports.DOTTED_LINE = exports.DASHED_LINE = exports.Circles = void 0;
exports.Iterator = Iterator;
exports.VERTICAL = exports.LOG_SCALE = exports.LN_TEN = void 0;
exports.addEvent = addEvent;
exports.binarySearch = binarySearch;
exports.cancelEvent = cancelEvent;
exports.clone = clone;
exports.createCanvas = createCanvas;
exports.createIterator = createIterator;
exports.dateAxisLabelFormatter = dateAxisLabelFormatter;
exports.dateParser = dateParser;
exports.dateStrToMillis = dateStrToMillis;
exports.dateString_ = dateString_;
exports.dateValueFormatter = dateValueFormatter;
exports.detectLineDelimiter = detectLineDelimiter;
exports.dragGetX_ = dragGetX_;
exports.dragGetY_ = dragGetY_;
exports.findPos = findPos;
exports.floatFormat = floatFormat;
exports.getContext = getContext;
exports.getContextPixelRatio = getContextPixelRatio;
exports.hmsString_ = hmsString_;
exports.hsvToRGB = hsvToRGB;
exports.isArrayLike = isArrayLike;
exports.isCanvasSupported = isCanvasSupported;
exports.isDateLike = isDateLike;
exports.isNodeContainedBy = isNodeContainedBy;
exports.isOK = isOK;
exports.isPixelChangingOptionList = isPixelChangingOptionList;
exports.isValidPoint = isValidPoint;
exports.log10 = log10;
exports.logRangeFraction = logRangeFraction;
exports.numberAxisLabelFormatter = numberAxisLabelFormatter;
exports.numberValueFormatter = numberValueFormatter;
exports.pageX = pageX;
exports.pageY = pageY;
exports.parseFloat_ = parseFloat_;
exports.pow = pow;
exports.removeEvent = removeEvent;
exports.repeatAndCleanup = repeatAndCleanup;
exports.requestAnimFrame = void 0;
exports.round_ = round_;
exports.setupDOMready_ = setupDOMready_;
exports.toRGB_ = toRGB_;
exports.type = type;
exports.typeArrayLike = typeArrayLike;
exports.update = update;
exports.updateDeep = updateDeep;
exports.zeropad = zeropad;
var DygraphTickers = _interopRequireWildcard(require("./dygraph-tickers"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/**
 * @param {*} o
 * @return {string}
 * @private
 */
function type(o) {
  return o === null ? 'null' : typeof o;
}
var LOG_SCALE = exports.LOG_SCALE = 10;
var LN_TEN = exports.LN_TEN = Math.log(LOG_SCALE);

/**
 * @private
 * @param {number} x
 * @return {number}
 */
function log10(x) {
  return Math.log(x) / LN_TEN;
}

/**
 * @private
 * @param {number} r0
 * @param {number} r1
 * @param {number} pct
 * @return {number}
 */
function logRangeFraction(r0, r1, pct) {
  // Computing the inverse of toPercentXCoord. The function was arrived at with
  // the following steps:
  //
  // Original calcuation:
  // pct = (log(x) - log(xRange[0])) / (log(xRange[1]) - log(xRange[0]));
  //
  // Multiply both sides by the right-side denominator.
  // pct * (log(xRange[1] - log(xRange[0]))) = log(x) - log(xRange[0])
  //
  // add log(xRange[0]) to both sides
  // log(xRange[0]) + (pct * (log(xRange[1]) - log(xRange[0]))) = log(x);
  //
  // Swap both sides of the equation,
  // log(x) = log(xRange[0]) + (pct * (log(xRange[1]) - log(xRange[0])))
  //
  // Use both sides as the exponent in 10^exp and we're done.
  // x = 10 ^ (log(xRange[0]) + (pct * (log(xRange[1]) - log(xRange[0]))))

  var logr0 = log10(r0);
  var logr1 = log10(r1);
  var exponent = logr0 + pct * (logr1 - logr0);
  var value = Math.pow(LOG_SCALE, exponent);
  return value;
}

/** A dotted line stroke pattern. */
var DOTTED_LINE = exports.DOTTED_LINE = [2, 2];
/** A dashed line stroke pattern. */
var DASHED_LINE = exports.DASHED_LINE = [7, 3];
/** A dot dash stroke pattern. */
var DOT_DASH_LINE = exports.DOT_DASH_LINE = [7, 2, 2, 2];

// Directions for panning and zooming. Use bit operations when combined
// values are possible.
var HORIZONTAL = exports.HORIZONTAL = 1;
var VERTICAL = exports.VERTICAL = 2;

/**
 * Return the 2d context for a dygraph canvas.
 *
 * This method is only exposed for the sake of replacing the function in
 * automated tests.
 *
 * @param {!HTMLCanvasElement} canvas
 * @return {!CanvasRenderingContext2D}
 * @private
 */
function getContext(canvas) {
  return /** @type{!CanvasRenderingContext2D}*/canvas.getContext("2d");
}

/**
 * EventListener options
 */
function _eventListenerOptions(type) {
  return type === 'touchstart' || type === 'touchmove' ? {
    "capture": false,
    "passive": true
  } : false;
}

/**
 * Add an event handler.
 * @param {!Node} elem The element to add the event to.
 * @param {string} type The type of the event, e.g. 'click' or 'mousemove'.
 * @param {function(Event):(boolean|undefined)} fn The function to call
 *     on the event. The function takes one parameter: the event object.
 * @private
 */
function addEvent(elem, type, fn) {
  elem.addEventListener(type, fn, _eventListenerOptions(type));
}

/**
 * Remove an event handler.
 * @param {!Node} elem The element to remove the event from.
 * @param {string} type The type of the event, e.g. 'click' or 'mousemove'.
 * @param {function(Event):(boolean|undefined)} fn The function to call
 *     on the event. The function takes one parameter: the event object.
 */
function removeEvent(elem, type, fn) {
  elem.removeEventListener(type, fn, _eventListenerOptions(type));
}

/**
 * Cancels further processing of an event. This is useful to prevent default
 * browser actions, e.g. highlighting text on a double-click.
 * Based on the article at
 * https://web.archive.org/web/20121026013839/http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 * @param {!Event} e The event whose normal behavior should be canceled.
 * @private
 */
function cancelEvent(e) {
  e = e ? e : window.event;
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.cancelBubble = true;
  e.cancel = true;
  e.returnValue = false;
  return false;
}

/**
 * Convert hsv values to an rgb(r,g,b) string. Taken from MochiKit.Color. This
 * is used to generate default series colors which are evenly spaced on the
 * color wheel.
 * @param {number} hue Range is 0.0-1.0.
 * @param {number} saturation Range is 0.0-1.0.
 * @param {number} value Range is 0.0-1.0.
 * @return {string} "rgb(r,g,b)" where r, g and b range from 0-255.
 * @private
 */
function hsvToRGB(hue, saturation, value) {
  var red;
  var green;
  var blue;
  if (saturation === 0) {
    red = value;
    green = value;
    blue = value;
  } else {
    var i = Math.floor(hue * 6);
    var f = hue * 6 - i;
    var p = value * (1 - saturation);
    var q = value * (1 - saturation * f);
    var t = value * (1 - saturation * (1 - f));
    switch (i) {
      case 1:
        red = q;
        green = value;
        blue = p;
        break;
      case 2:
        red = p;
        green = value;
        blue = t;
        break;
      case 3:
        red = p;
        green = q;
        blue = value;
        break;
      case 4:
        red = t;
        green = p;
        blue = value;
        break;
      case 5:
        red = value;
        green = p;
        blue = q;
        break;
      case 6: // fall through
      case 0:
        red = value;
        green = t;
        blue = p;
        break;
    }
  }
  red = Math.floor(255 * red + 0.5);
  green = Math.floor(255 * green + 0.5);
  blue = Math.floor(255 * blue + 0.5);
  return 'rgb(' + red + ',' + green + ',' + blue + ')';
}

/**
 * Find the coordinates of an object relative to the top left of the page.
 *
 * @param {Node} obj
 * @return {{x:number,y:number}}
 * @private
 */
function findPos(obj) {
  var p = obj.getBoundingClientRect(),
    w = window,
    d = document.documentElement;
  return {
    x: p.left + (w.pageXOffset || d.scrollLeft),
    y: p.top + (w.pageYOffset || d.scrollTop)
  };
}

/**
 * Returns the x-coordinate of the event in a coordinate system where the
 * top-left corner of the page (not the window) is (0,0).
 * Taken from MochiKit.Signal
 * @param {!Event} e
 * @return {number}
 * @private
 */
function pageX(e) {
  return !e.pageX || e.pageX < 0 ? 0 : e.pageX;
}

/**
 * Returns the y-coordinate of the event in a coordinate system where the
 * top-left corner of the page (not the window) is (0,0).
 * Taken from MochiKit.Signal
 * @param {!Event} e
 * @return {number}
 * @private
 */
function pageY(e) {
  return !e.pageY || e.pageY < 0 ? 0 : e.pageY;
}

/**
 * Converts page the x-coordinate of the event to pixel x-coordinates on the
 * canvas (i.e. DOM Coords).
 * @param {!Event} e Drag event.
 * @param {!DygraphInteractionContext} context Interaction context object.
 * @return {number} The amount by which the drag has moved to the right.
 */
function dragGetX_(e, context) {
  return pageX(e) - context.px;
}

/**
 * Converts page the y-coordinate of the event to pixel y-coordinates on the
 * canvas (i.e. DOM Coords).
 * @param {!Event} e Drag event.
 * @param {!DygraphInteractionContext} context Interaction context object.
 * @return {number} The amount by which the drag has moved down.
 */
function dragGetY_(e, context) {
  return pageY(e) - context.py;
}

/**
 * This returns true unless the parameter is 0, null, undefined or NaN.
 * TODO(danvk): rename this function to something like 'isNonZeroNan'.
 *
 * @param {number} x The number to consider.
 * @return {boolean} Whether the number is zero or NaN.
 * @private
 */
function isOK(x) {
  return !!x && !isNaN(x);
}

/**
 * @param {{x:?number,y:?number,yval:?number}} p The point to consider, valid
 *     points are {x, y} objects
 * @param {boolean=} opt_allowNaNY Treat point with y=NaN as valid
 * @return {boolean} Whether the point has numeric x and y.
 * @private
 */
function isValidPoint(p, opt_allowNaNY) {
  if (!p) return false; // null or undefined object
  if (p.yval === null) return false; // missing point
  if (p.x === null || p.x === undefined) return false;
  if (p.y === null || p.y === undefined) return false;
  if (isNaN(p.x) || !opt_allowNaNY && isNaN(p.y)) return false;
  return true;
}

/**
 * Number formatting function which mimics the behavior of %g in printf, i.e.
 * either exponential or fixed format (without trailing 0s) is used depending on
 * the length of the generated string.  The advantage of this format is that
 * there is a predictable upper bound on the resulting string length,
 * significant figures are not dropped, and normal numbers are not displayed in
 * exponential notation.
 *
 * NOTE: JavaScript's native toPrecision() is NOT a drop-in replacement for %g.
 * It creates strings which are too long for absolute values between 10^-4 and
 * 10^-6, e.g. '0.00001' instead of '1e-5'. See tests/number-format.html for
 * output examples.
 *
 * @param {number} x The number to format
 * @param {number=} opt_precision The precision to use, default 2.
 * @return {string} A string formatted like %g in printf.  The max generated
 *                  string length should be precision + 6 (e.g 1.123e+300).
 */
function floatFormat(x, opt_precision) {
  // Avoid invalid precision values; [1, 21] is the valid range.
  var p = Math.min(Math.max(1, opt_precision || 2), 21);

  // This is deceptively simple.  The actual algorithm comes from:
  //
  // Max allowed length = p + 4
  // where 4 comes from 'e+n' and '.'.
  //
  // Length of fixed format = 2 + y + p
  // where 2 comes from '0.' and y = # of leading zeroes.
  //
  // Equating the two and solving for y yields y = 2, or 0.00xxxx which is
  // 1.0e-3.
  //
  // Since the behavior of toPrecision() is identical for larger numbers, we
  // don't have to worry about the other bound.
  //
  // Finally, the argument for toExponential() is the number of trailing digits,
  // so we take off 1 for the value before the '.'.
  return Math.abs(x) < 1.0e-3 && x !== 0.0 ? x.toExponential(p - 1) : x.toPrecision(p);
}

/**
 * Converts '9' to '09' (useful for dates)
 * @param {number} x
 * @return {string}
 * @private
 */
function zeropad(x) {
  if (x < 10) return "0" + x;else return "" + x;
}

/**
 * Date accessors to get the parts of a calendar date (year, month,
 * day, hour, minute, second and millisecond) according to local time,
 * and factory method to call the Date constructor with an array of arguments.
 */
var DateAccessorsLocal = exports.DateAccessorsLocal = {
  getFullYear: function getFullYear(d) {
    return d.getFullYear();
  },
  getMonth: function getMonth(d) {
    return d.getMonth();
  },
  getDate: function getDate(d) {
    return d.getDate();
  },
  getHours: function getHours(d) {
    return d.getHours();
  },
  getMinutes: function getMinutes(d) {
    return d.getMinutes();
  },
  getSeconds: function getSeconds(d) {
    return d.getSeconds();
  },
  getMilliseconds: function getMilliseconds(d) {
    return d.getMilliseconds();
  },
  getDay: function getDay(d) {
    return d.getDay();
  },
  makeDate: function makeDate(y, m, d, hh, mm, ss, ms) {
    return new Date(y, m, d, hh, mm, ss, ms);
  }
};

/**
 * Date accessors to get the parts of a calendar date (year, month,
 * day of month, hour, minute, second and millisecond) according to UTC time,
 * and factory method to call the Date constructor with an array of arguments.
 */
var DateAccessorsUTC = exports.DateAccessorsUTC = {
  getFullYear: function getFullYear(d) {
    return d.getUTCFullYear();
  },
  getMonth: function getMonth(d) {
    return d.getUTCMonth();
  },
  getDate: function getDate(d) {
    return d.getUTCDate();
  },
  getHours: function getHours(d) {
    return d.getUTCHours();
  },
  getMinutes: function getMinutes(d) {
    return d.getUTCMinutes();
  },
  getSeconds: function getSeconds(d) {
    return d.getUTCSeconds();
  },
  getMilliseconds: function getMilliseconds(d) {
    return d.getUTCMilliseconds();
  },
  getDay: function getDay(d) {
    return d.getUTCDay();
  },
  makeDate: function makeDate(y, m, d, hh, mm, ss, ms) {
    return new Date(Date.UTC(y, m, d, hh, mm, ss, ms));
  }
};

/**
 * Return a string version of the hours, minutes and seconds portion of a date.
 * @param {number} hh The hours (from 0-23)
 * @param {number} mm The minutes (from 0-59)
 * @param {number} ss The seconds (from 0-59)
 * @return {string} A time of the form "HH:MM" or "HH:MM:SS"
 * @private
 */
function hmsString_(hh, mm, ss, ms) {
  var ret = zeropad(hh) + ":" + zeropad(mm);
  if (ss) {
    ret += ":" + zeropad(ss);
    if (ms) {
      var str = "" + ms;
      ret += "." + ('000' + str).substring(str.length);
    }
  }
  return ret;
}

/**
 * Convert a JS date (millis since epoch) to a formatted string.
 * @param {number} time The JavaScript time value (ms since epoch)
 * @param {boolean} utc Whether output UTC or local time
 * @return {string} A date of one of these forms:
 *     "YYYY/MM/DD", "YYYY/MM/DD HH:MM" or "YYYY/MM/DD HH:MM:SS"
 * @private
 */
function dateString_(time, utc) {
  var accessors = utc ? DateAccessorsUTC : DateAccessorsLocal;
  var date = new Date(time);
  var y = accessors.getFullYear(date);
  var m = accessors.getMonth(date);
  var d = accessors.getDate(date);
  var hh = accessors.getHours(date);
  var mm = accessors.getMinutes(date);
  var ss = accessors.getSeconds(date);
  var ms = accessors.getMilliseconds(date);
  // Get a year string:
  var year = "" + y;
  // Get a 0 padded month string
  var month = zeropad(m + 1); //months are 0-offset, sigh
  // Get a 0 padded day string
  var day = zeropad(d);
  var frac = hh * 3600 + mm * 60 + ss + 1e-3 * ms;
  var ret = year + "/" + month + "/" + day;
  if (frac) {
    ret += " " + hmsString_(hh, mm, ss, ms);
  }
  return ret;
}

/**
 * Round a number to the specified number of digits past the decimal point.
 * @param {number} num The number to round
 * @param {number} places The number of decimals to which to round
 * @return {number} The rounded number
 * @private
 */
function round_(num, places) {
  var shift = Math.pow(10, places);
  return Math.round(num * shift) / shift;
}

/**
 * Implementation of binary search over an array.
 * Currently does not work when val is outside the range of arry's values.
 * @param {number} val the value to search for
 * @param {Array.<number>} arry is the value over which to search
 * @param {number} abs If abs > 0, find the lowest entry greater than val
 *     If abs < 0, find the highest entry less than val.
 *     If abs == 0, find the entry that equals val.
 * @param {number=} low The first index in arry to consider (optional)
 * @param {number=} high The last index in arry to consider (optional)
 * @return {number} Index of the element, or -1 if it isn't found.
 * @private
 */
function binarySearch(val, arry, abs, low, high) {
  if (low === null || low === undefined || high === null || high === undefined) {
    low = 0;
    high = arry.length - 1;
  }
  if (low > high) {
    return -1;
  }
  if (abs === null || abs === undefined) {
    abs = 0;
  }
  var validIndex = function validIndex(idx) {
    return idx >= 0 && idx < arry.length;
  };
  var mid = parseInt((low + high) / 2, 10);
  var element = arry[mid];
  var idx;
  if (element == val) {
    return mid;
  } else if (element > val) {
    if (abs > 0) {
      // Accept if element > val, but also if prior element < val.
      idx = mid - 1;
      if (validIndex(idx) && arry[idx] < val) {
        return mid;
      }
    }
    return binarySearch(val, arry, abs, low, mid - 1);
  } else if (element < val) {
    if (abs < 0) {
      // Accept if element < val, but also if prior element > val.
      idx = mid + 1;
      if (validIndex(idx) && arry[idx] > val) {
        return mid;
      }
    }
    return binarySearch(val, arry, abs, mid + 1, high);
  }
  return -1; // can't actually happen, but makes closure compiler happy
}

/**
 * Parses a date, returning the number of milliseconds since epoch. This can be
 * passed in as an xValueParser in the Dygraph constructor.
 * TODO(danvk): enumerate formats that this understands.
 *
 * @param {string} dateStr A date in a variety of possible string formats.
 * @return {number} Milliseconds since epoch.
 * @private
 */
var _dateParser_re = /-/g;
function dateParser(dateStr) {
  var d;

  // Let the system try the format first, with one caveat:
  // YYYY-MM-DD[ HH:MM:SS] is interpreted as UTC by a variety of browsers.
  // dygraphs displays dates in local time, so this will result in surprising
  // inconsistencies. But if you specify "T" or "Z" (i.e. YYYY-MM-DDTHH:MM:SS),
  // then you probably know what you're doing, so we'll let you go ahead.
  // Issue: https://code.google.com/archive/p/dygraphs/issues/255
  if (dateStr.search("-") == -1 || dateStr.search("T") != -1 || dateStr.search("Z") != -1) {
    d = dateStrToMillis(dateStr);
    if (d != null && !isNaN(d)) return d;
  }
  if (dateStr.search("-") != -1) {
    // e.g. '2009-7-12' or '2009-07-12'
    var dateStrSlashed = dateStr.replace(_dateParser_re, "/");
    d = dateStrToMillis(dateStrSlashed);
    if (d != null && !isNaN(d)) return d;
  }

  // Any format that Date.parse will accept, e.g. "2009/07/12" or
  // "2009/07/12 12:34:56"
  d = dateStrToMillis(dateStr);
  if (d != null && !isNaN(d)) return d;
  console.error("Couldn't parse " + dateStr + " as a date");
  return NaN;
}

/**
 * This is identical to JavaScript's built-in Date.parse() method, except that
 * it doesn't get replaced with an incompatible method by aggressive JS
 * libraries like MooTools or Joomla.
 * @param {string} str The date string, e.g. "2011/05/06"
 * @return {number} millis since epoch
 * @private
 */
function dateStrToMillis(str) {
  return new Date(str).getTime();
}

// These functions are all based on MochiKit.
/**
 * Copies all the properties from o to self.
 *
 * @param {!Object} self
 * @param {!Object} o
 * @return {!Object}
 */
function update(self, o) {
  if (typeof o != 'undefined' && o !== null) {
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        self[k] = o[k];
      }
    }
  }
  return self;
}

// internal: check if o is a DOM node, and we know it’s not null
var _isNode = typeof Node !== 'undefined' && Node !== null && typeof Node === 'object' ? function _isNode(o) {
  return o instanceof Node;
} : function _isNode(o) {
  return typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string';
};

/**
 * Copies all the properties from o to self.
 *
 * @param {!Object} self
 * @param {!Object} o
 * @return {!Object}
 * @private
 */
function updateDeep(self, o) {
  if (typeof o != 'undefined' && o !== null) {
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        var v = o[k];
        if (v === null) {
          self[k] = null;
        } else if (isArrayLike(v)) {
          self[k] = v.slice();
        } else if (_isNode(v)) {
          // DOM objects are shallowly-copied.
          self[k] = v;
        } else if (typeof v == 'object') {
          if (typeof self[k] != 'object' || self[k] === null) {
            self[k] = {};
          }
          updateDeep(self[k], v);
        } else {
          self[k] = v;
        }
      }
    }
  }
  return self;
}

/**
 * @param {*} o
 * @return {string}
 * @private
 */
function typeArrayLike(o) {
  if (o === null) return 'null';
  var t = typeof o;
  if ((t === 'object' || t === 'function' && typeof o.item === 'function') && typeof o.length === 'number' && o.nodeType !== 3 && o.nodeType !== 4) return 'array';
  return t;
}

/**
 * @param {*} o
 * @return {boolean}
 * @private
 */
function isArrayLike(o) {
  var t = typeof o;
  return o !== null && (t === 'object' || t === 'function' && typeof o.item === 'function') && typeof o.length === 'number' && o.nodeType !== 3 && o.nodeType !== 4;
}

/**
 * @param {Object} o
 * @return {boolean}
 * @private
 */
function isDateLike(o) {
  return o !== null && typeof o === 'object' && typeof o.getTime === 'function';
}

/**
 * Note: this only seems to work for arrays.
 * @param {!Array} o
 * @return {!Array}
 * @private
 */
function clone(o) {
  // TODO(danvk): figure out how MochiKit's version works
  var r = [];
  for (var i = 0; i < o.length; i++) {
    if (isArrayLike(o[i])) {
      r.push(clone(o[i]));
    } else {
      r.push(o[i]);
    }
  }
  return r;
}

/**
 * Create a new canvas element.
 *
 * @return {!HTMLCanvasElement}
 * @private
 */
function createCanvas() {
  return document.createElement('canvas');
}

/**
 * Returns the context's pixel ratio, which is the ratio between the device
 * pixel ratio and the backing store ratio. Typically this is 1 for conventional
 * displays, and > 1 for HiDPI displays (such as the Retina MBP). For more, see:
 * https://web.archive.org/web/20200806170103/https://html5rocks.com/en/tutorials/canvas/hidpi/
 *
 * @param {!CanvasRenderingContext2D} context The canvas's 2d context.
 * @return {number} The ratio of the device pixel ratio and the backing store
 * ratio for the specified context.
 */
function getContextPixelRatio(context) {
  try {
    var devicePixelRatio = window.devicePixelRatio;
    var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    if (devicePixelRatio !== undefined) {
      return devicePixelRatio / backingStoreRatio;
    } else {
      // At least devicePixelRatio must be defined for this ratio to make sense.
      // We default backingStoreRatio to 1: this does not exist on some browsers
      // (i.e. desktop Chrome).
      return 1;
    }
  } catch (e) {
    return 1;
  }
}

/**
 * TODO(danvk): use @template here when it's better supported for classes.
 * @param {!Array} array
 * @param {number} start
 * @param {number} length
 * @param {function(!Array,?):boolean=} predicate
 * @constructor
 */
function Iterator(array, start, length, predicate) {
  start = start || 0;
  length = length || array.length;
  this.hasNext = true; // Use to identify if there's another element.
  this.peek = null; // Use for look-ahead
  this.start_ = start;
  this.array_ = array;
  this.predicate_ = predicate;
  this.end_ = Math.min(array.length, start + length);
  this.nextIdx_ = start - 1; // use -1 so initial advance works.
  this.next(); // ignoring result.
}

/**
 * @return {Object}
 */
Iterator.prototype.next = function () {
  if (!this.hasNext) {
    return null;
  }
  var obj = this.peek;
  var nextIdx = this.nextIdx_ + 1;
  var found = false;
  while (nextIdx < this.end_) {
    if (!this.predicate_ || this.predicate_(this.array_, nextIdx)) {
      this.peek = this.array_[nextIdx];
      found = true;
      break;
    }
    nextIdx++;
  }
  this.nextIdx_ = nextIdx;
  if (!found) {
    this.hasNext = false;
    this.peek = null;
  }
  return obj;
};

/**
 * Returns a new iterator over array, between indexes start and
 * start + length, and only returns entries that pass the accept function
 *
 * @param {!Array} array the array to iterate over.
 * @param {number} start the first index to iterate over, 0 if absent.
 * @param {number} length the number of elements in the array to iterate over.
 *     This, along with start, defines a slice of the array, and so length
 *     doesn't imply the number of elements in the iterator when accept doesn't
 *     always accept all values. array.length when absent.
 * @param {function(?):boolean=} opt_predicate a function that takes
 *     parameters array and idx, which returns true when the element should be
 *     returned.  If omitted, all elements are accepted.
 * @private
 */
function createIterator(array, start, length, opt_predicate) {
  return new Iterator(array, start, length, opt_predicate);
}

// Shim layer with setTimeout fallback.
// From: https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
// Should be called with the window context:
//   Dygraph.requestAnimFrame.call(window, function() {})
var requestAnimFrame = exports.requestAnimFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
}();

/**
 * Call a function at most maxFrames times at an attempted interval of
 * framePeriodInMillis, then call a cleanup function once. repeatFn is called
 * once immediately, then at most (maxFrames - 1) times asynchronously. If
 * maxFrames==1, then cleanup_fn() is also called synchronously.  This function
 * is used to sequence animation.
 * @param {function(number)} repeatFn Called repeatedly -- takes the frame
 *     number (from 0 to maxFrames-1) as an argument.
 * @param {number} maxFrames The max number of times to call repeatFn
 * @param {number} framePeriodInMillis Max requested time between frames.
 * @param {function()} cleanupFn A function to call after all repeatFn calls.
 * @private
 */
function repeatAndCleanup(repeatFn, maxFrames, framePeriodInMillis, cleanupFn) {
  var frameNumber = 0;
  var previousFrameNumber;
  var startTime = new Date().getTime();
  repeatFn(frameNumber);
  if (maxFrames == 1) {
    cleanupFn();
    return;
  }
  var maxFrameArg = maxFrames - 1;
  (function loop() {
    if (frameNumber >= maxFrames) return;
    requestAnimFrame.call(window, function () {
      // Determine which frame to draw based on the delay so far.  Will skip
      // frames if necessary.
      var currentTime = new Date().getTime();
      var delayInMillis = currentTime - startTime;
      previousFrameNumber = frameNumber;
      frameNumber = Math.floor(delayInMillis / framePeriodInMillis);
      var frameDelta = frameNumber - previousFrameNumber;
      // If we predict that the subsequent repeatFn call will overshoot our
      // total frame target, so our last call will cause a stutter, then jump to
      // the last call immediately.  If we're going to cause a stutter, better
      // to do it faster than slower.
      var predictOvershootStutter = frameNumber + frameDelta > maxFrameArg;
      if (predictOvershootStutter || frameNumber >= maxFrameArg) {
        repeatFn(maxFrameArg); // Ensure final call with maxFrameArg.
        cleanupFn();
      } else {
        if (frameDelta !== 0) {
          // Don't call repeatFn with duplicate frames.
          repeatFn(frameNumber);
        }
        loop();
      }
    });
  })();
}

// A whitelist of options that do not change pixel positions.
var pixelSafeOptions = {
  'annotationClickHandler': true,
  'annotationDblClickHandler': true,
  'annotationMouseOutHandler': true,
  'annotationMouseOverHandler': true,
  'axisLineColor': true,
  'axisLineWidth': true,
  'clickCallback': true,
  'drawCallback': true,
  'drawHighlightPointCallback': true,
  'drawPoints': true,
  'drawPointCallback': true,
  'drawGrid': true,
  'fillAlpha': true,
  'gridLineColor': true,
  'gridLineWidth': true,
  'hideOverlayOnMouseOut': true,
  'highlightCallback': true,
  'highlightCircleSize': true,
  'interactionModel': true,
  'labelsDiv': true,
  'labelsKMB': true,
  'labelsKMG2': true,
  'labelsSeparateLines': true,
  'labelsShowZeroValues': true,
  'legend': true,
  'panEdgeFraction': true,
  'pixelsPerYLabel': true,
  'pointClickCallback': true,
  'pointSize': true,
  'rangeSelectorPlotFillColor': true,
  'rangeSelectorPlotFillGradientColor': true,
  'rangeSelectorPlotStrokeColor': true,
  'rangeSelectorBackgroundStrokeColor': true,
  'rangeSelectorBackgroundLineWidth': true,
  'rangeSelectorPlotLineWidth': true,
  'rangeSelectorForegroundStrokeColor': true,
  'rangeSelectorForegroundLineWidth': true,
  'rangeSelectorAlpha': true,
  'showLabelsOnHighlight': true,
  'showRoller': true,
  'strokeWidth': true,
  'underlayCallback': true,
  'unhighlightCallback': true,
  'zoomCallback': true
};

/**
 * This function will scan the option list and determine if they
 * require us to recalculate the pixel positions of each point.
 * TODO: move this into dygraph-options.js
 * @param {!Array.<string>} labels a list of options to check.
 * @param {!Object} attrs
 * @return {boolean} true if the graph needs new points else false.
 * @private
 */
function isPixelChangingOptionList(labels, attrs) {
  // Assume that we do not require new points.
  // This will change to true if we actually do need new points.

  // Create a dictionary of series names for faster lookup.
  // If there are no labels, then the dictionary stays empty.
  var seriesNamesDictionary = {};
  if (labels) {
    for (var i = 1; i < labels.length; i++) {
      seriesNamesDictionary[labels[i]] = true;
    }
  }

  // Scan through a flat (i.e. non-nested) object of options.
  // Returns true/false depending on whether new points are needed.
  var scanFlatOptions = function scanFlatOptions(options) {
    for (var property in options) {
      if (options.hasOwnProperty(property) && !pixelSafeOptions[property]) {
        return true;
      }
    }
    return false;
  };

  // Iterate through the list of updated options.
  for (var property in attrs) {
    if (!attrs.hasOwnProperty(property)) continue;

    // Find out of this field is actually a series specific options list.
    if (property == 'highlightSeriesOpts' || seriesNamesDictionary[property] && !attrs.series) {
      // This property value is a list of options for this series.
      if (scanFlatOptions(attrs[property])) return true;
    } else if (property == 'series' || property == 'axes') {
      // This is twice-nested options list.
      var perSeries = attrs[property];
      for (var series in perSeries) {
        if (perSeries.hasOwnProperty(series) && scanFlatOptions(perSeries[series])) {
          return true;
        }
      }
    } else {
      // If this was not a series specific option list,
      // check if it's a pixel-changing property.
      if (!pixelSafeOptions[property]) return true;
    }
  }
  return false;
}
var Circles = exports.Circles = {
  DEFAULT: function DEFAULT(g, name, ctx, canvasx, canvasy, color, radius) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(canvasx, canvasy, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }
  // For more shapes, include extras/shapes.js
};

/**
 * Determine whether |data| is delimited by CR, CRLF, LF, LFCR.
 * @param {string} data
 * @return {?string} the delimiter that was detected (or null on failure).
 */
function detectLineDelimiter(data) {
  for (var i = 0; i < data.length; i++) {
    var code = data.charAt(i);
    if (code === '\r') {
      // Might actually be "\r\n".
      if (i + 1 < data.length && data.charAt(i + 1) === '\n') {
        return '\r\n';
      }
      return code;
    }
    if (code === '\n') {
      // Might actually be "\n\r".
      if (i + 1 < data.length && data.charAt(i + 1) === '\r') {
        return '\n\r';
      }
      return code;
    }
  }
  return null;
}

/**
 * Is one node contained by another?
 * @param {Node} containee The contained node.
 * @param {Node} container The container node.
 * @return {boolean} Whether containee is inside (or equal to) container.
 * @private
 */
function isNodeContainedBy(containee, container) {
  if (container === null || containee === null) {
    return false;
  }
  var containeeNode = /** @type {Node} */containee;
  while (containeeNode && containeeNode !== container) {
    containeeNode = containeeNode.parentNode;
  }
  return containeeNode === container;
}

// This masks some numeric issues in older versions of Firefox,
// where 1.0/Math.pow(10,2) != Math.pow(10,-2).
/** @type {function(number,number):number} */
function pow(base, exp) {
  if (exp < 0) {
    return 1.0 / Math.pow(base, -exp);
  }
  return Math.pow(base, exp);
}
var RGBAxRE = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})?$/;
var RGBA_RE = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([01](?:\.\d+)?))?\)$/;

/**
 * Helper for toRGB_ which parses strings of the form:
 * #RRGGBB (hex)
 * #RRGGBBAA (hex)
 * rgb(123, 45, 67)
 * rgba(123, 45, 67, 0.5)
 * @return parsed {r,g,b,a?} tuple or null.
 */
function parseRGBA(rgbStr) {
  var bits,
    r,
    g,
    b,
    a = null;
  if (bits = RGBAxRE.exec(rgbStr)) {
    r = parseInt(bits[1], 16);
    g = parseInt(bits[2], 16);
    b = parseInt(bits[3], 16);
    if (bits[4]) a = parseInt(bits[4], 16);
  } else if (bits = RGBA_RE.exec(rgbStr)) {
    r = parseInt(bits[1], 10);
    g = parseInt(bits[2], 10);
    b = parseInt(bits[3], 10);
    if (bits[4]) a = parseFloat(bits[4]);
  } else return null;
  if (a !== null) return {
    "r": r,
    "g": g,
    "b": b,
    "a": a
  };
  return {
    "r": r,
    "g": g,
    "b": b
  };
}

/**
 * Converts any valid CSS color (hex, rgb(), named color) to an RGB tuple.
 *
 * @param {!string} colorStr Any valid CSS color string.
 * @return {{r:number,g:number,b:number,a:number?}} Parsed RGB tuple.
 * @private
 */
function toRGB_(colorStr) {
  // Strategy: First try to parse colorStr directly. This is fast & avoids DOM
  // manipulation.  If that fails (e.g. for named colors like 'red'), then
  // create a hidden DOM element and parse its computed color.
  var rgb = parseRGBA(colorStr);
  if (rgb) return rgb;
  var div = document.createElement('div');
  div.style.backgroundColor = colorStr;
  div.style.visibility = 'hidden';
  document.body.appendChild(div);
  var rgbStr = window.getComputedStyle(div, null).backgroundColor;
  document.body.removeChild(div);
  return parseRGBA(rgbStr);
}

/**
 * Checks whether the browser supports the &lt;canvas&gt; tag.
 * @param {HTMLCanvasElement=} opt_canvasElement Pass a canvas element as an
 *     optimization if you have one.
 * @return {boolean} Whether the browser supports canvas.
 */
function isCanvasSupported(opt_canvasElement) {
  try {
    var canvas = opt_canvasElement || document.createElement("canvas");
    canvas.getContext("2d");
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Parses the value as a floating point number. This is like the parseFloat()
 * built-in, but with a few differences:
 * - the empty string is parsed as null, rather than NaN.
 * - if the string cannot be parsed at all, an error is logged.
 * If the string can't be parsed, this method returns null.
 * @param {string} x The string to be parsed
 * @param {number=} opt_line_no The line number from which the string comes.
 * @param {string=} opt_line The text of the line from which the string comes.
 */
function parseFloat_(x, opt_line_no, opt_line) {
  var val = parseFloat(x);
  if (!isNaN(val)) return val;

  // Try to figure out what happeend.
  // If the value is the empty string, parse it as null.
  if (/^ *$/.test(x)) return null;

  // If it was actually "NaN", return it as NaN.
  if (/^ *nan *$/i.test(x)) return NaN;

  // Looks like a parsing error.
  var msg = "Unable to parse '" + x + "' as a number";
  if (opt_line !== undefined && opt_line_no !== undefined) {
    msg += " on line " + (1 + (opt_line_no || 0)) + " ('" + opt_line + "') of CSV.";
  }
  console.error(msg);
  return null;
}

// Label constants for the labelsKMB and labelsKMG2 options.
// (i.e. '100000' -> '100k')
var KMB_LABELS_LARGE = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
var KMB_LABELS_SMALL = ['m', 'µ', 'n', 'p', 'f', 'a', 'z', 'y'];
var KMG2_LABELS_LARGE = ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'];
var KMG2_LABELS_SMALL = ['p-10', 'p-20', 'p-30', 'p-40', 'p-50', 'p-60', 'p-70', 'p-80'];
/* if both are given (legacy/deprecated use only) */
var KMB2_LABELS_LARGE = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
var KMB2_LABELS_SMALL = KMB_LABELS_SMALL;

/**
 * @private
 * Return a string version of a number. This respects the digitsAfterDecimal
 * and maxNumberWidth options.
 * @param {number} x The number to be formatted
 * @param {Dygraph} opts An options view
 */
function numberValueFormatter(x, opts) {
  var sigFigs = opts('sigFigs');
  if (sigFigs !== null) {
    // User has opted for a fixed number of significant figures.
    return floatFormat(x, sigFigs);
  }

  // shortcut 0 so later code does not need to worry about it
  if (x === 0.0) return '0';
  var digits = opts('digitsAfterDecimal');
  var maxNumberWidth = opts('maxNumberWidth');
  var kmb = opts('labelsKMB');
  var kmg2 = opts('labelsKMG2');
  var label;
  var absx = Math.abs(x);
  if (kmb || kmg2) {
    var k;
    var k_labels = [];
    var m_labels = [];
    if (kmb) {
      k = 1000;
      k_labels = KMB_LABELS_LARGE;
      m_labels = KMB_LABELS_SMALL;
    }
    if (kmg2) {
      k = 1024;
      k_labels = KMG2_LABELS_LARGE;
      m_labels = KMG2_LABELS_SMALL;
      if (kmb) {
        k_labels = KMB2_LABELS_LARGE;
        m_labels = KMB2_LABELS_SMALL;
      }
    }
    var n;
    var j;
    if (absx >= k) {
      j = k_labels.length;
      while (j > 0) {
        n = pow(k, j);
        --j;
        if (absx >= n) {
          // guaranteed to hit because absx >= k (pow(k, 1))
          // if immensely large still switch to scientific notation
          if (absx / n >= Math.pow(10, maxNumberWidth)) label = x.toExponential(digits);else label = round_(x / n, digits) + k_labels[j];
          return label;
        }
      }
      // not reached, fall through safely though should it ever be
    } else if (absx < 1 /* && (m_labels.length > 0) */) {
      j = 0;
      while (j < m_labels.length) {
        ++j;
        n = pow(k, j);
        if (absx * n >= 1) break;
      }
      // if _still_ too small, switch to scientific notation instead
      if (absx * n < Math.pow(10, -digits)) label = x.toExponential(digits);else label = round_(x * n, digits) + m_labels[j - 1];
      return label;
    }
    // else fall through
  }
  if (absx >= Math.pow(10, maxNumberWidth) || absx < Math.pow(10, -digits)) {
    // switch to scientific notation if we underflow or overflow fixed display
    label = x.toExponential(digits);
  } else {
    label = '' + round_(x, digits);
  }
  return label;
}

/**
 * variant for use as an axisLabelFormatter.
 * @private
 */
function numberAxisLabelFormatter(x, granularity, opts) {
  return numberValueFormatter.call(this, x, opts);
}

/**
 * @type {!Array.<string>}
 * @private
 * @constant
 */
var SHORT_MONTH_NAMES_ = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Convert a JS date to a string appropriate to display on an axis that
 * is displaying values at the stated granularity. This respects the
 * labelsUTC option.
 * @param {Date} date The date to format
 * @param {number} granularity One of the Dygraph granularity constants
 * @param {Dygraph} opts An options view
 * @return {string} The date formatted as local time
 * @private
 */
function dateAxisLabelFormatter(date, granularity, opts) {
  var utc = opts('labelsUTC');
  var accessors = utc ? DateAccessorsUTC : DateAccessorsLocal;
  var year = accessors.getFullYear(date),
    month = accessors.getMonth(date),
    day = accessors.getDate(date),
    hours = accessors.getHours(date),
    mins = accessors.getMinutes(date),
    secs = accessors.getSeconds(date),
    millis = accessors.getMilliseconds(date);
  if (granularity >= DygraphTickers.Granularity.DECADAL) {
    return '' + year;
  } else if (granularity >= DygraphTickers.Granularity.MONTHLY) {
    return SHORT_MONTH_NAMES_[month] + '&#160;' + year;
  } else {
    var frac = hours * 3600 + mins * 60 + secs + 1e-3 * millis;
    if (frac === 0 || granularity >= DygraphTickers.Granularity.DAILY) {
      // e.g. '21 Jan' (%d%b)
      return zeropad(day) + '&#160;' + SHORT_MONTH_NAMES_[month];
    } else if (granularity < DygraphTickers.Granularity.SECONDLY) {
      // e.g. 40.310 (meaning 40 seconds and 310 milliseconds)
      var str = "" + millis;
      return zeropad(secs) + "." + ('000' + str).substring(str.length);
    } else if (granularity > DygraphTickers.Granularity.MINUTELY) {
      return hmsString_(hours, mins, secs, 0);
    } else {
      return hmsString_(hours, mins, secs, millis);
    }
  }
}

/**
 * Return a string version of a JS date for a value label. This respects the
 * labelsUTC option.
 * @param {Date} date The date to be formatted
 * @param {Dygraph} opts An options view
 * @private
 */
function dateValueFormatter(d, opts) {
  return dateString_(d, opts('labelsUTC'));
}

// stuff for simple onDOMready implementation
var deferDOM_callbacks = [];
var deferDOM_handlerCalled = false;

// onDOMready once DOM is ready
/**
 * Simple onDOMready implementation
 * @param {function()} cb The callback to run once the DOM is ready.
 * @return {boolean} whether the DOM is currently ready
 */
function deferDOM_ready(cb) {
  if (typeof cb === "function") cb();
  return true;
}

/**
 * Setup a simple onDOMready implementation on the given objct.
 * @param {*} self the object to update .onDOMready on
 * @private
 */
function setupDOMready_(self) {
  // only attach if there’s a DOM
  if (typeof document !== "undefined") {
    // called by browser
    var handler = function deferDOM_handler() {
      /* execute only once */
      if (deferDOM_handlerCalled) return;
      deferDOM_handlerCalled = true;
      /* subsequent calls must not enqueue */
      self.onDOMready = deferDOM_ready;
      /* clear event handlers */
      document.removeEventListener("DOMContentLoaded", handler, false);
      window.removeEventListener("load", handler, false);
      /* run user callbacks */
      for (var i = 0; i < deferDOM_callbacks.length; ++i) deferDOM_callbacks[i]();
      deferDOM_callbacks = null; //gc
    };

    // make callable (mutating, do not copy)
    self.onDOMready = function deferDOM_initial(cb) {
      /* if possible, skip all that */
      if (document.readyState === "complete") {
        self.onDOMready = deferDOM_ready;
        return deferDOM_ready(cb);
      }
      // onDOMready, after setup, before DOM is ready
      var enqfn = function deferDOM_enqueue(cb) {
        if (typeof cb === "function") deferDOM_callbacks.push(cb);
        return false;
      };
      /* subsequent calls will enqueue */
      self.onDOMready = enqfn;
      /* set up handler */
      document.addEventListener("DOMContentLoaded", handler, false);
      /* last resort: always works, but later than possible */
      window.addEventListener("load", handler, false);
      /* except if DOM got ready in the meantime */
      if (document.readyState === "complete") {
        /* undo all that attaching */
        handler();
        /* goto finish */
        self.onDOMready = deferDOM_ready;
        return deferDOM_ready(cb);
      }
      /* just enqueue that */
      return enqfn(cb);
    };
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsIkhPUklaT05UQUwiLCJEYXRlQWNjZXNzb3JzVVRDIiwiRGF0ZUFjY2Vzc29yc0xvY2FsIiwiRE9UX0RBU0hfTElORSIsIkRPVFRFRF9MSU5FIiwiREFTSEVEX0xJTkUiLCJDaXJjbGVzIiwiSXRlcmF0b3IiLCJWRVJUSUNBTCIsIkxPR19TQ0FMRSIsIkxOX1RFTiIsImFkZEV2ZW50IiwiYmluYXJ5U2VhcmNoIiwiY2FuY2VsRXZlbnQiLCJjbG9uZSIsImNyZWF0ZUNhbnZhcyIsImNyZWF0ZUl0ZXJhdG9yIiwiZGF0ZUF4aXNMYWJlbEZvcm1hdHRlciIsImRhdGVQYXJzZXIiLCJkYXRlU3RyVG9NaWxsaXMiLCJkYXRlU3RyaW5nXyIsImRhdGVWYWx1ZUZvcm1hdHRlciIsImRldGVjdExpbmVEZWxpbWl0ZXIiLCJkcmFnR2V0WF8iLCJkcmFnR2V0WV8iLCJmaW5kUG9zIiwiZmxvYXRGb3JtYXQiLCJnZXRDb250ZXh0IiwiZ2V0Q29udGV4dFBpeGVsUmF0aW8iLCJobXNTdHJpbmdfIiwiaHN2VG9SR0IiLCJpc0FycmF5TGlrZSIsImlzQ2FudmFzU3VwcG9ydGVkIiwiaXNEYXRlTGlrZSIsImlzTm9kZUNvbnRhaW5lZEJ5IiwiaXNPSyIsImlzUGl4ZWxDaGFuZ2luZ09wdGlvbkxpc3QiLCJpc1ZhbGlkUG9pbnQiLCJsb2cxMCIsImxvZ1JhbmdlRnJhY3Rpb24iLCJudW1iZXJBeGlzTGFiZWxGb3JtYXR0ZXIiLCJudW1iZXJWYWx1ZUZvcm1hdHRlciIsInBhZ2VYIiwicGFnZVkiLCJwYXJzZUZsb2F0XyIsInBvdyIsInJlbW92ZUV2ZW50IiwicmVwZWF0QW5kQ2xlYW51cCIsInJlcXVlc3RBbmltRnJhbWUiLCJyb3VuZF8iLCJzZXR1cERPTXJlYWR5XyIsInRvUkdCXyIsInR5cGUiLCJ0eXBlQXJyYXlMaWtlIiwidXBkYXRlIiwidXBkYXRlRGVlcCIsInplcm9wYWQiLCJEeWdyYXBoVGlja2VycyIsIl9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkIiwicmVxdWlyZSIsImUiLCJ0IiwiV2Vha01hcCIsInIiLCJuIiwiX19lc01vZHVsZSIsIm8iLCJpIiwiZiIsIl9fcHJvdG9fXyIsImhhcyIsImdldCIsInNldCIsIl90IiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiTWF0aCIsImxvZyIsIngiLCJyMCIsInIxIiwicGN0IiwibG9ncjAiLCJsb2dyMSIsImV4cG9uZW50IiwiY2FudmFzIiwiX2V2ZW50TGlzdGVuZXJPcHRpb25zIiwiZWxlbSIsImZuIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ3aW5kb3ciLCJldmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiY2FuY2VsQnViYmxlIiwiY2FuY2VsIiwicmV0dXJuVmFsdWUiLCJodWUiLCJzYXR1cmF0aW9uIiwicmVkIiwiZ3JlZW4iLCJibHVlIiwiZmxvb3IiLCJwIiwicSIsIm9iaiIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInciLCJkIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJsZWZ0IiwicGFnZVhPZmZzZXQiLCJzY3JvbGxMZWZ0IiwieSIsInRvcCIsInBhZ2VZT2Zmc2V0Iiwic2Nyb2xsVG9wIiwiY29udGV4dCIsInB4IiwicHkiLCJpc05hTiIsIm9wdF9hbGxvd05hTlkiLCJ5dmFsIiwidW5kZWZpbmVkIiwib3B0X3ByZWNpc2lvbiIsIm1pbiIsIm1heCIsImFicyIsInRvRXhwb25lbnRpYWwiLCJ0b1ByZWNpc2lvbiIsImdldEZ1bGxZZWFyIiwiZ2V0TW9udGgiLCJnZXREYXRlIiwiZ2V0SG91cnMiLCJnZXRNaW51dGVzIiwiZ2V0U2Vjb25kcyIsImdldE1pbGxpc2Vjb25kcyIsImdldERheSIsIm1ha2VEYXRlIiwibSIsImhoIiwibW0iLCJzcyIsIm1zIiwiRGF0ZSIsImdldFVUQ0Z1bGxZZWFyIiwiZ2V0VVRDTW9udGgiLCJnZXRVVENEYXRlIiwiZ2V0VVRDSG91cnMiLCJnZXRVVENNaW51dGVzIiwiZ2V0VVRDU2Vjb25kcyIsImdldFVUQ01pbGxpc2Vjb25kcyIsImdldFVUQ0RheSIsIlVUQyIsInJldCIsInN0ciIsInN1YnN0cmluZyIsImxlbmd0aCIsInRpbWUiLCJ1dGMiLCJhY2Nlc3NvcnMiLCJkYXRlIiwieWVhciIsIm1vbnRoIiwiZGF5IiwiZnJhYyIsIm51bSIsInBsYWNlcyIsInNoaWZ0Iiwicm91bmQiLCJ2YWwiLCJhcnJ5IiwibG93IiwiaGlnaCIsInZhbGlkSW5kZXgiLCJpZHgiLCJtaWQiLCJwYXJzZUludCIsImVsZW1lbnQiLCJfZGF0ZVBhcnNlcl9yZSIsImRhdGVTdHIiLCJzZWFyY2giLCJkYXRlU3RyU2xhc2hlZCIsInJlcGxhY2UiLCJjb25zb2xlIiwiZXJyb3IiLCJOYU4iLCJnZXRUaW1lIiwic2VsZiIsImsiLCJfaXNOb2RlIiwiTm9kZSIsIm5vZGVUeXBlIiwibm9kZU5hbWUiLCJ2Iiwic2xpY2UiLCJpdGVtIiwicHVzaCIsImNyZWF0ZUVsZW1lbnQiLCJkZXZpY2VQaXhlbFJhdGlvIiwiYmFja2luZ1N0b3JlUmF0aW8iLCJ3ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIiwibW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm9CYWNraW5nU3RvcmVQaXhlbFJhdGlvIiwiYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsImFycmF5Iiwic3RhcnQiLCJwcmVkaWNhdGUiLCJoYXNOZXh0IiwicGVlayIsInN0YXJ0XyIsImFycmF5XyIsInByZWRpY2F0ZV8iLCJlbmRfIiwibmV4dElkeF8iLCJuZXh0IiwicHJvdG90eXBlIiwibmV4dElkeCIsImZvdW5kIiwib3B0X3ByZWRpY2F0ZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsIm1velJlcXVlc3RBbmltYXRpb25GcmFtZSIsIm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJtc1JlcXVlc3RBbmltYXRpb25GcmFtZSIsImNhbGxiYWNrIiwic2V0VGltZW91dCIsInJlcGVhdEZuIiwibWF4RnJhbWVzIiwiZnJhbWVQZXJpb2RJbk1pbGxpcyIsImNsZWFudXBGbiIsImZyYW1lTnVtYmVyIiwicHJldmlvdXNGcmFtZU51bWJlciIsInN0YXJ0VGltZSIsIm1heEZyYW1lQXJnIiwibG9vcCIsImN1cnJlbnRUaW1lIiwiZGVsYXlJbk1pbGxpcyIsImZyYW1lRGVsdGEiLCJwcmVkaWN0T3ZlcnNob290U3R1dHRlciIsInBpeGVsU2FmZU9wdGlvbnMiLCJsYWJlbHMiLCJhdHRycyIsInNlcmllc05hbWVzRGljdGlvbmFyeSIsInNjYW5GbGF0T3B0aW9ucyIsIm9wdGlvbnMiLCJwcm9wZXJ0eSIsInNlcmllcyIsInBlclNlcmllcyIsIkRFRkFVTFQiLCJnIiwibmFtZSIsImN0eCIsImNhbnZhc3giLCJjYW52YXN5IiwiY29sb3IiLCJyYWRpdXMiLCJiZWdpblBhdGgiLCJmaWxsU3R5bGUiLCJhcmMiLCJQSSIsImZpbGwiLCJkYXRhIiwiY29kZSIsImNoYXJBdCIsImNvbnRhaW5lZSIsImNvbnRhaW5lciIsImNvbnRhaW5lZU5vZGUiLCJwYXJlbnROb2RlIiwiYmFzZSIsImV4cCIsIlJHQkF4UkUiLCJSR0JBX1JFIiwicGFyc2VSR0JBIiwicmdiU3RyIiwiYml0cyIsImIiLCJhIiwiZXhlYyIsInBhcnNlRmxvYXQiLCJjb2xvclN0ciIsInJnYiIsImRpdiIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwidmlzaWJpbGl0eSIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImdldENvbXB1dGVkU3R5bGUiLCJyZW1vdmVDaGlsZCIsIm9wdF9jYW52YXNFbGVtZW50Iiwib3B0X2xpbmVfbm8iLCJvcHRfbGluZSIsInRlc3QiLCJtc2ciLCJLTUJfTEFCRUxTX0xBUkdFIiwiS01CX0xBQkVMU19TTUFMTCIsIktNRzJfTEFCRUxTX0xBUkdFIiwiS01HMl9MQUJFTFNfU01BTEwiLCJLTUIyX0xBQkVMU19MQVJHRSIsIktNQjJfTEFCRUxTX1NNQUxMIiwib3B0cyIsInNpZ0ZpZ3MiLCJkaWdpdHMiLCJtYXhOdW1iZXJXaWR0aCIsImttYiIsImttZzIiLCJsYWJlbCIsImFic3giLCJrX2xhYmVscyIsIm1fbGFiZWxzIiwiaiIsImdyYW51bGFyaXR5IiwiU0hPUlRfTU9OVEhfTkFNRVNfIiwiaG91cnMiLCJtaW5zIiwic2VjcyIsIm1pbGxpcyIsIkdyYW51bGFyaXR5IiwiREVDQURBTCIsIk1PTlRITFkiLCJEQUlMWSIsIlNFQ09ORExZIiwiTUlOVVRFTFkiLCJkZWZlckRPTV9jYWxsYmFja3MiLCJkZWZlckRPTV9oYW5kbGVyQ2FsbGVkIiwiZGVmZXJET01fcmVhZHkiLCJjYiIsImhhbmRsZXIiLCJkZWZlckRPTV9oYW5kbGVyIiwib25ET01yZWFkeSIsImRlZmVyRE9NX2luaXRpYWwiLCJyZWFkeVN0YXRlIiwiZW5xZm4iLCJkZWZlckRPTV9lbnF1ZXVlIl0sInNvdXJjZXMiOlsiLi4vc3JjL2R5Z3JhcGgtdXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxMSBEYW4gVmFuZGVya2FtIChkYW52ZGtAZ21haWwuY29tKVxuICogTUlULWxpY2VuY2VkOiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2UvTUlUXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgZmlsZSBjb250YWlucyB1dGlsaXR5IGZ1bmN0aW9ucyB1c2VkIGJ5IGR5Z3JhcGhzLiBUaGVzZVxuICogYXJlIHR5cGljYWxseSBzdGF0aWMgKGkuZS4gbm90IHJlbGF0ZWQgdG8gYW55IHBhcnRpY3VsYXIgZHlncmFwaCkuIEV4YW1wbGVzXG4gKiBpbmNsdWRlIGRhdGUvdGltZSBmb3JtYXR0aW5nIGZ1bmN0aW9ucywgYmFzaWMgYWxnb3JpdGhtcyAoZS5nLiBiaW5hcnlcbiAqIHNlYXJjaCkgYW5kIGdlbmVyaWMgRE9NLW1hbmlwdWxhdGlvbiBmdW5jdGlvbnMuXG4gKi9cblxuLypnbG9iYWwgRHlncmFwaDpmYWxzZSwgTm9kZTpmYWxzZSAqL1xuXG5pbXBvcnQgKiBhcyBEeWdyYXBoVGlja2VycyBmcm9tICcuL2R5Z3JhcGgtdGlja2Vycyc7XG5cbi8qKlxuICogQHBhcmFtIHsqfSBvXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHlwZShvKSB7XG4gIHJldHVybiAobyA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZihvKSk7XG59XG5cbmV4cG9ydCB2YXIgTE9HX1NDQUxFID0gMTA7XG5leHBvcnQgdmFyIExOX1RFTiA9IE1hdGgubG9nKExPR19TQ0FMRSk7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2cxMCh4KSB7XG4gIHJldHVybiBNYXRoLmxvZyh4KSAvIExOX1RFTjtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHIwXG4gKiBAcGFyYW0ge251bWJlcn0gcjFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwY3RcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ1JhbmdlRnJhY3Rpb24ocjAsIHIxLCBwY3QpIHtcbiAgLy8gQ29tcHV0aW5nIHRoZSBpbnZlcnNlIG9mIHRvUGVyY2VudFhDb29yZC4gVGhlIGZ1bmN0aW9uIHdhcyBhcnJpdmVkIGF0IHdpdGhcbiAgLy8gdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgLy9cbiAgLy8gT3JpZ2luYWwgY2FsY3VhdGlvbjpcbiAgLy8gcGN0ID0gKGxvZyh4KSAtIGxvZyh4UmFuZ2VbMF0pKSAvIChsb2coeFJhbmdlWzFdKSAtIGxvZyh4UmFuZ2VbMF0pKTtcbiAgLy9cbiAgLy8gTXVsdGlwbHkgYm90aCBzaWRlcyBieSB0aGUgcmlnaHQtc2lkZSBkZW5vbWluYXRvci5cbiAgLy8gcGN0ICogKGxvZyh4UmFuZ2VbMV0gLSBsb2coeFJhbmdlWzBdKSkpID0gbG9nKHgpIC0gbG9nKHhSYW5nZVswXSlcbiAgLy9cbiAgLy8gYWRkIGxvZyh4UmFuZ2VbMF0pIHRvIGJvdGggc2lkZXNcbiAgLy8gbG9nKHhSYW5nZVswXSkgKyAocGN0ICogKGxvZyh4UmFuZ2VbMV0pIC0gbG9nKHhSYW5nZVswXSkpKSA9IGxvZyh4KTtcbiAgLy9cbiAgLy8gU3dhcCBib3RoIHNpZGVzIG9mIHRoZSBlcXVhdGlvbixcbiAgLy8gbG9nKHgpID0gbG9nKHhSYW5nZVswXSkgKyAocGN0ICogKGxvZyh4UmFuZ2VbMV0pIC0gbG9nKHhSYW5nZVswXSkpKVxuICAvL1xuICAvLyBVc2UgYm90aCBzaWRlcyBhcyB0aGUgZXhwb25lbnQgaW4gMTBeZXhwIGFuZCB3ZSdyZSBkb25lLlxuICAvLyB4ID0gMTAgXiAobG9nKHhSYW5nZVswXSkgKyAocGN0ICogKGxvZyh4UmFuZ2VbMV0pIC0gbG9nKHhSYW5nZVswXSkpKSlcblxuICB2YXIgbG9ncjAgPSBsb2cxMChyMCk7XG4gIHZhciBsb2dyMSA9IGxvZzEwKHIxKTtcbiAgdmFyIGV4cG9uZW50ID0gbG9ncjAgKyAocGN0ICogKGxvZ3IxIC0gbG9ncjApKTtcbiAgdmFyIHZhbHVlID0gTWF0aC5wb3coTE9HX1NDQUxFLCBleHBvbmVudCk7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqIEEgZG90dGVkIGxpbmUgc3Ryb2tlIHBhdHRlcm4uICovXG5leHBvcnQgdmFyIERPVFRFRF9MSU5FID0gWzIsIDJdO1xuLyoqIEEgZGFzaGVkIGxpbmUgc3Ryb2tlIHBhdHRlcm4uICovXG5leHBvcnQgdmFyIERBU0hFRF9MSU5FID0gWzcsIDNdO1xuLyoqIEEgZG90IGRhc2ggc3Ryb2tlIHBhdHRlcm4uICovXG5leHBvcnQgdmFyIERPVF9EQVNIX0xJTkUgPSBbNywgMiwgMiwgMl07XG5cbi8vIERpcmVjdGlvbnMgZm9yIHBhbm5pbmcgYW5kIHpvb21pbmcuIFVzZSBiaXQgb3BlcmF0aW9ucyB3aGVuIGNvbWJpbmVkXG4vLyB2YWx1ZXMgYXJlIHBvc3NpYmxlLlxuZXhwb3J0IHZhciBIT1JJWk9OVEFMID0gMTtcbmV4cG9ydCB2YXIgVkVSVElDQUwgPSAyO1xuXG4vKipcbiAqIFJldHVybiB0aGUgMmQgY29udGV4dCBmb3IgYSBkeWdyYXBoIGNhbnZhcy5cbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBvbmx5IGV4cG9zZWQgZm9yIHRoZSBzYWtlIG9mIHJlcGxhY2luZyB0aGUgZnVuY3Rpb24gaW5cbiAqIGF1dG9tYXRlZCB0ZXN0cy5cbiAqXG4gKiBAcGFyYW0geyFIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG4gKiBAcmV0dXJuIHshQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHQoY2FudmFzKSB7XG4gIHJldHVybiAvKiogQHR5cGV7IUNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0qLyhjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpKTtcbn1cblxuLyoqXG4gKiBFdmVudExpc3RlbmVyIG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gX2V2ZW50TGlzdGVuZXJPcHRpb25zKHR5cGUpIHtcbiAgcmV0dXJuICgodHlwZSA9PT0gJ3RvdWNoc3RhcnQnIHx8IHR5cGUgPT09ICd0b3VjaG1vdmUnKSA/IHtcbiAgICBcImNhcHR1cmVcIjogZmFsc2UsXG4gICAgXCJwYXNzaXZlXCI6IHRydWVcbiAgfSA6IGZhbHNlKTtcbn1cblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgaGFuZGxlci5cbiAqIEBwYXJhbSB7IU5vZGV9IGVsZW0gVGhlIGVsZW1lbnQgdG8gYWRkIHRoZSBldmVudCB0by5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBldmVudCwgZS5nLiAnY2xpY2snIG9yICdtb3VzZW1vdmUnLlxuICogQHBhcmFtIHtmdW5jdGlvbihFdmVudCk6KGJvb2xlYW58dW5kZWZpbmVkKX0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGxcbiAqICAgICBvbiB0aGUgZXZlbnQuIFRoZSBmdW5jdGlvbiB0YWtlcyBvbmUgcGFyYW1ldGVyOiB0aGUgZXZlbnQgb2JqZWN0LlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50KGVsZW0sIHR5cGUsIGZuKSB7XG4gIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgX2V2ZW50TGlzdGVuZXJPcHRpb25zKHR5cGUpKTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYW4gZXZlbnQgaGFuZGxlci5cbiAqIEBwYXJhbSB7IU5vZGV9IGVsZW0gVGhlIGVsZW1lbnQgdG8gcmVtb3ZlIHRoZSBldmVudCBmcm9tLlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIGV2ZW50LCBlLmcuICdjbGljaycgb3IgJ21vdXNlbW92ZScuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKEV2ZW50KTooYm9vbGVhbnx1bmRlZmluZWQpfSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbFxuICogICAgIG9uIHRoZSBldmVudC4gVGhlIGZ1bmN0aW9uIHRha2VzIG9uZSBwYXJhbWV0ZXI6IHRoZSBldmVudCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudChlbGVtLCB0eXBlLCBmbikge1xuICBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIF9ldmVudExpc3RlbmVyT3B0aW9ucyh0eXBlKSk7XG59XG5cbi8qKlxuICogQ2FuY2VscyBmdXJ0aGVyIHByb2Nlc3Npbmcgb2YgYW4gZXZlbnQuIFRoaXMgaXMgdXNlZnVsIHRvIHByZXZlbnQgZGVmYXVsdFxuICogYnJvd3NlciBhY3Rpb25zLCBlLmcuIGhpZ2hsaWdodGluZyB0ZXh0IG9uIGEgZG91YmxlLWNsaWNrLlxuICogQmFzZWQgb24gdGhlIGFydGljbGUgYXRcbiAqIGh0dHBzOi8vd2ViLmFyY2hpdmUub3JnL3dlYi8yMDEyMTAyNjAxMzgzOS9odHRwOi8vd3d3LnN3aXRjaG9udGhlY29kZS5jb20vdHV0b3JpYWxzL2phdmFzY3JpcHQtdHV0b3JpYWwtdGhlLXNjcm9sbC13aGVlbFxuICogQHBhcmFtIHshRXZlbnR9IGUgVGhlIGV2ZW50IHdob3NlIG5vcm1hbCBiZWhhdmlvciBzaG91bGQgYmUgY2FuY2VsZWQuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsRXZlbnQoZSkge1xuICBlID0gZSA/IGUgOiB3aW5kb3cuZXZlbnQ7XG4gIGlmIChlLnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbiAgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICBlLmNhbmNlbCA9IHRydWU7XG4gIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvbnZlcnQgaHN2IHZhbHVlcyB0byBhbiByZ2IocixnLGIpIHN0cmluZy4gVGFrZW4gZnJvbSBNb2NoaUtpdC5Db2xvci4gVGhpc1xuICogaXMgdXNlZCB0byBnZW5lcmF0ZSBkZWZhdWx0IHNlcmllcyBjb2xvcnMgd2hpY2ggYXJlIGV2ZW5seSBzcGFjZWQgb24gdGhlXG4gKiBjb2xvciB3aGVlbC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBodWUgUmFuZ2UgaXMgMC4wLTEuMC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzYXR1cmF0aW9uIFJhbmdlIGlzIDAuMC0xLjAuXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgUmFuZ2UgaXMgMC4wLTEuMC5cbiAqIEByZXR1cm4ge3N0cmluZ30gXCJyZ2IocixnLGIpXCIgd2hlcmUgciwgZyBhbmQgYiByYW5nZSBmcm9tIDAtMjU1LlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhzdlRvUkdCKGh1ZSwgc2F0dXJhdGlvbiwgdmFsdWUpIHtcbiAgdmFyIHJlZDtcbiAgdmFyIGdyZWVuO1xuICB2YXIgYmx1ZTtcbiAgaWYgKHNhdHVyYXRpb24gPT09IDApIHtcbiAgICByZWQgPSB2YWx1ZTtcbiAgICBncmVlbiA9IHZhbHVlO1xuICAgIGJsdWUgPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaSA9IE1hdGguZmxvb3IoaHVlICogNik7XG4gICAgdmFyIGYgPSAoaHVlICogNikgLSBpO1xuICAgIHZhciBwID0gdmFsdWUgKiAoMSAtIHNhdHVyYXRpb24pO1xuICAgIHZhciBxID0gdmFsdWUgKiAoMSAtIChzYXR1cmF0aW9uICogZikpO1xuICAgIHZhciB0ID0gdmFsdWUgKiAoMSAtIChzYXR1cmF0aW9uICogKDEgLSBmKSkpO1xuICAgIHN3aXRjaCAoaSkge1xuICAgICAgY2FzZSAxOiByZWQgPSBxOyBncmVlbiA9IHZhbHVlOyBibHVlID0gcDsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHJlZCA9IHA7IGdyZWVuID0gdmFsdWU7IGJsdWUgPSB0OyBicmVhaztcbiAgICAgIGNhc2UgMzogcmVkID0gcDsgZ3JlZW4gPSBxOyBibHVlID0gdmFsdWU7IGJyZWFrO1xuICAgICAgY2FzZSA0OiByZWQgPSB0OyBncmVlbiA9IHA7IGJsdWUgPSB2YWx1ZTsgYnJlYWs7XG4gICAgICBjYXNlIDU6IHJlZCA9IHZhbHVlOyBncmVlbiA9IHA7IGJsdWUgPSBxOyBicmVhaztcbiAgICAgIGNhc2UgNjogLy8gZmFsbCB0aHJvdWdoXG4gICAgICBjYXNlIDA6IHJlZCA9IHZhbHVlOyBncmVlbiA9IHQ7IGJsdWUgPSBwOyBicmVhaztcbiAgICB9XG4gIH1cbiAgcmVkID0gTWF0aC5mbG9vcigyNTUgKiByZWQgKyAwLjUpO1xuICBncmVlbiA9IE1hdGguZmxvb3IoMjU1ICogZ3JlZW4gKyAwLjUpO1xuICBibHVlID0gTWF0aC5mbG9vcigyNTUgKiBibHVlICsgMC41KTtcbiAgcmV0dXJuICdyZ2IoJyArIHJlZCArICcsJyArIGdyZWVuICsgJywnICsgYmx1ZSArICcpJztcbn1cblxuLyoqXG4gKiBGaW5kIHRoZSBjb29yZGluYXRlcyBvZiBhbiBvYmplY3QgcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0IG9mIHRoZSBwYWdlLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gb2JqXG4gKiBAcmV0dXJuIHt7eDpudW1iZXIseTpudW1iZXJ9fVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRQb3Mob2JqKSB7XG4gIHZhciBwID0gb2JqLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgdyA9IHdpbmRvdyxcbiAgICAgIGQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgcmV0dXJuIHtcbiAgICB4OiBwLmxlZnQgKyAody5wYWdlWE9mZnNldCB8fCBkLnNjcm9sbExlZnQpLFxuICAgIHk6IHAudG9wICArICh3LnBhZ2VZT2Zmc2V0IHx8IGQuc2Nyb2xsVG9wKVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgeC1jb29yZGluYXRlIG9mIHRoZSBldmVudCBpbiBhIGNvb3JkaW5hdGUgc3lzdGVtIHdoZXJlIHRoZVxuICogdG9wLWxlZnQgY29ybmVyIG9mIHRoZSBwYWdlIChub3QgdGhlIHdpbmRvdykgaXMgKDAsMCkuXG4gKiBUYWtlbiBmcm9tIE1vY2hpS2l0LlNpZ25hbFxuICogQHBhcmFtIHshRXZlbnR9IGVcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWdlWChlKSB7XG4gIHJldHVybiAoIWUucGFnZVggfHwgZS5wYWdlWCA8IDApID8gMCA6IGUucGFnZVg7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgeS1jb29yZGluYXRlIG9mIHRoZSBldmVudCBpbiBhIGNvb3JkaW5hdGUgc3lzdGVtIHdoZXJlIHRoZVxuICogdG9wLWxlZnQgY29ybmVyIG9mIHRoZSBwYWdlIChub3QgdGhlIHdpbmRvdykgaXMgKDAsMCkuXG4gKiBUYWtlbiBmcm9tIE1vY2hpS2l0LlNpZ25hbFxuICogQHBhcmFtIHshRXZlbnR9IGVcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWdlWShlKSB7XG4gIHJldHVybiAoIWUucGFnZVkgfHwgZS5wYWdlWSA8IDApID8gMCA6IGUucGFnZVk7XG59XG5cbi8qKlxuICogQ29udmVydHMgcGFnZSB0aGUgeC1jb29yZGluYXRlIG9mIHRoZSBldmVudCB0byBwaXhlbCB4LWNvb3JkaW5hdGVzIG9uIHRoZVxuICogY2FudmFzIChpLmUuIERPTSBDb29yZHMpLlxuICogQHBhcmFtIHshRXZlbnR9IGUgRHJhZyBldmVudC5cbiAqIEBwYXJhbSB7IUR5Z3JhcGhJbnRlcmFjdGlvbkNvbnRleHR9IGNvbnRleHQgSW50ZXJhY3Rpb24gY29udGV4dCBvYmplY3QuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBhbW91bnQgYnkgd2hpY2ggdGhlIGRyYWcgaGFzIG1vdmVkIHRvIHRoZSByaWdodC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRyYWdHZXRYXyhlLCBjb250ZXh0KSB7XG4gIHJldHVybiBwYWdlWChlKSAtIGNvbnRleHQucHg7XG59XG5cbi8qKlxuICogQ29udmVydHMgcGFnZSB0aGUgeS1jb29yZGluYXRlIG9mIHRoZSBldmVudCB0byBwaXhlbCB5LWNvb3JkaW5hdGVzIG9uIHRoZVxuICogY2FudmFzIChpLmUuIERPTSBDb29yZHMpLlxuICogQHBhcmFtIHshRXZlbnR9IGUgRHJhZyBldmVudC5cbiAqIEBwYXJhbSB7IUR5Z3JhcGhJbnRlcmFjdGlvbkNvbnRleHR9IGNvbnRleHQgSW50ZXJhY3Rpb24gY29udGV4dCBvYmplY3QuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBhbW91bnQgYnkgd2hpY2ggdGhlIGRyYWcgaGFzIG1vdmVkIGRvd24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkcmFnR2V0WV8oZSwgY29udGV4dCkge1xuICByZXR1cm4gcGFnZVkoZSkgLSBjb250ZXh0LnB5O1xufVxuXG4vKipcbiAqIFRoaXMgcmV0dXJucyB0cnVlIHVubGVzcyB0aGUgcGFyYW1ldGVyIGlzIDAsIG51bGwsIHVuZGVmaW5lZCBvciBOYU4uXG4gKiBUT0RPKGRhbnZrKTogcmVuYW1lIHRoaXMgZnVuY3Rpb24gdG8gc29tZXRoaW5nIGxpa2UgJ2lzTm9uWmVyb05hbicuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIG51bWJlciB0byBjb25zaWRlci5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIG51bWJlciBpcyB6ZXJvIG9yIE5hTi5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09LKHgpIHtcbiAgcmV0dXJuICEheCAmJiAhaXNOYU4oeCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHt7eDo/bnVtYmVyLHk6P251bWJlcix5dmFsOj9udW1iZXJ9fSBwIFRoZSBwb2ludCB0byBjb25zaWRlciwgdmFsaWRcbiAqICAgICBwb2ludHMgYXJlIHt4LCB5fSBvYmplY3RzXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfYWxsb3dOYU5ZIFRyZWF0IHBvaW50IHdpdGggeT1OYU4gYXMgdmFsaWRcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHBvaW50IGhhcyBudW1lcmljIHggYW5kIHkuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZFBvaW50KHAsIG9wdF9hbGxvd05hTlkpIHtcbiAgaWYgKCFwKSByZXR1cm4gZmFsc2U7ICAvLyBudWxsIG9yIHVuZGVmaW5lZCBvYmplY3RcbiAgaWYgKHAueXZhbCA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlOyAgLy8gbWlzc2luZyBwb2ludFxuICBpZiAocC54ID09PSBudWxsIHx8IHAueCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gIGlmIChwLnkgPT09IG51bGwgfHwgcC55ID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgaWYgKGlzTmFOKHAueCkgfHwgKCFvcHRfYWxsb3dOYU5ZICYmIGlzTmFOKHAueSkpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIE51bWJlciBmb3JtYXR0aW5nIGZ1bmN0aW9uIHdoaWNoIG1pbWljcyB0aGUgYmVoYXZpb3Igb2YgJWcgaW4gcHJpbnRmLCBpLmUuXG4gKiBlaXRoZXIgZXhwb25lbnRpYWwgb3IgZml4ZWQgZm9ybWF0ICh3aXRob3V0IHRyYWlsaW5nIDBzKSBpcyB1c2VkIGRlcGVuZGluZyBvblxuICogdGhlIGxlbmd0aCBvZiB0aGUgZ2VuZXJhdGVkIHN0cmluZy4gIFRoZSBhZHZhbnRhZ2Ugb2YgdGhpcyBmb3JtYXQgaXMgdGhhdFxuICogdGhlcmUgaXMgYSBwcmVkaWN0YWJsZSB1cHBlciBib3VuZCBvbiB0aGUgcmVzdWx0aW5nIHN0cmluZyBsZW5ndGgsXG4gKiBzaWduaWZpY2FudCBmaWd1cmVzIGFyZSBub3QgZHJvcHBlZCwgYW5kIG5vcm1hbCBudW1iZXJzIGFyZSBub3QgZGlzcGxheWVkIGluXG4gKiBleHBvbmVudGlhbCBub3RhdGlvbi5cbiAqXG4gKiBOT1RFOiBKYXZhU2NyaXB0J3MgbmF0aXZlIHRvUHJlY2lzaW9uKCkgaXMgTk9UIGEgZHJvcC1pbiByZXBsYWNlbWVudCBmb3IgJWcuXG4gKiBJdCBjcmVhdGVzIHN0cmluZ3Mgd2hpY2ggYXJlIHRvbyBsb25nIGZvciBhYnNvbHV0ZSB2YWx1ZXMgYmV0d2VlbiAxMF4tNCBhbmRcbiAqIDEwXi02LCBlLmcuICcwLjAwMDAxJyBpbnN0ZWFkIG9mICcxZS01Jy4gU2VlIHRlc3RzL251bWJlci1mb3JtYXQuaHRtbCBmb3JcbiAqIG91dHB1dCBleGFtcGxlcy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0geCBUaGUgbnVtYmVyIHRvIGZvcm1hdFxuICogQHBhcmFtIHtudW1iZXI9fSBvcHRfcHJlY2lzaW9uIFRoZSBwcmVjaXNpb24gdG8gdXNlLCBkZWZhdWx0IDIuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEEgc3RyaW5nIGZvcm1hdHRlZCBsaWtlICVnIGluIHByaW50Zi4gIFRoZSBtYXggZ2VuZXJhdGVkXG4gKiAgICAgICAgICAgICAgICAgIHN0cmluZyBsZW5ndGggc2hvdWxkIGJlIHByZWNpc2lvbiArIDYgKGUuZyAxLjEyM2UrMzAwKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsb2F0Rm9ybWF0KHgsIG9wdF9wcmVjaXNpb24pIHtcbiAgLy8gQXZvaWQgaW52YWxpZCBwcmVjaXNpb24gdmFsdWVzOyBbMSwgMjFdIGlzIHRoZSB2YWxpZCByYW5nZS5cbiAgdmFyIHAgPSBNYXRoLm1pbihNYXRoLm1heCgxLCBvcHRfcHJlY2lzaW9uIHx8IDIpLCAyMSk7XG5cbiAgLy8gVGhpcyBpcyBkZWNlcHRpdmVseSBzaW1wbGUuICBUaGUgYWN0dWFsIGFsZ29yaXRobSBjb21lcyBmcm9tOlxuICAvL1xuICAvLyBNYXggYWxsb3dlZCBsZW5ndGggPSBwICsgNFxuICAvLyB3aGVyZSA0IGNvbWVzIGZyb20gJ2UrbicgYW5kICcuJy5cbiAgLy9cbiAgLy8gTGVuZ3RoIG9mIGZpeGVkIGZvcm1hdCA9IDIgKyB5ICsgcFxuICAvLyB3aGVyZSAyIGNvbWVzIGZyb20gJzAuJyBhbmQgeSA9ICMgb2YgbGVhZGluZyB6ZXJvZXMuXG4gIC8vXG4gIC8vIEVxdWF0aW5nIHRoZSB0d28gYW5kIHNvbHZpbmcgZm9yIHkgeWllbGRzIHkgPSAyLCBvciAwLjAweHh4eCB3aGljaCBpc1xuICAvLyAxLjBlLTMuXG4gIC8vXG4gIC8vIFNpbmNlIHRoZSBiZWhhdmlvciBvZiB0b1ByZWNpc2lvbigpIGlzIGlkZW50aWNhbCBmb3IgbGFyZ2VyIG51bWJlcnMsIHdlXG4gIC8vIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgdGhlIG90aGVyIGJvdW5kLlxuICAvL1xuICAvLyBGaW5hbGx5LCB0aGUgYXJndW1lbnQgZm9yIHRvRXhwb25lbnRpYWwoKSBpcyB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIGRpZ2l0cyxcbiAgLy8gc28gd2UgdGFrZSBvZmYgMSBmb3IgdGhlIHZhbHVlIGJlZm9yZSB0aGUgJy4nLlxuICByZXR1cm4gKE1hdGguYWJzKHgpIDwgMS4wZS0zICYmIHggIT09IDAuMCkgP1xuICAgICAgeC50b0V4cG9uZW50aWFsKHAgLSAxKSA6IHgudG9QcmVjaXNpb24ocCk7XG59XG5cbi8qKlxuICogQ29udmVydHMgJzknIHRvICcwOScgKHVzZWZ1bCBmb3IgZGF0ZXMpXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHJldHVybiB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHplcm9wYWQoeCkge1xuICBpZiAoeCA8IDEwKSByZXR1cm4gXCIwXCIgKyB4OyBlbHNlIHJldHVybiBcIlwiICsgeDtcbn1cblxuLyoqXG4gKiBEYXRlIGFjY2Vzc29ycyB0byBnZXQgdGhlIHBhcnRzIG9mIGEgY2FsZW5kYXIgZGF0ZSAoeWVhciwgbW9udGgsXG4gKiBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kIGFuZCBtaWxsaXNlY29uZCkgYWNjb3JkaW5nIHRvIGxvY2FsIHRpbWUsXG4gKiBhbmQgZmFjdG9yeSBtZXRob2QgdG8gY2FsbCB0aGUgRGF0ZSBjb25zdHJ1Y3RvciB3aXRoIGFuIGFycmF5IG9mIGFyZ3VtZW50cy5cbiAqL1xuZXhwb3J0IHZhciBEYXRlQWNjZXNzb3JzTG9jYWwgPSB7XG4gIGdldEZ1bGxZZWFyOiAgICAgZCA9PiBkLmdldEZ1bGxZZWFyKCksXG4gIGdldE1vbnRoOiAgICAgICAgZCA9PiBkLmdldE1vbnRoKCksXG4gIGdldERhdGU6ICAgICAgICAgZCA9PiBkLmdldERhdGUoKSxcbiAgZ2V0SG91cnM6ICAgICAgICBkID0+IGQuZ2V0SG91cnMoKSxcbiAgZ2V0TWludXRlczogICAgICBkID0+IGQuZ2V0TWludXRlcygpLFxuICBnZXRTZWNvbmRzOiAgICAgIGQgPT4gZC5nZXRTZWNvbmRzKCksXG4gIGdldE1pbGxpc2Vjb25kczogZCA9PiBkLmdldE1pbGxpc2Vjb25kcygpLFxuICBnZXREYXk6ICAgICAgICAgIGQgPT4gZC5nZXREYXkoKSxcbiAgbWFrZURhdGU6ICAgICAgICBmdW5jdGlvbih5LCBtLCBkLCBoaCwgbW0sIHNzLCBtcykge1xuICAgIHJldHVybiBuZXcgRGF0ZSh5LCBtLCBkLCBoaCwgbW0sIHNzLCBtcyk7XG4gIH1cbn07XG5cbi8qKlxuICogRGF0ZSBhY2Nlc3NvcnMgdG8gZ2V0IHRoZSBwYXJ0cyBvZiBhIGNhbGVuZGFyIGRhdGUgKHllYXIsIG1vbnRoLFxuICogZGF5IG9mIG1vbnRoLCBob3VyLCBtaW51dGUsIHNlY29uZCBhbmQgbWlsbGlzZWNvbmQpIGFjY29yZGluZyB0byBVVEMgdGltZSxcbiAqIGFuZCBmYWN0b3J5IG1ldGhvZCB0byBjYWxsIHRoZSBEYXRlIGNvbnN0cnVjdG9yIHdpdGggYW4gYXJyYXkgb2YgYXJndW1lbnRzLlxuICovXG5leHBvcnQgdmFyIERhdGVBY2Nlc3NvcnNVVEMgPSB7XG4gIGdldEZ1bGxZZWFyOiAgICAgZCA9PiBkLmdldFVUQ0Z1bGxZZWFyKCksXG4gIGdldE1vbnRoOiAgICAgICAgZCA9PiBkLmdldFVUQ01vbnRoKCksXG4gIGdldERhdGU6ICAgICAgICAgZCA9PiBkLmdldFVUQ0RhdGUoKSxcbiAgZ2V0SG91cnM6ICAgICAgICBkID0+IGQuZ2V0VVRDSG91cnMoKSxcbiAgZ2V0TWludXRlczogICAgICBkID0+IGQuZ2V0VVRDTWludXRlcygpLFxuICBnZXRTZWNvbmRzOiAgICAgIGQgPT4gZC5nZXRVVENTZWNvbmRzKCksXG4gIGdldE1pbGxpc2Vjb25kczogZCA9PiBkLmdldFVUQ01pbGxpc2Vjb25kcygpLFxuICBnZXREYXk6ICAgICAgICAgIGQgPT4gZC5nZXRVVENEYXkoKSxcbiAgbWFrZURhdGU6ICAgICAgICBmdW5jdGlvbih5LCBtLCBkLCBoaCwgbW0sIHNzLCBtcykge1xuICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyh5LCBtLCBkLCBoaCwgbW0sIHNzLCBtcykpO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybiBhIHN0cmluZyB2ZXJzaW9uIG9mIHRoZSBob3VycywgbWludXRlcyBhbmQgc2Vjb25kcyBwb3J0aW9uIG9mIGEgZGF0ZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBoaCBUaGUgaG91cnMgKGZyb20gMC0yMylcbiAqIEBwYXJhbSB7bnVtYmVyfSBtbSBUaGUgbWludXRlcyAoZnJvbSAwLTU5KVxuICogQHBhcmFtIHtudW1iZXJ9IHNzIFRoZSBzZWNvbmRzIChmcm9tIDAtNTkpXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEEgdGltZSBvZiB0aGUgZm9ybSBcIkhIOk1NXCIgb3IgXCJISDpNTTpTU1wiXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaG1zU3RyaW5nXyhoaCwgbW0sIHNzLCBtcykge1xuICB2YXIgcmV0ID0gemVyb3BhZChoaCkgKyBcIjpcIiArIHplcm9wYWQobW0pO1xuICBpZiAoc3MpIHtcbiAgICByZXQgKz0gXCI6XCIgKyB6ZXJvcGFkKHNzKTtcbiAgICBpZiAobXMpIHtcbiAgICAgIHZhciBzdHIgPSBcIlwiICsgbXM7XG4gICAgICByZXQgKz0gXCIuXCIgKyAoJzAwMCcrc3RyKS5zdWJzdHJpbmcoc3RyLmxlbmd0aCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogQ29udmVydCBhIEpTIGRhdGUgKG1pbGxpcyBzaW5jZSBlcG9jaCkgdG8gYSBmb3JtYXR0ZWQgc3RyaW5nLlxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgVGhlIEphdmFTY3JpcHQgdGltZSB2YWx1ZSAobXMgc2luY2UgZXBvY2gpXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHV0YyBXaGV0aGVyIG91dHB1dCBVVEMgb3IgbG9jYWwgdGltZVxuICogQHJldHVybiB7c3RyaW5nfSBBIGRhdGUgb2Ygb25lIG9mIHRoZXNlIGZvcm1zOlxuICogICAgIFwiWVlZWS9NTS9ERFwiLCBcIllZWVkvTU0vREQgSEg6TU1cIiBvciBcIllZWVkvTU0vREQgSEg6TU06U1NcIlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGVTdHJpbmdfKHRpbWUsIHV0Yykge1xuICB2YXIgYWNjZXNzb3JzID0gdXRjID8gRGF0ZUFjY2Vzc29yc1VUQyA6IERhdGVBY2Nlc3NvcnNMb2NhbDtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh0aW1lKTtcbiAgdmFyIHkgPSBhY2Nlc3NvcnMuZ2V0RnVsbFllYXIoZGF0ZSk7XG4gIHZhciBtID0gYWNjZXNzb3JzLmdldE1vbnRoKGRhdGUpO1xuICB2YXIgZCA9IGFjY2Vzc29ycy5nZXREYXRlKGRhdGUpO1xuICB2YXIgaGggPSBhY2Nlc3NvcnMuZ2V0SG91cnMoZGF0ZSk7XG4gIHZhciBtbSA9IGFjY2Vzc29ycy5nZXRNaW51dGVzKGRhdGUpO1xuICB2YXIgc3MgPSBhY2Nlc3NvcnMuZ2V0U2Vjb25kcyhkYXRlKTtcbiAgdmFyIG1zID0gYWNjZXNzb3JzLmdldE1pbGxpc2Vjb25kcyhkYXRlKTtcbiAgLy8gR2V0IGEgeWVhciBzdHJpbmc6XG4gIHZhciB5ZWFyID0gXCJcIiArIHk7XG4gIC8vIEdldCBhIDAgcGFkZGVkIG1vbnRoIHN0cmluZ1xuICB2YXIgbW9udGggPSB6ZXJvcGFkKG0gKyAxKTsgIC8vbW9udGhzIGFyZSAwLW9mZnNldCwgc2lnaFxuICAvLyBHZXQgYSAwIHBhZGRlZCBkYXkgc3RyaW5nXG4gIHZhciBkYXkgPSB6ZXJvcGFkKGQpO1xuICB2YXIgZnJhYyA9IGhoICogMzYwMCArIG1tICogNjAgKyBzcyArIDFlLTMgKiBtcztcbiAgdmFyIHJldCA9IHllYXIgKyBcIi9cIiArIG1vbnRoICsgXCIvXCIgKyBkYXk7XG4gIGlmIChmcmFjKSB7XG4gICAgcmV0ICs9IFwiIFwiICsgaG1zU3RyaW5nXyhoaCwgbW0sIHNzLCBtcyk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBSb3VuZCBhIG51bWJlciB0byB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBkaWdpdHMgcGFzdCB0aGUgZGVjaW1hbCBwb2ludC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBudW0gVGhlIG51bWJlciB0byByb3VuZFxuICogQHBhcmFtIHtudW1iZXJ9IHBsYWNlcyBUaGUgbnVtYmVyIG9mIGRlY2ltYWxzIHRvIHdoaWNoIHRvIHJvdW5kXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSByb3VuZGVkIG51bWJlclxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kXyhudW0sIHBsYWNlcykge1xuICB2YXIgc2hpZnQgPSBNYXRoLnBvdygxMCwgcGxhY2VzKTtcbiAgcmV0dXJuIE1hdGgucm91bmQobnVtICogc2hpZnQpL3NoaWZ0O1xufVxuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIGJpbmFyeSBzZWFyY2ggb3ZlciBhbiBhcnJheS5cbiAqIEN1cnJlbnRseSBkb2VzIG5vdCB3b3JrIHdoZW4gdmFsIGlzIG91dHNpZGUgdGhlIHJhbmdlIG9mIGFycnkncyB2YWx1ZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsIHRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBhcnJ5IGlzIHRoZSB2YWx1ZSBvdmVyIHdoaWNoIHRvIHNlYXJjaFxuICogQHBhcmFtIHtudW1iZXJ9IGFicyBJZiBhYnMgPiAwLCBmaW5kIHRoZSBsb3dlc3QgZW50cnkgZ3JlYXRlciB0aGFuIHZhbFxuICogICAgIElmIGFicyA8IDAsIGZpbmQgdGhlIGhpZ2hlc3QgZW50cnkgbGVzcyB0aGFuIHZhbC5cbiAqICAgICBJZiBhYnMgPT0gMCwgZmluZCB0aGUgZW50cnkgdGhhdCBlcXVhbHMgdmFsLlxuICogQHBhcmFtIHtudW1iZXI9fSBsb3cgVGhlIGZpcnN0IGluZGV4IGluIGFycnkgdG8gY29uc2lkZXIgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtudW1iZXI9fSBoaWdoIFRoZSBsYXN0IGluZGV4IGluIGFycnkgdG8gY29uc2lkZXIgKG9wdGlvbmFsKVxuICogQHJldHVybiB7bnVtYmVyfSBJbmRleCBvZiB0aGUgZWxlbWVudCwgb3IgLTEgaWYgaXQgaXNuJ3QgZm91bmQuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoKHZhbCwgYXJyeSwgYWJzLCBsb3csIGhpZ2gpIHtcbiAgaWYgKGxvdyA9PT0gbnVsbCB8fCBsb3cgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgaGlnaCA9PT0gbnVsbCB8fCBoaWdoID09PSB1bmRlZmluZWQpIHtcbiAgICBsb3cgPSAwO1xuICAgIGhpZ2ggPSBhcnJ5Lmxlbmd0aCAtIDE7XG4gIH1cbiAgaWYgKGxvdyA+IGhpZ2gpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgaWYgKGFicyA9PT0gbnVsbCB8fCBhYnMgPT09IHVuZGVmaW5lZCkge1xuICAgIGFicyA9IDA7XG4gIH1cbiAgdmFyIHZhbGlkSW5kZXggPSBmdW5jdGlvbihpZHgpIHtcbiAgICByZXR1cm4gaWR4ID49IDAgJiYgaWR4IDwgYXJyeS5sZW5ndGg7XG4gIH07XG4gIHZhciBtaWQgPSBwYXJzZUludCgobG93ICsgaGlnaCkgLyAyLCAxMCk7XG4gIHZhciBlbGVtZW50ID0gYXJyeVttaWRdO1xuICB2YXIgaWR4O1xuICBpZiAoZWxlbWVudCA9PSB2YWwpIHtcbiAgICByZXR1cm4gbWlkO1xuICB9IGVsc2UgaWYgKGVsZW1lbnQgPiB2YWwpIHtcbiAgICBpZiAoYWJzID4gMCkge1xuICAgICAgLy8gQWNjZXB0IGlmIGVsZW1lbnQgPiB2YWwsIGJ1dCBhbHNvIGlmIHByaW9yIGVsZW1lbnQgPCB2YWwuXG4gICAgICBpZHggPSBtaWQgLSAxO1xuICAgICAgaWYgKHZhbGlkSW5kZXgoaWR4KSAmJiBhcnJ5W2lkeF0gPCB2YWwpIHtcbiAgICAgICAgcmV0dXJuIG1pZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJpbmFyeVNlYXJjaCh2YWwsIGFycnksIGFicywgbG93LCBtaWQgLSAxKTtcbiAgfSBlbHNlIGlmIChlbGVtZW50IDwgdmFsKSB7XG4gICAgaWYgKGFicyA8IDApIHtcbiAgICAgIC8vIEFjY2VwdCBpZiBlbGVtZW50IDwgdmFsLCBidXQgYWxzbyBpZiBwcmlvciBlbGVtZW50ID4gdmFsLlxuICAgICAgaWR4ID0gbWlkICsgMTtcbiAgICAgIGlmICh2YWxpZEluZGV4KGlkeCkgJiYgYXJyeVtpZHhdID4gdmFsKSB7XG4gICAgICAgIHJldHVybiBtaWQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiaW5hcnlTZWFyY2godmFsLCBhcnJ5LCBhYnMsIG1pZCArIDEsIGhpZ2gpO1xuICB9XG4gIHJldHVybiAtMTsgIC8vIGNhbid0IGFjdHVhbGx5IGhhcHBlbiwgYnV0IG1ha2VzIGNsb3N1cmUgY29tcGlsZXIgaGFwcHlcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBkYXRlLCByZXR1cm5pbmcgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgc2luY2UgZXBvY2guIFRoaXMgY2FuIGJlXG4gKiBwYXNzZWQgaW4gYXMgYW4geFZhbHVlUGFyc2VyIGluIHRoZSBEeWdyYXBoIGNvbnN0cnVjdG9yLlxuICogVE9ETyhkYW52ayk6IGVudW1lcmF0ZSBmb3JtYXRzIHRoYXQgdGhpcyB1bmRlcnN0YW5kcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0ZVN0ciBBIGRhdGUgaW4gYSB2YXJpZXR5IG9mIHBvc3NpYmxlIHN0cmluZyBmb3JtYXRzLlxuICogQHJldHVybiB7bnVtYmVyfSBNaWxsaXNlY29uZHMgc2luY2UgZXBvY2guXG4gKiBAcHJpdmF0ZVxuICovXG52YXIgX2RhdGVQYXJzZXJfcmUgPSAvLS9nO1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGVQYXJzZXIoZGF0ZVN0cikge1xuICB2YXIgZDtcblxuICAvLyBMZXQgdGhlIHN5c3RlbSB0cnkgdGhlIGZvcm1hdCBmaXJzdCwgd2l0aCBvbmUgY2F2ZWF0OlxuICAvLyBZWVlZLU1NLUREWyBISDpNTTpTU10gaXMgaW50ZXJwcmV0ZWQgYXMgVVRDIGJ5IGEgdmFyaWV0eSBvZiBicm93c2Vycy5cbiAgLy8gZHlncmFwaHMgZGlzcGxheXMgZGF0ZXMgaW4gbG9jYWwgdGltZSwgc28gdGhpcyB3aWxsIHJlc3VsdCBpbiBzdXJwcmlzaW5nXG4gIC8vIGluY29uc2lzdGVuY2llcy4gQnV0IGlmIHlvdSBzcGVjaWZ5IFwiVFwiIG9yIFwiWlwiIChpLmUuIFlZWVktTU0tRERUSEg6TU06U1MpLFxuICAvLyB0aGVuIHlvdSBwcm9iYWJseSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLCBzbyB3ZSdsbCBsZXQgeW91IGdvIGFoZWFkLlxuICAvLyBJc3N1ZTogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vYXJjaGl2ZS9wL2R5Z3JhcGhzL2lzc3Vlcy8yNTVcbiAgaWYgKGRhdGVTdHIuc2VhcmNoKFwiLVwiKSA9PSAtMSB8fFxuICAgICAgZGF0ZVN0ci5zZWFyY2goXCJUXCIpICE9IC0xIHx8IGRhdGVTdHIuc2VhcmNoKFwiWlwiKSAhPSAtMSkge1xuICAgIGQgPSBkYXRlU3RyVG9NaWxsaXMoZGF0ZVN0cik7XG4gICAgaWYgKGQgIT0gbnVsbCAmJiAhaXNOYU4oZCkpIHJldHVybiBkO1xuICB9XG5cbiAgaWYgKGRhdGVTdHIuc2VhcmNoKFwiLVwiKSAhPSAtMSkgeyAgLy8gZS5nLiAnMjAwOS03LTEyJyBvciAnMjAwOS0wNy0xMidcbiAgICB2YXIgZGF0ZVN0clNsYXNoZWQgPSBkYXRlU3RyLnJlcGxhY2UoX2RhdGVQYXJzZXJfcmUsIFwiL1wiKTtcbiAgICBkID0gZGF0ZVN0clRvTWlsbGlzKGRhdGVTdHJTbGFzaGVkKTtcbiAgICBpZiAoZCAhPSBudWxsICYmICFpc05hTihkKSkgcmV0dXJuIGQ7XG4gIH1cblxuICAvLyBBbnkgZm9ybWF0IHRoYXQgRGF0ZS5wYXJzZSB3aWxsIGFjY2VwdCwgZS5nLiBcIjIwMDkvMDcvMTJcIiBvclxuICAvLyBcIjIwMDkvMDcvMTIgMTI6MzQ6NTZcIlxuICBkID0gZGF0ZVN0clRvTWlsbGlzKGRhdGVTdHIpO1xuICBpZiAoZCAhPSBudWxsICYmICFpc05hTihkKSkgcmV0dXJuIGQ7XG5cbiAgY29uc29sZS5lcnJvcihcIkNvdWxkbid0IHBhcnNlIFwiICsgZGF0ZVN0ciArIFwiIGFzIGEgZGF0ZVwiKTtcbiAgcmV0dXJuIE5hTjtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGlkZW50aWNhbCB0byBKYXZhU2NyaXB0J3MgYnVpbHQtaW4gRGF0ZS5wYXJzZSgpIG1ldGhvZCwgZXhjZXB0IHRoYXRcbiAqIGl0IGRvZXNuJ3QgZ2V0IHJlcGxhY2VkIHdpdGggYW4gaW5jb21wYXRpYmxlIG1ldGhvZCBieSBhZ2dyZXNzaXZlIEpTXG4gKiBsaWJyYXJpZXMgbGlrZSBNb29Ub29scyBvciBKb29tbGEuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSBkYXRlIHN0cmluZywgZS5nLiBcIjIwMTEvMDUvMDZcIlxuICogQHJldHVybiB7bnVtYmVyfSBtaWxsaXMgc2luY2UgZXBvY2hcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXRlU3RyVG9NaWxsaXMoc3RyKSB7XG4gIHJldHVybiBuZXcgRGF0ZShzdHIpLmdldFRpbWUoKTtcbn1cblxuLy8gVGhlc2UgZnVuY3Rpb25zIGFyZSBhbGwgYmFzZWQgb24gTW9jaGlLaXQuXG4vKipcbiAqIENvcGllcyBhbGwgdGhlIHByb3BlcnRpZXMgZnJvbSBvIHRvIHNlbGYuXG4gKlxuICogQHBhcmFtIHshT2JqZWN0fSBzZWxmXG4gKiBAcGFyYW0geyFPYmplY3R9IG9cbiAqIEByZXR1cm4geyFPYmplY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGUoc2VsZiwgbykge1xuICBpZiAodHlwZW9mKG8pICE9ICd1bmRlZmluZWQnICYmIG8gIT09IG51bGwpIHtcbiAgICBmb3IgKHZhciBrIGluIG8pIHtcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgIHNlbGZba10gPSBvW2tdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc2VsZjtcbn1cblxuLy8gaW50ZXJuYWw6IGNoZWNrIGlmIG8gaXMgYSBET00gbm9kZSwgYW5kIHdlIGtub3cgaXTigJlzIG5vdCBudWxsXG52YXIgX2lzTm9kZSA9ICh0eXBlb2YoTm9kZSkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICAgICBOb2RlICE9PSBudWxsICYmIHR5cGVvZihOb2RlKSA9PT0gJ29iamVjdCcpID9cbiAgZnVuY3Rpb24gX2lzTm9kZShvKSB7XG4gICAgcmV0dXJuIChvIGluc3RhbmNlb2YgTm9kZSk7XG4gIH0gOiBmdW5jdGlvbiBfaXNOb2RlKG8pIHtcbiAgICByZXR1cm4gKHR5cGVvZihvKSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgIHR5cGVvZihvLm5vZGVUeXBlKSA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgICAgIHR5cGVvZihvLm5vZGVOYW1lKSA9PT0gJ3N0cmluZycpO1xufTtcblxuLyoqXG4gKiBDb3BpZXMgYWxsIHRoZSBwcm9wZXJ0aWVzIGZyb20gbyB0byBzZWxmLlxuICpcbiAqIEBwYXJhbSB7IU9iamVjdH0gc2VsZlxuICogQHBhcmFtIHshT2JqZWN0fSBvXG4gKiBAcmV0dXJuIHshT2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZURlZXAoc2VsZiwgbykge1xuICBpZiAodHlwZW9mKG8pICE9ICd1bmRlZmluZWQnICYmIG8gIT09IG51bGwpIHtcbiAgICBmb3IgKHZhciBrIGluIG8pIHtcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgIGNvbnN0IHYgPSBvW2tdO1xuICAgICAgICBpZiAodiA9PT0gbnVsbCkge1xuICAgICAgICAgIHNlbGZba10gPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXlMaWtlKHYpKSB7XG4gICAgICAgICAgc2VsZltrXSA9IHYuc2xpY2UoKTtcbiAgICAgICAgfSBlbHNlIGlmIChfaXNOb2RlKHYpKSB7XG4gICAgICAgICAgLy8gRE9NIG9iamVjdHMgYXJlIHNoYWxsb3dseS1jb3BpZWQuXG4gICAgICAgICAgc2VsZltrXSA9IHY7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mKHYpID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZihzZWxmW2tdKSAhPSAnb2JqZWN0JyB8fCBzZWxmW2tdID09PSBudWxsKSB7XG4gICAgICAgICAgICBzZWxmW2tdID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHVwZGF0ZURlZXAoc2VsZltrXSwgdik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZltrXSA9IHY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59XG5cbi8qKlxuICogQHBhcmFtIHsqfSBvXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHlwZUFycmF5TGlrZShvKSB7XG4gIGlmIChvID09PSBudWxsKVxuICAgIHJldHVybiAnbnVsbCc7XG4gIGNvbnN0IHQgPSB0eXBlb2Yobyk7XG4gIGlmICgodCA9PT0gJ29iamVjdCcgfHxcbiAgICAgICAodCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Yoby5pdGVtKSA9PT0gJ2Z1bmN0aW9uJykpICYmXG4gICAgICB0eXBlb2Yoby5sZW5ndGgpID09PSAnbnVtYmVyJyAmJlxuICAgICAgby5ub2RlVHlwZSAhPT0gMyAmJiBvLm5vZGVUeXBlICE9PSA0KVxuICAgIHJldHVybiAnYXJyYXknO1xuICByZXR1cm4gdDtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyp9IG9cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBcnJheUxpa2Uobykge1xuICBjb25zdCB0ID0gdHlwZW9mKG8pO1xuICByZXR1cm4gKG8gIT09IG51bGwgJiZcbiAgICAgICAgICAodCA9PT0gJ29iamVjdCcgfHxcbiAgICAgICAgICAgKHQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mKG8uaXRlbSkgPT09ICdmdW5jdGlvbicpKSAmJlxuICAgICAgICAgIHR5cGVvZihvLmxlbmd0aCkgPT09ICdudW1iZXInICYmXG4gICAgICAgICAgby5ub2RlVHlwZSAhPT0gMyAmJiBvLm5vZGVUeXBlICE9PSA0KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gb1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGVMaWtlKG8pIHtcbiAgcmV0dXJuIChvICE9PSBudWxsICYmIHR5cGVvZihvKSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICB0eXBlb2Yoby5nZXRUaW1lKSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogTm90ZTogdGhpcyBvbmx5IHNlZW1zIHRvIHdvcmsgZm9yIGFycmF5cy5cbiAqIEBwYXJhbSB7IUFycmF5fSBvXG4gKiBAcmV0dXJuIHshQXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUobykge1xuICAvLyBUT0RPKGRhbnZrKTogZmlndXJlIG91dCBob3cgTW9jaGlLaXQncyB2ZXJzaW9uIHdvcmtzXG4gIHZhciByID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgby5sZW5ndGg7IGkrKykge1xuICAgIGlmIChpc0FycmF5TGlrZShvW2ldKSkge1xuICAgICAgci5wdXNoKGNsb25lKG9baV0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgci5wdXNoKG9baV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcjtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgY2FudmFzIGVsZW1lbnQuXG4gKlxuICogQHJldHVybiB7IUhUTUxDYW52YXNFbGVtZW50fVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNhbnZhcygpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvbnRleHQncyBwaXhlbCByYXRpbywgd2hpY2ggaXMgdGhlIHJhdGlvIGJldHdlZW4gdGhlIGRldmljZVxuICogcGl4ZWwgcmF0aW8gYW5kIHRoZSBiYWNraW5nIHN0b3JlIHJhdGlvLiBUeXBpY2FsbHkgdGhpcyBpcyAxIGZvciBjb252ZW50aW9uYWxcbiAqIGRpc3BsYXlzLCBhbmQgPiAxIGZvciBIaURQSSBkaXNwbGF5cyAoc3VjaCBhcyB0aGUgUmV0aW5hIE1CUCkuIEZvciBtb3JlLCBzZWU6XG4gKiBodHRwczovL3dlYi5hcmNoaXZlLm9yZy93ZWIvMjAyMDA4MDYxNzAxMDMvaHR0cHM6Ly9odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvY2FudmFzL2hpZHBpL1xuICpcbiAqIEBwYXJhbSB7IUNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dCBUaGUgY2FudmFzJ3MgMmQgY29udGV4dC5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIHJhdGlvIG9mIHRoZSBkZXZpY2UgcGl4ZWwgcmF0aW8gYW5kIHRoZSBiYWNraW5nIHN0b3JlXG4gKiByYXRpbyBmb3IgdGhlIHNwZWNpZmllZCBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dFBpeGVsUmF0aW8oY29udGV4dCkge1xuICB0cnkge1xuICAgIHZhciBkZXZpY2VQaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgdmFyIGJhY2tpbmdTdG9yZVJhdGlvID0gY29udGV4dC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3pCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm9CYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDE7XG4gICAgaWYgKGRldmljZVBpeGVsUmF0aW8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGRldmljZVBpeGVsUmF0aW8gLyBiYWNraW5nU3RvcmVSYXRpbztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXQgbGVhc3QgZGV2aWNlUGl4ZWxSYXRpbyBtdXN0IGJlIGRlZmluZWQgZm9yIHRoaXMgcmF0aW8gdG8gbWFrZSBzZW5zZS5cbiAgICAgIC8vIFdlIGRlZmF1bHQgYmFja2luZ1N0b3JlUmF0aW8gdG8gMTogdGhpcyBkb2VzIG5vdCBleGlzdCBvbiBzb21lIGJyb3dzZXJzXG4gICAgICAvLyAoaS5lLiBkZXNrdG9wIENocm9tZSkuXG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxufVxuXG4vKipcbiAqIFRPRE8oZGFudmspOiB1c2UgQHRlbXBsYXRlIGhlcmUgd2hlbiBpdCdzIGJldHRlciBzdXBwb3J0ZWQgZm9yIGNsYXNzZXMuXG4gKiBAcGFyYW0geyFBcnJheX0gYXJyYXlcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFxuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxuICogQHBhcmFtIHtmdW5jdGlvbighQXJyYXksPyk6Ym9vbGVhbj19IHByZWRpY2F0ZVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJdGVyYXRvcihhcnJheSwgc3RhcnQsIGxlbmd0aCwgcHJlZGljYXRlKSB7XG4gIHN0YXJ0ID0gc3RhcnQgfHwgMDtcbiAgbGVuZ3RoID0gbGVuZ3RoIHx8IGFycmF5Lmxlbmd0aDtcbiAgdGhpcy5oYXNOZXh0ID0gdHJ1ZTsgLy8gVXNlIHRvIGlkZW50aWZ5IGlmIHRoZXJlJ3MgYW5vdGhlciBlbGVtZW50LlxuICB0aGlzLnBlZWsgPSBudWxsOyAvLyBVc2UgZm9yIGxvb2stYWhlYWRcbiAgdGhpcy5zdGFydF8gPSBzdGFydDtcbiAgdGhpcy5hcnJheV8gPSBhcnJheTtcbiAgdGhpcy5wcmVkaWNhdGVfID0gcHJlZGljYXRlO1xuICB0aGlzLmVuZF8gPSBNYXRoLm1pbihhcnJheS5sZW5ndGgsIHN0YXJ0ICsgbGVuZ3RoKTtcbiAgdGhpcy5uZXh0SWR4XyA9IHN0YXJ0IC0gMTsgLy8gdXNlIC0xIHNvIGluaXRpYWwgYWR2YW5jZSB3b3Jrcy5cbiAgdGhpcy5uZXh0KCk7IC8vIGlnbm9yaW5nIHJlc3VsdC5cbn1cblxuLyoqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbkl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5oYXNOZXh0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIG9iaiA9IHRoaXMucGVlaztcblxuICB2YXIgbmV4dElkeCA9IHRoaXMubmV4dElkeF8gKyAxO1xuICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgd2hpbGUgKG5leHRJZHggPCB0aGlzLmVuZF8pIHtcbiAgICBpZiAoIXRoaXMucHJlZGljYXRlXyB8fCB0aGlzLnByZWRpY2F0ZV8odGhpcy5hcnJheV8sIG5leHRJZHgpKSB7XG4gICAgICB0aGlzLnBlZWsgPSB0aGlzLmFycmF5X1tuZXh0SWR4XTtcbiAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBuZXh0SWR4Kys7XG4gIH1cbiAgdGhpcy5uZXh0SWR4XyA9IG5leHRJZHg7XG4gIGlmICghZm91bmQpIHtcbiAgICB0aGlzLmhhc05leHQgPSBmYWxzZTtcbiAgICB0aGlzLnBlZWsgPSBudWxsO1xuICB9XG4gIHJldHVybiBvYmo7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBuZXcgaXRlcmF0b3Igb3ZlciBhcnJheSwgYmV0d2VlbiBpbmRleGVzIHN0YXJ0IGFuZFxuICogc3RhcnQgKyBsZW5ndGgsIGFuZCBvbmx5IHJldHVybnMgZW50cmllcyB0aGF0IHBhc3MgdGhlIGFjY2VwdCBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7IUFycmF5fSBhcnJheSB0aGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0IHRoZSBmaXJzdCBpbmRleCB0byBpdGVyYXRlIG92ZXIsIDAgaWYgYWJzZW50LlxuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiAgICAgVGhpcywgYWxvbmcgd2l0aCBzdGFydCwgZGVmaW5lcyBhIHNsaWNlIG9mIHRoZSBhcnJheSwgYW5kIHNvIGxlbmd0aFxuICogICAgIGRvZXNuJ3QgaW1wbHkgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3Igd2hlbiBhY2NlcHQgZG9lc24ndFxuICogICAgIGFsd2F5cyBhY2NlcHQgYWxsIHZhbHVlcy4gYXJyYXkubGVuZ3RoIHdoZW4gYWJzZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbig/KTpib29sZWFuPX0gb3B0X3ByZWRpY2F0ZSBhIGZ1bmN0aW9uIHRoYXQgdGFrZXNcbiAqICAgICBwYXJhbWV0ZXJzIGFycmF5IGFuZCBpZHgsIHdoaWNoIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBlbGVtZW50IHNob3VsZCBiZVxuICogICAgIHJldHVybmVkLiAgSWYgb21pdHRlZCwgYWxsIGVsZW1lbnRzIGFyZSBhY2NlcHRlZC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvcihhcnJheSwgc3RhcnQsIGxlbmd0aCwgb3B0X3ByZWRpY2F0ZSkge1xuICByZXR1cm4gbmV3IEl0ZXJhdG9yKGFycmF5LCBzdGFydCwgbGVuZ3RoLCBvcHRfcHJlZGljYXRlKTtcbn1cblxuLy8gU2hpbSBsYXllciB3aXRoIHNldFRpbWVvdXQgZmFsbGJhY2suXG4vLyBGcm9tOiBodHRwczovL3d3dy5wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4vLyBTaG91bGQgYmUgY2FsbGVkIHdpdGggdGhlIHdpbmRvdyBjb250ZXh0OlxuLy8gICBEeWdyYXBoLnJlcXVlc3RBbmltRnJhbWUuY2FsbCh3aW5kb3csIGZ1bmN0aW9uKCkge30pXG5leHBvcnQgdmFyIHJlcXVlc3RBbmltRnJhbWUgPSAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8XG4gICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHxcbiAgICAgICAgICB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgIHx8XG4gICAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fFxuICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgICAgICAgfTtcbn0pKCk7XG5cbi8qKlxuICogQ2FsbCBhIGZ1bmN0aW9uIGF0IG1vc3QgbWF4RnJhbWVzIHRpbWVzIGF0IGFuIGF0dGVtcHRlZCBpbnRlcnZhbCBvZlxuICogZnJhbWVQZXJpb2RJbk1pbGxpcywgdGhlbiBjYWxsIGEgY2xlYW51cCBmdW5jdGlvbiBvbmNlLiByZXBlYXRGbiBpcyBjYWxsZWRcbiAqIG9uY2UgaW1tZWRpYXRlbHksIHRoZW4gYXQgbW9zdCAobWF4RnJhbWVzIC0gMSkgdGltZXMgYXN5bmNocm9ub3VzbHkuIElmXG4gKiBtYXhGcmFtZXM9PTEsIHRoZW4gY2xlYW51cF9mbigpIGlzIGFsc28gY2FsbGVkIHN5bmNocm9ub3VzbHkuICBUaGlzIGZ1bmN0aW9uXG4gKiBpcyB1c2VkIHRvIHNlcXVlbmNlIGFuaW1hdGlvbi5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24obnVtYmVyKX0gcmVwZWF0Rm4gQ2FsbGVkIHJlcGVhdGVkbHkgLS0gdGFrZXMgdGhlIGZyYW1lXG4gKiAgICAgbnVtYmVyIChmcm9tIDAgdG8gbWF4RnJhbWVzLTEpIGFzIGFuIGFyZ3VtZW50LlxuICogQHBhcmFtIHtudW1iZXJ9IG1heEZyYW1lcyBUaGUgbWF4IG51bWJlciBvZiB0aW1lcyB0byBjYWxsIHJlcGVhdEZuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJhbWVQZXJpb2RJbk1pbGxpcyBNYXggcmVxdWVzdGVkIHRpbWUgYmV0d2VlbiBmcmFtZXMuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGNsZWFudXBGbiBBIGZ1bmN0aW9uIHRvIGNhbGwgYWZ0ZXIgYWxsIHJlcGVhdEZuIGNhbGxzLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGVhdEFuZENsZWFudXAocmVwZWF0Rm4sIG1heEZyYW1lcywgZnJhbWVQZXJpb2RJbk1pbGxpcyxcbiAgICBjbGVhbnVwRm4pIHtcbiAgdmFyIGZyYW1lTnVtYmVyID0gMDtcbiAgdmFyIHByZXZpb3VzRnJhbWVOdW1iZXI7XG4gIHZhciBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgcmVwZWF0Rm4oZnJhbWVOdW1iZXIpO1xuICBpZiAobWF4RnJhbWVzID09IDEpIHtcbiAgICBjbGVhbnVwRm4oKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1heEZyYW1lQXJnID0gbWF4RnJhbWVzIC0gMTtcblxuICAoZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBpZiAoZnJhbWVOdW1iZXIgPj0gbWF4RnJhbWVzKSByZXR1cm47XG4gICAgcmVxdWVzdEFuaW1GcmFtZS5jYWxsKHdpbmRvdywgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggZnJhbWUgdG8gZHJhdyBiYXNlZCBvbiB0aGUgZGVsYXkgc28gZmFyLiAgV2lsbCBza2lwXG4gICAgICAvLyBmcmFtZXMgaWYgbmVjZXNzYXJ5LlxuICAgICAgdmFyIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB2YXIgZGVsYXlJbk1pbGxpcyA9IGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lO1xuICAgICAgcHJldmlvdXNGcmFtZU51bWJlciA9IGZyYW1lTnVtYmVyO1xuICAgICAgZnJhbWVOdW1iZXIgPSBNYXRoLmZsb29yKGRlbGF5SW5NaWxsaXMgLyBmcmFtZVBlcmlvZEluTWlsbGlzKTtcbiAgICAgIHZhciBmcmFtZURlbHRhID0gZnJhbWVOdW1iZXIgLSBwcmV2aW91c0ZyYW1lTnVtYmVyO1xuICAgICAgLy8gSWYgd2UgcHJlZGljdCB0aGF0IHRoZSBzdWJzZXF1ZW50IHJlcGVhdEZuIGNhbGwgd2lsbCBvdmVyc2hvb3Qgb3VyXG4gICAgICAvLyB0b3RhbCBmcmFtZSB0YXJnZXQsIHNvIG91ciBsYXN0IGNhbGwgd2lsbCBjYXVzZSBhIHN0dXR0ZXIsIHRoZW4ganVtcCB0b1xuICAgICAgLy8gdGhlIGxhc3QgY2FsbCBpbW1lZGlhdGVseS4gIElmIHdlJ3JlIGdvaW5nIHRvIGNhdXNlIGEgc3R1dHRlciwgYmV0dGVyXG4gICAgICAvLyB0byBkbyBpdCBmYXN0ZXIgdGhhbiBzbG93ZXIuXG4gICAgICB2YXIgcHJlZGljdE92ZXJzaG9vdFN0dXR0ZXIgPSAoZnJhbWVOdW1iZXIgKyBmcmFtZURlbHRhKSA+IG1heEZyYW1lQXJnO1xuICAgICAgaWYgKHByZWRpY3RPdmVyc2hvb3RTdHV0dGVyIHx8IChmcmFtZU51bWJlciA+PSBtYXhGcmFtZUFyZykpIHtcbiAgICAgICAgcmVwZWF0Rm4obWF4RnJhbWVBcmcpOyAgLy8gRW5zdXJlIGZpbmFsIGNhbGwgd2l0aCBtYXhGcmFtZUFyZy5cbiAgICAgICAgY2xlYW51cEZuKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZnJhbWVEZWx0YSAhPT0gMCkgeyAgLy8gRG9uJ3QgY2FsbCByZXBlYXRGbiB3aXRoIGR1cGxpY2F0ZSBmcmFtZXMuXG4gICAgICAgICAgcmVwZWF0Rm4oZnJhbWVOdW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGxvb3AoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSkoKTtcbn1cblxuLy8gQSB3aGl0ZWxpc3Qgb2Ygb3B0aW9ucyB0aGF0IGRvIG5vdCBjaGFuZ2UgcGl4ZWwgcG9zaXRpb25zLlxudmFyIHBpeGVsU2FmZU9wdGlvbnMgPSB7XG4gICdhbm5vdGF0aW9uQ2xpY2tIYW5kbGVyJzogdHJ1ZSxcbiAgJ2Fubm90YXRpb25EYmxDbGlja0hhbmRsZXInOiB0cnVlLFxuICAnYW5ub3RhdGlvbk1vdXNlT3V0SGFuZGxlcic6IHRydWUsXG4gICdhbm5vdGF0aW9uTW91c2VPdmVySGFuZGxlcic6IHRydWUsXG4gICdheGlzTGluZUNvbG9yJzogdHJ1ZSxcbiAgJ2F4aXNMaW5lV2lkdGgnOiB0cnVlLFxuICAnY2xpY2tDYWxsYmFjayc6IHRydWUsXG4gICdkcmF3Q2FsbGJhY2snOiB0cnVlLFxuICAnZHJhd0hpZ2hsaWdodFBvaW50Q2FsbGJhY2snOiB0cnVlLFxuICAnZHJhd1BvaW50cyc6IHRydWUsXG4gICdkcmF3UG9pbnRDYWxsYmFjayc6IHRydWUsXG4gICdkcmF3R3JpZCc6IHRydWUsXG4gICdmaWxsQWxwaGEnOiB0cnVlLFxuICAnZ3JpZExpbmVDb2xvcic6IHRydWUsXG4gICdncmlkTGluZVdpZHRoJzogdHJ1ZSxcbiAgJ2hpZGVPdmVybGF5T25Nb3VzZU91dCc6IHRydWUsXG4gICdoaWdobGlnaHRDYWxsYmFjayc6IHRydWUsXG4gICdoaWdobGlnaHRDaXJjbGVTaXplJzogdHJ1ZSxcbiAgJ2ludGVyYWN0aW9uTW9kZWwnOiB0cnVlLFxuICAnbGFiZWxzRGl2JzogdHJ1ZSxcbiAgJ2xhYmVsc0tNQic6IHRydWUsXG4gICdsYWJlbHNLTUcyJzogdHJ1ZSxcbiAgJ2xhYmVsc1NlcGFyYXRlTGluZXMnOiB0cnVlLFxuICAnbGFiZWxzU2hvd1plcm9WYWx1ZXMnOiB0cnVlLFxuICAnbGVnZW5kJzogdHJ1ZSxcbiAgJ3BhbkVkZ2VGcmFjdGlvbic6IHRydWUsXG4gICdwaXhlbHNQZXJZTGFiZWwnOiB0cnVlLFxuICAncG9pbnRDbGlja0NhbGxiYWNrJzogdHJ1ZSxcbiAgJ3BvaW50U2l6ZSc6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yUGxvdEZpbGxDb2xvcic6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yUGxvdEZpbGxHcmFkaWVudENvbG9yJzogdHJ1ZSxcbiAgJ3JhbmdlU2VsZWN0b3JQbG90U3Ryb2tlQ29sb3InOiB0cnVlLFxuICAncmFuZ2VTZWxlY3RvckJhY2tncm91bmRTdHJva2VDb2xvcic6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yQmFja2dyb3VuZExpbmVXaWR0aCc6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yUGxvdExpbmVXaWR0aCc6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yRm9yZWdyb3VuZFN0cm9rZUNvbG9yJzogdHJ1ZSxcbiAgJ3JhbmdlU2VsZWN0b3JGb3JlZ3JvdW5kTGluZVdpZHRoJzogdHJ1ZSxcbiAgJ3JhbmdlU2VsZWN0b3JBbHBoYSc6IHRydWUsXG4gICdzaG93TGFiZWxzT25IaWdobGlnaHQnOiB0cnVlLFxuICAnc2hvd1JvbGxlcic6IHRydWUsXG4gICdzdHJva2VXaWR0aCc6IHRydWUsXG4gICd1bmRlcmxheUNhbGxiYWNrJzogdHJ1ZSxcbiAgJ3VuaGlnaGxpZ2h0Q2FsbGJhY2snOiB0cnVlLFxuICAnem9vbUNhbGxiYWNrJzogdHJ1ZVxufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgc2NhbiB0aGUgb3B0aW9uIGxpc3QgYW5kIGRldGVybWluZSBpZiB0aGV5XG4gKiByZXF1aXJlIHVzIHRvIHJlY2FsY3VsYXRlIHRoZSBwaXhlbCBwb3NpdGlvbnMgb2YgZWFjaCBwb2ludC5cbiAqIFRPRE86IG1vdmUgdGhpcyBpbnRvIGR5Z3JhcGgtb3B0aW9ucy5qc1xuICogQHBhcmFtIHshQXJyYXkuPHN0cmluZz59IGxhYmVscyBhIGxpc3Qgb2Ygb3B0aW9ucyB0byBjaGVjay5cbiAqIEBwYXJhbSB7IU9iamVjdH0gYXR0cnNcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGdyYXBoIG5lZWRzIG5ldyBwb2ludHMgZWxzZSBmYWxzZS5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1BpeGVsQ2hhbmdpbmdPcHRpb25MaXN0KGxhYmVscywgYXR0cnMpIHtcbiAgLy8gQXNzdW1lIHRoYXQgd2UgZG8gbm90IHJlcXVpcmUgbmV3IHBvaW50cy5cbiAgLy8gVGhpcyB3aWxsIGNoYW5nZSB0byB0cnVlIGlmIHdlIGFjdHVhbGx5IGRvIG5lZWQgbmV3IHBvaW50cy5cblxuICAvLyBDcmVhdGUgYSBkaWN0aW9uYXJ5IG9mIHNlcmllcyBuYW1lcyBmb3IgZmFzdGVyIGxvb2t1cC5cbiAgLy8gSWYgdGhlcmUgYXJlIG5vIGxhYmVscywgdGhlbiB0aGUgZGljdGlvbmFyeSBzdGF5cyBlbXB0eS5cbiAgdmFyIHNlcmllc05hbWVzRGljdGlvbmFyeSA9IHsgfTtcbiAgaWYgKGxhYmVscykge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzZXJpZXNOYW1lc0RpY3Rpb25hcnlbbGFiZWxzW2ldXSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gU2NhbiB0aHJvdWdoIGEgZmxhdCAoaS5lLiBub24tbmVzdGVkKSBvYmplY3Qgb2Ygb3B0aW9ucy5cbiAgLy8gUmV0dXJucyB0cnVlL2ZhbHNlIGRlcGVuZGluZyBvbiB3aGV0aGVyIG5ldyBwb2ludHMgYXJlIG5lZWRlZC5cbiAgdmFyIHNjYW5GbGF0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkgJiZcbiAgICAgICAgICAhcGl4ZWxTYWZlT3B0aW9uc1twcm9wZXJ0eV0pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIGxpc3Qgb2YgdXBkYXRlZCBvcHRpb25zLlxuICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBhdHRycykge1xuICAgIGlmICghYXR0cnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSBjb250aW51ZTtcblxuICAgIC8vIEZpbmQgb3V0IG9mIHRoaXMgZmllbGQgaXMgYWN0dWFsbHkgYSBzZXJpZXMgc3BlY2lmaWMgb3B0aW9ucyBsaXN0LlxuICAgIGlmIChwcm9wZXJ0eSA9PSAnaGlnaGxpZ2h0U2VyaWVzT3B0cycgfHxcbiAgICAgICAgKHNlcmllc05hbWVzRGljdGlvbmFyeVtwcm9wZXJ0eV0gJiYgIWF0dHJzLnNlcmllcykpIHtcbiAgICAgIC8vIFRoaXMgcHJvcGVydHkgdmFsdWUgaXMgYSBsaXN0IG9mIG9wdGlvbnMgZm9yIHRoaXMgc2VyaWVzLlxuICAgICAgaWYgKHNjYW5GbGF0T3B0aW9ucyhhdHRyc1twcm9wZXJ0eV0pKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09ICdzZXJpZXMnIHx8IHByb3BlcnR5ID09ICdheGVzJykge1xuICAgICAgLy8gVGhpcyBpcyB0d2ljZS1uZXN0ZWQgb3B0aW9ucyBsaXN0LlxuICAgICAgdmFyIHBlclNlcmllcyA9IGF0dHJzW3Byb3BlcnR5XTtcbiAgICAgIGZvciAodmFyIHNlcmllcyBpbiBwZXJTZXJpZXMpIHtcbiAgICAgICAgaWYgKHBlclNlcmllcy5oYXNPd25Qcm9wZXJ0eShzZXJpZXMpICYmXG4gICAgICAgICAgICBzY2FuRmxhdE9wdGlvbnMocGVyU2VyaWVzW3Nlcmllc10pKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhpcyB3YXMgbm90IGEgc2VyaWVzIHNwZWNpZmljIG9wdGlvbiBsaXN0LFxuICAgICAgLy8gY2hlY2sgaWYgaXQncyBhIHBpeGVsLWNoYW5naW5nIHByb3BlcnR5LlxuICAgICAgaWYgKCFwaXhlbFNhZmVPcHRpb25zW3Byb3BlcnR5XSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgdmFyIENpcmNsZXMgPSB7XG4gIERFRkFVTFQgOiBmdW5jdGlvbihnLCBuYW1lLCBjdHgsIGNhbnZhc3gsIGNhbnZhc3ksIGNvbG9yLCByYWRpdXMpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIGN0eC5hcmMoY2FudmFzeCwgY2FudmFzeSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gIH1cbiAgLy8gRm9yIG1vcmUgc2hhcGVzLCBpbmNsdWRlIGV4dHJhcy9zaGFwZXMuanNcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoZXRoZXIgfGRhdGF8IGlzIGRlbGltaXRlZCBieSBDUiwgQ1JMRiwgTEYsIExGQ1IuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YVxuICogQHJldHVybiB7P3N0cmluZ30gdGhlIGRlbGltaXRlciB0aGF0IHdhcyBkZXRlY3RlZCAob3IgbnVsbCBvbiBmYWlsdXJlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdExpbmVEZWxpbWl0ZXIoZGF0YSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY29kZSA9IGRhdGEuY2hhckF0KGkpO1xuICAgIGlmIChjb2RlID09PSAnXFxyJykge1xuICAgICAgLy8gTWlnaHQgYWN0dWFsbHkgYmUgXCJcXHJcXG5cIi5cbiAgICAgIGlmICgoKGkgKyAxKSA8IGRhdGEubGVuZ3RoKSAmJiAoZGF0YS5jaGFyQXQoaSArIDEpID09PSAnXFxuJykpIHtcbiAgICAgICAgcmV0dXJuICdcXHJcXG4nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvZGU7XG4gICAgfVxuICAgIGlmIChjb2RlID09PSAnXFxuJykge1xuICAgICAgLy8gTWlnaHQgYWN0dWFsbHkgYmUgXCJcXG5cXHJcIi5cbiAgICAgIGlmICgoKGkgKyAxKSA8IGRhdGEubGVuZ3RoKSAmJiAoZGF0YS5jaGFyQXQoaSArIDEpID09PSAnXFxyJykpIHtcbiAgICAgICAgcmV0dXJuICdcXG5cXHInO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvZGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogSXMgb25lIG5vZGUgY29udGFpbmVkIGJ5IGFub3RoZXI/XG4gKiBAcGFyYW0ge05vZGV9IGNvbnRhaW5lZSBUaGUgY29udGFpbmVkIG5vZGUuXG4gKiBAcGFyYW0ge05vZGV9IGNvbnRhaW5lciBUaGUgY29udGFpbmVyIG5vZGUuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIGNvbnRhaW5lZSBpcyBpbnNpZGUgKG9yIGVxdWFsIHRvKSBjb250YWluZXIuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlQ29udGFpbmVkQnkoY29udGFpbmVlLCBjb250YWluZXIpIHtcbiAgaWYgKGNvbnRhaW5lciA9PT0gbnVsbCB8fCBjb250YWluZWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGNvbnRhaW5lZU5vZGUgPSAvKiogQHR5cGUge05vZGV9ICovIChjb250YWluZWUpO1xuICB3aGlsZSAoY29udGFpbmVlTm9kZSAmJiBjb250YWluZWVOb2RlICE9PSBjb250YWluZXIpIHtcbiAgICBjb250YWluZWVOb2RlID0gY29udGFpbmVlTm9kZS5wYXJlbnROb2RlO1xuICB9XG4gIHJldHVybiAoY29udGFpbmVlTm9kZSA9PT0gY29udGFpbmVyKTtcbn1cblxuLy8gVGhpcyBtYXNrcyBzb21lIG51bWVyaWMgaXNzdWVzIGluIG9sZGVyIHZlcnNpb25zIG9mIEZpcmVmb3gsXG4vLyB3aGVyZSAxLjAvTWF0aC5wb3coMTAsMikgIT0gTWF0aC5wb3coMTAsLTIpLlxuLyoqIEB0eXBlIHtmdW5jdGlvbihudW1iZXIsbnVtYmVyKTpudW1iZXJ9ICovXG5leHBvcnQgZnVuY3Rpb24gcG93KGJhc2UsIGV4cCkge1xuICBpZiAoZXhwIDwgMCkge1xuICAgIHJldHVybiAxLjAgLyBNYXRoLnBvdyhiYXNlLCAtZXhwKTtcbiAgfVxuICByZXR1cm4gTWF0aC5wb3coYmFzZSwgZXhwKTtcbn1cblxudmFyIFJHQkF4UkUgPSAvXiMoWzAtOUEtRmEtZl17Mn0pKFswLTlBLUZhLWZdezJ9KShbMC05QS1GYS1mXXsyfSkoWzAtOUEtRmEtZl17Mn0pPyQvO1xudmFyIFJHQkFfUkUgPSAvXnJnYmE/XFwoKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSg/OixcXHMqKFswMV0oPzpcXC5cXGQrKT8pKT9cXCkkLztcblxuLyoqXG4gKiBIZWxwZXIgZm9yIHRvUkdCXyB3aGljaCBwYXJzZXMgc3RyaW5ncyBvZiB0aGUgZm9ybTpcbiAqICNSUkdHQkIgKGhleClcbiAqICNSUkdHQkJBQSAoaGV4KVxuICogcmdiKDEyMywgNDUsIDY3KVxuICogcmdiYSgxMjMsIDQ1LCA2NywgMC41KVxuICogQHJldHVybiBwYXJzZWQge3IsZyxiLGE/fSB0dXBsZSBvciBudWxsLlxuICovXG5mdW5jdGlvbiBwYXJzZVJHQkEocmdiU3RyKSB7XG4gIHZhciBiaXRzLCByLCBnLCBiLCBhID0gbnVsbDtcbiAgaWYgKChiaXRzID0gUkdCQXhSRS5leGVjKHJnYlN0cikpKSB7XG4gICAgciA9IHBhcnNlSW50KGJpdHNbMV0sIDE2KTtcbiAgICBnID0gcGFyc2VJbnQoYml0c1syXSwgMTYpO1xuICAgIGIgPSBwYXJzZUludChiaXRzWzNdLCAxNik7XG4gICAgaWYgKGJpdHNbNF0pXG4gICAgICBhID0gcGFyc2VJbnQoYml0c1s0XSwgMTYpO1xuICB9IGVsc2UgaWYgKChiaXRzID0gUkdCQV9SRS5leGVjKHJnYlN0cikpKSB7XG4gICAgciA9IHBhcnNlSW50KGJpdHNbMV0sIDEwKTtcbiAgICBnID0gcGFyc2VJbnQoYml0c1syXSwgMTApO1xuICAgIGIgPSBwYXJzZUludChiaXRzWzNdLCAxMCk7XG4gICAgaWYgKGJpdHNbNF0pXG4gICAgICBhID0gcGFyc2VGbG9hdChiaXRzWzRdKTtcbiAgfSBlbHNlXG4gICAgcmV0dXJuIG51bGw7XG4gIGlmIChhICE9PSBudWxsKVxuICAgIHJldHVybiB7IFwiclwiOiByLCBcImdcIjogZywgXCJiXCI6IGIsIFwiYVwiOiBhIH07XG4gIHJldHVybiB7IFwiclwiOiByLCBcImdcIjogZywgXCJiXCI6IGIgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbnkgdmFsaWQgQ1NTIGNvbG9yIChoZXgsIHJnYigpLCBuYW1lZCBjb2xvcikgdG8gYW4gUkdCIHR1cGxlLlxuICpcbiAqIEBwYXJhbSB7IXN0cmluZ30gY29sb3JTdHIgQW55IHZhbGlkIENTUyBjb2xvciBzdHJpbmcuXG4gKiBAcmV0dXJuIHt7cjpudW1iZXIsZzpudW1iZXIsYjpudW1iZXIsYTpudW1iZXI/fX0gUGFyc2VkIFJHQiB0dXBsZS5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1JHQl8oY29sb3JTdHIpIHtcbiAgLy8gU3RyYXRlZ3k6IEZpcnN0IHRyeSB0byBwYXJzZSBjb2xvclN0ciBkaXJlY3RseS4gVGhpcyBpcyBmYXN0ICYgYXZvaWRzIERPTVxuICAvLyBtYW5pcHVsYXRpb24uICBJZiB0aGF0IGZhaWxzIChlLmcuIGZvciBuYW1lZCBjb2xvcnMgbGlrZSAncmVkJyksIHRoZW5cbiAgLy8gY3JlYXRlIGEgaGlkZGVuIERPTSBlbGVtZW50IGFuZCBwYXJzZSBpdHMgY29tcHV0ZWQgY29sb3IuXG4gIHZhciByZ2IgPSBwYXJzZVJHQkEoY29sb3JTdHIpO1xuICBpZiAocmdiKSByZXR1cm4gcmdiO1xuXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yU3RyO1xuICBkaXYuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gIHZhciByZ2JTdHIgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkaXYsIG51bGwpLmJhY2tncm91bmRDb2xvcjtcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkaXYpO1xuICByZXR1cm4gcGFyc2VSR0JBKHJnYlN0cik7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdGhlICZsdDtjYW52YXMmZ3Q7IHRhZy5cbiAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnQ9fSBvcHRfY2FudmFzRWxlbWVudCBQYXNzIGEgY2FudmFzIGVsZW1lbnQgYXMgYW5cbiAqICAgICBvcHRpbWl6YXRpb24gaWYgeW91IGhhdmUgb25lLlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyBjYW52YXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NhbnZhc1N1cHBvcnRlZChvcHRfY2FudmFzRWxlbWVudCkge1xuICB0cnkge1xuICAgIHZhciBjYW52YXMgPSBvcHRfY2FudmFzRWxlbWVudCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgIGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSB2YWx1ZSBhcyBhIGZsb2F0aW5nIHBvaW50IG51bWJlci4gVGhpcyBpcyBsaWtlIHRoZSBwYXJzZUZsb2F0KClcbiAqIGJ1aWx0LWluLCBidXQgd2l0aCBhIGZldyBkaWZmZXJlbmNlczpcbiAqIC0gdGhlIGVtcHR5IHN0cmluZyBpcyBwYXJzZWQgYXMgbnVsbCwgcmF0aGVyIHRoYW4gTmFOLlxuICogLSBpZiB0aGUgc3RyaW5nIGNhbm5vdCBiZSBwYXJzZWQgYXQgYWxsLCBhbiBlcnJvciBpcyBsb2dnZWQuXG4gKiBJZiB0aGUgc3RyaW5nIGNhbid0IGJlIHBhcnNlZCwgdGhpcyBtZXRob2QgcmV0dXJucyBudWxsLlxuICogQHBhcmFtIHtzdHJpbmd9IHggVGhlIHN0cmluZyB0byBiZSBwYXJzZWRcbiAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2xpbmVfbm8gVGhlIGxpbmUgbnVtYmVyIGZyb20gd2hpY2ggdGhlIHN0cmluZyBjb21lcy5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X2xpbmUgVGhlIHRleHQgb2YgdGhlIGxpbmUgZnJvbSB3aGljaCB0aGUgc3RyaW5nIGNvbWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGbG9hdF8oeCwgb3B0X2xpbmVfbm8sIG9wdF9saW5lKSB7XG4gIHZhciB2YWwgPSBwYXJzZUZsb2F0KHgpO1xuICBpZiAoIWlzTmFOKHZhbCkpIHJldHVybiB2YWw7XG5cbiAgLy8gVHJ5IHRvIGZpZ3VyZSBvdXQgd2hhdCBoYXBwZWVuZC5cbiAgLy8gSWYgdGhlIHZhbHVlIGlzIHRoZSBlbXB0eSBzdHJpbmcsIHBhcnNlIGl0IGFzIG51bGwuXG4gIGlmICgvXiAqJC8udGVzdCh4KSkgcmV0dXJuIG51bGw7XG5cbiAgLy8gSWYgaXQgd2FzIGFjdHVhbGx5IFwiTmFOXCIsIHJldHVybiBpdCBhcyBOYU4uXG4gIGlmICgvXiAqbmFuICokL2kudGVzdCh4KSkgcmV0dXJuIE5hTjtcblxuICAvLyBMb29rcyBsaWtlIGEgcGFyc2luZyBlcnJvci5cbiAgdmFyIG1zZyA9IFwiVW5hYmxlIHRvIHBhcnNlICdcIiArIHggKyBcIicgYXMgYSBudW1iZXJcIjtcbiAgaWYgKG9wdF9saW5lICE9PSB1bmRlZmluZWQgJiYgb3B0X2xpbmVfbm8gIT09IHVuZGVmaW5lZCkge1xuICAgIG1zZyArPSBcIiBvbiBsaW5lIFwiICsgKDErKG9wdF9saW5lX25vfHwwKSkgKyBcIiAoJ1wiICsgb3B0X2xpbmUgKyBcIicpIG9mIENTVi5cIjtcbiAgfVxuICBjb25zb2xlLmVycm9yKG1zZyk7XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIExhYmVsIGNvbnN0YW50cyBmb3IgdGhlIGxhYmVsc0tNQiBhbmQgbGFiZWxzS01HMiBvcHRpb25zLlxuLy8gKGkuZS4gJzEwMDAwMCcgLT4gJzEwMGsnKVxudmFyIEtNQl9MQUJFTFNfTEFSR0UgPSBbICdrJywgJ00nLCAnRycsICdUJywgJ1AnLCAnRScsICdaJywgJ1knIF07XG52YXIgS01CX0xBQkVMU19TTUFMTCA9IFsgJ20nLCAnwrUnLCAnbicsICdwJywgJ2YnLCAnYScsICd6JywgJ3knIF07XG52YXIgS01HMl9MQUJFTFNfTEFSR0UgPSBbICdLaScsICdNaScsICdHaScsICdUaScsICdQaScsICdFaScsICdaaScsICdZaScgXTtcbnZhciBLTUcyX0xBQkVMU19TTUFMTCA9IFsgJ3AtMTAnLCAncC0yMCcsICdwLTMwJywgJ3AtNDAnLCAncC01MCcsICdwLTYwJywgJ3AtNzAnLCAncC04MCcgXTtcbi8qIGlmIGJvdGggYXJlIGdpdmVuIChsZWdhY3kvZGVwcmVjYXRlZCB1c2Ugb25seSkgKi9cbnZhciBLTUIyX0xBQkVMU19MQVJHRSA9IFsgJ0snLCAnTScsICdHJywgJ1QnLCAnUCcsICdFJywgJ1onLCAnWScgXTtcbnZhciBLTUIyX0xBQkVMU19TTUFMTCA9IEtNQl9MQUJFTFNfU01BTEw7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFJldHVybiBhIHN0cmluZyB2ZXJzaW9uIG9mIGEgbnVtYmVyLiBUaGlzIHJlc3BlY3RzIHRoZSBkaWdpdHNBZnRlckRlY2ltYWxcbiAqIGFuZCBtYXhOdW1iZXJXaWR0aCBvcHRpb25zLlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIG51bWJlciB0byBiZSBmb3JtYXR0ZWRcbiAqIEBwYXJhbSB7RHlncmFwaH0gb3B0cyBBbiBvcHRpb25zIHZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclZhbHVlRm9ybWF0dGVyKHgsIG9wdHMpIHtcbiAgdmFyIHNpZ0ZpZ3MgPSBvcHRzKCdzaWdGaWdzJyk7XG5cbiAgaWYgKHNpZ0ZpZ3MgIT09IG51bGwpIHtcbiAgICAvLyBVc2VyIGhhcyBvcHRlZCBmb3IgYSBmaXhlZCBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZmlndXJlcy5cbiAgICByZXR1cm4gZmxvYXRGb3JtYXQoeCwgc2lnRmlncyk7XG4gIH1cblxuICAvLyBzaG9ydGN1dCAwIHNvIGxhdGVyIGNvZGUgZG9lcyBub3QgbmVlZCB0byB3b3JyeSBhYm91dCBpdFxuICBpZiAoeCA9PT0gMC4wKVxuICAgIHJldHVybiAnMCc7XG5cbiAgdmFyIGRpZ2l0cyA9IG9wdHMoJ2RpZ2l0c0FmdGVyRGVjaW1hbCcpO1xuICB2YXIgbWF4TnVtYmVyV2lkdGggPSBvcHRzKCdtYXhOdW1iZXJXaWR0aCcpO1xuXG4gIHZhciBrbWIgPSBvcHRzKCdsYWJlbHNLTUInKTtcbiAgdmFyIGttZzIgPSBvcHRzKCdsYWJlbHNLTUcyJyk7XG5cbiAgdmFyIGxhYmVsO1xuICB2YXIgYWJzeCA9IE1hdGguYWJzKHgpO1xuXG4gIGlmIChrbWIgfHwga21nMikge1xuICAgIHZhciBrO1xuICAgIHZhciBrX2xhYmVscyA9IFtdO1xuICAgIHZhciBtX2xhYmVscyA9IFtdO1xuICAgIGlmIChrbWIpIHtcbiAgICAgIGsgPSAxMDAwO1xuICAgICAga19sYWJlbHMgPSBLTUJfTEFCRUxTX0xBUkdFO1xuICAgICAgbV9sYWJlbHMgPSBLTUJfTEFCRUxTX1NNQUxMO1xuICAgIH1cbiAgICBpZiAoa21nMikge1xuICAgICAgayA9IDEwMjQ7XG4gICAgICBrX2xhYmVscyA9IEtNRzJfTEFCRUxTX0xBUkdFO1xuICAgICAgbV9sYWJlbHMgPSBLTUcyX0xBQkVMU19TTUFMTDtcbiAgICAgIGlmIChrbWIpIHtcbiAgICAgICAga19sYWJlbHMgPSBLTUIyX0xBQkVMU19MQVJHRTtcbiAgICAgICAgbV9sYWJlbHMgPSBLTUIyX0xBQkVMU19TTUFMTDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbjtcbiAgICB2YXIgajtcbiAgICBpZiAoYWJzeCA+PSBrKSB7XG4gICAgICBqID0ga19sYWJlbHMubGVuZ3RoO1xuICAgICAgd2hpbGUgKGogPiAwKSB7XG4gICAgICAgIG4gPSBwb3coaywgaik7XG4gICAgICAgIC0tajtcbiAgICAgICAgaWYgKGFic3ggPj0gbikge1xuICAgICAgICAgIC8vIGd1YXJhbnRlZWQgdG8gaGl0IGJlY2F1c2UgYWJzeCA+PSBrIChwb3coaywgMSkpXG4gICAgICAgICAgLy8gaWYgaW1tZW5zZWx5IGxhcmdlIHN0aWxsIHN3aXRjaCB0byBzY2llbnRpZmljIG5vdGF0aW9uXG4gICAgICAgICAgaWYgKChhYnN4IC8gbikgPj0gTWF0aC5wb3coMTAsIG1heE51bWJlcldpZHRoKSlcbiAgICAgICAgICAgIGxhYmVsID0geC50b0V4cG9uZW50aWFsKGRpZ2l0cyk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbGFiZWwgPSByb3VuZF8oeCAvIG4sIGRpZ2l0cykgKyBrX2xhYmVsc1tqXTtcbiAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIG5vdCByZWFjaGVkLCBmYWxsIHRocm91Z2ggc2FmZWx5IHRob3VnaCBzaG91bGQgaXQgZXZlciBiZVxuICAgIH0gZWxzZSBpZiAoKGFic3ggPCAxKSAvKiAmJiAobV9sYWJlbHMubGVuZ3RoID4gMCkgKi8pIHtcbiAgICAgIGogPSAwO1xuICAgICAgd2hpbGUgKGogPCBtX2xhYmVscy5sZW5ndGgpIHtcbiAgICAgICAgKytqO1xuICAgICAgICBuID0gcG93KGssIGopO1xuICAgICAgICBpZiAoKGFic3ggKiBuKSA+PSAxKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8gaWYgX3N0aWxsXyB0b28gc21hbGwsIHN3aXRjaCB0byBzY2llbnRpZmljIG5vdGF0aW9uIGluc3RlYWRcbiAgICAgIGlmICgoYWJzeCAqIG4pIDwgTWF0aC5wb3coMTAsIC1kaWdpdHMpKVxuICAgICAgICBsYWJlbCA9IHgudG9FeHBvbmVudGlhbChkaWdpdHMpO1xuICAgICAgZWxzZVxuICAgICAgICBsYWJlbCA9IHJvdW5kXyh4ICogbiwgZGlnaXRzKSArIG1fbGFiZWxzW2ogLSAxXTtcbiAgICAgIHJldHVybiBsYWJlbDtcbiAgICB9XG4gICAgLy8gZWxzZSBmYWxsIHRocm91Z2hcbiAgfVxuXG4gIGlmIChhYnN4ID49IE1hdGgucG93KDEwLCBtYXhOdW1iZXJXaWR0aCkgfHxcbiAgICAgIGFic3ggPCBNYXRoLnBvdygxMCwgLWRpZ2l0cykpIHtcbiAgICAvLyBzd2l0Y2ggdG8gc2NpZW50aWZpYyBub3RhdGlvbiBpZiB3ZSB1bmRlcmZsb3cgb3Igb3ZlcmZsb3cgZml4ZWQgZGlzcGxheVxuICAgIGxhYmVsID0geC50b0V4cG9uZW50aWFsKGRpZ2l0cyk7XG4gIH0gZWxzZSB7XG4gICAgbGFiZWwgPSAnJyArIHJvdW5kXyh4LCBkaWdpdHMpO1xuICB9XG5cbiAgcmV0dXJuIGxhYmVsO1xufVxuXG4vKipcbiAqIHZhcmlhbnQgZm9yIHVzZSBhcyBhbiBheGlzTGFiZWxGb3JtYXR0ZXIuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyQXhpc0xhYmVsRm9ybWF0dGVyKHgsIGdyYW51bGFyaXR5LCBvcHRzKSB7XG4gIHJldHVybiBudW1iZXJWYWx1ZUZvcm1hdHRlci5jYWxsKHRoaXMsIHgsIG9wdHMpO1xufVxuXG4vKipcbiAqIEB0eXBlIHshQXJyYXkuPHN0cmluZz59XG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0YW50XG4gKi9cbnZhciBTSE9SVF9NT05USF9OQU1FU18gPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8qKlxuICogQ29udmVydCBhIEpTIGRhdGUgdG8gYSBzdHJpbmcgYXBwcm9wcmlhdGUgdG8gZGlzcGxheSBvbiBhbiBheGlzIHRoYXRcbiAqIGlzIGRpc3BsYXlpbmcgdmFsdWVzIGF0IHRoZSBzdGF0ZWQgZ3JhbnVsYXJpdHkuIFRoaXMgcmVzcGVjdHMgdGhlXG4gKiBsYWJlbHNVVEMgb3B0aW9uLlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIFRoZSBkYXRlIHRvIGZvcm1hdFxuICogQHBhcmFtIHtudW1iZXJ9IGdyYW51bGFyaXR5IE9uZSBvZiB0aGUgRHlncmFwaCBncmFudWxhcml0eSBjb25zdGFudHNcbiAqIEBwYXJhbSB7RHlncmFwaH0gb3B0cyBBbiBvcHRpb25zIHZpZXdcbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGRhdGUgZm9ybWF0dGVkIGFzIGxvY2FsIHRpbWVcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXRlQXhpc0xhYmVsRm9ybWF0dGVyKGRhdGUsIGdyYW51bGFyaXR5LCBvcHRzKSB7XG4gIHZhciB1dGMgPSBvcHRzKCdsYWJlbHNVVEMnKTtcbiAgdmFyIGFjY2Vzc29ycyA9IHV0YyA/IERhdGVBY2Nlc3NvcnNVVEMgOiBEYXRlQWNjZXNzb3JzTG9jYWw7XG5cbiAgdmFyIHllYXIgPSBhY2Nlc3NvcnMuZ2V0RnVsbFllYXIoZGF0ZSksXG4gICAgICBtb250aCA9IGFjY2Vzc29ycy5nZXRNb250aChkYXRlKSxcbiAgICAgIGRheSA9IGFjY2Vzc29ycy5nZXREYXRlKGRhdGUpLFxuICAgICAgaG91cnMgPSBhY2Nlc3NvcnMuZ2V0SG91cnMoZGF0ZSksXG4gICAgICBtaW5zID0gYWNjZXNzb3JzLmdldE1pbnV0ZXMoZGF0ZSksXG4gICAgICBzZWNzID0gYWNjZXNzb3JzLmdldFNlY29uZHMoZGF0ZSksXG4gICAgICBtaWxsaXMgPSBhY2Nlc3NvcnMuZ2V0TWlsbGlzZWNvbmRzKGRhdGUpO1xuXG4gIGlmIChncmFudWxhcml0eSA+PSBEeWdyYXBoVGlja2Vycy5HcmFudWxhcml0eS5ERUNBREFMKSB7XG4gICAgcmV0dXJuICcnICsgeWVhcjtcbiAgfSBlbHNlIGlmIChncmFudWxhcml0eSA+PSBEeWdyYXBoVGlja2Vycy5HcmFudWxhcml0eS5NT05USExZKSB7XG4gICAgcmV0dXJuIFNIT1JUX01PTlRIX05BTUVTX1ttb250aF0gKyAnJiMxNjA7JyArIHllYXI7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGZyYWMgPSBob3VycyAqIDM2MDAgKyBtaW5zICogNjAgKyBzZWNzICsgMWUtMyAqIG1pbGxpcztcbiAgICBpZiAoZnJhYyA9PT0gMCB8fCBncmFudWxhcml0eSA+PSBEeWdyYXBoVGlja2Vycy5HcmFudWxhcml0eS5EQUlMWSkge1xuICAgICAgLy8gZS5nLiAnMjEgSmFuJyAoJWQlYilcbiAgICAgIHJldHVybiB6ZXJvcGFkKGRheSkgKyAnJiMxNjA7JyArIFNIT1JUX01PTlRIX05BTUVTX1ttb250aF07XG4gICAgfSBlbHNlIGlmIChncmFudWxhcml0eSA8IER5Z3JhcGhUaWNrZXJzLkdyYW51bGFyaXR5LlNFQ09ORExZKSB7XG4gICAgICAvLyBlLmcuIDQwLjMxMCAobWVhbmluZyA0MCBzZWNvbmRzIGFuZCAzMTAgbWlsbGlzZWNvbmRzKVxuICAgICAgdmFyIHN0ciA9IFwiXCIgKyBtaWxsaXM7XG4gICAgICByZXR1cm4gemVyb3BhZChzZWNzKSArIFwiLlwiICsgKCcwMDAnK3N0cikuc3Vic3RyaW5nKHN0ci5sZW5ndGgpO1xuICAgIH0gZWxzZSBpZiAoZ3JhbnVsYXJpdHkgPiBEeWdyYXBoVGlja2Vycy5HcmFudWxhcml0eS5NSU5VVEVMWSkge1xuICAgICAgcmV0dXJuIGhtc1N0cmluZ18oaG91cnMsIG1pbnMsIHNlY3MsIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaG1zU3RyaW5nXyhob3VycywgbWlucywgc2VjcywgbWlsbGlzKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBzdHJpbmcgdmVyc2lvbiBvZiBhIEpTIGRhdGUgZm9yIGEgdmFsdWUgbGFiZWwuIFRoaXMgcmVzcGVjdHMgdGhlXG4gKiBsYWJlbHNVVEMgb3B0aW9uLlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIFRoZSBkYXRlIHRvIGJlIGZvcm1hdHRlZFxuICogQHBhcmFtIHtEeWdyYXBofSBvcHRzIEFuIG9wdGlvbnMgdmlld1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGVWYWx1ZUZvcm1hdHRlcihkLCBvcHRzKSB7XG4gIHJldHVybiBkYXRlU3RyaW5nXyhkLCBvcHRzKCdsYWJlbHNVVEMnKSk7XG59XG5cbi8vIHN0dWZmIGZvciBzaW1wbGUgb25ET01yZWFkeSBpbXBsZW1lbnRhdGlvblxudmFyIGRlZmVyRE9NX2NhbGxiYWNrcyA9IFtdO1xudmFyIGRlZmVyRE9NX2hhbmRsZXJDYWxsZWQgPSBmYWxzZTtcblxuLy8gb25ET01yZWFkeSBvbmNlIERPTSBpcyByZWFkeVxuLyoqXG4gKiBTaW1wbGUgb25ET01yZWFkeSBpbXBsZW1lbnRhdGlvblxuICogQHBhcmFtIHtmdW5jdGlvbigpfSBjYiBUaGUgY2FsbGJhY2sgdG8gcnVuIG9uY2UgdGhlIERPTSBpcyByZWFkeS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIERPTSBpcyBjdXJyZW50bHkgcmVhZHlcbiAqL1xuZnVuY3Rpb24gZGVmZXJET01fcmVhZHkoY2IpIHtcbiAgaWYgKHR5cGVvZihjYikgPT09IFwiZnVuY3Rpb25cIilcbiAgICBjYigpO1xuICByZXR1cm4gKHRydWUpO1xufVxuXG4vKipcbiAqIFNldHVwIGEgc2ltcGxlIG9uRE9NcmVhZHkgaW1wbGVtZW50YXRpb24gb24gdGhlIGdpdmVuIG9iamN0LlxuICogQHBhcmFtIHsqfSBzZWxmIHRoZSBvYmplY3QgdG8gdXBkYXRlIC5vbkRPTXJlYWR5IG9uXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBET01yZWFkeV8oc2VsZikge1xuICAvLyBvbmx5IGF0dGFjaCBpZiB0aGVyZeKAmXMgYSBET01cbiAgaWYgKHR5cGVvZihkb2N1bWVudCkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBjYWxsZWQgYnkgYnJvd3NlclxuICAgIGNvbnN0IGhhbmRsZXIgPSBmdW5jdGlvbiBkZWZlckRPTV9oYW5kbGVyKCkge1xuICAgICAgLyogZXhlY3V0ZSBvbmx5IG9uY2UgKi9cbiAgICAgIGlmIChkZWZlckRPTV9oYW5kbGVyQ2FsbGVkKVxuICAgICAgICByZXR1cm47XG4gICAgICBkZWZlckRPTV9oYW5kbGVyQ2FsbGVkID0gdHJ1ZTtcbiAgICAgIC8qIHN1YnNlcXVlbnQgY2FsbHMgbXVzdCBub3QgZW5xdWV1ZSAqL1xuICAgICAgc2VsZi5vbkRPTXJlYWR5ID0gZGVmZXJET01fcmVhZHk7XG4gICAgICAvKiBjbGVhciBldmVudCBoYW5kbGVycyAqL1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaGFuZGxlciwgZmFsc2UpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICAgIC8qIHJ1biB1c2VyIGNhbGxiYWNrcyAqL1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWZlckRPTV9jYWxsYmFja3MubGVuZ3RoOyArK2kpXG4gICAgICAgIGRlZmVyRE9NX2NhbGxiYWNrc1tpXSgpO1xuICAgICAgZGVmZXJET01fY2FsbGJhY2tzID0gbnVsbDsgLy9nY1xuICAgIH07XG5cbiAgICAvLyBtYWtlIGNhbGxhYmxlIChtdXRhdGluZywgZG8gbm90IGNvcHkpXG4gICAgc2VsZi5vbkRPTXJlYWR5ID0gZnVuY3Rpb24gZGVmZXJET01faW5pdGlhbChjYikge1xuICAgICAgLyogaWYgcG9zc2libGUsIHNraXAgYWxsIHRoYXQgKi9cbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgc2VsZi5vbkRPTXJlYWR5ID0gZGVmZXJET01fcmVhZHk7XG4gICAgICAgIHJldHVybiAoZGVmZXJET01fcmVhZHkoY2IpKTtcbiAgICAgIH1cbiAgICAgIC8vIG9uRE9NcmVhZHksIGFmdGVyIHNldHVwLCBiZWZvcmUgRE9NIGlzIHJlYWR5XG4gICAgICBjb25zdCBlbnFmbiA9IGZ1bmN0aW9uIGRlZmVyRE9NX2VucXVldWUoY2IpIHtcbiAgICAgICAgaWYgKHR5cGVvZihjYikgPT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICBkZWZlckRPTV9jYWxsYmFja3MucHVzaChjYik7XG4gICAgICAgIHJldHVybiAoZmFsc2UpO1xuICAgICAgfTtcbiAgICAgIC8qIHN1YnNlcXVlbnQgY2FsbHMgd2lsbCBlbnF1ZXVlICovXG4gICAgICBzZWxmLm9uRE9NcmVhZHkgPSBlbnFmbjtcbiAgICAgIC8qIHNldCB1cCBoYW5kbGVyICovXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgICAvKiBsYXN0IHJlc29ydDogYWx3YXlzIHdvcmtzLCBidXQgbGF0ZXIgdGhhbiBwb3NzaWJsZSAqL1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICAgIC8qIGV4Y2VwdCBpZiBET00gZ290IHJlYWR5IGluIHRoZSBtZWFudGltZSAqL1xuICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICAvKiB1bmRvIGFsbCB0aGF0IGF0dGFjaGluZyAqL1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgIC8qIGdvdG8gZmluaXNoICovXG4gICAgICAgIHNlbGYub25ET01yZWFkeSA9IGRlZmVyRE9NX3JlYWR5O1xuICAgICAgICByZXR1cm4gKGRlZmVyRE9NX3JlYWR5KGNiKSk7XG4gICAgICB9XG4gICAgICAvKiBqdXN0IGVucXVldWUgdGhhdCAqL1xuICAgICAgcmV0dXJuIChlbnFmbihjYikpO1xuICAgIH07XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWTs7QUFFWjtBQUNBO0FBQ0E7QUFDQTtB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