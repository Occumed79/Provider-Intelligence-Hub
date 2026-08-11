"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = resolve;
exports.getPointAtEdge = getPointAtEdge;
const geometry_1 = require("../../geometry");
const common_1 = require("../../common");
// eslint-disable-next-line
function resolve(fn) {
    return function (view, magnet, ref, options) {
        if (ref instanceof Element) {
            const refView = this.graph.findViewByElem(ref);
            let refPoint;
            if (refView) {
                if (refView.isEdgeElement(ref)) {
                    const distance = options.fixedAt != null ? options.fixedAt : '50%';
                    refPoint = getPointAtEdge(refView, distance);
                }
                else {
                    refPoint = refView.getBBoxOfElement(ref).getCenter();
                }
            }
            else {
                refPoint = new geometry_1.Point();
            }
            return fn.call(this, view, magnet, refPoint, options);
        }
        return fn.apply(this, arguments); // eslint-disable-line
    };
}
function getPointAtEdge(edgeView, value) {
    const isPercentage = common_1.NumberExt.isPercentage(value);
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isPercentage) {
        return edgeView.getPointAtRatio(num / 100);
    }
    return edgeView.getPointAtLength(num);
}
//# sourceMappingURL=util.js.map