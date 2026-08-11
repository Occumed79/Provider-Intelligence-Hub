import { Registry } from '../registry';
import * as connectionPoints from './main';
const presets = connectionPoints;
export const connectionPointRegistry = Registry.create({
    type: 'connection point',
});
connectionPointRegistry.register(presets, true);
//# sourceMappingURL=index.js.map