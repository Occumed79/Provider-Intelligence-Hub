import { Registry } from '../registry';
import * as filters from './main';
const presets = filters;
export const filterRegistry = Registry.create({
    type: 'filter',
});
filterRegistry.register(presets, true);
//# sourceMappingURL=index.js.map