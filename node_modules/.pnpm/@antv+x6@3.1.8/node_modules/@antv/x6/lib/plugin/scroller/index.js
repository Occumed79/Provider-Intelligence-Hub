"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scroller = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const config_1 = require("../../config");
const scroller_1 = require("./scroller");
const raw_1 = require("./style/raw");
require("./api");
class Scroller extends common_1.Basecoat {
    get pannable() {
        if (this.options) {
            if (typeof this.options.pannable === 'object') {
                return this.options.pannable.enabled;
            }
            return !!this.options.pannable;
        }
        return false;
    }
    get container() {
        return this.scrollerImpl.container;
    }
    constructor(options = {}) {
        super();
        this.name = 'scroller';
        this.options = options;
        common_1.CssLoader.ensure(this.name, raw_1.content);
    }
    init(graph) {
        this.graph = graph;
        const options = (0, scroller_1.getOptions)(Object.assign(Object.assign({ enabled: true }, this.options), { graph }));
        this.options = options;
        this.scrollerImpl = new scroller_1.ScrollerImpl(options);
        this.setup();
        this.autoDisableGraphPanning();
        this.startListening();
        this.updateClassName();
        this.scrollerImpl.center();
    }
    // #region api
    resize(width, height) {
        this.scrollerImpl.resize(width, height);
    }
    resizePage(width, height) {
        this.scrollerImpl.updatePageSize(width, height);
    }
    zoom(factor, options) {
        if (typeof factor === 'undefined') {
            return this.scrollerImpl.zoom();
        }
        this.scrollerImpl.zoom(factor, options);
        return this;
    }
    zoomTo(factor, options = {}) {
        this.scrollerImpl.zoom(factor, Object.assign(Object.assign({}, options), { absolute: true }));
        return this;
    }
    zoomToRect(rect, options = {}) {
        this.scrollerImpl.zoomToRect(rect, options);
        return this;
    }
    zoomToFit(options = {}) {
        this.scrollerImpl.zoomToFit(options);
        return this;
    }
    center(optons) {
        return this.centerPoint(optons);
    }
    centerPoint(x, y, options) {
        this.scrollerImpl.centerPoint(x, y, options);
        return this;
    }
    centerContent(options) {
        this.scrollerImpl.centerContent(options);
        return this;
    }
    centerCell(cell, options) {
        this.scrollerImpl.centerCell(cell, options);
        return this;
    }
    positionPoint(point, x, y, options = {}) {
        this.scrollerImpl.positionPoint(point, x, y, options);
        return this;
    }
    positionRect(rect, direction, options) {
        this.scrollerImpl.positionRect(rect, direction, options);
        return this;
    }
    positionCell(cell, direction, options) {
        this.scrollerImpl.positionCell(cell, direction, options);
        return this;
    }
    positionContent(pos, options) {
        this.scrollerImpl.positionContent(pos, options);
        return this;
    }
    drawBackground(options, onGraph) {
        if (this.graph.options.background == null || !onGraph) {
            this.scrollerImpl.backgroundManager.draw(options);
        }
        return this;
    }
    clearBackground(onGraph) {
        if (this.graph.options.background == null || !onGraph) {
            this.scrollerImpl.backgroundManager.clear();
        }
        return this;
    }
    isPannable() {
        return this.pannable;
    }
    enablePanning() {
        if (!this.pannable) {
            this.options.pannable = true;
            this.updateClassName();
        }
    }
    disablePanning() {
        if (this.pannable) {
            this.options.pannable = false;
            this.updateClassName();
        }
    }
    togglePanning(pannable) {
        if (pannable == null) {
            if (this.isPannable()) {
                this.disablePanning();
            }
            else {
                this.enablePanning();
            }
        }
        else if (pannable !== this.isPannable()) {
            if (pannable) {
                this.enablePanning();
            }
            else {
                this.disablePanning();
            }
        }
        return this;
    }
    lockScroller() {
        this.scrollerImpl.lock();
        return this;
    }
    unlockScroller() {
        this.scrollerImpl.unlock();
        return this;
    }
    updateScroller() {
        this.scrollerImpl.update();
        return this;
    }
    getScrollbarPosition() {
        return this.scrollerImpl.scrollbarPosition();
    }
    setScrollbarPosition(left, top) {
        this.scrollerImpl.scrollbarPosition(left, top);
        return this;
    }
    scrollToPoint(x, y) {
        this.scrollerImpl.scrollToPoint(x, y);
        return this;
    }
    scrollToContent() {
        this.scrollerImpl.scrollToContent();
        return this;
    }
    scrollToCell(cell) {
        this.scrollerImpl.scrollToCell(cell);
        return this;
    }
    transitionToPoint(x, y, options) {
        this.scrollerImpl.transitionToPoint(x, y, options);
        return this;
    }
    transitionToRect(rect, options = {}) {
        this.scrollerImpl.transitionToRect(rect, options);
        return this;
    }
    enableAutoResize() {
        this.scrollerImpl.enableAutoResize();
    }
    disableAutoResize() {
        this.scrollerImpl.disableAutoResize();
    }
    autoScroll(clientX, clientY) {
        return this.scrollerImpl.autoScroll(clientX, clientY);
    }
    clientToLocalPoint(x, y) {
        return this.scrollerImpl.clientToLocalPoint(x, y);
    }
    getVisibleArea() {
        return this.scrollerImpl.getVisibleArea();
    }
    isCellVisible(cell, options = {}) {
        return this.scrollerImpl.isCellVisible(cell, options);
    }
    isPointVisible(point) {
        return this.scrollerImpl.isPointVisible(point);
    }
    // #endregion
    setup() {
        this.scrollerImpl.on('*', (name, args) => {
            this.trigger(name, args);
        });
    }
    startListening() {
        let eventTypes = [];
        const pannable = this.options.pannable;
        if (typeof pannable === 'object') {
            eventTypes = pannable.eventTypes || [];
        }
        else {
            eventTypes = ['leftMouseDown'];
        }
        if (eventTypes.includes('leftMouseDown')) {
            this.graph.on('blank:mousedown', this.preparePanning, this);
            this.graph.on('node:unhandled:mousedown', this.preparePanning, this);
            this.graph.on('edge:unhandled:mousedown', this.preparePanning, this);
        }
        if (eventTypes.includes('rightMouseDown')) {
            this.onRightMouseDown = this.onRightMouseDown.bind(this);
            common_1.Dom.Event.on(this.scrollerImpl.container, 'mousedown', this.onRightMouseDown);
        }
    }
    stopListening() {
        let eventTypes = [];
        const pannable = this.options.pannable;
        if (typeof pannable === 'object') {
            eventTypes = pannable.eventTypes || [];
        }
        else {
            eventTypes = ['leftMouseDown'];
        }
        if (eventTypes.includes('leftMouseDown')) {
            this.graph.off('blank:mousedown', this.preparePanning, this);
            this.graph.off('node:unhandled:mousedown', this.preparePanning, this);
            this.graph.off('edge:unhandled:mousedown', this.preparePanning, this);
        }
        if (eventTypes.includes('rightMouseDown')) {
            common_1.Dom.Event.off(this.scrollerImpl.container, 'mousedown', this.onRightMouseDown);
        }
    }
    onRightMouseDown(e) {
        if (e.button === 2 && this.allowPanning(e, true)) {
            this.updateClassName(true);
            this.scrollerImpl.startPanning(e);
            this.scrollerImpl.once('pan:stop', () => this.updateClassName(false));
        }
    }
    preparePanning({ e }) {
        const allowPanning = this.allowPanning(e, true);
        const selection = this.graph.getPlugin('selection');
        const allowRubberband = selection && selection.allowRubberband(e, true);
        if (allowPanning || (this.allowPanning(e) && !allowRubberband)) {
            this.updateClassName(true);
            this.scrollerImpl.startPanning(e);
            this.scrollerImpl.once('pan:stop', () => this.updateClassName(false));
        }
    }
    allowPanning(e, strict) {
        return (this.pannable && (0, common_1.isModifierKeyMatch)(e, this.options.modifiers, strict));
    }
    updateClassName(isPanning) {
        const container = this.scrollerImpl.container;
        const pannable = config_1.Config.prefix('graph-scroller-pannable');
        if (this.pannable) {
            common_1.Dom.addClass(container, pannable);
            container.dataset.panning = (!!isPanning).toString(); // Use dataset to control scroller panning style to avoid reflow caused by changing classList
        }
        else {
            common_1.Dom.removeClass(container, pannable);
        }
    }
    /**
     * 当 Scroller 插件启用时，默认关闭 Graph 的内置 panning，
     * 以避免滚动容器的拖拽与画布平移产生冲突。
     */
    autoDisableGraphPanning() {
        var _a;
        const graphPan = (_a = this.graph) === null || _a === void 0 ? void 0 : _a.panning;
        if (graphPan === null || graphPan === void 0 ? void 0 : graphPan.pannable) {
            graphPan.disablePanning();
            console.warn('Detected Scroller plugin; Graph panning has been disabled by default to avoid conflicts.');
        }
    }
    dispose() {
        this.scrollerImpl.dispose();
        this.stopListening();
        this.off();
        common_1.CssLoader.clean(this.name);
    }
}
exports.Scroller = Scroller;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Scroller.prototype, "dispose", null);
//# sourceMappingURL=index.js.map