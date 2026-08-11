import { Dom, NumberExt } from '../../common';
import { Point, Rectangle, type PointLike, type RectangleLike } from '../../geometry';
import { BackgroundManager, type BackgroundManagerOptions, type EventArgs as TEventArgs, type Graph, FitToContentFullOptions, ZoomOptions, ScaleContentToFitOptions, GetContentAreaOptions } from '../../graph';
import type { Cell } from '../../model';
import type { ViewEvents } from '../../types';
import { View } from '../../view';
export interface EventArgs {
    'pan:start': {
        e: Dom.MouseDownEvent;
    };
    panning: {
        e: Dom.MouseMoveEvent;
    };
    'pan:stop': {
        e: Dom.MouseUpEvent;
    };
}
export interface Options {
    graph: Graph;
    enabled?: boolean;
    className?: string;
    width?: number;
    height?: number;
    pageWidth?: number;
    pageHeight?: number;
    pageVisible?: boolean;
    pageBreak?: boolean;
    minVisibleWidth?: number;
    minVisibleHeight?: number;
    background?: false | BackgroundManagerOptions;
    autoResize?: boolean;
    padding?: NumberExt.SideOptions | ((this: ScrollerImpl, scroller: ScrollerImpl) => NumberExt.SideOptions);
    autoResizeOptions?: FitToContentFullOptions | ((this: ScrollerImpl, scroller: ScrollerImpl) => FitToContentFullOptions);
}
export interface CenterOptions {
    padding?: NumberExt.SideOptions;
}
export type PositionContentOptions = GetContentAreaOptions & CenterOptions;
export type Direction = 'center' | 'top' | 'top-right' | 'top-left' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left';
export interface TransitionOptions {
    /**
     * The zoom level to reach at the end of the transition.
     */
    scale?: number;
    duration?: string;
    delay?: string;
    timing?: string;
    onTransitionEnd?: (this: ScrollerImpl, e: TransitionEvent) => void;
}
export interface TransitionToRectOptions extends TransitionOptions {
    minScale?: number;
    maxScale?: number;
    scaleGrid?: number;
    visibility?: number;
    center?: PointLike;
}
export type AutoResizeDirection = 'top' | 'right' | 'bottom' | 'left';
export declare const containerClass = "graph-scroller";
export declare const panningClass = "graph-scroller-panning";
export declare const pannableClass = "graph-scroller-pannable";
export declare const pagedClass = "graph-scroller-paged";
export declare const contentClass = "graph-scroller-content";
export declare const backgroundClass = "graph-scroller-background";
export declare const transitionClassName = "transition-in-progress";
export declare const transitionEventName = "transitionend.graph-scroller-transition";
export declare const defaultOptions: Partial<Options>;
export declare function getOptions(options: Options): Options;
export declare class ScrollerImpl extends View<EventArgs> {
    private readonly content;
    protected pageBreak: HTMLDivElement | null;
    readonly options: Options;
    readonly container: HTMLDivElement;
    readonly background: HTMLDivElement;
    readonly backgroundManager: ScrollerImplBackground;
    get graph(): Graph;
    private get model();
    protected sx: number;
    protected sy: number;
    protected clientX: number;
    protected clientY: number;
    protected padding: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    protected cachedScrollLeft: number | null;
    protected cachedScrollTop: number | null;
    protected cachedCenterPoint: PointLike | null;
    protected cachedClientSize: {
        width: number;
        height: number;
    } | null;
    protected delegatedHandlers: {
        [name: string]: (...args: any) => any;
    };
    constructor(options: Options);
    protected startListening(): void;
    protected stopListening(): void;
    enableAutoResize(): void;
    disableAutoResize(): void;
    protected onUpdate(): void;
    protected delegateBackgroundEvents(events?: ViewEvents): void;
    protected undelegateBackgroundEvents(): void;
    protected onBackgroundEvent(e: Dom.EventObject): void;
    protected onResize(): void;
    protected onScale({ sx, sy, ox, oy }: TEventArgs['scale']): void;
    protected storeScrollPosition(): void;
    protected restoreScrollPosition(): void;
    protected storeClientSize(): void;
    protected restoreClientSize(): void;
    protected beforeManipulation(): void;
    protected afterManipulation(): void;
    updatePageSize(width?: number, height?: number): void;
    protected updatePageBreak(): void;
    update(): void;
    protected getFitToContentOptions(options: FitToContentFullOptions): FitToContentFullOptions;
    protected updateScale(sx: number, sy: number): void;
    scrollbarPosition(): {
        left: number;
        top: number;
    };
    scrollbarPosition(left?: number, top?: number): this;
    /**
     * Try to scroll to ensure that the position (x,y) on the graph (in local
     * coordinates) is at the center of the viewport. If only one of the
     * coordinates is specified, only scroll in the specified dimension and
     * keep the other coordinate unchanged.
     */
    scrollToPoint(x: number | null | undefined, y: number | null | undefined): this;
    /**
     * Try to scroll to ensure that the center of graph content is at the
     * center of the viewport.
     */
    scrollToContent(): this;
    /**
     * Try to scroll to ensure that the center of cell is at the center of
     * the viewport.
     */
    scrollToCell(cell: Cell): this;
    /**
     * The center methods are more aggressive than the scroll methods. These
     * methods position the graph so that a specific point on the graph lies
     * at the center of the viewport, adding paddings around the paper if
     * necessary (e.g. if the requested point lies in a corner of the paper).
     * This means that the requested point will always move into the center
     * of the viewport. (Use the scroll functions to avoid adding paddings
     * and only scroll the viewport as far as the graph boundary.)
     */
    /**
     * Position the center of graph to the center of the viewport.
     */
    center(optons?: CenterOptions): this;
    /**
     * Position the point (x,y) on the graph (in local coordinates) to the
     * center of the viewport. If only one of the coordinates is specified,
     * only center along the specified dimension and keep the other coordinate
     * unchanged.
     */
    centerPoint(x: number, y: null | number, options?: CenterOptions): this;
    centerPoint(x: null | number, y: number, options?: CenterOptions): this;
    centerPoint(optons?: CenterOptions): this;
    centerContent(options?: PositionContentOptions): this;
    centerCell(cell: Cell, options?: CenterOptions): this;
    /**
     * The position methods are a more general version of the center methods.
     * They position the graph so that a specific point on the graph lies at
     * requested coordinates inside the viewport.
     */
    /**
     *
     */
    positionContent(pos: Direction, options?: PositionContentOptions): this;
    positionCell(cell: Cell, pos: Direction, options?: CenterOptions): this;
    positionRect(rect: RectangleLike, pos: Direction, options?: CenterOptions): this;
    positionPoint(point: PointLike, x: number | string, y: number | string, options?: CenterOptions): this;
    zoom(): number;
    zoom(factor: number, options?: ZoomOptions): this;
    zoomToRect(rect: RectangleLike, options?: ScaleContentToFitOptions): this;
    zoomToFit(options?: GetContentAreaOptions & ScaleContentToFitOptions): this;
    transitionToPoint(p: PointLike, options?: TransitionOptions): this;
    transitionToPoint(x: number, y: number, options?: TransitionOptions): this;
    protected syncTransition(scale: number, p: PointLike): this;
    protected removeTransition(): this;
    transitionToRect(rectangle: RectangleLike, options?: TransitionToRectOptions): this;
    startPanning(evt: Dom.MouseDownEvent): void;
    pan(evt: Dom.MouseMoveEvent): void;
    stopPanning(e: Dom.MouseUpEvent): void;
    clientToLocalPoint(p: PointLike): Point;
    clientToLocalPoint(x: number, y: number): Point;
    localToBackgroundPoint(p: PointLike): Point;
    localToBackgroundPoint(x: number, y: number): Point;
    resize(width?: number, height?: number): void;
    getClientSize(): {
        width: number;
        height: number;
    };
    autoScroll(clientX: number, clientY: number): {
        scrollerX: number;
        scrollerY: number;
    };
    protected addPadding(left?: number, right?: number, top?: number, bottom?: number): this;
    protected getPadding(): {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    /**
     * Returns the untransformed size and origin of the current viewport.
     */
    getVisibleArea(): Rectangle;
    isCellVisible(cell: Cell, options?: {
        strict?: boolean;
    }): boolean;
    isPointVisible(point: PointLike): boolean;
    /**
     * Lock the current viewport by disabling user scrolling.
     */
    lock(): this;
    /**
     * Enable user scrolling if previously locked.
     */
    unlock(): this;
    protected onRemove(): void;
    dispose(): void;
}
export declare class ScrollerImplBackground extends BackgroundManager {
    protected readonly scroller: ScrollerImpl;
    protected get elem(): HTMLDivElement;
    constructor(scroller: ScrollerImpl);
    protected init(): void;
    protected updateBackgroundOptions(options?: BackgroundManagerOptions): void;
}
