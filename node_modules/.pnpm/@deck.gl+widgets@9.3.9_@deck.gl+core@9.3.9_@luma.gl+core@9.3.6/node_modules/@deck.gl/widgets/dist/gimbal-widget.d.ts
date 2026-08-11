import { Widget } from '@deck.gl/core';
import type { Viewport, WidgetPlacement, WidgetProps } from '@deck.gl/core';
export type GimbalWidgetProps = WidgetProps & {
    placement?: WidgetPlacement;
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    /** Tooltip message. */
    label?: string;
    /** Width of gimbal lines. */
    strokeWidth?: number;
    /** Transition duration in ms when resetting rotation. */
    transitionDuration?: number;
    /**
     * Callback when the gimbal reset button is clicked.
     * Called for each viewport that will be reset.
     */
    onReset?: (params: {
        /** The view being reset */
        viewId: string;
        /** The new rotationOrbit value (0) */
        rotationOrbit: number;
        /** The new rotationX value (0) */
        rotationX: number;
    }) => void;
};
export declare class GimbalWidget extends Widget<GimbalWidgetProps> {
    static defaultProps: Required<GimbalWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    viewports: {
        [id: string]: Viewport;
    };
    constructor(props?: GimbalWidgetProps);
    setProps(props: Partial<GimbalWidgetProps>): void;
    onRenderHTML(rootElement: HTMLElement): void;
    onViewportChange(viewport: Viewport): void;
    resetOrbitView(viewport?: Viewport): void;
    getNormalizedRotation(viewport?: Viewport): {
        rotationOrbit: number;
        rotationX: number;
    };
    getRotation(viewState?: any): [number, number];
}
//# sourceMappingURL=gimbal-widget.d.ts.map