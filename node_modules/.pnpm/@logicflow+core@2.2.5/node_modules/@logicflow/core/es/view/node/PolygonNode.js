var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { jsx as _jsx } from "preact/jsx-runtime";
import BaseNode from './BaseNode';
import { Polygon } from '../shape';
var PolygonNode = /** @class */ (function (_super) {
    __extends(PolygonNode, _super);
    function PolygonNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PolygonNode.prototype.getShape = function () {
        var model = this.props.model;
        var _a = model, x = _a.x, y = _a.y, width = _a.width, height = _a.height, points = _a.points;
        var style = model.getNodeStyle();
        var attr = {
            transform: "matrix(1 0 0 1 ".concat(x - width / 2, " ").concat(y - height / 2, ")"),
        };
        return (_jsx("g", __assign({}, attr, { children: _jsx(Polygon, __assign({}, style, { points: points, x: x, y: y })) })));
    };
    return PolygonNode;
}(BaseNode));
export { PolygonNode };
export default PolygonNode;
