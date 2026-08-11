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
import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Component } from 'preact/compat';
import Line from '../shape/Line';
import { observer } from '../..';
import OutlineOverlay from './OutlineOverlay';
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
        return (_jsxs("g", { className: "lf-snapline", children: [_jsx(Line, __assign({}, horizontalLine)), _jsx(Line, __assign({}, verticalLine))] }));
    };
    SnaplineOverlay = __decorate([
        observer
    ], SnaplineOverlay);
    return SnaplineOverlay;
}(Component));
export { SnaplineOverlay };
export default OutlineOverlay;
