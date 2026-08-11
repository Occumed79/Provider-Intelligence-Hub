import { EventHandler } from './types';
export type EventTarget = Element | Record<string, unknown>;
export interface HandlerObject {
    guid: number;
    type: string;
    originType: string;
    handler: EventHandler<any, any>;
    data?: any;
    selector?: string;
    namespace?: string;
}
export interface Data {
    handler?: EventHandler<any, any>;
    events: {
        [type: string]: {
            handlers: HandlerObject[];
            delegateCount: number;
        };
    };
}
export declare function ensure(target: EventTarget): Data;
export declare function get(target: EventTarget): Data;
export declare function remove(target: EventTarget): boolean;
