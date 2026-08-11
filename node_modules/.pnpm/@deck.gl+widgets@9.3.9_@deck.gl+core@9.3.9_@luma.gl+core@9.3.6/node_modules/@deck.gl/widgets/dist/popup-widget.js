import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Widget } from '@deck.gl/core';
import { render } from 'preact';
import { Popover } from "./lib/components/popover.js";
import { UserContent } from "./lib/components/user-content.js";
import { IconButton } from "./lib/components/icon-button.js";
export class PopupWidget extends Widget {
    constructor(props) {
        super(props);
        this.className = 'deck-widget-popup';
        this.placement = 'fill';
        this.setProps(this.props);
        this.isOpen = this.props.defaultIsOpen;
    }
    setProps(props) {
        this.viewId = props.viewId ?? this.viewId;
        super.setProps(props);
    }
    onAdd({ deck }) {
        this.deck = deck;
    }
    onRemove() {
        // Invoke clean up of preact hooks
        if (this.rootElement) {
            render(null, this.rootElement);
        }
    }
    onViewportChange(viewport) {
        this.viewport = viewport;
        this.updateHTML();
    }
    onClick() {
        if (this.props.closeOnClickOutside) {
            this._setIsOpen(false);
        }
    }
    _setIsOpen(isOpen) {
        if (this.isOpen === isOpen)
            return;
        this.isOpen = isOpen;
        this.props.onOpenChange?.(isOpen);
        this.updateHTML();
    }
    onRenderHTML(rootElement) {
        if (!this.viewport) {
            render(null, rootElement);
            return;
        }
        const { marker, content, style } = this.props;
        // Project the clicked geographic coordinate to canvas (x, y)
        const [x, y] = this.viewport.project(this.props.position);
        // Render the popup container with a content box and a placeholder for the arrow.
        // The container is positioned absolutely (initially at 0,0) and will be repositioned after measuring.
        const ui = (_jsxs("div", { children: [marker && (_jsx("div", { className: "deck-widget-popup-marker", style: { left: x, top: y }, children: _jsx(UserContent, { ...marker, onClick: () => this._setIsOpen(true) }) })), this.isOpen && (_jsx(Popover, { x: x, y: y, placement: this.props.placement, arrow: this.props.arrow, arrowColor: "var(--menu-background, #fff)", offset: this.props.offset, children: _jsxs("div", { className: `deck-widget-popup-content ${this.props.className}`, style: style, children: [this.props.closeButton && (_jsx("div", { className: "deck-widget-popup-controls", style: { width: '100%', display: 'flex', justifyContent: 'end' }, children: _jsx(IconButton, { className: "deck-widget-popup-close-button", onClick: () => this._setIsOpen(false) }) })), _jsx(UserContent, { ...(typeof content === 'string' ? { text: content } : content) })] }) }))] }));
        render(ui, rootElement);
    }
}
PopupWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'info',
    viewId: null,
    position: [0, 0],
    marker: null,
    defaultIsOpen: true,
    content: '',
    placement: 'right',
    offset: 10,
    arrow: 10,
    closeButton: true,
    closeOnClickOutside: false,
    onOpenChange: () => { }
};
//# sourceMappingURL=popup-widget.js.map