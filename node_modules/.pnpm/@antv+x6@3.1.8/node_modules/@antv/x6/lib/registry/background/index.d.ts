import type { ValuesType } from 'utility-types';
import type { KeyValue } from '../../common';
import { Registry } from '../registry';
export interface BackgroundOptions {
    color?: string;
    image?: string;
    position?: BackgroundPosition<{
        x: number;
        y: number;
    }>;
    size?: BackgroundSize<{
        width: number;
        height: number;
    }>;
    repeat?: BackgroundRepeat;
    opacity?: number;
}
export interface BackgroundCommonOptions extends Omit<BackgroundOptions, 'repeat'> {
    quality?: number;
}
export type BackgroundDefinition<T extends BackgroundCommonOptions = BackgroundCommonOptions> = (img: HTMLImageElement, options: T) => HTMLCanvasElement;
type Presets = typeof presets;
type OptionsMap = {
    readonly [K in keyof Presets]-?: Parameters<Presets[K]>[1] & {
        repeat: K;
    };
};
export type BackgroundNativeItem = ValuesType<OptionsMap>;
export type BackgroundManualItem = BackgroundCommonOptions & KeyValue & {
    repeat: string;
};
declare const presets: {
    [name: string]: BackgroundDefinition;
};
export declare const backgroundRegistry: Registry<BackgroundDefinition<BackgroundCommonOptions>, {
    [name: string]: BackgroundDefinition<BackgroundCommonOptions>;
}, never>;
type Globals = '-moz-initial' | 'inherit' | 'initial' | 'revert' | 'unset';
type BgPosition<TLength> = TLength | 'bottom' | 'center' | 'left' | 'right' | 'top' | (string & {});
type BgSize<TLength> = TLength | 'auto' | 'contain' | 'cover' | (string & {});
type RepeatStyle = 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'round' | 'space' | (string & {});
export type BackgroundPosition<TLength = (string & {}) | 0> = Globals | BgPosition<TLength> | (string & {});
export type BackgroundSize<TLength = (string & {}) | 0> = Globals | BgSize<TLength> | (string & {});
export type BackgroundRepeat = Globals | RepeatStyle | (string & {});
export {};
