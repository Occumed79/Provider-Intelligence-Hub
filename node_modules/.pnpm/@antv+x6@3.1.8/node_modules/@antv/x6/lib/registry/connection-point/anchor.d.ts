import type { ConnectionPointBaseOptions, ConnectionPointDefinition } from './index';
type Align = 'top' | 'right' | 'bottom' | 'left';
export interface AnchorOptions extends ConnectionPointBaseOptions {
    align?: Align;
    alignOffset?: number;
}
/**
 * Places the connection point at the edge's endpoint.
 */
export declare const anchor: ConnectionPointDefinition<AnchorOptions>;
export {};
