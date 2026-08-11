import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Widget, FlyToInterpolator, LinearInterpolator, OrthographicView } from '@deck.gl/core';
import { render } from 'preact';
import { ButtonGroup } from "./lib/components/button-group.js";
import { IconButton } from "./lib/components/icon-button.js";
export class ZoomWidget extends Widget {
    constructor(props = {}) {
        super(props);
        this.className = 'deck-widget-zoom';
        this.placement = 'top-left';
        this.setProps(this.props);
    }
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId ?? this.viewId;
        super.setProps(props);
    }
    onRenderHTML(rootElement) {
        const ui = (_jsxs(ButtonGroup, { orientation: this.props.orientation, children: [_jsx(IconButton, { onClick: () => this.handleZoomIn(), label: this.props.zoomInLabel, className: "deck-widget-zoom-in" }), _jsx(IconButton, { onClick: () => this.handleZoomOut(), label: this.props.zoomOutLabel, className: "deck-widget-zoom-out" })] }));
        render(ui, rootElement);
    }
    isOrthographicView(viewId) {
        const deck = this.deck;
        const view = deck?.isInitialized && deck.getView(viewId);
        return view instanceof OrthographicView;
    }
    handleZoom(viewId, delta) {
        // Respect minZoom/maxZoom constraints from the view state
        const viewState = this.getViewState(viewId);
        const newViewState = {};
        if (this.isOrthographicView(viewId)) {
            const { zoomAxis } = this.props;
            const { zoomX, minZoomX, maxZoomX, zoomY, minZoomY, maxZoomY } = normalizeOrthographicViewState(viewState);
            let nextZoom;
            let nextZoomY;
            if (zoomAxis === 'X') {
                nextZoom = clamp(zoomX + delta, minZoomX, maxZoomX);
                nextZoomY = zoomY;
            }
            else if (zoomAxis === 'Y') {
                nextZoom = zoomX;
                nextZoomY = clamp(zoomY + delta, minZoomY, maxZoomY);
            }
            else {
                const clampedDelta = clamp(delta, Math.max(minZoomX - zoomX, minZoomY - zoomY), Math.min(maxZoomX - zoomX, maxZoomY - zoomY));
                nextZoom = zoomX + clampedDelta;
                nextZoomY = zoomY + clampedDelta;
            }
            newViewState.zoom = [nextZoom, nextZoomY];
            newViewState.zoomX = nextZoom;
            newViewState.zoomY = nextZoomY;
            // Call callback
            this.props.onZoom?.({
                viewId,
                delta,
                // `zoom` will not match the new state if using 2D zoom. Deprecated behavior for backward compatibility.
                zoom: zoomAxis === 'Y' ? nextZoomY : nextZoom,
                zoomX: nextZoom,
                zoomY: nextZoomY
            });
        }
        else {
            const { zoom = 0, minZoom, maxZoom } = viewState;
            const nextZoom = clamp(zoom + delta, minZoom, maxZoom);
            newViewState.zoom = nextZoom;
            // Call callback
            this.props.onZoom?.({
                viewId,
                delta,
                zoom: nextZoom
            });
        }
        const nextViewState = {
            ...viewState,
            ...newViewState
        };
        if (this.props.transitionDuration > 0) {
            nextViewState.transitionDuration = this.props.transitionDuration;
            nextViewState.transitionInterpolator =
                'latitude' in nextViewState
                    ? new FlyToInterpolator()
                    : new LinearInterpolator({
                        transitionProps: 'zoomX' in newViewState ? ['zoomX', 'zoomY'] : ['zoom']
                    });
        }
        this.setViewState(viewId, nextViewState);
    }
    handleZoomIn() {
        for (const viewId of this.viewIds) {
            this.handleZoom(viewId, 1);
        }
    }
    handleZoomOut() {
        for (const viewId of this.viewIds) {
            this.handleZoom(viewId, -1);
        }
    }
}
ZoomWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'zoom',
    placement: 'top-left',
    orientation: 'vertical',
    transitionDuration: 200,
    zoomInLabel: 'Zoom In',
    zoomOutLabel: 'Zoom Out',
    zoomAxis: 'all',
    viewId: null,
    onZoom: () => { }
};
function clamp(zoom, minZoom, maxZoom) {
    return zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom;
}
function normalizeOrthographicViewState({ zoom = 0, zoomX, zoomY, minZoom = -Infinity, maxZoom = Infinity, minZoomX = minZoom, maxZoomX = maxZoom, minZoomY = minZoom, maxZoomY = maxZoom }) {
    zoomX = zoomX ?? (Array.isArray(zoom) ? zoom[0] : zoom);
    zoomY = zoomY ?? (Array.isArray(zoom) ? zoom[1] : zoom);
    return { zoomX, zoomY, minZoomX, minZoomY, maxZoomX, maxZoomY };
}
//# sourceMappingURL=zoom-widget.js.map