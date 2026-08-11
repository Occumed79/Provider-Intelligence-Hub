import { Registry } from '../registry';
import * as layouts from './main';
export const portLabelLayoutPresets = layouts;
export const portLabelLayoutRegistry = Registry.create({
    type: 'port label layout',
});
portLabelLayoutRegistry.register(portLabelLayoutPresets, true);
//# sourceMappingURL=index.js.map