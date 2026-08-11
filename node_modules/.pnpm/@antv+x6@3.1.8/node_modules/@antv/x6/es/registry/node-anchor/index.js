import { Registry } from '../registry';
import * as anchors from './main';
const presets = anchors;
export const nodeAnchorRegistry = Registry.create({
    type: 'node endpoint',
});
nodeAnchorRegistry.register(presets, true);
//# sourceMappingURL=index.js.map