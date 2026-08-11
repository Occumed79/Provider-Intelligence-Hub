"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerticalPointOfLine = void 0;
// 各类算法的实现
__exportStar(require("./outline"), exports);
__exportStar(require("./edge"), exports);
/*
 * 计算垂直边的与起始点有一定距离对称，边垂直于边的点
 * 调用方：计算箭头位置，计算扩大变得点击区域
 */
var getVerticalPointOfLine = function (config) {
    /*
     ** offset: 端点到垂直点的距离
     ** verticalLength: 两边点到垂直点的距离
     ** type: 标识求的是线段的开始端点/结束端点
     */
    var start = config.start, end = config.end, offset = config.offset, verticalLength = config.verticalLength, type = config.type;
    var pointPosition = {
        leftX: 0,
        leftY: 0,
        rightX: 0,
        rightY: 0,
    };
    // // 边与水平线的夹角
    var angleOfHorizontal = Math.atan((end.y - start.y) / (end.x - start.x));
    // 边和两边点的夹角
    var angleOfPoints = Math.atan(offset / verticalLength);
    // 点到起点的距离
    var len = Math.sqrt(verticalLength * verticalLength + offset * offset);
    if (type === 'start') {
        if (end.x >= start.x) {
            pointPosition.leftX =
                start.x + len * Math.sin(angleOfHorizontal + angleOfPoints);
            pointPosition.leftY =
                start.y - len * Math.cos(angleOfHorizontal + angleOfPoints);
            pointPosition.rightX =
                start.x - len * Math.sin(angleOfHorizontal - angleOfPoints);
            pointPosition.rightY =
                start.y + len * Math.cos(angleOfHorizontal - angleOfPoints);
        }
        else {
            pointPosition.leftX =
                start.x - len * Math.sin(angleOfHorizontal + angleOfPoints);
            pointPosition.leftY =
                start.y + len * Math.cos(angleOfHorizontal + angleOfPoints);
            pointPosition.rightX =
                start.x + len * Math.sin(angleOfHorizontal - angleOfPoints);
            pointPosition.rightY =
                start.y - len * Math.cos(angleOfHorizontal - angleOfPoints);
        }
    }
    else if (type === 'end') {
        if (end.x >= start.x) {
            pointPosition.leftX =
                end.x + len * Math.sin(angleOfHorizontal - angleOfPoints);
            pointPosition.leftY =
                end.y - len * Math.cos(angleOfHorizontal - angleOfPoints);
            pointPosition.rightX =
                end.x - len * Math.sin(angleOfHorizontal + angleOfPoints);
            pointPosition.rightY =
                end.y + len * Math.cos(angleOfHorizontal + angleOfPoints);
        }
        else {
            pointPosition.leftX =
                end.x - len * Math.sin(angleOfHorizontal - angleOfPoints);
            pointPosition.leftY =
                end.y + len * Math.cos(angleOfHorizontal - angleOfPoints);
            pointPosition.rightX =
                end.x + len * Math.sin(angleOfHorizontal + angleOfPoints);
            pointPosition.rightY =
                end.y - len * Math.cos(angleOfHorizontal + angleOfPoints);
        }
    }
    return pointPosition;
};
exports.getVerticalPointOfLine = getVerticalPointOfLine;
