"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Remove = exports.Button = void 0;
const common_1 = require("../../common");
const geometry_1 = require("../../geometry");
const tool_1 = require("../../view/tool");
const util_1 = require("./util");
class Button extends tool_1.ToolItem {
    onRender() {
        common_1.Dom.addClass(this.container, this.prefixClassName('cell-tool-button'));
        this.update();
    }
    update() {
        this.updatePosition();
        return this;
    }
    updatePosition() {
        const view = this.cellView;
        const matrix = view.cell.isEdge()
            ? this.getEdgeMatrix()
            : this.getNodeMatrix();
        common_1.Dom.transform(this.container, matrix, { absolute: true });
    }
    getNodeMatrix() {
        const view = this.cellView;
        const options = this.options;
        let { x = 0, y = 0 } = options;
        const { offset, useCellGeometry, rotate } = options;
        let bbox = (0, util_1.getViewBBox)(view, useCellGeometry);
        const angle = view.cell.getAngle();
        if (!rotate) {
            bbox = bbox.bbox(angle);
        }
        let offsetX = 0;
        let offsetY = 0;
        if (typeof offset === 'number') {
            offsetX = offset;
            offsetY = offset;
        }
        else if (typeof offset === 'object') {
            offsetX = offset.x;
            offsetY = offset.y;
        }
        x = common_1.NumberExt.normalizePercentage(x, bbox.width);
        y = common_1.NumberExt.normalizePercentage(y, bbox.height);
        let matrix = common_1.Dom.createSVGMatrix();
        if (this.parent.options.local) {
            matrix = matrix.translate(bbox.width / 2, bbox.height / 2);
        }
        else {
            matrix = matrix.translate(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
        }
        if (rotate) {
            matrix = matrix.rotate(angle);
        }
        matrix = matrix.translate(x + offsetX - bbox.width / 2, y + offsetY - bbox.height / 2);
        return matrix;
    }
    getEdgeMatrix() {
        const view = this.cellView;
        const options = this.options;
        const { offset = 0, distance = 0, rotate } = options;
        const d = common_1.NumberExt.normalizePercentage(distance, 1);
        const tangent = d >= 0 && d <= 1 ? view.getTangentAtRatio(d) : view.getTangentAtLength(d);
        const position = tangent ? tangent.start : view.getConnection().start;
        const angle = tangent
            ? tangent.vector().vectorAngle(new geometry_1.Point(1, 0)) || 0
            : 0;
        let matrix = common_1.Dom.createSVGMatrix()
            .translate(position.x, position.y)
            .rotate(angle);
        if (typeof offset === 'object') {
            matrix = matrix.translate(offset.x || 0, offset.y || 0);
        }
        else {
            matrix = matrix.translate(0, offset);
        }
        if (!rotate) {
            matrix = matrix.rotate(-angle);
        }
        return matrix;
    }
    onMouseDown(e) {
        if (this.guard(e)) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        const onClick = this.options.onClick;
        if (typeof onClick === 'function') {
            common_1.FunctionExt.call(onClick, this.cellView, {
                e,
                view: this.cellView,
                cell: this.cellView.cell,
                btn: this,
            });
        }
    }
}
exports.Button = Button;
Button.defaults = Object.assign(Object.assign({}, tool_1.ToolItem.getDefaults()), { name: 'button', useCellGeometry: true, events: {
        mousedown: 'onMouseDown',
        touchstart: 'onMouseDown',
    } });
class Remove extends Button {
}
exports.Remove = Remove;
Remove.defaults = Object.assign(Object.assign({}, Button.getDefaults()), { name: 'button-remove', markup: [
        {
            tagName: 'circle',
            selector: 'button',
            attrs: {
                r: 7,
                fill: '#FF1D00',
                cursor: 'pointer',
            },
        },
        {
            tagName: 'path',
            selector: 'icon',
            attrs: {
                d: 'M -3 -3 3 3 M -3 3 3 -3',
                fill: 'none',
                stroke: '#FFFFFF',
                'stroke-width': 2,
                'pointer-events': 'none',
            },
        },
    ], distance: 60, offset: 0, useCellGeometry: true, onClick({ view, btn }) {
        btn.parent.remove();
        view.cell.remove({ ui: true, toolId: btn.cid });
    } });
//# sourceMappingURL=button.js.map