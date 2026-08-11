/**
 * @file 缓动函数
 * 提供常用的缓动函数。
 */
export type Definition = (t: number) => number;
export type Names = 'linear' | 'quad' | 'cubic' | 'inout' | 'exponential' | 'bounce' | 'easeInSine' | 'easeOutSine' | 'easeInOutSine' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart' | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint' | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo' | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc' | 'easeInBack' | 'easeOutBack' | 'easeInOutBack' | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic' | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce';
export declare const linear: Definition;
export declare const quad: Definition;
export declare const cubic: Definition;
export declare const inout: Definition;
export declare const exponential: Definition;
export declare const bounce: Definition;
export declare const decorators: {
    reverse(f: Definition): Definition;
    reflect(f: Definition): Definition;
    clamp(f: Definition, n?: number, x?: number): Definition;
    back(s?: number): Definition;
    elastic(x?: number): Definition;
};
export declare function easeInSine(t: number): number;
export declare function easeOutSine(t: number): number;
export declare function easeInOutSine(t: number): number;
export declare function easeInQuad(t: number): number;
export declare function easeOutQuad(t: number): number;
export declare function easeInOutQuad(t: number): number;
export declare function easeInCubic(t: number): number;
export declare function easeOutCubic(t: number): number;
export declare function easeInOutCubic(t: number): number;
export declare function easeInQuart(t: number): number;
export declare function easeOutQuart(t: number): number;
export declare function easeInOutQuart(t: number): number;
export declare function easeInQuint(t: number): number;
export declare function easeOutQuint(t: number): number;
export declare function easeInOutQuint(t: number): number;
export declare function easeInExpo(t: number): number;
export declare function easeOutExpo(t: number): number;
export declare function easeInOutExpo(t: number): number;
export declare function easeInCirc(t: number): number;
export declare function easeOutCirc(t: number): number;
export declare function easeInOutCirc(t: number): number;
export declare function easeInBack(t: number, magnitude?: number): number;
export declare function easeOutBack(t: number, magnitude?: number): number;
export declare function easeInOutBack(t: number, magnitude?: number): number;
export declare function easeInElastic(t: number, magnitude?: number): number;
export declare function easeOutElastic(t: number, magnitude?: number): number;
export declare function easeInOutElastic(t: number, magnitude?: number): number;
export declare function easeOutBounce(t: number): number;
export declare function easeInBounce(t: number): number;
export declare function easeInOutBounce(t: number): number;
