"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saturate = saturate;
const util_1 = require("./util");
function saturate(args = {}) {
    const amount = (0, util_1.getNumber)(args.amount, 1);
    return `
      <filter>
        <feColorMatrix type="saturate" values="${1 - amount}"/>
      </filter>
    `.trim();
}
//# sourceMappingURL=saturate.js.map