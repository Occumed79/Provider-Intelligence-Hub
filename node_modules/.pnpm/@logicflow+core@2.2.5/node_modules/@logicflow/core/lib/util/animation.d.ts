import { Options } from '../options';
import AnimationConfig = Options.AnimationConfig;
export declare const defaultAnimationOffConfig: {
    node: boolean;
    edge: boolean;
};
export declare const defaultAnimationOnConfig: {
    node: boolean;
    edge: boolean;
};
export declare const setupAnimation: (config?: boolean | Partial<AnimationConfig>) => AnimationConfig;
export declare const updateAnimation: (config?: boolean | Partial<AnimationConfig>) => AnimationConfig;
