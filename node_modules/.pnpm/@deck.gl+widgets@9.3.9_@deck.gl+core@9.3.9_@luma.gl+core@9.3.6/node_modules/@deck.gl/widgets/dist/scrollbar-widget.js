import { jsx as _jsx } from "preact/jsx-runtime";
import { Widget } from '@deck.gl/core';
import { render } from 'preact';
import { RangeInput } from "./lib/components/range-input.js";
const clamp = (value, min, max) => {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
};
/** A scrollbar widget to be used with OrthographicView */
export class ScrollbarWidget extends Widget {
    constructor(props) {
        const resolved = {
            ...ScrollbarWidget.defaultProps,
            ...props
        };
        super(resolved);
        this.className = 'deck-widget-scrollbar';
        this.placement = 'fill';
        this.contentSize = 0;
        this.viewportSize = 0;
        this.scrollOffset = 0;
        this.handleRangeChange = (nextValue) => {
            this.emitScroll(nextValue[0]);
        };
        this.viewId = resolved.viewId ?? null;
    }
    onViewportChange(viewport) {
        this.viewport = viewport;
        this.onRenderHTML();
    }
    onRenderHTML() {
        const element = this.rootElement;
        if (!element) {
            return;
        }
        element.dataset.placement = this.props.placement;
        const viewport = this.viewport;
        this.updateViewport(viewport);
        const clampedOffset = this.getClampedOffset();
        const wheelTarget = this.getWheelEventTarget(this.props.captureWheel ? 'global' : 'local');
        const decorations = this.getDecorations(viewport);
        const isVertical = this.isVertical();
        const startLabel = this.props.startButtonAriaLabel ?? (isVertical ? 'Scroll up' : 'Scroll left');
        const endLabel = this.props.endButtonAriaLabel ?? (isVertical ? 'Scroll down' : 'Scroll right');
        const ui = (_jsx(RangeInput, { min: 0, max: Math.max(0, this.contentSize), step: this.getEffectiveStep(), pageSize: this.getEffectivePage(), value: [clampedOffset, clampedOffset + this.viewportSize], orientation: this.props.orientation, stepButtons: true, startButtonAriaLabel: startLabel, endButtonAriaLabel: endLabel, eventTarget: wheelTarget, decorations: decorations, onChange: this.handleRangeChange }));
        render(ui, element);
    }
    onRemove() {
        if (this.rootElement) {
            render(null, this.rootElement);
        }
        super.onRemove();
    }
    getContentBounds(viewId) {
        return this.props.contentBounds ?? this.deck?.getView(viewId)?.controller?.maxBounds ?? null;
    }
    updateViewport(viewport) {
        if (!viewport) {
            this.contentSize = 0;
            this.scrollOffset = 0;
            this.viewportSize = 0;
            return;
        }
        const contentBounds = this.getContentBounds(viewport.id);
        const isVertical = this.isVertical();
        const projectedBounds = contentBounds
            ? projectBounds(contentBounds, viewport, isVertical)
            : [0, 0];
        this.contentSize = projectedBounds[1] - projectedBounds[0];
        this.scrollOffset = -projectedBounds[0];
        this.viewportSize = isVertical ? viewport.height : viewport.width;
    }
    getDecorations(viewport) {
        const { decorations = [] } = this.props;
        if (!viewport || decorations.length === 0) {
            return [];
        }
        const contentBounds = this.getContentBounds(viewport.id);
        if (!contentBounds) {
            return [];
        }
        const isVertical = this.isVertical();
        const [contentStart] = projectBounds(contentBounds, viewport, isVertical);
        return decorations.map(decoration => {
            const [start, end] = projectBounds(decoration.contentBounds, viewport, isVertical);
            const onClick = decoration.onClick
                ? (e) => {
                    const handled = decoration.onClick?.(e);
                    if (handled) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
                : undefined;
            return {
                position: [start - contentStart, end - contentStart],
                element: (_jsx("div", { style: {
                        pointerEvents: onClick ? 'all' : 'none',
                        width: '100%',
                        height: '100%',
                        backgroundColor: decoration.color
                    }, title: decoration.title, onClick: onClick }))
            };
        });
    }
    getWheelEventTarget(mode) {
        if (mode === null)
            return null;
        if (mode === 'local')
            return this.rootElement;
        return this.deck?.props.parent || this.deck?.getCanvas()?.parentElement || this.rootElement;
    }
    getMaxScroll() {
        return Math.max(0, this.contentSize - this.viewportSize);
    }
    getClampedOffset() {
        const maxScroll = this.getMaxScroll();
        return clamp(this.scrollOffset, 0, maxScroll);
    }
    isVertical() {
        return this.props.orientation !== 'horizontal';
    }
    getEffectiveStep() {
        if (typeof this.props.stepSize === 'number' && !Number.isNaN(this.props.stepSize)) {
            return this.props.stepSize;
        }
        return Math.max(1, this.viewportSize / 10 || 1);
    }
    getEffectivePage() {
        if (typeof this.props.pageSize === 'number' && !Number.isNaN(this.props.pageSize)) {
            return this.props.pageSize;
        }
        return this.viewportSize;
    }
    emitScroll(next) {
        const maxScroll = this.getMaxScroll();
        const target = clamp(Math.round(next), 0, maxScroll);
        const viewport = this.viewport;
        if (viewport && target !== this.getClampedOffset()) {
            const pixel = viewport.project(viewport.position);
            if (this.isVertical()) {
                pixel[1] -= target - this.scrollOffset;
            }
            else {
                pixel[0] -= target - this.scrollOffset;
            }
            const { target: newTarget } = viewport.panByPosition(viewport.position, pixel);
            // @ts-expect-error Using private method temporary until there's a public one
            this.deck._onViewStateChange({
                viewId: viewport.id,
                viewState: {
                    ...this.getViewState(viewport.id),
                    target: newTarget
                },
                interactionState: {}
            });
        }
    }
}
ScrollbarWidget.defaultProps = {
    ...Widget.defaultProps,
    contentBounds: null,
    placement: 'top-right',
    viewId: null,
    orientation: 'vertical',
    stepSize: null,
    pageSize: null,
    startButtonAriaLabel: '',
    endButtonAriaLabel: '',
    captureWheel: false,
    decorations: []
};
function projectBounds(bounds, viewport, isVertical) {
    return bounds
        .map(([x, y]) => viewport.project([x, y, 0]))
        .reduce((range, [x, y]) => {
        const value = isVertical ? y : x;
        range[0] = Math.min(range[0], value);
        range[1] = Math.max(range[1], value);
        return range;
    }, [Infinity, -Infinity]);
}
//# sourceMappingURL=scrollbar-widget.js.map