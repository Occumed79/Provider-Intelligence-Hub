"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixedDot = void 0;
const common_1 = require("../../common");
exports.fixedDot = {
    color: '#aaaaaa',
    thickness: 1,
    markup: 'rect',
    update(elem, options) {
        const size = options.sx <= 1 ? options.thickness * options.sx : options.thickness;
        common_1.Dom.attr(elem, {
            width: size,
            height: size,
            rx: size,
            ry: size,
            fill: options.color,
        });
    },
};
//# sourceMappingURL=fixed-dot.js.map