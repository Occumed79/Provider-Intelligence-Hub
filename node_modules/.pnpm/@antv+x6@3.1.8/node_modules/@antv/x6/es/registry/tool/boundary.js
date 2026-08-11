import { __rest } from "tslib";
import { Dom, NumberExt } from '../../common';
import { ToolItem } from '../../view/tool';
import * as Util from './util';
export class Boundary extends ToolItem {
    onRender() {
        Dom.addClass(this.container, this.prefixClassName('cell-tool-boundary'));
        if (this.options.attrs) {
            const _a = this.options.attrs, { class: className } = _a, attrs = __rest(_a, ["class"]);
            Dom.attr(this.container, Dom.kebablizeAttrs(attrs));
            if (className) {
                Dom.addClass(this.container, className);
            }
        }
        this.update();
    }
    update() {
        const view = this.cellView;
        const options = this.options;
        const { useCellGeometry, rotate } = options;
        const padding = NumberExt.normalizeSides(options.padding);
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
                    Dom.rotate(this.container, angle, origin.x, origin.y, {
                        absolute: true,
                    });
                }
                else if (!rotate) {
                    bbox = bbox.bbox(angle);
                }
            }
        }
        Dom.attr(this.container, bbox.toJSON());
        return this;
    }
}
Boundary.defaults = Object.assign(Object.assign({}, ToolItem.getDefaults()), { name: 'boundary', tagName: 'rect', padding: 10, useCellGeometry: true, attrs: {
        fill: 'none',
        stroke: '#333',
        'stroke-width': 0.5,
        'stroke-dasharray': '5, 5',
        'pointer-events': 'none',
    } });
//# sourceMappingURL=boundary.js.map