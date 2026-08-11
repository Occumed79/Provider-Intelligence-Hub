"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cross = void 0;
const tslib_1 = require("tslib");
const geometry_1 = require("../../geometry");
const util_1 = require("./util");
const cross = (_a) => {
    var { size, width, height, offset } = _a, attrs = tslib_1.__rest(_a, ["size", "width", "height", "offset"]);
    const s = size || 10;
    const w = width || s;
    const h = height || s;
    const path = new geometry_1.Path();
    path.moveTo(0, 0).lineTo(w, h).moveTo(0, h).lineTo(w, 0);
    return Object.assign(Object.assign({}, attrs), { tagName: 'path', fill: 'none', d: (0, util_1.normalize)(path.serialize(), offset || -w / 2) });
};
exports.cross = cross;
//# sourceMappingURL=cross.js.map