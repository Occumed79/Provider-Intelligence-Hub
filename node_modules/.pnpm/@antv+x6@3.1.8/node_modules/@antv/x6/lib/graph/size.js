"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeManager = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const base_1 = require("./base");
class SizeManager extends base_1.Base {
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
exports.SizeManager = SizeManager;
tslib_1.__decorate([
    (0, common_1.disposable)()
], SizeManager.prototype, "dispose", null);
//# sourceMappingURL=size.js.map