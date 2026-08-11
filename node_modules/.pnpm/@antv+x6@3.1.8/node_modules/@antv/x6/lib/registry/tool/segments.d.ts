import { Dom } from '../../common';
import { Point, type PointLike } from '../../geometry';
import type { Graph } from '../../graph';
import type { Edge, TerminalCellData, TerminalType } from '../../model/edge';
import type { CellView } from '../../view/cell';
import type { EdgeView } from '../../view/edge';
import { ToolItem, type ToolItemOptions } from '../../view/tool';
import { View } from '../../view/view';
import type { SimpleAttrs } from '../attr';
export declare class Segments extends ToolItem<EdgeView, Options> {
    static defaults: Options;
    protected handles: Handle[];
    protected get vertices(): any[];
    update(): this;
    getPoints(): Point[];
    protected onRender(): this;
    protected renderHandle(vertex: PointLike, nextVertex: PointLike, index: number): Handle;
    protected startHandleListening(handle: Handle): void;
    protected stopHandleListening(handle: Handle): void;
    protected resetHandles(): void;
    protected shiftHandleIndexes(delta: number): void;
    protected resetAnchor(type: TerminalType, anchor: TerminalCellData['anchor']): void;
    protected snapHandle(handle: Handle, position: PointLike, data: EventData): PointLike;
    protected onHandleChanging({ handle, e }: HandleEventArgs['changing']): void;
    protected onHandleChange({ handle, e }: HandleEventArgs['change']): void;
    protected onHandleChanged({ e }: HandleEventArgs['changed']): void;
    protected updateHandle(handle: Handle, vertex: PointLike, nextVertex: PointLike, offset?: number): void;
    protected onRemove(): void;
}
interface Options extends ToolItemOptions {
    threshold: number;
    precision?: number;
    snapRadius: number;
    stopPropagation: boolean;
    removeRedundancies: boolean;
    attrs: SimpleAttrs | ((handle: Handle) => SimpleAttrs);
    anchor?: (this: EdgeView, pos: Point, terminalView: CellView, terminalMagnet: Element | null, terminalType: TerminalType, edgeView: EdgeView, toolView: Segments) => TerminalCellData['anchor'];
    createHandle?: (options: HandleOptions) => Handle;
    processHandle?: (handle: Handle) => void;
    onChanged?: (options: {
        edge: Edge;
        edgeView: EdgeView;
    }) => void;
}
interface EventData {
    sourceAnchor: Point;
    targetAnchor: Point;
    sourceAnchorDef: TerminalCellData['anchor'];
    targetAnchorDef: TerminalCellData['anchor'];
}
declare class Handle extends View<HandleEventArgs> {
    options: HandleOptions;
    container: SVGRectElement;
    constructor(options: HandleOptions);
    render(): void;
    updatePosition(x: number, y: number, angle: number, view: EdgeView): void;
    protected onMouseDown(evt: Dom.MouseDownEvent): void;
    protected onMouseMove(evt: Dom.MouseMoveEvent): void;
    protected onMouseUp(evt: Dom.MouseUpEvent): void;
    show(): void;
    hide(): void;
}
interface HandleOptions {
    graph: Graph;
    guard: (evt: Dom.EventObject) => boolean;
    attrs: SimpleAttrs | ((handle: Handle) => SimpleAttrs);
    index?: number;
    axis?: 'x' | 'y';
}
interface HandleEventArgs {
    change: {
        e: Dom.MouseDownEvent;
        handle: Handle;
    };
    changing: {
        e: Dom.MouseMoveEvent;
        handle: Handle;
    };
    changed: {
        e: Dom.MouseUpEvent;
        handle: Handle;
    };
}
export {};
