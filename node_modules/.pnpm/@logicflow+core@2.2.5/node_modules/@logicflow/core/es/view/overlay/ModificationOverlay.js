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
import { jsx as _jsx } from "preact/jsx-runtime";
import { Component } from 'preact/compat';
import { observer } from '../..';
var ModificationOverlay = /** @class */ (function (_super) {
    __extends(ModificationOverlay, _super);
    function ModificationOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ModificationOverlay.prototype.render = function () {
        var transformModel = this.props.graphModel.transformModel;
        var transform = transformModel.getTransformStyle().transform;
        var children = this.props.children;
        return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: "100%", height: "100%", className: "modification-overlay", children: _jsx("g", { transform: transform, children: children }) }));
    };
    ModificationOverlay = __decorate([
        observer
    ], ModificationOverlay);
    return ModificationOverlay;
}(Component));
export { ModificationOverlay };
export default ModificationOverlay;
