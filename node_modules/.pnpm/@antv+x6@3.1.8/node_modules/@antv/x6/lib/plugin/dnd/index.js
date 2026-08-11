"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dnd = exports.DndDefaults = void 0;
const tslib_1 = require("tslib");
const dom_align_1 = require("dom-align");
const common_1 = require("../../common");
const constants_1 = require("../../constants");
const geometry_1 = require("../../geometry");
const graph_1 = require("../../graph");
const view_1 = require("../../view");
const raw_1 = require("./style/raw");
exports.DndDefaults = {
    // animation: false,
    getDragNode: (sourceNode) => sourceNode.clone(),
    getDropNode: (draggingNode) => draggingNode.clone(),
};
class Dnd extends view_1.View {
    get targetScroller() {
        const target = this.options.target;
        const scroller = target.getPlugin('scroller');
        return scroller;
    }
    get targetGraph() {
        return this.options.target;
    }
    get targetModel() {
        return this.targetGraph.model;
    }
    get snapline() {
        const target = this.options.target;
        const snapline = target.getPlugin('snapline');
        return snapline;
    }
    constructor(options) {
        super();
        this.name = 'dnd';
        this.options = Object.assign(Object.assign({}, exports.DndDefaults), options);
        this.init();
    }
    init() {
        common_1.CssLoader.ensure(this.name, raw_1.content);
        this.container = document.createElement('div');
        common_1.Dom.addClass(this.container, this.prefixClassName('widget-dnd'));
        this.draggingGraph = new graph_1.Graph(Object.assign(Object.assign({}, this.options.delegateGraphOptions), { container: document.createElement('div'), width: 1, height: 1, async: false }));
        common_1.Dom.append(this.container, this.draggingGraph.container);
    }
    start(node, evt) {
        var _a;
        const e = evt;
        e.preventDefault();
        this.targetModel.startBatch('dnd');
        common_1.Dom.addClass(this.container, 'dragging');
        common_1.Dom.appendTo(this.container, this.options.draggingContainer || document.body);
        this.sourceNode = node;
        this.prepareDragging(node, e.clientX, e.clientY);
        const local = this.updateNodePosition(e.clientX, e.clientY);
        if (this.isSnaplineEnabled()) {
            this.snapline.captureCursorOffset({
                e,
                node,
                cell: node,
                view: this.draggingView,
                x: local.x,
                y: local.y,
            });
            (_a = this.draggingNode) === null || _a === void 0 ? void 0 : _a.on('change:position', this.snap, this);
        }
        this.delegateDocumentEvents(constants_1.DocumentEvents, e.data);
    }
    isSnaplineEnabled() {
        var _a;
        return (_a = this.snapline) === null || _a === void 0 ? void 0 : _a.isEnabled();
    }
    prepareDragging(sourceNode, clientX, clientY) {
        const draggingGraph = this.draggingGraph;
        const draggingModel = draggingGraph.model;
        const draggingNode = this.options.getDragNode(sourceNode, {
            sourceNode,
            draggingGraph,
            targetGraph: this.targetGraph,
        });
        draggingNode.position(0, 0);
        let padding = 5;
        if (this.isSnaplineEnabled()) {
            padding += this.snapline.options.tolerance || 0;
        }
        if (this.isSnaplineEnabled() || this.options.scaled) {
            const scale = this.targetGraph.transform.getScale();
            draggingGraph.scale(scale.sx, scale.sy);
            padding *= Math.max(scale.sx, scale.sy);
        }
        else {
            draggingGraph.scale(1, 1);
        }
        this.clearDragging();
        // if (this.options.animation) {
        //   this.$container.stop(true, true)
        // }
        draggingModel.resetCells([draggingNode]);
        const delegateView = draggingGraph.findViewByCell(draggingNode);
        delegateView.undelegateEvents();
        delegateView.cell.off('changed');
        draggingGraph.fitToContent({
            padding,
            allowNewOrigin: 'any',
            useCellGeometry: false,
        });
        const bbox = delegateView.getBBox();
        this.geometryBBox = delegateView.getBBox({ useCellGeometry: true });
        this.delta = this.geometryBBox.getTopLeft().diff(bbox.getTopLeft());
        this.draggingNode = draggingNode;
        this.draggingView = delegateView;
        this.draggingBBox = draggingNode.getBBox();
        this.padding = padding;
        this.updateGraphPosition(clientX, clientY);
    }
    updateGraphPosition(clientX, clientY) {
        const delta = this.delta;
        const nodeBBox = this.geometryBBox;
        const padding = this.padding || 5;
        const offset = {
            left: clientX - delta.x - nodeBBox.width / 2 - padding,
            top: clientY - delta.y - nodeBBox.height / 2 - padding,
        };
        if (this.draggingGraph) {
            (0, dom_align_1.alignPoint)(this.container, {
                clientX: offset.left,
                clientY: offset.top,
            }, {
                points: ['tl'],
            });
        }
    }
    updateNodePosition(x, y) {
        const local = this.targetGraph.clientToLocal(x, y);
        const bbox = this.draggingBBox;
        if (bbox) {
            local.x -= bbox.width / 2;
            local.y -= bbox.height / 2;
            this.draggingNode.position(local.x, local.y);
        }
        return local;
    }
    snap({ cell, current, options, }) {
        const node = cell;
        if (options.snapped) {
            const bbox = this.draggingBBox;
            node.position(bbox.x + options.tx, bbox.y + options.ty, { silent: true });
            this.draggingView.translate();
            node.position(current.x, current.y, { silent: true });
            this.snapOffset = {
                x: options.tx,
                y: options.ty,
            };
        }
        else {
            this.snapOffset = null;
        }
    }
    onMouseMove(evt) {
        this.onDragging(evt);
    }
    onMouseUp(evt) {
        this.onDragEnd(evt);
    }
    onDragging(evt) {
        const draggingView = this.draggingView;
        if (draggingView) {
            evt.preventDefault();
            const e = this.normalizeEvent(evt);
            const clientX = e.clientX;
            const clientY = e.clientY;
            this.updateGraphPosition(clientX, clientY);
            const local = this.updateNodePosition(clientX, clientY);
            const embeddingMode = this.targetGraph.options.embedding.enabled;
            const isValidArea = (embeddingMode || this.isSnaplineEnabled()) &&
                this.isInsideValidArea({
                    x: clientX,
                    y: clientY,
                });
            if (embeddingMode) {
                draggingView.setEventData(e, {
                    graph: this.targetGraph,
                    candidateEmbedView: this.candidateEmbedView,
                });
                const data = draggingView.getEventData(e);
                if (isValidArea) {
                    draggingView.processEmbedding(e, data);
                }
                else {
                    draggingView.clearEmbedding(data);
                }
                this.candidateEmbedView = data.candidateEmbedView;
            }
            // update snapline
            if (this.isSnaplineEnabled()) {
                if (isValidArea) {
                    this.snapline.snapOnMoving({
                        e,
                        view: draggingView,
                        x: local.x,
                        y: local.y,
                    });
                }
                else {
                    this.snapline.hide();
                }
            }
        }
    }
    onDragEnd(evt) {
        const draggingNode = this.draggingNode;
        if (draggingNode) {
            const e = this.normalizeEvent(evt);
            const draggingView = this.draggingView;
            const draggingBBox = this.draggingBBox;
            const snapOffset = this.snapOffset;
            let x = draggingBBox.x;
            let y = draggingBBox.y;
            if (snapOffset) {
                x += snapOffset.x;
                y += snapOffset.y;
            }
            draggingNode.position(x, y, { silent: true });
            const ret = this.drop(draggingNode, { x: e.clientX, y: e.clientY });
            const callback = (node) => {
                if (node) {
                    this.onDropped(draggingNode);
                    if (this.targetGraph.options.embedding.enabled && draggingView) {
                        draggingView.setEventData(e, {
                            cell: node,
                            graph: this.targetGraph,
                            candidateEmbedView: this.candidateEmbedView,
                        });
                        draggingView.finalizeEmbedding(e, draggingView.getEventData(e));
                    }
                }
                else {
                    this.onDropInvalid();
                }
                this.candidateEmbedView = null;
                this.targetModel.stopBatch('dnd');
            };
            if (common_1.FunctionExt.isAsync(ret)) {
                // stop dragging
                this.undelegateDocumentEvents();
                ret.then(callback); // eslint-disable-line
            }
            else {
                callback(ret);
            }
        }
    }
    clearDragging() {
        if (this.draggingNode) {
            this.sourceNode = null;
            this.draggingNode.remove();
            this.draggingNode = null;
            this.draggingView = null;
            this.delta = null;
            this.padding = null;
            this.snapOffset = null;
            this.undelegateDocumentEvents();
        }
    }
    onDropped(draggingNode) {
        if (this.draggingNode === draggingNode) {
            this.clearDragging();
            common_1.Dom.removeClass(this.container, 'dragging');
            common_1.Dom.remove(this.container);
        }
    }
    onDropInvalid() {
        const draggingNode = this.draggingNode;
        if (draggingNode) {
            this.onDropped(draggingNode);
            // todo
            // const anim = this.options.animation
            // if (anim) {
            //   const duration = (typeof anim === 'object' && anim.duration) || 150
            //   const easing = (typeof anim === 'object' && anim.easing) || 'swing'
            //   this.draggingView = null
            //   this.$container.animate(this.originOffset!, duration, easing, () =>
            //     this.onDropped(draggingNode),
            //   )
            // } else {
            //   this.onDropped(draggingNode)
            // }
        }
    }
    isInsideValidArea(p) {
        let targetRect;
        let dndRect = null;
        const targetGraph = this.targetGraph;
        const targetScroller = this.targetScroller;
        if (this.options.dndContainer) {
            dndRect = this.getDropArea(this.options.dndContainer);
        }
        const isInsideDndRect = dndRect === null || dndRect === void 0 ? void 0 : dndRect.containsPoint(p);
        if (targetScroller) {
            if (targetScroller.options.autoResize) {
                targetRect = this.getDropArea(targetScroller.container);
            }
            else {
                const outter = this.getDropArea(targetScroller.container);
                targetRect = this.getDropArea(targetGraph.container).intersectsWithRect(outter);
            }
        }
        else {
            targetRect = this.getDropArea(targetGraph.container);
        }
        return !isInsideDndRect && targetRect && targetRect.containsPoint(p);
    }
    getDropArea(elem) {
        const offset = common_1.Dom.offset(elem);
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        const scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
        return geometry_1.Rectangle.create({
            x: offset.left +
                parseInt(common_1.Dom.css(elem, 'border-left-width'), 10) -
                scrollLeft,
            y: offset.top +
                parseInt(common_1.Dom.css(elem, 'border-top-width'), 10) -
                scrollTop,
            width: elem.clientWidth,
            height: elem.clientHeight,
        });
    }
    drop(draggingNode, pos) {
        if (this.isInsideValidArea(pos)) {
            const targetGraph = this.targetGraph;
            const targetModel = targetGraph.model;
            const local = targetGraph.clientToLocal(pos);
            const sourceNode = this.sourceNode;
            const droppingNode = this.options.getDropNode(draggingNode, {
                sourceNode,
                draggingNode,
                targetGraph: this.targetGraph,
                draggingGraph: this.draggingGraph,
            });
            const bbox = droppingNode.getBBox();
            local.x += bbox.x - bbox.width / 2;
            local.y += bbox.y - bbox.height / 2;
            const gridSize = this.snapOffset ? 1 : targetGraph.getGridSize();
            droppingNode.position((0, geometry_1.snapToGrid)(local.x, gridSize), (0, geometry_1.snapToGrid)(local.y, gridSize));
            droppingNode.removeZIndex();
            const validateNode = this.options.validateNode;
            const ret = validateNode
                ? validateNode(droppingNode, {
                    sourceNode,
                    draggingNode,
                    droppingNode,
                    targetGraph,
                    draggingGraph: this.draggingGraph,
                })
                : true;
            if (typeof ret === 'boolean') {
                if (ret) {
                    targetModel.addCell(droppingNode, { stencil: this.cid });
                    return droppingNode;
                }
                return null;
            }
            return common_1.FunctionExt.toDeferredBoolean(ret).then((valid) => {
                if (valid) {
                    targetModel.addCell(droppingNode, { stencil: this.cid });
                    return droppingNode;
                }
                return null;
            });
        }
        return null;
    }
    onRemove() {
        if (this.draggingGraph) {
            this.draggingGraph.view.remove();
            this.draggingGraph.dispose();
        }
    }
    dispose() {
        this.remove();
        common_1.CssLoader.clean(this.name);
    }
}
exports.Dnd = Dnd;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Dnd.prototype, "dispose", null);
//# sourceMappingURL=index.js.map