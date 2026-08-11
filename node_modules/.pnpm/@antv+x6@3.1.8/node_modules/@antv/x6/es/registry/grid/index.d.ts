import { type KeyValue } from '../../common';
import { Registry } from '../registry';
import * as patterns from './main';
export declare class Grid {
    root: Element;
    patterns: {
        [id: string]: Element;
    };
    constructor();
    add(id: string, elem: Element): void;
    get(id: string): Element;
    has(id: string): boolean;
}
export interface GridOptions {
    color: string;
    thickness: number;
}
interface BaseDefinition<T extends GridOptions = GridOptions> extends GridOptions {
    markup: string;
    update: (elem: Element, options: {
        sx: number;
        sy: number;
        ox: number;
        oy: number;
        width: number;
        height: number;
    } & T) => void;
}
export type GridDefinition<T extends GridOptions = GridOptions> = T & BaseDefinition<T>;
type CommonDefinition = GridDefinition<GridOptions> | GridDefinition<GridOptions>[];
export declare const gridPresets: typeof patterns;
export declare const gridRegistry: Registry<CommonDefinition, typeof patterns, never>;
type Presets = typeof gridPresets;
export type GridOptionsMap = {
    dot: patterns.DotOptions;
    fixedDot: patterns.FixedDotOptions;
    mesh: patterns.MeshOptions;
    doubleMesh: patterns.DoubleMeshOptions[];
};
export type GridNativeNames = keyof Presets;
export interface GridNativeItem<T extends GridNativeNames = GridNativeNames> {
    type: T;
    args?: GridOptionsMap[T];
}
export interface GridManualItem {
    type: Exclude<string, GridNativeNames>;
    args?: KeyValue;
}
export {};
