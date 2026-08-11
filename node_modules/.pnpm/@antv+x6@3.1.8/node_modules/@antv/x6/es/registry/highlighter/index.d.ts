import type { KeyValue } from '../../common';
import type { CellView } from '../../view';
import { Registry } from '../registry';
import * as highlighters from './main';
export interface HighlighterDefinition<T> {
    highlight: (cellView: CellView, magnet: Element, options: T) => void;
    unhighlight: (cellView: CellView, magnet: Element, options: T) => void;
}
export type HighlighterCommonDefinition = HighlighterDefinition<KeyValue>;
export declare function highlighterCheck(name: string, highlighter: HighlighterCommonDefinition): void;
type Presets = typeof presets;
type OptionsMap = {
    readonly [K in keyof Presets]-?: Parameters<Presets[K]['highlight']>[2];
};
type NativeNames = keyof Presets;
export interface HighlighterNativeItem<T extends NativeNames = NativeNames> {
    name: T;
    args?: OptionsMap[T];
}
export interface HighlighterManualItem {
    name: Exclude<string, NativeNames>;
    args?: KeyValue;
}
declare const presets: typeof highlighters;
export declare const highlighterRegistry: Registry<HighlighterCommonDefinition, typeof highlighters, never>;
export {};
