"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditConfigModel = void 0;
var lodash_es_1 = require("lodash-es");
var mobx_1 = require("mobx");
var constant_1 = require("../constant");
var silentModeConfig = {
    // SilentMode 下允许用户操作画布
    stopZoomGraph: false,
    stopScrollGraph: false,
    stopMoveGraph: false,
    // 节点 & 边相关配置
    adjustEdge: false,
    adjustEdgeStartAndEnd: false,
    adjustNodePosition: false,
    hideAnchors: true,
    allowRotate: false,
    allowResize: false,
    nodeSelectedOutline: true,
    // 文本相关配置
    textEdit: false,
    nodeTextEdit: false,
    edgeTextEdit: false,
    textDraggable: false,
    nodeTextDraggable: false,
    edgeTextDraggable: false,
};
var allKeys = [
    'isSilentMode', // 是否为静默模式
    'stopZoomGraph', // 禁止缩放画布
    'stopScrollGraph', // 禁止鼠标滚动移动画布
    'stopMoveGraph', // 禁止拖动画布
    'snapGrid', // 是否开启网格对齐
    'adjustEdge', // 允许调整边
    'adjustEdgeMiddle', // 允许调整边中点
    'adjustEdgeStartAndEnd', // 允许调整边起点和终点
    'adjustEdgeStart', // 允许调整边起点
    'adjustEdgeEnd', // 允许调整边终点
    'adjustNodePosition', // 允许拖动节点
    'hideAnchors', // 隐藏节点所有锚点
    'allowRotate', // 是否允许节点旋转
    'allowResize', // 是否允许节点缩放
    'autoExpand', // 是否自动展开
    'hoverOutline', // 显示节点悬浮时的外框
    'nodeSelectedOutline', // 节点被选中时是否显示 outline
    'edgeSelectedOutline', // 边被选中时是否显示 outline
    'textEdit', // 是否允许文本可编辑（全局）
    'nodeTextEdit', // 允许节点文本可以编辑
    'edgeTextEdit', // 允许边文本可以编辑
    'textDraggable', // 是否允许文本可拖拽（全局）
    'nodeTextDraggable', // 允许节点文本可以拖拽
    'edgeTextDraggable', // 允许边文本可以拖拽
    'multipleSelectKey', // 多选按键
    // 2.0.0 新增配置
    'textMode', // 文本模式（全局）
    'nodeTextMode', // 节点文本模式
    'edgeTextMode', // 边文本模式
    'nodeTextMultiple', // 是否支持多个节点文本
    'edgeTextMultiple', // 是否支持多个边文本
    'nodeTextVertical', // 节点文本是否纵向显示
    'edgeTextVertical', // 边文本是否纵向显示
    'isPinching', //是否是双指捏合态
];
/**
 * 页面编辑配置
 */
var EditConfigModel = /** @class */ (function () {
    function EditConfigModel(config) {
        /*********************************************************
         * 画布相关配置
         ********************************************************/
        this.isSilentMode = false;
        this.stopZoomGraph = false;
        this.stopMoveGraph = false;
        this.stopScrollGraph = false;
        this.snapGrid = false;
        this.isPinching = false;
        /*********************************************************
         * 文本相关配置（全局）
         ********************************************************/
        this.textMode = constant_1.TextMode.TEXT; // 全局的 textMode 设置
        this.textEdit = true;
        this.textDraggable = false;
        // 节点
        this.nodeTextEdit = true;
        this.nodeTextDraggable = false;
        this.nodeTextMultiple = false; // 是否支持多个节点文本
        this.nodeTextVertical = false; // 节点文本朝向是否是纵向
        this.nodeTextMode = constant_1.TextMode.TEXT; // 节点文本模式
        // 边
        this.edgeTextMode = constant_1.TextMode.TEXT; // 边文本模式
        this.edgeTextEdit = true;
        this.edgeTextDraggable = false;
        this.edgeTextMultiple = false; // 是否支持多个边文本
        this.edgeTextVertical = false; // 边文本朝向是否是纵向
        /*********************************************************
         * 节点相关配置
         ********************************************************/
        this.hideAnchors = false;
        this.allowRotate = false;
        this.allowResize = false;
        this.hoverOutline = true;
        this.nodeSelectedOutline = true;
        this.adjustNodePosition = true;
        this.autoExpand = false;
        /*********************************************************
         * 边相关配置
         ********************************************************/
        this.adjustEdge = true;
        this.adjustEdgeMiddle = false;
        this.adjustEdgeStartAndEnd = false;
        this.adjustEdgeStart = false;
        this.adjustEdgeEnd = false;
        this.edgeSelectedOutline = true;
        /*********************************************************
         * 其他
         ********************************************************/
        this.multipleSelectKey = '';
        (0, lodash_es_1.assign)(this, this.computeConfig(config));
    }
    EditConfigModel.prototype.updateEditConfig = function (config) {
        var newConfig = this.computeConfig(config);
        (0, lodash_es_1.assign)(this, newConfig);
    };
    // TODO: 确认一下这个函数的逻辑，是否会有误合并的问题
    EditConfigModel.prototype.computeConfig = function (config) {
        var isSilentMode = config.isSilentMode, textDraggable = config.textDraggable, textMode = config.textMode, textEdit = config.textEdit, adjustEdgeStartAndEnd = config.adjustEdgeStartAndEnd;
        var conf = {};
        // false 表示从静默模式恢复
        if (isSilentMode === false) {
            (0, lodash_es_1.assign)(conf, this.stagedConfig);
        }
        // 如果不传，默认 undefined 表示非静默模式
        if (isSilentMode === true && isSilentMode !== this.isSilentMode) {
            // https://github.com/didi/LogicFlow/issues/1180
            // 如果重复调用 isSilentMode=true 多次，会导致 this.stagedConfig 状态保存错误：保存为修改之后的 Config
            // 因此需要阻止重复赋值为 true，使用 config.isSilentMode !== this.isSilentMode
            var silentConfig = (0, lodash_es_1.pick)(silentModeConfig, allKeys);
            // 暂存修改之前的所有配置项
            this.stagedConfig = (0, lodash_es_1.pick)(this, allKeys);
            (0, lodash_es_1.assign)(conf, silentConfig);
        }
        // 如果不传，默认undefined表示允许文本编辑
        if (!(0, lodash_es_1.isUndefined)(textEdit)) {
            (0, lodash_es_1.assign)(conf, {
                nodeTextEdit: textEdit,
                edgeTextEdit: textEdit,
            });
        }
        if (!(0, lodash_es_1.isUndefined)(textDraggable)) {
            (0, lodash_es_1.assign)(conf, {
                nodeTextDraggable: textDraggable,
                edgeTextDraggable: textDraggable,
            });
        }
        if (textMode) {
            (0, lodash_es_1.assign)(conf, {
                nodeTextMode: textMode,
                edgeTextMode: textMode,
            });
        }
        if ((0, lodash_es_1.isBoolean)(adjustEdgeStartAndEnd)) {
            (0, lodash_es_1.assign)(conf, {
                adjustEdgeStart: adjustEdgeStartAndEnd,
                adjustEdgeEnd: adjustEdgeStartAndEnd,
            });
        }
        var userConfig = (0, lodash_es_1.pick)(config, allKeys);
        return (0, lodash_es_1.assign)(conf, userConfig);
    };
    EditConfigModel.prototype.updateTextMode = function (textMode) {
        // 如果更新全局 textMode，同时更新节点和边的 textMode
        this.textMode = textMode;
        this.edgeTextMode = textMode;
        this.nodeTextMode = textMode;
    };
    EditConfigModel.prototype.getConfig = function () {
        return (0, lodash_es_1.pick)(this, allKeys);
    };
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "isSilentMode", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "stopZoomGraph", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "stopMoveGraph", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "stopScrollGraph", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "snapGrid", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "isPinching", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "textMode", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "textEdit", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "textDraggable", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "nodeTextEdit", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "nodeTextDraggable", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "nodeTextMultiple", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "nodeTextVertical", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "nodeTextMode", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "edgeTextMode", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "edgeTextEdit", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "edgeTextDraggable", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "edgeTextMultiple", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "edgeTextVertical", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "hideAnchors", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "allowRotate", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "allowResize", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "hoverOutline", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "nodeSelectedOutline", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "adjustNodePosition", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "autoExpand", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "adjustEdge", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "adjustEdgeMiddle", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "adjustEdgeStartAndEnd", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "adjustEdgeStart", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "adjustEdgeEnd", void 0);
    __decorate([
        mobx_1.observable
    ], EditConfigModel.prototype, "edgeSelectedOutline", void 0);
    __decorate([
        mobx_1.action
    ], EditConfigModel.prototype, "updateEditConfig", null);
    __decorate([
        mobx_1.action
    ], EditConfigModel.prototype, "updateTextMode", null);
    return EditConfigModel;
}());
exports.EditConfigModel = EditConfigModel;
exports.default = EditConfigModel;
