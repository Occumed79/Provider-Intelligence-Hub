import { Registry } from '../registry';
import * as connectors from './main';
export const connectorPresets = connectors;
export const connectorRegistry = Registry.create({
    type: 'connector',
});
connectorRegistry.register(connectorPresets, true);
//# sourceMappingURL=index.js.map