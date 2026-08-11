const cache = new WeakMap();
export function ensure(target) {
    if (!cache.has(target)) {
        cache.set(target, { events: Object.create(null) });
    }
    return cache.get(target);
}
export function get(target) {
    return cache.get(target);
}
export function remove(target) {
    return cache.delete(target);
}
//# sourceMappingURL=store.js.map