"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentEvents = exports.classNames = exports.SelectionImpl = void 0;
exports.depthComparator = depthComparator;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const geometry_1 = require("../../geometry");
const model_1 = require("../../model");
const registry_1 = require("../../registry");
const view_1 = require("../../view");
class SelectionImpl extends view_1.View {
    get graph() {
        return this.options.graph;
    }
    get boxClassName() {
        return this.prefixClassName(exports.classNames.box);
    }
    get $boxes() {
        return common_1.Dom.children(this.container, this.boxClassName);
    }
    get handleOptions() {
        return this.options;
    }
    constructor(options) {
        super();
        this.updateThrottleTimer = null;
        this.isDragging = false;
        this.batchUpdating = false;
        // 逐帧批处理拖拽位移，降低 translate 重绘频率
        this.dragRafId = null;
        // 合并缩放/平移下的选择框刷新到每帧一次
        this.transformRafId = null;
        this.dragPendingOffset = null;
        this.containerLocalOffsetX = 0;
        this.containerLocalOffsetY = 0;
        this.containerOffsetX = 0;
        this.containerOffsetY = 0;
        this.draggingPreviewMode = 'translate';
        // 拖拽过程的缓存，减少每次 move 重复计算
        this.translatingCache = null;
        this.movingRouterRestoreCache = null;
        this.movingRouterRestoreTimer = null;
        this.lastMovingTs = null;
        this.movingDegradeActivatedTs = null;
        this.options = options;
        if (this.options.model) {
            this.options.collection = this.options.model.collection;
        }
        if (this.options.collection) {
            this.collection = this.options.collection;
        }
        else {
            this.collection = new model_1.Collection([], {
                comparator: depthComparator,
            });
            this.options.collection = this.collection;
        }
        this.boxCount = 0;
        this.boxesUpdated = false;
        this.createContainer();
        this.startListening();
    }
    startListening() {
        const graph = this.graph;
        const collection = this.collection;
        this.delegateEvents({
            [`mousedown .${this.boxClassName}`]: 'onSelectionBoxMouseDown',
            [`touchstart .${this.boxClassName}`]: 'onSelectionBoxMouseDown',
            [`mousedown .${this.prefixClassName(exports.classNames.inner)}`]: 'onSelectionContainerMouseDown',
            [`touchstart .${this.prefixClassName(exports.classNames.inner)}`]: 'onSelectionContainerMouseDown',
        }, true);
        graph.on('scale', this.onGraphTransformed, this);
        graph.on('translate', this.onGraphTransformed, this);
        graph.model.on('updated', this.onModelUpdated, this);
        collection.on('added', this.onCellAdded, this);
        collection.on('removed', this.onCellRemoved, this);
        collection.on('reseted', this.onReseted, this);
        collection.on('updated', this.onCollectionUpdated, this);
        collection.on('node:change:position', this.onNodePositionChanged, this);
        collection.on('cell:changed', this.onCellChanged, this);
    }
    stopListening() {
        const graph = this.graph;
        const collection = this.collection;
        this.undelegateEvents();
        graph.off('scale', this.onGraphTransformed, this);
        graph.off('translate', this.onGraphTransformed, this);
        // 清理缩放/平移的 rAF 刷新与 throttleTimer
        if (this.transformRafId != null) {
            cancelAnimationFrame(this.transformRafId);
            this.transformRafId = null;
        }
        if (this.updateThrottleTimer) {
            clearTimeout(this.updateThrottleTimer);
            this.updateThrottleTimer = null;
        }
        graph.model.off('updated', this.onModelUpdated, this);
        collection.off('added', this.onCellAdded, this);
        collection.off('removed', this.onCellRemoved, this);
        collection.off('reseted', this.onReseted, this);
        collection.off('updated', this.onCollectionUpdated, this);
        collection.off('node:change:position', this.onNodePositionChanged, this);
        collection.off('cell:changed', this.onCellChanged, this);
    }
    onRemove() {
        this.stopListening();
    }
    onGraphTransformed() {
        if (this.updateThrottleTimer) {
            clearTimeout(this.updateThrottleTimer);
            this.updateThrottleTimer = null;
        }
        // 使用 rAF 将多次 transform 合并为每帧一次刷新
        if (this.transformRafId == null) {
            this.transformRafId = window.requestAnimationFrame(() => {
                this.transformRafId = null;
                if (this.collection.length <= 0) {
                    return;
                }
                if (this.isDragging) {
                    this.repositionSelectionBoxesInPlace();
                    if (this.options.following) {
                        this.resetContainerPosition();
                    }
                    else {
                        this.syncContainerPosition();
                    }
                    return;
                }
                this.refreshSelectionBoxes();
            });
        }
    }
    onCellChanged() {
        this.updateSelectionBoxes();
    }
    onNodePositionChanged({ node, options, }) {
        const { showNodeSelectionBox, pointerEvents } = this.options;
        const { ui, selection, translateBy, snapped } = options;
        const allowTranslating = (showNodeSelectionBox !== true ||
            (pointerEvents &&
                this.getPointerEventsValue(pointerEvents) === 'none')) &&
            !this.translating &&
            !selection;
        const translateByUi = ui && translateBy && node.id === translateBy;
        if (allowTranslating && (translateByUi || snapped)) {
            this.translating = true;
            const current = node.position();
            const previous = node.previous('position');
            if (previous) {
                const dx = current.x - previous.x;
                const dy = current.y - previous.y;
                if (dx !== 0 || dy !== 0) {
                    this.translateSelectedNodes(dx, dy, node, options);
                }
            }
            this.translating = false;
        }
    }
    onModelUpdated({ removed }) {
        if (removed === null || removed === void 0 ? void 0 : removed.length) {
            this.unselect(removed);
        }
    }
    isEmpty() {
        return this.length <= 0;
    }
    isSelected(cell) {
        return this.collection.has(cell);
    }
    get length() {
        return this.collection.length;
    }
    get cells() {
        return this.collection.toArray();
    }
    select(cells, options = {}) {
        options.dryrun = true;
        const items = this.filter(Array.isArray(cells) ? cells : [cells]);
        this.collection.add(items, options);
        return this;
    }
    unselect(cells, options = {}) {
        // dryrun to prevent cell be removed from graph
        options.dryrun = true;
        this.collection.remove(Array.isArray(cells) ? cells : [cells], options);
        return this;
    }
    reset(cells, options = {}) {
        if (cells) {
            this.batchUpdating = !!options.batch;
            const prev = this.cells;
            const next = this.filter(Array.isArray(cells) ? cells : [cells]);
            const prevMap = {};
            const nextMap = {};
            for (const cell of prev) {
                prevMap[cell.id] = cell;
            }
            for (const cell of next) {
                nextMap[cell.id] = cell;
            }
            const added = [];
            const removed = [];
            next.forEach((cell) => {
                if (!prevMap[cell.id]) {
                    added.push(cell);
                }
            });
            prev.forEach((cell) => {
                if (!nextMap[cell.id]) {
                    removed.push(cell);
                }
            });
            if (removed.length) {
                this.unselect(removed, Object.assign(Object.assign({}, options), { ui: true }));
            }
            if (added.length) {
                this.select(added, Object.assign(Object.assign({}, options), { ui: true }));
            }
            this.updateContainer();
            this.batchUpdating = false;
            return this;
        }
        return this.clean(options);
    }
    clean(options = {}) {
        if (this.length) {
            this.unselect(this.cells, options);
        }
        // 清理容器 transform 与位移累计
        this.resetContainerPosition();
        this.draggingPreviewMode = 'translate';
        return this;
    }
    setFilter(filter) {
        this.options.filter = filter;
    }
    setContent(content) {
        this.options.content = content;
    }
    startSelecting(evt) {
        // Flow: startSelecting => adjustSelection => stopSelecting
        evt = this.normalizeEvent(evt); // eslint-disable-line
        this.clean();
        let x;
        let y;
        const graphContainer = this.graph.container;
        if (evt.offsetX != null &&
            evt.offsetY != null &&
            graphContainer.contains(evt.target)) {
            x = evt.offsetX;
            y = evt.offsetY;
        }
        else {
            const offset = common_1.Dom.offset(graphContainer);
            const scrollLeft = graphContainer.scrollLeft;
            const scrollTop = graphContainer.scrollTop;
            x = evt.clientX - offset.left + window.pageXOffset + scrollLeft;
            y = evt.clientY - offset.top + window.pageYOffset + scrollTop;
        }
        common_1.Dom.css(this.container, {
            top: y,
            left: x,
            width: 1,
            height: 1,
        });
        this.setEventData(evt, {
            action: 'selecting',
            clientX: evt.clientX,
            clientY: evt.clientY,
            offsetX: x,
            offsetY: y,
            scrollerX: 0,
            scrollerY: 0,
            moving: false,
        });
        const client = this.graph.snapToGrid(evt.clientX, evt.clientY);
        this.notifyBoxEvent('box:mousedown', evt, client.x, client.y, []);
        this.delegateDocumentEvents(exports.documentEvents, evt.data);
    }
    filter(cells) {
        const filter = this.options.filter;
        return cells.filter((cell) => {
            if (Array.isArray(filter)) {
                return filter.some((item) => {
                    if (typeof item === 'string') {
                        return cell.shape === item;
                    }
                    return cell.id === item.id;
                });
            }
            if (typeof filter === 'function') {
                return common_1.FunctionExt.call(filter, this.graph, cell);
            }
            return true;
        });
    }
    stopSelecting(evt) {
        // 重置拖拽状态和清理定时器
        this.isDragging = false;
        this.boxesUpdated = false;
        if (this.updateThrottleTimer) {
            clearTimeout(this.updateThrottleTimer);
            this.updateThrottleTimer = null;
        }
        const graph = this.graph;
        const eventData = this.getEventData(evt);
        const action = eventData.action;
        switch (action) {
            case 'selecting': {
                const client = graph.snapToGrid(evt.clientX, evt.clientY);
                const rect = this.getSelectingRect();
                const cells = this.getCellsInArea(rect);
                this.reset(cells, { batch: true });
                this.hideRubberband();
                this.notifyBoxEvent('box:mouseup', evt, client.x, client.y, cells);
                break;
            }
            case 'translating': {
                const client = graph.snapToGrid(evt.clientX, evt.clientY);
                if (this.dragPendingOffset) {
                    const toApply = this.dragPendingOffset;
                    this.dragPendingOffset = null;
                    this.applyDraggingPreview(toApply);
                }
                if (this.dragRafId != null) {
                    cancelAnimationFrame(this.dragRafId);
                    this.dragRafId = null;
                }
                // 重置容器 transform 与累计偏移
                this.resetContainerPosition();
                if (this.movingRouterRestoreTimer) {
                    clearTimeout(this.movingRouterRestoreTimer);
                    this.movingRouterRestoreTimer = null;
                }
                this.restoreMovingRouters();
                this.graph.model.stopBatch('move-selection');
                // 清理本次拖拽缓存
                this.translatingCache = null;
                this.draggingPreviewMode = 'translate';
                this.notifyBoxEvent('box:mouseup', evt, client.x, client.y);
                this.repositionSelectionBoxesInPlace();
                break;
            }
            default: {
                this.clean();
                break;
            }
        }
        this.undelegateDocumentEvents();
    }
    onMouseUp(evt) {
        const e = this.normalizeEvent(evt);
        const eventData = this.getEventData(e);
        if (eventData) {
            this.stopSelecting(evt);
        }
    }
    onSelectionBoxMouseDown(evt) {
        this.handleSelectionMouseDown(evt, true);
    }
    onSelectionContainerMouseDown(evt) {
        this.handleSelectionMouseDown(evt, false);
    }
    handleSelectionMouseDown(evt, isBox) {
        var _a;
        evt.stopPropagation();
        (_a = evt.preventDefault) === null || _a === void 0 ? void 0 : _a.call(evt);
        const e = this.normalizeEvent(evt);
        const client = this.graph.snapToGrid(e.clientX, e.clientY);
        // 容器内的多选切换：按下修饰键时，不拖拽，直接切换选中状态
        if (!isBox &&
            (0, common_1.isModifierKeyMatch)(e, this.options.multipleSelectionModifiers)) {
            const viewsUnderPoint = this.graph.findViewsFromPoint(client.x, client.y);
            const nodeView = viewsUnderPoint.find((v) => v.isNodeView());
            if (nodeView) {
                const cell = nodeView.cell;
                if (this.isSelected(cell)) {
                    this.unselect(cell, { ui: true });
                }
                else {
                    if (this.options.multiple === false) {
                        this.reset(cell, { ui: true });
                    }
                    else {
                        this.select(cell, { ui: true });
                    }
                }
            }
            return;
        }
        if (this.options.movable) {
            this.startTranslating(e);
        }
        let activeView = isBox ? this.getCellViewFromElem(e.target) : null;
        if (!activeView) {
            const viewsUnderPoint = this.graph
                .findViewsFromPoint(client.x, client.y)
                .filter((view) => this.isSelected(view.cell));
            activeView = viewsUnderPoint[0] || null;
            if (!activeView) {
                const firstSelected = this.collection.first();
                if (firstSelected) {
                    activeView = this.graph.renderer.findViewByCell(firstSelected);
                }
            }
        }
        if (activeView) {
            this.setEventData(e, { activeView });
            if (isBox) {
                this.notifyBoxEvent('box:mousedown', e, client.x, client.y);
            }
            this.delegateDocumentEvents(exports.documentEvents, e.data);
        }
    }
    startTranslating(evt) {
        this.graph.model.startBatch('move-selection');
        const client = this.graph.snapToGrid(evt.clientX, evt.clientY);
        this.setEventData(evt, {
            action: 'translating',
            clientX: client.x,
            clientY: client.y,
            originX: client.x,
            originY: client.y,
        });
        this.prepareTranslatingCache();
        this.draggingPreviewMode = this.getDraggingPreviewMode();
    }
    getRestrictArea() {
        const restrict = this.graph.options.translating.restrict;
        const area = typeof restrict === 'function'
            ? common_1.FunctionExt.call(restrict, this.graph, null)
            : restrict;
        if (typeof area === 'number') {
            return this.graph.transform.getGraphArea().inflate(area);
        }
        if (area === true) {
            return this.graph.transform.getGraphArea();
        }
        return area || null;
    }
    // 根据当前选择的节点构建拖拽缓存
    prepareTranslatingCache() {
        const selectedNodes = this.collection
            .toArray()
            .filter((cell) => cell.isNode());
        const nodeIdSet = new Set(selectedNodes.map((n) => n.id));
        const selectedEdges = this.collection
            .toArray()
            .filter((cell) => cell.isEdge());
        const edgesToTranslateSet = new Set();
        const needsTranslate = (edge) => edge.getVertices().length > 0 ||
            !edge.getSourceCellId() ||
            !edge.getTargetCellId();
        // 邻接边：仅当需要位移（有顶点或点端点）时加入缓存
        this.graph.model.getEdges().forEach((edge) => {
            const srcId = edge.getSourceCellId();
            const tgtId = edge.getTargetCellId();
            const isConnectedToSelectedNode = (srcId != null && nodeIdSet.has(srcId)) ||
                (tgtId != null && nodeIdSet.has(tgtId));
            if (isConnectedToSelectedNode && needsTranslate(edge)) {
                edgesToTranslateSet.add(edge);
            }
        });
        // 选中的边（不一定与选中节点相邻）也需要考虑
        selectedEdges.forEach((edge) => {
            if (needsTranslate(edge)) {
                edgesToTranslateSet.add(edge);
            }
        });
        this.translatingCache = {
            selectedNodes,
            nodeIdSet,
            edgesToTranslate: Array.from(edgesToTranslateSet),
        };
    }
    /**
     * 在移动过程中对与当前选中节点相连的边进行临时路由降级
     */
    applyMovingRouterFallback() {
        var _a;
        if (this.movingRouterRestoreCache)
            return;
        const selectedNodes = (_a = this.translatingCache) === null || _a === void 0 ? void 0 : _a.selectedNodes;
        if (!selectedNodes || selectedNodes.length < 2)
            return;
        const fallbackRaw = this.options.movingRouterFallback;
        if (!fallbackRaw || !registry_1.routerRegistry.exist(fallbackRaw))
            return;
        const fallback = { name: fallbackRaw };
        const restore = {};
        const processedEdges = new Set();
        selectedNodes.forEach((node) => {
            this.graph.model.getConnectedEdges(node).forEach((edge) => {
                if (processedEdges.has(edge.id)) {
                    return;
                }
                processedEdges.add(edge.id);
                const current = edge.getRouter();
                restore[edge.id] = current;
                edge.setRouter(fallback, { silent: true });
            });
        });
        this.movingRouterRestoreCache = restore;
        this.movingDegradeActivatedTs = Date.now();
    }
    /**
     * 恢复移动过程中被降级的边的原始路由：
     * - 如果原始路由为空则移除路由设置
     * - 完成恢复后清空缓存，等待下一次移动重新降级
     */
    restoreMovingRouters() {
        const restore = this.movingRouterRestoreCache;
        if (!restore)
            return;
        Object.keys(restore).forEach((id) => {
            const edge = this.graph.getCellById(id);
            if (!edge || !edge.isEdge())
                return;
            const original = restore[id];
            if (original == null) {
                edge.removeRouter({ silent: true });
            }
            else {
                edge.setRouter(original, { silent: true });
            }
            const view = this.graph.findViewByCell(edge);
            if (view) {
                this.graph.renderer.requestViewUpdate(view, view.getFlag('update'), {
                    async: true,
                });
            }
        });
        this.movingRouterRestoreCache = null;
    }
    /**
     * 在移动停止后延迟恢复路由，避免连线抖动：
     * - `idle`：距离上次移动的空闲时间必须超过 100ms
     * - `hold`：降级保持时间必须超过 150ms
     * - 若条件未满足则按最小等待时间再次调度恢复
     */
    scheduleMovingRouterRestoreThrottle() {
        if (this.movingRouterRestoreTimer) {
            clearTimeout(this.movingRouterRestoreTimer);
            this.movingRouterRestoreTimer = null;
        }
        this.movingRouterRestoreTimer = setTimeout(() => {
            const now = Date.now();
            const lastMove = this.lastMovingTs || 0;
            const idle = now - lastMove;
            const hold = this.movingDegradeActivatedTs != null
                ? now - this.movingDegradeActivatedTs
                : Infinity;
            if (idle < SelectionImpl.RESTORE_IDLE_TIME ||
                hold < SelectionImpl.RESTORE_HOLD_TIME) {
                const wait = Math.max(SelectionImpl.RESTORE_IDLE_TIME - idle, SelectionImpl.RESTORE_HOLD_TIME - hold, SelectionImpl.MIN_RESTORE_WAIT_TIME);
                this.movingRouterRestoreTimer = setTimeout(() => {
                    this.movingRouterRestoreTimer = null;
                    this.restoreMovingRouters();
                }, wait);
                return;
            }
            this.movingRouterRestoreTimer = null;
            this.restoreMovingRouters();
        }, SelectionImpl.RESTORE_IDLE_TIME);
    }
    getSelectionOffset(client, data) {
        let dx = client.x - data.clientX;
        let dy = client.y - data.clientY;
        const restrict = this.getRestrictArea();
        if (restrict) {
            const cells = this.collection.toArray();
            const totalBBox = model_1.Cell.getCellsBBox(cells, { deep: true }) || geometry_1.Rectangle.create();
            const minDx = restrict.x - totalBBox.x;
            const minDy = restrict.y - totalBBox.y;
            const maxDx = restrict.x + restrict.width - (totalBBox.x + totalBBox.width);
            const maxDy = restrict.y + restrict.height - (totalBBox.y + totalBBox.height);
            if (dx < minDx) {
                dx = minDx;
            }
            if (dy < minDy) {
                dy = minDy;
            }
            if (maxDx < dx) {
                dx = maxDx;
            }
            if (maxDy < dy) {
                dy = maxDy;
            }
            if (!this.options.following) {
                const offsetX = client.x - data.originX;
                const offsetY = client.y - data.originY;
                dx = offsetX <= minDx || offsetX >= maxDx ? 0 : dx;
                dy = offsetY <= minDy || offsetY >= maxDy ? 0 : dy;
            }
        }
        return {
            dx,
            dy,
        };
    }
    updateSelectedNodesPosition(offset) {
        if (offset.dx === 0 && offset.dy === 0) {
            return;
        }
        // 合并偏移并在下一帧统一应用，减少高频重绘
        if (this.dragPendingOffset) {
            this.dragPendingOffset.dx += offset.dx;
            this.dragPendingOffset.dy += offset.dy;
        }
        else {
            this.dragPendingOffset = { dx: offset.dx, dy: offset.dy };
        }
        if (this.dragRafId == null) {
            this.dragRafId = requestAnimationFrame(() => {
                const toApply = this.dragPendingOffset || { dx: 0, dy: 0 };
                this.dragPendingOffset = null;
                this.dragRafId = null;
                this.applyDraggingPreview(toApply);
                this.boxesUpdated = true;
                this.isDragging = true;
            });
        }
    }
    autoScrollGraph(x, y) {
        const scroller = this.graph.getPlugin('scroller');
        if (scroller === null || scroller === void 0 ? void 0 : scroller.autoScroll) {
            return scroller.autoScroll(x, y);
        }
        return { scrollerX: 0, scrollerY: 0 };
    }
    adjustSelection(evt) {
        const e = this.normalizeEvent(evt);
        const eventData = this.getEventData(e);
        const action = eventData.action;
        switch (action) {
            case 'selecting': {
                const data = eventData;
                if (data.moving !== true) {
                    common_1.Dom.appendTo(this.container, this.graph.container);
                    this.showRubberband();
                    data.moving = true;
                }
                const { scrollerX, scrollerY } = this.autoScrollGraph(e.clientX, e.clientY);
                data.scrollerX += scrollerX;
                data.scrollerY += scrollerY;
                const dx = e.clientX - data.clientX + data.scrollerX;
                const dy = e.clientY - data.clientY + data.scrollerY;
                common_1.Dom.css(this.container, {
                    left: dx < 0 ? data.offsetX + dx : data.offsetX,
                    top: dy < 0 ? data.offsetY + dy : data.offsetY,
                    width: Math.abs(dx),
                    height: Math.abs(dy),
                });
                const client = this.graph.snapToGrid(e.clientX, e.clientY);
                const rect = this.getSelectingRect();
                const cells = this.getCellsInArea(rect);
                this.notifyBoxEvent('box:mousemove', evt, client.x, client.y, cells);
                break;
            }
            case 'translating': {
                this.isDragging = true;
                const client = this.graph.snapToGrid(e.clientX, e.clientY);
                const data = eventData;
                const offset = this.getSelectionOffset(client, data);
                if (this.options.following) {
                    this.updateSelectedNodesPosition(offset);
                }
                else {
                    this.updateContainerPosition(offset);
                }
                if (offset.dx) {
                    data.clientX = client.x;
                }
                if (offset.dy) {
                    data.clientY = client.y;
                }
                if (offset.dx !== 0 || offset.dy !== 0) {
                    this.lastMovingTs = Date.now();
                    this.applyMovingRouterFallback();
                    this.scheduleMovingRouterRestoreThrottle();
                }
                this.notifyBoxEvent('box:mousemove', evt, client.x, client.y);
                break;
            }
            default:
                break;
        }
        this.boxesUpdated = false;
    }
    translateSelectedNodes(dx, dy, exclude, otherOptions) {
        var _a, _b;
        const map = {};
        const excluded = [];
        if (exclude) {
            map[exclude.id] = true;
        }
        this.collection.toArray().forEach((cell) => {
            cell.getDescendants({ deep: true }).forEach((child) => {
                map[child.id] = true;
            });
        });
        if (otherOptions === null || otherOptions === void 0 ? void 0 : otherOptions.translateBy) {
            const currentCell = this.graph.getCellById(otherOptions.translateBy);
            if (currentCell) {
                map[currentCell.id] = true;
                currentCell.getDescendants({ deep: true }).forEach((child) => {
                    map[child.id] = true;
                });
                excluded.push(currentCell);
            }
        }
        const options = Object.assign(Object.assign({}, otherOptions), { selection: this.cid, exclude: excluded });
        // 移动选中的节点，避免重复和嵌套
        const cachedSelectedNodes = (_a = this.translatingCache) === null || _a === void 0 ? void 0 : _a.selectedNodes;
        const selectedNodes = (cachedSelectedNodes !== null && cachedSelectedNodes !== void 0 ? cachedSelectedNodes : this.collection.toArray().filter((cell) => cell.isNode())).filter((node) => !map[node.id]);
        selectedNodes.forEach((node) => {
            node.translate(dx, dy, options);
        });
        // 边移动缓存：仅移动需要位移的边（有顶点或点端点）
        const cachedEdges = (_b = this.translatingCache) === null || _b === void 0 ? void 0 : _b.edgesToTranslate;
        const edgesToTranslate = new Set();
        if (cachedEdges) {
            cachedEdges.forEach((edge) => {
                edgesToTranslate.add(edge);
            });
        }
        else {
            const selectedNodeIdSet = new Set(selectedNodes.map((n) => n.id));
            this.graph.model.getEdges().forEach((edge) => {
                const srcId = edge.getSourceCellId();
                const tgtId = edge.getTargetCellId();
                const srcSelected = srcId ? selectedNodeIdSet.has(srcId) : false;
                const tgtSelected = tgtId ? selectedNodeIdSet.has(tgtId) : false;
                if (srcSelected || tgtSelected) {
                    const hasVertices = edge.getVertices().length > 0;
                    const pointEndpoint = !srcId || !tgtId;
                    if (hasVertices || pointEndpoint) {
                        edgesToTranslate.add(edge);
                    }
                }
            });
        }
        // 若选择了边（仅边、无节点），确保其也被移动（过滤无顶点且两端为节点的情况）
        const selectedEdges = this.collection
            .toArray()
            .filter((cell) => cell.isEdge() && !map[cell.id]);
        selectedEdges.forEach((edge) => {
            const hasVertices = edge.getVertices().length > 0;
            const pointEndpoint = !edge.getSourceCellId() || !edge.getTargetCellId();
            if (hasVertices || pointEndpoint) {
                edgesToTranslate.add(edge);
            }
        });
        edgesToTranslate.forEach((edge) => {
            edge.translate(dx, dy, options);
        });
    }
    getCellViewsInArea(rect) {
        const graph = this.graph;
        const options = {
            strict: this.options.strict,
        };
        let views = [];
        if (this.options.rubberNode) {
            views = views.concat(graph.model
                .getNodesInArea(rect, options)
                .map((node) => graph.renderer.findViewByCell(node))
                .filter((view) => view != null));
        }
        if (this.options.rubberEdge) {
            views = views.concat(graph.model
                .getEdgesInArea(rect, options)
                .map((edge) => graph.renderer.findViewByCell(edge))
                .filter((view) => view != null));
        }
        return views;
    }
    getCellsInArea(rect) {
        return this.filter(this.getCellViewsInArea(rect).map((view) => view.cell));
    }
    getSelectingRect() {
        let width = common_1.Dom.width(this.container);
        let height = common_1.Dom.height(this.container);
        const offset = common_1.Dom.offset(this.container);
        const origin = this.graph.pageToLocal(offset.left, offset.top);
        const scale = this.graph.transform.getScale();
        width /= scale.sx;
        height /= scale.sy;
        return new geometry_1.Rectangle(origin.x, origin.y, width, height);
    }
    getBoxEventCells(cells, activeView = null) {
        var _a;
        const nodes = [];
        const edges = [];
        let view = activeView;
        (cells !== null && cells !== void 0 ? cells : this.cells).forEach((cell) => {
            const current = this.graph.getCellById(cell.id);
            if (!current) {
                return;
            }
            if (!view) {
                view = this.graph.renderer.findViewByCell(current);
            }
            if (current.isNode()) {
                nodes.push(current);
            }
            else if (current.isEdge()) {
                edges.push(current);
            }
        });
        return {
            view,
            cell: (_a = view === null || view === void 0 ? void 0 : view.cell) !== null && _a !== void 0 ? _a : null,
            nodes,
            edges,
        };
    }
    notifyBoxEvent(name, e, x, y, cells) {
        var _a, _b;
        const activeView = (_b = (_a = this.getEventData(e)) === null || _a === void 0 ? void 0 : _a.activeView) !== null && _b !== void 0 ? _b : null;
        const { view, cell, nodes, edges } = this.getBoxEventCells(cells, activeView);
        this.trigger(name, { e, view, x, y, cell, nodes, edges });
    }
    getSelectedClassName(cell) {
        return this.prefixClassName(`${cell.isNode() ? 'node' : 'edge'}-selected`);
    }
    addCellSelectedClassName(cell) {
        const view = this.graph.renderer.findViewByCell(cell);
        if (view) {
            view.addClass(this.getSelectedClassName(cell));
        }
    }
    removeCellUnSelectedClassName(cell) {
        const view = this.graph.renderer.findViewByCell(cell);
        if (view) {
            view.removeClass(this.getSelectedClassName(cell));
        }
    }
    destroySelectionBox(cell) {
        this.removeCellUnSelectedClassName(cell);
        if (this.canShowSelectionBox(cell)) {
            common_1.Dom.remove(this.container.querySelector(`[data-cell-id="${cell.id}"]`));
            if (this.$boxes.length === 0) {
                this.hide();
            }
            this.boxCount = Math.max(0, this.boxCount - 1);
        }
    }
    destroyAllSelectionBoxes(cells) {
        cells.forEach((cell) => {
            this.removeCellUnSelectedClassName(cell);
        });
        this.hide();
        common_1.Dom.remove(this.$boxes);
        this.boxCount = 0;
    }
    hide() {
        common_1.Dom.removeClass(this.container, this.prefixClassName(exports.classNames.rubberband));
        common_1.Dom.removeClass(this.container, this.prefixClassName(exports.classNames.selected));
    }
    showRubberband() {
        common_1.Dom.addClass(this.container, this.prefixClassName(exports.classNames.rubberband));
    }
    hideRubberband() {
        common_1.Dom.removeClass(this.container, this.prefixClassName(exports.classNames.rubberband));
    }
    showSelected() {
        common_1.Dom.removeAttribute(this.container, 'style');
        common_1.Dom.addClass(this.container, this.prefixClassName(exports.classNames.selected));
    }
    createContainer() {
        this.container = document.createElement('div');
        common_1.Dom.addClass(this.container, this.prefixClassName(exports.classNames.root));
        if (this.options.className) {
            common_1.Dom.addClass(this.container, this.options.className);
        }
        common_1.Dom.css(this.container, {
            willChange: 'transform',
        });
        this.selectionContainer = document.createElement('div');
        common_1.Dom.addClass(this.selectionContainer, this.prefixClassName(exports.classNames.inner));
        this.selectionContent = document.createElement('div');
        common_1.Dom.addClass(this.selectionContent, this.prefixClassName(exports.classNames.content));
        common_1.Dom.append(this.selectionContainer, this.selectionContent);
        common_1.Dom.attr(this.selectionContainer, 'data-selection-length', this.collection.length);
        common_1.Dom.prepend(this.container, this.selectionContainer);
    }
    getDraggingPreviewMode() {
        if (!this.options.following) {
            return 'translate';
        }
        const hasVisibleEdgeSelectionBox = this.collection
            .toArray()
            .some((cell) => cell.isEdge() && this.canShowSelectionBox(cell));
        return hasVisibleEdgeSelectionBox ? 'geometry' : 'translate';
    }
    applyDraggingPreview(offset) {
        if (offset.dx === 0 && offset.dy === 0) {
            return;
        }
        if (this.options.following) {
            this.translateSelectedNodes(offset.dx, offset.dy);
            if (this.draggingPreviewMode === 'geometry') {
                this.repositionSelectionBoxesInPlace();
                this.resetContainerPosition();
                return;
            }
        }
        this.updateContainerPosition(offset);
    }
    resetContainerPosition() {
        this.containerLocalOffsetX = 0;
        this.containerLocalOffsetY = 0;
        this.containerOffsetX = 0;
        this.containerOffsetY = 0;
        common_1.Dom.css(this.container, 'transform', '');
    }
    syncContainerPosition() {
        const origin = this.graph.coord.localToGraphPoint(0, 0);
        const offset = this.graph.coord.localToGraphPoint(this.containerLocalOffsetX, this.containerLocalOffsetY);
        this.containerOffsetX = offset.x - origin.x;
        this.containerOffsetY = offset.y - origin.y;
        if (this.containerOffsetX === 0 && this.containerOffsetY === 0) {
            common_1.Dom.css(this.container, 'transform', '');
            return;
        }
        common_1.Dom.css(this.container, 'transform', `translate3d(${this.containerOffsetX}px, ${this.containerOffsetY}px, 0)`);
    }
    updateContainerPosition(offset) {
        if (offset.dx || offset.dy) {
            this.containerLocalOffsetX += offset.dx;
            this.containerLocalOffsetY += offset.dy;
            // 使用 transform，避免频繁修改 left/top
            this.syncContainerPosition();
        }
    }
    updateContainer() {
        const origin = { x: Infinity, y: Infinity };
        const corner = { x: 0, y: 0 };
        const cells = this.collection
            .toArray()
            .filter((cell) => this.canShowSelectionBox(cell));
        cells.forEach((cell) => {
            const view = this.graph.renderer.findViewByCell(cell);
            if (view) {
                const bbox = view.getBBox({
                    useCellGeometry: true,
                });
                origin.x = Math.min(origin.x, bbox.x);
                origin.y = Math.min(origin.y, bbox.y);
                corner.x = Math.max(corner.x, bbox.x + bbox.width);
                corner.y = Math.max(corner.y, bbox.y + bbox.height);
            }
        });
        common_1.Dom.css(this.selectionContainer, {
            position: 'absolute',
            pointerEvents: this.options.movable ? 'auto' : 'none',
            cursor: this.options.movable ? 'move' : 'default',
            left: origin.x,
            top: origin.y,
            width: corner.x - origin.x,
            height: corner.y - origin.y,
        });
        common_1.Dom.attr(this.selectionContainer, 'data-selection-length', this.collection.length);
        const boxContent = this.options.content;
        if (boxContent) {
            if (typeof boxContent === 'function') {
                const content = common_1.FunctionExt.call(boxContent, this.graph, this, this.selectionContent);
                if (content) {
                    this.selectionContent.innerHTML = content;
                }
            }
            else {
                this.selectionContent.innerHTML = boxContent;
            }
        }
        if (this.collection.length > 0 && !this.container.parentNode) {
            common_1.Dom.appendTo(this.container, this.graph.container);
        }
        else if (this.collection.length <= 0 && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
    canShowSelectionBox(cell) {
        return ((cell.isNode() && this.options.showNodeSelectionBox === true) ||
            (cell.isEdge() && this.options.showEdgeSelectionBox === true));
    }
    getPointerEventsValue(pointerEvents) {
        return typeof pointerEvents === 'string'
            ? pointerEvents
            : pointerEvents(this.cells);
    }
    createSelectionBox(cell) {
        this.addCellSelectedClassName(cell);
        if (this.canShowSelectionBox(cell)) {
            const view = this.graph.renderer.findViewByCell(cell);
            if (view) {
                const bbox = view.getBBox({
                    useCellGeometry: true,
                });
                const className = this.boxClassName;
                const box = document.createElement('div');
                const pointerEvents = this.options.pointerEvents;
                common_1.Dom.addClass(box, className);
                common_1.Dom.addClass(box, `${className}-${cell.isNode() ? 'node' : 'edge'}`);
                common_1.Dom.attr(box, 'data-cell-id', cell.id);
                common_1.Dom.css(box, {
                    position: 'absolute',
                    left: bbox.x,
                    top: bbox.y,
                    width: bbox.width,
                    height: bbox.height,
                    pointerEvents: pointerEvents
                        ? this.getPointerEventsValue(pointerEvents)
                        : 'auto',
                });
                common_1.Dom.appendTo(box, this.container);
                this.showSelected();
                this.boxCount += 1;
            }
        }
    }
    updateSelectionBoxes() {
        if (this.collection.length > 0) {
            if (this.isDragging) {
                return;
            }
            if (this.updateThrottleTimer) {
                clearTimeout(this.updateThrottleTimer);
            }
            // 节流：限制更新频率到60fps
            this.updateThrottleTimer = setTimeout(() => {
                this.refreshSelectionBoxes();
                this.updateThrottleTimer = null;
            }, 16);
        }
    }
    refreshSelectionBoxes() {
        common_1.Dom.remove(this.$boxes);
        this.boxCount = 0;
        this.collection.toArray().forEach((cell) => {
            this.createSelectionBox(cell);
        });
        this.updateContainer();
        this.boxesUpdated = true;
    }
    // 按当前视图几何同步每个选择框的位置与尺寸
    repositionSelectionBoxesInPlace() {
        const boxes = this.$boxes;
        if (boxes.length === 0) {
            this.refreshSelectionBoxes();
            return;
        }
        for (const elem of boxes) {
            const id = elem.getAttribute('data-cell-id');
            if (!id)
                continue;
            const cell = this.collection.get(id);
            if (!cell)
                continue;
            const view = this.graph.renderer.findViewByCell(cell);
            if (!view)
                continue;
            const bbox = view.getBBox({ useCellGeometry: true });
            common_1.Dom.css(elem, {
                left: bbox.x,
                top: bbox.y,
                width: bbox.width,
                height: bbox.height,
            });
        }
        this.updateContainer();
        this.boxesUpdated = true;
    }
    getCellViewFromElem(elem) {
        const id = elem.getAttribute('data-cell-id');
        if (id) {
            const cell = this.collection.get(id);
            if (cell) {
                return this.graph.renderer.findViewByCell(cell);
            }
        }
        return null;
    }
    onCellRemoved({ cell }) {
        this.destroySelectionBox(cell);
        if (!this.batchUpdating)
            this.updateContainer();
    }
    onReseted({ previous, current }) {
        this.destroyAllSelectionBoxes(previous);
        current.forEach((cell) => {
            this.listenCellRemoveEvent(cell);
            this.createSelectionBox(cell);
        });
        this.updateContainer();
    }
    onCellAdded({ cell }) {
        // The collection do not known the cell was removed when cell was
        // removed by interaction(such as, by "delete" shortcut), so we should
        // manually listen to cell's remove event.
        this.listenCellRemoveEvent(cell);
        this.createSelectionBox(cell);
        if (!this.batchUpdating)
            this.updateContainer();
    }
    listenCellRemoveEvent(cell) {
        cell.off('removed', this.onCellRemoved, this);
        cell.on('removed', this.onCellRemoved, this);
    }
    onCollectionUpdated({ added, removed, options, }) {
        added.forEach((cell) => {
            this.trigger('cell:selected', { cell, options });
            if (cell.isNode()) {
                this.trigger('node:selected', { cell, options, node: cell });
            }
            else if (cell.isEdge()) {
                this.trigger('edge:selected', { cell, options, edge: cell });
            }
        });
        removed.forEach((cell) => {
            this.trigger('cell:unselected', { cell, options });
            if (cell.isNode()) {
                this.trigger('node:unselected', { cell, options, node: cell });
            }
            else if (cell.isEdge()) {
                this.trigger('edge:unselected', { cell, options, edge: cell });
            }
        });
        const args = {
            added,
            removed,
            options,
            selected: this.cells.filter((cell) => !!this.graph.getCellById(cell.id)),
        };
        this.trigger('selection:changed', args);
    }
    // #endregion
    dispose() {
        this.clean();
        this.remove();
        this.off();
    }
}
exports.SelectionImpl = SelectionImpl;
SelectionImpl.RESTORE_IDLE_TIME = 100;
SelectionImpl.RESTORE_HOLD_TIME = 150;
SelectionImpl.MIN_RESTORE_WAIT_TIME = 50;
tslib_1.__decorate([
    (0, common_1.disposable)()
], SelectionImpl.prototype, "dispose", null);
// private
// -------
const baseClassName = 'widget-selection';
exports.classNames = {
    root: baseClassName,
    inner: `${baseClassName}-inner`,
    box: `${baseClassName}-box`,
    content: `${baseClassName}-content`,
    rubberband: `${baseClassName}-rubberband`,
    selected: `${baseClassName}-selected`,
};
exports.documentEvents = {
    mousemove: 'adjustSelection',
    touchmove: 'adjustSelection',
    mouseup: 'onMouseUp',
    touchend: 'onMouseUp',
    touchcancel: 'onMouseUp',
};
function depthComparator(cell) {
    return cell.getAncestors().length;
}
//# sourceMappingURL=selection.js.map