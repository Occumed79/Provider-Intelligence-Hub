"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transform = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const raw_1 = require("./style/raw");
const transform_1 = require("./transform");
require("./api");
class Transform extends common_1.Basecoat {
    constructor(options = {}) {
        super();
        this.name = 'transform';
        this.widgets = new Map();
        this.disabled = false;
        this.options = options;
        common_1.CssLoader.ensure(this.name, raw_1.content);
    }
    init(graph) {
        this.graph = graph;
        if (this.disabled) {
            return;
        }
        this.startListening();
    }
    startListening() {
        this.graph.on('node:click', this.onNodeClick, this);
        this.graph.on('blank:mousedown', this.onBlankMouseDown, this);
    }
    stopListening() {
        this.graph.off('node:click', this.onNodeClick, this);
        this.graph.off('blank:mousedown', this.onBlankMouseDown, this);
    }
    enable() {
        if (this.disabled) {
            this.disabled = false;
            this.startListening();
        }
    }
    disable() {
        if (!this.disabled) {
            this.disabled = true;
            this.stopListening();
        }
    }
    isEnabled() {
        return !this.disabled;
    }
    createWidget(node) {
        this.clearWidgets();
        const widget = this.createTransform(node);
        if (widget) {
            this.widgets.set(node, widget);
            widget.on('*', (name, args) => {
                this.trigger(name, args);
                this.graph.trigger(name, args);
            });
        }
    }
    onNodeClick({ node }) {
        this.createWidget(node);
    }
    onBlankMouseDown() {
        this.clearWidgets();
    }
    createTransform(node) {
        const options = this.getTransformOptions(node);
        if (options.resizable || options.rotatable) {
            return new transform_1.TransformImpl(options, node, this.graph);
        }
        return null;
    }
    parseOptionGroup(graph, arg, options) {
        const result = {};
        Object.keys(options || {}).forEach((key) => {
            const val = options[key];
            result[key] = typeof val === 'function' ? val.call(graph, arg) : val;
        });
        return result;
    }
    getTransformOptions(node) {
        if (!this.options.resizing) {
            this.options.resizing = {
                enabled: false,
            };
        }
        if (!this.options.rotating) {
            this.options.rotating = {
                enabled: false,
            };
        }
        if (typeof this.options.resizing === 'boolean') {
            this.options.resizing = {
                enabled: this.options.resizing,
            };
        }
        if (typeof this.options.rotating === 'boolean') {
            this.options.rotating = {
                enabled: this.options.rotating,
            };
        }
        const resizing = this.parseOptionGroup(this.graph, node, this.options.resizing);
        const rotating = this.parseOptionGroup(this.graph, node, this.options.rotating);
        const options = {
            resizable: !!resizing.enabled,
            minWidth: resizing.minWidth || 0,
            maxWidth: resizing.maxWidth || Number.MAX_SAFE_INTEGER,
            minHeight: resizing.minHeight || 0,
            maxHeight: resizing.maxHeight || Number.MAX_SAFE_INTEGER,
            orthogonalResizing: typeof resizing.orthogonal === 'boolean' ? resizing.orthogonal : true,
            restrictedResizing: !!resizing.restrict,
            autoScrollOnResizing: typeof resizing.autoScroll === 'boolean' ? resizing.autoScroll : true,
            preserveAspectRatio: !!resizing.preserveAspectRatio,
            allowReverse: typeof resizing.allowReverse === 'boolean'
                ? resizing.allowReverse
                : true,
            rotatable: !!rotating.enabled,
            rotateGrid: rotating.grid || 15,
        };
        return options;
    }
    clearWidgets() {
        this.widgets.forEach((widget, node) => {
            if (this.graph.getCellById(node.id)) {
                widget.dispose();
            }
        });
        this.widgets.clear();
    }
    dispose() {
        this.clearWidgets();
        this.stopListening();
        this.off();
        common_1.CssLoader.clean(this.name);
    }
}
exports.Transform = Transform;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Transform.prototype, "dispose", null);
//# sourceMappingURL=index.js.map