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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolylineEdge = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var BaseEdge_1 = __importDefault(require("./BaseEdge"));
var shape_1 = require("../shape");
var constant_1 = require("../../constant");
var util_1 = require("../../util");
var geometry_1 = require("../../util/geometry");
var algorithm_1 = require("../../algorithm");
var PolylineEdge = /** @class */ (function (_super) {
    __extends(PolylineEdge, _super);
    function PolylineEdge() {
        var _this = _super.call(this) || this;
        /**
         * 不支持重写
         */
        _this.onDragStart = function () {
            var polylineModel = _this.props.model;
            polylineModel.dragAppendStart();
            _this.isShowAdjustPointTemp = polylineModel.isShowAdjustPoint;
            polylineModel.isShowAdjustPoint = false;
        };
        /**
         * 不支持重写
         */
        _this.onDragging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var _b = _this.props, model = _b.model, graphModel = _b.graphModel;
            _this.isDragging = true;
            var transformModel = graphModel.transformModel, editConfigModel = graphModel.editConfigModel;
            var _c = __read(transformModel.fixDeltaXY(deltaX, deltaY), 2), curDeltaX = _c[0], curDeltaY = _c[1];
            var polylineModel = model;
            // 更新当前拖拽的线段信息
            // 1、如果只允许调整中间线段调用dragAppendSimple
            // 2、如果允许调整所有线段调用dragAppend
            var adjustEdgeMiddle = editConfigModel.adjustEdgeMiddle;
            if (adjustEdgeMiddle) {
                _this.appendInfo = polylineModel.dragAppendSimple(_this.appendInfo, {
                    x: curDeltaX,
                    y: curDeltaY,
                });
            }
            else {
                _this.appendInfo = polylineModel.dragAppend(_this.appendInfo, {
                    x: curDeltaX,
                    y: curDeltaY,
                });
            }
        };
        /**
         * 不支持重写
         */
        _this.onDragEnd = function () {
            var _a;
            var _b = _this.props, model = _b.model, eventCenter = _b.graphModel.eventCenter;
            var polylineModel = model;
            polylineModel.dragAppendEnd();
            _this.isDragging = false;
            polylineModel.isShowAdjustPoint = (_a = _this.isShowAdjustPointTemp) !== null && _a !== void 0 ? _a : false;
            // 情况当前拖拽的线段信息
            _this.appendInfo = undefined;
            // 向外抛出事件
            eventCenter.emit(constant_1.EventType.EDGE_ADJUST, { data: polylineModel.getData() });
        };
        /**
         * 不支持重写
         */
        _this.beforeDragStart = function (e, appendInfo) {
            // 如果允许拖拽调整触发事件处理
            if (appendInfo.draggable) {
                _this.drag.handleMouseDown(e);
            }
            // 记录当前拖拽的线段信息
            _this.appendInfo = appendInfo;
        };
        _this.drag = new util_1.StepDrag({
            onDragStart: _this.onDragStart,
            onDragging: _this.onDragging,
            onDragEnd: _this.onDragEnd,
            isStopPropagation: false,
        });
        return _this;
    }
    /**
     * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
     * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
     */
    PolylineEdge.prototype.getEdge = function () {
        var _a, _b;
        var model = this.props.model;
        var points = model.points, isAnimation = model.isAnimation, arrowConfig = model.arrowConfig, properties = model.properties;
        var style = model.getEdgeStyle();
        var animationStyle = model.getEdgeAnimationStyle();
        var strokeDasharray = animationStyle.strokeDasharray, stroke = animationStyle.stroke, strokeDashoffset = animationStyle.strokeDashoffset, animationName = animationStyle.animationName, animationDuration = animationStyle.animationDuration, animationIterationCount = animationStyle.animationIterationCount, animationTimingFunction = animationStyle.animationTimingFunction, animationDirection = animationStyle.animationDirection;
        // 应用通用圆角：当存在样式半径时，为折线拐点生成圆角
        var radius = ((_b = (_a = properties === null || properties === void 0 ? void 0 : properties.radius) !== null && _a !== void 0 ? _a : style === null || style === void 0 ? void 0 : style.radius) !== null && _b !== void 0 ? _b : 0);
        var roundedPointsStr = (function () {
            if (!radius || radius <= 0)
                return points;
            var list = (0, util_1.points2PointsList)(points);
            var rounded = (0, geometry_1.generateRoundedCorners)(list, radius, false);
            return rounded.map(function (p) { return "".concat(p.x, ",").concat(p.y); }).join(' ');
        })();
        return ((0, jsx_runtime_1.jsx)(shape_1.Polyline, __assign({ points: roundedPointsStr }, style, arrowConfig, (isAnimation
            ? {
                strokeDasharray: strokeDasharray,
                stroke: stroke,
                style: {
                    strokeDashoffset: strokeDashoffset,
                    animationName: animationName,
                    animationDuration: animationDuration,
                    animationIterationCount: animationIterationCount,
                    animationTimingFunction: animationTimingFunction,
                    animationDirection: animationDirection,
                },
            }
            : {}))));
    };
    /**
     * @deprecated
     */
    PolylineEdge.prototype.getArrowInfo = function () {
        var model = this.props.model;
        var points = model.points, isSelected = model.isSelected;
        var hover = this.state.hover;
        var currentPositionList = (0, util_1.points2PointsList)(points);
        var startPoint = currentPositionList[0];
        var endPoint = currentPositionList[0];
        // 两点重合时不计算起终点
        if (currentPositionList.length >= 2) {
            startPoint = currentPositionList[currentPositionList.length - 2];
            endPoint = currentPositionList[currentPositionList.length - 1];
        }
        return {
            start: startPoint,
            end: endPoint,
            hover: hover,
            isSelected: isSelected,
        };
    };
    PolylineEdge.prototype.getLastTwoPoints = function () {
        var model = this.props.model;
        var points = model.points;
        var currentPositionList = (0, util_1.points2PointsList)(points);
        var startPoint = currentPositionList[0];
        var endPoint = currentPositionList[0];
        // 两点重合时不计算起终点
        if (currentPositionList.length >= 2) {
            startPoint = currentPositionList[currentPositionList.length - 2];
            endPoint = currentPositionList[currentPositionList.length - 1];
        }
        return [startPoint, endPoint];
    };
    PolylineEdge.prototype.getAppendAttributes = function (appendInfo) {
        var start = appendInfo.start, end = appendInfo.end;
        var d;
        if (start.x === end.x && start.y === end.y) {
            // 拖拽过程中会出现起终点重合的情况，这时候append无法计算
            d = '';
        }
        else {
            var config = {
                start: start,
                end: end,
                offset: 10,
                verticalLength: 5,
            };
            var startPosition = (0, algorithm_1.getVerticalPointOfLine)(__assign(__assign({}, config), { type: 'start' }));
            var endPosition = (0, algorithm_1.getVerticalPointOfLine)(__assign(__assign({}, config), { type: 'end' }));
            d = "M".concat(startPosition.leftX, " ").concat(startPosition.leftY, "\n      L").concat(startPosition.rightX, " ").concat(startPosition.rightY, "\n      L").concat(endPosition.rightX, " ").concat(endPosition.rightY, "\n      L").concat(endPosition.leftX, " ").concat(endPosition.leftY, " z");
        }
        return {
            d: d,
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 1,
            strokeDasharray: '4, 4',
        };
    };
    PolylineEdge.prototype.getAppendShape = function (appendInfo) {
        var _a = this.getAppendAttributes(appendInfo), d = _a.d, strokeWidth = _a.strokeWidth, fill = _a.fill, strokeDasharray = _a.strokeDasharray, stroke = _a.stroke;
        return ((0, jsx_runtime_1.jsx)(shape_1.Path, { d: d, fill: fill, strokeWidth: strokeWidth, stroke: stroke, strokeDasharray: strokeDasharray }));
    };
    /**
     * @overridable 可重写，在完全自定义边的时候，可以重写此方法，来自定义边的选区。
     */
    PolylineEdge.prototype.getAppendWidth = function () {
        var _this = this;
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var pointsList = model.pointsList, draggable = model.draggable;
        var LineAppendList = [];
        var pointsLen = pointsList.length;
        var _loop_1 = function (i) {
            var className = 'lf-polyline-append';
            var appendInfo = {
                start: {
                    x: pointsList[i].x,
                    y: pointsList[i].y,
                },
                end: {
                    x: pointsList[i + 1].x,
                    y: pointsList[i + 1].y,
                },
                startIndex: i,
                endIndex: i + 1,
                direction: constant_1.SegmentDirection.HORIZONTAL,
                draggable: true,
            };
            var append = ((0, jsx_runtime_1.jsx)("g", { className: className, children: this_1.getAppendShape(appendInfo) }));
            var editConfigModel = graphModel.editConfigModel;
            var adjustEdge = editConfigModel.adjustEdge, adjustEdgeMiddle = editConfigModel.adjustEdgeMiddle;
            if (adjustEdge && draggable) {
                var startIndex = appendInfo.startIndex, endIndex = appendInfo.endIndex;
                // 如果不允许调整起点和终点相连的线段，设置该线段appendInfo的dragAble为false
                var dragDisable = adjustEdgeMiddle && (startIndex === 0 || endIndex === pointsLen - 1);
                appendInfo.draggable = !dragDisable;
                if (appendInfo.start.x === appendInfo.end.x) {
                    // 水平
                    if (appendInfo.draggable) {
                        className += '-ew-resize';
                    }
                    appendInfo.direction = constant_1.SegmentDirection.VERTICAL;
                }
                else if (appendInfo.start.y === appendInfo.end.y) {
                    // 垂直
                    if (appendInfo.draggable) {
                        className += '-ns-resize';
                    }
                    appendInfo.direction = constant_1.SegmentDirection.HORIZONTAL;
                }
                append = ((0, jsx_runtime_1.jsx)("g", { className: this_1.isDragging ? 'lf-dragging' : 'lf-drag-able', onPointerDown: function (e) { return _this.beforeDragStart(e, appendInfo); }, children: (0, jsx_runtime_1.jsx)("g", { className: className, children: this_1.getAppendShape(appendInfo) }) }));
            }
            LineAppendList.push(append);
        };
        var this_1 = this;
        for (var i = 0; i < pointsLen - 1; i++) {
            _loop_1(i);
        }
        return (0, jsx_runtime_1.jsx)("g", { children: LineAppendList });
    };
    return PolylineEdge;
}(BaseEdge_1.default));
exports.PolylineEdge = PolylineEdge;
exports.default = PolylineEdge;
