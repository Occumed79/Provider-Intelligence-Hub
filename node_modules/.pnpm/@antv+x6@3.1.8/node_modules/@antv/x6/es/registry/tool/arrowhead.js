import { __rest } from "tslib";
import { Dom } from '../../common';
import { Point } from '../../geometry';
import { ToolItem } from '../../view/tool';
class Arrowhead extends ToolItem {
    get type() {
        return this.options.type;
    }
    get ratio() {
        return this.options.ratio;
    }
    init() {
        if (this.options.attrs) {
            const _a = this.options.attrs, { class: className } = _a, attrs = __rest(_a, ["class"]);
            this.setAttrs(attrs, this.container);
            if (className) {
                Dom.addClass(this.container, className);
            }
        }
    }
    onRender() {
        Dom.addClass(this.container, this.prefixClassName(`edge-tool-${this.type}-arrowhead`));
        this.update();
    }
    update() {
        const ratio = this.ratio;
        const edgeView = this.cellView;
        const tangent = edgeView.getTangentAtRatio(ratio);
        const position = tangent ? tangent.start : edgeView.getPointAtRatio(ratio);
        const angle = (tangent && tangent.vector().vectorAngle(new Point(1, 0))) || 0;
        if (!position) {
            return this;
        }
        const matrix = Dom.createSVGMatrix()
            .translate(position.x, position.y)
            .rotate(angle);
        Dom.transform(this.container, matrix, { absolute: true });
        return this;
    }
    onMouseDown(evt) {
        if (this.guard(evt)) {
            return;
        }
        evt.stopPropagation();
        evt.preventDefault();
        const edgeView = this.cellView;
        if (edgeView.can('arrowheadMovable')) {
            edgeView.cell.startBatch('move-arrowhead', {
                ui: true,
                toolId: this.cid,
            });
            const coords = this.graph.snapToGrid(evt.clientX, evt.clientY);
            const data = edgeView.prepareArrowheadDragging(this.type, {
                x: coords.x,
                y: coords.y,
                options: Object.assign(Object.assign({}, this.options), { toolId: this.cid }),
            });
            this.cellView.setEventData(evt, data);
            this.delegateDocumentEvents(this.options.documentEvents, evt.data);
            edgeView.graph.view.undelegateEvents();
            this.container.style.pointerEvents = 'none';
        }
        this.focus();
    }
    onMouseMove(evt) {
        const e = this.normalizeEvent(evt);
        const coords = this.graph.snapToGrid(e.clientX, e.clientY);
        this.cellView.onMouseMove(e, coords.x, coords.y);
        this.update();
    }
    onMouseUp(evt) {
        this.undelegateDocumentEvents();
        const e = this.normalizeEvent(evt);
        const edgeView = this.cellView;
        const coords = this.graph.snapToGrid(e.clientX, e.clientY);
        edgeView.onMouseUp(e, coords.x, coords.y);
        this.graph.view.delegateEvents();
        this.blur();
        this.container.style.pointerEvents = '';
        edgeView.cell.stopBatch('move-arrowhead', {
            ui: true,
            toolId: this.cid,
        });
    }
}
Arrowhead.defaults = Object.assign(Object.assign({}, ToolItem.getDefaults()), { tagName: 'path', isSVGElement: true, events: {
        mousedown: 'onMouseDown',
        touchstart: 'onMouseDown',
    }, documentEvents: {
        mousemove: 'onMouseMove',
        touchmove: 'onMouseMove',
        mouseup: 'onMouseUp',
        touchend: 'onMouseUp',
        touchcancel: 'onMouseUp',
    } });
export class SourceArrowhead extends Arrowhead {
}
SourceArrowhead.defaults = Object.assign(Object.assign({}, Arrowhead.getDefaults()), { name: 'source-arrowhead', type: 'source', ratio: 0, attrs: {
        d: 'M 10 -8 -10 0 10 8 Z',
        fill: '#333',
        stroke: '#fff',
        'stroke-width': 2,
        cursor: 'move',
    } });
export class TargetArrowhead extends Arrowhead {
}
TargetArrowhead.defaults = Object.assign(Object.assign({}, Arrowhead.getDefaults()), { name: 'target-arrowhead', type: 'target', ratio: 1, attrs: {
        d: 'M -10 -8 10 0 -10 8 Z',
        fill: '#333',
        stroke: '#fff',
        'stroke-width': 2,
        cursor: 'move',
    } });
//# sourceMappingURL=arrowhead.js.map