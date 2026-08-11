import type { RouterDefinition } from './index';
export interface LoopRouterOptions {
    width?: number;
    height?: number;
    angle?: 'auto' | number;
    merge?: boolean | number;
}
export declare const loop: RouterDefinition<LoopRouterOptions>;
