import type { SimpleAttrs } from '../attr';
import type { MarkerFactory } from './index';
export interface CircleMarkerOptions extends SimpleAttrs {
    r?: number;
}
export interface CirclePlusMarkerOptions extends CircleMarkerOptions {
}
export declare const circle: MarkerFactory<CircleMarkerOptions>;
export declare const circlePlus: MarkerFactory<CircleMarkerOptions>;
