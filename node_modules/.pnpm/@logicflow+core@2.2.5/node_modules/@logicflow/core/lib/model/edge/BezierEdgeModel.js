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
exports.BezierEdgeModel = void 0;
var lodash_es_1 = require("lodash-es");
var mobx_1 = require("mobx");
var BaseEdgeModel_1 = __importDefault(require("./BaseEdgeModel"));
var constant_1 = require("../../constant");
var util_1 = require("../../util");
var BezierEdgeModel = /** @class */ (function (_super) {
    __extends(BezierEdgeModel, _super);
    function BezierEdgeModel(data, graphModel) {
        var _this = _super.call(this, data, graphModel) || this;
        _this.modelType = constant_1.ModelType.BEZIER_EDGE;
        _this.path = '';
        _this.initEdgeData(data);
        _this.setAttributes();
        return _this;
    }
    BezierEdgeModel.prototype.initEdgeData = function (data) {
        this.offset = (0, lodash_es_1.get)(data, 'properties.offset', 100);
        _super.prototype.initEdgeData.call(this, data);
    };
    BezierEdgeModel.prototype.getEdgeStyle = function () {
        var bezier = this.graphModel.theme.bezier;
        var style = _super.prototype.getEdgeStyle.call(this);
        var _a = this.properties.style, customStyle = _a === void 0 ? {} : _a;
        return __assign(__assign(__assign({}, style), (0, lodash_es_1.cloneDeep)(bezier)), (0, lodash_es_1.cloneDeep)(customStyle));
    };
    BezierEdgeModel.prototype.getTextPosition = function () {
        if (this.pointsList && this.pointsList.length > 0) {
            var pointsXSum_1 = 0;
            var pointsYSum_1 = 0;
            this.pointsList.forEach(function (_a) {
                var x = _a.x, y = _a.y;
                pointsXSum_1 += x;
                pointsYSum_1 += y;
            });
            return {
                x: pointsXSum_1 / this.pointsList.length,
                y: pointsYSum_1 / this.pointsList.length,
            };
        }
        return {
            x: (this.startPoint.x + this.endPoint.x) / 2,
            y: (this.startPoint.y + this.endPoint.y) / 2,
        };
    };
    BezierEdgeModel.prototype.getData = function () {
        var data = _super.prototype.getData.call(this);
        var pointsList = this.pointsList.map(function (_a) {
            var x = _a.x, y = _a.y;
            return ({ x: x, y: y });
        });
        return __assign(__assign({}, data), { pointsList: pointsList });
    };
    /* 获取贝塞尔曲线的控制点 */
    BezierEdgeModel.prototype.getControls = function () {
        var start = this.startPoint;
        var end = this.endPoint;
        var points = (0, util_1.getBezierControlPoints)({
            start: start,
            end: end,
            sourceNode: this.sourceNode,
            targetNode: this.targetNode,
            offset: this.offset,
        });
        return points;
    };
    /* 获取贝塞尔曲线的path */
    BezierEdgeModel.prototype.getPath = function (points) {
        var _a = __read(points, 4), start = _a[0], sNext = _a[1], ePre = _a[2], end = _a[3];
        return "M ".concat(start.x, " ").concat(start.y, "\n    C ").concat(sNext.x, " ").concat(sNext.y, ",\n    ").concat(ePre.x, " ").concat(ePre.y, ",\n    ").concat(end.x, " ").concat(end.y);
    };
    BezierEdgeModel.prototype.initPoints = function () {
        if (this.pointsList.length > 0) {
            this.path = this.getPath(this.pointsList);
        }
        else {
            this.updatePoints();
        }
    };
    BezierEdgeModel.prototype.updatePoints = function () {
        var _a = this.getControls(), sNext = _a.sNext, ePre = _a.ePre;
        this.updatePath(sNext, ePre);
    };
    BezierEdgeModel.prototype.updatePath = function (sNext, ePre) {
        sNext = (0, lodash_es_1.cloneDeep)(sNext);
        ePre = (0, lodash_es_1.cloneDeep)(ePre);
        var start = {
            x: this.startPoint.x,
            y: this.startPoint.y,
        };
        var end = {
            x: this.endPoint.x,
            y: this.endPoint.y,
        };
        if (!sNext || !ePre) {
            var control = this.getControls();
            sNext = control.sNext;
            ePre = control.ePre;
        }
        this.pointsList = [start, sNext, ePre, end];
        this.path = this.getPath(this.pointsList);
    };
    BezierEdgeModel.prototype.updateStartPoint = function (anchor) {
        this.startPoint = Object.assign({}, anchor);
        this.updatePoints();
    };
    BezierEdgeModel.prototype.updateEndPoint = function (anchor) {
        this.endPoint = Object.assign({}, anchor);
        this.updatePoints();
    };
    BezierEdgeModel.prototype.moveStartPoint = function (deltaX, deltaY) {
        this.startPoint.x += deltaX;
        this.startPoint.y += deltaY;
        var _a = __read(this.pointsList, 3), sNext = _a[1], ePre = _a[2];
        // 保持调整点一起移动
        sNext.x += deltaX;
        sNext.y += deltaY;
        this.updatePath(sNext, ePre);
    };
    BezierEdgeModel.prototype.moveEndPoint = function (deltaX, deltaY) {
        this.endPoint.x += deltaX;
        this.endPoint.y += deltaY;
        var _a = __read(this.pointsList, 3), sNext = _a[1], ePre = _a[2];
        // 保持调整点一起移动
        ePre.x += deltaX;
        ePre.y += deltaY;
        this.updatePath(sNext, ePre);
    };
    BezierEdgeModel.prototype.updateAdjustAnchor = function (anchor, type) {
        var _a;
        if (type === 'sNext') {
            this.pointsList[1] = anchor;
        }
        else if (type === 'ePre') {
            this.pointsList[2] = anchor;
        }
        this.path = this.getPath(this.pointsList);
        if ((_a = this.text) === null || _a === void 0 ? void 0 : _a.value) {
            this.setText((0, lodash_es_1.assign)({}, this.text, this.textPosition));
        }
    };
    // 获取边调整的起点
    BezierEdgeModel.prototype.getAdjustStart = function () {
        return this.pointsList[0] || this.startPoint;
    };
    // 获取边调整的终点
    BezierEdgeModel.prototype.getAdjustEnd = function () {
        var pointsList = this.pointsList;
        return pointsList[pointsList.length - 1] || this.endPoint;
    };
    // 起终点拖拽调整过程中，进行曲线路径更新
    BezierEdgeModel.prototype.updateAfterAdjustStartAndEnd = function (_a) {
        var startPoint = _a.startPoint, endPoint = _a.endPoint, sourceNode = _a.sourceNode, targetNode = _a.targetNode;
        var _b = (0, util_1.getBezierControlPoints)({
            start: startPoint,
            end: endPoint,
            sourceNode: sourceNode,
            targetNode: targetNode,
            offset: this.offset,
        }), sNext = _b.sNext, ePre = _b.ePre;
        this.pointsList = [startPoint, sNext, ePre, endPoint];
        this.initPoints();
    };
    __decorate([
        mobx_1.observable
    ], BezierEdgeModel.prototype, "offset", void 0);
    __decorate([
        mobx_1.observable
    ], BezierEdgeModel.prototype, "path", void 0);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "initPoints", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "updatePoints", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "updateStartPoint", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "updateEndPoint", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "moveStartPoint", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "moveEndPoint", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "updateAdjustAnchor", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "getAdjustStart", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "getAdjustEnd", null);
    __decorate([
        mobx_1.action
    ], BezierEdgeModel.prototype, "updateAfterAdjustStartAndEnd", null);
    return BezierEdgeModel;
}(BaseEdgeModel_1.default));
exports.BezierEdgeModel = BezierEdgeModel;
exports.default = BezierEdgeModel;
