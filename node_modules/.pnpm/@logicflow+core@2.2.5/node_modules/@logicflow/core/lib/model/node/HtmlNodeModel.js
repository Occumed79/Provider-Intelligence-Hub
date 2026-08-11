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
exports.HtmlNodeModel = void 0;
var lodash_es_1 = require("lodash-es");
var BaseNodeModel_1 = __importDefault(require("./BaseNodeModel"));
var constant_1 = require("../../constant");
var HtmlNodeModel = /** @class */ (function (_super) {
    __extends(HtmlNodeModel, _super);
    // @observable properties: IHtmlNodeProperties = {}
    function HtmlNodeModel(data, graphModel) {
        var _this = _super.call(this, data, graphModel) || this;
        _this.modelType = constant_1.ModelType.HTML_NODE;
        // this.properties = data.properties || {}
        _this.setAttributes();
        return _this;
    }
    HtmlNodeModel.prototype.setAttributes = function () {
        _super.prototype.setAttributes.call(this);
        var _a = this.properties, width = _a.width, height = _a.height;
        if (width)
            this.width = width;
        if (height)
            this.height = height;
    };
    HtmlNodeModel.prototype.getDefaultAnchor = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        return [
            { x: x, y: y - height / 2, id: "".concat(this.id, "_0") },
            { x: x + width / 2, y: y, id: "".concat(this.id, "_1") },
            { x: x, y: y + height / 2, id: "".concat(this.id, "_2") },
            { x: x - width / 2, y: y, id: "".concat(this.id, "_3") },
        ];
    };
    HtmlNodeModel.prototype.getNodeStyle = function () {
        var style = _super.prototype.getNodeStyle.call(this);
        var _a = this.graphModel.theme, baseNode = _a.baseNode, html = _a.html;
        var _b = this.properties.style, customStyle = _b === void 0 ? {} : _b;
        var finalStyle = __assign(__assign(__assign(__assign({}, style), (0, lodash_es_1.cloneDeep)(baseNode)), (0, lodash_es_1.cloneDeep)(html)), (0, lodash_es_1.cloneDeep)(customStyle));
        return finalStyle;
    };
    return HtmlNodeModel;
}(BaseNodeModel_1.default));
exports.HtmlNodeModel = HtmlNodeModel;
exports.default = HtmlNodeModel;
