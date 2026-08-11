import type { ConnectionPointDefinition, ConnectionPointStrokedOptions } from './index';
export interface RectangleOptions extends ConnectionPointStrokedOptions {
}
/**
 * Places the connection point at the intersection between the
 * link path end segment and the element's unrotated bbox.
 */
export declare const rect: ConnectionPointDefinition<RectangleOptions>;
