"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassName = getClassName;
const common_1 = require("../../common");
let counter = 0;
function getClassName(name) {
    if (name) {
        return common_1.StringExt.pascalCase(name);
    }
    counter += 1;
    return `CustomTool${counter}`;
}
//# sourceMappingURL=util.js.map