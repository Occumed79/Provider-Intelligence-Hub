import { type ResolveOptions } from '../node-anchor/util';
import type { EdgeAnchorDefinition, EdgeAnchorResolvedDefinition } from './index';
export interface ClosestEndpointOptions extends ResolveOptions {
}
export declare const getClosestPoint: EdgeAnchorResolvedDefinition<ClosestEndpointOptions>;
export declare const closest: EdgeAnchorDefinition<ClosestEndpointOptions>;
