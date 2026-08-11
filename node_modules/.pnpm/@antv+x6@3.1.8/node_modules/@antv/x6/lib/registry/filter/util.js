"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getString = getString;
exports.getNumber = getNumber;
function getString(value, defaultValue) {
    return value != null ? value : defaultValue;
}
function getNumber(num, defaultValue) {
    return num != null && Number.isFinite(num) ? num : defaultValue;
}
//# sourceMappingURL=util.js.map