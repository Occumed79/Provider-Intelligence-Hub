"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEdgeOutline = exports.getBezierOutline = exports.getPolylineOutline = exports.getLineOutline = exports.getNodeOutline = void 0;
var constant_1 = require("../constant");
var util_1 = require("../util");
// 获取节点的out
var getNodeOutline = function (node) {
    var x = node.x, y = node.y, width = node.width, height = node.height;
    return {
        x: x - width / 2,
        y: y - height / 2,
        x1: x + width / 2,
        y1: y + height / 2,
    };
};
exports.getNodeOutline = getNodeOutline;
var getLineOutline = function (edge) {
    var startPoint = edge.startPoint, endPoint = edge.endPoint;
    var x = (startPoint.x + endPoint.x) / 2;
    var y = (startPoint.y + endPoint.y) / 2;
    var width = Math.abs(startPoint.x - endPoint.x) + 10;
    var height = Math.abs(startPoint.y - endPoint.y) + 10;
    return {
        x: x - width / 2,
        y: y - height / 2,
        x1: x + width / 2,
        y1: y + height / 2,
    };
};
exports.getLineOutline = getLineOutline;
var getPolylineOutline = function (edge) {
    var points = edge.points;
    var pointsList = (0, util_1.points2PointsList)(points);
    var bbox = (0, util_1.getBBoxOfPoints)(pointsList, 8);
    var x = bbox.x, y = bbox.y, width = bbox.width, height = bbox.height;
    return {
        x: x - width / 2,
        y: y - height / 2,
        x1: x + width / 2,
        y1: y + height / 2,
    };
};
exports.getPolylineOutline = getPolylineOutline;
var getBezierOutline = function (edge) {
    var path = edge.path;
    var pointsList = (0, util_1.getBezierPoints)(path);
    var bbox = (0, util_1.getBBoxOfPoints)(pointsList, 8);
    var x = bbox.x, y = bbox.y, width = bbox.width, height = bbox.height;
    return {
        x: x - width / 2,
        y: y - height / 2,
        x1: x + width / 2,
        y1: y + height / 2,
    };
};
exports.getBezierOutline = getBezierOutline;
var getEdgeOutline = function (edge) {
    if (edge.modelType === constant_1.ModelType.LINE_EDGE) {
        return (0, exports.getLineOutline)(edge);
    }
    if (edge.modelType === constant_1.ModelType.POLYLINE_EDGE) {
        return (0, exports.getPolylineOutline)(edge);
    }
    if (edge.modelType === constant_1.ModelType.BEZIER_EDGE) {
        return (0, exports.getBezierOutline)(edge);
    }
};
exports.getEdgeOutline = getEdgeOutline;
