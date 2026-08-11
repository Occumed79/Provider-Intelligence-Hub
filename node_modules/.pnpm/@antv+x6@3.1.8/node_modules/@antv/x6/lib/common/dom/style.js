"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrefixedStyle = setPrefixedStyle;
exports.getComputedStyle = getComputedStyle;
exports.hasScrollbars = hasScrollbars;
const prefix_1 = require("./prefix");
function setPrefixedStyle(style, name, value) {
    const vendor = (0, prefix_1.getVendorPrefixedName)(name);
    if (vendor != null) {
        style[vendor] = value;
    }
    style[name] = value;
}
function getComputedStyle(elem, name) {
    // IE9+
    const computed = elem.ownerDocument &&
        elem.ownerDocument.defaultView &&
        elem.ownerDocument.defaultView.opener
        ? elem.ownerDocument.defaultView.getComputedStyle(elem, null)
        : window.getComputedStyle(elem, null);
    if (computed && name) {
        return computed.getPropertyValue(name) || computed[name];
    }
    return computed;
}
function hasScrollbars(container) {
    const style = getComputedStyle(container);
    return (style != null && (style.overflow === 'scroll' || style.overflow === 'auto'));
}
//# sourceMappingURL=style.js.map