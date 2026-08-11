'use strict';

/**
 * @license
 * Copyright 2011 Paul Felix (paul.eric.felix@gmail.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */
/*global Dygraph:false,TouchEvent:false */

/**
 * @fileoverview This file contains the RangeSelector plugin used to provide
 * a timeline range selector widget for dygraphs.
 */

/*global Dygraph:false */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("../dygraph-utils"));
var _dygraphInteractionModel = _interopRequireDefault(require("../dygraph-interaction-model"));
var _iframeTarp = _interopRequireDefault(require("../iframe-tarp"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var rangeSelector = function rangeSelector() {
  this.hasTouchInterface_ = typeof TouchEvent != 'undefined';
  this.isMobileDevice_ = /mobile|android/gi.test(navigator.appVersion);
  this.interfaceCreated_ = false;
};
rangeSelector.prototype.toString = function () {
  return "RangeSelector Plugin";
};
rangeSelector.prototype.activate = function (dygraph) {
  this.dygraph_ = dygraph;
  if (this.getOption_('showRangeSelector')) {
    this.createInterface_();
  }
  return {
    layout: this.reserveSpace_,
    predraw: this.renderStaticLayer_,
    didDrawChart: this.renderInteractiveLayer_
  };
};
rangeSelector.prototype.destroy = function () {
  this.bgcanvas_ = null;
  this.fgcanvas_ = null;
  this.leftZoomHandle_ = null;
  this.rightZoomHandle_ = null;
};

//------------------------------------------------------------------
// Private methods
//------------------------------------------------------------------

rangeSelector.prototype.getOption_ = function (name, opt_series) {
  return this.dygraph_.getOption(name, opt_series);
};
rangeSelector.prototype.setDefaultOption_ = function (name, value) {
  this.dygraph_.attrs_[name] = value;
};

/**
 * @private
 * Creates the range selector elements and adds them to the graph.
 */
rangeSelector.prototype.createInterface_ = function () {
  this.createCanvases_();
  this.createZoomHandles_();
  this.initInteraction_();

  // Range selector and animatedZooms have a bad interaction. See issue 359.
  if (this.getOption_('animatedZooms')) {
    console.warn('Animated zooms and range selector are not compatible; disabling animatedZooms.');
    this.dygraph_.updateOptions({
      animatedZooms: false
    }, true);
  }
  this.interfaceCreated_ = true;
  this.addToGraph_();
};

/**
 * @private
 * Adds the range selector to the graph.
 */
rangeSelector.prototype.addToGraph_ = function () {
  var graphDiv = this.graphDiv_ = this.dygraph_.graphDiv;
  graphDiv.appendChild(this.bgcanvas_);
  graphDiv.appendChild(this.fgcanvas_);
  graphDiv.appendChild(this.leftZoomHandle_);
  graphDiv.appendChild(this.rightZoomHandle_);
};

/**
 * @private
 * Removes the range selector from the graph.
 */
rangeSelector.prototype.removeFromGraph_ = function () {
  var graphDiv = this.graphDiv_;
  graphDiv.removeChild(this.bgcanvas_);
  graphDiv.removeChild(this.fgcanvas_);
  graphDiv.removeChild(this.leftZoomHandle_);
  graphDiv.removeChild(this.rightZoomHandle_);
  this.graphDiv_ = null;
};

/**
 * @private
 * Called by Layout to allow range selector to reserve its space.
 */
rangeSelector.prototype.reserveSpace_ = function (e) {
  if (this.getOption_('showRangeSelector')) {
    e.reserveSpaceBottom(this.getOption_('rangeSelectorHeight') + 4);
  }
};

/**
 * @private
 * Renders the static portion of the range selector at the predraw stage.
 */
rangeSelector.prototype.renderStaticLayer_ = function () {
  if (!this.updateVisibility_()) {
    return;
  }
  this.resize_();
  this.drawStaticLayer_();
};

/**
 * @private
 * Renders the interactive portion of the range selector after the chart has been drawn.
 */
rangeSelector.prototype.renderInteractiveLayer_ = function () {
  if (!this.updateVisibility_() || this.isChangingRange_) {
    return;
  }
  this.placeZoomHandles_();
  this.drawInteractiveLayer_();
};

/**
 * @private
 * Check to see if the range selector is enabled/disabled and update visibility accordingly.
 */
rangeSelector.prototype.updateVisibility_ = function () {
  var enabled = this.getOption_('showRangeSelector');
  if (enabled) {
    if (!this.interfaceCreated_) {
      this.createInterface_();
    } else if (!this.graphDiv_ || !this.graphDiv_.parentNode) {
      this.addToGraph_();
    }
  } else if (this.graphDiv_) {
    this.removeFromGraph_();
    var dygraph = this.dygraph_;
    setTimeout(function () {
      dygraph.width_ = 0;
      dygraph.resize();
    }, 1);
  }
  return enabled;
};

/**
 * @private
 * Resizes the range selector.
 */
rangeSelector.prototype.resize_ = function () {
  function setElementRect(canvas, context, rect, pixelRatioOption) {
    var canvasScale = pixelRatioOption || utils.getContextPixelRatio(context);
    canvas.style.top = rect.y + 'px';
    canvas.style.left = rect.x + 'px';
    canvas.width = rect.w * canvasScale;
    canvas.height = rect.h * canvasScale;
    canvas.style.width = rect.w + 'px';
    canvas.style.height = rect.h + 'px';
    if (canvasScale != 1) {
      context.scale(canvasScale, canvasScale);
    }
  }
  var plotArea = this.dygraph_.layout_.getPlotArea();
  var xAxisLabelHeight = 0;
  if (this.dygraph_.getOptionForAxis('drawAxis', 'x')) {
    xAxisLabelHeight = this.getOption_('xAxisHeight') || this.getOption_('axisLabelFontSize') + 2 * this.getOption_('axisTickSize');
  }
  this.canvasRect_ = {
    x: plotArea.x,
    y: plotArea.y + plotArea.h + xAxisLabelHeight + 4,
    w: plotArea.w,
    h: this.getOption_('rangeSelectorHeight')
  };
  var pixelRatioOption = this.dygraph_.getNumericOption('pixelRatio');
  setElementRect(this.bgcanvas_, this.bgcanvas_ctx_, this.canvasRect_, pixelRatioOption);
  setElementRect(this.fgcanvas_, this.fgcanvas_ctx_, this.canvasRect_, pixelRatioOption);
};

/**
 * @private
 * Creates the background and foreground canvases.
 */
rangeSelector.prototype.createCanvases_ = function () {
  this.bgcanvas_ = utils.createCanvas();
  this.bgcanvas_.className = 'dygraph-rangesel-bgcanvas';
  this.bgcanvas_.style.position = 'absolute';
  this.bgcanvas_.style.zIndex = 9;
  this.bgcanvas_ctx_ = utils.getContext(this.bgcanvas_);
  this.fgcanvas_ = utils.createCanvas();
  this.fgcanvas_.className = 'dygraph-rangesel-fgcanvas';
  this.fgcanvas_.style.position = 'absolute';
  this.fgcanvas_.style.zIndex = 9;
  this.fgcanvas_.style.cursor = 'default';
  this.fgcanvas_ctx_ = utils.getContext(this.fgcanvas_);
};

/**
 * @private
 * Creates the zoom handle elements.
 */
rangeSelector.prototype.createZoomHandles_ = function () {
  var img = new Image();
  img.className = 'dygraph-rangesel-zoomhandle';
  img.style.position = 'absolute';
  img.style.zIndex = 10;
  img.style.visibility = 'hidden'; // Initially hidden so they don't show up in the wrong place.
  img.style.cursor = 'col-resize';
  // TODO: change image to more options
  img.width = 9;
  img.height = 16;
  img.src = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAAAkAAAAQCAYAAADESFVDAAAAAXNSR0IArs4c6QAAAAZiS0dEANAA' + 'zwDP4Z7KegAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9sHGw0cMqdt1UwAAAAZdEVYdENv' + 'bW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAaElEQVQoz+3SsRFAQBCF4Z9WJM8KCDVwownl' + '6YXsTmCUsyKGkZzcl7zkz3YLkypgAnreFmDEpHkIwVOMfpdi9CEEN2nGpFdwD03yEqDtOgCaun7s' + 'qSTDH32I1pQA2Pb9sZecAxc5r3IAb21d6878xsAAAAAASUVORK5CYII=';
  if (this.isMobileDevice_) {
    img.width *= 2;
    img.height *= 2;
  }
  this.leftZoomHandle_ = img;
  this.rightZoomHandle_ = img.cloneNode(false);
};

/**
 * @private
 * Sets up the interaction for the range selector.
 */
rangeSelector.prototype.initInteraction_ = function () {
  var self = this;
  var topElem = document;
  var clientXLast = 0;
  var handle = null;
  var isZooming = false;
  var isPanning = false;
  var dynamic = !this.isMobileDevice_;

  // We cover iframes during mouse interactions. See comments in
  // dygraph-utils.js for more info on why this is a good idea.
  var tarp = new _iframeTarp["default"]();

  // functions, defined below.  Defining them this way (rather than with
  // "function foo() {...}") makes JSHint happy.
  var toXDataWindow, onZoomStart, onZoom, _onZoomEnd, doZoom, isMouseInPanZone, onPanStart, onPan, _onPanEnd, doPan, onCanvasHover;

  // Touch event functions
  var onZoomHandleTouchEvent, onCanvasTouchEvent, addTouchEvents;
  toXDataWindow = function toXDataWindow(zoomHandleStatus) {
    var xDataLimits = self.dygraph_.xAxisExtremes();
    var fact = (xDataLimits[1] - xDataLimits[0]) / self.canvasRect_.w;
    var xDataMin = xDataLimits[0] + (zoomHandleStatus.leftHandlePos - self.canvasRect_.x) * fact;
    var xDataMax = xDataLimits[0] + (zoomHandleStatus.rightHandlePos - self.canvasRect_.x) * fact;
    return [xDataMin, xDataMax];
  };
  onZoomStart = function onZoomStart(e) {
    utils.cancelEvent(e);
    isZooming = true;
    clientXLast = e.clientX;
    handle = e.target ? e.target : e.srcElement;
    if (e.type === 'mousedown' || e.type === 'dragstart') {
      // These events are removed manually.
      utils.addEvent(topElem, 'mousemove', onZoom);
      utils.addEvent(topElem, 'mouseup', _onZoomEnd);
    }
    self.fgcanvas_.style.cursor = 'col-resize';
    tarp.cover();
    return true;
  };
  onZoom = function onZoom(e) {
    if (!isZooming) {
      return false;
    }
    utils.cancelEvent(e);
    var delX = e.clientX - clientXLast;
    if (Math.abs(delX) < 4) {
      return true;
    }
    clientXLast = e.clientX;

    // Move handle.
    var zoomHandleStatus = self.getZoomHandleStatus_();
    var newPos;
    if (handle == self.leftZoomHandle_) {
      newPos = zoomHandleStatus.leftHandlePos + delX;
      newPos = Math.min(newPos, zoomHandleStatus.rightHandlePos - handle.width - 3);
      newPos = Math.max(newPos, self.canvasRect_.x);
    } else {
      newPos = zoomHandleStatus.rightHandlePos + delX;
      newPos = Math.min(newPos, self.canvasRect_.x + self.canvasRect_.w);
      newPos = Math.max(newPos, zoomHandleStatus.leftHandlePos + handle.width + 3);
    }
    var halfHandleWidth = handle.width / 2;
    handle.style.left = newPos - halfHandleWidth + 'px';
    self.drawInteractiveLayer_();

    // Zoom on the fly.
    if (dynamic) {
      doZoom();
    }
    return true;
  };
  _onZoomEnd = function onZoomEnd(e) {
    if (!isZooming) {
      return false;
    }
    isZooming = false;
    tarp.uncover();
    utils.removeEvent(topElem, 'mousemove', onZoom);
    utils.removeEvent(topElem, 'mouseup', _onZoomEnd);
    self.fgcanvas_.style.cursor = 'default';

    // If on a slower device, zoom now.
    if (!dynamic) {
      doZoom();
    }
    return true;
  };
  doZoom = function doZoom() {
    try {
      var zoomHandleStatus = self.getZoomHandleStatus_();
      self.isChangingRange_ = true;
      if (!zoomHandleStatus.isZoomed) {
        self.dygraph_.resetZoom();
      } else {
        var xDataWindow = toXDataWindow(zoomHandleStatus);
        self.dygraph_.doZoomXDates_(xDataWindow[0], xDataWindow[1]);
      }
    } finally {
      self.isChangingRange_ = false;
    }
  };
  isMouseInPanZone = function isMouseInPanZone(e) {
    var rect = self.leftZoomHandle_.getBoundingClientRect();
    var leftHandleClientX = rect.left + rect.width / 2;
    rect = self.rightZoomHandle_.getBoundingClientRect();
    var rightHandleClientX = rect.left + rect.width / 2;
    return e.clientX > leftHandleClientX && e.clientX < rightHandleClientX;
  };
  onPanStart = function onPanStart(e) {
    if (!isPanning && isMouseInPanZone(e) && self.getZoomHandleStatus_().isZoomed) {
      utils.cancelEvent(e);
      isPanning = true;
      clientXLast = e.clientX;
      if (e.type === 'mousedown') {
        // These events are removed manually.
        utils.addEvent(topElem, 'mousemove', onPan);
        utils.addEvent(topElem, 'mouseup', _onPanEnd);
      }
      return true;
    }
    return false;
  };
  onPan = function onPan(e) {
    if (!isPanning) {
      return false;
    }
    utils.cancelEvent(e);
    var delX = e.clientX - clientXLast;
    if (Math.abs(delX) < 4) {
      return true;
    }
    clientXLast = e.clientX;

    // Move range view
    var zoomHandleStatus = self.getZoomHandleStatus_();
    var leftHandlePos = zoomHandleStatus.leftHandlePos;
    var rightHandlePos = zoomHandleStatus.rightHandlePos;
    var rangeSize = rightHandlePos - leftHandlePos;
    if (leftHandlePos + delX <= self.canvasRect_.x) {
      leftHandlePos = self.canvasRect_.x;
      rightHandlePos = leftHandlePos + rangeSize;
    } else if (rightHandlePos + delX >= self.canvasRect_.x + self.canvasRect_.w) {
      rightHandlePos = self.canvasRect_.x + self.canvasRect_.w;
      leftHandlePos = rightHandlePos - rangeSize;
    } else {
      leftHandlePos += delX;
      rightHandlePos += delX;
    }
    var halfHandleWidth = self.leftZoomHandle_.width / 2;
    self.leftZoomHandle_.style.left = leftHandlePos - halfHandleWidth + 'px';
    self.rightZoomHandle_.style.left = rightHandlePos - halfHandleWidth + 'px';
    self.drawInteractiveLayer_();

    // Do pan on the fly.
    if (dynamic) {
      doPan();
    }
    return true;
  };
  _onPanEnd = function onPanEnd(e) {
    if (!isPanning) {
      return false;
    }
    isPanning = false;
    utils.removeEvent(topElem, 'mousemove', onPan);
    utils.removeEvent(topElem, 'mouseup', _onPanEnd);
    // If on a slower device, do pan now.
    if (!dynamic) {
      doPan();
    }
    return true;
  };
  doPan = function doPan() {
    try {
      self.isChangingRange_ = true;
      self.dygraph_.dateWindow_ = toXDataWindow(self.getZoomHandleStatus_());
      self.dygraph_.drawGraph_(false);
    } finally {
      self.isChangingRange_ = false;
    }
  };
  onCanvasHover = function onCanvasHover(e) {
    if (isZooming || isPanning) {
      return;
    }
    var cursor = isMouseInPanZone(e) ? 'move' : 'default';
    if (cursor != self.fgcanvas_.style.cursor) {
      self.fgcanvas_.style.cursor = cursor;
    }
  };
  onZoomHandleTouchEvent = function onZoomHandleTouchEvent(e) {
    if (e.type == 'touchstart' && e.targetTouches.length == 1) {
      if (onZoomStart(e.targetTouches[0])) {
        utils.cancelEvent(e);
      }
    } else if (e.type == 'touchmove' && e.targetTouches.length == 1) {
      if (onZoom(e.targetTouches[0])) {
        utils.cancelEvent(e);
      }
    } else {
      _onZoomEnd(e);
    }
  };
  onCanvasTouchEvent = function onCanvasTouchEvent(e) {
    if (e.type == 'touchstart' && e.targetTouches.length == 1) {
      if (onPanStart(e.targetTouches[0])) {
        utils.cancelEvent(e);
      }
    } else if (e.type == 'touchmove' && e.targetTouches.length == 1) {
      if (onPan(e.targetTouches[0])) {
        utils.cancelEvent(e);
      }
    } else {
      _onPanEnd(e);
    }
  };
  addTouchEvents = function addTouchEvents(elem, fn) {
    var types = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
    for (var i = 0; i < types.length; i++) {
      self.dygraph_.addAndTrackEvent(elem, types[i], fn);
    }
  };
  this.setDefaultOption_('interactionModel', _dygraphInteractionModel["default"].dragIsPanInteractionModel);
  this.setDefaultOption_('panEdgeFraction', 0.0001);
  var dragStartEvent = window.opera ? 'mousedown' : 'dragstart';
  this.dygraph_.addAndTrackEvent(this.leftZoomHandle_, dragStartEvent, onZoomStart);
  this.dygraph_.addAndTrackEvent(this.rightZoomHandle_, dragStartEvent, onZoomStart);
  this.dygraph_.addAndTrackEvent(this.fgcanvas_, 'mousedown', onPanStart);
  this.dygraph_.addAndTrackEvent(this.fgcanvas_, 'mousemove', onCanvasHover);

  // Touch events
  if (this.hasTouchInterface_) {
    addTouchEvents(this.leftZoomHandle_, onZoomHandleTouchEvent);
    addTouchEvents(this.rightZoomHandle_, onZoomHandleTouchEvent);
    addTouchEvents(this.fgcanvas_, onCanvasTouchEvent);
  }
};

/**
 * @private
 * Draws the static layer in the background canvas.
 */
rangeSelector.prototype.drawStaticLayer_ = function () {
  var ctx = this.bgcanvas_ctx_;
  ctx.clearRect(0, 0, this.canvasRect_.w, this.canvasRect_.h);
  try {
    this.drawMiniPlot_();
  } catch (ex) {
    console.warn(ex);
  }
  var margin = 0.5;
  this.bgcanvas_ctx_.lineWidth = this.getOption_('rangeSelectorBackgroundLineWidth');
  ctx.strokeStyle = this.getOption_('rangeSelectorBackgroundStrokeColor');
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, this.canvasRect_.h - margin);
  ctx.lineTo(this.canvasRect_.w - margin, this.canvasRect_.h - margin);
  ctx.lineTo(this.canvasRect_.w - margin, margin);
  ctx.stroke();
};

/**
 * @private
 * Draws the mini plot in the background canvas.
 */
rangeSelector.prototype.drawMiniPlot_ = function () {
  var fillStyle = this.getOption_('rangeSelectorPlotFillColor');
  var fillGradientStyle = this.getOption_('rangeSelectorPlotFillGradientColor');
  var strokeStyle = this.getOption_('rangeSelectorPlotStrokeColor');
  if (!fillStyle && !strokeStyle) {
    return;
  }
  var stepPlot = this.getOption_('stepPlot');
  var combinedSeriesData = this.computeCombinedSeriesAndLimits_();
  var yRange = combinedSeriesData.yMax - combinedSeriesData.yMin;

  // Draw the mini plot.
  var ctx = this.bgcanvas_ctx_;
  var margin = 0.5;
  var xExtremes = this.dygraph_.xAxisExtremes();
  var xRange = Math.max(xExtremes[1] - xExtremes[0], 1.e-30);
  var xFact = (this.canvasRect_.w - margin) / xRange;
  var yFact = (this.canvasRect_.h - margin) / yRange;
  var canvasWidth = this.canvasRect_.w - margin;
  var canvasHeight = this.canvasRect_.h - margin;
  var prevX = null,
    prevY = null;
  ctx.beginPath();
  ctx.moveTo(margin, canvasHeight);
  for (var i = 0; i < combinedSeriesData.data.length; i++) {
    var dataPoint = combinedSeriesData.data[i];
    var x = dataPoint[0] !== null ? (dataPoint[0] - xExtremes[0]) * xFact : NaN;
    var y = dataPoint[1] !== null ? canvasHeight - (dataPoint[1] - combinedSeriesData.yMin) * yFact : NaN;

    // Skip points that don't change the x-value. Overly fine-grained points
    // can cause major slowdowns with the ctx.fill() call below.
    if (!stepPlot && prevX !== null && Math.round(x) == Math.round(prevX)) {
      continue;
    }
    if (isFinite(x) && isFinite(y)) {
      if (prevX === null) {
        ctx.lineTo(x, canvasHeight);
      } else if (stepPlot) {
        ctx.lineTo(x, prevY);
      }
      ctx.lineTo(x, y);
      prevX = x;
      prevY = y;
    } else {
      if (prevX !== null) {
        if (stepPlot) {
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, canvasHeight);
        } else {
          ctx.lineTo(prevX, canvasHeight);
        }
      }
      prevX = prevY = null;
    }
  }
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.closePath();
  if (fillStyle) {
    var lingrad = this.bgcanvas_ctx_.createLinearGradient(0, 0, 0, canvasHeight);
    if (fillGradientStyle) {
      lingrad.addColorStop(0, fillGradientStyle);
    }
    lingrad.addColorStop(1, fillStyle);
    this.bgcanvas_ctx_.fillStyle = lingrad;
    ctx.fill();
  }
  if (strokeStyle) {
    this.bgcanvas_ctx_.strokeStyle = strokeStyle;
    this.bgcanvas_ctx_.lineWidth = this.getOption_('rangeSelectorPlotLineWidth');
    ctx.stroke();
  }
};

/**
 * @private
 * Computes and returns the combined series data along with min/max for the mini plot.
 * The combined series consists of averaged values for all series.
 * When series have error bars, the error bars are ignored.
 * @return {Object} An object containing combined series array, ymin, ymax.
 */
rangeSelector.prototype.computeCombinedSeriesAndLimits_ = function () {
  var g = this.dygraph_;
  var logscale = this.getOption_('logscale');
  var i;

  // Select series to combine. By default, all series are combined.
  var numColumns = g.numColumns();
  var labels = g.getLabels();
  var includeSeries = new Array(numColumns);
  var anySet = false;
  var visibility = g.visibility();
  var inclusion = [];
  for (i = 1; i < numColumns; i++) {
    var include = this.getOption_('showInRangeSelector', labels[i]);
    inclusion.push(include);
    if (include !== null) anySet = true; // it's set explicitly for this series
  }
  if (anySet) {
    for (i = 1; i < numColumns; i++) {
      includeSeries[i] = inclusion[i - 1];
    }
  } else {
    for (i = 1; i < numColumns; i++) {
      includeSeries[i] = visibility[i - 1];
    }
  }

  // Create a combined series (average of selected series values).
  // TODO(danvk): short-circuit if there's only one series.
  var rolledSeries = [];
  var dataHandler = g.dataHandler_;
  var options = g.attributes_;
  for (i = 1; i < g.numColumns(); i++) {
    if (!includeSeries[i]) continue;
    var series = dataHandler.extractSeries(g.rawData_, i, options);
    if (g.rollPeriod() > 1) {
      series = dataHandler.rollingAverage(series, g.rollPeriod(), options, i);
    }
    rolledSeries.push(series);
  }
  var combinedSeries = [];
  for (i = 0; i < rolledSeries[0].length; i++) {
    var sum = 0;
    var count = 0;
    for (var j = 0; j < rolledSeries.length; j++) {
      var y = rolledSeries[j][i][1];
      if (y === null || isNaN(y)) continue;
      count++;
      sum += y;
    }
    combinedSeries.push([rolledSeries[0][i][0], sum / count]);
  }

  // Compute the y range.
  var yMin = Number.MAX_VALUE;
  var yMax = -Number.MAX_VALUE;
  for (i = 0; i < combinedSeries.length; i++) {
    var yVal = combinedSeries[i][1];
    if (yVal !== null && isFinite(yVal) && (!logscale || yVal > 0)) {
      yMin = Math.min(yMin, yVal);
      yMax = Math.max(yMax, yVal);
    }
  }

  // Convert Y data to log scale if needed.
  // Also, expand the Y range to compress the mini plot a little.
  var extraPercent = 0.25;
  if (logscale) {
    yMax = utils.log10(yMax);
    yMax += yMax * extraPercent;
    yMin = utils.log10(yMin);
    for (i = 0; i < combinedSeries.length; i++) {
      combinedSeries[i][1] = utils.log10(combinedSeries[i][1]);
    }
  } else {
    var yExtra;
    var yRange = yMax - yMin;
    if (yRange <= Number.MIN_VALUE) {
      yExtra = yMax * extraPercent;
    } else {
      yExtra = yRange * extraPercent;
    }
    yMax += yExtra;
    yMin -= yExtra;
  }
  return {
    data: combinedSeries,
    yMin: yMin,
    yMax: yMax
  };
};

/**
 * @private
 * Places the zoom handles in the proper position based on the current X data window.
 */
rangeSelector.prototype.placeZoomHandles_ = function () {
  var xExtremes = this.dygraph_.xAxisExtremes();
  var xWindowLimits = this.dygraph_.xAxisRange();
  var xRange = xExtremes[1] - xExtremes[0];
  var leftPercent = Math.max(0, (xWindowLimits[0] - xExtremes[0]) / xRange);
  var rightPercent = Math.max(0, (xExtremes[1] - xWindowLimits[1]) / xRange);
  var leftCoord = this.canvasRect_.x + this.canvasRect_.w * leftPercent;
  var rightCoord = this.canvasRect_.x + this.canvasRect_.w * (1 - rightPercent);
  var handleTop = Math.max(this.canvasRect_.y, this.canvasRect_.y + (this.canvasRect_.h - this.leftZoomHandle_.height) / 2);
  var halfHandleWidth = this.leftZoomHandle_.width / 2;
  this.leftZoomHandle_.style.left = leftCoord - halfHandleWidth + 'px';
  this.leftZoomHandle_.style.top = handleTop + 'px';
  this.rightZoomHandle_.style.left = rightCoord - halfHandleWidth + 'px';
  this.rightZoomHandle_.style.top = this.leftZoomHandle_.style.top;
  this.leftZoomHandle_.style.visibility = 'visible';
  this.rightZoomHandle_.style.visibility = 'visible';
};

/**
 * @private
 * Draws the interactive layer in the foreground canvas.
 */
rangeSelector.prototype.drawInteractiveLayer_ = function () {
  var ctx = this.fgcanvas_ctx_;
  ctx.clearRect(0, 0, this.canvasRect_.w, this.canvasRect_.h);
  var margin = 1;
  var width = this.canvasRect_.w - margin;
  var height = this.canvasRect_.h - margin;
  var zoomHandleStatus = this.getZoomHandleStatus_();
  ctx.strokeStyle = this.getOption_('rangeSelectorForegroundStrokeColor');
  ctx.lineWidth = this.getOption_('rangeSelectorForegroundLineWidth');
  if (!zoomHandleStatus.isZoomed) {
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, margin);
    ctx.stroke();
  } else {
    var leftHandleCanvasPos = Math.max(margin, zoomHandleStatus.leftHandlePos - this.canvasRect_.x);
    var rightHandleCanvasPos = Math.min(width, zoomHandleStatus.rightHandlePos - this.canvasRect_.x);
    var veilColour = this.getOption_('rangeSelectorVeilColour');
    ctx.fillStyle = veilColour ? veilColour : 'rgba(240, 240, 240, ' + this.getOption_('rangeSelectorAlpha').toString() + ')';
    ctx.fillRect(0, 0, leftHandleCanvasPos, this.canvasRect_.h);
    ctx.fillRect(rightHandleCanvasPos, 0, this.canvasRect_.w - rightHandleCanvasPos, this.canvasRect_.h);
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(leftHandleCanvasPos, margin);
    ctx.lineTo(leftHandleCanvasPos, height);
    ctx.lineTo(rightHandleCanvasPos, height);
    ctx.lineTo(rightHandleCanvasPos, margin);
    ctx.lineTo(width, margin);
    ctx.stroke();
  }
};

/**
 * @private
 * Returns the current zoom handle position information.
 * @return {Object} The zoom handle status.
 */
rangeSelector.prototype.getZoomHandleStatus_ = function () {
  var halfHandleWidth = this.leftZoomHandle_.width / 2;
  var leftHandlePos = parseFloat(this.leftZoomHandle_.style.left) + halfHandleWidth;
  var rightHandlePos = parseFloat(this.rightZoomHandle_.style.left) + halfHandleWidth;
  return {
    leftHandlePos: leftHandlePos,
    rightHandlePos: rightHandlePos,
    isZoomed: leftHandlePos - 1 > this.canvasRect_.x || rightHandlePos + 1 < this.canvasRect_.x + this.canvasRect_.w
  };
};
var _default = exports["default"] = rangeSelector;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsInV0aWxzIiwiX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQiLCJyZXF1aXJlIiwiX2R5Z3JhcGhJbnRlcmFjdGlvbk1vZGVsIiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsIl9pZnJhbWVUYXJwIiwiZSIsIl9fZXNNb2R1bGUiLCJ0IiwiV2Vha01hcCIsInIiLCJuIiwibyIsImkiLCJmIiwiX19wcm90b19fIiwiaGFzIiwiZ2V0Iiwic2V0IiwiX3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJyYW5nZVNlbGVjdG9yIiwiaGFzVG91Y2hJbnRlcmZhY2VfIiwiVG91Y2hFdmVudCIsImlzTW9iaWxlRGV2aWNlXyIsInRlc3QiLCJuYXZpZ2F0b3IiLCJhcHBWZXJzaW9uIiwiaW50ZXJmYWNlQ3JlYXRlZF8iLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImFjdGl2YXRlIiwiZHlncmFwaCIsImR5Z3JhcGhfIiwiZ2V0T3B0aW9uXyIsImNyZWF0ZUludGVyZmFjZV8iLCJsYXlvdXQiLCJyZXNlcnZlU3BhY2VfIiwicHJlZHJhdyIsInJlbmRlclN0YXRpY0xheWVyXyIsImRpZERyYXdDaGFydCIsInJlbmRlckludGVyYWN0aXZlTGF5ZXJfIiwiZGVzdHJveSIsImJnY2FudmFzXyIsImZnY2FudmFzXyIsImxlZnRab29tSGFuZGxlXyIsInJpZ2h0Wm9vbUhhbmRsZV8iLCJuYW1lIiwib3B0X3NlcmllcyIsImdldE9wdGlvbiIsInNldERlZmF1bHRPcHRpb25fIiwiYXR0cnNfIiwiY3JlYXRlQ2FudmFzZXNfIiwiY3JlYXRlWm9vbUhhbmRsZXNfIiwiaW5pdEludGVyYWN0aW9uXyIsImNvbnNvbGUiLCJ3YXJuIiwidXBkYXRlT3B0aW9ucyIsImFuaW1hdGVkWm9vbXMiLCJhZGRUb0dyYXBoXyIsImdyYXBoRGl2IiwiZ3JhcGhEaXZfIiwiYXBwZW5kQ2hpbGQiLCJyZW1vdmVGcm9tR3JhcGhfIiwicmVtb3ZlQ2hpbGQiLCJyZXNlcnZlU3BhY2VCb3R0b20iLCJ1cGRhdGVWaXNpYmlsaXR5XyIsInJlc2l6ZV8iLCJkcmF3U3RhdGljTGF5ZXJfIiwiaXNDaGFuZ2luZ1JhbmdlXyIsInBsYWNlWm9vbUhhbmRsZXNfIiwiZHJhd0ludGVyYWN0aXZlTGF5ZXJfIiwiZW5hYmxlZCIsInBhcmVudE5vZGUiLCJzZXRUaW1lb3V0Iiwid2lkdGhfIiwicmVzaXplIiwic2V0RWxlbWVudFJlY3QiLCJjYW52YXMiLCJjb250ZXh0IiwicmVjdCIsInBpeGVsUmF0aW9PcHRpb24iLCJjYW52YXNTY2FsZSIsImdldENvbnRleHRQaXhlbFJhdGlvIiwic3R5bGUiLCJ0b3AiLCJ5IiwibGVmdCIsIngiLCJ3aWR0aCIsInciLCJoZWlnaHQiLCJoIiwic2NhbGUiLCJwbG90QXJlYSIsImxheW91dF8iLCJnZXRQbG90QXJlYSIsInhBeGlzTGFiZWxIZWlnaHQiLCJnZXRPcHRpb25Gb3JBeGlzIiwiY2FudmFzUmVjdF8iLCJnZXROdW1lcmljT3B0aW9uIiwiYmdjYW52YXNfY3R4XyIsImZnY2FudmFzX2N0eF8iLCJjcmVhdGVDYW52YXMiLCJjbGFzc05hbWUiLCJwb3NpdGlvbiIsInpJbmRleCIsImdldENvbnRleHQiLCJjdXJzb3IiLCJpbWciLCJJbWFnZSIsInZpc2liaWxpdHkiLCJzcmMiLCJjbG9uZU5vZGUiLCJzZWxmIiwidG9wRWxlbSIsImRvY3VtZW50IiwiY2xpZW50WExhc3QiLCJoYW5kbGUiLCJpc1pvb21pbmciLCJpc1Bhbm5pbmciLCJkeW5hbWljIiwidGFycCIsIklGcmFtZVRhcnAiLCJ0b1hEYXRhV2luZG93Iiwib25ab29tU3RhcnQiLCJvblpvb20iLCJvblpvb21FbmQiLCJkb1pvb20iLCJpc01vdXNlSW5QYW5ab25lIiwib25QYW5TdGFydCIsIm9uUGFuIiwib25QYW5FbmQiLCJkb1BhbiIsIm9uQ2FudmFzSG92ZXIiLCJvblpvb21IYW5kbGVUb3VjaEV2ZW50Iiwib25DYW52YXNUb3VjaEV2ZW50IiwiYWRkVG91Y2hFdmVudHMiLCJ6b29tSGFuZGxlU3RhdHVzIiwieERhdGFMaW1pdHMiLCJ4QXhpc0V4dHJlbWVzIiwiZmFjdCIsInhEYXRhTWluIiwibGVmdEhhbmRsZVBvcyIsInhEYXRhTWF4IiwicmlnaHRIYW5kbGVQb3MiLCJjYW5jZWxFdmVudCIsImNsaWVudFgiLCJ0YXJnZXQiLCJzcmNFbGVtZW50IiwidHlwZSIsImFkZEV2ZW50IiwiY292ZXIiLCJkZWxYIiwiTWF0aCIsImFicyIsImdldFpvb21IYW5kbGVTdGF0dXNfIiwibmV3UG9zIiwibWluIiwibWF4IiwiaGFsZkhhbmRsZVdpZHRoIiwidW5jb3ZlciIsInJlbW92ZUV2ZW50IiwiaXNab29tZWQiLCJyZXNldFpvb20iLCJ4RGF0YVdpbmRvdyIsImRvWm9vbVhEYXRlc18iLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJsZWZ0SGFuZGxlQ2xpZW50WCIsInJpZ2h0SGFuZGxlQ2xpZW50WCIsInJhbmdlU2l6ZSIsImRhdGVXaW5kb3dfIiwiZHJhd0dyYXBoXyIsInRhcmdldFRvdWNoZXMiLCJsZW5ndGgiLCJlbGVtIiwiZm4iLCJ0eXBlcyIsImFkZEFuZFRyYWNrRXZlbnQiLCJEeWdyYXBoSW50ZXJhY3Rpb24iLCJkcmFnSXNQYW5JbnRlcmFjdGlvbk1vZGVsIiwiZHJhZ1N0YXJ0RXZlbnQiLCJ3aW5kb3ciLCJvcGVyYSIsImN0eCIsImNsZWFyUmVjdCIsImRyYXdNaW5pUGxvdF8iLCJleCIsIm1hcmdpbiIsImxpbmVXaWR0aCIsInN0cm9rZVN0eWxlIiwiYmVnaW5QYXRoIiwibW92ZVRvIiwibGluZVRvIiwic3Ryb2tlIiwiZmlsbFN0eWxlIiwiZmlsbEdyYWRpZW50U3R5bGUiLCJzdGVwUGxvdCIsImNvbWJpbmVkU2VyaWVzRGF0YSIsImNvbXB1dGVDb21iaW5lZFNlcmllc0FuZExpbWl0c18iLCJ5UmFuZ2UiLCJ5TWF4IiwieU1pbiIsInhFeHRyZW1lcyIsInhSYW5nZSIsInhGYWN0IiwieUZhY3QiLCJjYW52YXNXaWR0aCIsImNhbnZhc0hlaWdodCIsInByZXZYIiwicHJldlkiLCJkYXRhIiwiZGF0YVBvaW50IiwiTmFOIiwicm91bmQiLCJpc0Zpbml0ZSIsImNsb3NlUGF0aCIsImxpbmdyYWQiLCJjcmVhdGVMaW5lYXJHcmFkaWVudCIsImFkZENvbG9yU3RvcCIsImZpbGwiLCJnIiwibG9nc2NhbGUiLCJudW1Db2x1bW5zIiwibGFiZWxzIiwiZ2V0TGFiZWxzIiwiaW5jbHVkZVNlcmllcyIsIkFycmF5IiwiYW55U2V0IiwiaW5jbHVzaW9uIiwiaW5jbHVkZSIsInB1c2giLCJyb2xsZWRTZXJpZXMiLCJkYXRhSGFuZGxlciIsImRhdGFIYW5kbGVyXyIsIm9wdGlvbnMiLCJhdHRyaWJ1dGVzXyIsInNlcmllcyIsImV4dHJhY3RTZXJpZXMiLCJyYXdEYXRhXyIsInJvbGxQZXJpb2QiLCJyb2xsaW5nQXZlcmFnZSIsImNvbWJpbmVkU2VyaWVzIiwic3VtIiwiY291bnQiLCJqIiwiaXNOYU4iLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJ5VmFsIiwiZXh0cmFQZXJjZW50IiwibG9nMTAiLCJ5RXh0cmEiLCJNSU5fVkFMVUUiLCJ4V2luZG93TGltaXRzIiwieEF4aXNSYW5nZSIsImxlZnRQZXJjZW50IiwicmlnaHRQZXJjZW50IiwibGVmdENvb3JkIiwicmlnaHRDb29yZCIsImhhbmRsZVRvcCIsImxlZnRIYW5kbGVDYW52YXNQb3MiLCJyaWdodEhhbmRsZUNhbnZhc1BvcyIsInZlaWxDb2xvdXIiLCJmaWxsUmVjdCIsInBhcnNlRmxvYXQiLCJfZGVmYXVsdCIsIm1vZHVsZSIsImRlZmF1bHQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9yYW5nZS1zZWxlY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDExIFBhdWwgRmVsaXggKHBhdWwuZXJpYy5mZWxpeEBnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZS9NSVRcbiAqL1xuLypnbG9iYWwgRHlncmFwaDpmYWxzZSxUb3VjaEV2ZW50OmZhbHNlICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGZpbGUgY29udGFpbnMgdGhlIFJhbmdlU2VsZWN0b3IgcGx1Z2luIHVzZWQgdG8gcHJvdmlkZVxuICogYSB0aW1lbGluZSByYW5nZSBzZWxlY3RvciB3aWRnZXQgZm9yIGR5Z3JhcGhzLlxuICovXG5cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cblxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi4vZHlncmFwaC11dGlscyc7XG5pbXBvcnQgRHlncmFwaEludGVyYWN0aW9uIGZyb20gJy4uL2R5Z3JhcGgtaW50ZXJhY3Rpb24tbW9kZWwnO1xuaW1wb3J0IElGcmFtZVRhcnAgZnJvbSAnLi4vaWZyYW1lLXRhcnAnO1xuXG52YXIgcmFuZ2VTZWxlY3RvciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmhhc1RvdWNoSW50ZXJmYWNlXyA9IHR5cGVvZihUb3VjaEV2ZW50KSAhPSAndW5kZWZpbmVkJztcbiAgdGhpcy5pc01vYmlsZURldmljZV8gPSAvbW9iaWxlfGFuZHJvaWQvZ2kudGVzdChuYXZpZ2F0b3IuYXBwVmVyc2lvbik7XG4gIHRoaXMuaW50ZXJmYWNlQ3JlYXRlZF8gPSBmYWxzZTtcbn07XG5cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIlJhbmdlU2VsZWN0b3IgUGx1Z2luXCI7XG59O1xuXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKGR5Z3JhcGgpIHtcbiAgdGhpcy5keWdyYXBoXyA9IGR5Z3JhcGg7XG4gIGlmICh0aGlzLmdldE9wdGlvbl8oJ3Nob3dSYW5nZVNlbGVjdG9yJykpIHtcbiAgICB0aGlzLmNyZWF0ZUludGVyZmFjZV8oKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGxheW91dDogdGhpcy5yZXNlcnZlU3BhY2VfLFxuICAgIHByZWRyYXc6IHRoaXMucmVuZGVyU3RhdGljTGF5ZXJfLFxuICAgIGRpZERyYXdDaGFydDogdGhpcy5yZW5kZXJJbnRlcmFjdGl2ZUxheWVyX1xuICB9O1xufTtcblxucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmJnY2FudmFzXyA9IG51bGw7XG4gIHRoaXMuZmdjYW52YXNfID0gbnVsbDtcbiAgdGhpcy5sZWZ0Wm9vbUhhbmRsZV8gPSBudWxsO1xuICB0aGlzLnJpZ2h0Wm9vbUhhbmRsZV8gPSBudWxsO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByaXZhdGUgbWV0aG9kc1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuZ2V0T3B0aW9uXyA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXMpIHtcbiAgcmV0dXJuIHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uKG5hbWUsIG9wdF9zZXJpZXMpO1xufTtcblxucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuc2V0RGVmYXVsdE9wdGlvbl8gPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB0aGlzLmR5Z3JhcGhfLmF0dHJzX1tuYW1lXSA9IHZhbHVlO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQ3JlYXRlcyB0aGUgcmFuZ2Ugc2VsZWN0b3IgZWxlbWVudHMgYW5kIGFkZHMgdGhlbSB0byB0aGUgZ3JhcGguXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmNyZWF0ZUludGVyZmFjZV8gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jcmVhdGVDYW52YXNlc18oKTtcbiAgdGhpcy5jcmVhdGVab29tSGFuZGxlc18oKTtcbiAgdGhpcy5pbml0SW50ZXJhY3Rpb25fKCk7XG5cbiAgLy8gUmFuZ2Ugc2VsZWN0b3IgYW5kIGFuaW1hdGVkWm9vbXMgaGF2ZSBhIGJhZCBpbnRlcmFjdGlvbi4gU2VlIGlzc3VlIDM1OS5cbiAgaWYgKHRoaXMuZ2V0T3B0aW9uXygnYW5pbWF0ZWRab29tcycpKSB7XG4gICAgY29uc29sZS53YXJuKCdBbmltYXRlZCB6b29tcyBhbmQgcmFuZ2Ugc2VsZWN0b3IgYXJlIG5vdCBjb21wYXRpYmxlOyBkaXNhYmxpbmcgYW5pbWF0ZWRab29tcy4nKTtcbiAgICB0aGlzLmR5Z3JhcGhfLnVwZGF0ZU9wdGlvbnMoe2FuaW1hdGVkWm9vbXM6IGZhbHNlfSwgdHJ1ZSk7XG4gIH1cblxuICB0aGlzLmludGVyZmFjZUNyZWF0ZWRfID0gdHJ1ZTtcbiAgdGhpcy5hZGRUb0dyYXBoXygpO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQWRkcyB0aGUgcmFuZ2Ugc2VsZWN0b3IgdG8gdGhlIGdyYXBoLlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5hZGRUb0dyYXBoXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZ3JhcGhEaXYgPSB0aGlzLmdyYXBoRGl2XyA9IHRoaXMuZHlncmFwaF8uZ3JhcGhEaXY7XG4gIGdyYXBoRGl2LmFwcGVuZENoaWxkKHRoaXMuYmdjYW52YXNfKTtcbiAgZ3JhcGhEaXYuYXBwZW5kQ2hpbGQodGhpcy5mZ2NhbnZhc18pO1xuICBncmFwaERpdi5hcHBlbmRDaGlsZCh0aGlzLmxlZnRab29tSGFuZGxlXyk7XG4gIGdyYXBoRGl2LmFwcGVuZENoaWxkKHRoaXMucmlnaHRab29tSGFuZGxlXyk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBSZW1vdmVzIHRoZSByYW5nZSBzZWxlY3RvciBmcm9tIHRoZSBncmFwaC5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUucmVtb3ZlRnJvbUdyYXBoXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZ3JhcGhEaXYgPSB0aGlzLmdyYXBoRGl2XztcbiAgZ3JhcGhEaXYucmVtb3ZlQ2hpbGQodGhpcy5iZ2NhbnZhc18pO1xuICBncmFwaERpdi5yZW1vdmVDaGlsZCh0aGlzLmZnY2FudmFzXyk7XG4gIGdyYXBoRGl2LnJlbW92ZUNoaWxkKHRoaXMubGVmdFpvb21IYW5kbGVfKTtcbiAgZ3JhcGhEaXYucmVtb3ZlQ2hpbGQodGhpcy5yaWdodFpvb21IYW5kbGVfKTtcbiAgdGhpcy5ncmFwaERpdl8gPSBudWxsO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQ2FsbGVkIGJ5IExheW91dCB0byBhbGxvdyByYW5nZSBzZWxlY3RvciB0byByZXNlcnZlIGl0cyBzcGFjZS5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUucmVzZXJ2ZVNwYWNlXyA9IGZ1bmN0aW9uKGUpIHtcbiAgaWYgKHRoaXMuZ2V0T3B0aW9uXygnc2hvd1JhbmdlU2VsZWN0b3InKSkge1xuICAgIGUucmVzZXJ2ZVNwYWNlQm90dG9tKHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvckhlaWdodCcpICsgNCk7XG4gIH1cbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFJlbmRlcnMgdGhlIHN0YXRpYyBwb3J0aW9uIG9mIHRoZSByYW5nZSBzZWxlY3RvciBhdCB0aGUgcHJlZHJhdyBzdGFnZS5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUucmVuZGVyU3RhdGljTGF5ZXJfID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy51cGRhdGVWaXNpYmlsaXR5XygpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMucmVzaXplXygpO1xuICB0aGlzLmRyYXdTdGF0aWNMYXllcl8oKTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFJlbmRlcnMgdGhlIGludGVyYWN0aXZlIHBvcnRpb24gb2YgdGhlIHJhbmdlIHNlbGVjdG9yIGFmdGVyIHRoZSBjaGFydCBoYXMgYmVlbiBkcmF3bi5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUucmVuZGVySW50ZXJhY3RpdmVMYXllcl8gPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnVwZGF0ZVZpc2liaWxpdHlfKCkgfHwgdGhpcy5pc0NoYW5naW5nUmFuZ2VfKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMucGxhY2Vab29tSGFuZGxlc18oKTtcbiAgdGhpcy5kcmF3SW50ZXJhY3RpdmVMYXllcl8oKTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgcmFuZ2Ugc2VsZWN0b3IgaXMgZW5hYmxlZC9kaXNhYmxlZCBhbmQgdXBkYXRlIHZpc2liaWxpdHkgYWNjb3JkaW5nbHkuXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLnVwZGF0ZVZpc2liaWxpdHlfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBlbmFibGVkID0gdGhpcy5nZXRPcHRpb25fKCdzaG93UmFuZ2VTZWxlY3RvcicpO1xuICBpZiAoZW5hYmxlZCkge1xuICAgIGlmICghdGhpcy5pbnRlcmZhY2VDcmVhdGVkXykge1xuICAgICAgdGhpcy5jcmVhdGVJbnRlcmZhY2VfKCk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5ncmFwaERpdl8gfHwgIXRoaXMuZ3JhcGhEaXZfLnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuYWRkVG9HcmFwaF8oKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5ncmFwaERpdl8pIHtcbiAgICB0aGlzLnJlbW92ZUZyb21HcmFwaF8oKTtcbiAgICB2YXIgZHlncmFwaCA9IHRoaXMuZHlncmFwaF87XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgZHlncmFwaC53aWR0aF8gPSAwOyBkeWdyYXBoLnJlc2l6ZSgpOyB9LCAxKTtcbiAgfVxuICByZXR1cm4gZW5hYmxlZDtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFJlc2l6ZXMgdGhlIHJhbmdlIHNlbGVjdG9yLlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5yZXNpemVfID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIHNldEVsZW1lbnRSZWN0KGNhbnZhcywgY29udGV4dCwgcmVjdCwgcGl4ZWxSYXRpb09wdGlvbikge1xuICAgIHZhciBjYW52YXNTY2FsZSA9IHBpeGVsUmF0aW9PcHRpb24gfHwgdXRpbHMuZ2V0Q29udGV4dFBpeGVsUmF0aW8oY29udGV4dCk7XG5cbiAgICBjYW52YXMuc3R5bGUudG9wID0gcmVjdC55ICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUubGVmdCA9IHJlY3QueCArICdweCc7XG4gICAgY2FudmFzLndpZHRoID0gcmVjdC53ICogY2FudmFzU2NhbGU7XG4gICAgY2FudmFzLmhlaWdodCA9IHJlY3QuaCAqIGNhbnZhc1NjYWxlO1xuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IHJlY3QudyArICdweCc7XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IHJlY3QuaCArICdweCc7XG5cbiAgICBpZihjYW52YXNTY2FsZSAhPSAxKSB7XG4gICAgICBjb250ZXh0LnNjYWxlKGNhbnZhc1NjYWxlLCBjYW52YXNTY2FsZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHBsb3RBcmVhID0gdGhpcy5keWdyYXBoXy5sYXlvdXRfLmdldFBsb3RBcmVhKCk7XG5cbiAgdmFyIHhBeGlzTGFiZWxIZWlnaHQgPSAwO1xuICBpZiAodGhpcy5keWdyYXBoXy5nZXRPcHRpb25Gb3JBeGlzKCdkcmF3QXhpcycsICd4JykpIHtcbiAgICB4QXhpc0xhYmVsSGVpZ2h0ID0gdGhpcy5nZXRPcHRpb25fKCd4QXhpc0hlaWdodCcpIHx8ICh0aGlzLmdldE9wdGlvbl8oJ2F4aXNMYWJlbEZvbnRTaXplJykgKyAyICogdGhpcy5nZXRPcHRpb25fKCdheGlzVGlja1NpemUnKSk7XG4gIH1cbiAgdGhpcy5jYW52YXNSZWN0XyA9IHtcbiAgICB4OiBwbG90QXJlYS54LFxuICAgIHk6IHBsb3RBcmVhLnkgKyBwbG90QXJlYS5oICsgeEF4aXNMYWJlbEhlaWdodCArIDQsXG4gICAgdzogcGxvdEFyZWEudyxcbiAgICBoOiB0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JIZWlnaHQnKVxuICB9O1xuXG4gIHZhciBwaXhlbFJhdGlvT3B0aW9uID0gdGhpcy5keWdyYXBoXy5nZXROdW1lcmljT3B0aW9uKCdwaXhlbFJhdGlvJyk7XG4gIHNldEVsZW1lbnRSZWN0KHRoaXMuYmdjYW52YXNfLCB0aGlzLmJnY2FudmFzX2N0eF8sIHRoaXMuY2FudmFzUmVjdF8sIHBpeGVsUmF0aW9PcHRpb24pO1xuICBzZXRFbGVtZW50UmVjdCh0aGlzLmZnY2FudmFzXywgdGhpcy5mZ2NhbnZhc19jdHhfLCB0aGlzLmNhbnZhc1JlY3RfLCBwaXhlbFJhdGlvT3B0aW9uKTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIENyZWF0ZXMgdGhlIGJhY2tncm91bmQgYW5kIGZvcmVncm91bmQgY2FudmFzZXMuXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmNyZWF0ZUNhbnZhc2VzXyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmJnY2FudmFzXyA9IHV0aWxzLmNyZWF0ZUNhbnZhcygpO1xuICB0aGlzLmJnY2FudmFzXy5jbGFzc05hbWUgPSAnZHlncmFwaC1yYW5nZXNlbC1iZ2NhbnZhcyc7XG4gIHRoaXMuYmdjYW52YXNfLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgdGhpcy5iZ2NhbnZhc18uc3R5bGUuekluZGV4ID0gOTtcbiAgdGhpcy5iZ2NhbnZhc19jdHhfID0gdXRpbHMuZ2V0Q29udGV4dCh0aGlzLmJnY2FudmFzXyk7XG5cbiAgdGhpcy5mZ2NhbnZhc18gPSB1dGlscy5jcmVhdGVDYW52YXMoKTtcbiAgdGhpcy5mZ2NhbnZhc18uY2xhc3NOYW1lID0gJ2R5Z3JhcGgtcmFuZ2VzZWwtZmdjYW52YXMnO1xuICB0aGlzLmZnY2FudmFzXy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIHRoaXMuZmdjYW52YXNfLnN0eWxlLnpJbmRleCA9IDk7XG4gIHRoaXMuZmdjYW52YXNfLnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcbiAgdGhpcy5mZ2NhbnZhc19jdHhfID0gdXRpbHMuZ2V0Q29udGV4dCh0aGlzLmZnY2FudmFzXyk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBDcmVhdGVzIHRoZSB6b29tIGhhbmRsZSBlbGVtZW50cy5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuY3JlYXRlWm9vbUhhbmRsZXNfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgaW1nLmNsYXNzTmFtZSA9ICdkeWdyYXBoLXJhbmdlc2VsLXpvb21oYW5kbGUnO1xuICBpbWcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBpbWcuc3R5bGUuekluZGV4ID0gMTA7XG4gIGltZy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7IC8vIEluaXRpYWxseSBoaWRkZW4gc28gdGhleSBkb24ndCBzaG93IHVwIGluIHRoZSB3cm9uZyBwbGFjZS5cbiAgaW1nLnN0eWxlLmN1cnNvciA9ICdjb2wtcmVzaXplJztcbiAgLy8gVE9ETzogY2hhbmdlIGltYWdlIHRvIG1vcmUgb3B0aW9uc1xuICBpbWcud2lkdGggPSA5O1xuICBpbWcuaGVpZ2h0ID0gMTY7XG4gIGltZy5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcgK1xuJ2lWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBa0FBQUFRQ0FZQUFBREVTRlZEQUFBQUFYTlNSMElBcnM0YzZRQUFBQVppUzBkRUFOQUEnICtcbid6d0RQNFo3S2VnQUFBQWx3U0ZsekFBQU94QUFBRHNRQmxTc09Hd0FBQUFkMFNVMUZCOXNIR3cwY01xZHQxVXdBQUFBWmRFVllkRU52JyArXG4nYlcxbGJuUUFRM0psWVhSbFpDQjNhWFJvSUVkSlRWQlhnUTRYQUFBQWFFbEVRVlFveiszU3NSRkFRQkNGNFo5V0pNOEtDRFZ3b3dubCcgK1xuJzZZWHNUbUNVc3lLR2taemNsN3prejNZTGt5cGdBbnJlRm1ERXBIa0l3Vk9NZnBkaTlDRUVOMm5HcEZkd0QwM3lFcUR0T2dDYXVuN3MnICtcbidxU1RESDMySTFwUUEyUGI5c1plY0F4YzVyM0lBYjIxZDY4Nzh4c0FBQUFBQVNVVk9SSzVDWUlJPSc7XG5cbiAgaWYgKHRoaXMuaXNNb2JpbGVEZXZpY2VfKSB7XG4gICAgaW1nLndpZHRoICo9IDI7XG4gICAgaW1nLmhlaWdodCAqPSAyO1xuICB9XG5cbiAgdGhpcy5sZWZ0Wm9vbUhhbmRsZV8gPSBpbWc7XG4gIHRoaXMucmlnaHRab29tSGFuZGxlXyA9IGltZy5jbG9uZU5vZGUoZmFsc2UpO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogU2V0cyB1cCB0aGUgaW50ZXJhY3Rpb24gZm9yIHRoZSByYW5nZSBzZWxlY3Rvci5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuaW5pdEludGVyYWN0aW9uXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB0b3BFbGVtID0gZG9jdW1lbnQ7XG4gIHZhciBjbGllbnRYTGFzdCA9IDA7XG4gIHZhciBoYW5kbGUgPSBudWxsO1xuICB2YXIgaXNab29taW5nID0gZmFsc2U7XG4gIHZhciBpc1Bhbm5pbmcgPSBmYWxzZTtcbiAgdmFyIGR5bmFtaWMgPSAhdGhpcy5pc01vYmlsZURldmljZV87XG5cbiAgLy8gV2UgY292ZXIgaWZyYW1lcyBkdXJpbmcgbW91c2UgaW50ZXJhY3Rpb25zLiBTZWUgY29tbWVudHMgaW5cbiAgLy8gZHlncmFwaC11dGlscy5qcyBmb3IgbW9yZSBpbmZvIG9uIHdoeSB0aGlzIGlzIGEgZ29vZCBpZGVhLlxuICB2YXIgdGFycCA9IG5ldyBJRnJhbWVUYXJwKCk7XG5cbiAgLy8gZnVuY3Rpb25zLCBkZWZpbmVkIGJlbG93LiAgRGVmaW5pbmcgdGhlbSB0aGlzIHdheSAocmF0aGVyIHRoYW4gd2l0aFxuICAvLyBcImZ1bmN0aW9uIGZvbygpIHsuLi59XCIpIG1ha2VzIEpTSGludCBoYXBweS5cbiAgdmFyIHRvWERhdGFXaW5kb3csIG9uWm9vbVN0YXJ0LCBvblpvb20sIG9uWm9vbUVuZCwgZG9ab29tLCBpc01vdXNlSW5QYW5ab25lLFxuICAgICAgb25QYW5TdGFydCwgb25QYW4sIG9uUGFuRW5kLCBkb1Bhbiwgb25DYW52YXNIb3ZlcjtcblxuICAvLyBUb3VjaCBldmVudCBmdW5jdGlvbnNcbiAgdmFyIG9uWm9vbUhhbmRsZVRvdWNoRXZlbnQsIG9uQ2FudmFzVG91Y2hFdmVudCwgYWRkVG91Y2hFdmVudHM7XG5cbiAgdG9YRGF0YVdpbmRvdyA9IGZ1bmN0aW9uKHpvb21IYW5kbGVTdGF0dXMpIHtcbiAgICB2YXIgeERhdGFMaW1pdHMgPSBzZWxmLmR5Z3JhcGhfLnhBeGlzRXh0cmVtZXMoKTtcbiAgICB2YXIgZmFjdCA9ICh4RGF0YUxpbWl0c1sxXSAtIHhEYXRhTGltaXRzWzBdKS9zZWxmLmNhbnZhc1JlY3RfLnc7XG4gICAgdmFyIHhEYXRhTWluID0geERhdGFMaW1pdHNbMF0gKyAoem9vbUhhbmRsZVN0YXR1cy5sZWZ0SGFuZGxlUG9zIC0gc2VsZi5jYW52YXNSZWN0Xy54KSpmYWN0O1xuICAgIHZhciB4RGF0YU1heCA9IHhEYXRhTGltaXRzWzBdICsgKHpvb21IYW5kbGVTdGF0dXMucmlnaHRIYW5kbGVQb3MgLSBzZWxmLmNhbnZhc1JlY3RfLngpKmZhY3Q7XG4gICAgcmV0dXJuIFt4RGF0YU1pbiwgeERhdGFNYXhdO1xuICB9O1xuXG4gIG9uWm9vbVN0YXJ0ID0gZnVuY3Rpb24oZSkge1xuICAgIHV0aWxzLmNhbmNlbEV2ZW50KGUpO1xuICAgIGlzWm9vbWluZyA9IHRydWU7XG4gICAgY2xpZW50WExhc3QgPSBlLmNsaWVudFg7XG4gICAgaGFuZGxlID0gZS50YXJnZXQgPyBlLnRhcmdldCA6IGUuc3JjRWxlbWVudDtcbiAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJyB8fCBlLnR5cGUgPT09ICdkcmFnc3RhcnQnKSB7XG4gICAgICAvLyBUaGVzZSBldmVudHMgYXJlIHJlbW92ZWQgbWFudWFsbHkuXG4gICAgICB1dGlscy5hZGRFdmVudCh0b3BFbGVtLCAnbW91c2Vtb3ZlJywgb25ab29tKTtcbiAgICAgIHV0aWxzLmFkZEV2ZW50KHRvcEVsZW0sICdtb3VzZXVwJywgb25ab29tRW5kKTtcbiAgICB9XG4gICAgc2VsZi5mZ2NhbnZhc18uc3R5bGUuY3Vyc29yID0gJ2NvbC1yZXNpemUnO1xuICAgIHRhcnAuY292ZXIoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBvblpvb20gPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCFpc1pvb21pbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdXRpbHMuY2FuY2VsRXZlbnQoZSk7XG5cbiAgICB2YXIgZGVsWCA9IGUuY2xpZW50WCAtIGNsaWVudFhMYXN0O1xuICAgIGlmIChNYXRoLmFicyhkZWxYKSA8IDQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjbGllbnRYTGFzdCA9IGUuY2xpZW50WDtcblxuICAgIC8vIE1vdmUgaGFuZGxlLlxuICAgIHZhciB6b29tSGFuZGxlU3RhdHVzID0gc2VsZi5nZXRab29tSGFuZGxlU3RhdHVzXygpO1xuICAgIHZhciBuZXdQb3M7XG4gICAgaWYgKGhhbmRsZSA9PSBzZWxmLmxlZnRab29tSGFuZGxlXykge1xuICAgICAgbmV3UG9zID0gem9vbUhhbmRsZVN0YXR1cy5sZWZ0SGFuZGxlUG9zICsgZGVsWDtcbiAgICAgIG5ld1BvcyA9IE1hdGgubWluKG5ld1Bvcywgem9vbUhhbmRsZVN0YXR1cy5yaWdodEhhbmRsZVBvcyAtIGhhbmRsZS53aWR0aCAtIDMpO1xuICAgICAgbmV3UG9zID0gTWF0aC5tYXgobmV3UG9zLCBzZWxmLmNhbnZhc1JlY3RfLngpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdQb3MgPSB6b29tSGFuZGxlU3RhdHVzLnJpZ2h0SGFuZGxlUG9zICsgZGVsWDtcbiAgICAgIG5ld1BvcyA9IE1hdGgubWluKG5ld1Bvcywgc2VsZi5jYW52YXNSZWN0Xy54ICsgc2VsZi5jYW52YXNSZWN0Xy53KTtcbiAgICAgIG5ld1BvcyA9IE1hdGgubWF4KG5ld1Bvcywgem9vbUhhbmRsZVN0YXR1cy5sZWZ0SGFuZGxlUG9zICsgaGFuZGxlLndpZHRoICsgMyk7XG4gICAgfVxuICAgIHZhciBoYWxmSGFuZGxlV2lkdGggPSBoYW5kbGUud2lkdGgvMjtcbiAgICBoYW5kbGUuc3R5bGUubGVmdCA9IChuZXdQb3MgLSBoYWxmSGFuZGxlV2lkdGgpICsgJ3B4JztcbiAgICBzZWxmLmRyYXdJbnRlcmFjdGl2ZUxheWVyXygpO1xuXG4gICAgLy8gWm9vbSBvbiB0aGUgZmx5LlxuICAgIGlmIChkeW5hbWljKSB7XG4gICAgICBkb1pvb20oKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgb25ab29tRW5kID0gZnVuY3Rpb24oZSkge1xuICAgIGlmICghaXNab29taW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlzWm9vbWluZyA9IGZhbHNlO1xuICAgIHRhcnAudW5jb3ZlcigpO1xuICAgIHV0aWxzLnJlbW92ZUV2ZW50KHRvcEVsZW0sICdtb3VzZW1vdmUnLCBvblpvb20pO1xuICAgIHV0aWxzLnJlbW92ZUV2ZW50KHRvcEVsZW0sICdtb3VzZXVwJywgb25ab29tRW5kKTtcbiAgICBzZWxmLmZnY2FudmFzXy5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG5cbiAgICAvLyBJZiBvbiBhIHNsb3dlciBkZXZpY2UsIHpvb20gbm93LlxuICAgIGlmICghZHluYW1pYykge1xuICAgICAgZG9ab29tKCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGRvWm9vbSA9IGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgem9vbUhhbmRsZVN0YXR1cyA9IHNlbGYuZ2V0Wm9vbUhhbmRsZVN0YXR1c18oKTtcbiAgICAgIHNlbGYuaXNDaGFuZ2luZ1JhbmdlXyA9IHRydWU7XG4gICAgICBpZiAoIXpvb21IYW5kbGVTdGF0dXMuaXNab29tZWQpIHtcbiAgICAgICAgc2VsZi5keWdyYXBoXy5yZXNldFpvb20oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB4RGF0YVdpbmRvdyA9IHRvWERhdGFXaW5kb3coem9vbUhhbmRsZVN0YXR1cyk7XG4gICAgICAgIHNlbGYuZHlncmFwaF8uZG9ab29tWERhdGVzXyh4RGF0YVdpbmRvd1swXSwgeERhdGFXaW5kb3dbMV0pO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZWxmLmlzQ2hhbmdpbmdSYW5nZV8gPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgaXNNb3VzZUluUGFuWm9uZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcmVjdCA9IHNlbGYubGVmdFpvb21IYW5kbGVfLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHZhciBsZWZ0SGFuZGxlQ2xpZW50WCA9IHJlY3QubGVmdCArIHJlY3Qud2lkdGgvMjtcbiAgICByZWN0ID0gc2VsZi5yaWdodFpvb21IYW5kbGVfLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHZhciByaWdodEhhbmRsZUNsaWVudFggPSByZWN0LmxlZnQgKyByZWN0LndpZHRoLzI7XG4gICAgcmV0dXJuIChlLmNsaWVudFggPiBsZWZ0SGFuZGxlQ2xpZW50WCAmJiBlLmNsaWVudFggPCByaWdodEhhbmRsZUNsaWVudFgpO1xuICB9O1xuXG4gIG9uUGFuU3RhcnQgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCFpc1Bhbm5pbmcgJiYgaXNNb3VzZUluUGFuWm9uZShlKSAmJiBzZWxmLmdldFpvb21IYW5kbGVTdGF0dXNfKCkuaXNab29tZWQpIHtcbiAgICAgIHV0aWxzLmNhbmNlbEV2ZW50KGUpO1xuICAgICAgaXNQYW5uaW5nID0gdHJ1ZTtcbiAgICAgIGNsaWVudFhMYXN0ID0gZS5jbGllbnRYO1xuICAgICAgaWYgKGUudHlwZSA9PT0gJ21vdXNlZG93bicpIHtcbiAgICAgICAgLy8gVGhlc2UgZXZlbnRzIGFyZSByZW1vdmVkIG1hbnVhbGx5LlxuICAgICAgICB1dGlscy5hZGRFdmVudCh0b3BFbGVtLCAnbW91c2Vtb3ZlJywgb25QYW4pO1xuICAgICAgICB1dGlscy5hZGRFdmVudCh0b3BFbGVtLCAnbW91c2V1cCcsIG9uUGFuRW5kKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgb25QYW4gPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCFpc1Bhbm5pbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdXRpbHMuY2FuY2VsRXZlbnQoZSk7XG5cbiAgICB2YXIgZGVsWCA9IGUuY2xpZW50WCAtIGNsaWVudFhMYXN0O1xuICAgIGlmIChNYXRoLmFicyhkZWxYKSA8IDQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjbGllbnRYTGFzdCA9IGUuY2xpZW50WDtcblxuICAgIC8vIE1vdmUgcmFuZ2Ugdmlld1xuICAgIHZhciB6b29tSGFuZGxlU3RhdHVzID0gc2VsZi5nZXRab29tSGFuZGxlU3RhdHVzXygpO1xuICAgIHZhciBsZWZ0SGFuZGxlUG9zID0gem9vbUhhbmRsZVN0YXR1cy5sZWZ0SGFuZGxlUG9zO1xuICAgIHZhciByaWdodEhhbmRsZVBvcyA9IHpvb21IYW5kbGVTdGF0dXMucmlnaHRIYW5kbGVQb3M7XG4gICAgdmFyIHJhbmdlU2l6ZSA9IHJpZ2h0SGFuZGxlUG9zIC0gbGVmdEhhbmRsZVBvcztcbiAgICBpZiAobGVmdEhhbmRsZVBvcyArIGRlbFggPD0gc2VsZi5jYW52YXNSZWN0Xy54KSB7XG4gICAgICBsZWZ0SGFuZGxlUG9zID0gc2VsZi5jYW52YXNSZWN0Xy54O1xuICAgICAgcmlnaHRIYW5kbGVQb3MgPSBsZWZ0SGFuZGxlUG9zICsgcmFuZ2VTaXplO1xuICAgIH0gZWxzZSBpZiAocmlnaHRIYW5kbGVQb3MgKyBkZWxYID49IHNlbGYuY2FudmFzUmVjdF8ueCArIHNlbGYuY2FudmFzUmVjdF8udykge1xuICAgICAgcmlnaHRIYW5kbGVQb3MgPSBzZWxmLmNhbnZhc1JlY3RfLnggKyBzZWxmLmNhbnZhc1JlY3RfLnc7XG4gICAgICBsZWZ0SGFuZGxlUG9zID0gcmlnaHRIYW5kbGVQb3MgLSByYW5nZVNpemU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnRIYW5kbGVQb3MgKz0gZGVsWDtcbiAgICAgIHJpZ2h0SGFuZGxlUG9zICs9IGRlbFg7XG4gICAgfVxuICAgIHZhciBoYWxmSGFuZGxlV2lkdGggPSBzZWxmLmxlZnRab29tSGFuZGxlXy53aWR0aC8yO1xuICAgIHNlbGYubGVmdFpvb21IYW5kbGVfLnN0eWxlLmxlZnQgPSAobGVmdEhhbmRsZVBvcyAtIGhhbGZIYW5kbGVXaWR0aCkgKyAncHgnO1xuICAgIHNlbGYucmlnaHRab29tSGFuZGxlXy5zdHlsZS5sZWZ0ID0gKHJpZ2h0SGFuZGxlUG9zIC0gaGFsZkhhbmRsZVdpZHRoKSArICdweCc7XG4gICAgc2VsZi5kcmF3SW50ZXJhY3RpdmVMYXllcl8oKTtcblxuICAgIC8vIERvIHBhbiBvbiB0aGUgZmx5LlxuICAgIGlmIChkeW5hbWljKSB7XG4gICAgICBkb1BhbigpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBvblBhbkVuZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoIWlzUGFubmluZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICB1dGlscy5yZW1vdmVFdmVudCh0b3BFbGVtLCAnbW91c2Vtb3ZlJywgb25QYW4pO1xuICAgIHV0aWxzLnJlbW92ZUV2ZW50KHRvcEVsZW0sICdtb3VzZXVwJywgb25QYW5FbmQpO1xuICAgIC8vIElmIG9uIGEgc2xvd2VyIGRldmljZSwgZG8gcGFuIG5vdy5cbiAgICBpZiAoIWR5bmFtaWMpIHtcbiAgICAgIGRvUGFuKCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGRvUGFuID0gZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgIHNlbGYuaXNDaGFuZ2luZ1JhbmdlXyA9IHRydWU7XG4gICAgICBzZWxmLmR5Z3JhcGhfLmRhdGVXaW5kb3dfID0gdG9YRGF0YVdpbmRvdyhzZWxmLmdldFpvb21IYW5kbGVTdGF0dXNfKCkpO1xuICAgICAgc2VsZi5keWdyYXBoXy5kcmF3R3JhcGhfKGZhbHNlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2VsZi5pc0NoYW5naW5nUmFuZ2VfID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIG9uQ2FudmFzSG92ZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGlzWm9vbWluZyB8fCBpc1Bhbm5pbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGN1cnNvciA9IGlzTW91c2VJblBhblpvbmUoZSkgPyAnbW92ZScgOiAnZGVmYXVsdCc7XG4gICAgaWYgKGN1cnNvciAhPSBzZWxmLmZnY2FudmFzXy5zdHlsZS5jdXJzb3IpIHtcbiAgICAgIHNlbGYuZmdjYW52YXNfLnN0eWxlLmN1cnNvciA9IGN1cnNvcjtcbiAgICB9XG4gIH07XG5cbiAgb25ab29tSGFuZGxlVG91Y2hFdmVudCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS50eXBlID09ICd0b3VjaHN0YXJ0JyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIGlmIChvblpvb21TdGFydChlLnRhcmdldFRvdWNoZXNbMF0pKSB7XG4gICAgICAgIHV0aWxzLmNhbmNlbEV2ZW50KGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZS50eXBlID09ICd0b3VjaG1vdmUnICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgaWYgKG9uWm9vbShlLnRhcmdldFRvdWNoZXNbMF0pKSB7XG4gICAgICAgIHV0aWxzLmNhbmNlbEV2ZW50KGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvblpvb21FbmQoZSk7XG4gICAgfVxuICB9O1xuXG4gIG9uQ2FudmFzVG91Y2hFdmVudCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS50eXBlID09ICd0b3VjaHN0YXJ0JyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIGlmIChvblBhblN0YXJ0KGUudGFyZ2V0VG91Y2hlc1swXSkpIHtcbiAgICAgICAgdXRpbHMuY2FuY2VsRXZlbnQoZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChlLnR5cGUgPT0gJ3RvdWNobW92ZScgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBpZiAob25QYW4oZS50YXJnZXRUb3VjaGVzWzBdKSkge1xuICAgICAgICB1dGlscy5jYW5jZWxFdmVudChlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb25QYW5FbmQoZSk7XG4gICAgfVxuICB9O1xuXG4gIGFkZFRvdWNoRXZlbnRzID0gZnVuY3Rpb24oZWxlbSwgZm4pIHtcbiAgICB2YXIgdHlwZXMgPSBbJ3RvdWNoc3RhcnQnLCAndG91Y2hlbmQnLCAndG91Y2htb3ZlJywgJ3RvdWNoY2FuY2VsJ107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgc2VsZi5keWdyYXBoXy5hZGRBbmRUcmFja0V2ZW50KGVsZW0sIHR5cGVzW2ldLCBmbik7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuc2V0RGVmYXVsdE9wdGlvbl8oJ2ludGVyYWN0aW9uTW9kZWwnLCBEeWdyYXBoSW50ZXJhY3Rpb24uZHJhZ0lzUGFuSW50ZXJhY3Rpb25Nb2RlbCk7XG4gIHRoaXMuc2V0RGVmYXVsdE9wdGlvbl8oJ3BhbkVkZ2VGcmFjdGlvbicsIDAuMDAwMSk7XG5cbiAgdmFyIGRyYWdTdGFydEV2ZW50ID0gd2luZG93Lm9wZXJhID8gJ21vdXNlZG93bicgOiAnZHJhZ3N0YXJ0JztcbiAgdGhpcy5keWdyYXBoXy5hZGRBbmRUcmFja0V2ZW50KHRoaXMubGVmdFpvb21IYW5kbGVfLCBkcmFnU3RhcnRFdmVudCwgb25ab29tU3RhcnQpO1xuICB0aGlzLmR5Z3JhcGhfLmFkZEFuZFRyYWNrRXZlbnQodGhpcy5yaWdodFpvb21IYW5kbGVfLCBkcmFnU3RhcnRFdmVudCwgb25ab29tU3RhcnQpO1xuXG4gIHRoaXMuZHlncmFwaF8uYWRkQW5kVHJhY2tFdmVudCh0aGlzLmZnY2FudmFzXywgJ21vdXNlZG93bicsIG9uUGFuU3RhcnQpO1xuICB0aGlzLmR5Z3JhcGhfLmFkZEFuZFRyYWNrRXZlbnQodGhpcy5mZ2NhbnZhc18sICdtb3VzZW1vdmUnLCBvbkNhbnZhc0hvdmVyKTtcblxuICAvLyBUb3VjaCBldmVudHNcbiAgaWYgKHRoaXMuaGFzVG91Y2hJbnRlcmZhY2VfKSB7XG4gICAgYWRkVG91Y2hFdmVudHModGhpcy5sZWZ0Wm9vbUhhbmRsZV8sIG9uWm9vbUhhbmRsZVRvdWNoRXZlbnQpO1xuICAgIGFkZFRvdWNoRXZlbnRzKHRoaXMucmlnaHRab29tSGFuZGxlXywgb25ab29tSGFuZGxlVG91Y2hFdmVudCk7XG4gICAgYWRkVG91Y2hFdmVudHModGhpcy5mZ2NhbnZhc18sIG9uQ2FudmFzVG91Y2hFdmVudCk7XG4gIH1cbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIERyYXdzIHRoZSBzdGF0aWMgbGF5ZXIgaW4gdGhlIGJhY2tncm91bmQgY2FudmFzLlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5kcmF3U3RhdGljTGF5ZXJfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjdHggPSB0aGlzLmJnY2FudmFzX2N0eF87XG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXNSZWN0Xy53LCB0aGlzLmNhbnZhc1JlY3RfLmgpO1xuICB0cnkge1xuICAgIHRoaXMuZHJhd01pbmlQbG90XygpO1xuICB9IGNhdGNoKGV4KSB7XG4gICAgY29uc29sZS53YXJuKGV4KTtcbiAgfVxuXG4gIHZhciBtYXJnaW4gPSAwLjU7XG4gIHRoaXMuYmdjYW52YXNfY3R4Xy5saW5lV2lkdGggPSB0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JCYWNrZ3JvdW5kTGluZVdpZHRoJyk7XG4gIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvckJhY2tncm91bmRTdHJva2VDb2xvcicpO1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8obWFyZ2luLCBtYXJnaW4pO1xuICBjdHgubGluZVRvKG1hcmdpbiwgdGhpcy5jYW52YXNSZWN0Xy5oLW1hcmdpbik7XG4gIGN0eC5saW5lVG8odGhpcy5jYW52YXNSZWN0Xy53LW1hcmdpbiwgdGhpcy5jYW52YXNSZWN0Xy5oLW1hcmdpbik7XG4gIGN0eC5saW5lVG8odGhpcy5jYW52YXNSZWN0Xy53LW1hcmdpbiwgbWFyZ2luKTtcbiAgY3R4LnN0cm9rZSgpO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogRHJhd3MgdGhlIG1pbmkgcGxvdCBpbiB0aGUgYmFja2dyb3VuZCBjYW52YXMuXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmRyYXdNaW5pUGxvdF8gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZpbGxTdHlsZSA9IHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvclBsb3RGaWxsQ29sb3InKTtcbiAgdmFyIGZpbGxHcmFkaWVudFN0eWxlID0gdGhpcy5nZXRPcHRpb25fKCdyYW5nZVNlbGVjdG9yUGxvdEZpbGxHcmFkaWVudENvbG9yJyk7XG4gIHZhciBzdHJva2VTdHlsZSA9IHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvclBsb3RTdHJva2VDb2xvcicpO1xuICBpZiAoIWZpbGxTdHlsZSAmJiAhc3Ryb2tlU3R5bGUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3RlcFBsb3QgPSB0aGlzLmdldE9wdGlvbl8oJ3N0ZXBQbG90Jyk7XG5cbiAgdmFyIGNvbWJpbmVkU2VyaWVzRGF0YSA9IHRoaXMuY29tcHV0ZUNvbWJpbmVkU2VyaWVzQW5kTGltaXRzXygpO1xuICB2YXIgeVJhbmdlID0gY29tYmluZWRTZXJpZXNEYXRhLnlNYXggLSBjb21iaW5lZFNlcmllc0RhdGEueU1pbjtcblxuICAvLyBEcmF3IHRoZSBtaW5pIHBsb3QuXG4gIHZhciBjdHggPSB0aGlzLmJnY2FudmFzX2N0eF87XG4gIHZhciBtYXJnaW4gPSAwLjU7XG5cbiAgdmFyIHhFeHRyZW1lcyA9IHRoaXMuZHlncmFwaF8ueEF4aXNFeHRyZW1lcygpO1xuICB2YXIgeFJhbmdlID0gTWF0aC5tYXgoeEV4dHJlbWVzWzFdIC0geEV4dHJlbWVzWzBdLCAxLmUtMzApO1xuICB2YXIgeEZhY3QgPSAodGhpcy5jYW52YXNSZWN0Xy53IC0gbWFyZ2luKS94UmFuZ2U7XG4gIHZhciB5RmFjdCA9ICh0aGlzLmNhbnZhc1JlY3RfLmggLSBtYXJnaW4pL3lSYW5nZTtcbiAgdmFyIGNhbnZhc1dpZHRoID0gdGhpcy5jYW52YXNSZWN0Xy53IC0gbWFyZ2luO1xuICB2YXIgY2FudmFzSGVpZ2h0ID0gdGhpcy5jYW52YXNSZWN0Xy5oIC0gbWFyZ2luO1xuXG4gIHZhciBwcmV2WCA9IG51bGwsIHByZXZZID0gbnVsbDtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8obWFyZ2luLCBjYW52YXNIZWlnaHQpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbWJpbmVkU2VyaWVzRGF0YS5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRhdGFQb2ludCA9IGNvbWJpbmVkU2VyaWVzRGF0YS5kYXRhW2ldO1xuICAgIHZhciB4ID0gKChkYXRhUG9pbnRbMF0gIT09IG51bGwpID8gKChkYXRhUG9pbnRbMF0gLSB4RXh0cmVtZXNbMF0pKnhGYWN0KSA6IE5hTik7XG4gICAgdmFyIHkgPSAoKGRhdGFQb2ludFsxXSAhPT0gbnVsbCkgPyAoY2FudmFzSGVpZ2h0IC0gKGRhdGFQb2ludFsxXSAtIGNvbWJpbmVkU2VyaWVzRGF0YS55TWluKSp5RmFjdCkgOiBOYU4pO1xuXG4gICAgLy8gU2tpcCBwb2ludHMgdGhhdCBkb24ndCBjaGFuZ2UgdGhlIHgtdmFsdWUuIE92ZXJseSBmaW5lLWdyYWluZWQgcG9pbnRzXG4gICAgLy8gY2FuIGNhdXNlIG1ham9yIHNsb3dkb3ducyB3aXRoIHRoZSBjdHguZmlsbCgpIGNhbGwgYmVsb3cuXG4gICAgaWYgKCFzdGVwUGxvdCAmJiBwcmV2WCAhPT0gbnVsbCAmJiBNYXRoLnJvdW5kKHgpID09IE1hdGgucm91bmQocHJldlgpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNGaW5pdGUoeCkgJiYgaXNGaW5pdGUoeSkpIHtcbiAgICAgIGlmKHByZXZYID09PSBudWxsKSB7XG4gICAgICAgIGN0eC5saW5lVG8oeCwgY2FudmFzSGVpZ2h0KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHN0ZXBQbG90KSB7XG4gICAgICAgIGN0eC5saW5lVG8oeCwgcHJldlkpO1xuICAgICAgfVxuICAgICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgIHByZXZYID0geDtcbiAgICAgIHByZXZZID0geTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZihwcmV2WCAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoc3RlcFBsb3QpIHtcbiAgICAgICAgICBjdHgubGluZVRvKHgsIHByZXZZKTtcbiAgICAgICAgICBjdHgubGluZVRvKHgsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY3R4LmxpbmVUbyhwcmV2WCwgY2FudmFzSGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHJldlggPSBwcmV2WSA9IG51bGw7XG4gICAgfVxuICB9XG4gIGN0eC5saW5lVG8oY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBpZiAoZmlsbFN0eWxlKSB7XG4gICAgdmFyIGxpbmdyYWQgPSB0aGlzLmJnY2FudmFzX2N0eF8uY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgY2FudmFzSGVpZ2h0KTtcbiAgICBpZiAoZmlsbEdyYWRpZW50U3R5bGUpIHtcbiAgICAgIGxpbmdyYWQuYWRkQ29sb3JTdG9wKDAsIGZpbGxHcmFkaWVudFN0eWxlKTtcbiAgICB9XG4gICAgbGluZ3JhZC5hZGRDb2xvclN0b3AoMSwgZmlsbFN0eWxlKTtcbiAgICB0aGlzLmJnY2FudmFzX2N0eF8uZmlsbFN0eWxlID0gbGluZ3JhZDtcbiAgICBjdHguZmlsbCgpO1xuICB9XG5cbiAgaWYgKHN0cm9rZVN0eWxlKSB7XG4gICAgdGhpcy5iZ2NhbnZhc19jdHhfLnN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGU7XG4gICAgdGhpcy5iZ2NhbnZhc19jdHhfLmxpbmVXaWR0aCA9IHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvclBsb3RMaW5lV2lkdGgnKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIENvbXB1dGVzIGFuZCByZXR1cm5zIHRoZSBjb21iaW5lZCBzZXJpZXMgZGF0YSBhbG9uZyB3aXRoIG1pbi9tYXggZm9yIHRoZSBtaW5pIHBsb3QuXG4gKiBUaGUgY29tYmluZWQgc2VyaWVzIGNvbnNpc3RzIG9mIGF2ZXJhZ2VkIHZhbHVlcyBmb3IgYWxsIHNlcmllcy5cbiAqIFdoZW4gc2VyaWVzIGhhdmUgZXJyb3IgYmFycywgdGhlIGVycm9yIGJhcnMgYXJlIGlnbm9yZWQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCBjb250YWluaW5nIGNvbWJpbmVkIHNlcmllcyBhcnJheSwgeW1pbiwgeW1heC5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuY29tcHV0ZUNvbWJpbmVkU2VyaWVzQW5kTGltaXRzXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZyA9IHRoaXMuZHlncmFwaF87XG4gIHZhciBsb2dzY2FsZSA9IHRoaXMuZ2V0T3B0aW9uXygnbG9nc2NhbGUnKTtcbiAgdmFyIGk7XG5cbiAgLy8gU2VsZWN0IHNlcmllcyB0byBjb21iaW5lLiBCeSBkZWZhdWx0LCBhbGwgc2VyaWVzIGFyZSBjb21iaW5lZC5cbiAgdmFyIG51bUNvbHVtbnMgPSBnLm51bUNvbHVtbnMoKTtcbiAgdmFyIGxhYmVscyA9IGcuZ2V0TGFiZWxzKCk7XG4gIHZhciBpbmNsdWRlU2VyaWVzID0gbmV3IEFycmF5KG51bUNvbHVtbnMpO1xuICB2YXIgYW55U2V0ID0gZmFsc2U7XG4gIHZhciB2aXNpYmlsaXR5ID0gZy52aXNpYmlsaXR5KCk7XG4gIHZhciBpbmNsdXNpb24gPSBbXTtcblxuICBmb3IgKGkgPSAxOyBpIDwgbnVtQ29sdW1uczsgaSsrKSB7XG4gICAgdmFyIGluY2x1ZGUgPSB0aGlzLmdldE9wdGlvbl8oJ3Nob3dJblJhbmdlU2VsZWN0b3InLCBsYWJlbHNbaV0pO1xuICAgIGluY2x1c2lvbi5wdXNoKGluY2x1ZGUpO1xuICAgIGlmIChpbmNsdWRlICE9PSBudWxsKSBhbnlTZXQgPSB0cnVlOyAgLy8gaXQncyBzZXQgZXhwbGljaXRseSBmb3IgdGhpcyBzZXJpZXNcbiAgfVxuXG4gIGlmIChhbnlTZXQpIHtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbnVtQ29sdW1uczsgaSsrKSB7XG4gICAgICBpbmNsdWRlU2VyaWVzW2ldID0gaW5jbHVzaW9uW2kgLSAxXTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMTsgaSA8IG51bUNvbHVtbnM7IGkrKykge1xuICAgICAgaW5jbHVkZVNlcmllc1tpXSA9IHZpc2liaWxpdHlbaSAtIDFdO1xuICAgIH1cbiAgfVxuXG4gIC8vIENyZWF0ZSBhIGNvbWJpbmVkIHNlcmllcyAoYXZlcmFnZSBvZiBzZWxlY3RlZCBzZXJpZXMgdmFsdWVzKS5cbiAgLy8gVE9ETyhkYW52ayk6IHNob3J0LWNpcmN1aXQgaWYgdGhlcmUncyBvbmx5IG9uZSBzZXJpZXMuXG4gIHZhciByb2xsZWRTZXJpZXMgPSBbXTtcbiAgdmFyIGRhdGFIYW5kbGVyID0gZy5kYXRhSGFuZGxlcl87XG4gIHZhciBvcHRpb25zID0gZy5hdHRyaWJ1dGVzXztcbiAgZm9yIChpID0gMTsgaSA8IGcubnVtQ29sdW1ucygpOyBpKyspIHtcbiAgICBpZiAoIWluY2x1ZGVTZXJpZXNbaV0pIGNvbnRpbnVlO1xuICAgIHZhciBzZXJpZXMgPSBkYXRhSGFuZGxlci5leHRyYWN0U2VyaWVzKGcucmF3RGF0YV8sIGksIG9wdGlvbnMpO1xuICAgIGlmIChnLnJvbGxQZXJpb2QoKSA+IDEpIHtcbiAgICAgIHNlcmllcyA9IGRhdGFIYW5kbGVyLnJvbGxpbmdBdmVyYWdlKHNlcmllcywgZy5yb2xsUGVyaW9kKCksIG9wdGlvbnMsIGkpO1xuICAgIH1cblxuICAgIHJvbGxlZFNlcmllcy5wdXNoKHNlcmllcyk7XG4gIH1cblxuICB2YXIgY29tYmluZWRTZXJpZXMgPSBbXTtcbiAgZm9yIChpID0gMDsgaSA8IHJvbGxlZFNlcmllc1swXS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzdW0gPSAwO1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCByb2xsZWRTZXJpZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciB5ID0gcm9sbGVkU2VyaWVzW2pdW2ldWzFdO1xuICAgICAgaWYgKHkgPT09IG51bGwgfHwgaXNOYU4oeSkpIGNvbnRpbnVlO1xuICAgICAgY291bnQrKztcbiAgICAgIHN1bSArPSB5O1xuICAgIH1cbiAgICBjb21iaW5lZFNlcmllcy5wdXNoKFtyb2xsZWRTZXJpZXNbMF1baV1bMF0sIHN1bSAvIGNvdW50XSk7XG4gIH1cblxuICAvLyBDb21wdXRlIHRoZSB5IHJhbmdlLlxuICB2YXIgeU1pbiA9IE51bWJlci5NQVhfVkFMVUU7XG4gIHZhciB5TWF4ID0gLU51bWJlci5NQVhfVkFMVUU7XG4gIGZvciAoaSA9IDA7IGkgPCBjb21iaW5lZFNlcmllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB5VmFsID0gY29tYmluZWRTZXJpZXNbaV1bMV07XG4gICAgaWYgKHlWYWwgIT09IG51bGwgJiYgaXNGaW5pdGUoeVZhbCkgJiYgKCFsb2dzY2FsZSB8fCB5VmFsID4gMCkpIHtcbiAgICAgIHlNaW4gPSBNYXRoLm1pbih5TWluLCB5VmFsKTtcbiAgICAgIHlNYXggPSBNYXRoLm1heCh5TWF4LCB5VmFsKTtcbiAgICB9XG4gIH1cblxuICAvLyBDb252ZXJ0IFkgZGF0YSB0byBsb2cgc2NhbGUgaWYgbmVlZGVkLlxuICAvLyBBbHNvLCBleHBhbmQgdGhlIFkgcmFuZ2UgdG8gY29tcHJlc3MgdGhlIG1pbmkgcGxvdCBhIGxpdHRsZS5cbiAgdmFyIGV4dHJhUGVyY2VudCA9IDAuMjU7XG4gIGlmIChsb2dzY2FsZSkge1xuICAgIHlNYXggPSB1dGlscy5sb2cxMCh5TWF4KTtcbiAgICB5TWF4ICs9IHlNYXgqZXh0cmFQZXJjZW50O1xuICAgIHlNaW4gPSB1dGlscy5sb2cxMCh5TWluKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY29tYmluZWRTZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbWJpbmVkU2VyaWVzW2ldWzFdID0gdXRpbHMubG9nMTAoY29tYmluZWRTZXJpZXNbaV1bMV0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgeUV4dHJhO1xuICAgIHZhciB5UmFuZ2UgPSB5TWF4IC0geU1pbjtcbiAgICBpZiAoeVJhbmdlIDw9IE51bWJlci5NSU5fVkFMVUUpIHtcbiAgICAgIHlFeHRyYSA9IHlNYXgqZXh0cmFQZXJjZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICB5RXh0cmEgPSB5UmFuZ2UqZXh0cmFQZXJjZW50O1xuICAgIH1cbiAgICB5TWF4ICs9IHlFeHRyYTtcbiAgICB5TWluIC09IHlFeHRyYTtcbiAgfVxuXG4gIHJldHVybiB7ZGF0YTogY29tYmluZWRTZXJpZXMsIHlNaW46IHlNaW4sIHlNYXg6IHlNYXh9O1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogUGxhY2VzIHRoZSB6b29tIGhhbmRsZXMgaW4gdGhlIHByb3BlciBwb3NpdGlvbiBiYXNlZCBvbiB0aGUgY3VycmVudCBYIGRhdGEgd2luZG93LlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5wbGFjZVpvb21IYW5kbGVzXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgeEV4dHJlbWVzID0gdGhpcy5keWdyYXBoXy54QXhpc0V4dHJlbWVzKCk7XG4gIHZhciB4V2luZG93TGltaXRzID0gdGhpcy5keWdyYXBoXy54QXhpc1JhbmdlKCk7XG4gIHZhciB4UmFuZ2UgPSB4RXh0cmVtZXNbMV0gLSB4RXh0cmVtZXNbMF07XG4gIHZhciBsZWZ0UGVyY2VudCA9IE1hdGgubWF4KDAsICh4V2luZG93TGltaXRzWzBdIC0geEV4dHJlbWVzWzBdKS94UmFuZ2UpO1xuICB2YXIgcmlnaHRQZXJjZW50ID0gTWF0aC5tYXgoMCwgKHhFeHRyZW1lc1sxXSAtIHhXaW5kb3dMaW1pdHNbMV0pL3hSYW5nZSk7XG4gIHZhciBsZWZ0Q29vcmQgPSB0aGlzLmNhbnZhc1JlY3RfLnggKyB0aGlzLmNhbnZhc1JlY3RfLncqbGVmdFBlcmNlbnQ7XG4gIHZhciByaWdodENvb3JkID0gdGhpcy5jYW52YXNSZWN0Xy54ICsgdGhpcy5jYW52YXNSZWN0Xy53KigxIC0gcmlnaHRQZXJjZW50KTtcbiAgdmFyIGhhbmRsZVRvcCA9IE1hdGgubWF4KHRoaXMuY2FudmFzUmVjdF8ueSwgdGhpcy5jYW52YXNSZWN0Xy55ICsgKHRoaXMuY2FudmFzUmVjdF8uaCAtIHRoaXMubGVmdFpvb21IYW5kbGVfLmhlaWdodCkvMik7XG4gIHZhciBoYWxmSGFuZGxlV2lkdGggPSB0aGlzLmxlZnRab29tSGFuZGxlXy53aWR0aC8yO1xuICB0aGlzLmxlZnRab29tSGFuZGxlXy5zdHlsZS5sZWZ0ID0gKGxlZnRDb29yZCAtIGhhbGZIYW5kbGVXaWR0aCkgKyAncHgnO1xuICB0aGlzLmxlZnRab29tSGFuZGxlXy5zdHlsZS50b3AgPSBoYW5kbGVUb3AgKyAncHgnO1xuICB0aGlzLnJpZ2h0Wm9vbUhhbmRsZV8uc3R5bGUubGVmdCA9IChyaWdodENvb3JkIC0gaGFsZkhhbmRsZVdpZHRoKSArICdweCc7XG4gIHRoaXMucmlnaHRab29tSGFuZGxlXy5zdHlsZS50b3AgPSB0aGlzLmxlZnRab29tSGFuZGxlXy5zdHlsZS50b3A7XG5cbiAgdGhpcy5sZWZ0Wm9vbUhhbmRsZV8uc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgdGhpcy5yaWdodFpvb21IYW5kbGVfLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBEcmF3cyB0aGUgaW50ZXJhY3RpdmUgbGF5ZXIgaW4gdGhlIGZvcmVncm91bmQgY2FudmFzLlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5kcmF3SW50ZXJhY3RpdmVMYXllcl8gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGN0eCA9IHRoaXMuZmdjYW52YXNfY3R4XztcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhc1JlY3RfLncsIHRoaXMuY2FudmFzUmVjdF8uaCk7XG4gIHZhciBtYXJnaW4gPSAxO1xuICB2YXIgd2lkdGggPSB0aGlzLmNhbnZhc1JlY3RfLncgLSBtYXJnaW47XG4gIHZhciBoZWlnaHQgPSB0aGlzLmNhbnZhc1JlY3RfLmggLSBtYXJnaW47XG4gIHZhciB6b29tSGFuZGxlU3RhdHVzID0gdGhpcy5nZXRab29tSGFuZGxlU3RhdHVzXygpO1xuXG4gIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvckZvcmVncm91bmRTdHJva2VDb2xvcicpO1xuICBjdHgubGluZVdpZHRoID0gdGhpcy5nZXRPcHRpb25fKCdyYW5nZVNlbGVjdG9yRm9yZWdyb3VuZExpbmVXaWR0aCcpO1xuICBpZiAoIXpvb21IYW5kbGVTdGF0dXMuaXNab29tZWQpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbyhtYXJnaW4sIG1hcmdpbik7XG4gICAgY3R4LmxpbmVUbyhtYXJnaW4sIGhlaWdodCk7XG4gICAgY3R4LmxpbmVUbyh3aWR0aCwgaGVpZ2h0KTtcbiAgICBjdHgubGluZVRvKHdpZHRoLCBtYXJnaW4pO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVmdEhhbmRsZUNhbnZhc1BvcyA9IE1hdGgubWF4KG1hcmdpbiwgem9vbUhhbmRsZVN0YXR1cy5sZWZ0SGFuZGxlUG9zIC0gdGhpcy5jYW52YXNSZWN0Xy54KTtcbiAgICB2YXIgcmlnaHRIYW5kbGVDYW52YXNQb3MgPSBNYXRoLm1pbih3aWR0aCwgem9vbUhhbmRsZVN0YXR1cy5yaWdodEhhbmRsZVBvcyAtIHRoaXMuY2FudmFzUmVjdF8ueCk7XG5cbiAgICBjb25zdCB2ZWlsQ29sb3VyID0gdGhpcy5nZXRPcHRpb25fKCdyYW5nZVNlbGVjdG9yVmVpbENvbG91cicpO1xuICAgIGN0eC5maWxsU3R5bGUgPSB2ZWlsQ29sb3VyID8gdmVpbENvbG91ciA6XG4gICAgICAoJ3JnYmEoMjQwLCAyNDAsIDI0MCwgJyArIHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvckFscGhhJykudG9TdHJpbmcoKSArICcpJyk7XG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIGxlZnRIYW5kbGVDYW52YXNQb3MsIHRoaXMuY2FudmFzUmVjdF8uaCk7XG4gICAgY3R4LmZpbGxSZWN0KHJpZ2h0SGFuZGxlQ2FudmFzUG9zLCAwLCB0aGlzLmNhbnZhc1JlY3RfLncgLSByaWdodEhhbmRsZUNhbnZhc1BvcywgdGhpcy5jYW52YXNSZWN0Xy5oKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKG1hcmdpbiwgbWFyZ2luKTtcbiAgICBjdHgubGluZVRvKGxlZnRIYW5kbGVDYW52YXNQb3MsIG1hcmdpbik7XG4gICAgY3R4LmxpbmVUbyhsZWZ0SGFuZGxlQ2FudmFzUG9zLCBoZWlnaHQpO1xuICAgIGN0eC5saW5lVG8ocmlnaHRIYW5kbGVDYW52YXNQb3MsIGhlaWdodCk7XG4gICAgY3R4LmxpbmVUbyhyaWdodEhhbmRsZUNhbnZhc1BvcywgbWFyZ2luKTtcbiAgICBjdHgubGluZVRvKHdpZHRoLCBtYXJnaW4pO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogUmV0dXJucyB0aGUgY3VycmVudCB6b29tIGhhbmRsZSBwb3NpdGlvbiBpbmZvcm1hdGlvbi5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHpvb20gaGFuZGxlIHN0YXR1cy5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuZ2V0Wm9vbUhhbmRsZVN0YXR1c18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhhbGZIYW5kbGVXaWR0aCA9IHRoaXMubGVmdFpvb21IYW5kbGVfLndpZHRoLzI7XG4gIHZhciBsZWZ0SGFuZGxlUG9zID0gcGFyc2VGbG9hdCh0aGlzLmxlZnRab29tSGFuZGxlXy5zdHlsZS5sZWZ0KSArIGhhbGZIYW5kbGVXaWR0aDtcbiAgdmFyIHJpZ2h0SGFuZGxlUG9zID0gcGFyc2VGbG9hdCh0aGlzLnJpZ2h0Wm9vbUhhbmRsZV8uc3R5bGUubGVmdCkgKyBoYWxmSGFuZGxlV2lkdGg7XG4gIHJldHVybiB7XG4gICAgICBsZWZ0SGFuZGxlUG9zOiBsZWZ0SGFuZGxlUG9zLFxuICAgICAgcmlnaHRIYW5kbGVQb3M6IHJpZ2h0SGFuZGxlUG9zLFxuICAgICAgaXNab29tZWQ6IChsZWZ0SGFuZGxlUG9zIC0gMSA+IHRoaXMuY2FudmFzUmVjdF8ueCB8fCByaWdodEhhbmRsZVBvcyArIDEgPCB0aGlzLmNhbnZhc1JlY3RfLngrdGhpcy5jYW52YXNSZWN0Xy53KVxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgcmFuZ2VTZWxlY3RvcjtcbiJdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWTs7QUFFWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFBQUEsTUFBQSxDQUFBQyxjQUFBLENBQUFDLE9BQUE7RUFBQUMsS0FBQTtBQUFBO0FBQUFELE9BQUE7QUFFQSxJQUFBRSxLQUFBLEdBQUFDLHVCQUFBLENBQUFDLE9BQUE7QUFDQSxJQUFBQyx3QkFBQSxHQUFBQyxzQkFBQSxDQUFBRixPQUFB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