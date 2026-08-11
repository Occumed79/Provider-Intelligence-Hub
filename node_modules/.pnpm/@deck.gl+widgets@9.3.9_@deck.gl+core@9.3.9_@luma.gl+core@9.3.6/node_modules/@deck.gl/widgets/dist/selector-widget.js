import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { render } from 'preact';
import { Widget } from '@deck.gl/core';
import { SimpleMenu } from "./lib/components/dropdown-menu.js";
import { Popover } from "./lib/components/popover.js";
import { IconButton } from "./lib/components/icon-button.js";
/**
 * A widget that renders a popup menu for selecting a view mode.
 * It displays a button with the current view mode icon. Clicking the button
 * toggles a popup that shows three icons for:
 * - Single view
 * - Two views, split horizontally
 * - Two views, split vertically
 */
export class SelectorWidget extends Widget {
    constructor(props) {
        super(props);
        this.className = 'deck-widget-selector';
        this.placement = 'top-left';
        this.isOpen = false;
        this._toggleMenu = () => {
            if (this.isOpen) {
                this.isOpen = false;
            }
            else if (this.rootElement) {
                this.isOpen = {
                    x: this.rootElement.offsetLeft,
                    y: this.rootElement.offsetTop,
                    placement: this.props.placement.includes('right') ? 'left-start' : 'right-start'
                };
            }
            this.updateHTML();
        };
        this._handleSelectMode = (value) => {
            this.value = value;
            this.props.onChange(value);
            this.updateHTML();
        };
        this.value = this.props.initialValue;
        this.setProps(this.props);
    }
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId ?? this.viewId;
        super.setProps(props);
    }
    onRenderHTML(rootElement) {
        const selectedOption = this.props.options.find(opt => opt.value === this.value) ?? this.props.options[0];
        render(_jsxs("div", { children: [_jsx(IconButton, { icon: selectedOption.icon, label: selectedOption.label, onClick: this._toggleMenu }), this.isOpen && (_jsx(Popover, { ...this.isOpen, children: _jsx(SimpleMenu, { isOpen: true, style: { pointerEvents: 'auto', position: 'static' }, menuItems: this.props.options, onSelect: this._handleSelectMode, onClose: this._toggleMenu }) }))] }), rootElement);
    }
}
SelectorWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'view-selector',
    placement: 'top-left',
    viewId: null,
    initialValue: '',
    options: [],
    onChange: () => { }
};
//# sourceMappingURL=selector-widget.js.map