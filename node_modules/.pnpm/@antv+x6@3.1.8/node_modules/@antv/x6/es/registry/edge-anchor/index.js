import { Registry } from '../registry';
import * as anchors from './main';
const presets = anchors;
export const edgeAnchorRegistry = Registry.create({
    type: 'edge endpoint',
});
edgeAnchorRegistry.register(presets, true);
//# sourceMappingURL=index.js.map