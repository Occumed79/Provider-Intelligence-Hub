"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blur = blur;
const util_1 = require("./util");
function blur(args = {}) {
    const x = (0, util_1.getNumber)(args.x, 2);
    const stdDeviation = args.y != null && Number.isFinite(args.y) ? [x, args.y] : x;
    return `
    <filter>
      <feGaussianBlur stdDeviation="${stdDeviation}"/>
    </filter>
  `.trim();
}
//# sourceMappingURL=blur.js.map