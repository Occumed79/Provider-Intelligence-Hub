"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = exports.SchedulerViewState = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const constants_1 = require("../constants");
const view_1 = require("../view");
const queueJob_1 = require("./queueJob");
var SchedulerViewState;
(function (SchedulerViewState) {
    SchedulerViewState[SchedulerViewState["CREATED"] = 0] = "CREATED";
    SchedulerViewState[SchedulerViewState["MOUNTED"] = 1] = "MOUNTED";
    SchedulerViewState[SchedulerViewState["WAITING"] = 2] = "WAITING";
})(SchedulerViewState || (exports.SchedulerViewState = SchedulerViewState = {}));
class Scheduler extends common_1.Disposable {
    get model() {
        return this.graph.model;
    }
    get container() {
        return this.graph.view.stage;
    }
    constructor(graph) {
        super();
        this.views = {};
        this.willRemoveViews = {};
        this.queue = new queueJob_1.JobQueue();
        this.graph = graph;
        this.init();
    }
    init() {
        this.startListening();
        this.renderViews(this.model.getCells());
    }
    startListening() {
        this.model.on('reseted', this.onModelReseted, this);
        this.model.on('cell:added', this.onCellAdded, this);
        this.model.on('cell:removed', this.onCellRemoved, this);
        this.model.on('cell:change:zIndex', this.onCellZIndexChanged, this);
        this.model.on('cell:change:visible', this.onCellVisibleChanged, this);
    }
    stopListening() {
        this.model.off('reseted', this.onModelReseted, this);
        this.model.off('cell:added', this.onCellAdded, this);
        this.model.off('cell:removed', this.onCellRemoved, this);
        this.model.off('cell:change:zIndex', this.onCellZIndexChanged, this);
        this.model.off('cell:change:visible', this.onCellVisibleChanged, this);
    }
    onModelReseted({ options, previous }) {
        let cells = this.model.getCells();
        if (!(options === null || options === void 0 ? void 0 : options.diff)) {
            this.queue.clearJobs();
            this.removeZPivots();
            this.resetViews();
        }
        else {
            const previousSet = new Set(previous);
            cells = cells.filter((cell) => !previousSet.has(cell));
        }
        this.renderViews(cells, Object.assign(Object.assign({}, options), { queue: cells.map((cell) => cell.id) }));
    }
    onCellAdded({ cell, options }) {
        this.renderViews([cell], options);
    }
    onCellRemoved({ cell }) {
        this.removeViews([cell]);
    }
    onCellZIndexChanged({ cell, options, }) {
        const viewItem = this.views[cell.id];
        if (viewItem) {
            this.requestViewUpdate(viewItem.view, constants_1.FLAG_INSERT, options, queueJob_1.JOB_PRIORITY.Update, true);
        }
    }
    onCellVisibleChanged({ cell, current, }) {
        this.toggleVisible(cell, !!current);
    }
    requestViewUpdate(view, flag, options = {}, priority = queueJob_1.JOB_PRIORITY.Update, flush = true) {
        const id = view.cell.id;
        const viewItem = this.views[id];
        if (!viewItem) {
            return;
        }
        const nextFlag = viewItem.flag | flag;
        viewItem.flag = nextFlag;
        const prevOptions = viewItem.options || {};
        const nextOptions = options || {};
        if (prevOptions.queue && nextOptions.queue == null) {
            nextOptions.queue = prevOptions.queue;
        }
        if (prevOptions.async === false || nextOptions.async === false) {
            nextOptions.async = false;
        }
        viewItem.options = nextOptions;
        const priorAction = view.hasAction(flag, ['translate', 'resize', 'rotate']);
        if (priorAction || nextOptions.async === false) {
            priority = queueJob_1.JOB_PRIORITY.PRIOR; // eslint-disable-line
            flush = false; // eslint-disable-line
        }
        this.queue.queueJob({
            id,
            priority,
            cb: () => {
                const current = this.views[id];
                if (!current)
                    return;
                const currentOptions = current.options || {};
                this.renderViewInArea(current.view, current.flag, currentOptions);
                const queue = currentOptions.queue;
                if (queue) {
                    const index = queue.indexOf(current.view.cell.id);
                    if (index >= 0) {
                        queue.splice(index, 1);
                    }
                    if (queue.length === 0) {
                        this.graph.trigger('render:done');
                    }
                }
            },
        });
        const effectedEdges = this.getEffectedEdges(view);
        effectedEdges.forEach((edge) => {
            this.requestViewUpdate(edge.view, edge.flag, options, priority, false);
        });
        if (flush) {
            this.flush();
        }
    }
    setRenderArea(area) {
        this.renderArea = area;
        // 当可视渲染区域变化时，卸载不在区域内且已挂载的视图
        Object.values(this.views).forEach((viewItem) => {
            if (!viewItem)
                return;
            const { view } = viewItem;
            if (viewItem.state === SchedulerViewState.MOUNTED) {
                if (!this.isUpdatable(view)) {
                    // 卸载 DOM
                    view.remove();
                    this.graph.trigger('view:unmounted', { view });
                    // 切换到 WAITING 状态，等待重新进入区域时再插入
                    viewItem.state = SchedulerViewState.WAITING;
                    // 确保重新进入可视区域后会重新插入，并执行视图的 render 等动作，让 react 等节点能重新展示
                    viewItem.flag |= constants_1.FLAG_INSERT | view.getBootstrapFlag();
                }
            }
        });
        this.flushWaitingViews();
    }
    isViewMounted(view) {
        if (view == null) {
            return false;
        }
        const viewItem = this.views[view.cell.id];
        if (!viewItem) {
            return false;
        }
        return viewItem.state === SchedulerViewState.MOUNTED;
    }
    renderViews(cells, options = {}) {
        cells.sort((c1, c2) => {
            if (c1.isNode() && c2.isEdge()) {
                return -1;
            }
            return 0;
        });
        cells.forEach((cell) => {
            const id = cell.id;
            const views = this.views;
            let flag = 0;
            let viewItem = views[id];
            if (viewItem) {
                flag = constants_1.FLAG_INSERT;
            }
            else {
                const cellView = this.createCellView(cell);
                if (cellView) {
                    cellView.graph = this.graph;
                    flag = constants_1.FLAG_INSERT | cellView.getBootstrapFlag();
                    viewItem = {
                        view: cellView,
                        flag,
                        options,
                        state: SchedulerViewState.CREATED,
                    };
                    this.views[id] = viewItem;
                }
            }
            if (viewItem) {
                this.requestViewUpdate(viewItem.view, flag, options, this.getRenderPriority(viewItem.view), false);
            }
        });
        this.flush();
    }
    renderViewInArea(view, flag, options = {}) {
        const cell = view.cell;
        const id = cell.id;
        const viewItem = this.views[id];
        if (!viewItem) {
            return;
        }
        let result = 0;
        if (this.isUpdatable(view)) {
            result = this.updateView(view, flag, options);
            viewItem.flag = result;
        }
        else {
            // 视图不在当前可渲染区域内
            if (viewItem.state === SchedulerViewState.MOUNTED) {
                // 将已挂载但不在可视区域的视图从 DOM 中卸载
                view.remove();
                this.graph.trigger('view:unmounted', { view });
                result = 0;
            }
            // 标记为 WAITING 状态，以便在可视区域变化时重新渲染
            viewItem.state = SchedulerViewState.WAITING;
            // 确保重新进入可视区域时能够重新插入到 DOM
            viewItem.flag = flag | constants_1.FLAG_INSERT | view.getBootstrapFlag();
        }
        if (result) {
            if (cell.isEdge() &&
                (result & view.getFlag(['source', 'target'])) === 0) {
                this.queue.queueJob({
                    id,
                    priority: queueJob_1.JOB_PRIORITY.RenderEdge,
                    cb: () => {
                        this.updateView(view, flag, options);
                    },
                });
            }
        }
    }
    removeViews(cells) {
        cells.forEach((cell) => {
            const id = cell.id;
            const viewItem = this.views[id];
            if (viewItem) {
                this.willRemoveViews[id] = viewItem;
                delete this.views[id];
                this.queue.queueJob({
                    id,
                    priority: this.getRenderPriority(viewItem.view),
                    cb: () => {
                        this.removeView(viewItem.view);
                    },
                });
            }
        });
        this.flush();
    }
    flush() {
        this.graph.options.async
            ? this.queue.queueFlush()
            : this.queue.queueFlushSync();
    }
    flushWaitingViews() {
        Object.values(this.views).forEach((viewItem) => {
            if (viewItem && viewItem.state === SchedulerViewState.WAITING) {
                const { view, flag, options } = viewItem;
                this.requestViewUpdate(view, flag, options, this.getRenderPriority(view), false);
            }
        });
        this.flush();
    }
    updateView(view, flag, options = {}) {
        if (view == null) {
            return 0;
        }
        if (view_1.CellView.isCellView(view)) {
            if (flag & constants_1.FLAG_REMOVE) {
                this.removeView(view);
                return 0;
            }
            if (flag & constants_1.FLAG_INSERT) {
                this.insertView(view);
                flag ^= constants_1.FLAG_INSERT; // eslint-disable-line
            }
        }
        if (!flag) {
            return 0;
        }
        return view.confirmUpdate(flag, options);
    }
    insertView(view) {
        const viewItem = this.views[view.cell.id];
        if (viewItem) {
            const zIndex = view.cell.getZIndex();
            const pivot = this.addZPivot(zIndex);
            this.container.insertBefore(view.container, pivot);
            if (!view.cell.isVisible()) {
                this.toggleVisible(view.cell, false);
            }
            viewItem.state = SchedulerViewState.MOUNTED;
            this.graph.trigger('view:mounted', { view });
        }
    }
    resetViews() {
        this.willRemoveViews = Object.assign(Object.assign({}, this.views), this.willRemoveViews);
        Object.values(this.willRemoveViews).forEach((viewItem) => {
            if (viewItem) {
                this.removeView(viewItem.view);
            }
        });
        this.views = {};
        this.willRemoveViews = {};
    }
    removeView(view) {
        const cell = view.cell;
        const viewItem = this.willRemoveViews[cell.id];
        if (viewItem && view) {
            viewItem.view.remove();
            delete this.willRemoveViews[cell.id];
            this.graph.trigger('view:unmounted', { view });
        }
    }
    toggleVisible(cell, visible) {
        const edges = this.model.getConnectedEdges(cell);
        for (let i = 0, len = edges.length; i < len; i += 1) {
            const edge = edges[i];
            if (visible) {
                const source = edge.getSourceCell();
                const target = edge.getTargetCell();
                if ((source && !source.isVisible()) ||
                    (target && !target.isVisible())) {
                    continue;
                }
                this.toggleVisible(edge, true);
            }
            else {
                this.toggleVisible(edge, false);
            }
        }
        const viewItem = this.views[cell.id];
        if (viewItem) {
            common_1.Dom.css(viewItem.view.container, {
                display: visible ? 'unset' : 'none',
            });
        }
    }
    addZPivot(zIndex = 0) {
        if (this.zPivots == null) {
            this.zPivots = {};
        }
        const pivots = this.zPivots;
        let pivot = pivots[zIndex];
        if (pivot) {
            return pivot;
        }
        pivot = pivots[zIndex] = document.createComment(`z-index:${zIndex + 1}`);
        let neighborZ = -Infinity;
        // eslint-disable-next-line
        for (const key in pivots) {
            const currentZ = +key;
            if (currentZ < zIndex && currentZ > neighborZ) {
                neighborZ = currentZ;
                if (neighborZ === zIndex - 1) {
                }
            }
        }
        const layer = this.container;
        if (neighborZ !== -Infinity) {
            const neighborPivot = pivots[neighborZ];
            layer.insertBefore(pivot, neighborPivot.nextSibling);
        }
        else {
            layer.insertBefore(pivot, layer.firstChild);
        }
        return pivot;
    }
    removeZPivots() {
        if (this.zPivots) {
            Object.values(this.zPivots).forEach((elem) => {
                if (elem && elem.parentNode) {
                    elem.parentNode.removeChild(elem);
                }
            });
        }
        this.zPivots = {};
    }
    createCellView(cell) {
        const options = { graph: this.graph };
        const createViewHook = this.graph.options.createCellView;
        if (createViewHook) {
            const ret = common_1.FunctionExt.call(createViewHook, this.graph, cell);
            if (ret) {
                return new ret(cell, options); // eslint-disable-line new-cap
            }
            if (ret === null) {
                // null means not render
                return null;
            }
        }
        const view = cell.view;
        if (view != null && typeof view === 'string') {
            const def = view_1.CellView.registry.get(view);
            if (def) {
                return new def(cell, options); // eslint-disable-line new-cap
            }
            return view_1.CellView.registry.onNotFound(view);
        }
        if (cell.isNode()) {
            return new view_1.NodeView(cell, options);
        }
        if (cell.isEdge()) {
            return new view_1.EdgeView(cell, options);
        }
        return null;
    }
    getEffectedEdges(view) {
        const effectedEdges = [];
        const cell = view.cell;
        const edges = this.model.getConnectedEdges(cell);
        for (let i = 0, n = edges.length; i < n; i += 1) {
            const edge = edges[i];
            const viewItem = this.views[edge.id];
            if (!viewItem) {
                continue;
            }
            const edgeView = viewItem.view;
            if (!this.isViewMounted(edgeView)) {
                continue;
            }
            const flagLabels = ['update'];
            if (edge.getTargetCell() === cell) {
                flagLabels.push('target');
            }
            if (edge.getSourceCell() === cell) {
                flagLabels.push('source');
            }
            effectedEdges.push({
                id: edge.id,
                view: edgeView,
                flag: edgeView.getFlag(flagLabels),
            });
        }
        return effectedEdges;
    }
    isUpdatable(view) {
        if (view.isNodeView()) {
            if (this.renderArea) {
                return this.renderArea.isIntersectWithRect(view.cell.getBBox());
            }
            return true;
        }
        if (view.isEdgeView()) {
            const edge = view.cell;
            const intersects = this.renderArea
                ? this.renderArea.isIntersectWithRect(edge.getBBox())
                : true;
            if (this.graph.virtualRender.isVirtualEnabled()) {
                return intersects;
            }
            const sourceCell = edge.getSourceCell();
            const targetCell = edge.getTargetCell();
            if (this.renderArea && sourceCell && targetCell) {
                return (this.renderArea.isIntersectWithRect(sourceCell.getBBox()) ||
                    this.renderArea.isIntersectWithRect(targetCell.getBBox()));
            }
        }
        return true;
    }
    getRenderPriority(view) {
        return view.cell.isNode()
            ? queueJob_1.JOB_PRIORITY.RenderNode
            : queueJob_1.JOB_PRIORITY.RenderEdge;
    }
    dispose() {
        this.stopListening();
        // clear views
        Object.keys(this.views).forEach((id) => {
            this.views[id].view.dispose();
        });
        this.views = {};
    }
}
exports.Scheduler = Scheduler;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Scheduler.prototype, "dispose", null);
//# sourceMappingURL=scheduler.js.map