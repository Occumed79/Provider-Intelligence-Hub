"use strict";
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasOverlay = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var __1 = require("../..");
var constant_1 = require("../../constant");
var util_1 = require("../../util");
var CanvasOverlay = /** @class */ (function (_super) {
    __extends(CanvasOverlay, _super);
    function CanvasOverlay(props) {
        var _this = _super.call(this) || this;
        _this.stepScrollX = 0;
        _this.stepScrollY = 0;
        _this.pointers = new Map();
        // get InjectedProps() {
        //   return this.props as InjectedProps;
        // }
        _this.onDragging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            if (_this.longPressTimer) {
                clearTimeout(_this.longPressTimer);
                _this.longPressTimer = undefined;
            }
            _this.setState({
                isDragging: true,
            });
            var _b = _this.props.graphModel, transformModel = _b.transformModel, editConfigModel = _b.editConfigModel;
            if (editConfigModel.stopMoveGraph === true) {
                return;
            }
            transformModel.translate(deltaX, deltaY);
        };
        _this.onDragEnd = function () {
            _this.setState({
                isDragging: false,
            });
        };
        _this.zoomHandler = function (ev) {
            var _a = _this.props, _b = _a.graphModel, editConfigModel = _b.editConfigModel, transformModel = _b.transformModel, gridSize = _b.gridSize, graphModel = _a.graphModel;
            var eX = ev.deltaX, eY = ev.deltaY;
            var stopScrollGraph = editConfigModel.stopScrollGraph, stopZoomGraph = editConfigModel.stopZoomGraph;
            // 如果没有禁止滚动移动画布, 并且当前触发的时候ctrl键、cmd键没有按住, 那么移动画布
            if (!stopScrollGraph && !ev.ctrlKey && !ev.metaKey) {
                ev.preventDefault();
                _this.stepScrollX += eX;
                _this.stepScrollY += eY;
                if (Math.abs(_this.stepScrollX) >= gridSize) {
                    var remainderX = _this.stepScrollX % gridSize;
                    var moveDistance = _this.stepScrollX - remainderX;
                    transformModel.translate(-moveDistance * transformModel.SCALE_X, 0);
                    _this.stepScrollX = remainderX;
                }
                if (Math.abs(_this.stepScrollY) >= gridSize) {
                    var remainderY = _this.stepScrollY % gridSize;
                    var moveDistanceY = _this.stepScrollY - remainderY;
                    transformModel.translate(0, -moveDistanceY * transformModel.SCALE_Y);
                    _this.stepScrollY = remainderY;
                }
                return;
            }
            // 如果没有禁止缩放画布，那么进行缩放. 在禁止缩放画布后，按住 ctrl、cmd 键也不能缩放了。
            if (!stopZoomGraph) {
                ev.preventDefault();
                var position = graphModel.getPointByClient({
                    x: ev.clientX,
                    y: ev.clientY,
                });
                var _c = position.canvasOverlayPosition, x = _c.x, y = _c.y;
                transformModel.zoom(ev.deltaY < 0, [x, y]);
            }
        };
        _this.clickHandler = function (ev) {
            // 点击空白处取消节点选中状态, 不包括冒泡过来的事件。
            var target = ev.target;
            if (target.getAttribute('name') === 'canvas-overlay') {
                var graphModel = _this.props.graphModel;
                var selectElements = graphModel.selectElements;
                if (selectElements.size > 0) {
                    graphModel.clearSelectElements();
                }
                // 如果是拖拽状态，不触发点击事件
                if (_this.state.isDragging)
                    return;
                graphModel.eventCenter.emit(constant_1.EventType.BLANK_CLICK, { e: ev });
            }
        };
        _this.handleContextMenu = function (ev) {
            var target = ev.target;
            if (target.getAttribute('name') === 'canvas-overlay') {
                ev.preventDefault();
                var graphModel = _this.props.graphModel;
                var position = graphModel.getPointByClient({
                    x: ev.clientX,
                    y: ev.clientY,
                });
                // graphModel.setElementState(ElementState.SHOW_MENU, position.domOverlayPosition);
                graphModel.eventCenter.emit(constant_1.EventType.BLANK_CONTEXTMENU, {
                    e: ev,
                    position: position,
                });
            }
        };
        // 鼠标、触摸板 按下
        _this.pointerDownHandler = function (ev) {
            var _a = _this.props.graphModel, eventCenter = _a.eventCenter, editConfigModel = _a.editConfigModel, SCALE_X = _a.transformModel.SCALE_X, gridSize = _a.gridSize;
            _this.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
            if (_this.longPressTimer) {
                clearTimeout(_this.longPressTimer);
            }
            if (ev.pointerType === 'touch') {
                _this.longPressTimer = window.setTimeout(function () {
                    _this.handleContextMenu(ev);
                }, 500);
            }
            // 检测双指触摸，初始化捏合缩放
            if (_this.pointers.size === 2) {
                var _b = _this.props.graphModel, transformModel = _b.transformModel, editConfigModel_1 = _b.editConfigModel;
                // 记录两指当前位置用于计算初始距离
                var pts = Array.from(_this.pointers.values());
                var dx = pts[0].x - pts[1].x;
                var dy = pts[0].y - pts[1].y;
                var cx = (pts[0].x + pts[1].x) / 2;
                var cy = (pts[0].y + pts[1].y) / 2;
                // 记录捏合起始距离与当前缩放，后续按比例计算缩放
                _this.pinchStartDistance = Math.hypot(dx, dy);
                _this.pinchStartScale = transformModel.SCALE_X;
                // 双指操作下取消画布拖拽，避免与捏合缩放冲突
                _this.stepDrag.cancelDrag();
                _this.pinchLastCenterX = cx;
                _this.pinchLastCenterY = cy;
                editConfigModel_1.updateEditConfig({ isPinching: true });
                return;
            }
            var adjustEdge = editConfigModel.adjustEdge, adjustNodePosition = editConfigModel.adjustNodePosition, stopMoveGraph = editConfigModel.stopMoveGraph;
            var target = ev.target;
            var isFrozenElement = !adjustEdge && !adjustNodePosition;
            if (target.getAttribute('name') === 'canvas-overlay' || isFrozenElement) {
                if (stopMoveGraph !== true) {
                    _this.stepDrag.setStep(gridSize * SCALE_X);
                    _this.stepDrag.handleMouseDown(ev);
                }
                else {
                    eventCenter.emit(constant_1.EventType.BLANK_MOUSEDOWN, { e: ev });
                }
            }
        };
        _this.pointerMoveHandler = function (ev) {
            var _a;
            // 记录当前指针位置（按 pointerId）
            _this.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
            // 当已记录初始捏合距离且存在两指时，执行捏合缩放
            if (_this.pinchStartDistance && _this.pointers.size >= 2) {
                var _b = _this.props, graphModel = _b.graphModel, _c = _b.graphModel, editConfigModel = _c.editConfigModel, transformModel = _c.transformModel;
                if (editConfigModel.stopZoomGraph)
                    return;
                // 取消触摸长按计时，避免捏合过程中误触发上下文菜单
                if (_this.longPressTimer) {
                    clearTimeout(_this.longPressTimer);
                }
                // 计算两指间当前距离
                var pts = Array.from(_this.pointers.values());
                var dx = pts[0].x - pts[1].x;
                var dy = pts[0].y - pts[1].y;
                var dist = Math.hypot(dx, dy);
                // 以初始缩放为基准，根据距离比例得到新的缩放比例
                var scale = ((_a = _this.pinchStartScale) !== null && _a !== void 0 ? _a : transformModel.SCALE_X) *
                    (dist / _this.pinchStartDistance);
                // 取两指中心作为缩放原点，并转换为画布坐标系
                var cx = (pts[0].x + pts[1].x) / 2;
                var cy = (pts[0].y + pts[1].y) / 2;
                var pos = graphModel.getPointByClient({ x: cx, y: cy });
                var _d = pos.canvasOverlayPosition, x = _d.x, y = _d.y;
                transformModel.zoom(scale, [x, y]);
                // 双指中心位移驱动画布平移，配合缩放实现捏合移动；
                if (!editConfigModel.stopMoveGraph || editConfigModel.isPinching) {
                    var deltaX = _this.pinchLastCenterX === undefined ? 0 : cx - _this.pinchLastCenterX;
                    var deltaY = _this.pinchLastCenterY === undefined ? 0 : cy - _this.pinchLastCenterY;
                    transformModel.translate(deltaX, deltaY);
                    _this.pinchLastCenterX = cx;
                    _this.pinchLastCenterY = cy;
                }
                ev.preventDefault();
            }
        };
        _this.pointerUpHandler = function (ev) {
            _this.pointers.delete(ev.pointerId);
            if (_this.longPressTimer) {
                clearTimeout(_this.longPressTimer);
                _this.longPressTimer = undefined;
            }
            // 双指松开或仅剩一指：结束捏合手势并清理临时状态
            if (_this.pointers.size < 2) {
                // 清空捏合距离与缩放起始值
                _this.pinchStartDistance = undefined;
                _this.pinchStartScale = undefined;
                // 清空上一帧的双指中心
                _this.pinchLastCenterX = undefined;
                _this.pinchLastCenterY = undefined;
                var editConfigModel = _this.props.graphModel.editConfigModel;
                // 标记退出捏合，框选等交互可恢复
                editConfigModel.updateEditConfig({ isPinching: false });
                // 为了处理画布移动的时候，编辑和菜单仍然存在的问题。
                _this.clickHandler(ev);
            }
        };
        var _a = props.graphModel, gridSize = _a.gridSize, eventCenter = _a.eventCenter;
        _this.stepDrag = new util_1.StepDrag({
            onDragging: _this.onDragging,
            onDragEnd: _this.onDragEnd,
            step: gridSize,
            eventType: 'BLANK',
            isStopPropagation: false,
            eventCenter: eventCenter,
            model: undefined,
        });
        // 当 ctrl、cmd 键被按住的时候，可以放大缩小。
        _this.state = {
            isDragging: false,
        };
        return _this;
    }
    CanvasOverlay.prototype.render = function () {
        var transformModel = this.props.graphModel.transformModel;
        var transform = transformModel.getTransformStyle().transform;
        var children = this.props.children;
        var isDragging = this.state.isDragging;
        return ((0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", name: "canvas-overlay", onWheel: this.zoomHandler, onPointerDown: this.pointerDownHandler, onPointerMove: this.pointerMoveHandler, onPointerUp: this.pointerUpHandler, onPointerCancel: this.pointerUpHandler, onContextMenu: this.handleContextMenu, style: { touchAction: 'none', WebkitUserSelect: 'none' }, className: isDragging
                ? 'lf-canvas-overlay lf-dragging'
                : 'lf-canvas-overlay lf-drag-able', children: (0, jsx_runtime_1.jsx)("g", { transform: transform, children: children }) }));
    };
    CanvasOverlay = __decorate([
        __1.observer
    ], CanvasOverlay);
    return CanvasOverlay;
}(compat_1.Component));
exports.CanvasOverlay = CanvasOverlay;
exports.default = CanvasOverlay;
