import { __decorate } from "tslib";
import { disposable } from '../common';
import { Base } from './base';
export class SizeManager extends Base {
    getScroller() {
        const scroller = this.graph.getPlugin('scroller');
        if (scroller && scroller.options.enabled) {
            return scroller;
        }
        return null;
    }
    getContainer() {
        const scroller = this.getScroller();
        if (scroller) {
            return scroller.container.parentElement;
        }
        return this.graph.container.parentElement;
    }
    getSensorTarget() {
        const autoResize = this.options.autoResize;
        if (autoResize) {
            if (typeof autoResize === 'boolean') {
                return this.getContainer() || undefined;
            }
            return autoResize;
        }
    }
    init() {
        const autoResize = this.options.autoResize;
        if (autoResize) {
            const target = this.getSensorTarget();
            if (target) {
                if (typeof ResizeObserver === 'undefined') {
                    return;
                }
                this.ro = new ResizeObserver((entries) => {
                    if (!entries || entries.length === 0)
                        return;
                    const { width, height } = entries[0].contentRect;
                    this.resize(Math.round(width), Math.round(height));
                });
                this.ro.observe(target);
                const width = target.offsetWidth;
                const height = target.offsetHeight;
                this.resize(width, height);
            }
        }
    }
    resize(width, height) {
        const scroller = this.getScroller();
        if (scroller) {
            scroller.resize(width, height);
        }
        else {
            this.graph.transform.resize(width, height);
        }
    }
    dispose() {
        if (this.ro) {
            this.ro.disconnect();
            this.ro = undefined;
        }
    }
}
__decorate([
    disposable()
], SizeManager.prototype, "dispose", null);
//# sourceMappingURL=size.js.map