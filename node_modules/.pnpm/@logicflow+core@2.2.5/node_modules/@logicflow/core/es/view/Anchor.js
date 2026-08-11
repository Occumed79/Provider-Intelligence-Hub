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
import { Circle, Line } from './shape';
import { ElementState, EventType } from '../constant';
import { StepDrag, formatAnchorConnectValidateData, targetNodeInfo, distance, cancelRaf, createRaf, } from '../util';
var Anchor = /** @class */ (function (_super) {
    __extends(Anchor, _super);
    function Anchor() {
        var _this = _super.call(this) || this;
        // TODO: 确定 event 是否会有 null 和 undefined 的情况，事件类型做相应的适配
        _this.onDragStart = function (_a) {
            var event = _a.event;
            var _b = _this.props, anchorData = _b.anchorData, nodeModel = _b.nodeModel, graphModel = _b.graphModel;
            graphModel.selectNodeById(nodeModel.id);
            if (nodeModel.autoToFront) {
                graphModel.toFront(nodeModel.id);
            }
            graphModel.eventCenter.emit(EventType.ANCHOR_DRAGSTART, {
                data: anchorData,
                e: event,
                nodeModel: nodeModel,
            });
            _this.setState({
                startX: anchorData.x,
                startY: anchorData.y,
                endX: anchorData.x,
                endY: anchorData.y,
            });
        };
        _this.onDragging = function (_a) {
            var event = _a.event;
            var _b = _this.props, graphModel = _b.graphModel, nodeModel = _b.nodeModel, anchorData = _b.anchorData;
            var transformModel = graphModel.transformModel, eventCenter = graphModel.eventCenter, width = graphModel.width, height = graphModel.height, _c = graphModel.editConfigModel, autoExpand = _c.autoExpand, stopMoveGraph = _c.stopMoveGraph;
            // TODO：确认该方法是否有影响！理论上 onDragging 时 event 必有值
            if (!event)
                return;
            var clientX = event.clientX, clientY = event.clientY;
            var _d = graphModel.getPointByClient({
                x: clientX,
                y: clientY,
            }), _e = _d.domOverlayPosition, x = _e.x, y = _e.y, _f = _d.canvasOverlayPosition, x1 = _f.x, y1 = _f.y;
            if (_this.t) {
                cancelRaf(_this.t);
            }
            var nearBoundary = []; // TODO: 定义元组类型 Tuple
            var size = 10;
            if (x < 10) {
                nearBoundary = [size, 0];
            }
            else if (x + 10 > width) {
                nearBoundary = [-size, 0];
            }
            else if (y < 10) {
                nearBoundary = [0, size];
            }
            else if (y + 10 > height) {
                nearBoundary = [0, -size];
            }
            _this.setState({
                endX: x1,
                endY: y1,
                dragging: true,
            });
            _this.moveAnchorEnd(x1, y1, event);
            if (nearBoundary.length > 0 && !stopMoveGraph && autoExpand) {
                _this.t = createRaf(function () {
                    var _a = __read(nearBoundary, 2), translateX = _a[0], translateY = _a[1];
                    transformModel.translate(translateX, translateY);
                    var _b = _this.state, endX = _b.endX, endY = _b.endY;
                    _this.setState({
                        endX: endX - translateX,
                        endY: endY - translateY,
                    });
                    _this.moveAnchorEnd(endX - translateX, endY - translateY, event);
                });
            }
            eventCenter.emit(EventType.ANCHOR_DRAG, {
                data: anchorData,
                e: event,
                nodeModel: nodeModel,
            });
        };
        _this.onDragEnd = function (_a) {
            var event = _a.event;
            if (_this.t) {
                cancelRaf(_this.t);
            }
            var edgeModel = _this.checkEnd(event);
            _this.setState({
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
                dragging: false,
            });
            // 清除掉缓存结果 fix:#320 因为创建边之后，会影响校验结果变化，所以需要重新校验
            _this.sourceRuleResults.clear();
            _this.targetRuleResults.clear();
            var _b = _this.props, graphModel = _b.graphModel, nodeModel = _b.nodeModel, anchorData = _b.anchorData;
            // 拖拽结束清理：取消悬浮态
            if (_this.preTargetNode) {
                _this.preTargetNode.setHovered(false);
                _this.preTargetNode = undefined;
            }
            graphModel.eventCenter.emit(EventType.ANCHOR_DRAGEND, {
                data: anchorData,
                e: event,
                nodeModel: nodeModel,
                edgeModel: edgeModel !== null && edgeModel !== void 0 ? edgeModel : undefined,
            });
        };
        _this.checkEnd = function (event) {
            var _a;
            var _b = _this.props, graphModel = _b.graphModel, nodeModel = _b.nodeModel, _c = _b.anchorData, x = _c.x, y = _c.y, id = _c.id;
            // nodeModel.setSelected(false);
            /* 创建边 */
            var _d = _this.state, endX = _d.endX, endY = _d.endY, dragging = _d.dragging;
            var info = targetNodeInfo({
                x: endX,
                y: endY,
            }, graphModel);
            // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
            if (_this.preTargetNode &&
                _this.preTargetNode.state !== ElementState.DEFAULT) {
                _this.preTargetNode.setElementState(ElementState.DEFAULT);
            }
            // 没有dragging就结束边
            if (!dragging)
                return;
            if (info && info.node) {
                var targetNode = info.node;
                var anchorId = info.anchor.id;
                var targetInfoId = "".concat(nodeModel.id, "_").concat(targetNode.id, "_").concat(anchorId, "_").concat(id);
                var _e = _this.sourceRuleResults.get(targetInfoId) || {}, isSourcePass = _e.isAllPass, sourceMsg = _e.msg;
                var _f = _this.targetRuleResults.get(targetInfoId) || {}, isTargetPass = _f.isAllPass, targetMsg = _f.msg;
                if (isSourcePass && isTargetPass) {
                    targetNode.setElementState(ElementState.DEFAULT);
                    var targetNodeModel = graphModel.getNodeModelById(info.node.id);
                    var edgeData = (_a = graphModel.edgeGenerator) === null || _a === void 0 ? void 0 : _a.call(graphModel, nodeModel.getData(), targetNodeModel === null || targetNodeModel === void 0 ? void 0 : targetNodeModel.getData());
                    var edgeModel = graphModel.addEdge(__assign(__assign({}, edgeData), { sourceNodeId: nodeModel.id, sourceAnchorId: id, startPoint: {
                            x: x,
                            y: y,
                        }, targetNodeId: info.node.id, targetAnchorId: info.anchor.id, endPoint: {
                            x: info.anchor.x,
                            y: info.anchor.y,
                        } }));
                    var anchorData = _this.props.anchorData;
                    graphModel.eventCenter.emit(EventType.ANCHOR_DROP, {
                        data: anchorData,
                        e: event,
                        nodeModel: nodeModel,
                        edgeModel: edgeModel,
                    });
                    return edgeModel;
                }
                var nodeData = targetNode.getData();
                graphModel.eventCenter.emit(EventType.CONNECTION_NOT_ALLOWED, {
                    data: nodeData,
                    msg: targetMsg || sourceMsg || '不允许添加连线',
                });
                return null;
            }
        };
        _this.sourceRuleResults = new Map();
        _this.targetRuleResults = new Map();
        _this.state = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            dragging: false,
        };
        _this.dragHandler = new StepDrag({
            onDragStart: _this.onDragStart,
            onDragging: _this.onDragging,
            onDragEnd: _this.onDragEnd,
        });
        return _this;
    }
    Anchor.prototype.getAnchorShape = function () {
        var _a = this.props, anchorData = _a.anchorData, style = _a.style, node = _a.node;
        var anchorShape = node.getAnchorShape(anchorData);
        if (anchorShape)
            return anchorShape;
        var x = anchorData.x, y = anchorData.y;
        var hoverStyle = __assign(__assign({}, style), style === null || style === void 0 ? void 0 : style.hover);
        return (_jsxs("g", { children: [_jsx(Circle, __assign({ className: "lf-node-anchor-hover" }, hoverStyle, { x: x, y: y })), _jsx(Circle, __assign({ className: "lf-node-anchor" }, style, { x: x, y: y }))] }));
    };
    Object.defineProperty(Anchor.prototype, "customTrajectory", {
        get: function () {
            var customTrajectory = this.props.graphModel.customTrajectory;
            return customTrajectory;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Anchor.prototype, "relateEdges", {
        get: function () {
            var _a = this.props, _b = _a.graphModel, getAnchorIncomingEdge = _b.getAnchorIncomingEdge, getAnchorOutgoingEdge = _b.getAnchorOutgoingEdge, id = _a.anchorData.id;
            return {
                incomingEdgeList: getAnchorIncomingEdge(id),
                outgoingEdgeList: getAnchorOutgoingEdge(id),
            };
        },
        enumerable: false,
        configurable: true
    });
    Anchor.prototype.moveAnchorEnd = function (endX, endY, event) {
        var _a = this.props, graphModel = _a.graphModel, nodeModel = _a.nodeModel, anchorData = _a.anchorData;
        var info = targetNodeInfo({
            x: endX,
            y: endY,
        }, graphModel);
        if (info) {
            var targetNode = info.node;
            var anchorId = info.anchor.id;
            if (this.preTargetNode && this.preTargetNode !== info.node) {
                this.preTargetNode.setElementState(ElementState.DEFAULT);
            }
            // #500 不允许锚点自己连自己, 在锚点一开始连接的时候, 不触发自己连接自己的校验。
            if (anchorData.id === anchorId) {
                return;
            }
            this.preTargetNode = targetNode;
            this.validateAndSetState(targetNode, anchorId, info.anchor, nodeModel, anchorData);
            // 人工触发进入目标节点事件，同步设置 hovered 以驱动锚点显隐和样式
            if (!targetNode.isHovered) {
                var nodeData = targetNode.getData();
                if (event) {
                    graphModel.eventCenter.emit(EventType.NODE_MOUSEENTER, {
                        data: nodeData,
                        e: event,
                    });
                }
                targetNode.setHovered(true);
            }
        }
        else if (this.preTargetNode &&
            this.preTargetNode.state !== ElementState.DEFAULT) {
            // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
            this.preTargetNode.setElementState(ElementState.DEFAULT);
            // 未命中任何节点：人工派发离开事件并取消悬浮，避免状态残留
            var prevData = this.preTargetNode.getData();
            if (event) {
                graphModel.eventCenter.emit(EventType.NODE_MOUSELEAVE, {
                    data: prevData,
                    e: event,
                });
            }
            this.preTargetNode.setHovered(false);
            this.preTargetNode = undefined;
        }
    };
    // 校验 source/target 连接规则并设置目标节点状态
    Anchor.prototype.validateAndSetState = function (targetNode, anchorId, targetAnchor, nodeModel, anchorData) {
        var _a, _b;
        var targetInfoId = "".concat(nodeModel.id, "_").concat(targetNode.id, "_").concat(anchorId, "_").concat(anchorData.id);
        if (!this.targetRuleResults.has(targetInfoId)) {
            // 首次计算并缓存源/目标两侧的规则校验结果
            var sourceRuleResult = nodeModel.isAllowConnectedAsSource(targetNode, anchorData, targetAnchor);
            var targetRuleResult = targetNode.isAllowConnectedAsTarget(nodeModel, anchorData, targetAnchor);
            this.sourceRuleResults.set(targetInfoId, formatAnchorConnectValidateData(sourceRuleResult));
            this.targetRuleResults.set(targetInfoId, formatAnchorConnectValidateData(targetRuleResult));
        }
        // 读取缓存的校验结果
        var isSourcePass = ((_a = this.sourceRuleResults.get(targetInfoId)) !== null && _a !== void 0 ? _a : {}).isAllPass;
        var isTargetPass = ((_b = this.targetRuleResults.get(targetInfoId)) !== null && _b !== void 0 ? _b : {}).isAllPass;
        // 两侧都通过则允许连接，否则标记为不允许连接
        if (isSourcePass && isTargetPass) {
            targetNode.setElementState(ElementState.ALLOW_CONNECT);
        }
        else {
            targetNode.setElementState(ElementState.NOT_ALLOW_CONNECT);
        }
    };
    Anchor.prototype.isShowLine = function () {
        var _a = this.state, startX = _a.startX, startY = _a.startY, endX = _a.endX, endY = _a.endY;
        var v = distance(startX, startY, endX, endY);
        return v > 10;
    };
    Anchor.prototype.render = function () {
        var _this = this;
        var _a = this.state, startX = _a.startX, startY = _a.startY, endX = _a.endX, endY = _a.endY;
        var _b = this.props, anchorData = _b.anchorData, edgeStyle = _b.edgeStyle, nodeModel = _b.nodeModel, graphModel = _b.graphModel;
        var edgeAddable = anchorData.edgeAddable;
        return (
        // className="lf-anchor" 作为下载时，需要将锚点删除的依据，不要修改类名
        _jsxs("g", { className: "lf-anchor", children: [_jsx("g", { onClick: function (ev) {
                        ev.stopPropagation();
                        graphModel.eventCenter.emit(EventType.ANCHOR_CLICK, {
                            data: anchorData,
                            e: ev,
                            nodeModel: nodeModel,
                        });
                    }, onPointerDown: function (ev) {
                        graphModel.eventCenter.emit(EventType.ANCHOR_MOUSEDOWN, {
                            data: anchorData,
                            e: ev,
                            nodeModel: nodeModel,
                        });
                        if (edgeAddable !== false) {
                            _this.dragHandler.handleMouseDown(ev);
                        }
                    }, children: this.getAnchorShape() }), this.isShowLine() &&
                    (this.customTrajectory ? (this.customTrajectory(__assign({ sourcePoint: {
                            x: startX,
                            y: startY,
                        }, targetPoint: {
                            x: endX,
                            y: endY,
                        } }, edgeStyle))) : (_jsx(Line, __assign({ x1: startX, y1: startY, x2: endX, y2: endY }, edgeStyle, { "pointer-events": "none" }))))] }));
    };
    return Anchor;
}(Component));
export default Anchor;
