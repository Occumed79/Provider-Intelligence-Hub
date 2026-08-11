"use strict";
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
exports.generateRoundedCorners = exports.normalizePolygon = exports.getGridOffset = exports.snapToGrid = void 0;
function snapToGrid(point, gridSize, snapGrid) {
    // 开启节网格对齐时才根据网格尺寸校准坐标
    if (!snapGrid)
        return point;
    // 保证 x, y 的值为 gridSize 的整数倍
    return gridSize * Math.round(point / gridSize) || point;
}
exports.snapToGrid = snapToGrid;
// 获取节点偏移时，产生的偏移量。当节点基于gridSize进行了偏移后，
// 节点上的文本可以基于此方法移动对应的距离来保持与节点相对位置不变。
function getGridOffset(distance, gridSize) {
    return distance % gridSize;
}
exports.getGridOffset = getGridOffset;
/**
 * 多边形设置 points 后，坐标平移至原点 并 根据 width、height 缩放
 * @param points
 * @param width
 * @param height
 */
function normalizePolygon(points, width, height) {
    if (!points)
        return [];
    // 计算边界框
    var minX = Math.min.apply(Math, __spreadArray([], __read(points.map(function (p) { return p[0]; })), false));
    var maxX = Math.max.apply(Math, __spreadArray([], __read(points.map(function (p) { return p[0]; })), false));
    var minY = Math.min.apply(Math, __spreadArray([], __read(points.map(function (p) { return p[1]; })), false));
    var maxY = Math.max.apply(Math, __spreadArray([], __read(points.map(function (p) { return p[1]; })), false));
    // 平移至原点
    var dx = -minX;
    var dy = -minY;
    var translatedPoints = points.map(function (_a) {
        var _b = __read(_a, 2), x = _b[0], y = _b[1];
        return [
            x + dx,
            y + dy,
        ];
    });
    // 计算边界框的宽度和高度
    var bboxWidth = maxX - minX;
    var bboxHeight = maxY - minY;
    // 计算缩放因子
    var scaleX = width ? width / bboxWidth : 1;
    var scaleY = height ? height / bboxHeight : 1;
    var scaleFactor = Math.min(scaleX, scaleY);
    // 缩放顶点
    return translatedPoints.map(function (_a) {
        var _b = __read(_a, 2), x = _b[0], y = _b[1];
        return [x * scaleFactor, y * scaleFactor];
    });
}
exports.normalizePolygon = normalizePolygon;
/**
 * 通用圆角生成：为菱形、多边形、折线在转折处生成与矩形视觉一致的圆角
 * - 圆角基于角平分线，切点距顶点的距离 t = r * tan(theta/2)
 * - 半径会根据相邻边长度进行钳制，避免超过边长造成断裂
 * - 多边形/菱形保持闭合；折线保持开口
 */
var generateRoundedCorners = function (points, radius, isClosedShape) {
    var n = points.length;
    if (n < 2 || radius <= 0)
        return points.slice();
    var toVec = function (a, b) { return ({ x: b.x - a.x, y: b.y - a.y }); };
    var len = function (v) { return Math.hypot(v.x, v.y); };
    var norm = function (v) {
        var l = len(v) || 1;
        return { x: v.x / l, y: v.y / l };
    };
    var result = [];
    // 用二次贝塞尔近似圆角，控制点取角点，避免复杂圆心计算
    var makeRoundCorner = function (prev, curr, next) {
        var vPrev = toVec(curr, prev);
        var vNext = toVec(curr, next);
        var dPrev = len(vPrev);
        var dNext = len(vNext);
        if (dPrev < 1e-6 || dNext < 1e-6)
            return [curr];
        var uPrev = norm(vPrev);
        var uNext = norm(vNext);
        var t = Math.min(radius, dPrev * 0.45, dNext * 0.45);
        var start = { x: curr.x + uPrev.x * t, y: curr.y + uPrev.y * t };
        var end = { x: curr.x + uNext.x * t, y: curr.y + uNext.y * t };
        // 二次贝塞尔采样：B(s) = (1-s)^2*start + 2(1-s)s*curr + s^2*end
        var steps = 10; // 3段近似，简洁且效果稳定
        var pts = [start];
        for (var k = 1; k < steps; k++) {
            var s = k / steps;
            var a = 1 - s;
            pts.push({
                x: a * a * start.x + 2 * a * s * curr.x + s * s * end.x,
                y: a * a * start.y + 2 * a * s * curr.y + s * s * end.y,
            });
        }
        pts.push(end);
        return pts;
    };
    for (var i = 0; i < n; i++) {
        var prevIdx = i === 0 ? (isClosedShape ? n - 1 : 0) : i - 1;
        var nextIdx = i === n - 1 ? (isClosedShape ? 0 : n - 1) : i + 1;
        var prev = points[prevIdx];
        var curr = points[i];
        var next = points[nextIdx];
        var isEndpoint = !isClosedShape && (i === 0 || i === n - 1);
        if (isEndpoint) {
            // 折线两端不处理圆角
            result.push(curr);
        }
        else {
            var arc = makeRoundCorner(prev, curr, next);
            arc.forEach(function (p) { return result.push(p); });
        }
    }
    // 去重处理：避免连续重复点
    var dedup = [];
    for (var i = 0; i < result.length; i++) {
        var p = result[i];
        if (dedup.length === 0 ||
            Math.hypot(p.x - dedup[dedup.length - 1].x, p.y - dedup[dedup.length - 1].y) > 1e-6) {
            dedup.push(p);
        }
    }
    // 闭合图形：确保首尾不重复闭合
    if (isClosedShape && dedup.length > 1) {
        var first = dedup[0];
        var last = dedup[dedup.length - 1];
        if (Math.hypot(first.x - last.x, first.y - last.y) < 1e-6) {
            dedup.pop();
        }
    }
    return dedup;
};
exports.generateRoundedCorners = generateRoundedCorners;
