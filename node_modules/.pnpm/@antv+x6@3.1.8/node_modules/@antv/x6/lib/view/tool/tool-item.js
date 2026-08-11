"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolItemToStringTag = exports.ToolItem = void 0;
const common_1 = require("../../common");
const markup_1 = require("../markup");
const view_1 = require("../view");
const util_1 = require("../view/util");
const util_2 = require("./util");
class ToolItem extends view_1.View {
    static isToolItem(instance) {
        if (instance == null) {
            return false;
        }
        if (instance instanceof ToolItem) {
            return true;
        }
        const tag = instance[Symbol.toStringTag];
        const view = instance;
        if ((tag == null || tag === exports.ToolItemToStringTag) &&
            view.graph != null &&
            view.cell != null &&
            typeof view.config === 'function' &&
            typeof view.update === 'function' &&
            typeof view.focus === 'function' &&
            typeof view.blur === 'function' &&
            typeof view.show === 'function' &&
            typeof view.hide === 'function' &&
            typeof view.isVisible === 'function') {
            return true;
        }
        return false;
    }
    static define(options) {
        const Base = this;
        const tool = common_1.ObjectExt.createClass((0, util_2.getClassName)(options.name), Base);
        tool.config(options);
        return tool;
    }
    static getDefaults() {
        return this.defaults;
    }
    static config(options) {
        this.defaults = this.getOptions(options);
    }
    static getOptions(options) {
        return common_1.ObjectExt.merge(common_1.ObjectExt.cloneDeep(this.getDefaults()), options);
    }
    get graph() {
        return this.cellView.graph;
    }
    get cell() {
        return this.cellView.cell;
    }
    get name() {
        return this.options.name;
    }
    get [Symbol.toStringTag]() {
        return exports.ToolItemToStringTag;
    }
    constructor(options = {}) {
        super();
        this.visible = true;
        this.options = this.getOptions(options);
        this.container = (0, util_1.createViewElement)(this.options.tagName || 'g', this.options.isSVGElement !== false);
        common_1.Dom.addClass(this.container, this.prefixClassName('cell-tool'));
        if (typeof this.options.className === 'string') {
            common_1.Dom.addClass(this.container, this.options.className);
        }
        this.init();
    }
    init() { }
    getOptions(options) {
        const ctor = this.constructor;
        return ctor.getOptions(options);
    }
    delegateEvents() {
        if (this.options.events) {
            super.delegateEvents(this.options.events);
        }
        return this;
    }
    config(view, toolsView) {
        this.cellView = view;
        this.parent = toolsView;
        this.stamp(this.container);
        if (this.cell.isEdge()) {
            common_1.Dom.addClass(this.container, this.prefixClassName('edge-tool'));
        }
        else if (this.cell.isNode()) {
            common_1.Dom.addClass(this.container, this.prefixClassName('node-tool'));
        }
        if (this.name) {
            this.container.setAttribute('data-tool-name', this.name);
        }
        this.delegateEvents();
        return this;
    }
    render() {
        this.empty();
        const markup = this.options.markup;
        if (markup) {
            const meta = markup_1.Markup.parseJSONMarkup(markup);
            this.container.appendChild(meta.fragment);
            this.childNodes = meta.selectors;
        }
        this.onRender();
        return this;
    }
    onRender() { }
    update() {
        return this;
    }
    stamp(elem) {
        if (elem) {
            elem.setAttribute('data-cell-id', this.cellView.cell.id);
        }
    }
    show() {
        this.container.style.display = '';
        this.visible = true;
        return this;
    }
    hide() {
        this.container.style.display = 'none';
        this.visible = false;
        return this;
    }
    isVisible() {
        return this.visible;
    }
    focus() {
        const opacity = this.options.focusOpacity;
        if (opacity != null && Number.isFinite(opacity)) {
            this.container.style.opacity = `${opacity}`;
        }
        this.parent.focus(this);
        return this;
    }
    blur() {
        this.container.style.opacity = '';
        this.parent.blur(this);
        return this;
    }
    guard(evt) {
        if (this.graph == null || this.cellView == null) {
            return true;
        }
        return this.graph.view.guard(evt, this.cellView);
    }
}
exports.ToolItem = ToolItem;
// #region static
ToolItem.toStringTag = `X6.${ToolItem.name}`;
ToolItem.defaults = {
    isSVGElement: true,
    tagName: 'g',
};
exports.ToolItemToStringTag = `X6.${ToolItem.name}`;
//# sourceMappingURL=tool-item.js.map