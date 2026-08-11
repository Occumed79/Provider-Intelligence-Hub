import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Widget } from '@deck.gl/core';
import { luma } from '@luma.gl/core';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { IconButton } from "./lib/components/icon-button.js";
const DEFAULT_COUNT_FORMATTER = (stat) => `${stat.name}: ${stat.count}`;
function formatTime(time) {
    return time < 1000 ? `${time.toFixed(2)}ms` : `${(time / 1000).toFixed(2)}s`;
}
function formatMemory(bytes) {
    const mb = bytes / 1e6;
    return `${mb.toFixed(1)} MB`;
}
export const DEFAULT_FORMATTERS = {
    count: DEFAULT_COUNT_FORMATTER,
    averageTime: (stat) => `${stat.name}: ${formatTime(stat.getAverageTime())}`,
    totalTime: (stat) => `${stat.name}: ${formatTime(stat.time)}`,
    fps: (stat) => `${stat.name}: ${Math.round(stat.getHz())}fps`,
    memory: (stat) => `${stat.name}: ${formatMemory(stat.count)}`
};
/** Displays probe.gl stats in a floating pop-up. */
export class StatsWidget extends Widget {
    /**
     * Returns the current expanded state.
     * In controlled mode, returns the expanded prop.
     * In uncontrolled mode, returns the internal state.
     */
    getExpanded() {
        return this.props.expanded ?? this._expanded;
    }
    constructor(props = {}) {
        super(props);
        this.className = 'deck-widget-stats';
        this.placement = 'top-left';
        this._counter = 0;
        this._expanded = false;
        this._toggleExpanded = () => {
            const nextExpanded = !this.getExpanded();
            // Always call callback if provided
            this.props.onExpandedChange?.(nextExpanded);
            // Only update internal state if uncontrolled
            if (this.props.expanded === undefined) {
                this._expanded = nextExpanded;
                this.updateHTML();
            }
            // In controlled mode, parent will update expanded prop which triggers updateHTML via setProps
        };
        this._getFps = () => {
            // @ts-expect-error metrics is protected
            return Math.round(this.deck?.metrics.fps ?? 0);
        };
        this._formatters = { ...DEFAULT_FORMATTERS };
        this._resetOnUpdate = { ...this.props.resetOnUpdate };
        this._expanded = Boolean(props.initialExpanded);
        this.setProps(props);
    }
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId ?? this.viewId;
        if (props.formatters) {
            for (const name in props.formatters) {
                const f = props.formatters[name];
                this._formatters[name] =
                    typeof f === 'string' ? DEFAULT_FORMATTERS[f] || DEFAULT_COUNT_FORMATTER : f;
            }
        }
        if (props.resetOnUpdate) {
            this._resetOnUpdate = { ...props.resetOnUpdate };
        }
        super.setProps(props);
    }
    onRemove() {
        if (this.rootElement) {
            // Make sure all preact hooks are finalized
            render(null, this.rootElement);
        }
    }
    onRenderHTML(rootElement) {
        const isExpanded = this.getExpanded();
        if (!isExpanded) {
            render(_jsx(FpsIcon, { getFps: this._getFps, onClick: this._toggleExpanded }), rootElement);
            return;
        }
        const stats = this._getStats();
        const title = this.props.title || ('id' in stats ? stats.id : null) || 'Stats';
        const deviceLabel = this._getDeviceLabel();
        const items = [];
        if (stats) {
            stats.forEach(stat => {
                const lines = this._getLines(stat).split('\n');
                if (this._resetOnUpdate && this._resetOnUpdate[stat.name]) {
                    stat.reset();
                }
                lines.forEach((line, i) => {
                    items.push(_jsx("div", { style: { whiteSpace: 'pre' }, children: line }, `${stat.name}-${i}`));
                });
            });
        }
        render(_jsxs("div", { className: "deck-widget-stats-container", style: { cursor: 'default' }, children: [_jsxs("div", { className: "deck-widget-stats-header", style: { cursor: 'pointer', pointerEvents: 'auto' }, onClick: this._toggleExpanded, children: [_jsx("b", { children: title }), deviceLabel && _jsx("span", { className: "deck-widget-stats-device", children: deviceLabel }), _jsx("button", { className: "deck-widget-dropdown-button", children: _jsx("span", { className: "deck-widget-dropdown-icon open" }) })] }), _jsx("div", { className: "deck-widget-stats-content", children: items })] }), rootElement);
    }
    onRedraw() {
        if (this.getExpanded()) {
            const framesPerUpdate = Math.max(1, this.props.framesPerUpdate || 1);
            if (this._counter++ % framesPerUpdate === 0) {
                this.updateHTML();
            }
        }
    }
    _getStats() {
        switch (this.props.type) {
            case 'deck':
                // @ts-expect-error metrics is protected
                const metrics = this.deck?.metrics ?? {};
                return Object.entries(metrics);
            case 'luma':
                return Array.from(luma.stats.stats.values())[0];
            case 'device':
                // @ts-expect-error is protected
                const device = this.deck?.device;
                const stats = device?.statsManager.stats.values();
                return stats ? Array.from(stats)[0] : [];
            case 'custom':
                return this.props.stats;
            default:
                throw new Error(`Unknown stats type: ${this.props.type}`);
        }
    }
    _getDeviceLabel() {
        // @ts-expect-error device is protected
        const deviceType = this.deck?.device?.type;
        if (!deviceType) {
            return null;
        }
        switch (deviceType) {
            case 'webgpu':
                return 'WebGPU';
            case 'webgl':
                return 'WebGL';
            default:
                return String(deviceType);
        }
    }
    _getLines(stat) {
        if ('count' in stat) {
            const formatter = this._formatters[stat.name] || this._formatters[stat.type || ''] || DEFAULT_COUNT_FORMATTER;
            return formatter(stat);
        }
        const [key, value] = stat;
        const formattedValue = key.endsWith('Memory')
            ? formatMemory(value)
            : key.includes('Time')
                ? formatTime(value)
                : `${value.toFixed(2)}`;
        return `${key}: ${formattedValue}`;
    }
}
StatsWidget.defaultProps = {
    ...Widget.defaultProps,
    type: 'deck',
    placement: 'top-left',
    viewId: null,
    initialExpanded: false,
    stats: undefined,
    title: 'Stats',
    framesPerUpdate: 1,
    formatters: {},
    resetOnUpdate: {},
    id: 'stats',
    expanded: undefined,
    onExpandedChange: () => { }
};
function FpsIcon({ getFps, onClick }) {
    const [fps, setFps] = useState(getFps());
    useEffect(() => {
        const onUpdate = () => {
            setFps(getFps());
            timer = requestAnimationFrame(onUpdate);
        };
        let timer = requestAnimationFrame(onUpdate);
        return () => {
            cancelAnimationFrame(timer);
        };
    }, [getFps]);
    return (_jsx(IconButton, { onClick: onClick, children: _jsxs("div", { className: "text", children: ["FPS", _jsx("br", {}), fps] }) }));
}
//# sourceMappingURL=stats-widget.js.map