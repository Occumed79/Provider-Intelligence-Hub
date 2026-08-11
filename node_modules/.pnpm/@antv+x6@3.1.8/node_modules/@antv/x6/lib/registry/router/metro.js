"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metro = void 0;
const common_1 = require("../../common");
const geometry_1 = require("../../geometry");
const index_1 = require("./manhattan/index");
const options_1 = require("./manhattan/options");
const defaults = {
    maxDirectionChange: 45,
    // an array of directions to find next points on the route
    // different from start/end directions
    directions() {
        const step = (0, options_1.resolve)(this.step, this);
        const cost = (0, options_1.resolve)(this.cost, this);
        const diagonalCost = Math.ceil(Math.sqrt((step * step) << 1)); // eslint-disable-line no-bitwise
        return [
            { cost, offsetX: step, offsetY: 0 },
            { cost: diagonalCost, offsetX: step, offsetY: step },
            { cost, offsetX: 0, offsetY: step },
            { cost: diagonalCost, offsetX: -step, offsetY: step },
            { cost, offsetX: -step, offsetY: 0 },
            { cost: diagonalCost, offsetX: -step, offsetY: -step },
            { cost, offsetX: 0, offsetY: -step },
            { cost: diagonalCost, offsetX: step, offsetY: -step },
        ];
    },
    fallbackRoute: metroFallbackRoute,
};
function metroFallbackRoute(from, to, options) {
    const theta = from.theta(to);
    const route = [];
    let a = { x: to.x, y: from.y };
    let b = { x: from.x, y: to.y };
    if (theta % 180 > 90) {
        const t = a;
        a = b;
        b = t;
    }
    const p1 = theta % 90 < 45 ? a : b;
    const l1 = new geometry_1.Line(from, p1);
    const alpha = 90 * Math.ceil(theta / 90);
    const p2 = geometry_1.Point.fromPolar(l1.squaredLength(), (0, geometry_1.toRad)(alpha + 135), p1);
    const l2 = new geometry_1.Line(to, p2);
    const intersectionPoint = l1.intersectsWithLine(l2);
    const directionFrom = intersectionPoint || from;
    const quadrant = 360 / options.directions.length;
    const angleTheta = directionFrom.theta(to);
    const normalizedAngle = (0, geometry_1.normalize)(angleTheta + quadrant / 2);
    const directionAngle = quadrant * Math.floor(normalizedAngle / quadrant);
    options.previousDirectionAngle = directionAngle;
    if (intersectionPoint &&
        !intersectionPoint.equals(from) &&
        !intersectionPoint.equals(to)) {
        route.push(intersectionPoint.round());
    }
    return route;
}
const metro = function (vertices, options, linkView) {
    return common_1.FunctionExt.call(index_1.manhattan, this, vertices, Object.assign(Object.assign({}, defaults), options), linkView);
};
exports.metro = metro;
//# sourceMappingURL=metro.js.map