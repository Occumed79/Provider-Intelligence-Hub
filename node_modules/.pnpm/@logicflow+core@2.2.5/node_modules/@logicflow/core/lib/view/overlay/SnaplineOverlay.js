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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnaplineOverlay = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var Line_1 = __importDefault(require("../shape/Line"));
var __1 = require("../..");
var OutlineOverlay_1 = __importDefault(require("./OutlineOverlay"));
var SnaplineOverlay = /** @class */ (function (_super) {
    __extends(SnaplineOverlay, _super);
    function SnaplineOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SnaplineOverlay.prototype.render = function () {
        var snaplineModel = this.props.snaplineModel;
        var _a = snaplineModel !== null && snaplineModel !== void 0 ? snaplineModel : {}, position = _a.position, isShowHorizontal = _a.isShowHorizontal, isShowVertical = _a.isShowVertical;
        var style = snaplineModel === null || snaplineModel === void 0 ? void 0 : snaplineModel.getStyle();
        var _b = position !== null && position !== void 0 ? position : {}, _c = _b.x, x = _c === void 0 ? 0 : _c, _d = _b.y, y = _d === void 0 ? 0 : _d;
        // 展示横向，纵向默认-100000,100000 减少计算量
        var horizontalLine = __assign(__assign({ x1: -100000, y1: y, x2: 100000, y2: y }, style), { stroke: isShowHorizontal ? style === null || style === void 0 ? void 0 : style.stroke : 'none' });
        var verticalLine = __assign(__assign({ x1: x, y1: -100000, x2: x, y2: 100000 }, style), { stroke: isShowVertical ? style === null || style === void 0 ? void 0 : style.stroke : 'none' });
        return ((0, jsx_runtime_1.jsxs)("g", { className: "lf-snapline", children: [(0, jsx_runtime_1.jsx)(Line_1.default, __assign({}, horizontalLine)), (0, jsx_runtime_1.jsx)(Line_1.default, __assign({}, verticalLine))] }));
    };
    SnaplineOverlay = __decorate([
        __1.observer
    ], SnaplineOverlay);
    return SnaplineOverlay;
}(compat_1.Component));
exports.SnaplineOverlay = SnaplineOverlay;
exports.default = OutlineOverlay_1.default;
