import { EventObject, type EventObjectEvent } from './object';
import { TypeEventHandler, TypeEventHandlers } from './types';
export declare class Event {
    static on<TType extends string>(elem: Element, events: TType, selector: string, handler: TypeEventHandler<Element, undefined, any, any, TType> | false): Element;
    static on<TType extends string, TData>(elem: Element, events: TType, selector: string | null | undefined, data: TData, handler: TypeEventHandler<Element, TData, Element, Element, TType> | false): Element;
    static on<TType extends string, TData>(elem: Element, events: TType, data: TData, handler: TypeEventHandler<Element, TData, Element, Element, TType> | false): Element;
    static on<TType extends string, TData>(elem: Element, events: TType, data: TData, handlerObject: {
        handler: TypeEventHandler<Element, TData, Element, Element, TType>;
        selector?: string;
        [key: string]: any;
    }): Element;
    static on<TType extends string>(elem: Element, events: TType, handler: TypeEventHandler<Element, undefined, Element, Element, TType> | false): Element;
    static on<TType extends string>(elem: Element, events: TType, handlerObject: {
        handler: TypeEventHandler<Element, undefined, Element, Element, TType>;
        selector?: string;
        [key: string]: any;
    }): Element;
    static on<TData>(elem: Element, events: TypeEventHandlers<Element, TData, any, any>, selector: string | null | undefined, data: TData): Element;
    static on(elem: Element, events: TypeEventHandlers<Element, undefined, any, any>, selector: string): Element;
    static on<TData>(elem: Element, events: TypeEventHandlers<Element, TData, Element, Element>, data: TData): Element;
    static on(elem: Element, events: TypeEventHandlers<Element, undefined, Element, Element>): void;
    static once<TType extends string>(elem: Element, events: TType, selector: string, handler: TypeEventHandler<Element, undefined, any, any, TType> | false): Element;
    static once<TType extends string, TData>(elem: Element, events: TType, selector: string | null | undefined, data: TData, handler: TypeEventHandler<Element, TData, Element, Element, TType> | false): Element;
    static once<TType extends string, TData>(elem: Element, events: TType, data: TData, handler: TypeEventHandler<Element, TData, Element, Element, TType> | false): Element;
    static once<TType extends string, TData>(elem: Element, events: TType, data: TData, handlerObject: {
        handler: TypeEventHandler<Element, TData, Element, Element, TType>;
        selector?: string;
        [key: string]: any;
    }): Element;
    static once<TType extends string>(elem: Element, events: TType, handler: TypeEventHandler<Element, undefined, Element, Element, TType> | false): Element;
    static once<TType extends string>(elem: Element, events: TType, handlerObject: {
        handler: TypeEventHandler<Element, undefined, Element, Element, TType>;
        selector?: string;
        [key: string]: any;
    }): Element;
    static once<TData>(elem: Element, events: TypeEventHandlers<Element, TData, any, any>, selector: string | null | undefined, data: TData): Element;
    static once(elem: Element, events: TypeEventHandlers<Element, undefined, any, any>, selector: string): Element;
    static once<TData>(elem: Element, events: TypeEventHandlers<Element, TData, Element, Element>, data: TData): Element;
    static once(elem: Element, events: TypeEventHandlers<Element, undefined, Element, Element>): Element;
    static off<TType extends string>(elem: Element, events: TType, selector: string, handler: TypeEventHandler<Element, any, any, any, TType> | false): Element;
    static off<TType extends string>(elem: Element, events: TType, handler: TypeEventHandler<Element, any, any, any, TType> | false): Element;
    static off<TType extends string>(elem: Element, events: TType, selector_handler?: string | TypeEventHandler<Element, any, any, any, TType> | false): Element;
    static off(elem: Element, events: TypeEventHandlers<Element, any, any, any>, selector?: string): Element;
    static off(elem: Element, event?: EventObject<Element>): Element;
    static trigger(elem: Element, event: string | EventObject | (Partial<EventObjectEvent> & {
        type: string;
    }), args?: any[] | Record<string, any> | string | number | boolean, 
    /**
     * When onlyHandlers is `true`
     * - Will not call `.event()` on the element it is triggered on. This means
     *   `.trigger('submit', [], true)` on a form will not call `.submit()` on
     *   the form.
     * - Events will not bubble up the DOM hierarchy; if they are not handled
     *   by the target element directly, they do nothing.
     */
    onlyHandlers?: boolean): Element;
}
