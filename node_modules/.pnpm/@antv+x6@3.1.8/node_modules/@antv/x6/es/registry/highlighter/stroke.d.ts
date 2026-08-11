import type { SimpleAttrs } from '../attr';
import type { HighlighterDefinition } from './index';
export interface StrokeHighlighterOptions {
    padding?: number;
    rx?: number;
    ry?: number;
    attrs?: SimpleAttrs;
}
export declare const stroke: HighlighterDefinition<StrokeHighlighterOptions>;
