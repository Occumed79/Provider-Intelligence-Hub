import type { KeyValue } from '../../common';
import type { MarkerFactory } from './index';
export interface AsyncMarkerOptions extends KeyValue {
    width?: number;
    height?: number;
    offset?: number;
    open?: boolean;
    flip?: boolean;
}
export declare const async: MarkerFactory<AsyncMarkerOptions>;
