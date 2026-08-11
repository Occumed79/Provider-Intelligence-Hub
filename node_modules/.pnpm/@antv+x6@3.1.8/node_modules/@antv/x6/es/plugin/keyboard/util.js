import { Dom, FunctionExt } from '../../common';
/**
 * Format the event key.
 * @param key
 * @param formatFn
 * @returns
 */
export function formatKey(key, formatFn, args) {
    const formated = key
        .toLocaleLowerCase()
        .replace(/\s/g, '')
        .replace('delete', 'del')
        .replace('cmd', 'command')
        .replace('arrowup', 'up')
        .replace('arrowright', 'right')
        .replace('arrowdown', 'down')
        .replace('arrowleft', 'left');
    if (formatFn) {
        return FunctionExt.call(formatFn, args, formated);
    }
    return formated;
}
/**
 * Whether the event is an input event.
 * @param e
 * @returns
 */
export function isInputEvent(e) {
    var _a;
    const target = e.target;
    const tagName = (_a = target === null || target === void 0 ? void 0 : target.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    let isInput = ['input', 'textarea'].includes(tagName);
    if (Dom.attr(target, 'contenteditable') === 'true') {
        isInput = true;
    }
    return isInput;
}
/**
 * Whether the event is a graph event.
 * @param e
 * @param t
 * @param container
 * @returns
 */
export function isGraphEvent(e, t, container) {
    const target = e.target;
    const currentTarget = e.currentTarget;
    if (target) {
        if (target === t || currentTarget === t || target === document.body) {
            return true;
        }
        return Dom.contains(container, target);
    }
    return false;
}
//# sourceMappingURL=util.js.map