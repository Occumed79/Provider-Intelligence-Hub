import { Widget } from '@deck.gl/core';
import type { Deck, PickingInfo, Viewport, WidgetProps } from '@deck.gl/core';
import { type PopoverProps } from "./lib/components/popover.js";
export type TooltipContent = {
    /** Anchor of the popup in world coordinates, e.g. [longitude, latitude].
     * If not supplied, default to the mouse position where the popup was triggered.
     */
    position?: number[];
    /** Text content to display in the popup */
    text?: string;
    /** HTML content to display in the popup. If supplied, `text` is ignored. */
    html?: string;
    /** HTML element to attach inside the popup. */
    element?: HTMLElement | null;
    /** Custom class name to add to the popup */
    className?: string;
    /** CSS style overrides of the popup */
    style?: Partial<CSSStyleDeclaration>;
};
export type InfoWidgetProps = WidgetProps & {
    /** View to attach to and interact with. Required when using multiple views */
    viewId?: string | null;
    /** Determines the interaction mode of the widget */
    mode: 'click' | 'hover';
    /** Function to generate the popup contents from the selected element */
    getTooltip?: (info: PickingInfo, widget: InfoWidget) => TooltipContent | string | null | undefined;
    /** Position popup relative to the anchor.
     * @default 'right'
     */
    placement?: PopoverProps['placement'];
    /** Pixel offset
     * @default 10
     */
    offset?: PopoverProps['offset'];
    /**
     * Show an arrow pointing at the anchor. Optionally accepts a pixel size.
     * @default 10
     */
    arrow?: PopoverProps['arrow'];
};
export declare class InfoWidget extends Widget<InfoWidgetProps> {
    static defaultProps: Required<InfoWidgetProps>;
    className: string;
    placement: "fill";
    viewport?: Viewport;
    tooltip: Required<TooltipContent> | null;
    constructor(props: InfoWidgetProps);
    setProps(props: Partial<InfoWidgetProps>): void;
    onAdd({ deck }: {
        deck: Deck<any>;
        viewId: string | null;
    }): void;
    onRemove(): void;
    onViewportChange(viewport: any): void;
    onHover(info: PickingInfo): void;
    onClick(info: PickingInfo): void;
    protected _getTooltip(info: PickingInfo): Required<TooltipContent> | null;
    onRenderHTML(rootElement: HTMLElement): void;
}
//# sourceMappingURL=info-widget.d.ts.map