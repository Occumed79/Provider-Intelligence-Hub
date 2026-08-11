"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invert = invert;
const util_1 = require("./util");
function invert(args = {}) {
    const amount = (0, util_1.getNumber)(args.amount, 1);
    const amount2 = 1 - amount;
    return `
      <filter>
        <feComponentTransfer>
          <feFuncR type="table" tableValues="${amount} ${amount2}"/>
          <feFuncG type="table" tableValues="${amount} ${amount2}"/>
          <feFuncB type="table" tableValues="${amount} ${amount2}"/>
        </feComponentTransfer>
      </filter>
    `.trim();
}
//# sourceMappingURL=invert.js.map