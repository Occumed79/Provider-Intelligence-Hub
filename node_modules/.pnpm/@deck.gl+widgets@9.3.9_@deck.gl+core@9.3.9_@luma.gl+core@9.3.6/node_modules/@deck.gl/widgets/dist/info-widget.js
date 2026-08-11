import { jsx as _jsx } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Widget } from '@deck.gl/core';
import { render } from 'preact';
import { Popover } from "./lib/components/popover.js";
import { UserContent } from "./lib/components/user-content.js";
export class InfoWidget extends Widget {
    constructor(props) {
        super(props);
        this.className = 'deck-widget-info';
        this.placement = 'fill';
        this.tooltip = null;
        this.setProps(this.props);
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
    onHover(info) {
        if (this.props.mode === 'hover') {
            this.tooltip = this._getTooltip(info);
            this.updateHTML();
        }
    }
    onClick(info) {
        if (this.props.mode === 'click') {
            this.tooltip = this._getTooltip(info);
            this.updateHTML();
        }
    }
    _getTooltip(info) {
        if (!this.props.getTooltip)
            return null;
        const content = this.props.getTooltip(info, this) ?? null;
        if (content === null)
            return null;
        const normalizedTooltip = typeof content === 'string' ? { text: content } : content;
        const position = normalizedTooltip.position || info.coordinate;
        if (!position)
            return null;
        return {
            position,
            text: '',
            html: '',
            element: null,
            className: '',
            style: {},
            ...normalizedTooltip
        };
    }
    onRenderHTML(rootElement) {
        if (!this.viewport || this.tooltip === null) {
            render(null, rootElement);
            return;
        }
        const style = {
            ...this.props.style,
            ...this.tooltip.style
        };
        // Project the clicked geographic coordinate to canvas (x, y)
        const [x, y] = this.viewport.project(this.tooltip.position);
        // Render the popup container with a content box and a placeholder for the arrow.
        // The container is positioned absolutely (initially at 0,0) and will be repositioned after measuring.
        const ui = (_jsx(Popover, { x: x, y: y, placement: this.props.placement, arrow: this.props.arrow, arrowColor: "var(--menu-background, #fff)", offset: this.props.offset, children: _jsx(UserContent, { className: `deck-widget-popup-content ${this.tooltip.className} ${this.props.className}`, style: style, html: this.tooltip.html, text: this.tooltip.text, element: this.tooltip.element }) }));
        render(ui, rootElement);
    }
}
InfoWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'info',
    viewId: null,
    mode: 'hover',
    getTooltip: undefined,
    placement: 'right',
    offset: 10,
    arrow: 10
};
//# sourceMappingURL=info-widget.js.map