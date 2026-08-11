"use strict";
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
exports.getSvgTextSize = exports.createEdgeGenerator = exports.twoPointDistance = exports.pickEdgeConfig = exports.getClosestPointOfPolyline = exports.getEndTangent = exports.getBezierPoints = exports.getBezierControlPoints = exports.getAppendAttributes = exports.getTextWidth = exports.getBytesLength = exports.getSimplePoints = exports.points2PointsList = exports.segmentDirection = exports.getCrossPointInRect = exports.isSegmentsCrossNode = exports.isSegmentsInNode = exports.getLongestEdge = exports.getPolylinePoints = exports.pointFilter = exports.getBoxByOriginNode = exports.pathFinder = exports.getNextNeighborPoints = exports.isSegmentCrossingBBox = exports.isSegmentsIntersected = exports.removeClosePointFromOpenList = exports.rebuildPath = exports.heuristicCostEstimate = exports.costByPoints = exports.estimateDistance = exports.getBBoxCrossPointsByPoint = exports.getBBoxYCrossPoints = exports.getBBoxXCrossPoints = exports.isPointOutsideBBox = exports.getPointsFromBBox = exports.getBBoxOfPoints = exports.mergeBBox = exports.getExpandedBBoxPoint = exports.pointDirection = exports.getExpandedBBox = exports.getSimplePolyline = exports.filterRepeatPoints = exports.isBboxOverLapping = exports.setupEdgeModel = void 0;
var lodash_es_1 = require("lodash-es");
var _1 = require(".");
var constant_1 = require("../constant");
var algorithm_1 = require("../algorithm");
var model_1 = require("../model");
/* 手动创建边时 edge -> edgeModel */
var setupEdgeModel = function (edge, graphModel) {
    var model;
    switch (edge.type) {
        case 'line':
            model = new model_1.LineEdgeModel(edge, graphModel);
            break;
        case 'polyline':
            model = new model_1.PolylineEdgeModel(edge, graphModel);
            break;
        default:
            model = new model_1.LineEdgeModel(edge, graphModel);
            break;
    }
    return model;
};
exports.setupEdgeModel = setupEdgeModel;
/* 判断两个Bbox是否重合 */
var isBboxOverLapping = function (b1, b2) {
    return Math.abs(b1.centerX - b2.centerX) * 2 < b1.width + b2.width &&
        Math.abs(b1.centerY - b2.centerY) * 2 < b1.height + b2.height;
};
exports.isBboxOverLapping = isBboxOverLapping;
/* 连接点去重，去掉x,y位置重复的点 */
var filterRepeatPoints = function (points) {
    var result = [];
    var pointsMap = {};
    points.forEach(function (p) {
        var id = "".concat(p.x, "-").concat(p.y);
        p.id = id;
        pointsMap[id] = p;
    });
    Object.keys(pointsMap).forEach(function (p) {
        result.push(pointsMap[p]);
    });
    return result;
};
exports.filterRepeatPoints = filterRepeatPoints;
/* 获取简单边:边之间除了起始点，只有1个中间点 */
var getSimplePolyline = function (sPoint, tPoint) {
    var points = [
        sPoint,
        {
            x: sPoint.x,
            y: tPoint.y,
        },
        tPoint,
    ];
    return (0, exports.filterRepeatPoints)(points);
};
exports.getSimplePolyline = getSimplePolyline;
/* 扩展的bbox,保证起始点的下一个点一定在node的垂直方向，不会与线重合, offset是点与线的垂直距离 */
var getExpandedBBox = function (bbox, offset) {
    if (bbox.width === 0 && bbox.height === 0) {
        return bbox;
    }
    return {
        x: bbox.x,
        y: bbox.y,
        centerX: bbox.centerX,
        centerY: bbox.centerY,
        minX: bbox.minX - offset,
        minY: bbox.minY - offset,
        maxX: bbox.maxX + offset,
        maxY: bbox.maxY + offset,
        height: bbox.height + 2 * offset,
        width: bbox.width + 2 * offset,
    };
};
exports.getExpandedBBox = getExpandedBBox;
/* 判断点与中心点边的方向：是否水平，true水平，false垂直 */
var pointDirection = function (point, bbox) {
    var dx = Math.abs(point.x - bbox.centerX);
    var dy = Math.abs(point.y - bbox.centerY);
    return dx / bbox.width > dy / bbox.height
        ? constant_1.SegmentDirection.HORIZONTAL
        : constant_1.SegmentDirection.VERTICAL;
};
exports.pointDirection = pointDirection;
/* 获取扩展图形上的点，即起始终点相邻的点，上一个或者下一个节点 */
/**
 * 计算扩展包围盒上的相邻点（起点或终点的下一个/上一个拐点）
 * - 使用原始节点 bbox 来判定点相对中心的方向，避免 offset 扩展后宽高改变导致方向误判
 * - 若 start 相对中心为水平方向，则返回扩展盒在 x 上的边界，y 保持不变
 * - 若为垂直方向，则返回扩展盒在 y 上的边界，x 保持不变
 * @param expendBBox 扩展后的包围盒（包含 offset）
 * @param bbox 原始节点包围盒（用于正确的方向判定）
 * @param point 起点或终点坐标
 */
var getExpandedBBoxPoint = function (expendBBox, bbox, point) {
    // https://github.com/didi/LogicFlow/issues/817
    // 没有修复前传入的参数bbox实际是expendBBox
    // 由于pointDirection使用的是dx / bbox.width > dy / bbox.height判定方向
    // 此时的bbox.width是增加了offset后的宽度，bbox.height同理
    // 这导致了部分极端情况(宽度很大或者高度很小)，计算出来的方向错误
    var direction = (0, exports.pointDirection)(point, bbox);
    if (direction === constant_1.SegmentDirection.HORIZONTAL) {
        return {
            x: point.x > expendBBox.centerX ? expendBBox.maxX : expendBBox.minX,
            y: point.y,
        };
    }
    return {
        x: point.x,
        y: point.y > expendBBox.centerY ? expendBBox.maxY : expendBBox.minY,
    };
};
exports.getExpandedBBoxPoint = getExpandedBBoxPoint;
/* 获取包含2个图形的外层box */
var mergeBBox = function (b1, b2) {
    var minX = Math.min(b1.minX, b2.minX);
    var minY = Math.min(b1.minY, b2.minY);
    var maxX = Math.max(b1.maxX, b2.maxX);
    var maxY = Math.max(b1.maxY, b2.maxY);
    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY,
        height: maxY - minY,
        width: maxX - minX,
    };
};
exports.mergeBBox = mergeBBox;
/* 获取多个点的外层bbox
 * 这个函数的用处
 * 1、获取起始终点相邻点(expendBboxPoint)的bbox
 * 2、polylineEdge, bezierEdge，获取outline边框，这种情况传入offset
 */
var getBBoxOfPoints = function (points, offset, heightOffset) {
    if (points === void 0) { points = []; }
    var xList = [];
    var yList = [];
    points.forEach(function (p) {
        xList.push(p.x);
        yList.push(p.y);
    });
    var minX = Math.min.apply(Math, __spreadArray([], __read(xList), false));
    var maxX = Math.max.apply(Math, __spreadArray([], __read(xList), false));
    var minY = Math.min.apply(Math, __spreadArray([], __read(yList), false));
    var maxY = Math.max.apply(Math, __spreadArray([], __read(yList), false));
    var width = maxX - minX;
    var height = maxY - minY;
    if (offset) {
        width += offset;
        height += heightOffset || offset;
    }
    return {
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
        maxX: maxX,
        maxY: maxY,
        minX: minX,
        minY: minY,
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        height: height,
        width: width,
    };
};
exports.getBBoxOfPoints = getBBoxOfPoints;
/* 获取box四个角上的点 */
var getPointsFromBBox = function (bbox) {
    var minX = bbox.minX, minY = bbox.minY, maxX = bbox.maxX, maxY = bbox.maxY;
    return [
        {
            x: minX,
            y: minY,
        },
        {
            x: maxX,
            y: minY,
        },
        {
            x: maxX,
            y: maxY,
        },
        {
            x: minX,
            y: maxY,
        },
    ];
};
exports.getPointsFromBBox = getPointsFromBBox;
/* 判断某一点是否在box中 */
var isPointOutsideBBox = function (point, bbox) {
    var x = point.x, y = point.y;
    return x < bbox.minX || x > bbox.maxX || y < bbox.minY || y > bbox.maxY;
};
exports.isPointOutsideBBox = isPointOutsideBBox;
/* 获取点的x方向上与box的交点 */
var getBBoxXCrossPoints = function (bbox, x) {
    if (x < bbox.minX || x > bbox.maxX) {
        return [];
    }
    return [
        {
            x: x,
            y: bbox.minY,
        },
        {
            x: x,
            y: bbox.maxY,
        },
    ];
};
exports.getBBoxXCrossPoints = getBBoxXCrossPoints;
/* 获取点的y方向上与box的交点 */
var getBBoxYCrossPoints = function (bbox, y) {
    if (y < bbox.minY || y > bbox.maxY) {
        return [];
    }
    return [
        {
            x: bbox.minX,
            y: y,
        },
        {
            x: bbox.maxX,
            y: y,
        },
    ];
};
exports.getBBoxYCrossPoints = getBBoxYCrossPoints;
/* 获取点的x,y方向上与box的交点 */
var getBBoxCrossPointsByPoint = function (bbox, point) { return __spreadArray(__spreadArray([], __read((0, exports.getBBoxXCrossPoints)(bbox, point.x)), false), __read((0, exports.getBBoxYCrossPoints)(bbox, point.y)), false); };
exports.getBBoxCrossPointsByPoint = getBBoxCrossPointsByPoint;
/* 计算两点之间的预测距离(非直线距离) */
var estimateDistance = function (p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
};
exports.estimateDistance = estimateDistance;
/* 减少点别重复计算进距离的误差 */
var costByPoints = function (p, points) {
    var offset = -2;
    var result = 0;
    points.forEach(function (point) {
        if (point) {
            if (p.x === point.x) {
                result += offset;
            }
            if (p.y === point.y) {
                result += offset;
            }
        }
    });
    return result;
};
exports.costByPoints = costByPoints;
/* 预估距离 */
var heuristicCostEstimate = function (p, ps, pt, source, target) {
    return (0, exports.estimateDistance)(p, ps) +
        (0, exports.estimateDistance)(p, pt) +
        (0, exports.costByPoints)(p, [ps, pt, source, target]);
};
exports.heuristicCostEstimate = heuristicCostEstimate;
/* 重建路径，根据cameFrom属性计算出从起始到结束的路径 */
var rebuildPath = function (pathPoints, pointById, cameFrom, currentId, iterator) {
    if (!iterator) {
        iterator = 0;
    }
    pathPoints.unshift(pointById[currentId]);
    if (cameFrom[currentId] &&
        cameFrom[currentId] !== currentId &&
        iterator <= 100) {
        (0, exports.rebuildPath)(pathPoints, pointById, cameFrom, cameFrom[currentId], iterator + 1);
    }
};
exports.rebuildPath = rebuildPath;
/* 把计算完毕的点从开放列表中删除 */
var removeClosePointFromOpenList = function (arr, item) {
    var index = arr.indexOf(item);
    if (index > -1) {
        arr.splice(index, 1);
    }
};
exports.removeClosePointFromOpenList = removeClosePointFromOpenList;
/* 通过向量判断线段之间是否是相交的 */
var isSegmentsIntersected = function (p0, p1, p2, p3) {
    var s1x = p1.x - p0.x;
    var s1y = p1.y - p0.y;
    var s2x = p3.x - p2.x;
    var s2y = p3.y - p2.y;
    var s = (-s1y * (p0.x - p2.x) + s1x * (p0.y - p2.y)) / (-s2x * s1y + s1x * s2y);
    var t = (s2x * (p0.y - p2.y) - s2y * (p0.x - p2.x)) / (-s2x * s1y + s1x * s2y);
    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
};
exports.isSegmentsIntersected = isSegmentsIntersected;
/* 判断线段与bbox是否是相交的，保证节点之间的边不会穿过节点自身 */
var isSegmentCrossingBBox = function (p1, p2, bbox) {
    if (bbox.width === 0 && bbox.height === 0) {
        return false;
    }
    var _a = __read((0, exports.getPointsFromBBox)(bbox), 4), pa = _a[0], pb = _a[1], pc = _a[2], pd = _a[3];
    return ((0, exports.isSegmentsIntersected)(p1, p2, pa, pb) ||
        (0, exports.isSegmentsIntersected)(p1, p2, pa, pd) ||
        (0, exports.isSegmentsIntersected)(p1, p2, pb, pc) ||
        (0, exports.isSegmentsIntersected)(p1, p2, pc, pd));
};
exports.isSegmentCrossingBBox = isSegmentCrossingBBox;
/**
 * 基于轴对齐规则获取某点的相邻可连通点（不穿越节点）
 * - 仅考虑 x 或 y 相同的候选点，保证严格水平/垂直
 * - 使用 isSegmentCrossingBBox 校验线段不穿越源/目标节点
 */
var getNextNeighborPoints = function (points, point, bbox1, bbox2) {
    var neighbors = [];
    points.forEach(function (p) {
        if (p !== point) {
            if (p.x === point.x || p.y === point.y) {
                if (!(0, exports.isSegmentCrossingBBox)(p, point, bbox1) &&
                    !(0, exports.isSegmentCrossingBBox)(p, point, bbox2)) {
                    neighbors.push(p);
                }
            }
        }
    });
    return (0, exports.filterRepeatPoints)(neighbors);
};
exports.getNextNeighborPoints = getNextNeighborPoints;
/**
 * 使用 A* + 曼哈顿启发式在候选点图上查找正交路径
 * - 开放集/关闭集管理遍历
 * - gScore 为累计实际代价，fScore = gScore + 启发式
 * - 邻居仅为与当前点 x 或 y 相同且不穿越节点的点
 * 参考：https://zh.wikipedia.org/wiki/A*%E6%90%9C%E5%B0%8B%E6%BC%94%E7%AE%97%E6%B3%95
 */
var pathFinder = function (points, start, goal, sBBox, tBBox, os, ot) {
    // 定义已经遍历过的点
    var closedSet = [];
    // 定义需要遍历的店
    var openSet = [start];
    // 定义节点的上一个节点
    var cameFrom = {};
    var gScore = {};
    var fScore = {};
    if (start.id) {
        gScore[start.id] = 0;
        fScore[start.id] = (0, exports.heuristicCostEstimate)(start, goal, start);
    }
    var pointById = {};
    points.forEach(function (p) {
        if (p.id) {
            pointById[p.id] = p;
        }
    });
    var _loop_1 = function () {
        var current;
        var lowestFScore = Infinity;
        openSet.forEach(function (p) {
            if (p.id && fScore[p.id] < lowestFScore) {
                lowestFScore = fScore[p.id];
                current = p;
            }
        });
        if (current === goal && goal.id) {
            var pathPoints = [];
            (0, exports.rebuildPath)(pathPoints, pointById, cameFrom, goal.id);
            return { value: pathPoints };
        }
        if (!current) {
            return { value: [start, goal] };
        }
        (0, exports.removeClosePointFromOpenList)(openSet, current);
        closedSet.push(current);
        (0, exports.getNextNeighborPoints)(points, current, sBBox, tBBox).forEach(function (neighbor) {
            var _a;
            if (closedSet.indexOf(neighbor) !== -1) {
                return;
            }
            if (openSet.indexOf(neighbor) === -1) {
                openSet.push(neighbor);
            }
            if ((current === null || current === void 0 ? void 0 : current.id) && (neighbor === null || neighbor === void 0 ? void 0 : neighbor.id)) {
                // 修复：累计代价应基于 gScore[current] 而非 fScore[current]
                var tentativeGScore = ((_a = gScore[current.id]) !== null && _a !== void 0 ? _a : 0) + (0, exports.estimateDistance)(current, neighbor);
                if (gScore[neighbor.id] && tentativeGScore >= gScore[neighbor.id]) {
                    return;
                }
                cameFrom[neighbor.id] = current.id;
                gScore[neighbor.id] = tentativeGScore;
                fScore[neighbor.id] =
                    gScore[neighbor.id] +
                        (0, exports.heuristicCostEstimate)(neighbor, goal, start, os, ot);
            }
        });
    };
    while (openSet.length) {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return [start, goal];
};
exports.pathFinder = pathFinder;
var getBoxByOriginNode = function (node) {
    return (0, _1.getNodeBBox)(node);
};
exports.getBoxByOriginNode = getBoxByOriginNode;
/**
 * 去除共线冗余中间点，保持每条直线段仅保留两端点
 * - 若三点在同一水平线或同一垂直线，移除中间点
 */
var pointFilter = function (points) {
    var i = 1;
    while (i < points.length - 1) {
        var pre = points[i - 1];
        var current = points[i];
        var next = points[i + 1];
        if ((pre.x === current.x && current.x === next.x) ||
            (pre.y === current.y && current.y === next.y)) {
            points.splice(i, 1);
        }
        else {
            i++;
        }
    }
    return points;
};
exports.pointFilter = pointFilter;
/**
 * 计算折线点（正交候选点 + A* 路径）
 * 步骤：
 * 1) 取源/目标节点的扩展包围盒与相邻点 sPoint/tPoint
 * 2) 若两个扩展盒重合，使用简单路径 getSimplePoints
 * 3) 构造 lineBBox/sMixBBox/tMixBBox，并收集其角点与中心交点
 * 4) 过滤掉落在两个扩展盒内部的点，形成 connectPoints
 * 5) 以 sPoint/tPoint 为起止，用 A* 查找路径
 * 6) 拼入原始 start/end，并用 pointFilter 去除冗余共线点
 */
var getPolylinePoints = function (start, end, sNode, tNode, offset) {
    var sBBox = (0, exports.getBoxByOriginNode)(sNode);
    var tBBox = (0, exports.getBoxByOriginNode)(tNode);
    var sxBBox = (0, exports.getExpandedBBox)(sBBox, offset);
    var txBBox = (0, exports.getExpandedBBox)(tBBox, offset);
    var sPoint = (0, exports.getExpandedBBoxPoint)(sxBBox, sBBox, start);
    var tPoint = (0, exports.getExpandedBBoxPoint)(txBBox, tBBox, end);
    // 当加上offset后的bbox有重合，直接简单计算节点
    if ((0, exports.isBboxOverLapping)(sxBBox, txBBox)) {
        var points = (0, exports.getSimplePoints)(start, end, sPoint, tPoint);
        return __spreadArray(__spreadArray([start, sPoint], __read(points), false), [tPoint, end], false);
    }
    var lineBBox = (0, exports.getBBoxOfPoints)([sPoint, tPoint]);
    var sMixBBox = (0, exports.mergeBBox)(sxBBox, lineBBox);
    var tMixBBox = (0, exports.mergeBBox)(txBBox, lineBBox);
    var connectPoints = [];
    connectPoints = connectPoints.concat((0, exports.getPointsFromBBox)(sMixBBox));
    connectPoints = connectPoints.concat((0, exports.getPointsFromBBox)(tMixBBox));
    // 中心点
    var centerPoint = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
    };
    [lineBBox, sMixBBox, tMixBBox].forEach(function (bbox) {
        connectPoints = connectPoints.concat((0, exports.getBBoxCrossPointsByPoint)(bbox, centerPoint).filter(function (p) { return (0, exports.isPointOutsideBBox)(p, sxBBox) && (0, exports.isPointOutsideBBox)(p, txBBox); }));
    });
    [
        {
            x: sPoint.x,
            y: tPoint.y,
        },
        {
            x: tPoint.x,
            y: sPoint.y,
        },
    ].forEach(function (p) {
        if ((0, exports.isPointOutsideBBox)(p, sxBBox) && (0, exports.isPointOutsideBBox)(p, txBBox)) {
            connectPoints.push(p);
        }
    });
    connectPoints.unshift(sPoint);
    connectPoints.push(tPoint);
    connectPoints = (0, exports.filterRepeatPoints)(connectPoints);
    // 路径查找-最关键的步骤
    var pathPoints = (0, exports.pathFinder)(connectPoints, sPoint, tPoint, sBBox, tBBox, start, end);
    pathPoints.unshift(start);
    pathPoints.push(end);
    // 删除一条直线上的多余节点
    if (pathPoints.length > 2) {
        pathPoints = (0, exports.pointFilter)(pathPoints);
    }
    return (0, exports.filterRepeatPoints)(pathPoints);
};
exports.getPolylinePoints = getPolylinePoints;
/**
 * 获取折线中最长的一个线
 * @param pointsList 多个点组成的数组
 */
var getLongestEdge = function (pointsList) {
    if (pointsList.length === 1) {
        var _a = __read(pointsList, 1), point = _a[0];
        return [point, point];
    }
    else {
        var point1 = pointsList[0];
        var point2 = pointsList[1];
        var edgeLength = (0, _1.distance)(point1.x, point1.y, point2.x, point2.y);
        for (var i = 1; i < pointsList.length - 1; i++) {
            var newPoint1 = pointsList[i];
            var newPoint2 = pointsList[i + 1];
            var newEdgeLength = (0, _1.distance)(newPoint1.x, newPoint1.y, newPoint2.x, newPoint2.y);
            if (newEdgeLength > edgeLength) {
                edgeLength = newEdgeLength;
                point1 = newPoint1;
                point2 = newPoint2;
            }
        }
        return [point1, point2];
    }
};
exports.getLongestEdge = getLongestEdge;
/* 线段是否在节点内部，被包含了 */
var isSegmentsInNode = function (start, end, node) {
    var startInNode = (0, _1.isInNode)(start, node);
    var endInNode = (0, _1.isInNode)(end, node);
    return startInNode && endInNode;
};
exports.isSegmentsInNode = isSegmentsInNode;
/* 线段是否与节点相交 */
var isSegmentsCrossNode = function (start, end, node) {
    var startInNode = (0, _1.isInNode)(start, node);
    var endInNode = (0, _1.isInNode)(end, node);
    // bothInNode，线段两个端点都在节点内
    var bothInNode = startInNode && endInNode;
    // cross，线段有端点在节点内
    var inNode = startInNode || endInNode;
    // 有且只有一个点在节点内部
    return !bothInNode && inNode;
};
exports.isSegmentsCrossNode = isSegmentsCrossNode;
/* 获取线段在矩形内部的交点
 */
var getCrossPointInRect = function (start, end, node) {
    var crossSegments = undefined;
    var nodeBox = (0, _1.getNodeBBox)(node);
    var points = (0, exports.getPointsFromBBox)(nodeBox);
    for (var i = 0; i < points.length; i++) {
        var isCross = (0, exports.isSegmentsIntersected)(start, end, points[i], points[(i + 1) % points.length]);
        if (isCross) {
            crossSegments = [points[i], points[(i + 1) % points.length]];
        }
    }
    if (crossSegments) {
        return (0, algorithm_1.getCrossPointOfLine)(start, end, crossSegments[0], crossSegments[1]);
    }
};
exports.getCrossPointInRect = getCrossPointInRect;
/* 判断线段的方向 */
var segmentDirection = function (start, end) {
    var direction = undefined;
    if (start.x === end.x) {
        direction = constant_1.SegmentDirection.VERTICAL;
    }
    else if (start.y === end.y) {
        direction = constant_1.SegmentDirection.HORIZONTAL;
    }
    return direction;
};
exports.segmentDirection = segmentDirection;
var points2PointsList = function (points) {
    var currentPositionList = points.split(' ');
    var pointsList = [];
    currentPositionList &&
        currentPositionList.forEach(function (item) {
            var _a = __read(item.split(','), 2), x = _a[0], y = _a[1];
            pointsList.push({
                x: Number(x),
                y: Number(y),
            });
        });
    return pointsList;
};
exports.points2PointsList = points2PointsList;
/**
 * 当扩展 bbox 重合时的简化拐点计算
 * - 根据起止段的方向（水平/垂直）插入 1~2 个中间点，避免折线重合与穿越
 */
var getSimplePoints = function (start, end, sPoint, tPoint) {
    var points = [];
    // start,sPoint的方向，水平或者垂直，即路径第一条线段的方向
    var startDirection = (0, exports.segmentDirection)(start, sPoint);
    // end,tPoint的方向，水平或者垂直，即路径最后一条条线段的方向
    var endDirection = (0, exports.segmentDirection)(end, tPoint);
    // 根据两条线段的方向作了计算，调整线段经验所得，非严格最优计算，能保证不出现折线
    // 方向相同，添加两个点，两条平行线垂直距离一半的两个端点
    if (startDirection === endDirection) {
        if (start.y === sPoint.y) {
            points.push({
                x: sPoint.x,
                y: (sPoint.y + tPoint.y) / 2,
            });
            points.push({
                x: tPoint.x,
                y: (sPoint.y + tPoint.y) / 2,
            });
        }
        else {
            points.push({
                x: (sPoint.x + tPoint.x) / 2,
                y: sPoint.y,
            });
            points.push({
                x: (sPoint.x + tPoint.x) / 2,
                y: tPoint.y,
            });
        }
    }
    else {
        // 方向不同，添加一个点，保证不在当前线段上(会出现重合)，且不能有折线
        var point = {
            x: sPoint.x,
            y: tPoint.y,
        };
        var inStart = (0, algorithm_1.isInSegment)(point, start, sPoint);
        var inEnd = (0, algorithm_1.isInSegment)(point, end, tPoint);
        if (inStart || inEnd) {
            point = {
                x: tPoint.x,
                y: sPoint.y,
            };
        }
        else {
            var onStart = isOnLine(point, start, sPoint);
            var onEnd = isOnLine(point, end, tPoint);
            if (onStart && onEnd) {
                point = {
                    x: tPoint.x,
                    y: sPoint.y,
                };
            }
        }
        points.push(point);
    }
    return points;
};
exports.getSimplePoints = getSimplePoints;
var isOnLine = function (point, start, end) {
    return (point.x === start.x && point.x === end.x) ||
        (point.y === start.y && point.y === end.y);
};
/* 求字符串的字节长度 */
var getBytesLength = function (word) {
    if (!word) {
        return 0;
    }
    var totalLength = 0;
    for (var i = 0; i < word.length; i++) {
        var c = word.charCodeAt(i);
        if (word.match(/[A-Z]/)) {
            totalLength += 1.5;
        }
        else if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
            totalLength += 1;
        }
        else {
            totalLength += 2;
        }
    }
    return totalLength;
};
exports.getBytesLength = getBytesLength;
/**
 * Uses canvas.measureText to compute
 * and return the width of the given text of given font in pixels.
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor
 * that text is to be rendered with (e.g. "bold 14px verdana").
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
var canvas = undefined;
var getTextWidth = function (text, font) {
    if (!canvas) {
        canvas = document.createElement('canvas');
    }
    var context = canvas.getContext('2d');
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
};
exports.getTextWidth = getTextWidth;
// 扩大边可点区域，获取边append的信息
var getAppendAttributes = function (appendInfo) {
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
        d = "M".concat(startPosition.leftX, " ").concat(startPosition.leftY, "\n    L").concat(startPosition.rightX, " ").concat(startPosition.rightY, "\n    L").concat(endPosition.rightX, " ").concat(endPosition.rightY, "\n    L").concat(endPosition.leftX, " ").concat(endPosition.leftY, " z");
    }
    return {
        d: d,
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 1,
        strokeDasharray: '4, 4',
    };
};
exports.getAppendAttributes = getAppendAttributes;
// bezier曲线
var getBezierControlPoints = function (_a) {
    var start = _a.start, end = _a.end, sourceNode = _a.sourceNode, targetNode = _a.targetNode, offset = _a.offset;
    var sBBox = (0, _1.getNodeBBox)(sourceNode);
    var tBBox = (0, _1.getNodeBBox)(targetNode);
    var sExpendBBox = (0, exports.getExpandedBBox)(sBBox, offset);
    var tExpendBBox = (0, exports.getExpandedBBox)(tBBox, offset);
    var sNext = (0, exports.getExpandedBBoxPoint)(sExpendBBox, sBBox, start);
    var ePre = (0, exports.getExpandedBBoxPoint)(tExpendBBox, tBBox, end);
    return {
        sNext: sNext,
        ePre: ePre,
    };
};
exports.getBezierControlPoints = getBezierControlPoints;
// 根据bezier曲线path求出Points
var getBezierPoints = function (path) {
    var list = path.replace(/M/g, '').replace(/C/g, ',').split(',');
    var start = getBezierPoint(list[0]);
    var sNext = getBezierPoint(list[1]);
    var ePre = getBezierPoint(list[2]);
    var end = getBezierPoint(list[3]);
    return [start, sNext, ePre, end];
};
exports.getBezierPoints = getBezierPoints;
// 根据bezier曲线path求出Point坐标
var getBezierPoint = function (positionStr) {
    var _a = __read(positionStr.replace(/(^\s*)/g, '').split(' '), 2), x = _a[0], y = _a[1];
    return {
        x: +x,
        y: +y,
    };
};
// 根据bezier曲线path求出结束切线的两点坐标
var getEndTangent = function (pointsList, offset) {
    // const bezierPoints = getBezierPoints(path)
    var _a = __read(pointsList, 4), p1 = _a[0], cp1 = _a[1], cp2 = _a[2], p2 = _a[3];
    var start = (0, _1.sampleCubic)(p1, cp1, cp2, p2, offset);
    return [start, pointsList[3]];
};
exports.getEndTangent = getEndTangent;
/**
 * 获取移动边后，文本位置距离边上的最近的一点
 * @param point 边上文本的位置
 * @param points 边的各个拐点
 * TODO: Label实验没问题后统一改成新的计算方式，把这个方法废弃
 */
var getClosestPointOfPolyline = function (point, points) {
    var x = point.x, y = point.y;
    var pointsPosition = (0, exports.points2PointsList)(points);
    var minDistance = Number.MAX_SAFE_INTEGER;
    var crossPoint;
    var segments = [];
    for (var i = 0; i < pointsPosition.length; i++) {
        segments.push({
            start: pointsPosition[i],
            end: pointsPosition[(i + 1) % pointsPosition.length],
        });
    }
    segments.forEach(function (item) {
        var start = item.start, end = item.end;
        // 若线段垂直，则crossPoint的横坐标与线段一致
        if (start.x === end.x) {
            var pointXY = {
                x: start.x,
                y: y,
            };
            var inSegment = (0, algorithm_1.isInSegment)(pointXY, start, end);
            if (inSegment) {
                var currentDistance = Math.abs(start.x - x);
                if (currentDistance < minDistance) {
                    minDistance = currentDistance;
                    crossPoint = pointXY;
                }
            }
        }
        else if (start.y === end.y) {
            var pointXY = {
                x: x,
                y: start.y,
            };
            var inSegment = (0, algorithm_1.isInSegment)(pointXY, start, end);
            if (inSegment) {
                var currentDistance = Math.abs(start.y - y);
                if (currentDistance < minDistance) {
                    minDistance = currentDistance;
                    crossPoint = pointXY;
                }
            }
        }
    });
    // 边界：只有一条线段时，沿线段移动节点，当文本超出边后，文本没有可供参考的线段
    if (!crossPoint) {
        var _a = segments[0], start = _a.start, end = _a.end;
        crossPoint = {
            x: start.x + (end.x - start.x) / 2,
            y: start.y + (end.y - start.y) / 2,
        };
    }
    return crossPoint;
};
exports.getClosestPointOfPolyline = getClosestPointOfPolyline;
// 规范边初始化数据
var pickEdgeConfig = function (data) {
    return (0, lodash_es_1.pick)(data, [
        'id',
        'type',
        'sourceNodeId',
        'sourceAnchorId',
        'targetNodeId',
        'targetAnchorId',
        'pointsList',
        'startPoint',
        'endPoint',
        'properties',
    ]);
};
exports.pickEdgeConfig = pickEdgeConfig;
var twoPointDistance = function (source, target) {
    // fix: 修复坐标存在负值时计算错误的问题。
    // const source = {
    //   x: p1.x,
    //   y: Math.abs(p1.y),
    // }
    // const target = {
    //   x: Math.abs(p2.x),
    //   y: Math.abs(p2.y),
    // }
    return Math.sqrt(Math.pow((source.x - target.x), 2) + Math.pow((source.y - target.y), 2));
};
exports.twoPointDistance = twoPointDistance;
/**
 * 包装边生成函数
 * @param graphModel graph model
 * @param generator 用户自定义的边生成函数
 */
function createEdgeGenerator(graphModel, generator) {
    // TODO: 定义返回值类型，保证 GraphModel 中类型的正确性
    if (typeof generator !== 'function') {
        return function (_sourceNode, _targetNode, currentEdge) { return Object.assign({ type: graphModel.edgeType }, currentEdge); };
    }
    return function (sourceNode, targetNode, currentEdge) {
        var result = generator(sourceNode, targetNode, currentEdge);
        // 无结果使用默认类型
        if (!result)
            return { type: graphModel.edgeType };
        if (typeof result === 'string') {
            return Object.assign({}, currentEdge, { type: result });
        }
        return Object.assign({ type: result }, currentEdge);
    };
}
exports.createEdgeGenerator = createEdgeGenerator;
var getSvgTextSize = function (_a) {
    var rows = _a.rows, rowsLength = _a.rowsLength, fontSize = _a.fontSize;
    var longestBytes = 0;
    (0, lodash_es_1.forEach)(rows, function (row) {
        var rowBytesLength = (0, exports.getBytesLength)(row);
        longestBytes = rowBytesLength > longestBytes ? rowBytesLength : longestBytes;
    });
    // 背景框宽度，最长一行字节数/2 * fontsize + 2
    // 背景框宽度， 行数 * fontsize + 2
    return {
        width: Math.ceil(longestBytes / 2) * fontSize + fontSize / 4,
        height: rowsLength * (fontSize + 2) + fontSize / 4,
    };
};
exports.getSvgTextSize = getSvgTextSize;
