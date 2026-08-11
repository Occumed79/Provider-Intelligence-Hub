import type { KeyValue } from '../../common';
import type { SimpleAttrs } from '../attr';
import { Registry } from '../registry';
import * as markers from './main';
import { normalize as normalizeMarker } from './util';
export type MarkerFactory<T extends KeyValue = KeyValue> = (options: T) => MarkerResult;
export interface BaseResult extends SimpleAttrs {
    tagName?: string;
}
export type MarkerResult = BaseResult & {
    id?: string;
    refX?: number;
    refY?: number;
    markerUnits?: string;
    markerOrient?: 'auto' | 'auto-start-reverse' | number;
    children?: BaseResult[];
};
type Presets = typeof presets;
type OptionsMap = {
    readonly [K in keyof Presets]-?: Parameters<Presets[K]>[0];
};
type NativeNames = keyof OptionsMap;
export interface ManualItem {
    name: Exclude<string, NativeNames>;
    args?: KeyValue;
}
declare const presets: typeof markers;
export declare const markerRegistry: Registry<MarkerFactory<KeyValue<any>>, typeof markers, never>;
export declare const markerNormalize: typeof normalizeMarker;
export {};
