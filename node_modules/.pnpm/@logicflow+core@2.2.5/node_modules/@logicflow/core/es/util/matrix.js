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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Vector, Point } from './vector';
var Matrix = /** @class */ (function (_super) {
    __extends(Matrix, _super);
    function Matrix() {
        var vectors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vectors[_i] = arguments[_i];
        }
        var _this = _super.call(this, vectors.length) || this;
        _this.fill(new Array(3));
        vectors.forEach(function (v, index) {
            _this[index] = v;
        });
        _this.columns = vectors[0].length;
        _this.rows = vectors.length;
        Object.setPrototypeOf(_this, Matrix.prototype);
        return _this;
    }
    Matrix.prototype.getRow = function (index) {
        return this[index];
    };
    Matrix.prototype.getColumn = function (index) {
        return __spreadArray([], __read(this.map(function (row) { return row[index]; })), false);
    };
    // 转置
    Matrix.prototype.transpose = function () {
        var vectors = [];
        for (var i = 0; i < this.columns; i++) {
            vectors.push(this.getColumn(i));
        }
        return new (Matrix.bind.apply(Matrix, __spreadArray([void 0], __read(vectors), false)))();
    };
    // 叉乘
    Matrix.prototype.cross = function (m1) {
        var arr = new Array(this.rows).fill('').map(function () { return []; });
        if (this.columns === m1.rows) {
            for (var i = 0; i < this.rows; i++) {
                var row = this.getRow(i);
                var _loop_1 = function (j) {
                    var column = m1.getColumn(j);
                    // eslint-disable-next-line max-len
                    arr[i][j] = row.reduce(function (prev, r, index) {
                        return prev + r * column[index];
                    }, 0);
                };
                for (var j = 0; j < m1.columns; j++) {
                    _loop_1(j);
                }
            }
        }
        return new (Matrix.bind.apply(Matrix, __spreadArray([void 0], __read(arr), false)))();
    };
    // 返回二维坐标（降维）
    Matrix.prototype.to2D = function () {
        return this.map(function (item) { return [item[0], item[1]]; });
    };
    Matrix.prototype.toPoints = function () {
        return this.map(function (item) { return new Point(item[0], item[1]); });
    };
    Matrix.prototype.toString = function () {
        var _a = __read(this[0], 2), a = _a[0], b = _a[1];
        var _b = __read(this[1], 2), c = _b[0], d = _b[1];
        var _c = __read(this[2], 2), e = _c[0], f = _c[1];
        return "matrix(".concat(a, " ").concat(b, " ").concat(c, " ").concat(d, " ").concat(e, " ").concat(f, ")");
    };
    Matrix.prototype.translate = function (tx, ty) {
        return this.cross(new TranslateMatrix(tx, ty));
    };
    Matrix.prototype.rotate = function (angle) {
        return this.cross(new RotateMatrix(angle));
    };
    Matrix.prototype.scale = function (sx, sy) {
        return this.cross(new ScaleMatrix(sx, sy));
    };
    return Matrix;
}(Array));
export { Matrix };
var RotateMatrix = /** @class */ (function (_super) {
    __extends(RotateMatrix, _super);
    function RotateMatrix(theta) {
        var _this = _super.call(this, new Vector(+Math.cos(theta).toFixed(2), +Math.sin(theta).toFixed(2), 0), new Vector(-Math.sin(theta).toFixed(2), +Math.cos(theta).toFixed(2), 0), new Vector(0, 0, 1)) || this;
        Object.setPrototypeOf(_this, RotateMatrix.prototype);
        return _this;
    }
    RotateMatrix.prototype.inverse = function () {
        return this.transpose();
    };
    return RotateMatrix;
}(Matrix));
export { RotateMatrix };
var ScaleMatrix = /** @class */ (function (_super) {
    __extends(ScaleMatrix, _super);
    function ScaleMatrix(sx, sy) {
        var _this = _super.call(this, new Vector(sx, 0, 0), new Vector(0, sy, 0), new Vector(0, 0, 1)) || this;
        _this.sx = sx;
        _this.sy = sy;
        Object.setPrototypeOf(_this, ScaleMatrix.prototype);
        return _this;
    }
    ScaleMatrix.prototype.inverse = function () {
        return new ScaleMatrix(1 / this.sx, 1 / this.sy);
    };
    return ScaleMatrix;
}(Matrix));
export { ScaleMatrix };
var TranslateMatrix = /** @class */ (function (_super) {
    __extends(TranslateMatrix, _super);
    function TranslateMatrix(tx, ty) {
        var _this = _super.call(this, new Vector(1, 0, 0), new Vector(0, 1, 0), new Vector(tx, ty, 1)) || this;
        _this.tx = tx;
        _this.ty = ty;
        Object.setPrototypeOf(_this, TranslateMatrix.prototype);
        return _this;
    }
    TranslateMatrix.prototype.inverse = function () {
        return new TranslateMatrix(-this.tx, -this.ty);
    };
    return TranslateMatrix;
}(Matrix));
export { TranslateMatrix };
