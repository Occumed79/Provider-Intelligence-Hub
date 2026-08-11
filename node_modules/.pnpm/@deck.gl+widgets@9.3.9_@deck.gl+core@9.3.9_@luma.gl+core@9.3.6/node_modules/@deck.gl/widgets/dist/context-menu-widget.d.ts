import { Widget } from '@deck.gl/core';
import type { Deck, PickingInfo, WidgetProps } from '@deck.gl/core';
import { type MenuItem } from "./lib/components/dropdown-menu.js";
import { type PopoverProps } from "./lib/components/popover.js";
export type ContextMenuWidgetProps = WidgetProps & {
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    /** Menu items for the menu. */
    menuItems?: MenuItem[];
    /** Callback to provide menu items for the menu given the picked object. Overrides `menuItems` */
    getMenuItems?: (info: PickingInfo, widget: ContextMenuWidget) => MenuItem[] | null;
    /** Callback when a menu item is selected */
    onMenuItemSelected?: (value: string, pickInfo: PickingInfo | null) => void;
    /** Position menu relative to the anchor.
     * @default 'bottom-start'
     */
    placement?: PopoverProps['placement'];
    /** Pixel offset
     * @default 10
     */
    offset?: PopoverProps['offset'];
    /**
     * Show an arrow pointing at the anchor. Optionally accepts a pixel size.
     * @default false
     */
    arrow?: PopoverProps['arrow'];
};
export declare class ContextMenuWidget extends Widget<ContextMenuWidgetProps> {
    static defaultProps: Required<ContextMenuWidgetProps>;
    className: string;
    placement: "fill";
    menu: {
        items: MenuItem[];
        pickInfo: PickingInfo;
    } | null;
    constructor(props: ContextMenuWidgetProps);
    onAdd({ deck }: {
        deck: Deck<any>;
    }): void;
    handleContextMenu(srcEvent: MouseEvent): void;
    onRenderHTML(rootElement: HTMLElement): void;
    hide(): void;
}
//# sourceMappingURL=context-menu-widget.d.ts.map