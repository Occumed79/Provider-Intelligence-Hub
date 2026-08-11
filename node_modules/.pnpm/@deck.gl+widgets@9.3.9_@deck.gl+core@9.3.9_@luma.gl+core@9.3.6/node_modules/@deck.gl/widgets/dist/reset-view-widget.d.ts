import type { WidgetPlacement, WidgetProps } from '@deck.gl/core';
import type { ViewStateMap, View } from '@deck.gl/core';
import { Widget } from '@deck.gl/core';
/** @note Mirrors an internal calss in deck.gl/core. We can easily redefine it here */
type ViewOrViews = View | View[] | null;
/** Properties for the ResetViewWidget */
export type ResetViewWidgetProps<ViewsT extends ViewOrViews = null> = WidgetProps & {
    /** Widget positioning within the view. Default 'top-left'. */
    placement?: WidgetPlacement;
    /** Tooltip message */
    label?: string;
    /** The initial view state to reset the view to. Defaults to deck.props.initialViewState */
    initialViewState?: ViewStateMap<ViewsT>;
    /** View to interact with. Required when using multiple views. */
    viewId?: string | null;
    /**
     * Callback when the reset view button is clicked.
     */
    onReset?: (params: {
        /** The view being reset */
        viewId: string;
        /** The view state being reset to */
        viewState: Record<string, unknown>;
    }) => void;
};
/**
 * A button widget that resets the view state of deck to an initial state.
 */
export declare class ResetViewWidget<ViewsT extends ViewOrViews = null> extends Widget<ResetViewWidgetProps<ViewsT>, ViewsT> {
    static defaultProps: Required<ResetViewWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    constructor(props?: ResetViewWidgetProps<ViewsT>);
    setProps(props: Partial<ResetViewWidgetProps<ViewsT>>): void;
    onRenderHTML(rootElement: HTMLElement): void;
    handleClick(): void;
    resetViewState(viewState?: ViewStateMap<ViewsT>): void;
}
export {};
//# sourceMappingURL=reset-view-widget.d.ts.map