"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensure = ensure;
exports.get = get;
exports.remove = remove;
const cache = new WeakMap();
function ensure(target) {
    if (!cache.has(target)) {
        cache.set(target, { events: Object.create(null) });
    }
    return cache.get(target);
}
function get(target) {
    return cache.get(target);
}
function remove(target) {
    return cache.delete(target);
}
//# sourceMappingURL=store.js.map