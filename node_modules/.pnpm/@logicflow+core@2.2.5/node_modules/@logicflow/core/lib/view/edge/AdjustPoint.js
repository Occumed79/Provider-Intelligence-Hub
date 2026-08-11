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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustPoint = exports.AdjustType = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var util_1 = require("../../util");
var constant_1 = require("../../constant");
var AdjustType;
(function (AdjustType) {
    AdjustType["SOURCE"] = "SOURCE";
    AdjustType["TARGET"] = "TARGET";
})(AdjustType || (exports.AdjustType = AdjustType = {}));
var AdjustPoint = /** @class */ (function (_super) {
    __extends(AdjustPoint, _super);
    function AdjustPoint(props) {
        var _this = _super.call(this) || this;
        _this.handleMouseDown = function (ev) {
            if (_this.stepDrag) {
                _this.stepDrag.handleMouseDown(ev);
            }
        };
        _this.onDragStart = function () {
            var _a = _this.props, x = _a.x, y = _a.y, edgeModel = _a.edgeModel;
            var startPoint = edgeModel.startPoint, endPoint = edgeModel.endPoint, pointsList = edgeModel.pointsList;
            // 记录下原始路径信息，在调整中，如果放弃调整，进行路径还原
            _this.oldEdge = {
                startPoint: startPoint,
                endPoint: endPoint,
                pointsList: pointsList,
            };
            _this.setState({
                endX: x,
                endY: y,
                dragging: true,
            });
            // 拖拽AdjustPoint时不修改edgeModel.isHitable，避免偶尔会出现边不能点击问题(https://github.com/didi/LogicFlow/issues/974)
            // edgeModel.isHitable = false;
        };
        _this.onDragging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var _b = _this.state, endX = _b.endX, endY = _b.endY;
            var _c = _this.props, graphModel = _c.graphModel, type = _c.type;
            var transformModel = graphModel.transformModel, editConfigModel = graphModel.editConfigModel;
            var _d = __read(transformModel.moveCanvasPointByHtml([endX, endY], deltaX, deltaY), 2), x = _d[0], y = _d[1];
            _this.setState({
                endX: x,
                endY: y,
                dragging: true,
            });
            // 调整过程中实时更新路径
            var edgeModel = _this.props.edgeModel;
            var info = (0, util_1.targetNodeInfo)({
                x: endX,
                y: endY,
            }, graphModel);
            // 如果一定的坐标能够找到目标节点，预结算当前节点与目标节点的路径进行展示
            if (info && info.node && _this.isAllowAdjust(info).pass) {
                var startPoint = edgeModel.startPoint, endPoint = edgeModel.endPoint, sourceNode = edgeModel.sourceNode, targetNode = edgeModel.targetNode;
                var params = type === AdjustType.SOURCE
                    ? {
                        startPoint: {
                            x: info.anchor.x,
                            y: info.anchor.y,
                        },
                        endPoint: {
                            x: endPoint.x,
                            y: endPoint.y,
                        },
                        sourceNode: info.node,
                        targetNode: targetNode,
                    }
                    : {
                        startPoint: {
                            x: startPoint.x,
                            y: startPoint.y,
                        },
                        endPoint: {
                            x: info.anchor.x,
                            y: info.anchor.y,
                        },
                        sourceNode: sourceNode,
                        targetNode: info.node,
                    };
                edgeModel.updateAfterAdjustStartAndEnd(params);
            }
            else {
                // 如果没有找到目标节点，更新起终点为当前坐标
                type === AdjustType.SOURCE
                    ? edgeModel.updateStartPoint({ x: x, y: y })
                    : edgeModel.updateEndPoint({ x: x, y: y });
            }
            if (edgeModel.text.value && editConfigModel.adjustEdge) {
                edgeModel.setText(Object.assign({}, edgeModel.text, edgeModel.textPosition));
            }
        };
        _this.onDragEnd = function (_a) {
            var _b, _c, _d;
            var event = _a.event;
            try {
                // 将状态置为非拖拽状态
                _this.setState({
                    dragging: false,
                });
                var _e = _this.props, graphModel = _e.graphModel, edgeModel = _e.edgeModel, type = _e.type;
                // 拖拽AdjustPoint时不修改edgeModel.isHitable，避免偶尔会出现边不能点击问题(https://github.com/didi/LogicFlow/issues/974)
                // edgeModel.isHitable = true;
                var _f = _this.state, endX = _f.endX, endY = _f.endY, dragging = _f.dragging;
                var info = (0, util_1.targetNodeInfo)({
                    x: endX,
                    y: endY,
                }, graphModel);
                // 没有dragging就结束边
                if (!dragging)
                    return;
                // 如果找到目标节点，删除老边，创建新边
                var needRecoveryEdge = false;
                var createEdgeInfo = void 0;
                if (info && info.node) {
                    var _g = _this.isAllowAdjust(info), pass = _g.pass, msg = _g.msg, newTargetNode = _g.newTargetNode;
                    if (pass) {
                        var _h = edgeModel.getData(), text = _h.text, _j = _h.sourceAnchorId, sourceAnchorId = _j === void 0 ? '' : _j, _k = _h.targetAnchorId, targetAnchorId = _k === void 0 ? '' : _k, rest = __rest(_h, ["text", "sourceAnchorId", "targetAnchorId"]);
                        createEdgeInfo = __assign(__assign({ sourceAnchorId: sourceAnchorId, targetAnchorId: targetAnchorId }, rest), { text: (text === null || text === void 0 ? void 0 : text.value) || '' });
                        // 根据调整点是边的起点或重点，计算创建边需要的参数
                        if (type === AdjustType.SOURCE) {
                            var sourceNode = graphModel.getNodeModelById(info.node.id);
                            var targetNode = graphModel.getNodeModelById(edgeModel.targetNodeId);
                            var edgeInfo = (_b = graphModel.edgeGenerator) === null || _b === void 0 ? void 0 : _b.call(graphModel, sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.getData(), targetNode === null || targetNode === void 0 ? void 0 : targetNode.getData(), createEdgeInfo);
                            createEdgeInfo = __assign(__assign({}, edgeInfo), { sourceNodeId: info.node.id, sourceAnchorId: info.anchor.id, startPoint: {
                                    x: info.anchor.x,
                                    y: info.anchor.y,
                                }, targetNodeId: edgeModel.targetNodeId, endPoint: __assign({}, edgeModel.endPoint) });
                            // 找到的是原有的源节点上的原锚点时，还原边
                            if (edgeModel.sourceNodeId === info.node.id &&
                                edgeModel.sourceAnchorId === info.anchor.id) {
                                needRecoveryEdge = true;
                            }
                        }
                        else if (type === AdjustType.TARGET) {
                            var sourceNode = graphModel.getNodeModelById(edgeModel.sourceNodeId);
                            var targetNode = graphModel.getNodeModelById(info.node.id);
                            var edgeInfo = (_c = graphModel.edgeGenerator) === null || _c === void 0 ? void 0 : _c.call(graphModel, sourceNode === null || sourceNode === void 0 ? void 0 : sourceNode.getData(), targetNode === null || targetNode === void 0 ? void 0 : targetNode.getData(), createEdgeInfo);
                            createEdgeInfo = __assign(__assign({}, edgeInfo), { sourceNodeId: edgeModel.sourceNodeId, startPoint: __assign({}, edgeModel.startPoint), targetNodeId: info.node.id, targetAnchorId: info.anchor.id, endPoint: {
                                    x: info.anchor.x,
                                    y: info.anchor.y,
                                } });
                            // 找到的是原有的目标节点上的原锚点时，还原边
                            if (edgeModel.targetNodeId === info.node.id &&
                                edgeModel.targetAnchorId === info.anchor.id) {
                                needRecoveryEdge = true;
                            }
                        }
                    }
                    else {
                        // 如果没有通过校验，还原边并抛出CONNECTION_NOT_ALLOWED事件
                        needRecoveryEdge = true;
                        var nodeData = newTargetNode.getData();
                        graphModel.eventCenter.emit(constant_1.EventType.CONNECTION_NOT_ALLOWED, {
                            data: nodeData,
                            msg: msg,
                        });
                    }
                }
                else {
                    // 如果没有找到目标节点，还原边
                    needRecoveryEdge = true;
                }
                if (!needRecoveryEdge) {
                    // 为了保证id不变必须要先删除老边，再创建新边，创建新边是会判断是否有重复的id
                    // 删除老边
                    var oldEdgeData = edgeModel.getData();
                    graphModel.deleteEdgeById(edgeModel.id);
                    // 创建新边
                    var edge = graphModel.addEdge(__assign({}, createEdgeInfo));
                    // 向外抛出事件
                    graphModel.eventCenter.emit(constant_1.EventType.EDGE_EXCHANGE_NODE, {
                        data: {
                            newEdge: edge.getData(),
                            oldEdge: oldEdgeData,
                        },
                    });
                }
                else {
                    // 如果没有找到目标节点或者没有通过校验，还原边
                    _this.recoveryEdge();
                }
                (_d = _this.preTargetNode) === null || _d === void 0 ? void 0 : _d.setElementState(constant_1.ElementState.DEFAULT);
            }
            finally {
                var graphModel = _this.props.graphModel;
                graphModel.eventCenter.emit(constant_1.EventType.ADJUST_POINT_DRAGEND, {
                    e: event,
                    data: _this.stepDragData,
                });
            }
        };
        // 还原边
        _this.recoveryEdge = function () {
            var edgeModel = _this.props.edgeModel;
            var _a = _this.oldEdge, startPoint = _a.startPoint, endPoint = _a.endPoint, pointsList = _a.pointsList;
            edgeModel.updateStartPoint(startPoint);
            edgeModel.updateEndPoint(endPoint);
            // 折线和曲线还需要更新其pointsList
            if (edgeModel.modelType !== constant_1.ModelType.LINE_EDGE) {
                edgeModel.pointsList = pointsList !== null && pointsList !== void 0 ? pointsList : [];
                edgeModel.initPoints();
            }
        };
        // 调整点的样式默认从主题中读取， 可以复写此方法进行更加个性化的自定义
        // 目前仅支持圆形图标进行标识，可以从圆形的r和颜色上进行调整
        _this.getAdjustPointStyle = function () {
            var theme = _this.props.graphModel.theme;
            var edgeAdjust = theme.edgeAdjust;
            return edgeAdjust;
        };
        _this.state = {
            dragging: false,
            endX: 0,
            endY: 0,
        };
        _this.targetRuleResults = new Map();
        _this.sourceRuleResults = new Map();
        var type = props.type, edgeModel = props.edgeModel, graphModel = props.graphModel;
        var eventCenter = graphModel.eventCenter;
        _this.stepDragData = {
            type: type,
            edgeData: edgeModel.getData(),
        };
        _this.stepDrag = new util_1.StepDrag({
            onDragStart: _this.onDragStart,
            onDragging: _this.onDragging,
            onDragEnd: _this.onDragEnd,
            eventType: 'ADJUST_POINT',
            isStopPropagation: false,
            eventCenter: eventCenter,
            data: _this.stepDragData,
        });
        return _this;
    }
    AdjustPoint.prototype.isAllowAdjust = function (info) {
        var _a = this.props, _b = _a.edgeModel, id = _b.id, sourceNode = _b.sourceNode, targetNode = _b.targetNode, sourceAnchorId = _b.sourceAnchorId, targetAnchorId = _b.targetAnchorId, type = _a.type;
        // const newTargetNode = info.node;
        var newSourceNode;
        var newTargetNode;
        var newSourceAnchor;
        var newTargetAnchor;
        // 如果调整的是连线起点
        if (type === AdjustType.SOURCE) {
            newSourceNode = info.node;
            newTargetNode = targetNode;
            newSourceAnchor = info.anchor;
            newTargetAnchor = targetNode.getAnchorInfo(targetAnchorId);
        }
        else {
            newSourceNode = sourceNode;
            newTargetNode = info.node;
            newTargetAnchor = info.anchor;
            newSourceAnchor = sourceNode.getAnchorInfo(sourceAnchorId);
        }
        // 如果前一个接触的节点和此时接触的节点不相等，则将前一个节点状态重新设置为默认状态。
        if (this.preTargetNode && this.preTargetNode !== info.node) {
            this.preTargetNode.setElementState(constant_1.ElementState.DEFAULT);
        }
        this.preTargetNode = info.node;
        // #500 不允许锚点自己连自己, 在锚点一开始连接的时候, 不触发自己连接自己的校验。
        if (newTargetAnchor.id === newSourceAnchor.id) {
            return {
                pass: false,
                msg: '',
                newTargetNode: newTargetNode,
            };
        }
        var targetInfoId = "".concat(newSourceNode.id, "_").concat(newTargetNode.id, "_").concat(newSourceAnchor.id, "_").concat(newTargetAnchor.id);
        // 查看鼠标是否进入过target，若有检验结果，表示进入过, 就不重复计算了。
        if (!this.targetRuleResults.has(targetInfoId)) {
            var sourceRuleResult = newSourceNode.isAllowConnectedAsSource(newTargetNode, newSourceAnchor, newTargetAnchor, id);
            var targetRuleResult = newTargetNode.isAllowConnectedAsTarget(newSourceNode, newSourceAnchor, newTargetAnchor, id);
            this.sourceRuleResults.set(targetInfoId, (0, util_1.formatAnchorConnectValidateData)(sourceRuleResult));
            this.targetRuleResults.set(targetInfoId, (0, util_1.formatAnchorConnectValidateData)(targetRuleResult));
        }
        var _c = this.sourceRuleResults.get(targetInfoId), isSourcePass = _c.isAllPass, sourceMsg = _c.msg;
        var _d = this.targetRuleResults.get(targetInfoId), isTargetPass = _d.isAllPass, targetMsg = _d.msg;
        // 实时提示出即将连接的节点是否允许连接
        var state = isSourcePass && isTargetPass
            ? constant_1.ElementState.ALLOW_CONNECT
            : constant_1.ElementState.NOT_ALLOW_CONNECT;
        if (type === AdjustType.SOURCE) {
            newSourceNode.setElementState(state);
        }
        else {
            newTargetNode.setElementState(state);
        }
        return {
            pass: isSourcePass && isTargetPass,
            msg: targetMsg || sourceMsg,
            newTargetNode: newTargetNode,
        };
    };
    AdjustPoint.prototype.render = function () {
        var _a = this.props, x = _a.x, y = _a.y, getAdjustPointShape = _a.getAdjustPointShape, edgeModel = _a.edgeModel;
        var dragging = this.state.dragging;
        return ((0, jsx_runtime_1.jsx)("g", { pointerEvents: dragging ? 'none' : '', onPointerDown: this.handleMouseDown, children: !dragging ? getAdjustPointShape(x, y, edgeModel) : '' }));
    };
    return AdjustPoint;
}(compat_1.Component));
exports.AdjustPoint = AdjustPoint;
exports.default = AdjustPoint;
