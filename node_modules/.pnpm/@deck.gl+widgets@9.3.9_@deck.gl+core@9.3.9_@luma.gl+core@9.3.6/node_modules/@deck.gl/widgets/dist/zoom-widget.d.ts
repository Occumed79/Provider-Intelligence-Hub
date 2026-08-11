import { Widget } from '@deck.gl/core';
import type { WidgetProps, WidgetPlacement } from '@deck.gl/core';
export type ZoomWidgetProps = WidgetProps & {
    /** Widget positioning within the view. Default 'top-left'. */
    placement?: WidgetPlacement;
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    /** Button orientation. */
    orientation?: 'vertical' | 'horizontal';
    /** Tooltip message on zoom in button. */
    zoomInLabel?: string;
    /** Tooltip message on zoom out button. */
    zoomOutLabel?: string;
    /** Zoom transition duration in ms. 0 disables the transition */
    transitionDuration?: number;
    /**  Which axes to apply zoom to. One of 'X', 'Y' or 'all'.
     * Only effective if the current view is OrthographicView.
     */
    zoomAxis?: 'X' | 'Y' | 'all';
    /**
     * Callback when zoom buttons are clicked.
     * Called for each viewport that will be zoomed.
     */
    onZoom?: (params: {
        /** The view being zoomed */
        viewId: string;
        /** Zoom direction: +1 for zoom in, -1 for zoom out */
        delta: number;
        /** The new zoom level */
        zoom: number;
        /** The new zoom level of the X axis, if using OrthographicView */
        zoomX?: number;
        /** The new zoom level of the Y axis, if using OrthographicView */
        zoomY?: number;
    }) => void;
};
export declare class ZoomWidget extends Widget<ZoomWidgetProps> {
    static defaultProps: Required<ZoomWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    constructor(props?: ZoomWidgetProps);
    setProps(props: Partial<ZoomWidgetProps>): void;
    onRenderHTML(rootElement: HTMLElement): void;
    isOrthographicView(viewId: string): boolean;
    handleZoom(viewId: string, delta: number): void;
    handleZoomIn(): void;
    handleZoomOut(): void;
}
//# sourceMappingURL=zoom-widget.d.ts.map