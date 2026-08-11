"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edgeToolRegistry = exports.edgeToolPresets = exports.nodeToolRegistry = exports.nodeToolPresets = void 0;
const tslib_1 = require("tslib");
const tool_1 = require("../../view/tool");
const registry_1 = require("../registry");
const anchor_1 = require("./anchor");
const arrowhead_1 = require("./arrowhead");
const boundary_1 = require("./boundary");
const button_1 = require("./button");
const editor_1 = require("./editor");
const segments_1 = require("./segments");
const vertices_1 = require("./vertices");
/**
 * ========== NodeTool ==========
 */
exports.nodeToolPresets = {
    boundary: boundary_1.Boundary,
    button: button_1.Button,
    'button-remove': button_1.Remove,
    'node-editor': editor_1.NodeEditor,
};
exports.nodeToolRegistry = registry_1.Registry.create({
    type: 'node tool',
    process(name, options) {
        if (typeof options === 'function') {
            return options;
        }
        let parent = tool_1.ToolItem;
        const { inherit } = options, others = tslib_1.__rest(options, ["inherit"]);
        if (inherit) {
            const base = this.get(inherit);
            if (base == null) {
                this.onNotFound(inherit, 'inherited');
            }
            else {
                parent = base;
            }
        }
        if (others.name == null) {
            others.name = name;
        }
        return parent.define.call(parent, others);
    },
});
exports.nodeToolRegistry.register(exports.nodeToolPresets, true);
/**
 * ======== EdgeTool ==========
 */
exports.edgeToolPresets = {
    boundary: boundary_1.Boundary,
    vertices: vertices_1.Vertices,
    segments: segments_1.Segments,
    button: button_1.Button,
    'button-remove': button_1.Remove,
    'source-anchor': anchor_1.SourceAnchor,
    'target-anchor': anchor_1.TargetAnchor,
    'source-arrowhead': arrowhead_1.SourceArrowhead,
    'target-arrowhead': arrowhead_1.TargetArrowhead,
    'edge-editor': editor_1.EdgeEditor,
};
exports.edgeToolRegistry = registry_1.Registry.create({
    type: 'edge tool',
    process(name, options) {
        if (typeof options === 'function') {
            return options;
        }
        let parent = tool_1.ToolItem;
        const { inherit } = options, others = tslib_1.__rest(options, ["inherit"]);
        if (inherit) {
            const base = this.get(inherit);
            if (base == null) {
                this.onNotFound(inherit, 'inherited');
            }
            else {
                parent = base;
            }
        }
        if (others.name == null) {
            others.name = name;
        }
        return parent.define.call(parent, others);
    },
});
exports.edgeToolRegistry.register(exports.edgeToolPresets, true);
//# sourceMappingURL=index.js.map