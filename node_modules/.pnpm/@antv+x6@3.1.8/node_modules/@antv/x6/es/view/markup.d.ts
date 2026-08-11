import { type KeyValue, type Nilable } from '../common';
import type { SimpleAttrs } from '../registry';
export type MarkupSelectors = KeyValue<Element | Element[]>;
export interface MarkupJSONMarkup {
    /**
     * The namespace URI of the element. It defaults to SVG namespace
     * `"http://www.w3.org/2000/svg"`.
     */
    ns?: string | null;
    /**
     * The type of element to be created.
     */
    tagName: string;
    /**
     * A unique selector for targeting the element within the `attr`
     * cell attribute.
     */
    selector?: string | null;
    /**
     * A selector for targeting multiple elements within the `attr`
     * cell attribute. The group selector name must not be the same
     * as an existing selector name.
     */
    groupSelector?: string | string[] | null;
    attrs?: SimpleAttrs;
    style?: Record<string, string | number>;
    className?: string | string[];
    children?: MarkupJSONMarkup[];
    textContent?: string;
}
export interface MarkupParseResult {
    fragment: DocumentFragment;
    selectors: MarkupSelectors;
    groups: KeyValue<Element[]>;
}
export type MarkupType = string | MarkupJSONMarkup | MarkupJSONMarkup[];
declare function isJSONMarkup(markup?: Nilable<MarkupType>): boolean;
declare function isStringMarkup(markup?: Nilable<MarkupType>): markup is string;
declare function clone(markup?: Nilable<MarkupType>): MarkupType;
/**
 * Removes blank space in markup to prevent create empty text node.
 */
declare function sanitize(markup: string): string;
declare function parseJSONMarkup(markup: MarkupJSONMarkup | MarkupJSONMarkup[], options?: {
    ns?: string;
}): MarkupParseResult;
declare function createContainer(firstChild: Element): Element | SVGElement;
declare function renderMarkup(markup: MarkupType): {
    elem?: Element;
    selectors?: MarkupSelectors;
};
declare function parseLabelStringMarkup(markup: string): {
    fragment: DocumentFragment;
    selectors: {};
};
declare function getSelector(elem: Element, stop: Element, prev?: string): string | undefined;
declare function getPortContainerMarkup(): MarkupType;
declare function getPortMarkup(): MarkupType;
declare function getPortLabelMarkup(): MarkupType;
declare function getEdgeMarkup(): MarkupType;
declare function getForeignObjectMarkup(bare?: boolean): MarkupJSONMarkup;
/**
 * Markup 所有的方法导出
 */
export declare const Markup: {
    isJSONMarkup: typeof isJSONMarkup;
    isStringMarkup: typeof isStringMarkup;
    clone: typeof clone;
    sanitize: typeof sanitize;
    parseJSONMarkup: typeof parseJSONMarkup;
    createContainer: typeof createContainer;
    renderMarkup: typeof renderMarkup;
    parseLabelStringMarkup: typeof parseLabelStringMarkup;
    getSelector: typeof getSelector;
    getPortContainerMarkup: typeof getPortContainerMarkup;
    getPortMarkup: typeof getPortMarkup;
    getPortLabelMarkup: typeof getPortLabelMarkup;
    getEdgeMarkup: typeof getEdgeMarkup;
    getForeignObjectMarkup: typeof getForeignObjectMarkup;
};
export {};
