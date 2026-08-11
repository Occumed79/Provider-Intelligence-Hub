import { __decorate } from "tslib";
import { Dom, disposable, FunctionExt } from '../common';
import { Base } from './base';
const DEFAULT_MARGIN = 120;
export class VirtualRenderManager extends Base {
    init() {
        this.resetRenderArea = FunctionExt.throttle(this.resetRenderArea, 200, {
            leading: true,
        });
        this.resetRenderArea();
        this.startListening();
    }
    bindScrollerEvents(scroller) {
        this.scrollerRef = scroller;
        if (typeof scroller.on === 'function') {
            scroller.on('pan:start', this.resetRenderArea, this);
            scroller.on('panning', this.resetRenderArea, this);
            scroller.on('pan:stop', this.resetRenderArea, this);
        }
        const container = scroller.container;
        if (container) {
            this.scrollerScrollHandler = (_e) => {
                this.resetRenderArea();
            };
            Dom.Event.on(container, 'scroll', this.scrollerScrollHandler);
        }
    }
    startListening() {
        this.graph.on('translate', this.resetRenderArea, this);
        this.graph.on('scale', this.resetRenderArea, this);
        this.graph.on('resize', this.resetRenderArea, this);
        const scroller = this.graph.getPlugin('scroller');
        if (scroller) {
            this.bindScrollerEvents(scroller);
        }
    }
    stopListening() {
        this.graph.off('translate', this.resetRenderArea, this);
        this.graph.off('scale', this.resetRenderArea, this);
        this.graph.off('resize', this.resetRenderArea, this);
        this.unbindScroller();
    }
    onScrollerReady(scroller) {
        if (this.scrollerRef === scroller)
            return;
        this.unbindScroller();
        this.bindScrollerEvents(scroller);
        this.resetRenderArea();
    }
    unbindScroller() {
        if (this.scrollerRef) {
            if (typeof this.scrollerRef.off === 'function') {
                this.scrollerRef.off('pan:start', this.resetRenderArea, this);
                this.scrollerRef.off('panning', this.resetRenderArea, this);
                this.scrollerRef.off('pan:stop', this.resetRenderArea, this);
            }
            const container = this.scrollerRef.container;
            if (container && this.scrollerScrollHandler) {
                Dom.Event.off(container, 'scroll', this.scrollerScrollHandler);
            }
            this.scrollerRef = undefined;
            this.scrollerScrollHandler = undefined;
        }
    }
    setVirtualEnabled(enabled) {
        const virtualOptions = this.options.virtual;
        if (typeof virtualOptions === 'object') {
            const tempVirtualOptions = virtualOptions;
            this.options.virtual = Object.assign(Object.assign({}, tempVirtualOptions), { enabled });
        }
        else {
            this.options.virtual = enabled;
        }
    }
    enableVirtualRender() {
        this.setVirtualEnabled(true);
        this.resetRenderArea();
    }
    disableVirtualRender() {
        this.setVirtualEnabled(false);
        this.graph.renderer.setRenderArea(undefined);
    }
    isVirtualEnabled() {
        const virtualOptions = this.options.virtual;
        return virtualOptions != null && typeof virtualOptions === 'object'
            ? virtualOptions.enabled !== false
            : !!virtualOptions;
    }
    getVirtualMargin() {
        const virtualOptions = this.options.virtual;
        if (typeof virtualOptions === 'object') {
            const margin = virtualOptions.margin;
            return typeof margin === 'number' ? margin : DEFAULT_MARGIN;
        }
        return DEFAULT_MARGIN;
    }
    resetRenderArea() {
        const enabled = this.isVirtualEnabled();
        if (enabled) {
            const renderArea = this.graph.getGraphArea();
            if (renderArea) {
                // 开启虚拟渲染时，为可视区域添加缓冲边距
                const margin = this.getVirtualMargin();
                const eff = renderArea.clone();
                eff.inflate(margin, margin);
                this.graph.renderer.setRenderArea(eff);
                return;
            }
        }
    }
    dispose() {
        this.stopListening();
    }
}
__decorate([
    disposable()
], VirtualRenderManager.prototype, "dispose", null);
//# sourceMappingURL=virtual-render.js.map