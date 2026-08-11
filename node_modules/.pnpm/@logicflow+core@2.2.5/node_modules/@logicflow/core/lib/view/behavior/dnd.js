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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dnd = void 0;
var lodash_es_1 = require("lodash-es");
var util_1 = require("../../util");
var constant_1 = require("../../constant");
var Dnd = /** @class */ (function () {
    function Dnd(params) {
        var _this = this;
        this.nodeConfig = null;
        this.fakeNode = null;
        this.stopDrag = function () {
            _this.nodeConfig = null;
            if (_this.docPointerMove) {
                window.document.removeEventListener('pointermove', _this.docPointerMove);
            }
            if (_this.docPointerUp) {
                window.document.removeEventListener('pointerup', _this.docPointerUp);
            }
        };
        this.dragEnter = function (e) {
            if (!_this.nodeConfig || _this.fakeNode)
                return;
            _this.fakeNode = _this.lf.createFakeNode(__assign(__assign({}, _this.nodeConfig), _this.clientToLocalPoint({
                x: e.clientX,
                y: e.clientY,
            })));
        };
        this.onDragOver = function (e) {
            _this.lf.graphModel.eventCenter.emit(constant_1.EventType.BLANK_CANVAS_MOUSEMOVE, {
                e: e,
            });
            e.preventDefault();
            if (_this.fakeNode) {
                var _a = _this.clientToLocalPoint({
                    x: e.clientX,
                    y: e.clientY,
                }), x = _a.x, y = _a.y;
                _this.fakeNode.moveTo(x, y);
                var nodeData = _this.fakeNode.getData();
                _this.lf.setNodeSnapLine(nodeData);
                _this.lf.graphModel.eventCenter.emit(constant_1.EventType.NODE_DND_DRAG, {
                    data: nodeData,
                    e: e,
                });
            }
            return false;
        };
        this.onDragLeave = function () {
            if (_this.fakeNode) {
                _this.lf.removeNodeSnapLine();
                _this.lf.graphModel.removeFakeNode();
                _this.fakeNode = null;
            }
        };
        this.onDrop = function (e) {
            if (!_this.lf.graphModel || !e || !_this.nodeConfig) {
                return;
            }
            _this.lf.addNode(__assign(__assign({}, _this.nodeConfig), _this.clientToLocalPoint({
                x: e.clientX,
                y: e.clientY,
            })), constant_1.EventType.NODE_DND_ADD, e);
            e.preventDefault();
            e.stopPropagation();
            _this.nodeConfig = null;
            _this.lf.removeNodeSnapLine();
            _this.lf.graphModel.removeFakeNode();
            _this.fakeNode = null;
        };
        var lf = params.lf;
        this.lf = lf;
    }
    Dnd.prototype.clientToLocalPoint = function (_a) {
        var x = _a.x, y = _a.y;
        var gridSize = (0, lodash_es_1.get)(this.lf.options, ['grid', 'size']);
        // 处理 container 的 offset 等
        var position = this.lf.graphModel.getPointByClient({
            x: x,
            y: y,
        });
        // 处理缩放和偏移
        var _b = position.canvasOverlayPosition, x1 = _b.x, y1 = _b.y;
        var snapGrid = this.lf.graphModel.editConfigModel.snapGrid;
        // x, y 对齐到网格的 size
        return {
            x: (0, util_1.snapToGrid)(x1, gridSize, snapGrid),
            y: (0, util_1.snapToGrid)(y1, gridSize, snapGrid),
        };
    };
    Dnd.prototype.isInsideCanvas = function (e) {
        var overlay = this.lf.graphModel.rootEl.querySelector('[name="canvas-overlay"]');
        var topEl = window.document.elementFromPoint(e.clientX, e.clientY);
        return (topEl === overlay ||
            (topEl !== null && !!overlay && overlay.contains(topEl)));
    };
    Dnd.prototype.startDrag = function (nodeConfig) {
        var _this = this;
        var editConfigModel = this.lf.graphModel.editConfigModel;
        if (editConfigModel === null || editConfigModel === void 0 ? void 0 : editConfigModel.isSilentMode)
            return;
        this.nodeConfig = nodeConfig;
        // 指针移动：根据命中结果判断是否在画布覆盖层上，驱动假节点创建/移动或清理
        this.docPointerMove = function (e) {
            if (!_this.nodeConfig)
                return;
            // 离开画布：清理吸附线与假节点
            if (!_this.isInsideCanvas(e)) {
                _this.onDragLeave();
                return;
            }
            // 首次进入画布：创建假节点并初始化位置
            if (!_this.fakeNode) {
                _this.dragEnter(e);
                return;
            }
            // 在画布内移动：更新假节点位置与吸附线
            _this.onDragOver(e);
        };
        // 指针抬起：在画布内落点生成节点，否则清理假节点
        this.docPointerUp = function (e) {
            if (!_this.nodeConfig)
                return;
            if (_this.isInsideCanvas(e)) {
                _this.onDrop(e);
            }
            else {
                _this.onDragLeave();
            }
            // 阻止默认行为与冒泡，避免滚动/点击穿透
            e.preventDefault();
            e.stopPropagation();
            // 结束拖拽并移除监听
            _this.stopDrag();
        };
        window.document.addEventListener('pointermove', this.docPointerMove);
        window.document.addEventListener('pointerup', this.docPointerUp);
    };
    return Dnd;
}());
exports.Dnd = Dnd;
exports.default = Dnd;
