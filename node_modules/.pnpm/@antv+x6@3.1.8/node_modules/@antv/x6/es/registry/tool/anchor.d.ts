import { Dom } from '../../common';
import { Point, type PointLike } from '../../geometry';
import type { TerminalCellData, TerminalType } from '../../model/edge';
import type { CellView } from '../../view/cell';
import type { EdgeView } from '../../view/edge';
import { ToolItem, type ToolItemOptions } from '../../view/tool';
import type { SimpleAttrs } from '../attr';
declare class Anchor extends ToolItem<EdgeView, Options> {
    protected get type(): TerminalType;
    static defaults: Options;
    protected onRender(): void;
    update(): this;
    protected updateAnchor(): void;
    protected updateArea(): void;
    protected toggleArea(visible?: boolean): void;
    protected onMouseDown(evt: Dom.MouseDownEvent): void;
    protected resetAnchor(anchor?: TerminalCellData['anchor']): void;
    protected onMouseMove(evt: Dom.MouseMoveEvent): void;
    protected onMouseUp(evt: Dom.MouseUpEvent): void;
    protected onDblClick(): void;
}
interface Options extends ToolItemOptions {
    type?: TerminalType;
    snapRadius?: number;
    areaPadding?: number;
    restrictArea?: boolean;
    resetAnchor?: boolean | TerminalCellData['anchor'];
    removeRedundancies?: boolean;
    defaultAnchorAttrs?: SimpleAttrs;
    customAnchorAttrs?: SimpleAttrs;
    snap?: (this: EdgeView, pos: Point, terminalView: CellView, terminalMagnet: Element | null, terminalType: TerminalType, edgeView: EdgeView, toolView: Anchor) => PointLike;
    anchor?: (this: EdgeView, pos: Point, terminalView: CellView, terminalMagnet: Element | null, terminalType: TerminalType, edgeView: EdgeView, toolView: Anchor) => TerminalCellData['anchor'];
}
export declare class SourceAnchor extends Anchor {
    static defaults: Options;
}
export declare class TargetAnchor extends Anchor {
    static defaults: Options;
}
export {};
