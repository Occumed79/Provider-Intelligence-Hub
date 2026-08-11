"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arrow = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var shape_1 = require("../shape");
var algorithm_1 = require("../../algorithm");
var Arrow = /** @class */ (function (_super) {
    __extends(Arrow, _super);
    function Arrow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Arrow.prototype.getArrowAttributes = function () {
        var _a = this.props, arrowInfo = _a.arrowInfo, style = _a.style;
        var start = arrowInfo.start, end = arrowInfo.end;
        var config = {
            start: start,
            end: end,
            offset: style.offset,
            verticalLength: style.verticalLength,
            type: 'end',
        };
        var _b = (0, algorithm_1.getVerticalPointOfLine)(config), leftX = _b.leftX, leftY = _b.leftY, rightX = _b.rightX, rightY = _b.rightY;
        return __assign({ d: "M".concat(leftX, " ").concat(leftY, " L").concat(end.x, " ").concat(end.y, " L").concat(rightX, " ").concat(rightY, " z") }, style);
    };
    Arrow.prototype.getShape = function () {
        var _a = this.getArrowAttributes(), d = _a.d, strokeWidth = _a.strokeWidth, stroke = _a.stroke, fill = _a.fill;
        return (0, jsx_runtime_1.jsx)(shape_1.Path, { d: d, fill: fill, strokeWidth: strokeWidth, stroke: stroke });
    };
    Arrow.prototype.render = function () {
        return (0, jsx_runtime_1.jsx)("g", { className: "lf-arrow", children: this.getShape() });
    };
    return Arrow;
}(compat_1.Component));
exports.Arrow = Arrow;
exports.default = Arrow;
