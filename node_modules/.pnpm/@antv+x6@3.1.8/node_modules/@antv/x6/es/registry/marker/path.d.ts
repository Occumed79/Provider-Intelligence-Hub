import type { SimpleAttrs } from '../attr';
import type { MarkerFactory } from './index';
export interface PathMarkerOptions extends SimpleAttrs {
    d: string;
    offsetX?: number;
    offsetY?: number;
}
export declare const path: MarkerFactory<PathMarkerOptions>;
