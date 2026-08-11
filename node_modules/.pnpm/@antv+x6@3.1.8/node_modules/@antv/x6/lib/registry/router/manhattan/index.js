"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manhattan = void 0;
const common_1 = require("../../../common");
const options_1 = require("./options");
const router_1 = require("./router");
const manhattan = function (vertices, options, edgeView) {
    return common_1.FunctionExt.call(router_1.router, this, vertices, Object.assign(Object.assign({}, options_1.defaults), options), edgeView);
};
exports.manhattan = manhattan;
//# sourceMappingURL=index.js.map