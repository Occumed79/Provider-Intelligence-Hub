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
import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Component } from 'preact/compat';
import { Rect } from '../shape';
import { observer } from '../..';
import { ModelType } from '../../constant';
import { points2PointsList, getBezierPoints, getBBoxOfPoints } from '../../util';
var OutlineOverlay = /** @class */ (function (_super) {
    __extends(OutlineOverlay, _super);
    function OutlineOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 通用渲染函数：根据点集合与样式计算包围盒并返回矩形轮廓
    OutlineOverlay.prototype.renderRectOutline = function (pointsList, style, className, defaultOffsets) {
        var _a = (style || {}), _b = _a.widthOffset, widthOffset = _b === void 0 ? defaultOffsets.widthOffset : _b, _c = _a.heightOffset, heightOffset = _c === void 0 ? defaultOffsets.heightOffset : _c;
        var _d = getBBoxOfPoints(pointsList, widthOffset, heightOffset), x = _d.x, y = _d.y, width = _d.width, height = _d.height;
        return (_jsx(Rect, __assign({ className: className, x: x, y: y, width: width, height: height }, style)));
    };
    // 节点outline
    OutlineOverlay.prototype.getNodesOutline = function () {
        var graphModel = this.props.graphModel;
        var nodes = graphModel.nodes, _a = graphModel.editConfigModel, hoverOutline = _a.hoverOutline, nodeSelectedOutline = _a.nodeSelectedOutline;
        var nodeOutline = [];
        nodes.forEach(function (element) {
            if (element.isHovered || element.isSelected) {
                var isHovered = element.isHovered, isSelected = element.isSelected, x = element.x, y = element.y, width = element.width, height = element.height;
                if ((nodeSelectedOutline && isSelected) ||
                    (hoverOutline && isHovered)) {
                    var style_1 = element.getOutlineStyle() || {};
                    var attributes_1 = {};
                    Object.keys(style_1).forEach(function (key) {
                        if (key !== 'hover') {
                            attributes_1[key] = style_1[key];
                        }
                    });
                    if (isHovered) {
                        var hoverStyle = style_1.hover;
                        attributes_1 = __assign(__assign({}, attributes_1), hoverStyle);
                    }
                    nodeOutline.push(_jsx(Rect, __assign({ transform: element.transform, className: "lf-outline-node", x: x, y: y, width: width + 4,
                        height: height + 4 }, attributes_1)));
                }
            }
        });
        return nodeOutline;
    };
    // 边的outline
    OutlineOverlay.prototype.getEdgeOutline = function () {
        var _a = this.props.graphModel, edgeList = _a.edges, _b = _a.editConfigModel, edgeSelectedOutline = _b.edgeSelectedOutline, hoverOutline = _b.hoverOutline;
        var edgeOutline = [];
        for (var i = 0; i < edgeList.length; i++) {
            var edge = edgeList[i];
            if ((edgeSelectedOutline && edge.isSelected) ||
                (hoverOutline && edge.isHovered)) {
                if (edge.modelType === ModelType.LINE_EDGE) {
                    edgeOutline.push(this.getLineOutline(edge));
                }
                else if (edge.modelType === ModelType.POLYLINE_EDGE) {
                    edgeOutline.push(this.getPolylineOutline(edge));
                }
                else if (edge.modelType === ModelType.BEZIER_EDGE) {
                    edgeOutline.push(this.getBezierOutline(edge));
                }
            }
        }
        return edgeOutline;
    };
    // 直线outline
    OutlineOverlay.prototype.getLineOutline = function (line) {
        var startPoint = line.startPoint, endPoint = line.endPoint;
        var style = line.getOutlineStyle();
        return this.renderRectOutline([startPoint, endPoint], style, 'lf-outline-edge', { widthOffset: 10, heightOffset: 10 });
    };
    // 折线outline
    OutlineOverlay.prototype.getPolylineOutline = function (polyline) {
        var points = polyline.points;
        var pointsList = points2PointsList(points);
        var style = polyline.getOutlineStyle();
        return this.renderRectOutline(pointsList, style, 'lf-outline', {
            widthOffset: 8,
            heightOffset: 16,
        });
    };
    // 曲线outline
    OutlineOverlay.prototype.getBezierOutline = function (bezier) {
        var path = bezier.path;
        var pointsList = getBezierPoints(path);
        var style = bezier.getOutlineStyle();
        return this.renderRectOutline(pointsList, style, 'lf-outline', {
            widthOffset: 8,
            heightOffset: 16,
        });
    };
    OutlineOverlay.prototype.render = function () {
        return (_jsxs("g", { className: "lf-outline", children: [this.getNodesOutline(), this.getEdgeOutline()] }));
    };
    OutlineOverlay = __decorate([
        observer
    ], OutlineOverlay);
    return OutlineOverlay;
}(Component));
export { OutlineOverlay };
export default OutlineOverlay;
