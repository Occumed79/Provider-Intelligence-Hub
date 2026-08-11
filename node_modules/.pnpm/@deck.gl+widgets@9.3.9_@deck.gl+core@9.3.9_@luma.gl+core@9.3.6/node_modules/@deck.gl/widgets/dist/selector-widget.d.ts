import { Widget, type WidgetProps, type WidgetPlacement } from '@deck.gl/core';
import { type PopoverProps } from "./lib/components/popover.js";
export type SelectorWidgetOption<ValueT = string> = {
    value: ValueT;
    icon: string;
    label?: string;
};
/** Properties for the ViewSelectorWidget */
export type SelectorWidgetProps<ValueT = string> = WidgetProps & {
    /** Widget positioning within the view. Default 'top-left'. */
    placement?: WidgetPlacement;
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    options: SelectorWidgetOption<ValueT>[];
    /** The initial value. Default to the first option. */
    initialValue?: ValueT;
    /** Callback invoked when the value changes */
    onChange?: (value: ValueT) => void;
};
/**
 * A widget that renders a popup menu for selecting a view mode.
 * It displays a button with the current view mode icon. Clicking the button
 * toggles a popup that shows three icons for:
 * - Single view
 * - Two views, split horizontally
 * - Two views, split vertically
 */
export declare class SelectorWidget<ValueT = string> extends Widget<SelectorWidgetProps<ValueT>> {
    static defaultProps: Required<SelectorWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    value: ValueT;
    isOpen: {
        x: number;
        y: number;
        placement: PopoverProps['placement'];
    } | false;
    constructor(props: SelectorWidgetProps<ValueT>);
    setProps(props: Partial<SelectorWidgetProps<ValueT>>): void;
    onRenderHTML(rootElement: HTMLElement): void;
    private _toggleMenu;
    private _handleSelectMode;
}
//# sourceMappingURL=selector-widget.d.ts.map