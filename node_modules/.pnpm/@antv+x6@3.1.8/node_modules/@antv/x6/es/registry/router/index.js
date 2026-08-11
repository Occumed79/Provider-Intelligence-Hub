import { Registry } from '../registry';
import * as routers from './main';
export const routerPresets = routers;
export const routerRegistry = Registry.create({
    type: 'router',
});
routerRegistry.register(routerPresets, true);
//# sourceMappingURL=index.js.map