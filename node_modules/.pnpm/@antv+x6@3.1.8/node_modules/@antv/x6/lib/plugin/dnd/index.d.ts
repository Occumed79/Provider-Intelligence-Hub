import { Dom } from '../../common';
import { type Point, type PointLike, Rectangle } from '../../geometry';
import { Graph, type GraphPlugin, type Options } from '../../graph';
import type { CellBaseEventArgs, Node } from '../../model';
import { type NodeView, View } from '../../view';
import type { Scroller } from '../scroller';
import type { Snapline } from '../snapline';
export interface GetDragNodeOptions {
    sourceNode: Node;
    targetGraph: Graph;
    draggingGraph: Graph;
}
export interface GetDropNodeOptions extends GetDragNodeOptions {
    draggingNode: Node;
}
export interface ValidateNodeOptions extends GetDropNodeOptions {
    droppingNode: Node;
}
export interface DndOptions {
    target: Graph;
    /**
     * Should scale the dragging node or not.
     */
    scaled?: boolean;
    delegateGraphOptions?: Options;
    draggingContainer?: HTMLElement;
    /**
     * dnd tool box container.
     */
    dndContainer?: HTMLElement;
    getDragNode: (sourceNode: Node, options: GetDragNodeOptions) => Node;
    getDropNode: (draggingNode: Node, options: GetDropNodeOptions) => Node;
    validateNode?: (droppingNode: Node, options: ValidateNodeOptions) => boolean | Promise<boolean>;
}
export declare const DndDefaults: Partial<DndOptions>;
export declare class Dnd extends View implements GraphPlugin {
    name: string;
    protected sourceNode: Node | null;
    protected draggingNode: Node | null;
    protected draggingView: NodeView | null;
    protected draggingBBox: Rectangle;
    protected geometryBBox: Rectangle;
    protected candidateEmbedView: NodeView | null;
    protected delta: Point | null;
    protected padding: number | null;
    protected snapOffset: PointLike | null;
    options: DndOptions;
    draggingGraph: Graph;
    protected get targetScroller(): Scroller;
    protected get targetGraph(): Graph;
    protected get targetModel(): import("../../model").Model;
    protected get snapline(): Snapline;
    constructor(options: Partial<DndOptions> & {
        target: Graph;
    });
    init(): void;
    start(node: Node, evt: Dom.MouseDownEvent | MouseEvent): void;
    protected isSnaplineEnabled(): boolean;
    protected prepareDragging(sourceNode: Node, clientX: number, clientY: number): void;
    protected updateGraphPosition(clientX: number, clientY: number): void;
    protected updateNodePosition(x: number, y: number): Point;
    protected snap({ cell, current, options, }: CellBaseEventArgs['change:position']): void;
    protected onMouseMove(evt: Dom.MouseMoveEvent): void;
    protected onMouseUp(evt: Dom.MouseUpEvent): void;
    protected onDragging(evt: Dom.MouseMoveEvent): void;
    protected onDragEnd(evt: Dom.MouseUpEvent): void;
    protected clearDragging(): void;
    protected onDropped(draggingNode: Node): void;
    protected onDropInvalid(): void;
    protected isInsideValidArea(p: PointLike): boolean;
    protected getDropArea(elem: Element): Rectangle;
    protected drop(draggingNode: Node, pos: PointLike): Node<import("../../model").NodeProperties> | Promise<Node<import("../../model").NodeProperties>>;
    protected onRemove(): void;
    dispose(): void;
}
