import type { WidgetPlacement, WidgetProps } from '@deck.gl/core';
import { Widget } from '@deck.gl/core';
export type IconWidgetProps = WidgetProps & {
    /** Widget positioning within the view. Default 'bottom-left'. */
    placement?: WidgetPlacement;
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    /** Data url to display as icon */
    icon: string;
    /** Tooltip label */
    label?: string;
    /** Icon color, a CSS Color string */
    color?: string;
    /** Callback when the widget is clicked */
    onClick?: () => void;
};
/**
 * A generic widget that displays a button with icon or text content.
 */
export declare class IconWidget extends Widget<IconWidgetProps> {
    static defaultProps: Required<IconWidgetProps>;
    className: string;
    placement: WidgetPlacement;
    constructor(props: IconWidgetProps);
    setProps(props: Partial<IconWidgetProps>): void;
    onRenderHTML(rootElement: HTMLElement): void;
}
//# sourceMappingURL=icon-widget.d.ts.map