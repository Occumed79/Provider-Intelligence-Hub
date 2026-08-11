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
import { cloneDeep } from 'lodash-es';
import { computed, observable } from 'mobx';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant';
var CircleNodeModel = /** @class */ (function (_super) {
    __extends(CircleNodeModel, _super);
    function CircleNodeModel(data, graphModel) {
        var _this = _super.call(this, data, graphModel) || this;
        _this.modelType = ModelType.CIRCLE_NODE;
        // @observable properties: ICircleNodeProperties = {}
        _this.r = 50;
        // this.properties = data.properties || {}
        _this.initNodeData(data);
        _this.setAttributes();
        return _this;
    }
    Object.defineProperty(CircleNodeModel.prototype, "width", {
        get: function () {
            return this.r * 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CircleNodeModel.prototype, "height", {
        get: function () {
            return this.r * 2;
        },
        enumerable: false,
        configurable: true
    });
    CircleNodeModel.prototype.setAttributes = function () {
        _super.prototype.setAttributes.call(this);
        var r = this.properties.r;
        if (r) {
            this.r = r;
        }
    };
    CircleNodeModel.prototype.getNodeStyle = function () {
        var style = _super.prototype.getNodeStyle.call(this);
        var circle = this.graphModel.theme.circle;
        var _a = this.properties.style, customStyle = _a === void 0 ? {} : _a;
        return __assign(__assign(__assign({}, style), cloneDeep(circle)), cloneDeep(customStyle));
    };
    CircleNodeModel.prototype.getDefaultAnchor = function () {
        var _a = this, x = _a.x, y = _a.y, r = _a.r;
        return [
            { x: x, y: y - r, id: "".concat(this.id, "_0") },
            { x: x + r, y: y, id: "".concat(this.id, "_1") },
            { x: x, y: y + r, id: "".concat(this.id, "_2") },
            { x: x - r, y: y, id: "".concat(this.id, "_3") },
        ];
    };
    CircleNodeModel.prototype.resize = function (resizeInfo) {
        var width = resizeInfo.width, deltaX = resizeInfo.deltaX, deltaY = resizeInfo.deltaY;
        // 移动节点以及文本内容
        this.move(deltaX / 2, deltaY / 2);
        this.r = width;
        this.setProperties({
            r: width,
        });
        return this.getData();
    };
    __decorate([
        observable
    ], CircleNodeModel.prototype, "r", void 0);
    __decorate([
        computed
    ], CircleNodeModel.prototype, "width", null);
    __decorate([
        computed
    ], CircleNodeModel.prototype, "height", null);
    return CircleNodeModel;
}(BaseNodeModel));
export { CircleNodeModel };
export default CircleNodeModel;
