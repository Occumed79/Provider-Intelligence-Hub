import { __rest } from "tslib";
import { Path } from '../../geometry';
import { normalize } from './util';
export const circle = (_a) => {
    var { r } = _a, attrs = __rest(_a, ["r"]);
    const radius = r || 5;
    return Object.assign(Object.assign({ cx: radius }, attrs), { tagName: 'circle', r: radius });
};
export const circlePlus = (_a) => {
    var { r } = _a, attrs = __rest(_a, ["r"]);
    const radius = r || 5;
    const path = new Path();
    path.moveTo(radius, 0).lineTo(radius, radius * 2);
    path.moveTo(0, radius).lineTo(radius * 2, radius);
    return {
        children: [
            Object.assign(Object.assign({}, circle({ r: radius })), { fill: 'none' }),
            Object.assign(Object.assign({}, attrs), { tagName: 'path', d: normalize(path.serialize(), -radius) }),
        ],
    };
};
//# sourceMappingURL=circle.js.map