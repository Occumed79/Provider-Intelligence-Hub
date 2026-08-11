"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var __1 = require("..");
var util_1 = require("../util");
var constant_1 = require("../constant");
var outline_1 = require("../algorithm/outline");
var MultipleSelect = /** @class */ (function (_super) {
    __extends(MultipleSelect, _super);
    function MultipleSelect(props) {
        var _this = _super.call(this, props) || this;
        _this.handleMouseDown = function (ev) {
            // 多选区域的拖拽步长随缩放变化
            var _a = _this.props, gridSize = _a.graphModel.gridSize, lf = _a.lf;
            var SCALE_X = lf.getTransform().SCALE_X;
            _this.stepDrag.setStep(gridSize * SCALE_X);
            _this.stepDrag.handleMouseDown(ev);
        };
        // 使多选区域的滚轮事件可以触发画布的滚轮事件
        _this.handleWheelEvent = function (ev) {
            var _a, _b;
            ev.preventDefault();
            var deltaX = ev.deltaX, deltaY = ev.deltaY, clientX = ev.clientX, clientY = ev.clientY, ctrlKey = ev.ctrlKey;
            var newEvent = new WheelEvent('wheel', {
                deltaX: deltaX,
                deltaY: deltaY,
                clientX: clientX,
                clientY: clientY,
                ctrlKey: ctrlKey,
            });
            (_b = (_a = _this.props.lf.container) === null || _a === void 0 ? void 0 : _a.querySelector('.lf-canvas-overlay[name="canvas-overlay"]')) === null || _b === void 0 ? void 0 : _b.dispatchEvent(newEvent);
        };
        _this.onDragging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var _b = _this.props, graphModel = _b.graphModel, lf = _b.lf;
            var _c = lf.getTransform(), SCALE_X = _c.SCALE_X, SCALE_Y = _c.SCALE_Y;
            var selectElements = graphModel.getSelectElements(true);
            graphModel.moveNodes(selectElements.nodes.map(function (node) { return node.id; }), deltaX / SCALE_X, deltaY / SCALE_Y);
        };
        _this.handleContextMenu = function (ev) {
            ev.preventDefault();
            var _a = _this.props, graphModel = _a.graphModel, _b = _a.graphModel, eventCenter = _b.eventCenter, selectElements = _b.selectElements;
            var position = graphModel.getPointByClient({
                x: ev.clientX,
                y: ev.clientY,
            });
            var selectGraphData = {
                nodes: [],
                edges: [],
            };
            var models = __spreadArray([], __read(selectElements.values()), false);
            models.forEach(function (model) {
                if (model.BaseType === constant_1.ElementType.NODE) {
                    selectGraphData.nodes.push(model.getData());
                }
                if (model.BaseType === constant_1.ElementType.EDGE) {
                    selectGraphData.edges.push(model.getData());
                }
            });
            eventCenter.emit(constant_1.EventType.SELECTION_CONTEXTMENU, {
                data: selectGraphData,
                e: ev,
                position: position,
            });
        };
        var _a = props.graphModel, gridSize = _a.gridSize, eventCenter = _a.eventCenter;
        _this.stepDrag = new util_1.StepDrag({
            onDragging: _this.onDragging,
            step: gridSize,
            eventType: 'SELECTION',
            eventCenter: eventCenter,
        });
        return _this;
    }
    MultipleSelect.prototype.render = function () {
        var _a, _b;
        var _c = this.props.graphModel, selectElements = _c.selectElements, transformModel = _c.transformModel, theme = _c.theme;
        var _d = this.props.lf.getTransform(), SCALE_X = _d.SCALE_X, SCALE_Y = _d.SCALE_Y;
        var _e = theme.multiSelect || {}, _f = _e.xPadding, xPadding = _f === void 0 ? 8 : _f, _g = _e.yPadding, yPadding = _g === void 0 ? 8 : _g;
        if (selectElements.size <= 1)
            return;
        var x = Number.MAX_SAFE_INTEGER;
        var y = Number.MAX_SAFE_INTEGER;
        var x1 = Number.MIN_SAFE_INTEGER;
        var y1 = Number.MIN_SAFE_INTEGER;
        selectElements.forEach(function (element) {
            var outline;
            if (element.BaseType === constant_1.ElementType.NODE) {
                outline = (0, outline_1.getNodeOutline)(element);
            }
            if (element.BaseType === constant_1.ElementType.EDGE) {
                outline = (0, outline_1.getEdgeOutline)(element);
            }
            if (outline !== undefined) {
                x = Math.min(x, outline.x);
                y = Math.min(y, outline.y);
                x1 = Math.max(x1, outline.x1);
                y1 = Math.max(y1, outline.y1);
            }
        });
        _a = __read(transformModel.CanvasPointToHtmlPoint([x, y]), 2), x = _a[0], y = _a[1];
        _b = __read(transformModel.CanvasPointToHtmlPoint([x1, y1]), 2), x1 = _b[0], y1 = _b[1];
        var style = {
            left: "".concat(x - (20 * SCALE_X) / 2 - xPadding / 2, "px"),
            top: "".concat(y - (20 * SCALE_Y) / 2 - yPadding / 2, "px"),
            width: "".concat(x1 - x + 20 * SCALE_X + xPadding, "px"),
            height: "".concat(y1 - y + 20 * SCALE_Y + yPadding, "px"),
            'border-width': "".concat(2 * SCALE_X, "px"),
        };
        return ((0, jsx_runtime_1.jsx)("div", { className: "lf-multiple-select", style: style, onPointerDown: this.handleMouseDown, onContextMenu: this.handleContextMenu, onWheel: this.handleWheelEvent }));
    };
    MultipleSelect.toolName = 'multiple-select-tool';
    MultipleSelect = __decorate([
        __1.observer
    ], MultipleSelect);
    return MultipleSelect;
}(compat_1.Component));
exports.default = MultipleSelect;
