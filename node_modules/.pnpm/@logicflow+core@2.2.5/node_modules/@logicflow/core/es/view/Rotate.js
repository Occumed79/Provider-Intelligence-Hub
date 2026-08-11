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
import { jsx as _jsx } from "preact/jsx-runtime";
import { Component } from 'preact/compat';
import { map, reduce } from 'lodash-es';
import Circle from './shape/Circle';
import { EventType } from '../constant';
import { StepDrag, TranslateMatrix, Vector } from '../util';
var RotateControlPoint = /** @class */ (function (_super) {
    __extends(RotateControlPoint, _super);
    function RotateControlPoint(props) {
        var _this = _super.call(this, props) || this;
        _this.style = {};
        _this.onDragging = function (_a) {
            var _b;
            var event = _a.event;
            var _c = _this.props, graphModel = _c.graphModel, nodeModel = _c.nodeModel, eventCenter = _c.eventCenter;
            var selectNodes = graphModel.selectNodes;
            var x = nodeModel.x, y = nodeModel.y;
            var clientX = event.clientX, clientY = event.clientY;
            var _d = graphModel.getPointByClient({
                x: clientX,
                y: clientY,
            }).canvasOverlayPosition, cx = _d.x, cy = _d.y;
            var v = new Vector(cx - x, cy - y);
            var angle = ((_b = _this.normal) === null || _b === void 0 ? void 0 : _b.angle(v)) - _this.defaultAngle;
            var matrix = new TranslateMatrix(-x, -y)
                .rotate(angle)
                .translate(x, y)
                .toString();
            nodeModel.transform = matrix;
            nodeModel.rotate = angle;
            var nodeIds = map(selectNodes, function (node) { return node.id; });
            if (nodeIds.indexOf(nodeModel.id) === -1) {
                nodeIds = [nodeModel.id];
            }
            var nodeIdMap = reduce(nodeIds, function (acc, nodeId) {
                var node = graphModel.getNodeModelById(nodeId);
                acc[nodeId] = node === null || node === void 0 ? void 0 : node.getMoveDistance(0, 0, false);
                return acc;
            }, {});
            nodeIds.forEach(function (nodeId) {
                var edges = graphModel.getNodeEdges(nodeId);
                edges.forEach(function (edge) {
                    if (nodeIdMap[edge.sourceNodeId]) {
                        var model = graphModel.getNodeModelById(edge.sourceNodeId);
                        var anchor = model.anchors.find(function (item) { return item.id === edge.sourceAnchorId; });
                        edge.updateStartPoint(anchor);
                    }
                    if (nodeIdMap[edge.targetNodeId]) {
                        var model = graphModel.getNodeModelById(edge.targetNodeId);
                        var anchor = model.anchors.find(function (item) { return item.id === edge.targetAnchorId; });
                        edge.updateEndPoint(anchor);
                    }
                });
            });
            eventCenter.emit(EventType.NODE_ROTATE, {
                e: event,
                model: nodeModel,
                data: nodeModel.getData(),
            });
        };
        _this.style = props.style;
        _this.stepperDrag = new StepDrag({
            onDragging: _this.onDragging,
        });
        return _this;
    }
    RotateControlPoint.prototype.render = function () {
        var _this = this;
        var nodeModel = this.props.nodeModel;
        var x = nodeModel.x, y = nodeModel.y, width = nodeModel.width, height = nodeModel.height;
        var cx = x + width / 2 + 20;
        var cy = y - height / 2 - 20;
        this.normal = new Vector(1, 0);
        this.defaultAngle = this.normal.angle(new Vector(cx - x, cy - y));
        nodeModel.defaultAngle = this.defaultAngle;
        return (_jsx("g", { className: "lf-rotate-control", children: _jsx("g", { onPointerDown: function (ev) {
                    _this.stepperDrag.handleMouseDown(ev);
                }, children: _jsx(Circle, __assign({}, this.style, { cx: cx, cy: cy })) }) }));
    };
    return RotateControlPoint;
}(Component));
export default RotateControlPoint;
