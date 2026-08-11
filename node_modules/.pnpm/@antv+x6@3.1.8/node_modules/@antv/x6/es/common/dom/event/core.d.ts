import type { EventTarget, HandlerObject } from './store';
import { EventObject, type EventObjectEvent } from './object';
import { EventHandler } from './types';
import './special';
export declare function on(elem: EventTarget, types: string, handler: EventHandler<any, any> | ({
    handler: EventHandler<any, any>;
    selector?: string;
} & Partial<HandlerObject>), data?: any, selector?: string): void;
export declare function off(elem: EventTarget, types: string, handler?: EventHandler<any, any>, selector?: string, mappedTypes?: boolean): void;
export declare function dispatch(elem: EventTarget, evt: Event | EventObject | string, ...args: any[]): any;
export declare function trigger(event: (Partial<EventObjectEvent> & {
    type: string;
}) | EventObject | string, eventArgs: any, elem: EventTarget, onlyHandlers?: boolean): any;
