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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EllipseNodeModel = void 0;
var lodash_es_1 = require("lodash-es");
var mobx_1 = require("mobx");
var BaseNodeModel_1 = __importDefault(require("./BaseNodeModel"));
var constant_1 = require("../../constant");
var EllipseNodeModel = /** @class */ (function (_super) {
    __extends(EllipseNodeModel, _super);
    // @observable properties: IEllipseNodeProperties = {}
    function EllipseNodeModel(data, graphModel) {
        var _this = _super.call(this, data, graphModel) || this;
        _this.modelType = constant_1.ModelType.ELLIPSE_NODE;
        _this.rx = 30;
        _this.ry = 45;
        // this.properties = data.properties || {}
        _this.initNodeData(data);
        _this.setAttributes();
        return _this;
    }
    EllipseNodeModel.prototype.setAttributes = function () {
        _super.prototype.setAttributes.call(this);
        var _a = this.properties, rx = _a.rx, ry = _a.ry;
        if (rx) {
            this.rx = rx;
        }
        if (ry) {
            this.ry = ry;
        }
    };
    EllipseNodeModel.prototype.getNodeStyle = function () {
        var style = _super.prototype.getNodeStyle.call(this);
        var ellipse = this.graphModel.theme.ellipse;
        var _a = this.properties.style, customStyle = _a === void 0 ? {} : _a;
        return __assign(__assign(__assign({}, style), (0, lodash_es_1.cloneDeep)(ellipse)), (0, lodash_es_1.cloneDeep)(customStyle));
    };
    Object.defineProperty(EllipseNodeModel.prototype, "width", {
        get: function () {
            return this.rx * 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EllipseNodeModel.prototype, "height", {
        get: function () {
            return this.ry * 2;
        },
        enumerable: false,
        configurable: true
    });
    EllipseNodeModel.prototype.getDefaultAnchor = function () {
        var _a = this, x = _a.x, y = _a.y, rx = _a.rx, ry = _a.ry;
        return [
            { x: x, y: y - ry, id: "".concat(this.id, "_0") },
            { x: x + rx, y: y, id: "".concat(this.id, "_1") },
            { x: x, y: y + ry, id: "".concat(this.id, "_2") },
            { x: x - rx, y: y, id: "".concat(this.id, "_3") },
        ];
    };
    EllipseNodeModel.prototype.resize = function (resizeInfo) {
        var width = resizeInfo.width, height = resizeInfo.height, deltaX = resizeInfo.deltaX, deltaY = resizeInfo.deltaY;
        // 移动节点以及文本内容
        this.move(deltaX / 2, deltaY / 2);
        this.rx = width;
        this.ry = height;
        this.setProperties({
            rx: width,
            ry: height,
        });
        return this.getData();
    };
    __decorate([
        mobx_1.observable
    ], EllipseNodeModel.prototype, "rx", void 0);
    __decorate([
        mobx_1.observable
    ], EllipseNodeModel.prototype, "ry", void 0);
    __decorate([
        mobx_1.computed
    ], EllipseNodeModel.prototype, "width", null);
    __decorate([
        mobx_1.computed
    ], EllipseNodeModel.prototype, "height", null);
    return EllipseNodeModel;
}(BaseNodeModel_1.default));
exports.EllipseNodeModel = EllipseNodeModel;
exports.default = EllipseNodeModel;
