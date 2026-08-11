import { Registry } from '../registry';
import * as patterns from './main';
const presets = Object.assign({}, patterns);
presets['flip-x'] = patterns.flipX;
presets['flip-y'] = patterns.flipY;
presets['flip-xy'] = patterns.flipXY;
export const backgroundRegistry = Registry.create({
    type: 'background pattern',
});
backgroundRegistry.register(presets, true);
//# sourceMappingURL=index.js.map