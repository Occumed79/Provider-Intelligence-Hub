'use strict';

/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */
/*global Dygraph:false */

/*
Current bits of jankiness:
- Uses two private APIs:
    1. Dygraph.optionsViewForAxis_
    2. dygraph.plotter_.area
- Registers for a "predraw" event, which should be renamed.
- I call calculateEmWidthInDiv more often than needed.
*/

/*global Dygraph:false */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("../dygraph-utils"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/**
 * Creates the legend, which appears when the user hovers over the chart.
 * The legend can be either a user-specified or generated div.
 *
 * @constructor
 */
var Legend = function Legend() {
  this.legend_div_ = null;
  this.is_generated_div_ = false; // do we own this div, or was it user-specified?
};
Legend.prototype.toString = function () {
  return "Legend Plugin";
};

/**
 * This is called during the dygraph constructor, after options have been set
 * but before the data is available.
 *
 * Proper tasks to do here include:
 * - Reading your own options
 * - DOM manipulation
 * - Registering event listeners
 *
 * @param {Dygraph} g Graph instance.
 * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
 */
Legend.prototype.activate = function (g) {
  var div;
  var userLabelsDiv = g.getOption('labelsDiv');
  if (userLabelsDiv && null !== userLabelsDiv) {
    if (typeof userLabelsDiv == "string" || userLabelsDiv instanceof String) {
      div = document.getElementById(userLabelsDiv);
    } else {
      div = userLabelsDiv;
    }
  } else {
    div = document.createElement("div");
    div.className = "dygraph-legend";
    // TODO(danvk): come up with a cleaner way to expose this.
    g.graphDiv.appendChild(div);
    this.is_generated_div_ = true;
  }
  this.legend_div_ = div;
  this.one_em_width_ = 10; // just a guess, will be updated.

  return {
    select: this.select,
    deselect: this.deselect,
    // TODO(danvk): rethink the name "predraw" before we commit to it in any API.
    predraw: this.predraw,
    didDrawChart: this.didDrawChart
  };
};

// Needed for dashed lines.
var calculateEmWidthInDiv = function calculateEmWidthInDiv(div) {
  var sizeSpan = document.createElement('span');
  sizeSpan.setAttribute('style', 'margin: 0; padding: 0 0 0 1em; border: 0;');
  div.appendChild(sizeSpan);
  var oneEmWidth = sizeSpan.offsetWidth;
  div.removeChild(sizeSpan);
  return oneEmWidth;
};
var escapeHTML = function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&#34;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
Legend.prototype.select = function (e) {
  var xValue = e.selectedX;
  var points = e.selectedPoints;
  var row = e.selectedRow;
  var legendMode = e.dygraph.getOption('legend');
  if (legendMode === 'never') {
    this.legend_div_.style.display = 'none';
    return;
  }
  var html = Legend.generateLegendHTML(e.dygraph, xValue, points, this.one_em_width_, row);
  if (html instanceof Node && html.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    this.legend_div_.innerHTML = '';
    this.legend_div_.appendChild(html);
  } else this.legend_div_.innerHTML = html;
  // must be done now so offsetWidth isn’t 0…
  this.legend_div_.style.display = '';
  if (legendMode === 'follow') {
    // create floating legend div
    var area = e.dygraph.plotter_.area;
    var labelsDivWidth = this.legend_div_.offsetWidth;
    var yAxisLabelWidth = e.dygraph.getOptionForAxis('axisLabelWidth', 'y');
    // find the closest data point by checking the currently highlighted series,
    // or fall back to using the first data point available
    var highlightSeries = e.dygraph.getHighlightSeries();
    var point;
    if (highlightSeries) {
      point = points.find(function (p) {
        return p.name === highlightSeries;
      });
      if (!point) point = points[0];
    } else point = points[0];
    // determine floating [left, top] coordinates of the legend div
    // within the plotter_ area
    // offset 50 px to the right and down from the first selection point
    // 50 px is guess based on mouse cursor size
    var followOffsetX = e.dygraph.getNumericOption('legendFollowOffsetX');
    var followOffsetY = e.dygraph.getNumericOption('legendFollowOffsetY');
    var leftLegend = point.x * area.w + followOffsetX;
    var topLegend = point.y * area.h + followOffsetY;

    // if legend floats to end of the chart area, it flips to the other
    // side of the selection point
    if (leftLegend + labelsDivWidth + 1 > area.w) {
      leftLegend = leftLegend - 2 * followOffsetX - labelsDivWidth - (yAxisLabelWidth - area.x);
    }
    this.legend_div_.style.left = yAxisLabelWidth + leftLegend + "px";
    this.legend_div_.style.top = topLegend + "px";
  } else if (legendMode === 'onmouseover' && this.is_generated_div_) {
    // synchronise this with Legend.prototype.predraw below
    var area = e.dygraph.plotter_.area;
    var labelsDivWidth = this.legend_div_.offsetWidth;
    this.legend_div_.style.left = area.x + area.w - labelsDivWidth - 1 + "px";
    this.legend_div_.style.top = area.y + "px";
  }
};
Legend.prototype.deselect = function (e) {
  var legendMode = e.dygraph.getOption('legend');
  if (legendMode !== 'always') {
    this.legend_div_.style.display = "none";
  }

  // Have to do this every time, since styles might have changed.
  var oneEmWidth = calculateEmWidthInDiv(this.legend_div_);
  this.one_em_width_ = oneEmWidth;
  var html = Legend.generateLegendHTML(e.dygraph, undefined, undefined, oneEmWidth, null);
  if (html instanceof Node && html.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    this.legend_div_.innerHTML = '';
    this.legend_div_.appendChild(html);
  } else this.legend_div_.innerHTML = html;
};
Legend.prototype.didDrawChart = function (e) {
  this.deselect(e);
};

// Right edge should be flush with the right edge of the charting area (which
// may not be the same as the right edge of the div, if we have two y-axes).
// TODO(danvk): is any of this really necessary? Could just set "right" in "activate".
/**
 * Position the labels div so that:
 * - its right edge is flush with the right edge of the charting area
 * - its top edge is flush with the top edge of the charting area
 * @private
 */
Legend.prototype.predraw = function (e) {
  // Don't touch a user-specified labelsDiv.
  if (!this.is_generated_div_) return;

  // TODO(danvk): only use real APIs for this.
  e.dygraph.graphDiv.appendChild(this.legend_div_);
  // synchronise this with Legend.prototype.select above
  var area = e.dygraph.plotter_.area;
  var labelsDivWidth = this.legend_div_.offsetWidth;
  this.legend_div_.style.left = area.x + area.w - labelsDivWidth - 1 + "px";
  this.legend_div_.style.top = area.y + "px";
};

/**
 * Called when dygraph.destroy() is called.
 * You should null out any references and detach any DOM elements.
 */
Legend.prototype.destroy = function () {
  this.legend_div_ = null;
};

/**
 * Generates HTML for the legend which is displayed when hovering over the
 * chart. If no selected points are specified, a default legend is returned
 * (this may just be the empty string).
 * @param {number} x The x-value of the selected points.
 * @param {Object} sel_points List of selected points for the given
 *   x-value. Should have properties like 'name', 'yval' and 'canvasy'.
 * @param {number} oneEmWidth The pixel width for 1em in the legend. Only
 *   relevant when displaying a legend with no selection (i.e. {legend:
 *   'always'}) and with dashed lines.
 * @param {number} row The selected row index.
 * @private
 */
Legend.generateLegendHTML = function (g, x, sel_points, oneEmWidth, row) {
  // Data about the selection to pass to legendFormatter
  var data = {
    dygraph: g,
    x: x,
    i: row,
    series: []
  };
  var labelToSeries = {};
  var labels = g.getLabels();
  if (labels) {
    for (var i = 1; i < labels.length; i++) {
      var series = g.getPropertiesForSeries(labels[i]);
      var strokePattern = g.getOption('strokePattern', labels[i]);
      var seriesData = {
        dashHTML: generateLegendDashHTML(strokePattern, series.color, oneEmWidth),
        label: labels[i],
        labelHTML: escapeHTML(labels[i]),
        isVisible: series.visible,
        color: series.color
      };
      data.series.push(seriesData);
      labelToSeries[labels[i]] = seriesData;
    }
  }
  if (typeof x !== 'undefined') {
    var xOptView = g.optionsViewForAxis_('x');
    var xvf = xOptView('valueFormatter');
    data.xHTML = xvf.call(g, x, xOptView, labels[0], g, row, 0);
    var yOptViews = [];
    var num_axes = g.numAxes();
    for (var i = 0; i < num_axes; i++) {
      // TODO(danvk): remove this use of a private API
      yOptViews[i] = g.optionsViewForAxis_('y' + (i ? 1 + i : ''));
    }
    var showZeros = g.getOption('labelsShowZeroValues');
    var highlightSeries = g.getHighlightSeries();
    for (i = 0; i < sel_points.length; i++) {
      var pt = sel_points[i];
      var seriesData = labelToSeries[pt.name];
      seriesData.y = pt.yval;
      if (pt.yval === 0 && !showZeros || isNaN(pt.canvasy)) {
        seriesData.isVisible = false;
        continue;
      }
      var series = g.getPropertiesForSeries(pt.name);
      var yOptView = yOptViews[series.axis - 1];
      var fmtFunc = yOptView('valueFormatter');
      var yHTML = fmtFunc.call(g, pt.yval, yOptView, pt.name, g, row, labels.indexOf(pt.name));
      utils.update(seriesData, {
        yHTML: yHTML
      });
      if (pt.name == highlightSeries) {
        seriesData.isHighlighted = true;
      }
    }
  }
  var formatter = g.getOption('legendFormatter') || Legend.defaultFormatter;
  return formatter.call(g, data);
};
Legend.defaultFormatter = function (data) {
  var g = data.dygraph;

  // TODO(danvk): deprecate this option in place of {legend: 'never'}
  // XXX should this logic be in the formatter?
  if (g.getOption('showLabelsOnHighlight') !== true) return '';
  var sepLines = g.getOption('labelsSeparateLines');
  var html;
  if (typeof data.x === 'undefined') {
    // TODO: this check is duplicated in generateLegendHTML. Put it in one place.
    if (g.getOption('legend') != 'always') {
      return '';
    }
    html = '';
    for (var i = 0; i < data.series.length; i++) {
      var series = data.series[i];
      if (!series.isVisible) continue;
      if (html !== '') html += sepLines ? '<br />' : ' ';
      html += "<span style='font-weight: bold; color: ".concat(series.color, ";'>").concat(series.dashHTML, " ").concat(series.labelHTML, "</span>");
    }
    return html;
  }
  html = data.xHTML + ':';
  for (var i = 0; i < data.series.length; i++) {
    var series = data.series[i];
    if (!series.y && !series.yHTML) continue;
    if (!series.isVisible) continue;
    if (sepLines) html += '<br>';
    var cls = series.isHighlighted ? ' class="highlight"' : '';
    html += "<span".concat(cls, "> <b><span style='color: ").concat(series.color, ";'>").concat(series.labelHTML, "</span></b>:&#160;").concat(series.yHTML, "</span>");
  }
  return html;
};

/**
 * Generates html for the "dash" displayed on the legend when using "legend: always".
 * In particular, this works for dashed lines with any stroke pattern. It will
 * try to scale the pattern to fit in 1em width. Or if small enough repeat the
 * pattern for 1em width.
 *
 * @param strokePattern The pattern
 * @param color The color of the series.
 * @param oneEmWidth The width in pixels of 1em in the legend.
 * @private
 */
// TODO(danvk): cache the results of this
function generateLegendDashHTML(strokePattern, color, oneEmWidth) {
  // Easy, common case: a solid line
  if (!strokePattern || strokePattern.length <= 1) {
    return "<div class=\"dygraph-legend-line\" style=\"border-bottom-color: ".concat(color, ";\"></div>");
  }
  var i, j, paddingLeft, marginRight;
  var strokePixelLength = 0,
    segmentLoop = 0;
  var normalizedPattern = [];
  var loop;

  // Compute the length of the pixels including the first segment twice,
  // since we repeat it.
  for (i = 0; i <= strokePattern.length; i++) {
    strokePixelLength += strokePattern[i % strokePattern.length];
  }

  // See if we can loop the pattern by itself at least twice.
  loop = Math.floor(oneEmWidth / (strokePixelLength - strokePattern[0]));
  if (loop > 1) {
    // This pattern fits at least two times, no scaling just convert to em;
    for (i = 0; i < strokePattern.length; i++) {
      normalizedPattern[i] = strokePattern[i] / oneEmWidth;
    }
    // Since we are repeating the pattern, we don't worry about repeating the
    // first segment in one draw.
    segmentLoop = normalizedPattern.length;
  } else {
    // If the pattern doesn't fit in the legend we scale it to fit.
    loop = 1;
    for (i = 0; i < strokePattern.length; i++) {
      normalizedPattern[i] = strokePattern[i] / strokePixelLength;
    }
    // For the scaled patterns we do redraw the first segment.
    segmentLoop = normalizedPattern.length + 1;
  }

  // Now make the pattern.
  var dash = "";
  for (j = 0; j < loop; j++) {
    for (i = 0; i < segmentLoop; i += 2) {
      // The padding is the drawn segment.
      paddingLeft = normalizedPattern[i % normalizedPattern.length];
      if (i < strokePattern.length) {
        // The margin is the space segment.
        marginRight = normalizedPattern[(i + 1) % normalizedPattern.length];
      } else {
        // The repeated first segment has no right margin.
        marginRight = 0;
      }
      dash += "<div class=\"dygraph-legend-dash\" style=\"margin-right: ".concat(marginRight, "em; padding-left: ").concat(paddingLeft, "em;\"></div>");
    }
  }
  return dash;
}
var _default = exports["default"] = Legend;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsInV0aWxzIiwiX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQiLCJyZXF1aXJlIiwiZSIsInQiLCJXZWFrTWFwIiwiciIsIm4iLCJfX2VzTW9kdWxlIiwibyIsImkiLCJmIiwiX19wcm90b19fIiwiaGFzIiwiZ2V0Iiwic2V0IiwiX3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJMZWdlbmQiLCJsZWdlbmRfZGl2XyIsImlzX2dlbmVyYXRlZF9kaXZfIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJhY3RpdmF0ZSIsImciLCJkaXYiLCJ1c2VyTGFiZWxzRGl2IiwiZ2V0T3B0aW9uIiwiU3RyaW5nIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJncmFwaERpdiIsImFwcGVuZENoaWxkIiwib25lX2VtX3dpZHRoXyIsInNlbGVjdCIsImRlc2VsZWN0IiwicHJlZHJhdyIsImRpZERyYXdDaGFydCIsImNhbGN1bGF0ZUVtV2lkdGhJbkRpdiIsInNpemVTcGFuIiwic2V0QXR0cmlidXRlIiwib25lRW1XaWR0aCIsIm9mZnNldFdpZHRoIiwicmVtb3ZlQ2hpbGQiLCJlc2NhcGVIVE1MIiwic3RyIiwicmVwbGFjZSIsInhWYWx1ZSIsInNlbGVjdGVkWCIsInBvaW50cyIsInNlbGVjdGVkUG9pbnRzIiwicm93Iiwic2VsZWN0ZWRSb3ciLCJsZWdlbmRNb2RlIiwiZHlncmFwaCIsInN0eWxlIiwiZGlzcGxheSIsImh0bWwiLCJnZW5lcmF0ZUxlZ2VuZEhUTUwiLCJOb2RlIiwibm9kZVR5cGUiLCJET0NVTUVOVF9GUkFHTUVOVF9OT0RFIiwiaW5uZXJIVE1MIiwiYXJlYSIsInBsb3R0ZXJfIiwibGFiZWxzRGl2V2lkdGgiLCJ5QXhpc0xhYmVsV2lkdGgiLCJnZXRPcHRpb25Gb3JBeGlzIiwiaGlnaGxpZ2h0U2VyaWVzIiwiZ2V0SGlnaGxpZ2h0U2VyaWVzIiwicG9pbnQiLCJmaW5kIiwicCIsIm5hbWUiLCJmb2xsb3dPZmZzZXRYIiwiZ2V0TnVtZXJpY09wdGlvbiIsImZvbGxvd09mZnNldFkiLCJsZWZ0TGVnZW5kIiwieCIsInciLCJ0b3BMZWdlbmQiLCJ5IiwiaCIsImxlZnQiLCJ0b3AiLCJ1bmRlZmluZWQiLCJkZXN0cm95Iiwic2VsX3BvaW50cyIsImRhdGEiLCJzZXJpZXMiLCJsYWJlbFRvU2VyaWVzIiwibGFiZWxzIiwiZ2V0TGFiZWxzIiwibGVuZ3RoIiwiZ2V0UHJvcGVydGllc0ZvclNlcmllcyIsInN0cm9rZVBhdHRlcm4iLCJzZXJpZXNEYXRhIiwiZGFzaEhUTUwiLCJnZW5lcmF0ZUxlZ2VuZERhc2hIVE1MIiwiY29sb3IiLCJsYWJlbCIsImxhYmVsSFRNTCIsImlzVmlzaWJsZSIsInZpc2libGUiLCJwdXNoIiwieE9wdFZpZXciLCJvcHRpb25zVmlld0ZvckF4aXNfIiwieHZmIiwieEhUTUwiLCJ5T3B0Vmlld3MiLCJudW1fYXhlcyIsIm51bUF4ZXMiLCJzaG93WmVyb3MiLCJwdCIsInl2YWwiLCJpc05hTiIsImNhbnZhc3kiLCJ5T3B0VmlldyIsImF4aXMiLCJmbXRGdW5jIiwieUhUTUwiLCJpbmRleE9mIiwidXBkYXRlIiwiaXNIaWdobGlnaHRlZCIsImZvcm1hdHRlciIsImRlZmF1bHRGb3JtYXR0ZXIiLCJzZXBMaW5lcyIsImNvbmNhdCIsImNscyIsImoiLCJwYWRkaW5nTGVmdCIsIm1hcmdpblJpZ2h0Iiwic3Ryb2tlUGl4ZWxMZW5ndGgiLCJzZWdtZW50TG9vcCIsIm5vcm1hbGl6ZWRQYXR0ZXJuIiwibG9vcCIsIk1hdGgiLCJmbG9vciIsImRhc2giLCJfZGVmYXVsdCIsIm1vZHVsZSIsImRlZmF1bHQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9sZWdlbmQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxMiBEYW4gVmFuZGVya2FtIChkYW52ZGtAZ21haWwuY29tKVxuICogTUlULWxpY2VuY2VkOiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2UvTUlUXG4gKi9cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cblxuLypcbkN1cnJlbnQgYml0cyBvZiBqYW5raW5lc3M6XG4tIFVzZXMgdHdvIHByaXZhdGUgQVBJczpcbiAgICAxLiBEeWdyYXBoLm9wdGlvbnNWaWV3Rm9yQXhpc19cbiAgICAyLiBkeWdyYXBoLnBsb3R0ZXJfLmFyZWFcbi0gUmVnaXN0ZXJzIGZvciBhIFwicHJlZHJhd1wiIGV2ZW50LCB3aGljaCBzaG91bGQgYmUgcmVuYW1lZC5cbi0gSSBjYWxsIGNhbGN1bGF0ZUVtV2lkdGhJbkRpdiBtb3JlIG9mdGVuIHRoYW4gbmVlZGVkLlxuKi9cblxuLypnbG9iYWwgRHlncmFwaDpmYWxzZSAqL1xuXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuLi9keWdyYXBoLXV0aWxzJztcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBsZWdlbmQsIHdoaWNoIGFwcGVhcnMgd2hlbiB0aGUgdXNlciBob3ZlcnMgb3ZlciB0aGUgY2hhcnQuXG4gKiBUaGUgbGVnZW5kIGNhbiBiZSBlaXRoZXIgYSB1c2VyLXNwZWNpZmllZCBvciBnZW5lcmF0ZWQgZGl2LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgTGVnZW5kID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubGVnZW5kX2Rpdl8gPSBudWxsO1xuICB0aGlzLmlzX2dlbmVyYXRlZF9kaXZfID0gZmFsc2U7ICAvLyBkbyB3ZSBvd24gdGhpcyBkaXYsIG9yIHdhcyBpdCB1c2VyLXNwZWNpZmllZD9cbn07XG5cbkxlZ2VuZC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFwiTGVnZW5kIFBsdWdpblwiO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIGNhbGxlZCBkdXJpbmcgdGhlIGR5Z3JhcGggY29uc3RydWN0b3IsIGFmdGVyIG9wdGlvbnMgaGF2ZSBiZWVuIHNldFxuICogYnV0IGJlZm9yZSB0aGUgZGF0YSBpcyBhdmFpbGFibGUuXG4gKlxuICogUHJvcGVyIHRhc2tzIHRvIGRvIGhlcmUgaW5jbHVkZTpcbiAqIC0gUmVhZGluZyB5b3VyIG93biBvcHRpb25zXG4gKiAtIERPTSBtYW5pcHVsYXRpb25cbiAqIC0gUmVnaXN0ZXJpbmcgZXZlbnQgbGlzdGVuZXJzXG4gKlxuICogQHBhcmFtIHtEeWdyYXBofSBnIEdyYXBoIGluc3RhbmNlLlxuICogQHJldHVybiB7b2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uKGV2KT59IE1hcHBpbmcgb2YgZXZlbnQgbmFtZXMgdG8gY2FsbGJhY2tzLlxuICovXG5MZWdlbmQucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oZykge1xuICB2YXIgZGl2O1xuXG4gIHZhciB1c2VyTGFiZWxzRGl2ID0gZy5nZXRPcHRpb24oJ2xhYmVsc0RpdicpO1xuICBpZiAodXNlckxhYmVsc0RpdiAmJiBudWxsICE9PSB1c2VyTGFiZWxzRGl2KSB7XG4gICAgaWYgKHR5cGVvZih1c2VyTGFiZWxzRGl2KSA9PSBcInN0cmluZ1wiIHx8IHVzZXJMYWJlbHNEaXYgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgIGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHVzZXJMYWJlbHNEaXYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXYgPSB1c2VyTGFiZWxzRGl2O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdi5jbGFzc05hbWUgPSBcImR5Z3JhcGgtbGVnZW5kXCI7XG4gICAgLy8gVE9ETyhkYW52ayk6IGNvbWUgdXAgd2l0aCBhIGNsZWFuZXIgd2F5IHRvIGV4cG9zZSB0aGlzLlxuICAgIGcuZ3JhcGhEaXYuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB0aGlzLmlzX2dlbmVyYXRlZF9kaXZfID0gdHJ1ZTtcbiAgfVxuXG4gIHRoaXMubGVnZW5kX2Rpdl8gPSBkaXY7XG4gIHRoaXMub25lX2VtX3dpZHRoXyA9IDEwOyAgLy8ganVzdCBhIGd1ZXNzLCB3aWxsIGJlIHVwZGF0ZWQuXG5cbiAgcmV0dXJuIHtcbiAgICBzZWxlY3Q6IHRoaXMuc2VsZWN0LFxuICAgIGRlc2VsZWN0OiB0aGlzLmRlc2VsZWN0LFxuICAgIC8vIFRPRE8oZGFudmspOiByZXRoaW5rIHRoZSBuYW1lIFwicHJlZHJhd1wiIGJlZm9yZSB3ZSBjb21taXQgdG8gaXQgaW4gYW55IEFQSS5cbiAgICBwcmVkcmF3OiB0aGlzLnByZWRyYXcsXG4gICAgZGlkRHJhd0NoYXJ0OiB0aGlzLmRpZERyYXdDaGFydFxuICB9O1xufTtcblxuLy8gTmVlZGVkIGZvciBkYXNoZWQgbGluZXMuXG52YXIgY2FsY3VsYXRlRW1XaWR0aEluRGl2ID0gZnVuY3Rpb24oZGl2KSB7XG4gIHZhciBzaXplU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgc2l6ZVNwYW4uc2V0QXR0cmlidXRlKCdzdHlsZScsICdtYXJnaW46IDA7IHBhZGRpbmc6IDAgMCAwIDFlbTsgYm9yZGVyOiAwOycpO1xuICBkaXYuYXBwZW5kQ2hpbGQoc2l6ZVNwYW4pO1xuICB2YXIgb25lRW1XaWR0aD1zaXplU3Bhbi5vZmZzZXRXaWR0aDtcbiAgZGl2LnJlbW92ZUNoaWxkKHNpemVTcGFuKTtcbiAgcmV0dXJuIG9uZUVtV2lkdGg7XG59O1xuXG52YXIgZXNjYXBlSFRNTCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKS5yZXBsYWNlKC9cIi9nLCBcIiYjMzQ7XCIpLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpO1xufTtcblxuTGVnZW5kLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbihlKSB7XG4gIHZhciB4VmFsdWUgPSBlLnNlbGVjdGVkWDtcbiAgdmFyIHBvaW50cyA9IGUuc2VsZWN0ZWRQb2ludHM7XG4gIHZhciByb3cgPSBlLnNlbGVjdGVkUm93O1xuXG4gIHZhciBsZWdlbmRNb2RlID0gZS5keWdyYXBoLmdldE9wdGlvbignbGVnZW5kJyk7XG4gIGlmIChsZWdlbmRNb2RlID09PSAnbmV2ZXInKSB7XG4gICAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBodG1sID0gTGVnZW5kLmdlbmVyYXRlTGVnZW5kSFRNTChlLmR5Z3JhcGgsIHhWYWx1ZSwgcG9pbnRzLCB0aGlzLm9uZV9lbV93aWR0aF8sIHJvdyk7XG4gIGlmIChodG1sIGluc3RhbmNlb2YgTm9kZSAmJiBodG1sLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUpIHtcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMubGVnZW5kX2Rpdl8uYXBwZW5kQ2hpbGQoaHRtbCk7XG4gIH0gZWxzZVxuICAgIHRoaXMubGVnZW5kX2Rpdl8uaW5uZXJIVE1MID0gaHRtbDtcbiAgLy8gbXVzdCBiZSBkb25lIG5vdyBzbyBvZmZzZXRXaWR0aCBpc27igJl0IDDigKZcbiAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cbiAgaWYgKGxlZ2VuZE1vZGUgPT09ICdmb2xsb3cnKSB7XG4gICAgLy8gY3JlYXRlIGZsb2F0aW5nIGxlZ2VuZCBkaXZcbiAgICB2YXIgYXJlYSA9IGUuZHlncmFwaC5wbG90dGVyXy5hcmVhO1xuICAgIHZhciBsYWJlbHNEaXZXaWR0aCA9IHRoaXMubGVnZW5kX2Rpdl8ub2Zmc2V0V2lkdGg7XG4gICAgdmFyIHlBeGlzTGFiZWxXaWR0aCA9IGUuZHlncmFwaC5nZXRPcHRpb25Gb3JBeGlzKCdheGlzTGFiZWxXaWR0aCcsICd5Jyk7XG4gICAgLy8gZmluZCB0aGUgY2xvc2VzdCBkYXRhIHBvaW50IGJ5IGNoZWNraW5nIHRoZSBjdXJyZW50bHkgaGlnaGxpZ2h0ZWQgc2VyaWVzLFxuICAgIC8vIG9yIGZhbGwgYmFjayB0byB1c2luZyB0aGUgZmlyc3QgZGF0YSBwb2ludCBhdmFpbGFibGVcbiAgICB2YXIgaGlnaGxpZ2h0U2VyaWVzID0gZS5keWdyYXBoLmdldEhpZ2hsaWdodFNlcmllcygpXG4gICAgdmFyIHBvaW50O1xuICAgIGlmIChoaWdobGlnaHRTZXJpZXMpIHtcbiAgICAgIHBvaW50ID0gcG9pbnRzLmZpbmQocCA9PiBwLm5hbWUgPT09IGhpZ2hsaWdodFNlcmllcyk7XG4gICAgICBpZiAoIXBvaW50KVxuICAgICAgICBwb2ludCA9IHBvaW50c1swXTtcbiAgICB9IGVsc2VcbiAgICAgIHBvaW50ID0gcG9pbnRzWzBdO1xuICAgIC8vIGRldGVybWluZSBmbG9hdGluZyBbbGVmdCwgdG9wXSBjb29yZGluYXRlcyBvZiB0aGUgbGVnZW5kIGRpdlxuICAgIC8vIHdpdGhpbiB0aGUgcGxvdHRlcl8gYXJlYVxuICAgIC8vIG9mZnNldCA1MCBweCB0byB0aGUgcmlnaHQgYW5kIGRvd24gZnJvbSB0aGUgZmlyc3Qgc2VsZWN0aW9uIHBvaW50XG4gICAgLy8gNTAgcHggaXMgZ3Vlc3MgYmFzZWQgb24gbW91c2UgY3Vyc29yIHNpemVcbiAgICBjb25zdCBmb2xsb3dPZmZzZXRYID0gZS5keWdyYXBoLmdldE51bWVyaWNPcHRpb24oJ2xlZ2VuZEZvbGxvd09mZnNldFgnKTtcbiAgICBjb25zdCBmb2xsb3dPZmZzZXRZID0gZS5keWdyYXBoLmdldE51bWVyaWNPcHRpb24oJ2xlZ2VuZEZvbGxvd09mZnNldFknKTtcbiAgICB2YXIgbGVmdExlZ2VuZCA9IHBvaW50LnggKiBhcmVhLncgKyBmb2xsb3dPZmZzZXRYO1xuICAgIHZhciB0b3BMZWdlbmQgID0gcG9pbnQueSAqIGFyZWEuaCArIGZvbGxvd09mZnNldFk7XG5cbiAgICAvLyBpZiBsZWdlbmQgZmxvYXRzIHRvIGVuZCBvZiB0aGUgY2hhcnQgYXJlYSwgaXQgZmxpcHMgdG8gdGhlIG90aGVyXG4gICAgLy8gc2lkZSBvZiB0aGUgc2VsZWN0aW9uIHBvaW50XG4gICAgaWYgKChsZWZ0TGVnZW5kICsgbGFiZWxzRGl2V2lkdGggKyAxKSA+IGFyZWEudykge1xuICAgICAgbGVmdExlZ2VuZCA9IGxlZnRMZWdlbmQgLSAyICogZm9sbG93T2Zmc2V0WCAtIGxhYmVsc0RpdldpZHRoIC0gKHlBeGlzTGFiZWxXaWR0aCAtIGFyZWEueCk7XG4gICAgfVxuXG4gICAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS5sZWZ0ID0geUF4aXNMYWJlbFdpZHRoICsgbGVmdExlZ2VuZCArIFwicHhcIjtcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLnN0eWxlLnRvcCA9IHRvcExlZ2VuZCArIFwicHhcIjtcbiAgfSBlbHNlIGlmIChsZWdlbmRNb2RlID09PSAnb25tb3VzZW92ZXInICYmIHRoaXMuaXNfZ2VuZXJhdGVkX2Rpdl8pIHtcbiAgICAvLyBzeW5jaHJvbmlzZSB0aGlzIHdpdGggTGVnZW5kLnByb3RvdHlwZS5wcmVkcmF3IGJlbG93XG4gICAgdmFyIGFyZWEgPSBlLmR5Z3JhcGgucGxvdHRlcl8uYXJlYTtcbiAgICB2YXIgbGFiZWxzRGl2V2lkdGggPSB0aGlzLmxlZ2VuZF9kaXZfLm9mZnNldFdpZHRoO1xuICAgIHRoaXMubGVnZW5kX2Rpdl8uc3R5bGUubGVmdCA9IGFyZWEueCArIGFyZWEudyAtIGxhYmVsc0RpdldpZHRoIC0gMSArIFwicHhcIjtcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLnN0eWxlLnRvcCA9IGFyZWEueSArIFwicHhcIjtcbiAgfVxufTtcblxuTGVnZW5kLnByb3RvdHlwZS5kZXNlbGVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIGxlZ2VuZE1vZGUgPSBlLmR5Z3JhcGguZ2V0T3B0aW9uKCdsZWdlbmQnKTtcbiAgaWYgKGxlZ2VuZE1vZGUgIT09ICdhbHdheXMnKSB7XG4gICAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIH1cblxuICAvLyBIYXZlIHRvIGRvIHRoaXMgZXZlcnkgdGltZSwgc2luY2Ugc3R5bGVzIG1pZ2h0IGhhdmUgY2hhbmdlZC5cbiAgdmFyIG9uZUVtV2lkdGggPSBjYWxjdWxhdGVFbVdpZHRoSW5EaXYodGhpcy5sZWdlbmRfZGl2Xyk7XG4gIHRoaXMub25lX2VtX3dpZHRoXyA9IG9uZUVtV2lkdGg7XG5cbiAgdmFyIGh0bWwgPSBMZWdlbmQuZ2VuZXJhdGVMZWdlbmRIVE1MKGUuZHlncmFwaCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG9uZUVtV2lkdGgsIG51bGwpO1xuICBpZiAoaHRtbCBpbnN0YW5jZW9mIE5vZGUgJiYgaHRtbC5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFKSB7XG4gICAgdGhpcy5sZWdlbmRfZGl2Xy5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLmFwcGVuZENoaWxkKGh0bWwpO1xuICB9IGVsc2VcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLmlubmVySFRNTCA9IGh0bWw7XG59O1xuXG5MZWdlbmQucHJvdG90eXBlLmRpZERyYXdDaGFydCA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5kZXNlbGVjdChlKTtcbn07XG5cbi8vIFJpZ2h0IGVkZ2Ugc2hvdWxkIGJlIGZsdXNoIHdpdGggdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGNoYXJ0aW5nIGFyZWEgKHdoaWNoXG4vLyBtYXkgbm90IGJlIHRoZSBzYW1lIGFzIHRoZSByaWdodCBlZGdlIG9mIHRoZSBkaXYsIGlmIHdlIGhhdmUgdHdvIHktYXhlcykuXG4vLyBUT0RPKGRhbnZrKTogaXMgYW55IG9mIHRoaXMgcmVhbGx5IG5lY2Vzc2FyeT8gQ291bGQganVzdCBzZXQgXCJyaWdodFwiIGluIFwiYWN0aXZhdGVcIi5cbi8qKlxuICogUG9zaXRpb24gdGhlIGxhYmVscyBkaXYgc28gdGhhdDpcbiAqIC0gaXRzIHJpZ2h0IGVkZ2UgaXMgZmx1c2ggd2l0aCB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgY2hhcnRpbmcgYXJlYVxuICogLSBpdHMgdG9wIGVkZ2UgaXMgZmx1c2ggd2l0aCB0aGUgdG9wIGVkZ2Ugb2YgdGhlIGNoYXJ0aW5nIGFyZWFcbiAqIEBwcml2YXRlXG4gKi9cbkxlZ2VuZC5wcm90b3R5cGUucHJlZHJhdyA9IGZ1bmN0aW9uKGUpIHtcbiAgLy8gRG9uJ3QgdG91Y2ggYSB1c2VyLXNwZWNpZmllZCBsYWJlbHNEaXYuXG4gIGlmICghdGhpcy5pc19nZW5lcmF0ZWRfZGl2XykgcmV0dXJuO1xuXG4gIC8vIFRPRE8oZGFudmspOiBvbmx5IHVzZSByZWFsIEFQSXMgZm9yIHRoaXMuXG4gIGUuZHlncmFwaC5ncmFwaERpdi5hcHBlbmRDaGlsZCh0aGlzLmxlZ2VuZF9kaXZfKTtcbiAgLy8gc3luY2hyb25pc2UgdGhpcyB3aXRoIExlZ2VuZC5wcm90b3R5cGUuc2VsZWN0IGFib3ZlXG4gIHZhciBhcmVhID0gZS5keWdyYXBoLnBsb3R0ZXJfLmFyZWE7XG4gIHZhciBsYWJlbHNEaXZXaWR0aCA9IHRoaXMubGVnZW5kX2Rpdl8ub2Zmc2V0V2lkdGg7XG4gIHRoaXMubGVnZW5kX2Rpdl8uc3R5bGUubGVmdCA9IGFyZWEueCArIGFyZWEudyAtIGxhYmVsc0RpdldpZHRoIC0gMSArIFwicHhcIjtcbiAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS50b3AgPSBhcmVhLnkgKyBcInB4XCI7XG59O1xuXG4vKipcbiAqIENhbGxlZCB3aGVuIGR5Z3JhcGguZGVzdHJveSgpIGlzIGNhbGxlZC5cbiAqIFlvdSBzaG91bGQgbnVsbCBvdXQgYW55IHJlZmVyZW5jZXMgYW5kIGRldGFjaCBhbnkgRE9NIGVsZW1lbnRzLlxuICovXG5MZWdlbmQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5sZWdlbmRfZGl2XyA9IG51bGw7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBIVE1MIGZvciB0aGUgbGVnZW5kIHdoaWNoIGlzIGRpc3BsYXllZCB3aGVuIGhvdmVyaW5nIG92ZXIgdGhlXG4gKiBjaGFydC4gSWYgbm8gc2VsZWN0ZWQgcG9pbnRzIGFyZSBzcGVjaWZpZWQsIGEgZGVmYXVsdCBsZWdlbmQgaXMgcmV0dXJuZWRcbiAqICh0aGlzIG1heSBqdXN0IGJlIHRoZSBlbXB0eSBzdHJpbmcpLlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIHgtdmFsdWUgb2YgdGhlIHNlbGVjdGVkIHBvaW50cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzZWxfcG9pbnRzIExpc3Qgb2Ygc2VsZWN0ZWQgcG9pbnRzIGZvciB0aGUgZ2l2ZW5cbiAqICAgeC12YWx1ZS4gU2hvdWxkIGhhdmUgcHJvcGVydGllcyBsaWtlICduYW1lJywgJ3l2YWwnIGFuZCAnY2FudmFzeScuXG4gKiBAcGFyYW0ge251bWJlcn0gb25lRW1XaWR0aCBUaGUgcGl4ZWwgd2lkdGggZm9yIDFlbSBpbiB0aGUgbGVnZW5kLiBPbmx5XG4gKiAgIHJlbGV2YW50IHdoZW4gZGlzcGxheWluZyBhIGxlZ2VuZCB3aXRoIG5vIHNlbGVjdGlvbiAoaS5lLiB7bGVnZW5kOlxuICogICAnYWx3YXlzJ30pIGFuZCB3aXRoIGRhc2hlZCBsaW5lcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSByb3cgVGhlIHNlbGVjdGVkIHJvdyBpbmRleC5cbiAqIEBwcml2YXRlXG4gKi9cbkxlZ2VuZC5nZW5lcmF0ZUxlZ2VuZEhUTUwgPSBmdW5jdGlvbihnLCB4LCBzZWxfcG9pbnRzLCBvbmVFbVdpZHRoLCByb3cpIHtcbiAgLy8gRGF0YSBhYm91dCB0aGUgc2VsZWN0aW9uIHRvIHBhc3MgdG8gbGVnZW5kRm9ybWF0dGVyXG4gIHZhciBkYXRhID0ge1xuICAgIGR5Z3JhcGg6IGcsXG4gICAgeDogeCxcbiAgICBpOiByb3csXG4gICAgc2VyaWVzOiBbXVxuICB9O1xuXG4gIHZhciBsYWJlbFRvU2VyaWVzID0ge307XG4gIHZhciBsYWJlbHMgPSBnLmdldExhYmVscygpO1xuICBpZiAobGFiZWxzKSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzZXJpZXMgPSBnLmdldFByb3BlcnRpZXNGb3JTZXJpZXMobGFiZWxzW2ldKTtcbiAgICAgIHZhciBzdHJva2VQYXR0ZXJuID0gZy5nZXRPcHRpb24oJ3N0cm9rZVBhdHRlcm4nLCBsYWJlbHNbaV0pO1xuICAgICAgdmFyIHNlcmllc0RhdGEgPSB7XG4gICAgICAgIGRhc2hIVE1MOiBnZW5lcmF0ZUxlZ2VuZERhc2hIVE1MKHN0cm9rZVBhdHRlcm4sIHNlcmllcy5jb2xvciwgb25lRW1XaWR0aCksXG4gICAgICAgIGxhYmVsOiBsYWJlbHNbaV0sXG4gICAgICAgIGxhYmVsSFRNTDogZXNjYXBlSFRNTChsYWJlbHNbaV0pLFxuICAgICAgICBpc1Zpc2libGU6IHNlcmllcy52aXNpYmxlLFxuICAgICAgICBjb2xvcjogc2VyaWVzLmNvbG9yXG4gICAgICB9O1xuXG4gICAgICBkYXRhLnNlcmllcy5wdXNoKHNlcmllc0RhdGEpO1xuICAgICAgbGFiZWxUb1Nlcmllc1tsYWJlbHNbaV1dID0gc2VyaWVzRGF0YTtcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mKHgpICE9PSAndW5kZWZpbmVkJykge1xuICAgIHZhciB4T3B0VmlldyA9IGcub3B0aW9uc1ZpZXdGb3JBeGlzXygneCcpO1xuICAgIHZhciB4dmYgPSB4T3B0VmlldygndmFsdWVGb3JtYXR0ZXInKTtcbiAgICBkYXRhLnhIVE1MID0geHZmLmNhbGwoZywgeCwgeE9wdFZpZXcsIGxhYmVsc1swXSwgZywgcm93LCAwKTtcblxuICAgIHZhciB5T3B0Vmlld3MgPSBbXTtcbiAgICB2YXIgbnVtX2F4ZXMgPSBnLm51bUF4ZXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bV9heGVzOyBpKyspIHtcbiAgICAgIC8vIFRPRE8oZGFudmspOiByZW1vdmUgdGhpcyB1c2Ugb2YgYSBwcml2YXRlIEFQSVxuICAgICAgeU9wdFZpZXdzW2ldID0gZy5vcHRpb25zVmlld0ZvckF4aXNfKCd5JyArIChpID8gMSArIGkgOiAnJykpO1xuICAgIH1cblxuICAgIHZhciBzaG93WmVyb3MgPSBnLmdldE9wdGlvbignbGFiZWxzU2hvd1plcm9WYWx1ZXMnKTtcbiAgICB2YXIgaGlnaGxpZ2h0U2VyaWVzID0gZy5nZXRIaWdobGlnaHRTZXJpZXMoKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2VsX3BvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHB0ID0gc2VsX3BvaW50c1tpXTtcbiAgICAgIHZhciBzZXJpZXNEYXRhID0gbGFiZWxUb1Nlcmllc1twdC5uYW1lXTtcbiAgICAgIHNlcmllc0RhdGEueSA9IHB0Lnl2YWw7XG5cbiAgICAgIGlmICgocHQueXZhbCA9PT0gMCAmJiAhc2hvd1plcm9zKSB8fCBpc05hTihwdC5jYW52YXN5KSkge1xuICAgICAgICBzZXJpZXNEYXRhLmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlcmllcyA9IGcuZ2V0UHJvcGVydGllc0ZvclNlcmllcyhwdC5uYW1lKTtcbiAgICAgIHZhciB5T3B0VmlldyA9IHlPcHRWaWV3c1tzZXJpZXMuYXhpcyAtIDFdO1xuICAgICAgdmFyIGZtdEZ1bmMgPSB5T3B0VmlldygndmFsdWVGb3JtYXR0ZXInKTtcbiAgICAgIHZhciB5SFRNTCA9IGZtdEZ1bmMuY2FsbChnLCBwdC55dmFsLCB5T3B0VmlldywgcHQubmFtZSwgZywgcm93LCBsYWJlbHMuaW5kZXhPZihwdC5uYW1lKSk7XG5cbiAgICAgIHV0aWxzLnVwZGF0ZShzZXJpZXNEYXRhLCB7eUhUTUx9KTtcblxuICAgICAgaWYgKHB0Lm5hbWUgPT0gaGlnaGxpZ2h0U2VyaWVzKSB7XG4gICAgICAgIHNlcmllc0RhdGEuaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGZvcm1hdHRlciA9IChnLmdldE9wdGlvbignbGVnZW5kRm9ybWF0dGVyJykgfHwgTGVnZW5kLmRlZmF1bHRGb3JtYXR0ZXIpO1xuICByZXR1cm4gZm9ybWF0dGVyLmNhbGwoZywgZGF0YSk7XG59XG5cbkxlZ2VuZC5kZWZhdWx0Rm9ybWF0dGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgZyA9IGRhdGEuZHlncmFwaDtcblxuICAvLyBUT0RPKGRhbnZrKTogZGVwcmVjYXRlIHRoaXMgb3B0aW9uIGluIHBsYWNlIG9mIHtsZWdlbmQ6ICduZXZlcid9XG4gIC8vIFhYWCBzaG91bGQgdGhpcyBsb2dpYyBiZSBpbiB0aGUgZm9ybWF0dGVyP1xuICBpZiAoZy5nZXRPcHRpb24oJ3Nob3dMYWJlbHNPbkhpZ2hsaWdodCcpICE9PSB0cnVlKSByZXR1cm4gJyc7XG5cbiAgdmFyIHNlcExpbmVzID0gZy5nZXRPcHRpb24oJ2xhYmVsc1NlcGFyYXRlTGluZXMnKTtcbiAgdmFyIGh0bWw7XG5cbiAgaWYgKHR5cGVvZihkYXRhLngpID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vIFRPRE86IHRoaXMgY2hlY2sgaXMgZHVwbGljYXRlZCBpbiBnZW5lcmF0ZUxlZ2VuZEhUTUwuIFB1dCBpdCBpbiBvbmUgcGxhY2UuXG4gICAgaWYgKGcuZ2V0T3B0aW9uKCdsZWdlbmQnKSAhPSAnYWx3YXlzJykge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGh0bWwgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuc2VyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VyaWVzID0gZGF0YS5zZXJpZXNbaV07XG4gICAgICBpZiAoIXNlcmllcy5pc1Zpc2libGUpIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoaHRtbCAhPT0gJycpIGh0bWwgKz0gKHNlcExpbmVzID8gJzxiciAvPicgOiAnICcpO1xuICAgICAgaHRtbCArPSBgPHNwYW4gc3R5bGU9J2ZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjogJHtzZXJpZXMuY29sb3J9Oyc+JHtzZXJpZXMuZGFzaEhUTUx9ICR7c2VyaWVzLmxhYmVsSFRNTH08L3NwYW4+YDtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBodG1sID0gZGF0YS54SFRNTCArICc6JztcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnNlcmllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzZXJpZXMgPSBkYXRhLnNlcmllc1tpXTtcbiAgICBpZiAoIXNlcmllcy55ICYmICFzZXJpZXMueUhUTUwpIGNvbnRpbnVlO1xuICAgIGlmICghc2VyaWVzLmlzVmlzaWJsZSkgY29udGludWU7XG4gICAgaWYgKHNlcExpbmVzKSBodG1sICs9ICc8YnI+JztcbiAgICB2YXIgY2xzID0gc2VyaWVzLmlzSGlnaGxpZ2h0ZWQgPyAnIGNsYXNzPVwiaGlnaGxpZ2h0XCInIDogJyc7XG4gICAgaHRtbCArPSBgPHNwYW4ke2Nsc30+IDxiPjxzcGFuIHN0eWxlPSdjb2xvcjogJHtzZXJpZXMuY29sb3J9Oyc+JHtzZXJpZXMubGFiZWxIVE1MfTwvc3Bhbj48L2I+OiYjMTYwOyR7c2VyaWVzLnlIVE1MfTwvc3Bhbj5gO1xuICB9XG4gIHJldHVybiBodG1sO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgaHRtbCBmb3IgdGhlIFwiZGFzaFwiIGRpc3BsYXllZCBvbiB0aGUgbGVnZW5kIHdoZW4gdXNpbmcgXCJsZWdlbmQ6IGFsd2F5c1wiLlxuICogSW4gcGFydGljdWxhciwgdGhpcyB3b3JrcyBmb3IgZGFzaGVkIGxpbmVzIHdpdGggYW55IHN0cm9rZSBwYXR0ZXJuLiBJdCB3aWxsXG4gKiB0cnkgdG8gc2NhbGUgdGhlIHBhdHRlcm4gdG8gZml0IGluIDFlbSB3aWR0aC4gT3IgaWYgc21hbGwgZW5vdWdoIHJlcGVhdCB0aGVcbiAqIHBhdHRlcm4gZm9yIDFlbSB3aWR0aC5cbiAqXG4gKiBAcGFyYW0gc3Ryb2tlUGF0dGVybiBUaGUgcGF0dGVyblxuICogQHBhcmFtIGNvbG9yIFRoZSBjb2xvciBvZiB0aGUgc2VyaWVzLlxuICogQHBhcmFtIG9uZUVtV2lkdGggVGhlIHdpZHRoIGluIHBpeGVscyBvZiAxZW0gaW4gdGhlIGxlZ2VuZC5cbiAqIEBwcml2YXRlXG4gKi9cbi8vIFRPRE8oZGFudmspOiBjYWNoZSB0aGUgcmVzdWx0cyBvZiB0aGlzXG5mdW5jdGlvbiBnZW5lcmF0ZUxlZ2VuZERhc2hIVE1MKHN0cm9rZVBhdHRlcm4sIGNvbG9yLCBvbmVFbVdpZHRoKSB7XG4gIC8vIEVhc3ksIGNvbW1vbiBjYXNlOiBhIHNvbGlkIGxpbmVcbiAgaWYgKCFzdHJva2VQYXR0ZXJuIHx8IHN0cm9rZVBhdHRlcm4ubGVuZ3RoIDw9IDEpIHtcbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJkeWdyYXBoLWxlZ2VuZC1saW5lXCIgc3R5bGU9XCJib3JkZXItYm90dG9tLWNvbG9yOiAke2NvbG9yfTtcIj48L2Rpdj5gO1xuICB9XG5cbiAgdmFyIGksIGosIHBhZGRpbmdMZWZ0LCBtYXJnaW5SaWdodDtcbiAgdmFyIHN0cm9rZVBpeGVsTGVuZ3RoID0gMCwgc2VnbWVudExvb3AgPSAwO1xuICB2YXIgbm9ybWFsaXplZFBhdHRlcm4gPSBbXTtcbiAgdmFyIGxvb3A7XG5cbiAgLy8gQ29tcHV0ZSB0aGUgbGVuZ3RoIG9mIHRoZSBwaXhlbHMgaW5jbHVkaW5nIHRoZSBmaXJzdCBzZWdtZW50IHR3aWNlLFxuICAvLyBzaW5jZSB3ZSByZXBlYXQgaXQuXG4gIGZvciAoaSA9IDA7IGkgPD0gc3Ryb2tlUGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgIHN0cm9rZVBpeGVsTGVuZ3RoICs9IHN0cm9rZVBhdHRlcm5baSVzdHJva2VQYXR0ZXJuLmxlbmd0aF07XG4gIH1cblxuICAvLyBTZWUgaWYgd2UgY2FuIGxvb3AgdGhlIHBhdHRlcm4gYnkgaXRzZWxmIGF0IGxlYXN0IHR3aWNlLlxuICBsb29wID0gTWF0aC5mbG9vcihvbmVFbVdpZHRoLyhzdHJva2VQaXhlbExlbmd0aC1zdHJva2VQYXR0ZXJuWzBdKSk7XG4gIGlmIChsb29wID4gMSkge1xuICAgIC8vIFRoaXMgcGF0dGVybiBmaXRzIGF0IGxlYXN0IHR3byB0aW1lcywgbm8gc2NhbGluZyBqdXN0IGNvbnZlcnQgdG8gZW07XG4gICAgZm9yIChpID0gMDsgaSA8IHN0cm9rZVBhdHRlcm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5vcm1hbGl6ZWRQYXR0ZXJuW2ldID0gc3Ryb2tlUGF0dGVybltpXS9vbmVFbVdpZHRoO1xuICAgIH1cbiAgICAvLyBTaW5jZSB3ZSBhcmUgcmVwZWF0aW5nIHRoZSBwYXR0ZXJuLCB3ZSBkb24ndCB3b3JyeSBhYm91dCByZXBlYXRpbmcgdGhlXG4gICAgLy8gZmlyc3Qgc2VnbWVudCBpbiBvbmUgZHJhdy5cbiAgICBzZWdtZW50TG9vcCA9IG5vcm1hbGl6ZWRQYXR0ZXJuLmxlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICAvLyBJZiB0aGUgcGF0dGVybiBkb2Vzbid0IGZpdCBpbiB0aGUgbGVnZW5kIHdlIHNjYWxlIGl0IHRvIGZpdC5cbiAgICBsb29wID0gMTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc3Ryb2tlUGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgICAgbm9ybWFsaXplZFBhdHRlcm5baV0gPSBzdHJva2VQYXR0ZXJuW2ldL3N0cm9rZVBpeGVsTGVuZ3RoO1xuICAgIH1cbiAgICAvLyBGb3IgdGhlIHNjYWxlZCBwYXR0ZXJucyB3ZSBkbyByZWRyYXcgdGhlIGZpcnN0IHNlZ21lbnQuXG4gICAgc2VnbWVudExvb3AgPSBub3JtYWxpemVkUGF0dGVybi5sZW5ndGgrMTtcbiAgfVxuXG4gIC8vIE5vdyBtYWtlIHRoZSBwYXR0ZXJuLlxuICB2YXIgZGFzaCA9IFwiXCI7XG4gIGZvciAoaiA9IDA7IGogPCBsb29wOyBqKyspIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2VnbWVudExvb3A7IGkrPTIpIHtcbiAgICAgIC8vIFRoZSBwYWRkaW5nIGlzIHRoZSBkcmF3biBzZWdtZW50LlxuICAgICAgcGFkZGluZ0xlZnQgPSBub3JtYWxpemVkUGF0dGVybltpJW5vcm1hbGl6ZWRQYXR0ZXJuLmxlbmd0aF07XG4gICAgICBpZiAoaSA8IHN0cm9rZVBhdHRlcm4ubGVuZ3RoKSB7XG4gICAgICAgIC8vIFRoZSBtYXJnaW4gaXMgdGhlIHNwYWNlIHNlZ21lbnQuXG4gICAgICAgIG1hcmdpblJpZ2h0ID0gbm9ybWFsaXplZFBhdHRlcm5bKGkrMSklbm9ybWFsaXplZFBhdHRlcm4ubGVuZ3RoXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSByZXBlYXRlZCBmaXJzdCBzZWdtZW50IGhhcyBubyByaWdodCBtYXJnaW4uXG4gICAgICAgIG1hcmdpblJpZ2h0ID0gMDtcbiAgICAgIH1cbiAgICAgIGRhc2ggKz0gYDxkaXYgY2xhc3M9XCJkeWdyYXBoLWxlZ2VuZC1kYXNoXCIgc3R5bGU9XCJtYXJnaW4tcmlnaHQ6ICR7bWFyZ2luUmlnaHR9ZW07IHBhZGRpbmctbGVmdDogJHtwYWRkaW5nTGVmdH1lbTtcIj48L2Rpdj5gO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGFzaDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTGVnZW5kO1xuIl0sIm1hcHBpbmdzIjoiQUFBQSxZQUFZOztBQUVaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQUFBLE1BQUEsQ0FBQUMsY0FBQSxDQUFBQyxPQUFBO0VBQUFDLEtBQUE7QUFBQTtBQUFBRCxPQUFBO0FBRUEsSUFBQUUsS0FBQSxHQUFBQyx1QkFBQSxDQUFBQyxPQUFBO0FBQTBDLFNBQUFELHdCQUFBRSxDQUFBLEVBQUFDLENBQUEsNkJBQUFDLE9BQUEsTUFBQUMsQ0FBQSxPQUFBRCxPQUFBLElBQUFFLENBQUEsT0FBQUYsT0FBQSxZQUFBSix1QkFBQSxZQUFBQSx3QkFBQUUsQ0FBQSxFQUFBQyxDQUFBLFNBQUFBLENBQUEsSUFBQUQsQ0FBQSxJQUFBQSxDQUFBLENBQUFLLFVBQUEsU0FBQUwsQ0FBQSxNQUFBTSxDQUFBLEVBQUFDLENBQUEsRUFBQUMsQ0FBQSxLQUFBQyxTQUFBLG1CQUFBVCxDQUFBLGlCQUFBQSxDQUFBLHVCQUFBQSxDQUFBLHlCQUFBQSxDQUFBLFNBQUFRLENBQUEs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QUFFQSxDQUFDLEdBQUd5RixhQUFhLENBQUNGLE1BQU0sRUFBRXZGLENBQUMsRUFBRSxFQUFFO01BQ3pDZ0ksaUJBQWlCLENBQUNoSSxDQUFDLENBQUMsR0FBR3lGLGFBQWEsQ0FBQ3pGLENBQUMsQ0FBQyxHQUFDbUMsVUFBVTtJQUNwRDtJQUNBO0lBQ0E7SUFDQTRGLFdBQVcsR0FBR0MsaUJBQWlCLENBQUN6QyxNQUFNO0VBQ3hDLENBQUMsTUFBTTtJQUNMO0lBQ0EwQyxJQUFJLEdBQUcsQ0FBQztJQUNSLEtBQUtqSSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd5RixhQUFhLENBQUNGLE1BQU0sRUFBRXZGLENBQUMsRUFBRSxFQUFFO01BQ3pDZ0ksaUJBQWlCLENBQUNoSSxDQUFDLENBQUMsR0FBR3lGLGFBQWEsQ0FBQ3pGLENBQUMsQ0FBQyxHQUFDOEgsaUJBQWlCO0lBQzNEO0lBQ0E7SUFDQUMsV0FBVyxHQUFHQyxpQkFBaUIsQ0FBQ3pDLE1BQU0sR0FBQyxDQUFDO0VBQzFDOztFQUVBO0VBQ0EsSUFBSTZDLElBQUksR0FBRyxFQUFFO0VBQ2IsS0FBS1QsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHTSxJQUFJLEVBQUVOLENBQUMsRUFBRSxFQUFFO0lBQ3pCLEtBQUszSCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcrSCxXQUFXLEVBQUUvSCxDQUFDLElBQUUsQ0FBQyxFQUFFO01BQ2pDO01BQ0E0SCxXQUFXLEdBQUdJLGlCQUFpQixDQUFDaEksQ0FBQyxHQUFDZ0ksaUJBQWlCLENBQUN6QyxNQUFNLENBQUM7TUFDM0QsSUFBSXZGLENBQUMsR0FBR3lGLGFBQWEsQ0FBQ0YsTUFBTSxFQUFFO1FBQzVCO1FBQ0FzQyxXQUFXLEdBQUdHLGlCQUFpQixDQUFDLENBQUNoSSxDQUFDLEdBQUMsQ0FBQyxJQUFFZ0ksaUJBQWlCLENBQUN6QyxNQUFNLENBQUM7TUFDakUsQ0FBQyxNQUFNO1FBQ0w7UUFDQXNDLFdBQVcsR0FBRyxDQUFDO01BQ2pCO01BQ0FPLElBQUksZ0VBQUFYLE1BQUEsQ0FBNkRJLFdBQVcsd0JBQUFKLE1BQUEsQ0FBcUJHLFdBQVcsaUJBQWE7SUFDM0g7RUFDRjtFQUNBLE9BQU9RLElBQUk7QUFDYjtBQUFDLElBQUFDLFFBQUEsR0FBQWpKLE9BQUEsY0FFY3NCLE1BQU07QUFBQTRILE1BQUEsQ0FBQWxKLE9BQUEsR0FBQUEsT0FBQSxDQUFBbUosT0FBQSIsImlnbm9yZUxpc3QiOltdfQ==