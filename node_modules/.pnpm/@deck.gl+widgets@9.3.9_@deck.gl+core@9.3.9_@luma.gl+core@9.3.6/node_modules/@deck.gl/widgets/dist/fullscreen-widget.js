import { jsx as _jsx } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* global document */
import { log, Widget } from '@deck.gl/core';
import { render } from 'preact';
import { IconButton } from "./lib/components/icon-button.js";
export class FullscreenWidget extends Widget {
    constructor(props = {}) {
        super(props);
        this.className = 'deck-widget-fullscreen';
        this.placement = 'top-left';
        this.fullscreen = false;
        this.setProps(this.props);
    }
    onAdd() {
        document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    }
    onRemove() {
        document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    }
    onRenderHTML(rootElement) {
        const isFullscreen = this.getFullscreen();
        render(_jsx(IconButton, { onClick: () => {
                this.handleClick().catch(err => log.error(err)());
            }, label: isFullscreen ? this.props.exitLabel : this.props.enterLabel, className: isFullscreen ? 'deck-widget-fullscreen-exit' : 'deck-widget-fullscreen-enter' }), rootElement);
    }
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId ?? this.viewId;
        super.setProps(props);
    }
    getContainer() {
        return this.props.container || this.deck?.props.parent || this.deck?.getCanvas()?.parentElement;
    }
    getFullscreen() {
        return this.fullscreen;
    }
    onFullscreenChange() {
        const fullscreen = document.fullscreenElement === this.getContainer();
        if (fullscreen !== this.fullscreen) {
            this.fullscreen = fullscreen;
            this.props.onFullscreenChange?.(fullscreen);
            this.updateHTML();
        }
    }
    async handleClick() {
        const isFullscreen = this.getFullscreen();
        if (isFullscreen) {
            await this.exitFullscreen();
        }
        else {
            await this.requestFullscreen();
        }
        // Note: updateHTML is called by onFullscreenChange event handler
    }
    async requestFullscreen() {
        const container = this.getContainer();
        if (container?.requestFullscreen) {
            await container.requestFullscreen({ navigationUI: 'hide' });
        }
        else {
            this.togglePseudoFullscreen();
        }
    }
    async exitFullscreen() {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
        else {
            this.togglePseudoFullscreen();
        }
    }
    togglePseudoFullscreen() {
        this.getContainer()?.classList.toggle('deck-pseudo-fullscreen');
        // No fullscreenchange event fires for pseudo-fullscreen, so manually update state
        this.fullscreen = !this.fullscreen;
        this.props.onFullscreenChange?.(this.fullscreen);
        this.updateHTML();
    }
}
FullscreenWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'fullscreen',
    placement: 'top-left',
    viewId: null,
    enterLabel: 'Enter Fullscreen',
    exitLabel: 'Exit Fullscreen',
    container: undefined,
    onFullscreenChange: () => { }
};
//# sourceMappingURL=fullscreen-widget.js.map