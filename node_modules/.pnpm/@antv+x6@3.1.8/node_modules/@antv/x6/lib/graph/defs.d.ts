import type { FilterManualItem, FilterNativeItem, MarkerResult, SimpleAttrs } from '../registry';
import { Base } from './base';
export type MarkerOptions = MarkerResult;
export interface GradientOptions {
    id?: string;
    type: string;
    stops: {
        offset: number;
        color: string;
        opacity?: number;
    }[];
    attrs?: SimpleAttrs;
}
export type FilterOptions = (FilterNativeItem | FilterManualItem) & {
    id?: string;
    attrs?: SimpleAttrs;
};
export declare class DefsManager extends Base {
    protected get cid(): string;
    protected get svg(): SVGSVGElement;
    protected get defs(): SVGDefsElement;
    protected isDefined(id: string): boolean;
    filter(options: FilterOptions): string;
    gradient(options: GradientOptions): string;
    marker(options: MarkerOptions): string;
    remove(id: string): void;
}
