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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextNodeModel = void 0;
var lodash_es_1 = require("lodash-es");
var mobx_1 = require("mobx");
var BaseNodeModel_1 = __importDefault(require("./BaseNodeModel"));
var constant_1 = require("../../constant");
var util_1 = require("../../util");
var TextNodeModel = /** @class */ (function (_super) {
    __extends(TextNodeModel, _super);
    function TextNodeModel() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.modelType = constant_1.ModelType.TEXT_NODE;
        return _this;
    }
    TextNodeModel.prototype.getTextStyle = function () {
        var style = _super.prototype.getTextStyle.call(this);
        var text = this.graphModel.theme.text;
        var textStyle = this.properties.textStyle;
        return __assign(__assign(__assign({}, style), (0, lodash_es_1.cloneDeep)(text)), (0, lodash_es_1.cloneDeep)(textStyle));
    };
    Object.defineProperty(TextNodeModel.prototype, "width", {
        get: function () {
            var rows = String(this.text.value).split(/[\r\n]/g);
            var fontSize = this.getTextStyle().fontSize;
            var width = (0, util_1.getSvgTextWidthHeight)({
                rows: rows,
                fontSize: fontSize,
                rowsLength: rows.length,
            }).width;
            return width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextNodeModel.prototype, "height", {
        get: function () {
            var rows = String(this.text.value).split(/[\r\n]/g);
            var fontSize = this.getTextStyle().fontSize;
            var height = (0, util_1.getSvgTextWidthHeight)({
                rows: rows,
                fontSize: fontSize,
                rowsLength: rows.length,
            }).height;
            return height;
        },
        enumerable: false,
        configurable: true
    });
    __decorate([
        mobx_1.computed
    ], TextNodeModel.prototype, "width", null);
    __decorate([
        mobx_1.computed
    ], TextNodeModel.prototype, "height", null);
    return TextNodeModel;
}(BaseNodeModel_1.default));
exports.TextNodeModel = TextNodeModel;
exports.default = TextNodeModel;
