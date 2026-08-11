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
import { generateRoundedCorners } from '../../util/geometry';
export function Polygon(props) {
    var _a = props.points, points = _a === void 0 ? [] : _a, className = props.className, radius = props.radius;
    var attrs = {
        fill: 'transparent',
        fillOpacity: 1,
        strokeWidth: 1,
        stroke: '#000',
        strokeOpacity: 1,
        points: '',
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
        attrs.className = 'lf-basic-shape';
    }
    if (radius) {
        var pointList = points.map(function (point) { return ({ x: point[0], y: point[1] }); });
        var rounded = generateRoundedCorners(pointList, radius, true);
        var d = rounded.length
            ? "M ".concat(rounded[0].x, " ").concat(rounded[0].y, " ").concat(rounded
                .slice(1)
                .map(function (p) { return "L ".concat(p.x, " ").concat(p.y); })
                .join(' '), " Z")
            : '';
        attrs.d = d;
        delete attrs.points;
        return _jsx("path", __assign({}, attrs));
    }
    else {
        attrs.points = points.map(function (point) { return point.join(','); }).join(' ');
        return _jsx("polygon", __assign({}, attrs));
    }
}
export default Polygon;
