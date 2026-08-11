"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watermark = void 0;
const geometry_1 = require("../../geometry");
const watermark = (img, options) => {
    const width = img.width;
    const height = img.height;
    const canvas = document.createElement('canvas');
    canvas.width = width * 3;
    canvas.height = height * 3;
    const ctx = canvas.getContext('2d');
    const angle = options.angle != null ? -options.angle : -20;
    const radians = (0, geometry_1.toRad)(angle);
    const stepX = canvas.width / 4;
    const stepY = canvas.height / 4;
    for (let i = 0; i < 4; i += 1) {
        for (let j = 0; j < 4; j += 1) {
            if ((i + j) % 2 > 0) {
                ctx.setTransform(1, 0, 0, 1, (2 * i - 1) * stepX, (2 * j - 1) * stepY);
                ctx.rotate(radians);
                ctx.drawImage(img, -width / 2, -height / 2, width, height);
            }
        }
    }
    return canvas;
};
exports.watermark = watermark;
//# sourceMappingURL=watermark.js.map