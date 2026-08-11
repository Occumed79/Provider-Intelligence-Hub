import { jsx as _jsx } from "preact/jsx-runtime";
import { render } from 'preact';
import { Widget } from '@deck.gl/core';
import { IconButton } from "./lib/components/icon-button.js";
/**
 * A generic widget that displays a button with icon or text content.
 */
export class ToggleWidget extends Widget {
    constructor(props) {
        super(props);
        this.className = 'deck-widget-toggle';
        this.placement = 'top-left';
        this._toggle = () => {
            this.checked = !this.checked;
            this.props.onChange?.(this.checked);
            this.updateHTML();
        };
        this.checked = this.props.initialChecked;
        this.setProps(this.props);
    }
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId;
        super.setProps(props);
    }
    onRenderHTML(rootElement) {
        const { className, style, icon, label, color, onIcon = icon, onLabel = label, onColor = color } = this.props;
        const on = this.checked;
        rootElement.dataset.checked = String(on);
        render(_jsx(IconButton, { className: className, style: style, icon: on ? onIcon : icon, label: on ? onLabel : label, color: on ? onColor : color, onClick: this._toggle }), rootElement);
    }
}
ToggleWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'icon',
    placement: 'top-left',
    viewId: null,
    initialChecked: false,
    icon: '',
    onIcon: undefined,
    label: '',
    onLabel: undefined,
    color: '',
    onColor: undefined,
    onChange: undefined
};
//# sourceMappingURL=toggle-widget.js.map