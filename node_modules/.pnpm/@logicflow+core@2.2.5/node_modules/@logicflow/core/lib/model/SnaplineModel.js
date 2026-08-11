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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnaplineModel = void 0;
var mobx_1 = require("mobx");
var util_1 = require("../util");
var SnaplineModel = /** @class */ (function () {
    function SnaplineModel(graphModel, epsilon) {
        if (epsilon === void 0) { epsilon = 1; }
        this.isShowHorizontal = false;
        this.isShowVertical = false;
        this.position = {
            x: 0,
            y: 0,
        };
        this.graphModel = graphModel;
        this.epsilon = epsilon;
    }
    SnaplineModel.prototype.getStyle = function () {
        return __assign({}, this.graphModel.theme.snapline);
    };
    // 计算节点中心线与其他节点的对齐信息
    SnaplineModel.prototype.getCenterSnapLine = function (draggingNode, nodes) {
        var x = draggingNode.x, y = draggingNode.y;
        var isShowVertical = false;
        var isShowHorizontal = false;
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            // 排除当前节点
            if (item.id !== draggingNode.id) {
                if (equal(x, item.x, this.epsilon)) {
                    isShowVertical = true;
                }
                if (equal(y, item.y, this.epsilon)) {
                    isShowHorizontal = true;
                }
                // 如果水平垂直都显示，则停止循环。减少不必要的遍历
                if (isShowVertical && isShowHorizontal) {
                    break;
                }
            }
        }
        return {
            isShowVertical: isShowVertical,
            isShowHorizontal: isShowHorizontal,
            position: {
                x: x,
                y: y,
            },
        };
    };
    // 计算节点上下边框与其他节点的上下边框的对齐信息
    SnaplineModel.prototype.getHorizontalSnapline = function (draggingNode, nodes) {
        var isShowHorizontal = false;
        var horizontalY = 0;
        var id = draggingNode.id;
        var draggingData;
        if (id) {
            var fakeNode = this.graphModel.fakeNode;
            if (fakeNode && fakeNode.id === id) {
                draggingData = (0, util_1.getNodeBBox)(fakeNode);
            }
            else {
                var nodeModel = this.graphModel.getNodeModelById(id);
                if (nodeModel) {
                    draggingData = (0, util_1.getNodeBBox)(nodeModel);
                }
            }
        }
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            // 排除当前节点
            if (item.id !== draggingNode.id) {
                var itemData = (0, util_1.getNodeBBox)(item);
                // 如果节点的最大最小Y轴坐标与节点的最大最小Y轴坐标相等，展示水平线
                if (equal(itemData.minY, draggingData === null || draggingData === void 0 ? void 0 : draggingData.minY, this.epsilon) ||
                    equal(itemData.maxY, draggingData === null || draggingData === void 0 ? void 0 : draggingData.minY, this.epsilon)) {
                    // 找到则停止循环。减少不必要的遍历
                    isShowHorizontal = true;
                    horizontalY = draggingData.minY;
                    break;
                }
                if (equal(itemData.minY, draggingData === null || draggingData === void 0 ? void 0 : draggingData.maxY, this.epsilon) ||
                    equal(itemData.maxY, draggingData === null || draggingData === void 0 ? void 0 : draggingData.maxY, this.epsilon)) {
                    isShowHorizontal = true;
                    horizontalY = draggingData.maxY;
                    break;
                }
            }
        }
        return {
            isShowHorizontal: isShowHorizontal,
            isShowVertical: this.isShowVertical,
            position: __assign(__assign({}, this.position), { y: horizontalY }),
        };
    };
    // 计算节点左右边框与其他节点的左右边框的对齐信息
    SnaplineModel.prototype.getVerticalSnapline = function (draggingNode, nodes) {
        var isShowVertical = false;
        var verticalX = 0;
        var id = draggingNode.id;
        var draggingData;
        if (id) {
            var fakeNode = this.graphModel.fakeNode;
            if (fakeNode && fakeNode.id === id) {
                draggingData = (0, util_1.getNodeBBox)(fakeNode);
            }
            else {
                var nodeModel = this.graphModel.getNodeModelById(id);
                if (nodeModel) {
                    draggingData = (0, util_1.getNodeBBox)(nodeModel);
                }
            }
        }
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            // 排除当前节点
            if (item.id !== draggingNode.id) {
                var itemData = (0, util_1.getNodeBBox)(item);
                // 如果节点的最大最小X轴坐标与节点的最大最小X轴坐标相等，展示垂直线
                if (equal(itemData.minX, draggingData === null || draggingData === void 0 ? void 0 : draggingData.minX, this.epsilon)) {
                    isShowVertical = true;
                    verticalX = draggingData.minX;
                    break;
                }
                if (equal(itemData.minX, draggingData === null || draggingData === void 0 ? void 0 : draggingData.minX, this.epsilon) ||
                    equal(itemData.maxX, draggingData === null || draggingData === void 0 ? void 0 : draggingData.minX, this.epsilon)) {
                    // 找到则停止循环。减少不必要的遍历
                    isShowVertical = true;
                    verticalX = draggingData.minX;
                    break;
                }
                if (equal(itemData.minX, draggingData === null || draggingData === void 0 ? void 0 : draggingData.maxX, this.epsilon) ||
                    equal(itemData.maxX, draggingData === null || draggingData === void 0 ? void 0 : draggingData.maxX, this.epsilon)) {
                    isShowVertical = true;
                    verticalX = draggingData.maxX;
                    break;
                }
            }
        }
        return {
            isShowHorizontal: this.isShowHorizontal,
            isShowVertical: isShowVertical,
            position: __assign(__assign({}, this.position), { x: verticalX }),
        };
    };
    // 计算节点与其他节点的对齐信息
    SnaplineModel.prototype.getSnapLinePosition = function (draggingNode, nodes) {
        var snaplineInfo = this.getCenterSnapLine(draggingNode, nodes);
        var isShowHorizontal = snaplineInfo.isShowHorizontal, isShowVertical = snaplineInfo.isShowVertical;
        // 中心对齐优先级最高
        // 如果没有中心坐标的水平对齐，计算上下边框的对齐
        if (!isShowHorizontal) {
            var horizontalSnapline = this.getHorizontalSnapline(draggingNode, nodes);
            if (horizontalSnapline.isShowHorizontal) {
                snaplineInfo.isShowHorizontal = horizontalSnapline.isShowHorizontal;
                snaplineInfo.position.y = horizontalSnapline.position.y;
            }
        }
        // 如果没有中心坐标的垂直对齐，计算左右边框的对齐
        if (!isShowVertical) {
            var verticalSnapline = this.getVerticalSnapline(draggingNode, nodes);
            if (verticalSnapline.isShowVertical) {
                snaplineInfo.isShowVertical = verticalSnapline.isShowVertical;
                snaplineInfo.position.x = verticalSnapline.position.x;
            }
        }
        return snaplineInfo;
    };
    // 设置对齐信息
    SnaplineModel.prototype.setSnaplineInfo = function (snaplineInfo) {
        var isShowHorizontal = snaplineInfo.isShowHorizontal, isShowVertical = snaplineInfo.isShowVertical, position = snaplineInfo.position;
        this.position = position;
        this.isShowHorizontal = isShowHorizontal;
        this.isShowVertical = isShowVertical;
    };
    // 清空对齐信息，对齐线消失
    SnaplineModel.prototype.clearSnapline = function () {
        this.position = {
            x: 0,
            y: 0,
        };
        this.isShowHorizontal = false;
        this.isShowVertical = false;
    };
    // 设置节点对齐线
    SnaplineModel.prototype.setNodeSnapLine = function (nodeData) {
        var nodes = this.graphModel.nodes;
        var info = this.getSnapLinePosition(nodeData, nodes);
        this.setSnaplineInfo(info);
    };
    __decorate([
        mobx_1.observable
    ], SnaplineModel.prototype, "isShowHorizontal", void 0);
    __decorate([
        mobx_1.observable
    ], SnaplineModel.prototype, "isShowVertical", void 0);
    __decorate([
        mobx_1.observable
    ], SnaplineModel.prototype, "position", void 0);
    __decorate([
        mobx_1.action
    ], SnaplineModel.prototype, "clearSnapline", null);
    __decorate([
        mobx_1.action
    ], SnaplineModel.prototype, "setNodeSnapLine", null);
    return SnaplineModel;
}());
exports.SnaplineModel = SnaplineModel;
function equal(num1, num2, epsilon) {
    if (Math.abs(num1 - num2) <= epsilon) {
        return true;
    }
    else {
        return false;
    }
}
exports.default = SnaplineModel;
