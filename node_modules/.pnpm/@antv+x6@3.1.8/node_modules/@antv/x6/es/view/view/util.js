import { Dom } from '../../common';
import { Config } from '../../config';
/**
 *  全局缓存 view，也不知道是用来干啥！
 */
const VIEWS = {};
export function getView(cid) {
    return VIEWS[cid] || null;
}
export function registerView(cid, view) {
    VIEWS[cid] = view;
}
export function unregisterView(cid) {
    delete VIEWS[cid];
}
export function createViewElement(tagName, isSvgElement) {
    return isSvgElement
        ? Dom.createSvgElement(tagName || 'g')
        : Dom.createElementNS(tagName || 'div');
}
export function viewFind(selector, rootElem, selectors) {
    if (!selector || selector === '.') {
        return { elems: [rootElem] };
    }
    if (selectors) {
        const nodes = selectors[selector];
        if (nodes) {
            return { elems: Array.isArray(nodes) ? nodes : [nodes] };
        }
    }
    if (Config.useCSSSelector) {
        const validSelector = selector.includes('>')
            ? `:scope ${selector}`
            : selector;
        return {
            isCSSSelector: true,
            // $(rootElem).find(selector).toArray() as Element[]
            elems: Array.prototype.slice.call(rootElem.querySelectorAll(validSelector)),
        };
    }
    return { elems: [] };
}
export function normalizeEvent(evt) {
    var _a;
    let normalizedEvent = evt;
    const originalEvent = evt.originalEvent;
    const touchEvt = (_a = originalEvent === null || originalEvent === void 0 ? void 0 : originalEvent.changedTouches) === null || _a === void 0 ? void 0 : _a[0];
    if (touchEvt) {
        // eslint-disable-next-line no-restricted-syntax
        for (const key in evt) {
            if (touchEvt[key] === undefined) {
                touchEvt[key] = evt[key];
            }
        }
        normalizedEvent = touchEvt;
    }
    return normalizedEvent;
}
//# sourceMappingURL=util.js.map