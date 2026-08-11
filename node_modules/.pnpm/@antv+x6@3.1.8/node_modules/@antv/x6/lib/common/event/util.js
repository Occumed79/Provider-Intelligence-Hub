"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = call;
const function_1 = require("../function");
function call(list, args) {
    const results = [];
    for (let i = 0; i < list.length; i += 2) {
        const handler = list[i];
        const context = list[i + 1];
        const params = Array.isArray(args) ? args : [args];
        const ret = (0, function_1.apply)(handler, context, params);
        results.push(ret);
    }
    return (0, function_1.toAsyncBoolean)(results);
}
//# sourceMappingURL=util.js.map