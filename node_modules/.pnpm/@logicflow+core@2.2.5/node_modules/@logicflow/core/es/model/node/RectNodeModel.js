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
import { cloneDeep, isNil } from 'lodash-es';
import { observable } from 'mobx';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant';
var RectNodeModel = /** @class */ (function (_super) {
    __extends(RectNodeModel, _super);
    // @observable properties: P
    function RectNodeModel(data, graphModel) {
        var _this = _super.call(this, data, graphModel) || this;
        _this.modelType = ModelType.RECT_NODE;
        _this.radius = 0;
        // TODO：类字段初始化会覆盖 super、setAttributes 中设置的属性
        // this.properties = data.properties || {}
        // TODO: bug here, 上面更新 properties 会触发 setAttributes，下面再主动调用，会导致触发两次
        _this.initNodeData(data);
        _this.setAttributes();
        return _this;
    }
    RectNodeModel.prototype.setAttributes = function () {
        _super.prototype.setAttributes.call(this);
        var _a = this.properties, width = _a.width, height = _a.height, radius = _a.radius;
        var styleRadius = this.getNodeStyle().radius;
        if (!isNil(width))
            this.width = width;
        if (!isNil(height))
            this.height = height;
        // 矩形特有
        if (!isNil(radius))
            this.radius = radius;
        if (!isNil(styleRadius))
            this.radius = styleRadius;
    };
    RectNodeModel.prototype.getDefaultAnchor = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        return [
            { x: x, y: y - height / 2, id: "".concat(this.id, "_0") },
            { x: x + width / 2, y: y, id: "".concat(this.id, "_1") },
            { x: x, y: y + height / 2, id: "".concat(this.id, "_2") },
            { x: x - width / 2, y: y, id: "".concat(this.id, "_3") },
        ];
    };
    RectNodeModel.prototype.getNodeStyle = function () {
        var style = _super.prototype.getNodeStyle.call(this);
        var rect = this.graphModel.theme.rect;
        var _a = this.properties.style, customStyle = _a === void 0 ? {} : _a;
        return __assign(__assign(__assign({}, style), cloneDeep(rect)), cloneDeep(customStyle));
    };
    __decorate([
        observable
    ], RectNodeModel.prototype, "radius", void 0);
    return RectNodeModel;
}(BaseNodeModel));
export { RectNodeModel };
export default RectNodeModel;
