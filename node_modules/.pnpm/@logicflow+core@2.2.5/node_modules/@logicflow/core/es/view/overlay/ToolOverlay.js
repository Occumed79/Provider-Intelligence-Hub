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
import { jsx as _jsx } from "preact/jsx-runtime";
import { createElement as h, Component } from 'preact/compat';
import { OutlineOverlay } from '.';
import { observer } from '../..';
var ToolOverlay = /** @class */ (function (_super) {
    __extends(ToolOverlay, _super);
    function ToolOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 在react严格模式下，useEffect会执行两次，但是在LogicFlow内部，则只会触发一次componentDidMount和componentDidUpdate。
    // 其中第一次componentDidMount对应的graphModel为被丢弃的graphModel, 所以不应该生效。
    // 在非react环境下，只会触发一次componentDidMount，不会触发componentDidUpdate。
    // 所以这里采用componentDidUpdate和componentDidMount都去触发插件的render方法。
    ToolOverlay.prototype.componentDidMount = function () {
        this.triggerToolRender();
    };
    ToolOverlay.prototype.componentDidUpdate = function () {
        this.triggerToolRender();
    };
    /**
     * 外部传入的一般是HTMLElement
     */
    ToolOverlay.prototype.getTools = function () {
        var _a = this.props, tool = _a.tool, graphModel = _a.graphModel;
        var textEditElement = graphModel.textEditElement;
        var tools = tool.getTools();
        var components = tools.map(function (t) {
            return h(t, {
                textEditElement: textEditElement,
                graphModel: graphModel,
                lf: tool.instance,
            });
        });
        tool.components = components;
        return components;
    };
    ToolOverlay.prototype.triggerToolRender = function () {
        var _a = this.props, tool = _a.tool, graphModel = _a.graphModel;
        var ToolOverlayElement = document.querySelector("#ToolOverlay_".concat(graphModel.flowId));
        var lf = tool.getInstance();
        lf.components.forEach(function (render) { return render(lf, ToolOverlayElement); });
        lf.components = []; // 保证extension组件的render只执行一次
    };
    ToolOverlay.prototype.render = function () {
        var graphModel = this.props.graphModel;
        return (_jsx("div", { className: "lf-tool-overlay", id: "ToolOverlay_".concat(graphModel.flowId), children: this.getTools() }));
    };
    ToolOverlay = __decorate([
        observer
    ], ToolOverlay);
    return ToolOverlay;
}(Component));
export { ToolOverlay };
export default OutlineOverlay;
