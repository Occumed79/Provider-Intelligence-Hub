"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = void 0;
const common_1 = require("../../common");
exports.filter = {
    qualify: common_1.ObjectExt.isPlainObject,
    set(filter, { view }) {
        return `url(#${view.graph.defineFilter(filter)})`;
    },
};
//# sourceMappingURL=filter.js.map