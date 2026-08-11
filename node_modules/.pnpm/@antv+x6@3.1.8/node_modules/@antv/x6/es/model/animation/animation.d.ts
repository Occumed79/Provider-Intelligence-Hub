import { AnimationPlaybackEvent } from './animationEvent';
import type { KeyframeEffect } from './keyframeEffect';
/**
 * Web Animation API 的 Animation 实现，功能完善实现中
 * 参考: https://developer.mozilla.org/en-US/docs/Web/API/Animation
 */
export declare class Animation {
    private _effect;
    private _currentTime;
    private _playbackRate;
    private _playState;
    private _rafId;
    private _startTime;
    private _pausedTime;
    private _timeline;
    id: string;
    onfinish: ((e: AnimationPlaybackEvent) => void) | null;
    oncancel: ((e: AnimationPlaybackEvent) => void) | null;
    constructor(effect: KeyframeEffect | null, timeline?: AnimationTimeline | null);
    get effect(): KeyframeEffect | null;
    get currentTime(): number | null;
    set currentTime(value: number | null);
    get playbackRate(): number;
    set playbackRate(value: number);
    get playState(): AnimationPlayState;
    get timeline(): AnimationTimeline | null;
    play(): void;
    pause(): void;
    finish(): void;
    cancel(): void;
    updatePlaybackRate(playbackRate: number): void;
    reverse(): void;
    private _tick;
}
