import { get } from './store';
export const returnTrue = () => true;
export const returnFalse = () => false;
export function stopPropagationCallback(e) {
    e.stopPropagation();
}
export function addEventListener(elem, type, handler) {
    if (elem.addEventListener != null) {
        elem.addEventListener(type, handler);
    }
}
export function removeEventListener(elem, type, handler) {
    if (elem.removeEventListener != null) {
        elem.removeEventListener(type, handler);
    }
}
const rNotHTMLWhite = /[^\x20\t\r\n\f]+/g;
const rNamespace = /^([^.]*)(?:\.(.+)|)/;
export function splitType(types) {
    return (types || '').match(rNotHTMLWhite) || [''];
}
export function normalizeType(type) {
    const parts = rNamespace.exec(type) || [];
    return {
        originType: parts[1] ? parts[1].trim() : parts[1],
        namespaces: parts[2]
            ? parts[2]
                .split('.')
                .map((ns) => ns.trim())
                .sort()
            : [],
    };
}
export function isValidTarget(target) {
    // Accepts only:
    //  - Node
    //    - Node.ELEMENT_NODE
    //    - Node.DOCUMENT_NODE
    //  - Object
    //    - Any
    return target.nodeType === 1 || target.nodeType === 9 || !+target.nodeType;
}
export function isValidSelector(elem, selector) {
    if (selector) {
        const node = elem;
        return node.querySelector != null && node.querySelector(selector) != null;
    }
    return true;
}
let seed = 0;
const cache = new WeakMap();
export function ensureHandlerId(handler) {
    if (!cache.has(handler)) {
        cache.set(handler, seed);
        seed += 1;
    }
    return cache.get(handler);
}
export function getHandlerId(handler) {
    return cache.get(handler);
}
export function removeHandlerId(handler) {
    return cache.delete(handler);
}
export function setHandlerId(handler, id) {
    return cache.set(handler, id);
}
export function getHandlerQueue(elem, event) {
    const queue = [];
    const store = get(elem);
    const bag = store && store.events && store.events[event.type];
    const handlers = (bag && bag.handlers) || [];
    const delegateCount = bag ? bag.delegateCount : 0;
    if (delegateCount > 0 &&
        // Support: Firefox <=42 - 66+
        // Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
        // https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
        // Support: IE 11+
        // ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
        !(event.type === 'click' &&
            typeof event.button === 'number' &&
            event.button >= 1)) {
        for (let curr = event.target; curr !== elem; curr = curr.parentNode || elem) {
            // Don't check non-elements
            // Don't process clicks on disabled elements
            if (curr.nodeType === 1 &&
                !(event.type === 'click' && curr.disabled === true)) {
                const matchedHandlers = [];
                const matchedSelectors = {};
                for (let i = 0; i < delegateCount; i += 1) {
                    const handleObj = handlers[i];
                    const selector = handleObj.selector;
                    if (selector != null && matchedSelectors[selector] == null) {
                        const node = elem;
                        const nodes = [];
                        node.querySelectorAll(selector).forEach((child) => {
                            nodes.push(child);
                        });
                        matchedSelectors[selector] = nodes.includes(curr);
                    }
                    if (matchedSelectors[selector]) {
                        matchedHandlers.push(handleObj);
                    }
                }
                if (matchedHandlers.length) {
                    queue.push({ elem: curr, handlers: matchedHandlers });
                }
            }
        }
    }
    // Add the remaining (directly-bound) handlers
    if (delegateCount < handlers.length) {
        queue.push({ elem, handlers: handlers.slice(delegateCount) });
    }
    return queue;
}
export function isWindow(obj) {
    return obj != null && obj === obj.window;
}
export function contains(a, b) {
    const adown = a.nodeType === 9 ? a.documentElement : a;
    const bup = b && b.parentNode;
    return (a === bup ||
        !!(bup &&
            bup.nodeType === 1 &&
            // Support: IE 9 - 11+
            // IE doesn't have `contains` on SVG.
            (adown.contains
                ? adown.contains(bup)
                : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16)));
}
//# sourceMappingURL=util.js.map