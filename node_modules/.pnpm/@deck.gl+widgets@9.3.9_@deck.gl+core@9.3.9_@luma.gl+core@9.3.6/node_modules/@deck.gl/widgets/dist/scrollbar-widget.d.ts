import { Widget } from '@deck.gl/core';
import type { Position, Viewport, WidgetPlacement, WidgetProps } from '@deck.gl/core';
export type ScrollbarOrientation = 'vertical' | 'horizontal';
export type ContentBounds = [min: Position, max: Position];
export type ScrollbarDecoration = {
    contentBounds: ContentBounds;
    color: string;
    title?: string;
    /** Callback when the decoration is clicked. Return `true` to mark the event as handled, and prevent the default behavior. */
    onClick?: (evt: MouseEvent) => boolean;
};
export type ScrollbarWidgetProps = WidgetProps & {
    /** The full extent of the scrollable content, in world coordinates.
     * The widget relies on this value to calculate the position and size of the slider button and track.
     * If not supplied, the scrollbar will always be hidden.
     */
    contentBounds?: ContentBounds | null;
    placement?: WidgetPlacement;
    viewId?: string | null;
    /** Direction of the scrollbar. `'horizontal'` scrolls the camera along the X axis, and `'vertical'` scrolls the camera along the Y axis.
     * @default 'vertical'
     */
    orientation?: ScrollbarOrientation;
    stepSize?: number | null;
    pageSize?: number | null;
    /** Label of the step button at the start.
     * @default 'Scroll left' | 'Scroll up'
     */
    startButtonAriaLabel?: string;
    /** Label of the end button at the start.
     * @default 'Scroll right' | 'Scroll down'
     */
    endButtonAriaLabel?: string;
    /** If `true`, mouse wheel events over the canvas will be intercepted by this scrollbar.
     * Useful when simulating the native scrollbar's behavior.
     * @default false
     */
    captureWheel?: boolean;
    /** Custom markers to overlay on the track. */
    decorations?: ScrollbarDecoration[];
};
type ScrollbarWidgetRequiredProps = Required<ScrollbarWidgetProps>;
/** A scrollbar widget to be used with OrthographicView */
export declare class ScrollbarWidget extends Widget<ScrollbarWidgetProps> {
    static defaultProps: ScrollbarWidgetRequiredProps;
    className: string;
    placement: WidgetPlacement;
    private viewport?;
    private contentSize;
    private viewportSize;
    private scrollOffset;
    constructor(props: ScrollbarWidgetProps);
    onViewportChange(viewport: Viewport): void;
    onRenderHTML(): void;
    onRemove(): void;
    private getContentBounds;
    private updateViewport;
    private getDecorations;
    private getWheelEventTarget;
    private getMaxScroll;
    private getClampedOffset;
    private isVertical;
    private getEffectiveStep;
    private getEffectivePage;
    private emitScroll;
    private handleRangeChange;
}
export {};
//# sourceMappingURL=scrollbar-widget.d.ts.map