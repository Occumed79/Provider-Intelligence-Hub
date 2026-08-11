const cache = {};
export function get(type) {
    return cache[type] || {};
}
export function register(type, hook) {
    cache[type] = hook;
}
export function unregister(type) {
    delete cache[type];
}
//# sourceMappingURL=hook.js.map