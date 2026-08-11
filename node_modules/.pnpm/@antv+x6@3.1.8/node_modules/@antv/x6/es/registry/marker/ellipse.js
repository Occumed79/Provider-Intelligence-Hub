import { __rest } from "tslib";
export const ellipse = (_a) => {
    var { rx, ry } = _a, attrs = __rest(_a, ["rx", "ry"]);
    const radiusX = rx || 5;
    const radiusy = ry || 5;
    return Object.assign(Object.assign({ cx: radiusX }, attrs), { tagName: 'ellipse', rx: radiusX, ry: radiusy });
};
//# sourceMappingURL=ellipse.js.map