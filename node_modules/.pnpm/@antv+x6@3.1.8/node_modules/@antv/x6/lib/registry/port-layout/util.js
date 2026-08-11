"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePoint = normalizePoint;
exports.toResult = toResult;
const common_1 = require("../../common");
const geometry_1 = require("../../geometry");
function normalizePoint(bbox, args = {}) {
    return new geometry_1.Point(common_1.NumberExt.normalizePercentage(args.x, bbox.width), common_1.NumberExt.normalizePercentage(args.y, bbox.height));
}
function toResult(point, angle, rawArgs) {
    return Object.assign({ angle, position: point.toJSON() }, rawArgs);
}
//# sourceMappingURL=util.js.map