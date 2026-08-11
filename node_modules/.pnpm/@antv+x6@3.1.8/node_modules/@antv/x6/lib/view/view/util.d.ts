import { Dom } from '../../common';
import type { MarkupSelectors } from '../markup';
import type { View } from '.';
export declare function getView(cid: string): View<any>;
export declare function registerView(cid: string, view: View): void;
export declare function unregisterView(cid: string): void;
export declare function createViewElement(tagName?: string, isSvgElement?: boolean): HTMLElement | SVGElement;
export declare function viewFind(selector: string | null | undefined, rootElem: Element, selectors: MarkupSelectors): {
    isCSSSelector?: boolean;
    elems: Element[];
};
export declare function normalizeEvent<T extends Dom.EventObject>(evt: T): T;
