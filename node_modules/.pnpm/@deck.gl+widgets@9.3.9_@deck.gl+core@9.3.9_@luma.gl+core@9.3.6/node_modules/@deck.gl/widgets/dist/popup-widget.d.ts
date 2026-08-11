import { Widget } from '@deck.gl/core';
import type { Deck, Viewport, WidgetProps } from '@deck.gl/core';
import { type PopoverProps } from "./lib/components/popover.js";
export type PopupContent = {
    text?: string;
    html?: string;
    element?: HTMLElement | null;
};
export type PopupWidgetProps = WidgetProps & {
    /** View to attach to and interact with. Required when using multiple views */
    viewId?: string | null;
    /** Content to display at the anchor. Opens the popup if clicked. */
    marker?: PopupContent | null;
    /** Content to display in the popup */
    content: string | PopupContent;
    /** Whether the pop up is open by default
     * @default true
     */
    defaultIsOpen?: boolean;
    /** Anchor of the popup in world coordinates, e.g. [longitude, latitude]. */
    position: number[];
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
    /** Whether to show a close button in the popup
     * @default true
     */
    closeButton?: boolean;
    /** Close the popup if clicked outside
     * @default false
     */
    closeOnClickOutside?: boolean;
    /** Callback when popup is opened/closed */
    onOpenChange?: (isOpen: boolean) => void;
};
export declare class PopupWidget extends Widget<PopupWidgetProps> {
    static defaultProps: Required<PopupWidgetProps>;
    className: string;
    placement: "fill";
    viewport?: Viewport;
    isOpen: boolean;
    constructor(props: PopupWidgetProps);
    setProps(props: Partial<PopupWidgetProps>): void;
    onAdd({ deck }: {
        deck: Deck<any>;
        viewId: string | null;
    }): void;
    onRemove(): void;
    onViewportChange(viewport: any): void;
    onClick(): void;
    protected _setIsOpen(isOpen: boolean): void;
    onRenderHTML(rootElement: HTMLElement): void;
}
//# sourceMappingURL=popup-widget.d.ts.map