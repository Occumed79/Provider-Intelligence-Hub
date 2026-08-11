"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diamond = void 0;
const tslib_1 = require("tslib");
const geometry_1 = require("../../geometry");
const util_1 = require("./util");
const diamond = (_a) => {
    var { size, width, height, offset } = _a, attrs = tslib_1.__rest(_a, ["size", "width", "height", "offset"]);
    const s = size || 10;
    const w = width || s;
    const h = height || s;
    const path = new geometry_1.Path();
    path
        .moveTo(0, h / 2)
        .lineTo(w / 2, 0)
        .lineTo(w, h / 2)
        .lineTo(w / 2, h)
        .close();
    return Object.assign(Object.assign({}, attrs), { tagName: 'path', d: (0, util_1.normalize)(path.serialize(), offset == null ? -w / 2 : offset) });
};
exports.diamond = diamond;
//# sourceMappingURL=diamond.js.map