import { type KeyValue } from '../../common';
import type { MarkerFactory } from './index';
interface Common {
    size?: number;
    width?: number;
    height?: number;
    offset?: number;
}
export interface BlockMarkerOptions extends Common, KeyValue {
    open?: boolean;
}
export interface ClassicMarkerOptions extends Common, KeyValue {
    factor?: number;
}
export declare const block: MarkerFactory<BlockMarkerOptions>;
export declare const classic: MarkerFactory<ClassicMarkerOptions>;
export {};
