"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualRenderManager = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const base_1 = require("./base");
const DEFAULT_MARGIN = 120;
class VirtualRenderManager extends base_1.Base {
    init() {
        this.resetRenderArea = common_1.FunctionExt.throttle(this.resetRenderArea, 200, {
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
            common_1.Dom.Event.on(container, 'scroll', this.scrollerScrollHandler);
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
                common_1.Dom.Event.off(container, 'scroll', this.scrollerScrollHandler);
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
exports.VirtualRenderManager = VirtualRenderManager;
tslib_1.__decorate([
    (0, common_1.disposable)()
], VirtualRenderManager.prototype, "dispose", null);
//# sourceMappingURL=virtual-render.js.map