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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { jsx as _jsx } from "preact/jsx-runtime";
import { Component } from 'preact/compat';
import { Circle, Line } from '../shape';
import { observer } from '../..';
import { EventType, ModelType } from '../../constant';
import { StepDrag, getBezierPoints } from '../../util';
// bezier曲线的可调整锚点
var BezierAdjustAnchor = /** @class */ (function (_super) {
    __extends(BezierAdjustAnchor, _super);
    function BezierAdjustAnchor() {
        var _this = _super.call(this) || this;
        _this.onDragging = function (_a) {
            var event = _a.event;
            var _b = _this.props, graphModel = _b.graphModel, bezierModel = _b.bezierModel, type = _b.type;
            var _c = graphModel.getPointByClient({
                x: event.clientX,
                y: event.clientY,
            }).canvasOverlayPosition, x = _c.x, y = _c.y;
            bezierModel.updateAdjustAnchor({
                x: x,
                y: y,
            }, type);
            graphModel.eventCenter.emit(EventType.EDGE_ADJUST, {
                data: bezierModel.getData(),
            });
        };
        _this.onDragEnd = function () {
            var bezierModel = _this.props.bezierModel;
            bezierModel.isDragging = false;
        };
        _this.dragHandler = new StepDrag({
            onDragging: _this.onDragging,
            onDragEnd: _this.onDragEnd,
        });
        return _this;
    }
    BezierAdjustAnchor.prototype.render = function () {
        var _this = this;
        var position = this.props.position;
        var x = position.x, y = position.y;
        var bezierModel = this.props.bezierModel;
        var adjustAnchor = bezierModel.getEdgeStyle().adjustAnchor;
        return (_jsx(Circle, __assign({ className: "lf-bezier-adjust-anchor", x: x, y: y }, adjustAnchor, { onPointerDown: function (ev) {
                // if (edgeAddable !== false) {
                _this.dragHandler.handleMouseDown(ev);
                // }
            } })));
    };
    return BezierAdjustAnchor;
}(Component));
export { BezierAdjustAnchor };
var BezierAdjustOverlay = /** @class */ (function (_super) {
    __extends(BezierAdjustOverlay, _super);
    function BezierAdjustOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BezierAdjustOverlay.prototype.getBezierAdjust = function (bezier, graphModel) {
        var path = bezier.path, id = bezier.id;
        var pointsList = getBezierPoints(path);
        var _a = __read(pointsList, 4), start = _a[0], sNext = _a[1], ePre = _a[2], end = _a[3];
        var adjustLine = bezier.getEdgeStyle().adjustLine;
        var result = []; // TODO: 类型定义
        result.push(_jsx(Line, __assign({ x1: start.x, y1: start.y, x2: sNext.x, y2: sNext.y }, adjustLine)));
        result.push(_jsx(BezierAdjustAnchor, { position: sNext, bezierModel: bezier, graphModel: graphModel, type: "sNext" }, "".concat(id, "_ePre")));
        result.push(_jsx(Line, __assign({ x1: end.x, y1: end.y, x2: ePre.x, y2: ePre.y }, adjustLine)));
        result.push(_jsx(BezierAdjustAnchor, { position: ePre, bezierModel: bezier, graphModel: graphModel, type: "ePre" }, "".concat(id, "_sNext")));
        return result;
    };
    // 获取选中bezier曲线，调整操作线和锚点
    BezierAdjustOverlay.prototype.selectedBezierEdge = function () {
        var graphModel = this.props.graphModel;
        var edgeList = graphModel.edges;
        var edgeAdjust = []; // TODO：类型定义
        for (var i = 0; i < edgeList.length; i++) {
            var edge = edgeList[i];
            if (edge.isSelected &&
                edge.modelType === ModelType.BEZIER_EDGE &&
                edge.draggable) {
                edgeAdjust.push(this.getBezierAdjust(edge, graphModel));
            }
        }
        return edgeAdjust;
    };
    BezierAdjustOverlay.prototype.render = function () {
        return _jsx("g", { className: "lf-bezier-adjust", children: this.selectedBezierEdge() });
    };
    BezierAdjustOverlay = __decorate([
        observer
    ], BezierAdjustOverlay);
    return BezierAdjustOverlay;
}(Component));
export { BezierAdjustOverlay };
export default BezierAdjustOverlay;
