'use strict';

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */

/**
 * @fileoverview Based on PlotKitLayout, but modified to meet the needs of
 * dygraphs.
 */

/*global Dygraph:false */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/**
 * Creates a new DygraphLayout object.
 *
 * This class contains all the data to be charted.
 * It uses data coordinates, but also records the chart range (in data
 * coordinates) and hence is able to calculate percentage positions ('In this
 * view, Point A lies 25% down the x-axis.')
 *
 * Two things that it does not do are:
 * 1. Record pixel coordinates for anything.
 * 2. (oddly) determine anything about the layout of chart elements.
 *
 * The naming is a vestige of Dygraph's original PlotKit roots.
 *
 * @constructor
 */
var DygraphLayout = function DygraphLayout(dygraph) {
  this.dygraph_ = dygraph;
  /**
   * Array of points for each series.
   *
   * [series index][row index in series] = |Point| structure,
   * where series index refers to visible series only, and the
   * point index is for the reduced set of points for the current
   * zoom region (including one point just outside the window).
   * All points in the same row index share the same X value.
   *
   * @type {Array.<Array.<Dygraph.PointType>>}
   */
  this.points = [];
  this.setNames = [];
  this.annotations = [];
  this.yAxes_ = null;

  // TODO(danvk): it's odd that xTicks_ and yTicks_ are inputs,
  // but xticks and yticks are outputs. Clean this up.
  this.xTicks_ = null;
  this.yTicks_ = null;
};

/**
 * Add points for a single series.
 *
 * @param {string} setname Name of the series.
 * @param {Array.<Dygraph.PointType>} set_xy Points for the series.
 */
DygraphLayout.prototype.addDataset = function (setname, set_xy) {
  this.points.push(set_xy);
  this.setNames.push(setname);
};

/**
 * Returns the box which the chart should be drawn in. This is the canvas's
 * box, less space needed for the axis and chart labels.
 *
 * @return {{x: number, y: number, w: number, h: number}}
 */
DygraphLayout.prototype.getPlotArea = function () {
  return this.area_;
};

// Compute the box which the chart should be drawn in. This is the canvas's
// box, less space needed for axis, chart labels, and other plug-ins.
// NOTE: This should only be called by Dygraph.predraw_().
DygraphLayout.prototype.computePlotArea = function () {
  var area = {
    // TODO(danvk): per-axis setting.
    x: 0,
    y: 0
  };
  area.w = this.dygraph_.width_ - area.x - this.dygraph_.getOption('rightGap');
  area.h = this.dygraph_.height_;

  // Let plugins reserve space.
  var e = {
    chart_div: this.dygraph_.graphDiv,
    reserveSpaceLeft: function reserveSpaceLeft(px) {
      var r = {
        x: area.x,
        y: area.y,
        w: px,
        h: area.h
      };
      area.x += px;
      area.w -= px;
      return r;
    },
    reserveSpaceRight: function reserveSpaceRight(px) {
      var r = {
        x: area.x + area.w - px,
        y: area.y,
        w: px,
        h: area.h
      };
      area.w -= px;
      return r;
    },
    reserveSpaceTop: function reserveSpaceTop(px) {
      var r = {
        x: area.x,
        y: area.y,
        w: area.w,
        h: px
      };
      area.y += px;
      area.h -= px;
      return r;
    },
    reserveSpaceBottom: function reserveSpaceBottom(px) {
      var r = {
        x: area.x,
        y: area.y + area.h - px,
        w: area.w,
        h: px
      };
      area.h -= px;
      return r;
    },
    chartRect: function chartRect() {
      return {
        x: area.x,
        y: area.y,
        w: area.w,
        h: area.h
      };
    }
  };
  this.dygraph_.cascadeEvents_('layout', e);
  this.area_ = area;
};
DygraphLayout.prototype.setAnnotations = function (ann) {
  // The Dygraph object's annotations aren't parsed. We parse them here and
  // save a copy. If there is no parser, then the user must be using raw format.
  this.annotations = [];
  var parse = this.dygraph_.getOption('xValueParser') || function (x) {
    return x;
  };
  for (var i = 0; i < ann.length; i++) {
    var a = {};
    if (!ann[i].xval && ann[i].x === undefined) {
      console.error("Annotations must have an 'x' property");
      return;
    }
    if (ann[i].icon && !(ann[i].hasOwnProperty('width') && ann[i].hasOwnProperty('height'))) {
      console.error("Must set width and height when setting " + "annotation.icon property");
      return;
    }
    utils.update(a, ann[i]);
    if (!a.xval) a.xval = parse(a.x);
    this.annotations.push(a);
  }
};
DygraphLayout.prototype.setXTicks = function (xTicks) {
  this.xTicks_ = xTicks;
};

// TODO(danvk): add this to the Dygraph object's API or move it into Layout.
DygraphLayout.prototype.setYAxes = function (yAxes) {
  this.yAxes_ = yAxes;
};
DygraphLayout.prototype.evaluate = function () {
  this._xAxis = {};
  this._evaluateLimits();
  this._evaluateLineCharts();
  this._evaluateLineTicks();
  this._evaluateAnnotations();
};
DygraphLayout.prototype._evaluateLimits = function () {
  var xlimits = this.dygraph_.xAxisRange();
  this._xAxis.minval = xlimits[0];
  this._xAxis.maxval = xlimits[1];
  var xrange = xlimits[1] - xlimits[0];
  this._xAxis.scale = xrange !== 0 ? 1 / xrange : 1.0;
  if (this.dygraph_.getOptionForAxis("logscale", 'x')) {
    this._xAxis.xlogrange = utils.log10(this._xAxis.maxval) - utils.log10(this._xAxis.minval);
    this._xAxis.xlogscale = this._xAxis.xlogrange !== 0 ? 1.0 / this._xAxis.xlogrange : 1.0;
  }
  for (var i = 0; i < this.yAxes_.length; i++) {
    var axis = this.yAxes_[i];
    axis.minyval = axis.computedValueRange[0];
    axis.maxyval = axis.computedValueRange[1];
    axis.yrange = axis.maxyval - axis.minyval;
    axis.yscale = axis.yrange !== 0 ? 1.0 / axis.yrange : 1.0;
    if (this.dygraph_.getOption("logscale") || axis.logscale) {
      axis.ylogrange = utils.log10(axis.maxyval) - utils.log10(axis.minyval);
      axis.ylogscale = axis.ylogrange !== 0 ? 1.0 / axis.ylogrange : 1.0;
      if (!isFinite(axis.ylogrange) || isNaN(axis.ylogrange)) {
        console.error('axis ' + i + ' of graph at ' + axis.g + ' can\'t be displayed in log scale for range [' + axis.minyval + ' - ' + axis.maxyval + ']');
      }
    }
  }
};
DygraphLayout.calcXNormal_ = function (value, xAxis, logscale) {
  if (logscale) {
    return (utils.log10(value) - utils.log10(xAxis.minval)) * xAxis.xlogscale;
  } else {
    return (value - xAxis.minval) * xAxis.scale;
  }
};

/**
 * @param {DygraphAxisType} axis
 * @param {number} value
 * @param {boolean} logscale
 * @return {number}
 */
DygraphLayout.calcYNormal_ = function (axis, value, logscale) {
  if (logscale) {
    var x = 1.0 - (utils.log10(value) - utils.log10(axis.minyval)) * axis.ylogscale;
    return isFinite(x) ? x : NaN; // shim for v8 issue; see pull request 276
  } else {
    return 1.0 - (value - axis.minyval) * axis.yscale;
  }
};
DygraphLayout.prototype._evaluateLineCharts = function () {
  var isStacked = this.dygraph_.getOption("stackedGraph");
  var isLogscaleForX = this.dygraph_.getOptionForAxis("logscale", 'x');
  for (var setIdx = 0; setIdx < this.points.length; setIdx++) {
    var points = this.points[setIdx];
    var setName = this.setNames[setIdx];
    var connectSeparated = this.dygraph_.getOption('connectSeparatedPoints', setName);
    var axis = this.dygraph_.axisPropertiesForSeries(setName);
    // TODO (konigsberg): use optionsForAxis instead.
    var logscale = this.dygraph_.attributes_.getForSeries("logscale", setName);
    var outOfXBounds = 0,
      outOfYBounds = 0;
    for (var j = 0; j < points.length; j++) {
      var point = points[j];

      // Range from 0-1 where 0 represents left and 1 represents right.
      point.x = DygraphLayout.calcXNormal_(point.xval, this._xAxis, isLogscaleForX);
      outOfXBounds += point.x < 0 || point.x > 1;
      // Range from 0-1 where 0 represents top and 1 represents bottom
      var yval = point.yval;
      if (isStacked) {
        point.y_stacked = DygraphLayout.calcYNormal_(axis, point.yval_stacked, logscale);
        if (yval !== null && !isNaN(yval)) {
          yval = point.yval_stacked;
        }
      }
      if (yval === null) {
        yval = NaN;
        if (!connectSeparated) {
          point.yval = NaN;
        }
      }
      point.y = DygraphLayout.calcYNormal_(axis, yval, logscale);
      outOfYBounds += point.y < 0 || point.y > 1;
    }
    if (outOfXBounds > 2) {
      console.warn(outOfXBounds + ' points out of X bounds:' + this._xAxis.minval + ' - ' + this._xAxis.maxval);
    }
    if (outOfYBounds > 0) {
      console.warn(outOfYBounds + ' points out of Y bounds:' + axis.minyval + ' - ' + axis.maxyval);
    }
    this.dygraph_.dataHandler_.onLineEvaluated(points, axis, logscale);
  }
};
DygraphLayout.prototype._evaluateLineTicks = function () {
  var i, tick, label, pos, v, has_tick;
  this.xticks = [];
  for (i = 0; i < this.xTicks_.length; i++) {
    tick = this.xTicks_[i];
    label = tick.label;
    has_tick = !('label_v' in tick);
    v = has_tick ? tick.v : tick.label_v;
    pos = this.dygraph_.toPercentXCoord(v);
    if (pos >= 0.0 && pos < 1.0) {
      this.xticks.push({
        pos: pos,
        label: label,
        has_tick: has_tick
      });
    }
  }
  this.yticks = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var axis = this.yAxes_[i];
    for (var j = 0; j < axis.ticks.length; j++) {
      tick = axis.ticks[j];
      label = tick.label;
      has_tick = !('label_v' in tick);
      v = has_tick ? tick.v : tick.label_v;
      pos = this.dygraph_.toPercentYCoord(v, i);
      if (pos > 0.0 && pos <= 1.0) {
        this.yticks.push({
          axis: i,
          pos: pos,
          label: label,
          has_tick: has_tick
        });
      }
    }
  }
};
DygraphLayout.prototype._evaluateAnnotations = function () {
  // Add the annotations to the point to which they belong.
  // Make a map from (setName, xval) to annotation for quick lookups.
  var i;
  var annotations = {};
  for (i = 0; i < this.annotations.length; i++) {
    var a = this.annotations[i];
    annotations[a.xval + "," + a.series] = a;
  }
  this.annotated_points = [];

  // Exit the function early if there are no annotations.
  if (!this.annotations || !this.annotations.length) {
    return;
  }

  // TODO(antrob): loop through annotations not points.
  for (var setIdx = 0; setIdx < this.points.length; setIdx++) {
    var points = this.points[setIdx];
    for (i = 0; i < points.length; i++) {
      var p = points[i];
      var k = p.xval + "," + p.name;
      if (k in annotations) {
        p.annotation = annotations[k];
        this.annotated_points.push(p);
        //if there are multiple same x-valued points, the annotation would be rendered multiple times
        //remove already rendered annotation
        delete annotations[k];
      }
    }
  }
};

/**
 * Convenience function to remove all the data sets from a graph
 */
DygraphLayout.prototype.removeAllDatasets = function () {
  delete this.points;
  delete this.setNames;
  delete this.setPointsLengths;
  delete this.setPointsOffsets;
  this.points = [];
  this.setNames = [];
  this.setPointsLengths = [];
  this.setPointsOffsets = [];
};
var _default = exports["default"] = DygraphLayout;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsInV0aWxzIiwiX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQiLCJyZXF1aXJlIiwiZSIsInQiLCJXZWFrTWFwIiwiciIsIm4iLCJfX2VzTW9kdWxlIiwibyIsImkiLCJmIiwiX19wcm90b19fIiwiaGFzIiwiZ2V0Iiwic2V0IiwiX3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJEeWdyYXBoTGF5b3V0IiwiZHlncmFwaCIsImR5Z3JhcGhfIiwicG9pbnRzIiwic2V0TmFtZXMiLCJhbm5vdGF0aW9ucyIsInlBeGVzXyIsInhUaWNrc18iLCJ5VGlja3NfIiwicHJvdG90eXBlIiwiYWRkRGF0YXNldCIsInNldG5hbWUiLCJzZXRfeHkiLCJwdXNoIiwiZ2V0UGxvdEFyZWEiLCJhcmVhXyIsImNvbXB1dGVQbG90QXJlYSIsImFyZWEiLCJ4IiwieSIsInciLCJ3aWR0aF8iLCJnZXRPcHRpb24iLCJoIiwiaGVpZ2h0XyIsImNoYXJ0X2RpdiIsImdyYXBoRGl2IiwicmVzZXJ2ZVNwYWNlTGVmdCIsInB4IiwicmVzZXJ2ZVNwYWNlUmlnaHQiLCJyZXNlcnZlU3BhY2VUb3AiLCJyZXNlcnZlU3BhY2VCb3R0b20iLCJjaGFydFJlY3QiLCJjYXNjYWRlRXZlbnRzXyIsInNldEFubm90YXRpb25zIiwiYW5uIiwicGFyc2UiLCJsZW5ndGgiLCJhIiwieHZhbCIsInVuZGVmaW5lZCIsImNvbnNvbGUiLCJlcnJvciIsImljb24iLCJ1cGRhdGUiLCJzZXRYVGlja3MiLCJ4VGlja3MiLCJzZXRZQXhlcyIsInlBeGVzIiwiZXZhbHVhdGUiLCJfeEF4aXMiLCJfZXZhbHVhdGVMaW1pdHMiLCJfZXZhbHVhdGVMaW5lQ2hhcnRzIiwiX2V2YWx1YXRlTGluZVRpY2tzIiwiX2V2YWx1YXRlQW5ub3RhdGlvbnMiLCJ4bGltaXRzIiwieEF4aXNSYW5nZSIsIm1pbnZhbCIsIm1heHZhbCIsInhyYW5nZSIsInNjYWxlIiwiZ2V0T3B0aW9uRm9yQXhpcyIsInhsb2dyYW5nZSIsImxvZzEwIiwieGxvZ3NjYWxlIiwiYXhpcyIsIm1pbnl2YWwiLCJjb21wdXRlZFZhbHVlUmFuZ2UiLCJtYXh5dmFsIiwieXJhbmdlIiwieXNjYWxlIiwibG9nc2NhbGUiLCJ5bG9ncmFuZ2UiLCJ5bG9nc2NhbGUiLCJpc0Zpbml0ZSIsImlzTmFOIiwiZyIsImNhbGNYTm9ybWFsXyIsInhBeGlzIiwiY2FsY1lOb3JtYWxfIiwiTmFOIiwiaXNTdGFja2VkIiwiaXNMb2dzY2FsZUZvclgiLCJzZXRJZHgiLCJzZXROYW1lIiwiY29ubmVjdFNlcGFyYXRlZCIsImF4aXNQcm9wZXJ0aWVzRm9yU2VyaWVzIiwiYXR0cmlidXRlc18iLCJnZXRGb3JTZXJpZXMiLCJvdXRPZlhCb3VuZHMiLCJvdXRPZllCb3VuZHMiLCJqIiwicG9pbnQiLCJ5dmFsIiwieV9zdGFja2VkIiwieXZhbF9zdGFja2VkIiwid2FybiIsImRhdGFIYW5kbGVyXyIsIm9uTGluZUV2YWx1YXRlZCIsInRpY2siLCJsYWJlbCIsInBvcyIsInYiLCJoYXNfdGljayIsInh0aWNrcyIsImxhYmVsX3YiLCJ0b1BlcmNlbnRYQ29vcmQiLCJ5dGlja3MiLCJ0aWNrcyIsInRvUGVyY2VudFlDb29yZCIsInNlcmllcyIsImFubm90YXRlZF9wb2ludHMiLCJwIiwiayIsIm5hbWUiLCJhbm5vdGF0aW9uIiwicmVtb3ZlQWxsRGF0YXNldHMiLCJzZXRQb2ludHNMZW5ndGhzIiwic2V0UG9pbnRzT2Zmc2V0cyIsIl9kZWZhdWx0IiwibW9kdWxlIiwiZGVmYXVsdCJdLCJzb3VyY2VzIjpbIi4uL3NyYy9keWdyYXBoLWxheW91dC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDExIERhbiBWYW5kZXJrYW0gKGRhbnZka0BnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZS9NSVRcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQmFzZWQgb24gUGxvdEtpdExheW91dCwgYnV0IG1vZGlmaWVkIHRvIG1lZXQgdGhlIG5lZWRzIG9mXG4gKiBkeWdyYXBocy5cbiAqL1xuXG4vKmdsb2JhbCBEeWdyYXBoOmZhbHNlICovXG5cbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vZHlncmFwaC11dGlscyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBEeWdyYXBoTGF5b3V0IG9iamVjdC5cbiAqXG4gKiBUaGlzIGNsYXNzIGNvbnRhaW5zIGFsbCB0aGUgZGF0YSB0byBiZSBjaGFydGVkLlxuICogSXQgdXNlcyBkYXRhIGNvb3JkaW5hdGVzLCBidXQgYWxzbyByZWNvcmRzIHRoZSBjaGFydCByYW5nZSAoaW4gZGF0YVxuICogY29vcmRpbmF0ZXMpIGFuZCBoZW5jZSBpcyBhYmxlIHRvIGNhbGN1bGF0ZSBwZXJjZW50YWdlIHBvc2l0aW9ucyAoJ0luIHRoaXNcbiAqIHZpZXcsIFBvaW50IEEgbGllcyAyNSUgZG93biB0aGUgeC1heGlzLicpXG4gKlxuICogVHdvIHRoaW5ncyB0aGF0IGl0IGRvZXMgbm90IGRvIGFyZTpcbiAqIDEuIFJlY29yZCBwaXhlbCBjb29yZGluYXRlcyBmb3IgYW55dGhpbmcuXG4gKiAyLiAob2RkbHkpIGRldGVybWluZSBhbnl0aGluZyBhYm91dCB0aGUgbGF5b3V0IG9mIGNoYXJ0IGVsZW1lbnRzLlxuICpcbiAqIFRoZSBuYW1pbmcgaXMgYSB2ZXN0aWdlIG9mIER5Z3JhcGgncyBvcmlnaW5hbCBQbG90S2l0IHJvb3RzLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgRHlncmFwaExheW91dCA9IGZ1bmN0aW9uKGR5Z3JhcGgpIHtcbiAgdGhpcy5keWdyYXBoXyA9IGR5Z3JhcGg7XG4gIC8qKlxuICAgKiBBcnJheSBvZiBwb2ludHMgZm9yIGVhY2ggc2VyaWVzLlxuICAgKlxuICAgKiBbc2VyaWVzIGluZGV4XVtyb3cgaW5kZXggaW4gc2VyaWVzXSA9IHxQb2ludHwgc3RydWN0dXJlLFxuICAgKiB3aGVyZSBzZXJpZXMgaW5kZXggcmVmZXJzIHRvIHZpc2libGUgc2VyaWVzIG9ubHksIGFuZCB0aGVcbiAgICogcG9pbnQgaW5kZXggaXMgZm9yIHRoZSByZWR1Y2VkIHNldCBvZiBwb2ludHMgZm9yIHRoZSBjdXJyZW50XG4gICAqIHpvb20gcmVnaW9uIChpbmNsdWRpbmcgb25lIHBvaW50IGp1c3Qgb3V0c2lkZSB0aGUgd2luZG93KS5cbiAgICogQWxsIHBvaW50cyBpbiB0aGUgc2FtZSByb3cgaW5kZXggc2hhcmUgdGhlIHNhbWUgWCB2YWx1ZS5cbiAgICpcbiAgICogQHR5cGUge0FycmF5LjxBcnJheS48RHlncmFwaC5Qb2ludFR5cGU+Pn1cbiAgICovXG4gIHRoaXMucG9pbnRzID0gW107XG4gIHRoaXMuc2V0TmFtZXMgPSBbXTtcbiAgdGhpcy5hbm5vdGF0aW9ucyA9IFtdO1xuICB0aGlzLnlBeGVzXyA9IG51bGw7XG5cbiAgLy8gVE9ETyhkYW52ayk6IGl0J3Mgb2RkIHRoYXQgeFRpY2tzXyBhbmQgeVRpY2tzXyBhcmUgaW5wdXRzLFxuICAvLyBidXQgeHRpY2tzIGFuZCB5dGlja3MgYXJlIG91dHB1dHMuIENsZWFuIHRoaXMgdXAuXG4gIHRoaXMueFRpY2tzXyA9IG51bGw7XG4gIHRoaXMueVRpY2tzXyA9IG51bGw7XG59O1xuXG4vKipcbiAqIEFkZCBwb2ludHMgZm9yIGEgc2luZ2xlIHNlcmllcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2V0bmFtZSBOYW1lIG9mIHRoZSBzZXJpZXMuXG4gKiBAcGFyYW0ge0FycmF5LjxEeWdyYXBoLlBvaW50VHlwZT59IHNldF94eSBQb2ludHMgZm9yIHRoZSBzZXJpZXMuXG4gKi9cbkR5Z3JhcGhMYXlvdXQucHJvdG90eXBlLmFkZERhdGFzZXQgPSBmdW5jdGlvbihzZXRuYW1lLCBzZXRfeHkpIHtcbiAgdGhpcy5wb2ludHMucHVzaChzZXRfeHkpO1xuICB0aGlzLnNldE5hbWVzLnB1c2goc2V0bmFtZSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGJveCB3aGljaCB0aGUgY2hhcnQgc2hvdWxkIGJlIGRyYXduIGluLiBUaGlzIGlzIHRoZSBjYW52YXMnc1xuICogYm94LCBsZXNzIHNwYWNlIG5lZWRlZCBmb3IgdGhlIGF4aXMgYW5kIGNoYXJ0IGxhYmVscy5cbiAqXG4gKiBAcmV0dXJuIHt7eDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyfX1cbiAqL1xuRHlncmFwaExheW91dC5wcm90b3R5cGUuZ2V0UGxvdEFyZWEgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuYXJlYV87XG59O1xuXG4vLyBDb21wdXRlIHRoZSBib3ggd2hpY2ggdGhlIGNoYXJ0IHNob3VsZCBiZSBkcmF3biBpbi4gVGhpcyBpcyB0aGUgY2FudmFzJ3Ncbi8vIGJveCwgbGVzcyBzcGFjZSBuZWVkZWQgZm9yIGF4aXMsIGNoYXJ0IGxhYmVscywgYW5kIG90aGVyIHBsdWctaW5zLlxuLy8gTk9URTogVGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgYnkgRHlncmFwaC5wcmVkcmF3XygpLlxuRHlncmFwaExheW91dC5wcm90b3R5cGUuY29tcHV0ZVBsb3RBcmVhID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhcmVhID0ge1xuICAgIC8vIFRPRE8oZGFudmspOiBwZXItYXhpcyBzZXR0aW5nLlxuICAgIHg6IDAsXG4gICAgeTogMFxuICB9O1xuXG4gIGFyZWEudyA9IHRoaXMuZHlncmFwaF8ud2lkdGhfIC0gYXJlYS54IC0gdGhpcy5keWdyYXBoXy5nZXRPcHRpb24oJ3JpZ2h0R2FwJyk7XG4gIGFyZWEuaCA9IHRoaXMuZHlncmFwaF8uaGVpZ2h0XztcblxuICAvLyBMZXQgcGx1Z2lucyByZXNlcnZlIHNwYWNlLlxuICB2YXIgZSA9IHtcbiAgICBjaGFydF9kaXY6IHRoaXMuZHlncmFwaF8uZ3JhcGhEaXYsXG4gICAgcmVzZXJ2ZVNwYWNlTGVmdDogZnVuY3Rpb24ocHgpIHtcbiAgICAgIHZhciByID0ge1xuICAgICAgICB4OiBhcmVhLngsXG4gICAgICAgIHk6IGFyZWEueSxcbiAgICAgICAgdzogcHgsXG4gICAgICAgIGg6IGFyZWEuaFxuICAgICAgfTtcbiAgICAgIGFyZWEueCArPSBweDtcbiAgICAgIGFyZWEudyAtPSBweDtcbiAgICAgIHJldHVybiByO1xuICAgIH0sXG4gICAgcmVzZXJ2ZVNwYWNlUmlnaHQ6IGZ1bmN0aW9uKHB4KSB7XG4gICAgICB2YXIgciA9IHtcbiAgICAgICAgeDogYXJlYS54ICsgYXJlYS53IC0gcHgsXG4gICAgICAgIHk6IGFyZWEueSxcbiAgICAgICAgdzogcHgsXG4gICAgICAgIGg6IGFyZWEuaFxuICAgICAgfTtcbiAgICAgIGFyZWEudyAtPSBweDtcbiAgICAgIHJldHVybiByO1xuICAgIH0sXG4gICAgcmVzZXJ2ZVNwYWNlVG9wOiBmdW5jdGlvbihweCkge1xuICAgICAgdmFyIHIgPSB7XG4gICAgICAgIHg6IGFyZWEueCxcbiAgICAgICAgeTogYXJlYS55LFxuICAgICAgICB3OiBhcmVhLncsXG4gICAgICAgIGg6IHB4XG4gICAgICB9O1xuICAgICAgYXJlYS55ICs9IHB4O1xuICAgICAgYXJlYS5oIC09IHB4O1xuICAgICAgcmV0dXJuIHI7XG4gICAgfSxcbiAgICByZXNlcnZlU3BhY2VCb3R0b206IGZ1bmN0aW9uKHB4KSB7XG4gICAgICB2YXIgciA9IHtcbiAgICAgICAgeDogYXJlYS54LFxuICAgICAgICB5OiBhcmVhLnkgKyBhcmVhLmggLSBweCxcbiAgICAgICAgdzogYXJlYS53LFxuICAgICAgICBoOiBweFxuICAgICAgfTtcbiAgICAgIGFyZWEuaCAtPSBweDtcbiAgICAgIHJldHVybiByO1xuICAgIH0sXG4gICAgY2hhcnRSZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7eDphcmVhLngsIHk6YXJlYS55LCB3OmFyZWEudywgaDphcmVhLmh9O1xuICAgIH1cbiAgfTtcbiAgdGhpcy5keWdyYXBoXy5jYXNjYWRlRXZlbnRzXygnbGF5b3V0JywgZSk7XG5cbiAgdGhpcy5hcmVhXyA9IGFyZWE7XG59O1xuXG5EeWdyYXBoTGF5b3V0LnByb3RvdHlwZS5zZXRBbm5vdGF0aW9ucyA9IGZ1bmN0aW9uKGFubikge1xuICAvLyBUaGUgRHlncmFwaCBvYmplY3QncyBhbm5vdGF0aW9ucyBhcmVuJ3QgcGFyc2VkLiBXZSBwYXJzZSB0aGVtIGhlcmUgYW5kXG4gIC8vIHNhdmUgYSBjb3B5LiBJZiB0aGVyZSBpcyBubyBwYXJzZXIsIHRoZW4gdGhlIHVzZXIgbXVzdCBiZSB1c2luZyByYXcgZm9ybWF0LlxuICB0aGlzLmFubm90YXRpb25zID0gW107XG4gIHZhciBwYXJzZSA9IHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uKCd4VmFsdWVQYXJzZXInKSB8fCBmdW5jdGlvbih4KSB7IHJldHVybiB4OyB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFubi5sZW5ndGg7IGkrKykge1xuICAgIHZhciBhID0ge307XG4gICAgaWYgKCFhbm5baV0ueHZhbCAmJiBhbm5baV0ueCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQW5ub3RhdGlvbnMgbXVzdCBoYXZlIGFuICd4JyBwcm9wZXJ0eVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGFubltpXS5pY29uICYmXG4gICAgICAgICEoYW5uW2ldLmhhc093blByb3BlcnR5KCd3aWR0aCcpICYmXG4gICAgICAgICAgYW5uW2ldLmhhc093blByb3BlcnR5KCdoZWlnaHQnKSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNdXN0IHNldCB3aWR0aCBhbmQgaGVpZ2h0IHdoZW4gc2V0dGluZyBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiYW5ub3RhdGlvbi5pY29uIHByb3BlcnR5XCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB1dGlscy51cGRhdGUoYSwgYW5uW2ldKTtcbiAgICBpZiAoIWEueHZhbCkgYS54dmFsID0gcGFyc2UoYS54KTtcbiAgICB0aGlzLmFubm90YXRpb25zLnB1c2goYSk7XG4gIH1cbn07XG5cbkR5Z3JhcGhMYXlvdXQucHJvdG90eXBlLnNldFhUaWNrcyA9IGZ1bmN0aW9uKHhUaWNrcykge1xuICB0aGlzLnhUaWNrc18gPSB4VGlja3M7XG59O1xuXG4vLyBUT0RPKGRhbnZrKTogYWRkIHRoaXMgdG8gdGhlIER5Z3JhcGggb2JqZWN0J3MgQVBJIG9yIG1vdmUgaXQgaW50byBMYXlvdXQuXG5EeWdyYXBoTGF5b3V0LnByb3RvdHlwZS5zZXRZQXhlcyA9IGZ1bmN0aW9uICh5QXhlcykge1xuICB0aGlzLnlBeGVzXyA9IHlBeGVzO1xufTtcblxuRHlncmFwaExheW91dC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5feEF4aXMgPSB7fTtcbiAgdGhpcy5fZXZhbHVhdGVMaW1pdHMoKTtcbiAgdGhpcy5fZXZhbHVhdGVMaW5lQ2hhcnRzKCk7XG4gIHRoaXMuX2V2YWx1YXRlTGluZVRpY2tzKCk7XG4gIHRoaXMuX2V2YWx1YXRlQW5ub3RhdGlvbnMoKTtcbn07XG5cbkR5Z3JhcGhMYXlvdXQucHJvdG90eXBlLl9ldmFsdWF0ZUxpbWl0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgeGxpbWl0cyA9IHRoaXMuZHlncmFwaF8ueEF4aXNSYW5nZSgpO1xuICB0aGlzLl94QXhpcy5taW52YWwgPSB4bGltaXRzWzBdO1xuICB0aGlzLl94QXhpcy5tYXh2YWwgPSB4bGltaXRzWzFdO1xuICB2YXIgeHJhbmdlID0geGxpbWl0c1sxXSAtIHhsaW1pdHNbMF07XG4gIHRoaXMuX3hBeGlzLnNjYWxlID0gKHhyYW5nZSAhPT0gMCA/IDEgLyB4cmFuZ2UgOiAxLjApO1xuXG4gIGlmICh0aGlzLmR5Z3JhcGhfLmdldE9wdGlvbkZvckF4aXMoXCJsb2dzY2FsZVwiLCAneCcpKSB7XG4gICAgdGhpcy5feEF4aXMueGxvZ3JhbmdlID0gdXRpbHMubG9nMTAodGhpcy5feEF4aXMubWF4dmFsKSAtIHV0aWxzLmxvZzEwKHRoaXMuX3hBeGlzLm1pbnZhbCk7XG4gICAgdGhpcy5feEF4aXMueGxvZ3NjYWxlID0gKHRoaXMuX3hBeGlzLnhsb2dyYW5nZSAhPT0gMCA/IDEuMCAvIHRoaXMuX3hBeGlzLnhsb2dyYW5nZSA6IDEuMCk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnlBeGVzXy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBheGlzID0gdGhpcy55QXhlc19baV07XG4gICAgYXhpcy5taW55dmFsID0gYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMF07XG4gICAgYXhpcy5tYXh5dmFsID0gYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV07XG4gICAgYXhpcy55cmFuZ2UgPSBheGlzLm1heHl2YWwgLSBheGlzLm1pbnl2YWw7XG4gICAgYXhpcy55c2NhbGUgPSAoYXhpcy55cmFuZ2UgIT09IDAgPyAxLjAgLyBheGlzLnlyYW5nZSA6IDEuMCk7XG5cbiAgICBpZiAodGhpcy5keWdyYXBoXy5nZXRPcHRpb24oXCJsb2dzY2FsZVwiKSB8fCBheGlzLmxvZ3NjYWxlKSB7XG4gICAgICBheGlzLnlsb2dyYW5nZSA9IHV0aWxzLmxvZzEwKGF4aXMubWF4eXZhbCkgLSB1dGlscy5sb2cxMChheGlzLm1pbnl2YWwpO1xuICAgICAgYXhpcy55bG9nc2NhbGUgPSAoYXhpcy55bG9ncmFuZ2UgIT09IDAgPyAxLjAgLyBheGlzLnlsb2dyYW5nZSA6IDEuMCk7XG4gICAgICBpZiAoIWlzRmluaXRlKGF4aXMueWxvZ3JhbmdlKSB8fCBpc05hTihheGlzLnlsb2dyYW5nZSkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignYXhpcyAnICsgaSArICcgb2YgZ3JhcGggYXQgJyArIGF4aXMuZyArXG4gICAgICAgICAgICAgICAgICAgICAgJyBjYW5cXCd0IGJlIGRpc3BsYXllZCBpbiBsb2cgc2NhbGUgZm9yIHJhbmdlIFsnICtcbiAgICAgICAgICAgICAgICAgICAgICBheGlzLm1pbnl2YWwgKyAnIC0gJyArIGF4aXMubWF4eXZhbCArICddJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5EeWdyYXBoTGF5b3V0LmNhbGNYTm9ybWFsXyA9IGZ1bmN0aW9uKHZhbHVlLCB4QXhpcywgbG9nc2NhbGUpIHtcbiAgaWYgKGxvZ3NjYWxlKSB7XG4gICAgcmV0dXJuICgodXRpbHMubG9nMTAodmFsdWUpIC0gdXRpbHMubG9nMTAoeEF4aXMubWludmFsKSkgKiB4QXhpcy54bG9nc2NhbGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAodmFsdWUgLSB4QXhpcy5taW52YWwpICogeEF4aXMuc2NhbGU7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHtEeWdyYXBoQXhpc1R5cGV9IGF4aXNcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICogQHBhcmFtIHtib29sZWFufSBsb2dzY2FsZVxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5EeWdyYXBoTGF5b3V0LmNhbGNZTm9ybWFsXyA9IGZ1bmN0aW9uKGF4aXMsIHZhbHVlLCBsb2dzY2FsZSkge1xuICBpZiAobG9nc2NhbGUpIHtcbiAgICB2YXIgeCA9IDEuMCAtICgodXRpbHMubG9nMTAodmFsdWUpIC0gdXRpbHMubG9nMTAoYXhpcy5taW55dmFsKSkgKiBheGlzLnlsb2dzY2FsZSk7XG4gICAgcmV0dXJuIGlzRmluaXRlKHgpID8geCA6IE5hTjsgIC8vIHNoaW0gZm9yIHY4IGlzc3VlOyBzZWUgcHVsbCByZXF1ZXN0IDI3NlxuICB9IGVsc2Uge1xuICAgIHJldHVybiAxLjAgLSAoKHZhbHVlIC0gYXhpcy5taW55dmFsKSAqIGF4aXMueXNjYWxlKTtcbiAgfVxufTtcblxuRHlncmFwaExheW91dC5wcm90b3R5cGUuX2V2YWx1YXRlTGluZUNoYXJ0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaXNTdGFja2VkID0gdGhpcy5keWdyYXBoXy5nZXRPcHRpb24oXCJzdGFja2VkR3JhcGhcIik7XG4gIHZhciBpc0xvZ3NjYWxlRm9yWCA9IHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uRm9yQXhpcyhcImxvZ3NjYWxlXCIsICd4Jyk7XG5cbiAgZm9yICh2YXIgc2V0SWR4ID0gMDsgc2V0SWR4IDwgdGhpcy5wb2ludHMubGVuZ3RoOyBzZXRJZHgrKykge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50c1tzZXRJZHhdO1xuICAgIHZhciBzZXROYW1lID0gdGhpcy5zZXROYW1lc1tzZXRJZHhdO1xuICAgIHZhciBjb25uZWN0U2VwYXJhdGVkID0gdGhpcy5keWdyYXBoXy5nZXRPcHRpb24oJ2Nvbm5lY3RTZXBhcmF0ZWRQb2ludHMnLCBzZXROYW1lKTtcbiAgICB2YXIgYXhpcyA9IHRoaXMuZHlncmFwaF8uYXhpc1Byb3BlcnRpZXNGb3JTZXJpZXMoc2V0TmFtZSk7XG4gICAgLy8gVE9ETyAoa29uaWdzYmVyZyk6IHVzZSBvcHRpb25zRm9yQXhpcyBpbnN0ZWFkLlxuICAgIHZhciBsb2dzY2FsZSA9IHRoaXMuZHlncmFwaF8uYXR0cmlidXRlc18uZ2V0Rm9yU2VyaWVzKFwibG9nc2NhbGVcIiwgc2V0TmFtZSk7XG4gICAgdmFyIG91dE9mWEJvdW5kcyA9IDAsIG91dE9mWUJvdW5kcyA9IDA7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50cy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW2pdO1xuXG4gICAgICAvLyBSYW5nZSBmcm9tIDAtMSB3aGVyZSAwIHJlcHJlc2VudHMgbGVmdCBhbmQgMSByZXByZXNlbnRzIHJpZ2h0LlxuICAgICAgcG9pbnQueCA9IER5Z3JhcGhMYXlvdXQuY2FsY1hOb3JtYWxfKHBvaW50Lnh2YWwsIHRoaXMuX3hBeGlzLCBpc0xvZ3NjYWxlRm9yWCk7XG4gICAgICBvdXRPZlhCb3VuZHMgKz0gKHBvaW50LnggPCAwKSB8fCAocG9pbnQueCA+IDEpO1xuICAgICAgLy8gUmFuZ2UgZnJvbSAwLTEgd2hlcmUgMCByZXByZXNlbnRzIHRvcCBhbmQgMSByZXByZXNlbnRzIGJvdHRvbVxuICAgICAgdmFyIHl2YWwgPSBwb2ludC55dmFsO1xuICAgICAgaWYgKGlzU3RhY2tlZCkge1xuICAgICAgICBwb2ludC55X3N0YWNrZWQgPSBEeWdyYXBoTGF5b3V0LmNhbGNZTm9ybWFsXyhcbiAgICAgICAgICAgIGF4aXMsIHBvaW50Lnl2YWxfc3RhY2tlZCwgbG9nc2NhbGUpO1xuICAgICAgICBpZiAoeXZhbCAhPT0gbnVsbCAmJiAhaXNOYU4oeXZhbCkpIHtcbiAgICAgICAgICB5dmFsID0gcG9pbnQueXZhbF9zdGFja2VkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoeXZhbCA9PT0gbnVsbCkge1xuICAgICAgICB5dmFsID0gTmFOO1xuICAgICAgICBpZiAoIWNvbm5lY3RTZXBhcmF0ZWQpIHtcbiAgICAgICAgICBwb2ludC55dmFsID0gTmFOO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwb2ludC55ID0gRHlncmFwaExheW91dC5jYWxjWU5vcm1hbF8oYXhpcywgeXZhbCwgbG9nc2NhbGUpO1xuICAgICAgb3V0T2ZZQm91bmRzICs9IChwb2ludC55IDwgMCkgfHwgKHBvaW50LnkgPiAxKTtcbiAgICB9XG5cbiAgICBpZiAob3V0T2ZYQm91bmRzID4gMikge1xuICAgICAgY29uc29sZS53YXJuKG91dE9mWEJvdW5kcyArICcgcG9pbnRzIG91dCBvZiBYIGJvdW5kczonICsgdGhpcy5feEF4aXMubWludmFsICsgJyAtICcgKyB0aGlzLl94QXhpcy5tYXh2YWwpO1xuICAgIH1cbiAgICBpZiAob3V0T2ZZQm91bmRzID4gMCkge1xuICAgICAgY29uc29sZS53YXJuKG91dE9mWUJvdW5kcyArICcgcG9pbnRzIG91dCBvZiBZIGJvdW5kczonICsgYXhpcy5taW55dmFsICsgJyAtICcgKyBheGlzLm1heHl2YWwpO1xuICAgIH1cblxuICAgIHRoaXMuZHlncmFwaF8uZGF0YUhhbmRsZXJfLm9uTGluZUV2YWx1YXRlZChwb2ludHMsIGF4aXMsIGxvZ3NjYWxlKTtcbiAgfVxufTtcblxuRHlncmFwaExheW91dC5wcm90b3R5cGUuX2V2YWx1YXRlTGluZVRpY2tzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpLCB0aWNrLCBsYWJlbCwgcG9zLCB2LCBoYXNfdGljaztcbiAgdGhpcy54dGlja3MgPSBbXTtcbiAgZm9yIChpID0gMDsgaSA8IHRoaXMueFRpY2tzXy5sZW5ndGg7IGkrKykge1xuICAgIHRpY2sgPSB0aGlzLnhUaWNrc19baV07XG4gICAgbGFiZWwgPSB0aWNrLmxhYmVsO1xuICAgIGhhc190aWNrID0gISgnbGFiZWxfdicgaW4gdGljayk7XG4gICAgdiA9IGhhc190aWNrID8gdGljay52IDogdGljay5sYWJlbF92O1xuICAgIHBvcyA9IHRoaXMuZHlncmFwaF8udG9QZXJjZW50WENvb3JkKHYpO1xuICAgIGlmICgocG9zID49IDAuMCkgJiYgKHBvcyA8IDEuMCkpIHtcbiAgICAgIHRoaXMueHRpY2tzLnB1c2goe3BvcywgbGFiZWwsIGhhc190aWNrfSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy55dGlja3MgPSBbXTtcbiAgZm9yIChpID0gMDsgaSA8IHRoaXMueUF4ZXNfLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBheGlzID0gdGhpcy55QXhlc19baV07XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBheGlzLnRpY2tzLmxlbmd0aDsgaisrKSB7XG4gICAgICB0aWNrID0gYXhpcy50aWNrc1tqXTtcbiAgICAgIGxhYmVsID0gdGljay5sYWJlbDtcbiAgICAgIGhhc190aWNrID0gISgnbGFiZWxfdicgaW4gdGljayk7XG4gICAgICB2ID0gaGFzX3RpY2sgPyB0aWNrLnYgOiB0aWNrLmxhYmVsX3Y7XG4gICAgICBwb3MgPSB0aGlzLmR5Z3JhcGhfLnRvUGVyY2VudFlDb29yZCh2LCBpKTtcbiAgICAgIGlmICgocG9zID4gMC4wKSAmJiAocG9zIDw9IDEuMCkpIHtcbiAgICAgICAgdGhpcy55dGlja3MucHVzaCh7YXhpczogaSwgcG9zLCBsYWJlbCwgaGFzX3RpY2t9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbkR5Z3JhcGhMYXlvdXQucHJvdG90eXBlLl9ldmFsdWF0ZUFubm90YXRpb25zID0gZnVuY3Rpb24oKSB7XG4gIC8vIEFkZCB0aGUgYW5ub3RhdGlvbnMgdG8gdGhlIHBvaW50IHRvIHdoaWNoIHRoZXkgYmVsb25nLlxuICAvLyBNYWtlIGEgbWFwIGZyb20gKHNldE5hbWUsIHh2YWwpIHRvIGFubm90YXRpb24gZm9yIHF1aWNrIGxvb2t1cHMuXG4gIHZhciBpO1xuICB2YXIgYW5ub3RhdGlvbnMgPSB7fTtcbiAgZm9yIChpID0gMDsgaSA8IHRoaXMuYW5ub3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYSA9IHRoaXMuYW5ub3RhdGlvbnNbaV07XG4gICAgYW5ub3RhdGlvbnNbYS54dmFsICsgXCIsXCIgKyBhLnNlcmllc10gPSBhO1xuICB9XG5cbiAgdGhpcy5hbm5vdGF0ZWRfcG9pbnRzID0gW107XG5cbiAgLy8gRXhpdCB0aGUgZnVuY3Rpb24gZWFybHkgaWYgdGhlcmUgYXJlIG5vIGFubm90YXRpb25zLlxuICBpZiAoIXRoaXMuYW5ub3RhdGlvbnMgfHwgIXRoaXMuYW5ub3RhdGlvbnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gVE9ETyhhbnRyb2IpOiBsb29wIHRocm91Z2ggYW5ub3RhdGlvbnMgbm90IHBvaW50cy5cbiAgZm9yICh2YXIgc2V0SWR4ID0gMDsgc2V0SWR4IDwgdGhpcy5wb2ludHMubGVuZ3RoOyBzZXRJZHgrKykge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50c1tzZXRJZHhdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwID0gcG9pbnRzW2ldO1xuICAgICAgdmFyIGsgPSBwLnh2YWwgKyBcIixcIiArIHAubmFtZTtcbiAgICAgIGlmIChrIGluIGFubm90YXRpb25zKSB7XG4gICAgICAgIHAuYW5ub3RhdGlvbiA9IGFubm90YXRpb25zW2tdO1xuICAgICAgICB0aGlzLmFubm90YXRlZF9wb2ludHMucHVzaChwKTtcbiAgICAgICAgLy9pZiB0aGVyZSBhcmUgbXVsdGlwbGUgc2FtZSB4LXZhbHVlZCBwb2ludHMsIHRoZSBhbm5vdGF0aW9uIHdvdWxkIGJlIHJlbmRlcmVkIG11bHRpcGxlIHRpbWVzXG4gICAgICAgIC8vcmVtb3ZlIGFscmVhZHkgcmVuZGVyZWQgYW5ub3RhdGlvblxuICAgICAgICBkZWxldGUgYW5ub3RhdGlvbnNba107XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIHRvIHJlbW92ZSBhbGwgdGhlIGRhdGEgc2V0cyBmcm9tIGEgZ3JhcGhcbiAqL1xuRHlncmFwaExheW91dC5wcm90b3R5cGUucmVtb3ZlQWxsRGF0YXNldHMgPSBmdW5jdGlvbigpIHtcbiAgZGVsZXRlIHRoaXMucG9pbnRzO1xuICBkZWxldGUgdGhpcy5zZXROYW1lcztcbiAgZGVsZXRlIHRoaXMuc2V0UG9pbnRzTGVuZ3RocztcbiAgZGVsZXRlIHRoaXMuc2V0UG9pbnRzT2Zmc2V0cztcbiAgdGhpcy5wb2ludHMgPSBbXTtcbiAgdGhpcy5zZXROYW1lcyA9IFtdO1xuICB0aGlzLnNldFBvaW50c0xlbmd0aHMgPSBbXTtcbiAgdGhpcy5zZXRQb2ludHNPZmZzZXRzID0gW107XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEeWdyYXBoTGF5b3V0O1xuIl0sIm1hcHBpbmdzIjoiQUFBQSxZQUFZOztBQUVaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFBQUEsTUFBQSxDQUFBQyxjQUFBLENBQUFDLE9BQUE7RUFBQUMsS0FBQTtBQUFBO0FBQUFELE9BQUE7QUFFQSxJQUFBRSxLQUFBLEdBQUFDLHVCQUFBLENBQUFDLE9BQUE7QUFBeUMsU0FBQUQsd0JBQUFFLENBQUEsRUFBQUMsQ0FBQSw2QkFBQUMsT0FBQSxNQUFBQyxDQUFBLE9BQUFELE9BQUEsSUFBQUUsQ0FBQSxPQUFBRixP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