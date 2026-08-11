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
import Rect from '../shape/Rect';
import BaseNode from './BaseNode';
var TextNode = /** @class */ (function (_super) {
    __extends(TextNode, _super);
    function TextNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextNode.prototype.getBackground = function () {
        var model = this.props.model;
        var style = model.getTextStyle();
        // 背景框宽度，最长一行字节数/2 * fontsize + 2
        // 背景框宽度， 行数 * fontsize + 2
        // FIX: #1067
        var width = model.width, height = model.height, x = model.x, y = model.y;
        var rectAttr = __assign(__assign({}, style.background), { x: x, y: y, width: width, height: height });
        return _jsx(Rect, __assign({}, rectAttr));
    };
    TextNode.prototype.getResizeControl = function () {
        return null;
    };
    TextNode.prototype.getShape = function () {
        return _jsx("g", { children: this.getBackground() });
    };
    return TextNode;
}(BaseNode));
export { TextNode };
export default TextNode;
