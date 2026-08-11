import { Registry } from '../registry';
import * as highlighters from './main';
export function highlighterCheck(name, highlighter) {
    if (typeof highlighter.highlight !== 'function') {
        throw new Error(`Highlighter '${name}' is missing required \`highlight()\` method`);
    }
    if (typeof highlighter.unhighlight !== 'function') {
        throw new Error(`Highlighter '${name}' is missing required \`unhighlight()\` method`);
    }
}
const presets = highlighters;
export const highlighterRegistry = Registry.create({
    type: 'highlighter',
});
highlighterRegistry.register(presets, true);
//# sourceMappingURL=index.js.map