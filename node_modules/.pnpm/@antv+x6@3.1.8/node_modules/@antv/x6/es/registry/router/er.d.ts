import type { RouterDefinition } from './index';
export interface ErRouterOptions {
    min?: number;
    offset?: number | 'center';
    direction?: 'T' | 'B' | 'L' | 'R' | 'H' | 'V';
}
export declare const er: RouterDefinition<ErRouterOptions>;
