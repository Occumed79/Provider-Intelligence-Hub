import { Widget, type WidgetProps, type View } from '@deck.gl/core';
export type ViewLayout = {
    /** Stacking orientation of the sub views */
    orientation: 'vertical' | 'horizontal';
    /** Initial instances that describe the sub views.
     * x, y, width and height of the views' props will be overwritten by the SplitterWidget as split changes. */
    views: [view1: View | ViewLayout, view2: View | ViewLayout];
    /** The ratio of view1's share over the whole available height (vertical) or width (horizontal). Between 0-1.
     * @default 0.5
     */
    initialSplit?: number;
    /** Whether the split can be changed by dragging the border between the two views.
     * @default true
     */
    editable?: boolean;
    /** Min value of the split
     * @default 0.05
     */
    minSplit?: number;
    /** Max value of the split
     * @default 0.95
     */
    maxSplit?: number;
};
type ManagedViewLayout = {
    id: number;
    orientation: 'vertical' | 'horizontal';
    views: [view1: View | ManagedViewLayout, view2: View | ManagedViewLayout];
    split: number;
    editable: boolean;
    minSplit: number;
    maxSplit: number;
    x: number;
    y: number;
    width: number;
    height: number;
};
/** Properties for the SplitterWidget */
export type SplitterWidgetProps<ViewsT extends View[] = View[]> = WidgetProps & {
    /** Stacking views descriptor */
    viewLayout: ViewLayout;
    /** Callback invoked when the splitter is dragged with the new split value */
    onChange?: (views: ViewsT) => void;
    /** Callback invoked when dragging starts */
    onDragStart?: () => void;
    /** Callback invoked when dragging ends */
    onDragEnd?: () => void;
};
/**
 * A draggable splitter widget that appears as a vertical or horizontal line
 * across the deck.gl canvas. It positions itself based on the split percentage
 * of the first view and provides callbacks when dragged.
 */
export declare class SplitterWidget<ViewsT extends View[] = View[]> extends Widget<SplitterWidgetProps<ViewsT>, ViewsT> {
    static defaultProps: Required<SplitterWidgetProps>;
    className: string;
    placement: "fill";
    viewLayouts: ManagedViewLayout[];
    /** evaluated from the current viewLayouts */
    views: ViewsT;
    /** views set in the last update */
    lastViews?: ViewsT;
    needsUpdate: boolean;
    constructor(props: SplitterWidgetProps<ViewsT>);
    setProps(props: Partial<SplitterWidgetProps<ViewsT>>): void;
    onRedraw(): void;
    updateHTML(): void;
    private doUpdate;
    private onChange;
    onRenderHTML(rootElement: HTMLElement): void;
}
export {};
//# sourceMappingURL=splitter-widget.d.ts.map