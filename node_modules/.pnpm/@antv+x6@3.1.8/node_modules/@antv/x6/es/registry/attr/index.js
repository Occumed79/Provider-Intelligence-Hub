import { FunctionExt } from '../../common';
import { Registry } from '../registry';
import * as attrs from './main';
import { raw } from './raw';
export function isValidDefinition(def, val, options) {
    if (def != null) {
        if (typeof def === 'string') {
            return true;
        }
        if (typeof def.qualify !== 'function' ||
            FunctionExt.call(def.qualify, this, val, options)) {
            return true;
        }
    }
    return false;
}
export const attrPresets = Object.assign(Object.assign({}, raw), attrs);
export const attrRegistry = Registry.create({
    type: 'attribute definition',
});
attrRegistry.register(attrPresets, true);
//# sourceMappingURL=index.js.map