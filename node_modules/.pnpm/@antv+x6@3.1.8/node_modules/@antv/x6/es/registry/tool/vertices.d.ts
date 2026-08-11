import { type Dom, type ModifierKey } from '../../common';
import { Point, type PointLike } from '../../geometry';
import type { Graph } from '../../graph';
import type { Edge } from '../../model/edge';
import type { EdgeView } from '../../view/edge';
import { ToolItem, type ToolItemOptions } from '../../view/tool';
import { View } from '../../view/view';
import type { SimpleAttrs } from '../attr';
export declare class Vertices extends ToolItem<EdgeView, Options> {
    static defaults: Options;
    protected handles: Handle[];
    protected get vertices(): any[];
    protected onRender(): this;
    update(): this;
    protected resetHandles(): void;
    protected renderHandles(): void;
    protected updateHandles(): void;
    protected updatePath(): void;
    protected startHandleListening(handle: Handle): void;
    protected stopHandleListening(handle: Handle): void;
    protected getNeighborPoints(index: number): {
        prev: Point;
        next: Point;
    };
    protected getMouseEventArgs<T extends Dom.EventObject>(evt: T): {
        e: T;
        x: number;
        y: number;
    };
    protected onHandleChange({ e }: EventArgs['change']): void;
    protected onHandleChanging({ handle, e }: EventArgs['changing']): void;
    protected stopBatch(vertexAdded: boolean): void;
    protected onHandleChanged({ e }: EventArgs['changed']): void;
    protected snapVertex(vertex: PointLike, index: number): void;
    protected onHandleRemove({ handle, e }: EventArgs['remove']): void;
    protected allowAddVertex(e: Dom.MouseDownEvent): boolean;
    protected onPathMouseDown(evt: Dom.MouseDownEvent): void;
    protected onRemove(): void;
}
interface Options extends ToolItemOptions {
    snapRadius?: number;
    addable?: boolean;
    removable?: boolean;
    removeRedundancies?: boolean;
    stopPropagation?: boolean;
    modifiers?: string | ModifierKey[];
    attrs?: SimpleAttrs | ((handle: Handle) => SimpleAttrs);
    createHandle?: (options: HandleOptions) => Handle;
    processHandle?: (handle: Handle) => void;
    onChanged?: (options: {
        edge: Edge;
        edgeView: EdgeView;
    }) => void;
}
export declare class Handle extends View<EventArgs> {
    readonly options: HandleOptions;
    protected get graph(): Graph;
    constructor(options: HandleOptions);
    render(): void;
    updatePosition(x: number, y: number): void;
    onMouseDown(evt: Dom.MouseDownEvent): void;
    protected onMouseMove(evt: Dom.MouseMoveEvent): void;
    protected onMouseUp(evt: Dom.MouseUpEvent): void;
    protected onDoubleClick(evt: Dom.DoubleClickEvent): void;
}
interface HandleOptions {
    graph: Graph;
    index: number;
    guard: (evt: Dom.EventObject) => boolean;
    attrs: SimpleAttrs | ((handle: Handle) => SimpleAttrs);
}
interface EventArgs {
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
    remove: {
        e: Dom.DoubleClickEvent;
        handle: Handle;
    };
}
export {};
