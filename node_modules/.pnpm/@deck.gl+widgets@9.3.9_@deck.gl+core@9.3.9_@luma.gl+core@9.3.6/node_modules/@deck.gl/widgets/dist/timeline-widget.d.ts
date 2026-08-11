import { Widget, type WidgetPlacement, type WidgetProps } from '@deck.gl/core';
import type { Timeline } from '@luma.gl/engine';
export type TimelineWidgetProps = WidgetProps & {
    /** Widget positioning within the view. Default 'bottom-left'. */
    placement?: WidgetPlacement;
    /** View to attach to and interact with. Required when using multiple views. */
    viewId?: string | null;
    /** Timeline instance to manipulate. */
    timeline?: Timeline | null;
    /** Slider timeRange [min, max]. */
    timeRange?: [number, number];
    /** Slider step.
     * @default 1
     */
    step?: number;
    /** Initial slider value for uncontrolled usage.
     * @default `timeRange[0]`
     */
    initialTime?: number;
    /**
     * Controlled time value. When provided, the widget is in controlled mode
     * for the time slider.
     */
    time?: number;
    /** Callback when time value changes (via slider or playback). */
    onTimeChange?: (value: number) => void;
    /** Start playing automatically
     * @default false
     */
    autoPlay?: boolean;
    /** Start from the beginning whentime reaches the end
     * @default false
     */
    loop?: boolean;
    /** Play interval in milliseconds.
     * @default 1000
     */
    playInterval?: number;
    /**
     * Controlled playing state. When provided, the widget is in controlled mode
     * for play/pause.
     */
    playing?: boolean;
    /**
     * Callback when play/pause button is clicked.
     * In controlled mode, use this to update the playing prop.
     */
    onPlayingChange?: (playing: boolean) => void;
    /** Callback to get label from time value */
    formatLabel?: (value: number) => string;
};
export declare class TimelineWidget extends Widget<TimelineWidgetProps> {
    id: string;
    className: string;
    placement: WidgetPlacement;
    private _playing;
    private timerId;
    currentTime: number;
    /**
     * Returns the current time value.
     * In controlled mode, returns the time prop.
     * In uncontrolled mode, returns the internal state.
     */
    getTime(): number;
    /**
     * Returns the current playing state.
     * In controlled mode, returns the playing prop.
     * In uncontrolled mode, returns the internal state.
     */
    getPlaying(): boolean;
    static defaultProps: Required<TimelineWidgetProps>;
    constructor(props?: TimelineWidgetProps);
    setProps(props: Partial<TimelineWidgetProps>): void;
    onAdd(): void;
    onRemove(): void;
    onRenderHTML(rootElement: HTMLElement): void;
    private handlePlayPause;
    private handleTimeChange;
    play(): void;
    stop(): void;
    /** Start the playback timer (used internally) */
    private _startTimer;
    /** Stop the playback timer (used internally) */
    private _stopTimer;
    private tick;
}
//# sourceMappingURL=timeline-widget.d.ts.map