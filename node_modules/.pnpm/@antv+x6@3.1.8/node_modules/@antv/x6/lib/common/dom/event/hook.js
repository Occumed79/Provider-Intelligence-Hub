"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
exports.register = register;
exports.unregister = unregister;
const cache = {};
function get(type) {
    return cache[type] || {};
}
function register(type, hook) {
    cache[type] = hook;
}
function unregister(type) {
    delete cache[type];
}
//# sourceMappingURL=hook.js.map