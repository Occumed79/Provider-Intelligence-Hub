import { Disposable, type KeyValue } from '../common';
import type { Rectangle } from '../geometry';
import type { Graph } from '../graph';
import type { Cell, ModelEventArgs } from '../model';
import { CellView, EdgeView, NodeView, type View } from '../view';
import { JOB_PRIORITY } from './queueJob';
export declare enum SchedulerViewState {
    CREATED = 0,
    MOUNTED = 1,
    WAITING = 2
}
export interface SchedulerView {
    view: CellView;
    flag: number;
    options: KeyValue;
    state: SchedulerViewState;
}
export interface SchedulerEventArgs {
    'view:mounted': {
        view: CellView;
    };
    'view:unmounted': {
        view: CellView;
    };
    'render:done': null;
}
export declare class Scheduler extends Disposable {
    views: KeyValue<SchedulerView>;
    willRemoveViews: KeyValue<SchedulerView>;
    protected zPivots: KeyValue<Comment>;
    private graph;
    private renderArea?;
    private queue;
    get model(): import("../model").Model;
    get container(): SVGGElement;
    constructor(graph: Graph);
    protected init(): void;
    protected startListening(): void;
    protected stopListening(): void;
    protected onModelReseted({ options, previous }: ModelEventArgs['reseted']): void;
    protected onCellAdded({ cell, options }: ModelEventArgs['cell:added']): void;
    protected onCellRemoved({ cell }: ModelEventArgs['cell:removed']): void;
    protected onCellZIndexChanged({ cell, options, }: ModelEventArgs['cell:change:zIndex']): void;
    protected onCellVisibleChanged({ cell, current, }: ModelEventArgs['cell:change:visible']): void;
    requestViewUpdate(view: CellView, flag: number, options?: KeyValue, priority?: JOB_PRIORITY, flush?: boolean): void;
    setRenderArea(area?: Rectangle): void;
    isViewMounted(view: CellView): boolean;
    protected renderViews(cells: Cell[], options?: any): void;
    protected renderViewInArea(view: CellView, flag: number, options?: any): void;
    protected removeViews(cells: Cell[]): void;
    protected flush(): void;
    protected flushWaitingViews(): void;
    protected updateView(view: View, flag: number, options?: KeyValue): number;
    protected insertView(view: CellView): void;
    protected resetViews(): void;
    protected removeView(view: CellView): void;
    protected toggleVisible(cell: Cell, visible: boolean): void;
    protected addZPivot(zIndex?: number): Comment;
    protected removeZPivots(): void;
    protected createCellView(cell: Cell): CellView<Cell<import("../model").CellProperties>, import("../view").CellViewOptions> | EdgeView<import("../model").Edge<import("../model").EdgeProperties>, import("../view").EdgeViewOptions> | NodeView<import("../model").Node<import("../model").NodeProperties>, import("../view").NodeViewOptions>;
    protected getEffectedEdges(view: CellView): {
        id: string;
        view: CellView;
        flag: number;
    }[];
    protected isUpdatable(view: CellView): boolean;
    protected getRenderPriority(view: CellView): JOB_PRIORITY.RenderEdge | JOB_PRIORITY.RenderNode;
    dispose(): void;
}
