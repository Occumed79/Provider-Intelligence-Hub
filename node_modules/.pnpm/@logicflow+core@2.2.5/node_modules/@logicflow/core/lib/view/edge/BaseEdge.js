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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEdge = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var lodash_es_1 = require("lodash-es");
var shape_1 = require("../shape");
var text_1 = require("../text");
var constant_1 = require("../../constant");
var util_1 = require("../../util");
var AdjustPoint_1 = __importStar(require("./AdjustPoint"));
var BaseEdge = /** @class */ (function (_super) {
    __extends(BaseEdge, _super);
    function BaseEdge() {
        var _this = _super.call(this) || this;
        _this.textRef = (0, compat_1.createRef)();
        /**
         * 不支持重写，如果想要基于hover状态设置不同的样式，请在model中使用isHovered属性。
         */
        _this.handleHover = function (hovered, ev) {
            var _a = _this.props, model = _a.model, eventCenter = _a.graphModel.eventCenter;
            model.setHovered(hovered);
            var eventName = hovered
                ? constant_1.EventType.EDGE_MOUSEENTER
                : constant_1.EventType.EDGE_MOUSELEAVE;
            var nodeData = model.getData();
            eventCenter.emit(eventName, {
                data: nodeData,
                e: ev,
            });
        };
        /**
         * 不支持重写，如果想要基于hover状态设置不同的样式，请在model中使用isHovered属性。
         */
        _this.setHoverOn = function (ev) {
            // ! hover多次触发, onMouseOver + onMouseEnter
            var isHovered = _this.props.model.isHovered;
            if (isHovered)
                return;
            _this.textRef && _this.textRef.current && _this.textRef.current.setHoverOn();
            _this.handleHover(true, ev);
        };
        /**
         * 不支持重写，如果想要基于hover状态设置不同的样式，请在model中使用isHovered属性。
         */
        _this.setHoverOff = function (ev) {
            var isHovered = _this.props.model.isHovered;
            if (!isHovered)
                return;
            _this.textRef && _this.textRef.current && _this.textRef.current.setHoverOff();
            _this.handleHover(false, ev);
        };
        /**
         * 不支持重写，如果想要基于contextmenu事件做处理，请监听edge:contextmenu事件。
         */
        _this.handleContextMenu = function (ev) {
            ev.preventDefault();
            // 节点右击也会触发时间，区分右击和点击(mouseup)
            _this.contextMenuTime = new Date().getTime();
            if (_this.clickTimer) {
                clearTimeout(_this.clickTimer);
            }
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            var editConfigModel = graphModel.editConfigModel;
            var position = graphModel.getPointByClient({
                x: ev.clientX,
                y: ev.clientY,
            });
            graphModel.setElementStateById(model.id, constant_1.ElementState.SHOW_MENU, position.domOverlayPosition);
            // 静默模式下点击节点不变更节点层级
            if (!editConfigModel.isSilentMode) {
                _this.toFront();
            }
            if (!model.isSelected) {
                graphModel.selectEdgeById(model.id);
            }
            // 边数据
            var edgeData = model === null || model === void 0 ? void 0 : model.getData();
            graphModel.eventCenter.emit(constant_1.EventType.EDGE_CONTEXTMENU, {
                data: edgeData,
                e: ev,
                position: position,
            });
        };
        /**
         * 不支持重写
         */
        _this.handleMouseDown = function (e) {
            e.stopPropagation();
            _this.startTime = new Date().getTime();
            if (_this.longPressTimer) {
                clearTimeout(_this.longPressTimer);
            }
            if (e.pointerType === 'touch') {
                _this.longPressTimer = window.setTimeout(function () {
                    if (!_this.props.model.isDragging) {
                        _this.handleContextMenu(e);
                    }
                }, 500);
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
        /**
         * 不支持重写
         */
        _this.handleClick = function (e) {
            if (!_this.startTime)
                return;
            if (_this.mouseUpDrag)
                return; // 如果是拖拽，不触发click事件。
            var isRightClick = e.button === 2;
            if (isRightClick)
                return;
            // 这里 IE 11不能正确显示
            var isDoubleClick = e.detail === 2;
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            var edgeData = model === null || model === void 0 ? void 0 : model.getData();
            var position = graphModel.getPointByClient({
                x: e.clientX,
                y: e.clientY,
            });
            if (isDoubleClick) {
                var editConfigModel_1 = graphModel.editConfigModel, textEditElement = graphModel.textEditElement;
                var id = model.id, text = model.text, modelType = model.modelType;
                // 当前边正在编辑，需要先重置状态才能变更文本框位置
                if (textEditElement && textEditElement.id === id) {
                    graphModel.setElementStateById(id, constant_1.ElementState.DEFAULT);
                }
                // 边文案可编辑状态，才可以进行文案编辑
                if (editConfigModel_1.edgeTextEdit && text.editable) {
                    model.setSelected(false);
                    graphModel.setElementStateById(id, constant_1.ElementState.TEXT_EDIT);
                }
                if (modelType === constant_1.ModelType.POLYLINE_EDGE) {
                    var polylineEdgeModel = model;
                    var _b = graphModel.getPointByClient({
                        x: e.x,
                        y: e.y,
                    }).canvasOverlayPosition, x = _b.x, y = _b.y;
                    polylineEdgeModel.dbClickPosition = (0, util_1.getClosestPointOfPolyline)({
                        x: x,
                        y: y,
                    }, polylineEdgeModel.points);
                }
                graphModel.eventCenter.emit(constant_1.EventType.EDGE_DBCLICK, {
                    data: edgeData,
                    e: e,
                    position: position,
                });
            }
            else {
                // 单击
                // 边右击也会触发mouseup事件，判断是否有右击，如果有右击则取消点击事件触发
                // 边数据
                graphModel.eventCenter.emit(constant_1.EventType.ELEMENT_CLICK, {
                    data: edgeData,
                    e: e,
                    position: position,
                });
                graphModel.eventCenter.emit(constant_1.EventType.EDGE_CLICK, {
                    data: edgeData,
                    e: e,
                    position: position,
                });
                // 复制粘贴后会出现点击边时，边会失去焦点的问题，这里手动让边获焦以解决这个问题
                var el_1 = e.currentTarget;
                var rAF = !(0, lodash_es_1.isNil)(window) && (0, lodash_es_1.isFunction)(window.requestAnimationFrame)
                    ? window.requestAnimationFrame.bind(window)
                    : function (fn) { return setTimeout(fn, 0); };
                rAF(function () {
                    el_1.focus();
                });
            }
            var editConfigModel = graphModel.editConfigModel;
            graphModel.selectEdgeById(model.id, (0, util_1.isMultipleSelect)(e, editConfigModel));
            // 静默模式下点击节点不变更节点层级
            if (!editConfigModel.isSilentMode) {
                _this.toFront();
            }
        };
        _this.handleFocus = function () {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            graphModel.eventCenter.emit(constant_1.EventType.EDGE_FOCUS, {
                data: model.getData(),
            });
        };
        _this.handleBlur = function () {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            graphModel.eventCenter.emit(constant_1.EventType.EDGE_BLUR, {
                data: model.getData(),
            });
        };
        return _this;
    }
    /**
     * 不支持重写，请使用getEdge
     */
    BaseEdge.prototype.getShape = function () {
        return (0, jsx_runtime_1.jsx)("g", { children: this.getEdge() });
    };
    /**
     * @deprecated 请使用model.getTextStyle
     */
    BaseEdge.prototype.getTextStyle = function () { };
    /**
     * @overridable 可重写，自定义边文本DOM
     */
    BaseEdge.prototype.getText = function () {
        var _a;
        var _b = this.props, model = _b.model, graphModel = _b.graphModel;
        var editConfigModel = graphModel.editConfigModel;
        // 当 边文本模式非 TEXT 时，不显示文本
        if (editConfigModel.edgeTextMode !== constant_1.TextMode.TEXT)
            return null;
        // 文本被编辑的时候，显示编辑框，不显示文本。
        if (model.state === constant_1.ElementState.TEXT_EDIT)
            return null;
        if (model.text) {
            var draggable = false;
            if (editConfigModel.edgeTextDraggable && model.text.draggable) {
                draggable = true;
            }
            return ((0, jsx_runtime_1.jsx)(text_1.LineText, { ref: this.textRef, editable: editConfigModel.edgeTextEdit && ((_a = model.text.editable) !== null && _a !== void 0 ? _a : true), model: model, graphModel: graphModel, draggable: draggable }));
        }
        return null;
    };
    /**
     * @deprecated
     */
    BaseEdge.prototype.getArrowInfo = function () {
        var model = this.props.model;
        var startPoint = model.startPoint, endPoint = model.endPoint, isSelected = model.isSelected;
        var hover = this.state.hover;
        return {
            start: startPoint,
            end: endPoint,
            hover: hover,
            isSelected: isSelected,
        };
    };
    BaseEdge.prototype.getLastTwoPoints = function () {
        var model = this.props.model;
        var startPoint = model.startPoint, endPoint = model.endPoint;
        return [startPoint, endPoint];
    };
    /**
     * @deprecated 请使用model.getArrowStyle
     */
    BaseEdge.prototype.getArrowStyle = function () {
        console.error('getArrowStyle is deprecated in 1.2.0, please use model.getArrowStyle');
        return null;
    };
    /**
     * 定义边的箭头，不支持重写。请使用getStartArrow和getEndArrow
     */
    BaseEdge.prototype.getArrow = function () {
        var model = this.props.model;
        var id = model.id;
        var _a = model.getArrowStyle(), _b = _a.refY, refY = _b === void 0 ? 0 : _b, _c = _a.refX, refX = _c === void 0 ? 2 : _c;
        var _d = __read(this.getLastTwoPoints(), 2), start = _d[0], end = _d[1];
        var theta = 'auto';
        // 防止无效点和零长度向量以避免 NaN 方向
        if (start && end) {
            var dx = end.x - start.x;
            var dy = end.y - start.y;
            // 仅在有实际方向时才计算
            if (dx !== 0 || dy !== 0) {
                var computed = (0, util_1.degrees)((0, util_1.getThetaOfVector)({
                    x: dx,
                    y: dy,
                    z: 0,
                }));
                if (Number.isFinite(computed) && !Number.isNaN(computed)) {
                    theta = computed;
                }
            }
        }
        return ((0, jsx_runtime_1.jsx)("g", { children: (0, jsx_runtime_1.jsxs)("defs", { children: [(0, jsx_runtime_1.jsx)("marker", { id: "marker-start-".concat(id), refX: -refX, refY: refY, overflow: "visible", orient: "auto", markerUnits: "userSpaceOnUse", children: this.getStartArrow() }), (0, jsx_runtime_1.jsx)("marker", { id: "marker-end-".concat(id), refX: refX, refY: refY, overflow: "visible", orient: theta, markerUnits: "userSpaceOnUse", children: this.getEndArrow() })] }) }));
    };
    /**
     * Private helper method to generate arrow path based on type and parameters
     */
    BaseEdge.prototype.getArrowPath = function (arrowType, props) {
        var stroke = props.stroke, _a = props.fill, fill = _a === void 0 ? stroke : _a, strokeWidth = props.strokeWidth, _b = props.offset, offset = _b === void 0 ? 10 : _b, verticalLength = props.verticalLength, strokeLinecap = props.strokeLinecap, strokeLinejoin = props.strokeLinejoin, transform = props.transform;
        var arrowPath = '';
        switch (arrowType) {
            case 'solid':
                arrowPath = "M".concat(-offset / 4, ",0 L").concat((3 * offset) / 4, ",").concat(verticalLength, " L").concat((3 * offset) / 4, ",-").concat(verticalLength, " Z");
                break;
            case 'hollow':
                arrowPath = "M".concat(-offset / 4, ",0 L").concat((3 * offset) / 4, ",").concat(verticalLength, " L").concat(-offset / 4, ",0 L").concat((3 * offset) / 4, ",-").concat(verticalLength, " L").concat(-offset / 4, ",0 Z");
                break;
            case 'diamond':
                arrowPath = "M".concat(-offset / 2, ",0 L0,").concat(verticalLength, " L").concat(offset / 2, ",0 L0,-").concat(verticalLength, " L").concat(-offset / 2, ",0 Z");
                break;
            case 'circle':
                arrowPath = "M".concat(-offset / 2, ",0 A").concat(offset / 4, ",").concat(offset / 4, " 0 1,0 ").concat(offset / 2, ",0 A").concat(offset / 4, ",").concat(offset / 4, " 0 1,0 ").concat(-offset / 2, ",0 Z");
                break;
            default:
                arrowPath = '';
                break;
        }
        return ((0, jsx_runtime_1.jsx)("path", { d: arrowPath, stroke: stroke, fill: fill, strokeWidth: strokeWidth, strokeLinecap: strokeLinecap, strokeLinejoin: strokeLinejoin, transform: transform }));
    };
    /**
     * @overridable 可重写，自定义边起点箭头形状。
     * @example
     * getStartArrow() {
     *  const { model } = this.props;
     *  const { stroke, strokeWidth, offset, verticalLength } = model.getArrowStyle();
     *  return (
     *    h('path', {
     *      d: ''
     *    })
     *  )
     * }
     */
    BaseEdge.prototype.getStartArrow = function () {
        var model = this.props.model;
        var _a = model.getArrowStyle(), stroke = _a.stroke, strokeWidth = _a.strokeWidth, offset = _a.offset, verticalLength = _a.verticalLength, _b = _a.startArrowType, startArrowType = _b === void 0 ? 'none' : _b, strokeLinecap = _a.strokeLinecap, strokeLinejoin = _a.strokeLinejoin;
        return this.getArrowPath(startArrowType, {
            stroke: stroke,
            strokeWidth: strokeWidth,
            offset: offset,
            verticalLength: verticalLength,
            strokeLinecap: strokeLinecap,
            strokeLinejoin: strokeLinejoin,
        });
    };
    /**
     * @overridable 可重写，自定义边终点箭头形状。
     * @example
     * getEndArrow() {
     *  const { model } = this.props;
     *  const { stroke, strokeWidth, offset, verticalLength } = model.getArrowStyle();
     *  return (
     *    h('path', {
     *      d: ''
     *    })
     *  )
     * }
     */
    BaseEdge.prototype.getEndArrow = function () {
        var model = this.props.model;
        var _a = model.getArrowStyle(), stroke = _a.stroke, strokeWidth = _a.strokeWidth, offset = _a.offset, verticalLength = _a.verticalLength, _b = _a.endArrowType, endArrowType = _b === void 0 ? 'solid' : _b, strokeLinecap = _a.strokeLinecap, strokeLinejoin = _a.strokeLinejoin;
        return this.getArrowPath(endArrowType, {
            stroke: stroke,
            strokeWidth: strokeWidth,
            offset: offset,
            verticalLength: verticalLength,
            strokeLinecap: strokeLinecap,
            strokeLinejoin: strokeLinejoin,
            transform: 'rotate(180)',
        });
    };
    /**
     * @overridable 可重写，自定义调整边连接节点形状。在开启了adjustEdgeStartAndEnd的时候，会显示调整点。
     * @param x 调整点x坐标
     * @param y 调整点y坐标
     * @param model
     * @example
     * getAdjustPointShape(x, y) {
     *  const { model } = this.props;
     *  const style = model.getAdjustPointStyle();
     *  return (
     *    h('circle', {
     *      ...style,
     *     x,
     *     y
     *    })
     *  )
     * }
     */
    BaseEdge.prototype.getAdjustPointShape = function (x, y, model) {
        var style = model.getAdjustPointStyle();
        return ((0, jsx_runtime_1.jsx)(shape_1.Circle, __assign({ className: "lf-edge-adjust-point" }, style, { x: x, y: y })));
    };
    /**
     * 不支持重写。请使用getAdjustPointShape
     */
    BaseEdge.prototype.getAdjustPoints = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var _b = graphModel.editConfigModel, adjustEdgeStartAndEnd = _b.adjustEdgeStartAndEnd, adjustEdgeStart = _b.adjustEdgeStart, adjustEdgeEnd = _b.adjustEdgeEnd;
        var start = model.getAdjustStart();
        var end = model.getAdjustEnd();
        return ((0, jsx_runtime_1.jsxs)("g", { children: [adjustEdgeStartAndEnd && adjustEdgeStart && ((0, jsx_runtime_1.jsx)(AdjustPoint_1.default, __assign({ type: AdjustPoint_1.AdjustType.SOURCE }, start, { getAdjustPointShape: this.getAdjustPointShape, edgeModel: model, graphModel: graphModel }))), adjustEdgeStartAndEnd && adjustEdgeEnd && ((0, jsx_runtime_1.jsx)(AdjustPoint_1.default, __assign({ type: AdjustPoint_1.AdjustType.TARGET }, end, { getAdjustPointShape: this.getAdjustPointShape, edgeModel: model, graphModel: graphModel })))] }));
    };
    /**
     * @deprecated
     */
    BaseEdge.prototype.getAnimation = function () {
        console.error('getAnimation is deprecated in 1.2.0, please use model.getEdgeAnimationStyle');
    };
    /**
     * @overridable 可重写，在完全自定义边的时候，可以重写此方法，来自定义边的选区。
     */
    BaseEdge.prototype.getAppendWidth = function () {
        return (0, jsx_runtime_1.jsx)("g", {});
    };
    /**
     * 不建议重写，此方法为扩大边选区，方便用户点击选中边。
     * 如果需要自定义边选区，请使用getAppendWidth。
     */
    BaseEdge.prototype.getAppend = function () {
        return (0, jsx_runtime_1.jsx)("g", { className: "lf-edge-append", children: this.getAppendWidth() });
    };
    /**
     * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
     * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
     */
    BaseEdge.prototype.getEdge = function () {
        return null;
    };
    /**
     * @overridable 支持重写, 此方法为边在被选中时将其置顶，如果不需要此功能，可以重写此方法。
     */
    BaseEdge.prototype.toFront = function () {
        var _a = this.props, graphModel = _a.graphModel, model = _a.model;
        graphModel.toFront(model.id);
    };
    /**
     * 不建议重写，如果要自定义边的形状，请重写getEdge方法。
     */
    BaseEdge.prototype.render = function () {
        var _a = this.props.model, isSelected = _a.isSelected, isHitable = _a.isHitable, isShowAdjustPoint = _a.isShowAdjustPoint;
        return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsxs)("g", { className: [
                        'lf-edge',
                        !isHitable && 'pointer-none',
                        isSelected && 'lf-edge-selected',
                    ]
                        .filter(Boolean)
                        .join(' '), style: {
                        touchAction: 'none',
                        WebkitTouchCallout: 'none',
                    }, onClick: this.handleClick, onContextMenu: this.handleContextMenu, onPointerDown: this.handleMouseDown, onPointerUp: this.handleMouseUp, onPointerCancel: this.handleMouseUp, onMouseOver: this.setHoverOn, onMouseEnter: this.setHoverOn, onMouseLeave: this.setHoverOff, onFocus: this.handleFocus, onBlur: this.handleBlur, children: [this.getShape(), this.getAppend(), this.getText(), this.getArrow()] }), isShowAdjustPoint && isSelected ? this.getAdjustPoints() : ''] }));
    };
    BaseEdge.isObserved = false;
    return BaseEdge;
}(compat_1.Component));
exports.BaseEdge = BaseEdge;
exports.default = BaseEdge;
