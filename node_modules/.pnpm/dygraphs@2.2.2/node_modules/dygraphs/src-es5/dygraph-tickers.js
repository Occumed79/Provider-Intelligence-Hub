'use strict';

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */

/**
 * @fileoverview Description of this file.
 * @author danvk@google.com (Dan Vanderkam)
 */

/*
 * A ticker is a function with the following interface:
 *
 * function(a, b, pixels, options_view, dygraph, forced_values);
 * -> [ { v: tick1_v, label: tick1_label[, label_v: label_v1] },
 *      { v: tick2_v, label: tick2_label[, label_v: label_v2] },
 *      ...
 *    ]
 *
 * The returned value is called a "tick list".
 *
 * Arguments
 * ---------
 *
 * [a, b] is the range of the axis for which ticks are being generated. For a
 * numeric axis, these will simply be numbers. For a date axis, these will be
 * millis since epoch (convertable to Date objects using "new Date(a)" and "new
 * Date(b)").
 *
 * opts provides access to chart- and axis-specific options. It can be used to
 * access number/date formatting code/options, check for a log scale, etc.
 *
 * pixels is the length of the axis in pixels. opts('pixelsPerLabel') is the
 * minimum amount of space to be allotted to each label. For instance, if
 * pixels=400 and opts('pixelsPerLabel')=40 then the ticker should return
 * between zero and ten (400/40) ticks.
 *
 * dygraph is the Dygraph object for which an axis is being constructed.
 *
 * forced_values is used for secondary y-axes. The tick positions are typically
 * set by the primary y-axis, so the secondary y-axis has no choice in where to
 * put these. It simply has to generate labels for these data values.
 *
 * Tick lists
 * ----------
 * Typically a tick will have both a grid/tick line and a label at one end of
 * that line (at the bottom for an x-axis, at left or right for the y-axis).
 *
 * A tick may be missing one of these two components:
 * - If "label_v" is specified instead of "v", then there will be no tick or
 *   gridline, just a label.
 * - Similarly, if "label" is not specified, then there will be a gridline
 *   without a label.
 *
 * This flexibility is useful in a few situations:
 * - For log scales, some of the tick lines may be too close to all have labels.
 * - For date scales where years are being displayed, it is desirable to display
 *   tick marks at the beginnings of years but labels (e.g. "2006") in the
 *   middle of the years.
 */

/*jshint sub:true */
/*global Dygraph:false */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pickDateTickGranularity = exports.numericTicks = exports.numericLinearTicks = exports.integerTicks = exports.getDateAxis = exports.dateTicker = exports.Granularity = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/** @typedef {Array.<{v:number, label:string, label_v:(string|undefined)}>} */
var TickList = undefined; // the ' = undefined' keeps jshint happy.

/** @typedef {function(
 *    number,
 *    number,
 *    number,
 *    function(string):*,
 *    Dygraph=,
 *    Array.<number>=
 *  ): TickList}
 */
var Ticker = undefined; // the ' = undefined' keeps jshint happy.

/** @type {Ticker} */
var numericLinearTicks = exports.numericLinearTicks = function numericLinearTicks(a, b, pixels, opts, dygraph, vals) {
  var nonLogscaleOpts = function nonLogscaleOpts(opt) {
    if (opt === 'logscale') return false;
    return opts(opt);
  };
  return numericTicks(a, b, pixels, nonLogscaleOpts, dygraph, vals);
};

/** @type {Ticker} */
var numericTicks = exports.numericTicks = function numericTicks(a, b, pixels, opts, dygraph, vals) {
  var pixels_per_tick = /** @type{number} */opts('pixelsPerLabel');
  var ticks = [];
  var i, j, tickV, nTicks;
  if (vals) {
    for (i = 0; i < vals.length; i++) {
      ticks.push({
        v: vals[i]
      });
    }
  } else {
    // TODO(danvk): factor this log-scale block out into a separate function.
    if (opts("logscale")) {
      nTicks = Math.floor(pixels / pixels_per_tick);
      var minIdx = utils.binarySearch(a, PREFERRED_LOG_TICK_VALUES, 1);
      var maxIdx = utils.binarySearch(b, PREFERRED_LOG_TICK_VALUES, -1);
      if (minIdx == -1) {
        minIdx = 0;
      }
      if (maxIdx == -1) {
        maxIdx = PREFERRED_LOG_TICK_VALUES.length - 1;
      }
      // Count the number of tick values would appear, if we can get at least
      // nTicks / 4 accept them.
      var lastDisplayed = null;
      if (maxIdx - minIdx >= nTicks / 4) {
        for (var idx = maxIdx; idx >= minIdx; idx--) {
          var tickValue = PREFERRED_LOG_TICK_VALUES[idx];
          var pixel_coord = Math.log(tickValue / a) / Math.log(b / a) * pixels;
          var tick = {
            v: tickValue
          };
          if (lastDisplayed === null) {
            lastDisplayed = {
              tickValue: tickValue,
              pixel_coord: pixel_coord
            };
          } else {
            if (Math.abs(pixel_coord - lastDisplayed.pixel_coord) >= pixels_per_tick) {
              lastDisplayed = {
                tickValue: tickValue,
                pixel_coord: pixel_coord
              };
            } else {
              tick.label = "";
            }
          }
          ticks.push(tick);
        }
        // Since we went in backwards order.
        ticks.reverse();
      }
    }

    // ticks.length won't be 0 if the log scale function finds values to insert.
    if (ticks.length === 0) {
      // Basic idea:
      // Try labels every 1, 2, 5, 10, 20, 50, 100, etc.
      // Calculate the resulting tick spacing (i.e. this.height_ / nTicks).
      // The first spacing greater than pixelsPerYLabel is what we use.
      // TODO(danvk): version that works on a log scale.
      var kmg2 = opts("labelsKMG2");
      var mults, base;
      if (kmg2) {
        mults = [1, 2, 4, 8, 16, 32, 64, 128, 256];
        base = 16;
      } else {
        mults = [1, 2, 5, 10, 20, 50, 100];
        base = 10;
      }

      // Get the maximum number of permitted ticks based on the
      // graph's pixel size and pixels_per_tick setting.
      var max_ticks = Math.ceil(pixels / pixels_per_tick);

      // Now calculate the data unit equivalent of this tick spacing.
      // Use abs() since graphs may have a reversed Y axis.
      var units_per_tick = Math.abs(b - a) / max_ticks;

      // Based on this, get a starting scale which is the largest
      // integer power of the chosen base (10 or 16) that still remains
      // below the requested pixels_per_tick spacing.
      var base_power = Math.floor(Math.log(units_per_tick) / Math.log(base));
      var base_scale = Math.pow(base, base_power);

      // Now try multiples of the starting scale until we find one
      // that results in tick marks spaced sufficiently far apart.
      // The "mults" array should cover the range 1 .. base^2 to
      // adjust for rounding and edge effects.
      var scale, low_val, high_val, spacing;
      for (j = 0; j < mults.length; j++) {
        scale = base_scale * mults[j];
        low_val = Math.floor(a / scale) * scale;
        high_val = Math.ceil(b / scale) * scale;
        nTicks = Math.abs(high_val - low_val) / scale;
        spacing = pixels / nTicks;
        if (spacing > pixels_per_tick) break;
      }

      // Construct the set of ticks.
      // Allow reverse y-axis if it's explicitly requested.
      if (low_val > high_val) scale *= -1;
      for (i = 0; i <= nTicks; i++) {
        tickV = low_val + i * scale;
        ticks.push({
          v: tickV
        });
      }
    }
  }
  var formatter = /**@type{AxisLabelFormatter}*/opts('axisLabelFormatter');

  // Add labels to the ticks.
  for (i = 0; i < ticks.length; i++) {
    if (ticks[i].label !== undefined) continue; // Use current label.
    // TODO(danvk): set granularity to something appropriate here.
    ticks[i].label = formatter.call(dygraph, ticks[i].v, 0, opts, dygraph);
  }
  return ticks;
};

/** @type {Ticker} */
var integerTicks = exports.integerTicks = function integerTicks(a, b, pixels, opts, dygraph, vals) {
  var allTicks = numericTicks(a, b, pixels, opts, dygraph, vals);
  return allTicks.filter(function (tick) {
    return tick.v % 1 === 0;
  });
};

/** @type {Ticker} */
var dateTicker = exports.dateTicker = function dateTicker(a, b, pixels, opts, dygraph, vals) {
  var chosen = pickDateTickGranularity(a, b, pixels, opts);
  if (chosen >= 0) {
    return getDateAxis(a, b, chosen, opts, dygraph);
  } else {
    // this can happen if self.width_ is zero.
    return [];
  }
};

// Time granularity enumeration
var Granularity = exports.Granularity = {
  MILLISECONDLY: 0,
  TWO_MILLISECONDLY: 1,
  FIVE_MILLISECONDLY: 2,
  TEN_MILLISECONDLY: 3,
  FIFTY_MILLISECONDLY: 4,
  HUNDRED_MILLISECONDLY: 5,
  FIVE_HUNDRED_MILLISECONDLY: 6,
  SECONDLY: 7,
  TWO_SECONDLY: 8,
  FIVE_SECONDLY: 9,
  TEN_SECONDLY: 10,
  THIRTY_SECONDLY: 11,
  MINUTELY: 12,
  TWO_MINUTELY: 13,
  FIVE_MINUTELY: 14,
  TEN_MINUTELY: 15,
  THIRTY_MINUTELY: 16,
  HOURLY: 17,
  TWO_HOURLY: 18,
  SIX_HOURLY: 19,
  DAILY: 20,
  TWO_DAILY: 21,
  WEEKLY: 22,
  MONTHLY: 23,
  QUARTERLY: 24,
  BIANNUAL: 25,
  ANNUAL: 26,
  DECADAL: 27,
  CENTENNIAL: 28,
  NUM_GRANULARITIES: 29
};

// Date components enumeration (in the order of the arguments in Date)
// TODO: make this an @enum
var DateField = {
  DATEFIELD_Y: 0,
  DATEFIELD_M: 1,
  DATEFIELD_D: 2,
  DATEFIELD_HH: 3,
  DATEFIELD_MM: 4,
  DATEFIELD_SS: 5,
  DATEFIELD_MS: 6,
  NUM_DATEFIELDS: 7
};

/**
 * The value of datefield will start at an even multiple of "step", i.e.
 *   if datefield=SS and step=5 then the first tick will be on a multiple of 5s.
 *
 * For granularities <= HOURLY, ticks are generated every `spacing` ms.
 *
 * At coarser granularities, ticks are generated by incrementing `datefield` by
 *   `step`. In this case, the `spacing` value is only used to estimate the
 *   number of ticks. It should roughly correspond to the spacing between
 *   adjacent ticks.
 *
 * @type {Array.<{datefield:number, step:number, spacing:number}>}
 */
var TICK_PLACEMENT = [];
TICK_PLACEMENT[Granularity.MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 1,
  spacing: 1
};
TICK_PLACEMENT[Granularity.TWO_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 2,
  spacing: 2
};
TICK_PLACEMENT[Granularity.FIVE_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 5,
  spacing: 5
};
TICK_PLACEMENT[Granularity.TEN_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 10,
  spacing: 10
};
TICK_PLACEMENT[Granularity.FIFTY_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 50,
  spacing: 50
};
TICK_PLACEMENT[Granularity.HUNDRED_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 100,
  spacing: 100
};
TICK_PLACEMENT[Granularity.FIVE_HUNDRED_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 500,
  spacing: 500
};
TICK_PLACEMENT[Granularity.SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 1,
  spacing: 1000 * 1
};
TICK_PLACEMENT[Granularity.TWO_SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 2,
  spacing: 1000 * 2
};
TICK_PLACEMENT[Granularity.FIVE_SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 5,
  spacing: 1000 * 5
};
TICK_PLACEMENT[Granularity.TEN_SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 10,
  spacing: 1000 * 10
};
TICK_PLACEMENT[Granularity.THIRTY_SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 30,
  spacing: 1000 * 30
};
TICK_PLACEMENT[Granularity.MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 1,
  spacing: 1000 * 60
};
TICK_PLACEMENT[Granularity.TWO_MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 2,
  spacing: 1000 * 60 * 2
};
TICK_PLACEMENT[Granularity.FIVE_MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 5,
  spacing: 1000 * 60 * 5
};
TICK_PLACEMENT[Granularity.TEN_MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 10,
  spacing: 1000 * 60 * 10
};
TICK_PLACEMENT[Granularity.THIRTY_MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 30,
  spacing: 1000 * 60 * 30
};
TICK_PLACEMENT[Granularity.HOURLY] = {
  datefield: DateField.DATEFIELD_HH,
  step: 1,
  spacing: 1000 * 3600
};
TICK_PLACEMENT[Granularity.TWO_HOURLY] = {
  datefield: DateField.DATEFIELD_HH,
  step: 2,
  spacing: 1000 * 3600 * 2
};
TICK_PLACEMENT[Granularity.SIX_HOURLY] = {
  datefield: DateField.DATEFIELD_HH,
  step: 6,
  spacing: 1000 * 3600 * 6
};
TICK_PLACEMENT[Granularity.DAILY] = {
  datefield: DateField.DATEFIELD_D,
  step: 1,
  spacing: 1000 * 86400
};
TICK_PLACEMENT[Granularity.TWO_DAILY] = {
  datefield: DateField.DATEFIELD_D,
  step: 2,
  spacing: 1000 * 86400 * 2
};
TICK_PLACEMENT[Granularity.WEEKLY] = {
  datefield: DateField.DATEFIELD_D,
  step: 7,
  spacing: 1000 * 604800
};
TICK_PLACEMENT[Granularity.MONTHLY] = {
  datefield: DateField.DATEFIELD_M,
  step: 1,
  spacing: 1000 * 7200 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 / 12
TICK_PLACEMENT[Granularity.QUARTERLY] = {
  datefield: DateField.DATEFIELD_M,
  step: 3,
  spacing: 1000 * 21600 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 / 4
TICK_PLACEMENT[Granularity.BIANNUAL] = {
  datefield: DateField.DATEFIELD_M,
  step: 6,
  spacing: 1000 * 43200 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 / 2
TICK_PLACEMENT[Granularity.ANNUAL] = {
  datefield: DateField.DATEFIELD_Y,
  step: 1,
  spacing: 1000 * 86400 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 * 1
TICK_PLACEMENT[Granularity.DECADAL] = {
  datefield: DateField.DATEFIELD_Y,
  step: 10,
  spacing: 1000 * 864000 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 * 10
TICK_PLACEMENT[Granularity.CENTENNIAL] = {
  datefield: DateField.DATEFIELD_Y,
  step: 100,
  spacing: 1000 * 8640000 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 * 100

/**
 * This is a list of human-friendly values at which to show tick marks on a log
 * scale. It is k * 10^n, where k=1..9 and n=-39..+39, so:
 * ..., 1, 2, 3, 4, 5, ..., 9, 10, 20, 30, ..., 90, 100, 200, 300, ...
 * NOTE: this assumes that utils.LOG_SCALE = 10.
 * @type {Array.<number>}
 */
var PREFERRED_LOG_TICK_VALUES = function () {
  var vals = [];
  for (var power = -39; power <= 39; power++) {
    var range = Math.pow(10, power);
    for (var mult = 1; mult <= 9; mult++) {
      var val = range * mult;
      vals.push(val);
    }
  }
  return vals;
}();

/**
 * Determine the correct granularity of ticks on a date axis.
 *
 * @param {number} a Left edge of the chart (ms)
 * @param {number} b Right edge of the chart (ms)
 * @param {number} pixels Size of the chart in the relevant dimension (width).
 * @param {function(string):*} opts Function mapping from option name -&gt; value.
 * @return {number} The appropriate axis granularity for this chart. See the
 *     enumeration of possible values in dygraph-tickers.js.
 */
var pickDateTickGranularity = exports.pickDateTickGranularity = function pickDateTickGranularity(a, b, pixels, opts) {
  var pixels_per_tick = /** @type{number} */opts('pixelsPerLabel');
  for (var i = 0; i < Granularity.NUM_GRANULARITIES; i++) {
    var num_ticks = numDateTicks(a, b, i);
    if (pixels / num_ticks >= pixels_per_tick) {
      return i;
    }
  }
  return -1;
};

/**
 * Compute the number of ticks on a date axis for a given granularity.
 * @param {number} start_time
 * @param {number} end_time
 * @param {number} granularity (one of the granularities enumerated above)
 * @return {number} (Approximate) number of ticks that would result.
 */
var numDateTicks = function numDateTicks(start_time, end_time, granularity) {
  var spacing = TICK_PLACEMENT[granularity].spacing;
  return Math.round(1.0 * (end_time - start_time) / spacing);
};

/**
 * Compute the positions and labels of ticks on a date axis for a given granularity.
 * @param {number} start_time
 * @param {number} end_time
 * @param {number} granularity (one of the granularities enumerated above)
 * @param {function(string):*} opts Function mapping from option name -&gt; value.
 * @param {Dygraph=} dg
 * @return {!TickList}
 */
var getDateAxis = exports.getDateAxis = function getDateAxis(start_time, end_time, granularity, opts, dg) {
  var formatter = /** @type{AxisLabelFormatter} */
  opts("axisLabelFormatter");
  var utc = opts("labelsUTC");
  var accessors = utc ? utils.DateAccessorsUTC : utils.DateAccessorsLocal;
  var datefield = TICK_PLACEMENT[granularity].datefield;
  var step = TICK_PLACEMENT[granularity].step;
  var spacing = TICK_PLACEMENT[granularity].spacing;

  // Choose a nice tick position before the initial instant.
  // Currently, this code deals properly with the existent daily granularities:
  // DAILY (with step of 1) and WEEKLY (with step of 7 but specially handled).
  // Other daily granularities (say TWO_DAILY) should also be handled specially
  // by setting the start_date_offset to 0.
  var start_date = new Date(start_time);
  var date_array = [];
  date_array[DateField.DATEFIELD_Y] = accessors.getFullYear(start_date);
  date_array[DateField.DATEFIELD_M] = accessors.getMonth(start_date);
  date_array[DateField.DATEFIELD_D] = accessors.getDate(start_date);
  date_array[DateField.DATEFIELD_HH] = accessors.getHours(start_date);
  date_array[DateField.DATEFIELD_MM] = accessors.getMinutes(start_date);
  date_array[DateField.DATEFIELD_SS] = accessors.getSeconds(start_date);
  date_array[DateField.DATEFIELD_MS] = accessors.getMilliseconds(start_date);
  var start_date_offset = date_array[datefield] % step;
  if (granularity == Granularity.WEEKLY) {
    // This will put the ticks on Sundays.
    start_date_offset = accessors.getDay(start_date);
  }
  date_array[datefield] -= start_date_offset;
  for (var df = datefield + 1; df < DateField.NUM_DATEFIELDS; df++) {
    // The minimum value is 1 for the day of month, and 0 for all other fields.
    date_array[df] = df === DateField.DATEFIELD_D ? 1 : 0;
  }

  // Generate the ticks.
  // For granularities not coarser than HOURLY we use the fact that:
  //   the number of milliseconds between ticks is constant
  //   and equal to the defined spacing.
  // Otherwise we rely on the 'roll over' property of the Date functions:
  //   when some date field is set to a value outside of its logical range,
  //   the excess 'rolls over' the next (more significant) field.
  // However, when using local time with DST transitions,
  // there are dates that do not represent any time value at all
  // (those in the hour skipped at the 'spring forward'),
  // and the JavaScript engines usually return an equivalent value.
  // Hence we have to check that the date is properly increased at each step,
  // returning a date at a nice tick position.
  var ticks = [];
  var tick_date = accessors.makeDate.apply(null, date_array);
  var tick_time = tick_date.getTime();
  if (granularity <= Granularity.HOURLY) {
    if (tick_time < start_time) {
      tick_time += spacing;
      tick_date = new Date(tick_time);
    }
    while (tick_time <= end_time) {
      ticks.push({
        v: tick_time,
        label: formatter.call(dg, tick_date, granularity, opts, dg)
      });
      tick_time += spacing;
      tick_date = new Date(tick_time);
    }
  } else {
    if (tick_time < start_time) {
      date_array[datefield] += step;
      tick_date = accessors.makeDate.apply(null, date_array);
      tick_time = tick_date.getTime();
    }
    while (tick_time <= end_time) {
      if (granularity >= Granularity.DAILY || accessors.getHours(tick_date) % step === 0) {
        ticks.push({
          v: tick_time,
          label: formatter.call(dg, tick_date, granularity, opts, dg)
        });
      }
      date_array[datefield] += step;
      tick_date = accessors.makeDate.apply(null, date_array);
      tick_time = tick_date.getTime();
    }
  }
  return ticks;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsInBpY2tEYXRlVGlja0dyYW51bGFyaXR5IiwibnVtZXJpY1RpY2tzIiwibnVtZXJpY0xpbmVhclRpY2tzIiwiaW50ZWdlclRpY2tzIiwiZ2V0RGF0ZUF4aXMiLCJkYXRlVGlja2VyIiwiR3JhbnVsYXJpdHkiLCJ1dGlscyIsIl9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkIiwicmVxdWlyZSIsImUiLCJ0IiwiV2Vha01hcCIsInIiLCJuIiwiX19lc01vZHVsZSIsIm8iLCJpIiwiZiIsIl9fcHJvdG9fXyIsImhhcyIsImdldCIsInNldCIsIl90IiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiVGlja0xpc3QiLCJ1bmRlZmluZWQiLCJUaWNrZXIiLCJhIiwiYiIsInBpeGVscyIsIm9wdHMiLCJkeWdyYXBoIiwidmFscyIsIm5vbkxvZ3NjYWxlT3B0cyIsIm9wdCIsInBpeGVsc19wZXJfdGljayIsInRpY2tzIiwiaiIsInRpY2tWIiwiblRpY2tzIiwibGVuZ3RoIiwicHVzaCIsInYiLCJNYXRoIiwiZmxvb3IiLCJtaW5JZHgiLCJiaW5hcnlTZWFyY2giLCJQUkVGRVJSRURfTE9HX1RJQ0tfVkFMVUVTIiwibWF4SWR4IiwibGFzdERpc3BsYXllZCIsImlkeCIsInRpY2tWYWx1ZSIsInBpeGVsX2Nvb3JkIiwibG9nIiwidGljayIsImFicyIsImxhYmVsIiwicmV2ZXJzZSIsImttZzIiLCJtdWx0cyIsImJhc2UiLCJtYXhfdGlja3MiLCJjZWlsIiwidW5pdHNfcGVyX3RpY2siLCJiYXNlX3Bvd2VyIiwiYmFzZV9zY2FsZSIsInBvdyIsInNjYWxlIiwibG93X3ZhbCIsImhpZ2hfdmFsIiwic3BhY2luZyIsImZvcm1hdHRlciIsImFsbFRpY2tzIiwiZmlsdGVyIiwiY2hvc2VuIiwiTUlMTElTRUNPTkRMWSIsIlRXT19NSUxMSVNFQ09ORExZIiwiRklWRV9NSUxMSVNFQ09ORExZIiwiVEVOX01JTExJU0VDT05ETFkiLCJGSUZUWV9NSUxMSVNFQ09ORExZIiwiSFVORFJFRF9NSUxMSVNFQ09ORExZIiwiRklWRV9IVU5EUkVEX01JTExJU0VDT05ETFkiLCJTRUNPTkRMWSIsIlRXT19TRUNPTkRMWSIsIkZJVkVfU0VDT05ETFkiLCJURU5fU0VDT05ETFkiLCJUSElSVFlfU0VDT05ETFkiLCJNSU5VVEVMWSIsIlRXT19NSU5VVEVMWSIsIkZJVkVfTUlOVVRFTFkiLCJURU5fTUlOVVRFTFkiLCJUSElSVFlfTUlOVVRFTFkiLCJIT1VSTFkiLCJUV09fSE9VUkxZIiwiU0lYX0hPVVJMWSIsIkRBSUxZIiwiVFdPX0RBSUxZIiwiV0VFS0xZIiwiTU9OVEhMWSIsIlFVQVJURVJMWSIsIkJJQU5OVUFMIiwiQU5OVUFMIiwiREVDQURBTCIsIkNFTlRFTk5JQUwiLCJOVU1fR1JBTlVMQVJJVElFUyIsIkRhdGVGaWVsZCIsIkRBVEVGSUVMRF9ZIiwiREFURUZJRUxEX00iLCJEQVRFRklFTERfRCIsIkRBVEVGSUVMRF9ISCIsIkRBVEVGSUVMRF9NTSIsIkRBVEVGSUVMRF9TUyIsIkRBVEVGSUVMRF9NUyIsIk5VTV9EQVRFRklFTERTIiwiVElDS19QTEFDRU1FTlQiLCJkYXRlZmllbGQiLCJzdGVwIiwicG93ZXIiLCJyYW5nZSIsIm11bHQiLCJ2YWwiLCJudW1fdGlja3MiLCJudW1EYXRlVGlja3MiLCJzdGFydF90aW1lIiwiZW5kX3RpbWUiLCJncmFudWxhcml0eSIsInJvdW5kIiwiZGciLCJ1dGMiLCJhY2Nlc3NvcnMiLCJEYXRlQWNjZXNzb3JzVVRDIiwiRGF0ZUFjY2Vzc29yc0xvY2FsIiwic3RhcnRfZGF0ZSIsIkRhdGUiLCJkYXRlX2FycmF5IiwiZ2V0RnVsbFllYXIiLCJnZXRNb250aCIsImdldERhdGUiLCJnZXRIb3VycyIsImdldE1pbnV0ZXMiLCJnZXRTZWNvbmRzIiwiZ2V0TWlsbGlzZWNvbmRzIiwic3RhcnRfZGF0ZV9vZmZzZXQiLCJnZXREYXkiLCJkZiIsInRpY2tfZGF0ZSIsIm1ha2VEYXRlIiwiYXBwbHkiLCJ0aWNrX3RpbWUiLCJnZXRUaW1lIl0sInNvdXJjZXMiOlsiLi4vc3JjL2R5Z3JhcGgtdGlja2Vycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDExIERhbiBWYW5kZXJrYW0gKGRhbnZka0BnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZS9NSVRcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVzY3JpcHRpb24gb2YgdGhpcyBmaWxlLlxuICogQGF1dGhvciBkYW52a0Bnb29nbGUuY29tIChEYW4gVmFuZGVya2FtKVxuICovXG5cbi8qXG4gKiBBIHRpY2tlciBpcyBhIGZ1bmN0aW9uIHdpdGggdGhlIGZvbGxvd2luZyBpbnRlcmZhY2U6XG4gKlxuICogZnVuY3Rpb24oYSwgYiwgcGl4ZWxzLCBvcHRpb25zX3ZpZXcsIGR5Z3JhcGgsIGZvcmNlZF92YWx1ZXMpO1xuICogLT4gWyB7IHY6IHRpY2sxX3YsIGxhYmVsOiB0aWNrMV9sYWJlbFssIGxhYmVsX3Y6IGxhYmVsX3YxXSB9LFxuICogICAgICB7IHY6IHRpY2syX3YsIGxhYmVsOiB0aWNrMl9sYWJlbFssIGxhYmVsX3Y6IGxhYmVsX3YyXSB9LFxuICogICAgICAuLi5cbiAqICAgIF1cbiAqXG4gKiBUaGUgcmV0dXJuZWQgdmFsdWUgaXMgY2FsbGVkIGEgXCJ0aWNrIGxpc3RcIi5cbiAqXG4gKiBBcmd1bWVudHNcbiAqIC0tLS0tLS0tLVxuICpcbiAqIFthLCBiXSBpcyB0aGUgcmFuZ2Ugb2YgdGhlIGF4aXMgZm9yIHdoaWNoIHRpY2tzIGFyZSBiZWluZyBnZW5lcmF0ZWQuIEZvciBhXG4gKiBudW1lcmljIGF4aXMsIHRoZXNlIHdpbGwgc2ltcGx5IGJlIG51bWJlcnMuIEZvciBhIGRhdGUgYXhpcywgdGhlc2Ugd2lsbCBiZVxuICogbWlsbGlzIHNpbmNlIGVwb2NoIChjb252ZXJ0YWJsZSB0byBEYXRlIG9iamVjdHMgdXNpbmcgXCJuZXcgRGF0ZShhKVwiIGFuZCBcIm5ld1xuICogRGF0ZShiKVwiKS5cbiAqXG4gKiBvcHRzIHByb3ZpZGVzIGFjY2VzcyB0byBjaGFydC0gYW5kIGF4aXMtc3BlY2lmaWMgb3B0aW9ucy4gSXQgY2FuIGJlIHVzZWQgdG9cbiAqIGFjY2VzcyBudW1iZXIvZGF0ZSBmb3JtYXR0aW5nIGNvZGUvb3B0aW9ucywgY2hlY2sgZm9yIGEgbG9nIHNjYWxlLCBldGMuXG4gKlxuICogcGl4ZWxzIGlzIHRoZSBsZW5ndGggb2YgdGhlIGF4aXMgaW4gcGl4ZWxzLiBvcHRzKCdwaXhlbHNQZXJMYWJlbCcpIGlzIHRoZVxuICogbWluaW11bSBhbW91bnQgb2Ygc3BhY2UgdG8gYmUgYWxsb3R0ZWQgdG8gZWFjaCBsYWJlbC4gRm9yIGluc3RhbmNlLCBpZlxuICogcGl4ZWxzPTQwMCBhbmQgb3B0cygncGl4ZWxzUGVyTGFiZWwnKT00MCB0aGVuIHRoZSB0aWNrZXIgc2hvdWxkIHJldHVyblxuICogYmV0d2VlbiB6ZXJvIGFuZCB0ZW4gKDQwMC80MCkgdGlja3MuXG4gKlxuICogZHlncmFwaCBpcyB0aGUgRHlncmFwaCBvYmplY3QgZm9yIHdoaWNoIGFuIGF4aXMgaXMgYmVpbmcgY29uc3RydWN0ZWQuXG4gKlxuICogZm9yY2VkX3ZhbHVlcyBpcyB1c2VkIGZvciBzZWNvbmRhcnkgeS1heGVzLiBUaGUgdGljayBwb3NpdGlvbnMgYXJlIHR5cGljYWxseVxuICogc2V0IGJ5IHRoZSBwcmltYXJ5IHktYXhpcywgc28gdGhlIHNlY29uZGFyeSB5LWF4aXMgaGFzIG5vIGNob2ljZSBpbiB3aGVyZSB0b1xuICogcHV0IHRoZXNlLiBJdCBzaW1wbHkgaGFzIHRvIGdlbmVyYXRlIGxhYmVscyBmb3IgdGhlc2UgZGF0YSB2YWx1ZXMuXG4gKlxuICogVGljayBsaXN0c1xuICogLS0tLS0tLS0tLVxuICogVHlwaWNhbGx5IGEgdGljayB3aWxsIGhhdmUgYm90aCBhIGdyaWQvdGljayBsaW5lIGFuZCBhIGxhYmVsIGF0IG9uZSBlbmQgb2ZcbiAqIHRoYXQgbGluZSAoYXQgdGhlIGJvdHRvbSBmb3IgYW4geC1heGlzLCBhdCBsZWZ0IG9yIHJpZ2h0IGZvciB0aGUgeS1heGlzKS5cbiAqXG4gKiBBIHRpY2sgbWF5IGJlIG1pc3Npbmcgb25lIG9mIHRoZXNlIHR3byBjb21wb25lbnRzOlxuICogLSBJZiBcImxhYmVsX3ZcIiBpcyBzcGVjaWZpZWQgaW5zdGVhZCBvZiBcInZcIiwgdGhlbiB0aGVyZSB3aWxsIGJlIG5vIHRpY2sgb3JcbiAqICAgZ3JpZGxpbmUsIGp1c3QgYSBsYWJlbC5cbiAqIC0gU2ltaWxhcmx5LCBpZiBcImxhYmVsXCIgaXMgbm90IHNwZWNpZmllZCwgdGhlbiB0aGVyZSB3aWxsIGJlIGEgZ3JpZGxpbmVcbiAqICAgd2l0aG91dCBhIGxhYmVsLlxuICpcbiAqIFRoaXMgZmxleGliaWxpdHkgaXMgdXNlZnVsIGluIGEgZmV3IHNpdHVhdGlvbnM6XG4gKiAtIEZvciBsb2cgc2NhbGVzLCBzb21lIG9mIHRoZSB0aWNrIGxpbmVzIG1heSBiZSB0b28gY2xvc2UgdG8gYWxsIGhhdmUgbGFiZWxzLlxuICogLSBGb3IgZGF0ZSBzY2FsZXMgd2hlcmUgeWVhcnMgYXJlIGJlaW5nIGRpc3BsYXllZCwgaXQgaXMgZGVzaXJhYmxlIHRvIGRpc3BsYXlcbiAqICAgdGljayBtYXJrcyBhdCB0aGUgYmVnaW5uaW5ncyBvZiB5ZWFycyBidXQgbGFiZWxzIChlLmcuIFwiMjAwNlwiKSBpbiB0aGVcbiAqICAgbWlkZGxlIG9mIHRoZSB5ZWFycy5cbiAqL1xuXG4vKmpzaGludCBzdWI6dHJ1ZSAqL1xuLypnbG9iYWwgRHlncmFwaDpmYWxzZSAqL1xuXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL2R5Z3JhcGgtdXRpbHMnO1xuXG4vKiogQHR5cGVkZWYge0FycmF5Ljx7djpudW1iZXIsIGxhYmVsOnN0cmluZywgbGFiZWxfdjooc3RyaW5nfHVuZGVmaW5lZCl9Pn0gKi9cbnZhciBUaWNrTGlzdCA9IHVuZGVmaW5lZDsgIC8vIHRoZSAnID0gdW5kZWZpbmVkJyBrZWVwcyBqc2hpbnQgaGFwcHkuXG5cbi8qKiBAdHlwZWRlZiB7ZnVuY3Rpb24oXG4gKiAgICBudW1iZXIsXG4gKiAgICBudW1iZXIsXG4gKiAgICBudW1iZXIsXG4gKiAgICBmdW5jdGlvbihzdHJpbmcpOiosXG4gKiAgICBEeWdyYXBoPSxcbiAqICAgIEFycmF5LjxudW1iZXI+PVxuICogICk6IFRpY2tMaXN0fVxuICovXG52YXIgVGlja2VyID0gdW5kZWZpbmVkOyAgLy8gdGhlICcgPSB1bmRlZmluZWQnIGtlZXBzIGpzaGludCBoYXBweS5cblxuLyoqIEB0eXBlIHtUaWNrZXJ9ICovXG5leHBvcnQgdmFyIG51bWVyaWNMaW5lYXJUaWNrcyA9IGZ1bmN0aW9uIChhLCBiLCBwaXhlbHMsIG9wdHMsIGR5Z3JhcGgsIHZhbHMpIHtcbiAgdmFyIG5vbkxvZ3NjYWxlT3B0cyA9IGZ1bmN0aW9uIChvcHQpIHtcbiAgICBpZiAob3B0ID09PSAnbG9nc2NhbGUnKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIG9wdHMob3B0KTtcbiAgfTtcbiAgcmV0dXJuIG51bWVyaWNUaWNrcyhhLCBiLCBwaXhlbHMsIG5vbkxvZ3NjYWxlT3B0cywgZHlncmFwaCwgdmFscyk7XG59O1xuXG4vKiogQHR5cGUge1RpY2tlcn0gKi9cbmV4cG9ydCB2YXIgbnVtZXJpY1RpY2tzID0gZnVuY3Rpb24gKGEsIGIsIHBpeGVscywgb3B0cywgZHlncmFwaCwgdmFscykge1xuICB2YXIgcGl4ZWxzX3Blcl90aWNrID0gLyoqIEB0eXBle251bWJlcn0gKi8ob3B0cygncGl4ZWxzUGVyTGFiZWwnKSk7XG4gIHZhciB0aWNrcyA9IFtdO1xuICB2YXIgaSwgaiwgdGlja1YsIG5UaWNrcztcbiAgaWYgKHZhbHMpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdmFscy5sZW5ndGg7IGkrKykge1xuICAgICAgdGlja3MucHVzaCh7djogdmFsc1tpXX0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBUT0RPKGRhbnZrKTogZmFjdG9yIHRoaXMgbG9nLXNjYWxlIGJsb2NrIG91dCBpbnRvIGEgc2VwYXJhdGUgZnVuY3Rpb24uXG4gICAgaWYgKG9wdHMoXCJsb2dzY2FsZVwiKSkge1xuICAgICAgblRpY2tzICA9IE1hdGguZmxvb3IocGl4ZWxzIC8gcGl4ZWxzX3Blcl90aWNrKTtcbiAgICAgIHZhciBtaW5JZHggPSB1dGlscy5iaW5hcnlTZWFyY2goYSwgUFJFRkVSUkVEX0xPR19USUNLX1ZBTFVFUywgMSk7XG4gICAgICB2YXIgbWF4SWR4ID0gdXRpbHMuYmluYXJ5U2VhcmNoKGIsIFBSRUZFUlJFRF9MT0dfVElDS19WQUxVRVMsIC0xKTtcbiAgICAgIGlmIChtaW5JZHggPT0gLTEpIHtcbiAgICAgICAgbWluSWR4ID0gMDtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhJZHggPT0gLTEpIHtcbiAgICAgICAgbWF4SWR4ID0gUFJFRkVSUkVEX0xPR19USUNLX1ZBTFVFUy5sZW5ndGggLSAxO1xuICAgICAgfVxuICAgICAgLy8gQ291bnQgdGhlIG51bWJlciBvZiB0aWNrIHZhbHVlcyB3b3VsZCBhcHBlYXIsIGlmIHdlIGNhbiBnZXQgYXQgbGVhc3RcbiAgICAgIC8vIG5UaWNrcyAvIDQgYWNjZXB0IHRoZW0uXG4gICAgICB2YXIgbGFzdERpc3BsYXllZCA9IG51bGw7XG4gICAgICBpZiAobWF4SWR4IC0gbWluSWR4ID49IG5UaWNrcyAvIDQpIHtcbiAgICAgICAgZm9yICh2YXIgaWR4ID0gbWF4SWR4OyBpZHggPj0gbWluSWR4OyBpZHgtLSkge1xuICAgICAgICAgIHZhciB0aWNrVmFsdWUgPSBQUkVGRVJSRURfTE9HX1RJQ0tfVkFMVUVTW2lkeF07XG4gICAgICAgICAgdmFyIHBpeGVsX2Nvb3JkID0gTWF0aC5sb2codGlja1ZhbHVlIC8gYSkgLyBNYXRoLmxvZyhiIC8gYSkgKiBwaXhlbHM7XG4gICAgICAgICAgdmFyIHRpY2sgPSB7IHY6IHRpY2tWYWx1ZSB9O1xuICAgICAgICAgIGlmIChsYXN0RGlzcGxheWVkID09PSBudWxsKSB7XG4gICAgICAgICAgICBsYXN0RGlzcGxheWVkID0ge1xuICAgICAgICAgICAgICB0aWNrVmFsdWUgOiB0aWNrVmFsdWUsXG4gICAgICAgICAgICAgIHBpeGVsX2Nvb3JkIDogcGl4ZWxfY29vcmRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhwaXhlbF9jb29yZCAtIGxhc3REaXNwbGF5ZWQucGl4ZWxfY29vcmQpID49IHBpeGVsc19wZXJfdGljaykge1xuICAgICAgICAgICAgICBsYXN0RGlzcGxheWVkID0ge1xuICAgICAgICAgICAgICAgIHRpY2tWYWx1ZSA6IHRpY2tWYWx1ZSxcbiAgICAgICAgICAgICAgICBwaXhlbF9jb29yZCA6IHBpeGVsX2Nvb3JkXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aWNrLmxhYmVsID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGlja3MucHVzaCh0aWNrKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5jZSB3ZSB3ZW50IGluIGJhY2t3YXJkcyBvcmRlci5cbiAgICAgICAgdGlja3MucmV2ZXJzZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRpY2tzLmxlbmd0aCB3b24ndCBiZSAwIGlmIHRoZSBsb2cgc2NhbGUgZnVuY3Rpb24gZmluZHMgdmFsdWVzIHRvIGluc2VydC5cbiAgICBpZiAodGlja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBCYXNpYyBpZGVhOlxuICAgICAgLy8gVHJ5IGxhYmVscyBldmVyeSAxLCAyLCA1LCAxMCwgMjAsIDUwLCAxMDAsIGV0Yy5cbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgcmVzdWx0aW5nIHRpY2sgc3BhY2luZyAoaS5lLiB0aGlzLmhlaWdodF8gLyBuVGlja3MpLlxuICAgICAgLy8gVGhlIGZpcnN0IHNwYWNpbmcgZ3JlYXRlciB0aGFuIHBpeGVsc1BlcllMYWJlbCBpcyB3aGF0IHdlIHVzZS5cbiAgICAgIC8vIFRPRE8oZGFudmspOiB2ZXJzaW9uIHRoYXQgd29ya3Mgb24gYSBsb2cgc2NhbGUuXG4gICAgICB2YXIga21nMiA9IG9wdHMoXCJsYWJlbHNLTUcyXCIpO1xuICAgICAgdmFyIG11bHRzLCBiYXNlO1xuICAgICAgaWYgKGttZzIpIHtcbiAgICAgICAgbXVsdHMgPSBbMSwgMiwgNCwgOCwgMTYsIDMyLCA2NCwgMTI4LCAyNTZdO1xuICAgICAgICBiYXNlID0gMTY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtdWx0cyA9IFsxLCAyLCA1LCAxMCwgMjAsIDUwLCAxMDBdO1xuICAgICAgICBiYXNlID0gMTA7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgbWF4aW11bSBudW1iZXIgb2YgcGVybWl0dGVkIHRpY2tzIGJhc2VkIG9uIHRoZVxuICAgICAgLy8gZ3JhcGgncyBwaXhlbCBzaXplIGFuZCBwaXhlbHNfcGVyX3RpY2sgc2V0dGluZy5cbiAgICAgIHZhciBtYXhfdGlja3MgPSBNYXRoLmNlaWwocGl4ZWxzIC8gcGl4ZWxzX3Blcl90aWNrKTtcblxuICAgICAgLy8gTm93IGNhbGN1bGF0ZSB0aGUgZGF0YSB1bml0IGVxdWl2YWxlbnQgb2YgdGhpcyB0aWNrIHNwYWNpbmcuXG4gICAgICAvLyBVc2UgYWJzKCkgc2luY2UgZ3JhcGhzIG1heSBoYXZlIGEgcmV2ZXJzZWQgWSBheGlzLlxuICAgICAgdmFyIHVuaXRzX3Blcl90aWNrID0gTWF0aC5hYnMoYiAtIGEpIC8gbWF4X3RpY2tzO1xuXG4gICAgICAvLyBCYXNlZCBvbiB0aGlzLCBnZXQgYSBzdGFydGluZyBzY2FsZSB3aGljaCBpcyB0aGUgbGFyZ2VzdFxuICAgICAgLy8gaW50ZWdlciBwb3dlciBvZiB0aGUgY2hvc2VuIGJhc2UgKDEwIG9yIDE2KSB0aGF0IHN0aWxsIHJlbWFpbnNcbiAgICAgIC8vIGJlbG93IHRoZSByZXF1ZXN0ZWQgcGl4ZWxzX3Blcl90aWNrIHNwYWNpbmcuXG4gICAgICB2YXIgYmFzZV9wb3dlciA9IE1hdGguZmxvb3IoTWF0aC5sb2codW5pdHNfcGVyX3RpY2spIC8gTWF0aC5sb2coYmFzZSkpO1xuICAgICAgdmFyIGJhc2Vfc2NhbGUgPSBNYXRoLnBvdyhiYXNlLCBiYXNlX3Bvd2VyKTtcblxuICAgICAgLy8gTm93IHRyeSBtdWx0aXBsZXMgb2YgdGhlIHN0YXJ0aW5nIHNjYWxlIHVudGlsIHdlIGZpbmQgb25lXG4gICAgICAvLyB0aGF0IHJlc3VsdHMgaW4gdGljayBtYXJrcyBzcGFjZWQgc3VmZmljaWVudGx5IGZhciBhcGFydC5cbiAgICAgIC8vIFRoZSBcIm11bHRzXCIgYXJyYXkgc2hvdWxkIGNvdmVyIHRoZSByYW5nZSAxIC4uIGJhc2VeMiB0b1xuICAgICAgLy8gYWRqdXN0IGZvciByb3VuZGluZyBhbmQgZWRnZSBlZmZlY3RzLlxuICAgICAgdmFyIHNjYWxlLCBsb3dfdmFsLCBoaWdoX3ZhbCwgc3BhY2luZztcbiAgICAgIGZvciAoaiA9IDA7IGogPCBtdWx0cy5sZW5ndGg7IGorKykge1xuICAgICAgICBzY2FsZSA9IGJhc2Vfc2NhbGUgKiBtdWx0c1tqXTtcbiAgICAgICAgbG93X3ZhbCA9IE1hdGguZmxvb3IoYSAvIHNjYWxlKSAqIHNjYWxlO1xuICAgICAgICBoaWdoX3ZhbCA9IE1hdGguY2VpbChiIC8gc2NhbGUpICogc2NhbGU7XG4gICAgICAgIG5UaWNrcyA9IE1hdGguYWJzKGhpZ2hfdmFsIC0gbG93X3ZhbCkgLyBzY2FsZTtcbiAgICAgICAgc3BhY2luZyA9IHBpeGVscyAvIG5UaWNrcztcbiAgICAgICAgaWYgKHNwYWNpbmcgPiBwaXhlbHNfcGVyX3RpY2spIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIHNldCBvZiB0aWNrcy5cbiAgICAgIC8vIEFsbG93IHJldmVyc2UgeS1heGlzIGlmIGl0J3MgZXhwbGljaXRseSByZXF1ZXN0ZWQuXG4gICAgICBpZiAobG93X3ZhbCA+IGhpZ2hfdmFsKSBzY2FsZSAqPSAtMTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPD0gblRpY2tzOyBpKyspIHtcbiAgICAgICAgdGlja1YgPSBsb3dfdmFsICsgaSAqIHNjYWxlO1xuICAgICAgICB0aWNrcy5wdXNoKCB7djogdGlja1Z9ICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGZvcm1hdHRlciA9IC8qKkB0eXBle0F4aXNMYWJlbEZvcm1hdHRlcn0qLyhvcHRzKCdheGlzTGFiZWxGb3JtYXR0ZXInKSk7XG5cbiAgLy8gQWRkIGxhYmVscyB0byB0aGUgdGlja3MuXG4gIGZvciAoaSA9IDA7IGkgPCB0aWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0aWNrc1tpXS5sYWJlbCAhPT0gdW5kZWZpbmVkKSBjb250aW51ZTsgIC8vIFVzZSBjdXJyZW50IGxhYmVsLlxuICAgIC8vIFRPRE8oZGFudmspOiBzZXQgZ3JhbnVsYXJpdHkgdG8gc29tZXRoaW5nIGFwcHJvcHJpYXRlIGhlcmUuXG4gICAgdGlja3NbaV0ubGFiZWwgPSBmb3JtYXR0ZXIuY2FsbChkeWdyYXBoLCB0aWNrc1tpXS52LCAwLCBvcHRzLCBkeWdyYXBoKTtcbiAgfVxuXG4gIHJldHVybiB0aWNrcztcbn07XG5cbi8qKiBAdHlwZSB7VGlja2VyfSAqL1xuZXhwb3J0IHZhciBpbnRlZ2VyVGlja3MgPSBmdW5jdGlvbiAoYSwgYiwgcGl4ZWxzLCBvcHRzLCBkeWdyYXBoLCB2YWxzKSB7XG4gICAgdmFyIGFsbFRpY2tzID0gbnVtZXJpY1RpY2tzKGEsIGIsIHBpeGVscywgb3B0cywgZHlncmFwaCwgdmFscyk7XG4gICAgcmV0dXJuIGFsbFRpY2tzLmZpbHRlcihmdW5jdGlvbiAodGljaykge1xuICAgICAgcmV0dXJuIHRpY2sudiAlIDEgPT09IDA7XG4gICAgfSk7XG59O1xuXG4vKiogQHR5cGUge1RpY2tlcn0gKi9cbmV4cG9ydCB2YXIgZGF0ZVRpY2tlciA9IGZ1bmN0aW9uIChhLCBiLCBwaXhlbHMsIG9wdHMsIGR5Z3JhcGgsIHZhbHMpIHtcbiAgdmFyIGNob3NlbiA9IHBpY2tEYXRlVGlja0dyYW51bGFyaXR5KGEsIGIsIHBpeGVscywgb3B0cyk7XG5cbiAgaWYgKGNob3NlbiA+PSAwKSB7XG4gICAgcmV0dXJuIGdldERhdGVBeGlzKGEsIGIsIGNob3Nlbiwgb3B0cywgZHlncmFwaCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gdGhpcyBjYW4gaGFwcGVuIGlmIHNlbGYud2lkdGhfIGlzIHplcm8uXG4gICAgcmV0dXJuIFtdO1xuICB9XG59O1xuXG4vLyBUaW1lIGdyYW51bGFyaXR5IGVudW1lcmF0aW9uXG5leHBvcnQgdmFyIEdyYW51bGFyaXR5ID0ge1xuICBNSUxMSVNFQ09ORExZOiAwLFxuICBUV09fTUlMTElTRUNPTkRMWTogMSxcbiAgRklWRV9NSUxMSVNFQ09ORExZOiAyLFxuICBURU5fTUlMTElTRUNPTkRMWTogMyxcbiAgRklGVFlfTUlMTElTRUNPTkRMWTogNCxcbiAgSFVORFJFRF9NSUxMSVNFQ09ORExZOiA1LFxuICBGSVZFX0hVTkRSRURfTUlMTElTRUNPTkRMWTogNixcbiAgU0VDT05ETFk6IDcsXG4gIFRXT19TRUNPTkRMWTogOCxcbiAgRklWRV9TRUNPTkRMWTogOSxcbiAgVEVOX1NFQ09ORExZOiAxMCxcbiAgVEhJUlRZX1NFQ09ORExZOiAxMSxcbiAgTUlOVVRFTFk6IDEyLFxuICBUV09fTUlOVVRFTFk6IDEzLFxuICBGSVZFX01JTlVURUxZOiAxNCxcbiAgVEVOX01JTlVURUxZOiAxNSxcbiAgVEhJUlRZX01JTlVURUxZOiAxNixcbiAgSE9VUkxZOiAxNyxcbiAgVFdPX0hPVVJMWTogMTgsXG4gIFNJWF9IT1VSTFk6IDE5LFxuICBEQUlMWTogMjAsXG4gIFRXT19EQUlMWTogMjEsXG4gIFdFRUtMWTogMjIsXG4gIE1PTlRITFk6IDIzLFxuICBRVUFSVEVSTFk6IDI0LFxuICBCSUFOTlVBTDogMjUsXG4gIEFOTlVBTDogMjYsXG4gIERFQ0FEQUw6IDI3LFxuICBDRU5URU5OSUFMOiAyOCxcbiAgTlVNX0dSQU5VTEFSSVRJRVM6IDI5XG59XG5cbi8vIERhdGUgY29tcG9uZW50cyBlbnVtZXJhdGlvbiAoaW4gdGhlIG9yZGVyIG9mIHRoZSBhcmd1bWVudHMgaW4gRGF0ZSlcbi8vIFRPRE86IG1ha2UgdGhpcyBhbiBAZW51bVxudmFyIERhdGVGaWVsZCA9IHtcbiAgREFURUZJRUxEX1k6IDAsXG4gIERBVEVGSUVMRF9NOiAxLFxuICBEQVRFRklFTERfRDogMixcbiAgREFURUZJRUxEX0hIOiAzLFxuICBEQVRFRklFTERfTU06IDQsXG4gIERBVEVGSUVMRF9TUzogNSxcbiAgREFURUZJRUxEX01TOiA2LFxuICBOVU1fREFURUZJRUxEUzogN1xufTtcblxuLyoqXG4gKiBUaGUgdmFsdWUgb2YgZGF0ZWZpZWxkIHdpbGwgc3RhcnQgYXQgYW4gZXZlbiBtdWx0aXBsZSBvZiBcInN0ZXBcIiwgaS5lLlxuICogICBpZiBkYXRlZmllbGQ9U1MgYW5kIHN0ZXA9NSB0aGVuIHRoZSBmaXJzdCB0aWNrIHdpbGwgYmUgb24gYSBtdWx0aXBsZSBvZiA1cy5cbiAqXG4gKiBGb3IgZ3JhbnVsYXJpdGllcyA8PSBIT1VSTFksIHRpY2tzIGFyZSBnZW5lcmF0ZWQgZXZlcnkgYHNwYWNpbmdgIG1zLlxuICpcbiAqIEF0IGNvYXJzZXIgZ3JhbnVsYXJpdGllcywgdGlja3MgYXJlIGdlbmVyYXRlZCBieSBpbmNyZW1lbnRpbmcgYGRhdGVmaWVsZGAgYnlcbiAqICAgYHN0ZXBgLiBJbiB0aGlzIGNhc2UsIHRoZSBgc3BhY2luZ2AgdmFsdWUgaXMgb25seSB1c2VkIHRvIGVzdGltYXRlIHRoZVxuICogICBudW1iZXIgb2YgdGlja3MuIEl0IHNob3VsZCByb3VnaGx5IGNvcnJlc3BvbmQgdG8gdGhlIHNwYWNpbmcgYmV0d2VlblxuICogICBhZGphY2VudCB0aWNrcy5cbiAqXG4gKiBAdHlwZSB7QXJyYXkuPHtkYXRlZmllbGQ6bnVtYmVyLCBzdGVwOm51bWJlciwgc3BhY2luZzpudW1iZXJ9Pn1cbiAqL1xudmFyIFRJQ0tfUExBQ0VNRU5UID0gW107XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5NSUxMSVNFQ09ORExZXSAgICAgICAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NUywgc3RlcDogICAxLCBzcGFjaW5nOiAxfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LlRXT19NSUxMSVNFQ09ORExZXSAgICAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX01TLCBzdGVwOiAgIDIsIHNwYWNpbmc6IDJ9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuRklWRV9NSUxMSVNFQ09ORExZXSAgICAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTVMsIHN0ZXA6ICAgNSwgc3BhY2luZzogNX07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5URU5fTUlMTElTRUNPTkRMWV0gICAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NUywgc3RlcDogIDEwLCBzcGFjaW5nOiAxMH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5GSUZUWV9NSUxMSVNFQ09ORExZXSAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NUywgc3RlcDogIDUwLCBzcGFjaW5nOiA1MH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5IVU5EUkVEX01JTExJU0VDT05ETFldICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NUywgc3RlcDogMTAwLCBzcGFjaW5nOiAxMDB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuRklWRV9IVU5EUkVEX01JTExJU0VDT05ETFldICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTVMsIHN0ZXA6IDUwMCwgc3BhY2luZzogNTAwfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LlNFQ09ORExZXSAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX1NTLCBzdGVwOiAgIDEsIHNwYWNpbmc6IDEwMDAgKiAxfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LlRXT19TRUNPTkRMWV0gICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX1NTLCBzdGVwOiAgIDIsIHNwYWNpbmc6IDEwMDAgKiAyfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LkZJVkVfU0VDT05ETFldICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX1NTLCBzdGVwOiAgIDUsIHNwYWNpbmc6IDEwMDAgKiA1fTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LlRFTl9TRUNPTkRMWV0gICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX1NTLCBzdGVwOiAgMTAsIHNwYWNpbmc6IDEwMDAgKiAxMH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5USElSVFlfU0VDT05ETFldID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9TUywgc3RlcDogIDMwLCBzcGFjaW5nOiAxMDAwICogMzB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuTUlOVVRFTFldICAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTU0sIHN0ZXA6ICAgMSwgc3BhY2luZzogMTAwMCAqIDYwfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LlRXT19NSU5VVEVMWV0gICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX01NLCBzdGVwOiAgIDIsIHNwYWNpbmc6IDEwMDAgKiA2MCAqIDJ9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuRklWRV9NSU5VVEVMWV0gICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTU0sIHN0ZXA6ICAgNSwgc3BhY2luZzogMTAwMCAqIDYwICogNX07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5URU5fTUlOVVRFTFldICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NTSwgc3RlcDogIDEwLCBzcGFjaW5nOiAxMDAwICogNjAgKiAxMH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5USElSVFlfTUlOVVRFTFldID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NTSwgc3RlcDogIDMwLCBzcGFjaW5nOiAxMDAwICogNjAgKiAzMH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5IT1VSTFldICAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9ISCwgc3RlcDogICAxLCBzcGFjaW5nOiAxMDAwICogMzYwMH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5UV09fSE9VUkxZXSAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9ISCwgc3RlcDogICAyLCBzcGFjaW5nOiAxMDAwICogMzYwMCAqIDJ9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuU0lYX0hPVVJMWV0gICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfSEgsIHN0ZXA6ICAgNiwgc3BhY2luZzogMTAwMCAqIDM2MDAgKiA2fTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LkRBSUxZXSAgICAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX0QsICBzdGVwOiAgIDEsIHNwYWNpbmc6IDEwMDAgKiA4NjQwMH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5UV09fREFJTFldICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9ELCAgc3RlcDogICAyLCBzcGFjaW5nOiAxMDAwICogODY0MDAgKiAyfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LldFRUtMWV0gICAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX0QsICBzdGVwOiAgIDcsIHNwYWNpbmc6IDEwMDAgKiA2MDQ4MDB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuTU9OVEhMWV0gICAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTSwgIHN0ZXA6ICAgMSwgc3BhY2luZzogMTAwMCAqIDcyMDAgICogMzY1LjI0MjV9OyAvLyAxZTMgKiA2MCAqIDYwICogMjQgKiAzNjUuMjQyNSAvIDEyXG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5RVUFSVEVSTFldICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NLCAgc3RlcDogICAzLCBzcGFjaW5nOiAxMDAwICogMjE2MDAgKiAzNjUuMjQyNX07IC8vIDFlMyAqIDYwICogNjAgKiAyNCAqIDM2NS4yNDI1IC8gNFxuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuQklBTk5VQUxdICAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTSwgIHN0ZXA6ICAgNiwgc3BhY2luZzogMTAwMCAqIDQzMjAwICogMzY1LjI0MjV9OyAvLyAxZTMgKiA2MCAqIDYwICogMjQgKiAzNjUuMjQyNSAvIDJcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LkFOTlVBTF0gICAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX1ksICBzdGVwOiAgIDEsIHNwYWNpbmc6IDEwMDAgKiA4NjQwMCAgICogMzY1LjI0MjV9OyAvLyAxZTMgKiA2MCAqIDYwICogMjQgKiAzNjUuMjQyNSAqIDFcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LkRFQ0FEQUxdICAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX1ksICBzdGVwOiAgMTAsIHNwYWNpbmc6IDEwMDAgKiA4NjQwMDAgICogMzY1LjI0MjV9OyAvLyAxZTMgKiA2MCAqIDYwICogMjQgKiAzNjUuMjQyNSAqIDEwXG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5DRU5URU5OSUFMXSAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9ZLCAgc3RlcDogMTAwLCBzcGFjaW5nOiAxMDAwICogODY0MDAwMCAqIDM2NS4yNDI1fTsgLy8gMWUzICogNjAgKiA2MCAqIDI0ICogMzY1LjI0MjUgKiAxMDBcblxuLyoqXG4gKiBUaGlzIGlzIGEgbGlzdCBvZiBodW1hbi1mcmllbmRseSB2YWx1ZXMgYXQgd2hpY2ggdG8gc2hvdyB0aWNrIG1hcmtzIG9uIGEgbG9nXG4gKiBzY2FsZS4gSXQgaXMgayAqIDEwXm4sIHdoZXJlIGs9MS4uOSBhbmQgbj0tMzkuLiszOSwgc286XG4gKiAuLi4sIDEsIDIsIDMsIDQsIDUsIC4uLiwgOSwgMTAsIDIwLCAzMCwgLi4uLCA5MCwgMTAwLCAyMDAsIDMwMCwgLi4uXG4gKiBOT1RFOiB0aGlzIGFzc3VtZXMgdGhhdCB1dGlscy5MT0dfU0NBTEUgPSAxMC5cbiAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAqL1xudmFyIFBSRUZFUlJFRF9MT0dfVElDS19WQUxVRVMgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgdmFscyA9IFtdO1xuICBmb3IgKHZhciBwb3dlciA9IC0zOTsgcG93ZXIgPD0gMzk7IHBvd2VyKyspIHtcbiAgICB2YXIgcmFuZ2UgPSBNYXRoLnBvdygxMCwgcG93ZXIpO1xuICAgIGZvciAodmFyIG11bHQgPSAxOyBtdWx0IDw9IDk7IG11bHQrKykge1xuICAgICAgdmFyIHZhbCA9IHJhbmdlICogbXVsdDtcbiAgICAgIHZhbHMucHVzaCh2YWwpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFscztcbn0pKCk7XG5cbi8qKlxuICogRGV0ZXJtaW5lIHRoZSBjb3JyZWN0IGdyYW51bGFyaXR5IG9mIHRpY2tzIG9uIGEgZGF0ZSBheGlzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBhIExlZnQgZWRnZSBvZiB0aGUgY2hhcnQgKG1zKVxuICogQHBhcmFtIHtudW1iZXJ9IGIgUmlnaHQgZWRnZSBvZiB0aGUgY2hhcnQgKG1zKVxuICogQHBhcmFtIHtudW1iZXJ9IHBpeGVscyBTaXplIG9mIHRoZSBjaGFydCBpbiB0aGUgcmVsZXZhbnQgZGltZW5zaW9uICh3aWR0aCkuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZyk6Kn0gb3B0cyBGdW5jdGlvbiBtYXBwaW5nIGZyb20gb3B0aW9uIG5hbWUgLSZndDsgdmFsdWUuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBhcHByb3ByaWF0ZSBheGlzIGdyYW51bGFyaXR5IGZvciB0aGlzIGNoYXJ0LiBTZWUgdGhlXG4gKiAgICAgZW51bWVyYXRpb24gb2YgcG9zc2libGUgdmFsdWVzIGluIGR5Z3JhcGgtdGlja2Vycy5qcy5cbiAqL1xuZXhwb3J0IHZhciBwaWNrRGF0ZVRpY2tHcmFudWxhcml0eSA9IGZ1bmN0aW9uIChhLCBiLCBwaXhlbHMsIG9wdHMpIHtcbiAgdmFyIHBpeGVsc19wZXJfdGljayA9IC8qKiBAdHlwZXtudW1iZXJ9ICovKG9wdHMoJ3BpeGVsc1BlckxhYmVsJykpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IEdyYW51bGFyaXR5Lk5VTV9HUkFOVUxBUklUSUVTOyBpKyspIHtcbiAgICB2YXIgbnVtX3RpY2tzID0gbnVtRGF0ZVRpY2tzKGEsIGIsIGkpO1xuICAgIGlmIChwaXhlbHMgLyBudW1fdGlja3MgPj0gcGl4ZWxzX3Blcl90aWNrKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBudW1iZXIgb2YgdGlja3Mgb24gYSBkYXRlIGF4aXMgZm9yIGEgZ2l2ZW4gZ3JhbnVsYXJpdHkuXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnRfdGltZVxuICogQHBhcmFtIHtudW1iZXJ9IGVuZF90aW1lXG4gKiBAcGFyYW0ge251bWJlcn0gZ3JhbnVsYXJpdHkgKG9uZSBvZiB0aGUgZ3JhbnVsYXJpdGllcyBlbnVtZXJhdGVkIGFib3ZlKVxuICogQHJldHVybiB7bnVtYmVyfSAoQXBwcm94aW1hdGUpIG51bWJlciBvZiB0aWNrcyB0aGF0IHdvdWxkIHJlc3VsdC5cbiAqL1xudmFyIG51bURhdGVUaWNrcyA9IGZ1bmN0aW9uIChzdGFydF90aW1lLCBlbmRfdGltZSwgZ3JhbnVsYXJpdHkpIHtcbiAgdmFyIHNwYWNpbmcgPSBUSUNLX1BMQUNFTUVOVFtncmFudWxhcml0eV0uc3BhY2luZztcbiAgcmV0dXJuIE1hdGgucm91bmQoMS4wICogKGVuZF90aW1lIC0gc3RhcnRfdGltZSkgLyBzcGFjaW5nKTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgcG9zaXRpb25zIGFuZCBsYWJlbHMgb2YgdGlja3Mgb24gYSBkYXRlIGF4aXMgZm9yIGEgZ2l2ZW4gZ3JhbnVsYXJpdHkuXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnRfdGltZVxuICogQHBhcmFtIHtudW1iZXJ9IGVuZF90aW1lXG4gKiBAcGFyYW0ge251bWJlcn0gZ3JhbnVsYXJpdHkgKG9uZSBvZiB0aGUgZ3JhbnVsYXJpdGllcyBlbnVtZXJhdGVkIGFib3ZlKVxuICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcpOip9IG9wdHMgRnVuY3Rpb24gbWFwcGluZyBmcm9tIG9wdGlvbiBuYW1lIC0mZ3Q7IHZhbHVlLlxuICogQHBhcmFtIHtEeWdyYXBoPX0gZGdcbiAqIEByZXR1cm4geyFUaWNrTGlzdH1cbiAqL1xuZXhwb3J0IHZhciBnZXREYXRlQXhpcyA9IGZ1bmN0aW9uIChzdGFydF90aW1lLCBlbmRfdGltZSwgZ3JhbnVsYXJpdHksIG9wdHMsIGRnKSB7XG4gIHZhciBmb3JtYXR0ZXIgPSAvKiogQHR5cGV7QXhpc0xhYmVsRm9ybWF0dGVyfSAqLyhcbiAgICAgIG9wdHMoXCJheGlzTGFiZWxGb3JtYXR0ZXJcIikpO1xuICB2YXIgdXRjID0gb3B0cyhcImxhYmVsc1VUQ1wiKTtcbiAgdmFyIGFjY2Vzc29ycyA9IHV0YyA/IHV0aWxzLkRhdGVBY2Nlc3NvcnNVVEMgOiB1dGlscy5EYXRlQWNjZXNzb3JzTG9jYWw7XG5cbiAgdmFyIGRhdGVmaWVsZCA9IFRJQ0tfUExBQ0VNRU5UW2dyYW51bGFyaXR5XS5kYXRlZmllbGQ7XG4gIHZhciBzdGVwID0gVElDS19QTEFDRU1FTlRbZ3JhbnVsYXJpdHldLnN0ZXA7XG4gIHZhciBzcGFjaW5nID0gVElDS19QTEFDRU1FTlRbZ3JhbnVsYXJpdHldLnNwYWNpbmc7XG5cbiAgLy8gQ2hvb3NlIGEgbmljZSB0aWNrIHBvc2l0aW9uIGJlZm9yZSB0aGUgaW5pdGlhbCBpbnN0YW50LlxuICAvLyBDdXJyZW50bHksIHRoaXMgY29kZSBkZWFscyBwcm9wZXJseSB3aXRoIHRoZSBleGlzdGVudCBkYWlseSBncmFudWxhcml0aWVzOlxuICAvLyBEQUlMWSAod2l0aCBzdGVwIG9mIDEpIGFuZCBXRUVLTFkgKHdpdGggc3RlcCBvZiA3IGJ1dCBzcGVjaWFsbHkgaGFuZGxlZCkuXG4gIC8vIE90aGVyIGRhaWx5IGdyYW51bGFyaXRpZXMgKHNheSBUV09fREFJTFkpIHNob3VsZCBhbHNvIGJlIGhhbmRsZWQgc3BlY2lhbGx5XG4gIC8vIGJ5IHNldHRpbmcgdGhlIHN0YXJ0X2RhdGVfb2Zmc2V0IHRvIDAuXG4gIHZhciBzdGFydF9kYXRlID0gbmV3IERhdGUoc3RhcnRfdGltZSk7XG4gIHZhciBkYXRlX2FycmF5ID0gW107XG4gIGRhdGVfYXJyYXlbRGF0ZUZpZWxkLkRBVEVGSUVMRF9ZXSAgPSBhY2Nlc3NvcnMuZ2V0RnVsbFllYXIoc3RhcnRfZGF0ZSk7XG4gIGRhdGVfYXJyYXlbRGF0ZUZpZWxkLkRBVEVGSUVMRF9NXSAgPSBhY2Nlc3NvcnMuZ2V0TW9udGgoc3RhcnRfZGF0ZSk7XG4gIGRhdGVfYXJyYXlbRGF0ZUZpZWxkLkRBVEVGSUVMRF9EXSAgPSBhY2Nlc3NvcnMuZ2V0RGF0ZShzdGFydF9kYXRlKTtcbiAgZGF0ZV9hcnJheVtEYXRlRmllbGQuREFURUZJRUxEX0hIXSA9IGFjY2Vzc29ycy5nZXRIb3VycyhzdGFydF9kYXRlKTtcbiAgZGF0ZV9hcnJheVtEYXRlRmllbGQuREFURUZJRUxEX01NXSA9IGFjY2Vzc29ycy5nZXRNaW51dGVzKHN0YXJ0X2RhdGUpO1xuICBkYXRlX2FycmF5W0RhdGVGaWVsZC5EQVRFRklFTERfU1NdID0gYWNjZXNzb3JzLmdldFNlY29uZHMoc3RhcnRfZGF0ZSk7XG4gIGRhdGVfYXJyYXlbRGF0ZUZpZWxkLkRBVEVGSUVMRF9NU10gPSBhY2Nlc3NvcnMuZ2V0TWlsbGlzZWNvbmRzKHN0YXJ0X2RhdGUpO1xuXG4gIHZhciBzdGFydF9kYXRlX29mZnNldCA9IGRhdGVfYXJyYXlbZGF0ZWZpZWxkXSAlIHN0ZXA7XG4gIGlmIChncmFudWxhcml0eSA9PSBHcmFudWxhcml0eS5XRUVLTFkpIHtcbiAgICAvLyBUaGlzIHdpbGwgcHV0IHRoZSB0aWNrcyBvbiBTdW5kYXlzLlxuICAgIHN0YXJ0X2RhdGVfb2Zmc2V0ID0gYWNjZXNzb3JzLmdldERheShzdGFydF9kYXRlKTtcbiAgfVxuXG4gIGRhdGVfYXJyYXlbZGF0ZWZpZWxkXSAtPSBzdGFydF9kYXRlX29mZnNldDtcbiAgZm9yICh2YXIgZGYgPSBkYXRlZmllbGQgKyAxOyBkZiA8IERhdGVGaWVsZC5OVU1fREFURUZJRUxEUzsgZGYrKykge1xuICAgIC8vIFRoZSBtaW5pbXVtIHZhbHVlIGlzIDEgZm9yIHRoZSBkYXkgb2YgbW9udGgsIGFuZCAwIGZvciBhbGwgb3RoZXIgZmllbGRzLlxuICAgIGRhdGVfYXJyYXlbZGZdID0gKGRmID09PSBEYXRlRmllbGQuREFURUZJRUxEX0QpID8gMSA6IDA7XG4gIH1cblxuICAvLyBHZW5lcmF0ZSB0aGUgdGlja3MuXG4gIC8vIEZvciBncmFudWxhcml0aWVzIG5vdCBjb2Fyc2VyIHRoYW4gSE9VUkxZIHdlIHVzZSB0aGUgZmFjdCB0aGF0OlxuICAvLyAgIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGJldHdlZW4gdGlja3MgaXMgY29uc3RhbnRcbiAgLy8gICBhbmQgZXF1YWwgdG8gdGhlIGRlZmluZWQgc3BhY2luZy5cbiAgLy8gT3RoZXJ3aXNlIHdlIHJlbHkgb24gdGhlICdyb2xsIG92ZXInIHByb3BlcnR5IG9mIHRoZSBEYXRlIGZ1bmN0aW9uczpcbiAgLy8gICB3aGVuIHNvbWUgZGF0ZSBmaWVsZCBpcyBzZXQgdG8gYSB2YWx1ZSBvdXRzaWRlIG9mIGl0cyBsb2dpY2FsIHJhbmdlLFxuICAvLyAgIHRoZSBleGNlc3MgJ3JvbGxzIG92ZXInIHRoZSBuZXh0IChtb3JlIHNpZ25pZmljYW50KSBmaWVsZC5cbiAgLy8gSG93ZXZlciwgd2hlbiB1c2luZyBsb2NhbCB0aW1lIHdpdGggRFNUIHRyYW5zaXRpb25zLFxuICAvLyB0aGVyZSBhcmUgZGF0ZXMgdGhhdCBkbyBub3QgcmVwcmVzZW50IGFueSB0aW1lIHZhbHVlIGF0IGFsbFxuICAvLyAodGhvc2UgaW4gdGhlIGhvdXIgc2tpcHBlZCBhdCB0aGUgJ3NwcmluZyBmb3J3YXJkJyksXG4gIC8vIGFuZCB0aGUgSmF2YVNjcmlwdCBlbmdpbmVzIHVzdWFsbHkgcmV0dXJuIGFuIGVxdWl2YWxlbnQgdmFsdWUuXG4gIC8vIEhlbmNlIHdlIGhhdmUgdG8gY2hlY2sgdGhhdCB0aGUgZGF0ZSBpcyBwcm9wZXJseSBpbmNyZWFzZWQgYXQgZWFjaCBzdGVwLFxuICAvLyByZXR1cm5pbmcgYSBkYXRlIGF0IGEgbmljZSB0aWNrIHBvc2l0aW9uLlxuICB2YXIgdGlja3MgPSBbXTtcbiAgdmFyIHRpY2tfZGF0ZSA9IGFjY2Vzc29ycy5tYWtlRGF0ZS5hcHBseShudWxsLCBkYXRlX2FycmF5KTtcbiAgdmFyIHRpY2tfdGltZSA9IHRpY2tfZGF0ZS5nZXRUaW1lKCk7XG4gIGlmIChncmFudWxhcml0eSA8PSBHcmFudWxhcml0eS5IT1VSTFkpIHtcbiAgICBpZiAodGlja190aW1lIDwgc3RhcnRfdGltZSkge1xuICAgICAgdGlja190aW1lICs9IHNwYWNpbmc7XG4gICAgICB0aWNrX2RhdGUgPSBuZXcgRGF0ZSh0aWNrX3RpbWUpO1xuICAgIH1cbiAgICB3aGlsZSAodGlja190aW1lIDw9IGVuZF90aW1lKSB7XG4gICAgICB0aWNrcy5wdXNoKHsgdjogdGlja190aW1lLFxuICAgICAgICAgICAgICAgICAgIGxhYmVsOiBmb3JtYXR0ZXIuY2FsbChkZywgdGlja19kYXRlLCBncmFudWxhcml0eSwgb3B0cywgZGcpXG4gICAgICAgICAgICAgICAgIH0pO1xuICAgICAgdGlja190aW1lICs9IHNwYWNpbmc7XG4gICAgICB0aWNrX2RhdGUgPSBuZXcgRGF0ZSh0aWNrX3RpbWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAodGlja190aW1lIDwgc3RhcnRfdGltZSkge1xuICAgICAgZGF0ZV9hcnJheVtkYXRlZmllbGRdICs9IHN0ZXA7XG4gICAgICB0aWNrX2RhdGUgPSBhY2Nlc3NvcnMubWFrZURhdGUuYXBwbHkobnVsbCwgZGF0ZV9hcnJheSk7XG4gICAgICB0aWNrX3RpbWUgPSB0aWNrX2RhdGUuZ2V0VGltZSgpO1xuICAgIH1cbiAgICB3aGlsZSAodGlja190aW1lIDw9IGVuZF90aW1lKSB7XG4gICAgICBpZiAoZ3JhbnVsYXJpdHkgPj0gR3JhbnVsYXJpdHkuREFJTFkgfHxcbiAgICAgICAgICBhY2Nlc3NvcnMuZ2V0SG91cnModGlja19kYXRlKSAlIHN0ZXAgPT09IDApIHtcbiAgICAgICAgdGlja3MucHVzaCh7IHY6IHRpY2tfdGltZSxcbiAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBmb3JtYXR0ZXIuY2FsbChkZywgdGlja19kYXRlLCBncmFudWxhcml0eSwgb3B0cywgZGcpXG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBkYXRlX2FycmF5W2RhdGVmaWVsZF0gKz0gc3RlcDtcbiAgICAgIHRpY2tfZGF0ZSA9IGFjY2Vzc29ycy5tYWtlRGF0ZS5hcHBseShudWxsLCBkYXRlX2FycmF5KTtcbiAgICAgIHRpY2tfdGltZSA9IHRpY2tfZGF0ZS5nZXRUaW1lKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aWNrcztcbn07XG4iXSwibWFwcGluZ3Mi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