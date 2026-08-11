'use strict';

/**
 * @license
 * Copyright 2011 Robert Konigsberg (konigsberg@google.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */

/**
 * @fileoverview The default interaction model for Dygraphs. This is kept out
 * of dygraph.js for better navigability.
 * @author Robert Konigsberg (konigsberg@google.com)
 */

/*global Dygraph:false */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/**
 * You can drag this many pixels past the edge of the chart and still have it
 * be considered a zoom. This makes it easier to zoom to the exact edge of the
 * chart, a fairly common operation.
 */
var DRAG_EDGE_MARGIN = 100;

/**
 * A collection of functions to facilitate build custom interaction models.
 * @class
 */
var DygraphInteraction = {};

/**
 * Checks whether the beginning & ending of an event were close enough that it
 * should be considered a click. If it should, dispatch appropriate events.
 * Returns true if the event was treated as a click.
 *
 * @param {Event} event
 * @param {Dygraph} g
 * @param {Object} context
 */
DygraphInteraction.maybeTreatMouseOpAsClick = function (event, g, context) {
  context.dragEndX = utils.dragGetX_(event, context);
  context.dragEndY = utils.dragGetY_(event, context);
  var regionWidth = Math.abs(context.dragEndX - context.dragStartX);
  var regionHeight = Math.abs(context.dragEndY - context.dragStartY);
  if (regionWidth < 2 && regionHeight < 2 && g.lastx_ !== undefined && g.lastx_ !== null) {
    DygraphInteraction.treatMouseOpAsClick(g, event, context);
  }
  context.regionWidth = regionWidth;
  context.regionHeight = regionHeight;
};

/**
 * Called in response to an interaction model operation that
 * should start the default panning behavior.
 *
 * It's used in the default callback for "mousedown" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the startPan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.startPan = function (event, g, context) {
  var i, axis;
  context.isPanning = true;
  var xRange = g.xAxisRange();
  if (g.getOptionForAxis("logscale", "x")) {
    context.initialLeftmostDate = utils.log10(xRange[0]);
    context.dateRange = utils.log10(xRange[1]) - utils.log10(xRange[0]);
  } else {
    context.initialLeftmostDate = xRange[0];
    context.dateRange = xRange[1] - xRange[0];
  }
  context.xUnitsPerPixel = context.dateRange / (g.plotter_.area.w - 1);
  if (g.getNumericOption("panEdgeFraction")) {
    var maxXPixelsToDraw = g.width_ * g.getNumericOption("panEdgeFraction");
    var xExtremes = g.xAxisExtremes(); // I REALLY WANT TO CALL THIS xTremes!

    var boundedLeftX = g.toDomXCoord(xExtremes[0]) - maxXPixelsToDraw;
    var boundedRightX = g.toDomXCoord(xExtremes[1]) + maxXPixelsToDraw;
    var boundedLeftDate = g.toDataXCoord(boundedLeftX);
    var boundedRightDate = g.toDataXCoord(boundedRightX);
    context.boundedDates = [boundedLeftDate, boundedRightDate];
    var boundedValues = [];
    var maxYPixelsToDraw = g.height_ * g.getNumericOption("panEdgeFraction");
    for (i = 0; i < g.axes_.length; i++) {
      axis = g.axes_[i];
      var yExtremes = axis.extremeRange;
      var boundedTopY = g.toDomYCoord(yExtremes[0], i) + maxYPixelsToDraw;
      var boundedBottomY = g.toDomYCoord(yExtremes[1], i) - maxYPixelsToDraw;
      var boundedTopValue = g.toDataYCoord(boundedTopY, i);
      var boundedBottomValue = g.toDataYCoord(boundedBottomY, i);
      boundedValues[i] = [boundedTopValue, boundedBottomValue];
    }
    context.boundedValues = boundedValues;
  } else {
    // undo effect if it was once set
    context.boundedDates = null;
    context.boundedValues = null;
  }

  // Record the range of each y-axis at the start of the drag.
  // If any axis has a valueRange, then we want a 2D pan.
  // We can't store data directly in g.axes_, because it does not belong to us
  // and could change out from under us during a pan (say if there's a data
  // update).
  context.is2DPan = false;
  context.axes = [];
  for (i = 0; i < g.axes_.length; i++) {
    axis = g.axes_[i];
    var axis_data = {};
    var yRange = g.yAxisRange(i);
    // TODO(konigsberg): These values should be in |context|.
    // In log scale, initialTopValue, dragValueRange and unitsPerPixel are log scale.
    var logscale = g.attributes_.getForAxis("logscale", i);
    if (logscale) {
      axis_data.initialTopValue = utils.log10(yRange[1]);
      axis_data.dragValueRange = utils.log10(yRange[1]) - utils.log10(yRange[0]);
    } else {
      axis_data.initialTopValue = yRange[1];
      axis_data.dragValueRange = yRange[1] - yRange[0];
    }
    axis_data.unitsPerPixel = axis_data.dragValueRange / (g.plotter_.area.h - 1);
    context.axes.push(axis_data);

    // While calculating axes, set 2dpan.
    if (axis.valueRange) context.is2DPan = true;
  }
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that pans the view.
 *
 * It's used in the default callback for "mousemove" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the movePan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.movePan = function (event, g, context) {
  context.dragEndX = utils.dragGetX_(event, context);
  context.dragEndY = utils.dragGetY_(event, context);
  var minDate = context.initialLeftmostDate - (context.dragEndX - context.dragStartX) * context.xUnitsPerPixel;
  if (context.boundedDates) {
    minDate = Math.max(minDate, context.boundedDates[0]);
  }
  var maxDate = minDate + context.dateRange;
  if (context.boundedDates) {
    if (maxDate > context.boundedDates[1]) {
      // Adjust minDate, and recompute maxDate.
      minDate = minDate - (maxDate - context.boundedDates[1]);
      maxDate = minDate + context.dateRange;
    }
  }
  if (g.getOptionForAxis("logscale", "x")) {
    g.dateWindow_ = [Math.pow(utils.LOG_SCALE, minDate), Math.pow(utils.LOG_SCALE, maxDate)];
  } else {
    g.dateWindow_ = [minDate, maxDate];
  }

  // y-axis scaling is automatic unless this is a full 2D pan.
  if (context.is2DPan) {
    var pixelsDragged = context.dragEndY - context.dragStartY;

    // Adjust each axis appropriately.
    for (var i = 0; i < g.axes_.length; i++) {
      var axis = g.axes_[i];
      var axis_data = context.axes[i];
      var unitsDragged = pixelsDragged * axis_data.unitsPerPixel;
      var boundedValue = context.boundedValues ? context.boundedValues[i] : null;

      // In log scale, maxValue and minValue are the logs of those values.
      var maxValue = axis_data.initialTopValue + unitsDragged;
      if (boundedValue) {
        maxValue = Math.min(maxValue, boundedValue[1]);
      }
      var minValue = maxValue - axis_data.dragValueRange;
      if (boundedValue) {
        if (minValue < boundedValue[0]) {
          // Adjust maxValue, and recompute minValue.
          maxValue = maxValue - (minValue - boundedValue[0]);
          minValue = maxValue - axis_data.dragValueRange;
        }
      }
      if (g.attributes_.getForAxis("logscale", i)) {
        axis.valueRange = [Math.pow(utils.LOG_SCALE, minValue), Math.pow(utils.LOG_SCALE, maxValue)];
      } else {
        axis.valueRange = [minValue, maxValue];
      }
    }
  }
  g.drawGraph_(false);
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that ends panning.
 *
 * It's used in the default callback for "mouseup" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the endPan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.endPan = DygraphInteraction.maybeTreatMouseOpAsClick;

/**
 * Called in response to an interaction model operation that
 * responds to an event that starts zooming.
 *
 * It's used in the default callback for "mousedown" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the startZoom call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.startZoom = function (event, g, context) {
  context.isZooming = true;
  context.zoomMoved = false;
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that defines zoom boundaries.
 *
 * It's used in the default callback for "mousemove" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the moveZoom call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.moveZoom = function (event, g, context) {
  context.zoomMoved = true;
  context.dragEndX = utils.dragGetX_(event, context);
  context.dragEndY = utils.dragGetY_(event, context);
  var xDelta = Math.abs(context.dragStartX - context.dragEndX);
  var yDelta = Math.abs(context.dragStartY - context.dragEndY);

  // drag direction threshold for y axis is twice as large as x axis
  context.dragDirection = xDelta < yDelta / 2 ? utils.VERTICAL : utils.HORIZONTAL;
  g.drawZoomRect_(context.dragDirection, context.dragStartX, context.dragEndX, context.dragStartY, context.dragEndY, context.prevDragDirection, context.prevEndX, context.prevEndY);
  context.prevEndX = context.dragEndX;
  context.prevEndY = context.dragEndY;
  context.prevDragDirection = context.dragDirection;
};

/**
 * TODO(danvk): move this logic into dygraph.js
 * @param {Dygraph} g
 * @param {Event} event
 * @param {Object} context
 */
DygraphInteraction.treatMouseOpAsClick = function (g, event, context) {
  var clickCallback = g.getFunctionOption('clickCallback');
  var pointClickCallback = g.getFunctionOption('pointClickCallback');
  var selectedPoint = null;

  // Find out if the click occurs on a point.
  var closestIdx = -1;
  var closestDistance = Number.MAX_VALUE;

  // check if the click was on a particular point.
  for (var i = 0; i < g.selPoints_.length; i++) {
    var p = g.selPoints_[i];
    var distance = Math.pow(p.canvasx - context.dragEndX, 2) + Math.pow(p.canvasy - context.dragEndY, 2);
    if (!isNaN(distance) && (closestIdx == -1 || distance < closestDistance)) {
      closestDistance = distance;
      closestIdx = i;
    }
  }

  // Allow any click within two pixels of the dot.
  var radius = g.getNumericOption('highlightCircleSize') + 2;
  if (closestDistance <= radius * radius) {
    selectedPoint = g.selPoints_[closestIdx];
  }
  if (selectedPoint) {
    var e = {
      cancelable: true,
      point: selectedPoint,
      canvasx: context.dragEndX,
      canvasy: context.dragEndY
    };
    var defaultPrevented = g.cascadeEvents_('pointClick', e);
    if (defaultPrevented) {
      // Note: this also prevents click / clickCallback from firing.
      return;
    }
    if (pointClickCallback) {
      pointClickCallback.call(g, event, selectedPoint);
    }
  }
  var e = {
    cancelable: true,
    xval: g.lastx_,
    // closest point by x value
    pts: g.selPoints_,
    canvasx: context.dragEndX,
    canvasy: context.dragEndY
  };
  if (!g.cascadeEvents_('click', e)) {
    if (clickCallback) {
      // TODO(danvk): pass along more info about the points, e.g. 'x'
      clickCallback.call(g, event, g.lastx_, g.selPoints_);
    }
  }
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that performs a zoom based on previously defined
 * bounds..
 *
 * It's used in the default callback for "mouseup" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the endZoom call.
 * @param {Dygraph} g The dygraph on which to end the zoom.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.endZoom = function (event, g, context) {
  g.clearZoomRect_();
  context.isZooming = false;
  DygraphInteraction.maybeTreatMouseOpAsClick(event, g, context);

  // The zoom rectangle is visibly clipped to the plot area, so its behavior
  // should be as well.
  // See https://code.google.com/archive/p/dygraphs/issues/280
  var plotArea = g.getArea();
  if (context.regionWidth >= 10 && context.dragDirection == utils.HORIZONTAL) {
    var left = Math.min(context.dragStartX, context.dragEndX),
      right = Math.max(context.dragStartX, context.dragEndX);
    left = Math.max(left, plotArea.x);
    right = Math.min(right, plotArea.x + plotArea.w);
    if (left < right) {
      g.doZoomX_(left, right);
    }
    context.cancelNextDblclick = true;
  } else if (context.regionHeight >= 10 && context.dragDirection == utils.VERTICAL) {
    var top = Math.min(context.dragStartY, context.dragEndY),
      bottom = Math.max(context.dragStartY, context.dragEndY);
    top = Math.max(top, plotArea.y);
    bottom = Math.min(bottom, plotArea.y + plotArea.h);
    if (top < bottom) {
      g.doZoomY_(top, bottom);
    }
    context.cancelNextDblclick = true;
  }
  context.dragStartX = null;
  context.dragStartY = null;
};

/**
 * @private
 */
DygraphInteraction.startTouch = function (event, g, context) {
  event.preventDefault(); // touch browsers are all nice.
  if (event.touches.length > 1) {
    // If the user ever puts two fingers down, it's not a double tap.
    context.startTimeForDoubleTapMs = null;
  }
  var touches = [];
  for (var i = 0; i < event.touches.length; i++) {
    var t = event.touches[i];
    var rect = t.target.getBoundingClientRect();
    // we dispense with 'dragGetX_' because all touchBrowsers support pageX
    touches.push({
      pageX: t.pageX,
      pageY: t.pageY,
      dataX: g.toDataXCoord(t.clientX - rect.left),
      dataY: g.toDataYCoord(t.clientY - rect.top)
      // identifier: t.identifier
    });
  }
  context.initialTouches = touches;
  if (touches.length == 1) {
    // This is just a swipe.
    context.initialPinchCenter = touches[0];
    context.touchDirections = {
      x: true,
      y: true
    };
  } else if (touches.length >= 2) {
    // It's become a pinch!
    // In case there are 3+ touches, we ignore all but the "first" two.

    // only screen coordinates can be averaged (data coords could be log scale).
    context.initialPinchCenter = {
      pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
      pageY: 0.5 * (touches[0].pageY + touches[1].pageY),
      // TODO(danvk): remove
      dataX: 0.5 * (touches[0].dataX + touches[1].dataX),
      dataY: 0.5 * (touches[0].dataY + touches[1].dataY)
    };

    // Make pinches in a 45-degree swath around either axis 1-dimensional zooms.
    var initialAngle = 180 / Math.PI * Math.atan2(context.initialPinchCenter.pageY - touches[0].pageY, touches[0].pageX - context.initialPinchCenter.pageX);

    // use symmetry to get it into the first quadrant.
    initialAngle = Math.abs(initialAngle);
    if (initialAngle > 90) initialAngle = 90 - initialAngle;
    context.touchDirections = {
      x: initialAngle < 90 - 45 / 2,
      y: initialAngle > 45 / 2
    };
  }

  // save the full x & y ranges.
  context.initialRange = {
    x: g.xAxisRange(),
    y: g.yAxisRange()
  };
};

/**
 * @private
 */
DygraphInteraction.moveTouch = function (event, g, context) {
  // If the tap moves, then it's definitely not part of a double-tap.
  context.startTimeForDoubleTapMs = null;
  var i,
    touches = [];
  for (i = 0; i < event.touches.length; i++) {
    var t = event.touches[i];
    touches.push({
      pageX: t.pageX,
      pageY: t.pageY
    });
  }
  var initialTouches = context.initialTouches;
  var c_now;

  // old and new centers.
  var c_init = context.initialPinchCenter;
  if (touches.length == 1) {
    c_now = touches[0];
  } else {
    c_now = {
      pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
      pageY: 0.5 * (touches[0].pageY + touches[1].pageY)
    };
  }

  // this is the "swipe" component
  // we toss it out for now, but could use it in the future.
  var swipe = {
    pageX: c_now.pageX - c_init.pageX,
    pageY: c_now.pageY - c_init.pageY
  };
  var dataWidth = context.initialRange.x[1] - context.initialRange.x[0];
  var dataHeight = context.initialRange.y[0] - context.initialRange.y[1];
  swipe.dataX = swipe.pageX / g.plotter_.area.w * dataWidth;
  swipe.dataY = swipe.pageY / g.plotter_.area.h * dataHeight;
  var xScale, yScale;

  // The residual bits are usually split into scale & rotate bits, but we split
  // them into x-scale and y-scale bits.
  if (touches.length == 1) {
    xScale = 1.0;
    yScale = 1.0;
  } else if (touches.length >= 2) {
    var initHalfWidth = initialTouches[1].pageX - c_init.pageX;
    xScale = (touches[1].pageX - c_now.pageX) / initHalfWidth;
    var initHalfHeight = initialTouches[1].pageY - c_init.pageY;
    yScale = (touches[1].pageY - c_now.pageY) / initHalfHeight;
  }

  // Clip scaling to [1/8, 8] to prevent too much blowup.
  xScale = Math.min(8, Math.max(0.125, xScale));
  yScale = Math.min(8, Math.max(0.125, yScale));
  var didZoom = false;
  if (context.touchDirections.x) {
    var cFactor = c_init.dataX - swipe.dataX / xScale;
    g.dateWindow_ = [cFactor + (context.initialRange.x[0] - c_init.dataX) / xScale, cFactor + (context.initialRange.x[1] - c_init.dataX) / xScale];
    didZoom = true;
  }
  if (context.touchDirections.y) {
    for (i = 0; i < 1 /*g.axes_.length*/; i++) {
      var axis = g.axes_[i];
      var logscale = g.attributes_.getForAxis("logscale", i);
      if (logscale) {
        // TODO(danvk): implement
      } else {
        var cFactor = c_init.dataY - swipe.dataY / yScale;
        axis.valueRange = [cFactor + (context.initialRange.y[0] - c_init.dataY) / yScale, cFactor + (context.initialRange.y[1] - c_init.dataY) / yScale];
        didZoom = true;
      }
    }
  }
  g.drawGraph_(false);

  // We only call zoomCallback on zooms, not pans, to mirror desktop behavior.
  if (didZoom && touches.length > 1 && g.getFunctionOption('zoomCallback')) {
    var viewWindow = g.xAxisRange();
    g.getFunctionOption("zoomCallback").call(g, viewWindow[0], viewWindow[1], g.yAxisRanges());
  }
};

/**
 * @private
 */
DygraphInteraction.endTouch = function (event, g, context) {
  if (event.touches.length !== 0) {
    // this is effectively a "reset"
    DygraphInteraction.startTouch(event, g, context);
  } else if (event.changedTouches.length == 1) {
    // Could be part of a "double tap"
    // The heuristic here is that it's a double-tap if the two touchend events
    // occur within 500ms and within a 50x50 pixel box.
    var now = new Date().getTime();
    var t = event.changedTouches[0];
    if (context.startTimeForDoubleTapMs && now - context.startTimeForDoubleTapMs < 500 && context.doubleTapX && Math.abs(context.doubleTapX - t.screenX) < 50 && context.doubleTapY && Math.abs(context.doubleTapY - t.screenY) < 50) {
      g.resetZoom();
    } else {
      context.startTimeForDoubleTapMs = now;
      context.doubleTapX = t.screenX;
      context.doubleTapY = t.screenY;
    }
  }
};

// Determine the distance from x to [left, right].
var distanceFromInterval = function distanceFromInterval(x, left, right) {
  if (x < left) {
    return left - x;
  } else if (x > right) {
    return x - right;
  } else {
    return 0;
  }
};

/**
 * Returns the number of pixels by which the event happens from the nearest
 * edge of the chart. For events in the interior of the chart, this returns zero.
 */
var distanceFromChart = function distanceFromChart(event, g) {
  var chartPos = utils.findPos(g.canvas_);
  var box = {
    left: chartPos.x,
    right: chartPos.x + g.canvas_.offsetWidth,
    top: chartPos.y,
    bottom: chartPos.y + g.canvas_.offsetHeight
  };
  var pt = {
    x: utils.pageX(event),
    y: utils.pageY(event)
  };
  var dx = distanceFromInterval(pt.x, box.left, box.right),
    dy = distanceFromInterval(pt.y, box.top, box.bottom);
  return Math.max(dx, dy);
};

/**
 * Default interation model for dygraphs. You can refer to specific elements of
 * this when constructing your own interaction model, e.g.:
 * g.updateOptions( {
 *   interactionModel: {
 *     mousedown: DygraphInteraction.defaultInteractionModel.mousedown
 *   }
 * } );
 */
DygraphInteraction.defaultModel = {
  // Track the beginning of drag events
  mousedown: function mousedown(event, g, context) {
    // Right-click should not initiate a zoom.
    if (event.button && event.button == 2) return;
    context.initializeMouseDown(event, g, context);
    if (event.altKey || event.shiftKey) {
      DygraphInteraction.startPan(event, g, context);
    } else {
      DygraphInteraction.startZoom(event, g, context);
    }

    // Note: we register mousemove/mouseup on document to allow some leeway for
    // events to move outside of the chart. Interaction model events get
    // registered on the canvas, which is too small to allow this.
    var mousemove = function mousemove(event) {
      if (context.isZooming) {
        // When the mouse moves >200px from the chart edge, cancel the zoom.
        var d = distanceFromChart(event, g);
        if (d < DRAG_EDGE_MARGIN) {
          DygraphInteraction.moveZoom(event, g, context);
        } else {
          if (context.dragEndX !== null) {
            context.dragEndX = null;
            context.dragEndY = null;
            g.clearZoomRect_();
          }
        }
      } else if (context.isPanning) {
        DygraphInteraction.movePan(event, g, context);
      }
    };
    var _mouseup = function mouseup(event) {
      if (context.isZooming) {
        if (context.dragEndX !== null) {
          DygraphInteraction.endZoom(event, g, context);
        } else {
          DygraphInteraction.maybeTreatMouseOpAsClick(event, g, context);
        }
      } else if (context.isPanning) {
        DygraphInteraction.endPan(event, g, context);
      }
      utils.removeEvent(document, 'mousemove', mousemove);
      utils.removeEvent(document, 'mouseup', _mouseup);
      context.destroy();
    };
    g.addAndTrackEvent(document, 'mousemove', mousemove);
    g.addAndTrackEvent(document, 'mouseup', _mouseup);
  },
  willDestroyContextMyself: true,
  touchstart: function touchstart(event, g, context) {
    DygraphInteraction.startTouch(event, g, context);
  },
  touchmove: function touchmove(event, g, context) {
    DygraphInteraction.moveTouch(event, g, context);
  },
  touchend: function touchend(event, g, context) {
    DygraphInteraction.endTouch(event, g, context);
  },
  // Disable zooming out if panning.
  dblclick: function dblclick(event, g, context) {
    if (context.cancelNextDblclick) {
      context.cancelNextDblclick = false;
      return;
    }

    // Give plugins a chance to grab this event.
    var e = {
      canvasx: context.dragEndX,
      canvasy: context.dragEndY,
      cancelable: true
    };
    if (g.cascadeEvents_('dblclick', e)) {
      return;
    }
    if (event.altKey || event.shiftKey) {
      return;
    }
    g.resetZoom();
  }
};

/*
Dygraph.DEFAULT_ATTRS.interactionModel = DygraphInteraction.defaultModel;

// old ways of accessing these methods/properties
Dygraph.defaultInteractionModel = DygraphInteraction.defaultModel;
Dygraph.endZoom = DygraphInteraction.endZoom;
Dygraph.moveZoom = DygraphInteraction.moveZoom;
Dygraph.startZoom = DygraphInteraction.startZoom;
Dygraph.endPan = DygraphInteraction.endPan;
Dygraph.movePan = DygraphInteraction.movePan;
Dygraph.startPan = DygraphInteraction.startPan;
*/

DygraphInteraction.nonInteractiveModel_ = {
  mousedown: function mousedown(event, g, context) {
    context.initializeMouseDown(event, g, context);
  },
  mouseup: DygraphInteraction.maybeTreatMouseOpAsClick
};

// Default interaction model when using the range selector.
DygraphInteraction.dragIsPanInteractionModel = {
  mousedown: function mousedown(event, g, context) {
    context.initializeMouseDown(event, g, context);
    DygraphInteraction.startPan(event, g, context);
  },
  mousemove: function mousemove(event, g, context) {
    if (context.isPanning) {
      DygraphInteraction.movePan(event, g, context);
    }
  },
  mouseup: function mouseup(event, g, context) {
    if (context.isPanning) {
      DygraphInteraction.endPan(event, g, context);
    }
  }
};
var _default = exports["default"] = DygraphInteraction;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsInV0aWxzIiwiX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQiLCJyZXF1aXJlIiwiZSIsInQiLCJXZWFrTWFwIiwiciIsIm4iLCJfX2VzTW9kdWxlIiwibyIsImkiLCJmIiwiX19wcm90b19fIiwiaGFzIiwiZ2V0Iiwic2V0IiwiX3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJEUkFHX0VER0VfTUFSR0lOIiwiRHlncmFwaEludGVyYWN0aW9uIiwibWF5YmVUcmVhdE1vdXNlT3BBc0NsaWNrIiwiZXZlbnQiLCJnIiwiY29udGV4dCIsImRyYWdFbmRYIiwiZHJhZ0dldFhfIiwiZHJhZ0VuZFkiLCJkcmFnR2V0WV8iLCJyZWdpb25XaWR0aCIsIk1hdGgiLCJhYnMiLCJkcmFnU3RhcnRYIiwicmVnaW9uSGVpZ2h0IiwiZHJhZ1N0YXJ0WSIsImxhc3R4XyIsInVuZGVmaW5lZCIsInRyZWF0TW91c2VPcEFzQ2xpY2siLCJzdGFydFBhbiIsImF4aXMiLCJpc1Bhbm5pbmciLCJ4UmFuZ2UiLCJ4QXhpc1JhbmdlIiwiZ2V0T3B0aW9uRm9yQXhpcyIsImluaXRpYWxMZWZ0bW9zdERhdGUiLCJsb2cxMCIsImRhdGVSYW5nZSIsInhVbml0c1BlclBpeGVsIiwicGxvdHRlcl8iLCJhcmVhIiwidyIsImdldE51bWVyaWNPcHRpb24iLCJtYXhYUGl4ZWxzVG9EcmF3Iiwid2lkdGhfIiwieEV4dHJlbWVzIiwieEF4aXNFeHRyZW1lcyIsImJvdW5kZWRMZWZ0WCIsInRvRG9tWENvb3JkIiwiYm91bmRlZFJpZ2h0WCIsImJvdW5kZWRMZWZ0RGF0ZSIsInRvRGF0YVhDb29yZCIsImJvdW5kZWRSaWdodERhdGUiLCJib3VuZGVkRGF0ZXMiLCJib3VuZGVkVmFsdWVzIiwibWF4WVBpeGVsc1RvRHJhdyIsImhlaWdodF8iLCJheGVzXyIsImxlbmd0aCIsInlFeHRyZW1lcyIsImV4dHJlbWVSYW5nZSIsImJvdW5kZWRUb3BZIiwidG9Eb21ZQ29vcmQiLCJib3VuZGVkQm90dG9tWSIsImJvdW5kZWRUb3BWYWx1ZSIsInRvRGF0YVlDb29yZCIsImJvdW5kZWRCb3R0b21WYWx1ZSIsImlzMkRQYW4iLCJheGVzIiwiYXhpc19kYXRhIiwieVJhbmdlIiwieUF4aXNSYW5nZSIsImxvZ3NjYWxlIiwiYXR0cmlidXRlc18iLCJnZXRGb3JBeGlzIiwiaW5pdGlhbFRvcFZhbHVlIiwiZHJhZ1ZhbHVlUmFuZ2UiLCJ1bml0c1BlclBpeGVsIiwiaCIsInB1c2giLCJ2YWx1ZVJhbmdlIiwibW92ZVBhbiIsIm1pbkRhdGUiLCJtYXgiLCJtYXhEYXRlIiwiZGF0ZVdpbmRvd18iLCJwb3ciLCJMT0dfU0NBTEUiLCJwaXhlbHNEcmFnZ2VkIiwidW5pdHNEcmFnZ2VkIiwiYm91bmRlZFZhbHVlIiwibWF4VmFsdWUiLCJtaW4iLCJtaW5WYWx1ZSIsImRyYXdHcmFwaF8iLCJlbmRQYW4iLCJzdGFydFpvb20iLCJpc1pvb21pbmciLCJ6b29tTW92ZWQiLCJtb3ZlWm9vbSIsInhEZWx0YSIsInlEZWx0YSIsImRyYWdEaXJlY3Rpb24iLCJWRVJUSUNBTCIsIkhPUklaT05UQUwiLCJkcmF3Wm9vbVJlY3RfIiwicHJldkRyYWdEaXJlY3Rpb24iLCJwcmV2RW5kWCIsInByZXZFbmRZIiwiY2xpY2tDYWxsYmFjayIsImdldEZ1bmN0aW9uT3B0aW9uIiwicG9pbnRDbGlja0NhbGxiYWNrIiwic2VsZWN0ZWRQb2ludCIsImNsb3Nlc3RJZHgiLCJjbG9zZXN0RGlzdGFuY2UiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJzZWxQb2ludHNfIiwicCIsImRpc3RhbmNlIiwiY2FudmFzeCIsImNhbnZhc3kiLCJpc05hTiIsInJhZGl1cyIsImNhbmNlbGFibGUiLCJwb2ludCIsImRlZmF1bHRQcmV2ZW50ZWQiLCJjYXNjYWRlRXZlbnRzXyIsInh2YWwiLCJwdHMiLCJlbmRab29tIiwiY2xlYXJab29tUmVjdF8iLCJwbG90QXJlYSIsImdldEFyZWEiLCJsZWZ0IiwicmlnaHQiLCJ4IiwiZG9ab29tWF8iLCJjYW5jZWxOZXh0RGJsY2xpY2siLCJ0b3AiLCJib3R0b20iLCJ5IiwiZG9ab29tWV8iLCJzdGFydFRvdWNoIiwicHJldmVudERlZmF1bHQiLCJ0b3VjaGVzIiwic3RhcnRUaW1lRm9yRG91YmxlVGFwTXMiLCJyZWN0IiwidGFyZ2V0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGFnZVgiLCJwYWdlWSIsImRhdGFYIiwiY2xpZW50WCIsImRhdGFZIiwiY2xpZW50WSIsImluaXRpYWxUb3VjaGVzIiwiaW5pdGlhbFBpbmNoQ2VudGVyIiwidG91Y2hEaXJlY3Rpb25zIiwiaW5pdGlhbEFuZ2xlIiwiUEkiLCJhdGFuMiIsImluaXRpYWxSYW5nZSIsIm1vdmVUb3VjaCIsImNfbm93IiwiY19pbml0Iiwic3dpcGUiLCJkYXRhV2lkdGgiLCJkYXRhSGVpZ2h0IiwieFNjYWxlIiwieVNjYWxlIiwiaW5pdEhhbGZXaWR0aCIsImluaXRIYWxmSGVpZ2h0IiwiZGlkWm9vbSIsImNGYWN0b3IiLCJ2aWV3V2luZG93IiwieUF4aXNSYW5nZXMiLCJlbmRUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwibm93IiwiRGF0ZSIsImdldFRpbWUiLCJkb3VibGVUYXBYIiwic2NyZWVuWCIsImRvdWJsZVRhcFkiLCJzY3JlZW5ZIiwicmVzZXRab29tIiwiZGlzdGFuY2VGcm9tSW50ZXJ2YWwiLCJkaXN0YW5jZUZyb21DaGFydCIsImNoYXJ0UG9zIiwiZmluZFBvcyIsImNhbnZhc18iLCJib3giLCJvZmZzZXRXaWR0aCIsIm9mZnNldEhlaWdodCIsInB0IiwiZHgiLCJkeSIsImRlZmF1bHRNb2RlbCIsIm1vdXNlZG93biIsImJ1dHRvbiIsImluaXRpYWxpemVNb3VzZURvd24iLCJhbHRLZXkiLCJzaGlmdEtleSIsIm1vdXNlbW92ZSIsImQiLCJtb3VzZXVwIiwicmVtb3ZlRXZlbnQiLCJkb2N1bWVudCIsImRlc3Ryb3kiLCJhZGRBbmRUcmFja0V2ZW50Iiwid2lsbERlc3Ryb3lDb250ZXh0TXlzZWxmIiwidG91Y2hzdGFydCIsInRvdWNobW92ZSIsInRvdWNoZW5kIiwiZGJsY2xpY2siLCJub25JbnRlcmFjdGl2ZU1vZGVsXyIsImRyYWdJc1BhbkludGVyYWN0aW9uTW9kZWwiLCJfZGVmYXVsdCIsIm1vZHVsZSIsImRlZmF1bHQiXSwic291cmNlcyI6WyIuLi9zcmMvZHlncmFwaC1pbnRlcmFjdGlvbi1tb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDExIFJvYmVydCBLb25pZ3NiZXJnIChrb25pZ3NiZXJnQGdvb2dsZS5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZS9NSVRcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIGRlZmF1bHQgaW50ZXJhY3Rpb24gbW9kZWwgZm9yIER5Z3JhcGhzLiBUaGlzIGlzIGtlcHQgb3V0XG4gKiBvZiBkeWdyYXBoLmpzIGZvciBiZXR0ZXIgbmF2aWdhYmlsaXR5LlxuICogQGF1dGhvciBSb2JlcnQgS29uaWdzYmVyZyAoa29uaWdzYmVyZ0Bnb29nbGUuY29tKVxuICovXG5cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cblxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi9keWdyYXBoLXV0aWxzJztcblxuLyoqXG4gKiBZb3UgY2FuIGRyYWcgdGhpcyBtYW55IHBpeGVscyBwYXN0IHRoZSBlZGdlIG9mIHRoZSBjaGFydCBhbmQgc3RpbGwgaGF2ZSBpdFxuICogYmUgY29uc2lkZXJlZCBhIHpvb20uIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvIHpvb20gdG8gdGhlIGV4YWN0IGVkZ2Ugb2YgdGhlXG4gKiBjaGFydCwgYSBmYWlybHkgY29tbW9uIG9wZXJhdGlvbi5cbiAqL1xudmFyIERSQUdfRURHRV9NQVJHSU4gPSAxMDA7XG5cbi8qKlxuICogQSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0byBmYWNpbGl0YXRlIGJ1aWxkIGN1c3RvbSBpbnRlcmFjdGlvbiBtb2RlbHMuXG4gKiBAY2xhc3NcbiAqL1xudmFyIER5Z3JhcGhJbnRlcmFjdGlvbiA9IHt9O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBiZWdpbm5pbmcgJiBlbmRpbmcgb2YgYW4gZXZlbnQgd2VyZSBjbG9zZSBlbm91Z2ggdGhhdCBpdFxuICogc2hvdWxkIGJlIGNvbnNpZGVyZWQgYSBjbGljay4gSWYgaXQgc2hvdWxkLCBkaXNwYXRjaCBhcHByb3ByaWF0ZSBldmVudHMuXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGV2ZW50IHdhcyB0cmVhdGVkIGFzIGEgY2xpY2suXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RHlncmFwaH0gZ1xuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLm1heWJlVHJlYXRNb3VzZU9wQXNDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gIGNvbnRleHQuZHJhZ0VuZFggPSB1dGlscy5kcmFnR2V0WF8oZXZlbnQsIGNvbnRleHQpO1xuICBjb250ZXh0LmRyYWdFbmRZID0gdXRpbHMuZHJhZ0dldFlfKGV2ZW50LCBjb250ZXh0KTtcbiAgdmFyIHJlZ2lvbldpZHRoID0gTWF0aC5hYnMoY29udGV4dC5kcmFnRW5kWCAtIGNvbnRleHQuZHJhZ1N0YXJ0WCk7XG4gIHZhciByZWdpb25IZWlnaHQgPSBNYXRoLmFicyhjb250ZXh0LmRyYWdFbmRZIC0gY29udGV4dC5kcmFnU3RhcnRZKTtcblxuICBpZiAocmVnaW9uV2lkdGggPCAyICYmIHJlZ2lvbkhlaWdodCA8IDIgJiZcbiAgICAgIGcubGFzdHhfICE9PSB1bmRlZmluZWQgJiYgZy5sYXN0eF8gIT09IG51bGwpIHtcbiAgICBEeWdyYXBoSW50ZXJhY3Rpb24udHJlYXRNb3VzZU9wQXNDbGljayhnLCBldmVudCwgY29udGV4dCk7XG4gIH1cblxuICBjb250ZXh0LnJlZ2lvbldpZHRoID0gcmVnaW9uV2lkdGg7XG4gIGNvbnRleHQucmVnaW9uSGVpZ2h0ID0gcmVnaW9uSGVpZ2h0O1xufTtcblxuLyoqXG4gKiBDYWxsZWQgaW4gcmVzcG9uc2UgdG8gYW4gaW50ZXJhY3Rpb24gbW9kZWwgb3BlcmF0aW9uIHRoYXRcbiAqIHNob3VsZCBzdGFydCB0aGUgZGVmYXVsdCBwYW5uaW5nIGJlaGF2aW9yLlxuICpcbiAqIEl0J3MgdXNlZCBpbiB0aGUgZGVmYXVsdCBjYWxsYmFjayBmb3IgXCJtb3VzZWRvd25cIiBvcGVyYXRpb25zLlxuICogQ3VzdG9tIGludGVyYWN0aW9uIG1vZGVsIGJ1aWxkZXJzIGNhbiB1c2UgaXQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdFxuICogcGFubmluZyBiZWhhdmlvci5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCB0aGUgZXZlbnQgb2JqZWN0IHdoaWNoIGxlZCB0byB0aGUgc3RhcnRQYW4gY2FsbC5cbiAqIEBwYXJhbSB7RHlncmFwaH0gZyBUaGUgZHlncmFwaCBvbiB3aGljaCB0byBhY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCBUaGUgZHJhZ2dpbmcgY29udGV4dCBvYmplY3QgKHdpdGhcbiAqICAgICBkcmFnU3RhcnRYL2RyYWdTdGFydFkvZXRjLiBwcm9wZXJ0aWVzKS4gVGhpcyBmdW5jdGlvbiBtb2RpZmllcyB0aGVcbiAqICAgICBjb250ZXh0LlxuICovXG5EeWdyYXBoSW50ZXJhY3Rpb24uc3RhcnRQYW4gPSBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICB2YXIgaSwgYXhpcztcbiAgY29udGV4dC5pc1Bhbm5pbmcgPSB0cnVlO1xuICB2YXIgeFJhbmdlID0gZy54QXhpc1JhbmdlKCk7XG5cbiAgaWYgKGcuZ2V0T3B0aW9uRm9yQXhpcyhcImxvZ3NjYWxlXCIsIFwieFwiKSkge1xuICAgIGNvbnRleHQuaW5pdGlhbExlZnRtb3N0RGF0ZSA9IHV0aWxzLmxvZzEwKHhSYW5nZVswXSk7XG4gICAgY29udGV4dC5kYXRlUmFuZ2UgPSB1dGlscy5sb2cxMCh4UmFuZ2VbMV0pIC0gdXRpbHMubG9nMTAoeFJhbmdlWzBdKTtcbiAgfSBlbHNlIHtcbiAgICBjb250ZXh0LmluaXRpYWxMZWZ0bW9zdERhdGUgPSB4UmFuZ2VbMF07XG4gICAgY29udGV4dC5kYXRlUmFuZ2UgPSB4UmFuZ2VbMV0gLSB4UmFuZ2VbMF07XG4gIH1cbiAgY29udGV4dC54VW5pdHNQZXJQaXhlbCA9IGNvbnRleHQuZGF0ZVJhbmdlIC8gKGcucGxvdHRlcl8uYXJlYS53IC0gMSk7XG5cbiAgaWYgKGcuZ2V0TnVtZXJpY09wdGlvbihcInBhbkVkZ2VGcmFjdGlvblwiKSkge1xuICAgIHZhciBtYXhYUGl4ZWxzVG9EcmF3ID0gZy53aWR0aF8gKiBnLmdldE51bWVyaWNPcHRpb24oXCJwYW5FZGdlRnJhY3Rpb25cIik7XG4gICAgdmFyIHhFeHRyZW1lcyA9IGcueEF4aXNFeHRyZW1lcygpOyAvLyBJIFJFQUxMWSBXQU5UIFRPIENBTEwgVEhJUyB4VHJlbWVzIVxuXG4gICAgdmFyIGJvdW5kZWRMZWZ0WCA9IGcudG9Eb21YQ29vcmQoeEV4dHJlbWVzWzBdKSAtIG1heFhQaXhlbHNUb0RyYXc7XG4gICAgdmFyIGJvdW5kZWRSaWdodFggPSBnLnRvRG9tWENvb3JkKHhFeHRyZW1lc1sxXSkgKyBtYXhYUGl4ZWxzVG9EcmF3O1xuXG4gICAgdmFyIGJvdW5kZWRMZWZ0RGF0ZSA9IGcudG9EYXRhWENvb3JkKGJvdW5kZWRMZWZ0WCk7XG4gICAgdmFyIGJvdW5kZWRSaWdodERhdGUgPSBnLnRvRGF0YVhDb29yZChib3VuZGVkUmlnaHRYKTtcbiAgICBjb250ZXh0LmJvdW5kZWREYXRlcyA9IFtib3VuZGVkTGVmdERhdGUsIGJvdW5kZWRSaWdodERhdGVdO1xuXG4gICAgdmFyIGJvdW5kZWRWYWx1ZXMgPSBbXTtcbiAgICB2YXIgbWF4WVBpeGVsc1RvRHJhdyA9IGcuaGVpZ2h0XyAqIGcuZ2V0TnVtZXJpY09wdGlvbihcInBhbkVkZ2VGcmFjdGlvblwiKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBnLmF4ZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICBheGlzID0gZy5heGVzX1tpXTtcbiAgICAgIHZhciB5RXh0cmVtZXMgPSBheGlzLmV4dHJlbWVSYW5nZTtcblxuICAgICAgdmFyIGJvdW5kZWRUb3BZID0gZy50b0RvbVlDb29yZCh5RXh0cmVtZXNbMF0sIGkpICsgbWF4WVBpeGVsc1RvRHJhdztcbiAgICAgIHZhciBib3VuZGVkQm90dG9tWSA9IGcudG9Eb21ZQ29vcmQoeUV4dHJlbWVzWzFdLCBpKSAtIG1heFlQaXhlbHNUb0RyYXc7XG5cbiAgICAgIHZhciBib3VuZGVkVG9wVmFsdWUgPSBnLnRvRGF0YVlDb29yZChib3VuZGVkVG9wWSwgaSk7XG4gICAgICB2YXIgYm91bmRlZEJvdHRvbVZhbHVlID0gZy50b0RhdGFZQ29vcmQoYm91bmRlZEJvdHRvbVksIGkpO1xuXG4gICAgICBib3VuZGVkVmFsdWVzW2ldID0gW2JvdW5kZWRUb3BWYWx1ZSwgYm91bmRlZEJvdHRvbVZhbHVlXTtcbiAgICB9XG4gICAgY29udGV4dC5ib3VuZGVkVmFsdWVzID0gYm91bmRlZFZhbHVlcztcbiAgfSBlbHNlIHtcbiAgICAvLyB1bmRvIGVmZmVjdCBpZiBpdCB3YXMgb25jZSBzZXRcbiAgICBjb250ZXh0LmJvdW5kZWREYXRlcyA9IG51bGw7XG4gICAgY29udGV4dC5ib3VuZGVkVmFsdWVzID0gbnVsbDtcbiAgfVxuXG4gIC8vIFJlY29yZCB0aGUgcmFuZ2Ugb2YgZWFjaCB5LWF4aXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBkcmFnLlxuICAvLyBJZiBhbnkgYXhpcyBoYXMgYSB2YWx1ZVJhbmdlLCB0aGVuIHdlIHdhbnQgYSAyRCBwYW4uXG4gIC8vIFdlIGNhbid0IHN0b3JlIGRhdGEgZGlyZWN0bHkgaW4gZy5heGVzXywgYmVjYXVzZSBpdCBkb2VzIG5vdCBiZWxvbmcgdG8gdXNcbiAgLy8gYW5kIGNvdWxkIGNoYW5nZSBvdXQgZnJvbSB1bmRlciB1cyBkdXJpbmcgYSBwYW4gKHNheSBpZiB0aGVyZSdzIGEgZGF0YVxuICAvLyB1cGRhdGUpLlxuICBjb250ZXh0LmlzMkRQYW4gPSBmYWxzZTtcbiAgY29udGV4dC5heGVzID0gW107XG4gIGZvciAoaSA9IDA7IGkgPCBnLmF4ZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgYXhpcyA9IGcuYXhlc19baV07XG4gICAgdmFyIGF4aXNfZGF0YSA9IHt9O1xuICAgIHZhciB5UmFuZ2UgPSBnLnlBeGlzUmFuZ2UoaSk7XG4gICAgLy8gVE9ETyhrb25pZ3NiZXJnKTogVGhlc2UgdmFsdWVzIHNob3VsZCBiZSBpbiB8Y29udGV4dHwuXG4gICAgLy8gSW4gbG9nIHNjYWxlLCBpbml0aWFsVG9wVmFsdWUsIGRyYWdWYWx1ZVJhbmdlIGFuZCB1bml0c1BlclBpeGVsIGFyZSBsb2cgc2NhbGUuXG4gICAgdmFyIGxvZ3NjYWxlID0gZy5hdHRyaWJ1dGVzXy5nZXRGb3JBeGlzKFwibG9nc2NhbGVcIiwgaSk7XG4gICAgaWYgKGxvZ3NjYWxlKSB7XG4gICAgICBheGlzX2RhdGEuaW5pdGlhbFRvcFZhbHVlID0gdXRpbHMubG9nMTAoeVJhbmdlWzFdKTtcbiAgICAgIGF4aXNfZGF0YS5kcmFnVmFsdWVSYW5nZSA9IHV0aWxzLmxvZzEwKHlSYW5nZVsxXSkgLSB1dGlscy5sb2cxMCh5UmFuZ2VbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBheGlzX2RhdGEuaW5pdGlhbFRvcFZhbHVlID0geVJhbmdlWzFdO1xuICAgICAgYXhpc19kYXRhLmRyYWdWYWx1ZVJhbmdlID0geVJhbmdlWzFdIC0geVJhbmdlWzBdO1xuICAgIH1cbiAgICBheGlzX2RhdGEudW5pdHNQZXJQaXhlbCA9IGF4aXNfZGF0YS5kcmFnVmFsdWVSYW5nZSAvIChnLnBsb3R0ZXJfLmFyZWEuaCAtIDEpO1xuICAgIGNvbnRleHQuYXhlcy5wdXNoKGF4aXNfZGF0YSk7XG5cbiAgICAvLyBXaGlsZSBjYWxjdWxhdGluZyBheGVzLCBzZXQgMmRwYW4uXG4gICAgaWYgKGF4aXMudmFsdWVSYW5nZSkgY29udGV4dC5pczJEUGFuID0gdHJ1ZTtcbiAgfVxufTtcblxuLyoqXG4gKiBDYWxsZWQgaW4gcmVzcG9uc2UgdG8gYW4gaW50ZXJhY3Rpb24gbW9kZWwgb3BlcmF0aW9uIHRoYXRcbiAqIHJlc3BvbmRzIHRvIGFuIGV2ZW50IHRoYXQgcGFucyB0aGUgdmlldy5cbiAqXG4gKiBJdCdzIHVzZWQgaW4gdGhlIGRlZmF1bHQgY2FsbGJhY2sgZm9yIFwibW91c2Vtb3ZlXCIgb3BlcmF0aW9ucy5cbiAqIEN1c3RvbSBpbnRlcmFjdGlvbiBtb2RlbCBidWlsZGVycyBjYW4gdXNlIGl0IHRvIHByb3ZpZGUgdGhlIGRlZmF1bHRcbiAqIHBhbm5pbmcgYmVoYXZpb3IuXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgdGhlIGV2ZW50IG9iamVjdCB3aGljaCBsZWQgdG8gdGhlIG1vdmVQYW4gY2FsbC5cbiAqIEBwYXJhbSB7RHlncmFwaH0gZyBUaGUgZHlncmFwaCBvbiB3aGljaCB0byBhY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCBUaGUgZHJhZ2dpbmcgY29udGV4dCBvYmplY3QgKHdpdGhcbiAqICAgICBkcmFnU3RhcnRYL2RyYWdTdGFydFkvZXRjLiBwcm9wZXJ0aWVzKS4gVGhpcyBmdW5jdGlvbiBtb2RpZmllcyB0aGVcbiAqICAgICBjb250ZXh0LlxuICovXG5EeWdyYXBoSW50ZXJhY3Rpb24ubW92ZVBhbiA9IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gIGNvbnRleHQuZHJhZ0VuZFggPSB1dGlscy5kcmFnR2V0WF8oZXZlbnQsIGNvbnRleHQpO1xuICBjb250ZXh0LmRyYWdFbmRZID0gdXRpbHMuZHJhZ0dldFlfKGV2ZW50LCBjb250ZXh0KTtcblxuICB2YXIgbWluRGF0ZSA9IGNvbnRleHQuaW5pdGlhbExlZnRtb3N0RGF0ZSAtXG4gICAgKGNvbnRleHQuZHJhZ0VuZFggLSBjb250ZXh0LmRyYWdTdGFydFgpICogY29udGV4dC54VW5pdHNQZXJQaXhlbDtcbiAgaWYgKGNvbnRleHQuYm91bmRlZERhdGVzKSB7XG4gICAgbWluRGF0ZSA9IE1hdGgubWF4KG1pbkRhdGUsIGNvbnRleHQuYm91bmRlZERhdGVzWzBdKTtcbiAgfVxuICB2YXIgbWF4RGF0ZSA9IG1pbkRhdGUgKyBjb250ZXh0LmRhdGVSYW5nZTtcbiAgaWYgKGNvbnRleHQuYm91bmRlZERhdGVzKSB7XG4gICAgaWYgKG1heERhdGUgPiBjb250ZXh0LmJvdW5kZWREYXRlc1sxXSkge1xuICAgICAgLy8gQWRqdXN0IG1pbkRhdGUsIGFuZCByZWNvbXB1dGUgbWF4RGF0ZS5cbiAgICAgIG1pbkRhdGUgPSBtaW5EYXRlIC0gKG1heERhdGUgLSBjb250ZXh0LmJvdW5kZWREYXRlc1sxXSk7XG4gICAgICBtYXhEYXRlID0gbWluRGF0ZSArIGNvbnRleHQuZGF0ZVJhbmdlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChnLmdldE9wdGlvbkZvckF4aXMoXCJsb2dzY2FsZVwiLCBcInhcIikpIHtcbiAgICBnLmRhdGVXaW5kb3dfID0gWyBNYXRoLnBvdyh1dGlscy5MT0dfU0NBTEUsIG1pbkRhdGUpLFxuICAgICAgICAgICAgICAgICAgICAgIE1hdGgucG93KHV0aWxzLkxPR19TQ0FMRSwgbWF4RGF0ZSkgXTtcbiAgfSBlbHNlIHtcbiAgICBnLmRhdGVXaW5kb3dfID0gW21pbkRhdGUsIG1heERhdGVdO1xuICB9XG5cbiAgLy8geS1heGlzIHNjYWxpbmcgaXMgYXV0b21hdGljIHVubGVzcyB0aGlzIGlzIGEgZnVsbCAyRCBwYW4uXG4gIGlmIChjb250ZXh0LmlzMkRQYW4pIHtcblxuICAgIHZhciBwaXhlbHNEcmFnZ2VkID0gY29udGV4dC5kcmFnRW5kWSAtIGNvbnRleHQuZHJhZ1N0YXJ0WTtcblxuICAgIC8vIEFkanVzdCBlYWNoIGF4aXMgYXBwcm9wcmlhdGVseS5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGcuYXhlc18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBheGlzID0gZy5heGVzX1tpXTtcbiAgICAgIHZhciBheGlzX2RhdGEgPSBjb250ZXh0LmF4ZXNbaV07XG4gICAgICB2YXIgdW5pdHNEcmFnZ2VkID0gcGl4ZWxzRHJhZ2dlZCAqIGF4aXNfZGF0YS51bml0c1BlclBpeGVsO1xuXG4gICAgICB2YXIgYm91bmRlZFZhbHVlID0gY29udGV4dC5ib3VuZGVkVmFsdWVzID8gY29udGV4dC5ib3VuZGVkVmFsdWVzW2ldIDogbnVsbDtcblxuICAgICAgLy8gSW4gbG9nIHNjYWxlLCBtYXhWYWx1ZSBhbmQgbWluVmFsdWUgYXJlIHRoZSBsb2dzIG9mIHRob3NlIHZhbHVlcy5cbiAgICAgIHZhciBtYXhWYWx1ZSA9IGF4aXNfZGF0YS5pbml0aWFsVG9wVmFsdWUgKyB1bml0c0RyYWdnZWQ7XG4gICAgICBpZiAoYm91bmRlZFZhbHVlKSB7XG4gICAgICAgIG1heFZhbHVlID0gTWF0aC5taW4obWF4VmFsdWUsIGJvdW5kZWRWYWx1ZVsxXSk7XG4gICAgICB9XG4gICAgICB2YXIgbWluVmFsdWUgPSBtYXhWYWx1ZSAtIGF4aXNfZGF0YS5kcmFnVmFsdWVSYW5nZTtcbiAgICAgIGlmIChib3VuZGVkVmFsdWUpIHtcbiAgICAgICAgaWYgKG1pblZhbHVlIDwgYm91bmRlZFZhbHVlWzBdKSB7XG4gICAgICAgICAgLy8gQWRqdXN0IG1heFZhbHVlLCBhbmQgcmVjb21wdXRlIG1pblZhbHVlLlxuICAgICAgICAgIG1heFZhbHVlID0gbWF4VmFsdWUgLSAobWluVmFsdWUgLSBib3VuZGVkVmFsdWVbMF0pO1xuICAgICAgICAgIG1pblZhbHVlID0gbWF4VmFsdWUgLSBheGlzX2RhdGEuZHJhZ1ZhbHVlUmFuZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChnLmF0dHJpYnV0ZXNfLmdldEZvckF4aXMoXCJsb2dzY2FsZVwiLCBpKSkge1xuICAgICAgICBheGlzLnZhbHVlUmFuZ2UgPSBbIE1hdGgucG93KHV0aWxzLkxPR19TQ0FMRSwgbWluVmFsdWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucG93KHV0aWxzLkxPR19TQ0FMRSwgbWF4VmFsdWUpIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBheGlzLnZhbHVlUmFuZ2UgPSBbIG1pblZhbHVlLCBtYXhWYWx1ZSBdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGcuZHJhd0dyYXBoXyhmYWxzZSk7XG59O1xuXG4vKipcbiAqIENhbGxlZCBpbiByZXNwb25zZSB0byBhbiBpbnRlcmFjdGlvbiBtb2RlbCBvcGVyYXRpb24gdGhhdFxuICogcmVzcG9uZHMgdG8gYW4gZXZlbnQgdGhhdCBlbmRzIHBhbm5pbmcuXG4gKlxuICogSXQncyB1c2VkIGluIHRoZSBkZWZhdWx0IGNhbGxiYWNrIGZvciBcIm1vdXNldXBcIiBvcGVyYXRpb25zLlxuICogQ3VzdG9tIGludGVyYWN0aW9uIG1vZGVsIGJ1aWxkZXJzIGNhbiB1c2UgaXQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdFxuICogcGFubmluZyBiZWhhdmlvci5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCB0aGUgZXZlbnQgb2JqZWN0IHdoaWNoIGxlZCB0byB0aGUgZW5kUGFuIGNhbGwuXG4gKiBAcGFyYW0ge0R5Z3JhcGh9IGcgVGhlIGR5Z3JhcGggb24gd2hpY2ggdG8gYWN0LlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgVGhlIGRyYWdnaW5nIGNvbnRleHQgb2JqZWN0ICh3aXRoXG4gKiAgICAgZHJhZ1N0YXJ0WC9kcmFnU3RhcnRZL2V0Yy4gcHJvcGVydGllcykuIFRoaXMgZnVuY3Rpb24gbW9kaWZpZXMgdGhlXG4gKiAgICAgY29udGV4dC5cbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLmVuZFBhbiA9IER5Z3JhcGhJbnRlcmFjdGlvbi5tYXliZVRyZWF0TW91c2VPcEFzQ2xpY2s7XG5cbi8qKlxuICogQ2FsbGVkIGluIHJlc3BvbnNlIHRvIGFuIGludGVyYWN0aW9uIG1vZGVsIG9wZXJhdGlvbiB0aGF0XG4gKiByZXNwb25kcyB0byBhbiBldmVudCB0aGF0IHN0YXJ0cyB6b29taW5nLlxuICpcbiAqIEl0J3MgdXNlZCBpbiB0aGUgZGVmYXVsdCBjYWxsYmFjayBmb3IgXCJtb3VzZWRvd25cIiBvcGVyYXRpb25zLlxuICogQ3VzdG9tIGludGVyYWN0aW9uIG1vZGVsIGJ1aWxkZXJzIGNhbiB1c2UgaXQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdFxuICogem9vbWluZyBiZWhhdmlvci5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCB0aGUgZXZlbnQgb2JqZWN0IHdoaWNoIGxlZCB0byB0aGUgc3RhcnRab29tIGNhbGwuXG4gKiBAcGFyYW0ge0R5Z3JhcGh9IGcgVGhlIGR5Z3JhcGggb24gd2hpY2ggdG8gYWN0LlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgVGhlIGRyYWdnaW5nIGNvbnRleHQgb2JqZWN0ICh3aXRoXG4gKiAgICAgZHJhZ1N0YXJ0WC9kcmFnU3RhcnRZL2V0Yy4gcHJvcGVydGllcykuIFRoaXMgZnVuY3Rpb24gbW9kaWZpZXMgdGhlXG4gKiAgICAgY29udGV4dC5cbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0Wm9vbSA9IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gIGNvbnRleHQuaXNab29taW5nID0gdHJ1ZTtcbiAgY29udGV4dC56b29tTW92ZWQgPSBmYWxzZTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIGluIHJlc3BvbnNlIHRvIGFuIGludGVyYWN0aW9uIG1vZGVsIG9wZXJhdGlvbiB0aGF0XG4gKiByZXNwb25kcyB0byBhbiBldmVudCB0aGF0IGRlZmluZXMgem9vbSBib3VuZGFyaWVzLlxuICpcbiAqIEl0J3MgdXNlZCBpbiB0aGUgZGVmYXVsdCBjYWxsYmFjayBmb3IgXCJtb3VzZW1vdmVcIiBvcGVyYXRpb25zLlxuICogQ3VzdG9tIGludGVyYWN0aW9uIG1vZGVsIGJ1aWxkZXJzIGNhbiB1c2UgaXQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdFxuICogem9vbWluZyBiZWhhdmlvci5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCB0aGUgZXZlbnQgb2JqZWN0IHdoaWNoIGxlZCB0byB0aGUgbW92ZVpvb20gY2FsbC5cbiAqIEBwYXJhbSB7RHlncmFwaH0gZyBUaGUgZHlncmFwaCBvbiB3aGljaCB0byBhY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCBUaGUgZHJhZ2dpbmcgY29udGV4dCBvYmplY3QgKHdpdGhcbiAqICAgICBkcmFnU3RhcnRYL2RyYWdTdGFydFkvZXRjLiBwcm9wZXJ0aWVzKS4gVGhpcyBmdW5jdGlvbiBtb2RpZmllcyB0aGVcbiAqICAgICBjb250ZXh0LlxuICovXG5EeWdyYXBoSW50ZXJhY3Rpb24ubW92ZVpvb20gPSBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICBjb250ZXh0Lnpvb21Nb3ZlZCA9IHRydWU7XG4gIGNvbnRleHQuZHJhZ0VuZFggPSB1dGlscy5kcmFnR2V0WF8oZXZlbnQsIGNvbnRleHQpO1xuICBjb250ZXh0LmRyYWdFbmRZID0gdXRpbHMuZHJhZ0dldFlfKGV2ZW50LCBjb250ZXh0KTtcblxuICB2YXIgeERlbHRhID0gTWF0aC5hYnMoY29udGV4dC5kcmFnU3RhcnRYIC0gY29udGV4dC5kcmFnRW5kWCk7XG4gIHZhciB5RGVsdGEgPSBNYXRoLmFicyhjb250ZXh0LmRyYWdTdGFydFkgLSBjb250ZXh0LmRyYWdFbmRZKTtcblxuICAvLyBkcmFnIGRpcmVjdGlvbiB0aHJlc2hvbGQgZm9yIHkgYXhpcyBpcyB0d2ljZSBhcyBsYXJnZSBhcyB4IGF4aXNcbiAgY29udGV4dC5kcmFnRGlyZWN0aW9uID0gKHhEZWx0YSA8IHlEZWx0YSAvIDIpID8gdXRpbHMuVkVSVElDQUwgOiB1dGlscy5IT1JJWk9OVEFMO1xuXG4gIGcuZHJhd1pvb21SZWN0XyhcbiAgICAgIGNvbnRleHQuZHJhZ0RpcmVjdGlvbixcbiAgICAgIGNvbnRleHQuZHJhZ1N0YXJ0WCxcbiAgICAgIGNvbnRleHQuZHJhZ0VuZFgsXG4gICAgICBjb250ZXh0LmRyYWdTdGFydFksXG4gICAgICBjb250ZXh0LmRyYWdFbmRZLFxuICAgICAgY29udGV4dC5wcmV2RHJhZ0RpcmVjdGlvbixcbiAgICAgIGNvbnRleHQucHJldkVuZFgsXG4gICAgICBjb250ZXh0LnByZXZFbmRZKTtcblxuICBjb250ZXh0LnByZXZFbmRYID0gY29udGV4dC5kcmFnRW5kWDtcbiAgY29udGV4dC5wcmV2RW5kWSA9IGNvbnRleHQuZHJhZ0VuZFk7XG4gIGNvbnRleHQucHJldkRyYWdEaXJlY3Rpb24gPSBjb250ZXh0LmRyYWdEaXJlY3Rpb247XG59O1xuXG4vKipcbiAqIFRPRE8oZGFudmspOiBtb3ZlIHRoaXMgbG9naWMgaW50byBkeWdyYXBoLmpzXG4gKiBAcGFyYW0ge0R5Z3JhcGh9IGdcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICovXG5EeWdyYXBoSW50ZXJhY3Rpb24udHJlYXRNb3VzZU9wQXNDbGljayA9IGZ1bmN0aW9uKGcsIGV2ZW50LCBjb250ZXh0KSB7XG4gIHZhciBjbGlja0NhbGxiYWNrID0gZy5nZXRGdW5jdGlvbk9wdGlvbignY2xpY2tDYWxsYmFjaycpO1xuICB2YXIgcG9pbnRDbGlja0NhbGxiYWNrID0gZy5nZXRGdW5jdGlvbk9wdGlvbigncG9pbnRDbGlja0NhbGxiYWNrJyk7XG5cbiAgdmFyIHNlbGVjdGVkUG9pbnQgPSBudWxsO1xuXG4gIC8vIEZpbmQgb3V0IGlmIHRoZSBjbGljayBvY2N1cnMgb24gYSBwb2ludC5cbiAgdmFyIGNsb3Nlc3RJZHggPSAtMTtcbiAgdmFyIGNsb3Nlc3REaXN0YW5jZSA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgLy8gY2hlY2sgaWYgdGhlIGNsaWNrIHdhcyBvbiBhIHBhcnRpY3VsYXIgcG9pbnQuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZy5zZWxQb2ludHNfLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHAgPSBnLnNlbFBvaW50c19baV07XG4gICAgdmFyIGRpc3RhbmNlID0gTWF0aC5wb3cocC5jYW52YXN4IC0gY29udGV4dC5kcmFnRW5kWCwgMikgK1xuICAgICAgICAgICAgICAgICAgIE1hdGgucG93KHAuY2FudmFzeSAtIGNvbnRleHQuZHJhZ0VuZFksIDIpO1xuICAgIGlmICghaXNOYU4oZGlzdGFuY2UpICYmXG4gICAgICAgIChjbG9zZXN0SWR4ID09IC0xIHx8IGRpc3RhbmNlIDwgY2xvc2VzdERpc3RhbmNlKSkge1xuICAgICAgY2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICBjbG9zZXN0SWR4ID0gaTtcbiAgICB9XG4gIH1cblxuICAvLyBBbGxvdyBhbnkgY2xpY2sgd2l0aGluIHR3byBwaXhlbHMgb2YgdGhlIGRvdC5cbiAgdmFyIHJhZGl1cyA9IGcuZ2V0TnVtZXJpY09wdGlvbignaGlnaGxpZ2h0Q2lyY2xlU2l6ZScpICsgMjtcbiAgaWYgKGNsb3Nlc3REaXN0YW5jZSA8PSByYWRpdXMgKiByYWRpdXMpIHtcbiAgICBzZWxlY3RlZFBvaW50ID0gZy5zZWxQb2ludHNfW2Nsb3Nlc3RJZHhdO1xuICB9XG5cbiAgaWYgKHNlbGVjdGVkUG9pbnQpIHtcbiAgICB2YXIgZSA9IHtcbiAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICBwb2ludDogc2VsZWN0ZWRQb2ludCxcbiAgICAgIGNhbnZhc3g6IGNvbnRleHQuZHJhZ0VuZFgsXG4gICAgICBjYW52YXN5OiBjb250ZXh0LmRyYWdFbmRZXG4gICAgfTtcbiAgICB2YXIgZGVmYXVsdFByZXZlbnRlZCA9IGcuY2FzY2FkZUV2ZW50c18oJ3BvaW50Q2xpY2snLCBlKTtcbiAgICBpZiAoZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgLy8gTm90ZTogdGhpcyBhbHNvIHByZXZlbnRzIGNsaWNrIC8gY2xpY2tDYWxsYmFjayBmcm9tIGZpcmluZy5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHBvaW50Q2xpY2tDYWxsYmFjaykge1xuICAgICAgcG9pbnRDbGlja0NhbGxiYWNrLmNhbGwoZywgZXZlbnQsIHNlbGVjdGVkUG9pbnQpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBlID0ge1xuICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgeHZhbDogZy5sYXN0eF8sICAvLyBjbG9zZXN0IHBvaW50IGJ5IHggdmFsdWVcbiAgICBwdHM6IGcuc2VsUG9pbnRzXyxcbiAgICBjYW52YXN4OiBjb250ZXh0LmRyYWdFbmRYLFxuICAgIGNhbnZhc3k6IGNvbnRleHQuZHJhZ0VuZFlcbiAgfTtcbiAgaWYgKCFnLmNhc2NhZGVFdmVudHNfKCdjbGljaycsIGUpKSB7XG4gICAgaWYgKGNsaWNrQ2FsbGJhY2spIHtcbiAgICAgIC8vIFRPRE8oZGFudmspOiBwYXNzIGFsb25nIG1vcmUgaW5mbyBhYm91dCB0aGUgcG9pbnRzLCBlLmcuICd4J1xuICAgICAgY2xpY2tDYWxsYmFjay5jYWxsKGcsIGV2ZW50LCBnLmxhc3R4XywgZy5zZWxQb2ludHNfKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbGVkIGluIHJlc3BvbnNlIHRvIGFuIGludGVyYWN0aW9uIG1vZGVsIG9wZXJhdGlvbiB0aGF0XG4gKiByZXNwb25kcyB0byBhbiBldmVudCB0aGF0IHBlcmZvcm1zIGEgem9vbSBiYXNlZCBvbiBwcmV2aW91c2x5IGRlZmluZWRcbiAqIGJvdW5kcy4uXG4gKlxuICogSXQncyB1c2VkIGluIHRoZSBkZWZhdWx0IGNhbGxiYWNrIGZvciBcIm1vdXNldXBcIiBvcGVyYXRpb25zLlxuICogQ3VzdG9tIGludGVyYWN0aW9uIG1vZGVsIGJ1aWxkZXJzIGNhbiB1c2UgaXQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdFxuICogem9vbWluZyBiZWhhdmlvci5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCB0aGUgZXZlbnQgb2JqZWN0IHdoaWNoIGxlZCB0byB0aGUgZW5kWm9vbSBjYWxsLlxuICogQHBhcmFtIHtEeWdyYXBofSBnIFRoZSBkeWdyYXBoIG9uIHdoaWNoIHRvIGVuZCB0aGUgem9vbS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IFRoZSBkcmFnZ2luZyBjb250ZXh0IG9iamVjdCAod2l0aFxuICogICAgIGRyYWdTdGFydFgvZHJhZ1N0YXJ0WS9ldGMuIHByb3BlcnRpZXMpLiBUaGlzIGZ1bmN0aW9uIG1vZGlmaWVzIHRoZVxuICogICAgIGNvbnRleHQuXG4gKi9cbkR5Z3JhcGhJbnRlcmFjdGlvbi5lbmRab29tID0gZnVuY3Rpb24oZXZlbnQsIGcsIGNvbnRleHQpIHtcbiAgZy5jbGVhclpvb21SZWN0XygpO1xuICBjb250ZXh0LmlzWm9vbWluZyA9IGZhbHNlO1xuICBEeWdyYXBoSW50ZXJhY3Rpb24ubWF5YmVUcmVhdE1vdXNlT3BBc0NsaWNrKGV2ZW50LCBnLCBjb250ZXh0KTtcblxuICAvLyBUaGUgem9vbSByZWN0YW5nbGUgaXMgdmlzaWJseSBjbGlwcGVkIHRvIHRoZSBwbG90IGFyZWEsIHNvIGl0cyBiZWhhdmlvclxuICAvLyBzaG91bGQgYmUgYXMgd2VsbC5cbiAgLy8gU2VlIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL2FyY2hpdmUvcC9keWdyYXBocy9pc3N1ZXMvMjgwXG4gIHZhciBwbG90QXJlYSA9IGcuZ2V0QXJlYSgpO1xuICBpZiAoY29udGV4dC5yZWdpb25XaWR0aCA+PSAxMCAmJlxuICAgICAgY29udGV4dC5kcmFnRGlyZWN0aW9uID09IHV0aWxzLkhPUklaT05UQUwpIHtcbiAgICB2YXIgbGVmdCA9IE1hdGgubWluKGNvbnRleHQuZHJhZ1N0YXJ0WCwgY29udGV4dC5kcmFnRW5kWCksXG4gICAgICAgIHJpZ2h0ID0gTWF0aC5tYXgoY29udGV4dC5kcmFnU3RhcnRYLCBjb250ZXh0LmRyYWdFbmRYKTtcbiAgICBsZWZ0ID0gTWF0aC5tYXgobGVmdCwgcGxvdEFyZWEueCk7XG4gICAgcmlnaHQgPSBNYXRoLm1pbihyaWdodCwgcGxvdEFyZWEueCArIHBsb3RBcmVhLncpO1xuICAgIGlmIChsZWZ0IDwgcmlnaHQpIHtcbiAgICAgIGcuZG9ab29tWF8obGVmdCwgcmlnaHQpO1xuICAgIH1cbiAgICBjb250ZXh0LmNhbmNlbE5leHREYmxjbGljayA9IHRydWU7XG4gIH0gZWxzZSBpZiAoY29udGV4dC5yZWdpb25IZWlnaHQgPj0gMTAgJiZcbiAgICAgICAgICAgICBjb250ZXh0LmRyYWdEaXJlY3Rpb24gPT0gdXRpbHMuVkVSVElDQUwpIHtcbiAgICB2YXIgdG9wID0gTWF0aC5taW4oY29udGV4dC5kcmFnU3RhcnRZLCBjb250ZXh0LmRyYWdFbmRZKSxcbiAgICAgICAgYm90dG9tID0gTWF0aC5tYXgoY29udGV4dC5kcmFnU3RhcnRZLCBjb250ZXh0LmRyYWdFbmRZKTtcbiAgICB0b3AgPSBNYXRoLm1heCh0b3AsIHBsb3RBcmVhLnkpO1xuICAgIGJvdHRvbSA9IE1hdGgubWluKGJvdHRvbSwgcGxvdEFyZWEueSArIHBsb3RBcmVhLmgpO1xuICAgIGlmICh0b3AgPCBib3R0b20pIHtcbiAgICAgIGcuZG9ab29tWV8odG9wLCBib3R0b20pO1xuICAgIH1cbiAgICBjb250ZXh0LmNhbmNlbE5leHREYmxjbGljayA9IHRydWU7XG4gIH1cbiAgY29udGV4dC5kcmFnU3RhcnRYID0gbnVsbDtcbiAgY29udGV4dC5kcmFnU3RhcnRZID0gbnVsbDtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0VG91Y2ggPSBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAgLy8gdG91Y2ggYnJvd3NlcnMgYXJlIGFsbCBuaWNlLlxuICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgLy8gSWYgdGhlIHVzZXIgZXZlciBwdXRzIHR3byBmaW5nZXJzIGRvd24sIGl0J3Mgbm90IGEgZG91YmxlIHRhcC5cbiAgICBjb250ZXh0LnN0YXJ0VGltZUZvckRvdWJsZVRhcE1zID0gbnVsbDtcbiAgfVxuXG4gIHZhciB0b3VjaGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQudG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0ID0gZXZlbnQudG91Y2hlc1tpXTtcbiAgICB2YXIgcmVjdCA9IHQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgLy8gd2UgZGlzcGVuc2Ugd2l0aCAnZHJhZ0dldFhfJyBiZWNhdXNlIGFsbCB0b3VjaEJyb3dzZXJzIHN1cHBvcnQgcGFnZVhcbiAgICB0b3VjaGVzLnB1c2goe1xuICAgICAgcGFnZVg6IHQucGFnZVgsXG4gICAgICBwYWdlWTogdC5wYWdlWSxcbiAgICAgIGRhdGFYOiBnLnRvRGF0YVhDb29yZCh0LmNsaWVudFggLSByZWN0LmxlZnQpLFxuICAgICAgZGF0YVk6IGcudG9EYXRhWUNvb3JkKHQuY2xpZW50WSAtIHJlY3QudG9wKVxuICAgICAgLy8gaWRlbnRpZmllcjogdC5pZGVudGlmaWVyXG4gICAgfSk7XG4gIH1cbiAgY29udGV4dC5pbml0aWFsVG91Y2hlcyA9IHRvdWNoZXM7XG5cbiAgaWYgKHRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAvLyBUaGlzIGlzIGp1c3QgYSBzd2lwZS5cbiAgICBjb250ZXh0LmluaXRpYWxQaW5jaENlbnRlciA9IHRvdWNoZXNbMF07XG4gICAgY29udGV4dC50b3VjaERpcmVjdGlvbnMgPSB7IHg6IHRydWUsIHk6IHRydWUgfTtcbiAgfSBlbHNlIGlmICh0b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgLy8gSXQncyBiZWNvbWUgYSBwaW5jaCFcbiAgICAvLyBJbiBjYXNlIHRoZXJlIGFyZSAzKyB0b3VjaGVzLCB3ZSBpZ25vcmUgYWxsIGJ1dCB0aGUgXCJmaXJzdFwiIHR3by5cblxuICAgIC8vIG9ubHkgc2NyZWVuIGNvb3JkaW5hdGVzIGNhbiBiZSBhdmVyYWdlZCAoZGF0YSBjb29yZHMgY291bGQgYmUgbG9nIHNjYWxlKS5cbiAgICBjb250ZXh0LmluaXRpYWxQaW5jaENlbnRlciA9IHtcbiAgICAgIHBhZ2VYOiAwLjUgKiAodG91Y2hlc1swXS5wYWdlWCArIHRvdWNoZXNbMV0ucGFnZVgpLFxuICAgICAgcGFnZVk6IDAuNSAqICh0b3VjaGVzWzBdLnBhZ2VZICsgdG91Y2hlc1sxXS5wYWdlWSksXG5cbiAgICAgIC8vIFRPRE8oZGFudmspOiByZW1vdmVcbiAgICAgIGRhdGFYOiAwLjUgKiAodG91Y2hlc1swXS5kYXRhWCArIHRvdWNoZXNbMV0uZGF0YVgpLFxuICAgICAgZGF0YVk6IDAuNSAqICh0b3VjaGVzWzBdLmRhdGFZICsgdG91Y2hlc1sxXS5kYXRhWSlcbiAgICB9O1xuXG4gICAgLy8gTWFrZSBwaW5jaGVzIGluIGEgNDUtZGVncmVlIHN3YXRoIGFyb3VuZCBlaXRoZXIgYXhpcyAxLWRpbWVuc2lvbmFsIHpvb21zLlxuICAgIHZhciBpbml0aWFsQW5nbGUgPSAxODAgLyBNYXRoLlBJICogTWF0aC5hdGFuMihcbiAgICAgICAgY29udGV4dC5pbml0aWFsUGluY2hDZW50ZXIucGFnZVkgLSB0b3VjaGVzWzBdLnBhZ2VZLFxuICAgICAgICB0b3VjaGVzWzBdLnBhZ2VYIC0gY29udGV4dC5pbml0aWFsUGluY2hDZW50ZXIucGFnZVgpO1xuXG4gICAgLy8gdXNlIHN5bW1ldHJ5IHRvIGdldCBpdCBpbnRvIHRoZSBmaXJzdCBxdWFkcmFudC5cbiAgICBpbml0aWFsQW5nbGUgPSBNYXRoLmFicyhpbml0aWFsQW5nbGUpO1xuICAgIGlmIChpbml0aWFsQW5nbGUgPiA5MCkgaW5pdGlhbEFuZ2xlID0gOTAgLSBpbml0aWFsQW5nbGU7XG5cbiAgICBjb250ZXh0LnRvdWNoRGlyZWN0aW9ucyA9IHtcbiAgICAgIHg6IChpbml0aWFsQW5nbGUgPCAoOTAgLSA0NS8yKSksXG4gICAgICB5OiAoaW5pdGlhbEFuZ2xlID4gNDUvMilcbiAgICB9O1xuICB9XG5cbiAgLy8gc2F2ZSB0aGUgZnVsbCB4ICYgeSByYW5nZXMuXG4gIGNvbnRleHQuaW5pdGlhbFJhbmdlID0ge1xuICAgIHg6IGcueEF4aXNSYW5nZSgpLFxuICAgIHk6IGcueUF4aXNSYW5nZSgpXG4gIH07XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhJbnRlcmFjdGlvbi5tb3ZlVG91Y2ggPSBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICAvLyBJZiB0aGUgdGFwIG1vdmVzLCB0aGVuIGl0J3MgZGVmaW5pdGVseSBub3QgcGFydCBvZiBhIGRvdWJsZS10YXAuXG4gIGNvbnRleHQuc3RhcnRUaW1lRm9yRG91YmxlVGFwTXMgPSBudWxsO1xuXG4gIHZhciBpLCB0b3VjaGVzID0gW107XG4gIGZvciAoaSA9IDA7IGkgPCBldmVudC50b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHQgPSBldmVudC50b3VjaGVzW2ldO1xuICAgIHRvdWNoZXMucHVzaCh7XG4gICAgICBwYWdlWDogdC5wYWdlWCxcbiAgICAgIHBhZ2VZOiB0LnBhZ2VZXG4gICAgfSk7XG4gIH1cbiAgdmFyIGluaXRpYWxUb3VjaGVzID0gY29udGV4dC5pbml0aWFsVG91Y2hlcztcblxuICB2YXIgY19ub3c7XG5cbiAgLy8gb2xkIGFuZCBuZXcgY2VudGVycy5cbiAgdmFyIGNfaW5pdCA9IGNvbnRleHQuaW5pdGlhbFBpbmNoQ2VudGVyO1xuICBpZiAodG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgIGNfbm93ID0gdG91Y2hlc1swXTtcbiAgfSBlbHNlIHtcbiAgICBjX25vdyA9IHtcbiAgICAgIHBhZ2VYOiAwLjUgKiAodG91Y2hlc1swXS5wYWdlWCArIHRvdWNoZXNbMV0ucGFnZVgpLFxuICAgICAgcGFnZVk6IDAuNSAqICh0b3VjaGVzWzBdLnBhZ2VZICsgdG91Y2hlc1sxXS5wYWdlWSlcbiAgICB9O1xuICB9XG5cbiAgLy8gdGhpcyBpcyB0aGUgXCJzd2lwZVwiIGNvbXBvbmVudFxuICAvLyB3ZSB0b3NzIGl0IG91dCBmb3Igbm93LCBidXQgY291bGQgdXNlIGl0IGluIHRoZSBmdXR1cmUuXG4gIHZhciBzd2lwZSA9IHtcbiAgICBwYWdlWDogY19ub3cucGFnZVggLSBjX2luaXQucGFnZVgsXG4gICAgcGFnZVk6IGNfbm93LnBhZ2VZIC0gY19pbml0LnBhZ2VZXG4gIH07XG4gIHZhciBkYXRhV2lkdGggPSBjb250ZXh0LmluaXRpYWxSYW5nZS54WzFdIC0gY29udGV4dC5pbml0aWFsUmFuZ2UueFswXTtcbiAgdmFyIGRhdGFIZWlnaHQgPSBjb250ZXh0LmluaXRpYWxSYW5nZS55WzBdIC0gY29udGV4dC5pbml0aWFsUmFuZ2UueVsxXTtcbiAgc3dpcGUuZGF0YVggPSAoc3dpcGUucGFnZVggLyBnLnBsb3R0ZXJfLmFyZWEudykgKiBkYXRhV2lkdGg7XG4gIHN3aXBlLmRhdGFZID0gKHN3aXBlLnBhZ2VZIC8gZy5wbG90dGVyXy5hcmVhLmgpICogZGF0YUhlaWdodDtcbiAgdmFyIHhTY2FsZSwgeVNjYWxlO1xuXG4gIC8vIFRoZSByZXNpZHVhbCBiaXRzIGFyZSB1c3VhbGx5IHNwbGl0IGludG8gc2NhbGUgJiByb3RhdGUgYml0cywgYnV0IHdlIHNwbGl0XG4gIC8vIHRoZW0gaW50byB4LXNjYWxlIGFuZCB5LXNjYWxlIGJpdHMuXG4gIGlmICh0b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgeFNjYWxlID0gMS4wO1xuICAgIHlTY2FsZSA9IDEuMDtcbiAgfSBlbHNlIGlmICh0b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgdmFyIGluaXRIYWxmV2lkdGggPSAoaW5pdGlhbFRvdWNoZXNbMV0ucGFnZVggLSBjX2luaXQucGFnZVgpO1xuICAgIHhTY2FsZSA9ICh0b3VjaGVzWzFdLnBhZ2VYIC0gY19ub3cucGFnZVgpIC8gaW5pdEhhbGZXaWR0aDtcblxuICAgIHZhciBpbml0SGFsZkhlaWdodCA9IChpbml0aWFsVG91Y2hlc1sxXS5wYWdlWSAtIGNfaW5pdC5wYWdlWSk7XG4gICAgeVNjYWxlID0gKHRvdWNoZXNbMV0ucGFnZVkgLSBjX25vdy5wYWdlWSkgLyBpbml0SGFsZkhlaWdodDtcbiAgfVxuXG4gIC8vIENsaXAgc2NhbGluZyB0byBbMS84LCA4XSB0byBwcmV2ZW50IHRvbyBtdWNoIGJsb3d1cC5cbiAgeFNjYWxlID0gTWF0aC5taW4oOCwgTWF0aC5tYXgoMC4xMjUsIHhTY2FsZSkpO1xuICB5U2NhbGUgPSBNYXRoLm1pbig4LCBNYXRoLm1heCgwLjEyNSwgeVNjYWxlKSk7XG5cbiAgdmFyIGRpZFpvb20gPSBmYWxzZTtcbiAgaWYgKGNvbnRleHQudG91Y2hEaXJlY3Rpb25zLngpIHtcbiAgICB2YXIgY0ZhY3RvciA9IGNfaW5pdC5kYXRhWCAtIHN3aXBlLmRhdGFYIC8geFNjYWxlO1xuICAgIGcuZGF0ZVdpbmRvd18gPSBbXG4gICAgICBjRmFjdG9yICsgKGNvbnRleHQuaW5pdGlhbFJhbmdlLnhbMF0gLSBjX2luaXQuZGF0YVgpIC8geFNjYWxlLFxuICAgICAgY0ZhY3RvciArIChjb250ZXh0LmluaXRpYWxSYW5nZS54WzFdIC0gY19pbml0LmRhdGFYKSAvIHhTY2FsZVxuICAgIF07XG4gICAgZGlkWm9vbSA9IHRydWU7XG4gIH1cblxuICBpZiAoY29udGV4dC50b3VjaERpcmVjdGlvbnMueSkge1xuICAgIGZvciAoaSA9IDA7IGkgPCAxICAvKmcuYXhlc18ubGVuZ3RoKi87IGkrKykge1xuICAgICAgdmFyIGF4aXMgPSBnLmF4ZXNfW2ldO1xuICAgICAgdmFyIGxvZ3NjYWxlID0gZy5hdHRyaWJ1dGVzXy5nZXRGb3JBeGlzKFwibG9nc2NhbGVcIiwgaSk7XG4gICAgICBpZiAobG9nc2NhbGUpIHtcbiAgICAgICAgLy8gVE9ETyhkYW52ayk6IGltcGxlbWVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGNGYWN0b3IgPSBjX2luaXQuZGF0YVkgLSBzd2lwZS5kYXRhWSAvIHlTY2FsZTtcbiAgICAgICAgYXhpcy52YWx1ZVJhbmdlID0gW1xuICAgICAgICAgIGNGYWN0b3IgKyAoY29udGV4dC5pbml0aWFsUmFuZ2UueVswXSAtIGNfaW5pdC5kYXRhWSkgLyB5U2NhbGUsXG4gICAgICAgICAgY0ZhY3RvciArIChjb250ZXh0LmluaXRpYWxSYW5nZS55WzFdIC0gY19pbml0LmRhdGFZKSAvIHlTY2FsZVxuICAgICAgICBdO1xuICAgICAgICBkaWRab29tID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnLmRyYXdHcmFwaF8oZmFsc2UpO1xuXG4gIC8vIFdlIG9ubHkgY2FsbCB6b29tQ2FsbGJhY2sgb24gem9vbXMsIG5vdCBwYW5zLCB0byBtaXJyb3IgZGVza3RvcCBiZWhhdmlvci5cbiAgaWYgKGRpZFpvb20gJiYgdG91Y2hlcy5sZW5ndGggPiAxICYmIGcuZ2V0RnVuY3Rpb25PcHRpb24oJ3pvb21DYWxsYmFjaycpKSB7XG4gICAgdmFyIHZpZXdXaW5kb3cgPSBnLnhBeGlzUmFuZ2UoKTtcbiAgICBnLmdldEZ1bmN0aW9uT3B0aW9uKFwiem9vbUNhbGxiYWNrXCIpLmNhbGwoZywgdmlld1dpbmRvd1swXSwgdmlld1dpbmRvd1sxXSwgZy55QXhpc1JhbmdlcygpKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoSW50ZXJhY3Rpb24uZW5kVG91Y2ggPSBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggIT09IDApIHtcbiAgICAvLyB0aGlzIGlzIGVmZmVjdGl2ZWx5IGEgXCJyZXNldFwiXG4gICAgRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0VG91Y2goZXZlbnQsIGcsIGNvbnRleHQpO1xuICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgLy8gQ291bGQgYmUgcGFydCBvZiBhIFwiZG91YmxlIHRhcFwiXG4gICAgLy8gVGhlIGhldXJpc3RpYyBoZXJlIGlzIHRoYXQgaXQncyBhIGRvdWJsZS10YXAgaWYgdGhlIHR3byB0b3VjaGVuZCBldmVudHNcbiAgICAvLyBvY2N1ciB3aXRoaW4gNTAwbXMgYW5kIHdpdGhpbiBhIDUweDUwIHBpeGVsIGJveC5cbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdmFyIHQgPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgICBpZiAoY29udGV4dC5zdGFydFRpbWVGb3JEb3VibGVUYXBNcyAmJlxuICAgICAgICBub3cgLSBjb250ZXh0LnN0YXJ0VGltZUZvckRvdWJsZVRhcE1zIDwgNTAwICYmXG4gICAgICAgIGNvbnRleHQuZG91YmxlVGFwWCAmJiBNYXRoLmFicyhjb250ZXh0LmRvdWJsZVRhcFggLSB0LnNjcmVlblgpIDwgNTAgJiZcbiAgICAgICAgY29udGV4dC5kb3VibGVUYXBZICYmIE1hdGguYWJzKGNvbnRleHQuZG91YmxlVGFwWSAtIHQuc2NyZWVuWSkgPCA1MCkge1xuICAgICAgZy5yZXNldFpvb20oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGV4dC5zdGFydFRpbWVGb3JEb3VibGVUYXBNcyA9IG5vdztcbiAgICAgIGNvbnRleHQuZG91YmxlVGFwWCA9IHQuc2NyZWVuWDtcbiAgICAgIGNvbnRleHQuZG91YmxlVGFwWSA9IHQuc2NyZWVuWTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIERldGVybWluZSB0aGUgZGlzdGFuY2UgZnJvbSB4IHRvIFtsZWZ0LCByaWdodF0uXG52YXIgZGlzdGFuY2VGcm9tSW50ZXJ2YWwgPSBmdW5jdGlvbih4LCBsZWZ0LCByaWdodCkge1xuICBpZiAoeCA8IGxlZnQpIHtcbiAgICByZXR1cm4gbGVmdCAtIHg7XG4gIH0gZWxzZSBpZiAoeCA+IHJpZ2h0KSB7XG4gICAgcmV0dXJuIHggLSByaWdodDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gMDtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgcGl4ZWxzIGJ5IHdoaWNoIHRoZSBldmVudCBoYXBwZW5zIGZyb20gdGhlIG5lYXJlc3RcbiAqIGVkZ2Ugb2YgdGhlIGNoYXJ0LiBGb3IgZXZlbnRzIGluIHRoZSBpbnRlcmlvciBvZiB0aGUgY2hhcnQsIHRoaXMgcmV0dXJucyB6ZXJvLlxuICovXG52YXIgZGlzdGFuY2VGcm9tQ2hhcnQgPSBmdW5jdGlvbihldmVudCwgZykge1xuICB2YXIgY2hhcnRQb3MgPSB1dGlscy5maW5kUG9zKGcuY2FudmFzXyk7XG4gIHZhciBib3ggPSB7XG4gICAgbGVmdDogY2hhcnRQb3MueCxcbiAgICByaWdodDogY2hhcnRQb3MueCArIGcuY2FudmFzXy5vZmZzZXRXaWR0aCxcbiAgICB0b3A6IGNoYXJ0UG9zLnksXG4gICAgYm90dG9tOiBjaGFydFBvcy55ICsgZy5jYW52YXNfLm9mZnNldEhlaWdodFxuICB9O1xuXG4gIHZhciBwdCA9IHtcbiAgICB4OiB1dGlscy5wYWdlWChldmVudCksXG4gICAgeTogdXRpbHMucGFnZVkoZXZlbnQpXG4gIH07XG5cbiAgdmFyIGR4ID0gZGlzdGFuY2VGcm9tSW50ZXJ2YWwocHQueCwgYm94LmxlZnQsIGJveC5yaWdodCksXG4gICAgICBkeSA9IGRpc3RhbmNlRnJvbUludGVydmFsKHB0LnksIGJveC50b3AsIGJveC5ib3R0b20pO1xuICByZXR1cm4gTWF0aC5tYXgoZHgsIGR5KTtcbn07XG5cbi8qKlxuICogRGVmYXVsdCBpbnRlcmF0aW9uIG1vZGVsIGZvciBkeWdyYXBocy4gWW91IGNhbiByZWZlciB0byBzcGVjaWZpYyBlbGVtZW50cyBvZlxuICogdGhpcyB3aGVuIGNvbnN0cnVjdGluZyB5b3VyIG93biBpbnRlcmFjdGlvbiBtb2RlbCwgZS5nLjpcbiAqIGcudXBkYXRlT3B0aW9ucygge1xuICogICBpbnRlcmFjdGlvbk1vZGVsOiB7XG4gKiAgICAgbW91c2Vkb3duOiBEeWdyYXBoSW50ZXJhY3Rpb24uZGVmYXVsdEludGVyYWN0aW9uTW9kZWwubW91c2Vkb3duXG4gKiAgIH1cbiAqIH0gKTtcbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLmRlZmF1bHRNb2RlbCA9IHtcbiAgLy8gVHJhY2sgdGhlIGJlZ2lubmluZyBvZiBkcmFnIGV2ZW50c1xuICBtb3VzZWRvd246IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gICAgLy8gUmlnaHQtY2xpY2sgc2hvdWxkIG5vdCBpbml0aWF0ZSBhIHpvb20uXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAmJiBldmVudC5idXR0b24gPT0gMikgcmV0dXJuO1xuXG4gICAgY29udGV4dC5pbml0aWFsaXplTW91c2VEb3duKGV2ZW50LCBnLCBjb250ZXh0KTtcblxuICAgIGlmIChldmVudC5hbHRLZXkgfHwgZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgIER5Z3JhcGhJbnRlcmFjdGlvbi5zdGFydFBhbihldmVudCwgZywgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIER5Z3JhcGhJbnRlcmFjdGlvbi5zdGFydFpvb20oZXZlbnQsIGcsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIC8vIE5vdGU6IHdlIHJlZ2lzdGVyIG1vdXNlbW92ZS9tb3VzZXVwIG9uIGRvY3VtZW50IHRvIGFsbG93IHNvbWUgbGVld2F5IGZvclxuICAgIC8vIGV2ZW50cyB0byBtb3ZlIG91dHNpZGUgb2YgdGhlIGNoYXJ0LiBJbnRlcmFjdGlvbiBtb2RlbCBldmVudHMgZ2V0XG4gICAgLy8gcmVnaXN0ZXJlZCBvbiB0aGUgY2FudmFzLCB3aGljaCBpcyB0b28gc21hbGwgdG8gYWxsb3cgdGhpcy5cbiAgICB2YXIgbW91c2Vtb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChjb250ZXh0LmlzWm9vbWluZykge1xuICAgICAgICAvLyBXaGVuIHRoZSBtb3VzZSBtb3ZlcyA+MjAwcHggZnJvbSB0aGUgY2hhcnQgZWRnZSwgY2FuY2VsIHRoZSB6b29tLlxuICAgICAgICB2YXIgZCA9IGRpc3RhbmNlRnJvbUNoYXJ0KGV2ZW50LCBnKTtcbiAgICAgICAgaWYgKGQgPCBEUkFHX0VER0VfTUFSR0lOKSB7XG4gICAgICAgICAgRHlncmFwaEludGVyYWN0aW9uLm1vdmVab29tKGV2ZW50LCBnLCBjb250ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29udGV4dC5kcmFnRW5kWCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGV4dC5kcmFnRW5kWCA9IG51bGw7XG4gICAgICAgICAgICBjb250ZXh0LmRyYWdFbmRZID0gbnVsbDtcbiAgICAgICAgICAgIGcuY2xlYXJab29tUmVjdF8oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5pc1Bhbm5pbmcpIHtcbiAgICAgICAgRHlncmFwaEludGVyYWN0aW9uLm1vdmVQYW4oZXZlbnQsIGcsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH07XG4gICAgdmFyIG1vdXNldXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGNvbnRleHQuaXNab29taW5nKSB7XG4gICAgICAgIGlmIChjb250ZXh0LmRyYWdFbmRYICE9PSBudWxsKSB7XG4gICAgICAgICAgRHlncmFwaEludGVyYWN0aW9uLmVuZFpvb20oZXZlbnQsIGcsIGNvbnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIER5Z3JhcGhJbnRlcmFjdGlvbi5tYXliZVRyZWF0TW91c2VPcEFzQ2xpY2soZXZlbnQsIGcsIGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNvbnRleHQuaXNQYW5uaW5nKSB7XG4gICAgICAgIER5Z3JhcGhJbnRlcmFjdGlvbi5lbmRQYW4oZXZlbnQsIGcsIGNvbnRleHQpO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5yZW1vdmVFdmVudChkb2N1bWVudCwgJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XG4gICAgICB1dGlscy5yZW1vdmVFdmVudChkb2N1bWVudCwgJ21vdXNldXAnLCBtb3VzZXVwKTtcbiAgICAgIGNvbnRleHQuZGVzdHJveSgpO1xuICAgIH07XG5cbiAgICBnLmFkZEFuZFRyYWNrRXZlbnQoZG9jdW1lbnQsICdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xuICAgIGcuYWRkQW5kVHJhY2tFdmVudChkb2N1bWVudCwgJ21vdXNldXAnLCBtb3VzZXVwKTtcbiAgfSxcbiAgd2lsbERlc3Ryb3lDb250ZXh0TXlzZWxmOiB0cnVlLFxuXG4gIHRvdWNoc3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gICAgRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0VG91Y2goZXZlbnQsIGcsIGNvbnRleHQpO1xuICB9LFxuICB0b3VjaG1vdmU6IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gICAgRHlncmFwaEludGVyYWN0aW9uLm1vdmVUb3VjaChldmVudCwgZywgY29udGV4dCk7XG4gIH0sXG4gIHRvdWNoZW5kOiBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICAgIER5Z3JhcGhJbnRlcmFjdGlvbi5lbmRUb3VjaChldmVudCwgZywgY29udGV4dCk7XG4gIH0sXG5cbiAgLy8gRGlzYWJsZSB6b29taW5nIG91dCBpZiBwYW5uaW5nLlxuICBkYmxjbGljazogZnVuY3Rpb24oZXZlbnQsIGcsIGNvbnRleHQpIHtcbiAgICBpZiAoY29udGV4dC5jYW5jZWxOZXh0RGJsY2xpY2spIHtcbiAgICAgIGNvbnRleHQuY2FuY2VsTmV4dERibGNsaWNrID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gR2l2ZSBwbHVnaW5zIGEgY2hhbmNlIHRvIGdyYWIgdGhpcyBldmVudC5cbiAgICB2YXIgZSA9IHtcbiAgICAgIGNhbnZhc3g6IGNvbnRleHQuZHJhZ0VuZFgsXG4gICAgICBjYW52YXN5OiBjb250ZXh0LmRyYWdFbmRZLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICB9O1xuICAgIGlmIChnLmNhc2NhZGVFdmVudHNfKCdkYmxjbGljaycsIGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50LmFsdEtleSB8fCBldmVudC5zaGlmdEtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBnLnJlc2V0Wm9vbSgpO1xuICB9XG59O1xuXG4vKlxuRHlncmFwaC5ERUZBVUxUX0FUVFJTLmludGVyYWN0aW9uTW9kZWwgPSBEeWdyYXBoSW50ZXJhY3Rpb24uZGVmYXVsdE1vZGVsO1xuXG4vLyBvbGQgd2F5cyBvZiBhY2Nlc3NpbmcgdGhlc2UgbWV0aG9kcy9wcm9wZXJ0aWVzXG5EeWdyYXBoLmRlZmF1bHRJbnRlcmFjdGlvbk1vZGVsID0gRHlncmFwaEludGVyYWN0aW9uLmRlZmF1bHRNb2RlbDtcbkR5Z3JhcGguZW5kWm9vbSA9IER5Z3JhcGhJbnRlcmFjdGlvbi5lbmRab29tO1xuRHlncmFwaC5tb3ZlWm9vbSA9IER5Z3JhcGhJbnRlcmFjdGlvbi5tb3ZlWm9vbTtcbkR5Z3JhcGguc3RhcnRab29tID0gRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0Wm9vbTtcbkR5Z3JhcGguZW5kUGFuID0gRHlncmFwaEludGVyYWN0aW9uLmVuZFBhbjtcbkR5Z3JhcGgubW92ZVBhbiA9IER5Z3JhcGhJbnRlcmFjdGlvbi5tb3ZlUGFuO1xuRHlncmFwaC5zdGFydFBhbiA9IER5Z3JhcGhJbnRlcmFjdGlvbi5zdGFydFBhbjtcbiovXG5cbkR5Z3JhcGhJbnRlcmFjdGlvbi5ub25JbnRlcmFjdGl2ZU1vZGVsXyA9IHtcbiAgbW91c2Vkb3duOiBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICAgIGNvbnRleHQuaW5pdGlhbGl6ZU1vdXNlRG93bihldmVudCwgZywgY29udGV4dCk7XG4gIH0sXG4gIG1vdXNldXA6IER5Z3JhcGhJbnRlcmFjdGlvbi5tYXliZVRyZWF0TW91c2VPcEFzQ2xpY2tcbn07XG5cbi8vIERlZmF1bHQgaW50ZXJhY3Rpb24gbW9kZWwgd2hlbiB1c2luZyB0aGUgcmFuZ2Ugc2VsZWN0b3IuXG5EeWdyYXBoSW50ZXJhY3Rpb24uZHJhZ0lzUGFuSW50ZXJhY3Rpb25Nb2RlbCA9IHtcbiAgbW91c2Vkb3duOiBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICAgIGNvbnRleHQuaW5pdGlhbGl6ZU1vdXNlRG93bihldmVudCwgZywgY29udGV4dCk7XG4gICAgRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0UGFuKGV2ZW50LCBnLCBjb250ZXh0KTtcbiAgfSxcbiAgbW91c2Vtb3ZlOiBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICAgIGlmIChjb250ZXh0LmlzUGFubmluZykge1xuICAgICAgRHlncmFwaEludGVyYWN0aW9uLm1vdmVQYW4oZXZlbnQsIGcsIGNvbnRleHQpO1xuICAgIH1cbiAgfSxcbiAgbW91c2V1cDogZnVuY3Rpb24oZXZlbnQsIGcsIGNvbnRleHQpIHtcbiAgICBpZiAoY29udGV4dC5pc1Bhbm5pbmcpIHtcbiAgICAgIER5Z3JhcGhJbnRlcmFjdGlvbi5lbmRQYW4oZXZlbnQsIGcsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRHlncmFwaEludGVyYWN0aW9uO1xuIl0sIm1hcHBpbmdzIjoiQUFBQSxZQUFZOztBQUVaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUFBQSxNQUFBLENBQUFDLGNBQUEsQ0FBQUMsT0FBQTtFQUFBQyxLQUFBO0FBQUE7QUFBQUQsT0FBQTtBQUVBLElBQUFFLEtBQUEsR0FBQUMsdUJBQUEsQ0FBQUMsT0FBQTtBQUF5QyxTQUFBRCx3QkFBQUUsQ0FBQSxFQUFBQyxDQUFBLDZCQUFBQyxPQUFBLE1BQUFDLENBQUEsT0FBQUQsT0FBQSxJQUFBRSxDQUFBLE9BQUFGLE9BQUEsWUFBQUosdUJBQUEsWUFBQUEsd0JBQUFFLENBQUEsRUFBQUMsQ0FBQSxTQUFBQSxDQUFBLElBQUFELENBQUEsSUFBQUEsQ0FBQSxDQUFBSyxVQUFBLFNBQUFMLENBQUEsTUFBQU0sQ0FBQSxFQUFBQyxDQUFBLEVBQUFDLENBQUEsS0FBQUMsU0FBQSxtQkFBQVQsQ0FBQSxpQkFBQUEsQ0FBQSx1QkFBQUEsQ0FBQSx5QkFBQUEsQ0FBQSxTQUFBUSxDQUFBLE1BQUFGLENBQUEsR0FBQUwsQ0FBQSxHQUFBRyxDQUFBLEdBQUFELENBQUEsUUFBQUcsQ0FBQSxDQUFBSSxHQUFBLENBQUFWLENBQUEsVUFBQU0sQ0FB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