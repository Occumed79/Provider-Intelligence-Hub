import { jsx as _jsx } from "preact/jsx-runtime";
import { render } from 'preact';
import { Widget } from '@deck.gl/core';
import { IconButton } from "./lib/components/icon-button.js";
/**
 * A generic widget that displays a button with icon or text content.
 */
export class IconWidget extends Widget {
    constructor(props) {
        super(props);
        this.className = '';
        this.placement = 'top-left';
        this.setProps(this.props);
    }
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId;
        super.setProps(props);
    }
    onRenderHTML(rootElement) {
        const { className, style, icon, color, label, onClick } = this.props;
        render(_jsx(IconButton, { className: className, style: style, color: color, icon: icon, label: label, onClick: onClick }), rootElement);
    }
}
IconWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'icon',
    placement: 'top-left',
    viewId: null,
    icon: '',
    label: '',
    color: '',
    onClick: undefined
};
//# sourceMappingURL=icon-widget.js.map