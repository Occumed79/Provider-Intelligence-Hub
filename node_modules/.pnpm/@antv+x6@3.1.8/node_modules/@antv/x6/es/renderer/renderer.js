/* eslint-disable @typescript-eslint/no-unused-vars */
import { __decorate } from "tslib";
import { disposable, Util } from '../common';
import { Rectangle } from '../geometry';
import { Base } from '../graph/base';
import { Cell } from '../model';
import { Scheduler } from './scheduler';
export class Renderer extends Base {
    constructor() {
        super(...arguments);
        this.schedule = new Scheduler(this.graph);
    }
    requestViewUpdate(view, flag, options = {}) {
        this.schedule.requestViewUpdate(view, flag, options);
    }
    isViewMounted(view) {
        return this.schedule.isViewMounted(view);
    }
    setRenderArea(area) {
        this.schedule.setRenderArea(area);
    }
    findViewByElem(elem) {
        if (elem == null) {
            return null;
        }
        const container = this.options.container;
        const target = typeof elem === 'string'
            ? container.querySelector(elem)
            : elem instanceof Element
                ? elem
                : elem[0];
        if (target) {
            const id = this.graph.view.findAttr('data-cell-id', target);
            if (id) {
                const views = this.schedule.views;
                if (views[id]) {
                    return views[id].view;
                }
            }
        }
        return null;
    }
    findViewByCell(cell) {
        if (cell == null) {
            return null;
        }
        const id = Cell.isCell(cell) ? cell.id : cell;
        const views = this.schedule.views;
        if (views[id]) {
            return views[id].view;
        }
        return null;
    }
    findViewsFromPoint(p) {
        const ref = { x: p.x, y: p.y };
        return this.model
            .getCells()
            .map((cell) => this.findViewByCell(cell))
            .filter((view) => {
            if (view != null) {
                return Util.getBBox(view.container, {
                    target: this.view.stage,
                }).containsPoint(ref);
            }
            return false;
        });
    }
    findEdgeViewsFromPoint(p, threshold = 5) {
        return this.model
            .getEdges()
            .map((edge) => this.findViewByCell(edge))
            .filter((view) => {
            if (view != null) {
                const point = view.getClosestPoint(p);
                if (point) {
                    return point.distance(p) <= threshold;
                }
            }
            return false;
        });
    }
    findViewsInArea(rect, options = {}) {
        const area = Rectangle.create(rect);
        return this.model
            .getCells()
            .map((cell) => this.findViewByCell(cell))
            .filter((view) => {
            if (view) {
                if (options.nodeOnly && !view.isNodeView()) {
                    return false;
                }
                const bbox = Util.getBBox(view.container, {
                    target: this.view.stage,
                });
                if (bbox.width === 0) {
                    bbox.inflate(1, 0);
                }
                else if (bbox.height === 0) {
                    bbox.inflate(0, 1);
                }
                return options.strict
                    ? area.containsRect(bbox)
                    : area.isIntersectWithRect(bbox);
            }
            return false;
        });
    }
    dispose() {
        this.schedule.dispose();
    }
}
__decorate([
    disposable()
], Renderer.prototype, "dispose", null);
//# sourceMappingURL=renderer.js.map