import type { RouterDefinition } from './index';
import type { PaddingOptions } from './util';
export interface OneSideRouterOptions extends PaddingOptions {
    side?: 'left' | 'top' | 'right' | 'bottom';
}
/**
 * Routes the edge always to/from a certain side
 */
export declare const oneSide: RouterDefinition<OneSideRouterOptions>;
