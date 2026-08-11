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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiamondNode = void 0;
var jsx_runtime_1 = require("preact/jsx-runtime");
var BaseNode_1 = __importDefault(require("./BaseNode"));
var Polygon_1 = __importDefault(require("../shape/Polygon"));
var DiamondNode = /** @class */ (function (_super) {
    __extends(DiamondNode, _super);
    function DiamondNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DiamondNode.prototype.getShape = function () {
        var model = this.props.model;
        var style = model.getNodeStyle();
        return ((0, jsx_runtime_1.jsx)("g", { children: (0, jsx_runtime_1.jsx)(Polygon_1.default, __assign({}, style, { points: model.points, x: model.x, y: model.y })) }));
    };
    return DiamondNode;
}(BaseNode_1.default));
exports.DiamondNode = DiamondNode;
exports.default = DiamondNode;
