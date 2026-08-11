"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeEditor = exports.NodeEditor = exports.CellEditor = void 0;
const common_1 = require("../../common");
const geometry_1 = require("../../geometry");
const tool_1 = require("../../view/tool");
const util_1 = require("../../view/view/util");
class CellEditor extends tool_1.ToolItem {
    constructor() {
        super(...arguments);
        this.labelIndex = -1;
        this.distance = 0.5;
        this.dblClick = this.onCellDblClick.bind(this);
    }
    onRender() {
        const cellView = this.cellView;
        if (cellView) {
            cellView.on('cell:dblclick', this.dblClick);
        }
    }
    createElement() {
        const classNames = [
            this.prefixClassName(`${this.cell.isEdge() ? 'edge' : 'node'}-tool-editor`),
            this.prefixClassName('cell-tool-editor'),
        ];
        this.editor = (0, util_1.createViewElement)('div', false);
        this.addClass(classNames, this.editor);
        this.editor.contentEditable = 'true';
        this.container.appendChild(this.editor);
    }
    removeElement() {
        this.undelegateDocumentEvents();
        if (this.editor) {
            this.container.removeChild(this.editor);
            this.editor = null;
        }
    }
    updateEditor() {
        const { cell, editor } = this;
        if (!editor) {
            return;
        }
        const { style } = editor;
        if (cell.isNode()) {
            this.updateNodeEditorTransform();
        }
        else if (cell.isEdge()) {
            this.updateEdgeEditorTransform();
        }
        // set font style
        const { attrs } = this.options;
        style.fontSize = `${attrs.fontSize}px`;
        style.fontFamily = attrs.fontFamily;
        style.color = attrs.color;
        style.backgroundColor = attrs.backgroundColor;
        // set init value
        const text = this.getCellText() || '';
        editor.innerText = text;
        this.setCellText(''); // clear display value when edit status because char ghosting.
        return this;
    }
    updateNodeEditorTransform() {
        const { graph, cell, editor } = this;
        if (!editor) {
            return;
        }
        let pos = geometry_1.Point.create();
        let minWidth = 20;
        let translate = '';
        let { x, y } = this.options;
        const { width, height } = this.options;
        if (typeof x !== 'undefined' && typeof y !== 'undefined') {
            const bbox = cell.getBBox();
            x = common_1.NumberExt.normalizePercentage(x, bbox.width);
            y = common_1.NumberExt.normalizePercentage(y, bbox.height);
            pos = bbox.topLeft.translate(x, y);
            minWidth = bbox.width - x * 2;
        }
        else {
            const bbox = cell.getBBox();
            pos = bbox.center;
            minWidth = bbox.width - 4;
            translate = 'translate(-50%, -50%)';
        }
        const scale = graph.scale();
        const { style } = editor;
        pos = graph.localToGraph(pos);
        style.left = `${pos.x}px`;
        style.top = `${pos.y}px`;
        style.transform = `scale(${scale.sx}, ${scale.sy}) ${translate}`;
        style.minWidth = `${minWidth}px`;
        if (typeof width === 'number') {
            style.width = `${width}px`;
        }
        if (typeof height === 'number') {
            style.height = `${height}px`;
        }
    }
    updateEdgeEditorTransform() {
        if (!this.event) {
            return;
        }
        const { graph, editor } = this;
        if (!editor) {
            return;
        }
        let pos = geometry_1.Point.create();
        let minWidth = 20;
        const { style } = editor;
        const target = this.event.target;
        const parent = target.parentElement;
        const isEdgeLabel = parent && common_1.Dom.hasClass(parent, this.prefixClassName('edge-label'));
        if (isEdgeLabel) {
            const index = parent.getAttribute('data-index') || '0';
            this.labelIndex = parseInt(index, 10);
            const matrix = parent.getAttribute('transform');
            const { translation } = common_1.Dom.parseTransformString(matrix);
            pos = new geometry_1.Point(translation.tx, translation.ty);
            minWidth = common_1.Util.getBBox(target).width;
        }
        else {
            if (!this.options.labelAddable) {
                return this;
            }
            pos = graph.clientToLocal(geometry_1.Point.create(this.event.clientX, this.event.clientY));
            const view = this.cellView;
            const d = view.path.closestPointLength(pos);
            this.distance = d;
            this.labelIndex = -1;
        }
        pos = graph.localToGraph(pos);
        const scale = graph.scale();
        style.left = `${pos.x}px`;
        style.top = `${pos.y}px`;
        style.minWidth = `${minWidth}px`;
        style.transform = `scale(${scale.sx}, ${scale.sy}) translate(-50%, -50%)`;
    }
    updateCell() {
        const value = this.editor.innerText.replace(/\n$/, '') || '';
        // set value, when value is null, we will remove label in edge
        this.setCellText(value !== '' ? value : null);
        // remove tool
        this.removeElement();
    }
    onDocumentMouseUp(e) {
        if (this.editor && e.target !== this.editor) {
            this.updateCell();
        }
    }
    onCellDblClick({ e }) {
        if (!this.editor) {
            e.stopPropagation();
            this.removeElement();
            this.event = e;
            this.createElement();
            this.updateEditor();
            this.autoFocus();
            const documentEvents = this.options.documentEvents;
            if (documentEvents) {
                this.delegateDocumentEvents(documentEvents);
            }
        }
    }
    onMouseDown(e) {
        e.stopPropagation();
    }
    autoFocus() {
        setTimeout(() => {
            if (this.editor) {
                this.editor.focus();
                this.selectText();
            }
        });
    }
    selectText() {
        if (window.getSelection && this.editor) {
            const range = document.createRange();
            range.selectNodeContents(this.editor);
            const selection = window.getSelection();
            selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
            selection === null || selection === void 0 ? void 0 : selection.addRange(range);
        }
    }
    getCellText() {
        const { getText } = this.options;
        if (typeof getText === 'function') {
            return common_1.FunctionExt.call(getText, this.cellView, {
                cell: this.cell,
                index: this.labelIndex,
            });
        }
        if (typeof getText === 'string') {
            if (this.cell.isNode()) {
                return this.cell.attr(getText);
            }
            if (this.cell.isEdge()) {
                if (this.labelIndex !== -1) {
                    return this.cell.prop(`labels/${this.labelIndex}/attrs/${getText}`);
                }
            }
        }
    }
    setCellText(value) {
        const setText = this.options.setText;
        if (typeof setText === 'function') {
            common_1.FunctionExt.call(setText, this.cellView, {
                cell: this.cell,
                value,
                index: this.labelIndex,
                distance: this.distance,
            });
            return;
        }
        if (typeof setText === 'string') {
            if (this.cell.isNode()) {
                this.cell.attr(setText, value === null ? '' : value);
                return;
            }
            if (this.cell.isEdge()) {
                const edge = this.cell;
                if (this.labelIndex === -1) {
                    if (value) {
                        const newLabel = {
                            position: {
                                distance: this.distance,
                            },
                            attrs: {},
                        };
                        common_1.ObjectExt.setByPath(newLabel, `attrs/${setText}`, value);
                        edge.appendLabel(newLabel);
                    }
                }
                else {
                    if (value !== null) {
                        edge.prop(`labels/${this.labelIndex}/attrs/${setText}`, value);
                    }
                    else {
                        edge.removeLabelAt(this.labelIndex);
                    }
                }
            }
        }
    }
    onRemove() {
        const cellView = this.cellView;
        if (cellView) {
            cellView.off('cell:dblclick', this.dblClick);
        }
        this.removeElement();
    }
}
exports.CellEditor = CellEditor;
CellEditor.defaults = Object.assign(Object.assign({}, tool_1.ToolItem.getDefaults()), { tagName: 'div', isSVGElement: false, events: {
        mousedown: 'onMouseDown',
        touchstart: 'onMouseDown',
    }, documentEvents: {
        mouseup: 'onDocumentMouseUp',
        touchend: 'onDocumentMouseUp',
        touchcancel: 'onDocumentMouseUp',
    } });
class NodeEditor extends CellEditor {
}
exports.NodeEditor = NodeEditor;
NodeEditor.defaults = common_1.ObjectExt.merge({}, CellEditor.defaults, {
    attrs: {
        fontSize: 14,
        fontFamily: 'Arial, helvetica, sans-serif',
        color: '#000',
        backgroundColor: '#fff',
    },
    getText: 'text/text',
    setText: 'text/text',
});
class EdgeEditor extends CellEditor {
}
exports.EdgeEditor = EdgeEditor;
EdgeEditor.defaults = common_1.ObjectExt.merge({}, CellEditor.defaults, {
    attrs: {
        fontSize: 14,
        fontFamily: 'Arial, helvetica, sans-serif',
        color: '#000',
        backgroundColor: '#fff',
    },
    labelAddable: true,
    getText: 'label/text',
    setText: 'label/text',
});
//# sourceMappingURL=editor.js.map