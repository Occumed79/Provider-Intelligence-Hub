import { Dictionary } from '../common';
import { type Rectangle } from '../geometry';
import { type AttrDefinition, type CellAttrs, type ComplexAttrs, type SimpleAttrs } from '../registry/attr';
import type { CellView } from './cell';
import type { MarkupSelectors } from './markup';
export interface AttrManagerUpdateOptions {
    rootBBox: Rectangle;
    selectors: MarkupSelectors;
    scalableNode?: Element | null;
    rotatableNode?: Element | null;
    /**
     * Rendering only the specified attributes.
     */
    attrs?: CellAttrs | null;
}
export interface AttrManagerProcessedAttrs {
    raw: ComplexAttrs;
    normal?: SimpleAttrs | undefined;
    set?: ComplexAttrs | undefined;
    offset?: ComplexAttrs | undefined;
    position?: ComplexAttrs | undefined;
}
export declare class AttrManager {
    protected view: CellView;
    constructor(view: CellView);
    protected get cell(): import("..").Cell<import("..").CellProperties>;
    protected getDefinition(attrName: string): AttrDefinition | null;
    protected processAttrs(elem: Element, raw: ComplexAttrs): AttrManagerProcessedAttrs;
    protected mergeProcessedAttrs(allProcessedAttrs: AttrManagerProcessedAttrs, roProcessedAttrs: AttrManagerProcessedAttrs): void;
    protected findAttrs(cellAttrs: CellAttrs, rootNode: Element, selectorCache: {
        [selector: string]: Element[];
    }, selectors: MarkupSelectors): Dictionary<Element, {
        elem: Element;
        array: boolean;
        priority: number | number[];
        attrs: ComplexAttrs;
    }>;
    protected updateRelativeAttrs(elem: Element, processedAttrs: AttrManagerProcessedAttrs, refBBox: Rectangle): void;
    update(rootNode: Element, attrs: CellAttrs, options: AttrManagerUpdateOptions): void;
}
