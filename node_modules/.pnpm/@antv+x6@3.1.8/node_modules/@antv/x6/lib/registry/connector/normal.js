"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normal = void 0;
const geometry_1 = require("../../geometry");
const normal = (sourcePoint, targetPoint, routePoints, options = {}) => {
    const points = [sourcePoint, ...routePoints, targetPoint];
    const polyline = new geometry_1.Polyline(points);
    const path = new geometry_1.Path(polyline);
    return options.raw ? path : path.serialize();
};
exports.normal = normal;
//# sourceMappingURL=normal.js.map