import type { NodeAnchorDefinition } from './index';
import { type ResolveOptions } from './util';
export interface MiddleSideEndpointOptions extends ResolveOptions {
    rotate?: boolean;
    padding?: number;
    direction?: 'H' | 'V';
}
/**
 * Places the anchor of the edge in the middle of the side of view bbox
 * closest to the other endpoint.
 */
export declare const midSide: NodeAnchorDefinition<ResolveOptions>;
