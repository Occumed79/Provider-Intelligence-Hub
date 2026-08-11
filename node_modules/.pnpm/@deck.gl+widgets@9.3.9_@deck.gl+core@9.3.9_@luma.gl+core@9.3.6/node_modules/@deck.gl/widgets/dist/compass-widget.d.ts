import { Widget } from '@deck.gl/core';
import type { Viewport, WidgetPlacement, WidgetProps } from '@deck.gl/core';
export type CompassWidgetProps = WidgetProps & {
    /** Widget positioning within the view. Default 'top-left'. */
    placement?: WidgetPlacement;
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    /** Tooltip message. */
    label?: string;
    /** Bearing and pitch reset transition duration in ms. */
    transitionDuration?: number;
    /**
     * Callback when the compass reset button is clicked.
     * Called for each viewport that will be reset.
     */
    onReset?: (params: {
        /** The view being reset */
        viewId: string;
        /** The new bearing value (0) */
        bearing: number;
        /** The new pitch value (0 if bearing was already 0) */
        pitch: number;
    }) => void;
};
export declare class CompassWidget extends Widget<CompassWidgetProps> {
    static defaultProps: Required<CompassWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    viewports: {
        [id: string]: Viewport;
    };
    constructor(props?: CompassWidgetProps);
    setProps(props: Partial<CompassWidgetProps>): void;
    onRenderHTML(rootElement: HTMLElement): void;
    onViewportChange(viewport: Viewport): void;
    getRotation(viewport?: Viewport): number[];
    handleCompassReset(viewport: Viewport): void;
}
//# sourceMappingURL=compass-widget.d.ts.map