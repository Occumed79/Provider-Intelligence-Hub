import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Widget } from '@deck.gl/core';
import { render } from 'preact';
import { IconButton } from "./lib/components/icon-button.js";
import { RangeInput } from "./lib/components/range-input.js";
export class TimelineWidget extends Widget {
    /**
     * Returns the current time value.
     * In controlled mode, returns the time prop.
     * In uncontrolled mode, returns the internal state.
     */
    getTime() {
        return this.props.time ?? this.currentTime;
    }
    /**
     * Returns the current playing state.
     * In controlled mode, returns the playing prop.
     * In uncontrolled mode, returns the internal state.
     */
    getPlaying() {
        return this.props.playing ?? this._playing;
    }
    constructor(props = {}) {
        super(props);
        this.id = 'timeline';
        this.className = 'deck-widget-timeline';
        this.placement = 'fill';
        this._playing = false;
        this.timerId = null;
        this.handlePlayPause = () => {
            const isPlaying = this.getPlaying();
            const nextPlaying = !isPlaying;
            // Always call callback if provided
            this.props.onPlayingChange?.(nextPlaying);
            // Only update internal state if uncontrolled
            if (this.props.playing === undefined) {
                if (nextPlaying) {
                    this.play();
                }
                else {
                    this.stop();
                }
            }
            // In controlled mode, parent will update playing prop which triggers start/stop via setProps
        };
        this.handleTimeChange = ([value]) => {
            // Always call callback
            this.props.onTimeChange(value);
            // Only update internal state if uncontrolled
            if (this.props.time === undefined) {
                this.currentTime = value;
                this.props.timeline?.setTime(value);
                this.updateHTML();
            }
            // In controlled mode, parent will update time prop which triggers updateHTML via setProps
        };
        this.tick = () => {
            const { timeRange: [min, max], step, loop } = this.props;
            if (step > 0) {
                const currentTime = this.getTime();
                let next = Math.round(currentTime / step) * step + step;
                if (next > max) {
                    if (currentTime < max) {
                        next = max;
                    }
                    else if (loop) {
                        next = min;
                    }
                    else {
                        next = max;
                        this._playing = false;
                        this.props.onPlayingChange?.(false);
                    }
                }
                // Always call callback
                this.props.onTimeChange(next);
                // Only update internal state if uncontrolled
                if (this.props.time === undefined) {
                    this.currentTime = next;
                    this.props.timeline?.setTime(next);
                }
                this.updateHTML();
            }
            if (this._playing) {
                this.timerId = window.setTimeout(this.tick, this.props.playInterval);
            }
            else {
                this.timerId = null;
            }
        };
        this.currentTime = this.props.initialTime ?? this.props.timeRange[0];
        // In controlled mode, sync Timeline to the controlled time prop
        const syncTime = this.props.time ?? this.currentTime;
        this.props.timeline?.setTime(syncTime);
        this.setProps(this.props);
    }
    setProps(props) {
        const { playing: prevPlaying, time: prevTime } = this.props;
        this.viewId = props.viewId ?? this.viewId;
        super.setProps(props);
        // Sync Timeline object when controlled time prop changes
        if (props.time !== undefined && props.time !== prevTime) {
            this.props.timeline?.setTime(props.time);
        }
        // Handle controlled playing state changes
        if (props.playing !== undefined && props.playing !== prevPlaying) {
            if (props.playing && !this._playing) {
                this._startTimer();
            }
            else if (!props.playing && this._playing) {
                this._stopTimer();
            }
        }
    }
    onAdd() {
        this._playing = false;
        this.timerId = null;
        if (this.props.autoPlay) {
            if (this.props.playing !== undefined) {
                // In controlled mode, notify parent instead of starting directly
                this.props.onPlayingChange?.(true);
            }
            else {
                this.play();
            }
        }
    }
    onRemove() {
        this.stop();
    }
    onRenderHTML(rootElement) {
        const { timeRange, step, formatLabel } = this.props;
        const isPlaying = this.getPlaying();
        const currentTime = this.getTime();
        rootElement.dataset.placement = this.props.placement;
        render(_jsxs("div", { className: "deck-widget-button-group", children: [isPlaying ? (_jsx(IconButton, { label: "Pause", className: "deck-widget-timeline-pause", onClick: this.handlePlayPause })) : (_jsx(IconButton, { label: "Play", className: "deck-widget-timeline-play", onClick: this.handlePlayPause })), _jsx(RangeInput, { min: timeRange[0], max: timeRange[1], orientation: "horizontal", step: step, value: [currentTime, currentTime], onChange: this.handleTimeChange, decorations: [
                        {
                            position: [currentTime, currentTime + step],
                            element: (_jsx("div", { className: "deck-widget-timeline-label deck-widget-timeline-label--current", children: formatLabel(currentTime) }))
                        }
                    ] })] }), rootElement);
    }
    play() {
        this._playing = true;
        const { timeRange: [min, max] } = this.props;
        // In uncontrolled mode, reset to start if at end
        if (this.props.time === undefined && this.getTime() >= max) {
            this.currentTime = min;
            this.props.onTimeChange(min);
            this.props.timeline?.setTime(min);
        }
        this.updateHTML();
        this.tick();
    }
    stop() {
        this._stopTimer();
        this.updateHTML();
    }
    /** Start the playback timer (used internally) */
    _startTimer() {
        this._playing = true;
        this.tick();
    }
    /** Stop the playback timer (used internally) */
    _stopTimer() {
        this._playing = false;
        if (this.timerId !== null) {
            window.clearTimeout(this.timerId);
            this.timerId = null;
        }
    }
}
TimelineWidget.defaultProps = {
    ...Widget.defaultProps,
    id: 'timeline',
    placement: 'bottom-left',
    viewId: null,
    timeline: null,
    timeRange: [0, 100],
    step: 1,
    initialTime: undefined,
    time: undefined,
    onTimeChange: () => { },
    autoPlay: false,
    loop: false,
    playInterval: 1000,
    playing: undefined,
    onPlayingChange: () => { },
    formatLabel: String
};
//# sourceMappingURL=timeline-widget.js.map