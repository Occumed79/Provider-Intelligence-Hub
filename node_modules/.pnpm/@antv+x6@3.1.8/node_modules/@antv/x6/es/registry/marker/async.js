import { __rest } from "tslib";
import { Path } from '../../geometry';
import { normalize } from './util';
export const async = (_a) => {
    var { width, height, offset, open, flip } = _a, attrs = __rest(_a, ["width", "height", "offset", "open", "flip"]);
    let h = height || 6;
    const w = width || 10;
    const opened = open === true;
    const fliped = flip === true;
    const result = Object.assign(Object.assign({}, attrs), { tagName: 'path' });
    if (fliped) {
        h = -h;
    }
    const path = new Path();
    path.moveTo(0, h).lineTo(w, 0);
    if (!opened) {
        path.lineTo(w, h);
        path.close();
    }
    else {
        result.fill = 'none';
    }
    result.d = normalize(path.serialize(), {
        x: offset || -w / 2,
        y: h / 2,
    });
    return result;
};
//# sourceMappingURL=async.js.map