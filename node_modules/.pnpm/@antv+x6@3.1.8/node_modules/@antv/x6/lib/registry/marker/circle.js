"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circlePlus = exports.circle = void 0;
const tslib_1 = require("tslib");
const geometry_1 = require("../../geometry");
const util_1 = require("./util");
const circle = (_a) => {
    var { r } = _a, attrs = tslib_1.__rest(_a, ["r"]);
    const radius = r || 5;
    return Object.assign(Object.assign({ cx: radius }, attrs), { tagName: 'circle', r: radius });
};
exports.circle = circle;
const circlePlus = (_a) => {
    var { r } = _a, attrs = tslib_1.__rest(_a, ["r"]);
    const radius = r || 5;
    const path = new geometry_1.Path();
    path.moveTo(radius, 0).lineTo(radius, radius * 2);
    path.moveTo(0, radius).lineTo(radius * 2, radius);
    return {
        children: [
            Object.assign(Object.assign({}, (0, exports.circle)({ r: radius })), { fill: 'none' }),
            Object.assign(Object.assign({}, attrs), { tagName: 'path', d: (0, util_1.normalize)(path.serialize(), -radius) }),
        ],
    };
};
exports.circlePlus = circlePlus;
//# sourceMappingURL=circle.js.map