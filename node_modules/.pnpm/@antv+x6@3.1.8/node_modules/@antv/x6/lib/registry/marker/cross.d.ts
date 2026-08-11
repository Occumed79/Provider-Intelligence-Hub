import type { SimpleAttrs } from '../attr';
import type { MarkerFactory } from './index';
export interface CrossMarkerOptions extends SimpleAttrs {
    size?: number;
    width?: number;
    height?: number;
    offset?: number;
}
export declare const cross: MarkerFactory<CrossMarkerOptions>;
