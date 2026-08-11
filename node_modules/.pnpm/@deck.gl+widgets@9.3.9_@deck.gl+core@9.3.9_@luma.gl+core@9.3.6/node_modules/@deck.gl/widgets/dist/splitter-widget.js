import { jsx as _jsx, Fragment as _Fragment } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { render } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { Widget, _deepEqual as deepEqual } from '@deck.gl/core';
function parseViewLayout(root) {
    const layoutsById = [];
    const isViewLayout = (v) => 'views' in v;
    function createManagedViewLayout(l) {
        const id = layoutsById.length;
        const minSplit = l.minSplit ?? 0.05;
        const maxSplit = l.maxSplit ?? 0.95;
        const split = Math.min(Math.max(l.initialSplit ?? 0.5, minSplit), maxSplit);
        const managed = {
            id,
            orientation: l.orientation,
            views: l.views,
            split,
            editable: l.editable ?? true,
            minSplit,
            maxSplit,
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        layoutsById.push(managed);
        managed.views = [
            isViewLayout(l.views[0]) ? createManagedViewLayout(l.views[0]) : l.views[0],
            isViewLayout(l.views[1]) ? createManagedViewLayout(l.views[1]) : l.views[1]
        ];
        return managed;
    }
    createManagedViewLayout(root);
    return layoutsById;
}
function evaluateViews(root) {
    const views = [];
    function evaluateViewLayout(l, x, y, width, height) {
        l.x = x;
        l.y = y;
        l.width = width;
        l.height = height;
        const child1X = x;
        const child1Y = y;
        let child1Width = width;
        let child1Height = height;
        let child2X = x;
        let child2Y = y;
        let child2Width = width;
        let child2Height = height;
        if (l.orientation === 'horizontal') {
            child1Width = width * l.split;
            child2X = x + child1Width;
            child2Width = width - child1Width;
        }
        else {
            child1Height = height * l.split;
            child2Y = y + child1Height;
            child2Height = height - child1Height;
        }
        const [view1, view2] = l.views;
        if ('views' in view1) {
            evaluateViewLayout(view1, child1X, child1Y, child1Width, child1Height);
        }
        else {
            views.push(view1.clone({
                x: `${child1X}%`,
                y: `${child1Y}%`,
                width: `${child1Width}%`,
                height: `${child1Height}%`
            }));
        }
        if ('views' in view2) {
            evaluateViewLayout(view2, child2X, child2Y, child2Width, child2Height);
        }
        else {
            views.push(view2.clone({
                x: `${child2X}%`,
                y: `${child2Y}%`,
                width: `${child2Width}%`,
                height: `${child2Height}%`
            }));
        }
    }
    evaluateViewLayout(root, 0, 0, 100, 100);
    return views;
}
/**
 * A draggable splitter widget that appears as a vertical or horizontal line
 * across the deck.gl canvas. It positions itself based on the split percentage
 * of the first view and provides callbacks when dragged.
 */
export class SplitterWidget extends Widget {
    constructor(props) {
        super(props);
        this.className = 'deck-widget-splitter';
        this.placement = 'fill';
        this.needsUpdate = true;
        this.viewLayouts = parseViewLayout(this.props.viewLayout);
    }
    setProps(props) {
        if (props.viewLayout && !deepEqual(props.viewLayout, this.props.viewLayout, -1)) {
            this.viewLayouts = parseViewLayout(props.viewLayout);
            this.views = undefined;
        }
        super.setProps(props);
    }
    onRedraw() {
        // Actually update DOM
        super.updateHTML();
    }
    // Usually widgets rerender their DOM elements here
    // In this case we need the widget UI to synchronize with deck view states
    // so we update deck props here and rerender DOM in the next onRedraw
    updateHTML() {
        if (!this.views) {
            // viewLayouts has changed, re-evaluate
            this.views = evaluateViews(this.viewLayouts[0]);
            // we send a copy to the callback so that externally set views can be differentiated from internal
            this.props.onChange(this.views.slice());
        }
        // This method is called inside deck.setProps > widgetManager.setProps > widget.setProps
        // Calling deck.setProps immediately would cause infinite loop
        requestAnimationFrame(() => {
            this.doUpdate();
        });
    }
    doUpdate() {
        if (this.deck) {
            const deckViews = this.deck.props.views;
            const isManagedExternally = 
            // is not empty
            deckViews &&
                // is not set by us
                deckViews !== this.lastViews;
            if (!isManagedExternally && this.lastViews !== this.views) {
                this.lastViews = this.views;
                this.deck.setProps({ views: this.views });
            }
        }
    }
    onChange(newSplit, layout) {
        layout.split = newSplit;
        // layout has updated, re-evaluate
        this.views = evaluateViews(this.viewLayouts[0]);
        // we send a copy to the callback so that externally set views can be differentiated from internal
        this.props.onChange(this.views.slice());
        this.doUpdate();
    }
    onRenderHTML(rootElement) {
        render(_jsx(_Fragment, { children: this.viewLayouts.map(layout => layout.editable && (_jsx(Splitter, { ...layout, onChange: newSplit => this.onChange(newSplit, layout), onDragStart: () => this.props.onDragStart(), onDragEnd: () => this.props.onDragStart() }))) }), rootElement);
    }
}
SplitterWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'splitter-widget',
    viewLayout: undefined,
    onChange: () => { },
    onDragStart: () => { },
    onDragEnd: () => { }
};
/**
 * A functional component that renders a draggable splitter line.
 * It computes its position based on the provided split percentage and
 * updates it during mouse drag events.
 */
function Splitter({ orientation, x, y, width, height, split, minSplit, maxSplit, onChange, onDragStart, onDragEnd }) {
    const [dragging, setDragging] = useState(false);
    const containerRef = useRef(null);
    useEffect(() => {
        if (!dragging) {
            return undefined;
        }
        const handleDragging = (event) => {
            if (!containerRef.current)
                return;
            const rect = containerRef.current.getBoundingClientRect();
            let newSplit;
            if (orientation === 'horizontal') {
                newSplit = (event.clientX - rect.left) / rect.width;
            }
            else {
                newSplit = (event.clientY - rect.top) / rect.height;
            }
            // Clamp newSplit between 5% and 95%
            newSplit = Math.min(Math.max(newSplit, minSplit), maxSplit);
            onChange?.(newSplit);
        };
        const handleDragEnd = () => {
            onDragEnd?.();
            setDragging(false);
        };
        document.addEventListener('pointermove', handleDragging);
        document.addEventListener('pointerup', handleDragEnd);
        document.addEventListener('pointerleave', handleDragEnd);
        return () => {
            document.removeEventListener('pointermove', handleDragging);
            document.removeEventListener('pointerup', handleDragEnd);
            document.removeEventListener('pointerleave', handleDragEnd);
        };
    }, [dragging]);
    const handleDragStart = (event) => {
        setDragging(true);
        onDragStart?.();
        event.preventDefault();
    };
    // The splitter line style based on orientation and the current split percentage.
    const splitterStyle = orientation === 'horizontal' ? { left: `${split * 100}%` } : { top: `${split * 100}%` };
    // Container style to fill the entire deck.gl canvas.
    const containerStyle = {
        position: 'absolute',
        top: `${y}%`,
        left: `${x}%`,
        width: `${width}%`,
        height: `${height}%`
    };
    return (_jsx("div", { ref: containerRef, style: containerStyle, children: _jsx("div", { className: `deck-widget-splitter-handle deck-widget-splitter-handle--${orientation} ${dragging ? 'active' : ''}`, style: splitterStyle, onPointerDown: handleDragStart }) }));
}
//# sourceMappingURL=splitter-widget.js.map