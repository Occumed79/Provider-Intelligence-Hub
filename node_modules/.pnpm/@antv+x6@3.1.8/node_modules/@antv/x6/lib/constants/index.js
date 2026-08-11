"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLAG_REMOVE = exports.FLAG_INSERT = exports.DocumentEvents = void 0;
exports.DocumentEvents = {
    mousemove: 'onMouseMove',
    touchmove: 'onMouseMove',
    mouseup: 'onMouseUp',
    touchend: 'onMouseUp',
    touchcancel: 'onDragEnd',
};
exports.FLAG_INSERT = 1 << 30;
exports.FLAG_REMOVE = 1 << 29;
//# sourceMappingURL=index.js.map