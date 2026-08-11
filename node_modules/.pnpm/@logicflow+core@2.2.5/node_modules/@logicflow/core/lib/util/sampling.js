"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.degrees = exports.getThetaOfVector = exports.sampleCubic = void 0;
var node_1 = require("./node");
var SAMPLING_FREQUENCY = 100;
var normal = {
    x: 1,
    y: 0,
    z: 0,
};
// 采样三次贝塞尔曲线上的点, 假设采样频率为SAMPLING_FREQUENCY, 取倒数第1-6/SAMPLING_FREQUENCY个点即t=1-6/SAMPLING_FREQUENCY
function sampleCubic(p1, cp1, cp2, p2, offset) {
    var program = function (t) {
        if (t < 0 || t > 1) {
            throw new RangeError('The value range of parameter "t" is [0,1]');
        }
        return {
            x: p1.x * Math.pow((1 - t), 3) +
                3 * cp1.x * t * Math.pow((1 - t), 2) +
                3 * cp2.x * Math.pow(t, 2) * (1 - t) +
                p2.x * Math.pow(t, 3),
            y: p1.y * Math.pow((1 - t), 3) +
                3 * cp1.y * t * Math.pow((1 - t), 2) +
                3 * cp2.y * Math.pow(t, 2) * (1 - t) +
                p2.y * Math.pow(t, 3),
        };
    };
    // fix: https://github.com/didi/LogicFlow/issues/951
    // 计算贝塞尔曲线上与终点距离为offset的点，作为箭头的的垂点。
    var arrowDistance = 0;
    var t = 2;
    var x1 = p2.x, y1 = p2.y;
    var point = p2;
    while (arrowDistance < offset && t < 50) {
        point = program(1 - t / SAMPLING_FREQUENCY);
        var x2 = point.x, y2 = point.y;
        arrowDistance = (0, node_1.distance)(x1, y1, x2, y2);
        t++;
    }
    return point;
}
exports.sampleCubic = sampleCubic;
function crossByZ(v, v1) {
    return v.x * v1.y - v.y * v1.x;
}
function dot(v, w) {
    var v1 = [v.x, v.y, v.z];
    var v2 = [w.x, w.y, w.z];
    return v2.reduce(function (prev, cur, index) { return prev + cur * v1[index]; });
}
function angle(v1, v2) {
    var negative = crossByZ(v1, v2);
    var r = Math.acos(dot(normalize(v1), normalize(v2)));
    return negative >= 0 ? r : -r;
}
function normalize(v) {
    var len = Math.hypot(v.x, v.y);
    return {
        x: v.x / len,
        y: v.y / len,
        z: 0,
    };
}
function getThetaOfVector(v) {
    return angle(normal, v);
}
exports.getThetaOfVector = getThetaOfVector;
function degrees(radians) {
    return radians * (180 / Math.PI);
}
exports.degrees = degrees;
