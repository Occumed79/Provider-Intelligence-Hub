import type { RouterDefinition } from './index';
import * as Util from './util';
export interface OrthRouterOptions extends Util.PaddingOptions {
}
/**
 * Returns a route with orthogonal line segments.
 */
export declare const orth: RouterDefinition<OrthRouterOptions>;
