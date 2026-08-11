"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointBBox = getPointBBox;
exports.getPaddingBox = getPaddingBox;
exports.getSourceBBox = getSourceBBox;
exports.getTargetBBox = getTargetBBox;
exports.getSourceAnchor = getSourceAnchor;
exports.getTargetAnchor = getTargetAnchor;
const geometry_1 = require("../../geometry");
const common_1 = require("../../common");
function getPointBBox(p) {
    return new geometry_1.Rectangle(p.x, p.y, 0, 0);
}
function getPaddingBox(options = {}) {
    const sides = common_1.NumberExt.normalizeSides(options.padding || 20);
    return {
        x: -sides.left,
        y: -sides.top,
        width: sides.left + sides.right,
        height: sides.top + sides.bottom,
    };
}
function getSourceBBox(view, options = {}) {
    return view.sourceBBox.clone().moveAndExpand(getPaddingBox(options));
}
function getTargetBBox(view, options = {}) {
    return view.targetBBox.clone().moveAndExpand(getPaddingBox(options));
}
function getSourceAnchor(view, options = {}) {
    if (view.sourceAnchor) {
        return view.sourceAnchor;
    }
    const bbox = getSourceBBox(view, options);
    return bbox.getCenter();
}
function getTargetAnchor(view, options = {}) {
    if (view.targetAnchor) {
        return view.targetAnchor;
    }
    const bbox = getTargetBBox(view, options);
    return bbox.getCenter();
}
//# sourceMappingURL=util.js.map