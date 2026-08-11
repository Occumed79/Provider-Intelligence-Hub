'use strict';

/**
 * @license
 * Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */

/**
 * @fileoverview Based on PlotKit.CanvasRenderer, but modified to meet the
 * needs of dygraphs.
 *
 * In particular, support for:
 * - grid overlays
 * - high/low bands
 * - dygraphs attribute system
 */

/**
 * The DygraphCanvasRenderer class does the actual rendering of the chart onto
 * a canvas. It's based on PlotKit.CanvasRenderer.
 * @param {Object} element The canvas to attach to
 * @param {Object} elementContext The 2d context of the canvas (injected so it
 * can be mocked for testing.)
 * @param {Layout} layout The DygraphLayout object for this graph.
 * @constructor
 */

/*global Dygraph:false */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
var _dygraph = _interopRequireDefault(require("./dygraph"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/**
 * @constructor
 *
 * This gets called when there are "new points" to chart. This is generally the
 * case when the underlying data being charted has changed. It is _not_ called
 * in the common case that the user has zoomed or is panning the view.
 *
 * The chart canvas has already been created by the Dygraph object. The
 * renderer simply gets a drawing context.
 *
 * @param {Dygraph} dygraph The chart to which this renderer belongs.
 * @param {HTMLCanvasElement} element The &lt;canvas&gt; DOM element on which to draw.
 * @param {CanvasRenderingContext2D} elementContext The drawing context.
 * @param {DygraphLayout} layout The chart's DygraphLayout object.
 *
 * TODO(danvk): remove the elementContext property.
 */
var DygraphCanvasRenderer = function DygraphCanvasRenderer(dygraph, element, elementContext, layout) {
  this.dygraph_ = dygraph;
  this.layout = layout;
  this.element = element;
  this.elementContext = elementContext;
  this.height = dygraph.height_;
  this.width = dygraph.width_;

  // --- check whether everything is ok before we return
  if (!utils.isCanvasSupported(this.element)) {
    throw "Canvas is not supported.";
  }

  // internal state
  this.area = layout.getPlotArea();

  // Set up a clipping area for the canvas (and the interaction canvas).
  // This ensures that we don't overdraw.
  var ctx = this.dygraph_.canvas_ctx_;
  ctx.beginPath();
  ctx.rect(this.area.x, this.area.y, this.area.w, this.area.h);
  ctx.clip();
  ctx = this.dygraph_.hidden_ctx_;
  ctx.beginPath();
  ctx.rect(this.area.x, this.area.y, this.area.w, this.area.h);
  ctx.clip();
};

/**
 * Clears out all chart content and DOM elements.
 * This is called immediately before render() on every frame, including
 * during zooms and pans.
 * @private
 */
DygraphCanvasRenderer.prototype.clear = function () {
  this.elementContext.clearRect(0, 0, this.width, this.height);
};

/**
 * This method is responsible for drawing everything on the chart, including
 * lines, high/low bands, fills and axes.
 * It is called immediately after clear() on every frame, including during pans
 * and zooms.
 * @private
 */
DygraphCanvasRenderer.prototype.render = function () {
  // attaches point.canvas{x,y}
  this._updatePoints();

  // actually draws the chart.
  this._renderLineChart();
};

/**
 * Returns a predicate to be used with an iterator, which will
 * iterate over points appropriately, depending on whether
 * connectSeparatedPoints is true. When it's false, the predicate will
 * skip over points with missing yVals.
 */
DygraphCanvasRenderer._getIteratorPredicate = function (connectSeparatedPoints) {
  return connectSeparatedPoints ? DygraphCanvasRenderer._predicateThatSkipsEmptyPoints : null;
};
DygraphCanvasRenderer._predicateThatSkipsEmptyPoints = function (array, idx) {
  return array[idx].yval !== null;
};

/**
 * Draws a line with the styles passed in and calls all the drawPointCallbacks.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawStyledLine = function (e, color, strokeWidth, strokePattern, drawPoints, drawPointCallback, pointSize) {
  var g = e.dygraph;
  // TODO(konigsberg): Compute attributes outside this method call.
  var stepPlot = g.getBooleanOption("stepPlot", e.setName);
  if (!utils.isArrayLike(strokePattern)) {
    strokePattern = null;
  }
  var drawGapPoints = g.getBooleanOption('drawGapEdgePoints', e.setName);
  var points = e.points;
  var setName = e.setName;
  var iter = utils.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));
  var stroking = strokePattern && strokePattern.length >= 2;
  var ctx = e.drawingContext;
  ctx.save();
  if (stroking) {
    if (ctx.setLineDash) ctx.setLineDash(strokePattern);
  }
  var pointsOnLine = DygraphCanvasRenderer._drawSeries(e, iter, strokeWidth, pointSize, drawPoints, drawGapPoints, stepPlot, color);
  DygraphCanvasRenderer._drawPointsOnLine(e, pointsOnLine, drawPointCallback, color, pointSize);
  if (stroking) {
    if (ctx.setLineDash) ctx.setLineDash([]);
  }
  ctx.restore();
};

/**
 * This does the actual drawing of lines on the canvas, for just one series.
 * Returns a list of [canvasx, canvasy] pairs for points for which a
 * drawPointCallback should be fired.  These include isolated points, or all
 * points if drawPoints=true.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawSeries = function (e, iter, strokeWidth, pointSize, drawPoints, drawGapPoints, stepPlot, color) {
  var prevCanvasX = null;
  var prevCanvasY = null;
  var nextCanvasY = null;
  var isIsolated; // true if this point is isolated (no line segments)
  var point; // the point being processed in the while loop
  var pointsOnLine = []; // Array of [canvasx, canvasy] pairs.
  var first = true; // the first cycle through the while loop

  var ctx = e.drawingContext;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;

  // NOTE: we break the iterator's encapsulation here for about a 25% speedup.
  var arr = iter.array_;
  var limit = iter.end_;
  var predicate = iter.predicate_;
  for (var i = iter.start_; i < limit; i++) {
    point = arr[i];
    if (predicate) {
      while (i < limit && !predicate(arr, i)) {
        i++;
      }
      if (i == limit) break;
      point = arr[i];
    }

    // FIXME: The 'canvasy != canvasy' test here catches NaN values but the test
    // doesn't catch Infinity values. Could change this to
    // !isFinite(point.canvasy), but I assume it avoids isNaN for performance?
    if (point.canvasy === null || point.canvasy != point.canvasy) {
      if (stepPlot && prevCanvasX !== null) {
        // Draw a horizontal line to the start of the missing data
        ctx.moveTo(prevCanvasX, prevCanvasY);
        ctx.lineTo(point.canvasx, prevCanvasY);
      }
      prevCanvasX = prevCanvasY = null;
    } else {
      isIsolated = false;
      if (drawGapPoints || prevCanvasX === null) {
        iter.nextIdx_ = i;
        iter.next();
        nextCanvasY = iter.hasNext ? iter.peek.canvasy : null;
        var isNextCanvasYNullOrNaN = nextCanvasY === null || nextCanvasY != nextCanvasY;
        isIsolated = prevCanvasX === null && isNextCanvasYNullOrNaN;
        if (drawGapPoints) {
          // Also consider a point to be "isolated" if it's adjacent to a
          // null point, excluding the graph edges.
          if (!first && prevCanvasX === null || iter.hasNext && isNextCanvasYNullOrNaN) {
            isIsolated = true;
          }
        }
      }
      if (prevCanvasX !== null) {
        if (strokeWidth) {
          if (stepPlot) {
            ctx.moveTo(prevCanvasX, prevCanvasY);
            ctx.lineTo(point.canvasx, prevCanvasY);
          }
          ctx.lineTo(point.canvasx, point.canvasy);
        }
      } else {
        ctx.moveTo(point.canvasx, point.canvasy);
      }
      if (drawPoints || isIsolated) {
        pointsOnLine.push([point.canvasx, point.canvasy, point.idx]);
      }
      prevCanvasX = point.canvasx;
      prevCanvasY = point.canvasy;
    }
    first = false;
  }
  ctx.stroke();
  return pointsOnLine;
};

/**
 * This fires the drawPointCallback functions, which draw dots on the points by
 * default. This gets used when the "drawPoints" option is set, or when there
 * are isolated points.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawPointsOnLine = function (e, pointsOnLine, drawPointCallback, color, pointSize) {
  var ctx = e.drawingContext;
  for (var idx = 0; idx < pointsOnLine.length; idx++) {
    var cb = pointsOnLine[idx];
    ctx.save();
    drawPointCallback.call(e.dygraph, e.dygraph, e.setName, ctx, cb[0], cb[1], color, pointSize, cb[2]);
    ctx.restore();
  }
};

/**
 * Attaches canvas coordinates to the points array.
 * @private
 */
DygraphCanvasRenderer.prototype._updatePoints = function () {
  // Update Points
  // TODO(danvk): here
  //
  // TODO(bhs): this loop is a hot-spot for high-point-count charts. These
  // transformations can be pushed into the canvas via linear transformation
  // matrices.
  // NOTE(danvk): this is trickier than it sounds at first. The transformation
  // needs to be done before the .moveTo() and .lineTo() calls, but must be
  // undone before the .stroke() call to ensure that the stroke width is
  // unaffected.  An alternative is to reduce the stroke width in the
  // transformed coordinate space, but you can't specify different values for
  // each dimension (as you can with .scale()). The speedup here is ~12%.
  var sets = this.layout.points;
  for (var i = sets.length; i--;) {
    var points = sets[i];
    for (var j = points.length; j--;) {
      var point = points[j];
      point.canvasx = this.area.w * point.x + this.area.x;
      point.canvasy = this.area.h * point.y + this.area.y;
    }
  }
};

/**
 * Add canvas Actually draw the lines chart, including high/low bands.
 *
 * This function can only be called if DygraphLayout's points array has been
 * updated with canvas{x,y} attributes, i.e. by
 * DygraphCanvasRenderer._updatePoints.
 *
 * @param {string=} opt_seriesName when specified, only that series will
 *     be drawn. (This is used for expedited redrawing with highlightSeriesOpts)
 * @param {CanvasRenderingContext2D} opt_ctx when specified, the drawing
 *     context.  However, lines are typically drawn on the object's
 *     elementContext.
 * @private
 */
DygraphCanvasRenderer.prototype._renderLineChart = function (opt_seriesName, opt_ctx) {
  var ctx = opt_ctx || this.elementContext;
  var i;
  var sets = this.layout.points;
  var setNames = this.layout.setNames;
  var setName;
  this.colors = this.dygraph_.colorsMap_;

  // Determine which series have specialized plotters.
  var plotter_attr = this.dygraph_.getOption("plotter");
  var plotters = plotter_attr;
  if (!utils.isArrayLike(plotters)) {
    plotters = [plotters];
  }
  var setPlotters = {}; // series name -> plotter fn.
  for (i = 0; i < setNames.length; i++) {
    setName = setNames[i];
    var setPlotter = this.dygraph_.getOption("plotter", setName);
    if (setPlotter == plotter_attr) continue; // not specialized.

    setPlotters[setName] = setPlotter;
  }
  for (i = 0; i < plotters.length; i++) {
    var plotter = plotters[i];
    var is_last = i == plotters.length - 1;
    for (var j = 0; j < sets.length; j++) {
      setName = setNames[j];
      if (opt_seriesName && setName != opt_seriesName) continue;
      var points = sets[j];

      // Only throw in the specialized plotters on the last iteration.
      var p = plotter;
      if (setName in setPlotters) {
        if (is_last) {
          p = setPlotters[setName];
        } else {
          // Don't use the standard plotters in this case.
          continue;
        }
      }
      var color = this.colors[setName];
      var strokeWidth = this.dygraph_.getOption("strokeWidth", setName);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      p({
        points: points,
        setName: setName,
        drawingContext: ctx,
        color: color,
        strokeWidth: strokeWidth,
        dygraph: this.dygraph_,
        axis: this.dygraph_.axisPropertiesForSeries(setName),
        plotArea: this.area,
        seriesIndex: j,
        seriesCount: sets.length,
        singleSeriesName: opt_seriesName,
        allSeriesPoints: sets
      });
      ctx.restore();
    }
  }
};

/**
 * Standard plotters. These may be used by clients via Dygraph.Plotters.
 * See comments there for more details.
 */
DygraphCanvasRenderer._Plotters = {
  linePlotter: function linePlotter(e) {
    DygraphCanvasRenderer._linePlotter(e);
  },
  fillPlotter: function fillPlotter(e) {
    DygraphCanvasRenderer._fillPlotter(e);
  },
  errorPlotter: function errorPlotter(e) {
    DygraphCanvasRenderer._errorPlotter(e);
  }
};

/**
 * Plotter which draws the central lines for a series.
 * @private
 */
DygraphCanvasRenderer._linePlotter = function (e) {
  var g = e.dygraph;
  var setName = e.setName;
  var strokeWidth = e.strokeWidth;

  // TODO(danvk): Check if there's any performance impact of just calling
  // getOption() inside of _drawStyledLine. Passing in so many parameters makes
  // this code a bit nasty.
  var borderWidth = g.getNumericOption("strokeBorderWidth", setName);
  var drawPointCallback = g.getOption("drawPointCallback", setName) || utils.Circles.DEFAULT;
  var strokePattern = g.getOption("strokePattern", setName);
  var drawPoints = g.getBooleanOption("drawPoints", setName);
  var pointSize = g.getNumericOption("pointSize", setName);
  if (borderWidth && strokeWidth) {
    DygraphCanvasRenderer._drawStyledLine(e, g.getOption("strokeBorderColor", setName), strokeWidth + 2 * borderWidth, strokePattern, drawPoints, drawPointCallback, pointSize);
  }
  DygraphCanvasRenderer._drawStyledLine(e, e.color, strokeWidth, strokePattern, drawPoints, drawPointCallback, pointSize);
};

/**
 * Draws the shaded high/low bands (confidence intervals) for each series.
 * This happens before the center lines are drawn, since the center lines
 * need to be drawn on top of the high/low bands for all series.
 * @private
 */
DygraphCanvasRenderer._errorPlotter = function (e) {
  var g = e.dygraph;
  var setName = e.setName;
  var errorBars = g.getBooleanOption("errorBars") || g.getBooleanOption("customBars");
  if (!errorBars) return;
  var fillGraph = g.getBooleanOption("fillGraph", setName);
  if (fillGraph) {
    console.warn("Can't use fillGraph option with customBars or errorBars option");
  }
  var ctx = e.drawingContext;
  var color = e.color;
  var fillAlpha = g.getNumericOption('fillAlpha', setName);
  var stepPlot = g.getBooleanOption("stepPlot", setName);
  var points = e.points;
  var iter = utils.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));
  var newYs;

  // setup graphics context
  var prevX = NaN;
  var prevY = NaN;
  var prevYs = [-1, -1];
  // should be same color as the lines but only 15% opaque.
  var rgb = utils.toRGB_(color);
  var err_color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + fillAlpha + ')';
  ctx.fillStyle = err_color;
  ctx.beginPath();
  var isNullUndefinedOrNaN = function isNullUndefinedOrNaN(x) {
    return x === null || x === undefined || isNaN(x);
  };
  while (iter.hasNext) {
    var point = iter.next();
    if (!stepPlot && isNullUndefinedOrNaN(point.y) || stepPlot && !isNaN(prevY) && isNullUndefinedOrNaN(prevY)) {
      prevX = NaN;
      continue;
    }
    newYs = [point.y_bottom, point.y_top];
    if (stepPlot) {
      prevY = point.y;
    }

    // The documentation specifically disallows nulls inside the point arrays,
    // but in case it happens we should do something sensible.
    if (isNaN(newYs[0])) newYs[0] = point.y;
    if (isNaN(newYs[1])) newYs[1] = point.y;
    newYs[0] = e.plotArea.h * newYs[0] + e.plotArea.y;
    newYs[1] = e.plotArea.h * newYs[1] + e.plotArea.y;
    if (!isNaN(prevX)) {
      if (stepPlot) {
        ctx.moveTo(prevX, prevYs[0]);
        ctx.lineTo(point.canvasx, prevYs[0]);
        ctx.lineTo(point.canvasx, prevYs[1]);
      } else {
        ctx.moveTo(prevX, prevYs[0]);
        ctx.lineTo(point.canvasx, newYs[0]);
        ctx.lineTo(point.canvasx, newYs[1]);
      }
      ctx.lineTo(prevX, prevYs[1]);
      ctx.closePath();
    }
    prevYs = newYs;
    prevX = point.canvasx;
  }
  ctx.fill();
};

/**
 * Proxy for CanvasRenderingContext2D which drops moveTo/lineTo calls which are
 * superfluous. It accumulates all movements which haven't changed the x-value
 * and only applies the two with the most extreme y-values.
 *
 * Calls to lineTo/moveTo must have non-decreasing x-values.
 */
DygraphCanvasRenderer._fastCanvasProxy = function (context) {
  var pendingActions = []; // array of [type, x, y] tuples
  var lastRoundedX = null;
  var lastFlushedX = null;
  var LINE_TO = 1,
    MOVE_TO = 2;
  var actionCount = 0; // number of moveTos and lineTos passed to context.

  // Drop superfluous motions
  // Assumes all pendingActions have the same (rounded) x-value.
  var compressActions = function compressActions(opt_losslessOnly) {
    if (pendingActions.length <= 1) return;

    // Lossless compression: drop inconsequential moveTos.
    for (var i = pendingActions.length - 1; i > 0; i--) {
      var action = pendingActions[i];
      if (action[0] == MOVE_TO) {
        var prevAction = pendingActions[i - 1];
        if (prevAction[1] == action[1] && prevAction[2] == action[2]) {
          pendingActions.splice(i, 1);
        }
      }
    }

    // Lossless compression: ... drop consecutive moveTos ...
    for /* incremented internally */
    (var i = 0; i < pendingActions.length - 1;) {
      var action = pendingActions[i];
      if (action[0] == MOVE_TO && pendingActions[i + 1][0] == MOVE_TO) {
        pendingActions.splice(i, 1);
      } else {
        i++;
      }
    }

    // Lossy compression: ... drop all but the extreme y-values ...
    if (pendingActions.length > 2 && !opt_losslessOnly) {
      // keep an initial moveTo, but drop all others.
      var startIdx = 0;
      if (pendingActions[0][0] == MOVE_TO) startIdx++;
      var minIdx = null,
        maxIdx = null;
      for (var i = startIdx; i < pendingActions.length; i++) {
        var action = pendingActions[i];
        if (action[0] != LINE_TO) continue;
        if (minIdx === null && maxIdx === null) {
          minIdx = i;
          maxIdx = i;
        } else {
          var y = action[2];
          if (y < pendingActions[minIdx][2]) {
            minIdx = i;
          } else if (y > pendingActions[maxIdx][2]) {
            maxIdx = i;
          }
        }
      }
      var minAction = pendingActions[minIdx],
        maxAction = pendingActions[maxIdx];
      pendingActions.splice(startIdx, pendingActions.length - startIdx);
      if (minIdx < maxIdx) {
        pendingActions.push(minAction);
        pendingActions.push(maxAction);
      } else if (minIdx > maxIdx) {
        pendingActions.push(maxAction);
        pendingActions.push(minAction);
      } else {
        pendingActions.push(minAction);
      }
    }
  };
  var flushActions = function flushActions(opt_noLossyCompression) {
    compressActions(opt_noLossyCompression);
    for (var i = 0, len = pendingActions.length; i < len; i++) {
      var action = pendingActions[i];
      if (action[0] == LINE_TO) {
        context.lineTo(action[1], action[2]);
      } else if (action[0] == MOVE_TO) {
        context.moveTo(action[1], action[2]);
      }
    }
    if (pendingActions.length) {
      lastFlushedX = pendingActions[pendingActions.length - 1][1];
    }
    actionCount += pendingActions.length;
    pendingActions = [];
  };
  var addAction = function addAction(action, x, y) {
    var rx = Math.round(x);
    if (lastRoundedX === null || rx != lastRoundedX) {
      // if there are large gaps on the x-axis, it's essential to keep the
      // first and last point as well.
      var hasGapOnLeft = lastRoundedX - lastFlushedX > 1,
        hasGapOnRight = rx - lastRoundedX > 1,
        hasGap = hasGapOnLeft || hasGapOnRight;
      flushActions(hasGap);
      lastRoundedX = rx;
    }
    pendingActions.push([action, x, y]);
  };
  return {
    moveTo: function moveTo(x, y) {
      addAction(MOVE_TO, x, y);
    },
    lineTo: function lineTo(x, y) {
      addAction(LINE_TO, x, y);
    },
    // for major operations like stroke/fill, we skip compression to ensure
    // that there are no artifacts at the right edge.
    stroke: function stroke() {
      flushActions(true);
      context.stroke();
    },
    fill: function fill() {
      flushActions(true);
      context.fill();
    },
    beginPath: function beginPath() {
      flushActions(true);
      context.beginPath();
    },
    closePath: function closePath() {
      flushActions(true);
      context.closePath();
    },
    _count: function _count() {
      return actionCount;
    }
  };
};

/**
 * Draws the shaded regions when "fillGraph" is set.
 * Not to be confused with high/low bands (historically misnamed errorBars).
 *
 * For stacked charts, it's more convenient to handle all the series
 * simultaneously. So this plotter plots all the points on the first series
 * it's asked to draw, then ignores all the other series.
 *
 * @private
 */
DygraphCanvasRenderer._fillPlotter = function (e) {
  // Skip if we're drawing a single series for interactive highlight overlay.
  if (e.singleSeriesName) return;

  // We'll handle all the series at once, not one-by-one.
  if (e.seriesIndex !== 0) return;
  var g = e.dygraph;
  var setNames = g.getLabels().slice(1); // remove x-axis

  // getLabels() includes names for invisible series, which are not included in
  // allSeriesPoints. We remove those to make the two match.
  // TODO(danvk): provide a simpler way to get this information.
  for (var i = setNames.length; i >= 0; i--) {
    if (!g.visibility()[i]) setNames.splice(i, 1);
  }
  var anySeriesFilled = function () {
    for (var i = 0; i < setNames.length; i++) {
      if (g.getBooleanOption("fillGraph", setNames[i])) return true;
    }
    return false;
  }();
  if (!anySeriesFilled) return;
  var area = e.plotArea;
  var sets = e.allSeriesPoints;
  var setCount = sets.length;
  var stackedGraph = g.getBooleanOption("stackedGraph");
  var colors = g.getColors();

  // For stacked graphs, track the baseline for filling.
  //
  // The filled areas below graph lines are trapezoids with two
  // vertical edges. The top edge is the line segment being drawn, and
  // the baseline is the bottom edge. Each baseline corresponds to the
  // top line segment from the previous stacked line. In the case of
  // step plots, the trapezoids are rectangles.
  var baseline = {};
  var currBaseline;
  var prevStepPlot; // for different line drawing modes (line/step) per series

  // Helper function to trace a line back along the baseline.
  var traceBackPath = function traceBackPath(ctx, baselineX, baselineY, pathBack) {
    ctx.lineTo(baselineX, baselineY);
    if (stackedGraph) {
      for (var i = pathBack.length - 1; i >= 0; i--) {
        var pt = pathBack[i];
        ctx.lineTo(pt[0], pt[1]);
      }
    }
  };

  // process sets in reverse order (needed for stacked graphs)
  for (var setIdx = setCount - 1; setIdx >= 0; setIdx--) {
    var ctx = e.drawingContext;
    var setName = setNames[setIdx];
    if (!g.getBooleanOption('fillGraph', setName)) continue;
    var fillAlpha = g.getNumericOption('fillAlpha', setName);
    var stepPlot = g.getBooleanOption('stepPlot', setName);
    var color = colors[setIdx];
    var axis = g.axisPropertiesForSeries(setName);
    var axisY = 1.0 + axis.minyval * axis.yscale;
    if (axisY < 0.0) axisY = 0.0;else if (axisY > 1.0) axisY = 1.0;
    axisY = area.h * axisY + area.y;
    var points = sets[setIdx];
    var iter = utils.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));

    // setup graphics context
    var prevX = NaN;
    var prevYs = [-1, -1];
    var newYs;
    // should be same color as the lines but only 15% opaque.
    var rgb = utils.toRGB_(color);
    var err_color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + fillAlpha + ')';
    ctx.fillStyle = err_color;
    ctx.beginPath();
    var last_x,
      is_first = true;

    // If the point density is high enough, dropping segments on their way to
    // the canvas justifies the overhead of doing so.
    if (points.length > 2 * g.width_ || _dygraph["default"].FORCE_FAST_PROXY) {
      ctx = DygraphCanvasRenderer._fastCanvasProxy(ctx);
    }

    // For filled charts, we draw points from left to right, then back along
    // the x-axis to complete a shape for filling.
    // For stacked plots, this "back path" is a more complex shape. This array
    // stores the [x, y] values needed to trace that shape.
    var pathBack = [];

    // TODO(danvk): there are a lot of options at play in this loop.
    //     The logic would be much clearer if some (e.g. stackGraph and
    //     stepPlot) were split off into separate sub-plotters.
    var point;
    while (iter.hasNext) {
      point = iter.next();
      if (!utils.isOK(point.y) && !stepPlot) {
        traceBackPath(ctx, prevX, prevYs[1], pathBack);
        pathBack = [];
        prevX = NaN;
        if (point.y_stacked !== null && !isNaN(point.y_stacked)) {
          baseline[point.canvasx] = area.h * point.y_stacked + area.y;
        }
        continue;
      }
      if (stackedGraph) {
        if (!is_first && last_x == point.xval) {
          continue;
        } else {
          is_first = false;
          last_x = point.xval;
        }
        currBaseline = baseline[point.canvasx];
        var lastY;
        if (currBaseline === undefined) {
          lastY = axisY;
        } else {
          if (prevStepPlot) {
            lastY = currBaseline[0];
          } else {
            lastY = currBaseline;
          }
        }
        newYs = [point.canvasy, lastY];
        if (stepPlot) {
          // Step plots must keep track of the top and bottom of
          // the baseline at each point.
          if (prevYs[0] === -1) {
            baseline[point.canvasx] = [point.canvasy, axisY];
          } else {
            baseline[point.canvasx] = [point.canvasy, prevYs[0]];
          }
        } else {
          baseline[point.canvasx] = point.canvasy;
        }
      } else {
        if (isNaN(point.canvasy) && stepPlot) {
          newYs = [area.y + area.h, axisY];
        } else {
          newYs = [point.canvasy, axisY];
        }
      }
      if (!isNaN(prevX)) {
        // Move to top fill point
        if (stepPlot) {
          ctx.lineTo(point.canvasx, prevYs[0]);
          ctx.lineTo(point.canvasx, newYs[0]);
        } else {
          ctx.lineTo(point.canvasx, newYs[0]);
        }

        // Record the baseline for the reverse path.
        if (stackedGraph) {
          pathBack.push([prevX, prevYs[1]]);
          if (prevStepPlot && currBaseline) {
            // Draw to the bottom of the baseline
            pathBack.push([point.canvasx, currBaseline[1]]);
          } else {
            pathBack.push([point.canvasx, newYs[1]]);
          }
        }
      } else {
        ctx.moveTo(point.canvasx, newYs[1]);
        ctx.lineTo(point.canvasx, newYs[0]);
      }
      prevYs = newYs;
      prevX = point.canvasx;
    }
    prevStepPlot = stepPlot;
    if (newYs && point) {
      traceBackPath(ctx, point.canvasx, newYs[1], pathBack);
      pathBack = [];
    }
    ctx.fill();
  }
};
var _default = exports["default"] = DygraphCanvasRenderer;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsInV0aWxzIiwiX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQiLCJyZXF1aXJlIiwiX2R5Z3JhcGgiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwiZSIsIl9fZXNNb2R1bGUiLCJ0IiwiV2Vha01hcCIsInIiLCJuIiwibyIsImkiLCJmIiwiX19wcm90b19fIiwiaGFzIiwiZ2V0Iiwic2V0IiwiX3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJEeWdyYXBoQ2FudmFzUmVuZGVyZXIiLCJkeWdyYXBoIiwiZWxlbWVudCIsImVsZW1lbnRDb250ZXh0IiwibGF5b3V0IiwiZHlncmFwaF8iLCJoZWlnaHQiLCJoZWlnaHRfIiwid2lkdGgiLCJ3aWR0aF8iLCJpc0NhbnZhc1N1cHBvcnRlZCIsImFyZWEiLCJnZXRQbG90QXJlYSIsImN0eCIsImNhbnZhc19jdHhfIiwiYmVnaW5QYXRoIiwicmVjdCIsIngiLCJ5IiwidyIsImgiLCJjbGlwIiwiaGlkZGVuX2N0eF8iLCJwcm90b3R5cGUiLCJjbGVhciIsImNsZWFyUmVjdCIsInJlbmRlciIsIl91cGRhdGVQb2ludHMiLCJfcmVuZGVyTGluZUNoYXJ0IiwiX2dldEl0ZXJhdG9yUHJlZGljYXRlIiwiY29ubmVjdFNlcGFyYXRlZFBvaW50cyIsIl9wcmVkaWNhdGVUaGF0U2tpcHNFbXB0eVBvaW50cyIsImFycmF5IiwiaWR4IiwieXZhbCIsIl9kcmF3U3R5bGVkTGluZSIsImNvbG9yIiwic3Ryb2tlV2lkdGgiLCJzdHJva2VQYXR0ZXJuIiwiZHJhd1BvaW50cyIsImRyYXdQb2ludENhbGxiYWNrIiwicG9pbnRTaXplIiwiZyIsInN0ZXBQbG90IiwiZ2V0Qm9vbGVhbk9wdGlvbiIsInNldE5hbWUiLCJpc0FycmF5TGlrZSIsImRyYXdHYXBQb2ludHMiLCJwb2ludHMiLCJpdGVyIiwiY3JlYXRlSXRlcmF0b3IiLCJsZW5ndGgiLCJzdHJva2luZyIsImRyYXdpbmdDb250ZXh0Iiwic2F2ZSIsInNldExpbmVEYXNoIiwicG9pbnRzT25MaW5lIiwiX2RyYXdTZXJpZXMiLCJfZHJhd1BvaW50c09uTGluZSIsInJlc3RvcmUiLCJwcmV2Q2FudmFzWCIsInByZXZDYW52YXNZIiwibmV4dENhbnZhc1kiLCJpc0lzb2xhdGVkIiwicG9pbnQiLCJmaXJzdCIsInN0cm9rZVN0eWxlIiwibGluZVdpZHRoIiwiYXJyIiwiYXJyYXlfIiwibGltaXQiLCJlbmRfIiwicHJlZGljYXRlIiwicHJlZGljYXRlXyIsInN0YXJ0XyIsImNhbnZhc3kiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjYW52YXN4IiwibmV4dElkeF8iLCJuZXh0IiwiaGFzTmV4dCIsInBlZWsiLCJpc05leHRDYW52YXNZTnVsbE9yTmFOIiwicHVzaCIsInN0cm9rZSIsImNiIiwic2V0cyIsImoiLCJvcHRfc2VyaWVzTmFtZSIsIm9wdF9jdHgiLCJzZXROYW1lcyIsImNvbG9ycyIsImNvbG9yc01hcF8iLCJwbG90dGVyX2F0dHIiLCJnZXRPcHRpb24iLCJwbG90dGVycyIsInNldFBsb3R0ZXJzIiwic2V0UGxvdHRlciIsInBsb3R0ZXIiLCJpc19sYXN0IiwicCIsImF4aXMiLCJheGlzUHJvcGVydGllc0ZvclNlcmllcyIsInBsb3RBcmVhIiwic2VyaWVzSW5kZXgiLCJzZXJpZXNDb3VudCIsInNpbmdsZVNlcmllc05hbWUiLCJhbGxTZXJpZXNQb2ludHMiLCJfUGxvdHRlcnMiLCJsaW5lUGxvdHRlciIsIl9saW5lUGxvdHRlciIsImZpbGxQbG90dGVyIiwiX2ZpbGxQbG90dGVyIiwiZXJyb3JQbG90dGVyIiwiX2Vycm9yUGxvdHRlciIsImJvcmRlcldpZHRoIiwiZ2V0TnVtZXJpY09wdGlvbiIsIkNpcmNsZXMiLCJERUZBVUxUIiwiZXJyb3JCYXJzIiwiZmlsbEdyYXBoIiwiY29uc29sZSIsIndhcm4iLCJmaWxsQWxwaGEiLCJuZXdZcyIsInByZXZYIiwiTmFOIiwicHJldlkiLCJwcmV2WXMiLCJyZ2IiLCJ0b1JHQl8iLCJlcnJfY29sb3IiLCJiIiwiZmlsbFN0eWxlIiwiaXNOdWxsVW5kZWZpbmVkT3JOYU4iLCJ1bmRlZmluZWQiLCJpc05hTiIsInlfYm90dG9tIiwieV90b3AiLCJjbG9zZVBhdGgiLCJmaWxsIiwiX2Zhc3RDYW52YXNQcm94eSIsImNvbnRleHQiLCJwZW5kaW5nQWN0aW9ucyIsImxhc3RSb3VuZGVkWCIsImxhc3RGbHVzaGVkWCIsIkxJTkVfVE8iLCJNT1ZFX1RPIiwiYWN0aW9uQ291bnQiLCJjb21wcmVzc0FjdGlvbnMiLCJvcHRfbG9zc2xlc3NPbmx5IiwiYWN0aW9uIiwicHJldkFjdGlvbiIsInNwbGljZSIsInN0YXJ0SWR4IiwibWluSWR4IiwibWF4SWR4IiwibWluQWN0aW9uIiwibWF4QWN0aW9uIiwiZmx1c2hBY3Rpb25zIiwib3B0X25vTG9zc3lDb21wcmVzc2lvbiIsImxlbiIsImFkZEFjdGlvbiIsInJ4IiwiTWF0aCIsInJvdW5kIiwiaGFzR2FwT25MZWZ0IiwiaGFzR2FwT25SaWdodCIsImhhc0dhcCIsIl9jb3VudCIsImdldExhYmVscyIsInNsaWNlIiwidmlzaWJpbGl0eSIsImFueVNlcmllc0ZpbGxlZCIsInNldENvdW50Iiwic3RhY2tlZEdyYXBoIiwiZ2V0Q29sb3JzIiwiYmFzZWxpbmUiLCJjdXJyQmFzZWxpbmUiLCJwcmV2U3RlcFBsb3QiLCJ0cmFjZUJhY2tQYXRoIiwiYmFzZWxpbmVYIiwiYmFzZWxpbmVZIiwicGF0aEJhY2siLCJwdCIsInNldElkeCIsImF4aXNZIiwibWlueXZhbCIsInlzY2FsZSIsImxhc3RfeCIsImlzX2ZpcnN0IiwiRHlncmFwaCIsIkZPUkNFX0ZBU1RfUFJPWFkiLCJpc09LIiwieV9zdGFja2VkIiwieHZhbCIsImxhc3RZIiwiX2RlZmF1bHQiLCJtb2R1bGUiLCJkZWZhdWx0Il0sInNvdXJjZXMiOlsiLi4vc3JjL2R5Z3JhcGgtY2FudmFzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMDYgRGFuIFZhbmRlcmthbSAoZGFudmRrQGdtYWlsLmNvbSlcbiAqIE1JVC1saWNlbmNlZDogaHR0cHM6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlL01JVFxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBCYXNlZCBvbiBQbG90S2l0LkNhbnZhc1JlbmRlcmVyLCBidXQgbW9kaWZpZWQgdG8gbWVldCB0aGVcbiAqIG5lZWRzIG9mIGR5Z3JhcGhzLlxuICpcbiAqIEluIHBhcnRpY3VsYXIsIHN1cHBvcnQgZm9yOlxuICogLSBncmlkIG92ZXJsYXlzXG4gKiAtIGhpZ2gvbG93IGJhbmRzXG4gKiAtIGR5Z3JhcGhzIGF0dHJpYnV0ZSBzeXN0ZW1cbiAqL1xuXG4vKipcbiAqIFRoZSBEeWdyYXBoQ2FudmFzUmVuZGVyZXIgY2xhc3MgZG9lcyB0aGUgYWN0dWFsIHJlbmRlcmluZyBvZiB0aGUgY2hhcnQgb250b1xuICogYSBjYW52YXMuIEl0J3MgYmFzZWQgb24gUGxvdEtpdC5DYW52YXNSZW5kZXJlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IFRoZSBjYW52YXMgdG8gYXR0YWNoIHRvXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudENvbnRleHQgVGhlIDJkIGNvbnRleHQgb2YgdGhlIGNhbnZhcyAoaW5qZWN0ZWQgc28gaXRcbiAqIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcuKVxuICogQHBhcmFtIHtMYXlvdXR9IGxheW91dCBUaGUgRHlncmFwaExheW91dCBvYmplY3QgZm9yIHRoaXMgZ3JhcGguXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG4vKmdsb2JhbCBEeWdyYXBoOmZhbHNlICovXG5cbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vZHlncmFwaC11dGlscyc7XG5pbXBvcnQgRHlncmFwaCBmcm9tICcuL2R5Z3JhcGgnO1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIFRoaXMgZ2V0cyBjYWxsZWQgd2hlbiB0aGVyZSBhcmUgXCJuZXcgcG9pbnRzXCIgdG8gY2hhcnQuIFRoaXMgaXMgZ2VuZXJhbGx5IHRoZVxuICogY2FzZSB3aGVuIHRoZSB1bmRlcmx5aW5nIGRhdGEgYmVpbmcgY2hhcnRlZCBoYXMgY2hhbmdlZC4gSXQgaXMgX25vdF8gY2FsbGVkXG4gKiBpbiB0aGUgY29tbW9uIGNhc2UgdGhhdCB0aGUgdXNlciBoYXMgem9vbWVkIG9yIGlzIHBhbm5pbmcgdGhlIHZpZXcuXG4gKlxuICogVGhlIGNoYXJ0IGNhbnZhcyBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQgYnkgdGhlIER5Z3JhcGggb2JqZWN0LiBUaGVcbiAqIHJlbmRlcmVyIHNpbXBseSBnZXRzIGEgZHJhd2luZyBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB7RHlncmFwaH0gZHlncmFwaCBUaGUgY2hhcnQgdG8gd2hpY2ggdGhpcyByZW5kZXJlciBiZWxvbmdzLlxuICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gZWxlbWVudCBUaGUgJmx0O2NhbnZhcyZndDsgRE9NIGVsZW1lbnQgb24gd2hpY2ggdG8gZHJhdy5cbiAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBlbGVtZW50Q29udGV4dCBUaGUgZHJhd2luZyBjb250ZXh0LlxuICogQHBhcmFtIHtEeWdyYXBoTGF5b3V0fSBsYXlvdXQgVGhlIGNoYXJ0J3MgRHlncmFwaExheW91dCBvYmplY3QuXG4gKlxuICogVE9ETyhkYW52ayk6IHJlbW92ZSB0aGUgZWxlbWVudENvbnRleHQgcHJvcGVydHkuXG4gKi9cbnZhciBEeWdyYXBoQ2FudmFzUmVuZGVyZXIgPSBmdW5jdGlvbihkeWdyYXBoLCBlbGVtZW50LCBlbGVtZW50Q29udGV4dCwgbGF5b3V0KSB7XG4gIHRoaXMuZHlncmFwaF8gPSBkeWdyYXBoO1xuXG4gIHRoaXMubGF5b3V0ID0gbGF5b3V0O1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLmVsZW1lbnRDb250ZXh0ID0gZWxlbWVudENvbnRleHQ7XG5cbiAgdGhpcy5oZWlnaHQgPSBkeWdyYXBoLmhlaWdodF87XG4gIHRoaXMud2lkdGggPSBkeWdyYXBoLndpZHRoXztcblxuICAvLyAtLS0gY2hlY2sgd2hldGhlciBldmVyeXRoaW5nIGlzIG9rIGJlZm9yZSB3ZSByZXR1cm5cbiAgaWYgKCF1dGlscy5pc0NhbnZhc1N1cHBvcnRlZCh0aGlzLmVsZW1lbnQpKSB7XG4gICAgdGhyb3cgXCJDYW52YXMgaXMgbm90IHN1cHBvcnRlZC5cIjtcbiAgfVxuXG4gIC8vIGludGVybmFsIHN0YXRlXG4gIHRoaXMuYXJlYSA9IGxheW91dC5nZXRQbG90QXJlYSgpO1xuXG4gIC8vIFNldCB1cCBhIGNsaXBwaW5nIGFyZWEgZm9yIHRoZSBjYW52YXMgKGFuZCB0aGUgaW50ZXJhY3Rpb24gY2FudmFzKS5cbiAgLy8gVGhpcyBlbnN1cmVzIHRoYXQgd2UgZG9uJ3Qgb3ZlcmRyYXcuXG4gIHZhciBjdHggPSB0aGlzLmR5Z3JhcGhfLmNhbnZhc19jdHhfO1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5yZWN0KHRoaXMuYXJlYS54LCB0aGlzLmFyZWEueSwgdGhpcy5hcmVhLncsIHRoaXMuYXJlYS5oKTtcbiAgY3R4LmNsaXAoKTtcblxuICBjdHggPSB0aGlzLmR5Z3JhcGhfLmhpZGRlbl9jdHhfO1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5yZWN0KHRoaXMuYXJlYS54LCB0aGlzLmFyZWEueSwgdGhpcy5hcmVhLncsIHRoaXMuYXJlYS5oKTtcbiAgY3R4LmNsaXAoKTtcbn07XG5cbi8qKlxuICogQ2xlYXJzIG91dCBhbGwgY2hhcnQgY29udGVudCBhbmQgRE9NIGVsZW1lbnRzLlxuICogVGhpcyBpcyBjYWxsZWQgaW1tZWRpYXRlbHkgYmVmb3JlIHJlbmRlcigpIG9uIGV2ZXJ5IGZyYW1lLCBpbmNsdWRpbmdcbiAqIGR1cmluZyB6b29tcyBhbmQgcGFucy5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhDYW52YXNSZW5kZXJlci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50Q29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyByZXNwb25zaWJsZSBmb3IgZHJhd2luZyBldmVyeXRoaW5nIG9uIHRoZSBjaGFydCwgaW5jbHVkaW5nXG4gKiBsaW5lcywgaGlnaC9sb3cgYmFuZHMsIGZpbGxzIGFuZCBheGVzLlxuICogSXQgaXMgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIGNsZWFyKCkgb24gZXZlcnkgZnJhbWUsIGluY2x1ZGluZyBkdXJpbmcgcGFuc1xuICogYW5kIHpvb21zLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaENhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgLy8gYXR0YWNoZXMgcG9pbnQuY2FudmFze3gseX1cbiAgdGhpcy5fdXBkYXRlUG9pbnRzKCk7XG5cbiAgLy8gYWN0dWFsbHkgZHJhd3MgdGhlIGNoYXJ0LlxuICB0aGlzLl9yZW5kZXJMaW5lQ2hhcnQoKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByZWRpY2F0ZSB0byBiZSB1c2VkIHdpdGggYW4gaXRlcmF0b3IsIHdoaWNoIHdpbGxcbiAqIGl0ZXJhdGUgb3ZlciBwb2ludHMgYXBwcm9wcmlhdGVseSwgZGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAqIGNvbm5lY3RTZXBhcmF0ZWRQb2ludHMgaXMgdHJ1ZS4gV2hlbiBpdCdzIGZhbHNlLCB0aGUgcHJlZGljYXRlIHdpbGxcbiAqIHNraXAgb3ZlciBwb2ludHMgd2l0aCBtaXNzaW5nIHlWYWxzLlxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2dldEl0ZXJhdG9yUHJlZGljYXRlID0gZnVuY3Rpb24oY29ubmVjdFNlcGFyYXRlZFBvaW50cykge1xuICByZXR1cm4gY29ubmVjdFNlcGFyYXRlZFBvaW50cyA/XG4gICAgICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX3ByZWRpY2F0ZVRoYXRTa2lwc0VtcHR5UG9pbnRzIDpcbiAgICAgIG51bGw7XG59O1xuXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIuX3ByZWRpY2F0ZVRoYXRTa2lwc0VtcHR5UG9pbnRzID1cbiAgICBmdW5jdGlvbihhcnJheSwgaWR4KSB7XG4gIHJldHVybiBhcnJheVtpZHhdLnl2YWwgIT09IG51bGw7XG59O1xuXG4vKipcbiAqIERyYXdzIGEgbGluZSB3aXRoIHRoZSBzdHlsZXMgcGFzc2VkIGluIGFuZCBjYWxscyBhbGwgdGhlIGRyYXdQb2ludENhbGxiYWNrcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlIFRoZSBkaWN0aW9uYXJ5IHBhc3NlZCB0byB0aGUgcGxvdHRlciBmdW5jdGlvbi5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhDYW52YXNSZW5kZXJlci5fZHJhd1N0eWxlZExpbmUgPSBmdW5jdGlvbihlLFxuICAgIGNvbG9yLCBzdHJva2VXaWR0aCwgc3Ryb2tlUGF0dGVybiwgZHJhd1BvaW50cyxcbiAgICBkcmF3UG9pbnRDYWxsYmFjaywgcG9pbnRTaXplKSB7XG4gIHZhciBnID0gZS5keWdyYXBoO1xuICAvLyBUT0RPKGtvbmlnc2JlcmcpOiBDb21wdXRlIGF0dHJpYnV0ZXMgb3V0c2lkZSB0aGlzIG1ldGhvZCBjYWxsLlxuICB2YXIgc3RlcFBsb3QgPSBnLmdldEJvb2xlYW5PcHRpb24oXCJzdGVwUGxvdFwiLCBlLnNldE5hbWUpO1xuXG4gIGlmICghdXRpbHMuaXNBcnJheUxpa2Uoc3Ryb2tlUGF0dGVybikpIHtcbiAgICBzdHJva2VQYXR0ZXJuID0gbnVsbDtcbiAgfVxuXG4gIHZhciBkcmF3R2FwUG9pbnRzID0gZy5nZXRCb29sZWFuT3B0aW9uKCdkcmF3R2FwRWRnZVBvaW50cycsIGUuc2V0TmFtZSk7XG5cbiAgdmFyIHBvaW50cyA9IGUucG9pbnRzO1xuICB2YXIgc2V0TmFtZSA9IGUuc2V0TmFtZTtcbiAgdmFyIGl0ZXIgPSB1dGlscy5jcmVhdGVJdGVyYXRvcihwb2ludHMsIDAsIHBvaW50cy5sZW5ndGgsXG4gICAgICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2dldEl0ZXJhdG9yUHJlZGljYXRlKFxuICAgICAgICAgIGcuZ2V0Qm9vbGVhbk9wdGlvbihcImNvbm5lY3RTZXBhcmF0ZWRQb2ludHNcIiwgc2V0TmFtZSkpKTtcblxuICB2YXIgc3Ryb2tpbmcgPSBzdHJva2VQYXR0ZXJuICYmIChzdHJva2VQYXR0ZXJuLmxlbmd0aCA+PSAyKTtcblxuICB2YXIgY3R4ID0gZS5kcmF3aW5nQ29udGV4dDtcbiAgY3R4LnNhdmUoKTtcbiAgaWYgKHN0cm9raW5nKSB7XG4gICAgaWYgKGN0eC5zZXRMaW5lRGFzaCkgY3R4LnNldExpbmVEYXNoKHN0cm9rZVBhdHRlcm4pO1xuICB9XG5cbiAgdmFyIHBvaW50c09uTGluZSA9IER5Z3JhcGhDYW52YXNSZW5kZXJlci5fZHJhd1NlcmllcyhcbiAgICAgIGUsIGl0ZXIsIHN0cm9rZVdpZHRoLCBwb2ludFNpemUsIGRyYXdQb2ludHMsIGRyYXdHYXBQb2ludHMsIHN0ZXBQbG90LCBjb2xvcik7XG4gIER5Z3JhcGhDYW52YXNSZW5kZXJlci5fZHJhd1BvaW50c09uTGluZShcbiAgICAgIGUsIHBvaW50c09uTGluZSwgZHJhd1BvaW50Q2FsbGJhY2ssIGNvbG9yLCBwb2ludFNpemUpO1xuXG4gIGlmIChzdHJva2luZykge1xuICAgIGlmIChjdHguc2V0TGluZURhc2gpIGN0eC5zZXRMaW5lRGFzaChbXSk7XG4gIH1cblxuICBjdHgucmVzdG9yZSgpO1xufTtcblxuLyoqXG4gKiBUaGlzIGRvZXMgdGhlIGFjdHVhbCBkcmF3aW5nIG9mIGxpbmVzIG9uIHRoZSBjYW52YXMsIGZvciBqdXN0IG9uZSBzZXJpZXMuXG4gKiBSZXR1cm5zIGEgbGlzdCBvZiBbY2FudmFzeCwgY2FudmFzeV0gcGFpcnMgZm9yIHBvaW50cyBmb3Igd2hpY2ggYVxuICogZHJhd1BvaW50Q2FsbGJhY2sgc2hvdWxkIGJlIGZpcmVkLiAgVGhlc2UgaW5jbHVkZSBpc29sYXRlZCBwb2ludHMsIG9yIGFsbFxuICogcG9pbnRzIGlmIGRyYXdQb2ludHM9dHJ1ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlIFRoZSBkaWN0aW9uYXJ5IHBhc3NlZCB0byB0aGUgcGxvdHRlciBmdW5jdGlvbi5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhDYW52YXNSZW5kZXJlci5fZHJhd1NlcmllcyA9IGZ1bmN0aW9uKGUsXG4gICAgaXRlciwgc3Ryb2tlV2lkdGgsIHBvaW50U2l6ZSwgZHJhd1BvaW50cywgZHJhd0dhcFBvaW50cywgc3RlcFBsb3QsIGNvbG9yKSB7XG5cbiAgdmFyIHByZXZDYW52YXNYID0gbnVsbDtcbiAgdmFyIHByZXZDYW52YXNZID0gbnVsbDtcbiAgdmFyIG5leHRDYW52YXNZID0gbnVsbDtcbiAgdmFyIGlzSXNvbGF0ZWQ7IC8vIHRydWUgaWYgdGhpcyBwb2ludCBpcyBpc29sYXRlZCAobm8gbGluZSBzZWdtZW50cylcbiAgdmFyIHBvaW50OyAvLyB0aGUgcG9pbnQgYmVpbmcgcHJvY2Vzc2VkIGluIHRoZSB3aGlsZSBsb29wXG4gIHZhciBwb2ludHNPbkxpbmUgPSBbXTsgLy8gQXJyYXkgb2YgW2NhbnZhc3gsIGNhbnZhc3ldIHBhaXJzLlxuICB2YXIgZmlyc3QgPSB0cnVlOyAvLyB0aGUgZmlyc3QgY3ljbGUgdGhyb3VnaCB0aGUgd2hpbGUgbG9vcFxuXG4gIHZhciBjdHggPSBlLmRyYXdpbmdDb250ZXh0O1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICBjdHgubGluZVdpZHRoID0gc3Ryb2tlV2lkdGg7XG5cbiAgLy8gTk9URTogd2UgYnJlYWsgdGhlIGl0ZXJhdG9yJ3MgZW5jYXBzdWxhdGlvbiBoZXJlIGZvciBhYm91dCBhIDI1JSBzcGVlZHVwLlxuICB2YXIgYXJyID0gaXRlci5hcnJheV87XG4gIHZhciBsaW1pdCA9IGl0ZXIuZW5kXztcbiAgdmFyIHByZWRpY2F0ZSA9IGl0ZXIucHJlZGljYXRlXztcblxuICBmb3IgKHZhciBpID0gaXRlci5zdGFydF87IGkgPCBsaW1pdDsgaSsrKSB7XG4gICAgcG9pbnQgPSBhcnJbaV07XG4gICAgaWYgKHByZWRpY2F0ZSkge1xuICAgICAgd2hpbGUgKGkgPCBsaW1pdCAmJiAhcHJlZGljYXRlKGFyciwgaSkpIHtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgICAgaWYgKGkgPT0gbGltaXQpIGJyZWFrO1xuICAgICAgcG9pbnQgPSBhcnJbaV07XG4gICAgfVxuXG4gICAgLy8gRklYTUU6IFRoZSAnY2FudmFzeSAhPSBjYW52YXN5JyB0ZXN0IGhlcmUgY2F0Y2hlcyBOYU4gdmFsdWVzIGJ1dCB0aGUgdGVzdFxuICAgIC8vIGRvZXNuJ3QgY2F0Y2ggSW5maW5pdHkgdmFsdWVzLiBDb3VsZCBjaGFuZ2UgdGhpcyB0b1xuICAgIC8vICFpc0Zpbml0ZShwb2ludC5jYW52YXN5KSwgYnV0IEkgYXNzdW1lIGl0IGF2b2lkcyBpc05hTiBmb3IgcGVyZm9ybWFuY2U/XG4gICAgaWYgKHBvaW50LmNhbnZhc3kgPT09IG51bGwgfHwgcG9pbnQuY2FudmFzeSAhPSBwb2ludC5jYW52YXN5KSB7XG4gICAgICBpZiAoc3RlcFBsb3QgJiYgcHJldkNhbnZhc1ggIT09IG51bGwpIHtcbiAgICAgICAgLy8gRHJhdyBhIGhvcml6b250YWwgbGluZSB0byB0aGUgc3RhcnQgb2YgdGhlIG1pc3NpbmcgZGF0YVxuICAgICAgICBjdHgubW92ZVRvKHByZXZDYW52YXNYLCBwcmV2Q2FudmFzWSk7XG4gICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgcHJldkNhbnZhc1kpO1xuICAgICAgfVxuICAgICAgcHJldkNhbnZhc1ggPSBwcmV2Q2FudmFzWSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzSXNvbGF0ZWQgPSBmYWxzZTtcbiAgICAgIGlmIChkcmF3R2FwUG9pbnRzIHx8IHByZXZDYW52YXNYID09PSBudWxsKSB7XG4gICAgICAgIGl0ZXIubmV4dElkeF8gPSBpO1xuICAgICAgICBpdGVyLm5leHQoKTtcbiAgICAgICAgbmV4dENhbnZhc1kgPSBpdGVyLmhhc05leHQgPyBpdGVyLnBlZWsuY2FudmFzeSA6IG51bGw7XG5cbiAgICAgICAgdmFyIGlzTmV4dENhbnZhc1lOdWxsT3JOYU4gPSBuZXh0Q2FudmFzWSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgbmV4dENhbnZhc1kgIT0gbmV4dENhbnZhc1k7XG4gICAgICAgIGlzSXNvbGF0ZWQgPSAocHJldkNhbnZhc1ggPT09IG51bGwgJiYgaXNOZXh0Q2FudmFzWU51bGxPck5hTik7XG4gICAgICAgIGlmIChkcmF3R2FwUG9pbnRzKSB7XG4gICAgICAgICAgLy8gQWxzbyBjb25zaWRlciBhIHBvaW50IHRvIGJlIFwiaXNvbGF0ZWRcIiBpZiBpdCdzIGFkamFjZW50IHRvIGFcbiAgICAgICAgICAvLyBudWxsIHBvaW50LCBleGNsdWRpbmcgdGhlIGdyYXBoIGVkZ2VzLlxuICAgICAgICAgIGlmICgoIWZpcnN0ICYmIHByZXZDYW52YXNYID09PSBudWxsKSB8fFxuICAgICAgICAgICAgICAoaXRlci5oYXNOZXh0ICYmIGlzTmV4dENhbnZhc1lOdWxsT3JOYU4pKSB7XG4gICAgICAgICAgICBpc0lzb2xhdGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHByZXZDYW52YXNYICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChzdHJva2VXaWR0aCkge1xuICAgICAgICAgIGlmIChzdGVwUGxvdCkge1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyhwcmV2Q2FudmFzWCwgcHJldkNhbnZhc1kpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhwb2ludC5jYW52YXN4LCBwcmV2Q2FudmFzWSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY3R4LmxpbmVUbyhwb2ludC5jYW52YXN4LCBwb2ludC5jYW52YXN5KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3R4Lm1vdmVUbyhwb2ludC5jYW52YXN4LCBwb2ludC5jYW52YXN5KTtcbiAgICAgIH1cbiAgICAgIGlmIChkcmF3UG9pbnRzIHx8IGlzSXNvbGF0ZWQpIHtcbiAgICAgICAgcG9pbnRzT25MaW5lLnB1c2goW3BvaW50LmNhbnZhc3gsIHBvaW50LmNhbnZhc3ksIHBvaW50LmlkeF0pO1xuICAgICAgfVxuICAgICAgcHJldkNhbnZhc1ggPSBwb2ludC5jYW52YXN4O1xuICAgICAgcHJldkNhbnZhc1kgPSBwb2ludC5jYW52YXN5O1xuICAgIH1cbiAgICBmaXJzdCA9IGZhbHNlO1xuICB9XG4gIGN0eC5zdHJva2UoKTtcbiAgcmV0dXJuIHBvaW50c09uTGluZTtcbn07XG5cbi8qKlxuICogVGhpcyBmaXJlcyB0aGUgZHJhd1BvaW50Q2FsbGJhY2sgZnVuY3Rpb25zLCB3aGljaCBkcmF3IGRvdHMgb24gdGhlIHBvaW50cyBieVxuICogZGVmYXVsdC4gVGhpcyBnZXRzIHVzZWQgd2hlbiB0aGUgXCJkcmF3UG9pbnRzXCIgb3B0aW9uIGlzIHNldCwgb3Igd2hlbiB0aGVyZVxuICogYXJlIGlzb2xhdGVkIHBvaW50cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlIFRoZSBkaWN0aW9uYXJ5IHBhc3NlZCB0byB0aGUgcGxvdHRlciBmdW5jdGlvbi5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhDYW52YXNSZW5kZXJlci5fZHJhd1BvaW50c09uTGluZSA9IGZ1bmN0aW9uKFxuICAgIGUsIHBvaW50c09uTGluZSwgZHJhd1BvaW50Q2FsbGJhY2ssIGNvbG9yLCBwb2ludFNpemUpIHtcbiAgdmFyIGN0eCA9IGUuZHJhd2luZ0NvbnRleHQ7XG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IHBvaW50c09uTGluZS5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdmFyIGNiID0gcG9pbnRzT25MaW5lW2lkeF07XG4gICAgY3R4LnNhdmUoKTtcbiAgICBkcmF3UG9pbnRDYWxsYmFjay5jYWxsKGUuZHlncmFwaCxcbiAgICAgICAgZS5keWdyYXBoLCBlLnNldE5hbWUsIGN0eCwgY2JbMF0sIGNiWzFdLCBjb2xvciwgcG9pbnRTaXplLCBjYlsyXSk7XG4gICAgY3R4LnJlc3RvcmUoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBdHRhY2hlcyBjYW52YXMgY29vcmRpbmF0ZXMgdG8gdGhlIHBvaW50cyBhcnJheS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhDYW52YXNSZW5kZXJlci5wcm90b3R5cGUuX3VwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAvLyBVcGRhdGUgUG9pbnRzXG4gIC8vIFRPRE8oZGFudmspOiBoZXJlXG4gIC8vXG4gIC8vIFRPRE8oYmhzKTogdGhpcyBsb29wIGlzIGEgaG90LXNwb3QgZm9yIGhpZ2gtcG9pbnQtY291bnQgY2hhcnRzLiBUaGVzZVxuICAvLyB0cmFuc2Zvcm1hdGlvbnMgY2FuIGJlIHB1c2hlZCBpbnRvIHRoZSBjYW52YXMgdmlhIGxpbmVhciB0cmFuc2Zvcm1hdGlvblxuICAvLyBtYXRyaWNlcy5cbiAgLy8gTk9URShkYW52ayk6IHRoaXMgaXMgdHJpY2tpZXIgdGhhbiBpdCBzb3VuZHMgYXQgZmlyc3QuIFRoZSB0cmFuc2Zvcm1hdGlvblxuICAvLyBuZWVkcyB0byBiZSBkb25lIGJlZm9yZSB0aGUgLm1vdmVUbygpIGFuZCAubGluZVRvKCkgY2FsbHMsIGJ1dCBtdXN0IGJlXG4gIC8vIHVuZG9uZSBiZWZvcmUgdGhlIC5zdHJva2UoKSBjYWxsIHRvIGVuc3VyZSB0aGF0IHRoZSBzdHJva2Ugd2lkdGggaXNcbiAgLy8gdW5hZmZlY3RlZC4gIEFuIGFsdGVybmF0aXZlIGlzIHRvIHJlZHVjZSB0aGUgc3Ryb2tlIHdpZHRoIGluIHRoZVxuICAvLyB0cmFuc2Zvcm1lZCBjb29yZGluYXRlIHNwYWNlLCBidXQgeW91IGNhbid0IHNwZWNpZnkgZGlmZmVyZW50IHZhbHVlcyBmb3JcbiAgLy8gZWFjaCBkaW1lbnNpb24gKGFzIHlvdSBjYW4gd2l0aCAuc2NhbGUoKSkuIFRoZSBzcGVlZHVwIGhlcmUgaXMgfjEyJS5cbiAgdmFyIHNldHMgPSB0aGlzLmxheW91dC5wb2ludHM7XG4gIGZvciAodmFyIGkgPSBzZXRzLmxlbmd0aDsgaS0tOykge1xuICAgIHZhciBwb2ludHMgPSBzZXRzW2ldO1xuICAgIGZvciAodmFyIGogPSBwb2ludHMubGVuZ3RoOyBqLS07KSB7XG4gICAgICB2YXIgcG9pbnQgPSBwb2ludHNbal07XG4gICAgICBwb2ludC5jYW52YXN4ID0gdGhpcy5hcmVhLncgKiBwb2ludC54ICsgdGhpcy5hcmVhLng7XG4gICAgICBwb2ludC5jYW52YXN5ID0gdGhpcy5hcmVhLmggKiBwb2ludC55ICsgdGhpcy5hcmVhLnk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEFkZCBjYW52YXMgQWN0dWFsbHkgZHJhdyB0aGUgbGluZXMgY2hhcnQsIGluY2x1ZGluZyBoaWdoL2xvdyBiYW5kcy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGNhbiBvbmx5IGJlIGNhbGxlZCBpZiBEeWdyYXBoTGF5b3V0J3MgcG9pbnRzIGFycmF5IGhhcyBiZWVuXG4gKiB1cGRhdGVkIHdpdGggY2FudmFze3gseX0gYXR0cmlidXRlcywgaS5lLiBieVxuICogRHlncmFwaENhbnZhc1JlbmRlcmVyLl91cGRhdGVQb2ludHMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfc2VyaWVzTmFtZSB3aGVuIHNwZWNpZmllZCwgb25seSB0aGF0IHNlcmllcyB3aWxsXG4gKiAgICAgYmUgZHJhd24uIChUaGlzIGlzIHVzZWQgZm9yIGV4cGVkaXRlZCByZWRyYXdpbmcgd2l0aCBoaWdobGlnaHRTZXJpZXNPcHRzKVxuICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IG9wdF9jdHggd2hlbiBzcGVjaWZpZWQsIHRoZSBkcmF3aW5nXG4gKiAgICAgY29udGV4dC4gIEhvd2V2ZXIsIGxpbmVzIGFyZSB0eXBpY2FsbHkgZHJhd24gb24gdGhlIG9iamVjdCdzXG4gKiAgICAgZWxlbWVudENvbnRleHQuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLl9yZW5kZXJMaW5lQ2hhcnQgPSBmdW5jdGlvbihvcHRfc2VyaWVzTmFtZSwgb3B0X2N0eCkge1xuICB2YXIgY3R4ID0gb3B0X2N0eCB8fCB0aGlzLmVsZW1lbnRDb250ZXh0O1xuICB2YXIgaTtcblxuICB2YXIgc2V0cyA9IHRoaXMubGF5b3V0LnBvaW50cztcbiAgdmFyIHNldE5hbWVzID0gdGhpcy5sYXlvdXQuc2V0TmFtZXM7XG4gIHZhciBzZXROYW1lO1xuXG4gIHRoaXMuY29sb3JzID0gdGhpcy5keWdyYXBoXy5jb2xvcnNNYXBfO1xuXG4gIC8vIERldGVybWluZSB3aGljaCBzZXJpZXMgaGF2ZSBzcGVjaWFsaXplZCBwbG90dGVycy5cbiAgdmFyIHBsb3R0ZXJfYXR0ciA9IHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uKFwicGxvdHRlclwiKTtcbiAgdmFyIHBsb3R0ZXJzID0gcGxvdHRlcl9hdHRyO1xuICBpZiAoIXV0aWxzLmlzQXJyYXlMaWtlKHBsb3R0ZXJzKSkge1xuICAgIHBsb3R0ZXJzID0gW3Bsb3R0ZXJzXTtcbiAgfVxuXG4gIHZhciBzZXRQbG90dGVycyA9IHt9OyAgLy8gc2VyaWVzIG5hbWUgLT4gcGxvdHRlciBmbi5cbiAgZm9yIChpID0gMDsgaSA8IHNldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc2V0TmFtZSA9IHNldE5hbWVzW2ldO1xuICAgIHZhciBzZXRQbG90dGVyID0gdGhpcy5keWdyYXBoXy5nZXRPcHRpb24oXCJwbG90dGVyXCIsIHNldE5hbWUpO1xuICAgIGlmIChzZXRQbG90dGVyID09IHBsb3R0ZXJfYXR0cikgY29udGludWU7ICAvLyBub3Qgc3BlY2lhbGl6ZWQuXG5cbiAgICBzZXRQbG90dGVyc1tzZXROYW1lXSA9IHNldFBsb3R0ZXI7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgcGxvdHRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGxvdHRlciA9IHBsb3R0ZXJzW2ldO1xuICAgIHZhciBpc19sYXN0ID0gKGkgPT0gcGxvdHRlcnMubGVuZ3RoIC0gMSk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNldHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHNldE5hbWUgPSBzZXROYW1lc1tqXTtcbiAgICAgIGlmIChvcHRfc2VyaWVzTmFtZSAmJiBzZXROYW1lICE9IG9wdF9zZXJpZXNOYW1lKSBjb250aW51ZTtcblxuICAgICAgdmFyIHBvaW50cyA9IHNldHNbal07XG5cbiAgICAgIC8vIE9ubHkgdGhyb3cgaW4gdGhlIHNwZWNpYWxpemVkIHBsb3R0ZXJzIG9uIHRoZSBsYXN0IGl0ZXJhdGlvbi5cbiAgICAgIHZhciBwID0gcGxvdHRlcjtcbiAgICAgIGlmIChzZXROYW1lIGluIHNldFBsb3R0ZXJzKSB7XG4gICAgICAgIGlmIChpc19sYXN0KSB7XG4gICAgICAgICAgcCA9IHNldFBsb3R0ZXJzW3NldE5hbWVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIERvbid0IHVzZSB0aGUgc3RhbmRhcmQgcGxvdHRlcnMgaW4gdGhpcyBjYXNlLlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBjb2xvciA9IHRoaXMuY29sb3JzW3NldE5hbWVdO1xuICAgICAgdmFyIHN0cm9rZVdpZHRoID0gdGhpcy5keWdyYXBoXy5nZXRPcHRpb24oXCJzdHJva2VXaWR0aFwiLCBzZXROYW1lKTtcblxuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgY3R4LmxpbmVXaWR0aCA9IHN0cm9rZVdpZHRoO1xuICAgICAgcCh7XG4gICAgICAgIHBvaW50czogcG9pbnRzLFxuICAgICAgICBzZXROYW1lOiBzZXROYW1lLFxuICAgICAgICBkcmF3aW5nQ29udGV4dDogY3R4LFxuICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgIHN0cm9rZVdpZHRoOiBzdHJva2VXaWR0aCxcbiAgICAgICAgZHlncmFwaDogdGhpcy5keWdyYXBoXyxcbiAgICAgICAgYXhpczogdGhpcy5keWdyYXBoXy5heGlzUHJvcGVydGllc0ZvclNlcmllcyhzZXROYW1lKSxcbiAgICAgICAgcGxvdEFyZWE6IHRoaXMuYXJlYSxcbiAgICAgICAgc2VyaWVzSW5kZXg6IGosXG4gICAgICAgIHNlcmllc0NvdW50OiBzZXRzLmxlbmd0aCxcbiAgICAgICAgc2luZ2xlU2VyaWVzTmFtZTogb3B0X3Nlcmllc05hbWUsXG4gICAgICAgIGFsbFNlcmllc1BvaW50czogc2V0c1xuICAgICAgfSk7XG4gICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBTdGFuZGFyZCBwbG90dGVycy4gVGhlc2UgbWF5IGJlIHVzZWQgYnkgY2xpZW50cyB2aWEgRHlncmFwaC5QbG90dGVycy5cbiAqIFNlZSBjb21tZW50cyB0aGVyZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIuX1Bsb3R0ZXJzID0ge1xuICBsaW5lUGxvdHRlcjogZnVuY3Rpb24oZSkge1xuICAgIER5Z3JhcGhDYW52YXNSZW5kZXJlci5fbGluZVBsb3R0ZXIoZSk7XG4gIH0sXG5cbiAgZmlsbFBsb3R0ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2ZpbGxQbG90dGVyKGUpO1xuICB9LFxuXG4gIGVycm9yUGxvdHRlcjogZnVuY3Rpb24oZSkge1xuICAgIER5Z3JhcGhDYW52YXNSZW5kZXJlci5fZXJyb3JQbG90dGVyKGUpO1xuICB9XG59O1xuXG4vKipcbiAqIFBsb3R0ZXIgd2hpY2ggZHJhd3MgdGhlIGNlbnRyYWwgbGluZXMgZm9yIGEgc2VyaWVzLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaENhbnZhc1JlbmRlcmVyLl9saW5lUGxvdHRlciA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIGcgPSBlLmR5Z3JhcGg7XG4gIHZhciBzZXROYW1lID0gZS5zZXROYW1lO1xuICB2YXIgc3Ryb2tlV2lkdGggPSBlLnN0cm9rZVdpZHRoO1xuXG4gIC8vIFRPRE8oZGFudmspOiBDaGVjayBpZiB0aGVyZSdzIGFueSBwZXJmb3JtYW5jZSBpbXBhY3Qgb2YganVzdCBjYWxsaW5nXG4gIC8vIGdldE9wdGlvbigpIGluc2lkZSBvZiBfZHJhd1N0eWxlZExpbmUuIFBhc3NpbmcgaW4gc28gbWFueSBwYXJhbWV0ZXJzIG1ha2VzXG4gIC8vIHRoaXMgY29kZSBhIGJpdCBuYXN0eS5cbiAgdmFyIGJvcmRlcldpZHRoID0gZy5nZXROdW1lcmljT3B0aW9uKFwic3Ryb2tlQm9yZGVyV2lkdGhcIiwgc2V0TmFtZSk7XG4gIHZhciBkcmF3UG9pbnRDYWxsYmFjayA9IGcuZ2V0T3B0aW9uKFwiZHJhd1BvaW50Q2FsbGJhY2tcIiwgc2V0TmFtZSkgfHxcbiAgICAgIHV0aWxzLkNpcmNsZXMuREVGQVVMVDtcbiAgdmFyIHN0cm9rZVBhdHRlcm4gPSBnLmdldE9wdGlvbihcInN0cm9rZVBhdHRlcm5cIiwgc2V0TmFtZSk7XG4gIHZhciBkcmF3UG9pbnRzID0gZy5nZXRCb29sZWFuT3B0aW9uKFwiZHJhd1BvaW50c1wiLCBzZXROYW1lKTtcbiAgdmFyIHBvaW50U2l6ZSA9IGcuZ2V0TnVtZXJpY09wdGlvbihcInBvaW50U2l6ZVwiLCBzZXROYW1lKTtcblxuICBpZiAoYm9yZGVyV2lkdGggJiYgc3Ryb2tlV2lkdGgpIHtcbiAgICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2RyYXdTdHlsZWRMaW5lKGUsXG4gICAgICAgIGcuZ2V0T3B0aW9uKFwic3Ryb2tlQm9yZGVyQ29sb3JcIiwgc2V0TmFtZSksXG4gICAgICAgIHN0cm9rZVdpZHRoICsgMiAqIGJvcmRlcldpZHRoLFxuICAgICAgICBzdHJva2VQYXR0ZXJuLFxuICAgICAgICBkcmF3UG9pbnRzLFxuICAgICAgICBkcmF3UG9pbnRDYWxsYmFjayxcbiAgICAgICAgcG9pbnRTaXplXG4gICAgICAgICk7XG4gIH1cblxuICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2RyYXdTdHlsZWRMaW5lKGUsXG4gICAgICBlLmNvbG9yLFxuICAgICAgc3Ryb2tlV2lkdGgsXG4gICAgICBzdHJva2VQYXR0ZXJuLFxuICAgICAgZHJhd1BvaW50cyxcbiAgICAgIGRyYXdQb2ludENhbGxiYWNrLFxuICAgICAgcG9pbnRTaXplXG4gICk7XG59O1xuXG4vKipcbiAqIERyYXdzIHRoZSBzaGFkZWQgaGlnaC9sb3cgYmFuZHMgKGNvbmZpZGVuY2UgaW50ZXJ2YWxzKSBmb3IgZWFjaCBzZXJpZXMuXG4gKiBUaGlzIGhhcHBlbnMgYmVmb3JlIHRoZSBjZW50ZXIgbGluZXMgYXJlIGRyYXduLCBzaW5jZSB0aGUgY2VudGVyIGxpbmVzXG4gKiBuZWVkIHRvIGJlIGRyYXduIG9uIHRvcCBvZiB0aGUgaGlnaC9sb3cgYmFuZHMgZm9yIGFsbCBzZXJpZXMuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2Vycm9yUGxvdHRlciA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIGcgPSBlLmR5Z3JhcGg7XG4gIHZhciBzZXROYW1lID0gZS5zZXROYW1lO1xuICB2YXIgZXJyb3JCYXJzID0gZy5nZXRCb29sZWFuT3B0aW9uKFwiZXJyb3JCYXJzXCIpIHx8XG4gICAgICBnLmdldEJvb2xlYW5PcHRpb24oXCJjdXN0b21CYXJzXCIpO1xuICBpZiAoIWVycm9yQmFycykgcmV0dXJuO1xuXG4gIHZhciBmaWxsR3JhcGggPSBnLmdldEJvb2xlYW5PcHRpb24oXCJmaWxsR3JhcGhcIiwgc2V0TmFtZSk7XG4gIGlmIChmaWxsR3JhcGgpIHtcbiAgICBjb25zb2xlLndhcm4oXCJDYW4ndCB1c2UgZmlsbEdyYXBoIG9wdGlvbiB3aXRoIGN1c3RvbUJhcnMgb3IgZXJyb3JCYXJzIG9wdGlvblwiKTtcbiAgfVxuXG4gIHZhciBjdHggPSBlLmRyYXdpbmdDb250ZXh0O1xuICB2YXIgY29sb3IgPSBlLmNvbG9yO1xuICB2YXIgZmlsbEFscGhhID0gZy5nZXROdW1lcmljT3B0aW9uKCdmaWxsQWxwaGEnLCBzZXROYW1lKTtcbiAgdmFyIHN0ZXBQbG90ID0gZy5nZXRCb29sZWFuT3B0aW9uKFwic3RlcFBsb3RcIiwgc2V0TmFtZSk7XG4gIHZhciBwb2ludHMgPSBlLnBvaW50cztcblxuICB2YXIgaXRlciA9IHV0aWxzLmNyZWF0ZUl0ZXJhdG9yKHBvaW50cywgMCwgcG9pbnRzLmxlbmd0aCxcbiAgICAgIER5Z3JhcGhDYW52YXNSZW5kZXJlci5fZ2V0SXRlcmF0b3JQcmVkaWNhdGUoXG4gICAgICAgICAgZy5nZXRCb29sZWFuT3B0aW9uKFwiY29ubmVjdFNlcGFyYXRlZFBvaW50c1wiLCBzZXROYW1lKSkpO1xuXG4gIHZhciBuZXdZcztcblxuICAvLyBzZXR1cCBncmFwaGljcyBjb250ZXh0XG4gIHZhciBwcmV2WCA9IE5hTjtcbiAgdmFyIHByZXZZID0gTmFOO1xuICB2YXIgcHJldllzID0gWy0xLCAtMV07XG4gIC8vIHNob3VsZCBiZSBzYW1lIGNvbG9yIGFzIHRoZSBsaW5lcyBidXQgb25seSAxNSUgb3BhcXVlLlxuICB2YXIgcmdiID0gdXRpbHMudG9SR0JfKGNvbG9yKTtcbiAgdmFyIGVycl9jb2xvciA9XG4gICAgICAncmdiYSgnICsgcmdiLnIgKyAnLCcgKyByZ2IuZyArICcsJyArIHJnYi5iICsgJywnICsgZmlsbEFscGhhICsgJyknO1xuICBjdHguZmlsbFN0eWxlID0gZXJyX2NvbG9yO1xuICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgdmFyIGlzTnVsbFVuZGVmaW5lZE9yTmFOID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgeCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBpc05hTih4KSk7XG4gIH07XG5cbiAgd2hpbGUgKGl0ZXIuaGFzTmV4dCkge1xuICAgIHZhciBwb2ludCA9IGl0ZXIubmV4dCgpO1xuICAgIGlmICgoIXN0ZXBQbG90ICYmIGlzTnVsbFVuZGVmaW5lZE9yTmFOKHBvaW50LnkpKSB8fFxuICAgICAgICAoc3RlcFBsb3QgJiYgIWlzTmFOKHByZXZZKSAmJiBpc051bGxVbmRlZmluZWRPck5hTihwcmV2WSkpKSB7XG4gICAgICBwcmV2WCA9IE5hTjtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIG5ld1lzID0gWyBwb2ludC55X2JvdHRvbSwgcG9pbnQueV90b3AgXTtcbiAgICBpZiAoc3RlcFBsb3QpIHtcbiAgICAgIHByZXZZID0gcG9pbnQueTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZG9jdW1lbnRhdGlvbiBzcGVjaWZpY2FsbHkgZGlzYWxsb3dzIG51bGxzIGluc2lkZSB0aGUgcG9pbnQgYXJyYXlzLFxuICAgIC8vIGJ1dCBpbiBjYXNlIGl0IGhhcHBlbnMgd2Ugc2hvdWxkIGRvIHNvbWV0aGluZyBzZW5zaWJsZS5cbiAgICBpZiAoaXNOYU4obmV3WXNbMF0pKSBuZXdZc1swXSA9IHBvaW50Lnk7XG4gICAgaWYgKGlzTmFOKG5ld1lzWzFdKSkgbmV3WXNbMV0gPSBwb2ludC55O1xuXG4gICAgbmV3WXNbMF0gPSBlLnBsb3RBcmVhLmggKiBuZXdZc1swXSArIGUucGxvdEFyZWEueTtcbiAgICBuZXdZc1sxXSA9IGUucGxvdEFyZWEuaCAqIG5ld1lzWzFdICsgZS5wbG90QXJlYS55O1xuICAgIGlmICghaXNOYU4ocHJldlgpKSB7XG4gICAgICBpZiAoc3RlcFBsb3QpIHtcbiAgICAgICAgY3R4Lm1vdmVUbyhwcmV2WCwgcHJldllzWzBdKTtcbiAgICAgICAgY3R4LmxpbmVUbyhwb2ludC5jYW52YXN4LCBwcmV2WXNbMF0pO1xuICAgICAgICBjdHgubGluZVRvKHBvaW50LmNhbnZhc3gsIHByZXZZc1sxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdHgubW92ZVRvKHByZXZYLCBwcmV2WXNbMF0pO1xuICAgICAgICBjdHgubGluZVRvKHBvaW50LmNhbnZhc3gsIG5ld1lzWzBdKTtcbiAgICAgICAgY3R4LmxpbmVUbyhwb2ludC5jYW52YXN4LCBuZXdZc1sxXSk7XG4gICAgICB9XG4gICAgICBjdHgubGluZVRvKHByZXZYLCBwcmV2WXNbMV0pO1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIH1cbiAgICBwcmV2WXMgPSBuZXdZcztcbiAgICBwcmV2WCA9IHBvaW50LmNhbnZhc3g7XG4gIH1cbiAgY3R4LmZpbGwoKTtcbn07XG5cbi8qKlxuICogUHJveHkgZm9yIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB3aGljaCBkcm9wcyBtb3ZlVG8vbGluZVRvIGNhbGxzIHdoaWNoIGFyZVxuICogc3VwZXJmbHVvdXMuIEl0IGFjY3VtdWxhdGVzIGFsbCBtb3ZlbWVudHMgd2hpY2ggaGF2ZW4ndCBjaGFuZ2VkIHRoZSB4LXZhbHVlXG4gKiBhbmQgb25seSBhcHBsaWVzIHRoZSB0d28gd2l0aCB0aGUgbW9zdCBleHRyZW1lIHktdmFsdWVzLlxuICpcbiAqIENhbGxzIHRvIGxpbmVUby9tb3ZlVG8gbXVzdCBoYXZlIG5vbi1kZWNyZWFzaW5nIHgtdmFsdWVzLlxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2Zhc3RDYW52YXNQcm94eSA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgdmFyIHBlbmRpbmdBY3Rpb25zID0gW107ICAvLyBhcnJheSBvZiBbdHlwZSwgeCwgeV0gdHVwbGVzXG4gIHZhciBsYXN0Um91bmRlZFggPSBudWxsO1xuICB2YXIgbGFzdEZsdXNoZWRYID0gbnVsbDtcblxuICB2YXIgTElORV9UTyA9IDEsXG4gICAgICBNT1ZFX1RPID0gMjtcblxuICB2YXIgYWN0aW9uQ291bnQgPSAwOyAgLy8gbnVtYmVyIG9mIG1vdmVUb3MgYW5kIGxpbmVUb3MgcGFzc2VkIHRvIGNvbnRleHQuXG5cbiAgLy8gRHJvcCBzdXBlcmZsdW91cyBtb3Rpb25zXG4gIC8vIEFzc3VtZXMgYWxsIHBlbmRpbmdBY3Rpb25zIGhhdmUgdGhlIHNhbWUgKHJvdW5kZWQpIHgtdmFsdWUuXG4gIHZhciBjb21wcmVzc0FjdGlvbnMgPSBmdW5jdGlvbihvcHRfbG9zc2xlc3NPbmx5KSB7XG4gICAgaWYgKHBlbmRpbmdBY3Rpb25zLmxlbmd0aCA8PSAxKSByZXR1cm47XG5cbiAgICAvLyBMb3NzbGVzcyBjb21wcmVzc2lvbjogZHJvcCBpbmNvbnNlcXVlbnRpYWwgbW92ZVRvcy5cbiAgICBmb3IgKHZhciBpID0gcGVuZGluZ0FjdGlvbnMubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgICAgdmFyIGFjdGlvbiA9IHBlbmRpbmdBY3Rpb25zW2ldO1xuICAgICAgaWYgKGFjdGlvblswXSA9PSBNT1ZFX1RPKSB7XG4gICAgICAgIHZhciBwcmV2QWN0aW9uID0gcGVuZGluZ0FjdGlvbnNbaSAtIDFdO1xuICAgICAgICBpZiAocHJldkFjdGlvblsxXSA9PSBhY3Rpb25bMV0gJiYgcHJldkFjdGlvblsyXSA9PSBhY3Rpb25bMl0pIHtcbiAgICAgICAgICBwZW5kaW5nQWN0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb3NzbGVzcyBjb21wcmVzc2lvbjogLi4uIGRyb3AgY29uc2VjdXRpdmUgbW92ZVRvcyAuLi5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlbmRpbmdBY3Rpb25zLmxlbmd0aCAtIDE7IC8qIGluY3JlbWVudGVkIGludGVybmFsbHkgKi8pIHtcbiAgICAgIHZhciBhY3Rpb24gPSBwZW5kaW5nQWN0aW9uc1tpXTtcbiAgICAgIGlmIChhY3Rpb25bMF0gPT0gTU9WRV9UTyAmJiBwZW5kaW5nQWN0aW9uc1tpICsgMV1bMF0gPT0gTU9WRV9UTykge1xuICAgICAgICBwZW5kaW5nQWN0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTG9zc3kgY29tcHJlc3Npb246IC4uLiBkcm9wIGFsbCBidXQgdGhlIGV4dHJlbWUgeS12YWx1ZXMgLi4uXG4gICAgaWYgKHBlbmRpbmdBY3Rpb25zLmxlbmd0aCA+IDIgJiYgIW9wdF9sb3NzbGVzc09ubHkpIHtcbiAgICAgIC8vIGtlZXAgYW4gaW5pdGlhbCBtb3ZlVG8sIGJ1dCBkcm9wIGFsbCBvdGhlcnMuXG4gICAgICB2YXIgc3RhcnRJZHggPSAwO1xuICAgICAgaWYgKHBlbmRpbmdBY3Rpb25zWzBdWzBdID09IE1PVkVfVE8pIHN0YXJ0SWR4Kys7XG4gICAgICB2YXIgbWluSWR4ID0gbnVsbCwgbWF4SWR4ID0gbnVsbDtcbiAgICAgIGZvciAodmFyIGkgPSBzdGFydElkeDsgaSA8IHBlbmRpbmdBY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwZW5kaW5nQWN0aW9uc1tpXTtcbiAgICAgICAgaWYgKGFjdGlvblswXSAhPSBMSU5FX1RPKSBjb250aW51ZTtcbiAgICAgICAgaWYgKG1pbklkeCA9PT0gbnVsbCAmJiBtYXhJZHggPT09IG51bGwpIHtcbiAgICAgICAgICBtaW5JZHggPSBpO1xuICAgICAgICAgIG1heElkeCA9IGk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHkgPSBhY3Rpb25bMl07XG4gICAgICAgICAgaWYgKHkgPCBwZW5kaW5nQWN0aW9uc1ttaW5JZHhdWzJdKSB7XG4gICAgICAgICAgICBtaW5JZHggPSBpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoeSA+IHBlbmRpbmdBY3Rpb25zW21heElkeF1bMl0pIHtcbiAgICAgICAgICAgIG1heElkeCA9IGk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgbWluQWN0aW9uID0gcGVuZGluZ0FjdGlvbnNbbWluSWR4XSxcbiAgICAgICAgICBtYXhBY3Rpb24gPSBwZW5kaW5nQWN0aW9uc1ttYXhJZHhdO1xuICAgICAgcGVuZGluZ0FjdGlvbnMuc3BsaWNlKHN0YXJ0SWR4LCBwZW5kaW5nQWN0aW9ucy5sZW5ndGggLSBzdGFydElkeCk7XG4gICAgICBpZiAobWluSWR4IDwgbWF4SWR4KSB7XG4gICAgICAgIHBlbmRpbmdBY3Rpb25zLnB1c2gobWluQWN0aW9uKTtcbiAgICAgICAgcGVuZGluZ0FjdGlvbnMucHVzaChtYXhBY3Rpb24pO1xuICAgICAgfSBlbHNlIGlmIChtaW5JZHggPiBtYXhJZHgpIHtcbiAgICAgICAgcGVuZGluZ0FjdGlvbnMucHVzaChtYXhBY3Rpb24pO1xuICAgICAgICBwZW5kaW5nQWN0aW9ucy5wdXNoKG1pbkFjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZW5kaW5nQWN0aW9ucy5wdXNoKG1pbkFjdGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBmbHVzaEFjdGlvbnMgPSBmdW5jdGlvbihvcHRfbm9Mb3NzeUNvbXByZXNzaW9uKSB7XG4gICAgY29tcHJlc3NBY3Rpb25zKG9wdF9ub0xvc3N5Q29tcHJlc3Npb24pO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwZW5kaW5nQWN0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFyIGFjdGlvbiA9IHBlbmRpbmdBY3Rpb25zW2ldO1xuICAgICAgaWYgKGFjdGlvblswXSA9PSBMSU5FX1RPKSB7XG4gICAgICAgIGNvbnRleHQubGluZVRvKGFjdGlvblsxXSwgYWN0aW9uWzJdKTtcbiAgICAgIH0gZWxzZSBpZiAoYWN0aW9uWzBdID09IE1PVkVfVE8pIHtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oYWN0aW9uWzFdLCBhY3Rpb25bMl0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGVuZGluZ0FjdGlvbnMubGVuZ3RoKSB7XG4gICAgICBsYXN0Rmx1c2hlZFggPSBwZW5kaW5nQWN0aW9uc1twZW5kaW5nQWN0aW9ucy5sZW5ndGggLSAxXVsxXTtcbiAgICB9XG4gICAgYWN0aW9uQ291bnQgKz0gcGVuZGluZ0FjdGlvbnMubGVuZ3RoO1xuICAgIHBlbmRpbmdBY3Rpb25zID0gW107XG4gIH07XG5cbiAgdmFyIGFkZEFjdGlvbiA9IGZ1bmN0aW9uKGFjdGlvbiwgeCwgeSkge1xuICAgIHZhciByeCA9IE1hdGgucm91bmQoeCk7XG4gICAgaWYgKGxhc3RSb3VuZGVkWCA9PT0gbnVsbCB8fCByeCAhPSBsYXN0Um91bmRlZFgpIHtcbiAgICAgIC8vIGlmIHRoZXJlIGFyZSBsYXJnZSBnYXBzIG9uIHRoZSB4LWF4aXMsIGl0J3MgZXNzZW50aWFsIHRvIGtlZXAgdGhlXG4gICAgICAvLyBmaXJzdCBhbmQgbGFzdCBwb2ludCBhcyB3ZWxsLlxuICAgICAgdmFyIGhhc0dhcE9uTGVmdCA9IChsYXN0Um91bmRlZFggLSBsYXN0Rmx1c2hlZFggPiAxKSxcbiAgICAgICAgICBoYXNHYXBPblJpZ2h0ID0gKHJ4IC0gbGFzdFJvdW5kZWRYID4gMSksXG4gICAgICAgICAgaGFzR2FwID0gaGFzR2FwT25MZWZ0IHx8IGhhc0dhcE9uUmlnaHQ7XG4gICAgICBmbHVzaEFjdGlvbnMoaGFzR2FwKTtcbiAgICAgIGxhc3RSb3VuZGVkWCA9IHJ4O1xuICAgIH1cbiAgICBwZW5kaW5nQWN0aW9ucy5wdXNoKFthY3Rpb24sIHgsIHldKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG1vdmVUbzogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgYWRkQWN0aW9uKE1PVkVfVE8sIHgsIHkpO1xuICAgIH0sXG4gICAgbGluZVRvOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICBhZGRBY3Rpb24oTElORV9UTywgeCwgeSk7XG4gICAgfSxcblxuICAgIC8vIGZvciBtYWpvciBvcGVyYXRpb25zIGxpa2Ugc3Ryb2tlL2ZpbGwsIHdlIHNraXAgY29tcHJlc3Npb24gdG8gZW5zdXJlXG4gICAgLy8gdGhhdCB0aGVyZSBhcmUgbm8gYXJ0aWZhY3RzIGF0IHRoZSByaWdodCBlZGdlLlxuICAgIHN0cm9rZTogICAgZnVuY3Rpb24oKSB7IGZsdXNoQWN0aW9ucyh0cnVlKTsgY29udGV4dC5zdHJva2UoKTsgfSxcbiAgICBmaWxsOiAgICAgIGZ1bmN0aW9uKCkgeyBmbHVzaEFjdGlvbnModHJ1ZSk7IGNvbnRleHQuZmlsbCgpOyB9LFxuICAgIGJlZ2luUGF0aDogZnVuY3Rpb24oKSB7IGZsdXNoQWN0aW9ucyh0cnVlKTsgY29udGV4dC5iZWdpblBhdGgoKTsgfSxcbiAgICBjbG9zZVBhdGg6IGZ1bmN0aW9uKCkgeyBmbHVzaEFjdGlvbnModHJ1ZSk7IGNvbnRleHQuY2xvc2VQYXRoKCk7IH0sXG5cbiAgICBfY291bnQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gYWN0aW9uQ291bnQ7IH1cbiAgfTtcbn07XG5cbi8qKlxuICogRHJhd3MgdGhlIHNoYWRlZCByZWdpb25zIHdoZW4gXCJmaWxsR3JhcGhcIiBpcyBzZXQuXG4gKiBOb3QgdG8gYmUgY29uZnVzZWQgd2l0aCBoaWdoL2xvdyBiYW5kcyAoaGlzdG9yaWNhbGx5IG1pc25hbWVkIGVycm9yQmFycykuXG4gKlxuICogRm9yIHN0YWNrZWQgY2hhcnRzLCBpdCdzIG1vcmUgY29udmVuaWVudCB0byBoYW5kbGUgYWxsIHRoZSBzZXJpZXNcbiAqIHNpbXVsdGFuZW91c2x5LiBTbyB0aGlzIHBsb3R0ZXIgcGxvdHMgYWxsIHRoZSBwb2ludHMgb24gdGhlIGZpcnN0IHNlcmllc1xuICogaXQncyBhc2tlZCB0byBkcmF3LCB0aGVuIGlnbm9yZXMgYWxsIHRoZSBvdGhlciBzZXJpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaENhbnZhc1JlbmRlcmVyLl9maWxsUGxvdHRlciA9IGZ1bmN0aW9uKGUpIHtcbiAgLy8gU2tpcCBpZiB3ZSdyZSBkcmF3aW5nIGEgc2luZ2xlIHNlcmllcyBmb3IgaW50ZXJhY3RpdmUgaGlnaGxpZ2h0IG92ZXJsYXkuXG4gIGlmIChlLnNpbmdsZVNlcmllc05hbWUpIHJldHVybjtcblxuICAvLyBXZSdsbCBoYW5kbGUgYWxsIHRoZSBzZXJpZXMgYXQgb25jZSwgbm90IG9uZS1ieS1vbmUuXG4gIGlmIChlLnNlcmllc0luZGV4ICE9PSAwKSByZXR1cm47XG5cbiAgdmFyIGcgPSBlLmR5Z3JhcGg7XG4gIHZhciBzZXROYW1lcyA9IGcuZ2V0TGFiZWxzKCkuc2xpY2UoMSk7ICAvLyByZW1vdmUgeC1heGlzXG5cbiAgLy8gZ2V0TGFiZWxzKCkgaW5jbHVkZXMgbmFtZXMgZm9yIGludmlzaWJsZSBzZXJpZXMsIHdoaWNoIGFyZSBub3QgaW5jbHVkZWQgaW5cbiAgLy8gYWxsU2VyaWVzUG9pbnRzLiBXZSByZW1vdmUgdGhvc2UgdG8gbWFrZSB0aGUgdHdvIG1hdGNoLlxuICAvLyBUT0RPKGRhbnZrKTogcHJvdmlkZSBhIHNpbXBsZXIgd2F5IHRvIGdldCB0aGlzIGluZm9ybWF0aW9uLlxuICBmb3IgKHZhciBpID0gc2V0TmFtZXMubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGlmICghZy52aXNpYmlsaXR5KClbaV0pIHNldE5hbWVzLnNwbGljZShpLCAxKTtcbiAgfVxuXG4gIHZhciBhbnlTZXJpZXNGaWxsZWQgPSAoZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGcuZ2V0Qm9vbGVhbk9wdGlvbihcImZpbGxHcmFwaFwiLCBzZXROYW1lc1tpXSkpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pKCk7XG5cbiAgaWYgKCFhbnlTZXJpZXNGaWxsZWQpIHJldHVybjtcblxuICB2YXIgYXJlYSA9IGUucGxvdEFyZWE7XG4gIHZhciBzZXRzID0gZS5hbGxTZXJpZXNQb2ludHM7XG4gIHZhciBzZXRDb3VudCA9IHNldHMubGVuZ3RoO1xuXG4gIHZhciBzdGFja2VkR3JhcGggPSBnLmdldEJvb2xlYW5PcHRpb24oXCJzdGFja2VkR3JhcGhcIik7XG4gIHZhciBjb2xvcnMgPSBnLmdldENvbG9ycygpO1xuXG4gIC8vIEZvciBzdGFja2VkIGdyYXBocywgdHJhY2sgdGhlIGJhc2VsaW5lIGZvciBmaWxsaW5nLlxuICAvL1xuICAvLyBUaGUgZmlsbGVkIGFyZWFzIGJlbG93IGdyYXBoIGxpbmVzIGFyZSB0cmFwZXpvaWRzIHdpdGggdHdvXG4gIC8vIHZlcnRpY2FsIGVkZ2VzLiBUaGUgdG9wIGVkZ2UgaXMgdGhlIGxpbmUgc2VnbWVudCBiZWluZyBkcmF3biwgYW5kXG4gIC8vIHRoZSBiYXNlbGluZSBpcyB0aGUgYm90dG9tIGVkZ2UuIEVhY2ggYmFzZWxpbmUgY29ycmVzcG9uZHMgdG8gdGhlXG4gIC8vIHRvcCBsaW5lIHNlZ21lbnQgZnJvbSB0aGUgcHJldmlvdXMgc3RhY2tlZCBsaW5lLiBJbiB0aGUgY2FzZSBvZlxuICAvLyBzdGVwIHBsb3RzLCB0aGUgdHJhcGV6b2lkcyBhcmUgcmVjdGFuZ2xlcy5cbiAgdmFyIGJhc2VsaW5lID0ge307XG4gIHZhciBjdXJyQmFzZWxpbmU7XG4gIHZhciBwcmV2U3RlcFBsb3Q7ICAvLyBmb3IgZGlmZmVyZW50IGxpbmUgZHJhd2luZyBtb2RlcyAobGluZS9zdGVwKSBwZXIgc2VyaWVzXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIHRyYWNlIGEgbGluZSBiYWNrIGFsb25nIHRoZSBiYXNlbGluZS5cbiAgdmFyIHRyYWNlQmFja1BhdGggPSBmdW5jdGlvbihjdHgsIGJhc2VsaW5lWCwgYmFzZWxpbmVZLCBwYXRoQmFjaykge1xuICAgIGN0eC5saW5lVG8oYmFzZWxpbmVYLCBiYXNlbGluZVkpO1xuICAgIGlmIChzdGFja2VkR3JhcGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSBwYXRoQmFjay5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgcHQgPSBwYXRoQmFja1tpXTtcbiAgICAgICAgY3R4LmxpbmVUbyhwdFswXSwgcHRbMV0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBwcm9jZXNzIHNldHMgaW4gcmV2ZXJzZSBvcmRlciAobmVlZGVkIGZvciBzdGFja2VkIGdyYXBocylcbiAgZm9yICh2YXIgc2V0SWR4ID0gc2V0Q291bnQgLSAxOyBzZXRJZHggPj0gMDsgc2V0SWR4LS0pIHtcbiAgICB2YXIgY3R4ID0gZS5kcmF3aW5nQ29udGV4dDtcbiAgICB2YXIgc2V0TmFtZSA9IHNldE5hbWVzW3NldElkeF07XG4gICAgaWYgKCFnLmdldEJvb2xlYW5PcHRpb24oJ2ZpbGxHcmFwaCcsIHNldE5hbWUpKSBjb250aW51ZTtcblxuICAgIHZhciBmaWxsQWxwaGEgPSBnLmdldE51bWVyaWNPcHRpb24oJ2ZpbGxBbHBoYScsIHNldE5hbWUpO1xuICAgIHZhciBzdGVwUGxvdCA9IGcuZ2V0Qm9vbGVhbk9wdGlvbignc3RlcFBsb3QnLCBzZXROYW1lKTtcbiAgICB2YXIgY29sb3IgPSBjb2xvcnNbc2V0SWR4XTtcbiAgICB2YXIgYXhpcyA9IGcuYXhpc1Byb3BlcnRpZXNGb3JTZXJpZXMoc2V0TmFtZSk7XG4gICAgdmFyIGF4aXNZID0gMS4wICsgYXhpcy5taW55dmFsICogYXhpcy55c2NhbGU7XG4gICAgaWYgKGF4aXNZIDwgMC4wKSBheGlzWSA9IDAuMDtcbiAgICBlbHNlIGlmIChheGlzWSA+IDEuMCkgYXhpc1kgPSAxLjA7XG4gICAgYXhpc1kgPSBhcmVhLmggKiBheGlzWSArIGFyZWEueTtcblxuICAgIHZhciBwb2ludHMgPSBzZXRzW3NldElkeF07XG4gICAgdmFyIGl0ZXIgPSB1dGlscy5jcmVhdGVJdGVyYXRvcihwb2ludHMsIDAsIHBvaW50cy5sZW5ndGgsXG4gICAgICAgIER5Z3JhcGhDYW52YXNSZW5kZXJlci5fZ2V0SXRlcmF0b3JQcmVkaWNhdGUoXG4gICAgICAgICAgICBnLmdldEJvb2xlYW5PcHRpb24oXCJjb25uZWN0U2VwYXJhdGVkUG9pbnRzXCIsIHNldE5hbWUpKSk7XG5cbiAgICAvLyBzZXR1cCBncmFwaGljcyBjb250ZXh0XG4gICAgdmFyIHByZXZYID0gTmFOO1xuICAgIHZhciBwcmV2WXMgPSBbLTEsIC0xXTtcbiAgICB2YXIgbmV3WXM7XG4gICAgLy8gc2hvdWxkIGJlIHNhbWUgY29sb3IgYXMgdGhlIGxpbmVzIGJ1dCBvbmx5IDE1JSBvcGFxdWUuXG4gICAgdmFyIHJnYiA9IHV0aWxzLnRvUkdCXyhjb2xvcik7XG4gICAgdmFyIGVycl9jb2xvciA9XG4gICAgICAgICdyZ2JhKCcgKyByZ2IuciArICcsJyArIHJnYi5nICsgJywnICsgcmdiLmIgKyAnLCcgKyBmaWxsQWxwaGEgKyAnKSc7XG4gICAgY3R4LmZpbGxTdHlsZSA9IGVycl9jb2xvcjtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIGxhc3RfeCwgaXNfZmlyc3QgPSB0cnVlO1xuXG4gICAgLy8gSWYgdGhlIHBvaW50IGRlbnNpdHkgaXMgaGlnaCBlbm91Z2gsIGRyb3BwaW5nIHNlZ21lbnRzIG9uIHRoZWlyIHdheSB0b1xuICAgIC8vIHRoZSBjYW52YXMganVzdGlmaWVzIHRoZSBvdmVyaGVhZCBvZiBkb2luZyBzby5cbiAgICBpZiAocG9pbnRzLmxlbmd0aCA+IDIgKiBnLndpZHRoXyB8fCBEeWdyYXBoLkZPUkNFX0ZBU1RfUFJPWFkpIHtcbiAgICAgIGN0eCA9IER5Z3JhcGhDYW52YXNSZW5kZXJlci5fZmFzdENhbnZhc1Byb3h5KGN0eCk7XG4gICAgfVxuXG4gICAgLy8gRm9yIGZpbGxlZCBjaGFydHMsIHdlIGRyYXcgcG9pbnRzIGZyb20gbGVmdCB0byByaWdodCwgdGhlbiBiYWNrIGFsb25nXG4gICAgLy8gdGhlIHgtYXhpcyB0byBjb21wbGV0ZSBhIHNoYXBlIGZvciBmaWxsaW5nLlxuICAgIC8vIEZvciBzdGFja2VkIHBsb3RzLCB0aGlzIFwiYmFjayBwYXRoXCIgaXMgYSBtb3JlIGNvbXBsZXggc2hhcGUuIFRoaXMgYXJyYXlcbiAgICAvLyBzdG9yZXMgdGhlIFt4LCB5XSB2YWx1ZXMgbmVlZGVkIHRvIHRyYWNlIHRoYXQgc2hhcGUuXG4gICAgdmFyIHBhdGhCYWNrID0gW107XG5cbiAgICAvLyBUT0RPKGRhbnZrKTogdGhlcmUgYXJlIGEgbG90IG9mIG9wdGlvbnMgYXQgcGxheSBpbiB0aGlzIGxvb3AuXG4gICAgLy8gICAgIFRoZSBsb2dpYyB3b3VsZCBiZSBtdWNoIGNsZWFyZXIgaWYgc29tZSAoZS5nLiBzdGFja0dyYXBoIGFuZFxuICAgIC8vICAgICBzdGVwUGxvdCkgd2VyZSBzcGxpdCBvZmYgaW50byBzZXBhcmF0ZSBzdWItcGxvdHRlcnMuXG4gICAgdmFyIHBvaW50O1xuICAgIHdoaWxlIChpdGVyLmhhc05leHQpIHtcbiAgICAgIHBvaW50ID0gaXRlci5uZXh0KCk7XG4gICAgICBpZiAoIXV0aWxzLmlzT0socG9pbnQueSkgJiYgIXN0ZXBQbG90KSB7XG4gICAgICAgIHRyYWNlQmFja1BhdGgoY3R4LCBwcmV2WCwgcHJldllzWzFdLCBwYXRoQmFjayk7XG4gICAgICAgIHBhdGhCYWNrID0gW107XG4gICAgICAgIHByZXZYID0gTmFOO1xuICAgICAgICBpZiAocG9pbnQueV9zdGFja2VkICE9PSBudWxsICYmICFpc05hTihwb2ludC55X3N0YWNrZWQpKSB7XG4gICAgICAgICAgYmFzZWxpbmVbcG9pbnQuY2FudmFzeF0gPSBhcmVhLmggKiBwb2ludC55X3N0YWNrZWQgKyBhcmVhLnk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoc3RhY2tlZEdyYXBoKSB7XG4gICAgICAgIGlmICghaXNfZmlyc3QgJiYgbGFzdF94ID09IHBvaW50Lnh2YWwpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpc19maXJzdCA9IGZhbHNlO1xuICAgICAgICAgIGxhc3RfeCA9IHBvaW50Lnh2YWw7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyQmFzZWxpbmUgPSBiYXNlbGluZVtwb2ludC5jYW52YXN4XTtcbiAgICAgICAgdmFyIGxhc3RZO1xuICAgICAgICBpZiAoY3VyckJhc2VsaW5lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBsYXN0WSA9IGF4aXNZO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKHByZXZTdGVwUGxvdCkge1xuICAgICAgICAgICAgbGFzdFkgPSBjdXJyQmFzZWxpbmVbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhc3RZID0gY3VyckJhc2VsaW5lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBuZXdZcyA9IFsgcG9pbnQuY2FudmFzeSwgbGFzdFkgXTtcblxuICAgICAgICBpZiAoc3RlcFBsb3QpIHtcbiAgICAgICAgICAvLyBTdGVwIHBsb3RzIG11c3Qga2VlcCB0cmFjayBvZiB0aGUgdG9wIGFuZCBib3R0b20gb2ZcbiAgICAgICAgICAvLyB0aGUgYmFzZWxpbmUgYXQgZWFjaCBwb2ludC5cbiAgICAgICAgICBpZiAocHJldllzWzBdID09PSAtMSkge1xuICAgICAgICAgICAgYmFzZWxpbmVbcG9pbnQuY2FudmFzeF0gPSBbIHBvaW50LmNhbnZhc3ksIGF4aXNZIF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VsaW5lW3BvaW50LmNhbnZhc3hdID0gWyBwb2ludC5jYW52YXN5LCBwcmV2WXNbMF0gXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmFzZWxpbmVbcG9pbnQuY2FudmFzeF0gPSBwb2ludC5jYW52YXN5O1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc05hTihwb2ludC5jYW52YXN5KSAmJiBzdGVwUGxvdCkge1xuICAgICAgICAgIG5ld1lzID0gWyBhcmVhLnkgKyBhcmVhLmgsIGF4aXNZIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3WXMgPSBbIHBvaW50LmNhbnZhc3ksIGF4aXNZIF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNOYU4ocHJldlgpKSB7XG4gICAgICAgIC8vIE1vdmUgdG8gdG9wIGZpbGwgcG9pbnRcbiAgICAgICAgaWYgKHN0ZXBQbG90KSB7XG4gICAgICAgICAgY3R4LmxpbmVUbyhwb2ludC5jYW52YXN4LCBwcmV2WXNbMF0pO1xuICAgICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgbmV3WXNbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgbmV3WXNbMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVjb3JkIHRoZSBiYXNlbGluZSBmb3IgdGhlIHJldmVyc2UgcGF0aC5cbiAgICAgICAgaWYgKHN0YWNrZWRHcmFwaCkge1xuICAgICAgICAgIHBhdGhCYWNrLnB1c2goW3ByZXZYLCBwcmV2WXNbMV1dKTtcbiAgICAgICAgICBpZiAocHJldlN0ZXBQbG90ICYmIGN1cnJCYXNlbGluZSkge1xuICAgICAgICAgICAgLy8gRHJhdyB0byB0aGUgYm90dG9tIG9mIHRoZSBiYXNlbGluZVxuICAgICAgICAgICAgcGF0aEJhY2sucHVzaChbcG9pbnQuY2FudmFzeCwgY3VyckJhc2VsaW5lWzFdXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGhCYWNrLnB1c2goW3BvaW50LmNhbnZhc3gsIG5ld1lzWzFdXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdHgubW92ZVRvKHBvaW50LmNhbnZhc3gsIG5ld1lzWzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyhwb2ludC5jYW52YXN4LCBuZXdZc1swXSk7XG4gICAgICB9XG4gICAgICBwcmV2WXMgPSBuZXdZcztcbiAgICAgIHByZXZYID0gcG9pbnQuY2FudmFzeDtcbiAgICB9XG4gICAgcHJldlN0ZXBQbG90ID0gc3RlcFBsb3Q7XG4gICAgaWYgKG5ld1lzICYmIHBvaW50KSB7XG4gICAgICB0cmFjZUJhY2tQYXRoKGN0eCwgcG9pbnQuY2FudmFzeCwgbmV3WXNbMV0sIHBhdGhCYWNrKTtcbiAgICAgIHBhdGhCYWNrID0gW107XG4gICAgfVxuICAgIGN0eC5maWxsKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IER5Z3JhcGhDYW52YXNSZW5kZXJlcjtcbiJdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWTs7QUFFWjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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