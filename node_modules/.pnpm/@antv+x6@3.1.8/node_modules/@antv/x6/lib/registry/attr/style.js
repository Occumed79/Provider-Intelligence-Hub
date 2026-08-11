"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.style = void 0;
const common_1 = require("../../common");
exports.style = {
    qualify: common_1.ObjectExt.isPlainObject,
    set(styles, { elem }) {
        common_1.Dom.css(elem, styles);
    },
};
//# sourceMappingURL=style.js.map