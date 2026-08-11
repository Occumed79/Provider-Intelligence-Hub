import { Registry } from '../registry';
import * as strategies from './main';
export const connectionStrategyPresets = strategies;
export const connectionStrategyRegistry = Registry.create({
    type: 'connection strategy',
});
connectionStrategyRegistry.register(connectionStrategyPresets, true);
//# sourceMappingURL=index.js.map