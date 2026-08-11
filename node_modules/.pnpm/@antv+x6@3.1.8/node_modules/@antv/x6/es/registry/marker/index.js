import { Registry } from '../registry';
import * as markers from './main';
import { normalize as normalizeMarker } from './util';
const presets = markers;
export const markerRegistry = Registry.create({
    type: 'marker',
});
markerRegistry.register(presets, true);
export const markerNormalize = normalizeMarker;
//# sourceMappingURL=index.js.map