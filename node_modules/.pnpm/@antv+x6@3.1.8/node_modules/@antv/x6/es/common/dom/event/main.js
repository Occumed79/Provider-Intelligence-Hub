/* eslint-disable no-param-reassign */
import * as Core from './core';
import { ensureHandlerId, returnFalse, setHandlerId } from './util';
export class Event {
    static on(elem, events, selector, data, handler) {
        Private.on(elem, events, selector, data, handler);
        return elem;
    }
    static once(elem, events, selector, data, handler) {
        Private.on(elem, events, selector, data, handler, true);
        return elem;
    }
    static off(elem, events, selector, handler) {
        Private.off(elem, events, selector, handler);
        return elem;
    }
    static trigger(elem, event, args, 
    /**
     * When onlyHandlers is `true`
     * - Will not call `.event()` on the element it is triggered on. This means
     *   `.trigger('submit', [], true)` on a form will not call `.submit()` on
     *   the form.
     * - Events will not bubble up the DOM hierarchy; if they are not handled
     *   by the target element directly, they do nothing.
     */
    onlyHandlers) {
        Core.trigger(event, args, elem, onlyHandlers);
        return elem;
    }
}
var Private;
(function (Private) {
    function on(elem, types, selector, data, fn, once) {
        // Types can be a map of types/handlers
        if (typeof types === 'object') {
            // ( types-Object, selector, data )
            if (typeof selector !== 'string') {
                // ( types-Object, data )
                data = data || selector;
                selector = undefined;
            }
            Object.keys(types).forEach((type) => on(elem, type, selector, data, types[type], once));
            return;
        }
        if (data == null && fn == null) {
            // ( types, fn )
            fn = selector;
            data = selector = undefined;
        }
        else if (fn == null) {
            if (typeof selector === 'string') {
                // ( types, selector, fn )
                fn = data;
                data = undefined;
            }
            else {
                // ( types, data, fn )
                fn = data;
                data = selector;
                selector = undefined;
            }
        }
        if (fn === false) {
            fn = returnFalse;
        }
        else if (!fn) {
            return;
        }
        if (once) {
            const originHandler = fn;
            fn = function (event, ...args) {
                // Can use an empty set, since event contains the info
                Private.off(elem, event);
                return originHandler.call(this, event, ...args);
            };
            // Use same guid so caller can remove using origFn
            setHandlerId(fn, ensureHandlerId(originHandler));
        }
        Core.on(elem, types, fn, data, selector);
    }
    Private.on = on;
    function off(elem, events, selector, fn) {
        const evt = events;
        if (evt && evt.preventDefault != null && evt.handleObj != null) {
            const obj = evt.handleObj;
            off(evt.delegateTarget, obj.namespace ? `${obj.originType}.${obj.namespace}` : obj.originType, obj.selector, obj.handler);
            return;
        }
        if (typeof events === 'object') {
            // ( types-object [, selector] )
            const types = events;
            Object.keys(types).forEach((type) => off(elem, type, selector, types[type]));
            return;
        }
        if (selector === false || typeof selector === 'function') {
            // ( types [, fn] )
            fn = selector;
            selector = undefined;
        }
        if (fn === false) {
            fn = returnFalse;
        }
        // @ts-ignore
        Core.off(elem, events, fn, selector);
    }
    Private.off = off;
})(Private || (Private = {}));
//# sourceMappingURL=main.js.map