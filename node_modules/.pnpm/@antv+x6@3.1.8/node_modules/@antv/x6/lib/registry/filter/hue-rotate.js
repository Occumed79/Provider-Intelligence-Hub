"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hueRotate = hueRotate;
const util_1 = require("./util");
function hueRotate(args = {}) {
    const angle = (0, util_1.getNumber)(args.angle, 0);
    return `
      <filter>
        <feColorMatrix type="hueRotate" values="${angle}"/>
      </filter>
    `.trim();
}
//# sourceMappingURL=hue-rotate.js.map