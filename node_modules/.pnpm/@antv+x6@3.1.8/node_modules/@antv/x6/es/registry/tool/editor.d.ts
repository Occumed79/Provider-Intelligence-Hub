import { Dom } from '../../common';
import type { Cell } from '../../model';
import type { CellView, EdgeView, NodeView } from '../../view';
import { ToolItem, type ToolItemOptions } from '../../view/tool';
export declare class CellEditor extends ToolItem<NodeView | EdgeView, CellEditorOptions & {
    event: Dom.EventObject;
}> {
    static defaults: CellEditorOptions;
    private editor;
    private labelIndex;
    private distance;
    private event;
    private dblClick;
    onRender(): void;
    createElement(): void;
    removeElement(): void;
    updateEditor(): this;
    updateNodeEditorTransform(): void;
    updateEdgeEditorTransform(): this;
    updateCell(): void;
    onDocumentMouseUp(e: Dom.MouseDownEvent): void;
    onCellDblClick({ e }: {
        e: Dom.DoubleClickEvent;
    }): void;
    onMouseDown(e: Dom.MouseDownEvent): void;
    autoFocus(): void;
    selectText(): void;
    getCellText(): any;
    setCellText(value: string | null): void;
    protected onRemove(): void;
}
interface CellEditorOptions extends ToolItemOptions {
    x?: number | string;
    y?: number | string;
    width?: number;
    height?: number;
    attrs: {
        fontSize: number;
        fontFamily: string;
        color: string;
        backgroundColor: string;
    };
    labelAddable?: boolean;
    getText: ((this: CellView, args: {
        cell: Cell;
        index?: number;
    }) => string) | string;
    setText: ((this: CellView, args: {
        cell: Cell;
        value: string | null;
        index?: number;
        distance?: number;
    }) => void) | string;
}
export declare class NodeEditor extends CellEditor {
    static defaults: CellEditorOptions;
}
export declare class EdgeEditor extends CellEditor {
    static defaults: CellEditorOptions;
}
export {};
