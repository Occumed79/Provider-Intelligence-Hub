import { jsx as _jsx } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* global document */
import { Widget } from '@deck.gl/core';
import { render } from 'preact';
import { SimpleMenu } from "./lib/components/dropdown-menu.js";
import { Popover } from "./lib/components/popover.js";
export class ContextMenuWidget extends Widget {
    constructor(props) {
        super(props);
        this.className = 'deck-widget-context-menu';
        this.placement = 'fill';
        this.menu = null;
        this.setProps(this.props);
    }
    onAdd({ deck }) {
        deck.getCanvas()?.addEventListener('contextmenu', event => this.handleContextMenu(event));
    }
    handleContextMenu(srcEvent) {
        const targetRect = srcEvent.target.getBoundingClientRect();
        const x = srcEvent.clientX - targetRect.x;
        const y = srcEvent.clientY - targetRect.y;
        const pickInfo = this.deck?.pickObject({ x, y }) || {
            x,
            y,
            picked: false,
            layer: null,
            color: null,
            index: -1,
            pixelRatio: 1
        };
        const menuItems = this.props.getMenuItems?.(pickInfo, this) || this.props.menuItems;
        this.menu =
            menuItems.length > 0
                ? {
                    items: menuItems,
                    pickInfo
                }
                : null;
        srcEvent.preventDefault();
        this.updateHTML();
    }
    onRenderHTML(rootElement) {
        if (!this.menu) {
            render(null, rootElement);
            return;
        }
        const { items, pickInfo } = this.menu;
        const style = {
            pointerEvents: 'auto',
            position: 'static',
            ...this.props.style
        };
        const ui = (_jsx(Popover, { x: pickInfo.x, y: pickInfo.y, placement: this.props.placement, arrow: this.props.arrow, arrowColor: "var(--menu-background, #fff)", offset: this.props.offset, children: _jsx(SimpleMenu, { menuItems: items, onSelect: value => this.props.onMenuItemSelected(value, pickInfo), style: style, isOpen: true, onClose: () => this.hide() }) }));
        render(ui, rootElement);
    }
    hide() {
        this.menu = null;
        this.updateHTML();
    }
}
ContextMenuWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'context',
    viewId: null,
    menuItems: [],
    getMenuItems: undefined,
    onMenuItemSelected: () => { },
    placement: 'bottom-start',
    offset: 10,
    arrow: false
};
//# sourceMappingURL=context-menu-widget.js.map