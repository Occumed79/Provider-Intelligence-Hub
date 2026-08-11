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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiamondNodeModel = void 0;
var lodash_es_1 = require("lodash-es");
var mobx_1 = require("mobx");
var BaseNodeModel_1 = __importDefault(require("./BaseNodeModel"));
var constant_1 = require("../../constant");
var DiamondNodeModel = /** @class */ (function (_super) {
    __extends(DiamondNodeModel, _super);
    // @observable properties: IDiamondNodeProperties = {}
    function DiamondNodeModel(data, graphModel) {
        var _this = _super.call(this, data, graphModel) || this;
        _this.modelType = constant_1.ModelType.DIAMOND_NODE;
        _this.rx = 30;
        _this.ry = 50;
        // this.properties = data.properties || {}
        _this.initNodeData(data);
        _this.setAttributes();
        return _this;
    }
    DiamondNodeModel.prototype.setAttributes = function () {
        _super.prototype.setAttributes.call(this);
        var _a = this.properties, rx = _a.rx, ry = _a.ry;
        if (rx) {
            this.rx = rx;
        }
        if (ry) {
            this.ry = ry;
        }
    };
    DiamondNodeModel.prototype.getNodeStyle = function () {
        var style = _super.prototype.getNodeStyle.call(this);
        var diamond = this.graphModel.theme.diamond;
        var _a = this.properties.style, customStyle = _a === void 0 ? {} : _a;
        return __assign(__assign(__assign({}, style), (0, lodash_es_1.cloneDeep)(diamond)), (0, lodash_es_1.cloneDeep)(customStyle));
    };
    Object.defineProperty(DiamondNodeModel.prototype, "points", {
        get: function () {
            var _a = this, x = _a.x, y = _a.y, rx = _a.rx, ry = _a.ry;
            return [
                [x, y - ry],
                [x + rx, y],
                [x, y + ry],
                [x - rx, y],
            ];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DiamondNodeModel.prototype, "pointsPosition", {
        get: function () {
            return (0, lodash_es_1.map)(this.points, function (_a) {
                var _b = __read(_a, 2), x = _b[0], y = _b[1];
                return ({ x: x, y: y });
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DiamondNodeModel.prototype, "width", {
        get: function () {
            var min = Number.MAX_SAFE_INTEGER;
            var max = Number.MIN_SAFE_INTEGER;
            (0, lodash_es_1.forEach)(this.points, function (_a) {
                var _b = __read(_a, 1), x = _b[0];
                if (x < min) {
                    min = x;
                }
                if (x > max) {
                    max = x;
                }
            });
            return max - min;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DiamondNodeModel.prototype, "height", {
        get: function () {
            var min = Number.MAX_SAFE_INTEGER;
            var max = Number.MIN_SAFE_INTEGER;
            (0, lodash_es_1.forEach)(this.points, function (_a) {
                var _b = __read(_a, 2), y = _b[1];
                if (y < min) {
                    min = y;
                }
                if (y > max) {
                    max = y;
                }
            });
            return max - min;
        },
        enumerable: false,
        configurable: true
    });
    DiamondNodeModel.prototype.getDefaultAnchor = function () {
        var _this = this;
        return (0, lodash_es_1.map)(this.points, function (_a, idx) {
            var _b = __read(_a, 2), x = _b[0], y = _b[1];
            return ({
                x: x,
                y: y,
                id: "".concat(_this.id, "_").concat(idx),
            });
        });
    };
    DiamondNodeModel.prototype.resize = function (resizeInfo) {
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
    ], DiamondNodeModel.prototype, "rx", void 0);
    __decorate([
        mobx_1.observable
    ], DiamondNodeModel.prototype, "ry", void 0);
    __decorate([
        mobx_1.computed
    ], DiamondNodeModel.prototype, "points", null);
    __decorate([
        mobx_1.computed
    ], DiamondNodeModel.prototype, "pointsPosition", null);
    __decorate([
        mobx_1.computed
    ], DiamondNodeModel.prototype, "width", null);
    __decorate([
        mobx_1.computed
    ], DiamondNodeModel.prototype, "height", null);
    return DiamondNodeModel;
}(BaseNodeModel_1.default));
exports.DiamondNodeModel = DiamondNodeModel;
exports.default = DiamondNodeModel;
