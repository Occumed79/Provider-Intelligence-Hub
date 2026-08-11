"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getView = getView;
exports.registerView = registerView;
exports.unregisterView = unregisterView;
exports.createViewElement = createViewElement;
exports.viewFind = viewFind;
exports.normalizeEvent = normalizeEvent;
const common_1 = require("../../common");
const config_1 = require("../../config");
/**
 *  全局缓存 view，也不知道是用来干啥！
 */
const VIEWS = {};
function getView(cid) {
    return VIEWS[cid] || null;
}
function registerView(cid, view) {
    VIEWS[cid] = view;
}
function unregisterView(cid) {
    delete VIEWS[cid];
}
function createViewElement(tagName, isSvgElement) {
    return isSvgElement
        ? common_1.Dom.createSvgElement(tagName || 'g')
        : common_1.Dom.createElementNS(tagName || 'div');
}
function viewFind(selector, rootElem, selectors) {
    if (!selector || selector === '.') {
        return { elems: [rootElem] };
    }
    if (selectors) {
        const nodes = selectors[selector];
        if (nodes) {
            return { elems: Array.isArray(nodes) ? nodes : [nodes] };
        }
    }
    if (config_1.Config.useCSSSelector) {
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
function normalizeEvent(evt) {
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