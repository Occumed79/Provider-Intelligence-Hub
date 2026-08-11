import type { SimpleAttrs } from '../attr';
import type { MarkerFactory } from './index';
export interface EllipseMarkerOptions extends SimpleAttrs {
    rx?: number;
    ry?: number;
}
export declare const ellipse: MarkerFactory<EllipseMarkerOptions>;
