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
import { jsx as _jsx } from "preact/jsx-runtime";
import BaseEdge from './BaseEdge';
import { Path } from '../shape';
import { getEndTangent } from '../../util';
var BezierEdge = /** @class */ (function (_super) {
    __extends(BezierEdge, _super);
    function BezierEdge() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
     * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
     */
    BezierEdge.prototype.getEdge = function () {
        var model = this.props.model;
        var style = model.getEdgeStyle();
        var _a = model, path = _a.path, isAnimation = _a.isAnimation, arrowConfig = _a.arrowConfig;
        var animationStyle = model.getEdgeAnimationStyle();
        var strokeDasharray = animationStyle.strokeDasharray, stroke = animationStyle.stroke, strokeDashoffset = animationStyle.strokeDashoffset, animationName = animationStyle.animationName, animationDuration = animationStyle.animationDuration, animationIterationCount = animationStyle.animationIterationCount, animationTimingFunction = animationStyle.animationTimingFunction, animationDirection = animationStyle.animationDirection;
        return (_jsx(Path, __assign({ d: path }, style, arrowConfig, (isAnimation
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
    BezierEdge.prototype.getAppendWidth = function () {
        var path = this.props.model.path;
        return _jsx(Path, { d: path, strokeWidth: 10, stroke: "transparent", fill: "none" });
    };
    /**
     * @deprecated
     */
    BezierEdge.prototype.getArrowInfo = function () {
        var model = this.props.model;
        var hover = this.state.hover;
        var isSelected = model.isSelected;
        var offset = model.getArrowStyle().offset;
        var points = model.pointsList.map(function (point) { return ({
            x: point.x,
            y: point.y,
        }); });
        var _a = __read(getEndTangent(points, offset), 2), ePre = _a[0], end = _a[1];
        var arrowInfo = {
            start: ePre,
            end: end,
            hover: hover,
            isSelected: isSelected,
        };
        return arrowInfo;
    };
    BezierEdge.prototype.getLastTwoPoints = function () {
        var model = this.props.model;
        var offset = model.getArrowStyle().offset;
        var points = model.pointsList.map(function (point) { return ({
            x: point.x,
            y: point.y,
        }); });
        return getEndTangent(points, offset);
    };
    return BezierEdge;
}(BaseEdge));
export { BezierEdge };
export default BezierEdge;
