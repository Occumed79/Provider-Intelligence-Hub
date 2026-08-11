import { __rest } from "tslib";
import { NumberExt } from '../../common';
import { Path } from '../../geometry';
import { normalize } from './util';
export const block = (_a) => {
    var { size, width, height, offset, open } = _a, attrs = __rest(_a, ["size", "width", "height", "offset", "open"]);
    return createClassicMarker({ size, width, height, offset }, open === true, true, undefined, attrs);
};
export const classic = (_a) => {
    var { size, width, height, offset, factor } = _a, attrs = __rest(_a, ["size", "width", "height", "offset", "factor"]);
    return createClassicMarker({ size, width, height, offset }, false, false, factor, attrs);
};
function createClassicMarker(options, open, full, factor = 3 / 4, attrs = {}) {
    const size = options.size || 10;
    const width = options.width || size;
    const height = options.height || size;
    const path = new Path();
    const localAttrs = {};
    if (open) {
        path
            .moveTo(width, 0)
            .lineTo(0, height / 2)
            .lineTo(width, height);
        localAttrs.fill = 'none';
    }
    else {
        path.moveTo(0, height / 2);
        path.lineTo(width, 0);
        if (!full) {
            const f = NumberExt.clamp(factor, 0, 1);
            path.lineTo(width * f, height / 2);
        }
        path.lineTo(width, height);
        path.close();
    }
    return Object.assign(Object.assign(Object.assign({}, localAttrs), attrs), { tagName: 'path', d: normalize(path.serialize(), {
            x: options.offset != null ? options.offset : -width / 2,
        }) });
}
//# sourceMappingURL=classic.js.map