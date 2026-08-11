import type { Cell } from '../cell';
import type { Animation } from './animation';
/**
 * Web Animation API 的 AnimationPlaybackEvent 实现
 * 参考: https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect
 */
export declare class AnimationPlaybackEvent {
    target: Animation;
    type: string;
    bubbles: boolean;
    currentTarget: Animation;
    defaultPrevented: boolean;
    eventPhase: number;
    timeStamp: number;
    currentTime: number | null;
    timelineTime: number | null;
    cell: Cell;
    constructor(target: Animation, type: string, currentTime: number | null, timelineTime: number | null);
}
