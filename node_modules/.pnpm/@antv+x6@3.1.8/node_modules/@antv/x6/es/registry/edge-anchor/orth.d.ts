import { type ResolveOptions } from '../node-anchor/util';
import type { EdgeAnchorDefinition } from './index';
export interface OrthEndpointOptions extends ResolveOptions {
    fallbackAt?: number | string;
}
export declare const orth: EdgeAnchorDefinition<OrthEndpointOptions>;
