"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tool = void 0;
var mobx_1 = require("mobx");
var lodash_es_1 = require("lodash-es");
var TextEditTool_1 = __importDefault(require("./TextEditTool"));
var MultipleSelectTool_1 = __importDefault(require("./MultipleSelectTool"));
var constant_1 = require("../constant");
// 默认内置的工具
var defaultTools = [TextEditTool_1.default, MultipleSelectTool_1.default];
var Tool = /** @class */ (function () {
    function Tool(instance) {
        var _this = this;
        this.toolMap = new Map();
        this.disabledToolMap = new Map();
        this.instance = instance;
        (0, lodash_es_1.forEach)(defaultTools, function (tool) {
            if (!_this.isDisabled(tool.toolName)) {
                _this.registerTool(tool.toolName, tool);
            }
        });
        // @see https://github.com/didi/LogicFlow/issues/152
        var graphModel = instance.graphModel;
        var eventCenter = graphModel.eventCenter;
        eventCenter.on("".concat(constant_1.EventType.GRAPH_TRANSFORM, ",").concat(constant_1.EventType.NODE_CLICK, ",").concat(constant_1.EventType.BLANK_CLICK, " "), function () {
            var _a;
            var textEditElement = graphModel.textEditElement, _b = graphModel.editConfigModel, edgeTextEdit = _b.edgeTextEdit, nodeTextEdit = _b.nodeTextEdit;
            // fix #826, 保留之前的文本可以编辑点击空白才设置为不可编辑。如果以后有其他需求再改。
            if ((edgeTextEdit || nodeTextEdit) && textEditElement) {
                (_a = graphModel.textEditElement) === null || _a === void 0 ? void 0 : _a.setElementState(constant_1.ElementState.DEFAULT);
            }
        });
    }
    Tool.prototype.isDisabled = function (toolName) {
        var _a;
        return ((_a = this.instance.options.disabledTools) === null || _a === void 0 ? void 0 : _a.indexOf(toolName)) !== -1;
    };
    // 注册工具
    Tool.prototype.registerTool = function (name, component) {
        this.toolMap.set(name, component);
    };
    // 禁用工具
    Tool.prototype.disableTool = function (name) {
        var tool = this.toolMap.get(name);
        if (tool) {
            this.disabledToolMap.set(name, tool);
            this.toolMap.delete(name);
            return true;
        }
        throw new Error("\u7981\u7528\u5931\u8D25\uFF0C\u4E0D\u5B58\u5728\u540D\u4E3A ".concat(tool, " \u7684\u5DE5\u5177"));
    };
    Tool.prototype.enableTool = function (name) {
        var tool = this.disabledToolMap.get(name);
        if (tool) {
            this.toolMap.set(name, tool);
            this.disabledToolMap.delete(name);
            return true;
        }
        throw new Error("\u4E0D\u5B58\u5728\u540D\u4E3A ".concat(tool, " \u7684\u5DE5\u5177"));
    };
    Tool.prototype.getTools = function () {
        return Array.from(this.toolMap.values());
    };
    Tool.prototype.getInstance = function () {
        return this.instance;
    };
    Tool.prototype.destroy = function () {
        this.toolMap.clear();
        this.disabledToolMap.clear();
    };
    __decorate([
        mobx_1.observable
    ], Tool.prototype, "toolMap", void 0);
    __decorate([
        mobx_1.action
    ], Tool.prototype, "disableTool", null);
    __decorate([
        mobx_1.action
    ], Tool.prototype, "enableTool", null);
    return Tool;
}());
exports.Tool = Tool;
exports.default = Tool;
