import { ViewEvents } from '../../types';
import { Basecoat, Dom, type KeyValue } from '../../common';
import type { EventArgs } from '../../common/event/types';
import type { SimpleAttrs } from '../../registry';
import type { MarkupSelectors } from '../markup';
export declare abstract class View<A extends EventArgs = any> extends Basecoat<A> {
    readonly cid: string;
    container: Element;
    protected selectors: MarkupSelectors;
    get priority(): number;
    /** If need remove `this.container` DOM */
    protected get disposeContainer(): boolean;
    constructor();
    confirmUpdate(flag: number, options: any): number;
    empty(elem?: Element): this;
    unmount(elem?: Element): this;
    remove(elem?: Element): this;
    protected onRemove(): void;
    setClass(className: string | string[], elem?: Element): void;
    addClass(className: string | string[], elem?: Element): this;
    removeClass(className: string | string[], elem?: Element): this;
    setStyle(style: Record<string, string | number>, elem?: Element): this;
    setAttrs(attrs?: SimpleAttrs | null, elem?: Element): this;
    /**
     * Returns the value of the specified attribute of `node`.
     *
     * If the node does not set a value for attribute, start recursing up
     * the DOM tree from node to lookup for attribute at the ancestors of
     * node. If the recursion reaches CellView's root node and attribute
     * is not found even there, return `null`.
     */
    findAttr(attrName: string, elem?: Element): string;
    find(selector?: string, rootElem?: Element, selectors?: MarkupSelectors): Element[];
    findOne(selector?: string, rootElem?: Element, selectors?: MarkupSelectors): Element;
    findByAttr(attrName: string, elem?: Element): Element;
    getSelector(elem: Element, prevSelector?: string): string | undefined;
    prefixClassName(className: string): string;
    delegateEvents(events: ViewEvents, append?: boolean): this;
    undelegateEvents(): this;
    delegateDocumentEvents(events: ViewEvents, data?: KeyValue): this;
    undelegateDocumentEvents(): this;
    protected delegateEvent(eventName: string, selector: string | Record<string, unknown>, listener: any): this;
    protected undelegateEvent(eventName: string, selector: string, listener: any): this;
    protected undelegateEvent(eventName: string): this;
    protected undelegateEvent(eventName: string, listener: any): this;
    protected addEventListeners(elem: Element | Document, events: ViewEvents, data?: KeyValue): this;
    protected removeEventListeners(elem: Element | Document): this;
    protected getEventNamespace(): string;
    protected getEventHandler(handler: string | Function): Function;
    getEventTarget(e: Dom.EventObject, options?: {
        fromPoint?: boolean;
    }): any;
    stopPropagation(e: Dom.EventObject): this;
    isPropagationStopped(e: Dom.EventObject): boolean;
    getEventData<T extends KeyValue>(e: Dom.EventObject): T;
    setEventData<T extends KeyValue>(e: Dom.EventObject, data: T): T;
    protected eventData<T extends KeyValue>(e: Dom.EventObject, data?: T): T;
    normalizeEvent<T extends Dom.EventObject>(evt: T): T;
    dispose(): void;
}
