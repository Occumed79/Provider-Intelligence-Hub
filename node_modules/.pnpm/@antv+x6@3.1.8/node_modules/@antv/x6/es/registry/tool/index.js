import { __rest } from "tslib";
import { ToolItem, } from '../../view/tool';
import { Registry } from '../registry';
import { SourceAnchor, TargetAnchor } from './anchor';
import { SourceArrowhead, TargetArrowhead } from './arrowhead';
import { Boundary } from './boundary';
import { Button, Remove } from './button';
import { EdgeEditor, NodeEditor } from './editor';
import { Segments } from './segments';
import { Vertices } from './vertices';
/**
 * ========== NodeTool ==========
 */
export const nodeToolPresets = {
    boundary: Boundary,
    button: Button,
    'button-remove': Remove,
    'node-editor': NodeEditor,
};
export const nodeToolRegistry = Registry.create({
    type: 'node tool',
    process(name, options) {
        if (typeof options === 'function') {
            return options;
        }
        let parent = ToolItem;
        const { inherit } = options, others = __rest(options, ["inherit"]);
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
nodeToolRegistry.register(nodeToolPresets, true);
/**
 * ======== EdgeTool ==========
 */
export const edgeToolPresets = {
    boundary: Boundary,
    vertices: Vertices,
    segments: Segments,
    button: Button,
    'button-remove': Remove,
    'source-anchor': SourceAnchor,
    'target-anchor': TargetAnchor,
    'source-arrowhead': SourceArrowhead,
    'target-arrowhead': TargetArrowhead,
    'edge-editor': EdgeEditor,
};
export const edgeToolRegistry = Registry.create({
    type: 'edge tool',
    process(name, options) {
        if (typeof options === 'function') {
            return options;
        }
        let parent = ToolItem;
        const { inherit } = options, others = __rest(options, ["inherit"]);
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
edgeToolRegistry.register(edgeToolPresets, true);
//# sourceMappingURL=index.js.map