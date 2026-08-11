'use strict';

/**
 * @license
 * Copyright 2013 David Eberlein (david.eberlein@ch.sauter-bc.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */

/**
 * @fileoverview This file contains the managment of data handlers
 * @author David Eberlein (david.eberlein@ch.sauter-bc.com)
 *
 * The idea is to define a common, generic data format that works for all data
 * structures supported by dygraphs. To make this possible, the DataHandler
 * interface is introduced. This makes it possible, that dygraph itself can work
 * with the same logic for every data type independent of the actual format and
 * the DataHandler takes care of the data format specific jobs.
 * DataHandlers are implemented for all data types supported by Dygraphs and
 * return Dygraphs compliant formats.
 * By default the correct DataHandler is chosen based on the options set.
 * Optionally the user may use his own DataHandler (similar to the plugin
 * system).
 *
 *
 * The unified data format returend by each handler is defined as so:
 * series[n][point] = [x,y,(extras)]
 *
 * This format contains the common basis that is needed to draw a simple line
 * series extended by optional extras for more complex graphing types. It
 * contains a primitive x value as first array entry, a primitive y value as
 * second array entry and an optional extras object for additional data needed.
 *
 * x must always be a number.
 * y must always be a number, NaN of type number or null.
 * extras is optional and must be interpreted by the DataHandler. It may be of
 * any type.
 *
 * In practice this might look something like this:
 * default: [x, yVal]
 * errorBar / customBar: [x, yVal, [yTopVariance, yBottomVariance] ]
 *
 */
/*global Dygraph:false */
/*global DygraphLayout:false */

/**
 *
 * The data handler is responsible for all data specific operations. All of the
 * series data it receives and returns is always in the unified data format.
 * Initially the unified data is created by the extractSeries method
 * @constructor
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var DygraphDataHandler = function DygraphDataHandler() {};
var handler = DygraphDataHandler;

/**
 * X-value array index constant for unified data samples.
 * @const
 * @type {number}
 */
handler.X = 0;

/**
 * Y-value array index constant for unified data samples.
 * @const
 * @type {number}
 */
handler.Y = 1;

/**
 * Extras-value array index constant for unified data samples.
 * @const
 * @type {number}
 */
handler.EXTRAS = 2;

/**
 * Extracts one series from the raw data (a 2D array) into an array of the
 * unified data format.
 * This is where undesirable points (i.e. negative values on log scales and
 * missing values through which we wish to connect lines) are dropped.
 * TODO(danvk): the "missing values" bit above doesn't seem right.
 *
 * @param {!Array.<Array>} rawData The raw data passed into dygraphs where
 *     rawData[i] = [x,ySeries1,...,ySeriesN].
 * @param {!number} seriesIndex Index of the series to extract. All other
 *     series should be ignored.
 * @param {!DygraphOptions} options Dygraph options.
 * @return {Array.<[!number,?number,?]>} The series in the unified data format
 *     where series[i] = [x,y,{extras}].
 */
handler.prototype.extractSeries = function (rawData, seriesIndex, options) {};

/**
 * Converts a series to a Point array.  The resulting point array must be
 * returned in increasing order of idx property.
 *
 * @param {!Array.<[!number,?number,?]>} series The series in the unified
 *          data format where series[i] = [x,y,{extras}].
 * @param {!string} setName Name of the series.
 * @param {!number} boundaryIdStart Index offset of the first point, equal to the
 *          number of skipped points left of the date window minimum (if any).
 * @return {!Array.<Dygraph.PointType>} List of points for this series.
 */
handler.prototype.seriesToPoints = function (series, setName, boundaryIdStart) {
  // TODO(bhs): these loops are a hot-spot for high-point-count charts. In
  // fact,
  // on chrome+linux, they are 6 times more expensive than iterating through
  // the
  // points and drawing the lines. The brunt of the cost comes from allocating
  // the |point| structures.
  var points = [];
  for (var i = 0; i < series.length; ++i) {
    var item = series[i];
    var yraw = item[1];
    var yval = yraw === null ? null : handler.parseFloat(yraw);
    var point = {
      x: NaN,
      y: NaN,
      xval: handler.parseFloat(item[0]),
      yval: yval,
      name: setName,
      // TODO(danvk): is this really necessary?
      idx: i + boundaryIdStart,
      canvasx: NaN,
      // add these so we do not alter the structure later, which slows Chrome
      canvasy: NaN
    };
    points.push(point);
  }
  this.onPointsCreated_(series, points);
  return points;
};

/**
 * Callback called for each series after the series points have been generated
 * which will later be used by the plotters to draw the graph.
 * Here data may be added to the seriesPoints which is needed by the plotters.
 * The indexes of series and points are in sync meaning the original data
 * sample for series[i] is points[i].
 *
 * @param {!Array.<[!number,?number,?]>} series The series in the unified
 *     data format where series[i] = [x,y,{extras}].
 * @param {!Array.<Dygraph.PointType>} points The corresponding points passed
 *     to the plotter.
 * @protected
 */
handler.prototype.onPointsCreated_ = function (series, points) {};

/**
 * Calculates the rolling average of a data set.
 *
 * @param {!Array.<[!number,?number,?]>} series The series in the unified
 *          data format where series[i] = [x,y,{extras}].
 * @param {!number} rollPeriod The number of points over which to average the data
 * @param {!DygraphOptions} options The dygraph options.
 * @param {!number} seriesIndex Index of the series this was extracted from.
 * @return {!Array.<[!number,?number,?]>} the rolled series.
 */
handler.prototype.rollingAverage = function (series, rollPeriod, options, seriesIndex) {};

/**
 * Computes the range of the data series (including confidence intervals).
 *
 * @param {!Array.<[!number,?number,?]>} series The series in the unified
 *     data format where series[i] = [x, y, {extras}].
 * @param {!Array.<number>} dateWindow The x-value range to display with
 *     the format: [min, max].
 * @param {boolean} stepPlot Whether the stepPlot option is set.
 * @return {Array.<number>} The low and high extremes of the series in the
 *     given window with the format: [low, high].
 */
handler.prototype.getExtremeYValues = function (series, dateWindow, stepPlot) {};

/**
 * Callback called for each series after the layouting data has been
 * calculated before the series is drawn. Here normalized positioning data
 * should be calculated for the extras of each point.
 *
 * @param {!Array.<Dygraph.PointType>} points The points passed to
 *          the plotter.
 * @param {!Object} axis The axis on which the series will be plotted.
 * @param {!boolean} logscale Whether or not to use a logscale.
 */
handler.prototype.onLineEvaluated = function (points, axis, logscale) {};

/**
 * Optimized replacement for parseFloat, which was way too slow when almost
 * all values were type number, with few edge cases, none of which were strings.
 * @param {?number} val
 * @return {number}
 * @protected
 */
handler.parseFloat = function (val) {
  // parseFloat(null) is NaN
  if (val === null) {
    return NaN;
  }

  // Assume it's a number or NaN. If it's something else, I'll be shocked.
  return val;
};
var _default = exports["default"] = DygraphDataHandler;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsIkR5Z3JhcGhEYXRhSGFuZGxlciIsImhhbmRsZXIiLCJYIiwiWSIsIkVYVFJBUyIsInByb3RvdHlwZSIsImV4dHJhY3RTZXJpZXMiLCJyYXdEYXRhIiwic2VyaWVzSW5kZXgiLCJvcHRpb25zIiwic2VyaWVzVG9Qb2ludHMiLCJzZXJpZXMiLCJzZXROYW1lIiwiYm91bmRhcnlJZFN0YXJ0IiwicG9pbnRzIiwiaSIsImxlbmd0aCIsIml0ZW0iLCJ5cmF3IiwieXZhbCIsInBhcnNlRmxvYXQiLCJwb2ludCIsIngiLCJOYU4iLCJ5IiwieHZhbCIsIm5hbWUiLCJpZHgiLCJjYW52YXN4IiwiY2FudmFzeSIsInB1c2giLCJvblBvaW50c0NyZWF0ZWRfIiwicm9sbGluZ0F2ZXJhZ2UiLCJyb2xsUGVyaW9kIiwiZ2V0RXh0cmVtZVlWYWx1ZXMiLCJkYXRlV2luZG93Iiwic3RlcFBsb3QiLCJvbkxpbmVFdmFsdWF0ZWQiLCJheGlzIiwibG9nc2NhbGUiLCJ2YWwiLCJfZGVmYXVsdCIsIm1vZHVsZSIsImRlZmF1bHQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvZGF0YWhhbmRsZXIvZGF0YWhhbmRsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxMyBEYXZpZCBFYmVybGVpbiAoZGF2aWQuZWJlcmxlaW5AY2guc2F1dGVyLWJjLmNvbSlcbiAqIE1JVC1saWNlbmNlZDogaHR0cHM6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlL01JVFxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGZpbGUgY29udGFpbnMgdGhlIG1hbmFnbWVudCBvZiBkYXRhIGhhbmRsZXJzXG4gKiBAYXV0aG9yIERhdmlkIEViZXJsZWluIChkYXZpZC5lYmVybGVpbkBjaC5zYXV0ZXItYmMuY29tKVxuICpcbiAqIFRoZSBpZGVhIGlzIHRvIGRlZmluZSBhIGNvbW1vbiwgZ2VuZXJpYyBkYXRhIGZvcm1hdCB0aGF0IHdvcmtzIGZvciBhbGwgZGF0YVxuICogc3RydWN0dXJlcyBzdXBwb3J0ZWQgYnkgZHlncmFwaHMuIFRvIG1ha2UgdGhpcyBwb3NzaWJsZSwgdGhlIERhdGFIYW5kbGVyXG4gKiBpbnRlcmZhY2UgaXMgaW50cm9kdWNlZC4gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSwgdGhhdCBkeWdyYXBoIGl0c2VsZiBjYW4gd29ya1xuICogd2l0aCB0aGUgc2FtZSBsb2dpYyBmb3IgZXZlcnkgZGF0YSB0eXBlIGluZGVwZW5kZW50IG9mIHRoZSBhY3R1YWwgZm9ybWF0IGFuZFxuICogdGhlIERhdGFIYW5kbGVyIHRha2VzIGNhcmUgb2YgdGhlIGRhdGEgZm9ybWF0IHNwZWNpZmljIGpvYnMuXG4gKiBEYXRhSGFuZGxlcnMgYXJlIGltcGxlbWVudGVkIGZvciBhbGwgZGF0YSB0eXBlcyBzdXBwb3J0ZWQgYnkgRHlncmFwaHMgYW5kXG4gKiByZXR1cm4gRHlncmFwaHMgY29tcGxpYW50IGZvcm1hdHMuXG4gKiBCeSBkZWZhdWx0IHRoZSBjb3JyZWN0IERhdGFIYW5kbGVyIGlzIGNob3NlbiBiYXNlZCBvbiB0aGUgb3B0aW9ucyBzZXQuXG4gKiBPcHRpb25hbGx5IHRoZSB1c2VyIG1heSB1c2UgaGlzIG93biBEYXRhSGFuZGxlciAoc2ltaWxhciB0byB0aGUgcGx1Z2luXG4gKiBzeXN0ZW0pLlxuICpcbiAqXG4gKiBUaGUgdW5pZmllZCBkYXRhIGZvcm1hdCByZXR1cmVuZCBieSBlYWNoIGhhbmRsZXIgaXMgZGVmaW5lZCBhcyBzbzpcbiAqIHNlcmllc1tuXVtwb2ludF0gPSBbeCx5LChleHRyYXMpXVxuICpcbiAqIFRoaXMgZm9ybWF0IGNvbnRhaW5zIHRoZSBjb21tb24gYmFzaXMgdGhhdCBpcyBuZWVkZWQgdG8gZHJhdyBhIHNpbXBsZSBsaW5lXG4gKiBzZXJpZXMgZXh0ZW5kZWQgYnkgb3B0aW9uYWwgZXh0cmFzIGZvciBtb3JlIGNvbXBsZXggZ3JhcGhpbmcgdHlwZXMuIEl0XG4gKiBjb250YWlucyBhIHByaW1pdGl2ZSB4IHZhbHVlIGFzIGZpcnN0IGFycmF5IGVudHJ5LCBhIHByaW1pdGl2ZSB5IHZhbHVlIGFzXG4gKiBzZWNvbmQgYXJyYXkgZW50cnkgYW5kIGFuIG9wdGlvbmFsIGV4dHJhcyBvYmplY3QgZm9yIGFkZGl0aW9uYWwgZGF0YSBuZWVkZWQuXG4gKlxuICogeCBtdXN0IGFsd2F5cyBiZSBhIG51bWJlci5cbiAqIHkgbXVzdCBhbHdheXMgYmUgYSBudW1iZXIsIE5hTiBvZiB0eXBlIG51bWJlciBvciBudWxsLlxuICogZXh0cmFzIGlzIG9wdGlvbmFsIGFuZCBtdXN0IGJlIGludGVycHJldGVkIGJ5IHRoZSBEYXRhSGFuZGxlci4gSXQgbWF5IGJlIG9mXG4gKiBhbnkgdHlwZS5cbiAqXG4gKiBJbiBwcmFjdGljZSB0aGlzIG1pZ2h0IGxvb2sgc29tZXRoaW5nIGxpa2UgdGhpczpcbiAqIGRlZmF1bHQ6IFt4LCB5VmFsXVxuICogZXJyb3JCYXIgLyBjdXN0b21CYXI6IFt4LCB5VmFsLCBbeVRvcFZhcmlhbmNlLCB5Qm90dG9tVmFyaWFuY2VdIF1cbiAqXG4gKi9cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cbi8qZ2xvYmFsIER5Z3JhcGhMYXlvdXQ6ZmFsc2UgKi9cblxuLyoqXG4gKlxuICogVGhlIGRhdGEgaGFuZGxlciBpcyByZXNwb25zaWJsZSBmb3IgYWxsIGRhdGEgc3BlY2lmaWMgb3BlcmF0aW9ucy4gQWxsIG9mIHRoZVxuICogc2VyaWVzIGRhdGEgaXQgcmVjZWl2ZXMgYW5kIHJldHVybnMgaXMgYWx3YXlzIGluIHRoZSB1bmlmaWVkIGRhdGEgZm9ybWF0LlxuICogSW5pdGlhbGx5IHRoZSB1bmlmaWVkIGRhdGEgaXMgY3JlYXRlZCBieSB0aGUgZXh0cmFjdFNlcmllcyBtZXRob2RcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgRHlncmFwaERhdGFIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xufTtcblxudmFyIGhhbmRsZXIgPSBEeWdyYXBoRGF0YUhhbmRsZXI7XG5cbi8qKlxuICogWC12YWx1ZSBhcnJheSBpbmRleCBjb25zdGFudCBmb3IgdW5pZmllZCBkYXRhIHNhbXBsZXMuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmhhbmRsZXIuWCA9IDA7XG5cbi8qKlxuICogWS12YWx1ZSBhcnJheSBpbmRleCBjb25zdGFudCBmb3IgdW5pZmllZCBkYXRhIHNhbXBsZXMuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmhhbmRsZXIuWSA9IDE7XG5cbi8qKlxuICogRXh0cmFzLXZhbHVlIGFycmF5IGluZGV4IGNvbnN0YW50IGZvciB1bmlmaWVkIGRhdGEgc2FtcGxlcy5cbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuaGFuZGxlci5FWFRSQVMgPSAyO1xuXG4vKipcbiAqIEV4dHJhY3RzIG9uZSBzZXJpZXMgZnJvbSB0aGUgcmF3IGRhdGEgKGEgMkQgYXJyYXkpIGludG8gYW4gYXJyYXkgb2YgdGhlXG4gKiB1bmlmaWVkIGRhdGEgZm9ybWF0LlxuICogVGhpcyBpcyB3aGVyZSB1bmRlc2lyYWJsZSBwb2ludHMgKGkuZS4gbmVnYXRpdmUgdmFsdWVzIG9uIGxvZyBzY2FsZXMgYW5kXG4gKiBtaXNzaW5nIHZhbHVlcyB0aHJvdWdoIHdoaWNoIHdlIHdpc2ggdG8gY29ubmVjdCBsaW5lcykgYXJlIGRyb3BwZWQuXG4gKiBUT0RPKGRhbnZrKTogdGhlIFwibWlzc2luZyB2YWx1ZXNcIiBiaXQgYWJvdmUgZG9lc24ndCBzZWVtIHJpZ2h0LlxuICpcbiAqIEBwYXJhbSB7IUFycmF5LjxBcnJheT59IHJhd0RhdGEgVGhlIHJhdyBkYXRhIHBhc3NlZCBpbnRvIGR5Z3JhcGhzIHdoZXJlXG4gKiAgICAgcmF3RGF0YVtpXSA9IFt4LHlTZXJpZXMxLC4uLix5U2VyaWVzTl0uXG4gKiBAcGFyYW0geyFudW1iZXJ9IHNlcmllc0luZGV4IEluZGV4IG9mIHRoZSBzZXJpZXMgdG8gZXh0cmFjdC4gQWxsIG90aGVyXG4gKiAgICAgc2VyaWVzIHNob3VsZCBiZSBpZ25vcmVkLlxuICogQHBhcmFtIHshRHlncmFwaE9wdGlvbnN9IG9wdGlvbnMgRHlncmFwaCBvcHRpb25zLlxuICogQHJldHVybiB7QXJyYXkuPFshbnVtYmVyLD9udW1iZXIsP10+fSBUaGUgc2VyaWVzIGluIHRoZSB1bmlmaWVkIGRhdGEgZm9ybWF0XG4gKiAgICAgd2hlcmUgc2VyaWVzW2ldID0gW3gseSx7ZXh0cmFzfV0uXG4gKi9cbmhhbmRsZXIucHJvdG90eXBlLmV4dHJhY3RTZXJpZXMgPSBmdW5jdGlvbihyYXdEYXRhLCBzZXJpZXNJbmRleCwgb3B0aW9ucykge1xufTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIHNlcmllcyB0byBhIFBvaW50IGFycmF5LiAgVGhlIHJlc3VsdGluZyBwb2ludCBhcnJheSBtdXN0IGJlXG4gKiByZXR1cm5lZCBpbiBpbmNyZWFzaW5nIG9yZGVyIG9mIGlkeCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0geyFBcnJheS48WyFudW1iZXIsP251bWJlciw/XT59IHNlcmllcyBUaGUgc2VyaWVzIGluIHRoZSB1bmlmaWVkXG4gKiAgICAgICAgICBkYXRhIGZvcm1hdCB3aGVyZSBzZXJpZXNbaV0gPSBbeCx5LHtleHRyYXN9XS5cbiAqIEBwYXJhbSB7IXN0cmluZ30gc2V0TmFtZSBOYW1lIG9mIHRoZSBzZXJpZXMuXG4gKiBAcGFyYW0geyFudW1iZXJ9IGJvdW5kYXJ5SWRTdGFydCBJbmRleCBvZmZzZXQgb2YgdGhlIGZpcnN0IHBvaW50LCBlcXVhbCB0byB0aGVcbiAqICAgICAgICAgIG51bWJlciBvZiBza2lwcGVkIHBvaW50cyBsZWZ0IG9mIHRoZSBkYXRlIHdpbmRvdyBtaW5pbXVtIChpZiBhbnkpLlxuICogQHJldHVybiB7IUFycmF5LjxEeWdyYXBoLlBvaW50VHlwZT59IExpc3Qgb2YgcG9pbnRzIGZvciB0aGlzIHNlcmllcy5cbiAqL1xuaGFuZGxlci5wcm90b3R5cGUuc2VyaWVzVG9Qb2ludHMgPSBmdW5jdGlvbihzZXJpZXMsIHNldE5hbWUsIGJvdW5kYXJ5SWRTdGFydCkge1xuICAvLyBUT0RPKGJocyk6IHRoZXNlIGxvb3BzIGFyZSBhIGhvdC1zcG90IGZvciBoaWdoLXBvaW50LWNvdW50IGNoYXJ0cy4gSW5cbiAgLy8gZmFjdCxcbiAgLy8gb24gY2hyb21lK2xpbnV4LCB0aGV5IGFyZSA2IHRpbWVzIG1vcmUgZXhwZW5zaXZlIHRoYW4gaXRlcmF0aW5nIHRocm91Z2hcbiAgLy8gdGhlXG4gIC8vIHBvaW50cyBhbmQgZHJhd2luZyB0aGUgbGluZXMuIFRoZSBicnVudCBvZiB0aGUgY29zdCBjb21lcyBmcm9tIGFsbG9jYXRpbmdcbiAgLy8gdGhlIHxwb2ludHwgc3RydWN0dXJlcy5cbiAgdmFyIHBvaW50cyA9IFtdO1xuICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgaXRlbSA9IHNlcmllc1tpXTtcbiAgICB2YXIgeXJhdyA9IGl0ZW1bMV07XG4gICAgdmFyIHl2YWwgPSB5cmF3ID09PSBudWxsID8gbnVsbCA6IGhhbmRsZXIucGFyc2VGbG9hdCh5cmF3KTtcbiAgICB2YXIgcG9pbnQgPSB7XG4gICAgICB4IDogTmFOLFxuICAgICAgeSA6IE5hTixcbiAgICAgIHh2YWwgOiBoYW5kbGVyLnBhcnNlRmxvYXQoaXRlbVswXSksXG4gICAgICB5dmFsIDogeXZhbCxcbiAgICAgIG5hbWUgOiBzZXROYW1lLCAvLyBUT0RPKGRhbnZrKTogaXMgdGhpcyByZWFsbHkgbmVjZXNzYXJ5P1xuICAgICAgaWR4IDogaSArIGJvdW5kYXJ5SWRTdGFydCxcbiAgICAgIGNhbnZhc3g6IE5hTiwgLy8gYWRkIHRoZXNlIHNvIHdlIGRvIG5vdCBhbHRlciB0aGUgc3RydWN0dXJlIGxhdGVyLCB3aGljaCBzbG93cyBDaHJvbWVcbiAgICAgIGNhbnZhc3k6IE5hTixcbiAgICB9O1xuICAgIHBvaW50cy5wdXNoKHBvaW50KTtcbiAgfVxuICB0aGlzLm9uUG9pbnRzQ3JlYXRlZF8oc2VyaWVzLCBwb2ludHMpO1xuICByZXR1cm4gcG9pbnRzO1xufTtcblxuLyoqXG4gKiBDYWxsYmFjayBjYWxsZWQgZm9yIGVhY2ggc2VyaWVzIGFmdGVyIHRoZSBzZXJpZXMgcG9pbnRzIGhhdmUgYmVlbiBnZW5lcmF0ZWRcbiAqIHdoaWNoIHdpbGwgbGF0ZXIgYmUgdXNlZCBieSB0aGUgcGxvdHRlcnMgdG8gZHJhdyB0aGUgZ3JhcGguXG4gKiBIZXJlIGRhdGEgbWF5IGJlIGFkZGVkIHRvIHRoZSBzZXJpZXNQb2ludHMgd2hpY2ggaXMgbmVlZGVkIGJ5IHRoZSBwbG90dGVycy5cbiAqIFRoZSBpbmRleGVzIG9mIHNlcmllcyBhbmQgcG9pbnRzIGFyZSBpbiBzeW5jIG1lYW5pbmcgdGhlIG9yaWdpbmFsIGRhdGFcbiAqIHNhbXBsZSBmb3Igc2VyaWVzW2ldIGlzIHBvaW50c1tpXS5cbiAqXG4gKiBAcGFyYW0geyFBcnJheS48WyFudW1iZXIsP251bWJlciw/XT59IHNlcmllcyBUaGUgc2VyaWVzIGluIHRoZSB1bmlmaWVkXG4gKiAgICAgZGF0YSBmb3JtYXQgd2hlcmUgc2VyaWVzW2ldID0gW3gseSx7ZXh0cmFzfV0uXG4gKiBAcGFyYW0geyFBcnJheS48RHlncmFwaC5Qb2ludFR5cGU+fSBwb2ludHMgVGhlIGNvcnJlc3BvbmRpbmcgcG9pbnRzIHBhc3NlZFxuICogICAgIHRvIHRoZSBwbG90dGVyLlxuICogQHByb3RlY3RlZFxuICovXG5oYW5kbGVyLnByb3RvdHlwZS5vblBvaW50c0NyZWF0ZWRfID0gZnVuY3Rpb24oc2VyaWVzLCBwb2ludHMpIHtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgcm9sbGluZyBhdmVyYWdlIG9mIGEgZGF0YSBzZXQuXG4gKlxuICogQHBhcmFtIHshQXJyYXkuPFshbnVtYmVyLD9udW1iZXIsP10+fSBzZXJpZXMgVGhlIHNlcmllcyBpbiB0aGUgdW5pZmllZFxuICogICAgICAgICAgZGF0YSBmb3JtYXQgd2hlcmUgc2VyaWVzW2ldID0gW3gseSx7ZXh0cmFzfV0uXG4gKiBAcGFyYW0geyFudW1iZXJ9IHJvbGxQZXJpb2QgVGhlIG51bWJlciBvZiBwb2ludHMgb3ZlciB3aGljaCB0byBhdmVyYWdlIHRoZSBkYXRhXG4gKiBAcGFyYW0geyFEeWdyYXBoT3B0aW9uc30gb3B0aW9ucyBUaGUgZHlncmFwaCBvcHRpb25zLlxuICogQHBhcmFtIHshbnVtYmVyfSBzZXJpZXNJbmRleCBJbmRleCBvZiB0aGUgc2VyaWVzIHRoaXMgd2FzIGV4dHJhY3RlZCBmcm9tLlxuICogQHJldHVybiB7IUFycmF5LjxbIW51bWJlciw/bnVtYmVyLD9dPn0gdGhlIHJvbGxlZCBzZXJpZXMuXG4gKi9cbmhhbmRsZXIucHJvdG90eXBlLnJvbGxpbmdBdmVyYWdlID0gZnVuY3Rpb24oc2VyaWVzLCByb2xsUGVyaW9kLCBvcHRpb25zLCBzZXJpZXNJbmRleCkge1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgcmFuZ2Ugb2YgdGhlIGRhdGEgc2VyaWVzIChpbmNsdWRpbmcgY29uZmlkZW5jZSBpbnRlcnZhbHMpLlxuICpcbiAqIEBwYXJhbSB7IUFycmF5LjxbIW51bWJlciw/bnVtYmVyLD9dPn0gc2VyaWVzIFRoZSBzZXJpZXMgaW4gdGhlIHVuaWZpZWRcbiAqICAgICBkYXRhIGZvcm1hdCB3aGVyZSBzZXJpZXNbaV0gPSBbeCwgeSwge2V4dHJhc31dLlxuICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGRhdGVXaW5kb3cgVGhlIHgtdmFsdWUgcmFuZ2UgdG8gZGlzcGxheSB3aXRoXG4gKiAgICAgdGhlIGZvcm1hdDogW21pbiwgbWF4XS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc3RlcFBsb3QgV2hldGhlciB0aGUgc3RlcFBsb3Qgb3B0aW9uIGlzIHNldC5cbiAqIEByZXR1cm4ge0FycmF5LjxudW1iZXI+fSBUaGUgbG93IGFuZCBoaWdoIGV4dHJlbWVzIG9mIHRoZSBzZXJpZXMgaW4gdGhlXG4gKiAgICAgZ2l2ZW4gd2luZG93IHdpdGggdGhlIGZvcm1hdDogW2xvdywgaGlnaF0uXG4gKi9cbmhhbmRsZXIucHJvdG90eXBlLmdldEV4dHJlbWVZVmFsdWVzID0gZnVuY3Rpb24oc2VyaWVzLCBkYXRlV2luZG93LCBzdGVwUGxvdCkge1xufTtcblxuLyoqXG4gKiBDYWxsYmFjayBjYWxsZWQgZm9yIGVhY2ggc2VyaWVzIGFmdGVyIHRoZSBsYXlvdXRpbmcgZGF0YSBoYXMgYmVlblxuICogY2FsY3VsYXRlZCBiZWZvcmUgdGhlIHNlcmllcyBpcyBkcmF3bi4gSGVyZSBub3JtYWxpemVkIHBvc2l0aW9uaW5nIGRhdGFcbiAqIHNob3VsZCBiZSBjYWxjdWxhdGVkIGZvciB0aGUgZXh0cmFzIG9mIGVhY2ggcG9pbnQuXG4gKlxuICogQHBhcmFtIHshQXJyYXkuPER5Z3JhcGguUG9pbnRUeXBlPn0gcG9pbnRzIFRoZSBwb2ludHMgcGFzc2VkIHRvXG4gKiAgICAgICAgICB0aGUgcGxvdHRlci5cbiAqIEBwYXJhbSB7IU9iamVjdH0gYXhpcyBUaGUgYXhpcyBvbiB3aGljaCB0aGUgc2VyaWVzIHdpbGwgYmUgcGxvdHRlZC5cbiAqIEBwYXJhbSB7IWJvb2xlYW59IGxvZ3NjYWxlIFdoZXRoZXIgb3Igbm90IHRvIHVzZSBhIGxvZ3NjYWxlLlxuICovXG5oYW5kbGVyLnByb3RvdHlwZS5vbkxpbmVFdmFsdWF0ZWQgPSBmdW5jdGlvbihwb2ludHMsIGF4aXMsIGxvZ3NjYWxlKSB7XG59O1xuXG4vKipcbiAqIE9wdGltaXplZCByZXBsYWNlbWVudCBmb3IgcGFyc2VGbG9hdCwgd2hpY2ggd2FzIHdheSB0b28gc2xvdyB3aGVuIGFsbW9zdFxuICogYWxsIHZhbHVlcyB3ZXJlIHR5cGUgbnVtYmVyLCB3aXRoIGZldyBlZGdlIGNhc2VzLCBub25lIG9mIHdoaWNoIHdlcmUgc3RyaW5ncy5cbiAqIEBwYXJhbSB7P251bWJlcn0gdmFsXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKiBAcHJvdGVjdGVkXG4gKi9cbmhhbmRsZXIucGFyc2VGbG9hdCA9IGZ1bmN0aW9uKHZhbCkge1xuICAvLyBwYXJzZUZsb2F0KG51bGwpIGlzIE5hTlxuICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgcmV0dXJuIE5hTjtcbiAgfVxuXG4gIC8vIEFzc3VtZSBpdCdzIGEgbnVtYmVyIG9yIE5hTi4gSWYgaXQncyBzb21ldGhpbmcgZWxzZSwgSSdsbCBiZSBzaG9ja2VkLlxuICByZXR1cm4gdmFsO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRHlncmFwaERhdGFIYW5kbGVyO1xuIl0sIm1hcHBpbmdzIjoiQUFBQSxZQUFZOztBQUVaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkFBLE1BQUEsQ0FBQUMsY0FBQSxDQUFBQyxPQUFBO0VBQUFDLEtBQUE7QUFBQTtBQUFBRCxPQUFBO0FBT0EsSUFBSUUsa0JBQWtCLEdBQUcsU0FBckJBLGtCQUFrQkEsQ0FBQSxFQUFlLENBQ3JDLENBQUM7QUFFRCxJQUFJQyxPQUFPLEdBQUdELGtCQUFrQjs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQyxPQUFPLENBQUNDLENBQUMsR0FBRyxDQUFDOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUQsT0FBTyxDQUFDRSxDQUFDLEdBQUcsQ0FBQzs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FGLE9BQU8sQ0FBQ0csTUFBTSxHQUFHLENBQUM7O0FBRWxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBSCxPQUFPLENBQUNJLFNBQVMsQ0FBQ0MsYUFBYSxHQUFHLFVBQVNDLE9BQU8sRUFBRUMsV0FBVyxFQUFFQyxPQUFPLEVBQUUsQ0FDMUUsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FSLE9BQU8sQ0FBQ0ksU0FBUyxDQUFDSyxjQUFjLEdBQUcsVUFBU0MsTUFBTSxFQUFFQyxPQUFPLEVBQUVDLGVBQWUsRUFBRTtFQUM1RTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFJQyxNQUFNLEdBQUcsRUFBRTtFQUNmLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSixNQUFNLENBQUNLLE1BQU0sRUFBRSxFQUFFRCxDQUFDLEVBQUU7SUFDdkMsSUFBSUUsSUFBSSxHQUFHTixNQUFNLENBQUNJLENBQUMsQ0FBQztJQUNwQixJQUFJRyxJQUFJLEdBQUdELElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEIsSUFBSUUsSUFBSSxHQUFHRCxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksR0FBR2pCLE9BQU8sQ0FBQ21CLFVBQVUsQ0FBQ0YsSUFBSSxDQUFDO0lBQzFELElBQUlHLEtBQUssR0FBRztNQUNWQyxDQUFDLEVBQUdDLEdBQUc7TUFDUEMsQ0FBQyxFQUFHRCxHQUFHO01BQ1BFLElBQUksRUFBR3hCLE9BQU8sQ0FBQ21CLFVBQVUsQ0FBQ0gsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ2xDRSxJQUFJLEVBQUdBLElBQUk7TUFDWE8sSUFBSSxFQUFHZCxPQUFPO01BQUU7TUFDaEJlLEdBQUcsRUFBR1osQ0FBQyxHQUFHRixlQUFlO01BQ3pCZSxPQUFPLEVBQUVMLEdBQUc7TUFBRTtNQUNkTSxPQUFPLEVBQUVOO0lBQ1gsQ0FBQztJQUNEVCxNQUFNLENBQUNnQixJQUFJLENBQUNULEtBQUssQ0FBQztFQUNwQjtFQUNBLElBQUksQ0FBQ1UsZ0JBQWdCLENBQUNwQixNQUFNLEVBQUVHLE1BQU0sQ0FBQztFQUNyQyxPQUFPQSxNQUFNO0FBQ2YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBYixPQUFPLENBQUNJLFNBQVMsQ0FBQzBCLGdCQUFnQixHQUFHLFVBQVNwQixNQUFNLEVBQUVHLE1BQU0sRUFBRSxDQUM5RCxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FiLE9BQU8sQ0FBQ0ksU0FBUyxDQUFDMkIsY0FBYyxHQUFHLFVBQVNyQixNQUFNLEVBQUVzQixVQUFVLEVBQUV4QixPQUFPLEVBQUVELFdBQVcsRUFBRSxDQUN0RixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQVAsT0FBTyxDQUFDSSxTQUFTLENBQUM2QixpQkFBaUIsR0FBRyxVQUFTdkIsTUFBTSxFQUFFd0IsVUFBVSxFQUFFQyxRQUFRLEVBQUUsQ0FDN0UsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBbkMsT0FBTyxDQUFDSSxTQUFTLENBQUNnQyxlQUFlLEdBQUcsVUFBU3ZCLE1BQU0sRUFBRXdCLElBQUksRUFBRUMsUUFBUSxFQUFFLENBQ3JFLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQXRDLE9BQU8sQ0FBQ21CLFVBQVUsR0FBRyxVQUFTb0IsR0FBRyxFQUFFO0VBQ2pDO0VBQ0EsSUFBSUEsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNoQixPQUFPakIsR0FBRztFQUNaOztFQUVBO0VBQ0EsT0FBT2lCLEdBQUc7QUFDWixDQUFDO0FBQUMsSUFBQUMsUUFBQSxHQUFBM0MsT0FBQSxjQUVhRSxrQkFBa0I7QUFBQTBDLE1BQUEsQ0FBQTVDLE9BQUEsR0FBQUEsT0FBQSxDQUFBNkMsT0FBQSIsImlnbm9yZUxpc3QiOltdfQ==