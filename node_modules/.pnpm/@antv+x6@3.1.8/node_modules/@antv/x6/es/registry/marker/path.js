import { __rest } from "tslib";
import { normalize } from './util';
export const path = (_a) => {
    var { d, offsetX, offsetY } = _a, attrs = __rest(_a, ["d", "offsetX", "offsetY"]);
    return Object.assign(Object.assign({}, attrs), { tagName: 'path', d: normalize(d, offsetX, offsetY) });
};
//# sourceMappingURL=path.js.map