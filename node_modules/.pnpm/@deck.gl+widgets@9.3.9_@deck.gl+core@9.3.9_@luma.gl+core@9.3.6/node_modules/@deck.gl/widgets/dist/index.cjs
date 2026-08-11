"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/index.js
var dist_exports = {};
__export(dist_exports, {
  CompassWidget: () => CompassWidget,
  ContextMenuWidget: () => ContextMenuWidget,
  DarkGlassTheme: () => DarkGlassTheme,
  DarkTheme: () => DarkTheme,
  FullscreenWidget: () => FullscreenWidget,
  GimbalWidget: () => GimbalWidget,
  IconWidget: () => IconWidget,
  InfoWidget: () => InfoWidget,
  LightGlassTheme: () => LightGlassTheme,
  LightTheme: () => LightTheme,
  LoadingWidget: () => LoadingWidget,
  PopupWidget: () => PopupWidget,
  ResetViewWidget: () => ResetViewWidget,
  ScreenshotWidget: () => ScreenshotWidget,
  ScrollbarWidget: () => ScrollbarWidget,
  SelectorWidget: () => SelectorWidget,
  ThemeWidget: () => ThemeWidget,
  ToggleWidget: () => ToggleWidget,
  ZoomWidget: () => ZoomWidget,
  _ButtonGroup: () => ButtonGroup,
  _CoordinatesGeocoder: () => CoordinatesGeocoder,
  _CurrentLocationGeocoder: () => CurrentLocationGeocoder,
  _DropdownMenu: () => DropdownMenu,
  _GeocoderWidget: () => GeocoderWidget,
  _GoogleGeocoder: () => GoogleGeocoder,
  _IconButton: () => IconButton,
  _MapboxGeocoder: () => MapboxGeocoder,
  _OpenCageGeocoder: () => OpenCageGeocoder,
  _RangeInput: () => RangeInput,
  _ScaleWidget: () => ScaleWidget,
  _SimpleMenu: () => SimpleMenu,
  _SplitterWidget: () => SplitterWidget,
  _StatsWidget: () => StatsWidget,
  _TimelineWidget: () => TimelineWidget
});
module.exports = __toCommonJS(dist_exports);

// dist/zoom-widget.js
var import_jsx_runtime3 = require("preact/jsx-runtime");
var import_core = require("@deck.gl/core");
var import_preact = require("preact");

// dist/lib/components/button-group.js
var import_jsx_runtime = require("preact/jsx-runtime");
var ButtonGroup = (props) => {
  const { children, orientation = "horizontal" } = props;
  return (0, import_jsx_runtime.jsx)("div", { className: `deck-widget-button-group ${orientation}`, children });
};

// dist/lib/components/icon-button.js
var import_jsx_runtime2 = require("preact/jsx-runtime");
var import_hooks = require("preact/hooks");

// dist/lib/data-url.js
function getCSSMask(imageUrl) {
  if (!imageUrl)
    return void 0;
  const cssUrl = `url("${imageUrl.replace(/"/g, `'`)}")`;
  return { maskImage: cssUrl, WebkitMaskImage: cssUrl };
}

// dist/lib/components/icon-button.js
var IconButton = (props) => {
  const { className = "", style, color, icon, label, onClick, children } = props;
  const iconStyle = (0, import_hooks.useMemo)(() => {
    const css = getCSSMask(icon);
    if (!color)
      return css;
    return { ...css, backgroundColor: color };
  }, [color, icon]);
  return (0, import_jsx_runtime2.jsx)("div", { className: "deck-widget-button", style, children: (0, import_jsx_runtime2.jsx)("button", { className: `deck-widget-icon-button ${className}`, type: "button", onClick, title: label, children: children ? children : (0, import_jsx_runtime2.jsx)("div", { className: "deck-widget-icon", style: iconStyle }) }) });
};

// dist/zoom-widget.js
var ZoomWidget = class extends import_core.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-zoom";
    this.placement = "top-left";
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    const ui = (0, import_jsx_runtime3.jsxs)(ButtonGroup, { orientation: this.props.orientation, children: [(0, import_jsx_runtime3.jsx)(IconButton, { onClick: () => this.handleZoomIn(), label: this.props.zoomInLabel, className: "deck-widget-zoom-in" }), (0, import_jsx_runtime3.jsx)(IconButton, { onClick: () => this.handleZoomOut(), label: this.props.zoomOutLabel, className: "deck-widget-zoom-out" })] });
    (0, import_preact.render)(ui, rootElement);
  }
  isOrthographicView(viewId) {
    const deck = this.deck;
    const view = (deck == null ? void 0 : deck.isInitialized) && deck.getView(viewId);
    return view instanceof import_core.OrthographicView;
  }
  handleZoom(viewId, delta) {
    var _a, _b, _c, _d;
    const viewState = this.getViewState(viewId);
    const newViewState = {};
    if (this.isOrthographicView(viewId)) {
      const { zoomAxis } = this.props;
      const { zoomX, minZoomX, maxZoomX, zoomY, minZoomY, maxZoomY } = normalizeOrthographicViewState(viewState);
      let nextZoom;
      let nextZoomY;
      if (zoomAxis === "X") {
        nextZoom = clamp(zoomX + delta, minZoomX, maxZoomX);
        nextZoomY = zoomY;
      } else if (zoomAxis === "Y") {
        nextZoom = zoomX;
        nextZoomY = clamp(zoomY + delta, minZoomY, maxZoomY);
      } else {
        const clampedDelta = clamp(delta, Math.max(minZoomX - zoomX, minZoomY - zoomY), Math.min(maxZoomX - zoomX, maxZoomY - zoomY));
        nextZoom = zoomX + clampedDelta;
        nextZoomY = zoomY + clampedDelta;
      }
      newViewState.zoom = [nextZoom, nextZoomY];
      newViewState.zoomX = nextZoom;
      newViewState.zoomY = nextZoomY;
      (_b = (_a = this.props).onZoom) == null ? void 0 : _b.call(_a, {
        viewId,
        delta,
        // `zoom` will not match the new state if using 2D zoom. Deprecated behavior for backward compatibility.
        zoom: zoomAxis === "Y" ? nextZoomY : nextZoom,
        zoomX: nextZoom,
        zoomY: nextZoomY
      });
    } else {
      const { zoom = 0, minZoom, maxZoom } = viewState;
      const nextZoom = clamp(zoom + delta, minZoom, maxZoom);
      newViewState.zoom = nextZoom;
      (_d = (_c = this.props).onZoom) == null ? void 0 : _d.call(_c, {
        viewId,
        delta,
        zoom: nextZoom
      });
    }
    const nextViewState = {
      ...viewState,
      ...newViewState
    };
    if (this.props.transitionDuration > 0) {
      nextViewState.transitionDuration = this.props.transitionDuration;
      nextViewState.transitionInterpolator = "latitude" in nextViewState ? new import_core.FlyToInterpolator() : new import_core.LinearInterpolator({
        transitionProps: "zoomX" in newViewState ? ["zoomX", "zoomY"] : ["zoom"]
      });
    }
    this.setViewState(viewId, nextViewState);
  }
  handleZoomIn() {
    for (const viewId of this.viewIds) {
      this.handleZoom(viewId, 1);
    }
  }
  handleZoomOut() {
    for (const viewId of this.viewIds) {
      this.handleZoom(viewId, -1);
    }
  }
};
ZoomWidget.defaultProps = {
  ...import_core.Widget.defaultProps,
  id: "zoom",
  placement: "top-left",
  orientation: "vertical",
  transitionDuration: 200,
  zoomInLabel: "Zoom In",
  zoomOutLabel: "Zoom Out",
  zoomAxis: "all",
  viewId: null,
  onZoom: () => {
  }
};
function clamp(zoom, minZoom, maxZoom) {
  return zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom;
}
function normalizeOrthographicViewState({ zoom = 0, zoomX, zoomY, minZoom = -Infinity, maxZoom = Infinity, minZoomX = minZoom, maxZoomX = maxZoom, minZoomY = minZoom, maxZoomY = maxZoom }) {
  zoomX = zoomX ?? (Array.isArray(zoom) ? zoom[0] : zoom);
  zoomY = zoomY ?? (Array.isArray(zoom) ? zoom[1] : zoom);
  return { zoomX, zoomY, minZoomX, minZoomY, maxZoomX, maxZoomY };
}

// dist/reset-view-widget.js
var import_jsx_runtime4 = require("preact/jsx-runtime");
var import_preact2 = require("preact");
var import_core2 = require("@deck.gl/core");
var ResetViewWidget = class extends import_core2.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-reset-view";
    this.placement = "top-left";
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    (0, import_preact2.render)((0, import_jsx_runtime4.jsx)(IconButton, { className: "deck-widget-reset-focus", label: this.props.label, onClick: this.handleClick.bind(this) }), rootElement);
  }
  handleClick() {
    var _a;
    const initialViewState = this.props.initialViewState || ((_a = this.deck) == null ? void 0 : _a.props.initialViewState);
    this.resetViewState(initialViewState);
  }
  resetViewState(viewState) {
    var _a, _b;
    for (const viewId of this.viewIds) {
      const nextViewState = {
        ...(viewState == null ? void 0 : viewState[viewId]) ?? viewState
        // only works for geospatial?
        // transitionDuration: this.props.transitionDuration,
        // transitionInterpolator: new FlyToInterpolator()
      };
      (_b = (_a = this.props).onReset) == null ? void 0 : _b.call(_a, { viewId, viewState: nextViewState });
      this.setViewState(viewId, nextViewState);
    }
  }
};
ResetViewWidget.defaultProps = {
  ...import_core2.Widget.defaultProps,
  id: "reset-view",
  placement: "top-left",
  label: "Reset View",
  initialViewState: void 0,
  viewId: null,
  onReset: () => {
  }
};

// dist/gimbal-widget.js
var import_jsx_runtime5 = require("preact/jsx-runtime");
var import_core3 = require("@deck.gl/core");
var import_preact3 = require("preact");
var GimbalWidget = class extends import_core3.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-gimbal";
    this.placement = "top-left";
    this.viewports = {};
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    var _a;
    const viewId = this.viewId || ((_a = Object.values(this.viewports)[0]) == null ? void 0 : _a.id) || "default-view";
    const widgetViewport = this.viewports[viewId];
    const { rotationOrbit, rotationX } = this.getNormalizedRotation(widgetViewport);
    const ui = (0, import_jsx_runtime5.jsx)("div", { className: "deck-widget-button", style: { perspective: 100, pointerEvents: "auto" }, children: (0, import_jsx_runtime5.jsxs)("button", { type: "button", onClick: () => {
      for (const viewport of Object.values(this.viewports)) {
        this.resetOrbitView(viewport);
      }
    }, title: this.props.label, style: { position: "relative", width: 26, height: 26 }, children: [(0, import_jsx_runtime5.jsx)("svg", { className: "gimbal-outer-ring", width: "100%", height: "100%", viewBox: "0 0 26 26", style: {
      position: "absolute",
      top: 0,
      left: 0,
      transform: `rotateY(${rotationOrbit}deg)`
    }, children: (0, import_jsx_runtime5.jsx)("circle", { cx: "13", cy: "13", r: "10", stroke: "var(--icon-gimbal-outer-color, rgb(68, 92, 204))", strokeWidth: this.props.strokeWidth, fill: "none" }) }), (0, import_jsx_runtime5.jsx)("svg", { className: "gimbal-inner-ring", width: "100%", height: "100%", viewBox: "0 0 26 26", style: {
      position: "absolute",
      top: 0,
      left: 0,
      transform: `rotateX(${rotationX}deg)`
    }, children: (0, import_jsx_runtime5.jsx)("circle", { cx: "13", cy: "13", r: "7", stroke: "var(--icon-gimbal-inner-color, rgb(240, 92, 68))", strokeWidth: this.props.strokeWidth, fill: "none" }) })] }) });
    (0, import_preact3.render)(ui, rootElement);
  }
  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport;
    this.updateHTML();
  }
  resetOrbitView(viewport) {
    var _a, _b;
    const viewId = this.viewId || (viewport == null ? void 0 : viewport.id) || "OrbitView";
    const viewState = this.getViewState(viewId);
    if ("rotationOrbit" in viewState || "rotationX" in viewState) {
      (_b = (_a = this.props).onReset) == null ? void 0 : _b.call(_a, { viewId, rotationOrbit: 0, rotationX: 0 });
      const nextViewState = {
        ...viewState,
        rotationOrbit: 0,
        rotationX: 0,
        transitionDuration: this.props.transitionDuration,
        transitionInterpolator: new import_core3.LinearInterpolator({
          transitionProps: ["rotationOrbit", "rotationX"]
        })
      };
      this.setViewState(viewId, nextViewState);
    }
  }
  getNormalizedRotation(viewport) {
    const viewId = this.viewId || (viewport == null ? void 0 : viewport.id) || "OrbitView";
    const viewState = this.getViewState(viewId);
    const [rz, rx] = this.getRotation(viewState);
    const rotationOrbit = normalizeAndClampAngle(rz);
    const rotationX = normalizeAndClampAngle(rx);
    return { rotationOrbit, rotationX };
  }
  getRotation(viewState) {
    if (viewState && ("rotationOrbit" in viewState || "rotationX" in viewState)) {
      return [-(viewState.rotationOrbit || 0), viewState.rotationX || 0];
    }
    return [0, 0];
  }
};
GimbalWidget.defaultProps = {
  ...import_core3.Widget.defaultProps,
  id: "gimbal",
  placement: "top-left",
  viewId: null,
  label: "Gimbal",
  strokeWidth: 1.5,
  transitionDuration: 200,
  onReset: () => {
  }
};
function normalizeAndClampAngle(angle) {
  let normalized = ((angle + 180) % 360 + 360) % 360 - 180;
  const AVOID_ANGLE_DELTA = 10;
  const distanceFrom90 = normalized - 90;
  if (Math.abs(distanceFrom90) < AVOID_ANGLE_DELTA) {
    if (distanceFrom90 < AVOID_ANGLE_DELTA) {
      normalized = 90 + AVOID_ANGLE_DELTA;
    } else if (distanceFrom90 > -AVOID_ANGLE_DELTA) {
      normalized = 90 - AVOID_ANGLE_DELTA;
    }
  }
  return normalized;
}

// dist/compass-widget.js
var import_jsx_runtime6 = require("preact/jsx-runtime");
var import_core4 = require("@deck.gl/core");
var import_preact4 = require("preact");
var CompassWidget = class extends import_core4.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-compass";
    this.placement = "top-left";
    this.viewports = {};
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    var _a;
    const viewId = this.viewId || ((_a = Object.values(this.viewports)[0]) == null ? void 0 : _a.id);
    const widgetViewport = this.viewports[viewId];
    const [rz, rx] = this.getRotation(widgetViewport);
    const ui = (0, import_jsx_runtime6.jsx)("div", { className: "deck-widget-button", style: { perspective: 100 }, children: (0, import_jsx_runtime6.jsx)("button", { type: "button", onClick: () => {
      for (const viewport of Object.values(this.viewports)) {
        this.handleCompassReset(viewport);
      }
    }, title: this.props.label, style: { transform: `rotateX(${rx}deg)` }, children: (0, import_jsx_runtime6.jsx)("svg", { fill: "none", width: "100%", height: "100%", viewBox: "0 0 26 26", children: (0, import_jsx_runtime6.jsxs)("g", { transform: `rotate(${rz},13,13)`, children: [(0, import_jsx_runtime6.jsx)("path", { d: "M10 13.0001L12.9999 5L15.9997 13.0001H10Z", fill: "var(--icon-compass-north-color, rgb(240, 92, 68))" }), (0, import_jsx_runtime6.jsx)("path", { d: "M16.0002 12.9999L13.0004 21L10.0005 12.9999H16.0002Z", fill: "var(--icon-compass-south-color, rgb(204, 204, 204))" })] }) }) }) });
    (0, import_preact4.render)(ui, rootElement);
  }
  onViewportChange(viewport) {
    if (!viewport.equals(this.viewports[viewport.id])) {
      this.viewports[viewport.id] = viewport;
      this.updateHTML();
    }
  }
  getRotation(viewport) {
    if (viewport instanceof import_core4.WebMercatorViewport) {
      return [-viewport.bearing, viewport.pitch];
    } else if (viewport instanceof import_core4._GlobeViewport) {
      return [0, Math.max(-80, Math.min(80, viewport.latitude))];
    }
    return [0, 0];
  }
  handleCompassReset(viewport) {
    var _a, _b;
    const viewId = this.viewId || viewport.id;
    if (viewport instanceof import_core4.WebMercatorViewport) {
      const viewState = this.getViewState(viewId);
      const resetPitch = this.getRotation(viewport)[0] === 0;
      const nextBearing = 0;
      const nextPitch = resetPitch ? 0 : viewport.pitch;
      (_b = (_a = this.props).onReset) == null ? void 0 : _b.call(_a, { viewId, bearing: nextBearing, pitch: nextPitch });
      const nextViewState = {
        ...viewState,
        bearing: nextBearing,
        ...resetPitch ? { pitch: nextPitch } : {},
        transitionDuration: this.props.transitionDuration,
        transitionInterpolator: new import_core4.FlyToInterpolator()
      };
      this.setViewState(viewId, nextViewState);
    }
  }
};
CompassWidget.defaultProps = {
  ...import_core4.Widget.defaultProps,
  id: "compass",
  placement: "top-left",
  viewId: null,
  label: "Reset Compass",
  transitionDuration: 200,
  onReset: () => {
  }
};

// dist/scale-widget.js
var import_jsx_runtime7 = require("preact/jsx-runtime");
var import_preact5 = require("preact");
var import_core5 = require("@deck.gl/core");
var ScaleWidget = class extends import_core5.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-scale";
    this.placement = "bottom-left";
    this.scaleWidth = 10;
    this.scaleValue = 0;
    this.scaleText = "";
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    const lineOffsetX = 50;
    const svgWidth = lineOffsetX + this.scaleWidth;
    const tickHeight = 10;
    (0, import_preact5.render)((0, import_jsx_runtime7.jsxs)("svg", { className: "deck-widget-scale", width: svgWidth, height: 30, style: { overflow: "visible", background: "transparent" }, onClick: this.handleClick.bind(this), children: [(0, import_jsx_runtime7.jsx)("text", { x: lineOffsetX + 5, y: "10", textAnchor: "end", alignmentBaseline: "middle", style: { fontSize: "16px", fill: "black", fontWeight: "bold", fontFamily: "sans-serif" }, children: this.scaleText }), (0, import_jsx_runtime7.jsx)("line", { x1: lineOffsetX, y1: "15", x2: lineOffsetX + this.scaleWidth, y2: "15", stroke: "black", strokeWidth: "6" }), (0, import_jsx_runtime7.jsx)("line", { x1: lineOffsetX, y1: "15", x2: lineOffsetX, y2: 15 - tickHeight, stroke: "black", strokeWidth: "6" }), (0, import_jsx_runtime7.jsx)("line", { x1: lineOffsetX + this.scaleWidth, y1: "15", x2: lineOffsetX + this.scaleWidth, y2: 15 - tickHeight, stroke: "black", strokeWidth: "6" })] }), rootElement);
  }
  onViewportChange(viewport) {
    if (!("latitude" in viewport))
      return;
    const { latitude, zoom } = viewport;
    const metersPerPixel = getMetersPerPixel(latitude, zoom);
    const { candidate, candidatePixels } = computeScaleCandidate(metersPerPixel);
    this.scaleValue = candidate;
    this.scaleWidth = candidatePixels;
    if (candidate >= 1e3) {
      this.scaleText = `${(candidate / 1e3).toFixed(1)} km`;
    } else {
      this.scaleText = `${candidate} m`;
    }
    this.updateHTML();
  }
  handleClick() {
  }
};
ScaleWidget.defaultProps = {
  ...import_core5.Widget.defaultProps,
  id: "scale",
  placement: "bottom-left",
  label: "Scale",
  viewId: null
};
function getMetersPerPixel(latitude, zoom) {
  const earthCircumference = 40075016686e-3;
  return earthCircumference * Math.cos(latitude * Math.PI / 180) / Math.pow(2, zoom + 8);
}
function computeScaleCandidate(metersPerPixel) {
  const minPixels = 100;
  const maxPixels = 200;
  const targetPixels = (minPixels + maxPixels) / 2;
  const targetDistance = targetPixels * metersPerPixel;
  const exponent = Math.floor(Math.log10(targetDistance));
  const base = Math.pow(10, exponent);
  const multipliers = [1, 2, 5];
  let candidate = multipliers[0] * base;
  let candidatePixels = candidate / metersPerPixel;
  for (let i = 0; i < multipliers.length; i++) {
    const currentCandidate = multipliers[i] * base;
    const currentPixels = currentCandidate / metersPerPixel;
    if (currentPixels >= minPixels && currentPixels <= maxPixels) {
      candidate = currentCandidate;
      candidatePixels = currentPixels;
      break;
    }
    if (currentPixels > maxPixels) {
      candidate = i > 0 ? multipliers[i - 1] * base : currentCandidate;
      candidatePixels = candidate / metersPerPixel;
      break;
    }
    if (i === multipliers.length - 1 && currentPixels < minPixels) {
      candidate = multipliers[0] * base * 10;
      candidatePixels = candidate / metersPerPixel;
    }
  }
  return { candidate, candidatePixels };
}

// dist/geocoder-widget.js
var import_jsx_runtime9 = require("preact/jsx-runtime");
var import_core6 = require("@deck.gl/core");
var import_core7 = require("@deck.gl/core");
var import_preact6 = require("preact");

// dist/lib/components/dropdown-menu.js
var import_jsx_runtime8 = require("preact/jsx-runtime");
var import_hooks2 = require("preact/hooks");
function getMenuItemValue(item) {
  return typeof item === "string" ? item : item.value;
}
function getMenuItemLabel(item) {
  return typeof item === "string" ? item : item.label;
}
function getMenuItemIcon(item) {
  return typeof item === "string" ? void 0 : item.icon;
}
var DropdownMenu = (props) => {
  const [isOpen, setIsOpen] = (0, import_hooks2.useState)(false);
  return (0, import_jsx_runtime8.jsx)(SimpleMenu, { ...props, style: { ...props.style, position: "absolute" }, isOpen, onClose: () => setIsOpen(false), trigger: (0, import_jsx_runtime8.jsx)("button", { className: "deck-widget-dropdown-button", onClick: () => setIsOpen(!isOpen), children: (0, import_jsx_runtime8.jsx)("span", { className: `deck-widget-dropdown-icon ${isOpen ? "open" : ""}` }) }) });
};
var SimpleMenu = (props) => {
  const dropdownRef = (0, import_hooks2.useRef)(null);
  (0, import_hooks2.useEffect)(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        props.onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleSelect = (value, item) => {
    var _a, _b;
    if (value) {
      if (typeof item === "object") {
        (_a = item.onSelect) == null ? void 0 : _a.call(item);
      }
      (_b = props.onSelect) == null ? void 0 : _b.call(props, value);
      props.onClose();
    }
  };
  if (props.menuItems.length === 0) {
    return null;
  }
  return (0, import_jsx_runtime8.jsxs)("div", { className: "deck-widget-dropdown-container", ref: dropdownRef, children: [props.trigger, props.isOpen && (0, import_jsx_runtime8.jsx)("ul", { className: "deck-widget-dropdown-menu", style: props.style, children: props.menuItems.map((item, i) => {
    const value = getMenuItemValue(item);
    const icon = getMenuItemIcon(item);
    return (0, import_jsx_runtime8.jsxs)("li", { className: `deck-widget-dropdown-item ${value ? "" : "disabled"}`, onClick: () => handleSelect(value, item), children: [icon && (0, import_jsx_runtime8.jsx)("span", { className: "deck-widget-dropdown-item-icon", style: getCSSMask(icon) }), getMenuItemLabel(item)] }, i);
  }) })] });
};

// dist/lib/geocode/geocoder-history.js
var CURRENT_LOCATION = "current";
var LOCAL_STORAGE_KEY = "deck-geocoder-history";
var GeocoderHistory = class {
  constructor(props) {
    this.addressText = "";
    this.errorText = "";
    this.addressHistory = [];
    this.props = { maxEntries: 5, ...props };
    this.addressHistory = this.loadPreviousAddresses();
  }
  /** PErform geocoding */
  async geocode(geocoder, address, apiKey) {
    this.errorText = "";
    this.addressText = address;
    try {
      const coordinates = await geocoder.geocode(address, apiKey);
      if (coordinates) {
        this.storeAddress(this.addressText);
        return coordinates;
      }
      this.errorText = "Invalid address";
    } catch (error) {
      this.errorText = `${error.message}`;
    }
    return null;
  }
  loadPreviousAddresses() {
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const list = stored && JSON.parse(stored);
      const addresses = Array.isArray(list) ? list.filter((v) => typeof v === "string") : [];
      return addresses;
    } catch {
    }
    return [];
  }
  storeAddress(address) {
    const cleaned = address.trim();
    if (!cleaned || cleaned === CURRENT_LOCATION) {
      return;
    }
    const deduped = [cleaned, ...this.addressHistory.filter((a) => a !== cleaned)];
    this.addressHistory = deduped.slice(0, this.props.maxEntries);
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.addressHistory));
    } catch {
    }
  }
};

// dist/lib/geocode/geocoders.js
var GOOGLE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
var MAPBOX_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";
var OPENCAGE_API_URL = "https://api.opencagedata.com/geocode/v1/json";
var GoogleGeocoder = {
  name: "google",
  requiresApiKey: true,
  async geocode(address, apiKey) {
    const encodedAddress = encodeURIComponent(address);
    const json = await fetchJson(`${GOOGLE_URL}?address=${encodedAddress}&key=${apiKey}`);
    switch (json.status) {
      case "OK":
        const loc = json.results.length > 0 && json.results[0].geometry.location;
        return loc ? { longitude: loc.lng, latitude: loc.lat } : null;
      default:
        throw new Error(`Google Geocoder failed: ${json.status}`);
    }
  }
};
var MapboxGeocoder = {
  name: "google",
  requiresApiKey: true,
  async geocode(address, apiKey) {
    const encodedAddress = encodeURIComponent(address);
    const json = await fetchJson(`${MAPBOX_URL}/${encodedAddress}.json?access_token=${apiKey}`);
    if (Array.isArray(json.features) && json.features.length > 0) {
      const center = json.features[0].center;
      if (Array.isArray(center) && center.length >= 2) {
        return { longitude: center[0], latitude: center[1] };
      }
    }
    return null;
  }
};
var OpenCageGeocoder = {
  name: "opencage",
  requiresApiKey: true,
  async geocode(address, key) {
    const encodedAddress = encodeURIComponent(address);
    const data = await fetchJson(`${OPENCAGE_API_URL}?q=${encodedAddress}&key=${key}`);
    if (Array.isArray(data.results) && data.results.length > 0) {
      const geometry = data.results[0].geometry;
      return { longitude: geometry.lng, latitude: geometry.lat };
    }
    return null;
  }
};
var CurrentLocationGeocoder = {
  name: "current",
  requiresApiKey: false,
  /** Attempt to call browsers geolocation API */
  async geocode() {
    if (!navigator.geolocation) {
      throw new Error("Geolocation not supported");
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        /** @see https://developer.mozilla.org/docs/Web/API/GeolocationPosition */
        (position) => {
          const { longitude, latitude } = position.coords;
          resolve({ longitude, latitude });
        },
        /** @see https://developer.mozilla.org/docs/Web/API/GeolocationPositionError */
        (error) => reject(new Error(error.message))
      );
    });
  }
};
async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(`CORS error? ${error}. ${url}: `);
  }
  if (!response.ok) {
    throw new Error(`${response.statusText}. ${url}: `);
  }
  const data = await response.json();
  if (!data) {
    throw new Error(`No data returned. ${url}`);
  }
  return data;
}
var CoordinatesGeocoder = {
  name: "coordinates",
  requiresApiKey: false,
  placeholderLocation: `-122.45, 37.8 or 37\xB048'N, 122\xB027'W`,
  async geocode(address) {
    return parseCoordinates(address) || null;
  }
};
function parseCoordinates(input) {
  input = input.trim();
  const parts = input.split(/[,;]/).map((p) => p.trim());
  if (parts.length < 2)
    return null;
  const first = parseCoordinatePart(parts[0]);
  const second = parseCoordinatePart(parts[1]);
  if (first === null || second === null)
    return null;
  if (Math.abs(first) > 90 && Math.abs(second) > 90) {
    return null;
  }
  if (Math.abs(first) > 90) {
    return { longitude: first, latitude: second };
  }
  if (Math.abs(second) > 90) {
    return { longitude: second, latitude: first };
  }
  return { latitude: first, longitude: second };
}
function parseCoordinatePart(s) {
  s = s.trim();
  if (s.includes("\xB0") || s.includes("'") || s.includes('"')) {
    const value2 = dmsToDecimal(s);
    return isNaN(value2) ? null : value2;
  }
  let sign = 1;
  if (/[SW]/i.test(s))
    sign = -1;
  s = s.replace(/[NSEW]/gi, "");
  const value = parseFloat(s);
  return isNaN(value) ? null : sign * value;
}
function dmsToDecimal(s) {
  const regex = /(-?\d+)[°d]\s*(\d+)?['′m]?\s*(\d+(?:\.\d+)?)?[\"″s]?\s*([NSEW])?/i;
  const match = s.match(regex);
  if (!match)
    return NaN;
  const degrees = parseFloat(match[1]) || 0;
  const minutes = parseFloat(match[2]) || 0;
  const seconds = parseFloat(match[3]) || 0;
  const direction = match[4] || "";
  const sign = degrees < 0 ? -1 : 1;
  let dec = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  if (/[SW]/i.test(direction)) {
    dec = -dec;
  } else {
    dec = sign * dec;
  }
  return dec;
}

// dist/geocoder-widget.js
var CURRENT_LOCATION2 = "current";
var LOCATION_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -960 960 960'%3E%3Cpath d='M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z'/%3E%3C/svg%3E`;
var CURRENT_LOCATION_ITEM = {
  label: "Current location",
  value: CURRENT_LOCATION2,
  icon: LOCATION_ICON
};
var GeocoderWidget = class extends import_core6.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-geocoder";
    this.placement = "top-left";
    this.geocodeHistory = new GeocoderHistory({});
    this.addressText = "";
    this.geocoder = CoordinatesGeocoder;
    this.isGettingLocation = false;
    this.setInput = (text) => {
      this.addressText = text;
    };
    this.handleKeyPress = (e) => {
      if (e.key === "Enter") {
        this.handleSubmit();
      }
    };
    this.handleSelect = (value) => {
      if (value === CURRENT_LOCATION2) {
        this.getCurrentLocation();
      } else {
        this.setInput(value);
        this.handleSubmit();
      }
    };
    this.handleSubmit = () => {
      this.geocode(this.addressText);
    };
    this.getCurrentLocation = async () => {
      this.isGettingLocation = true;
      if (this.rootElement) {
        this.updateHTML();
      }
      try {
        const coordinates = await CurrentLocationGeocoder.geocode();
        if (coordinates) {
          this.flyTo(coordinates);
        }
      } catch (error) {
        this.geocodeHistory.errorText = error instanceof Error ? error.message : "Location error";
      } finally {
        this.isGettingLocation = false;
        if (this.rootElement) {
          this.updateHTML();
        }
      }
    };
    this.geocode = async (address) => {
      const coordinates = await this.geocodeHistory.geocode(this.geocoder, this.addressText, this.props.apiKey);
      if (this.rootElement) {
        this.updateHTML();
      }
      if (coordinates) {
        this.flyTo(coordinates);
      }
    };
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    this.geocoder = getGeocoder(this.props);
    if (this.geocoder.requiresApiKey && !this.props.apiKey) {
      throw new Error(`API key is required for the ${this.geocoder.name} geocoder`);
    }
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    const menuItems = this.props._geolocation ? [CURRENT_LOCATION_ITEM, ...this.geocodeHistory.addressHistory] : [...this.geocodeHistory.addressHistory];
    (0, import_preact6.render)((0, import_jsx_runtime9.jsxs)("div", { className: "deck-widget-geocoder", children: [(0, import_jsx_runtime9.jsx)("input", {
      className: "deck-widget-geocoder-input",
      type: "text",
      placeholder: this.isGettingLocation ? "Finding your location..." : this.geocoder.placeholderLocation ?? "Enter address or location",
      value: this.geocodeHistory.addressText,
      // @ts-expect-error event type
      onInput: (e) => {
        var _a;
        return this.setInput(((_a = e.target) == null ? void 0 : _a.value) || "");
      },
      onKeyPress: this.handleKeyPress
    }), (0, import_jsx_runtime9.jsx)(DropdownMenu, { menuItems, onSelect: this.handleSelect }), this.geocodeHistory.errorText && (0, import_jsx_runtime9.jsx)("div", { className: "deck-widget-geocoder-error", children: this.geocodeHistory.errorText })] }), rootElement);
  }
  flyTo(viewState) {
    var _a, _b;
    for (const viewId of this.viewIds) {
      if ("longitude" in viewState && "latitude" in viewState) {
        (_b = (_a = this.props).onGeocode) == null ? void 0 : _b.call(_a, {
          viewId,
          coordinates: {
            longitude: viewState.longitude,
            latitude: viewState.latitude,
            zoom: viewState.zoom
          }
        });
      }
      const currentViewState = this.getViewState(viewId);
      const nextViewState = {
        ...currentViewState,
        ...viewState
      };
      if (this.props.transitionDuration > 0) {
        nextViewState.transitionDuration = this.props.transitionDuration;
        nextViewState.transitionInterpolator = "latitude" in nextViewState ? new import_core7.FlyToInterpolator() : new import_core7.LinearInterpolator();
      }
      this.setViewState(viewId, nextViewState);
    }
  }
};
GeocoderWidget.defaultProps = {
  ...import_core6.Widget.defaultProps,
  id: "geocoder",
  viewId: null,
  placement: "top-left",
  label: "Geocoder",
  transitionDuration: 200,
  geocoder: "coordinates",
  customGeocoder: CoordinatesGeocoder,
  apiKey: "",
  _geolocation: false,
  onGeocode: () => {
  }
};
function getGeocoder(props) {
  switch (props.geocoder) {
    case "google":
      return GoogleGeocoder;
    case "mapbox":
      return MapboxGeocoder;
    case "opencage":
      return OpenCageGeocoder;
    case "coordinates":
      return CoordinatesGeocoder;
    case "custom":
      if (!props.customGeocoder) {
        throw new Error("Custom geocoder is not defined");
      }
      return props.customGeocoder;
    default:
      throw new Error(`Unknown geocoder: ${props.geocoder}`);
  }
}

// dist/fullscreen-widget.js
var import_jsx_runtime10 = require("preact/jsx-runtime");
var import_core8 = require("@deck.gl/core");
var import_preact7 = require("preact");
var FullscreenWidget = class extends import_core8.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-fullscreen";
    this.placement = "top-left";
    this.fullscreen = false;
    this.setProps(this.props);
  }
  onAdd() {
    document.addEventListener("fullscreenchange", this.onFullscreenChange.bind(this));
  }
  onRemove() {
    document.removeEventListener("fullscreenchange", this.onFullscreenChange.bind(this));
  }
  onRenderHTML(rootElement) {
    const isFullscreen = this.getFullscreen();
    (0, import_preact7.render)((0, import_jsx_runtime10.jsx)(IconButton, { onClick: () => {
      this.handleClick().catch((err) => import_core8.log.error(err)());
    }, label: isFullscreen ? this.props.exitLabel : this.props.enterLabel, className: isFullscreen ? "deck-widget-fullscreen-exit" : "deck-widget-fullscreen-enter" }), rootElement);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  getContainer() {
    var _a, _b, _c;
    return this.props.container || ((_a = this.deck) == null ? void 0 : _a.props.parent) || ((_c = (_b = this.deck) == null ? void 0 : _b.getCanvas()) == null ? void 0 : _c.parentElement);
  }
  getFullscreen() {
    return this.fullscreen;
  }
  onFullscreenChange() {
    var _a, _b;
    const fullscreen = document.fullscreenElement === this.getContainer();
    if (fullscreen !== this.fullscreen) {
      this.fullscreen = fullscreen;
      (_b = (_a = this.props).onFullscreenChange) == null ? void 0 : _b.call(_a, fullscreen);
      this.updateHTML();
    }
  }
  async handleClick() {
    const isFullscreen = this.getFullscreen();
    if (isFullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
  }
  async requestFullscreen() {
    const container = this.getContainer();
    if (container == null ? void 0 : container.requestFullscreen) {
      await container.requestFullscreen({ navigationUI: "hide" });
    } else {
      this.togglePseudoFullscreen();
    }
  }
  async exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else {
      this.togglePseudoFullscreen();
    }
  }
  togglePseudoFullscreen() {
    var _a, _b, _c;
    (_a = this.getContainer()) == null ? void 0 : _a.classList.toggle("deck-pseudo-fullscreen");
    this.fullscreen = !this.fullscreen;
    (_c = (_b = this.props).onFullscreenChange) == null ? void 0 : _c.call(_b, this.fullscreen);
    this.updateHTML();
  }
};
FullscreenWidget.defaultProps = {
  ...import_core8.Widget.defaultProps,
  id: "fullscreen",
  placement: "top-left",
  viewId: null,
  enterLabel: "Enter Fullscreen",
  exitLabel: "Exit Fullscreen",
  container: void 0,
  onFullscreenChange: () => {
  }
};

// dist/splitter-widget.js
var import_jsx_runtime11 = require("preact/jsx-runtime");
var import_preact8 = require("preact");
var import_hooks3 = require("preact/hooks");
var import_core9 = require("@deck.gl/core");
function parseViewLayout(root) {
  const layoutsById = [];
  const isViewLayout = (v) => "views" in v;
  function createManagedViewLayout(l) {
    const id = layoutsById.length;
    const minSplit = l.minSplit ?? 0.05;
    const maxSplit = l.maxSplit ?? 0.95;
    const split = Math.min(Math.max(l.initialSplit ?? 0.5, minSplit), maxSplit);
    const managed = {
      id,
      orientation: l.orientation,
      views: l.views,
      split,
      editable: l.editable ?? true,
      minSplit,
      maxSplit,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    layoutsById.push(managed);
    managed.views = [
      isViewLayout(l.views[0]) ? createManagedViewLayout(l.views[0]) : l.views[0],
      isViewLayout(l.views[1]) ? createManagedViewLayout(l.views[1]) : l.views[1]
    ];
    return managed;
  }
  createManagedViewLayout(root);
  return layoutsById;
}
function evaluateViews(root) {
  const views = [];
  function evaluateViewLayout(l, x, y, width, height) {
    l.x = x;
    l.y = y;
    l.width = width;
    l.height = height;
    const child1X = x;
    const child1Y = y;
    let child1Width = width;
    let child1Height = height;
    let child2X = x;
    let child2Y = y;
    let child2Width = width;
    let child2Height = height;
    if (l.orientation === "horizontal") {
      child1Width = width * l.split;
      child2X = x + child1Width;
      child2Width = width - child1Width;
    } else {
      child1Height = height * l.split;
      child2Y = y + child1Height;
      child2Height = height - child1Height;
    }
    const [view1, view2] = l.views;
    if ("views" in view1) {
      evaluateViewLayout(view1, child1X, child1Y, child1Width, child1Height);
    } else {
      views.push(view1.clone({
        x: `${child1X}%`,
        y: `${child1Y}%`,
        width: `${child1Width}%`,
        height: `${child1Height}%`
      }));
    }
    if ("views" in view2) {
      evaluateViewLayout(view2, child2X, child2Y, child2Width, child2Height);
    } else {
      views.push(view2.clone({
        x: `${child2X}%`,
        y: `${child2Y}%`,
        width: `${child2Width}%`,
        height: `${child2Height}%`
      }));
    }
  }
  evaluateViewLayout(root, 0, 0, 100, 100);
  return views;
}
var SplitterWidget = class extends import_core9.Widget {
  constructor(props) {
    super(props);
    this.className = "deck-widget-splitter";
    this.placement = "fill";
    this.needsUpdate = true;
    this.viewLayouts = parseViewLayout(this.props.viewLayout);
  }
  setProps(props) {
    if (props.viewLayout && !(0, import_core9._deepEqual)(props.viewLayout, this.props.viewLayout, -1)) {
      this.viewLayouts = parseViewLayout(props.viewLayout);
      this.views = void 0;
    }
    super.setProps(props);
  }
  onRedraw() {
    super.updateHTML();
  }
  // Usually widgets rerender their DOM elements here
  // In this case we need the widget UI to synchronize with deck view states
  // so we update deck props here and rerender DOM in the next onRedraw
  updateHTML() {
    if (!this.views) {
      this.views = evaluateViews(this.viewLayouts[0]);
      this.props.onChange(this.views.slice());
    }
    requestAnimationFrame(() => {
      this.doUpdate();
    });
  }
  doUpdate() {
    if (this.deck) {
      const deckViews = this.deck.props.views;
      const isManagedExternally = (
        // is not empty
        deckViews && // is not set by us
        deckViews !== this.lastViews
      );
      if (!isManagedExternally && this.lastViews !== this.views) {
        this.lastViews = this.views;
        this.deck.setProps({ views: this.views });
      }
    }
  }
  onChange(newSplit, layout) {
    layout.split = newSplit;
    this.views = evaluateViews(this.viewLayouts[0]);
    this.props.onChange(this.views.slice());
    this.doUpdate();
  }
  onRenderHTML(rootElement) {
    (0, import_preact8.render)((0, import_jsx_runtime11.jsx)(import_jsx_runtime11.Fragment, { children: this.viewLayouts.map((layout) => layout.editable && (0, import_jsx_runtime11.jsx)(Splitter, { ...layout, onChange: (newSplit) => this.onChange(newSplit, layout), onDragStart: () => this.props.onDragStart(), onDragEnd: () => this.props.onDragStart() })) }), rootElement);
  }
};
SplitterWidget.defaultProps = {
  ...import_core9.Widget.defaultProps,
  id: "splitter-widget",
  viewLayout: void 0,
  onChange: () => {
  },
  onDragStart: () => {
  },
  onDragEnd: () => {
  }
};
function Splitter({ orientation, x, y, width, height, split, minSplit, maxSplit, onChange, onDragStart, onDragEnd }) {
  const [dragging, setDragging] = (0, import_hooks3.useState)(false);
  const containerRef = (0, import_hooks3.useRef)(null);
  (0, import_hooks3.useEffect)(() => {
    if (!dragging) {
      return void 0;
    }
    const handleDragging = (event) => {
      if (!containerRef.current)
        return;
      const rect = containerRef.current.getBoundingClientRect();
      let newSplit;
      if (orientation === "horizontal") {
        newSplit = (event.clientX - rect.left) / rect.width;
      } else {
        newSplit = (event.clientY - rect.top) / rect.height;
      }
      newSplit = Math.min(Math.max(newSplit, minSplit), maxSplit);
      onChange == null ? void 0 : onChange(newSplit);
    };
    const handleDragEnd = () => {
      onDragEnd == null ? void 0 : onDragEnd();
      setDragging(false);
    };
    document.addEventListener("pointermove", handleDragging);
    document.addEventListener("pointerup", handleDragEnd);
    document.addEventListener("pointerleave", handleDragEnd);
    return () => {
      document.removeEventListener("pointermove", handleDragging);
      document.removeEventListener("pointerup", handleDragEnd);
      document.removeEventListener("pointerleave", handleDragEnd);
    };
  }, [dragging]);
  const handleDragStart = (event) => {
    setDragging(true);
    onDragStart == null ? void 0 : onDragStart();
    event.preventDefault();
  };
  const splitterStyle = orientation === "horizontal" ? { left: `${split * 100}%` } : { top: `${split * 100}%` };
  const containerStyle = {
    position: "absolute",
    top: `${y}%`,
    left: `${x}%`,
    width: `${width}%`,
    height: `${height}%`
  };
  return (0, import_jsx_runtime11.jsx)("div", { ref: containerRef, style: containerStyle, children: (0, import_jsx_runtime11.jsx)("div", { className: `deck-widget-splitter-handle deck-widget-splitter-handle--${orientation} ${dragging ? "active" : ""}`, style: splitterStyle, onPointerDown: handleDragStart }) });
}

// dist/info-widget.js
var import_jsx_runtime14 = require("preact/jsx-runtime");
var import_core10 = require("@deck.gl/core");
var import_preact9 = require("preact");

// dist/lib/components/popover.js
var import_jsx_runtime12 = require("preact/jsx-runtime");
var import_hooks4 = require("preact/hooks");
var import_dom = require("@floating-ui/dom");
var Popover = ({ x, y, placement = "right", offset: pixelOffset = 0, arrow: arrowSize = false, arrowColor = "white", children }) => {
  const anchorRef = (0, import_hooks4.useRef)(null);
  const contentRef = (0, import_hooks4.useRef)(null);
  const arrowRef = (0, import_hooks4.useRef)(null);
  const updaterRef = (0, import_hooks4.useRef)();
  updaterRef.current = () => {
    if (!anchorRef.current || !contentRef.current)
      return;
    const arrowWidth = Array.isArray(arrowSize) ? arrowSize[0] : arrowSize || 0;
    const arrowHeight = Array.isArray(arrowSize) ? arrowSize[1] : arrowSize || 0;
    const padding = pixelOffset + Math.max(arrowHeight, arrowWidth);
    const middleware = placement.includes("-") ? [(0, import_dom.offset)(padding), (0, import_dom.flip)(), (0, import_dom.shift)()] : [(0, import_dom.offset)(padding), (0, import_dom.shift)(), (0, import_dom.flip)()];
    if (arrowRef.current)
      middleware.push((0, import_dom.arrow)({ element: arrowRef.current }));
    (0, import_dom.computePosition)(anchorRef.current, contentRef.current, {
      placement,
      strategy: "fixed",
      middleware
    }).then((popoverPos) => {
      if (contentRef.current) {
        Object.assign(contentRef.current.style, {
          left: `${popoverPos.x}px`,
          top: `${popoverPos.y}px`
        });
      }
      const arrowData = popoverPos.middlewareData.arrow;
      if (arrowData && arrowRef.current) {
        const arrowStyle = createArrow(arrowWidth, arrowHeight, arrowColor, popoverPos.placement);
        arrowStyle.transform = `translate(${arrowData.x || 0}px, ${arrowData.y || 0}px)`;
        Object.assign(arrowRef.current.style, arrowStyle);
      }
    });
  };
  (0, import_hooks4.useMemo)(() => {
    var _a;
    (_a = updaterRef.current) == null ? void 0 : _a.call(updaterRef);
  }, [x, y, placement, arrowSize, pixelOffset]);
  (0, import_hooks4.useEffect)(() => {
    const anchor = anchorRef.current;
    const content = contentRef.current;
    if (!anchor || !content) {
      return void 0;
    }
    content.style.visibility = "visible";
    const cleanup = (0, import_dom.autoUpdate)(anchor, content, () => {
      var _a;
      return (_a = updaterRef.current) == null ? void 0 : _a.call(updaterRef);
    });
    return () => {
      cleanup();
    };
  }, []);
  return (0, import_jsx_runtime12.jsx)("div", { style: { position: "absolute", left: x, top: y }, ref: anchorRef, children: (0, import_jsx_runtime12.jsxs)("div", { className: "deck-widget deck-widget-popover", style: { position: "fixed", visibility: "hidden", pointerEvents: "none" }, ref: contentRef, children: [Boolean(arrowSize) && (0, import_jsx_runtime12.jsx)("div", { className: "deck-widget-popover-arrow", style: { position: "absolute" }, ref: arrowRef }), children] }) });
};
function createArrow(width, height, color, placement) {
  const result = {
    width: 0,
    height: 0,
    top: "",
    bottom: "",
    left: "",
    right: ""
  };
  if (placement.startsWith("bottom")) {
    result.borderLeft = `${width / 2}px solid transparent`;
    result.borderRight = `${width / 2}px solid transparent`;
    result.borderBottom = `${height}px solid ${color}`;
    result.borderTop = "";
    result.top = `${-height}px`;
  } else if (placement.startsWith("top")) {
    result.borderLeft = `${width / 2}px solid transparent`;
    result.borderRight = `${width / 2}px solid transparent`;
    result.borderTop = `${height}px solid ${color}`;
    result.borderBottom = "";
    result.bottom = `${-height}px`;
  } else if (placement.startsWith("right")) {
    result.borderTop = `${width / 2}px solid transparent`;
    result.borderBottom = `${width / 2}px solid transparent`;
    result.borderRight = `${height}px solid ${color}`;
    result.borderLeft = "";
    result.left = `${-height}px`;
  } else if (placement.startsWith("left")) {
    result.borderTop = `${width / 2}px solid transparent`;
    result.borderBottom = `${width / 2}px solid transparent`;
    result.borderLeft = `${height}px solid ${color}`;
    result.borderRight = "";
    result.right = `${-height}px`;
  }
  return result;
}

// dist/lib/components/user-content.js
var import_jsx_runtime13 = require("preact/jsx-runtime");
var import_hooks5 = require("preact/hooks");
var UserContent = ({ text, html, element, ...props }) => {
  const containerRef = (0, import_hooks5.useRef)(null);
  (0, import_hooks5.useEffect)(() => {
    if (containerRef.current && element) {
      containerRef.current.append(element);
    }
    return () => {
      element == null ? void 0 : element.remove();
    };
  }, [element]);
  return (0, import_jsx_runtime13.jsx)("div", { ref: containerRef, ...props, dangerouslySetInnerHTML: html ? { __html: html } : void 0, children: text });
};

// dist/info-widget.js
var InfoWidget = class extends import_core10.Widget {
  constructor(props) {
    super(props);
    this.className = "deck-widget-info";
    this.placement = "fill";
    this.tooltip = null;
    this.setProps(this.props);
  }
  setProps(props) {
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onAdd({ deck }) {
    this.deck = deck;
  }
  onRemove() {
    if (this.rootElement) {
      (0, import_preact9.render)(null, this.rootElement);
    }
  }
  onViewportChange(viewport) {
    this.viewport = viewport;
    this.updateHTML();
  }
  onHover(info) {
    if (this.props.mode === "hover") {
      this.tooltip = this._getTooltip(info);
      this.updateHTML();
    }
  }
  onClick(info) {
    if (this.props.mode === "click") {
      this.tooltip = this._getTooltip(info);
      this.updateHTML();
    }
  }
  _getTooltip(info) {
    if (!this.props.getTooltip)
      return null;
    const content = this.props.getTooltip(info, this) ?? null;
    if (content === null)
      return null;
    const normalizedTooltip = typeof content === "string" ? { text: content } : content;
    const position = normalizedTooltip.position || info.coordinate;
    if (!position)
      return null;
    return {
      position,
      text: "",
      html: "",
      element: null,
      className: "",
      style: {},
      ...normalizedTooltip
    };
  }
  onRenderHTML(rootElement) {
    if (!this.viewport || this.tooltip === null) {
      (0, import_preact9.render)(null, rootElement);
      return;
    }
    const style = {
      ...this.props.style,
      ...this.tooltip.style
    };
    const [x, y] = this.viewport.project(this.tooltip.position);
    const ui = (0, import_jsx_runtime14.jsx)(Popover, { x, y, placement: this.props.placement, arrow: this.props.arrow, arrowColor: "var(--menu-background, #fff)", offset: this.props.offset, children: (0, import_jsx_runtime14.jsx)(UserContent, { className: `deck-widget-popup-content ${this.tooltip.className} ${this.props.className}`, style, html: this.tooltip.html, text: this.tooltip.text, element: this.tooltip.element }) });
    (0, import_preact9.render)(ui, rootElement);
  }
};
InfoWidget.defaultProps = {
  ...import_core10.Widget.defaultProps,
  id: "info",
  viewId: null,
  mode: "hover",
  getTooltip: void 0,
  placement: "right",
  offset: 10,
  arrow: 10
};

// dist/popup-widget.js
var import_jsx_runtime15 = require("preact/jsx-runtime");
var import_core11 = require("@deck.gl/core");
var import_preact10 = require("preact");
var PopupWidget = class extends import_core11.Widget {
  constructor(props) {
    super(props);
    this.className = "deck-widget-popup";
    this.placement = "fill";
    this.setProps(this.props);
    this.isOpen = this.props.defaultIsOpen;
  }
  setProps(props) {
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onAdd({ deck }) {
    this.deck = deck;
  }
  onRemove() {
    if (this.rootElement) {
      (0, import_preact10.render)(null, this.rootElement);
    }
  }
  onViewportChange(viewport) {
    this.viewport = viewport;
    this.updateHTML();
  }
  onClick() {
    if (this.props.closeOnClickOutside) {
      this._setIsOpen(false);
    }
  }
  _setIsOpen(isOpen) {
    var _a, _b;
    if (this.isOpen === isOpen)
      return;
    this.isOpen = isOpen;
    (_b = (_a = this.props).onOpenChange) == null ? void 0 : _b.call(_a, isOpen);
    this.updateHTML();
  }
  onRenderHTML(rootElement) {
    if (!this.viewport) {
      (0, import_preact10.render)(null, rootElement);
      return;
    }
    const { marker, content, style } = this.props;
    const [x, y] = this.viewport.project(this.props.position);
    const ui = (0, import_jsx_runtime15.jsxs)("div", { children: [marker && (0, import_jsx_runtime15.jsx)("div", { className: "deck-widget-popup-marker", style: { left: x, top: y }, children: (0, import_jsx_runtime15.jsx)(UserContent, { ...marker, onClick: () => this._setIsOpen(true) }) }), this.isOpen && (0, import_jsx_runtime15.jsx)(Popover, { x, y, placement: this.props.placement, arrow: this.props.arrow, arrowColor: "var(--menu-background, #fff)", offset: this.props.offset, children: (0, import_jsx_runtime15.jsxs)("div", { className: `deck-widget-popup-content ${this.props.className}`, style, children: [this.props.closeButton && (0, import_jsx_runtime15.jsx)("div", { className: "deck-widget-popup-controls", style: { width: "100%", display: "flex", justifyContent: "end" }, children: (0, import_jsx_runtime15.jsx)(IconButton, { className: "deck-widget-popup-close-button", onClick: () => this._setIsOpen(false) }) }), (0, import_jsx_runtime15.jsx)(UserContent, { ...typeof content === "string" ? { text: content } : content })] }) })] });
    (0, import_preact10.render)(ui, rootElement);
  }
};
PopupWidget.defaultProps = {
  ...import_core11.Widget.defaultProps,
  id: "info",
  viewId: null,
  position: [0, 0],
  marker: null,
  defaultIsOpen: true,
  content: "",
  placement: "right",
  offset: 10,
  arrow: 10,
  closeButton: true,
  closeOnClickOutside: false,
  onOpenChange: () => {
  }
};

// dist/context-menu-widget.js
var import_jsx_runtime16 = require("preact/jsx-runtime");
var import_core12 = require("@deck.gl/core");
var import_preact11 = require("preact");
var ContextMenuWidget = class extends import_core12.Widget {
  constructor(props) {
    super(props);
    this.className = "deck-widget-context-menu";
    this.placement = "fill";
    this.menu = null;
    this.setProps(this.props);
  }
  onAdd({ deck }) {
    var _a;
    (_a = deck.getCanvas()) == null ? void 0 : _a.addEventListener("contextmenu", (event) => this.handleContextMenu(event));
  }
  handleContextMenu(srcEvent) {
    var _a, _b, _c;
    const targetRect = srcEvent.target.getBoundingClientRect();
    const x = srcEvent.clientX - targetRect.x;
    const y = srcEvent.clientY - targetRect.y;
    const pickInfo = ((_a = this.deck) == null ? void 0 : _a.pickObject({ x, y })) || {
      x,
      y,
      picked: false,
      layer: null,
      color: null,
      index: -1,
      pixelRatio: 1
    };
    const menuItems = ((_c = (_b = this.props).getMenuItems) == null ? void 0 : _c.call(_b, pickInfo, this)) || this.props.menuItems;
    this.menu = menuItems.length > 0 ? {
      items: menuItems,
      pickInfo
    } : null;
    srcEvent.preventDefault();
    this.updateHTML();
  }
  onRenderHTML(rootElement) {
    if (!this.menu) {
      (0, import_preact11.render)(null, rootElement);
      return;
    }
    const { items, pickInfo } = this.menu;
    const style = {
      pointerEvents: "auto",
      position: "static",
      ...this.props.style
    };
    const ui = (0, import_jsx_runtime16.jsx)(Popover, { x: pickInfo.x, y: pickInfo.y, placement: this.props.placement, arrow: this.props.arrow, arrowColor: "var(--menu-background, #fff)", offset: this.props.offset, children: (0, import_jsx_runtime16.jsx)(SimpleMenu, { menuItems: items, onSelect: (value) => this.props.onMenuItemSelected(value, pickInfo), style, isOpen: true, onClose: () => this.hide() }) });
    (0, import_preact11.render)(ui, rootElement);
  }
  hide() {
    this.menu = null;
    this.updateHTML();
  }
};
ContextMenuWidget.defaultProps = {
  ...import_core12.Widget.defaultProps,
  id: "context",
  viewId: null,
  menuItems: [],
  getMenuItems: void 0,
  onMenuItemSelected: () => {
  },
  placement: "bottom-start",
  offset: 10,
  arrow: false
};

// dist/scrollbar-widget.js
var import_jsx_runtime18 = require("preact/jsx-runtime");
var import_core13 = require("@deck.gl/core");
var import_preact12 = require("preact");

// dist/lib/components/range-input.js
var import_jsx_runtime17 = require("preact/jsx-runtime");
var import_hooks6 = require("preact/hooks");
var wheelListenerOptions = { passive: false };
var clamp2 = (value, min, max) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};
var getTrackDimension = (track, vertical) => {
  if (!track || !track.firstElementChild) {
    return [0, 0];
  }
  const rect = track.firstElementChild.getBoundingClientRect();
  if (vertical) {
    return [rect.top, rect.height];
  }
  return vertical ? [rect.top, rect.height] : [rect.left, rect.width];
};
var getEffectiveStep = (step, range) => {
  if (typeof step === "number" && !Number.isNaN(step) && step > 0) {
    return step;
  }
  return Math.max(1, range / 10 || 1);
};
var getEffectivePage = (pageSize, rangeSize) => {
  if (typeof pageSize === "number" && !Number.isNaN(pageSize) && pageSize > 0) {
    return pageSize;
  }
  return Math.max(1, rangeSize || 1);
};
function RangeInput(props) {
  const { className = "", min, max, step, value, orientation, pageSize, stepButtons = false, startButtonAriaLabel, endButtonAriaLabel, eventTarget, decorations = [], onChange } = props;
  const vertical = orientation !== "horizontal";
  const rootRef = (0, import_hooks6.useRef)(null);
  const trackRef = (0, import_hooks6.useRef)(null);
  const thumbRef = (0, import_hooks6.useRef)(null);
  const dragStateRef = (0, import_hooks6.useRef)(null);
  const [trackLength, setTrackLength] = (0, import_hooks6.useState)(0);
  const range = max - min;
  const rangeSize = Math.max(0, value[1] - value[0]);
  const maxStart = Math.max(0, range - rangeSize);
  const clampedStart = clamp2(value[0], min, min + maxStart);
  const { thumbLength, thumbOffset } = (0, import_hooks6.useMemo)(() => {
    if (trackLength <= 0 || range <= 0) {
      return { thumbLength: 0, thumbOffset: 0 };
    }
    if (range <= rangeSize) {
      return { thumbLength: 1, thumbOffset: 0 };
    }
    const nextThumbLength = rangeSize / range;
    const travel = Math.max(0, 1 - nextThumbLength);
    const ratio = maxStart <= 0 ? 0 : clamp2((clampedStart - min) / maxStart, 0, 1);
    return {
      thumbLength: Math.max(0, Math.min(nextThumbLength, 1)),
      thumbOffset: travel * ratio
    };
  }, [trackLength, range, rangeSize, maxStart, clampedStart, min]);
  const emitRange = (0, import_hooks6.useCallback)((nextStart) => {
    if (!onChange) {
      return;
    }
    const clamped = clamp2(nextStart, min, min + maxStart);
    onChange([clamped, clamped + rangeSize]);
  }, [onChange, min, maxStart, rangeSize]);
  const handleStepNegative = (0, import_hooks6.useCallback)((event) => {
    event.stopPropagation();
    emitRange(clampedStart - getEffectiveStep(step, range));
  }, [emitRange, clampedStart, step, range]);
  const handleStepPositive = (0, import_hooks6.useCallback)((event) => {
    event.stopPropagation();
    emitRange(clampedStart + getEffectiveStep(step, range));
  }, [emitRange, clampedStart, step, range]);
  const handleTrackClick = (0, import_hooks6.useCallback)((event) => {
    if (event.button !== 0) {
      return;
    }
    const target = event.target;
    if ((target == null ? void 0 : target.dataset.scrollbarThumb) === "true") {
      return;
    }
    const track = trackRef.current;
    if (!track) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const [trackStart] = getTrackDimension(track, vertical);
    const coordinate = vertical ? event.clientY - trackStart : event.clientX - trackStart;
    const span = Math.max(1, 1 - thumbLength) * trackLength;
    const thumbCenter = thumbLength / 2 * trackLength;
    const ratio = span <= 0 ? 0 : clamp2((coordinate - thumbCenter) / span, 0, 1);
    emitRange(min + ratio * maxStart);
  }, [vertical, trackLength, thumbLength, emitRange, min, maxStart]);
  const handleThumbPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }
    const track = trackRef.current;
    if (!track) {
      return;
    }
    dragStateRef.current = {
      pointerId: event.pointerId,
      startCoord: vertical ? event.clientY : event.clientX,
      startRatio: thumbOffset,
      min,
      max,
      maxStart
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };
  const handleThumbPointerMove = (0, import_hooks6.useCallback)((event) => {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }
    const [trackStart, trackLength2] = getTrackDimension(trackRef.current, vertical);
    const coordinate = vertical ? event.clientY : event.clientX;
    const delta = coordinate - state.startCoord;
    const ratio = state.startRatio + delta / trackLength2;
    const nextStart = clamp2(ratio * (state.max - state.min), 0, state.maxStart) + state.min;
    emitRange(nextStart);
    event.preventDefault();
  }, [emitRange, vertical]);
  const handleThumbPointerUp = (0, import_hooks6.useCallback)((event) => {
    var _a;
    const state = dragStateRef.current;
    if (state && state.pointerId === event.pointerId) {
      dragStateRef.current = null;
      (_a = thumbRef.current) == null ? void 0 : _a.releasePointerCapture(event.pointerId);
      event.preventDefault();
    }
  }, []);
  const handleKeyDown = (0, import_hooks6.useCallback)((event) => {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowLeft":
        if (vertical && event.key === "ArrowUp" || !vertical && event.key === "ArrowLeft") {
          emitRange(clampedStart - getEffectiveStep(step, range));
          event.preventDefault();
        }
        break;
      case "ArrowDown":
      case "ArrowRight":
        if (vertical && event.key === "ArrowDown" || !vertical && event.key === "ArrowRight") {
          emitRange(clampedStart + getEffectiveStep(step, range));
          event.preventDefault();
        }
        break;
      case "PageUp":
        emitRange(clampedStart - getEffectivePage(pageSize, rangeSize));
        event.preventDefault();
        break;
      case "PageDown":
        emitRange(clampedStart + getEffectivePage(pageSize, rangeSize));
        event.preventDefault();
        break;
      case "Home":
        emitRange(min);
        event.preventDefault();
        break;
      case "End":
        emitRange(min + maxStart);
        event.preventDefault();
        break;
      default:
        break;
    }
  }, [vertical, emitRange, clampedStart, step, range, pageSize, rangeSize, min, maxStart]);
  const handleWheel = (0, import_hooks6.useCallback)((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (maxStart === 0) {
      return;
    }
    let delta = vertical ? event.deltaY : event.deltaX;
    if (!vertical && delta === 0) {
      delta = event.deltaY;
    }
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      delta *= getEffectiveStep(step, range);
    } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      delta *= getEffectivePage(pageSize, rangeSize);
    }
    if (delta === 0) {
      return;
    }
    emitRange(clampedStart + delta);
  }, [emitRange, clampedStart, maxStart, vertical, step, range, pageSize, rangeSize]);
  (0, import_hooks6.useLayoutEffect)(() => {
    setTrackLength(getTrackDimension(trackRef.current, vertical)[1]);
  }, [vertical]);
  (0, import_hooks6.useLayoutEffect)(() => {
    const track = trackRef.current;
    if (!track) {
      return void 0;
    }
    const update = () => {
      setTrackLength(getTrackDimension(track, vertical)[1]);
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(update);
      observer.observe(track);
      return () => observer.disconnect();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    return void 0;
  }, [vertical]);
  (0, import_hooks6.useEffect)(() => {
    const eventRoot = eventTarget ?? rootRef.current;
    if (!eventRoot)
      return void 0;
    eventRoot.addEventListener("keydown", handleKeyDown);
    eventRoot.addEventListener("wheel", handleWheel, wheelListenerOptions);
    return () => {
      eventRoot.removeEventListener("keydown", handleKeyDown);
      eventRoot.removeEventListener("wheel", handleWheel, wheelListenerOptions);
    };
  }, [eventTarget, handleKeyDown, handleWheel]);
  const decorationElements = (0, import_hooks6.useMemo)(() => {
    if (!decorations.length || range <= 0) {
      return [];
    }
    return decorations.map((decoration, index) => {
      const [start, end] = decoration.position;
      const startRatio = (start - min) / range;
      const endRatio = (end - min) / range;
      const offsetPct = Math.round(startRatio * 1e3) / 10;
      const sizePct = Math.max(0, Math.round((endRatio - startRatio) * 1e3) / 10);
      const style = vertical ? {
        left: "0",
        width: "100%",
        top: `${offsetPct}%`,
        height: `${sizePct}%`
      } : {
        top: "0",
        height: "100%",
        left: `${offsetPct}%`,
        width: `${sizePct}%`
      };
      return (0, import_jsx_runtime17.jsx)("div", { className: "deck-widget-range__decoration", style, children: decoration.element }, `decoration-${index}`);
    });
  }, [decorations, range, min, vertical]);
  return (0, import_jsx_runtime17.jsxs)("div", { ref: rootRef, tabIndex: 0, role: "scrollbar", "aria-valuemin": min, "aria-valuemax": min + maxStart, "aria-valuenow": clampedStart, "aria-orientation": orientation, className: `${className} deck-widget-range deck-widget-range--${orientation} ${maxStart === 0 ? "deck-widget-range--disabled" : ""}`, children: [stepButtons && (0, import_jsx_runtime17.jsx)("button", { type: "button", className: "deck-widget-range__button deck-widget-range__button--start", "aria-label": startButtonAriaLabel, disabled: clampedStart <= min, onClick: handleStepNegative, children: (0, import_jsx_runtime17.jsx)("span", { className: "deck-widget-icon" }) }), (0, import_jsx_runtime17.jsxs)("div", { className: "deck-widget-range__track", ref: trackRef, onClick: handleTrackClick, children: [(0, import_jsx_runtime17.jsx)("div", { className: "deck-widget-range__decorations", children: decorationElements }), (0, import_jsx_runtime17.jsx)("div", { className: "deck-widget-range__thumb", "data-scrollbar-thumb": "true", ref: thumbRef, style: vertical ? { height: `${thumbLength * 100}%`, top: `${thumbOffset * 100}%` } : { width: `${thumbLength * 100}%`, left: `${thumbOffset * 100}%` }, onPointerDown: handleThumbPointerDown, onPointerMove: handleThumbPointerMove, onPointerUp: handleThumbPointerUp, onPointerCancel: handleThumbPointerUp })] }), stepButtons && (0, import_jsx_runtime17.jsx)("button", { type: "button", className: "deck-widget-range__button deck-widget-range__button--end", "aria-label": endButtonAriaLabel, disabled: clampedStart >= min + maxStart, onClick: handleStepPositive, children: (0, import_jsx_runtime17.jsx)("span", { className: "deck-widget-icon" }) })] });
}

// dist/scrollbar-widget.js
var clamp3 = (value, min, max) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};
var ScrollbarWidget = class extends import_core13.Widget {
  constructor(props) {
    const resolved = {
      ...ScrollbarWidget.defaultProps,
      ...props
    };
    super(resolved);
    this.className = "deck-widget-scrollbar";
    this.placement = "fill";
    this.contentSize = 0;
    this.viewportSize = 0;
    this.scrollOffset = 0;
    this.handleRangeChange = (nextValue) => {
      this.emitScroll(nextValue[0]);
    };
    this.viewId = resolved.viewId ?? null;
  }
  onViewportChange(viewport) {
    this.viewport = viewport;
    this.onRenderHTML();
  }
  onRenderHTML() {
    const element = this.rootElement;
    if (!element) {
      return;
    }
    element.dataset.placement = this.props.placement;
    const viewport = this.viewport;
    this.updateViewport(viewport);
    const clampedOffset = this.getClampedOffset();
    const wheelTarget = this.getWheelEventTarget(this.props.captureWheel ? "global" : "local");
    const decorations = this.getDecorations(viewport);
    const isVertical = this.isVertical();
    const startLabel = this.props.startButtonAriaLabel ?? (isVertical ? "Scroll up" : "Scroll left");
    const endLabel = this.props.endButtonAriaLabel ?? (isVertical ? "Scroll down" : "Scroll right");
    const ui = (0, import_jsx_runtime18.jsx)(RangeInput, { min: 0, max: Math.max(0, this.contentSize), step: this.getEffectiveStep(), pageSize: this.getEffectivePage(), value: [clampedOffset, clampedOffset + this.viewportSize], orientation: this.props.orientation, stepButtons: true, startButtonAriaLabel: startLabel, endButtonAriaLabel: endLabel, eventTarget: wheelTarget, decorations, onChange: this.handleRangeChange });
    (0, import_preact12.render)(ui, element);
  }
  onRemove() {
    if (this.rootElement) {
      (0, import_preact12.render)(null, this.rootElement);
    }
    super.onRemove();
  }
  getContentBounds(viewId) {
    var _a, _b, _c;
    return this.props.contentBounds ?? ((_c = (_b = (_a = this.deck) == null ? void 0 : _a.getView(viewId)) == null ? void 0 : _b.controller) == null ? void 0 : _c.maxBounds) ?? null;
  }
  updateViewport(viewport) {
    if (!viewport) {
      this.contentSize = 0;
      this.scrollOffset = 0;
      this.viewportSize = 0;
      return;
    }
    const contentBounds = this.getContentBounds(viewport.id);
    const isVertical = this.isVertical();
    const projectedBounds = contentBounds ? projectBounds(contentBounds, viewport, isVertical) : [0, 0];
    this.contentSize = projectedBounds[1] - projectedBounds[0];
    this.scrollOffset = -projectedBounds[0];
    this.viewportSize = isVertical ? viewport.height : viewport.width;
  }
  getDecorations(viewport) {
    const { decorations = [] } = this.props;
    if (!viewport || decorations.length === 0) {
      return [];
    }
    const contentBounds = this.getContentBounds(viewport.id);
    if (!contentBounds) {
      return [];
    }
    const isVertical = this.isVertical();
    const [contentStart] = projectBounds(contentBounds, viewport, isVertical);
    return decorations.map((decoration) => {
      const [start, end] = projectBounds(decoration.contentBounds, viewport, isVertical);
      const onClick = decoration.onClick ? (e) => {
        var _a;
        const handled = (_a = decoration.onClick) == null ? void 0 : _a.call(decoration, e);
        if (handled) {
          e.stopPropagation();
          e.preventDefault();
        }
      } : void 0;
      return {
        position: [start - contentStart, end - contentStart],
        element: (0, import_jsx_runtime18.jsx)("div", { style: {
          pointerEvents: onClick ? "all" : "none",
          width: "100%",
          height: "100%",
          backgroundColor: decoration.color
        }, title: decoration.title, onClick })
      };
    });
  }
  getWheelEventTarget(mode) {
    var _a, _b, _c;
    if (mode === null)
      return null;
    if (mode === "local")
      return this.rootElement;
    return ((_a = this.deck) == null ? void 0 : _a.props.parent) || ((_c = (_b = this.deck) == null ? void 0 : _b.getCanvas()) == null ? void 0 : _c.parentElement) || this.rootElement;
  }
  getMaxScroll() {
    return Math.max(0, this.contentSize - this.viewportSize);
  }
  getClampedOffset() {
    const maxScroll = this.getMaxScroll();
    return clamp3(this.scrollOffset, 0, maxScroll);
  }
  isVertical() {
    return this.props.orientation !== "horizontal";
  }
  getEffectiveStep() {
    if (typeof this.props.stepSize === "number" && !Number.isNaN(this.props.stepSize)) {
      return this.props.stepSize;
    }
    return Math.max(1, this.viewportSize / 10 || 1);
  }
  getEffectivePage() {
    if (typeof this.props.pageSize === "number" && !Number.isNaN(this.props.pageSize)) {
      return this.props.pageSize;
    }
    return this.viewportSize;
  }
  emitScroll(next) {
    const maxScroll = this.getMaxScroll();
    const target = clamp3(Math.round(next), 0, maxScroll);
    const viewport = this.viewport;
    if (viewport && target !== this.getClampedOffset()) {
      const pixel = viewport.project(viewport.position);
      if (this.isVertical()) {
        pixel[1] -= target - this.scrollOffset;
      } else {
        pixel[0] -= target - this.scrollOffset;
      }
      const { target: newTarget } = viewport.panByPosition(viewport.position, pixel);
      this.deck._onViewStateChange({
        viewId: viewport.id,
        viewState: {
          ...this.getViewState(viewport.id),
          target: newTarget
        },
        interactionState: {}
      });
    }
  }
};
ScrollbarWidget.defaultProps = {
  ...import_core13.Widget.defaultProps,
  contentBounds: null,
  placement: "top-right",
  viewId: null,
  orientation: "vertical",
  stepSize: null,
  pageSize: null,
  startButtonAriaLabel: "",
  endButtonAriaLabel: "",
  captureWheel: false,
  decorations: []
};
function projectBounds(bounds, viewport, isVertical) {
  return bounds.map(([x, y]) => viewport.project([x, y, 0])).reduce((range, [x, y]) => {
    const value = isVertical ? y : x;
    range[0] = Math.min(range[0], value);
    range[1] = Math.max(range[1], value);
    return range;
  }, [Infinity, -Infinity]);
}

// dist/icon-widget.js
var import_jsx_runtime19 = require("preact/jsx-runtime");
var import_preact13 = require("preact");
var import_core14 = require("@deck.gl/core");
var IconWidget = class extends import_core14.Widget {
  constructor(props) {
    super(props);
    this.className = "";
    this.placement = "top-left";
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    const { className, style, icon, color, label, onClick } = this.props;
    (0, import_preact13.render)((0, import_jsx_runtime19.jsx)(IconButton, { className, style, color, icon, label, onClick }), rootElement);
  }
};
IconWidget.defaultProps = {
  ...import_core14.Widget.defaultProps,
  id: "icon",
  placement: "top-left",
  viewId: null,
  icon: "",
  label: "",
  color: "",
  onClick: void 0
};

// dist/toggle-widget.js
var import_jsx_runtime20 = require("preact/jsx-runtime");
var import_preact14 = require("preact");
var import_core15 = require("@deck.gl/core");
var ToggleWidget = class extends import_core15.Widget {
  constructor(props) {
    super(props);
    this.className = "deck-widget-toggle";
    this.placement = "top-left";
    this._toggle = () => {
      var _a, _b;
      this.checked = !this.checked;
      (_b = (_a = this.props).onChange) == null ? void 0 : _b.call(_a, this.checked);
      this.updateHTML();
    };
    this.checked = this.props.initialChecked;
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    const { className, style, icon, label, color, onIcon = icon, onLabel = label, onColor = color } = this.props;
    const on = this.checked;
    rootElement.dataset.checked = String(on);
    (0, import_preact14.render)((0, import_jsx_runtime20.jsx)(IconButton, { className, style, icon: on ? onIcon : icon, label: on ? onLabel : label, color: on ? onColor : color, onClick: this._toggle }), rootElement);
  }
};
ToggleWidget.defaultProps = {
  ...import_core15.Widget.defaultProps,
  id: "icon",
  placement: "top-left",
  viewId: null,
  initialChecked: false,
  icon: "",
  onIcon: void 0,
  label: "",
  onLabel: void 0,
  color: "",
  onColor: void 0,
  onChange: void 0
};

// dist/selector-widget.js
var import_jsx_runtime21 = require("preact/jsx-runtime");
var import_preact15 = require("preact");
var import_core16 = require("@deck.gl/core");
var SelectorWidget = class extends import_core16.Widget {
  constructor(props) {
    super(props);
    this.className = "deck-widget-selector";
    this.placement = "top-left";
    this.isOpen = false;
    this._toggleMenu = () => {
      if (this.isOpen) {
        this.isOpen = false;
      } else if (this.rootElement) {
        this.isOpen = {
          x: this.rootElement.offsetLeft,
          y: this.rootElement.offsetTop,
          placement: this.props.placement.includes("right") ? "left-start" : "right-start"
        };
      }
      this.updateHTML();
    };
    this._handleSelectMode = (value) => {
      this.value = value;
      this.props.onChange(value);
      this.updateHTML();
    };
    this.value = this.props.initialValue;
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    const selectedOption = this.props.options.find((opt) => opt.value === this.value) ?? this.props.options[0];
    (0, import_preact15.render)((0, import_jsx_runtime21.jsxs)("div", { children: [(0, import_jsx_runtime21.jsx)(IconButton, { icon: selectedOption.icon, label: selectedOption.label, onClick: this._toggleMenu }), this.isOpen && (0, import_jsx_runtime21.jsx)(Popover, { ...this.isOpen, children: (0, import_jsx_runtime21.jsx)(SimpleMenu, { isOpen: true, style: { pointerEvents: "auto", position: "static" }, menuItems: this.props.options, onSelect: this._handleSelectMode, onClose: this._toggleMenu }) })] }), rootElement);
  }
};
SelectorWidget.defaultProps = {
  ...import_core16.Widget.defaultProps,
  id: "view-selector",
  placement: "top-left",
  viewId: null,
  initialValue: "",
  options: [],
  onChange: () => {
  }
};

// dist/timeline-widget.js
var import_jsx_runtime22 = require("preact/jsx-runtime");
var import_core17 = require("@deck.gl/core");
var import_preact16 = require("preact");
var TimelineWidget = class extends import_core17.Widget {
  /**
   * Returns the current time value.
   * In controlled mode, returns the time prop.
   * In uncontrolled mode, returns the internal state.
   */
  getTime() {
    return this.props.time ?? this.currentTime;
  }
  /**
   * Returns the current playing state.
   * In controlled mode, returns the playing prop.
   * In uncontrolled mode, returns the internal state.
   */
  getPlaying() {
    return this.props.playing ?? this._playing;
  }
  constructor(props = {}) {
    var _a;
    super(props);
    this.id = "timeline";
    this.className = "deck-widget-timeline";
    this.placement = "fill";
    this._playing = false;
    this.timerId = null;
    this.handlePlayPause = () => {
      var _a2, _b;
      const isPlaying = this.getPlaying();
      const nextPlaying = !isPlaying;
      (_b = (_a2 = this.props).onPlayingChange) == null ? void 0 : _b.call(_a2, nextPlaying);
      if (this.props.playing === void 0) {
        if (nextPlaying) {
          this.play();
        } else {
          this.stop();
        }
      }
    };
    this.handleTimeChange = ([value]) => {
      var _a2;
      this.props.onTimeChange(value);
      if (this.props.time === void 0) {
        this.currentTime = value;
        (_a2 = this.props.timeline) == null ? void 0 : _a2.setTime(value);
        this.updateHTML();
      }
    };
    this.tick = () => {
      var _a2, _b, _c;
      const { timeRange: [min, max], step, loop } = this.props;
      if (step > 0) {
        const currentTime = this.getTime();
        let next = Math.round(currentTime / step) * step + step;
        if (next > max) {
          if (currentTime < max) {
            next = max;
          } else if (loop) {
            next = min;
          } else {
            next = max;
            this._playing = false;
            (_b = (_a2 = this.props).onPlayingChange) == null ? void 0 : _b.call(_a2, false);
          }
        }
        this.props.onTimeChange(next);
        if (this.props.time === void 0) {
          this.currentTime = next;
          (_c = this.props.timeline) == null ? void 0 : _c.setTime(next);
        }
        this.updateHTML();
      }
      if (this._playing) {
        this.timerId = window.setTimeout(this.tick, this.props.playInterval);
      } else {
        this.timerId = null;
      }
    };
    this.currentTime = this.props.initialTime ?? this.props.timeRange[0];
    const syncTime = this.props.time ?? this.currentTime;
    (_a = this.props.timeline) == null ? void 0 : _a.setTime(syncTime);
    this.setProps(this.props);
  }
  setProps(props) {
    var _a;
    const { playing: prevPlaying, time: prevTime } = this.props;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
    if (props.time !== void 0 && props.time !== prevTime) {
      (_a = this.props.timeline) == null ? void 0 : _a.setTime(props.time);
    }
    if (props.playing !== void 0 && props.playing !== prevPlaying) {
      if (props.playing && !this._playing) {
        this._startTimer();
      } else if (!props.playing && this._playing) {
        this._stopTimer();
      }
    }
  }
  onAdd() {
    var _a, _b;
    this._playing = false;
    this.timerId = null;
    if (this.props.autoPlay) {
      if (this.props.playing !== void 0) {
        (_b = (_a = this.props).onPlayingChange) == null ? void 0 : _b.call(_a, true);
      } else {
        this.play();
      }
    }
  }
  onRemove() {
    this.stop();
  }
  onRenderHTML(rootElement) {
    const { timeRange, step, formatLabel } = this.props;
    const isPlaying = this.getPlaying();
    const currentTime = this.getTime();
    rootElement.dataset.placement = this.props.placement;
    (0, import_preact16.render)((0, import_jsx_runtime22.jsxs)("div", { className: "deck-widget-button-group", children: [isPlaying ? (0, import_jsx_runtime22.jsx)(IconButton, { label: "Pause", className: "deck-widget-timeline-pause", onClick: this.handlePlayPause }) : (0, import_jsx_runtime22.jsx)(IconButton, { label: "Play", className: "deck-widget-timeline-play", onClick: this.handlePlayPause }), (0, import_jsx_runtime22.jsx)(RangeInput, { min: timeRange[0], max: timeRange[1], orientation: "horizontal", step, value: [currentTime, currentTime], onChange: this.handleTimeChange, decorations: [
      {
        position: [currentTime, currentTime + step],
        element: (0, import_jsx_runtime22.jsx)("div", { className: "deck-widget-timeline-label deck-widget-timeline-label--current", children: formatLabel(currentTime) })
      }
    ] })] }), rootElement);
  }
  play() {
    var _a;
    this._playing = true;
    const { timeRange: [min, max] } = this.props;
    if (this.props.time === void 0 && this.getTime() >= max) {
      this.currentTime = min;
      this.props.onTimeChange(min);
      (_a = this.props.timeline) == null ? void 0 : _a.setTime(min);
    }
    this.updateHTML();
    this.tick();
  }
  stop() {
    this._stopTimer();
    this.updateHTML();
  }
  /** Start the playback timer (used internally) */
  _startTimer() {
    this._playing = true;
    this.tick();
  }
  /** Stop the playback timer (used internally) */
  _stopTimer() {
    this._playing = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
};
TimelineWidget.defaultProps = {
  ...import_core17.Widget.defaultProps,
  id: "timeline",
  placement: "bottom-left",
  viewId: null,
  timeline: null,
  timeRange: [0, 100],
  step: 1,
  initialTime: void 0,
  time: void 0,
  onTimeChange: () => {
  },
  autoPlay: false,
  loop: false,
  playInterval: 1e3,
  playing: void 0,
  onPlayingChange: () => {
  },
  formatLabel: String
};

// dist/screenshot-widget.js
var import_jsx_runtime23 = require("preact/jsx-runtime");
var import_preact17 = require("preact");
var import_core18 = require("@deck.gl/core");
var ScreenshotWidget = class extends import_core18.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-screenshot";
    this.placement = "top-left";
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    (0, import_preact17.render)((0, import_jsx_runtime23.jsx)(IconButton, { className: "deck-widget-camera", label: this.props.label, onClick: this.handleClick.bind(this) }), rootElement);
  }
  handleClick() {
    if (this.props.onCapture) {
      this.props.onCapture(this);
      return;
    }
    const dataURL = this.captureScreenToDataURL(this.props.imageFormat);
    if (dataURL) {
      this.downloadDataURL(dataURL, this.props.filename);
    }
  }
  /** @note only captures canvas contents, not HTML DOM or CSS styles */
  captureScreenToDataURL(imageFormat) {
    var _a;
    const canvas = (_a = this.deck) == null ? void 0 : _a.getCanvas();
    return canvas == null ? void 0 : canvas.toDataURL(imageFormat);
  }
  /** Download a data URL */
  downloadDataURL(dataURL, filename) {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename;
    link.click();
  }
};
ScreenshotWidget.defaultProps = {
  ...import_core18.Widget.defaultProps,
  id: "screenshot",
  placement: "top-left",
  viewId: null,
  label: "Screenshot",
  filename: "screenshot.png",
  imageFormat: "image/png",
  onCapture: void 0
};

// dist/theme-widget.js
var import_jsx_runtime24 = require("preact/jsx-runtime");
var import_core19 = require("@deck.gl/core");
var import_core20 = require("@deck.gl/core");
var import_preact18 = require("preact");

// dist/themes.js
var LightTheme = {
  "--widget-margin": "12px",
  "--button-size": "28px",
  "--button-corner-radius": "8px",
  "--button-background": "#fff",
  "--button-stroke": "rgba(255, 255, 255, 0.3)",
  "--button-inner-stroke": "unset",
  "--button-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
  "--button-backdrop-filter": "unset",
  "--button-icon-idle": "rgba(97, 97, 102, 1)",
  "--button-icon-hover": "rgba(24, 24, 26, 1)",
  "--button-text": "rgb(24, 24, 26, 1)",
  "--icon-compass-north-color": "rgb(240, 92, 68)",
  "--icon-compass-south-color": "rgb(204, 204, 204)",
  "--menu-gap": "4px",
  "--menu-background": "#fff",
  "--menu-backdrop-filter": "unset",
  "--menu-border": "unset",
  "--menu-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
  "--menu-text": "rgb(24, 24, 26, 1)",
  "--menu-item-hover": "rgba(0, 0, 0, 0.08)",
  "--range-step-button-size": "24px",
  "--range-track-size": "16px",
  "--range-thumb-size": "10px",
  "--range-track-color": "#d8d8e5",
  "--range-thumb-color": "#616166",
  "--range-decoration-active-color": "#f8dd50"
};
var DarkTheme = {
  "--widget-margin": "12px",
  "--button-size": "28px",
  "--button-corner-radius": "8px",
  "--button-background": "rgba(18, 18, 20, 1)",
  "--button-stroke": "rgba(18, 18, 20, 0.30)",
  "--button-inner-stroke": "unset",
  "--button-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
  "--button-backdrop-filter": "unset",
  "--button-icon-idle": "rgba(158, 157, 168, 1)",
  "--button-icon-hover": "rgba(215, 214, 229, 1)",
  "--button-text": "rgb(215, 214, 229, 1)",
  "--icon-compass-north-color": "rgb(240, 92, 68)",
  "--icon-compass-south-color": "rgb(200, 199, 209)",
  "--menu-gap": "4px",
  "--menu-background": "rgba(18, 18, 20, 1)",
  "--menu-backdrop-filter": "unset",
  "--menu-border": "unset",
  "--menu-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
  "--menu-text": "rgb(215, 214, 229, 1)",
  "--menu-item-hover": "rgba(255, 255, 255, 0.1)",
  "--range-step-button-size": "24px",
  "--range-track-size": "16px",
  "--range-thumb-size": "10px",
  "--range-track-color": "#2c2c30",
  "--range-thumb-color": "#9e9da8",
  "--range-decoration-active-color": "#dd7d2c"
};
var LightGlassTheme = {
  "--widget-margin": "12px",
  "--button-size": "28px",
  "--button-corner-radius": "8px",
  "--button-background": "rgba(255, 255, 255, 0.6)",
  "--button-stroke": "rgba(255, 255, 255, 0.3)",
  "--button-inner-stroke": "1px solid rgba(255, 255, 255, 0.6)",
  "--button-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset",
  "--button-backdrop-filter": "blur(4px)",
  "--button-icon-idle": "rgba(97, 97, 102, 1)",
  "--button-icon-hover": "rgba(24, 24, 26, 1)",
  "--button-text": "rgb(24, 24, 26, 1)",
  "--icon-compass-north-color": "rgb(240, 92, 68)",
  "--icon-compass-south-color": "rgb(204, 204, 204)",
  "--menu-gap": "4px",
  "--menu-background": "rgba(255, 255, 255, 0.6)",
  "--menu-backdrop-filter": "blur(4px)",
  "--menu-border": "1px solid rgba(255, 255, 255, 0.6)",
  "--menu-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset",
  "--menu-text": "rgb(24, 24, 26, 1)",
  "--menu-item-hover": "rgba(0, 0, 0, 0.08)",
  "--range-step-button-size": "24px",
  "--range-track-size": "16px",
  "--range-thumb-size": "10px",
  "--range-track-color": "rgba(215, 214, 229, 0.3)",
  "--range-thumb-color": "rgba(97, 97, 102, 1)",
  "--range-decoration-active-color": "rgba(255, 215, 0, 0.6)"
};
var DarkGlassTheme = {
  "--widget-margin": "12px",
  "--button-size": "28px",
  "--button-corner-radius": "8px",
  "--button-background": "rgba(18, 18, 20, 0.75)",
  "--button-stroke": "rgba(18, 18, 20, 0.30)",
  "--button-inner-stroke": "1px solid rgba(18, 18, 20, 0.75)",
  "--button-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset",
  "--button-backdrop-filter": "blur(4px)",
  "--button-icon-idle": "rgba(158, 157, 168, 1)",
  "--button-icon-hover": "rgba(215, 214, 229, 1)",
  "--button-text": "rgb(215, 214, 229, 1)",
  "--icon-compass-north-color": "rgb(240, 92, 68)",
  "--icon-compass-south-color": "rgb(200, 199, 209)",
  "--menu-gap": "4px",
  "--menu-background": "rgba(18, 18, 20, 0.75)",
  "--menu-backdrop-filter": "blur(4px)",
  "--menu-border": "1px solid rgba(18, 18, 20, 0.75)",
  "--menu-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset",
  "--menu-text": "rgb(215, 214, 229, 1)",
  "--menu-item-hover": "rgba(255, 255, 255, 0.1)",
  "--range-step-button-size": "24px",
  "--range-track-size": "16px",
  "--range-thumb-size": "10px",
  "--range-track-color": "rgba(24, 24, 26, 0.3)",
  "--range-thumb-color": "rgba(158, 157, 168, 1)",
  "--range-decoration-active-color": "rgba(255, 145, 0, 0.6)"
};

// dist/theme-widget.js
var ThemeWidget = class extends import_core20.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-theme";
    this.placement = "top-left";
    this.themeMode = "dark";
    this.appliedTheme = {};
    this.themeMode = this._getInitialThemeMode();
    this.setProps(this.props);
  }
  // eslint-disable-next-line complexity
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    const { lightModeLabel, darkModeLabel } = this.props;
    const currentMode = this.getThemeMode();
    this._applyTheme(currentMode, rootElement);
    (0, import_preact18.render)((0, import_jsx_runtime24.jsx)(IconButton, { onClick: this._handleClick.bind(this), label: currentMode === "dark" ? darkModeLabel : lightModeLabel, className: currentMode === "dark" ? "deck-widget-moon" : "deck-widget-sun" }), rootElement);
  }
  /**
   * Returns the current theme mode.
   * In controlled mode, returns the themeMode prop.
   * In uncontrolled mode, returns the internal state.
   */
  getThemeMode() {
    return this.props.themeMode ?? this.themeMode;
  }
  _handleClick() {
    var _a, _b;
    const currentMode = this.getThemeMode();
    const nextMode = currentMode === "dark" ? "light" : "dark";
    (_b = (_a = this.props).onThemeModeChange) == null ? void 0 : _b.call(_a, nextMode);
    if (this.props.themeMode === void 0) {
      this.themeMode = nextMode;
      this.updateHTML();
    }
  }
  /** Apply theme styling without changing internal state */
  _applyTheme(themeMode, rootElement) {
    const themeStyle = themeMode === "dark" ? this.props.darkModeTheme : this.props.lightModeTheme;
    if ((0, import_core19._deepEqual)(themeStyle, this.appliedTheme, 1)) {
      return;
    }
    const container = rootElement.closest(".deck-widget-container");
    if (!container)
      return;
    (0, import_core19._applyStyles)(container, themeStyle);
    this.appliedTheme = themeStyle;
    const label = themeMode === "dark" ? this.props.darkModeLabel : this.props.lightModeLabel;
    import_core19.log.log(1, `Switched theme to ${label}`, themeStyle)();
  }
  /** Read browser preference */
  _getInitialThemeMode() {
    const { initialThemeMode } = this.props;
    if (initialThemeMode !== "auto") {
      return initialThemeMode;
    }
    if (typeof window === "undefined") {
      return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
};
ThemeWidget.defaultProps = {
  ...import_core20.Widget.defaultProps,
  id: "theme",
  placement: "top-left",
  viewId: null,
  lightModeLabel: "Light Mode",
  lightModeTheme: LightGlassTheme,
  darkModeLabel: "Dark Mode",
  darkModeTheme: DarkGlassTheme,
  initialThemeMode: "auto",
  themeMode: void 0,
  onThemeModeChange: () => {
  }
};

// dist/loading-widget.js
var import_jsx_runtime25 = require("preact/jsx-runtime");
var import_preact19 = require("preact");
var import_core21 = require("@deck.gl/core");
var LoadingWidget = class extends import_core21.Widget {
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-loading";
    this.placement = "top-left";
    this.loading = true;
    this.setProps(this.props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
  onRenderHTML(rootElement) {
    (0, import_preact19.render)(
      // TODO(ibgreen) - this should not be a button, but styling is so nested that it is easier to reuse this component.
      this.loading && (0, import_jsx_runtime25.jsx)(IconButton, { className: "deck-widget-spinner", label: this.props.label, onClick: this.handleClick.bind(this) }),
      rootElement
    );
  }
  onRedraw({ layers }) {
    var _a, _b;
    const loading = layers.some((layer) => !layer.isLoaded);
    if (loading !== this.loading) {
      this.loading = loading;
      (_b = (_a = this.props).onLoadingChange) == null ? void 0 : _b.call(_a, loading);
      this.updateHTML();
    }
  }
  // TODO(ibgreen) - this should not be a button, see above.
  handleClick() {
  }
};
LoadingWidget.defaultProps = {
  ...import_core21.Widget.defaultProps,
  id: "loading",
  placement: "top-left",
  viewId: null,
  label: "Loading layer data",
  onLoadingChange: () => {
  }
};

// dist/stats-widget.js
var import_jsx_runtime26 = require("preact/jsx-runtime");
var import_core22 = require("@deck.gl/core");
var import_core23 = require("@luma.gl/core");
var import_preact20 = require("preact");
var import_hooks7 = require("preact/hooks");
var DEFAULT_COUNT_FORMATTER = (stat) => `${stat.name}: ${stat.count}`;
function formatTime(time) {
  return time < 1e3 ? `${time.toFixed(2)}ms` : `${(time / 1e3).toFixed(2)}s`;
}
function formatMemory(bytes) {
  const mb = bytes / 1e6;
  return `${mb.toFixed(1)} MB`;
}
var DEFAULT_FORMATTERS = {
  count: DEFAULT_COUNT_FORMATTER,
  averageTime: (stat) => `${stat.name}: ${formatTime(stat.getAverageTime())}`,
  totalTime: (stat) => `${stat.name}: ${formatTime(stat.time)}`,
  fps: (stat) => `${stat.name}: ${Math.round(stat.getHz())}fps`,
  memory: (stat) => `${stat.name}: ${formatMemory(stat.count)}`
};
var StatsWidget = class extends import_core22.Widget {
  /**
   * Returns the current expanded state.
   * In controlled mode, returns the expanded prop.
   * In uncontrolled mode, returns the internal state.
   */
  getExpanded() {
    return this.props.expanded ?? this._expanded;
  }
  constructor(props = {}) {
    super(props);
    this.className = "deck-widget-stats";
    this.placement = "top-left";
    this._counter = 0;
    this._expanded = false;
    this._toggleExpanded = () => {
      var _a, _b;
      const nextExpanded = !this.getExpanded();
      (_b = (_a = this.props).onExpandedChange) == null ? void 0 : _b.call(_a, nextExpanded);
      if (this.props.expanded === void 0) {
        this._expanded = nextExpanded;
        this.updateHTML();
      }
    };
    this._getFps = () => {
      var _a;
      return Math.round(((_a = this.deck) == null ? void 0 : _a.metrics.fps) ?? 0);
    };
    this._formatters = { ...DEFAULT_FORMATTERS };
    this._resetOnUpdate = { ...this.props.resetOnUpdate };
    this._expanded = Boolean(props.initialExpanded);
    this.setProps(props);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    if (props.formatters) {
      for (const name in props.formatters) {
        const f = props.formatters[name];
        this._formatters[name] = typeof f === "string" ? DEFAULT_FORMATTERS[f] || DEFAULT_COUNT_FORMATTER : f;
      }
    }
    if (props.resetOnUpdate) {
      this._resetOnUpdate = { ...props.resetOnUpdate };
    }
    super.setProps(props);
  }
  onRemove() {
    if (this.rootElement) {
      (0, import_preact20.render)(null, this.rootElement);
    }
  }
  onRenderHTML(rootElement) {
    const isExpanded = this.getExpanded();
    if (!isExpanded) {
      (0, import_preact20.render)((0, import_jsx_runtime26.jsx)(FpsIcon, { getFps: this._getFps, onClick: this._toggleExpanded }), rootElement);
      return;
    }
    const stats = this._getStats();
    const title = this.props.title || ("id" in stats ? stats.id : null) || "Stats";
    const deviceLabel = this._getDeviceLabel();
    const items = [];
    if (stats) {
      stats.forEach((stat) => {
        const lines = this._getLines(stat).split("\n");
        if (this._resetOnUpdate && this._resetOnUpdate[stat.name]) {
          stat.reset();
        }
        lines.forEach((line, i) => {
          items.push((0, import_jsx_runtime26.jsx)("div", { style: { whiteSpace: "pre" }, children: line }, `${stat.name}-${i}`));
        });
      });
    }
    (0, import_preact20.render)((0, import_jsx_runtime26.jsxs)("div", { className: "deck-widget-stats-container", style: { cursor: "default" }, children: [(0, import_jsx_runtime26.jsxs)("div", { className: "deck-widget-stats-header", style: { cursor: "pointer", pointerEvents: "auto" }, onClick: this._toggleExpanded, children: [(0, import_jsx_runtime26.jsx)("b", { children: title }), deviceLabel && (0, import_jsx_runtime26.jsx)("span", { className: "deck-widget-stats-device", children: deviceLabel }), (0, import_jsx_runtime26.jsx)("button", { className: "deck-widget-dropdown-button", children: (0, import_jsx_runtime26.jsx)("span", { className: "deck-widget-dropdown-icon open" }) })] }), (0, import_jsx_runtime26.jsx)("div", { className: "deck-widget-stats-content", children: items })] }), rootElement);
  }
  onRedraw() {
    if (this.getExpanded()) {
      const framesPerUpdate = Math.max(1, this.props.framesPerUpdate || 1);
      if (this._counter++ % framesPerUpdate === 0) {
        this.updateHTML();
      }
    }
  }
  _getStats() {
    var _a, _b;
    switch (this.props.type) {
      case "deck":
        const metrics = ((_a = this.deck) == null ? void 0 : _a.metrics) ?? {};
        return Object.entries(metrics);
      case "luma":
        return Array.from(import_core23.luma.stats.stats.values())[0];
      case "device":
        const device = (_b = this.deck) == null ? void 0 : _b.device;
        const stats = device == null ? void 0 : device.statsManager.stats.values();
        return stats ? Array.from(stats)[0] : [];
      case "custom":
        return this.props.stats;
      default:
        throw new Error(`Unknown stats type: ${this.props.type}`);
    }
  }
  _getDeviceLabel() {
    var _a, _b;
    const deviceType = (_b = (_a = this.deck) == null ? void 0 : _a.device) == null ? void 0 : _b.type;
    if (!deviceType) {
      return null;
    }
    switch (deviceType) {
      case "webgpu":
        return "WebGPU";
      case "webgl":
        return "WebGL";
      default:
        return String(deviceType);
    }
  }
  _getLines(stat) {
    if ("count" in stat) {
      const formatter = this._formatters[stat.name] || this._formatters[stat.type || ""] || DEFAULT_COUNT_FORMATTER;
      return formatter(stat);
    }
    const [key, value] = stat;
    const formattedValue = key.endsWith("Memory") ? formatMemory(value) : key.includes("Time") ? formatTime(value) : `${value.toFixed(2)}`;
    return `${key}: ${formattedValue}`;
  }
};
StatsWidget.defaultProps = {
  ...import_core22.Widget.defaultProps,
  type: "deck",
  placement: "top-left",
  viewId: null,
  initialExpanded: false,
  stats: void 0,
  title: "Stats",
  framesPerUpdate: 1,
  formatters: {},
  resetOnUpdate: {},
  id: "stats",
  expanded: void 0,
  onExpandedChange: () => {
  }
};
function FpsIcon({ getFps, onClick }) {
  const [fps, setFps] = (0, import_hooks7.useState)(getFps());
  (0, import_hooks7.useEffect)(() => {
    const onUpdate = () => {
      setFps(getFps());
      timer = requestAnimationFrame(onUpdate);
    };
    let timer = requestAnimationFrame(onUpdate);
    return () => {
      cancelAnimationFrame(timer);
    };
  }, [getFps]);
  return (0, import_jsx_runtime26.jsx)(IconButton, { onClick, children: (0, import_jsx_runtime26.jsxs)("div", { className: "text", children: ["FPS", (0, import_jsx_runtime26.jsx)("br", {}), fps] }) });
}
//# sourceMappingURL=index.cjs.map
