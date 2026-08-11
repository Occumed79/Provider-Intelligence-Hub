var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { action, observable } from 'mobx';
import { forEach } from 'lodash-es';
import TextEdit from './TextEditTool';
import MultipleSelect from './MultipleSelectTool';
import { ElementState, EventType } from '../constant';
// 默认内置的工具
var defaultTools = [TextEdit, MultipleSelect];
var Tool = /** @class */ (function () {
    function Tool(instance) {
        var _this = this;
        this.toolMap = new Map();
        this.disabledToolMap = new Map();
        this.instance = instance;
        forEach(defaultTools, function (tool) {
            if (!_this.isDisabled(tool.toolName)) {
                _this.registerTool(tool.toolName, tool);
            }
        });
        // @see https://github.com/didi/LogicFlow/issues/152
        var graphModel = instance.graphModel;
        var eventCenter = graphModel.eventCenter;
        eventCenter.on("".concat(EventType.GRAPH_TRANSFORM, ",").concat(EventType.NODE_CLICK, ",").concat(EventType.BLANK_CLICK, " "), function () {
            var _a;
            var textEditElement = graphModel.textEditElement, _b = graphModel.editConfigModel, edgeTextEdit = _b.edgeTextEdit, nodeTextEdit = _b.nodeTextEdit;
            // fix #826, 保留之前的文本可以编辑点击空白才设置为不可编辑。如果以后有其他需求再改。
            if ((edgeTextEdit || nodeTextEdit) && textEditElement) {
                (_a = graphModel.textEditElement) === null || _a === void 0 ? void 0 : _a.setElementState(ElementState.DEFAULT);
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
        observable
    ], Tool.prototype, "toolMap", void 0);
    __decorate([
        action
    ], Tool.prototype, "disableTool", null);
    __decorate([
        action
    ], Tool.prototype, "enableTool", null);
    return Tool;
}());
export { Tool };
export default Tool;
