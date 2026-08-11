"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mesh = void 0;
const common_1 = require("../../common");
exports.mesh = {
    color: 'rgba(224,224,224,1)',
    thickness: 1,
    markup: 'path',
    update(elem, options) {
        let d;
        const width = options.width;
        const height = options.height;
        const thickness = options.thickness;
        if (width - thickness >= 0 && height - thickness >= 0) {
            d = ['M', width, 0, 'H0 M0 0 V0', height].join(' ');
        }
        else {
            d = 'M 0 0 0 0';
        }
        common_1.Dom.attr(elem, {
            d,
            stroke: options.color,
            'stroke-width': options.thickness,
        });
    },
};
//# sourceMappingURL=mesh.js.map