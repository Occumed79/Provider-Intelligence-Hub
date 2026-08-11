"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMixins = applyMixins;
/**
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html
 */
function applyMixins(derivedCtor, ...baseCtors) {
    baseCtors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            if (name !== 'constructor') {
                Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
            }
        });
    });
}
//# sourceMappingURL=mixins.js.map