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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundOverlay = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var compat_1 = require("preact/compat");
var lodash_es_1 = require("lodash-es");
var __1 = require("../..");
var BackgroundOverlay = /** @class */ (function (_super) {
    __extends(BackgroundOverlay, _super);
    function BackgroundOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BackgroundOverlay.prototype.render = function () {
        var background = this.props.background;
        return ((0, jsx_runtime_1.jsx)("div", { className: "lf-background", children: (0, jsx_runtime_1.jsx)("div", { style: (0, lodash_es_1.isObject)(background) ? background : {}, className: "lf-background-area" }) }));
    };
    BackgroundOverlay = __decorate([
        __1.observer
    ], BackgroundOverlay);
    return BackgroundOverlay;
}(compat_1.Component));
exports.BackgroundOverlay = BackgroundOverlay;
exports.default = BackgroundOverlay;
