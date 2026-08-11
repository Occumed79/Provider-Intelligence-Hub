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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineEdge = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var BaseEdge_1 = __importDefault(require("./BaseEdge"));
var shape_1 = require("../shape");
var util_1 = require("../../util");
var LineEdge = /** @class */ (function (_super) {
    __extends(LineEdge, _super);
    function LineEdge() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
     * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
     */
    LineEdge.prototype.getEdge = function () {
        var model = this.props.model;
        var startPoint = model.startPoint, endPoint = model.endPoint, isAnimation = model.isAnimation, arrowConfig = model.arrowConfig;
        var style = model.getEdgeStyle();
        var animationStyle = model.getEdgeAnimationStyle();
        var strokeDasharray = animationStyle.strokeDasharray, stroke = animationStyle.stroke, strokeDashoffset = animationStyle.strokeDashoffset, animationName = animationStyle.animationName, animationDuration = animationStyle.animationDuration, animationIterationCount = animationStyle.animationIterationCount, animationTimingFunction = animationStyle.animationTimingFunction, animationDirection = animationStyle.animationDirection;
        return ((0, jsx_runtime_1.jsx)(shape_1.Line, __assign({}, style, { x1: startPoint.x, y1: startPoint.y, x2: endPoint.x, y2: endPoint.y }, arrowConfig, (isAnimation
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
     * @overridable 可重写，在完全自定义边的时候，可以重写此方法，来自定义边的选区。
     */
    LineEdge.prototype.getAppendWidth = function () {
        var model = this.props.model;
        var startPoint = model.startPoint, endPoint = model.endPoint;
        var appendInfo = {
            start: startPoint,
            end: endPoint,
        };
        var _a = (0, util_1.getAppendAttributes)(appendInfo), d = _a.d, strokeWidth = _a.strokeWidth, fill = _a.fill, strokeDasharray = _a.strokeDasharray, stroke = _a.stroke;
        return ((0, jsx_runtime_1.jsx)(shape_1.Path, { d: d, fill: fill, strokeWidth: strokeWidth, stroke: stroke, strokeDasharray: strokeDasharray }));
    };
    return LineEdge;
}(BaseEdge_1.default));
exports.LineEdge = LineEdge;
exports.default = LineEdge;
