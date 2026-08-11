"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnFalse = exports.returnTrue = void 0;
exports.stopPropagationCallback = stopPropagationCallback;
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.splitType = splitType;
exports.normalizeType = normalizeType;
exports.isValidTarget = isValidTarget;
exports.isValidSelector = isValidSelector;
exports.ensureHandlerId = ensureHandlerId;
exports.getHandlerId = getHandlerId;
exports.removeHandlerId = removeHandlerId;
exports.setHandlerId = setHandlerId;
exports.getHandlerQueue = getHandlerQueue;
exports.isWindow = isWindow;
exports.contains = contains;
const store_1 = require("./store");
const returnTrue = () => true;
exports.returnTrue = returnTrue;
const returnFalse = () => false;
exports.returnFalse = returnFalse;
function stopPropagationCallback(e) {
    e.stopPropagation();
}
function addEventListener(elem, type, handler) {
    if (elem.addEventListener != null) {
        elem.addEventListener(type, handler);
    }
}
function removeEventListener(elem, type, handler) {
    if (elem.removeEventListener != null) {
        elem.removeEventListener(type, handler);
    }
}
const rNotHTMLWhite = /[^\x20\t\r\n\f]+/g;
const rNamespace = /^([^.]*)(?:\.(.+)|)/;
function splitType(types) {
    return (types || '').match(rNotHTMLWhite) || [''];
}
function normalizeType(type) {
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
function isValidTarget(target) {
    // Accepts only:
    //  - Node
    //    - Node.ELEMENT_NODE
    //    - Node.DOCUMENT_NODE
    //  - Object
    //    - Any
    return target.nodeType === 1 || target.nodeType === 9 || !+target.nodeType;
}
function isValidSelector(elem, selector) {
    if (selector) {
        const node = elem;
        return node.querySelector != null && node.querySelector(selector) != null;
    }
    return true;
}
let seed = 0;
const cache = new WeakMap();
function ensureHandlerId(handler) {
    if (!cache.has(handler)) {
        cache.set(handler, seed);
        seed += 1;
    }
    return cache.get(handler);
}
function getHandlerId(handler) {
    return cache.get(handler);
}
function removeHandlerId(handler) {
    return cache.delete(handler);
}
function setHandlerId(handler, id) {
    return cache.set(handler, id);
}
function getHandlerQueue(elem, event) {
    const queue = [];
    const store = (0, store_1.get)(elem);
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
function isWindow(obj) {
    return obj != null && obj === obj.window;
}
function contains(a, b) {
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