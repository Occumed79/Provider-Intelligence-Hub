"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fill = void 0;
const common_1 = require("../../common");
exports.fill = {
    qualify: common_1.ObjectExt.isPlainObject,
    set(fill, { view }) {
        return `url(#${view.graph.defineGradient(fill)})`;
    },
};
//# sourceMappingURL=fill.js.map