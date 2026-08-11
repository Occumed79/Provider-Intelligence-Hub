import type { ConnectionPointDefinition, ConnectionPointStrokedOptions } from './index';
export interface BBoxOptions extends ConnectionPointStrokedOptions {
}
/**
 * Places the connection point at the intersection between the edge
 * path end segment and the target node bbox.
 */
export declare const bbox: ConnectionPointDefinition<BBoxOptions>;
