"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Boundary = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const tool_1 = require("../../view/tool");
const Util = tslib_1.__importStar(require("./util"));
class Boundary extends tool_1.ToolItem {
    onRender() {
        common_1.Dom.addClass(this.container, this.prefixClassName('cell-tool-boundary'));
        if (this.options.attrs) {
            const _a = this.options.attrs, { class: className } = _a, attrs = tslib_1.__rest(_a, ["class"]);
            common_1.Dom.attr(this.container, common_1.Dom.kebablizeAttrs(attrs));
            if (className) {
                common_1.Dom.addClass(this.container, className);
            }
        }
        this.update();
    }
    update() {
        const view = this.cellView;
        const options = this.options;
        const { useCellGeometry, rotate } = options;
        const padding = common_1.NumberExt.normalizeSides(options.padding);
        let bbox = Util.getViewBBox(view, useCellGeometry);
        if (this.parent.options.local) {
            bbox = bbox.translate({
                x: -bbox.x,
                y: -bbox.y,
            });
        }
        bbox = bbox.moveAndExpand({
            x: -padding.left,
            y: -padding.top,
            width: padding.left + padding.right,
            height: padding.top + padding.bottom,
        });
        const cell = view.cell;
        if (cell.isNode()) {
            const angle = cell.getAngle();
            if (angle != null) {
                if (rotate && !this.parent.options.local) {
                    const origin = cell.getBBox().getCenter();
                    common_1.Dom.rotate(this.container, angle, origin.x, origin.y, {
                        absolute: true,
                    });
                }
                else if (!rotate) {
                    bbox = bbox.bbox(angle);
                }
            }
        }
        common_1.Dom.attr(this.container, bbox.toJSON());
        return this;
    }
}
exports.Boundary = Boundary;
Boundary.defaults = Object.assign(Object.assign({}, tool_1.ToolItem.getDefaults()), { name: 'boundary', tagName: 'rect', padding: 10, useCellGeometry: true, attrs: {
        fill: 'none',
        stroke: '#333',
        'stroke-width': 0.5,
        'stroke-dasharray': '5, 5',
        'pointer-events': 'none',
    } });
//# sourceMappingURL=boundary.js.map