import type { RouterDefinition } from './index';
import { type ManhattanRouterOptions } from './manhattan/options';
export interface MetroRouterOptions extends ManhattanRouterOptions {
}
export declare const metro: RouterDefinition<Partial<MetroRouterOptions>>;
