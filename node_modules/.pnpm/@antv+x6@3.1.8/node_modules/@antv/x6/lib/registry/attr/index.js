"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attrRegistry = exports.attrPresets = void 0;
exports.isValidDefinition = isValidDefinition;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const registry_1 = require("../registry");
const attrs = tslib_1.__importStar(require("./main"));
const raw_1 = require("./raw");
function isValidDefinition(def, val, options) {
    if (def != null) {
        if (typeof def === 'string') {
            return true;
        }
        if (typeof def.qualify !== 'function' ||
            common_1.FunctionExt.call(def.qualify, this, val, options)) {
            return true;
        }
    }
    return false;
}
exports.attrPresets = Object.assign(Object.assign({}, raw_1.raw), attrs);
exports.attrRegistry = registry_1.Registry.create({
    type: 'attribute definition',
});
exports.attrRegistry.register(exports.attrPresets, true);
//# sourceMappingURL=index.js.map