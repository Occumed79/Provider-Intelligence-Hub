import { Basecoat, Dom, type ModifierKey } from '../../common';
import type { Point, PointLike, Rectangle, RectangleLike } from '../../geometry';
import type { BackgroundManagerOptions, GetContentAreaOptions, Graph, GraphPlugin, ScaleContentToFitOptions, ZoomOptions } from '../../graph';
import type { Cell } from '../../model';
import type { CenterOptions, Direction, EventArgs, PositionContentOptions, Options as SOptions, TransitionOptions, TransitionToRectOptions } from './scroller';
import './api';
export interface ScrollerEventArgs extends EventArgs {
}
interface Options extends SOptions {
    pannable?: boolean | {
        enabled: boolean;
        eventTypes: Array<'leftMouseDown' | 'rightMouseDown'>;
    };
    modifiers?: string | ModifierKey[] | null;
}
export type ScrollerOptions = Omit<Options, 'graph'>;
export declare class Scroller extends Basecoat<ScrollerEventArgs> implements GraphPlugin {
    name: string;
    options: ScrollerOptions;
    private graph;
    private scrollerImpl;
    get pannable(): boolean;
    get container(): HTMLDivElement;
    constructor(options?: ScrollerOptions);
    init(graph: Graph): void;
    resize(width?: number, height?: number): void;
    resizePage(width?: number, height?: number): void;
    zoom(): number;
    zoom(factor: number, options?: ZoomOptions): this;
    zoomTo(factor: number, options?: Omit<ZoomOptions, 'absolute'>): this;
    zoomToRect(rect: RectangleLike, options?: ScaleContentToFitOptions & ScaleContentToFitOptions): this;
    zoomToFit(options?: GetContentAreaOptions & ScaleContentToFitOptions): this;
    center(optons?: CenterOptions): this;
    centerPoint(x: number, y: null | number, options?: CenterOptions): this;
    centerPoint(x: null | number, y: number, options?: CenterOptions): this;
    centerPoint(optons?: CenterOptions): this;
    centerContent(options?: PositionContentOptions): this;
    centerCell(cell: Cell, options?: CenterOptions): this;
    positionPoint(point: PointLike, x: number | string, y: number | string, options?: CenterOptions): this;
    positionRect(rect: RectangleLike, direction: Direction, options?: CenterOptions): this;
    positionCell(cell: Cell, direction: Direction, options?: CenterOptions): this;
    positionContent(pos: Direction, options?: PositionContentOptions): this;
    drawBackground(options?: BackgroundManagerOptions, onGraph?: boolean): this;
    clearBackground(onGraph?: boolean): this;
    isPannable(): boolean;
    enablePanning(): void;
    disablePanning(): void;
    togglePanning(pannable?: boolean): this;
    lockScroller(): this;
    unlockScroller(): this;
    updateScroller(): this;
    getScrollbarPosition(): {
        left: number;
        top: number;
    };
    setScrollbarPosition(left?: number, top?: number): this;
    scrollToPoint(x: number | null | undefined, y: number | null | undefined): this;
    scrollToContent(): this;
    scrollToCell(cell: Cell): this;
    transitionToPoint(p: PointLike, options?: TransitionOptions): this;
    transitionToPoint(x: number, y: number, options?: TransitionOptions): this;
    transitionToRect(rect: RectangleLike, options?: TransitionToRectOptions): this;
    enableAutoResize(): void;
    disableAutoResize(): void;
    autoScroll(clientX: number, clientY: number): {
        scrollerX: number;
        scrollerY: number;
    };
    clientToLocalPoint(x: number, y: number): Point;
    getVisibleArea(): Rectangle;
    isCellVisible(cell: Cell, options?: {
        strict?: boolean;
    }): boolean;
    isPointVisible(point: PointLike): boolean;
    protected setup(): void;
    protected startListening(): void;
    protected stopListening(): void;
    protected onRightMouseDown(e: Dom.MouseDownEvent): void;
    protected preparePanning({ e }: {
        e: Dom.MouseDownEvent;
    }): void;
    protected allowPanning(e: Dom.MouseDownEvent, strict?: boolean): boolean;
    protected updateClassName(isPanning?: boolean): void;
    /**
     * 当 Scroller 插件启用时，默认关闭 Graph 的内置 panning，
     * 以避免滚动容器的拖拽与画布平移产生冲突。
     */
    protected autoDisableGraphPanning(): void;
    dispose(): void;
}
export {};
