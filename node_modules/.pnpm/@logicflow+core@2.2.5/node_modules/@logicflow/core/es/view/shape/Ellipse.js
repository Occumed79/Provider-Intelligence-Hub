var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { jsx as _jsx } from "preact/jsx-runtime";
import { forEach, toPairs } from 'lodash-es';
export function Ellipse(props) {
    var _a = props.x, x = _a === void 0 ? 0 : _a, _b = props.y, y = _b === void 0 ? 0 : _b, _c = props.rx, rx = _c === void 0 ? 4 : _c, _d = props.ry, ry = _d === void 0 ? 4 : _d, className = props.className;
    var attrs = {
        cx: x,
        cy: y,
        rx: rx,
        ry: ry,
        fill: 'transparent',
        fillOpacity: 1,
        strokeWidth: 1,
        stroke: '#000',
        strokeOpacity: 1,
    };
    forEach(toPairs(props), function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        if (typeof v !== 'object') {
            attrs[k] = v;
        }
    });
    if (className) {
        attrs.className = "lf-basic-shape ".concat(className);
    }
    else {
        attrs.className = "lf-basic-shape";
    }
    return _jsx("ellipse", __assign({}, attrs));
}
export default Ellipse;
