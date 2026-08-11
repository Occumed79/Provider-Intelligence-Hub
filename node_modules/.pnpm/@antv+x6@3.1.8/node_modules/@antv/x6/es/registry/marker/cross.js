import { __rest } from "tslib";
import { Path } from '../../geometry';
import { normalize } from './util';
export const cross = (_a) => {
    var { size, width, height, offset } = _a, attrs = __rest(_a, ["size", "width", "height", "offset"]);
    const s = size || 10;
    const w = width || s;
    const h = height || s;
    const path = new Path();
    path.moveTo(0, 0).lineTo(w, h).moveTo(0, h).lineTo(w, 0);
    return Object.assign(Object.assign({}, attrs), { tagName: 'path', fill: 'none', d: normalize(path.serialize(), offset || -w / 2) });
};
//# sourceMappingURL=cross.js.map