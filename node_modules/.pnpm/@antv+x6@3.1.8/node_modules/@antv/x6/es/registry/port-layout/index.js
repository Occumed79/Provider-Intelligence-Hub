import { Registry } from '../registry';
import * as layouts from './main';
export const portLayoutPresets = layouts;
export const portLayoutRegistry = Registry.create({
    type: 'port layout',
});
portLayoutRegistry.register(portLayoutPresets, true);
//# sourceMappingURL=index.js.map