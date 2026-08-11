import type { SimpleAttrs } from '../attr';
import type { MarkerFactory } from './index';
export interface DiamondMarkerOptions extends SimpleAttrs {
    size?: number;
    width?: number;
    height?: number;
    offset?: number;
}
export declare const diamond: MarkerFactory<DiamondMarkerOptions>;
