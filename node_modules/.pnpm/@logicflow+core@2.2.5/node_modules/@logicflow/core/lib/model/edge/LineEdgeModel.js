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
exports.LineEdgeModel = void 0;
var lodash_es_1 = require("lodash-es");
var BaseEdgeModel_1 = __importDefault(require("./BaseEdgeModel"));
var constant_1 = require("../../constant");
var LineEdgeModel = /** @class */ (function (_super) {
    __extends(LineEdgeModel, _super);
    function LineEdgeModel() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.modelType = constant_1.ModelType.LINE_EDGE;
        return _this;
    }
    LineEdgeModel.prototype.getEdgeStyle = function () {
        var line = this.graphModel.theme.line;
        var style = _super.prototype.getEdgeStyle.call(this);
        var _a = this.properties.style, customStyle = _a === void 0 ? {} : _a;
        return __assign(__assign(__assign({}, style), (0, lodash_es_1.cloneDeep)(line)), (0, lodash_es_1.cloneDeep)(customStyle));
    };
    LineEdgeModel.prototype.initEdgeData = function (data) {
        _super.prototype.initEdgeData.call(this, data);
        this.points = this.getPath([this.startPoint, this.endPoint]);
    };
    LineEdgeModel.prototype.getPath = function (points) {
        var _a = __read(points, 2), start = _a[0], end = _a[1];
        return "".concat(start.x, ",").concat(start.y, " ").concat(end.x, ",").concat(end.y);
    };
    LineEdgeModel.prototype.getTextPosition = function () {
        return {
            x: (this.startPoint.x + this.endPoint.x) / 2,
            y: (this.startPoint.y + this.endPoint.y) / 2,
        };
    };
    return LineEdgeModel;
}(BaseEdgeModel_1.default));
exports.LineEdgeModel = LineEdgeModel;
exports.default = LineEdgeModel;
