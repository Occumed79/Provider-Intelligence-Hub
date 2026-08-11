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
import { reaction } from 'mobx';
import { map, isFunction, isNil } from 'lodash-es';
import Anchor from '../Anchor';
import { BaseText } from '../text';
import { ElementState, EventType, TextMode } from '../../constant';
import { StepDrag, snapToGrid, isIe, isMultipleSelect, cancelRaf, createRaf,
// RotateMatrix,
 } from '../../util';
import RotateControlPoint from '../Rotate';
import ResizeControlGroup from '../Control';
var BaseNode = /** @class */ (function (_super) {
    __extends(BaseNode, _super);
    function BaseNode(props) {
        var _this = _super.call(this) || this;
        _this.onDragStart = function (_a) {
            var event = _a.event;
            var _b = _this.props, model = _b.model, graphModel = _b.graphModel;
            if (event) {
                var _c = graphModel.getPointByClient({
                    x: event.clientX,
                    y: event.clientY,
                }).canvasOverlayPosition, x = _c.x, y = _c.y;
                _this.moveOffset = {
                    dx: model.x - x,
                    dy: model.y - y,
                };
            }
        };
        _this.onDragging = function (_a) {
            var _b, _c, _d, _e;
            var event = _a.event;
            var _f = _this.props, model = _f.model, graphModel = _f.graphModel;
            var _g = graphModel.editConfigModel, stopMoveGraph = _g.stopMoveGraph, autoExpand = _g.autoExpand, snapGrid = _g.snapGrid, transformModel = graphModel.transformModel, selectNodes = graphModel.selectNodes, width = graphModel.width, height = graphModel.height, gridSize = graphModel.gridSize;
            var _h = event, clientX = _h.clientX, clientY = _h.clientY;
            var _j = _this.mouseDownPosition, mouseDownX = _j.x, mouseDownY = _j.y;
            if (clientX - mouseDownX > gridSize || clientY - mouseDownY > gridSize) {
                model.isDragging = true;
            }
            var _k = graphModel.getPointByClient({
                x: clientX,
                y: clientY,
            }).canvasOverlayPosition, x = _k.x, y = _k.y;
            var _l = __read(transformModel.CanvasPointToHtmlPoint([x, y]), 2), x1 = _l[0], y1 = _l[1];
            // 1. 考虑画布被缩放
            // 2. 考虑鼠标位置不再节点中心
            x = x + ((_c = (_b = _this.moveOffset) === null || _b === void 0 ? void 0 : _b.dx) !== null && _c !== void 0 ? _c : 0);
            y = y + ((_e = (_d = _this.moveOffset) === null || _d === void 0 ? void 0 : _d.dy) !== null && _e !== void 0 ? _e : 0);
            // 校准坐标
            x = snapToGrid(x, gridSize, snapGrid);
            y = snapToGrid(y, gridSize, snapGrid);
            if (!width || !height) {
                graphModel.moveNode2Coordinate(model.id, x, y);
                return;
            }
            var isOutCanvas = x1 < 0 || y1 < 0 || x1 > width || y1 > height;
            if (autoExpand && !stopMoveGraph && isOutCanvas) {
                // 鼠标超出画布后的拖动，不处理，而是让上一次setInterval持续滚动画布
                return;
            }
            // 取节点左上角和右下角，计算节点移动是否超出范围
            var _m = __read(transformModel.CanvasPointToHtmlPoint([
                x - model.width / 2,
                y - model.height / 2,
            ]), 2), leftTopX = _m[0], leftTopY = _m[1];
            var _o = __read(transformModel.CanvasPointToHtmlPoint([
                x + model.width / 2,
                y + model.height / 2,
            ]), 2), rightBottomX = _o[0], rightBottomY = _o[1];
            var size = Math.max(gridSize, 20);
            var nearBoundary = [];
            if (leftTopX < 0) {
                nearBoundary = [size, 0];
            }
            else if (rightBottomX > graphModel.width) {
                nearBoundary = [-size, 0];
            }
            else if (leftTopY < 0) {
                nearBoundary = [0, size];
            }
            else if (rightBottomY > graphModel.height) {
                nearBoundary = [0, -size];
            }
            if (_this.t) {
                cancelRaf(_this.t);
            }
            var moveNodes = selectNodes.map(function (node) { return node.id; });
            // 未被选中的节点也可以拖动
            if (moveNodes.indexOf(model.id) === -1) {
                moveNodes = [model.id];
            }
            if (nearBoundary.length > 0 && !stopMoveGraph && autoExpand) {
                _this.t = createRaf(function () {
                    var _a = __read(nearBoundary, 2), translateX = _a[0], translateY = _a[1];
                    transformModel.translate(translateX !== null && translateX !== void 0 ? translateX : 0, translateY !== null && translateY !== void 0 ? translateY : 0);
                    var deltaX = -(translateX !== null && translateX !== void 0 ? translateX : 0) / transformModel.SCALE_X;
                    var deltaY = -(translateY !== null && translateY !== void 0 ? translateY : 0) / transformModel.SCALE_X;
                    graphModel.moveNodes(moveNodes, deltaX, deltaY);
                });
            }
            else {
                graphModel.moveNodes(moveNodes, x - model.x, y - model.y);
            }
        };
        _this.onDragEnd = function () {
            if (_this.t) {
                cancelRaf(_this.t);
            }
            var model = _this.props.model;
            model.isDragging = false;
        };
        _this.onMouseOut = function (ev) {
            if (isIe()) {
                _this.setHoverOff(ev);
            }
        };
        _this.handleMouseUp = function () {
            var model = _this.props.model;
            _this.mouseUpDrag = model.isDragging;
            if (_this.longPressTimer) {
                clearTimeout(_this.longPressTimer);
                _this.longPressTimer = undefined;
            }
        };
        _this.handleClick = function (e) {
            // 节点拖拽进画布之后，不触发click事件相关emit
            // 点拖拽进画布没有触发mousedown事件，没有startTime，用这个值做区分
            var isDragging = _this.mouseUpDrag === false;
            var curTime = new Date().getTime();
            if (!_this.startTime)
                return;
            var timeInterval = curTime - _this.startTime;
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            // 这里会有一种极端情况：当网格大小是1或者关闭网格吸附时，用触摸板点击节点会触发拖拽事件导致节点无法选中
            // 当触摸板点击节点时,为了防止误触发拖拽导致节点无法选中，允许在非拖拽状态且时间间隔小于100ms时触发点击事件
            if (!isDragging && timeInterval > 300)
                return;
            if (!isDragging) {
                _this.onDragEnd();
                _this.handleMouseUp();
            }
            // 节点数据，多为事件对象数据抛出
            var nodeData = model.getData();
            var position = graphModel.getPointByClient({
                x: e.clientX,
                y: e.clientY,
            });
            // TODO: 这里加入了 isSelected 与 isMultiple，主要是为 group 插件做的加强，有种被插件夺舍的感觉
            var eventOptions = {
                data: nodeData,
                e: e,
                position: position,
                isSelected: false,
                isMultiple: false,
            };
            var isRightClick = e.button === 2;
            // 这里 IE 11不能正确显示
            var isDoubleClick = e.detail === 2;
            // 判断是否有右击，如果有右击则取消点击事件触发
            if (isRightClick)
                return;
            var editConfigModel = graphModel.editConfigModel;
            // 在multipleSelect tool禁用的情况下，允许取消选中节点
            var isMultiple = isMultipleSelect(e, editConfigModel);
            eventOptions.isMultiple = isMultiple;
            if (model.isSelected && !isDoubleClick && isMultiple) {
                eventOptions.isSelected = false;
                model.setSelected(false);
            }
            else {
                graphModel.selectNodeById(model.id, isMultiple);
                eventOptions.isSelected = true;
                // 静默模式下点击节点不变更节点层级
                if (!editConfigModel.isSilentMode) {
                    _this.toFront();
                }
            }
            // 不是双击的，默认都是单击
            if (isDoubleClick) {
                if (editConfigModel.nodeTextEdit) {
                    if (model.text.editable && editConfigModel.textMode === TextMode.TEXT) {
                        model.setSelected(false);
                        graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
                    }
                }
                graphModel.eventCenter.emit(EventType.NODE_DBCLICK, eventOptions);
            }
            else {
                graphModel.eventCenter.emit(EventType.ELEMENT_CLICK, eventOptions);
                graphModel.eventCenter.emit(EventType.NODE_CLICK, eventOptions);
                // 复制粘贴后会出现点击节点时，节点会失去焦点的问题，这里手动让节点获焦以解决这个问题
                var el_1 = e.currentTarget;
                var rAF = !isNil(window) && isFunction(window.requestAnimationFrame)
                    ? window.requestAnimationFrame.bind(window)
                    : function (fn) { return setTimeout(fn, 0); };
                rAF(function () {
                    el_1.focus();
                });
            }
        };
        _this.handleContextMenu = function (ev) {
            ev.preventDefault();
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            var editConfigModel = graphModel.editConfigModel;
            // 节点数据，多为事件对象数据抛出
            var nodeData = model.getData();
            var position = graphModel.getPointByClient({
                x: ev.clientX,
                y: ev.clientY,
            });
            graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, position.domOverlayPosition);
            if (!model.isSelected) {
                graphModel.selectNodeById(model.id);
            }
            graphModel.eventCenter.emit(EventType.NODE_CONTEXTMENU, {
                data: nodeData,
                e: ev,
                position: position,
            });
            // 静默模式下点击节点不变更节点层级
            if (!editConfigModel.isSilentMode) {
                _this.toFront();
            }
        };
        _this.handleMouseDown = function (ev) {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            _this.mouseDownPosition = { x: ev.clientX, y: ev.clientY };
            _this.startTime = new Date().getTime();
            var editConfigModel = graphModel.editConfigModel;
            if (editConfigModel.adjustNodePosition && model.draggable) {
                _this.stepDrag && _this.stepDrag.handleMouseDown(ev);
            }
            if (_this.longPressTimer) {
                clearTimeout(_this.longPressTimer);
            }
            if (ev.pointerType === 'touch') {
                _this.longPressTimer = window.setTimeout(function () {
                    if (!_this.props.model.isDragging) {
                        _this.handleContextMenu(ev);
                    }
                }, 500);
            }
        };
        _this.handleFocus = function () {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            graphModel.eventCenter.emit(EventType.NODE_FOCUS, {
                data: model.getData(),
            });
        };
        _this.handleBlur = function () {
            // 当节点通过自定义锚点实现节点删除时，这里props会变成undefined，需兼容一下
            if (!_this.props)
                return;
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            graphModel.eventCenter.emit(EventType.NODE_BLUR, {
                data: model.getData(),
            });
        };
        // 因为自定义节点的时候，可能会基于hover状态自定义不同的样式。
        _this.setHoverOn = function (ev) {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            if (model.isHovered)
                return;
            var nodeData = model.getData();
            model.setHovered(true);
            graphModel.eventCenter.emit(EventType.NODE_MOUSEENTER, {
                data: nodeData,
                e: ev,
            });
        };
        _this.setHoverOff = function (ev) {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            var nodeData = model.getData();
            // 文本focus时，关联的元素也需要高亮，所以元素失焦时还要判断下是否有文本处于focus状态
            if (!model.isHovered)
                return;
            model.setHovered(false);
            graphModel.eventCenter.emit(EventType.NODE_MOUSELEAVE, {
                data: nodeData,
                e: ev,
            });
        };
        var _a = props.graphModel, gridSize = _a.gridSize, eventCenter = _a.eventCenter, model = props.model;
        // 不在构造函数中判断，因为editConfig可能会被动态改变
        _this.stepDrag = new StepDrag({
            onDragStart: _this.onDragStart,
            onDragging: _this.onDragging,
            onDragEnd: _this.onDragEnd,
            step: gridSize,
            eventType: 'NODE',
            isStopPropagation: false,
            eventCenter: eventCenter,
            model: model,
        });
        // https://github.com/didi/LogicFlow/issues/1370
        // 当使用撤销功能：LogicFlow.undo()时，会重新初始化所有model数据，即LogicFlow.undo()时会新构建一个model对象
        // 但是this.stepDrag并不会重新创建
        // 导致this.stepDrag持有的model并没有重新赋值，因为之前的做法是构造函数中传入一个model对象
        // 使用mobx的reaction监听能力，如果this.props.model发生变化，则进行this.stepDrag.setModel()操作
        _this.modelDisposer = reaction(function () { return _this.props; }, function (newProps) {
            if (newProps && newProps.model) {
                _this.stepDrag.setModel(newProps.model);
            }
        });
        return _this;
    }
    BaseNode.prototype.componentWillUnmount = function () {
        if (this.modelDisposer) {
            this.modelDisposer();
        }
        // 以下是 mobx-preact 中 componentWillUnmount 的回调逻辑，但是不知道出于什么考虑，mobx-preact 没有混入这一段逻辑
        // @ts-ignore
        if (this.render.$mobx) {
            // @ts-ignore
            this.render.$mobx.dispose();
        }
    };
    BaseNode.prototype.componentDidMount = function () { };
    BaseNode.prototype.componentDidUpdate = function () { };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseNode.prototype.getAnchorShape = function (_anchorData) {
        return null;
    };
    BaseNode.prototype.getAnchors = function () {
        var _this = this;
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var isSelected = model.isSelected, isHitable = model.isHitable, isDragging = model.isDragging, isShowAnchor = model.isShowAnchor;
        if (isHitable && (isSelected || isShowAnchor) && !isDragging) {
            return map(model.anchors, function (anchor, index) {
                var edgeStyle = model.getAnchorLineStyle(anchor);
                var style = model.getAnchorStyle(anchor);
                return (_jsx(Anchor, { anchorData: anchor, node: _this, style: style, edgeStyle: edgeStyle, anchorIndex: index, nodeModel: model, graphModel: graphModel, setHoverOff: _this.setHoverOff }));
            });
        }
        return [];
    };
    BaseNode.prototype.getRotateControl = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var _b = graphModel.editConfigModel, isSilentMode = _b.isSilentMode, allowRotate = _b.allowRotate;
        var isSelected = model.isSelected, isHitable = model.isHitable, rotatable = model.rotatable, isHovered = model.isHovered;
        // 合并全局 allResize 和节点自身的 resizable 配置，以节点配置高于全局配置
        var canRotate = allowRotate && rotatable; // 全局开关 > 节点配置
        var style = model.getRotateControlStyle();
        if (!isSilentMode && isHitable && (isSelected || isHovered) && canRotate) {
            return (_jsx(RotateControlPoint, { graphModel: graphModel, nodeModel: model, eventCenter: graphModel.eventCenter, style: style }));
        }
    };
    BaseNode.prototype.getResizeControl = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var _b = graphModel.editConfigModel, isSilentMode = _b.isSilentMode, allowResize = _b.allowResize;
        var isSelected = model.isSelected, isHitable = model.isHitable, resizable = model.resizable, isHovered = model.isHovered;
        // 合并全局 allResize 和节点自身的 resizable 配置，以节点配置高于全局配置
        var canResize = allowResize && resizable; // 全局开关 > 节点配置
        var style = model.getResizeControlStyle();
        if (!isSilentMode && isHitable && (isSelected || isHovered) && canResize) {
            return (_jsx(ResizeControlGroup, { style: style, model: model, graphModel: graphModel }));
        }
        return null;
    };
    BaseNode.prototype.getText = function () {
        var _a;
        var _b = this.props, model = _b.model, graphModel = _b.graphModel;
        var editConfigModel = graphModel.editConfigModel;
        // 当 节点文本模式非 TEXT 时，不显示文本
        if (editConfigModel.nodeTextMode !== TextMode.TEXT)
            return null;
        // 文本被编辑的时候，显示编辑框，不显示文本。
        if (model.state === ElementState.TEXT_EDIT)
            return null;
        if (model.text) {
            var draggable = false;
            if (editConfigModel.nodeTextDraggable && model.text.draggable) {
                draggable = true;
            }
            return (_jsx(BaseText, { editable: editConfigModel.nodeTextEdit && ((_a = model.text.editable) !== null && _a !== void 0 ? _a : true), model: model, graphModel: graphModel, draggable: draggable }));
        }
        return null;
    };
    BaseNode.prototype.getStateClassName = function () {
        var _a = this.props.model, state = _a.state, isDragging = _a.isDragging, isSelected = _a.isSelected;
        var className = 'lf-node';
        switch (state) {
            case ElementState.ALLOW_CONNECT:
                className += ' lf-node-allow';
                break;
            case ElementState.NOT_ALLOW_CONNECT:
                className += ' lf-node-not-allow';
                break;
            default:
                className += ' lf-node-default';
                break;
        }
        if (isDragging) {
            className += ' lf-dragging';
        }
        if (isSelected) {
            className += ' lf-node-selected';
        }
        return className;
    };
    /**
     *  @overridable 支持重写, 节点置顶，可以被某些不需要置顶的节点重写，如group节点。
     */
    BaseNode.prototype.toFront = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        if (model.autoToFront) {
            graphModel.toFront(model.id);
        }
    };
    BaseNode.prototype.render = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var _b = graphModel.editConfigModel, hideAnchors = _b.hideAnchors, adjustNodePosition = _b.adjustNodePosition, allowRotate = _b.allowRotate, allowResize = _b.allowResize, gridSize = graphModel.gridSize, SCALE_X = graphModel.transformModel.SCALE_X;
        var isHitable = model.isHitable, draggable = model.draggable, transform = model.transform;
        var _c = model.getOuterGAttributes(), _d = _c.className, className = _d === void 0 ? '' : _d, restAttributes = __rest(_c, ["className"]);
        var nodeShapeInner = (_jsxs("g", { className: "lf-node-content", children: [_jsxs("g", { transform: transform, children: [this.getShape(), this.getText(), allowResize && this.getResizeControl(), allowRotate && this.getRotateControl()] }), !hideAnchors && this.getAnchors()] }));
        var nodeShape;
        if (!isHitable) {
            nodeShape = (_jsx("g", __assign({ className: "".concat(this.getStateClassName(), " ").concat(className) }, restAttributes, { children: nodeShapeInner })));
        }
        else {
            if (adjustNodePosition && draggable) {
                this.stepDrag.setStep(gridSize * SCALE_X);
            }
            nodeShape = (_jsx("g", __assign({ className: "".concat(this.getStateClassName(), " ").concat(className), onPointerDown: this.handleMouseDown, onPointerUp: this.handleMouseUp, onClick: this.handleClick, 
                //因为移动端点击操作完成会按顺序触发enter、leave、click事件，所以会造成节点的闪烁，所以在这里没有统一状态为Pointer
                onMouseEnter: this.setHoverOn, onMouseOver: this.setHoverOn, onMouseLeave: this.setHoverOff, onMouseOut: this.onMouseOut, onContextMenu: this.handleContextMenu, onFocus: this.handleFocus, onBlur: this.handleBlur }, restAttributes, { children: nodeShapeInner })));
        }
        return nodeShape;
    };
    BaseNode.isObserved = false;
    return BaseNode;
}(Component));
export { BaseNode };
export default BaseNode;
