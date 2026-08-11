"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.path = void 0;
const tslib_1 = require("tslib");
const util_1 = require("./util");
const path = (_a) => {
    var { d, offsetX, offsetY } = _a, attrs = tslib_1.__rest(_a, ["d", "offsetX", "offsetY"]);
    return Object.assign(Object.assign({}, attrs), { tagName: 'path', d: (0, util_1.normalize)(d, offsetX, offsetY) });
};
exports.path = path;
//# sourceMappingURL=path.js.map