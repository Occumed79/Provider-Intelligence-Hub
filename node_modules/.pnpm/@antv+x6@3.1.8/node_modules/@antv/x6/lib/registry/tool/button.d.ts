import { Dom } from '../../common';
import { type PointLike } from '../../geometry';
import type { Cell } from '../../model';
import type { CellView } from '../../view/cell';
import type { EdgeView } from '../../view/edge';
import type { NodeView } from '../../view/node';
import { ToolItem, type ToolItemOptions } from '../../view/tool';
export declare class Button extends ToolItem<EdgeView | NodeView, Options> {
    static defaults: Options;
    protected onRender(): void;
    update(): this;
    protected updatePosition(): void;
    protected getNodeMatrix(): DOMMatrix;
    protected getEdgeMatrix(): DOMMatrix;
    protected onMouseDown(e: Dom.MouseDownEvent): void;
}
interface Options extends ToolItemOptions {
    x?: number | string;
    y?: number | string;
    distance?: number | string;
    offset?: number | PointLike;
    rotate?: boolean;
    useCellGeometry?: boolean;
    onClick?: (this: CellView, args: {
        e: Dom.MouseDownEvent;
        cell: Cell;
        view: CellView;
        btn: Button;
    }) => any;
}
export declare class Remove extends Button {
    static defaults: Options;
}
export {};
