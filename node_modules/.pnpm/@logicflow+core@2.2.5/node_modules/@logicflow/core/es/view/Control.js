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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Component } from 'preact/compat';
import { find, forEach, map, cloneDeep } from 'lodash-es';
import { Rect } from './shape';
import { getNodeBBox, StepDrag, handleResize } from '../util';
import { EventType } from '../constant';
export var ResizeControlIndex;
(function (ResizeControlIndex) {
    ResizeControlIndex[ResizeControlIndex["LEFT_TOP"] = 0] = "LEFT_TOP";
    ResizeControlIndex[ResizeControlIndex["RIGHT_TOP"] = 1] = "RIGHT_TOP";
    ResizeControlIndex[ResizeControlIndex["RIGHT_BOTTOM"] = 2] = "RIGHT_BOTTOM";
    ResizeControlIndex[ResizeControlIndex["LEFT_BOTTOM"] = 3] = "LEFT_BOTTOM";
})(ResizeControlIndex || (ResizeControlIndex = {}));
var ResizeControl = /** @class */ (function (_super) {
    __extends(ResizeControl, _super);
    function ResizeControl(props) {
        var _this = _super.call(this) || this;
        //判断Shift键状态
        _this.isShiftPressed = false;
        //绑定键盘事件监听
        _this.bindKeyboardEvents = function () {
            document.addEventListener('keydown', _this.handleKeyDown);
            document.addEventListener('keyup', _this.handleKeyUp);
        };
        //处理键盘按下事件
        _this.handleKeyDown = function (event) {
            if (event.key === 'Shift') {
                _this.isShiftPressed = true;
            }
        };
        _this.handleKeyUp = function (event) {
            if (event.key === 'Shift') {
                _this.isShiftPressed = false;
            }
        };
        _this.updateEdgePointByAnchors = function () {
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
            var _a = _this.nodeModel, id = _a.id, anchors = _a.anchors;
            var edges = _this.graphModel.getNodeEdges(id);
            // 更新边
            forEach(edges, function (edge) {
                if (edge.sourceNodeId === id) {
                    // 边是以该节点为 sourceNode 时
                    var anchorItem = find(anchors, function (anchor) { return anchor.id === edge.sourceAnchorId; });
                    if (anchorItem) {
                        edge.updateStartPoint({
                            x: anchorItem.x,
                            y: anchorItem.y,
                        });
                    }
                }
                else if (edge.targetNodeId === id) {
                    // 边是以该节点为 targetNode 时
                    var anchorItem = find(anchors, function (anchor) { return anchor.id === edge.targetAnchorId; });
                    if (anchorItem) {
                        edge.updateEndPoint({
                            x: anchorItem.x,
                            y: anchorItem.y,
                        });
                    }
                }
            });
        };
        _this.triggerResizeEvent = function (preNodeData, curNodeData, deltaX, deltaY, index, nodeModel) {
            _this.graphModel.eventCenter.emit(EventType.NODE_RESIZE, {
                preData: preNodeData,
                data: curNodeData,
                deltaX: deltaX,
                deltaY: deltaY,
                index: index,
                model: nodeModel,
            });
        };
        /**
         * 计算 Control 拖动后，节点的高度信息
         * @param index
         * @param resizeInfo
         * @param pct
         * @param freezeWidth
         * @param freezeHeight
         */
        _this.recalcResizeInfo = function (index, resizeInfo, pct, freezeWidth, freezeHeight) {
            if (pct === void 0) { pct = 1; }
            if (freezeWidth === void 0) { freezeWidth = false; }
            if (freezeHeight === void 0) { freezeHeight = false; }
            var nextResizeInfo = cloneDeep(resizeInfo);
            var deltaX = nextResizeInfo.deltaX, deltaY = nextResizeInfo.deltaY;
            var width = nextResizeInfo.width, height = nextResizeInfo.height, PCTResizeInfo = nextResizeInfo.PCTResizeInfo;
            if (PCTResizeInfo) {
                var sensitivity = 4; // 越低越灵敏
                var deltaScale = 0;
                var combineDelta = 0;
                switch (index) {
                    case ResizeControlIndex.LEFT_TOP:
                        combineDelta = (deltaX * -1 - deltaY) / sensitivity;
                        break;
                    case ResizeControlIndex.RIGHT_TOP:
                        combineDelta = (deltaX - deltaY) / sensitivity;
                        break;
                    case ResizeControlIndex.RIGHT_BOTTOM:
                        combineDelta = (deltaX + deltaY) / sensitivity;
                        break;
                    case ResizeControlIndex.LEFT_BOTTOM:
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
                    case ResizeControlIndex.LEFT_TOP:
                        deltaX = width - spcWidth;
                        deltaY = height - spcHeight;
                        break;
                    case ResizeControlIndex.RIGHT_TOP:
                        deltaX = spcWidth - width;
                        deltaY = height - spcHeight;
                        break;
                    case ResizeControlIndex.RIGHT_BOTTOM:
                        deltaX = spcWidth - width;
                        deltaY = spcHeight - height;
                        break;
                    case ResizeControlIndex.LEFT_BOTTOM:
                        deltaX = width - spcWidth;
                        deltaY = spcHeight - height;
                        break;
                    default:
                        break;
                }
                return nextResizeInfo;
            }
            // 如果限制了宽/高不变，对应的 width/height 保持一致
            switch (index) {
                case ResizeControlIndex.LEFT_TOP:
                    nextResizeInfo.width = freezeWidth ? width : width - deltaX * pct;
                    nextResizeInfo.height = freezeHeight ? height : height - deltaY * pct;
                    break;
                case ResizeControlIndex.RIGHT_TOP:
                    nextResizeInfo.width = freezeWidth ? width : width + deltaX * pct;
                    nextResizeInfo.height = freezeHeight ? height : height - deltaY * pct;
                    break;
                case ResizeControlIndex.RIGHT_BOTTOM:
                    nextResizeInfo.width = freezeWidth ? width : width + deltaX * pct;
                    nextResizeInfo.height = freezeHeight ? height : height + deltaY * pct;
                    break;
                case ResizeControlIndex.LEFT_BOTTOM:
                    nextResizeInfo.width = freezeWidth ? width : width - deltaX * pct;
                    nextResizeInfo.height = freezeHeight ? height : height + deltaY * pct;
                    break;
                default:
                    break;
            }
            return nextResizeInfo;
        };
        _this.resizeNode = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var index = _this.index;
            var _b = _this.props, model = _b.model, graphModel = _b.graphModel, x = _b.x, y = _b.y;
            // DONE: 调用每个节点中更新缩放时的方法 updateNode 函数，用来各节点缩放的方法
            handleResize({
                x: x,
                y: y,
                deltaX: deltaX,
                deltaY: deltaY,
                index: index,
                nodeModel: model,
                graphModel: graphModel,
                forceProportional: _this.isShiftPressed,
                cancelCallback: function () {
                    _this.dragHandler.cancelDrag();
                },
            });
        };
        _this.onDragStart = function () {
            _this.graphModel.selectNodeById(_this.nodeModel.id);
        };
        _this.onDragging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var transformModel = _this.graphModel.transformModel;
            var _b = __read(transformModel.fixDeltaXY(deltaX, deltaY), 2), dx = _b[0], dy = _b[1];
            _this.resizeNode({
                deltaX: dx,
                deltaY: dy,
            });
        };
        // 由于将拖拽放大缩小改成丝滑模式，这个时候需要再拖拽结束的时候，将节点的位置更新到 grid 上。
        _this.onDragEnd = function () {
            // TODO: 确认下面该代码是否还需要（应该是默认让节点拖拽以 gridSize 为步长移动）
            // const { gridSize = 1 } = this.graphModel
            // const x = gridSize * Math.round(this.nodeModel.x / gridSize)
            // const y = gridSize * Math.round(this.nodeModel.y / gridSize)
            var x = _this.nodeModel.x;
            var y = _this.nodeModel.y;
            _this.nodeModel.moveTo(x, y);
            // 先触发 onDragging() -> 更新边 -> 再触发用户自定义的 getDefaultAnchor()，所以 onDragging()
            // 拿到的 anchors 是滞后的，为了正确的设置最终的位置，应该在拖拽结束的时候，再设置一次边的 Point 位置，
            // 此时拿到的 anchors 是最新的
            _this.updateEdgePointByAnchors();
        };
        _this.onPointerDown = function (e) {
            e.stopPropagation();
            _this.dragHandler.handleMouseDown(e);
        };
        var index = props.index, model = props.model, graphModel = props.graphModel;
        _this.index = index;
        _this.nodeModel = model;
        _this.graphModel = graphModel;
        _this.dragHandler = new StepDrag({
            onDragStart: _this.onDragStart,
            onDragging: _this.onDragging,
            onDragEnd: _this.onDragEnd,
            step: graphModel.gridSize,
        });
        _this.bindKeyboardEvents();
        return _this;
    }
    ResizeControl.prototype.componentWillUnmount = function () {
        this.dragHandler.destroy();
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    };
    ResizeControl.prototype.getViewPosition = function (direction, x, y) {
        var _a = this.props.model.getResizeControlStyle(), _b = _a.width, width = _b === void 0 ? 8 : _b, _c = _a.height, height = _c === void 0 ? 8 : _c;
        switch (direction) {
            case 'nw':
                return {
                    x: x - width / 2,
                    y: y - height / 2,
                };
            case 'ne': {
                return {
                    x: x + width / 2,
                    y: y - height / 2,
                };
            }
            case 'se': {
                return {
                    x: x + width / 2,
                    y: y + height / 2,
                };
            }
            case 'sw': {
                return {
                    x: x - width / 2,
                    y: y + height / 2,
                };
            }
            default: {
                return {
                    x: x,
                    y: y,
                };
            }
        }
    };
    ResizeControl.prototype.render = function () {
        var _a = this.props, x = _a.x, y = _a.y, direction = _a.direction, model = _a.model;
        var _b = model.getResizeControlStyle(), width = _b.width, height = _b.height, restStyle = __rest(_b, ["width", "height"]);
        // 为了让调整点在视觉上在调整外框的中间，因此在渲染时转换一下
        var _c = this.getViewPosition(direction, x, y), viewX = _c.x, viewY = _c.y;
        return (_jsxs("g", { className: "lf-resize-control lf-resize-control-".concat(direction), children: [_jsx(Rect, __assign({ className: "lf-resize-control-content", x: viewX, y: viewY, width: width !== null && width !== void 0 ? width : 7, height: height !== null && height !== void 0 ? height : 7 }, restStyle)), _jsx(Rect, { className: "lf-resize-control-content", x: viewX, y: viewY, width: width ? width + 5 : 25, height: width ? width + 5 : 25, fill: "transparent", stroke: "transparent", onPointerDown: this.onPointerDown })] }));
    };
    return ResizeControl;
}(Component));
export { ResizeControl };
var ResizeControlGroup = /** @class */ (function (_super) {
    __extends(ResizeControlGroup, _super);
    function ResizeControlGroup() {
        return _super.call(this) || this;
    }
    ResizeControlGroup.prototype.getResizeControl = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var _b = getNodeBBox(model), minX = _b.minX, minY = _b.minY, maxX = _b.maxX, maxY = _b.maxY;
        var controlList = [
            {
                index: ResizeControlIndex.LEFT_TOP,
                direction: 'nw',
                x: minX,
                y: minY,
            }, // 左上角
            {
                index: ResizeControlIndex.RIGHT_TOP,
                direction: 'ne',
                x: maxX,
                y: minY,
            }, // 右上角
            {
                index: ResizeControlIndex.RIGHT_BOTTOM,
                direction: 'se',
                x: maxX,
                y: maxY,
            }, // 右下角
            {
                index: ResizeControlIndex.LEFT_BOTTOM,
                direction: 'sw',
                x: minX,
                y: maxY,
            }, // 左下角
        ];
        return map(controlList, function (control) { return (_jsx(ResizeControl, __assign({}, control, { model: model, graphModel: graphModel }))); });
    };
    ResizeControlGroup.prototype.getResizeOutline = function () {
        var model = this.props.model;
        var x = model.x, y = model.y, width = model.width, height = model.height;
        var style = model.getResizeOutlineStyle();
        return (_jsx(Rect, __assign({}, style, { "pointer-events": "none", x: x, y: y, 
            // TODO：宽高padding后续改成配置化的
            width: width + 10, height: height + 10 })));
    };
    ResizeControlGroup.prototype.render = function () {
        return (_jsxs("g", { className: "lf-resize-control-group", children: [this.getResizeOutline(), this.getResizeControl()] }));
    };
    return ResizeControlGroup;
}(Component));
export { ResizeControlGroup };
export default ResizeControlGroup;
