"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolsViewToStringTag = exports.ToolsView = void 0;
const common_1 = require("../../common");
const tool_1 = require("../../registry/tool");
const cell_1 = require("../cell");
const view_1 = require("../view");
const util_1 = require("../view/util");
const tool_item_1 = require("./tool-item");
class ToolsView extends view_1.View {
    static isToolsView(instance) {
        if (instance == null) {
            return false;
        }
        if (instance instanceof ToolsView) {
            return true;
        }
        const tag = instance[Symbol.toStringTag];
        const view = instance;
        if ((tag == null || tag === exports.ToolsViewToStringTag) &&
            view.graph != null &&
            view.cell != null &&
            typeof view.config === 'function' &&
            typeof view.update === 'function' &&
            typeof view.focus === 'function' &&
            typeof view.blur === 'function' &&
            typeof view.show === 'function' &&
            typeof view.hide === 'function') {
            return true;
        }
        return false;
    }
    get name() {
        return this.options.name;
    }
    get graph() {
        return this.cellView.graph;
    }
    get cell() {
        return this.cellView.cell;
    }
    get [Symbol.toStringTag]() {
        return exports.ToolsViewToStringTag;
    }
    constructor(options = {}) {
        super();
        this.svgContainer = this.createContainer(true, options);
        this.htmlContainer = this.createContainer(false, options);
        this.config(options);
    }
    createContainer(svg, options) {
        const container = svg
            ? (0, util_1.createViewElement)('g', true)
            : (0, util_1.createViewElement)('div', false);
        common_1.Dom.addClass(container, this.prefixClassName('cell-tools'));
        if (options.className) {
            common_1.Dom.addClass(container, options.className);
        }
        return container;
    }
    config(options) {
        this.options = Object.assign(Object.assign({}, this.options), options);
        if (!cell_1.CellView.isCellView(options.view) || options.view === this.cellView) {
            return this;
        }
        this.cellView = options.view;
        if (this.cell.isEdge()) {
            common_1.Dom.addClass(this.svgContainer, this.prefixClassName('edge-tools'));
            common_1.Dom.addClass(this.htmlContainer, this.prefixClassName('edge-tools'));
        }
        else if (this.cell.isNode()) {
            common_1.Dom.addClass(this.svgContainer, this.prefixClassName('node-tools'));
            common_1.Dom.addClass(this.htmlContainer, this.prefixClassName('node-tools'));
        }
        this.svgContainer.setAttribute('data-cell-id', this.cell.id);
        this.htmlContainer.setAttribute('data-cell-id', this.cell.id);
        if (this.name) {
            this.svgContainer.setAttribute('data-tools-name', this.name);
            this.htmlContainer.setAttribute('data-tools-name', this.name);
        }
        const tools = this.options.items;
        if (!Array.isArray(tools)) {
            return this;
        }
        this.tools = [];
        const normalizedTools = [];
        tools.forEach((meta) => {
            if (tool_item_1.ToolItem.isToolItem(meta)) {
                if (meta.name === 'vertices') {
                    normalizedTools.unshift(meta);
                }
                else {
                    normalizedTools.push(meta);
                }
            }
            else {
                const name = typeof meta === 'object' ? meta.name : meta;
                if (name === 'vertices') {
                    normalizedTools.unshift(meta);
                }
                else {
                    normalizedTools.push(meta);
                }
            }
        });
        for (let i = 0; i < normalizedTools.length; i += 1) {
            const meta = normalizedTools[i];
            let tool;
            if (tool_item_1.ToolItem.isToolItem(meta)) {
                tool = meta;
            }
            else {
                const name = typeof meta === 'object' ? meta.name : meta;
                const args = typeof meta === 'object' ? meta.args || {} : {};
                if (name) {
                    if (this.cell.isNode()) {
                        const ctor = tool_1.nodeToolRegistry.get(name);
                        if (ctor) {
                            tool = new ctor(args);
                        }
                        else {
                            return tool_1.nodeToolRegistry.onNotFound(name);
                        }
                    }
                    else if (this.cell.isEdge()) {
                        const ctor = tool_1.edgeToolRegistry.get(name);
                        if (ctor) {
                            tool = new ctor(args);
                        }
                        else {
                            return tool_1.edgeToolRegistry.onNotFound(name);
                        }
                    }
                }
            }
            if (tool) {
                tool.config(this.cellView, this);
                tool.render();
                const container = tool.options.isSVGElement !== false
                    ? this.svgContainer
                    : this.htmlContainer;
                container.appendChild(tool.container);
                this.tools.push(tool);
            }
        }
        return this;
    }
    update(options = {}) {
        const tools = this.tools;
        if (tools) {
            tools.forEach((tool) => {
                if (options.toolId !== tool.cid && tool.isVisible()) {
                    tool.update();
                }
            });
        }
        return this;
    }
    focus(focusedTool) {
        const tools = this.tools;
        if (tools) {
            tools.forEach((tool) => {
                if (focusedTool === tool) {
                    tool.show();
                }
                else {
                    tool.hide();
                }
            });
        }
        return this;
    }
    blur(blurredTool) {
        const tools = this.tools;
        if (tools) {
            tools.forEach((tool) => {
                if (tool !== blurredTool && !tool.isVisible()) {
                    tool.show();
                    tool.update();
                }
            });
        }
        return this;
    }
    hide() {
        return this.focus(null);
    }
    show() {
        return this.blur(null);
    }
    remove() {
        const tools = this.tools;
        if (tools) {
            tools.forEach((tool) => tool.remove());
            this.tools = null;
        }
        common_1.Dom.remove(this.svgContainer);
        common_1.Dom.remove(this.htmlContainer);
        return super.remove();
    }
    mount() {
        const tools = this.tools;
        const cellView = this.cellView;
        if (cellView && tools) {
            const hasSVG = tools.some((tool) => tool.options.isSVGElement !== false);
            const hasHTML = tools.some((tool) => tool.options.isSVGElement === false);
            if (hasSVG) {
                const parent = this.options.local
                    ? cellView.container
                    : cellView.graph.view.decorator;
                parent.appendChild(this.svgContainer);
            }
            if (hasHTML) {
                this.graph.container.appendChild(this.htmlContainer);
            }
        }
        return this;
    }
}
exports.ToolsView = ToolsView;
ToolsView.toStringTag = `X6.${ToolsView.name}`;
exports.ToolsViewToStringTag = `X6.${ToolsView.name}`;
//# sourceMappingURL=tool-view.js.map