'use strict';

/**
 * @license
 * Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */

/**
 * @fileoverview Creates an interactive, zoomable graph based on a CSV file or
 * string. Dygraph can handle multiple series with or without high/low bands.
 * The date/value ranges will be automatically set. Dygraph uses the
 * &lt;canvas&gt; tag, so it only works in FF1.5+.
 * See the source or https://dygraphs.com/ for more information.
 * @author danvdk@gmail.com (Dan Vanderkam)
 */

/*
  Usage:
   <div id="graphdiv" style="width:800px; height:500px;"></div>
   <script type="text/javascript"><!--//--><![CDATA[//><!--
   $(function onDOMready() {
     new Dygraph(document.getElementById("graphdiv"),
                 "datafile.csv",  // CSV file with headers
                 { }); // options
   });
   //--><!]]></script>

 The CSV file is of the form

   Date,SeriesA,SeriesB,SeriesC
   YYYY-MM-DD,A1,B1,C1
   YYYY-MM-DD,A2,B2,C2

 If the 'errorBars' option is set in the constructor, the input should be of
 the form
   Date,SeriesA,SeriesB,...
   YYYY-MM-DD,A1,sigmaA1,B1,sigmaB1,...
   YYYY-MM-DD,A2,sigmaA2,B2,sigmaB2,...

 If the 'fractions' option is set, the input should be of the form:

   Date,SeriesA,SeriesB,...
   YYYY-MM-DD,A1/B1,A2/B2,...
   YYYY-MM-DD,A1/B1,A2/B2,...

 And high/low bands will be calculated automatically using a binomial distribution.

 For further documentation and examples, see https://dygraphs.com/
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _dygraphLayout = _interopRequireDefault(require("./dygraph-layout"));
var _dygraphCanvas = _interopRequireDefault(require("./dygraph-canvas"));
var _dygraphOptions = _interopRequireDefault(require("./dygraph-options"));
var _dygraphInteractionModel = _interopRequireDefault(require("./dygraph-interaction-model"));
var DygraphTickers = _interopRequireWildcard(require("./dygraph-tickers"));
var utils = _interopRequireWildcard(require("./dygraph-utils"));
var _dygraphDefaultAttrs = _interopRequireDefault(require("./dygraph-default-attrs"));
var _dygraphOptionsReference = _interopRequireDefault(require("./dygraph-options-reference"));
var _iframeTarp = _interopRequireDefault(require("./iframe-tarp"));
var _default2 = _interopRequireDefault(require("./datahandler/default"));
var _barsError = _interopRequireDefault(require("./datahandler/bars-error"));
var _barsCustom = _interopRequireDefault(require("./datahandler/bars-custom"));
var _defaultFractions = _interopRequireDefault(require("./datahandler/default-fractions"));
var _barsFractions = _interopRequireDefault(require("./datahandler/bars-fractions"));
var _bars = _interopRequireDefault(require("./datahandler/bars"));
var _annotations = _interopRequireDefault(require("./plugins/annotations"));
var _axes = _interopRequireDefault(require("./plugins/axes"));
var _chartLabels = _interopRequireDefault(require("./plugins/chart-labels"));
var _grid = _interopRequireDefault(require("./plugins/grid"));
var _legend = _interopRequireDefault(require("./plugins/legend"));
var _rangeSelector = _interopRequireDefault(require("./plugins/range-selector"));
var _dygraphGviz = _interopRequireDefault(require("./dygraph-gviz"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * @class Creates an interactive, zoomable chart.
 * @name Dygraph
 *
 * @constructor
 * @param {div | String} div A div or the id of a div into which to construct
 * the chart. Must not have any padding.
 * @param {String | Function} file A file containing CSV data or a function
 * that returns this data. The most basic expected format for each line is:
 * "YYYY/MM/DD,val1,val2,..."
 * For more information, see: https://dygraphs.com/data.html
 *
 * @param {Object} attrs Various other attributes, e.g. errorBars determines
 * whether the input data contains error ranges. For a complete list of
 * options, see: https://dygraphs.com/options.html
 */
var Dygraph = function Dygraph(div, data, opts) {
  this.__init__(div, data, opts);
};
Dygraph.NAME = "Dygraph";
Dygraph.VERSION = "2.2.2";

// internal autoloader workaround
var _addrequire = {};
Dygraph._require = function require(what) {
  return what in _addrequire ? _addrequire[what] : Dygraph._require._b(what);
};
Dygraph._require._b = null; // set by xfrmmodmap-dy.js
Dygraph._require.add = function add(what, towhat) {
  _addrequire[what] = towhat;
};

// Various default values
Dygraph.DEFAULT_ROLL_PERIOD = 1;
Dygraph.DEFAULT_WIDTH = 480;
Dygraph.DEFAULT_HEIGHT = 320;

// For max 60 Hz. animation:
Dygraph.ANIMATION_STEPS = 12;
Dygraph.ANIMATION_DURATION = 200;

/**
 * Standard plotters. These may be used by clients.
 * Available plotters are:
 * - Dygraph.Plotters.linePlotter: draws central lines (most common)
 * - Dygraph.Plotters.errorPlotter: draws high/low bands
 * - Dygraph.Plotters.fillPlotter: draws fills under lines (used with fillGraph)
 *
 * By default, the plotter is [fillPlotter, errorPlotter, linePlotter].
 * This causes all the lines to be drawn over all the fills/bands.
 */
Dygraph.Plotters = _dygraphCanvas["default"]._Plotters;

// Used for initializing annotation CSS rules only once.
Dygraph.addedAnnotationCSS = false;

/**
 * Initializes the Dygraph. This creates a new DIV and constructs the PlotKit
 * and context &lt;canvas&gt; inside of it. See the constructor for details.
 * on the parameters.
 * @param {Element} div the Element to render the graph into.
 * @param {string | Function} file Source data
 * @param {Object} attrs Miscellaneous other options
 * @private
 */
Dygraph.prototype.__init__ = function (div, file, attrs) {
  this.is_initial_draw_ = true;
  this.readyFns_ = [];

  // Support two-argument constructor
  if (attrs === null || attrs === undefined) {
    attrs = {};
  }
  attrs = Dygraph.copyUserAttrs_(attrs);
  if (typeof div == 'string') {
    div = document.getElementById(div);
  }
  if (!div) {
    throw new Error('Constructing dygraph with a non-existent div!');
  }

  // Copy the important bits into the object
  // TODO(danvk): most of these should just stay in the attrs_ dictionary.
  this.maindiv_ = div;
  this.file_ = file;
  this.rollPeriod_ = attrs.rollPeriod || Dygraph.DEFAULT_ROLL_PERIOD;
  this.previousVerticalX_ = -1;
  this.fractions_ = attrs.fractions || false;
  this.dateWindow_ = attrs.dateWindow || null;
  this.annotations_ = [];

  // Clear the div. This ensure that, if multiple dygraphs are passed the same
  // div, then only one will be drawn.
  div.innerHTML = "";
  var resolved = window.getComputedStyle(div, null);
  if (resolved.paddingLeft !== "0px" || resolved.paddingRight !== "0px" || resolved.paddingTop !== "0px" || resolved.paddingBottom !== "0px") console.error('Main div contains padding; graph will misbehave');

  // For historical reasons, the 'width' and 'height' options trump all CSS
  // rules _except_ for an explicit 'width' or 'height' on the div.
  // As an added convenience, if the div has zero height (like <div></div> does
  // without any styles), then we use a default height/width.
  if (div.style.width === '' && attrs.width) {
    div.style.width = attrs.width + "px";
  }
  if (div.style.height === '' && attrs.height) {
    div.style.height = attrs.height + "px";
  }
  if (div.style.height === '' && div.clientHeight === 0) {
    div.style.height = Dygraph.DEFAULT_HEIGHT + "px";
    if (div.style.width === '') {
      div.style.width = Dygraph.DEFAULT_WIDTH + "px";
    }
  }
  // These will be zero if the dygraph's div is hidden. In that case,
  // use the user-specified attributes if present. If not, use zero
  // and assume the user will call resize to fix things later.
  this.width_ = div.clientWidth || attrs.width || 0;
  this.height_ = div.clientHeight || attrs.height || 0;

  // TODO(danvk): set fillGraph to be part of attrs_ here, not user_attrs_.
  if (attrs.stackedGraph) {
    attrs.fillGraph = true;
    // TODO(nikhilk): Add any other stackedGraph checks here.
  }

  // DEPRECATION WARNING: All option processing should be moved from
  // attrs_ and user_attrs_ to options_, which holds all this information.
  //
  // Dygraphs has many options, some of which interact with one another.
  // To keep track of everything, we maintain two sets of options:
  //
  //  this.user_attrs_   only options explicitly set by the user.
  //  this.attrs_        defaults, options derived from user_attrs_, data.
  //
  // Options are then accessed this.attr_('attr'), which first looks at
  // user_attrs_ and then computed attrs_. This way Dygraphs can set intelligent
  // defaults without overriding behavior that the user specifically asks for.
  this.user_attrs_ = {};
  utils.update(this.user_attrs_, attrs);

  // This sequence ensures that Dygraph.DEFAULT_ATTRS is never modified.
  this.attrs_ = {};
  utils.updateDeep(this.attrs_, _dygraphDefaultAttrs["default"]);
  this.boundaryIds_ = [];
  this.setIndexByName_ = {};
  this.datasetIndex_ = [];
  this.registeredEvents_ = [];
  this.eventListeners_ = {};
  this.attributes_ = new _dygraphOptions["default"](this);

  // Create the containing DIV and other interactive elements
  this.createInterface_();

  // Activate plugins.
  this.plugins_ = [];
  var plugins = Dygraph.PLUGINS.concat(this.getOption('plugins'));
  for (var i = 0; i < plugins.length; i++) {
    // the plugins option may contain either plugin classes or instances.
    // Plugin instances contain an activate method.
    var Plugin = plugins[i]; // either a constructor or an instance.
    var pluginInstance;
    if (typeof Plugin.activate !== 'undefined') {
      pluginInstance = Plugin;
    } else {
      pluginInstance = new Plugin();
    }
    var pluginDict = {
      plugin: pluginInstance,
      events: {},
      options: {},
      pluginOptions: {}
    };
    var handlers = pluginInstance.activate(this);
    for (var eventName in handlers) {
      if (!handlers.hasOwnProperty(eventName)) continue;
      // TODO(danvk): validate eventName.
      pluginDict.events[eventName] = handlers[eventName];
    }
    this.plugins_.push(pluginDict);
  }

  // At this point, plugins can no longer register event handlers.
  // Construct a map from event -> ordered list of [callback, plugin].
  for (var i = 0; i < this.plugins_.length; i++) {
    var plugin_dict = this.plugins_[i];
    for (var eventName in plugin_dict.events) {
      if (!plugin_dict.events.hasOwnProperty(eventName)) continue;
      var callback = plugin_dict.events[eventName];
      var pair = [plugin_dict.plugin, callback];
      if (!(eventName in this.eventListeners_)) {
        this.eventListeners_[eventName] = [pair];
      } else {
        this.eventListeners_[eventName].push(pair);
      }
    }
  }
  this.createDragInterface_();
  this.start_();
};

/**
 * Triggers a cascade of events to the various plugins which are interested in them.
 * Returns true if the "default behavior" should be prevented, i.e. if one
 * of the event listeners called event.preventDefault().
 * @private
 */
Dygraph.prototype.cascadeEvents_ = function (name, extra_props) {
  if (!(name in this.eventListeners_)) return false;

  // QUESTION: can we use objects & prototypes to speed this up?
  var e = {
    dygraph: this,
    cancelable: false,
    defaultPrevented: false,
    preventDefault: function preventDefault() {
      if (!e.cancelable) throw "Cannot call preventDefault on non-cancelable event.";
      e.defaultPrevented = true;
    },
    propagationStopped: false,
    stopPropagation: function stopPropagation() {
      e.propagationStopped = true;
    }
  };
  utils.update(e, extra_props);
  var callback_plugin_pairs = this.eventListeners_[name];
  if (callback_plugin_pairs) {
    for (var i = callback_plugin_pairs.length - 1; i >= 0; i--) {
      var plugin = callback_plugin_pairs[i][0];
      var callback = callback_plugin_pairs[i][1];
      callback.call(plugin, e);
      if (e.propagationStopped) break;
    }
  }
  return e.defaultPrevented;
};

/**
 * Fetch a plugin instance of a particular class. Only for testing.
 * @private
 * @param {!Class} type The type of the plugin.
 * @return {Object} Instance of the plugin, or null if there is none.
 */
Dygraph.prototype.getPluginInstance_ = function (type) {
  for (var i = 0; i < this.plugins_.length; i++) {
    var p = this.plugins_[i];
    if (p.plugin instanceof type) {
      return p.plugin;
    }
  }
  return null;
};

/**
 * Returns the zoomed status of the chart for one or both axes.
 *
 * Axis is an optional parameter. Can be set to 'x' or 'y'.
 *
 * The zoomed status for an axis is set whenever a user zooms using the mouse
 * or when the dateWindow or valueRange are updated. Double-clicking or calling
 * resetZoom() resets the zoom status for the chart.
 */
Dygraph.prototype.isZoomed = function (axis) {
  var isZoomedX = !!this.dateWindow_;
  if (axis === 'x') return isZoomedX;
  var isZoomedY = this.axes_.map(function (axis) {
    return !!axis.valueRange;
  }).indexOf(true) >= 0;
  if (axis === null || axis === undefined) {
    return isZoomedX || isZoomedY;
  }
  if (axis === 'y') return isZoomedY;
  throw new Error("axis parameter is [".concat(axis, "] must be null, 'x' or 'y'."));
};

/**
 * Returns information about the Dygraph object, including its containing ID.
 */
Dygraph.prototype.toString = function () {
  var maindiv = this.maindiv_;
  var id = maindiv && maindiv.id ? maindiv.id : maindiv;
  return "[Dygraph " + id + "]";
};

/**
 * @private
 * Returns the value of an option. This may be set by the user (either in the
 * constructor or by calling updateOptions) or by dygraphs, and may be set to a
 * per-series value.
 * @param {string} name The name of the option, e.g. 'rollPeriod'.
 * @param {string} [seriesName] The name of the series to which the option
 * will be applied. If no per-series value of this option is available, then
 * the global value is returned. This is optional.
 * @return {...} The value of the option.
 */
Dygraph.prototype.attr_ = function (name, seriesName) {
  if (typeof process !== 'undefined' && process.env.NODE_ENV != 'production') {
    // For "production" code, this gets removed by uglifyjs.
    if (typeof _dygraphOptionsReference["default"] === 'undefined') {
      console.error('Must include options reference JS for testing');
    } else if (!_dygraphOptionsReference["default"].hasOwnProperty(name)) {
      console.error('Dygraphs is using property ' + name + ', which has no ' + 'entry in the Dygraphs.OPTIONS_REFERENCE listing.');
      // Only log this error once.
      _dygraphOptionsReference["default"][name] = true;
    }
  }
  return seriesName ? this.attributes_.getForSeries(name, seriesName) : this.attributes_.get(name);
};

/**
 * Returns the current value for an option, as set in the constructor or via
 * updateOptions. You may pass in an (optional) series name to get per-series
 * values for the option.
 *
 * All values returned by this method should be considered immutable. If you
 * modify them, there is no guarantee that the changes will be honored or that
 * dygraphs will remain in a consistent state. If you want to modify an option,
 * use updateOptions() instead.
 *
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {*} The value of the option.
 */
Dygraph.prototype.getOption = function (name, opt_seriesName) {
  return this.attr_(name, opt_seriesName);
};

/**
 * Like getOption(), but specifically returns a number.
 * This is a convenience function for working with the Closure Compiler.
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {number} The value of the option.
 * @private
 */
Dygraph.prototype.getNumericOption = function (name, opt_seriesName) {
  return /** @type{number} */this.getOption(name, opt_seriesName);
};

/**
 * Like getOption(), but specifically returns a string.
 * This is a convenience function for working with the Closure Compiler.
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {string} The value of the option.
 * @private
 */
Dygraph.prototype.getStringOption = function (name, opt_seriesName) {
  return /** @type{string} */this.getOption(name, opt_seriesName);
};

/**
 * Like getOption(), but specifically returns a boolean.
 * This is a convenience function for working with the Closure Compiler.
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {boolean} The value of the option.
 * @private
 */
Dygraph.prototype.getBooleanOption = function (name, opt_seriesName) {
  return /** @type{boolean} */this.getOption(name, opt_seriesName);
};

/**
 * Like getOption(), but specifically returns a function.
 * This is a convenience function for working with the Closure Compiler.
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {function(...)} The value of the option.
 * @private
 */
Dygraph.prototype.getFunctionOption = function (name, opt_seriesName) {
  return /** @type{function(...)} */this.getOption(name, opt_seriesName);
};
Dygraph.prototype.getOptionForAxis = function (name, axis) {
  return this.attributes_.getForAxis(name, axis);
};

/**
 * @private
 * @param {string} axis The name of the axis (i.e. 'x', 'y' or 'y2')
 * @return {...} A function mapping string -> option value
 */
Dygraph.prototype.optionsViewForAxis_ = function (axis) {
  var self = this;
  return function (opt) {
    var axis_opts = self.user_attrs_.axes;
    if (axis_opts && axis_opts[axis] && axis_opts[axis].hasOwnProperty(opt)) {
      return axis_opts[axis][opt];
    }

    // I don't like that this is in a second spot.
    if (axis === 'x' && opt === 'logscale') {
      // return the default value.
      // TODO(konigsberg): pull the default from a global default.
      return false;
    }

    // user-specified attributes always trump defaults, even if they're less
    // specific.
    if (typeof self.user_attrs_[opt] != 'undefined') {
      return self.user_attrs_[opt];
    }
    axis_opts = self.attrs_.axes;
    if (axis_opts && axis_opts[axis] && axis_opts[axis].hasOwnProperty(opt)) {
      return axis_opts[axis][opt];
    }
    // check old-style axis options
    // TODO(danvk): add a deprecation warning if either of these match.
    if (axis == 'y' && self.axes_[0].hasOwnProperty(opt)) {
      return self.axes_[0][opt];
    } else if (axis == 'y2' && self.axes_[1].hasOwnProperty(opt)) {
      return self.axes_[1][opt];
    }
    return self.attr_(opt);
  };
};

/**
 * Returns the current rolling period, as set by the user or an option.
 * @return {number} The number of points in the rolling window
 */
Dygraph.prototype.rollPeriod = function () {
  return this.rollPeriod_;
};

/**
 * Returns the currently-visible x-range. This can be affected by zooming,
 * panning or a call to updateOptions.
 * Returns a two-element array: [left, right].
 * If the Dygraph has dates on the x-axis, these will be millis since epoch.
 */
Dygraph.prototype.xAxisRange = function () {
  return this.dateWindow_ ? this.dateWindow_ : this.xAxisExtremes();
};

/**
 * Returns the lower- and upper-bound x-axis values of the data set.
 */
Dygraph.prototype.xAxisExtremes = function () {
  var pad = this.getNumericOption('xRangePad') / this.plotter_.area.w;
  if (this.numRows() === 0) {
    return [0 - pad, 1 + pad];
  }
  var left = this.rawData_[0][0];
  var right = this.rawData_[this.rawData_.length - 1][0];
  if (pad) {
    // Must keep this in sync with dygraph-layout _evaluateLimits()
    var range = right - left;
    left -= range * pad;
    right += range * pad;
  }
  return [left, right];
};

/**
 * Returns the lower- and upper-bound y-axis values for each axis. These are
 * the ranges you'll get if you double-click to zoom out or call resetZoom().
 * The return value is an array of [low, high] tuples, one for each y-axis.
 */
Dygraph.prototype.yAxisExtremes = function () {
  // TODO(danvk): this is pretty inefficient
  var packed = this.gatherDatasets_(this.rolledSeries_, null);
  var extremes = packed.extremes;
  var saveAxes = this.axes_;
  this.computeYAxisRanges_(extremes);
  var newAxes = this.axes_;
  this.axes_ = saveAxes;
  return newAxes.map(function (axis) {
    return axis.extremeRange;
  });
};

/**
 * Returns the currently-visible y-range for an axis. This can be affected by
 * zooming, panning or a call to updateOptions. Axis indices are zero-based. If
 * called with no arguments, returns the range of the first axis.
 * Returns a two-element array: [bottom, top].
 */
Dygraph.prototype.yAxisRange = function (idx) {
  if (typeof idx == "undefined") idx = 0;
  if (idx < 0 || idx >= this.axes_.length) {
    return null;
  }
  var axis = this.axes_[idx];
  return [axis.computedValueRange[0], axis.computedValueRange[1]];
};

/**
 * Returns the currently-visible y-ranges for each axis. This can be affected by
 * zooming, panning, calls to updateOptions, etc.
 * Returns an array of [bottom, top] pairs, one for each y-axis.
 */
Dygraph.prototype.yAxisRanges = function () {
  var ret = [];
  for (var i = 0; i < this.axes_.length; i++) {
    ret.push(this.yAxisRange(i));
  }
  return ret;
};

// TODO(danvk): use these functions throughout dygraphs.
/**
 * Convert from data coordinates to canvas/div X/Y coordinates.
 * If specified, do this conversion for the coordinate system of a particular
 * axis. Uses the first axis by default.
 * Returns a two-element array: [X, Y]
 *
 * Note: use toDomXCoord instead of toDomCoords(x, null) and use toDomYCoord
 * instead of toDomCoords(null, y, axis).
 */
Dygraph.prototype.toDomCoords = function (x, y, axis) {
  return [this.toDomXCoord(x), this.toDomYCoord(y, axis)];
};

/**
 * Convert from data x coordinates to canvas/div X coordinate.
 * If specified, do this conversion for the coordinate system of a particular
 * axis.
 * Returns a single value or null if x is null.
 */
Dygraph.prototype.toDomXCoord = function (x) {
  if (x === null) {
    return null;
  }
  var area = this.plotter_.area;
  var xRange = this.xAxisRange();
  return area.x + (x - xRange[0]) / (xRange[1] - xRange[0]) * area.w;
};

/**
 * Convert from data x coordinates to canvas/div Y coordinate and optional
 * axis. Uses the first axis by default.
 *
 * returns a single value or null if y is null.
 */
Dygraph.prototype.toDomYCoord = function (y, axis) {
  var pct = this.toPercentYCoord(y, axis);
  if (pct === null) {
    return null;
  }
  var area = this.plotter_.area;
  return area.y + pct * area.h;
};

/**
 * Convert from canvas/div coords to data coordinates.
 * If specified, do this conversion for the coordinate system of a particular
 * axis. Uses the first axis by default.
 * Returns a two-element array: [X, Y].
 *
 * Note: use toDataXCoord instead of toDataCoords(x, null) and use toDataYCoord
 * instead of toDataCoords(null, y, axis).
 */
Dygraph.prototype.toDataCoords = function (x, y, axis) {
  return [this.toDataXCoord(x), this.toDataYCoord(y, axis)];
};

/**
 * Convert from canvas/div x coordinate to data coordinate.
 *
 * If x is null, this returns null.
 */
Dygraph.prototype.toDataXCoord = function (x) {
  if (x === null) {
    return null;
  }
  var area = this.plotter_.area;
  var xRange = this.xAxisRange();
  if (!this.attributes_.getForAxis("logscale", 'x')) {
    return xRange[0] + (x - area.x) / area.w * (xRange[1] - xRange[0]);
  } else {
    var pct = (x - area.x) / area.w;
    return utils.logRangeFraction(xRange[0], xRange[1], pct);
  }
};

/**
 * Convert from canvas/div y coord to value.
 *
 * If y is null, this returns null.
 * if axis is null, this uses the first axis.
 */
Dygraph.prototype.toDataYCoord = function (y, axis) {
  if (y === null) {
    return null;
  }
  var area = this.plotter_.area;
  var yRange = this.yAxisRange(axis);
  if (typeof axis == "undefined") axis = 0;
  if (!this.attributes_.getForAxis("logscale", axis)) {
    return yRange[0] + (area.y + area.h - y) / area.h * (yRange[1] - yRange[0]);
  } else {
    // Computing the inverse of toDomCoord.
    var pct = (y - area.y) / area.h;
    // Note reversed yRange, y1 is on top with pct==0.
    return utils.logRangeFraction(yRange[1], yRange[0], pct);
  }
};

/**
 * Converts a y for an axis to a percentage from the top to the
 * bottom of the drawing area.
 *
 * If the coordinate represents a value visible on the canvas, then
 * the value will be between 0 and 1, where 0 is the top of the canvas.
 * However, this method will return values outside the range, as
 * values can fall outside the canvas.
 *
 * If y is null, this returns null.
 * if axis is null, this uses the first axis.
 *
 * @param {number} y The data y-coordinate.
 * @param {number} [axis] The axis number on which the data coordinate lives.
 * @return {number} A fraction in [0, 1] where 0 = the top edge.
 */
Dygraph.prototype.toPercentYCoord = function (y, axis) {
  if (y === null) {
    return null;
  }
  if (typeof axis == "undefined") axis = 0;
  var yRange = this.yAxisRange(axis);
  var pct;
  var logscale = this.attributes_.getForAxis("logscale", axis);
  if (logscale) {
    var logr0 = utils.log10(yRange[0]);
    var logr1 = utils.log10(yRange[1]);
    pct = (logr1 - utils.log10(y)) / (logr1 - logr0);
  } else {
    // yRange[1] - y is unit distance from the bottom.
    // yRange[1] - yRange[0] is the scale of the range.
    // (yRange[1] - y) / (yRange[1] - yRange[0]) is the % from the bottom.
    pct = (yRange[1] - y) / (yRange[1] - yRange[0]);
  }
  return pct;
};

/**
 * Converts an x value to a percentage from the left to the right of
 * the drawing area.
 *
 * If the coordinate represents a value visible on the canvas, then
 * the value will be between 0 and 1, where 0 is the left of the canvas.
 * However, this method will return values outside the range, as
 * values can fall outside the canvas.
 *
 * If x is null, this returns null.
 * @param {number} x The data x-coordinate.
 * @return {number} A fraction in [0, 1] where 0 = the left edge.
 */
Dygraph.prototype.toPercentXCoord = function (x) {
  if (x === null) {
    return null;
  }
  var xRange = this.xAxisRange();
  var pct;
  var logscale = this.attributes_.getForAxis("logscale", 'x');
  if (logscale === true) {
    // logscale can be null so we test for true explicitly.
    var logr0 = utils.log10(xRange[0]);
    var logr1 = utils.log10(xRange[1]);
    pct = (utils.log10(x) - logr0) / (logr1 - logr0);
  } else {
    // x - xRange[0] is unit distance from the left.
    // xRange[1] - xRange[0] is the scale of the range.
    // The full expression below is the % from the left.
    pct = (x - xRange[0]) / (xRange[1] - xRange[0]);
  }
  return pct;
};

/**
 * Returns the number of columns (including the independent variable).
 * @return {number} The number of columns.
 */
Dygraph.prototype.numColumns = function () {
  if (!this.rawData_) return 0;
  return this.rawData_[0] ? this.rawData_[0].length : this.attr_("labels").length;
};

/**
 * Returns the number of rows (excluding any header/label row).
 * @return {number} The number of rows, less any header.
 */
Dygraph.prototype.numRows = function () {
  if (!this.rawData_) return 0;
  return this.rawData_.length;
};

/**
 * Returns the value in the given row and column. If the row and column exceed
 * the bounds on the data, returns null. Also returns null if the value is
 * missing.
 * @param {number} row The row number of the data (0-based). Row 0 is the
 *     first row of data, not a header row.
 * @param {number} col The column number of the data (0-based)
 * @return {number} The value in the specified cell or null if the row/col
 *     were out of range.
 */
Dygraph.prototype.getValue = function (row, col) {
  if (row < 0 || row >= this.rawData_.length) return null;
  if (col < 0 || col >= this.rawData_[row].length) return null;
  return this.rawData_[row][col];
};

/**
 * Generates interface elements for the Dygraph: a containing div, a div to
 * display the current point, and a textbox to adjust the rolling average
 * period. Also creates the Renderer/Layout elements.
 * @private
 */
Dygraph.prototype.createInterface_ = function () {
  // Create the all-enclosing graph div
  var enclosing = this.maindiv_;
  this.graphDiv = document.createElement("div");

  // TODO(danvk): any other styles that are useful to set here?
  this.graphDiv.style.textAlign = 'left'; // This is a CSS "reset"
  this.graphDiv.style.position = 'relative';
  enclosing.appendChild(this.graphDiv);

  // Create the canvas for interactive parts of the chart.
  this.canvas_ = utils.createCanvas();
  this.canvas_.style.position = "absolute";
  this.canvas_.style.top = 0;
  this.canvas_.style.left = 0;

  // ... and for static parts of the chart.
  this.hidden_ = this.createPlotKitCanvas_(this.canvas_);
  this.canvas_ctx_ = utils.getContext(this.canvas_);
  this.hidden_ctx_ = utils.getContext(this.hidden_);
  this.resizeElements_();

  // The interactive parts of the graph are drawn on top of the chart.
  this.graphDiv.appendChild(this.hidden_);
  this.graphDiv.appendChild(this.canvas_);
  this.mouseEventElement_ = this.createMouseEventElement_();

  // Create the grapher
  this.layout_ = new _dygraphLayout["default"](this);
  var dygraph = this;
  this.mouseMoveHandler_ = function (e) {
    dygraph.mouseMove_(e);
  };
  this.mouseOutHandler_ = function (e) {
    // The mouse has left the chart if:
    // 1. e.target is inside the chart
    // 2. e.relatedTarget is outside the chart
    var target = e.target || e.fromElement;
    var relatedTarget = e.relatedTarget || e.toElement;
    if (utils.isNodeContainedBy(target, dygraph.graphDiv) && !utils.isNodeContainedBy(relatedTarget, dygraph.graphDiv)) {
      dygraph.mouseOut_(e);
    }
  };
  this.addAndTrackEvent(window, 'mouseout', this.mouseOutHandler_);
  this.addAndTrackEvent(this.mouseEventElement_, 'mousemove', this.mouseMoveHandler_);

  // Don't recreate and register the resize handler on subsequent calls.
  // This happens when the graph is resized.
  if (!this.resizeHandler_) {
    this.resizeHandler_ = function (e) {
      dygraph.resize();
    };

    // Update when the window is resized.
    // TODO(danvk): drop frames depending on complexity of the chart.
    this.addAndTrackEvent(window, 'resize', this.resizeHandler_);
    this.resizeObserver_ = null;
    var resizeMode = this.getStringOption('resizable');
    if (typeof ResizeObserver === 'undefined' && resizeMode !== "no") {
      console.error('ResizeObserver unavailable; ignoring resizable property');
      resizeMode = "no";
    }
    if (resizeMode === "horizontal" || resizeMode === "vertical" || resizeMode === "both") {
      enclosing.style.resize = resizeMode;
    } else if (resizeMode !== "passive") {
      resizeMode = "no";
    }
    if (resizeMode !== "no") {
      var maindivOverflow = window.getComputedStyle(enclosing).overflow;
      if (window.getComputedStyle(enclosing).overflow === 'visible') enclosing.style.overflow = 'hidden';
      this.resizeObserver_ = new ResizeObserver(this.resizeHandler_);
      this.resizeObserver_.observe(enclosing);
    }
  }
};
Dygraph.prototype.resizeElements_ = function () {
  this.graphDiv.style.width = this.width_ + "px";
  this.graphDiv.style.height = this.height_ + "px";
  var pixelRatioOption = this.getNumericOption('pixelRatio');
  var canvasScale = pixelRatioOption || utils.getContextPixelRatio(this.canvas_ctx_);
  this.canvas_.width = this.width_ * canvasScale;
  this.canvas_.height = this.height_ * canvasScale;
  this.canvas_.style.width = this.width_ + "px"; // for IE
  this.canvas_.style.height = this.height_ + "px"; // for IE
  if (canvasScale !== 1) {
    this.canvas_ctx_.scale(canvasScale, canvasScale);
  }
  var hiddenScale = pixelRatioOption || utils.getContextPixelRatio(this.hidden_ctx_);
  this.hidden_.width = this.width_ * hiddenScale;
  this.hidden_.height = this.height_ * hiddenScale;
  this.hidden_.style.width = this.width_ + "px"; // for IE
  this.hidden_.style.height = this.height_ + "px"; // for IE
  if (hiddenScale !== 1) {
    this.hidden_ctx_.scale(hiddenScale, hiddenScale);
  }
};

/**
 * Detach DOM elements in the dygraph and null out all data references.
 * Calling this when you're done with a dygraph can dramatically reduce memory
 * usage. See, e.g., the tests/perf.html example.
 */
Dygraph.prototype.destroy = function () {
  this.canvas_ctx_.restore();
  this.hidden_ctx_.restore();

  // Destroy any plugins, in the reverse order that they were registered.
  for (var i = this.plugins_.length - 1; i >= 0; i--) {
    var p = this.plugins_.pop();
    if (p.plugin.destroy) p.plugin.destroy();
  }
  var _removeRecursive = function removeRecursive(node) {
    while (node.hasChildNodes()) {
      _removeRecursive(node.firstChild);
      node.removeChild(node.firstChild);
    }
  };
  this.removeTrackedEvents_();

  // remove mouse event handlers (This may not be necessary anymore)
  utils.removeEvent(window, 'mouseout', this.mouseOutHandler_);
  utils.removeEvent(this.mouseEventElement_, 'mousemove', this.mouseMoveHandler_);

  // dispose of resizing handlers
  if (this.resizeObserver_) {
    this.resizeObserver_.disconnect();
    this.resizeObserver_ = null;
  }
  utils.removeEvent(window, 'resize', this.resizeHandler_);
  this.resizeHandler_ = null;
  _removeRecursive(this.maindiv_);
  var nullOut = function nullOut(obj) {
    for (var n in obj) {
      if (typeof obj[n] === 'object') {
        obj[n] = null;
      }
    }
  };
  // These may not all be necessary, but it can't hurt...
  nullOut(this.layout_);
  nullOut(this.plotter_);
  nullOut(this);
};

/**
 * Creates the canvas on which the chart will be drawn. Only the Renderer ever
 * draws on this particular canvas. All Dygraph work (i.e. drawing hover dots
 * or the zoom rectangles) is done on this.canvas_.
 * @param {Object} canvas The Dygraph canvas over which to overlay the plot
 * @return {Object} The newly-created canvas
 * @private
 */
Dygraph.prototype.createPlotKitCanvas_ = function (canvas) {
  var h = utils.createCanvas();
  h.style.position = "absolute";
  // TODO(danvk): h should be offset from canvas. canvas needs to include
  // some extra area to make it easier to zoom in on the far left and far
  // right. h needs to be precisely the plot area, so that clipping occurs.
  h.style.top = canvas.style.top;
  h.style.left = canvas.style.left;
  h.width = this.width_;
  h.height = this.height_;
  h.style.width = this.width_ + "px"; // for IE
  h.style.height = this.height_ + "px"; // for IE
  return h;
};

/**
 * Creates an overlay element used to handle mouse events.
 * @return {Object} The mouse event element.
 * @private
 */
Dygraph.prototype.createMouseEventElement_ = function () {
  return this.canvas_;
};

/**
 * Generate a set of distinct colors for the data series. This is done with a
 * color wheel. Saturation/Value are customizable, and the hue is
 * equally-spaced around the color wheel. If a custom set of colors is
 * specified, that is used instead.
 * @private
 */
Dygraph.prototype.setColors_ = function () {
  var labels = this.getLabels();
  var num = labels.length - 1;
  this.colors_ = [];
  this.colorsMap_ = {};

  // These are used for when no custom colors are specified.
  var sat = this.getNumericOption('colorSaturation') || 1.0;
  var val = this.getNumericOption('colorValue') || 0.5;
  var half = Math.ceil(num / 2);
  var colors = this.getOption('colors');
  var visibility = this.visibility();
  for (var i = 0; i < num; i++) {
    if (!visibility[i]) {
      continue;
    }
    var label = labels[i + 1];
    var colorStr = this.attributes_.getForSeries('color', label);
    if (!colorStr) {
      if (colors) {
        colorStr = colors[i % colors.length];
      } else {
        // alternate colors for high contrast.
        var idx = i % 2 ? half + (i + 1) / 2 : Math.ceil((i + 1) / 2);
        var hue = 1.0 * idx / (1 + num);
        colorStr = utils.hsvToRGB(hue, sat, val);
      }
    }
    this.colors_.push(colorStr);
    this.colorsMap_[label] = colorStr;
  }
};

/**
 * Return the list of colors. This is either the list of colors passed in the
 * attributes or the autogenerated list of rgb(r,g,b) strings.
 * This does not return colors for invisible series.
 * @return {Array.<string>} The list of colors.
 */
Dygraph.prototype.getColors = function () {
  return this.colors_;
};

/**
 * Returns a few attributes of a series, i.e. its color, its visibility, which
 * axis it's assigned to, and its column in the original data.
 * Returns null if the series does not exist.
 * Otherwise, returns an object with column, visibility, color and axis properties.
 * The "axis" property will be set to 1 for y1 and 2 for y2.
 * The "column" property can be fed back into getValue(row, column) to get
 * values for this series.
 */
Dygraph.prototype.getPropertiesForSeries = function (series_name) {
  var idx = -1;
  var labels = this.getLabels();
  for (var i = 1; i < labels.length; i++) {
    if (labels[i] == series_name) {
      idx = i;
      break;
    }
  }
  if (idx == -1) return null;
  return {
    name: series_name,
    column: idx,
    visible: this.visibility()[idx - 1],
    color: this.colorsMap_[series_name],
    axis: 1 + this.attributes_.axisForSeries(series_name)
  };
};

/**
 * Create the text box to adjust the averaging period
 * @private
 */
Dygraph.prototype.createRollInterface_ = function () {
  // Create a roller if one doesn't exist already.
  var roller = this.roller_;
  if (!roller) {
    this.roller_ = roller = document.createElement("input");
    roller.type = "text";
    roller.style.display = "none";
    roller.className = 'dygraph-roller';
    this.graphDiv.appendChild(roller);
  }
  var display = this.getBooleanOption('showRoller') ? 'block' : 'none';
  var area = this.getArea();
  var textAttr = {
    "top": area.y + area.h - 25 + "px",
    "left": area.x + 1 + "px",
    "display": display
  };
  roller.size = "2";
  roller.value = this.rollPeriod_;
  utils.update(roller.style, textAttr);
  var that = this;
  roller.onchange = function onchange() {
    return that.adjustRoll(roller.value);
  };
};

/**
 * Set up all the mouse handlers needed to capture dragging behavior for zoom
 * events.
 * @private
 */
Dygraph.prototype.createDragInterface_ = function () {
  var context = {
    // Tracks whether the mouse is down right now
    isZooming: false,
    isPanning: false,
    // is this drag part of a pan?
    is2DPan: false,
    // if so, is that pan 1- or 2-dimensional?
    dragStartX: null,
    // pixel coordinates
    dragStartY: null,
    // pixel coordinates
    dragEndX: null,
    // pixel coordinates
    dragEndY: null,
    // pixel coordinates
    dragDirection: null,
    prevEndX: null,
    // pixel coordinates
    prevEndY: null,
    // pixel coordinates
    prevDragDirection: null,
    cancelNextDblclick: false,
    // see comment in dygraph-interaction-model.js

    // The value on the left side of the graph when a pan operation starts.
    initialLeftmostDate: null,
    // The number of units each pixel spans. (This won't be valid for log
    // scales)
    xUnitsPerPixel: null,
    // TODO(danvk): update this comment
    // The range in second/value units that the viewport encompasses during a
    // panning operation.
    dateRange: null,
    // Top-left corner of the canvas, in DOM coords
    // TODO(konigsberg): Rename topLeftCanvasX, topLeftCanvasY.
    px: 0,
    py: 0,
    // Values for use with panEdgeFraction, which limit how far outside the
    // graph's data boundaries it can be panned.
    boundedDates: null,
    // [minDate, maxDate]
    boundedValues: null,
    // [[minValue, maxValue] ...]

    // We cover iframes during mouse interactions. See comments in
    // dygraph-utils.js for more info on why this is a good idea.
    tarp: new _iframeTarp["default"](),
    // contextB is the same thing as this context object but renamed.
    initializeMouseDown: function initializeMouseDown(event, g, contextB) {
      // prevents mouse drags from selecting page text.
      if (event.preventDefault) {
        event.preventDefault(); // Firefox, Chrome, etc.
      } else {
        event.returnValue = false; // IE
        event.cancelBubble = true;
      }
      var canvasPos = utils.findPos(g.canvas_);
      contextB.px = canvasPos.x;
      contextB.py = canvasPos.y;
      contextB.dragStartX = utils.dragGetX_(event, contextB);
      contextB.dragStartY = utils.dragGetY_(event, contextB);
      contextB.cancelNextDblclick = false;
      contextB.tarp.cover();
    },
    destroy: function destroy() {
      var context = this;
      if (context.isZooming || context.isPanning) {
        context.isZooming = false;
        context.dragStartX = null;
        context.dragStartY = null;
      }
      if (context.isPanning) {
        context.isPanning = false;
        context.draggingDate = null;
        context.dateRange = null;
        for (var i = 0; i < self.axes_.length; i++) {
          delete self.axes_[i].draggingValue;
          delete self.axes_[i].dragValueRange;
        }
      }
      context.tarp.uncover();
    }
  };
  var interactionModel = this.getOption("interactionModel");

  // Self is the graph.
  var self = this;

  // Function that binds the graph and context to the handler.
  var bindHandler = function bindHandler(handler) {
    return function (event) {
      handler(event, self, context);
    };
  };
  for (var eventName in interactionModel) {
    if (!interactionModel.hasOwnProperty(eventName)) continue;
    this.addAndTrackEvent(this.mouseEventElement_, eventName, bindHandler(interactionModel[eventName]));
  }

  // If the user releases the mouse button during a drag, but not over the
  // canvas, then it doesn't count as a zooming action.
  if (!interactionModel.willDestroyContextMyself) {
    var mouseUpHandler = function mouseUpHandler(event) {
      context.destroy();
    };
    this.addAndTrackEvent(document, 'mouseup', mouseUpHandler);
  }
};

/**
 * Draw a gray zoom rectangle over the desired area of the canvas. Also clears
 * up any previous zoom rectangles that were drawn. This could be optimized to
 * avoid extra redrawing, but it's tricky to avoid interactions with the status
 * dots.
 *
 * @param {number} direction the direction of the zoom rectangle. Acceptable
 *     values are utils.HORIZONTAL and utils.VERTICAL.
 * @param {number} startX The X position where the drag started, in canvas
 *     coordinates.
 * @param {number} endX The current X position of the drag, in canvas coords.
 * @param {number} startY The Y position where the drag started, in canvas
 *     coordinates.
 * @param {number} endY The current Y position of the drag, in canvas coords.
 * @param {number} prevDirection the value of direction on the previous call to
 *     this function. Used to avoid excess redrawing
 * @param {number} prevEndX The value of endX on the previous call to this
 *     function. Used to avoid excess redrawing
 * @param {number} prevEndY The value of endY on the previous call to this
 *     function. Used to avoid excess redrawing
 * @private
 */
Dygraph.prototype.drawZoomRect_ = function (direction, startX, endX, startY, endY, prevDirection, prevEndX, prevEndY) {
  var ctx = this.canvas_ctx_;

  // Clean up from the previous rect if necessary
  if (prevDirection == utils.HORIZONTAL) {
    ctx.clearRect(Math.min(startX, prevEndX), this.layout_.getPlotArea().y, Math.abs(startX - prevEndX), this.layout_.getPlotArea().h);
  } else if (prevDirection == utils.VERTICAL) {
    ctx.clearRect(this.layout_.getPlotArea().x, Math.min(startY, prevEndY), this.layout_.getPlotArea().w, Math.abs(startY - prevEndY));
  }

  // Draw a light-grey rectangle to show the new viewing area
  if (direction == utils.HORIZONTAL) {
    if (endX && startX) {
      ctx.fillStyle = "rgba(128,128,128,0.33)";
      ctx.fillRect(Math.min(startX, endX), this.layout_.getPlotArea().y, Math.abs(endX - startX), this.layout_.getPlotArea().h);
    }
  } else if (direction == utils.VERTICAL) {
    if (endY && startY) {
      ctx.fillStyle = "rgba(128,128,128,0.33)";
      ctx.fillRect(this.layout_.getPlotArea().x, Math.min(startY, endY), this.layout_.getPlotArea().w, Math.abs(endY - startY));
    }
  }
};

/**
 * Clear the zoom rectangle (and perform no zoom).
 * @private
 */
Dygraph.prototype.clearZoomRect_ = function () {
  this.currentZoomRectArgs_ = null;
  this.canvas_ctx_.clearRect(0, 0, this.width_, this.height_);
};

/**
 * Zoom to something containing [lowX, highX]. These are pixel coordinates in
 * the canvas. The exact zoom window may be slightly larger if there are no data
 * points near lowX or highX. Don't confuse this function with doZoomXDates,
 * which accepts dates that match the raw data. This function redraws the graph.
 *
 * @param {number} lowX The leftmost pixel value that should be visible.
 * @param {number} highX The rightmost pixel value that should be visible.
 * @private
 */
Dygraph.prototype.doZoomX_ = function (lowX, highX) {
  this.currentZoomRectArgs_ = null;
  // Find the earliest and latest dates contained in this canvasx range.
  // Convert the call to date ranges of the raw data.
  var minDate = this.toDataXCoord(lowX);
  var maxDate = this.toDataXCoord(highX);
  this.doZoomXDates_(minDate, maxDate);
};

/**
 * Zoom to something containing [minDate, maxDate] values. Don't confuse this
 * method with doZoomX which accepts pixel coordinates. This function redraws
 * the graph.
 *
 * @param {number} minDate The minimum date that should be visible.
 * @param {number} maxDate The maximum date that should be visible.
 * @private
 */
Dygraph.prototype.doZoomXDates_ = function (minDate, maxDate) {
  // TODO(danvk): when xAxisRange is null (i.e. "fit to data", the animation
  // can produce strange effects. Rather than the x-axis transitioning slowly
  // between values, it can jerk around.)
  var old_window = this.xAxisRange();
  var new_window = [minDate, maxDate];
  var zoomCallback = this.getFunctionOption('zoomCallback');
  var that = this;
  this.doAnimatedZoom(old_window, new_window, null, null, function animatedZoomCallback() {
    if (zoomCallback) {
      zoomCallback.call(that, minDate, maxDate, that.yAxisRanges());
    }
  });
};

/**
 * Zoom to something containing [lowY, highY]. These are pixel coordinates in
 * the canvas. This function redraws the graph.
 *
 * @param {number} lowY The topmost pixel value that should be visible.
 * @param {number} highY The lowest pixel value that should be visible.
 * @private
 */
Dygraph.prototype.doZoomY_ = function (lowY, highY) {
  this.currentZoomRectArgs_ = null;
  // Find the highest and lowest values in pixel range for each axis.
  // Note that lowY (in pixels) corresponds to the max Value (in data coords).
  // This is because pixels increase as you go down on the screen, whereas data
  // coordinates increase as you go up the screen.
  var oldValueRanges = this.yAxisRanges();
  var newValueRanges = [];
  for (var i = 0; i < this.axes_.length; i++) {
    var hi = this.toDataYCoord(lowY, i);
    var low = this.toDataYCoord(highY, i);
    newValueRanges.push([low, hi]);
  }
  var zoomCallback = this.getFunctionOption('zoomCallback');
  var that = this;
  this.doAnimatedZoom(null, null, oldValueRanges, newValueRanges, function animatedZoomCallback() {
    if (zoomCallback) {
      var _that$xAxisRange = that.xAxisRange(),
        _that$xAxisRange2 = _slicedToArray(_that$xAxisRange, 2),
        minX = _that$xAxisRange2[0],
        maxX = _that$xAxisRange2[1];
      zoomCallback.call(that, minX, maxX, that.yAxisRanges());
    }
  });
};

/**
 * Transition function to use in animations. Returns values between 0.0
 * (totally old values) and 1.0 (totally new values) for each frame.
 * @private
 */
Dygraph.zoomAnimationFunction = function (frame, numFrames) {
  var k = 1.5;
  return (1.0 - Math.pow(k, -frame)) / (1.0 - Math.pow(k, -numFrames));
};

/**
 * Reset the zoom to the original view coordinates. This is the same as
 * double-clicking on the graph.
 */
Dygraph.prototype.resetZoom = function () {
  var dirtyX = this.isZoomed('x');
  var dirtyY = this.isZoomed('y');
  var dirty = dirtyX || dirtyY;

  // Clear any selection, since it's likely to be drawn in the wrong place.
  this.clearSelection();
  if (!dirty) return;

  // Calculate extremes to avoid lack of padding on reset.
  var _this$xAxisExtremes = this.xAxisExtremes(),
    _this$xAxisExtremes2 = _slicedToArray(_this$xAxisExtremes, 2),
    minDate = _this$xAxisExtremes2[0],
    maxDate = _this$xAxisExtremes2[1];
  var animatedZooms = this.getBooleanOption('animatedZooms');
  var zoomCallback = this.getFunctionOption('zoomCallback');

  // TODO(danvk): merge this block w/ the code below.
  // TODO(danvk): factor out a generic, public zoomTo method.
  if (!animatedZooms) {
    this.dateWindow_ = null;
    this.axes_.forEach(function (axis) {
      if (axis.valueRange) delete axis.valueRange;
    });
    this.drawGraph_();
    if (zoomCallback) {
      zoomCallback.call(this, minDate, maxDate, this.yAxisRanges());
    }
    return;
  }
  var oldWindow = null,
    newWindow = null,
    oldValueRanges = null,
    newValueRanges = null;
  if (dirtyX) {
    oldWindow = this.xAxisRange();
    newWindow = [minDate, maxDate];
  }
  if (dirtyY) {
    oldValueRanges = this.yAxisRanges();
    newValueRanges = this.yAxisExtremes();
  }
  var that = this;
  this.doAnimatedZoom(oldWindow, newWindow, oldValueRanges, newValueRanges, function animatedZoomCallback() {
    that.dateWindow_ = null;
    that.axes_.forEach(function (axis) {
      if (axis.valueRange) delete axis.valueRange;
    });
    if (zoomCallback) {
      zoomCallback.call(that, minDate, maxDate, that.yAxisRanges());
    }
  });
};

/**
 * Combined animation logic for all zoom functions.
 * either the x parameters or y parameters may be null.
 * @private
 */
Dygraph.prototype.doAnimatedZoom = function (oldXRange, newXRange, oldYRanges, newYRanges, callback) {
  var steps = this.getBooleanOption("animatedZooms") ? Dygraph.ANIMATION_STEPS : 1;
  var windows = [];
  var valueRanges = [];
  var step, frac;
  if (oldXRange !== null && newXRange !== null) {
    for (step = 1; step <= steps; step++) {
      frac = Dygraph.zoomAnimationFunction(step, steps);
      windows[step - 1] = [oldXRange[0] * (1 - frac) + frac * newXRange[0], oldXRange[1] * (1 - frac) + frac * newXRange[1]];
    }
  }
  if (oldYRanges !== null && newYRanges !== null) {
    for (step = 1; step <= steps; step++) {
      frac = Dygraph.zoomAnimationFunction(step, steps);
      var thisRange = [];
      for (var j = 0; j < this.axes_.length; j++) {
        thisRange.push([oldYRanges[j][0] * (1 - frac) + frac * newYRanges[j][0], oldYRanges[j][1] * (1 - frac) + frac * newYRanges[j][1]]);
      }
      valueRanges[step - 1] = thisRange;
    }
  }
  var that = this;
  utils.repeatAndCleanup(function (step) {
    if (valueRanges.length) {
      for (var i = 0; i < that.axes_.length; i++) {
        var w = valueRanges[step][i];
        that.axes_[i].valueRange = [w[0], w[1]];
      }
    }
    if (windows.length) {
      that.dateWindow_ = windows[step];
    }
    that.drawGraph_();
  }, steps, Dygraph.ANIMATION_DURATION / steps, callback);
};

/**
 * Get the current graph's area object.
 *
 * Returns: {x, y, w, h}
 */
Dygraph.prototype.getArea = function () {
  return this.plotter_.area;
};

/**
 * Convert a mouse event to DOM coordinates relative to the graph origin.
 *
 * Returns a two-element array: [X, Y].
 */
Dygraph.prototype.eventToDomCoords = function (event) {
  if (event.offsetX && event.offsetY) {
    return [event.offsetX, event.offsetY];
  } else {
    var eventElementPos = utils.findPos(this.mouseEventElement_);
    var canvasx = utils.pageX(event) - eventElementPos.x;
    var canvasy = utils.pageY(event) - eventElementPos.y;
    return [canvasx, canvasy];
  }
};

/**
 * Given a canvas X coordinate, find the closest row.
 * @param {number} domX graph-relative DOM X coordinate
 * Returns {number} row number.
 * @private
 */
Dygraph.prototype.findClosestRow = function (domX) {
  var minDistX = Infinity;
  var closestRow = -1;
  var sets = this.layout_.points;
  for (var i = 0; i < sets.length; i++) {
    var points = sets[i];
    var len = points.length;
    for (var j = 0; j < len; j++) {
      var point = points[j];
      if (!utils.isValidPoint(point, true)) continue;
      var dist = Math.abs(point.canvasx - domX);
      if (dist < minDistX) {
        minDistX = dist;
        closestRow = point.idx;
      }
    }
  }
  return closestRow;
};

/**
 * Given canvas X,Y coordinates, find the closest point.
 *
 * This finds the individual data point across all visible series
 * that's closest to the supplied DOM coordinates using the standard
 * Euclidean X,Y distance.
 *
 * @param {number} domX graph-relative DOM X coordinate
 * @param {number} domY graph-relative DOM Y coordinate
 * Returns: {row, seriesName, point}
 * @private
 */
Dygraph.prototype.findClosestPoint = function (domX, domY) {
  var minDist = Infinity;
  var dist, dx, dy, point, closestPoint, closestSeries, closestRow;
  for (var setIdx = this.layout_.points.length - 1; setIdx >= 0; --setIdx) {
    var points = this.layout_.points[setIdx];
    for (var i = 0; i < points.length; ++i) {
      point = points[i];
      if (!utils.isValidPoint(point)) continue;
      dx = point.canvasx - domX;
      dy = point.canvasy - domY;
      dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
        closestSeries = setIdx;
        closestRow = point.idx;
      }
    }
  }
  var name = this.layout_.setNames[closestSeries];
  return {
    row: closestRow,
    seriesName: name,
    point: closestPoint
  };
};

/**
 * Given canvas X,Y coordinates, find the touched area in a stacked graph.
 *
 * This first finds the X data point closest to the supplied DOM X coordinate,
 * then finds the series which puts the Y coordinate on top of its filled area,
 * using linear interpolation between adjacent point pairs.
 *
 * @param {number} domX graph-relative DOM X coordinate
 * @param {number} domY graph-relative DOM Y coordinate
 * Returns: {row, seriesName, point}
 * @private
 */
Dygraph.prototype.findStackedPoint = function (domX, domY) {
  var row = this.findClosestRow(domX);
  var closestPoint, closestSeries;
  for (var setIdx = 0; setIdx < this.layout_.points.length; ++setIdx) {
    var boundary = this.getLeftBoundary_(setIdx);
    var rowIdx = row - boundary;
    var points = this.layout_.points[setIdx];
    if (rowIdx >= points.length) continue;
    var p1 = points[rowIdx];
    if (!utils.isValidPoint(p1)) continue;
    var py = p1.canvasy;
    if (domX > p1.canvasx && rowIdx + 1 < points.length) {
      // interpolate series Y value using next point
      var p2 = points[rowIdx + 1];
      if (utils.isValidPoint(p2)) {
        var dx = p2.canvasx - p1.canvasx;
        if (dx > 0) {
          var r = (domX - p1.canvasx) / dx;
          py += r * (p2.canvasy - p1.canvasy);
        }
      }
    } else if (domX < p1.canvasx && rowIdx > 0) {
      // interpolate series Y value using previous point
      var p0 = points[rowIdx - 1];
      if (utils.isValidPoint(p0)) {
        var dx = p1.canvasx - p0.canvasx;
        if (dx > 0) {
          var r = (p1.canvasx - domX) / dx;
          py += r * (p0.canvasy - p1.canvasy);
        }
      }
    }
    // Stop if the point (domX, py) is above this series' upper edge
    if (setIdx === 0 || py < domY) {
      closestPoint = p1;
      closestSeries = setIdx;
    }
  }
  var name = this.layout_.setNames[closestSeries];
  return {
    row: row,
    seriesName: name,
    point: closestPoint
  };
};

/**
 * When the mouse moves in the canvas, display information about a nearby data
 * point and draw dots over those points in the data series. This function
 * takes care of cleanup of previously-drawn dots.
 * @param {Object} event The mousemove event from the browser.
 * @private
 */
Dygraph.prototype.mouseMove_ = function (event) {
  // This prevents JS errors when mousing over the canvas before data loads.
  var points = this.layout_.points;
  if (points === undefined || points === null) return;
  var canvasCoords = this.eventToDomCoords(event);
  var canvasx = canvasCoords[0];
  var canvasy = canvasCoords[1];
  var highlightSeriesOpts = this.getOption("highlightSeriesOpts");
  var selectionChanged = false;
  if (highlightSeriesOpts && !this.isSeriesLocked()) {
    var closest;
    if (this.getBooleanOption("stackedGraph")) {
      closest = this.findStackedPoint(canvasx, canvasy);
    } else {
      closest = this.findClosestPoint(canvasx, canvasy);
    }
    selectionChanged = this.setSelection(closest.row, closest.seriesName);
  } else {
    var idx = this.findClosestRow(canvasx);
    selectionChanged = this.setSelection(idx);
  }
  var callback = this.getFunctionOption("highlightCallback");
  if (callback && selectionChanged) {
    callback.call(this, event, this.lastx_, this.selPoints_, this.lastRow_, this.highlightSet_);
  }
};

/**
 * Fetch left offset from the specified set index or if not passed, the
 * first defined boundaryIds record (see bug #236).
 * @private
 */
Dygraph.prototype.getLeftBoundary_ = function (setIdx) {
  if (this.boundaryIds_[setIdx]) {
    return this.boundaryIds_[setIdx][0];
  } else {
    for (var i = 0; i < this.boundaryIds_.length; i++) {
      if (this.boundaryIds_[i] !== undefined) {
        return this.boundaryIds_[i][0];
      }
    }
    return 0;
  }
};
Dygraph.prototype.animateSelection_ = function (direction) {
  var totalSteps = 10;
  var millis = 30;
  if (this.fadeLevel === undefined) this.fadeLevel = 0;
  if (this.animateId === undefined) this.animateId = 0;
  var start = this.fadeLevel;
  var steps = direction < 0 ? start : totalSteps - start;
  if (steps <= 0) {
    if (this.fadeLevel) {
      this.updateSelection_(1.0);
    }
    return;
  }
  var thisId = ++this.animateId;
  var that = this;
  utils.repeatAndCleanup(function (step) {
    // ignore simultaneous animations
    if (that.animateId != thisId) return;
    that.fadeLevel = start + (step + 1) * direction;
    if (that.fadeLevel === 0) {
      that.clearSelection();
    } else {
      that.updateSelection_(that.fadeLevel / totalSteps);
    }
  }, steps, millis, function () {});
};

/**
 * Draw dots over the selectied points in the data series. This function
 * takes care of cleanup of previously-drawn dots.
 * @private
 */
Dygraph.prototype.updateSelection_ = function (opt_animFraction) {
  /*var defaultPrevented = */
  this.cascadeEvents_('select', {
    selectedRow: this.lastRow_ === -1 ? undefined : this.lastRow_,
    selectedX: this.lastx_ === null ? undefined : this.lastx_,
    selectedPoints: this.selPoints_
  });
  // TODO(danvk): use defaultPrevented here?

  // Clear the previously drawn vertical, if there is one
  var i;
  var ctx = this.canvas_ctx_;
  if (this.getOption('highlightSeriesOpts')) {
    ctx.clearRect(0, 0, this.width_, this.height_);
    var alpha = 1.0 - this.getNumericOption('highlightSeriesBackgroundAlpha');
    var backgroundColor = utils.toRGB_(this.getOption('highlightSeriesBackgroundColor'));
    if (alpha) {
      // Activating background fade includes an animation effect for a gradual
      // fade. TODO(klausw): make this independently configurable if it causes
      // issues? Use a shared preference to control animations?
      var animateBackgroundFade = this.getBooleanOption('animateBackgroundFade');
      if (animateBackgroundFade) {
        if (opt_animFraction === undefined) {
          // start a new animation
          this.animateSelection_(1);
          return;
        }
        alpha *= opt_animFraction;
      }
      ctx.fillStyle = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + alpha + ')';
      ctx.fillRect(0, 0, this.width_, this.height_);
    }

    // Redraw only the highlighted series in the interactive canvas (not the
    // static plot canvas, which is where series are usually drawn).
    this.plotter_._renderLineChart(this.highlightSet_, ctx);
  } else if (this.previousVerticalX_ >= 0) {
    // Determine the maximum highlight circle size.
    var maxCircleSize = 0;
    var labels = this.attr_('labels');
    for (i = 1; i < labels.length; i++) {
      var r = this.getNumericOption('highlightCircleSize', labels[i]);
      if (r > maxCircleSize) maxCircleSize = r;
    }
    var px = this.previousVerticalX_;
    ctx.clearRect(px - maxCircleSize - 1, 0, 2 * maxCircleSize + 2, this.height_);
  }
  if (this.selPoints_.length > 0) {
    // Draw colored circles over the center of each selected point
    var canvasx = this.selPoints_[0].canvasx;
    ctx.save();
    for (i = 0; i < this.selPoints_.length; i++) {
      var pt = this.selPoints_[i];
      if (isNaN(pt.canvasy)) continue;
      var circleSize = this.getNumericOption('highlightCircleSize', pt.name);
      var callback = this.getFunctionOption("drawHighlightPointCallback", pt.name);
      var color = this.plotter_.colors[pt.name];
      if (!callback) {
        callback = utils.Circles.DEFAULT;
      }
      ctx.lineWidth = this.getNumericOption('strokeWidth', pt.name);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      callback.call(this, this, pt.name, ctx, canvasx, pt.canvasy, color, circleSize, pt.idx);
    }
    ctx.restore();
    this.previousVerticalX_ = canvasx;
  }
};

/**
 * Manually set the selected points and display information about them in the
 * legend. The selection can be cleared using clearSelection() and queried
 * using getSelection().
 *
 * To set a selected series but not a selected point, call setSelection with
 * row=false and the selected series name.
 *
 * @param {number} row Row number that should be highlighted (i.e. appear with
 * hover dots on the chart).
 * @param {seriesName} optional series name to highlight that series with the
 * the highlightSeriesOpts setting.
 * @param {locked} optional If true, keep seriesName selected when mousing
 * over the graph, disabling closest-series highlighting. Call clearSelection()
 * to unlock it.
 * @param {trigger_highlight_callback} optional If true, trigger any
 * user-defined highlightCallback if highlightCallback has been set.
 */
Dygraph.prototype.setSelection = function setSelection(row, opt_seriesName, opt_locked, opt_trigger_highlight_callback) {
  // Extract the points we've selected
  this.selPoints_ = [];
  var changed = false;
  if (row !== false && row >= 0) {
    if (row != this.lastRow_) changed = true;
    this.lastRow_ = row;
    for (var setIdx = 0; setIdx < this.layout_.points.length; ++setIdx) {
      var points = this.layout_.points[setIdx];
      // Check if the point at the appropriate index is the point we're looking
      // for.  If it is, just use it, otherwise search the array for a point
      // in the proper place.
      var setRow = row - this.getLeftBoundary_(setIdx);
      if (setRow >= 0 && setRow < points.length && points[setRow].idx == row) {
        var point = points[setRow];
        if (point.yval !== null) this.selPoints_.push(point);
      } else {
        for (var pointIdx = 0; pointIdx < points.length; ++pointIdx) {
          var point = points[pointIdx];
          if (point.idx == row) {
            if (point.yval !== null) {
              this.selPoints_.push(point);
            }
            break;
          }
        }
      }
    }
  } else {
    if (this.lastRow_ >= 0) changed = true;
    this.lastRow_ = -1;
  }
  if (this.selPoints_.length) {
    this.lastx_ = this.selPoints_[0].xval;
  } else {
    this.lastx_ = null;
  }
  if (opt_seriesName !== undefined) {
    if (this.highlightSet_ !== opt_seriesName) changed = true;
    this.highlightSet_ = opt_seriesName;
  }
  if (opt_locked !== undefined) {
    this.lockedSet_ = opt_locked;
  }
  if (changed) {
    this.updateSelection_(undefined);
    if (opt_trigger_highlight_callback) {
      var callback = this.getFunctionOption("highlightCallback");
      if (callback) {
        var event = {};
        callback.call(this, event, this.lastx_, this.selPoints_, this.lastRow_, this.highlightSet_);
      }
    }
  }
  return changed;
};

/**
 * The mouse has left the canvas. Clear out whatever artifacts remain
 * @param {Object} event the mouseout event from the browser.
 * @private
 */
Dygraph.prototype.mouseOut_ = function (event) {
  if (this.getFunctionOption("unhighlightCallback")) {
    this.getFunctionOption("unhighlightCallback").call(this, event);
  }
  if (this.getBooleanOption("hideOverlayOnMouseOut") && !this.lockedSet_) {
    this.clearSelection();
  }
};

/**
 * Clears the current selection (i.e. points that were highlighted by moving
 * the mouse over the chart).
 */
Dygraph.prototype.clearSelection = function () {
  this.cascadeEvents_('deselect', {});
  this.lockedSet_ = false;
  // Get rid of the overlay data
  if (this.fadeLevel) {
    this.animateSelection_(-1);
    return;
  }
  this.canvas_ctx_.clearRect(0, 0, this.width_, this.height_);
  this.fadeLevel = 0;
  this.selPoints_ = [];
  this.lastx_ = null;
  this.lastRow_ = -1;
  this.highlightSet_ = null;
};

/**
 * Returns the number of the currently selected row. To get data for this row,
 * you can use the getValue method.
 * @return {number} row number, or -1 if nothing is selected
 */
Dygraph.prototype.getSelection = function () {
  if (!this.selPoints_ || this.selPoints_.length < 1) {
    return -1;
  }
  for (var setIdx = 0; setIdx < this.layout_.points.length; setIdx++) {
    var points = this.layout_.points[setIdx];
    for (var row = 0; row < points.length; row++) {
      if (points[row].x == this.selPoints_[0].x) {
        return points[row].idx;
      }
    }
  }
  return -1;
};

/**
 * Returns the name of the currently-highlighted series.
 * Only available when the highlightSeriesOpts option is in use.
 */
Dygraph.prototype.getHighlightSeries = function () {
  return this.highlightSet_;
};

/**
 * Returns true if the currently-highlighted series was locked
 * via setSelection(..., seriesName, true).
 */
Dygraph.prototype.isSeriesLocked = function () {
  return this.lockedSet_;
};

/**
 * Fires when there's data available to be graphed.
 * @param {string} data Raw CSV data to be plotted
 * @private
 */
Dygraph.prototype.loadedEvent_ = function (data) {
  this.rawData_ = this.parseCSV_(data);
  this.cascadeDataDidUpdateEvent_();
  this.predraw_();
};

/**
 * Add ticks on the x-axis representing years, months, quarters, weeks, or days
 * @private
 */
Dygraph.prototype.addXTicks_ = function () {
  // Determine the correct ticks scale on the x-axis: quarterly, monthly, ...
  var range;
  if (this.dateWindow_) {
    range = [this.dateWindow_[0], this.dateWindow_[1]];
  } else {
    range = this.xAxisExtremes();
  }
  var xAxisOptionsView = this.optionsViewForAxis_('x');
  var xTicks = xAxisOptionsView('ticker')(range[0], range[1], this.plotter_.area.w,
  // TODO(danvk): should be area.width
  xAxisOptionsView, this);
  // var msg = 'ticker(' + range[0] + ', ' + range[1] + ', ' + this.width_ + ', ' + this.attr_('pixelsPerXLabel') + ') -> ' + JSON.stringify(xTicks);
  // console.log(msg);
  this.layout_.setXTicks(xTicks);
};

/**
 * Returns the correct handler class for the currently set options.
 * @private
 */
Dygraph.prototype.getHandlerClass_ = function () {
  var handlerClass;
  if (this.attr_('dataHandler')) {
    handlerClass = this.attr_('dataHandler');
  } else if (this.fractions_) {
    if (this.getBooleanOption('errorBars')) {
      handlerClass = _barsFractions["default"];
    } else {
      handlerClass = _defaultFractions["default"];
    }
  } else if (this.getBooleanOption('customBars')) {
    handlerClass = _barsCustom["default"];
  } else if (this.getBooleanOption('errorBars')) {
    handlerClass = _barsError["default"];
  } else {
    handlerClass = _default2["default"];
  }
  return handlerClass;
};

/**
 * @private
 * This function is called once when the chart's data is changed or the options
 * dictionary is updated. It is _not_ called when the user pans or zooms. The
 * idea is that values derived from the chart's data can be computed here,
 * rather than every time the chart is drawn. This includes things like the
 * number of axes, rolling averages, etc.
 */
Dygraph.prototype.predraw_ = function () {
  var start = new Date();

  // Create the correct dataHandler
  this.dataHandler_ = new (this.getHandlerClass_())();
  this.layout_.computePlotArea();

  // TODO(danvk): move more computations out of drawGraph_ and into here.
  this.computeYAxes_();
  if (!this.is_initial_draw_) {
    this.canvas_ctx_.restore();
    this.hidden_ctx_.restore();
  }
  this.canvas_ctx_.save();
  this.hidden_ctx_.save();

  // Create a new plotter.
  this.plotter_ = new _dygraphCanvas["default"](this, this.hidden_, this.hidden_ctx_, this.layout_);

  // The roller sits in the bottom left corner of the chart. We don't know where
  // this will be until the options are available, so it's positioned here.
  this.createRollInterface_();
  this.cascadeEvents_('predraw');

  // Convert the raw data (a 2D array) into the internal format and compute
  // rolling averages.
  this.rolledSeries_ = [null]; // x-axis is the first series and it's special
  for (var i = 1; i < this.numColumns(); i++) {
    // var logScale = this.attr_('logscale', i); // TODO(klausw): this looks wrong // konigsberg thinks so too.
    var series = this.dataHandler_.extractSeries(this.rawData_, i, this.attributes_);
    if (this.rollPeriod_ > 1) {
      series = this.dataHandler_.rollingAverage(series, this.rollPeriod_, this.attributes_, i);
    }
    this.rolledSeries_.push(series);
  }

  // If the data or options have changed, then we'd better redraw.
  this.drawGraph_();

  // This is used to determine whether to do various animations.
  var end = new Date();
  this.drawingTimeMs_ = end - start;
};

/**
 * Point structure.
 *
 * xval_* and yval_* are the original unscaled data values,
 * while x_* and y_* are scaled to the range (0.0-1.0) for plotting.
 * yval_stacked is the cumulative Y value used for stacking graphs,
 * and bottom/top/minus/plus are used for high/low band graphs.
 *
 * @typedef {{
 *     idx: number,
 *     name: string,
 *     x: ?number,
 *     xval: ?number,
 *     y_bottom: ?number,
 *     y: ?number,
 *     y_stacked: ?number,
 *     y_top: ?number,
 *     yval_minus: ?number,
 *     yval: ?number,
 *     yval_plus: ?number,
 *     yval_stacked
 * }}
 */
Dygraph.PointType = undefined;

/**
 * Calculates point stacking for stackedGraph=true.
 *
 * For stacking purposes, interpolate or extend neighboring data across
 * NaN values based on stackedGraphNaNFill settings. This is for display
 * only, the underlying data value as shown in the legend remains NaN.
 *
 * @param {Array.<Dygraph.PointType>} points Point array for a single series.
 *     Updates each Point's yval_stacked property.
 * @param {Array.<number>} cumulativeYval Accumulated top-of-graph stacked Y
 *     values for the series seen so far. Index is the row number. Updated
 *     based on the current series's values.
 * @param {Array.<number>} seriesExtremes Min and max values, updated
 *     to reflect the stacked values.
 * @param {string} fillMethod Interpolation method, one of 'all', 'inside', or
 *     'none'.
 * @private
 */
Dygraph.stackPoints_ = function (points, cumulativeYval, seriesExtremes, fillMethod) {
  var lastXval = null;
  var prevPoint = null;
  var nextPoint = null;
  var nextPointIdx = -1;

  // Find the next stackable point starting from the given index.
  var updateNextPoint = function updateNextPoint(idx) {
    // If we've previously found a non-NaN point and haven't gone past it yet,
    // just use that.
    if (nextPointIdx >= idx) return;

    // We haven't found a non-NaN point yet or have moved past it,
    // look towards the right to find a non-NaN point.
    for (var j = idx; j < points.length; ++j) {
      // Clear out a previously-found point (if any) since it's no longer
      // valid, we shouldn't use it for interpolation anymore.
      nextPoint = null;
      if (!isNaN(points[j].yval) && points[j].yval !== null) {
        nextPointIdx = j;
        nextPoint = points[j];
        break;
      }
    }
  };
  for (var i = 0; i < points.length; ++i) {
    var point = points[i];
    var xval = point.xval;
    if (cumulativeYval[xval] === undefined) {
      cumulativeYval[xval] = 0;
    }
    var actualYval = point.yval;
    if (isNaN(actualYval) || actualYval === null) {
      if (fillMethod == 'none') {
        actualYval = 0;
      } else {
        // Interpolate/extend for stacking purposes if possible.
        updateNextPoint(i);
        if (prevPoint && nextPoint && fillMethod != 'none') {
          // Use linear interpolation between prevPoint and nextPoint.
          actualYval = prevPoint.yval + (nextPoint.yval - prevPoint.yval) * ((xval - prevPoint.xval) / (nextPoint.xval - prevPoint.xval));
        } else if (prevPoint && fillMethod == 'all') {
          actualYval = prevPoint.yval;
        } else if (nextPoint && fillMethod == 'all') {
          actualYval = nextPoint.yval;
        } else {
          actualYval = 0;
        }
      }
    } else {
      prevPoint = point;
    }
    var stackedYval = cumulativeYval[xval];
    if (lastXval != xval) {
      // If an x-value is repeated, we ignore the duplicates.
      stackedYval += actualYval;
      cumulativeYval[xval] = stackedYval;
    }
    lastXval = xval;
    point.yval_stacked = stackedYval;
    if (stackedYval > seriesExtremes[1]) {
      seriesExtremes[1] = stackedYval;
    }
    if (stackedYval < seriesExtremes[0]) {
      seriesExtremes[0] = stackedYval;
    }
  }
};

/**
 * Loop over all fields and create datasets, calculating extreme y-values for
 * each series and extreme x-indices as we go.
 *
 * dateWindow is passed in as an explicit parameter so that we can compute
 * extreme values "speculatively", i.e. without actually setting state on the
 * dygraph.
 *
 * @param {Array.<Array.<Array.<(number|Array<number>)>>} rolledSeries, where
 *     rolledSeries[seriesIndex][row] = raw point, where
 *     seriesIndex is the column number starting with 1, and
 *     rawPoint is [x,y] or [x, [y, err]] or [x, [y, yminus, yplus]].
 * @param {?Array.<number>} dateWindow [xmin, xmax] pair, or null.
 * @return {{
 *     points: Array.<Array.<Dygraph.PointType>>,
 *     seriesExtremes: Array.<Array.<number>>,
 *     boundaryIds: Array.<number>}}
 * @private
 */
Dygraph.prototype.gatherDatasets_ = function (rolledSeries, dateWindow) {
  var boundaryIds = [];
  var points = [];
  var cumulativeYval = []; // For stacked series.
  var extremes = {}; // series name -> [low, high]
  var seriesIdx, sampleIdx;
  var firstIdx, lastIdx;
  var axisIdx;

  // Loop over the fields (series).  Go from the last to the first,
  // because if they're stacked that's how we accumulate the values.
  var num_series = rolledSeries.length - 1;
  var series;
  for (seriesIdx = num_series; seriesIdx >= 1; seriesIdx--) {
    if (!this.visibility()[seriesIdx - 1]) continue;

    // Prune down to the desired range, if necessary (for zooming)
    // Because there can be lines going to points outside of the visible area,
    // we actually prune to visible points, plus one on either side.
    if (dateWindow) {
      series = rolledSeries[seriesIdx];
      var low = dateWindow[0];
      var high = dateWindow[1];

      // TODO(danvk): do binary search instead of linear search.
      // TODO(danvk): pass firstIdx and lastIdx directly to the renderer.
      firstIdx = null;
      lastIdx = null;
      for (sampleIdx = 0; sampleIdx < series.length; sampleIdx++) {
        if (series[sampleIdx][0] >= low && firstIdx === null) {
          firstIdx = sampleIdx;
        }
        if (series[sampleIdx][0] <= high) {
          lastIdx = sampleIdx;
        }
      }
      if (firstIdx === null) firstIdx = 0;
      var correctedFirstIdx = firstIdx;
      var isInvalidValue = true;
      while (isInvalidValue && correctedFirstIdx > 0) {
        correctedFirstIdx--;
        // check if the y value is null.
        isInvalidValue = series[correctedFirstIdx][1] === null;
      }
      if (lastIdx === null) lastIdx = series.length - 1;
      var correctedLastIdx = lastIdx;
      isInvalidValue = true;
      while (isInvalidValue && correctedLastIdx < series.length - 1) {
        correctedLastIdx++;
        isInvalidValue = series[correctedLastIdx][1] === null;
      }
      if (correctedFirstIdx !== firstIdx) {
        firstIdx = correctedFirstIdx;
      }
      if (correctedLastIdx !== lastIdx) {
        lastIdx = correctedLastIdx;
      }
      boundaryIds[seriesIdx - 1] = [firstIdx, lastIdx];

      // .slice's end is exclusive, we want to include lastIdx.
      series = series.slice(firstIdx, lastIdx + 1);
    } else {
      series = rolledSeries[seriesIdx];
      boundaryIds[seriesIdx - 1] = [0, series.length - 1];
    }
    var seriesName = this.attr_("labels")[seriesIdx];
    var seriesExtremes = this.dataHandler_.getExtremeYValues(series, dateWindow, this.getBooleanOption("stepPlot", seriesName));
    var seriesPoints = this.dataHandler_.seriesToPoints(series, seriesName, boundaryIds[seriesIdx - 1][0]);
    if (this.getBooleanOption("stackedGraph")) {
      axisIdx = this.attributes_.axisForSeries(seriesName);
      if (cumulativeYval[axisIdx] === undefined) {
        cumulativeYval[axisIdx] = [];
      }
      Dygraph.stackPoints_(seriesPoints, cumulativeYval[axisIdx], seriesExtremes, this.getBooleanOption("stackedGraphNaNFill"));
    }
    extremes[seriesName] = seriesExtremes;
    points[seriesIdx] = seriesPoints;
  }
  return {
    points: points,
    extremes: extremes,
    boundaryIds: boundaryIds
  };
};

/**
 * Update the graph with new data. This method is called when the viewing area
 * has changed. If the underlying data or options have changed, predraw_ will
 * be called before drawGraph_ is called.
 *
 * @private
 */
Dygraph.prototype.drawGraph_ = function () {
  var start = new Date();

  // This is used to set the second parameter to drawCallback, below.
  var is_initial_draw = this.is_initial_draw_;
  this.is_initial_draw_ = false;
  this.layout_.removeAllDatasets();
  this.setColors_();
  this.attrs_.pointSize = 0.5 * this.getNumericOption('highlightCircleSize');
  var packed = this.gatherDatasets_(this.rolledSeries_, this.dateWindow_);
  var points = packed.points;
  var extremes = packed.extremes;
  this.boundaryIds_ = packed.boundaryIds;
  this.setIndexByName_ = {};
  var labels = this.attr_("labels");
  var dataIdx = 0;
  for (var i = 1; i < points.length; i++) {
    if (!this.visibility()[i - 1]) continue;
    this.layout_.addDataset(labels[i], points[i]);
    this.datasetIndex_[i] = dataIdx++;
  }
  for (var i = 0; i < labels.length; i++) {
    this.setIndexByName_[labels[i]] = i;
  }
  this.computeYAxisRanges_(extremes);
  this.layout_.setYAxes(this.axes_);
  this.addXTicks_();

  // Tell PlotKit to use this new data and render itself
  this.layout_.evaluate();
  this.renderGraph_(is_initial_draw);
  if (this.getStringOption("timingName")) {
    var end = new Date();
    console.log(this.getStringOption("timingName") + " - drawGraph: " + (end - start) + "ms");
  }
};

/**
 * This does the work of drawing the chart. It assumes that the layout and axis
 * scales have already been set (e.g. by predraw_).
 *
 * @private
 */
Dygraph.prototype.renderGraph_ = function (is_initial_draw) {
  this.cascadeEvents_('clearChart');
  this.plotter_.clear();
  var underlayCallback = this.getFunctionOption('underlayCallback');
  if (underlayCallback) {
    // NOTE: we pass the dygraph object to this callback twice to avoid breaking
    // users who expect a deprecated form of this callback.
    underlayCallback.call(this, this.hidden_ctx_, this.layout_.getPlotArea(), this, this);
  }
  var e = {
    canvas: this.hidden_,
    drawingContext: this.hidden_ctx_
  };
  this.cascadeEvents_('willDrawChart', e);
  this.plotter_.render();
  this.cascadeEvents_('didDrawChart', e);
  this.lastRow_ = -1; // because plugins/legend.js clears the legend

  // TODO(danvk): is this a performance bottleneck when panning?
  // The interaction canvas should already be empty in that situation.
  this.canvas_.getContext('2d').clearRect(0, 0, this.width_, this.height_);
  var drawCallback = this.getFunctionOption("drawCallback");
  if (drawCallback !== null) {
    drawCallback.call(this, this, is_initial_draw);
  }
  if (is_initial_draw) {
    this.readyFired_ = true;
    while (this.readyFns_.length > 0) {
      var fn = this.readyFns_.pop();
      fn(this);
    }
  }
};

/**
 * @private
 * Determine properties of the y-axes which are independent of the data
 * currently being displayed. This includes things like the number of axes and
 * the style of the axes. It does not include the range of each axis and its
 * tick marks.
 * This fills in this.axes_.
 * axes_ = [ { options } ]
 *   indices are into the axes_ array.
 */
Dygraph.prototype.computeYAxes_ = function () {
  var axis, index, opts, v;

  // this.axes_ doesn't match this.attributes_.axes_.options. It's used for
  // data computation as well as options storage.
  // Go through once and add all the axes.
  this.axes_ = [];
  for (axis = 0; axis < this.attributes_.numAxes(); axis++) {
    // Add a new axis, making a copy of its per-axis options.
    opts = {
      g: this
    };
    utils.update(opts, this.attributes_.axisOptions(axis));
    this.axes_[axis] = opts;
  }
  for (axis = 0; axis < this.axes_.length; axis++) {
    if (axis === 0) {
      opts = this.optionsViewForAxis_('y' + (axis ? '2' : ''));
      v = opts("valueRange");
      if (v) this.axes_[axis].valueRange = v;
    } else {
      // To keep old behavior
      var axes = this.user_attrs_.axes;
      if (axes && axes.y2) {
        v = axes.y2.valueRange;
        if (v) this.axes_[axis].valueRange = v;
      }
    }
  }
};

/**
 * Returns the number of y-axes on the chart.
 * @return {number} the number of axes.
 */
Dygraph.prototype.numAxes = function () {
  return this.attributes_.numAxes();
};

/**
 * @private
 * Returns axis properties for the given series.
 * @param {string} setName The name of the series for which to get axis
 * properties, e.g. 'Y1'.
 * @return {Object} The axis properties.
 */
Dygraph.prototype.axisPropertiesForSeries = function (series) {
  // TODO(danvk): handle errors.
  return this.axes_[this.attributes_.axisForSeries(series)];
};

/**
 * @private
 * Determine the value range and tick marks for each axis.
 * @param {Object} extremes A mapping from seriesName -> [low, high]
 * This fills in the valueRange and ticks fields in each entry of this.axes_.
 */
Dygraph.prototype.computeYAxisRanges_ = function (extremes) {
  var isNullUndefinedOrNaN = function isNullUndefinedOrNaN(num) {
    return isNaN(parseFloat(num));
  };
  var numAxes = this.attributes_.numAxes();
  var ypadCompat, span, series, ypad;
  var p_axis;

  // Compute extreme values, a span and tick marks for each axis.
  for (var i = 0; i < numAxes; i++) {
    var axis = this.axes_[i];
    var logscale = this.attributes_.getForAxis("logscale", i);
    var includeZero = this.attributes_.getForAxis("includeZero", i);
    var independentTicks = this.attributes_.getForAxis("independentTicks", i);
    series = this.attributes_.seriesForAxis(i);

    // Add some padding. This supports two Y padding operation modes:
    //
    // - backwards compatible (yRangePad not set):
    //   10% padding for automatic Y ranges, but not for user-supplied
    //   ranges, and move a close-to-zero edge to zero, since drawing at the edge
    //   results in invisible lines. Unfortunately lines drawn at the edge of a
    //   user-supplied range will still be invisible. If logscale is
    //   set, add a variable amount of padding at the top but
    //   none at the bottom.
    //
    // - new-style (yRangePad set by the user):
    //   always add the specified Y padding.
    //
    ypadCompat = true;
    ypad = 0.1; // add 10%
    var yRangePad = this.getNumericOption('yRangePad');
    if (yRangePad !== null) {
      ypadCompat = false;
      // Convert pixel padding to ratio
      ypad = yRangePad / this.plotter_.area.h;
    }
    if (series.length === 0) {
      // If no series are defined or visible then use a reasonable default
      axis.extremeRange = [0, 1];
    } else {
      // Calculate the extremes of extremes.
      var minY = Infinity; // extremes[series[0]][0];
      var maxY = -Infinity; // extremes[series[0]][1];
      var extremeMinY, extremeMaxY;
      for (var j = 0; j < series.length; j++) {
        // this skips invisible series
        if (!extremes.hasOwnProperty(series[j])) continue;

        // Only use valid extremes to stop null data series' from corrupting the scale.
        extremeMinY = extremes[series[j]][0];
        if (extremeMinY !== null) {
          minY = Math.min(extremeMinY, minY);
        }
        extremeMaxY = extremes[series[j]][1];
        if (extremeMaxY !== null) {
          maxY = Math.max(extremeMaxY, maxY);
        }
      }

      // Include zero if requested by the user.
      if (includeZero && !logscale) {
        if (minY > 0) minY = 0;
        if (maxY < 0) maxY = 0;
      }

      // Ensure we have a valid scale, otherwise default to [0, 1] for safety.
      if (minY == Infinity) minY = 0;
      if (maxY == -Infinity) maxY = 1;
      span = maxY - minY;
      // special case: if we have no sense of scale, center on the sole value.
      if (span === 0) {
        if (maxY !== 0) {
          span = Math.abs(maxY);
        } else {
          // ... and if the sole value is zero, use range 0-1.
          maxY = 1;
          span = 1;
        }
      }
      var maxAxisY = maxY,
        minAxisY = minY;
      if (ypadCompat) {
        if (logscale) {
          maxAxisY = maxY + ypad * span;
          minAxisY = minY;
        } else {
          maxAxisY = maxY + ypad * span;
          minAxisY = minY - ypad * span;

          // Backwards-compatible behavior: Move the span to start or end at zero if it's
          // close to zero.
          if (minAxisY < 0 && minY >= 0) minAxisY = 0;
          if (maxAxisY > 0 && maxY <= 0) maxAxisY = 0;
        }
      }
      axis.extremeRange = [minAxisY, maxAxisY];
    }
    if (axis.valueRange) {
      // This is a user-set value range for this axis.
      var y0 = isNullUndefinedOrNaN(axis.valueRange[0]) ? axis.extremeRange[0] : axis.valueRange[0];
      var y1 = isNullUndefinedOrNaN(axis.valueRange[1]) ? axis.extremeRange[1] : axis.valueRange[1];
      axis.computedValueRange = [y0, y1];
    } else {
      axis.computedValueRange = axis.extremeRange;
    }
    if (!ypadCompat) {
      // When using yRangePad, adjust the upper/lower bounds to add
      // padding unless the user has zoomed/panned the Y axis range.

      y0 = axis.computedValueRange[0];
      y1 = axis.computedValueRange[1];

      // special case #781: if we have no sense of scale, center on the sole value.
      if (y0 === y1) {
        if (y0 === 0) {
          y1 = 1;
        } else {
          var delta = Math.abs(y0 / 10);
          y0 -= delta;
          y1 += delta;
        }
      }
      if (logscale) {
        var y0pct = ypad / (2 * ypad - 1);
        var y1pct = (ypad - 1) / (2 * ypad - 1);
        axis.computedValueRange[0] = utils.logRangeFraction(y0, y1, y0pct);
        axis.computedValueRange[1] = utils.logRangeFraction(y0, y1, y1pct);
      } else {
        span = y1 - y0;
        axis.computedValueRange[0] = y0 - span * ypad;
        axis.computedValueRange[1] = y1 + span * ypad;
      }
    }
    if (independentTicks) {
      axis.independentTicks = independentTicks;
      var opts = this.optionsViewForAxis_('y' + (i ? '2' : ''));
      var ticker = opts('ticker');
      axis.ticks = ticker(axis.computedValueRange[0], axis.computedValueRange[1], this.plotter_.area.h, opts, this);
      // Define the first independent axis as primary axis.
      if (!p_axis) p_axis = axis;
    }
  }
  if (p_axis === undefined) {
    throw "Configuration Error: At least one axis has to have the \"independentTicks\" option activated.";
  }
  // Add ticks. By default, all axes inherit the tick positions of the
  // primary axis. However, if an axis is specifically marked as having
  // independent ticks, then that is permissible as well.
  for (var i = 0; i < numAxes; i++) {
    var axis = this.axes_[i];
    if (!axis.independentTicks) {
      var opts = this.optionsViewForAxis_('y' + (i ? '2' : ''));
      var ticker = opts('ticker');
      var p_ticks = p_axis.ticks;
      var p_scale = p_axis.computedValueRange[1] - p_axis.computedValueRange[0];
      var scale = axis.computedValueRange[1] - axis.computedValueRange[0];
      var tick_values = [];
      for (var k = 0; k < p_ticks.length; k++) {
        var y_frac = (p_ticks[k].v - p_axis.computedValueRange[0]) / p_scale;
        var y_val = axis.computedValueRange[0] + y_frac * scale;
        tick_values.push(y_val);
      }
      axis.ticks = ticker(axis.computedValueRange[0], axis.computedValueRange[1], this.plotter_.area.h, opts, this, tick_values);
    }
  }
};

/**
 * Detects the type of the str (date or numeric) and sets the various
 * formatting attributes in this.attrs_ based on this type.
 * @param {string} str An x value.
 * @private
 */
Dygraph.prototype.detectTypeFromString_ = function (str) {
  var isDate = false;
  var dashPos = str.indexOf('-'); // could be 2006-01-01 _or_ 1.0e-2
  if (dashPos > 0 && str[dashPos - 1] != 'e' && str[dashPos - 1] != 'E' || str.indexOf('/') >= 0 || isNaN(parseFloat(str))) {
    isDate = true;
  }
  this.setXAxisOptions_(isDate);
};
Dygraph.prototype.setXAxisOptions_ = function (isDate) {
  if (isDate) {
    this.attrs_.xValueParser = utils.dateParser;
    this.attrs_.axes.x.valueFormatter = utils.dateValueFormatter;
    this.attrs_.axes.x.ticker = DygraphTickers.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = utils.dateAxisLabelFormatter;
  } else {
    /** @private (shut up, jsdoc!) */
    this.attrs_.xValueParser = function (x) {
      return parseFloat(x);
    };
    // TODO(danvk): use Dygraph.numberValueFormatter here?
    /** @private (shut up, jsdoc!) */
    this.attrs_.axes.x.valueFormatter = function (x) {
      return x;
    };
    this.attrs_.axes.x.ticker = DygraphTickers.numericTicks;
    this.attrs_.axes.x.axisLabelFormatter = this.attrs_.axes.x.valueFormatter;
  }
};

/**
 * @private
 * Parses a string in a special csv format.  We expect a csv file where each
 * line is a date point, and the first field in each line is the date string.
 * We also expect that all remaining fields represent series.
 * if the errorBars attribute is set, then interpret the fields as:
 * date, series1, stddev1, series2, stddev2, ...
 * @param {[Object]} data See above.
 *
 * @return [Object] An array with one entry for each row. These entries
 * are an array of cells in that row. The first entry is the parsed x-value for
 * the row. The second, third, etc. are the y-values. These can take on one of
 * three forms, depending on the CSV and constructor parameters:
 * 1. numeric value
 * 2. [ value, stddev ]
 * 3. [ low value, center value, high value ]
 */
Dygraph.prototype.parseCSV_ = function (data) {
  var ret = [];
  var line_delimiter = utils.detectLineDelimiter(data);
  var lines = data.split(line_delimiter || "\n");
  var vals, j;

  // Use the default delimiter or fall back to a tab if that makes sense.
  var delim = this.getStringOption('delimiter');
  if (lines[0].indexOf(delim) == -1 && lines[0].indexOf('\t') >= 0) {
    delim = '\t';
  }
  var start = 0;
  if (!('labels' in this.user_attrs_)) {
    // User hasn't explicitly set labels, so they're (presumably) in the CSV.
    start = 1;
    this.attrs_.labels = lines[0].split(delim); // NOTE: _not_ user_attrs_.
    this.attributes_.reparseSeries();
  }
  var line_no = 0;
  var xParser;
  var defaultParserSet = false; // attempt to auto-detect x value type
  var expectedCols = this.attr_("labels").length;
  var outOfOrder = false;
  for (var i = start; i < lines.length; i++) {
    var line = lines[i];
    line_no = i;
    if (line.length === 0) continue; // skip blank lines
    if (line[0] == '#') continue; // skip comment lines
    var inFields = line.split(delim);
    if (inFields.length < 2) continue;
    var fields = [];
    if (!defaultParserSet) {
      this.detectTypeFromString_(inFields[0]);
      xParser = this.getFunctionOption("xValueParser");
      defaultParserSet = true;
    }
    fields[0] = xParser(inFields[0], this);

    // If fractions are expected, parse the numbers as "A/B"
    if (this.fractions_) {
      for (j = 1; j < inFields.length; j++) {
        // TODO(danvk): figure out an appropriate way to flag parse errors.
        vals = inFields[j].split("/");
        if (vals.length != 2) {
          console.error('Expected fractional "num/den" values in CSV data ' + "but found a value '" + inFields[j] + "' on line " + (1 + i) + " ('" + line + "') which is not of this form.");
          fields[j] = [0, 0];
        } else {
          fields[j] = [utils.parseFloat_(vals[0], i, line), utils.parseFloat_(vals[1], i, line)];
        }
      }
    } else if (this.getBooleanOption("errorBars")) {
      // If there are sigma-based high/low bands, values are (value, stddev) pairs
      if (inFields.length % 2 != 1) {
        console.error('Expected alternating (value, stdev.) pairs in CSV data ' + 'but line ' + (1 + i) + ' has an odd number of values (' + (inFields.length - 1) + "): '" + line + "'");
      }
      for (j = 1; j < inFields.length; j += 2) {
        fields[(j + 1) / 2] = [utils.parseFloat_(inFields[j], i, line), utils.parseFloat_(inFields[j + 1], i, line)];
      }
    } else if (this.getBooleanOption("customBars")) {
      // Custom high/low bands are a low;centre;high tuple
      for (j = 1; j < inFields.length; j++) {
        var val = inFields[j];
        if (/^ *$/.test(val)) {
          fields[j] = [null, null, null];
        } else {
          vals = val.split(";");
          if (vals.length == 3) {
            fields[j] = [utils.parseFloat_(vals[0], i, line), utils.parseFloat_(vals[1], i, line), utils.parseFloat_(vals[2], i, line)];
          } else {
            console.warn('When using customBars, values must be either blank ' + 'or "low;center;high" tuples (got "' + val + '" on line ' + (1 + i) + ')');
          }
        }
      }
    } else {
      // Values are just numbers
      for (j = 1; j < inFields.length; j++) {
        fields[j] = utils.parseFloat_(inFields[j], i, line);
      }
    }
    if (ret.length > 0 && fields[0] < ret[ret.length - 1][0]) {
      outOfOrder = true;
    }
    if (fields.length != expectedCols) {
      console.error("Number of columns in line " + i + " (" + fields.length + ") does not agree with number of labels (" + expectedCols + ") " + line);
    }

    // If the user specified the 'labels' option and none of the cells of the
    // first row parsed correctly, then they probably double-specified the
    // labels. We go with the values set in the option, discard this row and
    // log a warning to the JS console.
    if (i === 0 && this.attr_('labels')) {
      var all_null = true;
      for (j = 0; all_null && j < fields.length; j++) {
        if (fields[j]) all_null = false;
      }
      if (all_null) {
        console.warn("The dygraphs 'labels' option is set, but the first row " + "of CSV data ('" + line + "') appears to also contain " + "labels. Will drop the CSV labels and use the option " + "labels.");
        continue;
      }
    }
    ret.push(fields);
  }
  if (outOfOrder) {
    console.warn("CSV is out of order; order it correctly to speed loading.");
    ret.sort(function (a, b) {
      return a[0] - b[0];
    });
  }
  return ret;
};

// In native format, all values must be dates or numbers.
// This check isn't perfect but will catch most mistaken uses of strings.
function validateNativeFormat(data) {
  var firstRow = data[0];
  var firstX = firstRow[0];
  if (typeof firstX !== 'number' && !utils.isDateLike(firstX)) {
    throw new Error("Expected number or date but got ".concat(typeof firstX, ": ").concat(firstX, "."));
  }
  for (var i = 1; i < firstRow.length; i++) {
    var val = firstRow[i];
    if (val === null || val === undefined) continue;
    if (typeof val === 'number') continue;
    if (utils.isArrayLike(val)) continue; // e.g. errorBars or customBars
    throw new Error("Expected number or array but got ".concat(typeof val, ": ").concat(val, "."));
  }
}

/**
 * The user has provided their data as a pre-packaged JS array. If the x values
 * are numeric, this is the same as dygraphs' internal format. If the x values
 * are dates, we need to convert them from Date objects to ms since epoch.
 * @param {!Array} data
 * @return {Object} data with numeric x values.
 * @private
 */
Dygraph.prototype.parseArray_ = function (data) {
  // Peek at the first x value to see if it's numeric.
  if (data.length === 0) {
    data = [[0]];
  }
  if (data[0].length === 0) {
    console.error("Data set cannot contain an empty row");
    return null;
  }
  validateNativeFormat(data);
  var i;
  if (this.attr_("labels") === null) {
    console.warn("Using default labels. Set labels explicitly via 'labels' " + "in the options parameter");
    this.attrs_.labels = ["X"];
    for (i = 1; i < data[0].length; i++) {
      this.attrs_.labels.push("Y" + i); // Not user_attrs_.
    }
    this.attributes_.reparseSeries();
  } else {
    var num_labels = this.attr_("labels");
    if (num_labels.length != data[0].length) {
      console.error("Mismatch between number of labels (" + num_labels + ")" + " and number of columns in array (" + data[0].length + ")");
      return null;
    }
  }
  if (utils.isDateLike(data[0][0])) {
    // Some intelligent defaults for a date x-axis.
    this.attrs_.axes.x.valueFormatter = utils.dateValueFormatter;
    this.attrs_.axes.x.ticker = DygraphTickers.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = utils.dateAxisLabelFormatter;

    // Assume they're all dates.
    var parsedData = utils.clone(data);
    for (i = 0; i < data.length; i++) {
      if (parsedData[i].length === 0) {
        console.error("Row " + (1 + i) + " of data is empty");
        return null;
      }
      if (parsedData[i][0] === null || typeof parsedData[i][0].getTime != 'function' || isNaN(parsedData[i][0].getTime())) {
        console.error("x value in row " + (1 + i) + " is not a Date");
        return null;
      }
      parsedData[i][0] = parsedData[i][0].getTime();
    }
    return parsedData;
  } else {
    // Some intelligent defaults for a numeric x-axis.
    /** @private (shut up, jsdoc!) */
    this.attrs_.axes.x.valueFormatter = function (x) {
      return x;
    };
    this.attrs_.axes.x.ticker = DygraphTickers.numericTicks;
    this.attrs_.axes.x.axisLabelFormatter = utils.numberAxisLabelFormatter;
    return data;
  }
};

/**
 * Parses a DataTable object from gviz.
 * The data is expected to have a first column that is either a date or a
 * number. All subsequent columns must be numbers. If there is a clear mismatch
 * between this.xValueParser_ and the type of the first column, it will be
 * fixed. Fills out rawData_.
 * @param {!google.visualization.DataTable} data See above.
 * @private
 */
Dygraph.prototype.parseDataTable_ = function (data) {
  var shortTextForAnnotationNum = function shortTextForAnnotationNum(num) {
    // converts [0-9]+ [A-Z][a-z]*
    // example: 0=A, 1=B, 25=Z, 26=Aa, 27=Ab
    // and continues like.. Ba Bb .. Za .. Zz..Aaa...Zzz Aaaa Zzzz
    var shortText = String.fromCharCode(65 /* A */ + num % 26);
    num = Math.floor(num / 26);
    while (num > 0) {
      shortText = String.fromCharCode(65 /* A */ + (num - 1) % 26) + shortText.toLowerCase();
      num = Math.floor((num - 1) / 26);
    }
    return shortText;
  };
  var cols = data.getNumberOfColumns();
  var rows = data.getNumberOfRows();
  var indepType = data.getColumnType(0);
  if (indepType == 'date' || indepType == 'datetime') {
    this.attrs_.xValueParser = utils.dateParser;
    this.attrs_.axes.x.valueFormatter = utils.dateValueFormatter;
    this.attrs_.axes.x.ticker = DygraphTickers.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = utils.dateAxisLabelFormatter;
  } else if (indepType == 'number') {
    this.attrs_.xValueParser = function (x) {
      return parseFloat(x);
    };
    this.attrs_.axes.x.valueFormatter = function (x) {
      return x;
    };
    this.attrs_.axes.x.ticker = DygraphTickers.numericTicks;
    this.attrs_.axes.x.axisLabelFormatter = this.attrs_.axes.x.valueFormatter;
  } else {
    throw new Error("only 'date', 'datetime' and 'number' types are supported " + "for column 1 of DataTable input (Got '" + indepType + "')");
  }

  // Array of the column indices which contain data (and not annotations).
  var colIdx = [];
  var annotationCols = {}; // data index -> [annotation cols]
  var hasAnnotations = false;
  var i, j;
  for (i = 1; i < cols; i++) {
    var type = data.getColumnType(i);
    if (type == 'number') {
      colIdx.push(i);
    } else if (type == 'string' && this.getBooleanOption('displayAnnotations')) {
      // This is OK -- it's an annotation column.
      var dataIdx = colIdx[colIdx.length - 1];
      if (!annotationCols.hasOwnProperty(dataIdx)) {
        annotationCols[dataIdx] = [i];
      } else {
        annotationCols[dataIdx].push(i);
      }
      hasAnnotations = true;
    } else {
      throw new Error("Only 'number' is supported as a dependent type with Gviz." + " 'string' is only supported if displayAnnotations is true");
    }
  }

  // Read column labels
  // TODO(danvk): add support back for errorBars
  var labels = [data.getColumnLabel(0)];
  for (i = 0; i < colIdx.length; i++) {
    labels.push(data.getColumnLabel(colIdx[i]));
    if (this.getBooleanOption("errorBars")) i += 1;
  }
  this.attrs_.labels = labels;
  cols = labels.length;
  var ret = [];
  var outOfOrder = false;
  var annotations = [];
  for (i = 0; i < rows; i++) {
    var row = [];
    if (typeof data.getValue(i, 0) === 'undefined' || data.getValue(i, 0) === null) {
      console.warn("Ignoring row " + i + " of DataTable because of undefined or null first column.");
      continue;
    }
    if (indepType == 'date' || indepType == 'datetime') {
      row.push(data.getValue(i, 0).getTime());
    } else {
      row.push(data.getValue(i, 0));
    }
    if (!this.getBooleanOption("errorBars")) {
      for (j = 0; j < colIdx.length; j++) {
        var col = colIdx[j];
        row.push(data.getValue(i, col));
        if (hasAnnotations && annotationCols.hasOwnProperty(col) && data.getValue(i, annotationCols[col][0]) !== null) {
          var ann = {};
          ann.series = data.getColumnLabel(col);
          ann.xval = row[0];
          ann.shortText = shortTextForAnnotationNum(annotations.length);
          ann.text = '';
          for (var k = 0; k < annotationCols[col].length; k++) {
            if (k) ann.text += "\n";
            ann.text += data.getValue(i, annotationCols[col][k]);
          }
          annotations.push(ann);
        }
      }

      // Strip out infinities, which give dygraphs problems later on.
      for (j = 0; j < row.length; j++) {
        if (!isFinite(row[j])) row[j] = null;
      }
    } else {
      for (j = 0; j < cols - 1; j++) {
        row.push([data.getValue(i, 1 + 2 * j), data.getValue(i, 2 + 2 * j)]);
      }
    }
    if (ret.length > 0 && row[0] < ret[ret.length - 1][0]) {
      outOfOrder = true;
    }
    ret.push(row);
  }
  if (outOfOrder) {
    console.warn("DataTable is out of order; order it correctly to speed loading.");
    ret.sort(function (a, b) {
      return a[0] - b[0];
    });
  }
  this.rawData_ = ret;
  if (annotations.length > 0) {
    this.setAnnotations(annotations, true);
  }
  this.attributes_.reparseSeries();
};

/**
 * Signals to plugins that the chart data has updated.
 * This happens after the data has updated but before the chart has redrawn.
 * @private
 */
Dygraph.prototype.cascadeDataDidUpdateEvent_ = function () {
  // TODO(danvk): there are some issues checking xAxisRange() and using
  // toDomCoords from handlers of this event. The visible range should be set
  // when the chart is drawn, not derived from the data.
  this.cascadeEvents_('dataDidUpdate', {});
};

/**
 * Get the CSV data. If it's in a function, call that function. If it's in a
 * file, do an XMLHttpRequest to get it.
 * @private
 */
Dygraph.prototype.start_ = function () {
  var data = this.file_;

  // Functions can return references of all other types.
  if (typeof data == 'function') {
    data = data();
  }
  var datatype = utils.typeArrayLike(data);
  if (datatype == 'array') {
    this.rawData_ = this.parseArray_(data);
    this.cascadeDataDidUpdateEvent_();
    this.predraw_();
  } else if (datatype == 'object' && typeof data.getColumnRange == 'function') {
    // must be a DataTable from gviz.
    this.parseDataTable_(data);
    this.cascadeDataDidUpdateEvent_();
    this.predraw_();
  } else if (datatype == 'string') {
    // Heuristic: a newline means it's CSV data. Otherwise it's an URL.
    var line_delimiter = utils.detectLineDelimiter(data);
    if (line_delimiter) {
      this.loadedEvent_(data);
    } else {
      // REMOVE_FOR_IE
      var req;
      if (window.XMLHttpRequest) {
        // Firefox, Opera, IE7, and other browsers will use the native object
        req = new XMLHttpRequest();
      } else {
        // IE 5 and 6 will use the ActiveX control
        req = new ActiveXObject("Microsoft.XMLHTTP");
      }
      var caller = this;
      req.onreadystatechange = function () {
        if (req.readyState == 4) {
          if (req.status === 200 ||
          // Normal http
          req.status === 0) {
            // Chrome w/ --allow-file-access-from-files
            caller.loadedEvent_(req.responseText);
          }
        }
      };
      req.open("GET", data, true);
      req.send(null);
    }
  } else {
    console.error("Unknown data format: " + datatype);
  }
};

/**
 * Changes various properties of the graph. These can include:
 * <ul>
 * <li>file: changes the source data for the graph</li>
 * <li>errorBars: changes whether the data contains stddev</li>
 * </ul>
 *
 * There's a huge variety of options that can be passed to this method. For a
 * full list, see: https://dygraphs.com/options.html
 *
 * @param {Object} input_attrs The new properties and values
 * @param {boolean} block_redraw Usually the chart is redrawn after every
 *     call to updateOptions(). If you know better, you can pass true to
 *     explicitly block the redraw. This can be useful for chaining
 *     updateOptions() calls, avoiding the occasional infinite loop and
 *     preventing redraws when it's not necessary (e.g. when updating a
 *     callback).
 */
Dygraph.prototype.updateOptions = function (input_attrs, block_redraw) {
  if (typeof block_redraw == 'undefined') block_redraw = false;

  // copyUserAttrs_ drops the "file" parameter as a convenience to us.
  var file = input_attrs.file;
  var attrs = Dygraph.copyUserAttrs_(input_attrs);
  var prevNumAxes = this.attributes_.numAxes();

  // TODO(danvk): this is a mess. Move these options into attr_.
  if ('rollPeriod' in attrs) {
    this.rollPeriod_ = attrs.rollPeriod;
  }
  if ('dateWindow' in attrs) {
    this.dateWindow_ = attrs.dateWindow;
  }

  // TODO(danvk): validate per-series options.
  // Supported:
  // strokeWidth
  // pointSize
  // drawPoints
  // highlightCircleSize

  // Check if this set options will require new points.
  var requiresNewPoints = utils.isPixelChangingOptionList(this.attr_("labels"), attrs);
  utils.updateDeep(this.user_attrs_, attrs);
  this.attributes_.reparseSeries();
  if (prevNumAxes < this.attributes_.numAxes()) this.plotter_.clear();
  if (file) {
    // This event indicates that the data is about to change, but hasn't yet.
    // TODO(danvk): support cancellation of the update via this event.
    this.cascadeEvents_('dataWillUpdate', {});
    this.file_ = file;
    if (!block_redraw) this.start_();
  } else {
    if (!block_redraw) {
      if (requiresNewPoints) {
        this.predraw_();
      } else {
        this.renderGraph_(false);
      }
    }
  }
};

/**
 * Make a copy of input attributes, removing file as a convenience.
 * @private
 */
Dygraph.copyUserAttrs_ = function (attrs) {
  var my_attrs = {};
  for (var k in attrs) {
    if (!attrs.hasOwnProperty(k)) continue;
    if (k == 'file') continue;
    if (attrs.hasOwnProperty(k)) my_attrs[k] = attrs[k];
  }
  return my_attrs;
};

/**
 * Resizes the dygraph. If no parameters are specified, resizes to fill the
 * containing div (which has presumably changed size since the dygraph was
 * instantiated). If the width/height are specified, the div will be resized.
 *
 * This is far more efficient than destroying and re-instantiating a
 * Dygraph, since it doesn't have to reparse the underlying data.
 *
 * @param {number} width Width (in pixels)
 * @param {number} height Height (in pixels)
 */
Dygraph.prototype.resize = function (width, height) {
  if (this.resize_lock) {
    return;
  }
  this.resize_lock = true;
  if (width === null != (height === null)) {
    console.warn("Dygraph.resize() should be called with zero parameters or " + "two non-NULL parameters. Pretending it was zero.");
    width = height = null;
  }
  var old_width = this.width_;
  var old_height = this.height_;
  if (width) {
    this.maindiv_.style.width = width + "px";
    this.maindiv_.style.height = height + "px";
    this.width_ = width;
    this.height_ = height;
  } else {
    this.width_ = this.maindiv_.clientWidth;
    this.height_ = this.maindiv_.clientHeight;
  }
  if (old_width != this.width_ || old_height != this.height_) {
    // Resizing a canvas erases it, even when the size doesn't change, so
    // any resize needs to be followed by a redraw.
    this.resizeElements_();
    this.predraw_();
  }
  this.resize_lock = false;
};

/**
 * Adjusts the number of points in the rolling average. Updates the graph to
 * reflect the new averaging period.
 * @param {number} length Number of points over which to average the data.
 */
Dygraph.prototype.adjustRoll = function (length) {
  this.rollPeriod_ = length;
  this.predraw_();
};

/**
 * Returns a boolean array of visibility statuses.
 */
Dygraph.prototype.visibility = function () {
  // Do lazy-initialization, so that this happens after we know the number of
  // data series.
  if (!this.getOption("visibility")) {
    this.attrs_.visibility = [];
  }
  // TODO(danvk): it looks like this could go into an infinite loop w/ user_attrs.
  while (this.getOption("visibility").length < this.numColumns() - 1) {
    this.attrs_.visibility.push(true);
  }
  return this.getOption("visibility");
};

/**
 * Changes the visibility of one or more series.
 *
 * @param {number|number[]|object} num the series index or an array of series indices
 *                                     or a boolean array of visibility states by index
 *                                     or an object mapping series numbers, as keys, to
 *                                     visibility state (boolean values)
 * @param {boolean} value the visibility state expressed as a boolean
 */
Dygraph.prototype.setVisibility = function (num, value) {
  var x = this.visibility();
  var numIsObject = false;
  if (!Array.isArray(num)) {
    if (num !== null && typeof num === 'object') {
      numIsObject = true;
    } else {
      num = [num];
    }
  }
  if (numIsObject) {
    for (var i in num) {
      if (num.hasOwnProperty(i)) {
        if (i < 0 || i >= x.length) {
          console.warn("Invalid series number in setVisibility: " + i);
        } else {
          x[i] = num[i];
        }
      }
    }
  } else {
    for (var i = 0; i < num.length; i++) {
      if (typeof num[i] === 'boolean') {
        if (i >= x.length) {
          console.warn("Invalid series number in setVisibility: " + i);
        } else {
          x[i] = num[i];
        }
      } else {
        if (num[i] < 0 || num[i] >= x.length) {
          console.warn("Invalid series number in setVisibility: " + num[i]);
        } else {
          x[num[i]] = value;
        }
      }
    }
  }
  this.predraw_();
};

/**
 * How large of an area will the dygraph render itself in?
 * This is used for testing.
 * @return A {width: w, height: h} object.
 * @private
 */
Dygraph.prototype.size = function () {
  return {
    width: this.width_,
    height: this.height_
  };
};

/**
 * Update the list of annotations and redraw the chart.
 * See dygraphs.com/annotations.html for more info on how to use annotations.
 * @param ann {Array} An array of annotation objects.
 * @param suppressDraw {Boolean} Set to "true" to block chart redraw (optional).
 */
Dygraph.prototype.setAnnotations = function (ann, suppressDraw) {
  // Only add the annotation CSS rule once we know it will be used.
  this.annotations_ = ann;
  if (!this.layout_) {
    console.warn("Tried to setAnnotations before dygraph was ready. " + "Try setting them in a ready() block. See " + "dygraphs.com/tests/annotation.html");
    return;
  }
  this.layout_.setAnnotations(this.annotations_);
  if (!suppressDraw) {
    this.predraw_();
  }
};

/**
 * Return the list of annotations.
 */
Dygraph.prototype.annotations = function () {
  return this.annotations_;
};

/**
 * Get the list of label names for this graph. The first column is the
 * x-axis, so the data series names start at index 1.
 *
 * Returns null when labels have not yet been defined.
 */
Dygraph.prototype.getLabels = function () {
  var labels = this.attr_("labels");
  return labels ? labels.slice() : null;
};

/**
 * Get the index of a series (column) given its name. The first column is the
 * x-axis, so the data series start with index 1.
 */
Dygraph.prototype.indexFromSetName = function (name) {
  return this.setIndexByName_[name];
};

/**
 * Find the row number corresponding to the given x-value.
 * Returns null if there is no such x-value in the data.
 * If there are multiple rows with the same x-value, this will return the
 * first one.
 * @param {number} xVal The x-value to look for (e.g. millis since epoch).
 * @return {?number} The row number, which you can pass to getValue(), or null.
 */
Dygraph.prototype.getRowForX = function (xVal) {
  var low = 0,
    high = this.numRows() - 1;
  while (low <= high) {
    var idx = high + low >> 1;
    var x = this.getValue(idx, 0);
    if (x < xVal) {
      low = idx + 1;
    } else if (x > xVal) {
      high = idx - 1;
    } else if (low != idx) {
      // equal, but there may be an earlier match.
      high = idx;
    } else {
      return idx;
    }
  }
  return null;
};

/**
 * Trigger a callback when the dygraph has drawn itself and is ready to be
 * manipulated. This is primarily useful when dygraphs has to do an XHR for the
 * data (i.e. a URL is passed as the data source) and the chart is drawn
 * asynchronously. If the chart has already drawn, the callback will fire
 * immediately.
 *
 * This is a good place to call setAnnotation().
 *
 * @param {function(!Dygraph)} callback The callback to trigger when the chart
 *     is ready.
 */
Dygraph.prototype.ready = function (callback) {
  if (this.is_initial_draw_) {
    this.readyFns_.push(callback);
  } else {
    callback.call(this, this);
  }
};

/**
 * Add an event handler. This event handler is kept until the graph is
 * destroyed with a call to graph.destroy().
 *
 * @param {!Node} elem The element to add the event to.
 * @param {string} type The type of the event, e.g. 'click' or 'mousemove'.
 * @param {function(Event):(boolean|undefined)} fn The function to call
 *     on the event. The function takes one parameter: the event object.
 * @private
 */
Dygraph.prototype.addAndTrackEvent = function (elem, type, fn) {
  utils.addEvent(elem, type, fn);
  this.registeredEvents_.push({
    elem: elem,
    type: type,
    fn: fn
  });
};
Dygraph.prototype.removeTrackedEvents_ = function () {
  if (this.registeredEvents_) {
    for (var idx = 0; idx < this.registeredEvents_.length; idx++) {
      var reg = this.registeredEvents_[idx];
      utils.removeEvent(reg.elem, reg.type, reg.fn);
    }
  }
  this.registeredEvents_ = [];
};

// Installed plugins, in order of precedence (most-general to most-specific).
// This means that, in an event cascade, plugins which have registered
// for that event will be called in reverse order.
//
// This is most relevant for plugins which register a layout event,
// e.g. Axes, Legend and ChartLabels.
Dygraph.PLUGINS = [_legend["default"], _axes["default"], _rangeSelector["default"],
// Has to be before ChartLabels so that its callbacks are called after ChartLabels' callbacks.
_chartLabels["default"], _annotations["default"], _grid["default"]];

// There are many symbols which have historically been available through the
// Dygraph class. These are exported here for backwards compatibility.
Dygraph.GVizChart = _dygraphGviz["default"];
Dygraph.DOTTED_LINE = utils.DOTTED_LINE;
Dygraph.DASHED_LINE = utils.DASHED_LINE;
Dygraph.DOT_DASH_LINE = utils.DOT_DASH_LINE;
Dygraph.dateAxisLabelFormatter = utils.dateAxisLabelFormatter;
Dygraph.toRGB_ = utils.toRGB_;
Dygraph.findPos = utils.findPos;
Dygraph.pageX = utils.pageX;
Dygraph.pageY = utils.pageY;
Dygraph.dateString_ = utils.dateString_;
Dygraph.defaultInteractionModel = _dygraphInteractionModel["default"].defaultModel;
Dygraph.nonInteractiveModel = Dygraph.nonInteractiveModel_ = _dygraphInteractionModel["default"].nonInteractiveModel_;
Dygraph.Circles = utils.Circles;
Dygraph.Plugins = {
  Legend: _legend["default"],
  Axes: _axes["default"],
  Annotations: _annotations["default"],
  ChartLabels: _chartLabels["default"],
  Grid: _grid["default"],
  RangeSelector: _rangeSelector["default"]
};
Dygraph.DataHandlers = {
  DefaultHandler: _default2["default"],
  BarsHandler: _bars["default"],
  CustomBarsHandler: _barsCustom["default"],
  DefaultFractionHandler: _defaultFractions["default"],
  ErrorBarsHandler: _barsError["default"],
  FractionsBarsHandler: _barsFractions["default"]
};
Dygraph.startPan = _dygraphInteractionModel["default"].startPan;
Dygraph.startZoom = _dygraphInteractionModel["default"].startZoom;
Dygraph.movePan = _dygraphInteractionModel["default"].movePan;
Dygraph.moveZoom = _dygraphInteractionModel["default"].moveZoom;
Dygraph.endPan = _dygraphInteractionModel["default"].endPan;
Dygraph.endZoom = _dygraphInteractionModel["default"].endZoom;
Dygraph.numericLinearTicks = DygraphTickers.numericLinearTicks;
Dygraph.numericTicks = DygraphTickers.numericTicks;
Dygraph.integerTicks = DygraphTickers.integerTicks;
Dygraph.dateTicker = DygraphTickers.dateTicker;
Dygraph.Granularity = DygraphTickers.Granularity;
Dygraph.pickDateTickGranularity = DygraphTickers.pickDateTickGranularity;
Dygraph.getDateAxis = DygraphTickers.getDateAxis;
Dygraph.floatFormat = utils.floatFormat;
utils.setupDOMready_(Dygraph);
var _default = exports["default"] = Dygraph;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsIl9keWdyYXBoTGF5b3V0IiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJfZHlncmFwaENhbnZhcyIsIl9keWdyYXBoT3B0aW9ucyIsIl9keWdyYXBoSW50ZXJhY3Rpb25Nb2RlbCIsIkR5Z3JhcGhUaWNrZXJzIiwiX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQiLCJ1dGlscyIsIl9keWdyYXBoRGVmYXVsdEF0dHJzIiwiX2R5Z3JhcGhPcHRpb25zUmVmZXJlbmNlIiwiX2lmcmFtZVRhcnAiLCJfZGVmYXVsdDIiLCJfYmFyc0Vycm9yIiwiX2JhcnNDdXN0b20iLCJfZGVmYXVsdEZyYWN0aW9ucyIsIl9iYXJzRnJhY3Rpb25zIiwiX2JhcnMiLCJfYW5ub3RhdGlvbnMiLCJfYXhlcyIsIl9jaGFydExhYmVscyIsIl9ncmlkIiwiX2xlZ2VuZCIsIl9yYW5nZVNlbGVjdG9yIiwiX2R5Z3JhcGhHdml6IiwiZSIsInQiLCJXZWFrTWFwIiwiciIsIm4iLCJfX2VzTW9kdWxlIiwibyIsImkiLCJmIiwiX19wcm90b19fIiwiaGFzIiwiZ2V0Iiwic2V0IiwiX3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJfc2xpY2VkVG9BcnJheSIsIl9hcnJheVdpdGhIb2xlcyIsIl9pdGVyYWJsZVRvQXJyYXlMaW1pdCIsIl91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheSIsIl9ub25JdGVyYWJsZVJlc3QiLCJUeXBlRXJyb3IiLCJhIiwiX2FycmF5TGlrZVRvQXJyYXkiLCJ0b1N0cmluZyIsInNsaWNlIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiQXJyYXkiLCJmcm9tIiwidGVzdCIsImxlbmd0aCIsImwiLCJTeW1ib2wiLCJpdGVyYXRvciIsInUiLCJuZXh0IiwiZG9uZSIsInB1c2giLCJpc0FycmF5IiwiRHlncmFwaCIsImRpdiIsImRhdGEiLCJvcHRzIiwiX19pbml0X18iLCJOQU1FIiwiVkVSU0lPTiIsIl9hZGRyZXF1aXJlIiwiX3JlcXVpcmUiLCJ3aGF0IiwiX2IiLCJhZGQiLCJ0b3doYXQiLCJERUZBVUxUX1JPTExfUEVSSU9EIiwiREVGQVVMVF9XSURUSCIsIkRFRkFVTFRfSEVJR0hUIiwiQU5JTUFUSU9OX1NURVBTIiwiQU5JTUFUSU9OX0RVUkFUSU9OIiwiUGxvdHRlcnMiLCJEeWdyYXBoQ2FudmFzUmVuZGVyZXIiLCJfUGxvdHRlcnMiLCJhZGRlZEFubm90YXRpb25DU1MiLCJwcm90b3R5cGUiLCJmaWxlIiwiYXR0cnMiLCJpc19pbml0aWFsX2RyYXdfIiwicmVhZHlGbnNfIiwidW5kZWZpbmVkIiwiY29weVVzZXJBdHRyc18iLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiRXJyb3IiLCJtYWluZGl2XyIsImZpbGVfIiwicm9sbFBlcmlvZF8iLCJyb2xsUGVyaW9kIiwicHJldmlvdXNWZXJ0aWNhbFhfIiwiZnJhY3Rpb25zXyIsImZyYWN0aW9ucyIsImRhdGVXaW5kb3dfIiwiZGF0ZVdpbmRvdyIsImFubm90YXRpb25zXyIsImlubmVySFRNTCIsInJlc29sdmVkIiwid2luZG93IiwiZ2V0Q29tcHV0ZWRTdHlsZSIsInBhZGRpbmdMZWZ0IiwicGFkZGluZ1JpZ2h0IiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJjb25zb2xlIiwiZXJyb3IiLCJzdHlsZSIsIndpZHRoIiwiaGVpZ2h0IiwiY2xpZW50SGVpZ2h0Iiwid2lkdGhfIiwiY2xpZW50V2lkdGgiLCJoZWlnaHRfIiwic3RhY2tlZEdyYXBoIiwiZmlsbEdyYXBoIiwidXNlcl9hdHRyc18iLCJ1cGRhdGUiLCJhdHRyc18iLCJ1cGRhdGVEZWVwIiwiREVGQVVMVF9BVFRSUyIsImJvdW5kYXJ5SWRzXyIsInNldEluZGV4QnlOYW1lXyIsImRhdGFzZXRJbmRleF8iLCJyZWdpc3RlcmVkRXZlbnRzXyIsImV2ZW50TGlzdGVuZXJzXyIsImF0dHJpYnV0ZXNfIiwiRHlncmFwaE9wdGlvbnMiLCJjcmVhdGVJbnRlcmZhY2VfIiwicGx1Z2luc18iLCJwbHVnaW5zIiwiUExVR0lOUyIsImNvbmNhdCIsImdldE9wdGlvbiIsIlBsdWdpbiIsInBsdWdpbkluc3RhbmNlIiwiYWN0aXZhdGUiLCJwbHVnaW5EaWN0IiwicGx1Z2luIiwiZXZlbnRzIiwib3B0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJoYW5kbGVycyIsImV2ZW50TmFtZSIsInBsdWdpbl9kaWN0IiwiY2FsbGJhY2siLCJwYWlyIiwiY3JlYXRlRHJhZ0ludGVyZmFjZV8iLCJzdGFydF8iLCJjYXNjYWRlRXZlbnRzXyIsImV4dHJhX3Byb3BzIiwiZHlncmFwaCIsImNhbmNlbGFibGUiLCJkZWZhdWx0UHJldmVudGVkIiwicHJldmVudERlZmF1bHQiLCJwcm9wYWdhdGlvblN0b3BwZWQiLCJzdG9wUHJvcGFnYXRpb24iLCJjYWxsYmFja19wbHVnaW5fcGFpcnMiLCJnZXRQbHVnaW5JbnN0YW5jZV8iLCJ0eXBlIiwicCIsImlzWm9vbWVkIiwiYXhpcyIsImlzWm9vbWVkWCIsImlzWm9vbWVkWSIsImF4ZXNfIiwibWFwIiwidmFsdWVSYW5nZSIsImluZGV4T2YiLCJtYWluZGl2IiwiaWQiLCJhdHRyXyIsInNlcmllc05hbWUiLCJwcm9jZXNzIiwiZW52IiwiTk9ERV9FTlYiLCJPUFRJT05TX1JFRkVSRU5DRSIsImdldEZvclNlcmllcyIsIm9wdF9zZXJpZXNOYW1lIiwiZ2V0TnVtZXJpY09wdGlvbiIsImdldFN0cmluZ09wdGlvbiIsImdldEJvb2xlYW5PcHRpb24iLCJnZXRGdW5jdGlvbk9wdGlvbiIsImdldE9wdGlvbkZvckF4aXMiLCJnZXRGb3JBeGlzIiwib3B0aW9uc1ZpZXdGb3JBeGlzXyIsInNlbGYiLCJvcHQiLCJheGlzX29wdHMiLCJheGVzIiwieEF4aXNSYW5nZSIsInhBeGlzRXh0cmVtZXMiLCJwYWQiLCJwbG90dGVyXyIsImFyZWEiLCJ3IiwibnVtUm93cyIsImxlZnQiLCJyYXdEYXRhXyIsInJpZ2h0IiwicmFuZ2UiLCJ5QXhpc0V4dHJlbWVzIiwicGFja2VkIiwiZ2F0aGVyRGF0YXNldHNfIiwicm9sbGVkU2VyaWVzXyIsImV4dHJlbWVzIiwic2F2ZUF4ZXMiLCJjb21wdXRlWUF4aXNSYW5nZXNfIiwibmV3QXhlcyIsImV4dHJlbWVSYW5nZSIsInlBeGlzUmFuZ2UiLCJpZHgiLCJjb21wdXRlZFZhbHVlUmFuZ2UiLCJ5QXhpc1JhbmdlcyIsInJldCIsInRvRG9tQ29vcmRzIiwieCIsInkiLCJ0b0RvbVhDb29yZCIsInRvRG9tWUNvb3JkIiwieFJhbmdlIiwicGN0IiwidG9QZXJjZW50WUNvb3JkIiwiaCIsInRvRGF0YUNvb3JkcyIsInRvRGF0YVhDb29yZCIsInRvRGF0YVlDb29yZCIsImxvZ1JhbmdlRnJhY3Rpb24iLCJ5UmFuZ2UiLCJsb2dzY2FsZSIsImxvZ3IwIiwibG9nMTAiLCJsb2dyMSIsInRvUGVyY2VudFhDb29yZCIsIm51bUNvbHVtbnMiLCJnZXRWYWx1ZSIsInJvdyIsImNvbCIsImVuY2xvc2luZyIsImdyYXBoRGl2IiwiY3JlYXRlRWxlbWVudCIsInRleHRBbGlnbiIsInBvc2l0aW9uIiwiYXBwZW5kQ2hpbGQiLCJjYW52YXNfIiwiY3JlYXRlQ2FudmFzIiwidG9wIiwiaGlkZGVuXyIsImNyZWF0ZVBsb3RLaXRDYW52YXNfIiwiY2FudmFzX2N0eF8iLCJnZXRDb250ZXh0IiwiaGlkZGVuX2N0eF8iLCJyZXNpemVFbGVtZW50c18iLCJtb3VzZUV2ZW50RWxlbWVudF8iLCJjcmVhdGVNb3VzZUV2ZW50RWxlbWVudF8iLCJsYXlvdXRfIiwiRHlncmFwaExheW91dCIsIm1vdXNlTW92ZUhhbmRsZXJfIiwibW91c2VNb3ZlXyIsIm1vdXNlT3V0SGFuZGxlcl8iLCJ0YXJnZXQiLCJmcm9tRWxlbWVudCIsInJlbGF0ZWRUYXJnZXQiLCJ0b0VsZW1lbnQiLCJpc05vZGVDb250YWluZWRCeSIsIm1vdXNlT3V0XyIsImFkZEFuZFRyYWNrRXZlbnQiLCJyZXNpemVIYW5kbGVyXyIsInJlc2l6ZSIsInJlc2l6ZU9ic2VydmVyXyIsInJlc2l6ZU1vZGUiLCJSZXNpemVPYnNlcnZlciIsIm1haW5kaXZPdmVyZmxvdyIsIm92ZXJmbG93Iiwib2JzZXJ2ZSIsInBpeGVsUmF0aW9PcHRpb24iLCJjYW52YXNTY2FsZSIsImdldENvbnRleHRQaXhlbFJhdGlvIiwic2NhbGUiLCJoaWRkZW5TY2FsZSIsImRlc3Ryb3kiLCJyZXN0b3JlIiwicG9wIiwicmVtb3ZlUmVjdXJzaXZlIiwibm9kZSIsImhhc0NoaWxkTm9kZXMiLCJmaXJzdENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJyZW1vdmVUcmFja2VkRXZlbnRzXyIsInJlbW92ZUV2ZW50IiwiZGlzY29ubmVjdCIsIm51bGxPdXQiLCJvYmoiLCJjYW52YXMiLCJzZXRDb2xvcnNfIiwibGFiZWxzIiwiZ2V0TGFiZWxzIiwibnVtIiwiY29sb3JzXyIsImNvbG9yc01hcF8iLCJzYXQiLCJ2YWwiLCJoYWxmIiwiTWF0aCIsImNlaWwiLCJjb2xvcnMiLCJ2aXNpYmlsaXR5IiwibGFiZWwiLCJjb2xvclN0ciIsImh1ZSIsImhzdlRvUkdCIiwiZ2V0Q29sb3JzIiwiZ2V0UHJvcGVydGllc0ZvclNlcmllcyIsInNlcmllc19uYW1lIiwiY29sdW1uIiwidmlzaWJsZSIsImNvbG9yIiwiYXhpc0ZvclNlcmllcyIsImNyZWF0ZVJvbGxJbnRlcmZhY2VfIiwicm9sbGVyIiwicm9sbGVyXyIsImRpc3BsYXkiLCJjbGFzc05hbWUiLCJnZXRBcmVhIiwidGV4dEF0dHIiLCJzaXplIiwidGhhdCIsIm9uY2hhbmdlIiwiYWRqdXN0Um9sbCIsImNvbnRleHQiLCJpc1pvb21pbmciLCJpc1Bhbm5pbmciLCJpczJEUGFuIiwiZHJhZ1N0YXJ0WCIsImRyYWdTdGFydFkiLCJkcmFnRW5kWCIsImRyYWdFbmRZIiwiZHJhZ0RpcmVjdGlvbiIsInByZXZFbmRYIiwicHJldkVuZFkiLCJwcmV2RHJhZ0RpcmVjdGlvbiIsImNhbmNlbE5leHREYmxjbGljayIsImluaXRpYWxMZWZ0bW9zdERhdGUiLCJ4VW5pdHNQZXJQaXhlbCIsImRhdGVSYW5nZSIsInB4IiwicHkiLCJib3VuZGVkRGF0ZXMiLCJib3VuZGVkVmFsdWVzIiwidGFycCIsIklGcmFtZVRhcnAiLCJpbml0aWFsaXplTW91c2VEb3duIiwiZXZlbnQiLCJnIiwiY29udGV4dEIiLCJyZXR1cm5WYWx1ZSIsImNhbmNlbEJ1YmJsZSIsImNhbnZhc1BvcyIsImZpbmRQb3MiLCJkcmFnR2V0WF8iLCJkcmFnR2V0WV8iLCJjb3ZlciIsImRyYWdnaW5nRGF0ZSIsImRyYWdnaW5nVmFsdWUiLCJkcmFnVmFsdWVSYW5nZSIsInVuY292ZXIiLCJpbnRlcmFjdGlvbk1vZGVsIiwiYmluZEhhbmRsZXIiLCJoYW5kbGVyIiwid2lsbERlc3Ryb3lDb250ZXh0TXlzZWxmIiwibW91c2VVcEhhbmRsZXIiLCJkcmF3Wm9vbVJlY3RfIiwiZGlyZWN0aW9uIiwic3RhcnRYIiwiZW5kWCIsInN0YXJ0WSIsImVuZFkiLCJwcmV2RGlyZWN0aW9uIiwiY3R4IiwiSE9SSVpPTlRBTCIsImNsZWFyUmVjdCIsIm1pbiIsImdldFBsb3RBcmVhIiwiYWJzIiwiVkVSVElDQUwiLCJmaWxsU3R5bGUiLCJmaWxsUmVjdCIsImNsZWFyWm9vbVJlY3RfIiwiY3VycmVudFpvb21SZWN0QXJnc18iLCJkb1pvb21YXyIsImxvd1giLCJoaWdoWCIsIm1pbkRhdGUiLCJtYXhEYXRlIiwiZG9ab29tWERhdGVzXyIsIm9sZF93aW5kb3ciLCJuZXdfd2luZG93Iiwiem9vbUNhbGxiYWNrIiwiZG9BbmltYXRlZFpvb20iLCJhbmltYXRlZFpvb21DYWxsYmFjayIsImRvWm9vbVlfIiwibG93WSIsImhpZ2hZIiwib2xkVmFsdWVSYW5nZXMiLCJuZXdWYWx1ZVJhbmdlcyIsImhpIiwibG93IiwiX3RoYXQkeEF4aXNSYW5nZSIsIl90aGF0JHhBeGlzUmFuZ2UyIiwibWluWCIsIm1heFgiLCJ6b29tQW5pbWF0aW9uRnVuY3Rpb24iLCJmcmFtZSIsIm51bUZyYW1lcyIsImsiLCJwb3ciLCJyZXNldFpvb20iLCJkaXJ0eVgiLCJkaXJ0eVkiLCJkaXJ0eSIsImNsZWFyU2VsZWN0aW9uIiwiX3RoaXMkeEF4aXNFeHRyZW1lcyIsIl90aGlzJHhBeGlzRXh0cmVtZXMyIiwiYW5pbWF0ZWRab29tcyIsImZvckVhY2giLCJkcmF3R3JhcGhfIiwib2xkV2luZG93IiwibmV3V2luZG93Iiwib2xkWFJhbmdlIiwibmV3WFJhbmdlIiwib2xkWVJhbmdlcyIsIm5ld1lSYW5nZXMiLCJzdGVwcyIsIndpbmRvd3MiLCJ2YWx1ZVJhbmdlcyIsInN0ZXAiLCJmcmFjIiwidGhpc1JhbmdlIiwiaiIsInJlcGVhdEFuZENsZWFudXAiLCJldmVudFRvRG9tQ29vcmRzIiwib2Zmc2V0WCIsIm9mZnNldFkiLCJldmVudEVsZW1lbnRQb3MiLCJjYW52YXN4IiwicGFnZVgiLCJjYW52YXN5IiwicGFnZVkiLCJmaW5kQ2xvc2VzdFJvdyIsImRvbVgiLCJtaW5EaXN0WCIsIkluZmluaXR5IiwiY2xvc2VzdFJvdyIsInNldHMiLCJwb2ludHMiLCJsZW4iLCJwb2ludCIsImlzVmFsaWRQb2ludCIsImRpc3QiLCJmaW5kQ2xvc2VzdFBvaW50IiwiZG9tWSIsIm1pbkRpc3QiLCJkeCIsImR5IiwiY2xvc2VzdFBvaW50IiwiY2xvc2VzdFNlcmllcyIsInNldElkeCIsInNldE5hbWVzIiwiZmluZFN0YWNrZWRQb2ludCIsImJvdW5kYXJ5IiwiZ2V0TGVmdEJvdW5kYXJ5XyIsInJvd0lkeCIsInAxIiwicDIiLCJwMCIsImNhbnZhc0Nvb3JkcyIsImhpZ2hsaWdodFNlcmllc09wdHMiLCJzZWxlY3Rpb25DaGFuZ2VkIiwiaXNTZXJpZXNMb2NrZWQiLCJjbG9zZXN0Iiwic2V0U2VsZWN0aW9uIiwibGFzdHhfIiwic2VsUG9pbnRzXyIsImxhc3RSb3dfIiwiaGlnaGxpZ2h0U2V0XyIsImFuaW1hdGVTZWxlY3Rpb25fIiwidG90YWxTdGVwcyIsIm1pbGxpcyIsImZhZGVMZXZlbCIsImFuaW1hdGVJZCIsInN0YXJ0IiwidXBkYXRlU2VsZWN0aW9uXyIsInRoaXNJZCIsIm9wdF9hbmltRnJhY3Rpb24iLCJzZWxlY3RlZFJvdyIsInNlbGVjdGVkWCIsInNlbGVjdGVkUG9pbnRzIiwiYWxwaGEiLCJiYWNrZ3JvdW5kQ29sb3IiLCJ0b1JHQl8iLCJhbmltYXRlQmFja2dyb3VuZEZhZGUiLCJiIiwiX3JlbmRlckxpbmVDaGFydCIsIm1heENpcmNsZVNpemUiLCJzYXZlIiwicHQiLCJpc05hTiIsImNpcmNsZVNpemUiLCJDaXJjbGVzIiwiREVGQVVMVCIsImxpbmVXaWR0aCIsInN0cm9rZVN0eWxlIiwib3B0X2xvY2tlZCIsIm9wdF90cmlnZ2VyX2hpZ2hsaWdodF9jYWxsYmFjayIsImNoYW5nZWQiLCJzZXRSb3ciLCJ5dmFsIiwicG9pbnRJZHgiLCJ4dmFsIiwibG9ja2VkU2V0XyIsImdldFNlbGVjdGlvbiIsImdldEhpZ2hsaWdodFNlcmllcyIsImxvYWRlZEV2ZW50XyIsInBhcnNlQ1NWXyIsImNhc2NhZGVEYXRhRGlkVXBkYXRlRXZlbnRfIiwicHJlZHJhd18iLCJhZGRYVGlja3NfIiwieEF4aXNPcHRpb25zVmlldyIsInhUaWNrcyIsInNldFhUaWNrcyIsImdldEhhbmRsZXJDbGFzc18iLCJoYW5kbGVyQ2xhc3MiLCJGcmFjdGlvbnNCYXJzSGFuZGxlciIsIkRlZmF1bHRGcmFjdGlvbkhhbmRsZXIiLCJDdXN0b21CYXJzSGFuZGxlciIsIkVycm9yQmFyc0hhbmRsZXIiLCJEZWZhdWx0SGFuZGxlciIsIkRhdGUiLCJkYXRhSGFuZGxlcl8iLCJjb21wdXRlUGxvdEFyZWEiLCJjb21wdXRlWUF4ZXNfIiwic2VyaWVzIiwiZXh0cmFjdFNlcmllcyIsInJvbGxpbmdBdmVyYWdlIiwiZW5kIiwiZHJhd2luZ1RpbWVNc18iLCJQb2ludFR5cGUiLCJzdGFja1BvaW50c18iLCJjdW11bGF0aXZlWXZhbCIsInNlcmllc0V4dHJlbWVzIiwiZmlsbE1ldGhvZCIsImxhc3RYdmFsIiwicHJldlBvaW50IiwibmV4dFBvaW50IiwibmV4dFBvaW50SWR4IiwidXBkYXRlTmV4dFBvaW50IiwiYWN0dWFsWXZhbCIsInN0YWNrZWRZdmFsIiwieXZhbF9zdGFja2VkIiwicm9sbGVkU2VyaWVzIiwiYm91bmRhcnlJZHMiLCJzZXJpZXNJZHgiLCJzYW1wbGVJZHgiLCJmaXJzdElkeCIsImxhc3RJZHgiLCJheGlzSWR4IiwibnVtX3NlcmllcyIsImhpZ2giLCJjb3JyZWN0ZWRGaXJzdElkeCIsImlzSW52YWxpZFZhbHVlIiwiY29ycmVjdGVkTGFzdElkeCIsImdldEV4dHJlbWVZVmFsdWVzIiwic2VyaWVzUG9pbnRzIiwic2VyaWVzVG9Qb2ludHMiLCJpc19pbml0aWFsX2RyYXciLCJyZW1vdmVBbGxEYXRhc2V0cyIsInBvaW50U2l6ZSIsImRhdGFJZHgiLCJhZGREYXRhc2V0Iiwic2V0WUF4ZXMiLCJldmFsdWF0ZSIsInJlbmRlckdyYXBoXyIsImxvZyIsImNsZWFyIiwidW5kZXJsYXlDYWxsYmFjayIsImRyYXdpbmdDb250ZXh0IiwicmVuZGVyIiwiZHJhd0NhbGxiYWNrIiwicmVhZHlGaXJlZF8iLCJmbiIsImluZGV4IiwidiIsIm51bUF4ZXMiLCJheGlzT3B0aW9ucyIsInkyIiwiYXhpc1Byb3BlcnRpZXNGb3JTZXJpZXMiLCJpc051bGxVbmRlZmluZWRPck5hTiIsInBhcnNlRmxvYXQiLCJ5cGFkQ29tcGF0Iiwic3BhbiIsInlwYWQiLCJwX2F4aXMiLCJpbmNsdWRlWmVybyIsImluZGVwZW5kZW50VGlja3MiLCJzZXJpZXNGb3JBeGlzIiwieVJhbmdlUGFkIiwibWluWSIsIm1heFkiLCJleHRyZW1lTWluWSIsImV4dHJlbWVNYXhZIiwibWF4IiwibWF4QXhpc1kiLCJtaW5BeGlzWSIsInkwIiwieTEiLCJkZWx0YSIsInkwcGN0IiwieTFwY3QiLCJ0aWNrZXIiLCJ0aWNrcyIsInBfdGlja3MiLCJwX3NjYWxlIiwidGlja192YWx1ZXMiLCJ5X2ZyYWMiLCJ5X3ZhbCIsImRldGVjdFR5cGVGcm9tU3RyaW5nXyIsInN0ciIsImlzRGF0ZSIsImRhc2hQb3MiLCJzZXRYQXhpc09wdGlvbnNfIiwieFZhbHVlUGFyc2VyIiwiZGF0ZVBhcnNlciIsInZhbHVlRm9ybWF0dGVyIiwiZGF0ZVZhbHVlRm9ybWF0dGVyIiwiZGF0ZVRpY2tlciIsImF4aXNMYWJlbEZvcm1hdHRlciIsImRhdGVBeGlzTGFiZWxGb3JtYXR0ZXIiLCJudW1lcmljVGlja3MiLCJsaW5lX2RlbGltaXRlciIsImRldGVjdExpbmVEZWxpbWl0ZXIiLCJsaW5lcyIsInNwbGl0IiwidmFscyIsImRlbGltIiwicmVwYXJzZVNlcmllcyIsImxpbmVfbm8iLCJ4UGFyc2VyIiwiZGVmYXVsdFBhcnNlclNldCIsImV4cGVjdGVkQ29scyIsIm91dE9mT3JkZXIiLCJsaW5lIiwiaW5GaWVsZHMiLCJmaWVsZHMiLCJwYXJzZUZsb2F0XyIsIndhcm4iLCJhbGxfbnVsbCIsInNvcnQiLCJ2YWxpZGF0ZU5hdGl2ZUZvcm1hdCIsImZpcnN0Um93IiwiZmlyc3RYIiwiaXNEYXRlTGlrZSIsImlzQXJyYXlMaWtlIiwicGFyc2VBcnJheV8iLCJudW1fbGFiZWxzIiwicGFyc2VkRGF0YSIsImNsb25lIiwiZ2V0VGltZSIsIm51bWJlckF4aXNMYWJlbEZvcm1hdHRlciIsInBhcnNlRGF0YVRhYmxlXyIsInNob3J0VGV4dEZvckFubm90YXRpb25OdW0iLCJzaG9ydFRleHQiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJmbG9vciIsInRvTG93ZXJDYXNlIiwiY29scyIsImdldE51bWJlck9mQ29sdW1ucyIsInJvd3MiLCJnZXROdW1iZXJPZlJvd3MiLCJpbmRlcFR5cGUiLCJnZXRDb2x1bW5UeXBlIiwiY29sSWR4IiwiYW5ub3RhdGlvbkNvbHMiLCJoYXNBbm5vdGF0aW9ucyIsImdldENvbHVtbkxhYmVsIiwiYW5ub3RhdGlvbnMiLCJhbm4iLCJ0ZXh0IiwiaXNGaW5pdGUiLCJzZXRBbm5vdGF0aW9ucyIsImRhdGF0eXBlIiwidHlwZUFycmF5TGlrZSIsImdldENvbHVtblJhbmdlIiwicmVxIiwiWE1MSHR0cFJlcXVlc3QiLCJBY3RpdmVYT2JqZWN0IiwiY2FsbGVyIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsInJlc3BvbnNlVGV4dCIsIm9wZW4iLCJzZW5kIiwidXBkYXRlT3B0aW9ucyIsImlucHV0X2F0dHJzIiwiYmxvY2tfcmVkcmF3IiwicHJldk51bUF4ZXMiLCJyZXF1aXJlc05ld1BvaW50cyIsImlzUGl4ZWxDaGFuZ2luZ09wdGlvbkxpc3QiLCJteV9hdHRycyIsInJlc2l6ZV9sb2NrIiwib2xkX3dpZHRoIiwib2xkX2hlaWdodCIsInNldFZpc2liaWxpdHkiLCJudW1Jc09iamVjdCIsInN1cHByZXNzRHJhdyIsImluZGV4RnJvbVNldE5hbWUiLCJnZXRSb3dGb3JYIiwieFZhbCIsInJlYWR5IiwiZWxlbSIsImFkZEV2ZW50IiwicmVnIiwiTGVnZW5kUGx1Z2luIiwiQXhlc1BsdWdpbiIsIlJhbmdlU2VsZWN0b3JQbHVnaW4iLCJDaGFydExhYmVsc1BsdWdpbiIsIkFubm90YXRpb25zUGx1Z2luIiwiR3JpZFBsdWdpbiIsIkdWaXpDaGFydCIsIkRPVFRFRF9MSU5FIiwiREFTSEVEX0xJTkUiLCJET1RfREFTSF9MSU5FIiwiZGF0ZVN0cmluZ18iLCJkZWZhdWx0SW50ZXJhY3Rpb25Nb2RlbCIsIkR5Z3JhcGhJbnRlcmFjdGlvbiIsImRlZmF1bHRNb2RlbCIsIm5vbkludGVyYWN0aXZlTW9kZWwiLCJub25JbnRlcmFjdGl2ZU1vZGVsXyIsIlBsdWdpbnMiLCJMZWdlbmQiLCJBeGVzIiwiQW5ub3RhdGlvbnMiLCJDaGFydExhYmVscyIsIkdyaWQiLCJSYW5nZVNlbGVjdG9yIiwiRGF0YUhhbmRsZXJzIiwiQmFyc0hhbmRsZXIiLCJzdGFydFBhbiIsInN0YXJ0Wm9vbSIsIm1vdmVQYW4iLCJtb3ZlWm9vbSIsImVuZFBhbiIsImVuZFpvb20iLCJudW1lcmljTGluZWFyVGlja3MiLCJpbnRlZ2VyVGlja3MiLCJHcmFudWxhcml0eSIsInBpY2tEYXRlVGlja0dyYW51bGFyaXR5IiwiZ2V0RGF0ZUF4aXMiLCJmbG9hdEZvcm1hdCIsInNldHVwRE9NcmVhZHlfIiwiX2RlZmF1bHQiLCJtb2R1bGUiLCJkZWZhdWx0Il0sInNvdXJjZXMiOlsiLi4vc3JjL2R5Z3JhcGguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAwNiBEYW4gVmFuZGVya2FtIChkYW52ZGtAZ21haWwuY29tKVxuICogTUlULWxpY2VuY2VkOiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2UvTUlUXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENyZWF0ZXMgYW4gaW50ZXJhY3RpdmUsIHpvb21hYmxlIGdyYXBoIGJhc2VkIG9uIGEgQ1NWIGZpbGUgb3JcbiAqIHN0cmluZy4gRHlncmFwaCBjYW4gaGFuZGxlIG11bHRpcGxlIHNlcmllcyB3aXRoIG9yIHdpdGhvdXQgaGlnaC9sb3cgYmFuZHMuXG4gKiBUaGUgZGF0ZS92YWx1ZSByYW5nZXMgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IHNldC4gRHlncmFwaCB1c2VzIHRoZVxuICogJmx0O2NhbnZhcyZndDsgdGFnLCBzbyBpdCBvbmx5IHdvcmtzIGluIEZGMS41Ky5cbiAqIFNlZSB0aGUgc291cmNlIG9yIGh0dHBzOi8vZHlncmFwaHMuY29tLyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqIEBhdXRob3IgZGFudmRrQGdtYWlsLmNvbSAoRGFuIFZhbmRlcmthbSlcbiAqL1xuXG4vKlxuICBVc2FnZTpcbiAgIDxkaXYgaWQ9XCJncmFwaGRpdlwiIHN0eWxlPVwid2lkdGg6ODAwcHg7IGhlaWdodDo1MDBweDtcIj48L2Rpdj5cbiAgIDxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiPjwhLS0vLy0tPjwhW0NEQVRBWy8vPjwhLS1cbiAgICQoZnVuY3Rpb24gb25ET01yZWFkeSgpIHtcbiAgICAgbmV3IER5Z3JhcGgoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJncmFwaGRpdlwiKSxcbiAgICAgICAgICAgICAgICAgXCJkYXRhZmlsZS5jc3ZcIiwgIC8vIENTViBmaWxlIHdpdGggaGVhZGVyc1xuICAgICAgICAgICAgICAgICB7IH0pOyAvLyBvcHRpb25zXG4gICB9KTtcbiAgIC8vLS0+PCFdXT48L3NjcmlwdD5cblxuIFRoZSBDU1YgZmlsZSBpcyBvZiB0aGUgZm9ybVxuXG4gICBEYXRlLFNlcmllc0EsU2VyaWVzQixTZXJpZXNDXG4gICBZWVlZLU1NLURELEExLEIxLEMxXG4gICBZWVlZLU1NLURELEEyLEIyLEMyXG5cbiBJZiB0aGUgJ2Vycm9yQmFycycgb3B0aW9uIGlzIHNldCBpbiB0aGUgY29uc3RydWN0b3IsIHRoZSBpbnB1dCBzaG91bGQgYmUgb2ZcbiB0aGUgZm9ybVxuICAgRGF0ZSxTZXJpZXNBLFNlcmllc0IsLi4uXG4gICBZWVlZLU1NLURELEExLHNpZ21hQTEsQjEsc2lnbWFCMSwuLi5cbiAgIFlZWVktTU0tREQsQTIsc2lnbWFBMixCMixzaWdtYUIyLC4uLlxuXG4gSWYgdGhlICdmcmFjdGlvbnMnIG9wdGlvbiBpcyBzZXQsIHRoZSBpbnB1dCBzaG91bGQgYmUgb2YgdGhlIGZvcm06XG5cbiAgIERhdGUsU2VyaWVzQSxTZXJpZXNCLC4uLlxuICAgWVlZWS1NTS1ERCxBMS9CMSxBMi9CMiwuLi5cbiAgIFlZWVktTU0tREQsQTEvQjEsQTIvQjIsLi4uXG5cbiBBbmQgaGlnaC9sb3cgYmFuZHMgd2lsbCBiZSBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkgdXNpbmcgYSBiaW5vbWlhbCBkaXN0cmlidXRpb24uXG5cbiBGb3IgZnVydGhlciBkb2N1bWVudGF0aW9uIGFuZCBleGFtcGxlcywgc2VlIGh0dHBzOi8vZHlncmFwaHMuY29tL1xuICovXG5cbmltcG9ydCBEeWdyYXBoTGF5b3V0IGZyb20gJy4vZHlncmFwaC1sYXlvdXQnO1xuaW1wb3J0IER5Z3JhcGhDYW52YXNSZW5kZXJlciBmcm9tICcuL2R5Z3JhcGgtY2FudmFzJztcbmltcG9ydCBEeWdyYXBoT3B0aW9ucyBmcm9tICcuL2R5Z3JhcGgtb3B0aW9ucyc7XG5pbXBvcnQgRHlncmFwaEludGVyYWN0aW9uIGZyb20gJy4vZHlncmFwaC1pbnRlcmFjdGlvbi1tb2RlbCc7XG5pbXBvcnQgKiBhcyBEeWdyYXBoVGlja2VycyBmcm9tICcuL2R5Z3JhcGgtdGlja2Vycyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL2R5Z3JhcGgtdXRpbHMnO1xuaW1wb3J0IERFRkFVTFRfQVRUUlMgZnJvbSAnLi9keWdyYXBoLWRlZmF1bHQtYXR0cnMnO1xuaW1wb3J0IE9QVElPTlNfUkVGRVJFTkNFIGZyb20gJy4vZHlncmFwaC1vcHRpb25zLXJlZmVyZW5jZSc7XG5pbXBvcnQgSUZyYW1lVGFycCBmcm9tICcuL2lmcmFtZS10YXJwJztcblxuaW1wb3J0IERlZmF1bHRIYW5kbGVyIGZyb20gJy4vZGF0YWhhbmRsZXIvZGVmYXVsdCc7XG5pbXBvcnQgRXJyb3JCYXJzSGFuZGxlciBmcm9tICcuL2RhdGFoYW5kbGVyL2JhcnMtZXJyb3InO1xuaW1wb3J0IEN1c3RvbUJhcnNIYW5kbGVyIGZyb20gJy4vZGF0YWhhbmRsZXIvYmFycy1jdXN0b20nO1xuaW1wb3J0IERlZmF1bHRGcmFjdGlvbkhhbmRsZXIgZnJvbSAnLi9kYXRhaGFuZGxlci9kZWZhdWx0LWZyYWN0aW9ucyc7XG5pbXBvcnQgRnJhY3Rpb25zQmFyc0hhbmRsZXIgZnJvbSAnLi9kYXRhaGFuZGxlci9iYXJzLWZyYWN0aW9ucyc7XG5pbXBvcnQgQmFyc0hhbmRsZXIgZnJvbSAnLi9kYXRhaGFuZGxlci9iYXJzJztcblxuaW1wb3J0IEFubm90YXRpb25zUGx1Z2luIGZyb20gJy4vcGx1Z2lucy9hbm5vdGF0aW9ucyc7XG5pbXBvcnQgQXhlc1BsdWdpbiBmcm9tICcuL3BsdWdpbnMvYXhlcyc7XG5pbXBvcnQgQ2hhcnRMYWJlbHNQbHVnaW4gZnJvbSAnLi9wbHVnaW5zL2NoYXJ0LWxhYmVscyc7XG5pbXBvcnQgR3JpZFBsdWdpbiBmcm9tICcuL3BsdWdpbnMvZ3JpZCc7XG5pbXBvcnQgTGVnZW5kUGx1Z2luIGZyb20gJy4vcGx1Z2lucy9sZWdlbmQnO1xuaW1wb3J0IFJhbmdlU2VsZWN0b3JQbHVnaW4gZnJvbSAnLi9wbHVnaW5zL3JhbmdlLXNlbGVjdG9yJztcblxuaW1wb3J0IEdWaXpDaGFydCBmcm9tICcuL2R5Z3JhcGgtZ3Zpeic7XG5cbi8qKlxuICogQGNsYXNzIENyZWF0ZXMgYW4gaW50ZXJhY3RpdmUsIHpvb21hYmxlIGNoYXJ0LlxuICogQG5hbWUgRHlncmFwaFxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtkaXYgfCBTdHJpbmd9IGRpdiBBIGRpdiBvciB0aGUgaWQgb2YgYSBkaXYgaW50byB3aGljaCB0byBjb25zdHJ1Y3RcbiAqIHRoZSBjaGFydC4gTXVzdCBub3QgaGF2ZSBhbnkgcGFkZGluZy5cbiAqIEBwYXJhbSB7U3RyaW5nIHwgRnVuY3Rpb259IGZpbGUgQSBmaWxlIGNvbnRhaW5pbmcgQ1NWIGRhdGEgb3IgYSBmdW5jdGlvblxuICogdGhhdCByZXR1cm5zIHRoaXMgZGF0YS4gVGhlIG1vc3QgYmFzaWMgZXhwZWN0ZWQgZm9ybWF0IGZvciBlYWNoIGxpbmUgaXM6XG4gKiBcIllZWVkvTU0vREQsdmFsMSx2YWwyLC4uLlwiXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlOiBodHRwczovL2R5Z3JhcGhzLmNvbS9kYXRhLmh0bWxcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cnMgVmFyaW91cyBvdGhlciBhdHRyaWJ1dGVzLCBlLmcuIGVycm9yQmFycyBkZXRlcm1pbmVzXG4gKiB3aGV0aGVyIHRoZSBpbnB1dCBkYXRhIGNvbnRhaW5zIGVycm9yIHJhbmdlcy4gRm9yIGEgY29tcGxldGUgbGlzdCBvZlxuICogb3B0aW9ucywgc2VlOiBodHRwczovL2R5Z3JhcGhzLmNvbS9vcHRpb25zLmh0bWxcbiAqL1xudmFyIER5Z3JhcGggPSBmdW5jdGlvbiBEeWdyYXBoKGRpdiwgZGF0YSwgb3B0cykge1xuICB0aGlzLl9faW5pdF9fKGRpdiwgZGF0YSwgb3B0cyk7XG59O1xuXG5EeWdyYXBoLk5BTUUgPSBcIkR5Z3JhcGhcIjtcbkR5Z3JhcGguVkVSU0lPTiA9IFwiMi4yLjJcIjtcblxuLy8gaW50ZXJuYWwgYXV0b2xvYWRlciB3b3JrYXJvdW5kXG52YXIgX2FkZHJlcXVpcmUgPSB7fTtcbkR5Z3JhcGguX3JlcXVpcmUgPSBmdW5jdGlvbiByZXF1aXJlKHdoYXQpIHtcbiAgcmV0dXJuICh3aGF0IGluIF9hZGRyZXF1aXJlID8gX2FkZHJlcXVpcmVbd2hhdF0gOiBEeWdyYXBoLl9yZXF1aXJlLl9iKHdoYXQpKTtcbn07XG5EeWdyYXBoLl9yZXF1aXJlLl9iID0gbnVsbDsgLy8gc2V0IGJ5IHhmcm1tb2RtYXAtZHkuanNcbkR5Z3JhcGguX3JlcXVpcmUuYWRkID0gZnVuY3Rpb24gYWRkKHdoYXQsIHRvd2hhdCkge1xuICBfYWRkcmVxdWlyZVt3aGF0XSA9IHRvd2hhdDtcbn07XG5cbi8vIFZhcmlvdXMgZGVmYXVsdCB2YWx1ZXNcbkR5Z3JhcGguREVGQVVMVF9ST0xMX1BFUklPRCA9IDE7XG5EeWdyYXBoLkRFRkFVTFRfV0lEVEggPSA0ODA7XG5EeWdyYXBoLkRFRkFVTFRfSEVJR0hUID0gMzIwO1xuXG4vLyBGb3IgbWF4IDYwIEh6LiBhbmltYXRpb246XG5EeWdyYXBoLkFOSU1BVElPTl9TVEVQUyA9IDEyO1xuRHlncmFwaC5BTklNQVRJT05fRFVSQVRJT04gPSAyMDA7XG5cbi8qKlxuICogU3RhbmRhcmQgcGxvdHRlcnMuIFRoZXNlIG1heSBiZSB1c2VkIGJ5IGNsaWVudHMuXG4gKiBBdmFpbGFibGUgcGxvdHRlcnMgYXJlOlxuICogLSBEeWdyYXBoLlBsb3R0ZXJzLmxpbmVQbG90dGVyOiBkcmF3cyBjZW50cmFsIGxpbmVzIChtb3N0IGNvbW1vbilcbiAqIC0gRHlncmFwaC5QbG90dGVycy5lcnJvclBsb3R0ZXI6IGRyYXdzIGhpZ2gvbG93IGJhbmRzXG4gKiAtIER5Z3JhcGguUGxvdHRlcnMuZmlsbFBsb3R0ZXI6IGRyYXdzIGZpbGxzIHVuZGVyIGxpbmVzICh1c2VkIHdpdGggZmlsbEdyYXBoKVxuICpcbiAqIEJ5IGRlZmF1bHQsIHRoZSBwbG90dGVyIGlzIFtmaWxsUGxvdHRlciwgZXJyb3JQbG90dGVyLCBsaW5lUGxvdHRlcl0uXG4gKiBUaGlzIGNhdXNlcyBhbGwgdGhlIGxpbmVzIHRvIGJlIGRyYXduIG92ZXIgYWxsIHRoZSBmaWxscy9iYW5kcy5cbiAqL1xuRHlncmFwaC5QbG90dGVycyA9IER5Z3JhcGhDYW52YXNSZW5kZXJlci5fUGxvdHRlcnM7XG5cbi8vIFVzZWQgZm9yIGluaXRpYWxpemluZyBhbm5vdGF0aW9uIENTUyBydWxlcyBvbmx5IG9uY2UuXG5EeWdyYXBoLmFkZGVkQW5ub3RhdGlvbkNTUyA9IGZhbHNlO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoZSBEeWdyYXBoLiBUaGlzIGNyZWF0ZXMgYSBuZXcgRElWIGFuZCBjb25zdHJ1Y3RzIHRoZSBQbG90S2l0XG4gKiBhbmQgY29udGV4dCAmbHQ7Y2FudmFzJmd0OyBpbnNpZGUgb2YgaXQuIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIGRldGFpbHMuXG4gKiBvbiB0aGUgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7RWxlbWVudH0gZGl2IHRoZSBFbGVtZW50IHRvIHJlbmRlciB0aGUgZ3JhcGggaW50by5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgRnVuY3Rpb259IGZpbGUgU291cmNlIGRhdGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRycyBNaXNjZWxsYW5lb3VzIG90aGVyIG9wdGlvbnNcbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLl9faW5pdF9fID0gZnVuY3Rpb24oZGl2LCBmaWxlLCBhdHRycykge1xuICB0aGlzLmlzX2luaXRpYWxfZHJhd18gPSB0cnVlO1xuICB0aGlzLnJlYWR5Rm5zXyA9IFtdO1xuXG4gIC8vIFN1cHBvcnQgdHdvLWFyZ3VtZW50IGNvbnN0cnVjdG9yXG4gIGlmIChhdHRycyA9PT0gbnVsbCB8fCBhdHRycyA9PT0gdW5kZWZpbmVkKSB7IGF0dHJzID0ge307IH1cblxuICBhdHRycyA9IER5Z3JhcGguY29weVVzZXJBdHRyc18oYXR0cnMpO1xuXG4gIGlmICh0eXBlb2YoZGl2KSA9PSAnc3RyaW5nJykge1xuICAgIGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdik7XG4gIH1cblxuICBpZiAoIWRpdikge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29uc3RydWN0aW5nIGR5Z3JhcGggd2l0aCBhIG5vbi1leGlzdGVudCBkaXYhJyk7XG4gIH1cblxuICAvLyBDb3B5IHRoZSBpbXBvcnRhbnQgYml0cyBpbnRvIHRoZSBvYmplY3RcbiAgLy8gVE9ETyhkYW52ayk6IG1vc3Qgb2YgdGhlc2Ugc2hvdWxkIGp1c3Qgc3RheSBpbiB0aGUgYXR0cnNfIGRpY3Rpb25hcnkuXG4gIHRoaXMubWFpbmRpdl8gPSBkaXY7XG4gIHRoaXMuZmlsZV8gPSBmaWxlO1xuICB0aGlzLnJvbGxQZXJpb2RfID0gYXR0cnMucm9sbFBlcmlvZCB8fCBEeWdyYXBoLkRFRkFVTFRfUk9MTF9QRVJJT0Q7XG4gIHRoaXMucHJldmlvdXNWZXJ0aWNhbFhfID0gLTE7XG4gIHRoaXMuZnJhY3Rpb25zXyA9IGF0dHJzLmZyYWN0aW9ucyB8fCBmYWxzZTtcbiAgdGhpcy5kYXRlV2luZG93XyA9IGF0dHJzLmRhdGVXaW5kb3cgfHwgbnVsbDtcblxuICB0aGlzLmFubm90YXRpb25zXyA9IFtdO1xuXG4gIC8vIENsZWFyIHRoZSBkaXYuIFRoaXMgZW5zdXJlIHRoYXQsIGlmIG11bHRpcGxlIGR5Z3JhcGhzIGFyZSBwYXNzZWQgdGhlIHNhbWVcbiAgLy8gZGl2LCB0aGVuIG9ubHkgb25lIHdpbGwgYmUgZHJhd24uXG4gIGRpdi5pbm5lckhUTUwgPSBcIlwiO1xuXG4gIGNvbnN0IHJlc29sdmVkID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZGl2LCBudWxsKTtcbiAgaWYgKHJlc29sdmVkLnBhZGRpbmdMZWZ0ICE9PSBcIjBweFwiIHx8XG4gICAgICByZXNvbHZlZC5wYWRkaW5nUmlnaHQgIT09IFwiMHB4XCIgfHxcbiAgICAgIHJlc29sdmVkLnBhZGRpbmdUb3AgIT09IFwiMHB4XCIgfHxcbiAgICAgIHJlc29sdmVkLnBhZGRpbmdCb3R0b20gIT09IFwiMHB4XCIpXG4gICAgY29uc29sZS5lcnJvcignTWFpbiBkaXYgY29udGFpbnMgcGFkZGluZzsgZ3JhcGggd2lsbCBtaXNiZWhhdmUnKTtcblxuICAvLyBGb3IgaGlzdG9yaWNhbCByZWFzb25zLCB0aGUgJ3dpZHRoJyBhbmQgJ2hlaWdodCcgb3B0aW9ucyB0cnVtcCBhbGwgQ1NTXG4gIC8vIHJ1bGVzIF9leGNlcHRfIGZvciBhbiBleHBsaWNpdCAnd2lkdGgnIG9yICdoZWlnaHQnIG9uIHRoZSBkaXYuXG4gIC8vIEFzIGFuIGFkZGVkIGNvbnZlbmllbmNlLCBpZiB0aGUgZGl2IGhhcyB6ZXJvIGhlaWdodCAobGlrZSA8ZGl2PjwvZGl2PiBkb2VzXG4gIC8vIHdpdGhvdXQgYW55IHN0eWxlcyksIHRoZW4gd2UgdXNlIGEgZGVmYXVsdCBoZWlnaHQvd2lkdGguXG4gIGlmIChkaXYuc3R5bGUud2lkdGggPT09ICcnICYmIGF0dHJzLndpZHRoKSB7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gYXR0cnMud2lkdGggKyBcInB4XCI7XG4gIH1cbiAgaWYgKGRpdi5zdHlsZS5oZWlnaHQgPT09ICcnICYmIGF0dHJzLmhlaWdodCkge1xuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSBhdHRycy5oZWlnaHQgKyBcInB4XCI7XG4gIH1cbiAgaWYgKGRpdi5zdHlsZS5oZWlnaHQgPT09ICcnICYmIGRpdi5jbGllbnRIZWlnaHQgPT09IDApIHtcbiAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gRHlncmFwaC5ERUZBVUxUX0hFSUdIVCArIFwicHhcIjtcbiAgICBpZiAoZGl2LnN0eWxlLndpZHRoID09PSAnJykge1xuICAgICAgZGl2LnN0eWxlLndpZHRoID0gRHlncmFwaC5ERUZBVUxUX1dJRFRIICsgXCJweFwiO1xuICAgIH1cbiAgfVxuICAvLyBUaGVzZSB3aWxsIGJlIHplcm8gaWYgdGhlIGR5Z3JhcGgncyBkaXYgaXMgaGlkZGVuLiBJbiB0aGF0IGNhc2UsXG4gIC8vIHVzZSB0aGUgdXNlci1zcGVjaWZpZWQgYXR0cmlidXRlcyBpZiBwcmVzZW50LiBJZiBub3QsIHVzZSB6ZXJvXG4gIC8vIGFuZCBhc3N1bWUgdGhlIHVzZXIgd2lsbCBjYWxsIHJlc2l6ZSB0byBmaXggdGhpbmdzIGxhdGVyLlxuICB0aGlzLndpZHRoXyA9IGRpdi5jbGllbnRXaWR0aCB8fCBhdHRycy53aWR0aCB8fCAwO1xuICB0aGlzLmhlaWdodF8gPSBkaXYuY2xpZW50SGVpZ2h0IHx8IGF0dHJzLmhlaWdodCB8fCAwO1xuXG4gIC8vIFRPRE8oZGFudmspOiBzZXQgZmlsbEdyYXBoIHRvIGJlIHBhcnQgb2YgYXR0cnNfIGhlcmUsIG5vdCB1c2VyX2F0dHJzXy5cbiAgaWYgKGF0dHJzLnN0YWNrZWRHcmFwaCkge1xuICAgIGF0dHJzLmZpbGxHcmFwaCA9IHRydWU7XG4gICAgLy8gVE9ETyhuaWtoaWxrKTogQWRkIGFueSBvdGhlciBzdGFja2VkR3JhcGggY2hlY2tzIGhlcmUuXG4gIH1cblxuICAvLyBERVBSRUNBVElPTiBXQVJOSU5HOiBBbGwgb3B0aW9uIHByb2Nlc3Npbmcgc2hvdWxkIGJlIG1vdmVkIGZyb21cbiAgLy8gYXR0cnNfIGFuZCB1c2VyX2F0dHJzXyB0byBvcHRpb25zXywgd2hpY2ggaG9sZHMgYWxsIHRoaXMgaW5mb3JtYXRpb24uXG4gIC8vXG4gIC8vIER5Z3JhcGhzIGhhcyBtYW55IG9wdGlvbnMsIHNvbWUgb2Ygd2hpY2ggaW50ZXJhY3Qgd2l0aCBvbmUgYW5vdGhlci5cbiAgLy8gVG8ga2VlcCB0cmFjayBvZiBldmVyeXRoaW5nLCB3ZSBtYWludGFpbiB0d28gc2V0cyBvZiBvcHRpb25zOlxuICAvL1xuICAvLyAgdGhpcy51c2VyX2F0dHJzXyAgIG9ubHkgb3B0aW9ucyBleHBsaWNpdGx5IHNldCBieSB0aGUgdXNlci5cbiAgLy8gIHRoaXMuYXR0cnNfICAgICAgICBkZWZhdWx0cywgb3B0aW9ucyBkZXJpdmVkIGZyb20gdXNlcl9hdHRyc18sIGRhdGEuXG4gIC8vXG4gIC8vIE9wdGlvbnMgYXJlIHRoZW4gYWNjZXNzZWQgdGhpcy5hdHRyXygnYXR0cicpLCB3aGljaCBmaXJzdCBsb29rcyBhdFxuICAvLyB1c2VyX2F0dHJzXyBhbmQgdGhlbiBjb21wdXRlZCBhdHRyc18uIFRoaXMgd2F5IER5Z3JhcGhzIGNhbiBzZXQgaW50ZWxsaWdlbnRcbiAgLy8gZGVmYXVsdHMgd2l0aG91dCBvdmVycmlkaW5nIGJlaGF2aW9yIHRoYXQgdGhlIHVzZXIgc3BlY2lmaWNhbGx5IGFza3MgZm9yLlxuICB0aGlzLnVzZXJfYXR0cnNfID0ge307XG4gIHV0aWxzLnVwZGF0ZSh0aGlzLnVzZXJfYXR0cnNfLCBhdHRycyk7XG5cbiAgLy8gVGhpcyBzZXF1ZW5jZSBlbnN1cmVzIHRoYXQgRHlncmFwaC5ERUZBVUxUX0FUVFJTIGlzIG5ldmVyIG1vZGlmaWVkLlxuICB0aGlzLmF0dHJzXyA9IHt9O1xuICB1dGlscy51cGRhdGVEZWVwKHRoaXMuYXR0cnNfLCBERUZBVUxUX0FUVFJTKTtcblxuICB0aGlzLmJvdW5kYXJ5SWRzXyA9IFtdO1xuICB0aGlzLnNldEluZGV4QnlOYW1lXyA9IHt9O1xuICB0aGlzLmRhdGFzZXRJbmRleF8gPSBbXTtcblxuICB0aGlzLnJlZ2lzdGVyZWRFdmVudHNfID0gW107XG4gIHRoaXMuZXZlbnRMaXN0ZW5lcnNfID0ge307XG5cbiAgdGhpcy5hdHRyaWJ1dGVzXyA9IG5ldyBEeWdyYXBoT3B0aW9ucyh0aGlzKTtcblxuICAvLyBDcmVhdGUgdGhlIGNvbnRhaW5pbmcgRElWIGFuZCBvdGhlciBpbnRlcmFjdGl2ZSBlbGVtZW50c1xuICB0aGlzLmNyZWF0ZUludGVyZmFjZV8oKTtcblxuICAvLyBBY3RpdmF0ZSBwbHVnaW5zLlxuICB0aGlzLnBsdWdpbnNfID0gW107XG4gIHZhciBwbHVnaW5zID0gRHlncmFwaC5QTFVHSU5TLmNvbmNhdCh0aGlzLmdldE9wdGlvbigncGx1Z2lucycpKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gdGhlIHBsdWdpbnMgb3B0aW9uIG1heSBjb250YWluIGVpdGhlciBwbHVnaW4gY2xhc3NlcyBvciBpbnN0YW5jZXMuXG4gICAgLy8gUGx1Z2luIGluc3RhbmNlcyBjb250YWluIGFuIGFjdGl2YXRlIG1ldGhvZC5cbiAgICB2YXIgUGx1Z2luID0gcGx1Z2luc1tpXTsgIC8vIGVpdGhlciBhIGNvbnN0cnVjdG9yIG9yIGFuIGluc3RhbmNlLlxuICAgIHZhciBwbHVnaW5JbnN0YW5jZTtcbiAgICBpZiAodHlwZW9mKFBsdWdpbi5hY3RpdmF0ZSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwbHVnaW5JbnN0YW5jZSA9IFBsdWdpbjtcbiAgICB9IGVsc2Uge1xuICAgICAgcGx1Z2luSW5zdGFuY2UgPSBuZXcgUGx1Z2luKCk7XG4gICAgfVxuXG4gICAgdmFyIHBsdWdpbkRpY3QgPSB7XG4gICAgICBwbHVnaW46IHBsdWdpbkluc3RhbmNlLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIG9wdGlvbnM6IHt9LFxuICAgICAgcGx1Z2luT3B0aW9uczoge31cbiAgICB9O1xuXG4gICAgdmFyIGhhbmRsZXJzID0gcGx1Z2luSW5zdGFuY2UuYWN0aXZhdGUodGhpcyk7XG4gICAgZm9yICh2YXIgZXZlbnROYW1lIGluIGhhbmRsZXJzKSB7XG4gICAgICBpZiAoIWhhbmRsZXJzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIGNvbnRpbnVlO1xuICAgICAgLy8gVE9ETyhkYW52ayk6IHZhbGlkYXRlIGV2ZW50TmFtZS5cbiAgICAgIHBsdWdpbkRpY3QuZXZlbnRzW2V2ZW50TmFtZV0gPSBoYW5kbGVyc1tldmVudE5hbWVdO1xuICAgIH1cblxuICAgIHRoaXMucGx1Z2luc18ucHVzaChwbHVnaW5EaWN0KTtcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIHBsdWdpbnMgY2FuIG5vIGxvbmdlciByZWdpc3RlciBldmVudCBoYW5kbGVycy5cbiAgLy8gQ29uc3RydWN0IGEgbWFwIGZyb20gZXZlbnQgLT4gb3JkZXJlZCBsaXN0IG9mIFtjYWxsYmFjaywgcGx1Z2luXS5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsdWdpbnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBsdWdpbl9kaWN0ID0gdGhpcy5wbHVnaW5zX1tpXTtcbiAgICBmb3IgKHZhciBldmVudE5hbWUgaW4gcGx1Z2luX2RpY3QuZXZlbnRzKSB7XG4gICAgICBpZiAoIXBsdWdpbl9kaWN0LmV2ZW50cy5oYXNPd25Qcm9wZXJ0eShldmVudE5hbWUpKSBjb250aW51ZTtcbiAgICAgIHZhciBjYWxsYmFjayA9IHBsdWdpbl9kaWN0LmV2ZW50c1tldmVudE5hbWVdO1xuXG4gICAgICB2YXIgcGFpciA9IFtwbHVnaW5fZGljdC5wbHVnaW4sIGNhbGxiYWNrXTtcbiAgICAgIGlmICghKGV2ZW50TmFtZSBpbiB0aGlzLmV2ZW50TGlzdGVuZXJzXykpIHtcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbmVyc19bZXZlbnROYW1lXSA9IFtwYWlyXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnNfW2V2ZW50TmFtZV0ucHVzaChwYWlyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLmNyZWF0ZURyYWdJbnRlcmZhY2VfKCk7XG5cbiAgdGhpcy5zdGFydF8oKTtcbn07XG5cbi8qKlxuICogVHJpZ2dlcnMgYSBjYXNjYWRlIG9mIGV2ZW50cyB0byB0aGUgdmFyaW91cyBwbHVnaW5zIHdoaWNoIGFyZSBpbnRlcmVzdGVkIGluIHRoZW0uXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIFwiZGVmYXVsdCBiZWhhdmlvclwiIHNob3VsZCBiZSBwcmV2ZW50ZWQsIGkuZS4gaWYgb25lXG4gKiBvZiB0aGUgZXZlbnQgbGlzdGVuZXJzIGNhbGxlZCBldmVudC5wcmV2ZW50RGVmYXVsdCgpLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY2FzY2FkZUV2ZW50c18gPSBmdW5jdGlvbihuYW1lLCBleHRyYV9wcm9wcykge1xuICBpZiAoIShuYW1lIGluIHRoaXMuZXZlbnRMaXN0ZW5lcnNfKSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIFFVRVNUSU9OOiBjYW4gd2UgdXNlIG9iamVjdHMgJiBwcm90b3R5cGVzIHRvIHNwZWVkIHRoaXMgdXA/XG4gIHZhciBlID0ge1xuICAgIGR5Z3JhcGg6IHRoaXMsXG4gICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdFByZXZlbnRlZDogZmFsc2UsXG4gICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFlLmNhbmNlbGFibGUpIHRocm93IFwiQ2Fubm90IGNhbGwgcHJldmVudERlZmF1bHQgb24gbm9uLWNhbmNlbGFibGUgZXZlbnQuXCI7XG4gICAgICBlLmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgIH0sXG4gICAgcHJvcGFnYXRpb25TdG9wcGVkOiBmYWxzZSxcbiAgICBzdG9wUHJvcGFnYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgZS5wcm9wYWdhdGlvblN0b3BwZWQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgdXRpbHMudXBkYXRlKGUsIGV4dHJhX3Byb3BzKTtcblxuICB2YXIgY2FsbGJhY2tfcGx1Z2luX3BhaXJzID0gdGhpcy5ldmVudExpc3RlbmVyc19bbmFtZV07XG4gIGlmIChjYWxsYmFja19wbHVnaW5fcGFpcnMpIHtcbiAgICBmb3IgKHZhciBpID0gY2FsbGJhY2tfcGx1Z2luX3BhaXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgcGx1Z2luID0gY2FsbGJhY2tfcGx1Z2luX3BhaXJzW2ldWzBdO1xuICAgICAgdmFyIGNhbGxiYWNrID0gY2FsbGJhY2tfcGx1Z2luX3BhaXJzW2ldWzFdO1xuICAgICAgY2FsbGJhY2suY2FsbChwbHVnaW4sIGUpO1xuICAgICAgaWYgKGUucHJvcGFnYXRpb25TdG9wcGVkKSBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGUuZGVmYXVsdFByZXZlbnRlZDtcbn07XG5cbi8qKlxuICogRmV0Y2ggYSBwbHVnaW4gaW5zdGFuY2Ugb2YgYSBwYXJ0aWN1bGFyIGNsYXNzLiBPbmx5IGZvciB0ZXN0aW5nLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7IUNsYXNzfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBwbHVnaW4uXG4gKiBAcmV0dXJuIHtPYmplY3R9IEluc3RhbmNlIG9mIHRoZSBwbHVnaW4sIG9yIG51bGwgaWYgdGhlcmUgaXMgbm9uZS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0UGx1Z2luSW5zdGFuY2VfID0gZnVuY3Rpb24odHlwZSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGx1Z2luc18ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHRoaXMucGx1Z2luc19baV07XG4gICAgaWYgKHAucGx1Z2luIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgcmV0dXJuIHAucGx1Z2luO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgem9vbWVkIHN0YXR1cyBvZiB0aGUgY2hhcnQgZm9yIG9uZSBvciBib3RoIGF4ZXMuXG4gKlxuICogQXhpcyBpcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIuIENhbiBiZSBzZXQgdG8gJ3gnIG9yICd5Jy5cbiAqXG4gKiBUaGUgem9vbWVkIHN0YXR1cyBmb3IgYW4gYXhpcyBpcyBzZXQgd2hlbmV2ZXIgYSB1c2VyIHpvb21zIHVzaW5nIHRoZSBtb3VzZVxuICogb3Igd2hlbiB0aGUgZGF0ZVdpbmRvdyBvciB2YWx1ZVJhbmdlIGFyZSB1cGRhdGVkLiBEb3VibGUtY2xpY2tpbmcgb3IgY2FsbGluZ1xuICogcmVzZXRab29tKCkgcmVzZXRzIHRoZSB6b29tIHN0YXR1cyBmb3IgdGhlIGNoYXJ0LlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5pc1pvb21lZCA9IGZ1bmN0aW9uKGF4aXMpIHtcbiAgY29uc3QgaXNab29tZWRYID0gISF0aGlzLmRhdGVXaW5kb3dfO1xuICBpZiAoYXhpcyA9PT0gJ3gnKSByZXR1cm4gaXNab29tZWRYO1xuXG4gIGNvbnN0IGlzWm9vbWVkWSA9IHRoaXMuYXhlc18ubWFwKGF4aXMgPT4gISFheGlzLnZhbHVlUmFuZ2UpLmluZGV4T2YodHJ1ZSkgPj0gMDtcbiAgaWYgKGF4aXMgPT09IG51bGwgfHwgYXhpcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGlzWm9vbWVkWCB8fCBpc1pvb21lZFk7XG4gIH1cbiAgaWYgKGF4aXMgPT09ICd5JykgcmV0dXJuIGlzWm9vbWVkWTtcblxuICB0aHJvdyBuZXcgRXJyb3IoYGF4aXMgcGFyYW1ldGVyIGlzIFske2F4aXN9XSBtdXN0IGJlIG51bGwsICd4JyBvciAneScuYCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIER5Z3JhcGggb2JqZWN0LCBpbmNsdWRpbmcgaXRzIGNvbnRhaW5pbmcgSUQuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtYWluZGl2ID0gdGhpcy5tYWluZGl2XztcbiAgdmFyIGlkID0gKG1haW5kaXYgJiYgbWFpbmRpdi5pZCkgPyBtYWluZGl2LmlkIDogbWFpbmRpdjtcbiAgcmV0dXJuIFwiW0R5Z3JhcGggXCIgKyBpZCArIFwiXVwiO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYW4gb3B0aW9uLiBUaGlzIG1heSBiZSBzZXQgYnkgdGhlIHVzZXIgKGVpdGhlciBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yIG9yIGJ5IGNhbGxpbmcgdXBkYXRlT3B0aW9ucykgb3IgYnkgZHlncmFwaHMsIGFuZCBtYXkgYmUgc2V0IHRvIGFcbiAqIHBlci1zZXJpZXMgdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uLCBlLmcuICdyb2xsUGVyaW9kJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbc2VyaWVzTmFtZV0gVGhlIG5hbWUgb2YgdGhlIHNlcmllcyB0byB3aGljaCB0aGUgb3B0aW9uXG4gKiB3aWxsIGJlIGFwcGxpZWQuIElmIG5vIHBlci1zZXJpZXMgdmFsdWUgb2YgdGhpcyBvcHRpb24gaXMgYXZhaWxhYmxlLCB0aGVuXG4gKiB0aGUgZ2xvYmFsIHZhbHVlIGlzIHJldHVybmVkLiBUaGlzIGlzIG9wdGlvbmFsLlxuICogQHJldHVybiB7Li4ufSBUaGUgdmFsdWUgb2YgdGhlIG9wdGlvbi5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuYXR0cl8gPSBmdW5jdGlvbihuYW1lLCBzZXJpZXNOYW1lKSB7XG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgLy8gRm9yIFwicHJvZHVjdGlvblwiIGNvZGUsIHRoaXMgZ2V0cyByZW1vdmVkIGJ5IHVnbGlmeWpzLlxuICAgIGlmICh0eXBlb2YoT1BUSU9OU19SRUZFUkVOQ0UpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc29sZS5lcnJvcignTXVzdCBpbmNsdWRlIG9wdGlvbnMgcmVmZXJlbmNlIEpTIGZvciB0ZXN0aW5nJyk7XG4gICAgfSBlbHNlIGlmICghT1BUSU9OU19SRUZFUkVOQ0UuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0R5Z3JhcGhzIGlzIHVzaW5nIHByb3BlcnR5ICcgKyBuYW1lICsgJywgd2hpY2ggaGFzIG5vICcgK1xuICAgICAgICAgICAgICAgICAgICAnZW50cnkgaW4gdGhlIER5Z3JhcGhzLk9QVElPTlNfUkVGRVJFTkNFIGxpc3RpbmcuJyk7XG4gICAgICAvLyBPbmx5IGxvZyB0aGlzIGVycm9yIG9uY2UuXG4gICAgICBPUFRJT05TX1JFRkVSRU5DRVtuYW1lXSA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBzZXJpZXNOYW1lID8gdGhpcy5hdHRyaWJ1dGVzXy5nZXRGb3JTZXJpZXMobmFtZSwgc2VyaWVzTmFtZSkgOiB0aGlzLmF0dHJpYnV0ZXNfLmdldChuYW1lKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBmb3IgYW4gb3B0aW9uLCBhcyBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yIG9yIHZpYVxuICogdXBkYXRlT3B0aW9ucy4gWW91IG1heSBwYXNzIGluIGFuIChvcHRpb25hbCkgc2VyaWVzIG5hbWUgdG8gZ2V0IHBlci1zZXJpZXNcbiAqIHZhbHVlcyBmb3IgdGhlIG9wdGlvbi5cbiAqXG4gKiBBbGwgdmFsdWVzIHJldHVybmVkIGJ5IHRoaXMgbWV0aG9kIHNob3VsZCBiZSBjb25zaWRlcmVkIGltbXV0YWJsZS4gSWYgeW91XG4gKiBtb2RpZnkgdGhlbSwgdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhlIGNoYW5nZXMgd2lsbCBiZSBob25vcmVkIG9yIHRoYXRcbiAqIGR5Z3JhcGhzIHdpbGwgcmVtYWluIGluIGEgY29uc2lzdGVudCBzdGF0ZS4gSWYgeW91IHdhbnQgdG8gbW9kaWZ5IGFuIG9wdGlvbixcbiAqIHVzZSB1cGRhdGVPcHRpb25zKCkgaW5zdGVhZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uIChlLmcuICdzdHJva2VXaWR0aCcpXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9zZXJpZXNOYW1lIFNlcmllcyBuYW1lIHRvIGdldCBwZXItc2VyaWVzIHZhbHVlcy5cbiAqIEByZXR1cm4geyp9IFRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5nZXRPcHRpb24gPSBmdW5jdGlvbihuYW1lLCBvcHRfc2VyaWVzTmFtZSkge1xuICByZXR1cm4gdGhpcy5hdHRyXyhuYW1lLCBvcHRfc2VyaWVzTmFtZSk7XG59O1xuXG4vKipcbiAqIExpa2UgZ2V0T3B0aW9uKCksIGJ1dCBzcGVjaWZpY2FsbHkgcmV0dXJucyBhIG51bWJlci5cbiAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBmdW5jdGlvbiBmb3Igd29ya2luZyB3aXRoIHRoZSBDbG9zdXJlIENvbXBpbGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIG9wdGlvbiAoZS5nLiAnc3Ryb2tlV2lkdGgnKVxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfc2VyaWVzTmFtZSBTZXJpZXMgbmFtZSB0byBnZXQgcGVyLXNlcmllcyB2YWx1ZXMuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0TnVtZXJpY09wdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXNOYW1lKSB7XG4gIHJldHVybiAvKiogQHR5cGV7bnVtYmVyfSAqLyh0aGlzLmdldE9wdGlvbihuYW1lLCBvcHRfc2VyaWVzTmFtZSkpO1xufTtcblxuLyoqXG4gKiBMaWtlIGdldE9wdGlvbigpLCBidXQgc3BlY2lmaWNhbGx5IHJldHVybnMgYSBzdHJpbmcuXG4gKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIHdvcmtpbmcgd2l0aCB0aGUgQ2xvc3VyZSBDb21waWxlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBvcHRpb24gKGUuZy4gJ3N0cm9rZVdpZHRoJylcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3Nlcmllc05hbWUgU2VyaWVzIG5hbWUgdG8gZ2V0IHBlci1zZXJpZXMgdmFsdWVzLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgdmFsdWUgb2YgdGhlIG9wdGlvbi5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldFN0cmluZ09wdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXNOYW1lKSB7XG4gIHJldHVybiAvKiogQHR5cGV7c3RyaW5nfSAqLyh0aGlzLmdldE9wdGlvbihuYW1lLCBvcHRfc2VyaWVzTmFtZSkpO1xufTtcblxuLyoqXG4gKiBMaWtlIGdldE9wdGlvbigpLCBidXQgc3BlY2lmaWNhbGx5IHJldHVybnMgYSBib29sZWFuLlxuICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciB3b3JraW5nIHdpdGggdGhlIENsb3N1cmUgQ29tcGlsZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uIChlLmcuICdzdHJva2VXaWR0aCcpXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9zZXJpZXNOYW1lIFNlcmllcyBuYW1lIHRvIGdldCBwZXItc2VyaWVzIHZhbHVlcy5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0Qm9vbGVhbk9wdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXNOYW1lKSB7XG4gIHJldHVybiAvKiogQHR5cGV7Ym9vbGVhbn0gKi8odGhpcy5nZXRPcHRpb24obmFtZSwgb3B0X3Nlcmllc05hbWUpKTtcbn07XG5cbi8qKlxuICogTGlrZSBnZXRPcHRpb24oKSwgYnV0IHNwZWNpZmljYWxseSByZXR1cm5zIGEgZnVuY3Rpb24uXG4gKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIHdvcmtpbmcgd2l0aCB0aGUgQ2xvc3VyZSBDb21waWxlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBvcHRpb24gKGUuZy4gJ3N0cm9rZVdpZHRoJylcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3Nlcmllc05hbWUgU2VyaWVzIG5hbWUgdG8gZ2V0IHBlci1zZXJpZXMgdmFsdWVzLlxuICogQHJldHVybiB7ZnVuY3Rpb24oLi4uKX0gVGhlIHZhbHVlIG9mIHRoZSBvcHRpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5nZXRGdW5jdGlvbk9wdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXNOYW1lKSB7XG4gIHJldHVybiAvKiogQHR5cGV7ZnVuY3Rpb24oLi4uKX0gKi8odGhpcy5nZXRPcHRpb24obmFtZSwgb3B0X3Nlcmllc05hbWUpKTtcbn07XG5cbkR5Z3JhcGgucHJvdG90eXBlLmdldE9wdGlvbkZvckF4aXMgPSBmdW5jdGlvbihuYW1lLCBheGlzKSB7XG4gIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNfLmdldEZvckF4aXMobmFtZSwgYXhpcyk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gYXhpcyBUaGUgbmFtZSBvZiB0aGUgYXhpcyAoaS5lLiAneCcsICd5JyBvciAneTInKVxuICogQHJldHVybiB7Li4ufSBBIGZ1bmN0aW9uIG1hcHBpbmcgc3RyaW5nIC0+IG9wdGlvbiB2YWx1ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5vcHRpb25zVmlld0ZvckF4aXNfID0gZnVuY3Rpb24oYXhpcykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbihvcHQpIHtcbiAgICB2YXIgYXhpc19vcHRzID0gc2VsZi51c2VyX2F0dHJzXy5heGVzO1xuICAgIGlmIChheGlzX29wdHMgJiYgYXhpc19vcHRzW2F4aXNdICYmIGF4aXNfb3B0c1theGlzXS5oYXNPd25Qcm9wZXJ0eShvcHQpKSB7XG4gICAgICByZXR1cm4gYXhpc19vcHRzW2F4aXNdW29wdF07XG4gICAgfVxuXG4gICAgLy8gSSBkb24ndCBsaWtlIHRoYXQgdGhpcyBpcyBpbiBhIHNlY29uZCBzcG90LlxuICAgIGlmIChheGlzID09PSAneCcgJiYgb3B0ID09PSAnbG9nc2NhbGUnKSB7XG4gICAgICAvLyByZXR1cm4gdGhlIGRlZmF1bHQgdmFsdWUuXG4gICAgICAvLyBUT0RPKGtvbmlnc2JlcmcpOiBwdWxsIHRoZSBkZWZhdWx0IGZyb20gYSBnbG9iYWwgZGVmYXVsdC5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyB1c2VyLXNwZWNpZmllZCBhdHRyaWJ1dGVzIGFsd2F5cyB0cnVtcCBkZWZhdWx0cywgZXZlbiBpZiB0aGV5J3JlIGxlc3NcbiAgICAvLyBzcGVjaWZpYy5cbiAgICBpZiAodHlwZW9mKHNlbGYudXNlcl9hdHRyc19bb3B0XSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBzZWxmLnVzZXJfYXR0cnNfW29wdF07XG4gICAgfVxuXG4gICAgYXhpc19vcHRzID0gc2VsZi5hdHRyc18uYXhlcztcbiAgICBpZiAoYXhpc19vcHRzICYmIGF4aXNfb3B0c1theGlzXSAmJiBheGlzX29wdHNbYXhpc10uaGFzT3duUHJvcGVydHkob3B0KSkge1xuICAgICAgcmV0dXJuIGF4aXNfb3B0c1theGlzXVtvcHRdO1xuICAgIH1cbiAgICAvLyBjaGVjayBvbGQtc3R5bGUgYXhpcyBvcHRpb25zXG4gICAgLy8gVE9ETyhkYW52ayk6IGFkZCBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgaWYgZWl0aGVyIG9mIHRoZXNlIG1hdGNoLlxuICAgIGlmIChheGlzID09ICd5JyAmJiBzZWxmLmF4ZXNfWzBdLmhhc093blByb3BlcnR5KG9wdCkpIHtcbiAgICAgIHJldHVybiBzZWxmLmF4ZXNfWzBdW29wdF07XG4gICAgfSBlbHNlIGlmIChheGlzID09ICd5MicgJiYgc2VsZi5heGVzX1sxXS5oYXNPd25Qcm9wZXJ0eShvcHQpKSB7XG4gICAgICByZXR1cm4gc2VsZi5heGVzX1sxXVtvcHRdO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZi5hdHRyXyhvcHQpO1xuICB9O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvbGxpbmcgcGVyaW9kLCBhcyBzZXQgYnkgdGhlIHVzZXIgb3IgYW4gb3B0aW9uLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgcm9sbGluZyB3aW5kb3dcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUucm9sbFBlcmlvZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yb2xsUGVyaW9kXztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudGx5LXZpc2libGUgeC1yYW5nZS4gVGhpcyBjYW4gYmUgYWZmZWN0ZWQgYnkgem9vbWluZyxcbiAqIHBhbm5pbmcgb3IgYSBjYWxsIHRvIHVwZGF0ZU9wdGlvbnMuXG4gKiBSZXR1cm5zIGEgdHdvLWVsZW1lbnQgYXJyYXk6IFtsZWZ0LCByaWdodF0uXG4gKiBJZiB0aGUgRHlncmFwaCBoYXMgZGF0ZXMgb24gdGhlIHgtYXhpcywgdGhlc2Ugd2lsbCBiZSBtaWxsaXMgc2luY2UgZXBvY2guXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnhBeGlzUmFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZGF0ZVdpbmRvd18gPyB0aGlzLmRhdGVXaW5kb3dfIDogdGhpcy54QXhpc0V4dHJlbWVzKCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGxvd2VyLSBhbmQgdXBwZXItYm91bmQgeC1heGlzIHZhbHVlcyBvZiB0aGUgZGF0YSBzZXQuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnhBeGlzRXh0cmVtZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhZCA9IHRoaXMuZ2V0TnVtZXJpY09wdGlvbigneFJhbmdlUGFkJykgLyB0aGlzLnBsb3R0ZXJfLmFyZWEudztcbiAgaWYgKHRoaXMubnVtUm93cygpID09PSAwKSB7XG4gICAgcmV0dXJuIFswIC0gcGFkLCAxICsgcGFkXTtcbiAgfVxuICB2YXIgbGVmdCA9IHRoaXMucmF3RGF0YV9bMF1bMF07XG4gIHZhciByaWdodCA9IHRoaXMucmF3RGF0YV9bdGhpcy5yYXdEYXRhXy5sZW5ndGggLSAxXVswXTtcbiAgaWYgKHBhZCkge1xuICAgIC8vIE11c3Qga2VlcCB0aGlzIGluIHN5bmMgd2l0aCBkeWdyYXBoLWxheW91dCBfZXZhbHVhdGVMaW1pdHMoKVxuICAgIHZhciByYW5nZSA9IHJpZ2h0IC0gbGVmdDtcbiAgICBsZWZ0IC09IHJhbmdlICogcGFkO1xuICAgIHJpZ2h0ICs9IHJhbmdlICogcGFkO1xuICB9XG4gIHJldHVybiBbbGVmdCwgcmlnaHRdO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsb3dlci0gYW5kIHVwcGVyLWJvdW5kIHktYXhpcyB2YWx1ZXMgZm9yIGVhY2ggYXhpcy4gVGhlc2UgYXJlXG4gKiB0aGUgcmFuZ2VzIHlvdSdsbCBnZXQgaWYgeW91IGRvdWJsZS1jbGljayB0byB6b29tIG91dCBvciBjYWxsIHJlc2V0Wm9vbSgpLlxuICogVGhlIHJldHVybiB2YWx1ZSBpcyBhbiBhcnJheSBvZiBbbG93LCBoaWdoXSB0dXBsZXMsIG9uZSBmb3IgZWFjaCB5LWF4aXMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnlBeGlzRXh0cmVtZXMgPSBmdW5jdGlvbigpIHtcbiAgLy8gVE9ETyhkYW52ayk6IHRoaXMgaXMgcHJldHR5IGluZWZmaWNpZW50XG4gIGNvbnN0IHBhY2tlZCA9IHRoaXMuZ2F0aGVyRGF0YXNldHNfKHRoaXMucm9sbGVkU2VyaWVzXywgbnVsbCk7XG4gIGNvbnN0IHsgZXh0cmVtZXMgfSA9IHBhY2tlZDtcbiAgY29uc3Qgc2F2ZUF4ZXMgPSB0aGlzLmF4ZXNfO1xuICB0aGlzLmNvbXB1dGVZQXhpc1Jhbmdlc18oZXh0cmVtZXMpO1xuICBjb25zdCBuZXdBeGVzID0gdGhpcy5heGVzXztcbiAgdGhpcy5heGVzXyA9IHNhdmVBeGVzO1xuICByZXR1cm4gbmV3QXhlcy5tYXAoYXhpcyA9PiBheGlzLmV4dHJlbWVSYW5nZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudGx5LXZpc2libGUgeS1yYW5nZSBmb3IgYW4gYXhpcy4gVGhpcyBjYW4gYmUgYWZmZWN0ZWQgYnlcbiAqIHpvb21pbmcsIHBhbm5pbmcgb3IgYSBjYWxsIHRvIHVwZGF0ZU9wdGlvbnMuIEF4aXMgaW5kaWNlcyBhcmUgemVyby1iYXNlZC4gSWZcbiAqIGNhbGxlZCB3aXRoIG5vIGFyZ3VtZW50cywgcmV0dXJucyB0aGUgcmFuZ2Ugb2YgdGhlIGZpcnN0IGF4aXMuXG4gKiBSZXR1cm5zIGEgdHdvLWVsZW1lbnQgYXJyYXk6IFtib3R0b20sIHRvcF0uXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnlBeGlzUmFuZ2UgPSBmdW5jdGlvbihpZHgpIHtcbiAgaWYgKHR5cGVvZihpZHgpID09IFwidW5kZWZpbmVkXCIpIGlkeCA9IDA7XG4gIGlmIChpZHggPCAwIHx8IGlkeCA+PSB0aGlzLmF4ZXNfLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBheGlzID0gdGhpcy5heGVzX1tpZHhdO1xuICByZXR1cm4gWyBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXSwgYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV0gXTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudGx5LXZpc2libGUgeS1yYW5nZXMgZm9yIGVhY2ggYXhpcy4gVGhpcyBjYW4gYmUgYWZmZWN0ZWQgYnlcbiAqIHpvb21pbmcsIHBhbm5pbmcsIGNhbGxzIHRvIHVwZGF0ZU9wdGlvbnMsIGV0Yy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgW2JvdHRvbSwgdG9wXSBwYWlycywgb25lIGZvciBlYWNoIHktYXhpcy5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUueUF4aXNSYW5nZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJldCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXhlc18ubGVuZ3RoOyBpKyspIHtcbiAgICByZXQucHVzaCh0aGlzLnlBeGlzUmFuZ2UoaSkpO1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG4vLyBUT0RPKGRhbnZrKTogdXNlIHRoZXNlIGZ1bmN0aW9ucyB0aHJvdWdob3V0IGR5Z3JhcGhzLlxuLyoqXG4gKiBDb252ZXJ0IGZyb20gZGF0YSBjb29yZGluYXRlcyB0byBjYW52YXMvZGl2IFgvWSBjb29yZGluYXRlcy5cbiAqIElmIHNwZWNpZmllZCwgZG8gdGhpcyBjb252ZXJzaW9uIGZvciB0aGUgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgYSBwYXJ0aWN1bGFyXG4gKiBheGlzLiBVc2VzIHRoZSBmaXJzdCBheGlzIGJ5IGRlZmF1bHQuXG4gKiBSZXR1cm5zIGEgdHdvLWVsZW1lbnQgYXJyYXk6IFtYLCBZXVxuICpcbiAqIE5vdGU6IHVzZSB0b0RvbVhDb29yZCBpbnN0ZWFkIG9mIHRvRG9tQ29vcmRzKHgsIG51bGwpIGFuZCB1c2UgdG9Eb21ZQ29vcmRcbiAqIGluc3RlYWQgb2YgdG9Eb21Db29yZHMobnVsbCwgeSwgYXhpcykuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnRvRG9tQ29vcmRzID0gZnVuY3Rpb24oeCwgeSwgYXhpcykge1xuICByZXR1cm4gWyB0aGlzLnRvRG9tWENvb3JkKHgpLCB0aGlzLnRvRG9tWUNvb3JkKHksIGF4aXMpIF07XG59O1xuXG4vKipcbiAqIENvbnZlcnQgZnJvbSBkYXRhIHggY29vcmRpbmF0ZXMgdG8gY2FudmFzL2RpdiBYIGNvb3JkaW5hdGUuXG4gKiBJZiBzcGVjaWZpZWQsIGRvIHRoaXMgY29udmVyc2lvbiBmb3IgdGhlIGNvb3JkaW5hdGUgc3lzdGVtIG9mIGEgcGFydGljdWxhclxuICogYXhpcy5cbiAqIFJldHVybnMgYSBzaW5nbGUgdmFsdWUgb3IgbnVsbCBpZiB4IGlzIG51bGwuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnRvRG9tWENvb3JkID0gZnVuY3Rpb24oeCkge1xuICBpZiAoeCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGFyZWEgPSB0aGlzLnBsb3R0ZXJfLmFyZWE7XG4gIHZhciB4UmFuZ2UgPSB0aGlzLnhBeGlzUmFuZ2UoKTtcbiAgcmV0dXJuIGFyZWEueCArICh4IC0geFJhbmdlWzBdKSAvICh4UmFuZ2VbMV0gLSB4UmFuZ2VbMF0pICogYXJlYS53O1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IGZyb20gZGF0YSB4IGNvb3JkaW5hdGVzIHRvIGNhbnZhcy9kaXYgWSBjb29yZGluYXRlIGFuZCBvcHRpb25hbFxuICogYXhpcy4gVXNlcyB0aGUgZmlyc3QgYXhpcyBieSBkZWZhdWx0LlxuICpcbiAqIHJldHVybnMgYSBzaW5nbGUgdmFsdWUgb3IgbnVsbCBpZiB5IGlzIG51bGwuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnRvRG9tWUNvb3JkID0gZnVuY3Rpb24oeSwgYXhpcykge1xuICB2YXIgcGN0ID0gdGhpcy50b1BlcmNlbnRZQ29vcmQoeSwgYXhpcyk7XG5cbiAgaWYgKHBjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBhcmVhID0gdGhpcy5wbG90dGVyXy5hcmVhO1xuICByZXR1cm4gYXJlYS55ICsgcGN0ICogYXJlYS5oO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IGZyb20gY2FudmFzL2RpdiBjb29yZHMgdG8gZGF0YSBjb29yZGluYXRlcy5cbiAqIElmIHNwZWNpZmllZCwgZG8gdGhpcyBjb252ZXJzaW9uIGZvciB0aGUgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgYSBwYXJ0aWN1bGFyXG4gKiBheGlzLiBVc2VzIHRoZSBmaXJzdCBheGlzIGJ5IGRlZmF1bHQuXG4gKiBSZXR1cm5zIGEgdHdvLWVsZW1lbnQgYXJyYXk6IFtYLCBZXS5cbiAqXG4gKiBOb3RlOiB1c2UgdG9EYXRhWENvb3JkIGluc3RlYWQgb2YgdG9EYXRhQ29vcmRzKHgsIG51bGwpIGFuZCB1c2UgdG9EYXRhWUNvb3JkXG4gKiBpbnN0ZWFkIG9mIHRvRGF0YUNvb3JkcyhudWxsLCB5LCBheGlzKS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUudG9EYXRhQ29vcmRzID0gZnVuY3Rpb24oeCwgeSwgYXhpcykge1xuICByZXR1cm4gWyB0aGlzLnRvRGF0YVhDb29yZCh4KSwgdGhpcy50b0RhdGFZQ29vcmQoeSwgYXhpcykgXTtcbn07XG5cbi8qKlxuICogQ29udmVydCBmcm9tIGNhbnZhcy9kaXYgeCBjb29yZGluYXRlIHRvIGRhdGEgY29vcmRpbmF0ZS5cbiAqXG4gKiBJZiB4IGlzIG51bGwsIHRoaXMgcmV0dXJucyBudWxsLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS50b0RhdGFYQ29vcmQgPSBmdW5jdGlvbih4KSB7XG4gIGlmICh4ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgYXJlYSA9IHRoaXMucGxvdHRlcl8uYXJlYTtcbiAgdmFyIHhSYW5nZSA9IHRoaXMueEF4aXNSYW5nZSgpO1xuXG4gIGlmICghdGhpcy5hdHRyaWJ1dGVzXy5nZXRGb3JBeGlzKFwibG9nc2NhbGVcIiwgJ3gnKSkge1xuICAgIHJldHVybiB4UmFuZ2VbMF0gKyAoeCAtIGFyZWEueCkgLyBhcmVhLncgKiAoeFJhbmdlWzFdIC0geFJhbmdlWzBdKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGN0ID0gKHggLSBhcmVhLngpIC8gYXJlYS53O1xuICAgIHJldHVybiB1dGlscy5sb2dSYW5nZUZyYWN0aW9uKHhSYW5nZVswXSwgeFJhbmdlWzFdLCBwY3QpO1xuICB9XG59O1xuXG4vKipcbiAqIENvbnZlcnQgZnJvbSBjYW52YXMvZGl2IHkgY29vcmQgdG8gdmFsdWUuXG4gKlxuICogSWYgeSBpcyBudWxsLCB0aGlzIHJldHVybnMgbnVsbC5cbiAqIGlmIGF4aXMgaXMgbnVsbCwgdGhpcyB1c2VzIHRoZSBmaXJzdCBheGlzLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS50b0RhdGFZQ29vcmQgPSBmdW5jdGlvbih5LCBheGlzKSB7XG4gIGlmICh5ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgYXJlYSA9IHRoaXMucGxvdHRlcl8uYXJlYTtcbiAgdmFyIHlSYW5nZSA9IHRoaXMueUF4aXNSYW5nZShheGlzKTtcblxuICBpZiAodHlwZW9mKGF4aXMpID09IFwidW5kZWZpbmVkXCIpIGF4aXMgPSAwO1xuICBpZiAoIXRoaXMuYXR0cmlidXRlc18uZ2V0Rm9yQXhpcyhcImxvZ3NjYWxlXCIsIGF4aXMpKSB7XG4gICAgcmV0dXJuIHlSYW5nZVswXSArIChhcmVhLnkgKyBhcmVhLmggLSB5KSAvIGFyZWEuaCAqICh5UmFuZ2VbMV0gLSB5UmFuZ2VbMF0pO1xuICB9IGVsc2Uge1xuICAgIC8vIENvbXB1dGluZyB0aGUgaW52ZXJzZSBvZiB0b0RvbUNvb3JkLlxuICAgIHZhciBwY3QgPSAoeSAtIGFyZWEueSkgLyBhcmVhLmg7XG4gICAgLy8gTm90ZSByZXZlcnNlZCB5UmFuZ2UsIHkxIGlzIG9uIHRvcCB3aXRoIHBjdD09MC5cbiAgICByZXR1cm4gdXRpbHMubG9nUmFuZ2VGcmFjdGlvbih5UmFuZ2VbMV0sIHlSYW5nZVswXSwgcGN0KTtcbiAgfVxufTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIHkgZm9yIGFuIGF4aXMgdG8gYSBwZXJjZW50YWdlIGZyb20gdGhlIHRvcCB0byB0aGVcbiAqIGJvdHRvbSBvZiB0aGUgZHJhd2luZyBhcmVhLlxuICpcbiAqIElmIHRoZSBjb29yZGluYXRlIHJlcHJlc2VudHMgYSB2YWx1ZSB2aXNpYmxlIG9uIHRoZSBjYW52YXMsIHRoZW5cbiAqIHRoZSB2YWx1ZSB3aWxsIGJlIGJldHdlZW4gMCBhbmQgMSwgd2hlcmUgMCBpcyB0aGUgdG9wIG9mIHRoZSBjYW52YXMuXG4gKiBIb3dldmVyLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB2YWx1ZXMgb3V0c2lkZSB0aGUgcmFuZ2UsIGFzXG4gKiB2YWx1ZXMgY2FuIGZhbGwgb3V0c2lkZSB0aGUgY2FudmFzLlxuICpcbiAqIElmIHkgaXMgbnVsbCwgdGhpcyByZXR1cm5zIG51bGwuXG4gKiBpZiBheGlzIGlzIG51bGwsIHRoaXMgdXNlcyB0aGUgZmlyc3QgYXhpcy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0geSBUaGUgZGF0YSB5LWNvb3JkaW5hdGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW2F4aXNdIFRoZSBheGlzIG51bWJlciBvbiB3aGljaCB0aGUgZGF0YSBjb29yZGluYXRlIGxpdmVzLlxuICogQHJldHVybiB7bnVtYmVyfSBBIGZyYWN0aW9uIGluIFswLCAxXSB3aGVyZSAwID0gdGhlIHRvcCBlZGdlLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS50b1BlcmNlbnRZQ29vcmQgPSBmdW5jdGlvbih5LCBheGlzKSB7XG4gIGlmICh5ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHR5cGVvZihheGlzKSA9PSBcInVuZGVmaW5lZFwiKSBheGlzID0gMDtcblxuICB2YXIgeVJhbmdlID0gdGhpcy55QXhpc1JhbmdlKGF4aXMpO1xuXG4gIHZhciBwY3Q7XG4gIHZhciBsb2dzY2FsZSA9IHRoaXMuYXR0cmlidXRlc18uZ2V0Rm9yQXhpcyhcImxvZ3NjYWxlXCIsIGF4aXMpO1xuICBpZiAobG9nc2NhbGUpIHtcbiAgICB2YXIgbG9ncjAgPSB1dGlscy5sb2cxMCh5UmFuZ2VbMF0pO1xuICAgIHZhciBsb2dyMSA9IHV0aWxzLmxvZzEwKHlSYW5nZVsxXSk7XG4gICAgcGN0ID0gKGxvZ3IxIC0gdXRpbHMubG9nMTAoeSkpIC8gKGxvZ3IxIC0gbG9ncjApO1xuICB9IGVsc2Uge1xuICAgIC8vIHlSYW5nZVsxXSAtIHkgaXMgdW5pdCBkaXN0YW5jZSBmcm9tIHRoZSBib3R0b20uXG4gICAgLy8geVJhbmdlWzFdIC0geVJhbmdlWzBdIGlzIHRoZSBzY2FsZSBvZiB0aGUgcmFuZ2UuXG4gICAgLy8gKHlSYW5nZVsxXSAtIHkpIC8gKHlSYW5nZVsxXSAtIHlSYW5nZVswXSkgaXMgdGhlICUgZnJvbSB0aGUgYm90dG9tLlxuICAgIHBjdCA9ICh5UmFuZ2VbMV0gLSB5KSAvICh5UmFuZ2VbMV0gLSB5UmFuZ2VbMF0pO1xuICB9XG4gIHJldHVybiBwY3Q7XG59O1xuXG4vKipcbiAqIENvbnZlcnRzIGFuIHggdmFsdWUgdG8gYSBwZXJjZW50YWdlIGZyb20gdGhlIGxlZnQgdG8gdGhlIHJpZ2h0IG9mXG4gKiB0aGUgZHJhd2luZyBhcmVhLlxuICpcbiAqIElmIHRoZSBjb29yZGluYXRlIHJlcHJlc2VudHMgYSB2YWx1ZSB2aXNpYmxlIG9uIHRoZSBjYW52YXMsIHRoZW5cbiAqIHRoZSB2YWx1ZSB3aWxsIGJlIGJldHdlZW4gMCBhbmQgMSwgd2hlcmUgMCBpcyB0aGUgbGVmdCBvZiB0aGUgY2FudmFzLlxuICogSG93ZXZlciwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gdmFsdWVzIG91dHNpZGUgdGhlIHJhbmdlLCBhc1xuICogdmFsdWVzIGNhbiBmYWxsIG91dHNpZGUgdGhlIGNhbnZhcy5cbiAqXG4gKiBJZiB4IGlzIG51bGwsIHRoaXMgcmV0dXJucyBudWxsLlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIGRhdGEgeC1jb29yZGluYXRlLlxuICogQHJldHVybiB7bnVtYmVyfSBBIGZyYWN0aW9uIGluIFswLCAxXSB3aGVyZSAwID0gdGhlIGxlZnQgZWRnZS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUudG9QZXJjZW50WENvb3JkID0gZnVuY3Rpb24oeCkge1xuICBpZiAoeCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHhSYW5nZSA9IHRoaXMueEF4aXNSYW5nZSgpO1xuICB2YXIgcGN0O1xuICB2YXIgbG9nc2NhbGUgPSB0aGlzLmF0dHJpYnV0ZXNfLmdldEZvckF4aXMoXCJsb2dzY2FsZVwiLCAneCcpIDtcbiAgaWYgKGxvZ3NjYWxlID09PSB0cnVlKSB7ICAvLyBsb2dzY2FsZSBjYW4gYmUgbnVsbCBzbyB3ZSB0ZXN0IGZvciB0cnVlIGV4cGxpY2l0bHkuXG4gICAgdmFyIGxvZ3IwID0gdXRpbHMubG9nMTAoeFJhbmdlWzBdKTtcbiAgICB2YXIgbG9ncjEgPSB1dGlscy5sb2cxMCh4UmFuZ2VbMV0pO1xuICAgIHBjdCA9ICh1dGlscy5sb2cxMCh4KSAtIGxvZ3IwKSAvIChsb2dyMSAtIGxvZ3IwKTtcbiAgfSBlbHNlIHtcbiAgICAvLyB4IC0geFJhbmdlWzBdIGlzIHVuaXQgZGlzdGFuY2UgZnJvbSB0aGUgbGVmdC5cbiAgICAvLyB4UmFuZ2VbMV0gLSB4UmFuZ2VbMF0gaXMgdGhlIHNjYWxlIG9mIHRoZSByYW5nZS5cbiAgICAvLyBUaGUgZnVsbCBleHByZXNzaW9uIGJlbG93IGlzIHRoZSAlIGZyb20gdGhlIGxlZnQuXG4gICAgcGN0ID0gKHggLSB4UmFuZ2VbMF0pIC8gKHhSYW5nZVsxXSAtIHhSYW5nZVswXSk7XG4gIH1cbiAgcmV0dXJuIHBjdDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgKGluY2x1ZGluZyB0aGUgaW5kZXBlbmRlbnQgdmFyaWFibGUpLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGNvbHVtbnMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLm51bUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnJhd0RhdGFfKSByZXR1cm4gMDtcbiAgcmV0dXJuIHRoaXMucmF3RGF0YV9bMF0gPyB0aGlzLnJhd0RhdGFfWzBdLmxlbmd0aCA6IHRoaXMuYXR0cl8oXCJsYWJlbHNcIikubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygcm93cyAoZXhjbHVkaW5nIGFueSBoZWFkZXIvbGFiZWwgcm93KS5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiByb3dzLCBsZXNzIGFueSBoZWFkZXIuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLm51bVJvd3MgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnJhd0RhdGFfKSByZXR1cm4gMDtcbiAgcmV0dXJuIHRoaXMucmF3RGF0YV8ubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB2YWx1ZSBpbiB0aGUgZ2l2ZW4gcm93IGFuZCBjb2x1bW4uIElmIHRoZSByb3cgYW5kIGNvbHVtbiBleGNlZWRcbiAqIHRoZSBib3VuZHMgb24gdGhlIGRhdGEsIHJldHVybnMgbnVsbC4gQWxzbyByZXR1cm5zIG51bGwgaWYgdGhlIHZhbHVlIGlzXG4gKiBtaXNzaW5nLlxuICogQHBhcmFtIHtudW1iZXJ9IHJvdyBUaGUgcm93IG51bWJlciBvZiB0aGUgZGF0YSAoMC1iYXNlZCkuIFJvdyAwIGlzIHRoZVxuICogICAgIGZpcnN0IHJvdyBvZiBkYXRhLCBub3QgYSBoZWFkZXIgcm93LlxuICogQHBhcmFtIHtudW1iZXJ9IGNvbCBUaGUgY29sdW1uIG51bWJlciBvZiB0aGUgZGF0YSAoMC1iYXNlZClcbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIHZhbHVlIGluIHRoZSBzcGVjaWZpZWQgY2VsbCBvciBudWxsIGlmIHRoZSByb3cvY29sXG4gKiAgICAgd2VyZSBvdXQgb2YgcmFuZ2UuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcbiAgaWYgKHJvdyA8IDAgfHwgcm93ID49IHRoaXMucmF3RGF0YV8ubGVuZ3RoKSByZXR1cm4gbnVsbDtcbiAgaWYgKGNvbCA8IDAgfHwgY29sID49IHRoaXMucmF3RGF0YV9bcm93XS5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gIHJldHVybiB0aGlzLnJhd0RhdGFfW3Jvd11bY29sXTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGludGVyZmFjZSBlbGVtZW50cyBmb3IgdGhlIER5Z3JhcGg6IGEgY29udGFpbmluZyBkaXYsIGEgZGl2IHRvXG4gKiBkaXNwbGF5IHRoZSBjdXJyZW50IHBvaW50LCBhbmQgYSB0ZXh0Ym94IHRvIGFkanVzdCB0aGUgcm9sbGluZyBhdmVyYWdlXG4gKiBwZXJpb2QuIEFsc28gY3JlYXRlcyB0aGUgUmVuZGVyZXIvTGF5b3V0IGVsZW1lbnRzLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY3JlYXRlSW50ZXJmYWNlXyA9IGZ1bmN0aW9uKCkge1xuICAvLyBDcmVhdGUgdGhlIGFsbC1lbmNsb3NpbmcgZ3JhcGggZGl2XG4gIHZhciBlbmNsb3NpbmcgPSB0aGlzLm1haW5kaXZfO1xuXG4gIHRoaXMuZ3JhcGhEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG4gIC8vIFRPRE8oZGFudmspOiBhbnkgb3RoZXIgc3R5bGVzIHRoYXQgYXJlIHVzZWZ1bCB0byBzZXQgaGVyZT9cbiAgdGhpcy5ncmFwaERpdi5zdHlsZS50ZXh0QWxpZ24gPSAnbGVmdCc7ICAvLyBUaGlzIGlzIGEgQ1NTIFwicmVzZXRcIlxuICB0aGlzLmdyYXBoRGl2LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgZW5jbG9zaW5nLmFwcGVuZENoaWxkKHRoaXMuZ3JhcGhEaXYpO1xuXG4gIC8vIENyZWF0ZSB0aGUgY2FudmFzIGZvciBpbnRlcmFjdGl2ZSBwYXJ0cyBvZiB0aGUgY2hhcnQuXG4gIHRoaXMuY2FudmFzXyA9IHV0aWxzLmNyZWF0ZUNhbnZhcygpO1xuICB0aGlzLmNhbnZhc18uc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gIHRoaXMuY2FudmFzXy5zdHlsZS50b3AgPSAwO1xuICB0aGlzLmNhbnZhc18uc3R5bGUubGVmdCA9IDA7XG5cbiAgLy8gLi4uIGFuZCBmb3Igc3RhdGljIHBhcnRzIG9mIHRoZSBjaGFydC5cbiAgdGhpcy5oaWRkZW5fID0gdGhpcy5jcmVhdGVQbG90S2l0Q2FudmFzXyh0aGlzLmNhbnZhc18pO1xuXG4gIHRoaXMuY2FudmFzX2N0eF8gPSB1dGlscy5nZXRDb250ZXh0KHRoaXMuY2FudmFzXyk7XG4gIHRoaXMuaGlkZGVuX2N0eF8gPSB1dGlscy5nZXRDb250ZXh0KHRoaXMuaGlkZGVuXyk7XG5cbiAgdGhpcy5yZXNpemVFbGVtZW50c18oKTtcblxuICAvLyBUaGUgaW50ZXJhY3RpdmUgcGFydHMgb2YgdGhlIGdyYXBoIGFyZSBkcmF3biBvbiB0b3Agb2YgdGhlIGNoYXJ0LlxuICB0aGlzLmdyYXBoRGl2LmFwcGVuZENoaWxkKHRoaXMuaGlkZGVuXyk7XG4gIHRoaXMuZ3JhcGhEaXYuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXNfKTtcbiAgdGhpcy5tb3VzZUV2ZW50RWxlbWVudF8gPSB0aGlzLmNyZWF0ZU1vdXNlRXZlbnRFbGVtZW50XygpO1xuXG4gIC8vIENyZWF0ZSB0aGUgZ3JhcGhlclxuICB0aGlzLmxheW91dF8gPSBuZXcgRHlncmFwaExheW91dCh0aGlzKTtcblxuICB2YXIgZHlncmFwaCA9IHRoaXM7XG5cbiAgdGhpcy5tb3VzZU1vdmVIYW5kbGVyXyA9IGZ1bmN0aW9uKGUpIHtcbiAgICBkeWdyYXBoLm1vdXNlTW92ZV8oZSk7XG4gIH07XG5cbiAgdGhpcy5tb3VzZU91dEhhbmRsZXJfID0gZnVuY3Rpb24oZSkge1xuICAgIC8vIFRoZSBtb3VzZSBoYXMgbGVmdCB0aGUgY2hhcnQgaWY6XG4gICAgLy8gMS4gZS50YXJnZXQgaXMgaW5zaWRlIHRoZSBjaGFydFxuICAgIC8vIDIuIGUucmVsYXRlZFRhcmdldCBpcyBvdXRzaWRlIHRoZSBjaGFydFxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLmZyb21FbGVtZW50O1xuICAgIHZhciByZWxhdGVkVGFyZ2V0ID0gZS5yZWxhdGVkVGFyZ2V0IHx8IGUudG9FbGVtZW50O1xuICAgIGlmICh1dGlscy5pc05vZGVDb250YWluZWRCeSh0YXJnZXQsIGR5Z3JhcGguZ3JhcGhEaXYpICYmXG4gICAgICAgICF1dGlscy5pc05vZGVDb250YWluZWRCeShyZWxhdGVkVGFyZ2V0LCBkeWdyYXBoLmdyYXBoRGl2KSkge1xuICAgICAgZHlncmFwaC5tb3VzZU91dF8oZSk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuYWRkQW5kVHJhY2tFdmVudCh3aW5kb3csICdtb3VzZW91dCcsIHRoaXMubW91c2VPdXRIYW5kbGVyXyk7XG4gIHRoaXMuYWRkQW5kVHJhY2tFdmVudCh0aGlzLm1vdXNlRXZlbnRFbGVtZW50XywgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcl8pO1xuXG4gIC8vIERvbid0IHJlY3JlYXRlIGFuZCByZWdpc3RlciB0aGUgcmVzaXplIGhhbmRsZXIgb24gc3Vic2VxdWVudCBjYWxscy5cbiAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gdGhlIGdyYXBoIGlzIHJlc2l6ZWQuXG4gIGlmICghdGhpcy5yZXNpemVIYW5kbGVyXykge1xuICAgIHRoaXMucmVzaXplSGFuZGxlcl8gPSBmdW5jdGlvbihlKSB7XG4gICAgICBkeWdyYXBoLnJlc2l6ZSgpO1xuICAgIH07XG5cbiAgICAvLyBVcGRhdGUgd2hlbiB0aGUgd2luZG93IGlzIHJlc2l6ZWQuXG4gICAgLy8gVE9ETyhkYW52ayk6IGRyb3AgZnJhbWVzIGRlcGVuZGluZyBvbiBjb21wbGV4aXR5IG9mIHRoZSBjaGFydC5cbiAgICB0aGlzLmFkZEFuZFRyYWNrRXZlbnQod2luZG93LCAncmVzaXplJywgdGhpcy5yZXNpemVIYW5kbGVyXyk7XG5cbiAgICB0aGlzLnJlc2l6ZU9ic2VydmVyXyA9IG51bGw7XG4gICAgdmFyIHJlc2l6ZU1vZGUgPSB0aGlzLmdldFN0cmluZ09wdGlvbigncmVzaXphYmxlJyk7XG4gICAgaWYgKCh0eXBlb2YoUmVzaXplT2JzZXJ2ZXIpID09PSAndW5kZWZpbmVkJykgJiZcbiAgICAgICAgKHJlc2l6ZU1vZGUgIT09IFwibm9cIikpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Jlc2l6ZU9ic2VydmVyIHVuYXZhaWxhYmxlOyBpZ25vcmluZyByZXNpemFibGUgcHJvcGVydHknKTtcbiAgICAgIHJlc2l6ZU1vZGUgPSBcIm5vXCI7XG4gICAgfVxuICAgIGlmIChyZXNpemVNb2RlID09PSBcImhvcml6b250YWxcIiB8fFxuICAgICAgICByZXNpemVNb2RlID09PSBcInZlcnRpY2FsXCIgfHxcbiAgICAgICAgcmVzaXplTW9kZSA9PT0gXCJib3RoXCIpIHtcbiAgICAgIGVuY2xvc2luZy5zdHlsZS5yZXNpemUgPSByZXNpemVNb2RlO1xuICAgIH0gZWxzZSBpZiAocmVzaXplTW9kZSAhPT0gXCJwYXNzaXZlXCIpIHtcbiAgICAgIHJlc2l6ZU1vZGUgPSBcIm5vXCI7XG4gICAgfVxuICAgIGlmIChyZXNpemVNb2RlICE9PSBcIm5vXCIpIHtcbiAgICAgIGNvbnN0IG1haW5kaXZPdmVyZmxvdyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVuY2xvc2luZykub3ZlcmZsb3c7XG4gICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoZW5jbG9zaW5nKS5vdmVyZmxvdyA9PT0gJ3Zpc2libGUnKVxuICAgICAgICBlbmNsb3Npbmcuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXJfID0gbmV3IFJlc2l6ZU9ic2VydmVyKHRoaXMucmVzaXplSGFuZGxlcl8pO1xuICAgICAgdGhpcy5yZXNpemVPYnNlcnZlcl8ub2JzZXJ2ZShlbmNsb3NpbmcpO1xuICAgIH1cbiAgfVxufTtcblxuRHlncmFwaC5wcm90b3R5cGUucmVzaXplRWxlbWVudHNfID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZ3JhcGhEaXYuc3R5bGUud2lkdGggPSB0aGlzLndpZHRoXyArIFwicHhcIjtcbiAgdGhpcy5ncmFwaERpdi5zdHlsZS5oZWlnaHQgPSB0aGlzLmhlaWdodF8gKyBcInB4XCI7XG5cbiAgdmFyIHBpeGVsUmF0aW9PcHRpb24gPSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ3BpeGVsUmF0aW8nKVxuXG4gIHZhciBjYW52YXNTY2FsZSA9IHBpeGVsUmF0aW9PcHRpb24gfHwgdXRpbHMuZ2V0Q29udGV4dFBpeGVsUmF0aW8odGhpcy5jYW52YXNfY3R4Xyk7XG4gIHRoaXMuY2FudmFzXy53aWR0aCA9IHRoaXMud2lkdGhfICogY2FudmFzU2NhbGU7XG4gIHRoaXMuY2FudmFzXy5oZWlnaHQgPSB0aGlzLmhlaWdodF8gKiBjYW52YXNTY2FsZTtcbiAgdGhpcy5jYW52YXNfLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aF8gKyBcInB4XCI7ICAgIC8vIGZvciBJRVxuICB0aGlzLmNhbnZhc18uc3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHRfICsgXCJweFwiOyAgLy8gZm9yIElFXG4gIGlmIChjYW52YXNTY2FsZSAhPT0gMSkge1xuICAgIHRoaXMuY2FudmFzX2N0eF8uc2NhbGUoY2FudmFzU2NhbGUsIGNhbnZhc1NjYWxlKTtcbiAgfVxuXG4gIHZhciBoaWRkZW5TY2FsZSA9IHBpeGVsUmF0aW9PcHRpb24gfHwgdXRpbHMuZ2V0Q29udGV4dFBpeGVsUmF0aW8odGhpcy5oaWRkZW5fY3R4Xyk7XG4gIHRoaXMuaGlkZGVuXy53aWR0aCA9IHRoaXMud2lkdGhfICogaGlkZGVuU2NhbGU7XG4gIHRoaXMuaGlkZGVuXy5oZWlnaHQgPSB0aGlzLmhlaWdodF8gKiBoaWRkZW5TY2FsZTtcbiAgdGhpcy5oaWRkZW5fLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aF8gKyBcInB4XCI7ICAgIC8vIGZvciBJRVxuICB0aGlzLmhpZGRlbl8uc3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHRfICsgXCJweFwiOyAgLy8gZm9yIElFXG4gIGlmIChoaWRkZW5TY2FsZSAhPT0gMSkge1xuICAgIHRoaXMuaGlkZGVuX2N0eF8uc2NhbGUoaGlkZGVuU2NhbGUsIGhpZGRlblNjYWxlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEZXRhY2ggRE9NIGVsZW1lbnRzIGluIHRoZSBkeWdyYXBoIGFuZCBudWxsIG91dCBhbGwgZGF0YSByZWZlcmVuY2VzLlxuICogQ2FsbGluZyB0aGlzIHdoZW4geW91J3JlIGRvbmUgd2l0aCBhIGR5Z3JhcGggY2FuIGRyYW1hdGljYWxseSByZWR1Y2UgbWVtb3J5XG4gKiB1c2FnZS4gU2VlLCBlLmcuLCB0aGUgdGVzdHMvcGVyZi5odG1sIGV4YW1wbGUuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jYW52YXNfY3R4Xy5yZXN0b3JlKCk7XG4gIHRoaXMuaGlkZGVuX2N0eF8ucmVzdG9yZSgpO1xuXG4gIC8vIERlc3Ryb3kgYW55IHBsdWdpbnMsIGluIHRoZSByZXZlcnNlIG9yZGVyIHRoYXQgdGhleSB3ZXJlIHJlZ2lzdGVyZWQuXG4gIGZvciAodmFyIGkgPSB0aGlzLnBsdWdpbnNfLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIHAgPSB0aGlzLnBsdWdpbnNfLnBvcCgpO1xuICAgIGlmIChwLnBsdWdpbi5kZXN0cm95KSBwLnBsdWdpbi5kZXN0cm95KCk7XG4gIH1cblxuICB2YXIgcmVtb3ZlUmVjdXJzaXZlID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHdoaWxlIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgcmVtb3ZlUmVjdXJzaXZlKG5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMucmVtb3ZlVHJhY2tlZEV2ZW50c18oKTtcblxuICAvLyByZW1vdmUgbW91c2UgZXZlbnQgaGFuZGxlcnMgKFRoaXMgbWF5IG5vdCBiZSBuZWNlc3NhcnkgYW55bW9yZSlcbiAgdXRpbHMucmVtb3ZlRXZlbnQod2luZG93LCAnbW91c2VvdXQnLCB0aGlzLm1vdXNlT3V0SGFuZGxlcl8pO1xuICB1dGlscy5yZW1vdmVFdmVudCh0aGlzLm1vdXNlRXZlbnRFbGVtZW50XywgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcl8pO1xuXG4gIC8vIGRpc3Bvc2Ugb2YgcmVzaXppbmcgaGFuZGxlcnNcbiAgaWYgKHRoaXMucmVzaXplT2JzZXJ2ZXJfKSB7XG4gICAgdGhpcy5yZXNpemVPYnNlcnZlcl8uZGlzY29ubmVjdCgpO1xuICAgIHRoaXMucmVzaXplT2JzZXJ2ZXJfID0gbnVsbDtcbiAgfVxuICB1dGlscy5yZW1vdmVFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLnJlc2l6ZUhhbmRsZXJfKTtcbiAgdGhpcy5yZXNpemVIYW5kbGVyXyA9IG51bGw7XG5cbiAgcmVtb3ZlUmVjdXJzaXZlKHRoaXMubWFpbmRpdl8pO1xuXG4gIHZhciBudWxsT3V0ID0gZnVuY3Rpb24gbnVsbE91dChvYmopIHtcbiAgICBmb3IgKHZhciBuIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZihvYmpbbl0pID09PSAnb2JqZWN0Jykge1xuICAgICAgICBvYmpbbl0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgLy8gVGhlc2UgbWF5IG5vdCBhbGwgYmUgbmVjZXNzYXJ5LCBidXQgaXQgY2FuJ3QgaHVydC4uLlxuICBudWxsT3V0KHRoaXMubGF5b3V0Xyk7XG4gIG51bGxPdXQodGhpcy5wbG90dGVyXyk7XG4gIG51bGxPdXQodGhpcyk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGNhbnZhcyBvbiB3aGljaCB0aGUgY2hhcnQgd2lsbCBiZSBkcmF3bi4gT25seSB0aGUgUmVuZGVyZXIgZXZlclxuICogZHJhd3Mgb24gdGhpcyBwYXJ0aWN1bGFyIGNhbnZhcy4gQWxsIER5Z3JhcGggd29yayAoaS5lLiBkcmF3aW5nIGhvdmVyIGRvdHNcbiAqIG9yIHRoZSB6b29tIHJlY3RhbmdsZXMpIGlzIGRvbmUgb24gdGhpcy5jYW52YXNfLlxuICogQHBhcmFtIHtPYmplY3R9IGNhbnZhcyBUaGUgRHlncmFwaCBjYW52YXMgb3ZlciB3aGljaCB0byBvdmVybGF5IHRoZSBwbG90XG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXdseS1jcmVhdGVkIGNhbnZhc1xuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY3JlYXRlUGxvdEtpdENhbnZhc18gPSBmdW5jdGlvbihjYW52YXMpIHtcbiAgdmFyIGggPSB1dGlscy5jcmVhdGVDYW52YXMoKTtcbiAgaC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgLy8gVE9ETyhkYW52ayk6IGggc2hvdWxkIGJlIG9mZnNldCBmcm9tIGNhbnZhcy4gY2FudmFzIG5lZWRzIHRvIGluY2x1ZGVcbiAgLy8gc29tZSBleHRyYSBhcmVhIHRvIG1ha2UgaXQgZWFzaWVyIHRvIHpvb20gaW4gb24gdGhlIGZhciBsZWZ0IGFuZCBmYXJcbiAgLy8gcmlnaHQuIGggbmVlZHMgdG8gYmUgcHJlY2lzZWx5IHRoZSBwbG90IGFyZWEsIHNvIHRoYXQgY2xpcHBpbmcgb2NjdXJzLlxuICBoLnN0eWxlLnRvcCA9IGNhbnZhcy5zdHlsZS50b3A7XG4gIGguc3R5bGUubGVmdCA9IGNhbnZhcy5zdHlsZS5sZWZ0O1xuICBoLndpZHRoID0gdGhpcy53aWR0aF87XG4gIGguaGVpZ2h0ID0gdGhpcy5oZWlnaHRfO1xuICBoLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aF8gKyBcInB4XCI7ICAgIC8vIGZvciBJRVxuICBoLnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0XyArIFwicHhcIjsgIC8vIGZvciBJRVxuICByZXR1cm4gaDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvdmVybGF5IGVsZW1lbnQgdXNlZCB0byBoYW5kbGUgbW91c2UgZXZlbnRzLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgbW91c2UgZXZlbnQgZWxlbWVudC5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmNyZWF0ZU1vdXNlRXZlbnRFbGVtZW50XyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jYW52YXNfO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHNldCBvZiBkaXN0aW5jdCBjb2xvcnMgZm9yIHRoZSBkYXRhIHNlcmllcy4gVGhpcyBpcyBkb25lIHdpdGggYVxuICogY29sb3Igd2hlZWwuIFNhdHVyYXRpb24vVmFsdWUgYXJlIGN1c3RvbWl6YWJsZSwgYW5kIHRoZSBodWUgaXNcbiAqIGVxdWFsbHktc3BhY2VkIGFyb3VuZCB0aGUgY29sb3Igd2hlZWwuIElmIGEgY3VzdG9tIHNldCBvZiBjb2xvcnMgaXNcbiAqIHNwZWNpZmllZCwgdGhhdCBpcyB1c2VkIGluc3RlYWQuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5zZXRDb2xvcnNfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsYWJlbHMgPSB0aGlzLmdldExhYmVscygpO1xuICB2YXIgbnVtID0gbGFiZWxzLmxlbmd0aCAtIDE7XG4gIHRoaXMuY29sb3JzXyA9IFtdO1xuICB0aGlzLmNvbG9yc01hcF8gPSB7fTtcblxuICAvLyBUaGVzZSBhcmUgdXNlZCBmb3Igd2hlbiBubyBjdXN0b20gY29sb3JzIGFyZSBzcGVjaWZpZWQuXG4gIHZhciBzYXQgPSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ2NvbG9yU2F0dXJhdGlvbicpIHx8IDEuMDtcbiAgdmFyIHZhbCA9IHRoaXMuZ2V0TnVtZXJpY09wdGlvbignY29sb3JWYWx1ZScpIHx8IDAuNTtcbiAgdmFyIGhhbGYgPSBNYXRoLmNlaWwobnVtIC8gMik7XG5cbiAgdmFyIGNvbG9ycyA9IHRoaXMuZ2V0T3B0aW9uKCdjb2xvcnMnKTtcbiAgdmFyIHZpc2liaWxpdHkgPSB0aGlzLnZpc2liaWxpdHkoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgIGlmICghdmlzaWJpbGl0eVtpXSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHZhciBsYWJlbCA9IGxhYmVsc1tpICsgMV07XG4gICAgdmFyIGNvbG9yU3RyID0gdGhpcy5hdHRyaWJ1dGVzXy5nZXRGb3JTZXJpZXMoJ2NvbG9yJywgbGFiZWwpO1xuICAgIGlmICghY29sb3JTdHIpIHtcbiAgICAgIGlmIChjb2xvcnMpIHtcbiAgICAgICAgY29sb3JTdHIgPSBjb2xvcnNbaSAlIGNvbG9ycy5sZW5ndGhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWx0ZXJuYXRlIGNvbG9ycyBmb3IgaGlnaCBjb250cmFzdC5cbiAgICAgICAgdmFyIGlkeCA9IGkgJSAyID8gKGhhbGYgKyAoaSArIDEpLyAyKSA6IE1hdGguY2VpbCgoaSArIDEpIC8gMik7XG4gICAgICAgIHZhciBodWUgPSAoMS4wICogaWR4IC8gKDEgKyBudW0pKTtcbiAgICAgICAgY29sb3JTdHIgPSB1dGlscy5oc3ZUb1JHQihodWUsIHNhdCwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb2xvcnNfLnB1c2goY29sb3JTdHIpO1xuICAgIHRoaXMuY29sb3JzTWFwX1tsYWJlbF0gPSBjb2xvclN0cjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxpc3Qgb2YgY29sb3JzLiBUaGlzIGlzIGVpdGhlciB0aGUgbGlzdCBvZiBjb2xvcnMgcGFzc2VkIGluIHRoZVxuICogYXR0cmlidXRlcyBvciB0aGUgYXV0b2dlbmVyYXRlZCBsaXN0IG9mIHJnYihyLGcsYikgc3RyaW5ncy5cbiAqIFRoaXMgZG9lcyBub3QgcmV0dXJuIGNvbG9ycyBmb3IgaW52aXNpYmxlIHNlcmllcy5cbiAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fSBUaGUgbGlzdCBvZiBjb2xvcnMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldENvbG9ycyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jb2xvcnNfO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgZmV3IGF0dHJpYnV0ZXMgb2YgYSBzZXJpZXMsIGkuZS4gaXRzIGNvbG9yLCBpdHMgdmlzaWJpbGl0eSwgd2hpY2hcbiAqIGF4aXMgaXQncyBhc3NpZ25lZCB0bywgYW5kIGl0cyBjb2x1bW4gaW4gdGhlIG9yaWdpbmFsIGRhdGEuXG4gKiBSZXR1cm5zIG51bGwgaWYgdGhlIHNlcmllcyBkb2VzIG5vdCBleGlzdC5cbiAqIE90aGVyd2lzZSwgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBjb2x1bW4sIHZpc2liaWxpdHksIGNvbG9yIGFuZCBheGlzIHByb3BlcnRpZXMuXG4gKiBUaGUgXCJheGlzXCIgcHJvcGVydHkgd2lsbCBiZSBzZXQgdG8gMSBmb3IgeTEgYW5kIDIgZm9yIHkyLlxuICogVGhlIFwiY29sdW1uXCIgcHJvcGVydHkgY2FuIGJlIGZlZCBiYWNrIGludG8gZ2V0VmFsdWUocm93LCBjb2x1bW4pIHRvIGdldFxuICogdmFsdWVzIGZvciB0aGlzIHNlcmllcy5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0UHJvcGVydGllc0ZvclNlcmllcyA9IGZ1bmN0aW9uKHNlcmllc19uYW1lKSB7XG4gIHZhciBpZHggPSAtMTtcbiAgdmFyIGxhYmVscyA9IHRoaXMuZ2V0TGFiZWxzKCk7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGxhYmVsc1tpXSA9PSBzZXJpZXNfbmFtZSkge1xuICAgICAgaWR4ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoaWR4ID09IC0xKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IHNlcmllc19uYW1lLFxuICAgIGNvbHVtbjogaWR4LFxuICAgIHZpc2libGU6IHRoaXMudmlzaWJpbGl0eSgpW2lkeCAtIDFdLFxuICAgIGNvbG9yOiB0aGlzLmNvbG9yc01hcF9bc2VyaWVzX25hbWVdLFxuICAgIGF4aXM6IDEgKyB0aGlzLmF0dHJpYnV0ZXNfLmF4aXNGb3JTZXJpZXMoc2VyaWVzX25hbWUpXG4gIH07XG59O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgdGV4dCBib3ggdG8gYWRqdXN0IHRoZSBhdmVyYWdpbmcgcGVyaW9kXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5jcmVhdGVSb2xsSW50ZXJmYWNlXyA9IGZ1bmN0aW9uKCkge1xuICAvLyBDcmVhdGUgYSByb2xsZXIgaWYgb25lIGRvZXNuJ3QgZXhpc3QgYWxyZWFkeS5cbiAgdmFyIHJvbGxlciA9IHRoaXMucm9sbGVyXztcbiAgaWYgKCFyb2xsZXIpIHtcbiAgICB0aGlzLnJvbGxlcl8gPSByb2xsZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgcm9sbGVyLnR5cGUgPSBcInRleHRcIjtcbiAgICByb2xsZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIHJvbGxlci5jbGFzc05hbWUgPSAnZHlncmFwaC1yb2xsZXInO1xuICAgIHRoaXMuZ3JhcGhEaXYuYXBwZW5kQ2hpbGQocm9sbGVyKTtcbiAgfVxuXG4gIHZhciBkaXNwbGF5ID0gdGhpcy5nZXRCb29sZWFuT3B0aW9uKCdzaG93Um9sbGVyJykgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gIHZhciBhcmVhID0gdGhpcy5nZXRBcmVhKCk7XG4gIHZhciB0ZXh0QXR0ciA9IHtcbiAgICAgICAgICAgICAgICAgICBcInRvcFwiOiAoYXJlYS55ICsgYXJlYS5oIC0gMjUpICsgXCJweFwiLFxuICAgICAgICAgICAgICAgICAgIFwibGVmdFwiOiAoYXJlYS54ICsgMSkgKyBcInB4XCIsXG4gICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5XCI6IGRpc3BsYXlcbiAgICAgICAgICAgICAgICAgfTtcbiAgcm9sbGVyLnNpemUgPSBcIjJcIjtcbiAgcm9sbGVyLnZhbHVlID0gdGhpcy5yb2xsUGVyaW9kXztcbiAgdXRpbHMudXBkYXRlKHJvbGxlci5zdHlsZSwgdGV4dEF0dHIpO1xuXG4gIGNvbnN0IHRoYXQgPSB0aGlzO1xuICByb2xsZXIub25jaGFuZ2UgPSBmdW5jdGlvbiBvbmNoYW5nZSgpIHtcbiAgICByZXR1cm4gdGhhdC5hZGp1c3RSb2xsKHJvbGxlci52YWx1ZSk7XG4gIH07XG59O1xuXG4vKipcbiAqIFNldCB1cCBhbGwgdGhlIG1vdXNlIGhhbmRsZXJzIG5lZWRlZCB0byBjYXB0dXJlIGRyYWdnaW5nIGJlaGF2aW9yIGZvciB6b29tXG4gKiBldmVudHMuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5jcmVhdGVEcmFnSW50ZXJmYWNlXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGV4dCA9IHtcbiAgICAvLyBUcmFja3Mgd2hldGhlciB0aGUgbW91c2UgaXMgZG93biByaWdodCBub3dcbiAgICBpc1pvb21pbmc6IGZhbHNlLFxuICAgIGlzUGFubmluZzogZmFsc2UsICAvLyBpcyB0aGlzIGRyYWcgcGFydCBvZiBhIHBhbj9cbiAgICBpczJEUGFuOiBmYWxzZSwgICAgLy8gaWYgc28sIGlzIHRoYXQgcGFuIDEtIG9yIDItZGltZW5zaW9uYWw/XG4gICAgZHJhZ1N0YXJ0WDogbnVsbCwgLy8gcGl4ZWwgY29vcmRpbmF0ZXNcbiAgICBkcmFnU3RhcnRZOiBudWxsLCAvLyBwaXhlbCBjb29yZGluYXRlc1xuICAgIGRyYWdFbmRYOiBudWxsLCAvLyBwaXhlbCBjb29yZGluYXRlc1xuICAgIGRyYWdFbmRZOiBudWxsLCAvLyBwaXhlbCBjb29yZGluYXRlc1xuICAgIGRyYWdEaXJlY3Rpb246IG51bGwsXG4gICAgcHJldkVuZFg6IG51bGwsIC8vIHBpeGVsIGNvb3JkaW5hdGVzXG4gICAgcHJldkVuZFk6IG51bGwsIC8vIHBpeGVsIGNvb3JkaW5hdGVzXG4gICAgcHJldkRyYWdEaXJlY3Rpb246IG51bGwsXG4gICAgY2FuY2VsTmV4dERibGNsaWNrOiBmYWxzZSwgIC8vIHNlZSBjb21tZW50IGluIGR5Z3JhcGgtaW50ZXJhY3Rpb24tbW9kZWwuanNcblxuICAgIC8vIFRoZSB2YWx1ZSBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBncmFwaCB3aGVuIGEgcGFuIG9wZXJhdGlvbiBzdGFydHMuXG4gICAgaW5pdGlhbExlZnRtb3N0RGF0ZTogbnVsbCxcblxuICAgIC8vIFRoZSBudW1iZXIgb2YgdW5pdHMgZWFjaCBwaXhlbCBzcGFucy4gKFRoaXMgd29uJ3QgYmUgdmFsaWQgZm9yIGxvZ1xuICAgIC8vIHNjYWxlcylcbiAgICB4VW5pdHNQZXJQaXhlbDogbnVsbCxcblxuICAgIC8vIFRPRE8oZGFudmspOiB1cGRhdGUgdGhpcyBjb21tZW50XG4gICAgLy8gVGhlIHJhbmdlIGluIHNlY29uZC92YWx1ZSB1bml0cyB0aGF0IHRoZSB2aWV3cG9ydCBlbmNvbXBhc3NlcyBkdXJpbmcgYVxuICAgIC8vIHBhbm5pbmcgb3BlcmF0aW9uLlxuICAgIGRhdGVSYW5nZTogbnVsbCxcblxuICAgIC8vIFRvcC1sZWZ0IGNvcm5lciBvZiB0aGUgY2FudmFzLCBpbiBET00gY29vcmRzXG4gICAgLy8gVE9ETyhrb25pZ3NiZXJnKTogUmVuYW1lIHRvcExlZnRDYW52YXNYLCB0b3BMZWZ0Q2FudmFzWS5cbiAgICBweDogMCxcbiAgICBweTogMCxcblxuICAgIC8vIFZhbHVlcyBmb3IgdXNlIHdpdGggcGFuRWRnZUZyYWN0aW9uLCB3aGljaCBsaW1pdCBob3cgZmFyIG91dHNpZGUgdGhlXG4gICAgLy8gZ3JhcGgncyBkYXRhIGJvdW5kYXJpZXMgaXQgY2FuIGJlIHBhbm5lZC5cbiAgICBib3VuZGVkRGF0ZXM6IG51bGwsIC8vIFttaW5EYXRlLCBtYXhEYXRlXVxuICAgIGJvdW5kZWRWYWx1ZXM6IG51bGwsIC8vIFtbbWluVmFsdWUsIG1heFZhbHVlXSAuLi5dXG5cbiAgICAvLyBXZSBjb3ZlciBpZnJhbWVzIGR1cmluZyBtb3VzZSBpbnRlcmFjdGlvbnMuIFNlZSBjb21tZW50cyBpblxuICAgIC8vIGR5Z3JhcGgtdXRpbHMuanMgZm9yIG1vcmUgaW5mbyBvbiB3aHkgdGhpcyBpcyBhIGdvb2QgaWRlYS5cbiAgICB0YXJwOiBuZXcgSUZyYW1lVGFycCgpLFxuXG4gICAgLy8gY29udGV4dEIgaXMgdGhlIHNhbWUgdGhpbmcgYXMgdGhpcyBjb250ZXh0IG9iamVjdCBidXQgcmVuYW1lZC5cbiAgICBpbml0aWFsaXplTW91c2VEb3duOiBmdW5jdGlvbihldmVudCwgZywgY29udGV4dEIpIHtcbiAgICAgIC8vIHByZXZlbnRzIG1vdXNlIGRyYWdzIGZyb20gc2VsZWN0aW5nIHBhZ2UgdGV4dC5cbiAgICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAgLy8gRmlyZWZveCwgQ2hyb21lLCBldGMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlOyAgLy8gSUVcbiAgICAgICAgZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNhbnZhc1BvcyA9IHV0aWxzLmZpbmRQb3MoZy5jYW52YXNfKTtcbiAgICAgIGNvbnRleHRCLnB4ID0gY2FudmFzUG9zLng7XG4gICAgICBjb250ZXh0Qi5weSA9IGNhbnZhc1Bvcy55O1xuICAgICAgY29udGV4dEIuZHJhZ1N0YXJ0WCA9IHV0aWxzLmRyYWdHZXRYXyhldmVudCwgY29udGV4dEIpO1xuICAgICAgY29udGV4dEIuZHJhZ1N0YXJ0WSA9IHV0aWxzLmRyYWdHZXRZXyhldmVudCwgY29udGV4dEIpO1xuICAgICAgY29udGV4dEIuY2FuY2VsTmV4dERibGNsaWNrID0gZmFsc2U7XG4gICAgICBjb250ZXh0Qi50YXJwLmNvdmVyKCk7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChjb250ZXh0LmlzWm9vbWluZyB8fCBjb250ZXh0LmlzUGFubmluZykge1xuICAgICAgICBjb250ZXh0LmlzWm9vbWluZyA9IGZhbHNlO1xuICAgICAgICBjb250ZXh0LmRyYWdTdGFydFggPSBudWxsO1xuICAgICAgICBjb250ZXh0LmRyYWdTdGFydFkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29udGV4dC5pc1Bhbm5pbmcpIHtcbiAgICAgICAgY29udGV4dC5pc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgY29udGV4dC5kcmFnZ2luZ0RhdGUgPSBudWxsO1xuICAgICAgICBjb250ZXh0LmRhdGVSYW5nZSA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5heGVzXy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRlbGV0ZSBzZWxmLmF4ZXNfW2ldLmRyYWdnaW5nVmFsdWU7XG4gICAgICAgICAgZGVsZXRlIHNlbGYuYXhlc19baV0uZHJhZ1ZhbHVlUmFuZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29udGV4dC50YXJwLnVuY292ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGludGVyYWN0aW9uTW9kZWwgPSB0aGlzLmdldE9wdGlvbihcImludGVyYWN0aW9uTW9kZWxcIik7XG5cbiAgLy8gU2VsZiBpcyB0aGUgZ3JhcGguXG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBGdW5jdGlvbiB0aGF0IGJpbmRzIHRoZSBncmFwaCBhbmQgY29udGV4dCB0byB0aGUgaGFuZGxlci5cbiAgdmFyIGJpbmRIYW5kbGVyID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICAgIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgICAgaGFuZGxlcihldmVudCwgc2VsZiwgY29udGV4dCk7XG4gICAgfTtcbiAgfTtcblxuICBmb3IgKHZhciBldmVudE5hbWUgaW4gaW50ZXJhY3Rpb25Nb2RlbCkge1xuICAgIGlmICghaW50ZXJhY3Rpb25Nb2RlbC5oYXNPd25Qcm9wZXJ0eShldmVudE5hbWUpKSBjb250aW51ZTtcbiAgICB0aGlzLmFkZEFuZFRyYWNrRXZlbnQodGhpcy5tb3VzZUV2ZW50RWxlbWVudF8sIGV2ZW50TmFtZSxcbiAgICAgICAgYmluZEhhbmRsZXIoaW50ZXJhY3Rpb25Nb2RlbFtldmVudE5hbWVdKSk7XG4gIH1cblxuICAvLyBJZiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2UgYnV0dG9uIGR1cmluZyBhIGRyYWcsIGJ1dCBub3Qgb3ZlciB0aGVcbiAgLy8gY2FudmFzLCB0aGVuIGl0IGRvZXNuJ3QgY291bnQgYXMgYSB6b29taW5nIGFjdGlvbi5cbiAgaWYgKCFpbnRlcmFjdGlvbk1vZGVsLndpbGxEZXN0cm95Q29udGV4dE15c2VsZikge1xuICAgIHZhciBtb3VzZVVwSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjb250ZXh0LmRlc3Ryb3koKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGRBbmRUcmFja0V2ZW50KGRvY3VtZW50LCAnbW91c2V1cCcsIG1vdXNlVXBIYW5kbGVyKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEcmF3IGEgZ3JheSB6b29tIHJlY3RhbmdsZSBvdmVyIHRoZSBkZXNpcmVkIGFyZWEgb2YgdGhlIGNhbnZhcy4gQWxzbyBjbGVhcnNcbiAqIHVwIGFueSBwcmV2aW91cyB6b29tIHJlY3RhbmdsZXMgdGhhdCB3ZXJlIGRyYXduLiBUaGlzIGNvdWxkIGJlIG9wdGltaXplZCB0b1xuICogYXZvaWQgZXh0cmEgcmVkcmF3aW5nLCBidXQgaXQncyB0cmlja3kgdG8gYXZvaWQgaW50ZXJhY3Rpb25zIHdpdGggdGhlIHN0YXR1c1xuICogZG90cy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGlyZWN0aW9uIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHpvb20gcmVjdGFuZ2xlLiBBY2NlcHRhYmxlXG4gKiAgICAgdmFsdWVzIGFyZSB1dGlscy5IT1JJWk9OVEFMIGFuZCB1dGlscy5WRVJUSUNBTC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFggVGhlIFggcG9zaXRpb24gd2hlcmUgdGhlIGRyYWcgc3RhcnRlZCwgaW4gY2FudmFzXG4gKiAgICAgY29vcmRpbmF0ZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kWCBUaGUgY3VycmVudCBYIHBvc2l0aW9uIG9mIHRoZSBkcmFnLCBpbiBjYW52YXMgY29vcmRzLlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0WSBUaGUgWSBwb3NpdGlvbiB3aGVyZSB0aGUgZHJhZyBzdGFydGVkLCBpbiBjYW52YXNcbiAqICAgICBjb29yZGluYXRlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBlbmRZIFRoZSBjdXJyZW50IFkgcG9zaXRpb24gb2YgdGhlIGRyYWcsIGluIGNhbnZhcyBjb29yZHMuXG4gKiBAcGFyYW0ge251bWJlcn0gcHJldkRpcmVjdGlvbiB0aGUgdmFsdWUgb2YgZGlyZWN0aW9uIG9uIHRoZSBwcmV2aW91cyBjYWxsIHRvXG4gKiAgICAgdGhpcyBmdW5jdGlvbi4gVXNlZCB0byBhdm9pZCBleGNlc3MgcmVkcmF3aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gcHJldkVuZFggVGhlIHZhbHVlIG9mIGVuZFggb24gdGhlIHByZXZpb3VzIGNhbGwgdG8gdGhpc1xuICogICAgIGZ1bmN0aW9uLiBVc2VkIHRvIGF2b2lkIGV4Y2VzcyByZWRyYXdpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmV2RW5kWSBUaGUgdmFsdWUgb2YgZW5kWSBvbiB0aGUgcHJldmlvdXMgY2FsbCB0byB0aGlzXG4gKiAgICAgZnVuY3Rpb24uIFVzZWQgdG8gYXZvaWQgZXhjZXNzIHJlZHJhd2luZ1xuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZHJhd1pvb21SZWN0XyA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgc3RhcnRYLCBlbmRYLCBzdGFydFksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kWSwgcHJldkRpcmVjdGlvbiwgcHJldkVuZFgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldkVuZFkpIHtcbiAgdmFyIGN0eCA9IHRoaXMuY2FudmFzX2N0eF87XG5cbiAgLy8gQ2xlYW4gdXAgZnJvbSB0aGUgcHJldmlvdXMgcmVjdCBpZiBuZWNlc3NhcnlcbiAgaWYgKHByZXZEaXJlY3Rpb24gPT0gdXRpbHMuSE9SSVpPTlRBTCkge1xuICAgIGN0eC5jbGVhclJlY3QoTWF0aC5taW4oc3RhcnRYLCBwcmV2RW5kWCksIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLnksXG4gICAgICAgICAgICAgICAgICBNYXRoLmFicyhzdGFydFggLSBwcmV2RW5kWCksIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLmgpO1xuICB9IGVsc2UgaWYgKHByZXZEaXJlY3Rpb24gPT0gdXRpbHMuVkVSVElDQUwpIHtcbiAgICBjdHguY2xlYXJSZWN0KHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLngsIE1hdGgubWluKHN0YXJ0WSwgcHJldkVuZFkpLFxuICAgICAgICAgICAgICAgICAgdGhpcy5sYXlvdXRfLmdldFBsb3RBcmVhKCkudywgTWF0aC5hYnMoc3RhcnRZIC0gcHJldkVuZFkpKTtcbiAgfVxuXG4gIC8vIERyYXcgYSBsaWdodC1ncmV5IHJlY3RhbmdsZSB0byBzaG93IHRoZSBuZXcgdmlld2luZyBhcmVhXG4gIGlmIChkaXJlY3Rpb24gPT0gdXRpbHMuSE9SSVpPTlRBTCkge1xuICAgIGlmIChlbmRYICYmIHN0YXJ0WCkge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgxMjgsMTI4LDEyOCwwLjMzKVwiO1xuICAgICAgY3R4LmZpbGxSZWN0KE1hdGgubWluKHN0YXJ0WCwgZW5kWCksIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLnksXG4gICAgICAgICAgICAgICAgICAgTWF0aC5hYnMoZW5kWCAtIHN0YXJ0WCksIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLmgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gdXRpbHMuVkVSVElDQUwpIHtcbiAgICBpZiAoZW5kWSAmJiBzdGFydFkpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMTI4LDEyOCwxMjgsMC4zMylcIjtcbiAgICAgIGN0eC5maWxsUmVjdCh0aGlzLmxheW91dF8uZ2V0UGxvdEFyZWEoKS54LCBNYXRoLm1pbihzdGFydFksIGVuZFkpLFxuICAgICAgICAgICAgICAgICAgIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLncsIE1hdGguYWJzKGVuZFkgLSBzdGFydFkpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ2xlYXIgdGhlIHpvb20gcmVjdGFuZ2xlIChhbmQgcGVyZm9ybSBubyB6b29tKS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmNsZWFyWm9vbVJlY3RfID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY3VycmVudFpvb21SZWN0QXJnc18gPSBudWxsO1xuICB0aGlzLmNhbnZhc19jdHhfLmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoXywgdGhpcy5oZWlnaHRfKTtcbn07XG5cbi8qKlxuICogWm9vbSB0byBzb21ldGhpbmcgY29udGFpbmluZyBbbG93WCwgaGlnaFhdLiBUaGVzZSBhcmUgcGl4ZWwgY29vcmRpbmF0ZXMgaW5cbiAqIHRoZSBjYW52YXMuIFRoZSBleGFjdCB6b29tIHdpbmRvdyBtYXkgYmUgc2xpZ2h0bHkgbGFyZ2VyIGlmIHRoZXJlIGFyZSBubyBkYXRhXG4gKiBwb2ludHMgbmVhciBsb3dYIG9yIGhpZ2hYLiBEb24ndCBjb25mdXNlIHRoaXMgZnVuY3Rpb24gd2l0aCBkb1pvb21YRGF0ZXMsXG4gKiB3aGljaCBhY2NlcHRzIGRhdGVzIHRoYXQgbWF0Y2ggdGhlIHJhdyBkYXRhLiBUaGlzIGZ1bmN0aW9uIHJlZHJhd3MgdGhlIGdyYXBoLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsb3dYIFRoZSBsZWZ0bW9zdCBwaXhlbCB2YWx1ZSB0aGF0IHNob3VsZCBiZSB2aXNpYmxlLlxuICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hYIFRoZSByaWdodG1vc3QgcGl4ZWwgdmFsdWUgdGhhdCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmRvWm9vbVhfID0gZnVuY3Rpb24obG93WCwgaGlnaFgpIHtcbiAgdGhpcy5jdXJyZW50Wm9vbVJlY3RBcmdzXyA9IG51bGw7XG4gIC8vIEZpbmQgdGhlIGVhcmxpZXN0IGFuZCBsYXRlc3QgZGF0ZXMgY29udGFpbmVkIGluIHRoaXMgY2FudmFzeCByYW5nZS5cbiAgLy8gQ29udmVydCB0aGUgY2FsbCB0byBkYXRlIHJhbmdlcyBvZiB0aGUgcmF3IGRhdGEuXG4gIHZhciBtaW5EYXRlID0gdGhpcy50b0RhdGFYQ29vcmQobG93WCk7XG4gIHZhciBtYXhEYXRlID0gdGhpcy50b0RhdGFYQ29vcmQoaGlnaFgpO1xuICB0aGlzLmRvWm9vbVhEYXRlc18obWluRGF0ZSwgbWF4RGF0ZSk7XG59O1xuXG4vKipcbiAqIFpvb20gdG8gc29tZXRoaW5nIGNvbnRhaW5pbmcgW21pbkRhdGUsIG1heERhdGVdIHZhbHVlcy4gRG9uJ3QgY29uZnVzZSB0aGlzXG4gKiBtZXRob2Qgd2l0aCBkb1pvb21YIHdoaWNoIGFjY2VwdHMgcGl4ZWwgY29vcmRpbmF0ZXMuIFRoaXMgZnVuY3Rpb24gcmVkcmF3c1xuICogdGhlIGdyYXBoLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaW5EYXRlIFRoZSBtaW5pbXVtIGRhdGUgdGhhdCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBtYXhEYXRlIFRoZSBtYXhpbXVtIGRhdGUgdGhhdCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmRvWm9vbVhEYXRlc18gPSBmdW5jdGlvbihtaW5EYXRlLCBtYXhEYXRlKSB7XG4gIC8vIFRPRE8oZGFudmspOiB3aGVuIHhBeGlzUmFuZ2UgaXMgbnVsbCAoaS5lLiBcImZpdCB0byBkYXRhXCIsIHRoZSBhbmltYXRpb25cbiAgLy8gY2FuIHByb2R1Y2Ugc3RyYW5nZSBlZmZlY3RzLiBSYXRoZXIgdGhhbiB0aGUgeC1heGlzIHRyYW5zaXRpb25pbmcgc2xvd2x5XG4gIC8vIGJldHdlZW4gdmFsdWVzLCBpdCBjYW4gamVyayBhcm91bmQuKVxuICB2YXIgb2xkX3dpbmRvdyA9IHRoaXMueEF4aXNSYW5nZSgpO1xuICB2YXIgbmV3X3dpbmRvdyA9IFttaW5EYXRlLCBtYXhEYXRlXTtcbiAgY29uc3Qgem9vbUNhbGxiYWNrID0gdGhpcy5nZXRGdW5jdGlvbk9wdGlvbignem9vbUNhbGxiYWNrJyk7XG4gIGNvbnN0IHRoYXQgPSB0aGlzO1xuICB0aGlzLmRvQW5pbWF0ZWRab29tKG9sZF93aW5kb3csIG5ld193aW5kb3csIG51bGwsIG51bGwsIGZ1bmN0aW9uIGFuaW1hdGVkWm9vbUNhbGxiYWNrKCkge1xuICAgIGlmICh6b29tQ2FsbGJhY2spIHtcbiAgICAgIHpvb21DYWxsYmFjay5jYWxsKHRoYXQsIG1pbkRhdGUsIG1heERhdGUsIHRoYXQueUF4aXNSYW5nZXMoKSk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogWm9vbSB0byBzb21ldGhpbmcgY29udGFpbmluZyBbbG93WSwgaGlnaFldLiBUaGVzZSBhcmUgcGl4ZWwgY29vcmRpbmF0ZXMgaW5cbiAqIHRoZSBjYW52YXMuIFRoaXMgZnVuY3Rpb24gcmVkcmF3cyB0aGUgZ3JhcGguXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGxvd1kgVGhlIHRvcG1vc3QgcGl4ZWwgdmFsdWUgdGhhdCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoWSBUaGUgbG93ZXN0IHBpeGVsIHZhbHVlIHRoYXQgc2hvdWxkIGJlIHZpc2libGUuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5kb1pvb21ZXyA9IGZ1bmN0aW9uKGxvd1ksIGhpZ2hZKSB7XG4gIHRoaXMuY3VycmVudFpvb21SZWN0QXJnc18gPSBudWxsO1xuICAvLyBGaW5kIHRoZSBoaWdoZXN0IGFuZCBsb3dlc3QgdmFsdWVzIGluIHBpeGVsIHJhbmdlIGZvciBlYWNoIGF4aXMuXG4gIC8vIE5vdGUgdGhhdCBsb3dZIChpbiBwaXhlbHMpIGNvcnJlc3BvbmRzIHRvIHRoZSBtYXggVmFsdWUgKGluIGRhdGEgY29vcmRzKS5cbiAgLy8gVGhpcyBpcyBiZWNhdXNlIHBpeGVscyBpbmNyZWFzZSBhcyB5b3UgZ28gZG93biBvbiB0aGUgc2NyZWVuLCB3aGVyZWFzIGRhdGFcbiAgLy8gY29vcmRpbmF0ZXMgaW5jcmVhc2UgYXMgeW91IGdvIHVwIHRoZSBzY3JlZW4uXG4gIHZhciBvbGRWYWx1ZVJhbmdlcyA9IHRoaXMueUF4aXNSYW5nZXMoKTtcbiAgdmFyIG5ld1ZhbHVlUmFuZ2VzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5heGVzXy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBoaSA9IHRoaXMudG9EYXRhWUNvb3JkKGxvd1ksIGkpO1xuICAgIHZhciBsb3cgPSB0aGlzLnRvRGF0YVlDb29yZChoaWdoWSwgaSk7XG4gICAgbmV3VmFsdWVSYW5nZXMucHVzaChbbG93LCBoaV0pO1xuICB9XG5cbiAgY29uc3Qgem9vbUNhbGxiYWNrID0gdGhpcy5nZXRGdW5jdGlvbk9wdGlvbignem9vbUNhbGxiYWNrJyk7XG4gIGNvbnN0IHRoYXQgPSB0aGlzO1xuICB0aGlzLmRvQW5pbWF0ZWRab29tKG51bGwsIG51bGwsIG9sZFZhbHVlUmFuZ2VzLCBuZXdWYWx1ZVJhbmdlcywgZnVuY3Rpb24gYW5pbWF0ZWRab29tQ2FsbGJhY2soKSB7XG4gICAgaWYgKHpvb21DYWxsYmFjaykge1xuICAgICAgY29uc3QgW21pblgsIG1heFhdID0gdGhhdC54QXhpc1JhbmdlKCk7XG4gICAgICB6b29tQ2FsbGJhY2suY2FsbCh0aGF0LCBtaW5YLCBtYXhYLCB0aGF0LnlBeGlzUmFuZ2VzKCkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIFRyYW5zaXRpb24gZnVuY3Rpb24gdG8gdXNlIGluIGFuaW1hdGlvbnMuIFJldHVybnMgdmFsdWVzIGJldHdlZW4gMC4wXG4gKiAodG90YWxseSBvbGQgdmFsdWVzKSBhbmQgMS4wICh0b3RhbGx5IG5ldyB2YWx1ZXMpIGZvciBlYWNoIGZyYW1lLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC56b29tQW5pbWF0aW9uRnVuY3Rpb24gPSBmdW5jdGlvbihmcmFtZSwgbnVtRnJhbWVzKSB7XG4gIHZhciBrID0gMS41O1xuICByZXR1cm4gKDEuMCAtIE1hdGgucG93KGssIC1mcmFtZSkpIC8gKDEuMCAtIE1hdGgucG93KGssIC1udW1GcmFtZXMpKTtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIHpvb20gdG8gdGhlIG9yaWdpbmFsIHZpZXcgY29vcmRpbmF0ZXMuIFRoaXMgaXMgdGhlIHNhbWUgYXNcbiAqIGRvdWJsZS1jbGlja2luZyBvbiB0aGUgZ3JhcGguXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnJlc2V0Wm9vbSA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBkaXJ0eVggPSB0aGlzLmlzWm9vbWVkKCd4Jyk7XG4gIGNvbnN0IGRpcnR5WSA9IHRoaXMuaXNab29tZWQoJ3knKTtcbiAgY29uc3QgZGlydHkgPSBkaXJ0eVggfHwgZGlydHlZO1xuXG4gIC8vIENsZWFyIGFueSBzZWxlY3Rpb24sIHNpbmNlIGl0J3MgbGlrZWx5IHRvIGJlIGRyYXduIGluIHRoZSB3cm9uZyBwbGFjZS5cbiAgdGhpcy5jbGVhclNlbGVjdGlvbigpO1xuXG4gIGlmICghZGlydHkpIHJldHVybjtcblxuICAvLyBDYWxjdWxhdGUgZXh0cmVtZXMgdG8gYXZvaWQgbGFjayBvZiBwYWRkaW5nIG9uIHJlc2V0LlxuICBjb25zdCBbbWluRGF0ZSwgbWF4RGF0ZV0gPSB0aGlzLnhBeGlzRXh0cmVtZXMoKTtcblxuICBjb25zdCBhbmltYXRlZFpvb21zID0gdGhpcy5nZXRCb29sZWFuT3B0aW9uKCdhbmltYXRlZFpvb21zJyk7XG4gIGNvbnN0IHpvb21DYWxsYmFjayA9IHRoaXMuZ2V0RnVuY3Rpb25PcHRpb24oJ3pvb21DYWxsYmFjaycpO1xuXG4gIC8vIFRPRE8oZGFudmspOiBtZXJnZSB0aGlzIGJsb2NrIHcvIHRoZSBjb2RlIGJlbG93LlxuICAvLyBUT0RPKGRhbnZrKTogZmFjdG9yIG91dCBhIGdlbmVyaWMsIHB1YmxpYyB6b29tVG8gbWV0aG9kLlxuICBpZiAoIWFuaW1hdGVkWm9vbXMpIHtcbiAgICB0aGlzLmRhdGVXaW5kb3dfID0gbnVsbDtcbiAgICB0aGlzLmF4ZXNfLmZvckVhY2goYXhpcyA9PiB7XG4gICAgICBpZiAoYXhpcy52YWx1ZVJhbmdlKSBkZWxldGUgYXhpcy52YWx1ZVJhbmdlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kcmF3R3JhcGhfKCk7XG4gICAgaWYgKHpvb21DYWxsYmFjaykge1xuICAgICAgem9vbUNhbGxiYWNrLmNhbGwodGhpcywgbWluRGF0ZSwgbWF4RGF0ZSwgdGhpcy55QXhpc1JhbmdlcygpKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG9sZFdpbmRvdz1udWxsLCBuZXdXaW5kb3c9bnVsbCwgb2xkVmFsdWVSYW5nZXM9bnVsbCwgbmV3VmFsdWVSYW5nZXM9bnVsbDtcbiAgaWYgKGRpcnR5WCkge1xuICAgIG9sZFdpbmRvdyA9IHRoaXMueEF4aXNSYW5nZSgpO1xuICAgIG5ld1dpbmRvdyA9IFttaW5EYXRlLCBtYXhEYXRlXTtcbiAgfVxuXG4gIGlmIChkaXJ0eVkpIHtcbiAgICBvbGRWYWx1ZVJhbmdlcyA9IHRoaXMueUF4aXNSYW5nZXMoKTtcbiAgICBuZXdWYWx1ZVJhbmdlcyA9IHRoaXMueUF4aXNFeHRyZW1lcygpO1xuICB9XG5cbiAgY29uc3QgdGhhdCA9IHRoaXM7XG4gIHRoaXMuZG9BbmltYXRlZFpvb20ob2xkV2luZG93LCBuZXdXaW5kb3csIG9sZFZhbHVlUmFuZ2VzLCBuZXdWYWx1ZVJhbmdlcyxcbiAgICAgIGZ1bmN0aW9uIGFuaW1hdGVkWm9vbUNhbGxiYWNrKCkge1xuICAgICAgICB0aGF0LmRhdGVXaW5kb3dfID0gbnVsbDtcbiAgICAgICAgdGhhdC5heGVzXy5mb3JFYWNoKGF4aXMgPT4ge1xuICAgICAgICAgIGlmIChheGlzLnZhbHVlUmFuZ2UpIGRlbGV0ZSBheGlzLnZhbHVlUmFuZ2U7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoem9vbUNhbGxiYWNrKSB7XG4gICAgICAgICAgem9vbUNhbGxiYWNrLmNhbGwodGhhdCwgbWluRGF0ZSwgbWF4RGF0ZSwgdGhhdC55QXhpc1JhbmdlcygpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG59O1xuXG4vKipcbiAqIENvbWJpbmVkIGFuaW1hdGlvbiBsb2dpYyBmb3IgYWxsIHpvb20gZnVuY3Rpb25zLlxuICogZWl0aGVyIHRoZSB4IHBhcmFtZXRlcnMgb3IgeSBwYXJhbWV0ZXJzIG1heSBiZSBudWxsLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZG9BbmltYXRlZFpvb20gPSBmdW5jdGlvbihvbGRYUmFuZ2UsIG5ld1hSYW5nZSwgb2xkWVJhbmdlcywgbmV3WVJhbmdlcywgY2FsbGJhY2spIHtcbiAgdmFyIHN0ZXBzID0gdGhpcy5nZXRCb29sZWFuT3B0aW9uKFwiYW5pbWF0ZWRab29tc1wiKSA/XG4gICAgICBEeWdyYXBoLkFOSU1BVElPTl9TVEVQUyA6IDE7XG5cbiAgdmFyIHdpbmRvd3MgPSBbXTtcbiAgdmFyIHZhbHVlUmFuZ2VzID0gW107XG4gIHZhciBzdGVwLCBmcmFjO1xuXG4gIGlmIChvbGRYUmFuZ2UgIT09IG51bGwgJiYgbmV3WFJhbmdlICE9PSBudWxsKSB7XG4gICAgZm9yIChzdGVwID0gMTsgc3RlcCA8PSBzdGVwczsgc3RlcCsrKSB7XG4gICAgICBmcmFjID0gRHlncmFwaC56b29tQW5pbWF0aW9uRnVuY3Rpb24oc3RlcCwgc3RlcHMpO1xuICAgICAgd2luZG93c1tzdGVwLTFdID0gW29sZFhSYW5nZVswXSooMS1mcmFjKSArIGZyYWMqbmV3WFJhbmdlWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFhSYW5nZVsxXSooMS1mcmFjKSArIGZyYWMqbmV3WFJhbmdlWzFdXTtcbiAgICB9XG4gIH1cblxuICBpZiAob2xkWVJhbmdlcyAhPT0gbnVsbCAmJiBuZXdZUmFuZ2VzICE9PSBudWxsKSB7XG4gICAgZm9yIChzdGVwID0gMTsgc3RlcCA8PSBzdGVwczsgc3RlcCsrKSB7XG4gICAgICBmcmFjID0gRHlncmFwaC56b29tQW5pbWF0aW9uRnVuY3Rpb24oc3RlcCwgc3RlcHMpO1xuICAgICAgdmFyIHRoaXNSYW5nZSA9IFtdO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmF4ZXNfLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHRoaXNSYW5nZS5wdXNoKFtvbGRZUmFuZ2VzW2pdWzBdKigxLWZyYWMpICsgZnJhYypuZXdZUmFuZ2VzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkWVJhbmdlc1tqXVsxXSooMS1mcmFjKSArIGZyYWMqbmV3WVJhbmdlc1tqXVsxXV0pO1xuICAgICAgfVxuICAgICAgdmFsdWVSYW5nZXNbc3RlcC0xXSA9IHRoaXNSYW5nZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0aGF0ID0gdGhpcztcbiAgdXRpbHMucmVwZWF0QW5kQ2xlYW51cChmdW5jdGlvbiAoc3RlcCkge1xuICAgIGlmICh2YWx1ZVJhbmdlcy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhhdC5heGVzXy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdyA9IHZhbHVlUmFuZ2VzW3N0ZXBdW2ldO1xuICAgICAgICB0aGF0LmF4ZXNfW2ldLnZhbHVlUmFuZ2UgPSBbd1swXSwgd1sxXV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh3aW5kb3dzLmxlbmd0aCkge1xuICAgICAgdGhhdC5kYXRlV2luZG93XyA9IHdpbmRvd3Nbc3RlcF07XG4gICAgfVxuICAgIHRoYXQuZHJhd0dyYXBoXygpO1xuICB9LCBzdGVwcywgRHlncmFwaC5BTklNQVRJT05fRFVSQVRJT04gLyBzdGVwcywgY2FsbGJhY2spO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgZ3JhcGgncyBhcmVhIG9iamVjdC5cbiAqXG4gKiBSZXR1cm5zOiB7eCwgeSwgdywgaH1cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0QXJlYSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5wbG90dGVyXy5hcmVhO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IGEgbW91c2UgZXZlbnQgdG8gRE9NIGNvb3JkaW5hdGVzIHJlbGF0aXZlIHRvIHRoZSBncmFwaCBvcmlnaW4uXG4gKlxuICogUmV0dXJucyBhIHR3by1lbGVtZW50IGFycmF5OiBbWCwgWV0uXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmV2ZW50VG9Eb21Db29yZHMgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoZXZlbnQub2Zmc2V0WCAmJiBldmVudC5vZmZzZXRZKSB7XG4gICAgcmV0dXJuIFsgZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WSBdO1xuICB9IGVsc2Uge1xuICAgIHZhciBldmVudEVsZW1lbnRQb3MgPSB1dGlscy5maW5kUG9zKHRoaXMubW91c2VFdmVudEVsZW1lbnRfKTtcbiAgICB2YXIgY2FudmFzeCA9IHV0aWxzLnBhZ2VYKGV2ZW50KSAtIGV2ZW50RWxlbWVudFBvcy54O1xuICAgIHZhciBjYW52YXN5ID0gdXRpbHMucGFnZVkoZXZlbnQpIC0gZXZlbnRFbGVtZW50UG9zLnk7XG4gICAgcmV0dXJuIFtjYW52YXN4LCBjYW52YXN5XTtcbiAgfVxufTtcblxuLyoqXG4gKiBHaXZlbiBhIGNhbnZhcyBYIGNvb3JkaW5hdGUsIGZpbmQgdGhlIGNsb3Nlc3Qgcm93LlxuICogQHBhcmFtIHtudW1iZXJ9IGRvbVggZ3JhcGgtcmVsYXRpdmUgRE9NIFggY29vcmRpbmF0ZVxuICogUmV0dXJucyB7bnVtYmVyfSByb3cgbnVtYmVyLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZmluZENsb3Nlc3RSb3cgPSBmdW5jdGlvbihkb21YKSB7XG4gIHZhciBtaW5EaXN0WCA9IEluZmluaXR5O1xuICB2YXIgY2xvc2VzdFJvdyA9IC0xO1xuICB2YXIgc2V0cyA9IHRoaXMubGF5b3V0Xy5wb2ludHM7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwb2ludHMgPSBzZXRzW2ldO1xuICAgIHZhciBsZW4gPSBwb2ludHMubGVuZ3RoO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBwb2ludCA9IHBvaW50c1tqXTtcbiAgICAgIGlmICghdXRpbHMuaXNWYWxpZFBvaW50KHBvaW50LCB0cnVlKSkgY29udGludWU7XG4gICAgICB2YXIgZGlzdCA9IE1hdGguYWJzKHBvaW50LmNhbnZhc3ggLSBkb21YKTtcbiAgICAgIGlmIChkaXN0IDwgbWluRGlzdFgpIHtcbiAgICAgICAgbWluRGlzdFggPSBkaXN0O1xuICAgICAgICBjbG9zZXN0Um93ID0gcG9pbnQuaWR4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjbG9zZXN0Um93O1xufTtcblxuLyoqXG4gKiBHaXZlbiBjYW52YXMgWCxZIGNvb3JkaW5hdGVzLCBmaW5kIHRoZSBjbG9zZXN0IHBvaW50LlxuICpcbiAqIFRoaXMgZmluZHMgdGhlIGluZGl2aWR1YWwgZGF0YSBwb2ludCBhY3Jvc3MgYWxsIHZpc2libGUgc2VyaWVzXG4gKiB0aGF0J3MgY2xvc2VzdCB0byB0aGUgc3VwcGxpZWQgRE9NIGNvb3JkaW5hdGVzIHVzaW5nIHRoZSBzdGFuZGFyZFxuICogRXVjbGlkZWFuIFgsWSBkaXN0YW5jZS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZG9tWCBncmFwaC1yZWxhdGl2ZSBET00gWCBjb29yZGluYXRlXG4gKiBAcGFyYW0ge251bWJlcn0gZG9tWSBncmFwaC1yZWxhdGl2ZSBET00gWSBjb29yZGluYXRlXG4gKiBSZXR1cm5zOiB7cm93LCBzZXJpZXNOYW1lLCBwb2ludH1cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmZpbmRDbG9zZXN0UG9pbnQgPSBmdW5jdGlvbihkb21YLCBkb21ZKSB7XG4gIHZhciBtaW5EaXN0ID0gSW5maW5pdHk7XG4gIHZhciBkaXN0LCBkeCwgZHksIHBvaW50LCBjbG9zZXN0UG9pbnQsIGNsb3Nlc3RTZXJpZXMsIGNsb3Nlc3RSb3c7XG4gIGZvciAoIHZhciBzZXRJZHggPSB0aGlzLmxheW91dF8ucG9pbnRzLmxlbmd0aCAtIDEgOyBzZXRJZHggPj0gMCA7IC0tc2V0SWR4ICkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmxheW91dF8ucG9pbnRzW3NldElkeF07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHBvaW50ID0gcG9pbnRzW2ldO1xuICAgICAgaWYgKCF1dGlscy5pc1ZhbGlkUG9pbnQocG9pbnQpKSBjb250aW51ZTtcbiAgICAgIGR4ID0gcG9pbnQuY2FudmFzeCAtIGRvbVg7XG4gICAgICBkeSA9IHBvaW50LmNhbnZhc3kgLSBkb21ZO1xuICAgICAgZGlzdCA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgICAgaWYgKGRpc3QgPCBtaW5EaXN0KSB7XG4gICAgICAgIG1pbkRpc3QgPSBkaXN0O1xuICAgICAgICBjbG9zZXN0UG9pbnQgPSBwb2ludDtcbiAgICAgICAgY2xvc2VzdFNlcmllcyA9IHNldElkeDtcbiAgICAgICAgY2xvc2VzdFJvdyA9IHBvaW50LmlkeDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdmFyIG5hbWUgPSB0aGlzLmxheW91dF8uc2V0TmFtZXNbY2xvc2VzdFNlcmllc107XG4gIHJldHVybiB7XG4gICAgcm93OiBjbG9zZXN0Um93LFxuICAgIHNlcmllc05hbWU6IG5hbWUsXG4gICAgcG9pbnQ6IGNsb3Nlc3RQb2ludFxuICB9O1xufTtcblxuLyoqXG4gKiBHaXZlbiBjYW52YXMgWCxZIGNvb3JkaW5hdGVzLCBmaW5kIHRoZSB0b3VjaGVkIGFyZWEgaW4gYSBzdGFja2VkIGdyYXBoLlxuICpcbiAqIFRoaXMgZmlyc3QgZmluZHMgdGhlIFggZGF0YSBwb2ludCBjbG9zZXN0IHRvIHRoZSBzdXBwbGllZCBET00gWCBjb29yZGluYXRlLFxuICogdGhlbiBmaW5kcyB0aGUgc2VyaWVzIHdoaWNoIHB1dHMgdGhlIFkgY29vcmRpbmF0ZSBvbiB0b3Agb2YgaXRzIGZpbGxlZCBhcmVhLFxuICogdXNpbmcgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiBhZGphY2VudCBwb2ludCBwYWlycy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZG9tWCBncmFwaC1yZWxhdGl2ZSBET00gWCBjb29yZGluYXRlXG4gKiBAcGFyYW0ge251bWJlcn0gZG9tWSBncmFwaC1yZWxhdGl2ZSBET00gWSBjb29yZGluYXRlXG4gKiBSZXR1cm5zOiB7cm93LCBzZXJpZXNOYW1lLCBwb2ludH1cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmZpbmRTdGFja2VkUG9pbnQgPSBmdW5jdGlvbihkb21YLCBkb21ZKSB7XG4gIHZhciByb3cgPSB0aGlzLmZpbmRDbG9zZXN0Um93KGRvbVgpO1xuICB2YXIgY2xvc2VzdFBvaW50LCBjbG9zZXN0U2VyaWVzO1xuICBmb3IgKHZhciBzZXRJZHggPSAwOyBzZXRJZHggPCB0aGlzLmxheW91dF8ucG9pbnRzLmxlbmd0aDsgKytzZXRJZHgpIHtcbiAgICB2YXIgYm91bmRhcnkgPSB0aGlzLmdldExlZnRCb3VuZGFyeV8oc2V0SWR4KTtcbiAgICB2YXIgcm93SWR4ID0gcm93IC0gYm91bmRhcnk7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMubGF5b3V0Xy5wb2ludHNbc2V0SWR4XTtcbiAgICBpZiAocm93SWR4ID49IHBvaW50cy5sZW5ndGgpIGNvbnRpbnVlO1xuICAgIHZhciBwMSA9IHBvaW50c1tyb3dJZHhdO1xuICAgIGlmICghdXRpbHMuaXNWYWxpZFBvaW50KHAxKSkgY29udGludWU7XG4gICAgdmFyIHB5ID0gcDEuY2FudmFzeTtcbiAgICBpZiAoZG9tWCA+IHAxLmNhbnZhc3ggJiYgcm93SWR4ICsgMSA8IHBvaW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGludGVycG9sYXRlIHNlcmllcyBZIHZhbHVlIHVzaW5nIG5leHQgcG9pbnRcbiAgICAgIHZhciBwMiA9IHBvaW50c1tyb3dJZHggKyAxXTtcbiAgICAgIGlmICh1dGlscy5pc1ZhbGlkUG9pbnQocDIpKSB7XG4gICAgICAgIHZhciBkeCA9IHAyLmNhbnZhc3ggLSBwMS5jYW52YXN4O1xuICAgICAgICBpZiAoZHggPiAwKSB7XG4gICAgICAgICAgdmFyIHIgPSAoZG9tWCAtIHAxLmNhbnZhc3gpIC8gZHg7XG4gICAgICAgICAgcHkgKz0gciAqIChwMi5jYW52YXN5IC0gcDEuY2FudmFzeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRvbVggPCBwMS5jYW52YXN4ICYmIHJvd0lkeCA+IDApIHtcbiAgICAgIC8vIGludGVycG9sYXRlIHNlcmllcyBZIHZhbHVlIHVzaW5nIHByZXZpb3VzIHBvaW50XG4gICAgICB2YXIgcDAgPSBwb2ludHNbcm93SWR4IC0gMV07XG4gICAgICBpZiAodXRpbHMuaXNWYWxpZFBvaW50KHAwKSkge1xuICAgICAgICB2YXIgZHggPSBwMS5jYW52YXN4IC0gcDAuY2FudmFzeDtcbiAgICAgICAgaWYgKGR4ID4gMCkge1xuICAgICAgICAgIHZhciByID0gKHAxLmNhbnZhc3ggLSBkb21YKSAvIGR4O1xuICAgICAgICAgIHB5ICs9IHIgKiAocDAuY2FudmFzeSAtIHAxLmNhbnZhc3kpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFN0b3AgaWYgdGhlIHBvaW50IChkb21YLCBweSkgaXMgYWJvdmUgdGhpcyBzZXJpZXMnIHVwcGVyIGVkZ2VcbiAgICBpZiAoc2V0SWR4ID09PSAwIHx8IHB5IDwgZG9tWSkge1xuICAgICAgY2xvc2VzdFBvaW50ID0gcDE7XG4gICAgICBjbG9zZXN0U2VyaWVzID0gc2V0SWR4O1xuICAgIH1cbiAgfVxuICB2YXIgbmFtZSA9IHRoaXMubGF5b3V0Xy5zZXROYW1lc1tjbG9zZXN0U2VyaWVzXTtcbiAgcmV0dXJuIHtcbiAgICByb3c6IHJvdyxcbiAgICBzZXJpZXNOYW1lOiBuYW1lLFxuICAgIHBvaW50OiBjbG9zZXN0UG9pbnRcbiAgfTtcbn07XG5cbi8qKlxuICogV2hlbiB0aGUgbW91c2UgbW92ZXMgaW4gdGhlIGNhbnZhcywgZGlzcGxheSBpbmZvcm1hdGlvbiBhYm91dCBhIG5lYXJieSBkYXRhXG4gKiBwb2ludCBhbmQgZHJhdyBkb3RzIG92ZXIgdGhvc2UgcG9pbnRzIGluIHRoZSBkYXRhIHNlcmllcy4gVGhpcyBmdW5jdGlvblxuICogdGFrZXMgY2FyZSBvZiBjbGVhbnVwIG9mIHByZXZpb3VzbHktZHJhd24gZG90cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBUaGUgbW91c2Vtb3ZlIGV2ZW50IGZyb20gdGhlIGJyb3dzZXIuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5tb3VzZU1vdmVfID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgLy8gVGhpcyBwcmV2ZW50cyBKUyBlcnJvcnMgd2hlbiBtb3VzaW5nIG92ZXIgdGhlIGNhbnZhcyBiZWZvcmUgZGF0YSBsb2Fkcy5cbiAgdmFyIHBvaW50cyA9IHRoaXMubGF5b3V0Xy5wb2ludHM7XG4gIGlmIChwb2ludHMgPT09IHVuZGVmaW5lZCB8fCBwb2ludHMgPT09IG51bGwpIHJldHVybjtcblxuICB2YXIgY2FudmFzQ29vcmRzID0gdGhpcy5ldmVudFRvRG9tQ29vcmRzKGV2ZW50KTtcbiAgdmFyIGNhbnZhc3ggPSBjYW52YXNDb29yZHNbMF07XG4gIHZhciBjYW52YXN5ID0gY2FudmFzQ29vcmRzWzFdO1xuXG4gIHZhciBoaWdobGlnaHRTZXJpZXNPcHRzID0gdGhpcy5nZXRPcHRpb24oXCJoaWdobGlnaHRTZXJpZXNPcHRzXCIpO1xuICB2YXIgc2VsZWN0aW9uQ2hhbmdlZCA9IGZhbHNlO1xuICBpZiAoaGlnaGxpZ2h0U2VyaWVzT3B0cyAmJiAhdGhpcy5pc1Nlcmllc0xvY2tlZCgpKSB7XG4gICAgdmFyIGNsb3Nlc3Q7XG4gICAgaWYgKHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbihcInN0YWNrZWRHcmFwaFwiKSkge1xuICAgICAgY2xvc2VzdCA9IHRoaXMuZmluZFN0YWNrZWRQb2ludChjYW52YXN4LCBjYW52YXN5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xvc2VzdCA9IHRoaXMuZmluZENsb3Nlc3RQb2ludChjYW52YXN4LCBjYW52YXN5KTtcbiAgICB9XG4gICAgc2VsZWN0aW9uQ2hhbmdlZCA9IHRoaXMuc2V0U2VsZWN0aW9uKGNsb3Nlc3Qucm93LCBjbG9zZXN0LnNlcmllc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIHZhciBpZHggPSB0aGlzLmZpbmRDbG9zZXN0Um93KGNhbnZhc3gpO1xuICAgIHNlbGVjdGlvbkNoYW5nZWQgPSB0aGlzLnNldFNlbGVjdGlvbihpZHgpO1xuICB9XG5cbiAgdmFyIGNhbGxiYWNrID0gdGhpcy5nZXRGdW5jdGlvbk9wdGlvbihcImhpZ2hsaWdodENhbGxiYWNrXCIpO1xuICBpZiAoY2FsbGJhY2sgJiYgc2VsZWN0aW9uQ2hhbmdlZCkge1xuICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZXZlbnQsXG4gICAgICAgIHRoaXMubGFzdHhfLFxuICAgICAgICB0aGlzLnNlbFBvaW50c18sXG4gICAgICAgIHRoaXMubGFzdFJvd18sXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0U2V0Xyk7XG4gIH1cbn07XG5cbi8qKlxuICogRmV0Y2ggbGVmdCBvZmZzZXQgZnJvbSB0aGUgc3BlY2lmaWVkIHNldCBpbmRleCBvciBpZiBub3QgcGFzc2VkLCB0aGVcbiAqIGZpcnN0IGRlZmluZWQgYm91bmRhcnlJZHMgcmVjb3JkIChzZWUgYnVnICMyMzYpLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0TGVmdEJvdW5kYXJ5XyA9IGZ1bmN0aW9uKHNldElkeCkge1xuICBpZiAodGhpcy5ib3VuZGFyeUlkc19bc2V0SWR4XSkge1xuICAgICAgcmV0dXJuIHRoaXMuYm91bmRhcnlJZHNfW3NldElkeF1bMF07XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJvdW5kYXJ5SWRzXy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuYm91bmRhcnlJZHNfW2ldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm91bmRhcnlJZHNfW2ldWzBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxufTtcblxuRHlncmFwaC5wcm90b3R5cGUuYW5pbWF0ZVNlbGVjdGlvbl8gPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgdmFyIHRvdGFsU3RlcHMgPSAxMDtcbiAgdmFyIG1pbGxpcyA9IDMwO1xuICBpZiAodGhpcy5mYWRlTGV2ZWwgPT09IHVuZGVmaW5lZCkgdGhpcy5mYWRlTGV2ZWwgPSAwO1xuICBpZiAodGhpcy5hbmltYXRlSWQgPT09IHVuZGVmaW5lZCkgdGhpcy5hbmltYXRlSWQgPSAwO1xuICB2YXIgc3RhcnQgPSB0aGlzLmZhZGVMZXZlbDtcbiAgdmFyIHN0ZXBzID0gZGlyZWN0aW9uIDwgMCA/IHN0YXJ0IDogdG90YWxTdGVwcyAtIHN0YXJ0O1xuICBpZiAoc3RlcHMgPD0gMCkge1xuICAgIGlmICh0aGlzLmZhZGVMZXZlbCkge1xuICAgICAgdGhpcy51cGRhdGVTZWxlY3Rpb25fKDEuMCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB0aGlzSWQgPSArK3RoaXMuYW5pbWF0ZUlkO1xuICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgdXRpbHMucmVwZWF0QW5kQ2xlYW51cChcbiAgICBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAvLyBpZ25vcmUgc2ltdWx0YW5lb3VzIGFuaW1hdGlvbnNcbiAgICAgIGlmICh0aGF0LmFuaW1hdGVJZCAhPSB0aGlzSWQpIHJldHVybjtcblxuICAgICAgdGhhdC5mYWRlTGV2ZWwgPSBzdGFydCArIChzdGVwICsgMSkgKiBkaXJlY3Rpb247XG4gICAgICBpZiAodGhhdC5mYWRlTGV2ZWwgPT09IDApIHtcbiAgICAgICAgdGhhdC5jbGVhclNlbGVjdGlvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhhdC51cGRhdGVTZWxlY3Rpb25fKHRoYXQuZmFkZUxldmVsIC8gdG90YWxTdGVwcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGVwcywgbWlsbGlzLCBmdW5jdGlvbigpIHt9KTtcbn07XG5cbi8qKlxuICogRHJhdyBkb3RzIG92ZXIgdGhlIHNlbGVjdGllZCBwb2ludHMgaW4gdGhlIGRhdGEgc2VyaWVzLiBUaGlzIGZ1bmN0aW9uXG4gKiB0YWtlcyBjYXJlIG9mIGNsZWFudXAgb2YgcHJldmlvdXNseS1kcmF3biBkb3RzLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUudXBkYXRlU2VsZWN0aW9uXyA9IGZ1bmN0aW9uKG9wdF9hbmltRnJhY3Rpb24pIHtcbiAgLyp2YXIgZGVmYXVsdFByZXZlbnRlZCA9ICovXG4gIHRoaXMuY2FzY2FkZUV2ZW50c18oJ3NlbGVjdCcsIHtcbiAgICBzZWxlY3RlZFJvdzogdGhpcy5sYXN0Um93XyA9PT0gLTEgPyB1bmRlZmluZWQgOiB0aGlzLmxhc3RSb3dfLFxuICAgIHNlbGVjdGVkWDogdGhpcy5sYXN0eF8gPT09IG51bGwgPyB1bmRlZmluZWQgOiB0aGlzLmxhc3R4XyxcbiAgICBzZWxlY3RlZFBvaW50czogdGhpcy5zZWxQb2ludHNfXG4gIH0pO1xuICAvLyBUT0RPKGRhbnZrKTogdXNlIGRlZmF1bHRQcmV2ZW50ZWQgaGVyZT9cblxuICAvLyBDbGVhciB0aGUgcHJldmlvdXNseSBkcmF3biB2ZXJ0aWNhbCwgaWYgdGhlcmUgaXMgb25lXG4gIHZhciBpO1xuICB2YXIgY3R4ID0gdGhpcy5jYW52YXNfY3R4XztcbiAgaWYgKHRoaXMuZ2V0T3B0aW9uKCdoaWdobGlnaHRTZXJpZXNPcHRzJykpIHtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGhfLCB0aGlzLmhlaWdodF8pO1xuICAgIHZhciBhbHBoYSA9IDEuMCAtIHRoaXMuZ2V0TnVtZXJpY09wdGlvbignaGlnaGxpZ2h0U2VyaWVzQmFja2dyb3VuZEFscGhhJyk7XG4gICAgdmFyIGJhY2tncm91bmRDb2xvciA9IHV0aWxzLnRvUkdCXyh0aGlzLmdldE9wdGlvbignaGlnaGxpZ2h0U2VyaWVzQmFja2dyb3VuZENvbG9yJykpO1xuXG4gICAgaWYgKGFscGhhKSB7XG4gICAgICAvLyBBY3RpdmF0aW5nIGJhY2tncm91bmQgZmFkZSBpbmNsdWRlcyBhbiBhbmltYXRpb24gZWZmZWN0IGZvciBhIGdyYWR1YWxcbiAgICAgIC8vIGZhZGUuIFRPRE8oa2xhdXN3KTogbWFrZSB0aGlzIGluZGVwZW5kZW50bHkgY29uZmlndXJhYmxlIGlmIGl0IGNhdXNlc1xuICAgICAgLy8gaXNzdWVzPyBVc2UgYSBzaGFyZWQgcHJlZmVyZW5jZSB0byBjb250cm9sIGFuaW1hdGlvbnM/XG4gICAgICB2YXIgYW5pbWF0ZUJhY2tncm91bmRGYWRlID0gdGhpcy5nZXRCb29sZWFuT3B0aW9uKCdhbmltYXRlQmFja2dyb3VuZEZhZGUnKTtcbiAgICAgIGlmIChhbmltYXRlQmFja2dyb3VuZEZhZGUpIHtcbiAgICAgICAgaWYgKG9wdF9hbmltRnJhY3Rpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIHN0YXJ0IGEgbmV3IGFuaW1hdGlvblxuICAgICAgICAgIHRoaXMuYW5pbWF0ZVNlbGVjdGlvbl8oMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFscGhhICo9IG9wdF9hbmltRnJhY3Rpb247XG4gICAgICB9XG4gICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoJyArIGJhY2tncm91bmRDb2xvci5yICsgJywnICsgYmFja2dyb3VuZENvbG9yLmcgKyAnLCcgKyBiYWNrZ3JvdW5kQ29sb3IuYiArICcsJyArIGFscGhhICsgJyknO1xuICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGhfLCB0aGlzLmhlaWdodF8pO1xuICAgIH1cblxuICAgIC8vIFJlZHJhdyBvbmx5IHRoZSBoaWdobGlnaHRlZCBzZXJpZXMgaW4gdGhlIGludGVyYWN0aXZlIGNhbnZhcyAobm90IHRoZVxuICAgIC8vIHN0YXRpYyBwbG90IGNhbnZhcywgd2hpY2ggaXMgd2hlcmUgc2VyaWVzIGFyZSB1c3VhbGx5IGRyYXduKS5cbiAgICB0aGlzLnBsb3R0ZXJfLl9yZW5kZXJMaW5lQ2hhcnQodGhpcy5oaWdobGlnaHRTZXRfLCBjdHgpO1xuICB9IGVsc2UgaWYgKHRoaXMucHJldmlvdXNWZXJ0aWNhbFhfID49IDApIHtcbiAgICAvLyBEZXRlcm1pbmUgdGhlIG1heGltdW0gaGlnaGxpZ2h0IGNpcmNsZSBzaXplLlxuICAgIHZhciBtYXhDaXJjbGVTaXplID0gMDtcbiAgICB2YXIgbGFiZWxzID0gdGhpcy5hdHRyXygnbGFiZWxzJyk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHIgPSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ2hpZ2hsaWdodENpcmNsZVNpemUnLCBsYWJlbHNbaV0pO1xuICAgICAgaWYgKHIgPiBtYXhDaXJjbGVTaXplKSBtYXhDaXJjbGVTaXplID0gcjtcbiAgICB9XG4gICAgdmFyIHB4ID0gdGhpcy5wcmV2aW91c1ZlcnRpY2FsWF87XG4gICAgY3R4LmNsZWFyUmVjdChweCAtIG1heENpcmNsZVNpemUgLSAxLCAwLFxuICAgICAgICAgICAgICAgICAgMiAqIG1heENpcmNsZVNpemUgKyAyLCB0aGlzLmhlaWdodF8pO1xuICB9XG5cbiAgaWYgKHRoaXMuc2VsUG9pbnRzXy5sZW5ndGggPiAwKSB7XG4gICAgLy8gRHJhdyBjb2xvcmVkIGNpcmNsZXMgb3ZlciB0aGUgY2VudGVyIG9mIGVhY2ggc2VsZWN0ZWQgcG9pbnRcbiAgICB2YXIgY2FudmFzeCA9IHRoaXMuc2VsUG9pbnRzX1swXS5jYW52YXN4O1xuICAgIGN0eC5zYXZlKCk7XG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMuc2VsUG9pbnRzXy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHB0ID0gdGhpcy5zZWxQb2ludHNfW2ldO1xuICAgICAgaWYgKGlzTmFOKHB0LmNhbnZhc3kpKSBjb250aW51ZTtcblxuICAgICAgdmFyIGNpcmNsZVNpemUgPSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ2hpZ2hsaWdodENpcmNsZVNpemUnLCBwdC5uYW1lKTtcbiAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuZ2V0RnVuY3Rpb25PcHRpb24oXCJkcmF3SGlnaGxpZ2h0UG9pbnRDYWxsYmFja1wiLCBwdC5uYW1lKTtcbiAgICAgIHZhciBjb2xvciA9IHRoaXMucGxvdHRlcl8uY29sb3JzW3B0Lm5hbWVdO1xuICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IHV0aWxzLkNpcmNsZXMuREVGQVVMVDtcbiAgICAgIH1cbiAgICAgIGN0eC5saW5lV2lkdGggPSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ3N0cm9rZVdpZHRoJywgcHQubmFtZSk7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgdGhpcywgcHQubmFtZSwgY3R4LCBjYW52YXN4LCBwdC5jYW52YXN5LFxuICAgICAgICAgIGNvbG9yLCBjaXJjbGVTaXplLCBwdC5pZHgpO1xuICAgIH1cbiAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgdGhpcy5wcmV2aW91c1ZlcnRpY2FsWF8gPSBjYW52YXN4O1xuICB9XG59O1xuXG4vKipcbiAqIE1hbnVhbGx5IHNldCB0aGUgc2VsZWN0ZWQgcG9pbnRzIGFuZCBkaXNwbGF5IGluZm9ybWF0aW9uIGFib3V0IHRoZW0gaW4gdGhlXG4gKiBsZWdlbmQuIFRoZSBzZWxlY3Rpb24gY2FuIGJlIGNsZWFyZWQgdXNpbmcgY2xlYXJTZWxlY3Rpb24oKSBhbmQgcXVlcmllZFxuICogdXNpbmcgZ2V0U2VsZWN0aW9uKCkuXG4gKlxuICogVG8gc2V0IGEgc2VsZWN0ZWQgc2VyaWVzIGJ1dCBub3QgYSBzZWxlY3RlZCBwb2ludCwgY2FsbCBzZXRTZWxlY3Rpb24gd2l0aFxuICogcm93PWZhbHNlIGFuZCB0aGUgc2VsZWN0ZWQgc2VyaWVzIG5hbWUuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHJvdyBSb3cgbnVtYmVyIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkIChpLmUuIGFwcGVhciB3aXRoXG4gKiBob3ZlciBkb3RzIG9uIHRoZSBjaGFydCkuXG4gKiBAcGFyYW0ge3Nlcmllc05hbWV9IG9wdGlvbmFsIHNlcmllcyBuYW1lIHRvIGhpZ2hsaWdodCB0aGF0IHNlcmllcyB3aXRoIHRoZVxuICogdGhlIGhpZ2hsaWdodFNlcmllc09wdHMgc2V0dGluZy5cbiAqIEBwYXJhbSB7bG9ja2VkfSBvcHRpb25hbCBJZiB0cnVlLCBrZWVwIHNlcmllc05hbWUgc2VsZWN0ZWQgd2hlbiBtb3VzaW5nXG4gKiBvdmVyIHRoZSBncmFwaCwgZGlzYWJsaW5nIGNsb3Nlc3Qtc2VyaWVzIGhpZ2hsaWdodGluZy4gQ2FsbCBjbGVhclNlbGVjdGlvbigpXG4gKiB0byB1bmxvY2sgaXQuXG4gKiBAcGFyYW0ge3RyaWdnZXJfaGlnaGxpZ2h0X2NhbGxiYWNrfSBvcHRpb25hbCBJZiB0cnVlLCB0cmlnZ2VyIGFueVxuICogdXNlci1kZWZpbmVkIGhpZ2hsaWdodENhbGxiYWNrIGlmIGhpZ2hsaWdodENhbGxiYWNrIGhhcyBiZWVuIHNldC5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuc2V0U2VsZWN0aW9uID0gZnVuY3Rpb24gc2V0U2VsZWN0aW9uKHJvdywgb3B0X3Nlcmllc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0X2xvY2tlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRfdHJpZ2dlcl9oaWdobGlnaHRfY2FsbGJhY2spIHtcbiAgLy8gRXh0cmFjdCB0aGUgcG9pbnRzIHdlJ3ZlIHNlbGVjdGVkXG4gIHRoaXMuc2VsUG9pbnRzXyA9IFtdO1xuXG4gIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gIGlmIChyb3cgIT09IGZhbHNlICYmIHJvdyA+PSAwKSB7XG4gICAgaWYgKHJvdyAhPSB0aGlzLmxhc3RSb3dfKSBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLmxhc3RSb3dfID0gcm93O1xuICAgIGZvciAodmFyIHNldElkeCA9IDA7IHNldElkeCA8IHRoaXMubGF5b3V0Xy5wb2ludHMubGVuZ3RoOyArK3NldElkeCkge1xuICAgICAgdmFyIHBvaW50cyA9IHRoaXMubGF5b3V0Xy5wb2ludHNbc2V0SWR4XTtcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBwb2ludCBhdCB0aGUgYXBwcm9wcmlhdGUgaW5kZXggaXMgdGhlIHBvaW50IHdlJ3JlIGxvb2tpbmdcbiAgICAgIC8vIGZvci4gIElmIGl0IGlzLCBqdXN0IHVzZSBpdCwgb3RoZXJ3aXNlIHNlYXJjaCB0aGUgYXJyYXkgZm9yIGEgcG9pbnRcbiAgICAgIC8vIGluIHRoZSBwcm9wZXIgcGxhY2UuXG4gICAgICB2YXIgc2V0Um93ID0gcm93IC0gdGhpcy5nZXRMZWZ0Qm91bmRhcnlfKHNldElkeCk7XG4gICAgICBpZiAoc2V0Um93ID49IDAgJiYgc2V0Um93IDwgcG9pbnRzLmxlbmd0aCAmJiBwb2ludHNbc2V0Um93XS5pZHggPT0gcm93KSB7XG4gICAgICAgIHZhciBwb2ludCA9IHBvaW50c1tzZXRSb3ddO1xuICAgICAgICBpZiAocG9pbnQueXZhbCAhPT0gbnVsbCkgdGhpcy5zZWxQb2ludHNfLnB1c2gocG9pbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgcG9pbnRJZHggPSAwOyBwb2ludElkeCA8IHBvaW50cy5sZW5ndGg7ICsrcG9pbnRJZHgpIHtcbiAgICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbcG9pbnRJZHhdO1xuICAgICAgICAgIGlmIChwb2ludC5pZHggPT0gcm93KSB7XG4gICAgICAgICAgICBpZiAocG9pbnQueXZhbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aGlzLnNlbFBvaW50c18ucHVzaChwb2ludCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRoaXMubGFzdFJvd18gPj0gMCkgY2hhbmdlZCA9IHRydWU7XG4gICAgdGhpcy5sYXN0Um93XyA9IC0xO1xuICB9XG5cbiAgaWYgKHRoaXMuc2VsUG9pbnRzXy5sZW5ndGgpIHtcbiAgICB0aGlzLmxhc3R4XyA9IHRoaXMuc2VsUG9pbnRzX1swXS54dmFsO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubGFzdHhfID0gbnVsbDtcbiAgfVxuXG4gIGlmIChvcHRfc2VyaWVzTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHRoaXMuaGlnaGxpZ2h0U2V0XyAhPT0gb3B0X3Nlcmllc05hbWUpIGNoYW5nZWQgPSB0cnVlO1xuICAgIHRoaXMuaGlnaGxpZ2h0U2V0XyA9IG9wdF9zZXJpZXNOYW1lO1xuICB9XG5cbiAgaWYgKG9wdF9sb2NrZWQgIT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMubG9ja2VkU2V0XyA9IG9wdF9sb2NrZWQ7XG4gIH1cblxuICBpZiAoY2hhbmdlZCkge1xuICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uXyh1bmRlZmluZWQpO1xuXG4gICAgaWYgKG9wdF90cmlnZ2VyX2hpZ2hsaWdodF9jYWxsYmFjaykge1xuICAgICAgdmFyIGNhbGxiYWNrID0gdGhpcy5nZXRGdW5jdGlvbk9wdGlvbihcImhpZ2hsaWdodENhbGxiYWNrXCIpO1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBldmVudCA9IHt9O1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGV2ZW50LFxuICAgICAgICAgIHRoaXMubGFzdHhfLFxuICAgICAgICAgIHRoaXMuc2VsUG9pbnRzXyxcbiAgICAgICAgICB0aGlzLmxhc3RSb3dfLFxuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0U2V0Xyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjaGFuZ2VkO1xufTtcblxuLyoqXG4gKiBUaGUgbW91c2UgaGFzIGxlZnQgdGhlIGNhbnZhcy4gQ2xlYXIgb3V0IHdoYXRldmVyIGFydGlmYWN0cyByZW1haW5cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCB0aGUgbW91c2VvdXQgZXZlbnQgZnJvbSB0aGUgYnJvd3Nlci5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLm1vdXNlT3V0XyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGlmICh0aGlzLmdldEZ1bmN0aW9uT3B0aW9uKFwidW5oaWdobGlnaHRDYWxsYmFja1wiKSkge1xuICAgIHRoaXMuZ2V0RnVuY3Rpb25PcHRpb24oXCJ1bmhpZ2hsaWdodENhbGxiYWNrXCIpLmNhbGwodGhpcywgZXZlbnQpO1xuICB9XG5cbiAgaWYgKHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbihcImhpZGVPdmVybGF5T25Nb3VzZU91dFwiKSAmJiAhdGhpcy5sb2NrZWRTZXRfKSB7XG4gICAgdGhpcy5jbGVhclNlbGVjdGlvbigpO1xuICB9XG59O1xuXG4vKipcbiAqIENsZWFycyB0aGUgY3VycmVudCBzZWxlY3Rpb24gKGkuZS4gcG9pbnRzIHRoYXQgd2VyZSBoaWdobGlnaHRlZCBieSBtb3ZpbmdcbiAqIHRoZSBtb3VzZSBvdmVyIHRoZSBjaGFydCkuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmNsZWFyU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2FzY2FkZUV2ZW50c18oJ2Rlc2VsZWN0Jywge30pO1xuXG4gIHRoaXMubG9ja2VkU2V0XyA9IGZhbHNlO1xuICAvLyBHZXQgcmlkIG9mIHRoZSBvdmVybGF5IGRhdGFcbiAgaWYgKHRoaXMuZmFkZUxldmVsKSB7XG4gICAgdGhpcy5hbmltYXRlU2VsZWN0aW9uXygtMSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuY2FudmFzX2N0eF8uY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGhfLCB0aGlzLmhlaWdodF8pO1xuICB0aGlzLmZhZGVMZXZlbCA9IDA7XG4gIHRoaXMuc2VsUG9pbnRzXyA9IFtdO1xuICB0aGlzLmxhc3R4XyA9IG51bGw7XG4gIHRoaXMubGFzdFJvd18gPSAtMTtcbiAgdGhpcy5oaWdobGlnaHRTZXRfID0gbnVsbDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgcm93LiBUbyBnZXQgZGF0YSBmb3IgdGhpcyByb3csXG4gKiB5b3UgY2FuIHVzZSB0aGUgZ2V0VmFsdWUgbWV0aG9kLlxuICogQHJldHVybiB7bnVtYmVyfSByb3cgbnVtYmVyLCBvciAtMSBpZiBub3RoaW5nIGlzIHNlbGVjdGVkXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMuc2VsUG9pbnRzXyB8fCB0aGlzLnNlbFBvaW50c18ubGVuZ3RoIDwgMSkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGZvciAodmFyIHNldElkeCA9IDA7IHNldElkeCA8IHRoaXMubGF5b3V0Xy5wb2ludHMubGVuZ3RoOyBzZXRJZHgrKykge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmxheW91dF8ucG9pbnRzW3NldElkeF07XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgcG9pbnRzLmxlbmd0aDsgcm93KyspIHtcbiAgICAgIGlmIChwb2ludHNbcm93XS54ID09IHRoaXMuc2VsUG9pbnRzX1swXS54KSB7XG4gICAgICAgIHJldHVybiBwb2ludHNbcm93XS5pZHg7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgY3VycmVudGx5LWhpZ2hsaWdodGVkIHNlcmllcy5cbiAqIE9ubHkgYXZhaWxhYmxlIHdoZW4gdGhlIGhpZ2hsaWdodFNlcmllc09wdHMgb3B0aW9uIGlzIGluIHVzZS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0SGlnaGxpZ2h0U2VyaWVzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmhpZ2hsaWdodFNldF87XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudGx5LWhpZ2hsaWdodGVkIHNlcmllcyB3YXMgbG9ja2VkXG4gKiB2aWEgc2V0U2VsZWN0aW9uKC4uLiwgc2VyaWVzTmFtZSwgdHJ1ZSkuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmlzU2VyaWVzTG9ja2VkID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmxvY2tlZFNldF87XG59O1xuXG4vKipcbiAqIEZpcmVzIHdoZW4gdGhlcmUncyBkYXRhIGF2YWlsYWJsZSB0byBiZSBncmFwaGVkLlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgUmF3IENTViBkYXRhIHRvIGJlIHBsb3R0ZWRcbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmxvYWRlZEV2ZW50XyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdGhpcy5yYXdEYXRhXyA9IHRoaXMucGFyc2VDU1ZfKGRhdGEpO1xuICB0aGlzLmNhc2NhZGVEYXRhRGlkVXBkYXRlRXZlbnRfKCk7XG4gIHRoaXMucHJlZHJhd18oKTtcbn07XG5cbi8qKlxuICogQWRkIHRpY2tzIG9uIHRoZSB4LWF4aXMgcmVwcmVzZW50aW5nIHllYXJzLCBtb250aHMsIHF1YXJ0ZXJzLCB3ZWVrcywgb3IgZGF5c1xuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuYWRkWFRpY2tzXyA9IGZ1bmN0aW9uKCkge1xuICAvLyBEZXRlcm1pbmUgdGhlIGNvcnJlY3QgdGlja3Mgc2NhbGUgb24gdGhlIHgtYXhpczogcXVhcnRlcmx5LCBtb250aGx5LCAuLi5cbiAgdmFyIHJhbmdlO1xuICBpZiAodGhpcy5kYXRlV2luZG93Xykge1xuICAgIHJhbmdlID0gW3RoaXMuZGF0ZVdpbmRvd19bMF0sIHRoaXMuZGF0ZVdpbmRvd19bMV1dO1xuICB9IGVsc2Uge1xuICAgIHJhbmdlID0gdGhpcy54QXhpc0V4dHJlbWVzKCk7XG4gIH1cblxuICB2YXIgeEF4aXNPcHRpb25zVmlldyA9IHRoaXMub3B0aW9uc1ZpZXdGb3JBeGlzXygneCcpO1xuICB2YXIgeFRpY2tzID0geEF4aXNPcHRpb25zVmlldygndGlja2VyJykoXG4gICAgICByYW5nZVswXSxcbiAgICAgIHJhbmdlWzFdLFxuICAgICAgdGhpcy5wbG90dGVyXy5hcmVhLncsICAvLyBUT0RPKGRhbnZrKTogc2hvdWxkIGJlIGFyZWEud2lkdGhcbiAgICAgIHhBeGlzT3B0aW9uc1ZpZXcsXG4gICAgICB0aGlzKTtcbiAgLy8gdmFyIG1zZyA9ICd0aWNrZXIoJyArIHJhbmdlWzBdICsgJywgJyArIHJhbmdlWzFdICsgJywgJyArIHRoaXMud2lkdGhfICsgJywgJyArIHRoaXMuYXR0cl8oJ3BpeGVsc1BlclhMYWJlbCcpICsgJykgLT4gJyArIEpTT04uc3RyaW5naWZ5KHhUaWNrcyk7XG4gIC8vIGNvbnNvbGUubG9nKG1zZyk7XG4gIHRoaXMubGF5b3V0Xy5zZXRYVGlja3MoeFRpY2tzKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY29ycmVjdCBoYW5kbGVyIGNsYXNzIGZvciB0aGUgY3VycmVudGx5IHNldCBvcHRpb25zLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0SGFuZGxlckNsYXNzXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaGFuZGxlckNsYXNzO1xuICBpZiAodGhpcy5hdHRyXygnZGF0YUhhbmRsZXInKSkge1xuICAgIGhhbmRsZXJDbGFzcyA9ICB0aGlzLmF0dHJfKCdkYXRhSGFuZGxlcicpO1xuICB9IGVsc2UgaWYgKHRoaXMuZnJhY3Rpb25zXykge1xuICAgIGlmICh0aGlzLmdldEJvb2xlYW5PcHRpb24oJ2Vycm9yQmFycycpKSB7XG4gICAgICBoYW5kbGVyQ2xhc3MgPSBGcmFjdGlvbnNCYXJzSGFuZGxlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlckNsYXNzID0gRGVmYXVsdEZyYWN0aW9uSGFuZGxlcjtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5nZXRCb29sZWFuT3B0aW9uKCdjdXN0b21CYXJzJykpIHtcbiAgICBoYW5kbGVyQ2xhc3MgPSBDdXN0b21CYXJzSGFuZGxlcjtcbiAgfSBlbHNlIGlmICh0aGlzLmdldEJvb2xlYW5PcHRpb24oJ2Vycm9yQmFycycpKSB7XG4gICAgaGFuZGxlckNsYXNzID0gRXJyb3JCYXJzSGFuZGxlcjtcbiAgfSBlbHNlIHtcbiAgICBoYW5kbGVyQ2xhc3MgPSBEZWZhdWx0SGFuZGxlcjtcbiAgfVxuICByZXR1cm4gaGFuZGxlckNsYXNzO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgb25jZSB3aGVuIHRoZSBjaGFydCdzIGRhdGEgaXMgY2hhbmdlZCBvciB0aGUgb3B0aW9uc1xuICogZGljdGlvbmFyeSBpcyB1cGRhdGVkLiBJdCBpcyBfbm90XyBjYWxsZWQgd2hlbiB0aGUgdXNlciBwYW5zIG9yIHpvb21zLiBUaGVcbiAqIGlkZWEgaXMgdGhhdCB2YWx1ZXMgZGVyaXZlZCBmcm9tIHRoZSBjaGFydCdzIGRhdGEgY2FuIGJlIGNvbXB1dGVkIGhlcmUsXG4gKiByYXRoZXIgdGhhbiBldmVyeSB0aW1lIHRoZSBjaGFydCBpcyBkcmF3bi4gVGhpcyBpbmNsdWRlcyB0aGluZ3MgbGlrZSB0aGVcbiAqIG51bWJlciBvZiBheGVzLCByb2xsaW5nIGF2ZXJhZ2VzLCBldGMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnByZWRyYXdfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGFydCA9IG5ldyBEYXRlKCk7XG5cbiAgLy8gQ3JlYXRlIHRoZSBjb3JyZWN0IGRhdGFIYW5kbGVyXG4gIHRoaXMuZGF0YUhhbmRsZXJfID0gbmV3ICh0aGlzLmdldEhhbmRsZXJDbGFzc18oKSkoKTtcblxuICB0aGlzLmxheW91dF8uY29tcHV0ZVBsb3RBcmVhKCk7XG5cbiAgLy8gVE9ETyhkYW52ayk6IG1vdmUgbW9yZSBjb21wdXRhdGlvbnMgb3V0IG9mIGRyYXdHcmFwaF8gYW5kIGludG8gaGVyZS5cbiAgdGhpcy5jb21wdXRlWUF4ZXNfKCk7XG5cbiAgaWYgKCF0aGlzLmlzX2luaXRpYWxfZHJhd18pIHtcbiAgICB0aGlzLmNhbnZhc19jdHhfLnJlc3RvcmUoKTtcbiAgICB0aGlzLmhpZGRlbl9jdHhfLnJlc3RvcmUoKTtcbiAgfVxuXG4gIHRoaXMuY2FudmFzX2N0eF8uc2F2ZSgpO1xuICB0aGlzLmhpZGRlbl9jdHhfLnNhdmUoKTtcblxuICAvLyBDcmVhdGUgYSBuZXcgcGxvdHRlci5cbiAgdGhpcy5wbG90dGVyXyA9IG5ldyBEeWdyYXBoQ2FudmFzUmVuZGVyZXIodGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRkZW5fLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGRlbl9jdHhfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxheW91dF8pO1xuXG4gIC8vIFRoZSByb2xsZXIgc2l0cyBpbiB0aGUgYm90dG9tIGxlZnQgY29ybmVyIG9mIHRoZSBjaGFydC4gV2UgZG9uJ3Qga25vdyB3aGVyZVxuICAvLyB0aGlzIHdpbGwgYmUgdW50aWwgdGhlIG9wdGlvbnMgYXJlIGF2YWlsYWJsZSwgc28gaXQncyBwb3NpdGlvbmVkIGhlcmUuXG4gIHRoaXMuY3JlYXRlUm9sbEludGVyZmFjZV8oKTtcblxuICB0aGlzLmNhc2NhZGVFdmVudHNfKCdwcmVkcmF3Jyk7XG5cbiAgLy8gQ29udmVydCB0aGUgcmF3IGRhdGEgKGEgMkQgYXJyYXkpIGludG8gdGhlIGludGVybmFsIGZvcm1hdCBhbmQgY29tcHV0ZVxuICAvLyByb2xsaW5nIGF2ZXJhZ2VzLlxuICB0aGlzLnJvbGxlZFNlcmllc18gPSBbbnVsbF07ICAvLyB4LWF4aXMgaXMgdGhlIGZpcnN0IHNlcmllcyBhbmQgaXQncyBzcGVjaWFsXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgdGhpcy5udW1Db2x1bW5zKCk7IGkrKykge1xuICAgIC8vIHZhciBsb2dTY2FsZSA9IHRoaXMuYXR0cl8oJ2xvZ3NjYWxlJywgaSk7IC8vIFRPRE8oa2xhdXN3KTogdGhpcyBsb29rcyB3cm9uZyAvLyBrb25pZ3NiZXJnIHRoaW5rcyBzbyB0b28uXG4gICAgdmFyIHNlcmllcyA9IHRoaXMuZGF0YUhhbmRsZXJfLmV4dHJhY3RTZXJpZXModGhpcy5yYXdEYXRhXywgaSwgdGhpcy5hdHRyaWJ1dGVzXyk7XG4gICAgaWYgKHRoaXMucm9sbFBlcmlvZF8gPiAxKSB7XG4gICAgICBzZXJpZXMgPSB0aGlzLmRhdGFIYW5kbGVyXy5yb2xsaW5nQXZlcmFnZShzZXJpZXMsIHRoaXMucm9sbFBlcmlvZF8sIHRoaXMuYXR0cmlidXRlc18sIGkpO1xuICAgIH1cblxuICAgIHRoaXMucm9sbGVkU2VyaWVzXy5wdXNoKHNlcmllcyk7XG4gIH1cblxuICAvLyBJZiB0aGUgZGF0YSBvciBvcHRpb25zIGhhdmUgY2hhbmdlZCwgdGhlbiB3ZSdkIGJldHRlciByZWRyYXcuXG4gIHRoaXMuZHJhd0dyYXBoXygpO1xuXG4gIC8vIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0byBkbyB2YXJpb3VzIGFuaW1hdGlvbnMuXG4gIHZhciBlbmQgPSBuZXcgRGF0ZSgpO1xuICB0aGlzLmRyYXdpbmdUaW1lTXNfID0gKGVuZCAtIHN0YXJ0KTtcbn07XG5cbi8qKlxuICogUG9pbnQgc3RydWN0dXJlLlxuICpcbiAqIHh2YWxfKiBhbmQgeXZhbF8qIGFyZSB0aGUgb3JpZ2luYWwgdW5zY2FsZWQgZGF0YSB2YWx1ZXMsXG4gKiB3aGlsZSB4XyogYW5kIHlfKiBhcmUgc2NhbGVkIHRvIHRoZSByYW5nZSAoMC4wLTEuMCkgZm9yIHBsb3R0aW5nLlxuICogeXZhbF9zdGFja2VkIGlzIHRoZSBjdW11bGF0aXZlIFkgdmFsdWUgdXNlZCBmb3Igc3RhY2tpbmcgZ3JhcGhzLFxuICogYW5kIGJvdHRvbS90b3AvbWludXMvcGx1cyBhcmUgdXNlZCBmb3IgaGlnaC9sb3cgYmFuZCBncmFwaHMuXG4gKlxuICogQHR5cGVkZWYge3tcbiAqICAgICBpZHg6IG51bWJlcixcbiAqICAgICBuYW1lOiBzdHJpbmcsXG4gKiAgICAgeDogP251bWJlcixcbiAqICAgICB4dmFsOiA/bnVtYmVyLFxuICogICAgIHlfYm90dG9tOiA/bnVtYmVyLFxuICogICAgIHk6ID9udW1iZXIsXG4gKiAgICAgeV9zdGFja2VkOiA/bnVtYmVyLFxuICogICAgIHlfdG9wOiA/bnVtYmVyLFxuICogICAgIHl2YWxfbWludXM6ID9udW1iZXIsXG4gKiAgICAgeXZhbDogP251bWJlcixcbiAqICAgICB5dmFsX3BsdXM6ID9udW1iZXIsXG4gKiAgICAgeXZhbF9zdGFja2VkXG4gKiB9fVxuICovXG5EeWdyYXBoLlBvaW50VHlwZSA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHBvaW50IHN0YWNraW5nIGZvciBzdGFja2VkR3JhcGg9dHJ1ZS5cbiAqXG4gKiBGb3Igc3RhY2tpbmcgcHVycG9zZXMsIGludGVycG9sYXRlIG9yIGV4dGVuZCBuZWlnaGJvcmluZyBkYXRhIGFjcm9zc1xuICogTmFOIHZhbHVlcyBiYXNlZCBvbiBzdGFja2VkR3JhcGhOYU5GaWxsIHNldHRpbmdzLiBUaGlzIGlzIGZvciBkaXNwbGF5XG4gKiBvbmx5LCB0aGUgdW5kZXJseWluZyBkYXRhIHZhbHVlIGFzIHNob3duIGluIHRoZSBsZWdlbmQgcmVtYWlucyBOYU4uXG4gKlxuICogQHBhcmFtIHtBcnJheS48RHlncmFwaC5Qb2ludFR5cGU+fSBwb2ludHMgUG9pbnQgYXJyYXkgZm9yIGEgc2luZ2xlIHNlcmllcy5cbiAqICAgICBVcGRhdGVzIGVhY2ggUG9pbnQncyB5dmFsX3N0YWNrZWQgcHJvcGVydHkuXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBjdW11bGF0aXZlWXZhbCBBY2N1bXVsYXRlZCB0b3Atb2YtZ3JhcGggc3RhY2tlZCBZXG4gKiAgICAgdmFsdWVzIGZvciB0aGUgc2VyaWVzIHNlZW4gc28gZmFyLiBJbmRleCBpcyB0aGUgcm93IG51bWJlci4gVXBkYXRlZFxuICogICAgIGJhc2VkIG9uIHRoZSBjdXJyZW50IHNlcmllcydzIHZhbHVlcy5cbiAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IHNlcmllc0V4dHJlbWVzIE1pbiBhbmQgbWF4IHZhbHVlcywgdXBkYXRlZFxuICogICAgIHRvIHJlZmxlY3QgdGhlIHN0YWNrZWQgdmFsdWVzLlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGxNZXRob2QgSW50ZXJwb2xhdGlvbiBtZXRob2QsIG9uZSBvZiAnYWxsJywgJ2luc2lkZScsIG9yXG4gKiAgICAgJ25vbmUnLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5zdGFja1BvaW50c18gPSBmdW5jdGlvbihcbiAgICBwb2ludHMsIGN1bXVsYXRpdmVZdmFsLCBzZXJpZXNFeHRyZW1lcywgZmlsbE1ldGhvZCkge1xuICB2YXIgbGFzdFh2YWwgPSBudWxsO1xuICB2YXIgcHJldlBvaW50ID0gbnVsbDtcbiAgdmFyIG5leHRQb2ludCA9IG51bGw7XG4gIHZhciBuZXh0UG9pbnRJZHggPSAtMTtcblxuICAvLyBGaW5kIHRoZSBuZXh0IHN0YWNrYWJsZSBwb2ludCBzdGFydGluZyBmcm9tIHRoZSBnaXZlbiBpbmRleC5cbiAgdmFyIHVwZGF0ZU5leHRQb2ludCA9IGZ1bmN0aW9uKGlkeCkge1xuICAgIC8vIElmIHdlJ3ZlIHByZXZpb3VzbHkgZm91bmQgYSBub24tTmFOIHBvaW50IGFuZCBoYXZlbid0IGdvbmUgcGFzdCBpdCB5ZXQsXG4gICAgLy8ganVzdCB1c2UgdGhhdC5cbiAgICBpZiAobmV4dFBvaW50SWR4ID49IGlkeCkgcmV0dXJuO1xuXG4gICAgLy8gV2UgaGF2ZW4ndCBmb3VuZCBhIG5vbi1OYU4gcG9pbnQgeWV0IG9yIGhhdmUgbW92ZWQgcGFzdCBpdCxcbiAgICAvLyBsb29rIHRvd2FyZHMgdGhlIHJpZ2h0IHRvIGZpbmQgYSBub24tTmFOIHBvaW50LlxuICAgIGZvciAodmFyIGogPSBpZHg7IGogPCBwb2ludHMubGVuZ3RoOyArK2opIHtcbiAgICAgIC8vIENsZWFyIG91dCBhIHByZXZpb3VzbHktZm91bmQgcG9pbnQgKGlmIGFueSkgc2luY2UgaXQncyBubyBsb25nZXJcbiAgICAgIC8vIHZhbGlkLCB3ZSBzaG91bGRuJ3QgdXNlIGl0IGZvciBpbnRlcnBvbGF0aW9uIGFueW1vcmUuXG4gICAgICBuZXh0UG9pbnQgPSBudWxsO1xuICAgICAgaWYgKCFpc05hTihwb2ludHNbal0ueXZhbCkgJiYgcG9pbnRzW2pdLnl2YWwgIT09IG51bGwpIHtcbiAgICAgICAgbmV4dFBvaW50SWR4ID0gajtcbiAgICAgICAgbmV4dFBvaW50ID0gcG9pbnRzW2pdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcG9pbnQgPSBwb2ludHNbaV07XG4gICAgdmFyIHh2YWwgPSBwb2ludC54dmFsO1xuICAgIGlmIChjdW11bGF0aXZlWXZhbFt4dmFsXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjdW11bGF0aXZlWXZhbFt4dmFsXSA9IDA7XG4gICAgfVxuXG4gICAgdmFyIGFjdHVhbFl2YWwgPSBwb2ludC55dmFsO1xuICAgIGlmIChpc05hTihhY3R1YWxZdmFsKSB8fCBhY3R1YWxZdmFsID09PSBudWxsKSB7XG4gICAgICBpZihmaWxsTWV0aG9kID09ICdub25lJykge1xuICAgICAgICBhY3R1YWxZdmFsID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEludGVycG9sYXRlL2V4dGVuZCBmb3Igc3RhY2tpbmcgcHVycG9zZXMgaWYgcG9zc2libGUuXG4gICAgICAgIHVwZGF0ZU5leHRQb2ludChpKTtcbiAgICAgICAgaWYgKHByZXZQb2ludCAmJiBuZXh0UG9pbnQgJiYgZmlsbE1ldGhvZCAhPSAnbm9uZScpIHtcbiAgICAgICAgICAvLyBVc2UgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiBwcmV2UG9pbnQgYW5kIG5leHRQb2ludC5cbiAgICAgICAgICBhY3R1YWxZdmFsID0gcHJldlBvaW50Lnl2YWwgKyAobmV4dFBvaW50Lnl2YWwgLSBwcmV2UG9pbnQueXZhbCkgKlxuICAgICAgICAgICAgICAoKHh2YWwgLSBwcmV2UG9pbnQueHZhbCkgLyAobmV4dFBvaW50Lnh2YWwgLSBwcmV2UG9pbnQueHZhbCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHByZXZQb2ludCAmJiBmaWxsTWV0aG9kID09ICdhbGwnKSB7XG4gICAgICAgICAgYWN0dWFsWXZhbCA9IHByZXZQb2ludC55dmFsO1xuICAgICAgICB9IGVsc2UgaWYgKG5leHRQb2ludCAmJiBmaWxsTWV0aG9kID09ICdhbGwnKSB7XG4gICAgICAgICAgYWN0dWFsWXZhbCA9IG5leHRQb2ludC55dmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFjdHVhbFl2YWwgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZQb2ludCA9IHBvaW50O1xuICAgIH1cblxuICAgIHZhciBzdGFja2VkWXZhbCA9IGN1bXVsYXRpdmVZdmFsW3h2YWxdO1xuICAgIGlmIChsYXN0WHZhbCAhPSB4dmFsKSB7XG4gICAgICAvLyBJZiBhbiB4LXZhbHVlIGlzIHJlcGVhdGVkLCB3ZSBpZ25vcmUgdGhlIGR1cGxpY2F0ZXMuXG4gICAgICBzdGFja2VkWXZhbCArPSBhY3R1YWxZdmFsO1xuICAgICAgY3VtdWxhdGl2ZVl2YWxbeHZhbF0gPSBzdGFja2VkWXZhbDtcbiAgICB9XG4gICAgbGFzdFh2YWwgPSB4dmFsO1xuXG4gICAgcG9pbnQueXZhbF9zdGFja2VkID0gc3RhY2tlZFl2YWw7XG5cbiAgICBpZiAoc3RhY2tlZFl2YWwgPiBzZXJpZXNFeHRyZW1lc1sxXSkge1xuICAgICAgc2VyaWVzRXh0cmVtZXNbMV0gPSBzdGFja2VkWXZhbDtcbiAgICB9XG4gICAgaWYgKHN0YWNrZWRZdmFsIDwgc2VyaWVzRXh0cmVtZXNbMF0pIHtcbiAgICAgIHNlcmllc0V4dHJlbWVzWzBdID0gc3RhY2tlZFl2YWw7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIExvb3Agb3ZlciBhbGwgZmllbGRzIGFuZCBjcmVhdGUgZGF0YXNldHMsIGNhbGN1bGF0aW5nIGV4dHJlbWUgeS12YWx1ZXMgZm9yXG4gKiBlYWNoIHNlcmllcyBhbmQgZXh0cmVtZSB4LWluZGljZXMgYXMgd2UgZ28uXG4gKlxuICogZGF0ZVdpbmRvdyBpcyBwYXNzZWQgaW4gYXMgYW4gZXhwbGljaXQgcGFyYW1ldGVyIHNvIHRoYXQgd2UgY2FuIGNvbXB1dGVcbiAqIGV4dHJlbWUgdmFsdWVzIFwic3BlY3VsYXRpdmVseVwiLCBpLmUuIHdpdGhvdXQgYWN0dWFsbHkgc2V0dGluZyBzdGF0ZSBvbiB0aGVcbiAqIGR5Z3JhcGguXG4gKlxuICogQHBhcmFtIHtBcnJheS48QXJyYXkuPEFycmF5LjwobnVtYmVyfEFycmF5PG51bWJlcj4pPj59IHJvbGxlZFNlcmllcywgd2hlcmVcbiAqICAgICByb2xsZWRTZXJpZXNbc2VyaWVzSW5kZXhdW3Jvd10gPSByYXcgcG9pbnQsIHdoZXJlXG4gKiAgICAgc2VyaWVzSW5kZXggaXMgdGhlIGNvbHVtbiBudW1iZXIgc3RhcnRpbmcgd2l0aCAxLCBhbmRcbiAqICAgICByYXdQb2ludCBpcyBbeCx5XSBvciBbeCwgW3ksIGVycl1dIG9yIFt4LCBbeSwgeW1pbnVzLCB5cGx1c11dLlxuICogQHBhcmFtIHs/QXJyYXkuPG51bWJlcj59IGRhdGVXaW5kb3cgW3htaW4sIHhtYXhdIHBhaXIsIG9yIG51bGwuXG4gKiBAcmV0dXJuIHt7XG4gKiAgICAgcG9pbnRzOiBBcnJheS48QXJyYXkuPER5Z3JhcGguUG9pbnRUeXBlPj4sXG4gKiAgICAgc2VyaWVzRXh0cmVtZXM6IEFycmF5LjxBcnJheS48bnVtYmVyPj4sXG4gKiAgICAgYm91bmRhcnlJZHM6IEFycmF5LjxudW1iZXI+fX1cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdhdGhlckRhdGFzZXRzXyA9IGZ1bmN0aW9uKHJvbGxlZFNlcmllcywgZGF0ZVdpbmRvdykge1xuICB2YXIgYm91bmRhcnlJZHMgPSBbXTtcbiAgdmFyIHBvaW50cyA9IFtdO1xuICB2YXIgY3VtdWxhdGl2ZVl2YWwgPSBbXTsgIC8vIEZvciBzdGFja2VkIHNlcmllcy5cbiAgdmFyIGV4dHJlbWVzID0ge307ICAvLyBzZXJpZXMgbmFtZSAtPiBbbG93LCBoaWdoXVxuICB2YXIgc2VyaWVzSWR4LCBzYW1wbGVJZHg7XG4gIHZhciBmaXJzdElkeCwgbGFzdElkeDtcbiAgdmFyIGF4aXNJZHg7XG5cbiAgLy8gTG9vcCBvdmVyIHRoZSBmaWVsZHMgKHNlcmllcykuICBHbyBmcm9tIHRoZSBsYXN0IHRvIHRoZSBmaXJzdCxcbiAgLy8gYmVjYXVzZSBpZiB0aGV5J3JlIHN0YWNrZWQgdGhhdCdzIGhvdyB3ZSBhY2N1bXVsYXRlIHRoZSB2YWx1ZXMuXG4gIHZhciBudW1fc2VyaWVzID0gcm9sbGVkU2VyaWVzLmxlbmd0aCAtIDE7XG4gIHZhciBzZXJpZXM7XG4gIGZvciAoc2VyaWVzSWR4ID0gbnVtX3Nlcmllczsgc2VyaWVzSWR4ID49IDE7IHNlcmllc0lkeC0tKSB7XG4gICAgaWYgKCF0aGlzLnZpc2liaWxpdHkoKVtzZXJpZXNJZHggLSAxXSkgY29udGludWU7XG5cbiAgICAvLyBQcnVuZSBkb3duIHRvIHRoZSBkZXNpcmVkIHJhbmdlLCBpZiBuZWNlc3NhcnkgKGZvciB6b29taW5nKVxuICAgIC8vIEJlY2F1c2UgdGhlcmUgY2FuIGJlIGxpbmVzIGdvaW5nIHRvIHBvaW50cyBvdXRzaWRlIG9mIHRoZSB2aXNpYmxlIGFyZWEsXG4gICAgLy8gd2UgYWN0dWFsbHkgcHJ1bmUgdG8gdmlzaWJsZSBwb2ludHMsIHBsdXMgb25lIG9uIGVpdGhlciBzaWRlLlxuICAgIGlmIChkYXRlV2luZG93KSB7XG4gICAgICBzZXJpZXMgPSByb2xsZWRTZXJpZXNbc2VyaWVzSWR4XTtcbiAgICAgIHZhciBsb3cgPSBkYXRlV2luZG93WzBdO1xuICAgICAgdmFyIGhpZ2ggPSBkYXRlV2luZG93WzFdO1xuXG4gICAgICAvLyBUT0RPKGRhbnZrKTogZG8gYmluYXJ5IHNlYXJjaCBpbnN0ZWFkIG9mIGxpbmVhciBzZWFyY2guXG4gICAgICAvLyBUT0RPKGRhbnZrKTogcGFzcyBmaXJzdElkeCBhbmQgbGFzdElkeCBkaXJlY3RseSB0byB0aGUgcmVuZGVyZXIuXG4gICAgICBmaXJzdElkeCA9IG51bGw7XG4gICAgICBsYXN0SWR4ID0gbnVsbDtcbiAgICAgIGZvciAoc2FtcGxlSWR4ID0gMDsgc2FtcGxlSWR4IDwgc2VyaWVzLmxlbmd0aDsgc2FtcGxlSWR4KyspIHtcbiAgICAgICAgaWYgKHNlcmllc1tzYW1wbGVJZHhdWzBdID49IGxvdyAmJiBmaXJzdElkeCA9PT0gbnVsbCkge1xuICAgICAgICAgIGZpcnN0SWR4ID0gc2FtcGxlSWR4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZXJpZXNbc2FtcGxlSWR4XVswXSA8PSBoaWdoKSB7XG4gICAgICAgICAgbGFzdElkeCA9IHNhbXBsZUlkeDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmlyc3RJZHggPT09IG51bGwpIGZpcnN0SWR4ID0gMDtcbiAgICAgIHZhciBjb3JyZWN0ZWRGaXJzdElkeCA9IGZpcnN0SWR4O1xuICAgICAgdmFyIGlzSW52YWxpZFZhbHVlID0gdHJ1ZTtcbiAgICAgIHdoaWxlIChpc0ludmFsaWRWYWx1ZSAmJiBjb3JyZWN0ZWRGaXJzdElkeCA+IDApIHtcbiAgICAgICAgY29ycmVjdGVkRmlyc3RJZHgtLTtcbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlIHkgdmFsdWUgaXMgbnVsbC5cbiAgICAgICAgaXNJbnZhbGlkVmFsdWUgPSBzZXJpZXNbY29ycmVjdGVkRmlyc3RJZHhdWzFdID09PSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAobGFzdElkeCA9PT0gbnVsbCkgbGFzdElkeCA9IHNlcmllcy5sZW5ndGggLSAxO1xuICAgICAgdmFyIGNvcnJlY3RlZExhc3RJZHggPSBsYXN0SWR4O1xuICAgICAgaXNJbnZhbGlkVmFsdWUgPSB0cnVlO1xuICAgICAgd2hpbGUgKGlzSW52YWxpZFZhbHVlICYmIGNvcnJlY3RlZExhc3RJZHggPCBzZXJpZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICBjb3JyZWN0ZWRMYXN0SWR4Kys7XG4gICAgICAgIGlzSW52YWxpZFZhbHVlID0gc2VyaWVzW2NvcnJlY3RlZExhc3RJZHhdWzFdID09PSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29ycmVjdGVkRmlyc3RJZHghPT1maXJzdElkeCkge1xuICAgICAgICBmaXJzdElkeCA9IGNvcnJlY3RlZEZpcnN0SWR4O1xuICAgICAgfVxuICAgICAgaWYgKGNvcnJlY3RlZExhc3RJZHggIT09IGxhc3RJZHgpIHtcbiAgICAgICAgbGFzdElkeCA9IGNvcnJlY3RlZExhc3RJZHg7XG4gICAgICB9XG5cbiAgICAgIGJvdW5kYXJ5SWRzW3Nlcmllc0lkeC0xXSA9IFtmaXJzdElkeCwgbGFzdElkeF07XG5cbiAgICAgIC8vIC5zbGljZSdzIGVuZCBpcyBleGNsdXNpdmUsIHdlIHdhbnQgdG8gaW5jbHVkZSBsYXN0SWR4LlxuICAgICAgc2VyaWVzID0gc2VyaWVzLnNsaWNlKGZpcnN0SWR4LCBsYXN0SWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlcmllcyA9IHJvbGxlZFNlcmllc1tzZXJpZXNJZHhdO1xuICAgICAgYm91bmRhcnlJZHNbc2VyaWVzSWR4LTFdID0gWzAsIHNlcmllcy5sZW5ndGgtMV07XG4gICAgfVxuXG4gICAgdmFyIHNlcmllc05hbWUgPSB0aGlzLmF0dHJfKFwibGFiZWxzXCIpW3Nlcmllc0lkeF07XG4gICAgdmFyIHNlcmllc0V4dHJlbWVzID0gdGhpcy5kYXRhSGFuZGxlcl8uZ2V0RXh0cmVtZVlWYWx1ZXMoc2VyaWVzLFxuICAgICAgICBkYXRlV2luZG93LCB0aGlzLmdldEJvb2xlYW5PcHRpb24oXCJzdGVwUGxvdFwiLCBzZXJpZXNOYW1lKSk7XG5cbiAgICB2YXIgc2VyaWVzUG9pbnRzID0gdGhpcy5kYXRhSGFuZGxlcl8uc2VyaWVzVG9Qb2ludHMoc2VyaWVzLFxuICAgICAgICBzZXJpZXNOYW1lLCBib3VuZGFyeUlkc1tzZXJpZXNJZHgtMV1bMF0pO1xuXG4gICAgaWYgKHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbihcInN0YWNrZWRHcmFwaFwiKSkge1xuICAgICAgYXhpc0lkeCA9IHRoaXMuYXR0cmlidXRlc18uYXhpc0ZvclNlcmllcyhzZXJpZXNOYW1lKTtcbiAgICAgIGlmIChjdW11bGF0aXZlWXZhbFtheGlzSWR4XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN1bXVsYXRpdmVZdmFsW2F4aXNJZHhdID0gW107XG4gICAgICB9XG4gICAgICBEeWdyYXBoLnN0YWNrUG9pbnRzXyhzZXJpZXNQb2ludHMsIGN1bXVsYXRpdmVZdmFsW2F4aXNJZHhdLCBzZXJpZXNFeHRyZW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbihcInN0YWNrZWRHcmFwaE5hTkZpbGxcIikpO1xuICAgIH1cblxuICAgIGV4dHJlbWVzW3Nlcmllc05hbWVdID0gc2VyaWVzRXh0cmVtZXM7XG4gICAgcG9pbnRzW3Nlcmllc0lkeF0gPSBzZXJpZXNQb2ludHM7XG4gIH1cblxuICByZXR1cm4geyBwb2ludHM6IHBvaW50cywgZXh0cmVtZXM6IGV4dHJlbWVzLCBib3VuZGFyeUlkczogYm91bmRhcnlJZHMgfTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBncmFwaCB3aXRoIG5ldyBkYXRhLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiB0aGUgdmlld2luZyBhcmVhXG4gKiBoYXMgY2hhbmdlZC4gSWYgdGhlIHVuZGVybHlpbmcgZGF0YSBvciBvcHRpb25zIGhhdmUgY2hhbmdlZCwgcHJlZHJhd18gd2lsbFxuICogYmUgY2FsbGVkIGJlZm9yZSBkcmF3R3JhcGhfIGlzIGNhbGxlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5kcmF3R3JhcGhfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGFydCA9IG5ldyBEYXRlKCk7XG5cbiAgLy8gVGhpcyBpcyB1c2VkIHRvIHNldCB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBkcmF3Q2FsbGJhY2ssIGJlbG93LlxuICB2YXIgaXNfaW5pdGlhbF9kcmF3ID0gdGhpcy5pc19pbml0aWFsX2RyYXdfO1xuICB0aGlzLmlzX2luaXRpYWxfZHJhd18gPSBmYWxzZTtcblxuICB0aGlzLmxheW91dF8ucmVtb3ZlQWxsRGF0YXNldHMoKTtcbiAgdGhpcy5zZXRDb2xvcnNfKCk7XG4gIHRoaXMuYXR0cnNfLnBvaW50U2l6ZSA9IDAuNSAqIHRoaXMuZ2V0TnVtZXJpY09wdGlvbignaGlnaGxpZ2h0Q2lyY2xlU2l6ZScpO1xuXG4gIHZhciBwYWNrZWQgPSB0aGlzLmdhdGhlckRhdGFzZXRzXyh0aGlzLnJvbGxlZFNlcmllc18sIHRoaXMuZGF0ZVdpbmRvd18pO1xuICB2YXIgcG9pbnRzID0gcGFja2VkLnBvaW50cztcbiAgdmFyIGV4dHJlbWVzID0gcGFja2VkLmV4dHJlbWVzO1xuICB0aGlzLmJvdW5kYXJ5SWRzXyA9IHBhY2tlZC5ib3VuZGFyeUlkcztcblxuICB0aGlzLnNldEluZGV4QnlOYW1lXyA9IHt9O1xuICB2YXIgbGFiZWxzID0gdGhpcy5hdHRyXyhcImxhYmVsc1wiKTtcbiAgdmFyIGRhdGFJZHggPSAwO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghdGhpcy52aXNpYmlsaXR5KClbaSAtIDFdKSBjb250aW51ZTtcbiAgICB0aGlzLmxheW91dF8uYWRkRGF0YXNldChsYWJlbHNbaV0sIHBvaW50c1tpXSk7XG4gICAgdGhpcy5kYXRhc2V0SW5kZXhfW2ldID0gZGF0YUlkeCsrO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGhpcy5zZXRJbmRleEJ5TmFtZV9bbGFiZWxzW2ldXSA9IGk7XG4gIH1cblxuICB0aGlzLmNvbXB1dGVZQXhpc1Jhbmdlc18oZXh0cmVtZXMpO1xuICB0aGlzLmxheW91dF8uc2V0WUF4ZXModGhpcy5heGVzXyk7XG5cbiAgdGhpcy5hZGRYVGlja3NfKCk7XG5cbiAgLy8gVGVsbCBQbG90S2l0IHRvIHVzZSB0aGlzIG5ldyBkYXRhIGFuZCByZW5kZXIgaXRzZWxmXG4gIHRoaXMubGF5b3V0Xy5ldmFsdWF0ZSgpO1xuICB0aGlzLnJlbmRlckdyYXBoXyhpc19pbml0aWFsX2RyYXcpO1xuXG4gIGlmICh0aGlzLmdldFN0cmluZ09wdGlvbihcInRpbWluZ05hbWVcIikpIHtcbiAgICB2YXIgZW5kID0gbmV3IERhdGUoKTtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmdldFN0cmluZ09wdGlvbihcInRpbWluZ05hbWVcIikgKyBcIiAtIGRyYXdHcmFwaDogXCIgKyAoZW5kIC0gc3RhcnQpICsgXCJtc1wiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBUaGlzIGRvZXMgdGhlIHdvcmsgb2YgZHJhd2luZyB0aGUgY2hhcnQuIEl0IGFzc3VtZXMgdGhhdCB0aGUgbGF5b3V0IGFuZCBheGlzXG4gKiBzY2FsZXMgaGF2ZSBhbHJlYWR5IGJlZW4gc2V0IChlLmcuIGJ5IHByZWRyYXdfKS5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5yZW5kZXJHcmFwaF8gPSBmdW5jdGlvbihpc19pbml0aWFsX2RyYXcpIHtcbiAgdGhpcy5jYXNjYWRlRXZlbnRzXygnY2xlYXJDaGFydCcpO1xuICB0aGlzLnBsb3R0ZXJfLmNsZWFyKCk7XG5cbiAgY29uc3QgdW5kZXJsYXlDYWxsYmFjayA9IHRoaXMuZ2V0RnVuY3Rpb25PcHRpb24oJ3VuZGVybGF5Q2FsbGJhY2snKTtcbiAgaWYgKHVuZGVybGF5Q2FsbGJhY2spIHtcbiAgICAvLyBOT1RFOiB3ZSBwYXNzIHRoZSBkeWdyYXBoIG9iamVjdCB0byB0aGlzIGNhbGxiYWNrIHR3aWNlIHRvIGF2b2lkIGJyZWFraW5nXG4gICAgLy8gdXNlcnMgd2hvIGV4cGVjdCBhIGRlcHJlY2F0ZWQgZm9ybSBvZiB0aGlzIGNhbGxiYWNrLlxuICAgIHVuZGVybGF5Q2FsbGJhY2suY2FsbCh0aGlzLFxuICAgICAgICB0aGlzLmhpZGRlbl9jdHhfLCB0aGlzLmxheW91dF8uZ2V0UGxvdEFyZWEoKSwgdGhpcywgdGhpcyk7XG4gIH1cblxuICB2YXIgZSA9IHtcbiAgICBjYW52YXM6IHRoaXMuaGlkZGVuXyxcbiAgICBkcmF3aW5nQ29udGV4dDogdGhpcy5oaWRkZW5fY3R4X1xuICB9O1xuICB0aGlzLmNhc2NhZGVFdmVudHNfKCd3aWxsRHJhd0NoYXJ0JywgZSk7XG4gIHRoaXMucGxvdHRlcl8ucmVuZGVyKCk7XG4gIHRoaXMuY2FzY2FkZUV2ZW50c18oJ2RpZERyYXdDaGFydCcsIGUpO1xuICB0aGlzLmxhc3RSb3dfID0gLTE7ICAvLyBiZWNhdXNlIHBsdWdpbnMvbGVnZW5kLmpzIGNsZWFycyB0aGUgbGVnZW5kXG5cbiAgLy8gVE9ETyhkYW52ayk6IGlzIHRoaXMgYSBwZXJmb3JtYW5jZSBib3R0bGVuZWNrIHdoZW4gcGFubmluZz9cbiAgLy8gVGhlIGludGVyYWN0aW9uIGNhbnZhcyBzaG91bGQgYWxyZWFkeSBiZSBlbXB0eSBpbiB0aGF0IHNpdHVhdGlvbi5cbiAgdGhpcy5jYW52YXNfLmdldENvbnRleHQoJzJkJykuY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGhfLCB0aGlzLmhlaWdodF8pO1xuXG4gIGNvbnN0IGRyYXdDYWxsYmFjayA9IHRoaXMuZ2V0RnVuY3Rpb25PcHRpb24oXCJkcmF3Q2FsbGJhY2tcIik7XG4gIGlmIChkcmF3Q2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICBkcmF3Q2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzLCBpc19pbml0aWFsX2RyYXcpO1xuICB9XG4gIGlmIChpc19pbml0aWFsX2RyYXcpIHtcbiAgICB0aGlzLnJlYWR5RmlyZWRfID0gdHJ1ZTtcbiAgICB3aGlsZSAodGhpcy5yZWFkeUZuc18ubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGZuID0gdGhpcy5yZWFkeUZuc18ucG9wKCk7XG4gICAgICBmbih0aGlzKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIERldGVybWluZSBwcm9wZXJ0aWVzIG9mIHRoZSB5LWF4ZXMgd2hpY2ggYXJlIGluZGVwZW5kZW50IG9mIHRoZSBkYXRhXG4gKiBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkLiBUaGlzIGluY2x1ZGVzIHRoaW5ncyBsaWtlIHRoZSBudW1iZXIgb2YgYXhlcyBhbmRcbiAqIHRoZSBzdHlsZSBvZiB0aGUgYXhlcy4gSXQgZG9lcyBub3QgaW5jbHVkZSB0aGUgcmFuZ2Ugb2YgZWFjaCBheGlzIGFuZCBpdHNcbiAqIHRpY2sgbWFya3MuXG4gKiBUaGlzIGZpbGxzIGluIHRoaXMuYXhlc18uXG4gKiBheGVzXyA9IFsgeyBvcHRpb25zIH0gXVxuICogICBpbmRpY2VzIGFyZSBpbnRvIHRoZSBheGVzXyBhcnJheS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY29tcHV0ZVlBeGVzXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXhpcywgaW5kZXgsIG9wdHMsIHY7XG5cbiAgLy8gdGhpcy5heGVzXyBkb2Vzbid0IG1hdGNoIHRoaXMuYXR0cmlidXRlc18uYXhlc18ub3B0aW9ucy4gSXQncyB1c2VkIGZvclxuICAvLyBkYXRhIGNvbXB1dGF0aW9uIGFzIHdlbGwgYXMgb3B0aW9ucyBzdG9yYWdlLlxuICAvLyBHbyB0aHJvdWdoIG9uY2UgYW5kIGFkZCBhbGwgdGhlIGF4ZXMuXG4gIHRoaXMuYXhlc18gPSBbXTtcblxuICBmb3IgKGF4aXMgPSAwOyBheGlzIDwgdGhpcy5hdHRyaWJ1dGVzXy5udW1BeGVzKCk7IGF4aXMrKykge1xuICAgIC8vIEFkZCBhIG5ldyBheGlzLCBtYWtpbmcgYSBjb3B5IG9mIGl0cyBwZXItYXhpcyBvcHRpb25zLlxuICAgIG9wdHMgPSB7IGcgOiB0aGlzIH07XG4gICAgdXRpbHMudXBkYXRlKG9wdHMsIHRoaXMuYXR0cmlidXRlc18uYXhpc09wdGlvbnMoYXhpcykpO1xuICAgIHRoaXMuYXhlc19bYXhpc10gPSBvcHRzO1xuICB9XG5cbiAgZm9yIChheGlzID0gMDsgYXhpcyA8IHRoaXMuYXhlc18ubGVuZ3RoOyBheGlzKyspIHtcbiAgICBpZiAoYXhpcyA9PT0gMCkge1xuICAgICAgb3B0cyA9IHRoaXMub3B0aW9uc1ZpZXdGb3JBeGlzXygneScgKyAoYXhpcyA/ICcyJyA6ICcnKSk7XG4gICAgICB2ID0gb3B0cyhcInZhbHVlUmFuZ2VcIik7XG4gICAgICBpZiAodikgdGhpcy5heGVzX1theGlzXS52YWx1ZVJhbmdlID0gdjtcbiAgICB9IGVsc2UgeyAgLy8gVG8ga2VlcCBvbGQgYmVoYXZpb3JcbiAgICAgIHZhciBheGVzID0gdGhpcy51c2VyX2F0dHJzXy5heGVzO1xuICAgICAgaWYgKGF4ZXMgJiYgYXhlcy55Mikge1xuICAgICAgICB2ID0gYXhlcy55Mi52YWx1ZVJhbmdlO1xuICAgICAgICBpZiAodikgdGhpcy5heGVzX1theGlzXS52YWx1ZVJhbmdlID0gdjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHktYXhlcyBvbiB0aGUgY2hhcnQuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgYXhlcy5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUubnVtQXhlcyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzXy5udW1BeGVzKCk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBSZXR1cm5zIGF4aXMgcHJvcGVydGllcyBmb3IgdGhlIGdpdmVuIHNlcmllcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzZXROYW1lIFRoZSBuYW1lIG9mIHRoZSBzZXJpZXMgZm9yIHdoaWNoIHRvIGdldCBheGlzXG4gKiBwcm9wZXJ0aWVzLCBlLmcuICdZMScuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBheGlzIHByb3BlcnRpZXMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmF4aXNQcm9wZXJ0aWVzRm9yU2VyaWVzID0gZnVuY3Rpb24oc2VyaWVzKSB7XG4gIC8vIFRPRE8oZGFudmspOiBoYW5kbGUgZXJyb3JzLlxuICByZXR1cm4gdGhpcy5heGVzX1t0aGlzLmF0dHJpYnV0ZXNfLmF4aXNGb3JTZXJpZXMoc2VyaWVzKV07XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBEZXRlcm1pbmUgdGhlIHZhbHVlIHJhbmdlIGFuZCB0aWNrIG1hcmtzIGZvciBlYWNoIGF4aXMuXG4gKiBAcGFyYW0ge09iamVjdH0gZXh0cmVtZXMgQSBtYXBwaW5nIGZyb20gc2VyaWVzTmFtZSAtPiBbbG93LCBoaWdoXVxuICogVGhpcyBmaWxscyBpbiB0aGUgdmFsdWVSYW5nZSBhbmQgdGlja3MgZmllbGRzIGluIGVhY2ggZW50cnkgb2YgdGhpcy5heGVzXy5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY29tcHV0ZVlBeGlzUmFuZ2VzXyA9IGZ1bmN0aW9uKGV4dHJlbWVzKSB7XG4gIHZhciBpc051bGxVbmRlZmluZWRPck5hTiA9IGZ1bmN0aW9uKG51bSkge1xuICAgIHJldHVybiBpc05hTihwYXJzZUZsb2F0KG51bSkpO1xuICB9O1xuICB2YXIgbnVtQXhlcyA9IHRoaXMuYXR0cmlidXRlc18ubnVtQXhlcygpO1xuICB2YXIgeXBhZENvbXBhdCwgc3Bhbiwgc2VyaWVzLCB5cGFkO1xuXG4gIHZhciBwX2F4aXM7XG5cbiAgLy8gQ29tcHV0ZSBleHRyZW1lIHZhbHVlcywgYSBzcGFuIGFuZCB0aWNrIG1hcmtzIGZvciBlYWNoIGF4aXMuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtQXhlczsgaSsrKSB7XG4gICAgdmFyIGF4aXMgPSB0aGlzLmF4ZXNfW2ldO1xuICAgIHZhciBsb2dzY2FsZSA9IHRoaXMuYXR0cmlidXRlc18uZ2V0Rm9yQXhpcyhcImxvZ3NjYWxlXCIsIGkpO1xuICAgIHZhciBpbmNsdWRlWmVybyA9IHRoaXMuYXR0cmlidXRlc18uZ2V0Rm9yQXhpcyhcImluY2x1ZGVaZXJvXCIsIGkpO1xuICAgIHZhciBpbmRlcGVuZGVudFRpY2tzID0gdGhpcy5hdHRyaWJ1dGVzXy5nZXRGb3JBeGlzKFwiaW5kZXBlbmRlbnRUaWNrc1wiLCBpKTtcbiAgICBzZXJpZXMgPSB0aGlzLmF0dHJpYnV0ZXNfLnNlcmllc0ZvckF4aXMoaSk7XG5cbiAgICAvLyBBZGQgc29tZSBwYWRkaW5nLiBUaGlzIHN1cHBvcnRzIHR3byBZIHBhZGRpbmcgb3BlcmF0aW9uIG1vZGVzOlxuICAgIC8vXG4gICAgLy8gLSBiYWNrd2FyZHMgY29tcGF0aWJsZSAoeVJhbmdlUGFkIG5vdCBzZXQpOlxuICAgIC8vICAgMTAlIHBhZGRpbmcgZm9yIGF1dG9tYXRpYyBZIHJhbmdlcywgYnV0IG5vdCBmb3IgdXNlci1zdXBwbGllZFxuICAgIC8vICAgcmFuZ2VzLCBhbmQgbW92ZSBhIGNsb3NlLXRvLXplcm8gZWRnZSB0byB6ZXJvLCBzaW5jZSBkcmF3aW5nIGF0IHRoZSBlZGdlXG4gICAgLy8gICByZXN1bHRzIGluIGludmlzaWJsZSBsaW5lcy4gVW5mb3J0dW5hdGVseSBsaW5lcyBkcmF3biBhdCB0aGUgZWRnZSBvZiBhXG4gICAgLy8gICB1c2VyLXN1cHBsaWVkIHJhbmdlIHdpbGwgc3RpbGwgYmUgaW52aXNpYmxlLiBJZiBsb2dzY2FsZSBpc1xuICAgIC8vICAgc2V0LCBhZGQgYSB2YXJpYWJsZSBhbW91bnQgb2YgcGFkZGluZyBhdCB0aGUgdG9wIGJ1dFxuICAgIC8vICAgbm9uZSBhdCB0aGUgYm90dG9tLlxuICAgIC8vXG4gICAgLy8gLSBuZXctc3R5bGUgKHlSYW5nZVBhZCBzZXQgYnkgdGhlIHVzZXIpOlxuICAgIC8vICAgYWx3YXlzIGFkZCB0aGUgc3BlY2lmaWVkIFkgcGFkZGluZy5cbiAgICAvL1xuICAgIHlwYWRDb21wYXQgPSB0cnVlO1xuICAgIHlwYWQgPSAwLjE7IC8vIGFkZCAxMCVcbiAgICBjb25zdCB5UmFuZ2VQYWQgPSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ3lSYW5nZVBhZCcpO1xuICAgIGlmICh5UmFuZ2VQYWQgIT09IG51bGwpIHtcbiAgICAgIHlwYWRDb21wYXQgPSBmYWxzZTtcbiAgICAgIC8vIENvbnZlcnQgcGl4ZWwgcGFkZGluZyB0byByYXRpb1xuICAgICAgeXBhZCA9IHlSYW5nZVBhZCAvIHRoaXMucGxvdHRlcl8uYXJlYS5oO1xuICAgIH1cblxuICAgIGlmIChzZXJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBJZiBubyBzZXJpZXMgYXJlIGRlZmluZWQgb3IgdmlzaWJsZSB0aGVuIHVzZSBhIHJlYXNvbmFibGUgZGVmYXVsdFxuICAgICAgYXhpcy5leHRyZW1lUmFuZ2UgPSBbMCwgMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZXh0cmVtZXMgb2YgZXh0cmVtZXMuXG4gICAgICB2YXIgbWluWSA9IEluZmluaXR5OyAgLy8gZXh0cmVtZXNbc2VyaWVzWzBdXVswXTtcbiAgICAgIHZhciBtYXhZID0gLUluZmluaXR5OyAgLy8gZXh0cmVtZXNbc2VyaWVzWzBdXVsxXTtcbiAgICAgIHZhciBleHRyZW1lTWluWSwgZXh0cmVtZU1heFk7XG5cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2VyaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIC8vIHRoaXMgc2tpcHMgaW52aXNpYmxlIHNlcmllc1xuICAgICAgICBpZiAoIWV4dHJlbWVzLmhhc093blByb3BlcnR5KHNlcmllc1tqXSkpIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIE9ubHkgdXNlIHZhbGlkIGV4dHJlbWVzIHRvIHN0b3AgbnVsbCBkYXRhIHNlcmllcycgZnJvbSBjb3JydXB0aW5nIHRoZSBzY2FsZS5cbiAgICAgICAgZXh0cmVtZU1pblkgPSBleHRyZW1lc1tzZXJpZXNbal1dWzBdO1xuICAgICAgICBpZiAoZXh0cmVtZU1pblkgIT09IG51bGwpIHtcbiAgICAgICAgICBtaW5ZID0gTWF0aC5taW4oZXh0cmVtZU1pblksIG1pblkpO1xuICAgICAgICB9XG4gICAgICAgIGV4dHJlbWVNYXhZID0gZXh0cmVtZXNbc2VyaWVzW2pdXVsxXTtcbiAgICAgICAgaWYgKGV4dHJlbWVNYXhZICE9PSBudWxsKSB7XG4gICAgICAgICAgbWF4WSA9IE1hdGgubWF4KGV4dHJlbWVNYXhZLCBtYXhZKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJbmNsdWRlIHplcm8gaWYgcmVxdWVzdGVkIGJ5IHRoZSB1c2VyLlxuICAgICAgaWYgKGluY2x1ZGVaZXJvICYmICFsb2dzY2FsZSkge1xuICAgICAgICBpZiAobWluWSA+IDApIG1pblkgPSAwO1xuICAgICAgICBpZiAobWF4WSA8IDApIG1heFkgPSAwO1xuICAgICAgfVxuXG4gICAgICAvLyBFbnN1cmUgd2UgaGF2ZSBhIHZhbGlkIHNjYWxlLCBvdGhlcndpc2UgZGVmYXVsdCB0byBbMCwgMV0gZm9yIHNhZmV0eS5cbiAgICAgIGlmIChtaW5ZID09IEluZmluaXR5KSBtaW5ZID0gMDtcbiAgICAgIGlmIChtYXhZID09IC1JbmZpbml0eSkgbWF4WSA9IDE7XG5cbiAgICAgIHNwYW4gPSBtYXhZIC0gbWluWTtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogaWYgd2UgaGF2ZSBubyBzZW5zZSBvZiBzY2FsZSwgY2VudGVyIG9uIHRoZSBzb2xlIHZhbHVlLlxuICAgICAgaWYgKHNwYW4gPT09IDApIHtcbiAgICAgICAgaWYgKG1heFkgIT09IDApIHtcbiAgICAgICAgICBzcGFuID0gTWF0aC5hYnMobWF4WSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gLi4uIGFuZCBpZiB0aGUgc29sZSB2YWx1ZSBpcyB6ZXJvLCB1c2UgcmFuZ2UgMC0xLlxuICAgICAgICAgIG1heFkgPSAxO1xuICAgICAgICAgIHNwYW4gPSAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBtYXhBeGlzWSA9IG1heFksIG1pbkF4aXNZID0gbWluWTtcbiAgICAgIGlmICh5cGFkQ29tcGF0KSB7XG4gICAgICAgIGlmIChsb2dzY2FsZSkge1xuICAgICAgICAgIG1heEF4aXNZID0gbWF4WSArIHlwYWQgKiBzcGFuO1xuICAgICAgICAgIG1pbkF4aXNZID0gbWluWTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXhBeGlzWSA9IG1heFkgKyB5cGFkICogc3BhbjtcbiAgICAgICAgICBtaW5BeGlzWSA9IG1pblkgLSB5cGFkICogc3BhbjtcblxuICAgICAgICAgIC8vIEJhY2t3YXJkcy1jb21wYXRpYmxlIGJlaGF2aW9yOiBNb3ZlIHRoZSBzcGFuIHRvIHN0YXJ0IG9yIGVuZCBhdCB6ZXJvIGlmIGl0J3NcbiAgICAgICAgICAvLyBjbG9zZSB0byB6ZXJvLlxuICAgICAgICAgIGlmIChtaW5BeGlzWSA8IDAgJiYgbWluWSA+PSAwKSBtaW5BeGlzWSA9IDA7XG4gICAgICAgICAgaWYgKG1heEF4aXNZID4gMCAmJiBtYXhZIDw9IDApIG1heEF4aXNZID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXhpcy5leHRyZW1lUmFuZ2UgPSBbbWluQXhpc1ksIG1heEF4aXNZXTtcbiAgICB9XG4gICAgaWYgKGF4aXMudmFsdWVSYW5nZSkge1xuICAgICAgLy8gVGhpcyBpcyBhIHVzZXItc2V0IHZhbHVlIHJhbmdlIGZvciB0aGlzIGF4aXMuXG4gICAgICB2YXIgeTAgPSBpc051bGxVbmRlZmluZWRPck5hTihheGlzLnZhbHVlUmFuZ2VbMF0pID8gYXhpcy5leHRyZW1lUmFuZ2VbMF0gOiBheGlzLnZhbHVlUmFuZ2VbMF07XG4gICAgICB2YXIgeTEgPSBpc051bGxVbmRlZmluZWRPck5hTihheGlzLnZhbHVlUmFuZ2VbMV0pID8gYXhpcy5leHRyZW1lUmFuZ2VbMV0gOiBheGlzLnZhbHVlUmFuZ2VbMV07XG4gICAgICBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZSA9IFt5MCwgeTFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZSA9IGF4aXMuZXh0cmVtZVJhbmdlO1xuICAgIH1cbiAgICBpZiAoIXlwYWRDb21wYXQpIHtcbiAgICAgIC8vIFdoZW4gdXNpbmcgeVJhbmdlUGFkLCBhZGp1c3QgdGhlIHVwcGVyL2xvd2VyIGJvdW5kcyB0byBhZGRcbiAgICAgIC8vIHBhZGRpbmcgdW5sZXNzIHRoZSB1c2VyIGhhcyB6b29tZWQvcGFubmVkIHRoZSBZIGF4aXMgcmFuZ2UuXG5cbiAgICAgIHkwID0gYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMF07XG4gICAgICB5MSA9IGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzFdO1xuXG4gICAgICAvLyBzcGVjaWFsIGNhc2UgIzc4MTogaWYgd2UgaGF2ZSBubyBzZW5zZSBvZiBzY2FsZSwgY2VudGVyIG9uIHRoZSBzb2xlIHZhbHVlLlxuICAgICAgaWYgKHkwID09PSB5MSkge1xuICAgICAgICBpZih5MCA9PT0gMCkge1xuICAgICAgICAgIHkxID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgZGVsdGEgPSBNYXRoLmFicyh5MCAvIDEwKTtcbiAgICAgICAgICB5MCAtPSBkZWx0YTtcbiAgICAgICAgICB5MSArPSBkZWx0YTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobG9nc2NhbGUpIHtcbiAgICAgICAgdmFyIHkwcGN0ID0geXBhZCAvICgyICogeXBhZCAtIDEpO1xuICAgICAgICB2YXIgeTFwY3QgPSAoeXBhZCAtIDEpIC8gKDIgKiB5cGFkIC0gMSk7XG4gICAgICAgIGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzBdID0gdXRpbHMubG9nUmFuZ2VGcmFjdGlvbih5MCwgeTEsIHkwcGN0KTtcbiAgICAgICAgYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV0gPSB1dGlscy5sb2dSYW5nZUZyYWN0aW9uKHkwLCB5MSwgeTFwY3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3BhbiA9IHkxIC0geTA7XG4gICAgICAgIGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzBdID0geTAgLSBzcGFuICogeXBhZDtcbiAgICAgICAgYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV0gPSB5MSArIHNwYW4gKiB5cGFkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpbmRlcGVuZGVudFRpY2tzKSB7XG4gICAgICBheGlzLmluZGVwZW5kZW50VGlja3MgPSBpbmRlcGVuZGVudFRpY2tzO1xuICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnNWaWV3Rm9yQXhpc18oJ3knICsgKGkgPyAnMicgOiAnJykpO1xuICAgICAgdmFyIHRpY2tlciA9IG9wdHMoJ3RpY2tlcicpO1xuICAgICAgYXhpcy50aWNrcyA9IHRpY2tlcihheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXSxcbiAgICAgICAgICAgICAgYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV0sXG4gICAgICAgICAgICAgIHRoaXMucGxvdHRlcl8uYXJlYS5oLFxuICAgICAgICAgICAgICBvcHRzLFxuICAgICAgICAgICAgICB0aGlzKTtcbiAgICAgIC8vIERlZmluZSB0aGUgZmlyc3QgaW5kZXBlbmRlbnQgYXhpcyBhcyBwcmltYXJ5IGF4aXMuXG4gICAgICBpZiAoIXBfYXhpcykgcF9heGlzID0gYXhpcztcbiAgICB9XG4gIH1cbiAgaWYgKHBfYXhpcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgKFwiQ29uZmlndXJhdGlvbiBFcnJvcjogQXQgbGVhc3Qgb25lIGF4aXMgaGFzIHRvIGhhdmUgdGhlIFxcXCJpbmRlcGVuZGVudFRpY2tzXFxcIiBvcHRpb24gYWN0aXZhdGVkLlwiKTtcbiAgfVxuICAvLyBBZGQgdGlja3MuIEJ5IGRlZmF1bHQsIGFsbCBheGVzIGluaGVyaXQgdGhlIHRpY2sgcG9zaXRpb25zIG9mIHRoZVxuICAvLyBwcmltYXJ5IGF4aXMuIEhvd2V2ZXIsIGlmIGFuIGF4aXMgaXMgc3BlY2lmaWNhbGx5IG1hcmtlZCBhcyBoYXZpbmdcbiAgLy8gaW5kZXBlbmRlbnQgdGlja3MsIHRoZW4gdGhhdCBpcyBwZXJtaXNzaWJsZSBhcyB3ZWxsLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUF4ZXM7IGkrKykge1xuICAgIHZhciBheGlzID0gdGhpcy5heGVzX1tpXTtcblxuICAgIGlmICghYXhpcy5pbmRlcGVuZGVudFRpY2tzKSB7XG4gICAgICB2YXIgb3B0cyA9IHRoaXMub3B0aW9uc1ZpZXdGb3JBeGlzXygneScgKyAoaSA/ICcyJyA6ICcnKSk7XG4gICAgICB2YXIgdGlja2VyID0gb3B0cygndGlja2VyJyk7XG4gICAgICB2YXIgcF90aWNrcyA9IHBfYXhpcy50aWNrcztcbiAgICAgIHZhciBwX3NjYWxlID0gcF9heGlzLmNvbXB1dGVkVmFsdWVSYW5nZVsxXSAtIHBfYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMF07XG4gICAgICB2YXIgc2NhbGUgPSBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVsxXSAtIGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzBdO1xuICAgICAgdmFyIHRpY2tfdmFsdWVzID0gW107XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHBfdGlja3MubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIHlfZnJhYyA9IChwX3RpY2tzW2tdLnYgLSBwX2F4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzBdKSAvIHBfc2NhbGU7XG4gICAgICAgIHZhciB5X3ZhbCA9IGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzBdICsgeV9mcmFjICogc2NhbGU7XG4gICAgICAgIHRpY2tfdmFsdWVzLnB1c2goeV92YWwpO1xuICAgICAgfVxuXG4gICAgICBheGlzLnRpY2tzID0gdGlja2VyKGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbG90dGVyXy5hcmVhLmgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tfdmFsdWVzKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRGV0ZWN0cyB0aGUgdHlwZSBvZiB0aGUgc3RyIChkYXRlIG9yIG51bWVyaWMpIGFuZCBzZXRzIHRoZSB2YXJpb3VzXG4gKiBmb3JtYXR0aW5nIGF0dHJpYnV0ZXMgaW4gdGhpcy5hdHRyc18gYmFzZWQgb24gdGhpcyB0eXBlLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBBbiB4IHZhbHVlLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZGV0ZWN0VHlwZUZyb21TdHJpbmdfID0gZnVuY3Rpb24oc3RyKSB7XG4gIHZhciBpc0RhdGUgPSBmYWxzZTtcbiAgdmFyIGRhc2hQb3MgPSBzdHIuaW5kZXhPZignLScpOyAgLy8gY291bGQgYmUgMjAwNi0wMS0wMSBfb3JfIDEuMGUtMlxuICBpZiAoKGRhc2hQb3MgPiAwICYmIChzdHJbZGFzaFBvcy0xXSAhPSAnZScgJiYgc3RyW2Rhc2hQb3MtMV0gIT0gJ0UnKSkgfHxcbiAgICAgIHN0ci5pbmRleE9mKCcvJykgPj0gMCB8fFxuICAgICAgaXNOYU4ocGFyc2VGbG9hdChzdHIpKSkge1xuICAgIGlzRGF0ZSA9IHRydWU7XG4gIH1cblxuICB0aGlzLnNldFhBeGlzT3B0aW9uc18oaXNEYXRlKTtcbn07XG5cbkR5Z3JhcGgucHJvdG90eXBlLnNldFhBeGlzT3B0aW9uc18gPSBmdW5jdGlvbihpc0RhdGUpIHtcbiAgaWYgKGlzRGF0ZSkge1xuICAgIHRoaXMuYXR0cnNfLnhWYWx1ZVBhcnNlciA9IHV0aWxzLmRhdGVQYXJzZXI7XG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnZhbHVlRm9ybWF0dGVyID0gdXRpbHMuZGF0ZVZhbHVlRm9ybWF0dGVyO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC50aWNrZXIgPSBEeWdyYXBoVGlja2Vycy5kYXRlVGlja2VyO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC5heGlzTGFiZWxGb3JtYXR0ZXIgPSB1dGlscy5kYXRlQXhpc0xhYmVsRm9ybWF0dGVyO1xuICB9IGVsc2Uge1xuICAgIC8qKiBAcHJpdmF0ZSAoc2h1dCB1cCwganNkb2MhKSAqL1xuICAgIHRoaXMuYXR0cnNfLnhWYWx1ZVBhcnNlciA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHBhcnNlRmxvYXQoeCk7IH07XG4gICAgLy8gVE9ETyhkYW52ayk6IHVzZSBEeWdyYXBoLm51bWJlclZhbHVlRm9ybWF0dGVyIGhlcmU/XG4gICAgLyoqIEBwcml2YXRlIChzaHV0IHVwLCBqc2RvYyEpICovXG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnZhbHVlRm9ybWF0dGVyID0gZnVuY3Rpb24oeCkgeyByZXR1cm4geDsgfTtcbiAgICB0aGlzLmF0dHJzXy5heGVzLngudGlja2VyID0gRHlncmFwaFRpY2tlcnMubnVtZXJpY1RpY2tzO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC5heGlzTGFiZWxGb3JtYXR0ZXIgPSB0aGlzLmF0dHJzXy5heGVzLngudmFsdWVGb3JtYXR0ZXI7XG4gIH1cbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFBhcnNlcyBhIHN0cmluZyBpbiBhIHNwZWNpYWwgY3N2IGZvcm1hdC4gIFdlIGV4cGVjdCBhIGNzdiBmaWxlIHdoZXJlIGVhY2hcbiAqIGxpbmUgaXMgYSBkYXRlIHBvaW50LCBhbmQgdGhlIGZpcnN0IGZpZWxkIGluIGVhY2ggbGluZSBpcyB0aGUgZGF0ZSBzdHJpbmcuXG4gKiBXZSBhbHNvIGV4cGVjdCB0aGF0IGFsbCByZW1haW5pbmcgZmllbGRzIHJlcHJlc2VudCBzZXJpZXMuXG4gKiBpZiB0aGUgZXJyb3JCYXJzIGF0dHJpYnV0ZSBpcyBzZXQsIHRoZW4gaW50ZXJwcmV0IHRoZSBmaWVsZHMgYXM6XG4gKiBkYXRlLCBzZXJpZXMxLCBzdGRkZXYxLCBzZXJpZXMyLCBzdGRkZXYyLCAuLi5cbiAqIEBwYXJhbSB7W09iamVjdF19IGRhdGEgU2VlIGFib3ZlLlxuICpcbiAqIEByZXR1cm4gW09iamVjdF0gQW4gYXJyYXkgd2l0aCBvbmUgZW50cnkgZm9yIGVhY2ggcm93LiBUaGVzZSBlbnRyaWVzXG4gKiBhcmUgYW4gYXJyYXkgb2YgY2VsbHMgaW4gdGhhdCByb3cuIFRoZSBmaXJzdCBlbnRyeSBpcyB0aGUgcGFyc2VkIHgtdmFsdWUgZm9yXG4gKiB0aGUgcm93LiBUaGUgc2Vjb25kLCB0aGlyZCwgZXRjLiBhcmUgdGhlIHktdmFsdWVzLiBUaGVzZSBjYW4gdGFrZSBvbiBvbmUgb2ZcbiAqIHRocmVlIGZvcm1zLCBkZXBlbmRpbmcgb24gdGhlIENTViBhbmQgY29uc3RydWN0b3IgcGFyYW1ldGVyczpcbiAqIDEuIG51bWVyaWMgdmFsdWVcbiAqIDIuIFsgdmFsdWUsIHN0ZGRldiBdXG4gKiAzLiBbIGxvdyB2YWx1ZSwgY2VudGVyIHZhbHVlLCBoaWdoIHZhbHVlIF1cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUucGFyc2VDU1ZfID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgcmV0ID0gW107XG4gIHZhciBsaW5lX2RlbGltaXRlciA9IHV0aWxzLmRldGVjdExpbmVEZWxpbWl0ZXIoZGF0YSk7XG4gIHZhciBsaW5lcyA9IGRhdGEuc3BsaXQobGluZV9kZWxpbWl0ZXIgfHwgXCJcXG5cIik7XG4gIHZhciB2YWxzLCBqO1xuXG4gIC8vIFVzZSB0aGUgZGVmYXVsdCBkZWxpbWl0ZXIgb3IgZmFsbCBiYWNrIHRvIGEgdGFiIGlmIHRoYXQgbWFrZXMgc2Vuc2UuXG4gIHZhciBkZWxpbSA9IHRoaXMuZ2V0U3RyaW5nT3B0aW9uKCdkZWxpbWl0ZXInKTtcbiAgaWYgKGxpbmVzWzBdLmluZGV4T2YoZGVsaW0pID09IC0xICYmIGxpbmVzWzBdLmluZGV4T2YoJ1xcdCcpID49IDApIHtcbiAgICBkZWxpbSA9ICdcXHQnO1xuICB9XG5cbiAgdmFyIHN0YXJ0ID0gMDtcbiAgaWYgKCEoJ2xhYmVscycgaW4gdGhpcy51c2VyX2F0dHJzXykpIHtcbiAgICAvLyBVc2VyIGhhc24ndCBleHBsaWNpdGx5IHNldCBsYWJlbHMsIHNvIHRoZXkncmUgKHByZXN1bWFibHkpIGluIHRoZSBDU1YuXG4gICAgc3RhcnQgPSAxO1xuICAgIHRoaXMuYXR0cnNfLmxhYmVscyA9IGxpbmVzWzBdLnNwbGl0KGRlbGltKTsgIC8vIE5PVEU6IF9ub3RfIHVzZXJfYXR0cnNfLlxuICAgIHRoaXMuYXR0cmlidXRlc18ucmVwYXJzZVNlcmllcygpO1xuICB9XG4gIHZhciBsaW5lX25vID0gMDtcblxuICB2YXIgeFBhcnNlcjtcbiAgdmFyIGRlZmF1bHRQYXJzZXJTZXQgPSBmYWxzZTsgIC8vIGF0dGVtcHQgdG8gYXV0by1kZXRlY3QgeCB2YWx1ZSB0eXBlXG4gIHZhciBleHBlY3RlZENvbHMgPSB0aGlzLmF0dHJfKFwibGFiZWxzXCIpLmxlbmd0aDtcbiAgdmFyIG91dE9mT3JkZXIgPSBmYWxzZTtcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbGluZSA9IGxpbmVzW2ldO1xuICAgIGxpbmVfbm8gPSBpO1xuICAgIGlmIChsaW5lLmxlbmd0aCA9PT0gMCkgY29udGludWU7ICAvLyBza2lwIGJsYW5rIGxpbmVzXG4gICAgaWYgKGxpbmVbMF0gPT0gJyMnKSBjb250aW51ZTsgICAgLy8gc2tpcCBjb21tZW50IGxpbmVzXG4gICAgdmFyIGluRmllbGRzID0gbGluZS5zcGxpdChkZWxpbSk7XG4gICAgaWYgKGluRmllbGRzLmxlbmd0aCA8IDIpIGNvbnRpbnVlO1xuXG4gICAgdmFyIGZpZWxkcyA9IFtdO1xuICAgIGlmICghZGVmYXVsdFBhcnNlclNldCkge1xuICAgICAgdGhpcy5kZXRlY3RUeXBlRnJvbVN0cmluZ18oaW5GaWVsZHNbMF0pO1xuICAgICAgeFBhcnNlciA9IHRoaXMuZ2V0RnVuY3Rpb25PcHRpb24oXCJ4VmFsdWVQYXJzZXJcIik7XG4gICAgICBkZWZhdWx0UGFyc2VyU2V0ID0gdHJ1ZTtcbiAgICB9XG4gICAgZmllbGRzWzBdID0geFBhcnNlcihpbkZpZWxkc1swXSwgdGhpcyk7XG5cbiAgICAvLyBJZiBmcmFjdGlvbnMgYXJlIGV4cGVjdGVkLCBwYXJzZSB0aGUgbnVtYmVycyBhcyBcIkEvQlwiXG4gICAgaWYgKHRoaXMuZnJhY3Rpb25zXykge1xuICAgICAgZm9yIChqID0gMTsgaiA8IGluRmllbGRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIC8vIFRPRE8oZGFudmspOiBmaWd1cmUgb3V0IGFuIGFwcHJvcHJpYXRlIHdheSB0byBmbGFnIHBhcnNlIGVycm9ycy5cbiAgICAgICAgdmFscyA9IGluRmllbGRzW2pdLnNwbGl0KFwiL1wiKTtcbiAgICAgICAgaWYgKHZhbHMubGVuZ3RoICE9IDIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeHBlY3RlZCBmcmFjdGlvbmFsIFwibnVtL2RlblwiIHZhbHVlcyBpbiBDU1YgZGF0YSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYnV0IGZvdW5kIGEgdmFsdWUgJ1wiICsgaW5GaWVsZHNbal0gKyBcIicgb24gbGluZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAoMSArIGkpICsgXCIgKCdcIiArIGxpbmUgKyBcIicpIHdoaWNoIGlzIG5vdCBvZiB0aGlzIGZvcm0uXCIpO1xuICAgICAgICAgIGZpZWxkc1tqXSA9IFswLCAwXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaWVsZHNbal0gPSBbdXRpbHMucGFyc2VGbG9hdF8odmFsc1swXSwgaSwgbGluZSksXG4gICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLnBhcnNlRmxvYXRfKHZhbHNbMV0sIGksIGxpbmUpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRCb29sZWFuT3B0aW9uKFwiZXJyb3JCYXJzXCIpKSB7XG4gICAgICAvLyBJZiB0aGVyZSBhcmUgc2lnbWEtYmFzZWQgaGlnaC9sb3cgYmFuZHMsIHZhbHVlcyBhcmUgKHZhbHVlLCBzdGRkZXYpIHBhaXJzXG4gICAgICBpZiAoaW5GaWVsZHMubGVuZ3RoICUgMiAhPSAxKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cGVjdGVkIGFsdGVybmF0aW5nICh2YWx1ZSwgc3RkZXYuKSBwYWlycyBpbiBDU1YgZGF0YSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnYnV0IGxpbmUgJyArICgxICsgaSkgKyAnIGhhcyBhbiBvZGQgbnVtYmVyIG9mIHZhbHVlcyAoJyArXG4gICAgICAgICAgICAgICAgICAgICAgKGluRmllbGRzLmxlbmd0aCAtIDEpICsgXCIpOiAnXCIgKyBsaW5lICsgXCInXCIpO1xuICAgICAgfVxuICAgICAgZm9yIChqID0gMTsgaiA8IGluRmllbGRzLmxlbmd0aDsgaiArPSAyKSB7XG4gICAgICAgIGZpZWxkc1soaiArIDEpIC8gMl0gPSBbdXRpbHMucGFyc2VGbG9hdF8oaW5GaWVsZHNbal0sIGksIGxpbmUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLnBhcnNlRmxvYXRfKGluRmllbGRzW2ogKyAxXSwgaSwgbGluZSldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRCb29sZWFuT3B0aW9uKFwiY3VzdG9tQmFyc1wiKSkge1xuICAgICAgLy8gQ3VzdG9tIGhpZ2gvbG93IGJhbmRzIGFyZSBhIGxvdztjZW50cmU7aGlnaCB0dXBsZVxuICAgICAgZm9yIChqID0gMTsgaiA8IGluRmllbGRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciB2YWwgPSBpbkZpZWxkc1tqXTtcbiAgICAgICAgaWYgKC9eICokLy50ZXN0KHZhbCkpIHtcbiAgICAgICAgICBmaWVsZHNbal0gPSBbbnVsbCwgbnVsbCwgbnVsbF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFscyA9IHZhbC5zcGxpdChcIjtcIik7XG4gICAgICAgICAgaWYgKHZhbHMubGVuZ3RoID09IDMpIHtcbiAgICAgICAgICAgIGZpZWxkc1tqXSA9IFsgdXRpbHMucGFyc2VGbG9hdF8odmFsc1swXSwgaSwgbGluZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLnBhcnNlRmxvYXRfKHZhbHNbMV0sIGksIGxpbmUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5wYXJzZUZsb2F0Xyh2YWxzWzJdLCBpLCBsaW5lKSBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1doZW4gdXNpbmcgY3VzdG9tQmFycywgdmFsdWVzIG11c3QgYmUgZWl0aGVyIGJsYW5rICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdvciBcImxvdztjZW50ZXI7aGlnaFwiIHR1cGxlcyAoZ290IFwiJyArIHZhbCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ1wiIG9uIGxpbmUgJyArICgxK2kpICsgJyknKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVmFsdWVzIGFyZSBqdXN0IG51bWJlcnNcbiAgICAgIGZvciAoaiA9IDE7IGogPCBpbkZpZWxkcy5sZW5ndGg7IGorKykge1xuICAgICAgICBmaWVsZHNbal0gPSB1dGlscy5wYXJzZUZsb2F0XyhpbkZpZWxkc1tqXSwgaSwgbGluZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXQubGVuZ3RoID4gMCAmJiBmaWVsZHNbMF0gPCByZXRbcmV0Lmxlbmd0aCAtIDFdWzBdKSB7XG4gICAgICBvdXRPZk9yZGVyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoZmllbGRzLmxlbmd0aCAhPSBleHBlY3RlZENvbHMpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJOdW1iZXIgb2YgY29sdW1ucyBpbiBsaW5lIFwiICsgaSArIFwiIChcIiArIGZpZWxkcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICBcIikgZG9lcyBub3QgYWdyZWUgd2l0aCBudW1iZXIgb2YgbGFiZWxzIChcIiArIGV4cGVjdGVkQ29scyArXG4gICAgICAgICAgICAgICAgICAgIFwiKSBcIiArIGxpbmUpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB1c2VyIHNwZWNpZmllZCB0aGUgJ2xhYmVscycgb3B0aW9uIGFuZCBub25lIG9mIHRoZSBjZWxscyBvZiB0aGVcbiAgICAvLyBmaXJzdCByb3cgcGFyc2VkIGNvcnJlY3RseSwgdGhlbiB0aGV5IHByb2JhYmx5IGRvdWJsZS1zcGVjaWZpZWQgdGhlXG4gICAgLy8gbGFiZWxzLiBXZSBnbyB3aXRoIHRoZSB2YWx1ZXMgc2V0IGluIHRoZSBvcHRpb24sIGRpc2NhcmQgdGhpcyByb3cgYW5kXG4gICAgLy8gbG9nIGEgd2FybmluZyB0byB0aGUgSlMgY29uc29sZS5cbiAgICBpZiAoaSA9PT0gMCAmJiB0aGlzLmF0dHJfKCdsYWJlbHMnKSkge1xuICAgICAgdmFyIGFsbF9udWxsID0gdHJ1ZTtcbiAgICAgIGZvciAoaiA9IDA7IGFsbF9udWxsICYmIGogPCBmaWVsZHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKGZpZWxkc1tqXSkgYWxsX251bGwgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChhbGxfbnVsbCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJUaGUgZHlncmFwaHMgJ2xhYmVscycgb3B0aW9uIGlzIHNldCwgYnV0IHRoZSBmaXJzdCByb3cgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgXCJvZiBDU1YgZGF0YSAoJ1wiICsgbGluZSArIFwiJykgYXBwZWFycyB0byBhbHNvIGNvbnRhaW4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbHMuIFdpbGwgZHJvcCB0aGUgQ1NWIGxhYmVscyBhbmQgdXNlIHRoZSBvcHRpb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbHMuXCIpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0LnB1c2goZmllbGRzKTtcbiAgfVxuXG4gIGlmIChvdXRPZk9yZGVyKSB7XG4gICAgY29uc29sZS53YXJuKFwiQ1NWIGlzIG91dCBvZiBvcmRlcjsgb3JkZXIgaXQgY29ycmVjdGx5IHRvIHNwZWVkIGxvYWRpbmcuXCIpO1xuICAgIHJldC5zb3J0KGZ1bmN0aW9uKGEsYikgeyByZXR1cm4gYVswXSAtIGJbMF07IH0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8vIEluIG5hdGl2ZSBmb3JtYXQsIGFsbCB2YWx1ZXMgbXVzdCBiZSBkYXRlcyBvciBudW1iZXJzLlxuLy8gVGhpcyBjaGVjayBpc24ndCBwZXJmZWN0IGJ1dCB3aWxsIGNhdGNoIG1vc3QgbWlzdGFrZW4gdXNlcyBvZiBzdHJpbmdzLlxuZnVuY3Rpb24gdmFsaWRhdGVOYXRpdmVGb3JtYXQoZGF0YSkge1xuICBjb25zdCBmaXJzdFJvdyA9IGRhdGFbMF07XG4gIGNvbnN0IGZpcnN0WCA9IGZpcnN0Um93WzBdO1xuICBpZiAodHlwZW9mIGZpcnN0WCAhPT0gJ251bWJlcicgJiYgIXV0aWxzLmlzRGF0ZUxpa2UoZmlyc3RYKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgbnVtYmVyIG9yIGRhdGUgYnV0IGdvdCAke3R5cGVvZiBmaXJzdFh9OiAke2ZpcnN0WH0uYCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBmaXJzdFJvdy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHZhbCA9IGZpcnN0Um93W2ldO1xuICAgIGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykgY29udGludWU7XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlMaWtlKHZhbCkpIGNvbnRpbnVlOyAgLy8gZS5nLiBlcnJvckJhcnMgb3IgY3VzdG9tQmFyc1xuICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgbnVtYmVyIG9yIGFycmF5IGJ1dCBnb3QgJHt0eXBlb2YgdmFsfTogJHt2YWx9LmApO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHVzZXIgaGFzIHByb3ZpZGVkIHRoZWlyIGRhdGEgYXMgYSBwcmUtcGFja2FnZWQgSlMgYXJyYXkuIElmIHRoZSB4IHZhbHVlc1xuICogYXJlIG51bWVyaWMsIHRoaXMgaXMgdGhlIHNhbWUgYXMgZHlncmFwaHMnIGludGVybmFsIGZvcm1hdC4gSWYgdGhlIHggdmFsdWVzXG4gKiBhcmUgZGF0ZXMsIHdlIG5lZWQgdG8gY29udmVydCB0aGVtIGZyb20gRGF0ZSBvYmplY3RzIHRvIG1zIHNpbmNlIGVwb2NoLlxuICogQHBhcmFtIHshQXJyYXl9IGRhdGFcbiAqIEByZXR1cm4ge09iamVjdH0gZGF0YSB3aXRoIG51bWVyaWMgeCB2YWx1ZXMuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5wYXJzZUFycmF5XyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgLy8gUGVlayBhdCB0aGUgZmlyc3QgeCB2YWx1ZSB0byBzZWUgaWYgaXQncyBudW1lcmljLlxuICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICBkYXRhID0gW1swXV07XG4gIH1cbiAgaWYgKGRhdGFbMF0ubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkRhdGEgc2V0IGNhbm5vdCBjb250YWluIGFuIGVtcHR5IHJvd1wiKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhbGlkYXRlTmF0aXZlRm9ybWF0KGRhdGEpO1xuXG4gIHZhciBpO1xuICBpZiAodGhpcy5hdHRyXyhcImxhYmVsc1wiKSA9PT0gbnVsbCkge1xuICAgIGNvbnNvbGUud2FybihcIlVzaW5nIGRlZmF1bHQgbGFiZWxzLiBTZXQgbGFiZWxzIGV4cGxpY2l0bHkgdmlhICdsYWJlbHMnIFwiICtcbiAgICAgICAgICAgICAgICAgXCJpbiB0aGUgb3B0aW9ucyBwYXJhbWV0ZXJcIik7XG4gICAgdGhpcy5hdHRyc18ubGFiZWxzID0gWyBcIlhcIiBdO1xuICAgIGZvciAoaSA9IDE7IGkgPCBkYXRhWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmF0dHJzXy5sYWJlbHMucHVzaChcIllcIiArIGkpOyAvLyBOb3QgdXNlcl9hdHRyc18uXG4gICAgfVxuICAgIHRoaXMuYXR0cmlidXRlc18ucmVwYXJzZVNlcmllcygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBudW1fbGFiZWxzID0gdGhpcy5hdHRyXyhcImxhYmVsc1wiKTtcbiAgICBpZiAobnVtX2xhYmVscy5sZW5ndGggIT0gZGF0YVswXS5sZW5ndGgpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaXNtYXRjaCBiZXR3ZWVuIG51bWJlciBvZiBsYWJlbHMgKFwiICsgbnVtX2xhYmVscyArIFwiKVwiICtcbiAgICAgICAgICAgICAgICAgICAgXCIgYW5kIG51bWJlciBvZiBjb2x1bW5zIGluIGFycmF5IChcIiArIGRhdGFbMF0ubGVuZ3RoICsgXCIpXCIpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgaWYgKHV0aWxzLmlzRGF0ZUxpa2UoZGF0YVswXVswXSkpIHtcbiAgICAvLyBTb21lIGludGVsbGlnZW50IGRlZmF1bHRzIGZvciBhIGRhdGUgeC1heGlzLlxuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC52YWx1ZUZvcm1hdHRlciA9IHV0aWxzLmRhdGVWYWx1ZUZvcm1hdHRlcjtcbiAgICB0aGlzLmF0dHJzXy5heGVzLngudGlja2VyID0gRHlncmFwaFRpY2tlcnMuZGF0ZVRpY2tlcjtcbiAgICB0aGlzLmF0dHJzXy5heGVzLnguYXhpc0xhYmVsRm9ybWF0dGVyID0gdXRpbHMuZGF0ZUF4aXNMYWJlbEZvcm1hdHRlcjtcblxuICAgIC8vIEFzc3VtZSB0aGV5J3JlIGFsbCBkYXRlcy5cbiAgICB2YXIgcGFyc2VkRGF0YSA9IHV0aWxzLmNsb25lKGRhdGEpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocGFyc2VkRGF0YVtpXS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlJvdyBcIiArICgxICsgaSkgKyBcIiBvZiBkYXRhIGlzIGVtcHR5XCIpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJzZWREYXRhW2ldWzBdID09PSBudWxsIHx8XG4gICAgICAgICAgdHlwZW9mKHBhcnNlZERhdGFbaV1bMF0uZ2V0VGltZSkgIT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICAgIGlzTmFOKHBhcnNlZERhdGFbaV1bMF0uZ2V0VGltZSgpKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwieCB2YWx1ZSBpbiByb3cgXCIgKyAoMSArIGkpICsgXCIgaXMgbm90IGEgRGF0ZVwiKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBwYXJzZWREYXRhW2ldWzBdID0gcGFyc2VkRGF0YVtpXVswXS5nZXRUaW1lKCk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWREYXRhO1xuICB9IGVsc2Uge1xuICAgIC8vIFNvbWUgaW50ZWxsaWdlbnQgZGVmYXVsdHMgZm9yIGEgbnVtZXJpYyB4LWF4aXMuXG4gICAgLyoqIEBwcml2YXRlIChzaHV0IHVwLCBqc2RvYyEpICovXG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnZhbHVlRm9ybWF0dGVyID0gZnVuY3Rpb24oeCkgeyByZXR1cm4geDsgfTtcbiAgICB0aGlzLmF0dHJzXy5heGVzLngudGlja2VyID0gRHlncmFwaFRpY2tlcnMubnVtZXJpY1RpY2tzO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC5heGlzTGFiZWxGb3JtYXR0ZXIgPSB1dGlscy5udW1iZXJBeGlzTGFiZWxGb3JtYXR0ZXI7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn07XG5cbi8qKlxuICogUGFyc2VzIGEgRGF0YVRhYmxlIG9iamVjdCBmcm9tIGd2aXouXG4gKiBUaGUgZGF0YSBpcyBleHBlY3RlZCB0byBoYXZlIGEgZmlyc3QgY29sdW1uIHRoYXQgaXMgZWl0aGVyIGEgZGF0ZSBvciBhXG4gKiBudW1iZXIuIEFsbCBzdWJzZXF1ZW50IGNvbHVtbnMgbXVzdCBiZSBudW1iZXJzLiBJZiB0aGVyZSBpcyBhIGNsZWFyIG1pc21hdGNoXG4gKiBiZXR3ZWVuIHRoaXMueFZhbHVlUGFyc2VyXyBhbmQgdGhlIHR5cGUgb2YgdGhlIGZpcnN0IGNvbHVtbiwgaXQgd2lsbCBiZVxuICogZml4ZWQuIEZpbGxzIG91dCByYXdEYXRhXy5cbiAqIEBwYXJhbSB7IWdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZX0gZGF0YSBTZWUgYWJvdmUuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5wYXJzZURhdGFUYWJsZV8gPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBzaG9ydFRleHRGb3JBbm5vdGF0aW9uTnVtID0gZnVuY3Rpb24obnVtKSB7XG4gICAgLy8gY29udmVydHMgWzAtOV0rIFtBLVpdW2Etel0qXG4gICAgLy8gZXhhbXBsZTogMD1BLCAxPUIsIDI1PVosIDI2PUFhLCAyNz1BYlxuICAgIC8vIGFuZCBjb250aW51ZXMgbGlrZS4uIEJhIEJiIC4uIFphIC4uIFp6Li5BYWEuLi5aenogQWFhYSBaenp6XG4gICAgdmFyIHNob3J0VGV4dCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgLyogQSAqLyArIG51bSAlIDI2KTtcbiAgICBudW0gPSBNYXRoLmZsb29yKG51bSAvIDI2KTtcbiAgICB3aGlsZSAoIG51bSA+IDAgKSB7XG4gICAgICBzaG9ydFRleHQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1IC8qIEEgKi8gKyAobnVtIC0gMSkgJSAyNiApICsgc2hvcnRUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICBudW0gPSBNYXRoLmZsb29yKChudW0gLSAxKSAvIDI2KTtcbiAgICB9XG4gICAgcmV0dXJuIHNob3J0VGV4dDtcbiAgfTtcblxuICB2YXIgY29scyA9IGRhdGEuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7XG4gIHZhciByb3dzID0gZGF0YS5nZXROdW1iZXJPZlJvd3MoKTtcblxuICB2YXIgaW5kZXBUeXBlID0gZGF0YS5nZXRDb2x1bW5UeXBlKDApO1xuICBpZiAoaW5kZXBUeXBlID09ICdkYXRlJyB8fCBpbmRlcFR5cGUgPT0gJ2RhdGV0aW1lJykge1xuICAgIHRoaXMuYXR0cnNfLnhWYWx1ZVBhcnNlciA9IHV0aWxzLmRhdGVQYXJzZXI7XG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnZhbHVlRm9ybWF0dGVyID0gdXRpbHMuZGF0ZVZhbHVlRm9ybWF0dGVyO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC50aWNrZXIgPSBEeWdyYXBoVGlja2Vycy5kYXRlVGlja2VyO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC5heGlzTGFiZWxGb3JtYXR0ZXIgPSB1dGlscy5kYXRlQXhpc0xhYmVsRm9ybWF0dGVyO1xuICB9IGVsc2UgaWYgKGluZGVwVHlwZSA9PSAnbnVtYmVyJykge1xuICAgIHRoaXMuYXR0cnNfLnhWYWx1ZVBhcnNlciA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHBhcnNlRmxvYXQoeCk7IH07XG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnZhbHVlRm9ybWF0dGVyID0gZnVuY3Rpb24oeCkgeyByZXR1cm4geDsgfTtcbiAgICB0aGlzLmF0dHJzXy5heGVzLngudGlja2VyID0gRHlncmFwaFRpY2tlcnMubnVtZXJpY1RpY2tzO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC5heGlzTGFiZWxGb3JtYXR0ZXIgPSB0aGlzLmF0dHJzXy5heGVzLngudmFsdWVGb3JtYXR0ZXI7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIFwib25seSAnZGF0ZScsICdkYXRldGltZScgYW5kICdudW1iZXInIHR5cGVzIGFyZSBzdXBwb3J0ZWQgXCIgK1xuICAgICAgICAgIFwiZm9yIGNvbHVtbiAxIG9mIERhdGFUYWJsZSBpbnB1dCAoR290ICdcIiArIGluZGVwVHlwZSArIFwiJylcIik7XG4gIH1cblxuICAvLyBBcnJheSBvZiB0aGUgY29sdW1uIGluZGljZXMgd2hpY2ggY29udGFpbiBkYXRhIChhbmQgbm90IGFubm90YXRpb25zKS5cbiAgdmFyIGNvbElkeCA9IFtdO1xuICB2YXIgYW5ub3RhdGlvbkNvbHMgPSB7fTsgIC8vIGRhdGEgaW5kZXggLT4gW2Fubm90YXRpb24gY29sc11cbiAgdmFyIGhhc0Fubm90YXRpb25zID0gZmFsc2U7XG4gIHZhciBpLCBqO1xuICBmb3IgKGkgPSAxOyBpIDwgY29sczsgaSsrKSB7XG4gICAgdmFyIHR5cGUgPSBkYXRhLmdldENvbHVtblR5cGUoaSk7XG4gICAgaWYgKHR5cGUgPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbElkeC5wdXNoKGkpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnc3RyaW5nJyAmJiB0aGlzLmdldEJvb2xlYW5PcHRpb24oJ2Rpc3BsYXlBbm5vdGF0aW9ucycpKSB7XG4gICAgICAvLyBUaGlzIGlzIE9LIC0tIGl0J3MgYW4gYW5ub3RhdGlvbiBjb2x1bW4uXG4gICAgICB2YXIgZGF0YUlkeCA9IGNvbElkeFtjb2xJZHgubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoIWFubm90YXRpb25Db2xzLmhhc093blByb3BlcnR5KGRhdGFJZHgpKSB7XG4gICAgICAgIGFubm90YXRpb25Db2xzW2RhdGFJZHhdID0gW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW5ub3RhdGlvbkNvbHNbZGF0YUlkeF0ucHVzaChpKTtcbiAgICAgIH1cbiAgICAgIGhhc0Fubm90YXRpb25zID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIFwiT25seSAnbnVtYmVyJyBpcyBzdXBwb3J0ZWQgYXMgYSBkZXBlbmRlbnQgdHlwZSB3aXRoIEd2aXouXCIgK1xuICAgICAgICAgIFwiICdzdHJpbmcnIGlzIG9ubHkgc3VwcG9ydGVkIGlmIGRpc3BsYXlBbm5vdGF0aW9ucyBpcyB0cnVlXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlYWQgY29sdW1uIGxhYmVsc1xuICAvLyBUT0RPKGRhbnZrKTogYWRkIHN1cHBvcnQgYmFjayBmb3IgZXJyb3JCYXJzXG4gIHZhciBsYWJlbHMgPSBbZGF0YS5nZXRDb2x1bW5MYWJlbCgwKV07XG4gIGZvciAoaSA9IDA7IGkgPCBjb2xJZHgubGVuZ3RoOyBpKyspIHtcbiAgICBsYWJlbHMucHVzaChkYXRhLmdldENvbHVtbkxhYmVsKGNvbElkeFtpXSkpO1xuICAgIGlmICh0aGlzLmdldEJvb2xlYW5PcHRpb24oXCJlcnJvckJhcnNcIikpIGkgKz0gMTtcbiAgfVxuICB0aGlzLmF0dHJzXy5sYWJlbHMgPSBsYWJlbHM7XG4gIGNvbHMgPSBsYWJlbHMubGVuZ3RoO1xuXG4gIHZhciByZXQgPSBbXTtcbiAgdmFyIG91dE9mT3JkZXIgPSBmYWxzZTtcbiAgdmFyIGFubm90YXRpb25zID0gW107XG4gIGZvciAoaSA9IDA7IGkgPCByb3dzOyBpKyspIHtcbiAgICB2YXIgcm93ID0gW107XG4gICAgaWYgKHR5cGVvZihkYXRhLmdldFZhbHVlKGksIDApKSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgZGF0YS5nZXRWYWx1ZShpLCAwKSA9PT0gbnVsbCkge1xuICAgICAgY29uc29sZS53YXJuKFwiSWdub3Jpbmcgcm93IFwiICsgaSArXG4gICAgICAgICAgICAgICAgICAgXCIgb2YgRGF0YVRhYmxlIGJlY2F1c2Ugb2YgdW5kZWZpbmVkIG9yIG51bGwgZmlyc3QgY29sdW1uLlwiKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChpbmRlcFR5cGUgPT0gJ2RhdGUnIHx8IGluZGVwVHlwZSA9PSAnZGF0ZXRpbWUnKSB7XG4gICAgICByb3cucHVzaChkYXRhLmdldFZhbHVlKGksIDApLmdldFRpbWUoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJvdy5wdXNoKGRhdGEuZ2V0VmFsdWUoaSwgMCkpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuZ2V0Qm9vbGVhbk9wdGlvbihcImVycm9yQmFyc1wiKSkge1xuICAgICAgZm9yIChqID0gMDsgaiA8IGNvbElkeC5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgY29sID0gY29sSWR4W2pdO1xuICAgICAgICByb3cucHVzaChkYXRhLmdldFZhbHVlKGksIGNvbCkpO1xuICAgICAgICBpZiAoaGFzQW5ub3RhdGlvbnMgJiZcbiAgICAgICAgICAgIGFubm90YXRpb25Db2xzLmhhc093blByb3BlcnR5KGNvbCkgJiZcbiAgICAgICAgICAgIGRhdGEuZ2V0VmFsdWUoaSwgYW5ub3RhdGlvbkNvbHNbY29sXVswXSkgIT09IG51bGwpIHtcbiAgICAgICAgICB2YXIgYW5uID0ge307XG4gICAgICAgICAgYW5uLnNlcmllcyA9IGRhdGEuZ2V0Q29sdW1uTGFiZWwoY29sKTtcbiAgICAgICAgICBhbm4ueHZhbCA9IHJvd1swXTtcbiAgICAgICAgICBhbm4uc2hvcnRUZXh0ID0gc2hvcnRUZXh0Rm9yQW5ub3RhdGlvbk51bShhbm5vdGF0aW9ucy5sZW5ndGgpO1xuICAgICAgICAgIGFubi50ZXh0ID0gJyc7XG4gICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBhbm5vdGF0aW9uQ29sc1tjb2xdLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBpZiAoaykgYW5uLnRleHQgKz0gXCJcXG5cIjtcbiAgICAgICAgICAgIGFubi50ZXh0ICs9IGRhdGEuZ2V0VmFsdWUoaSwgYW5ub3RhdGlvbkNvbHNbY29sXVtrXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFubm90YXRpb25zLnB1c2goYW5uKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTdHJpcCBvdXQgaW5maW5pdGllcywgd2hpY2ggZ2l2ZSBkeWdyYXBocyBwcm9ibGVtcyBsYXRlciBvbi5cbiAgICAgIGZvciAoaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKCFpc0Zpbml0ZShyb3dbal0pKSByb3dbal0gPSBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgY29scyAtIDE7IGorKykge1xuICAgICAgICByb3cucHVzaChbIGRhdGEuZ2V0VmFsdWUoaSwgMSArIDIgKiBqKSwgZGF0YS5nZXRWYWx1ZShpLCAyICsgMiAqIGopIF0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmV0Lmxlbmd0aCA+IDAgJiYgcm93WzBdIDwgcmV0W3JldC5sZW5ndGggLSAxXVswXSkge1xuICAgICAgb3V0T2ZPcmRlciA9IHRydWU7XG4gICAgfVxuICAgIHJldC5wdXNoKHJvdyk7XG4gIH1cblxuICBpZiAob3V0T2ZPcmRlcikge1xuICAgIGNvbnNvbGUud2FybihcIkRhdGFUYWJsZSBpcyBvdXQgb2Ygb3JkZXI7IG9yZGVyIGl0IGNvcnJlY3RseSB0byBzcGVlZCBsb2FkaW5nLlwiKTtcbiAgICByZXQuc29ydChmdW5jdGlvbihhLGIpIHsgcmV0dXJuIGFbMF0gLSBiWzBdOyB9KTtcbiAgfVxuICB0aGlzLnJhd0RhdGFfID0gcmV0O1xuXG4gIGlmIChhbm5vdGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5zZXRBbm5vdGF0aW9ucyhhbm5vdGF0aW9ucywgdHJ1ZSk7XG4gIH1cbiAgdGhpcy5hdHRyaWJ1dGVzXy5yZXBhcnNlU2VyaWVzKCk7XG59O1xuXG4vKipcbiAqIFNpZ25hbHMgdG8gcGx1Z2lucyB0aGF0IHRoZSBjaGFydCBkYXRhIGhhcyB1cGRhdGVkLlxuICogVGhpcyBoYXBwZW5zIGFmdGVyIHRoZSBkYXRhIGhhcyB1cGRhdGVkIGJ1dCBiZWZvcmUgdGhlIGNoYXJ0IGhhcyByZWRyYXduLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY2FzY2FkZURhdGFEaWRVcGRhdGVFdmVudF8gPSBmdW5jdGlvbigpIHtcbiAgLy8gVE9ETyhkYW52ayk6IHRoZXJlIGFyZSBzb21lIGlzc3VlcyBjaGVja2luZyB4QXhpc1JhbmdlKCkgYW5kIHVzaW5nXG4gIC8vIHRvRG9tQ29vcmRzIGZyb20gaGFuZGxlcnMgb2YgdGhpcyBldmVudC4gVGhlIHZpc2libGUgcmFuZ2Ugc2hvdWxkIGJlIHNldFxuICAvLyB3aGVuIHRoZSBjaGFydCBpcyBkcmF3biwgbm90IGRlcml2ZWQgZnJvbSB0aGUgZGF0YS5cbiAgdGhpcy5jYXNjYWRlRXZlbnRzXygnZGF0YURpZFVwZGF0ZScsIHt9KTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBDU1YgZGF0YS4gSWYgaXQncyBpbiBhIGZ1bmN0aW9uLCBjYWxsIHRoYXQgZnVuY3Rpb24uIElmIGl0J3MgaW4gYVxuICogZmlsZSwgZG8gYW4gWE1MSHR0cFJlcXVlc3QgdG8gZ2V0IGl0LlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuc3RhcnRfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBkYXRhID0gdGhpcy5maWxlXztcblxuICAvLyBGdW5jdGlvbnMgY2FuIHJldHVybiByZWZlcmVuY2VzIG9mIGFsbCBvdGhlciB0eXBlcy5cbiAgaWYgKHR5cGVvZiBkYXRhID09ICdmdW5jdGlvbicpIHtcbiAgICBkYXRhID0gZGF0YSgpO1xuICB9XG5cbiAgY29uc3QgZGF0YXR5cGUgPSB1dGlscy50eXBlQXJyYXlMaWtlKGRhdGEpO1xuICBpZiAoZGF0YXR5cGUgPT0gJ2FycmF5Jykge1xuICAgIHRoaXMucmF3RGF0YV8gPSB0aGlzLnBhcnNlQXJyYXlfKGRhdGEpO1xuICAgIHRoaXMuY2FzY2FkZURhdGFEaWRVcGRhdGVFdmVudF8oKTtcbiAgICB0aGlzLnByZWRyYXdfKCk7XG4gIH0gZWxzZSBpZiAoZGF0YXR5cGUgPT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICB0eXBlb2YgZGF0YS5nZXRDb2x1bW5SYW5nZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gbXVzdCBiZSBhIERhdGFUYWJsZSBmcm9tIGd2aXouXG4gICAgdGhpcy5wYXJzZURhdGFUYWJsZV8oZGF0YSk7XG4gICAgdGhpcy5jYXNjYWRlRGF0YURpZFVwZGF0ZUV2ZW50XygpO1xuICAgIHRoaXMucHJlZHJhd18oKTtcbiAgfSBlbHNlIGlmIChkYXRhdHlwZSA9PSAnc3RyaW5nJykge1xuICAgIC8vIEhldXJpc3RpYzogYSBuZXdsaW5lIG1lYW5zIGl0J3MgQ1NWIGRhdGEuIE90aGVyd2lzZSBpdCdzIGFuIFVSTC5cbiAgICB2YXIgbGluZV9kZWxpbWl0ZXIgPSB1dGlscy5kZXRlY3RMaW5lRGVsaW1pdGVyKGRhdGEpO1xuICAgIGlmIChsaW5lX2RlbGltaXRlcikge1xuICAgICAgdGhpcy5sb2FkZWRFdmVudF8oZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJFTU9WRV9GT1JfSUVcbiAgICAgIHZhciByZXE7XG4gICAgICBpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG4gICAgICAgIC8vIEZpcmVmb3gsIE9wZXJhLCBJRTcsIGFuZCBvdGhlciBicm93c2VycyB3aWxsIHVzZSB0aGUgbmF0aXZlIG9iamVjdFxuICAgICAgICByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElFIDUgYW5kIDYgd2lsbCB1c2UgdGhlIEFjdGl2ZVggY29udHJvbFxuICAgICAgICByZXEgPSBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2FsbGVyID0gdGhpcztcbiAgICAgIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgaWYgKHJlcS5zdGF0dXMgPT09IDIwMCB8fCAgLy8gTm9ybWFsIGh0dHBcbiAgICAgICAgICAgICAgcmVxLnN0YXR1cyA9PT0gMCkgeyAgICAvLyBDaHJvbWUgdy8gLS1hbGxvdy1maWxlLWFjY2Vzcy1mcm9tLWZpbGVzXG4gICAgICAgICAgICBjYWxsZXIubG9hZGVkRXZlbnRfKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmVxLm9wZW4oXCJHRVRcIiwgZGF0YSwgdHJ1ZSk7XG4gICAgICByZXEuc2VuZChudWxsKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihcIlVua25vd24gZGF0YSBmb3JtYXQ6IFwiICsgZGF0YXR5cGUpO1xuICB9XG59O1xuXG4vKipcbiAqIENoYW5nZXMgdmFyaW91cyBwcm9wZXJ0aWVzIG9mIHRoZSBncmFwaC4gVGhlc2UgY2FuIGluY2x1ZGU6XG4gKiA8dWw+XG4gKiA8bGk+ZmlsZTogY2hhbmdlcyB0aGUgc291cmNlIGRhdGEgZm9yIHRoZSBncmFwaDwvbGk+XG4gKiA8bGk+ZXJyb3JCYXJzOiBjaGFuZ2VzIHdoZXRoZXIgdGhlIGRhdGEgY29udGFpbnMgc3RkZGV2PC9saT5cbiAqIDwvdWw+XG4gKlxuICogVGhlcmUncyBhIGh1Z2UgdmFyaWV0eSBvZiBvcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCB0byB0aGlzIG1ldGhvZC4gRm9yIGFcbiAqIGZ1bGwgbGlzdCwgc2VlOiBodHRwczovL2R5Z3JhcGhzLmNvbS9vcHRpb25zLmh0bWxcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRfYXR0cnMgVGhlIG5ldyBwcm9wZXJ0aWVzIGFuZCB2YWx1ZXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYmxvY2tfcmVkcmF3IFVzdWFsbHkgdGhlIGNoYXJ0IGlzIHJlZHJhd24gYWZ0ZXIgZXZlcnlcbiAqICAgICBjYWxsIHRvIHVwZGF0ZU9wdGlvbnMoKS4gSWYgeW91IGtub3cgYmV0dGVyLCB5b3UgY2FuIHBhc3MgdHJ1ZSB0b1xuICogICAgIGV4cGxpY2l0bHkgYmxvY2sgdGhlIHJlZHJhdy4gVGhpcyBjYW4gYmUgdXNlZnVsIGZvciBjaGFpbmluZ1xuICogICAgIHVwZGF0ZU9wdGlvbnMoKSBjYWxscywgYXZvaWRpbmcgdGhlIG9jY2FzaW9uYWwgaW5maW5pdGUgbG9vcCBhbmRcbiAqICAgICBwcmV2ZW50aW5nIHJlZHJhd3Mgd2hlbiBpdCdzIG5vdCBuZWNlc3NhcnkgKGUuZy4gd2hlbiB1cGRhdGluZyBhXG4gKiAgICAgY2FsbGJhY2spLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS51cGRhdGVPcHRpb25zID0gZnVuY3Rpb24oaW5wdXRfYXR0cnMsIGJsb2NrX3JlZHJhdykge1xuICBpZiAodHlwZW9mKGJsb2NrX3JlZHJhdykgPT0gJ3VuZGVmaW5lZCcpIGJsb2NrX3JlZHJhdyA9IGZhbHNlO1xuXG4gIC8vIGNvcHlVc2VyQXR0cnNfIGRyb3BzIHRoZSBcImZpbGVcIiBwYXJhbWV0ZXIgYXMgYSBjb252ZW5pZW5jZSB0byB1cy5cbiAgdmFyIGZpbGUgPSBpbnB1dF9hdHRycy5maWxlO1xuICB2YXIgYXR0cnMgPSBEeWdyYXBoLmNvcHlVc2VyQXR0cnNfKGlucHV0X2F0dHJzKTtcbiAgdmFyIHByZXZOdW1BeGVzID0gdGhpcy5hdHRyaWJ1dGVzXy5udW1BeGVzKCk7XG5cbiAgLy8gVE9ETyhkYW52ayk6IHRoaXMgaXMgYSBtZXNzLiBNb3ZlIHRoZXNlIG9wdGlvbnMgaW50byBhdHRyXy5cbiAgaWYgKCdyb2xsUGVyaW9kJyBpbiBhdHRycykge1xuICAgIHRoaXMucm9sbFBlcmlvZF8gPSBhdHRycy5yb2xsUGVyaW9kO1xuICB9XG4gIGlmICgnZGF0ZVdpbmRvdycgaW4gYXR0cnMpIHtcbiAgICB0aGlzLmRhdGVXaW5kb3dfID0gYXR0cnMuZGF0ZVdpbmRvdztcbiAgfVxuXG4gIC8vIFRPRE8oZGFudmspOiB2YWxpZGF0ZSBwZXItc2VyaWVzIG9wdGlvbnMuXG4gIC8vIFN1cHBvcnRlZDpcbiAgLy8gc3Ryb2tlV2lkdGhcbiAgLy8gcG9pbnRTaXplXG4gIC8vIGRyYXdQb2ludHNcbiAgLy8gaGlnaGxpZ2h0Q2lyY2xlU2l6ZVxuXG4gIC8vIENoZWNrIGlmIHRoaXMgc2V0IG9wdGlvbnMgd2lsbCByZXF1aXJlIG5ldyBwb2ludHMuXG4gIHZhciByZXF1aXJlc05ld1BvaW50cyA9IHV0aWxzLmlzUGl4ZWxDaGFuZ2luZ09wdGlvbkxpc3QodGhpcy5hdHRyXyhcImxhYmVsc1wiKSwgYXR0cnMpO1xuXG4gIHV0aWxzLnVwZGF0ZURlZXAodGhpcy51c2VyX2F0dHJzXywgYXR0cnMpO1xuXG4gIHRoaXMuYXR0cmlidXRlc18ucmVwYXJzZVNlcmllcygpO1xuXG4gIGlmIChwcmV2TnVtQXhlcyA8IHRoaXMuYXR0cmlidXRlc18ubnVtQXhlcygpKSB0aGlzLnBsb3R0ZXJfLmNsZWFyKCk7XG4gIGlmIChmaWxlKSB7XG4gICAgLy8gVGhpcyBldmVudCBpbmRpY2F0ZXMgdGhhdCB0aGUgZGF0YSBpcyBhYm91dCB0byBjaGFuZ2UsIGJ1dCBoYXNuJ3QgeWV0LlxuICAgIC8vIFRPRE8oZGFudmspOiBzdXBwb3J0IGNhbmNlbGxhdGlvbiBvZiB0aGUgdXBkYXRlIHZpYSB0aGlzIGV2ZW50LlxuICAgIHRoaXMuY2FzY2FkZUV2ZW50c18oJ2RhdGFXaWxsVXBkYXRlJywge30pO1xuXG4gICAgdGhpcy5maWxlXyA9IGZpbGU7XG4gICAgaWYgKCFibG9ja19yZWRyYXcpIHRoaXMuc3RhcnRfKCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFibG9ja19yZWRyYXcpIHtcbiAgICAgIGlmIChyZXF1aXJlc05ld1BvaW50cykge1xuICAgICAgICB0aGlzLnByZWRyYXdfKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbmRlckdyYXBoXyhmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIE1ha2UgYSBjb3B5IG9mIGlucHV0IGF0dHJpYnV0ZXMsIHJlbW92aW5nIGZpbGUgYXMgYSBjb252ZW5pZW5jZS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGguY29weVVzZXJBdHRyc18gPSBmdW5jdGlvbihhdHRycykge1xuICB2YXIgbXlfYXR0cnMgPSB7fTtcbiAgZm9yICh2YXIgayBpbiBhdHRycykge1xuICAgIGlmICghYXR0cnMuaGFzT3duUHJvcGVydHkoaykpIGNvbnRpbnVlO1xuICAgIGlmIChrID09ICdmaWxlJykgY29udGludWU7XG4gICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGspKSBteV9hdHRyc1trXSA9IGF0dHJzW2tdO1xuICB9XG4gIHJldHVybiBteV9hdHRycztcbn07XG5cbi8qKlxuICogUmVzaXplcyB0aGUgZHlncmFwaC4gSWYgbm8gcGFyYW1ldGVycyBhcmUgc3BlY2lmaWVkLCByZXNpemVzIHRvIGZpbGwgdGhlXG4gKiBjb250YWluaW5nIGRpdiAod2hpY2ggaGFzIHByZXN1bWFibHkgY2hhbmdlZCBzaXplIHNpbmNlIHRoZSBkeWdyYXBoIHdhc1xuICogaW5zdGFudGlhdGVkKS4gSWYgdGhlIHdpZHRoL2hlaWdodCBhcmUgc3BlY2lmaWVkLCB0aGUgZGl2IHdpbGwgYmUgcmVzaXplZC5cbiAqXG4gKiBUaGlzIGlzIGZhciBtb3JlIGVmZmljaWVudCB0aGFuIGRlc3Ryb3lpbmcgYW5kIHJlLWluc3RhbnRpYXRpbmcgYVxuICogRHlncmFwaCwgc2luY2UgaXQgZG9lc24ndCBoYXZlIHRvIHJlcGFyc2UgdGhlIHVuZGVybHlpbmcgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGggV2lkdGggKGluIHBpeGVscylcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IChpbiBwaXhlbHMpXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgaWYgKHRoaXMucmVzaXplX2xvY2spIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5yZXNpemVfbG9jayA9IHRydWU7XG5cbiAgaWYgKCh3aWR0aCA9PT0gbnVsbCkgIT0gKGhlaWdodCA9PT0gbnVsbCkpIHtcbiAgICBjb25zb2xlLndhcm4oXCJEeWdyYXBoLnJlc2l6ZSgpIHNob3VsZCBiZSBjYWxsZWQgd2l0aCB6ZXJvIHBhcmFtZXRlcnMgb3IgXCIgK1xuICAgICAgICAgICAgICAgICBcInR3byBub24tTlVMTCBwYXJhbWV0ZXJzLiBQcmV0ZW5kaW5nIGl0IHdhcyB6ZXJvLlwiKTtcbiAgICB3aWR0aCA9IGhlaWdodCA9IG51bGw7XG4gIH1cblxuICB2YXIgb2xkX3dpZHRoID0gdGhpcy53aWR0aF87XG4gIHZhciBvbGRfaGVpZ2h0ID0gdGhpcy5oZWlnaHRfO1xuXG4gIGlmICh3aWR0aCkge1xuICAgIHRoaXMubWFpbmRpdl8uc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICB0aGlzLm1haW5kaXZfLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICB0aGlzLndpZHRoXyA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0XyA9IGhlaWdodDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLndpZHRoXyA9IHRoaXMubWFpbmRpdl8uY2xpZW50V2lkdGg7XG4gICAgdGhpcy5oZWlnaHRfID0gdGhpcy5tYWluZGl2Xy5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICBpZiAob2xkX3dpZHRoICE9IHRoaXMud2lkdGhfIHx8IG9sZF9oZWlnaHQgIT0gdGhpcy5oZWlnaHRfKSB7XG4gICAgLy8gUmVzaXppbmcgYSBjYW52YXMgZXJhc2VzIGl0LCBldmVuIHdoZW4gdGhlIHNpemUgZG9lc24ndCBjaGFuZ2UsIHNvXG4gICAgLy8gYW55IHJlc2l6ZSBuZWVkcyB0byBiZSBmb2xsb3dlZCBieSBhIHJlZHJhdy5cbiAgICB0aGlzLnJlc2l6ZUVsZW1lbnRzXygpO1xuICAgIHRoaXMucHJlZHJhd18oKTtcbiAgfVxuXG4gIHRoaXMucmVzaXplX2xvY2sgPSBmYWxzZTtcbn07XG5cbi8qKlxuICogQWRqdXN0cyB0aGUgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgcm9sbGluZyBhdmVyYWdlLiBVcGRhdGVzIHRoZSBncmFwaCB0b1xuICogcmVmbGVjdCB0aGUgbmV3IGF2ZXJhZ2luZyBwZXJpb2QuXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIE51bWJlciBvZiBwb2ludHMgb3ZlciB3aGljaCB0byBhdmVyYWdlIHRoZSBkYXRhLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5hZGp1c3RSb2xsID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIHRoaXMucm9sbFBlcmlvZF8gPSBsZW5ndGg7XG4gIHRoaXMucHJlZHJhd18oKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGJvb2xlYW4gYXJyYXkgb2YgdmlzaWJpbGl0eSBzdGF0dXNlcy5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUudmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAvLyBEbyBsYXp5LWluaXRpYWxpemF0aW9uLCBzbyB0aGF0IHRoaXMgaGFwcGVucyBhZnRlciB3ZSBrbm93IHRoZSBudW1iZXIgb2ZcbiAgLy8gZGF0YSBzZXJpZXMuXG4gIGlmICghdGhpcy5nZXRPcHRpb24oXCJ2aXNpYmlsaXR5XCIpKSB7XG4gICAgdGhpcy5hdHRyc18udmlzaWJpbGl0eSA9IFtdO1xuICB9XG4gIC8vIFRPRE8oZGFudmspOiBpdCBsb29rcyBsaWtlIHRoaXMgY291bGQgZ28gaW50byBhbiBpbmZpbml0ZSBsb29wIHcvIHVzZXJfYXR0cnMuXG4gIHdoaWxlICh0aGlzLmdldE9wdGlvbihcInZpc2liaWxpdHlcIikubGVuZ3RoIDwgdGhpcy5udW1Db2x1bW5zKCkgLSAxKSB7XG4gICAgdGhpcy5hdHRyc18udmlzaWJpbGl0eS5wdXNoKHRydWUpO1xuICB9XG4gIHJldHVybiB0aGlzLmdldE9wdGlvbihcInZpc2liaWxpdHlcIik7XG59O1xuXG4vKipcbiAqIENoYW5nZXMgdGhlIHZpc2liaWxpdHkgb2Ygb25lIG9yIG1vcmUgc2VyaWVzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfG51bWJlcltdfG9iamVjdH0gbnVtIHRoZSBzZXJpZXMgaW5kZXggb3IgYW4gYXJyYXkgb2Ygc2VyaWVzIGluZGljZXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIGEgYm9vbGVhbiBhcnJheSBvZiB2aXNpYmlsaXR5IHN0YXRlcyBieSBpbmRleFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgYW4gb2JqZWN0IG1hcHBpbmcgc2VyaWVzIG51bWJlcnMsIGFzIGtleXMsIHRvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5IHN0YXRlIChib29sZWFuIHZhbHVlcylcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgdGhlIHZpc2liaWxpdHkgc3RhdGUgZXhwcmVzc2VkIGFzIGEgYm9vbGVhblxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5zZXRWaXNpYmlsaXR5ID0gZnVuY3Rpb24obnVtLCB2YWx1ZSkge1xuICB2YXIgeCA9IHRoaXMudmlzaWJpbGl0eSgpO1xuICB2YXIgbnVtSXNPYmplY3QgPSBmYWxzZTtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkobnVtKSkge1xuICAgIGlmIChudW0gIT09IG51bGwgJiYgdHlwZW9mIG51bSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG51bUlzT2JqZWN0ID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbnVtID0gW251bV07XG4gICAgfVxuICB9XG5cbiAgaWYgKG51bUlzT2JqZWN0KSB7XG4gICAgZm9yICh2YXIgaSBpbiBudW0pIHtcbiAgICAgIGlmIChudW0uaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgaWYgKGkgPCAwIHx8IGkgPj0geC5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJJbnZhbGlkIHNlcmllcyBudW1iZXIgaW4gc2V0VmlzaWJpbGl0eTogXCIgKyBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4W2ldID0gbnVtW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodHlwZW9mIG51bVtpXSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIGlmIChpID49IHgubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiSW52YWxpZCBzZXJpZXMgbnVtYmVyIGluIHNldFZpc2liaWxpdHk6IFwiICsgaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeFtpXSA9IG51bVtpXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG51bVtpXSA8IDAgfHwgbnVtW2ldID49IHgubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiSW52YWxpZCBzZXJpZXMgbnVtYmVyIGluIHNldFZpc2liaWxpdHk6IFwiICsgbnVtW2ldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4W251bVtpXV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMucHJlZHJhd18oKTtcbn07XG5cbi8qKlxuICogSG93IGxhcmdlIG9mIGFuIGFyZWEgd2lsbCB0aGUgZHlncmFwaCByZW5kZXIgaXRzZWxmIGluP1xuICogVGhpcyBpcyB1c2VkIGZvciB0ZXN0aW5nLlxuICogQHJldHVybiBBIHt3aWR0aDogdywgaGVpZ2h0OiBofSBvYmplY3QuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7IHdpZHRoOiB0aGlzLndpZHRoXywgaGVpZ2h0OiB0aGlzLmhlaWdodF8gfTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBsaXN0IG9mIGFubm90YXRpb25zIGFuZCByZWRyYXcgdGhlIGNoYXJ0LlxuICogU2VlIGR5Z3JhcGhzLmNvbS9hbm5vdGF0aW9ucy5odG1sIGZvciBtb3JlIGluZm8gb24gaG93IHRvIHVzZSBhbm5vdGF0aW9ucy5cbiAqIEBwYXJhbSBhbm4ge0FycmF5fSBBbiBhcnJheSBvZiBhbm5vdGF0aW9uIG9iamVjdHMuXG4gKiBAcGFyYW0gc3VwcHJlc3NEcmF3IHtCb29sZWFufSBTZXQgdG8gXCJ0cnVlXCIgdG8gYmxvY2sgY2hhcnQgcmVkcmF3IChvcHRpb25hbCkuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnNldEFubm90YXRpb25zID0gZnVuY3Rpb24oYW5uLCBzdXBwcmVzc0RyYXcpIHtcbiAgLy8gT25seSBhZGQgdGhlIGFubm90YXRpb24gQ1NTIHJ1bGUgb25jZSB3ZSBrbm93IGl0IHdpbGwgYmUgdXNlZC5cbiAgdGhpcy5hbm5vdGF0aW9uc18gPSBhbm47XG4gIGlmICghdGhpcy5sYXlvdXRfKSB7XG4gICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gc2V0QW5ub3RhdGlvbnMgYmVmb3JlIGR5Z3JhcGggd2FzIHJlYWR5LiBcIiArXG4gICAgICAgICAgICAgICAgIFwiVHJ5IHNldHRpbmcgdGhlbSBpbiBhIHJlYWR5KCkgYmxvY2suIFNlZSBcIiArXG4gICAgICAgICAgICAgICAgIFwiZHlncmFwaHMuY29tL3Rlc3RzL2Fubm90YXRpb24uaHRtbFwiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmxheW91dF8uc2V0QW5ub3RhdGlvbnModGhpcy5hbm5vdGF0aW9uc18pO1xuICBpZiAoIXN1cHByZXNzRHJhdykge1xuICAgIHRoaXMucHJlZHJhd18oKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxpc3Qgb2YgYW5ub3RhdGlvbnMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmFubm90YXRpb25zID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmFubm90YXRpb25zXztcbn07XG5cbi8qKlxuICogR2V0IHRoZSBsaXN0IG9mIGxhYmVsIG5hbWVzIGZvciB0aGlzIGdyYXBoLiBUaGUgZmlyc3QgY29sdW1uIGlzIHRoZVxuICogeC1heGlzLCBzbyB0aGUgZGF0YSBzZXJpZXMgbmFtZXMgc3RhcnQgYXQgaW5kZXggMS5cbiAqXG4gKiBSZXR1cm5zIG51bGwgd2hlbiBsYWJlbHMgaGF2ZSBub3QgeWV0IGJlZW4gZGVmaW5lZC5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0TGFiZWxzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsYWJlbHMgPSB0aGlzLmF0dHJfKFwibGFiZWxzXCIpO1xuICByZXR1cm4gbGFiZWxzID8gbGFiZWxzLnNsaWNlKCkgOiBudWxsO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGluZGV4IG9mIGEgc2VyaWVzIChjb2x1bW4pIGdpdmVuIGl0cyBuYW1lLiBUaGUgZmlyc3QgY29sdW1uIGlzIHRoZVxuICogeC1heGlzLCBzbyB0aGUgZGF0YSBzZXJpZXMgc3RhcnQgd2l0aCBpbmRleCAxLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5pbmRleEZyb21TZXROYW1lID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5zZXRJbmRleEJ5TmFtZV9bbmFtZV07XG59O1xuXG4vKipcbiAqIEZpbmQgdGhlIHJvdyBudW1iZXIgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4geC12YWx1ZS5cbiAqIFJldHVybnMgbnVsbCBpZiB0aGVyZSBpcyBubyBzdWNoIHgtdmFsdWUgaW4gdGhlIGRhdGEuXG4gKiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgcm93cyB3aXRoIHRoZSBzYW1lIHgtdmFsdWUsIHRoaXMgd2lsbCByZXR1cm4gdGhlXG4gKiBmaXJzdCBvbmUuXG4gKiBAcGFyYW0ge251bWJlcn0geFZhbCBUaGUgeC12YWx1ZSB0byBsb29rIGZvciAoZS5nLiBtaWxsaXMgc2luY2UgZXBvY2gpLlxuICogQHJldHVybiB7P251bWJlcn0gVGhlIHJvdyBudW1iZXIsIHdoaWNoIHlvdSBjYW4gcGFzcyB0byBnZXRWYWx1ZSgpLCBvciBudWxsLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5nZXRSb3dGb3JYID0gZnVuY3Rpb24oeFZhbCkge1xuICB2YXIgbG93ID0gMCxcbiAgICAgIGhpZ2ggPSB0aGlzLm51bVJvd3MoKSAtIDE7XG5cbiAgd2hpbGUgKGxvdyA8PSBoaWdoKSB7XG4gICAgdmFyIGlkeCA9IChoaWdoICsgbG93KSA+PiAxO1xuICAgIHZhciB4ID0gdGhpcy5nZXRWYWx1ZShpZHgsIDApO1xuICAgIGlmICh4IDwgeFZhbCkge1xuICAgICAgbG93ID0gaWR4ICsgMTtcbiAgICB9IGVsc2UgaWYgKHggPiB4VmFsKSB7XG4gICAgICBoaWdoID0gaWR4IC0gMTtcbiAgICB9IGVsc2UgaWYgKGxvdyAhPSBpZHgpIHsgIC8vIGVxdWFsLCBidXQgdGhlcmUgbWF5IGJlIGFuIGVhcmxpZXIgbWF0Y2guXG4gICAgICBoaWdoID0gaWR4O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaWR4O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBUcmlnZ2VyIGEgY2FsbGJhY2sgd2hlbiB0aGUgZHlncmFwaCBoYXMgZHJhd24gaXRzZWxmIGFuZCBpcyByZWFkeSB0byBiZVxuICogbWFuaXB1bGF0ZWQuIFRoaXMgaXMgcHJpbWFyaWx5IHVzZWZ1bCB3aGVuIGR5Z3JhcGhzIGhhcyB0byBkbyBhbiBYSFIgZm9yIHRoZVxuICogZGF0YSAoaS5lLiBhIFVSTCBpcyBwYXNzZWQgYXMgdGhlIGRhdGEgc291cmNlKSBhbmQgdGhlIGNoYXJ0IGlzIGRyYXduXG4gKiBhc3luY2hyb25vdXNseS4gSWYgdGhlIGNoYXJ0IGhhcyBhbHJlYWR5IGRyYXduLCB0aGUgY2FsbGJhY2sgd2lsbCBmaXJlXG4gKiBpbW1lZGlhdGVseS5cbiAqXG4gKiBUaGlzIGlzIGEgZ29vZCBwbGFjZSB0byBjYWxsIHNldEFubm90YXRpb24oKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCFEeWdyYXBoKX0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHRyaWdnZXIgd2hlbiB0aGUgY2hhcnRcbiAqICAgICBpcyByZWFkeS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICBpZiAodGhpcy5pc19pbml0aWFsX2RyYXdfKSB7XG4gICAgdGhpcy5yZWFkeUZuc18ucHVzaChjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgaGFuZGxlci4gVGhpcyBldmVudCBoYW5kbGVyIGlzIGtlcHQgdW50aWwgdGhlIGdyYXBoIGlzXG4gKiBkZXN0cm95ZWQgd2l0aCBhIGNhbGwgdG8gZ3JhcGguZGVzdHJveSgpLlxuICpcbiAqIEBwYXJhbSB7IU5vZGV9IGVsZW0gVGhlIGVsZW1lbnQgdG8gYWRkIHRoZSBldmVudCB0by5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBldmVudCwgZS5nLiAnY2xpY2snIG9yICdtb3VzZW1vdmUnLlxuICogQHBhcmFtIHtmdW5jdGlvbihFdmVudCk6KGJvb2xlYW58dW5kZWZpbmVkKX0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGxcbiAqICAgICBvbiB0aGUgZXZlbnQuIFRoZSBmdW5jdGlvbiB0YWtlcyBvbmUgcGFyYW1ldGVyOiB0aGUgZXZlbnQgb2JqZWN0LlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuYWRkQW5kVHJhY2tFdmVudCA9IGZ1bmN0aW9uKGVsZW0sIHR5cGUsIGZuKSB7XG4gIHV0aWxzLmFkZEV2ZW50KGVsZW0sIHR5cGUsIGZuKTtcbiAgdGhpcy5yZWdpc3RlcmVkRXZlbnRzXy5wdXNoKHtlbGVtLCB0eXBlLCBmbn0pO1xufTtcblxuRHlncmFwaC5wcm90b3R5cGUucmVtb3ZlVHJhY2tlZEV2ZW50c18gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMucmVnaXN0ZXJlZEV2ZW50c18pIHtcbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCB0aGlzLnJlZ2lzdGVyZWRFdmVudHNfLmxlbmd0aDsgaWR4KyspIHtcbiAgICAgIHZhciByZWcgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudHNfW2lkeF07XG4gICAgICB1dGlscy5yZW1vdmVFdmVudChyZWcuZWxlbSwgcmVnLnR5cGUsIHJlZy5mbik7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5yZWdpc3RlcmVkRXZlbnRzXyA9IFtdO1xufTtcblxuLy8gSW5zdGFsbGVkIHBsdWdpbnMsIGluIG9yZGVyIG9mIHByZWNlZGVuY2UgKG1vc3QtZ2VuZXJhbCB0byBtb3N0LXNwZWNpZmljKS5cbi8vIFRoaXMgbWVhbnMgdGhhdCwgaW4gYW4gZXZlbnQgY2FzY2FkZSwgcGx1Z2lucyB3aGljaCBoYXZlIHJlZ2lzdGVyZWRcbi8vIGZvciB0aGF0IGV2ZW50IHdpbGwgYmUgY2FsbGVkIGluIHJldmVyc2Ugb3JkZXIuXG4vL1xuLy8gVGhpcyBpcyBtb3N0IHJlbGV2YW50IGZvciBwbHVnaW5zIHdoaWNoIHJlZ2lzdGVyIGEgbGF5b3V0IGV2ZW50LFxuLy8gZS5nLiBBeGVzLCBMZWdlbmQgYW5kIENoYXJ0TGFiZWxzLlxuRHlncmFwaC5QTFVHSU5TID0gW1xuICBMZWdlbmRQbHVnaW4sXG4gIEF4ZXNQbHVnaW4sXG4gIFJhbmdlU2VsZWN0b3JQbHVnaW4sIC8vIEhhcyB0byBiZSBiZWZvcmUgQ2hhcnRMYWJlbHMgc28gdGhhdCBpdHMgY2FsbGJhY2tzIGFyZSBjYWxsZWQgYWZ0ZXIgQ2hhcnRMYWJlbHMnIGNhbGxiYWNrcy5cbiAgQ2hhcnRMYWJlbHNQbHVnaW4sXG4gIEFubm90YXRpb25zUGx1Z2luLFxuICBHcmlkUGx1Z2luXG5dO1xuXG4vLyBUaGVyZSBhcmUgbWFueSBzeW1ib2xzIHdoaWNoIGhhdmUgaGlzdG9yaWNhbGx5IGJlZW4gYXZhaWxhYmxlIHRocm91Z2ggdGhlXG4vLyBEeWdyYXBoIGNsYXNzLiBUaGVzZSBhcmUgZXhwb3J0ZWQgaGVyZSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG5EeWdyYXBoLkdWaXpDaGFydCA9IEdWaXpDaGFydDtcbkR5Z3JhcGguRE9UVEVEX0xJTkUgPSB1dGlscy5ET1RURURfTElORTtcbkR5Z3JhcGguREFTSEVEX0xJTkUgPSB1dGlscy5EQVNIRURfTElORTtcbkR5Z3JhcGguRE9UX0RBU0hfTElORSA9IHV0aWxzLkRPVF9EQVNIX0xJTkU7XG5EeWdyYXBoLmRhdGVBeGlzTGFiZWxGb3JtYXR0ZXIgPSB1dGlscy5kYXRlQXhpc0xhYmVsRm9ybWF0dGVyO1xuRHlncmFwaC50b1JHQl8gPSB1dGlscy50b1JHQl87XG5EeWdyYXBoLmZpbmRQb3MgPSB1dGlscy5maW5kUG9zO1xuRHlncmFwaC5wYWdlWCA9IHV0aWxzLnBhZ2VYO1xuRHlncmFwaC5wYWdlWSA9IHV0aWxzLnBhZ2VZO1xuRHlncmFwaC5kYXRlU3RyaW5nXyA9IHV0aWxzLmRhdGVTdHJpbmdfO1xuRHlncmFwaC5kZWZhdWx0SW50ZXJhY3Rpb25Nb2RlbCA9IER5Z3JhcGhJbnRlcmFjdGlvbi5kZWZhdWx0TW9kZWw7XG5EeWdyYXBoLm5vbkludGVyYWN0aXZlTW9kZWwgPSBEeWdyYXBoLm5vbkludGVyYWN0aXZlTW9kZWxfID0gRHlncmFwaEludGVyYWN0aW9uLm5vbkludGVyYWN0aXZlTW9kZWxfO1xuRHlncmFwaC5DaXJjbGVzID0gdXRpbHMuQ2lyY2xlcztcblxuRHlncmFwaC5QbHVnaW5zID0ge1xuICBMZWdlbmQ6IExlZ2VuZFBsdWdpbixcbiAgQXhlczogQXhlc1BsdWdpbixcbiAgQW5ub3RhdGlvbnM6IEFubm90YXRpb25zUGx1Z2luLFxuICBDaGFydExhYmVsczogQ2hhcnRMYWJlbHNQbHVnaW4sXG4gIEdyaWQ6IEdyaWRQbHVnaW4sXG4gIFJhbmdlU2VsZWN0b3I6IFJhbmdlU2VsZWN0b3JQbHVnaW5cbn07XG5cbkR5Z3JhcGguRGF0YUhhbmRsZXJzID0ge1xuICBEZWZhdWx0SGFuZGxlcixcbiAgQmFyc0hhbmRsZXIsXG4gIEN1c3RvbUJhcnNIYW5kbGVyLFxuICBEZWZhdWx0RnJhY3Rpb25IYW5kbGVyLFxuICBFcnJvckJhcnNIYW5kbGVyLFxuICBGcmFjdGlvbnNCYXJzSGFuZGxlclxufTtcblxuRHlncmFwaC5zdGFydFBhbiA9IER5Z3JhcGhJbnRlcmFjdGlvbi5zdGFydFBhbjtcbkR5Z3JhcGguc3RhcnRab29tID0gRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0Wm9vbTtcbkR5Z3JhcGgubW92ZVBhbiA9IER5Z3JhcGhJbnRlcmFjdGlvbi5tb3ZlUGFuO1xuRHlncmFwaC5tb3ZlWm9vbSA9IER5Z3JhcGhJbnRlcmFjdGlvbi5tb3ZlWm9vbTtcbkR5Z3JhcGguZW5kUGFuID0gRHlncmFwaEludGVyYWN0aW9uLmVuZFBhbjtcbkR5Z3JhcGguZW5kWm9vbSA9IER5Z3JhcGhJbnRlcmFjdGlvbi5lbmRab29tO1xuXG5EeWdyYXBoLm51bWVyaWNMaW5lYXJUaWNrcyA9IER5Z3JhcGhUaWNrZXJzLm51bWVyaWNMaW5lYXJUaWNrcztcbkR5Z3JhcGgubnVtZXJpY1RpY2tzID0gRHlncmFwaFRpY2tlcnMubnVtZXJpY1RpY2tzO1xuRHlncmFwaC5pbnRlZ2VyVGlja3MgPSBEeWdyYXBoVGlja2Vycy5pbnRlZ2VyVGlja3M7XG5EeWdyYXBoLmRhdGVUaWNrZXIgPSBEeWdyYXBoVGlja2Vycy5kYXRlVGlja2VyO1xuRHlncmFwaC5HcmFudWxhcml0eSA9IER5Z3JhcGhUaWNrZXJzLkdyYW51bGFyaXR5O1xuRHlncmFwaC5waWNrRGF0ZVRpY2tHcmFudWxhcml0eSA9IER5Z3JhcGhUaWNrZXJzLnBpY2tEYXRlVGlja0dyYW51bGFyaXR5O1xuRHlncmFwaC5nZXREYXRlQXhpcyA9IER5Z3JhcGhUaWNrZXJzLmdldERhdGVBeGlzO1xuRHlncmFwaC5mbG9hdEZvcm1hdCA9IHV0aWxzLmZsb2F0Rm9ybWF0O1xuXG51dGlscy5zZXR1cERPTXJlYWR5XyhEeWdyYXBoKTtcblxuZXhwb3J0IGRlZmF1bHQgRHlncmFwaDtcbiJdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWTs7QUFFWjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaENBQSxNQUFBLENBQUFDLGNBQUEsQ0FBQUMsT0FBQTtFQUFBQyxLQUFBO0FBQUE7QUFBQUQsT0FBQTtBQWtDQSxJQUFBRSxjQUFBLEdBQUFDLHNCQUFBLENBQUFDLE9BQUE7QUFDQSxJQUFBQyxjQUFBLEdBQUFGLHNCQUFBLENBQUFDLE9BQUE7QUFDQSxJQUFBRSxlQUFBLEdBQUFILHNCQUFBLENBQUFDLE9BQUE7QUFDQSxJQUFBRyx3QkFBQSxHQUFBSixzQkFBQSxDQUFBQyxPQUFBO0FBQ0EsSUFBQUksY0FBQSxHQUFBQyx1QkFBQSxDQUFBTCxPQUFBO0FBQ0EsSUFBQU0sS0FBQSxHQUFBRCx1QkFBQSxDQUFBTCxPQUFBO0FBQ0EsSUFBQU8sb0JBQUEsR0FBQVIsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFR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