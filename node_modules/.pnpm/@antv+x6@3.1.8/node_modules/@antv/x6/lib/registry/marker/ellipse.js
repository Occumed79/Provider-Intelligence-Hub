"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ellipse = void 0;
const tslib_1 = require("tslib");
const ellipse = (_a) => {
    var { rx, ry } = _a, attrs = tslib_1.__rest(_a, ["rx", "ry"]);
    const radiusX = rx || 5;
    const radiusy = ry || 5;
    return Object.assign(Object.assign({ cx: radiusX }, attrs), { tagName: 'ellipse', rx: radiusX, ry: radiusy });
};
exports.ellipse = ellipse;
//# sourceMappingURL=ellipse.js.map