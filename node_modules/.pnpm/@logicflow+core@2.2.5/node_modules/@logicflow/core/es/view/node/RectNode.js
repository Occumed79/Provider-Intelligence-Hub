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
import { Rect } from '../shape';
var RectNode = /** @class */ (function (_super) {
    __extends(RectNode, _super);
    function RectNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RectNode.prototype.getShape = function () {
        var model = this.props.model;
        var style = model.getNodeStyle();
        return (_jsx(Rect, __assign({}, style, { x: model.x, y: model.y, width: model.width, height: model.height, radius: model.radius })));
    };
    return RectNode;
}(BaseNode));
export { RectNode };
export default RectNode;
