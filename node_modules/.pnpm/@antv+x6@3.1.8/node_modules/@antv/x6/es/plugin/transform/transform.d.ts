import type { NodeViewPositionEventArgs } from '../../view/node/type';
import { Dom, type KeyValue } from '../../common';
import type { Graph } from '../../graph';
import type { Node, ResizeDirection } from '../../model';
import { type NodeView, View } from '../../view';
interface ResizeEventArgs<E> extends NodeViewPositionEventArgs<E> {
}
interface RotateEventArgs<E> extends NodeViewPositionEventArgs<E> {
}
export interface TransformImplEventArgs {
    'node:resize': ResizeEventArgs<Dom.MouseDownEvent>;
    'node:resizing': ResizeEventArgs<Dom.MouseMoveEvent>;
    'node:resized': ResizeEventArgs<Dom.MouseUpEvent>;
    'node:rotate': RotateEventArgs<Dom.MouseDownEvent>;
    'node:rotating': RotateEventArgs<Dom.MouseMoveEvent>;
    'node:rotated': RotateEventArgs<Dom.MouseUpEvent>;
}
export interface TransformImplOptions {
    className?: string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    resizable?: boolean;
    rotatable?: boolean;
    rotateGrid?: number;
    orthogonalResizing?: boolean;
    restrictedResizing?: boolean | number;
    autoScrollOnResizing?: boolean;
    /**
     * Set to `true` if you want the resizing to preserve the
     * aspect ratio of the node. Default is `false`.
     */
    preserveAspectRatio?: boolean;
    /**
     * Reaching the minimum width or height is whether to allow control points to reverse
     */
    allowReverse?: boolean;
}
export declare const NODE_CLS = "has-widget-transform";
export declare const DIRECTIONS: string[];
export declare const POSITIONS: ResizeDirection[];
export declare class TransformImpl extends View<TransformImplEventArgs> {
    private node;
    private graph;
    private options;
    protected handle: Element | null;
    protected prevShift: number;
    container: HTMLElement;
    protected get model(): import("../../model").Model;
    protected get view(): import("../../view").CellView<import("../../model").Cell<import("../../model").CellProperties>, import("../../view").CellViewOptions>;
    protected get containerClassName(): string;
    protected get resizeClassName(): string;
    protected get rotateClassName(): string;
    constructor(options: TransformImplOptions, node: Node, graph: Graph);
    protected startListening(): void;
    protected stopListening(): void;
    protected renderHandles(): void;
    render(): this;
    update(): this;
    remove(): this;
    protected onKnobMouseDown(): void;
    protected onKnobMouseUp(): void;
    protected updateResizerDirections(): void;
    protected getTrueDirection(dir: ResizeDirection): ResizeDirection;
    protected toValidResizeDirection(dir: string): ResizeDirection;
    protected startResizing(evt: Dom.MouseDownEvent): void;
    protected prepareResizing(evt: Dom.EventObject, relativeDirection: ResizeDirection): void;
    protected startRotating(evt: Dom.MouseDownEvent): void;
    protected onMouseMove(evt: Dom.MouseMoveEvent): void;
    protected onMouseUp(evt: Dom.MouseUpEvent): void;
    protected startHandle(handle?: Element | null): void;
    protected stopHandle(): void;
    protected startAction(evt: Dom.MouseDownEvent): void;
    protected stopAction(evt: Dom.MouseUpEvent): void;
    protected notify<K extends keyof TransformImplEventArgs, T extends Dom.EventObject>(name: K, evt: T, view: NodeView, args?: KeyValue): void;
    dispose(): void;
}
export {};
