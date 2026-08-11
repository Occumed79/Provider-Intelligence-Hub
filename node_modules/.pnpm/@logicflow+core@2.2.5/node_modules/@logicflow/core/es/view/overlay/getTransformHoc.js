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
import { Component } from 'preact';
export function getTransform(WrappedComponent) {
    return /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.getMatrixString = function () {
            var graphModel = this.props.graphModel;
            var _a = graphModel.transformModel, SCALE_X = _a.SCALE_X, SKEW_Y = _a.SKEW_Y, SKEW_X = _a.SKEW_X, SCALE_Y = _a.SCALE_Y, TRANSLATE_X = _a.TRANSLATE_X, TRANSLATE_Y = _a.TRANSLATE_Y;
            var matrixString = [
                SCALE_X,
                SKEW_Y,
                SKEW_X,
                SCALE_Y,
                TRANSLATE_X,
                TRANSLATE_Y,
            ].join(',');
            return {
                transform: "matrix(".concat(matrixString, ")"),
                transformOrigin: 'left top',
            };
        };
        class_1.prototype.render = function () {
            return (_jsx(WrappedComponent, __assign({}, this.props, { transformStyle: this.getMatrixString() })));
        };
        return class_1;
    }(Component));
}
