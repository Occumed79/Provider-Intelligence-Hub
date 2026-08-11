"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.length = void 0;
const length = (view, magnet, ref, options) => {
    const length = options.length != null ? options.length : 20;
    return view.getPointAtLength(length);
};
exports.length = length;
//# sourceMappingURL=length.js.map