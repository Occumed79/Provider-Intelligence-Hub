"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.async = void 0;
const tslib_1 = require("tslib");
const geometry_1 = require("../../geometry");
const util_1 = require("./util");
const async = (_a) => {
    var { width, height, offset, open, flip } = _a, attrs = tslib_1.__rest(_a, ["width", "height", "offset", "open", "flip"]);
    let h = height || 6;
    const w = width || 10;
    const opened = open === true;
    const fliped = flip === true;
    const result = Object.assign(Object.assign({}, attrs), { tagName: 'path' });
    if (fliped) {
        h = -h;
    }
    const path = new geometry_1.Path();
    path.moveTo(0, h).lineTo(w, 0);
    if (!opened) {
        path.lineTo(w, h);
        path.close();
    }
    else {
        result.fill = 'none';
    }
    result.d = (0, util_1.normalize)(path.serialize(), {
        x: offset || -w / 2,
        y: h / 2,
    });
    return result;
};
exports.async = async;
//# sourceMappingURL=async.js.map