import { Timing } from '../../common';
import type { CamelToKebabCase } from '../../types';
import type { Cell } from '../cell';
/**
 * Web Animation API 的 KeyframeEffect 实现，功能完善实现中
 * 参考: https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect
 */
export declare class KeyframeEffect {
    private _target;
    private _keyframes;
    private _computedKeyframes;
    private _options;
    private _originProps?;
    constructor(target: Cell, keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions);
    get target(): Cell | null;
    getKeyframes(): ComputedKeyframe[];
    setKeyframes(keyframes: Keyframe[] | PropertyIndexedKeyframes | null): void;
    getTiming(): EffectTiming;
    getComputedTiming(): ComputedEffectTiming;
    apply(iterationTime: number | null): void;
}
export interface EffectTiming {
    delay?: number;
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    duration?: number;
    easing?: CamelToKebabCase<Timing.Names>;
    fill?: 'none' | 'forwards' | 'backwards' | 'both';
    iterations?: number;
}
interface ComputedEffectTiming extends EffectTiming {
    activeDuration?: number;
    endTime?: number;
}
export interface KeyframeEffectOptions extends EffectTiming {
    /** TODO: 待实现 */
    composite?: CompositeOperation;
    /** TODO: 待实现 */
    iterationComposite?: IterationCompositeOperation;
}
export {};
