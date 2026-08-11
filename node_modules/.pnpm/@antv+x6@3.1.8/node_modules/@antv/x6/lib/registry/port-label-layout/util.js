"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toResult = toResult;
const common_1 = require("../../common");
const defaults = {
    position: { x: 0, y: 0 },
    angle: 0,
    attrs: {
        '.': {
            y: '0',
            'text-anchor': 'start',
        },
    },
};
function toResult(preset, args) {
    const { x, y, angle, attrs } = args || {};
    return common_1.ObjectExt.defaultsDeep({}, { angle, attrs, position: { x, y } }, preset, defaults);
}
//# sourceMappingURL=util.js.map