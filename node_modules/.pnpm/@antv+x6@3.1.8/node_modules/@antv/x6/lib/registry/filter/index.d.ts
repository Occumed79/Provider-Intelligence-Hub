import type { NonUndefined } from 'utility-types';
import type { KeyValue } from '../../common';
import { Registry } from '../registry';
import * as filters from './main';
export type FilterDefinition<T> = (args: T) => string;
type CommonDefinition = FilterDefinition<KeyValue>;
type Presets = typeof presets;
type OptionsMap = {
    readonly [K in keyof Presets]-?: NonUndefined<Parameters<Presets[K]>[0]>;
};
type NativeNames = keyof Presets;
export interface FilterNativeItem<T extends NativeNames = NativeNames> {
    name: T;
    args?: OptionsMap[T];
}
export interface FilterManualItem {
    name: Exclude<string, NativeNames>;
    args?: KeyValue;
}
declare const presets: typeof filters;
export declare const filterRegistry: Registry<CommonDefinition, typeof filters, never>;
export {};
