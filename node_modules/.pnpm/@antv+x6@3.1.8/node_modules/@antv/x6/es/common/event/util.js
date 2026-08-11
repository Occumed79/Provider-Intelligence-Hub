import { apply, toAsyncBoolean } from '../function';
export function call(list, args) {
    const results = [];
    for (let i = 0; i < list.length; i += 2) {
        const handler = list[i];
        const context = list[i + 1];
        const params = Array.isArray(args) ? args : [args];
        const ret = apply(handler, context, params);
        results.push(ret);
    }
    return toAsyncBoolean(results);
}
//# sourceMappingURL=util.js.map