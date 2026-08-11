import { Dom } from '../../common';
/**
 * Format the event key.
 * @param key
 * @param formatFn
 * @returns
 */
export declare function formatKey(key: string, formatFn?: (...args: any[]) => any, args?: any): any;
/**
 * Whether the event is an input event.
 * @param e
 * @returns
 */
export declare function isInputEvent(e: KeyboardEvent | Dom.MouseUpEvent): boolean;
/**
 * Whether the event is a graph event.
 * @param e
 * @param t
 * @param container
 * @returns
 */
export declare function isGraphEvent(e: KeyboardEvent, t: Element, container: Element): boolean;
