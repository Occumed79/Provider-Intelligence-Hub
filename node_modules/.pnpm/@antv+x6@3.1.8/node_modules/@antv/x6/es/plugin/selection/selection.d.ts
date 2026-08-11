import { Dom, type KeyValue, type ModifierKey } from '../../common';
import { type Point, type PointLike, Rectangle } from '../../geometry';
import type { Graph } from '../../graph';
import type { CollectionAddOptions, CollectionRemoveOptions, CollectionSetOptions, Edge, Model, Node, SetOptions } from '../../model';
import { Cell, Collection, type CollectionEventArgs } from '../../model';
import type { RouterData } from '../../model/edge';
import { type CellView, View } from '../../view';
export declare class SelectionImpl extends View<SelectionImplEventArgs> {
    readonly options: SelectionImplOptions;
    protected readonly collection: Collection;
    protected selectionContainer: HTMLElement;
    protected selectionContent: HTMLElement;
    protected boxCount: number;
    protected boxesUpdated: boolean;
    protected updateThrottleTimer: ReturnType<typeof setTimeout> | null;
    protected isDragging: boolean;
    protected batchUpdating: boolean;
    protected dragRafId: number | null;
    protected transformRafId: number | null;
    protected dragPendingOffset: {
        dx: number;
        dy: number;
    } | null;
    protected containerLocalOffsetX: number;
    protected containerLocalOffsetY: number;
    protected containerOffsetX: number;
    protected containerOffsetY: number;
    protected draggingPreviewMode: 'translate' | 'geometry';
    protected translatingCache: {
        selectedNodes: Node[];
        nodeIdSet: Set<string>;
        edgesToTranslate: Edge[];
    } | null;
    protected movingRouterRestoreCache: KeyValue<RouterData | undefined> | null;
    protected movingRouterRestoreTimer: ReturnType<typeof setTimeout> | null;
    protected lastMovingTs: number | null;
    protected movingDegradeActivatedTs: number | null;
    private static readonly RESTORE_IDLE_TIME;
    private static readonly RESTORE_HOLD_TIME;
    private static readonly MIN_RESTORE_WAIT_TIME;
    get graph(): Graph;
    protected get boxClassName(): string;
    protected get $boxes(): Element[];
    protected get handleOptions(): SelectionImplOptions;
    constructor(options: SelectionImplOptions);
    protected startListening(): void;
    protected stopListening(): void;
    protected onRemove(): void;
    protected onGraphTransformed(): void;
    protected onCellChanged(): void;
    protected translating: boolean;
    protected onNodePositionChanged({ node, options, }: CollectionEventArgs['node:change:position']): void;
    protected onModelUpdated({ removed }: CollectionEventArgs['updated']): void;
    isEmpty(): boolean;
    isSelected(cell: Cell | string): boolean;
    get length(): number;
    get cells(): Cell<import("../../model").CellProperties>[];
    select(cells: Cell | Cell[], options?: SelectionImplAddOptions): this;
    unselect(cells: Cell | Cell[], options?: SelectionImplRemoveOptions): this;
    reset(cells?: Cell | Cell[], options?: SelectionImplSetOptions): this;
    clean(options?: SelectionImplSetOptions): this;
    setFilter(filter?: SelectionImplFilter): void;
    setContent(content?: SelectionImplContent): void;
    startSelecting(evt: Dom.MouseDownEvent): void;
    filter(cells: Cell[]): Cell<import("../../model").CellProperties>[];
    protected stopSelecting(evt: Dom.MouseUpEvent): void;
    protected onMouseUp(evt: Dom.MouseUpEvent): void;
    protected onSelectionBoxMouseDown(evt: Dom.MouseDownEvent): void;
    protected onSelectionContainerMouseDown(evt: Dom.MouseDownEvent): void;
    protected handleSelectionMouseDown(evt: Dom.MouseDownEvent, isBox: boolean): void;
    protected startTranslating(evt: Dom.MouseDownEvent): void;
    private getRestrictArea;
    protected prepareTranslatingCache(): void;
    /**
     * 在移动过程中对与当前选中节点相连的边进行临时路由降级
     */
    protected applyMovingRouterFallback(): void;
    /**
     * 恢复移动过程中被降级的边的原始路由：
     * - 如果原始路由为空则移除路由设置
     * - 完成恢复后清空缓存，等待下一次移动重新降级
     */
    protected restoreMovingRouters(): void;
    /**
     * 在移动停止后延迟恢复路由，避免连线抖动：
     * - `idle`：距离上次移动的空闲时间必须超过 100ms
     * - `hold`：降级保持时间必须超过 150ms
     * - 若条件未满足则按最小等待时间再次调度恢复
     */
    protected scheduleMovingRouterRestoreThrottle(): void;
    protected getSelectionOffset(client: Point, data: TranslatingEventData): {
        dx: number;
        dy: number;
    };
    protected updateSelectedNodesPosition(offset: {
        dx: number;
        dy: number;
    }): void;
    protected autoScrollGraph(x: number, y: number): {
        scrollerX: number;
        scrollerY: number;
    };
    protected adjustSelection(evt: Dom.MouseMoveEvent): void;
    protected translateSelectedNodes(dx: number, dy: number, exclude?: Cell, otherOptions?: KeyValue): void;
    protected getCellViewsInArea(rect: Rectangle): CellView<Cell<import("../../model").CellProperties>, import("../../view").CellViewOptions>[];
    protected getCellsInArea(rect: Rectangle): Cell<import("../../model").CellProperties>[];
    protected getSelectingRect(): Rectangle;
    protected getBoxEventCells(cells?: Cell[], activeView?: CellView | null): {
        view: CellView<Cell<import("../../model").CellProperties>, import("../../view").CellViewOptions>;
        cell: Cell<import("../../model").CellProperties>;
        nodes: Node<import("../../model").NodeProperties>[];
        edges: Edge<import("../../model").EdgeProperties>[];
    };
    protected notifyBoxEvent<K extends keyof SelectionImplBoxEventArgsRecord, T extends Dom.EventObject>(name: K, e: T, x: number, y: number, cells?: Cell[]): void;
    protected getSelectedClassName(cell: Cell): string;
    protected addCellSelectedClassName(cell: Cell): void;
    protected removeCellUnSelectedClassName(cell: Cell): void;
    protected destroySelectionBox(cell: Cell): void;
    protected destroyAllSelectionBoxes(cells: Cell[]): void;
    hide(): void;
    protected showRubberband(): void;
    protected hideRubberband(): void;
    protected showSelected(): void;
    protected createContainer(): void;
    protected getDraggingPreviewMode(): "translate" | "geometry";
    protected applyDraggingPreview(offset: {
        dx: number;
        dy: number;
    }): void;
    protected resetContainerPosition(): void;
    protected syncContainerPosition(): void;
    protected updateContainerPosition(offset: {
        dx: number;
        dy: number;
    }): void;
    protected updateContainer(): void;
    protected canShowSelectionBox(cell: Cell): boolean;
    protected getPointerEventsValue(pointerEvents: 'none' | 'auto' | ((cells: Cell[]) => 'none' | 'auto')): "auto" | "none";
    protected createSelectionBox(cell: Cell): void;
    protected updateSelectionBoxes(): void;
    protected refreshSelectionBoxes(): void;
    protected repositionSelectionBoxesInPlace(): void;
    protected getCellViewFromElem(elem: Element): CellView<Cell<import("../../model").CellProperties>, import("../../view").CellViewOptions>;
    protected onCellRemoved({ cell }: CollectionEventArgs['removed']): void;
    protected onReseted({ previous, current }: CollectionEventArgs['reseted']): void;
    protected onCellAdded({ cell }: CollectionEventArgs['added']): void;
    protected listenCellRemoveEvent(cell: Cell): void;
    protected onCollectionUpdated({ added, removed, options, }: CollectionEventArgs['updated']): void;
    dispose(): void;
}
type SelectionEventType = 'leftMouseDown' | 'mouseWheelDown';
export interface SelectionImplCommonOptions {
    model?: Model;
    collection?: Collection;
    className?: string;
    strict?: boolean;
    filter?: SelectionImplFilter;
    modifiers?: string | ModifierKey[] | null;
    multiple?: boolean;
    multipleSelectionModifiers?: string | ModifierKey[] | null;
    selectCellOnMoved?: boolean;
    selectNodeOnMoved?: boolean;
    selectEdgeOnMoved?: boolean;
    showEdgeSelectionBox?: boolean;
    showNodeSelectionBox?: boolean;
    movable?: boolean;
    following?: boolean;
    content?: SelectionImplContent;
    rubberband?: boolean;
    rubberNode?: boolean;
    rubberEdge?: boolean;
    pointerEvents?: 'none' | 'auto' | ((cells: Cell[]) => 'none' | 'auto');
    eventTypes?: SelectionEventType[];
    movingRouterFallback?: string;
}
export interface SelectionImplOptions extends SelectionImplCommonOptions {
    graph: Graph;
}
export type SelectionImplContent = null | false | string | ((this: Graph, selection: SelectionImpl, contentElement: HTMLElement) => string);
export type SelectionImplFilter = null | (string | {
    id: string;
})[] | ((this: Graph, cell: Cell) => boolean);
export interface SelectionImplSetOptions extends CollectionSetOptions {
    batch?: boolean;
}
export interface SelectionImplAddOptions extends CollectionAddOptions {
}
export interface SelectionImplRemoveOptions extends CollectionRemoveOptions {
}
interface BaseSelectionBoxEventArgs<T> {
    e: T;
    view: CellView | null;
    cell: Cell | null;
    x: number;
    y: number;
    nodes: Node[];
    edges: Edge[];
}
export interface SelectionImplBoxEventArgsRecord {
    'box:mousedown': BaseSelectionBoxEventArgs<Dom.MouseDownEvent>;
    'box:mousemove': BaseSelectionBoxEventArgs<Dom.MouseMoveEvent>;
    'box:mouseup': BaseSelectionBoxEventArgs<Dom.MouseUpEvent>;
}
export interface SelectionImplEventArgsRecord {
    'cell:selected': {
        cell: Cell;
        options: SetOptions;
    };
    'node:selected': {
        cell: Cell;
        node: Node;
        options: SetOptions;
    };
    'edge:selected': {
        cell: Cell;
        edge: Edge;
        options: SetOptions;
    };
    'cell:unselected': {
        cell: Cell;
        options: SetOptions;
    };
    'node:unselected': {
        cell: Cell;
        node: Node;
        options: SetOptions;
    };
    'edge:unselected': {
        cell: Cell;
        edge: Edge;
        options: SetOptions;
    };
    'selection:changed': {
        added: Cell[];
        removed: Cell[];
        selected: Cell[];
        options: SetOptions;
    };
}
export interface SelectionImplEventArgs extends SelectionImplBoxEventArgsRecord, SelectionImplEventArgsRecord {
}
export declare const classNames: {
    root: string;
    inner: string;
    box: string;
    content: string;
    rubberband: string;
    selected: string;
};
export declare const documentEvents: {
    mousemove: string;
    touchmove: string;
    mouseup: string;
    touchend: string;
    touchcancel: string;
};
export declare function depthComparator(cell: Cell): number;
export interface CommonEventData {
    action: 'selecting' | 'translating';
}
export interface SelectingEventData extends CommonEventData {
    action: 'selecting';
    moving?: boolean;
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
    scrollerX: number;
    scrollerY: number;
}
export interface TranslatingEventData extends CommonEventData {
    action: 'translating';
    clientX: number;
    clientY: number;
    originX: number;
    originY: number;
}
export interface SelectionBoxEventData {
    activeView: CellView;
}
export interface RotationEventData {
    rotated?: boolean;
    center: PointLike;
    start: number;
    angles: {
        [id: string]: number;
    };
}
export interface ResizingEventData {
    resized?: boolean;
    bbox: Rectangle;
    cells: Cell[];
    minWidth: number;
    minHeight: number;
}
export {};
