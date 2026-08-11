"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResize = exports.triggerResizeEvent = exports.updateEdgePointByAnchors = exports.recalcResizeInfo = exports.calculateWidthAndHeight = void 0;
var Control_1 = require("../view/Control");
var lodash_es_1 = require("lodash-es");
var constant_1 = require("../constant");
var rotate_1 = require("../algorithm/rotate");
function calculateWidthAndHeight(startRotatedTouchControlPoint, endRotatedTouchControlPoint, oldCenter, angle, freezeWidth, freezeHeight, oldWidth, oldHeight) {
    if (freezeWidth === void 0) { freezeWidth = false; }
    if (freezeHeight === void 0) { freezeHeight = false; }
    // 假设目前触摸的是右下角的control点
    // 计算出来左上角的control坐标，resize过程左上角的control坐标保持不变
    var freezePoint = {
        x: oldCenter.x - (startRotatedTouchControlPoint.x - oldCenter.x),
        y: oldCenter.y - (startRotatedTouchControlPoint.y - oldCenter.y),
    };
    // 【touchEndPoint】右下角 + freezePoint左上角 计算出新的中心点
    var newCenter = (0, rotate_1.getNewCenter)(freezePoint, endRotatedTouchControlPoint);
    // 得到【touchEndPoint】右下角-没有transform的坐标
    var endZeroTouchControlPoint = (0, rotate_1.calculatePointAfterRotateAngle)(endRotatedTouchControlPoint, newCenter, -angle);
    // ---------- 使用transform之前的坐标计算出新的width和height ----------
    // 得到左上角---没有transform的坐标
    var zeroFreezePoint = (0, rotate_1.calculatePointAfterRotateAngle)(freezePoint, newCenter, -angle);
    if (freezeWidth) {
        // 如果固定width，那么不能单纯使用endZeroTouchControlPoint.x=startZeroTouchControlPoint.x
        // 因为去掉transform的左上角不一定是重合的，我们要保证的是transform后的左上角重合
        var newWidth = Math.abs(endZeroTouchControlPoint.x - zeroFreezePoint.x);
        var widthDx = newWidth - oldWidth;
        // 点击的是左边锚点，是+widthDx/2，点击是右边锚点，是-widthDx/2
        if (newCenter.x > endZeroTouchControlPoint.x) {
            // 当前触摸的是左边锚点
            newCenter.x = newCenter.x + widthDx / 2;
        }
        else {
            // 当前触摸的是右边锚点
            newCenter.x = newCenter.x - widthDx / 2;
        }
    }
    if (freezeHeight) {
        var newHeight = Math.abs(endZeroTouchControlPoint.y - zeroFreezePoint.y);
        var heightDy = newHeight - oldHeight;
        if (newCenter.y > endZeroTouchControlPoint.y) {
            // 当前触摸的是上边锚点
            newCenter.y = newCenter.y + heightDy / 2;
        }
        else {
            newCenter.y = newCenter.y - heightDy / 2;
        }
    }
    if (freezeWidth || freezeHeight) {
        // 如果调整过transform之前的坐标，那么transform后的坐标也会改变，那么算出来的newCenter也得调整
        // 由于无论如何rotate，中心点都是不变的，因此我们可以使用transform之前的坐标算出新的中心点
        var nowFreezePoint = (0, rotate_1.calculatePointAfterRotateAngle)(zeroFreezePoint, newCenter, angle);
        // 得到当前新rect的左上角与实际上transform后的左上角的偏移量
        var dx = nowFreezePoint.x - freezePoint.x;
        var dy = nowFreezePoint.y - freezePoint.y;
        // 修正不使用transform的坐标: 左上角、右下角、center
        newCenter.x = newCenter.x - dx;
        newCenter.y = newCenter.y - dy;
        zeroFreezePoint = (0, rotate_1.calculatePointAfterRotateAngle)(freezePoint, newCenter, -angle);
        endZeroTouchControlPoint = {
            x: newCenter.x - (zeroFreezePoint.x - newCenter.x),
            y: newCenter.y - (zeroFreezePoint.y - newCenter.y),
        };
    }
    // transform之前的坐标的左上角+右下角计算出宽度和高度
    var width = Math.abs(endZeroTouchControlPoint.x - zeroFreezePoint.x);
    var height = Math.abs(endZeroTouchControlPoint.y - zeroFreezePoint.y);
    // ---------- 使用transform之前的坐标计算出新的width和height ----------
    if (freezeWidth) {
        // 理论计算出来的width应该等于oldWidth
        // 但是有误差，比如oldWidth = 100; newWidth=100.000000000001
        // 会在handleResize()限制放大缩小的最大最小范围中被阻止滑动
        width = oldWidth;
    }
    if (freezeHeight) {
        height = oldHeight;
    }
    return {
        width: width,
        height: height,
        center: newCenter,
    };
}
exports.calculateWidthAndHeight = calculateWidthAndHeight;
function recalcRotatedResizeInfo(pct, resizeInfo, rotate, controlX, controlY, oldCenterX, oldCenterY, freezeWidth, freezeHeight) {
    if (freezeWidth === void 0) { freezeWidth = false; }
    if (freezeHeight === void 0) { freezeHeight = false; }
    // 假设我们触摸的点是右下角的control
    var deltaX = resizeInfo.deltaX, deltaY = resizeInfo.deltaY, oldWidth = resizeInfo.width, oldHeight = resizeInfo.height;
    var angle = (0, rotate_1.radianToAngle)(rotate);
    // 右下角的control
    var startZeroTouchControlPoint = {
        x: controlX, // control锚点的坐标x
        y: controlY, // control锚点的坐标y
    };
    var oldCenter = { x: oldCenterX, y: oldCenterY };
    // 右下角的control坐标（transform后的-touchStartPoint）
    var startRotatedTouchControlPoint = (0, rotate_1.calculatePointAfterRotateAngle)(startZeroTouchControlPoint, oldCenter, angle);
    // 右下角的control坐标（transform后的-touchEndPoint）
    var endRotatedTouchControlPoint = {
        x: startRotatedTouchControlPoint.x + deltaX,
        y: startRotatedTouchControlPoint.y + deltaY,
    };
    // 计算出新的宽度和高度以及新的中心点
    var _a = calculateWidthAndHeight(startRotatedTouchControlPoint, endRotatedTouchControlPoint, oldCenter, angle, freezeWidth, freezeHeight, oldWidth, oldHeight), newWidth = _a.width, newHeight = _a.height, newCenter = _a.center;
    // calculateWidthAndHeight()得到的是整个宽度，比如圆pct=0.5,此时newWidth等于整个圆直径
    resizeInfo.width = newWidth * pct;
    resizeInfo.height = newHeight * pct;
    // BaseNodeModel.resize(deltaX/2, deltaY/2)，因此这里要*2
    resizeInfo.deltaX = (newCenter.x - oldCenter.x) * 2;
    resizeInfo.deltaY = (newCenter.y - oldCenter.y) * 2;
    return resizeInfo;
}
/**
 * 计算 Control 拖动后，节点的高度信息
 * @param index
 * @param resizeInfo
 * @param pct
 * @param freezeWidth
 * @param freezeHeight
 */
var recalcResizeInfo = function (index, resizeInfo, pct, freezeWidth, freezeHeight, rotate, controlX, controlY, oldCenterX, oldCenterY, forceProportional) {
    if (pct === void 0) { pct = 1; }
    if (freezeWidth === void 0) { freezeWidth = false; }
    if (freezeHeight === void 0) { freezeHeight = false; }
    if (rotate === void 0) { rotate = 0; }
    if (forceProportional === void 0) { forceProportional = false; }
    var nextResizeInfo = (0, lodash_es_1.cloneDeep)(resizeInfo);
    var deltaX = nextResizeInfo.deltaX, deltaY = nextResizeInfo.deltaY;
    var width = nextResizeInfo.width, height = nextResizeInfo.height, PCTResizeInfo = nextResizeInfo.PCTResizeInfo;
    if (PCTResizeInfo) {
        var sensitivity = 4; // 越低越灵敏
        var deltaScale = 0;
        var combineDelta = 0;
        switch (index) {
            case Control_1.ResizeControlIndex.LEFT_TOP:
                combineDelta = (deltaX * -1 - deltaY) / sensitivity;
                break;
            case Control_1.ResizeControlIndex.RIGHT_TOP:
                combineDelta = (deltaX - deltaY) / sensitivity;
                break;
            case Control_1.ResizeControlIndex.RIGHT_BOTTOM:
                combineDelta = (deltaX + deltaY) / sensitivity;
                break;
            case Control_1.ResizeControlIndex.LEFT_BOTTOM:
                combineDelta = (deltaX * -1 + deltaY) / sensitivity;
                break;
            default:
                break;
        }
        if (combineDelta !== 0) {
            deltaScale =
                Math.round((combineDelta / PCTResizeInfo.ResizeBasis.basisHeight) * 100000) / 1000;
        }
        PCTResizeInfo.ResizePCT.widthPCT = Math.max(Math.min(PCTResizeInfo.ResizePCT.widthPCT + deltaScale, PCTResizeInfo.ScaleLimit.maxScaleLimit), PCTResizeInfo.ScaleLimit.minScaleLimit);
        PCTResizeInfo.ResizePCT.heightPCT = Math.max(Math.min(PCTResizeInfo.ResizePCT.heightPCT + deltaScale, PCTResizeInfo.ScaleLimit.maxScaleLimit), PCTResizeInfo.ScaleLimit.minScaleLimit);
        var spcWidth = Math.round((PCTResizeInfo.ResizePCT.widthPCT *
            PCTResizeInfo.ResizeBasis.basisWidth) /
            100);
        var spcHeight = Math.round((PCTResizeInfo.ResizePCT.heightPCT *
            PCTResizeInfo.ResizeBasis.basisHeight) /
            100);
        switch (index) {
            case Control_1.ResizeControlIndex.LEFT_TOP:
                deltaX = width - spcWidth;
                deltaY = height - spcHeight;
                break;
            case Control_1.ResizeControlIndex.RIGHT_TOP:
                deltaX = spcWidth - width;
                deltaY = height - spcHeight;
                break;
            case Control_1.ResizeControlIndex.RIGHT_BOTTOM:
                deltaX = spcWidth - width;
                deltaY = spcHeight - height;
                break;
            case Control_1.ResizeControlIndex.LEFT_BOTTOM:
                deltaX = width - spcWidth;
                deltaY = spcHeight - height;
                break;
            default:
                break;
        }
        return nextResizeInfo;
    }
    if (rotate % (2 * Math.PI) !== 0 &&
        controlX !== undefined &&
        controlY !== undefined) {
        // 角度rotate不为0，则触发另外的计算修正resize的deltaX和deltaY
        // 因为rotate不为0的时候，左上角的坐标一直在变化
        // 角度rotate不为0得到的resizeInfo.deltaX仅仅代表中心点的变化，而不是宽度的变化
        return recalcRotatedResizeInfo(pct, nextResizeInfo, rotate, controlX, controlY, oldCenterX, oldCenterY, freezeWidth, freezeHeight);
    }
    //Shift键等比缩放逻辑
    if (forceProportional) {
        // 计算当前的宽高比
        var aspectRatio = width / height;
        // 根据拖拽方向确定主要的缩放参考
        var primaryDelta = 0;
        var newWidth = width;
        var newHeight = height;
        switch (index) {
            case Control_1.ResizeControlIndex.LEFT_TOP:
                // 取绝对值较大的delta作为主要缩放参考
                primaryDelta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : -deltaY;
                if (aspectRatio >= 1) {
                    // 宽度大于等于高度，以宽度为基准
                    newWidth = width + primaryDelta;
                    newHeight = newWidth / aspectRatio;
                }
                else {
                    // 高度大于宽度，以高度为基准
                    newHeight = height + primaryDelta;
                    newWidth = newHeight * aspectRatio;
                }
                nextResizeInfo.width = newWidth;
                nextResizeInfo.height = newHeight;
                nextResizeInfo.deltaX = width - newWidth;
                nextResizeInfo.deltaY = height - newHeight;
                break;
            case Control_1.ResizeControlIndex.RIGHT_TOP:
                primaryDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : -deltaY;
                if (aspectRatio >= 1) {
                    newWidth = width + primaryDelta;
                    newHeight = newWidth / aspectRatio;
                }
                else {
                    newHeight = height - primaryDelta;
                    newWidth = newHeight * aspectRatio;
                }
                nextResizeInfo.width = newWidth;
                nextResizeInfo.height = newHeight;
                nextResizeInfo.deltaX = newWidth - width;
                nextResizeInfo.deltaY = height - newHeight;
                break;
            case Control_1.ResizeControlIndex.RIGHT_BOTTOM:
                primaryDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                if (aspectRatio >= 1) {
                    newWidth = width + primaryDelta;
                    newHeight = newWidth / aspectRatio;
                }
                else {
                    newHeight = height + primaryDelta;
                    newWidth = newHeight * aspectRatio;
                }
                nextResizeInfo.width = newWidth;
                nextResizeInfo.height = newHeight;
                nextResizeInfo.deltaX = newWidth - width;
                nextResizeInfo.deltaY = newHeight - height;
                break;
            case Control_1.ResizeControlIndex.LEFT_BOTTOM:
                primaryDelta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : deltaY;
                if (aspectRatio >= 1) {
                    newWidth = width - primaryDelta;
                    newHeight = newWidth / aspectRatio;
                }
                else {
                    newHeight = height + primaryDelta;
                    newWidth = newHeight * aspectRatio;
                }
                nextResizeInfo.width = newWidth;
                nextResizeInfo.height = newHeight;
                nextResizeInfo.deltaX = width - newWidth;
                nextResizeInfo.deltaY = newHeight - height;
                break;
            default:
                break;
        }
        return nextResizeInfo;
    }
    // 原有的非等比缩放逻辑保持不变
    switch (index) {
        case Control_1.ResizeControlIndex.LEFT_TOP:
            nextResizeInfo.width = freezeWidth ? width : width - deltaX * pct;
            nextResizeInfo.height = freezeHeight ? height : height - deltaY * pct;
            break;
        case Control_1.ResizeControlIndex.RIGHT_TOP:
            nextResizeInfo.width = freezeWidth ? width : width + deltaX * pct;
            nextResizeInfo.height = freezeHeight ? height : height - deltaY * pct;
            break;
        case Control_1.ResizeControlIndex.RIGHT_BOTTOM:
            nextResizeInfo.width = freezeWidth ? width : width + deltaX * pct;
            nextResizeInfo.height = freezeHeight ? height : height + deltaY * pct;
            break;
        case Control_1.ResizeControlIndex.LEFT_BOTTOM:
            nextResizeInfo.width = freezeWidth ? width : width - deltaX * pct;
            nextResizeInfo.height = freezeHeight ? height : height + deltaY * pct;
            break;
        default:
            break;
    }
    return nextResizeInfo;
};
exports.recalcResizeInfo = recalcResizeInfo;
var updateEdgePointByAnchors = function (nodeModel, graphModel) {
    // https://github.com/didi/LogicFlow/issues/807
    // https://github.com/didi/LogicFlow/issues/875
    // 之前的做法，比如Rect是使用getRectResizeEdgePoint()计算边的point缩放后的位置
    // getRectResizeEdgePoint()考虑了瞄点在四条边以及在4个圆角的情况
    // 使用的是一种等比例缩放的模式，比如：
    // const pct = (y - beforeNode.y) / (beforeNode.height / 2 - radius)
    // afterPoint.y = afterNode.y + (afterNode.height / 2 - radius) * pct
    // 但是用户自定义的getDefaultAnchor()不一定是按照比例编写的
    // 它可能是 x: x + 20：每次缩放都会保持在x右边20的位置，因此用户自定义瞄点时，然后产生无法跟随的问题
    // 现在的做法是：直接获取用户自定义瞄点的位置，然后用这个位置作为边的新的起点，而不是自己进行计算
    var id = nodeModel.id, anchors = nodeModel.anchors;
    var edges = graphModel.getNodeEdges(id);
    // 更新边
    (0, lodash_es_1.forEach)(edges, function (edge) {
        if (edge.sourceNodeId === id) {
            // 边是以该节点为 sourceNode 时
            var anchorItem = (0, lodash_es_1.find)(anchors, function (anchor) { return anchor.id === edge.sourceAnchorId; });
            if (anchorItem) {
                edge.updateStartPoint({
                    x: anchorItem.x,
                    y: anchorItem.y,
                });
            }
        }
        else if (edge.targetNodeId === id) {
            // 边是以该节点为 targetNode 时
            var anchorItem = (0, lodash_es_1.find)(anchors, function (anchor) { return anchor.id === edge.targetAnchorId; });
            if (anchorItem) {
                edge.updateEndPoint({
                    x: anchorItem.x,
                    y: anchorItem.y,
                });
            }
        }
    });
};
exports.updateEdgePointByAnchors = updateEdgePointByAnchors;
var triggerResizeEvent = function (preNodeData, curNodeData, deltaX, deltaY, index, nodeModel, graphModel) {
    graphModel.eventCenter.emit(constant_1.EventType.NODE_RESIZE, {
        preData: preNodeData,
        data: curNodeData,
        deltaX: deltaX,
        deltaY: deltaY,
        index: index,
        model: nodeModel,
    });
};
exports.triggerResizeEvent = triggerResizeEvent;
/**
 * 处理节点的 resize 事件，提出来放到 utils 中，方便在外面（extension）中使用
 * @param x
 * @param y
 * @param deltaX
 * @param deltaY
 * @param index
 * @param nodeModel
 * @param graphModel
 * @param cancelCallback
 * @param forceProportional
 */
var handleResize = function (_a) {
    var x = _a.x, y = _a.y, deltaX = _a.deltaX, deltaY = _a.deltaY, index = _a.index, nodeModel = _a.nodeModel, graphModel = _a.graphModel, cancelCallback = _a.cancelCallback, _b = _a.forceProportional, forceProportional = _b === void 0 ? false : _b;
    var r = nodeModel.r, // circle
    rx = nodeModel.rx, // ellipse/diamond
    ry = nodeModel.ry, width = nodeModel.width, // rect/html
    height = nodeModel.height, PCTResizeInfo = nodeModel.PCTResizeInfo, minWidth = nodeModel.minWidth, minHeight = nodeModel.minHeight, maxWidth = nodeModel.maxWidth, maxHeight = nodeModel.maxHeight, rotate = nodeModel.rotate, oldCenterX = nodeModel.x, oldCenterY = nodeModel.y;
    var isFreezeWidth = minWidth === maxWidth;
    var isFreezeHeight = minHeight === maxHeight;
    var resizeInfo = {
        width: r || rx || width,
        height: r || ry || height,
        deltaX: deltaX,
        deltaY: deltaY,
        PCTResizeInfo: PCTResizeInfo,
    };
    var pct = r || (rx && ry) ? 1 / 2 : 1;
    var controlX = x;
    var controlY = y;
    var nextSize = (0, exports.recalcResizeInfo)(index, resizeInfo, pct, isFreezeWidth, isFreezeHeight, rotate, controlX, controlY, oldCenterX, oldCenterY, forceProportional);
    // 限制放大缩小的最大最小范围
    if (nextSize.width < minWidth ||
        nextSize.width > maxWidth ||
        nextSize.height < minHeight ||
        nextSize.height > maxHeight) {
        // this.dragHandler.cancelDrag()
        cancelCallback === null || cancelCallback === void 0 ? void 0 : cancelCallback();
        return;
    }
    if (rotate % (2 * Math.PI) == 0 ||
        PCTResizeInfo ||
        controlX === undefined ||
        controlY === undefined) {
        // rotate!==0并且不是PCTResizeInfo时，即使是isFreezeWidth||isFreezeHeight
        // recalcRotatedResizeInfo()计算出来的中心点会发生变化
        // 如果限制了宽高不变，对应的 x/y 不产生位移
        nextSize.deltaX = isFreezeWidth ? 0 : nextSize.deltaX;
        nextSize.deltaY = isFreezeHeight ? 0 : nextSize.deltaY;
    }
    var preNodeData = nodeModel.getData();
    var curNodeData = nodeModel.resize(nextSize);
    // 检测preNodeData和curNodeData是否没变化
    if (preNodeData.x === curNodeData.x && preNodeData.y === curNodeData.y) {
        // 中心点x和y都没有变化，说明无法resize，阻止下面边的更新以及resize事件的emit
        return;
    }
    // 更新边
    (0, exports.updateEdgePointByAnchors)(nodeModel, graphModel);
    // 触发 resize 事件
    (0, exports.triggerResizeEvent)(preNodeData, curNodeData, deltaX, deltaY, index, nodeModel, graphModel);
};
exports.handleResize = handleResize;
