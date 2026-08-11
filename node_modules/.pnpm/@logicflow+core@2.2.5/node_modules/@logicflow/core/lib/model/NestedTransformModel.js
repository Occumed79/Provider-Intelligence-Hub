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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedTransformModel = void 0;
var TransformModel_1 = require("./TransformModel");
var NestedTransformModel = /** @class */ (function (_super) {
    __extends(NestedTransformModel, _super);
    function NestedTransformModel(eventCenter, options) {
        var _this = _super.call(this, eventCenter, options) || this;
        _this.parentTransform = options.parentTransform;
        return _this;
    }
    /**
     * 设置父级变换
     * @param parentTransform 父级变换模型
     */
    NestedTransformModel.prototype.setParentTransform = function (parentTransform) {
        this.parentTransform = parentTransform;
    };
    /**
     * 获取累积的缩放值
     * 计算包括所有父级的累积缩放
     */
    NestedTransformModel.prototype.getCumulativeScale = function () {
        var scaleX = this.SCALE_X;
        var scaleY = this.SCALE_Y;
        if (this.parentTransform) {
            if (this.parentTransform instanceof NestedTransformModel) {
                var parentScale = this.parentTransform.getCumulativeScale();
                scaleX *= parentScale.scaleX;
                scaleY *= parentScale.scaleY;
            }
            else {
                scaleX *= this.parentTransform.SCALE_X;
                scaleY *= this.parentTransform.SCALE_Y;
            }
        }
        return { scaleX: scaleX, scaleY: scaleY };
    };
    /**
     * 获取累积的平移值
     * 计算包括所有父级的累积平移
     */
    NestedTransformModel.prototype.getCumulativeTranslate = function () {
        var translateX = this.TRANSLATE_X;
        var translateY = this.TRANSLATE_Y;
        if (this.parentTransform &&
            this.parentTransform instanceof NestedTransformModel) {
            var _a = this.parentTransform.getCumulativeScale(), scaleX = _a.scaleX, scaleY = _a.scaleY;
            translateX = scaleX * translateX;
            translateY = scaleY * translateY;
        }
        return { translateX: translateX, translateY: translateY };
    };
    /**
     * 将最外层graph上的点基于缩放转换为canvasOverlay层上的点。
     * 重写以支持嵌套变换
     * @param point HTML点
     */
    NestedTransformModel.prototype.HtmlPointToCanvasPoint = function (point) {
        var _a = __read(point, 2), x = _a[0], y = _a[1];
        var _b = this.getCumulativeScale(), scaleX = _b.scaleX, scaleY = _b.scaleY;
        var _c = this.getCumulativeTranslate(), translateX = _c.translateX, translateY = _c.translateY;
        return [(x - translateX) / scaleX, (y - translateY) / scaleY];
    };
    /**
     * 将最外层canvasOverlay层上的点基于缩放转换为graph上的点。
     * 重写以支持嵌套变换
     * @param point Canvas点
     */
    NestedTransformModel.prototype.CanvasPointToHtmlPoint = function (point) {
        var _a = __read(point, 2), x = _a[0], y = _a[1];
        var _b = this.getCumulativeScale(), scaleX = _b.scaleX, scaleY = _b.scaleY;
        var _c = this.getCumulativeTranslate(), translateX = _c.translateX, translateY = _c.translateY;
        return [x * scaleX + translateX, y * scaleY + translateY];
    };
    /**
     * 将一个在canvas上的点，向x轴方向移动directionX距离，向y轴方向移动directionY距离。
     * 重写以支持嵌套变换
     * @param point 点
     * @param directionX x轴距离
     * @param directionY y轴距离
     */
    NestedTransformModel.prototype.moveCanvasPointByHtml = function (point, directionX, directionY) {
        var _a = __read(point, 2), x = _a[0], y = _a[1];
        var _b = this.getCumulativeScale(), scaleX = _b.scaleX, scaleY = _b.scaleY;
        return [x + directionX / scaleX, y + directionY / scaleY];
    };
    /**
     * 根据缩放情况，获取缩放后的delta距离
     * 重写以支持嵌套变换
     * @param deltaX x轴距离变化
     * @param deltaY y轴距离变化
     */
    NestedTransformModel.prototype.fixDeltaXY = function (deltaX, deltaY) {
        var _a = this.getCumulativeScale(), scaleX = _a.scaleX, scaleY = _a.scaleY;
        return [deltaX / scaleX, deltaY / scaleY];
    };
    return NestedTransformModel;
}(TransformModel_1.TransformModel));
exports.NestedTransformModel = NestedTransformModel;
exports.default = NestedTransformModel;
