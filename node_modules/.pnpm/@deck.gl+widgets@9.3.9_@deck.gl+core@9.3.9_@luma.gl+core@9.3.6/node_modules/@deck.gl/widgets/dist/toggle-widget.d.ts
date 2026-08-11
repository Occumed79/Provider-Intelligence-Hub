import type { WidgetPlacement, WidgetProps } from '@deck.gl/core';
import { Widget } from '@deck.gl/core';
export type ToggleWidgetProps = WidgetProps & {
    /** Widget positioning within the view. Default 'bottom-left'. */
    placement?: WidgetPlacement;
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    /** If the toggle is checked when first added */
    initialChecked?: boolean;
    /** Data url to display as icon */
    icon: string;
    /** Data url to display as icon when it is checked */
    onIcon?: string;
    /** Tooltip label */
    label?: string;
    /** Tooltip label when it is checked */
    onLabel?: string;
    /** Icon color, a CSS Color string */
    color?: string;
    /** Icon color when it is checked, a CSS Color string */
    onColor?: string;
    /** Callback when the widget is clicked */
    onChange?: (checked: boolean) => void;
};
/**
 * A generic widget that displays a button with icon or text content.
 */
export declare class ToggleWidget extends Widget<ToggleWidgetProps> {
    static defaultProps: Required<ToggleWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    checked: boolean;
    constructor(props: ToggleWidgetProps);
    setProps(props: Partial<ToggleWidgetProps>): void;
    onRenderHTML(rootElement: HTMLElement): void;
    private _toggle;
}
//# sourceMappingURL=toggle-widget.d.ts.map