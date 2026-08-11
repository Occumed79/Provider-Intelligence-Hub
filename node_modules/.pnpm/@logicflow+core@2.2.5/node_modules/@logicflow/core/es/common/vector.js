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
function isVector(a1, a2) {
    return a1 instanceof Vector && a2 instanceof Vector;
}
var Base = /** @class */ (function (_super) {
    __extends(Base, _super);
    function Base(x, y, z) {
        var _this = _super.call(this, 3) || this;
        _this[0] = x;
        _this[1] = y;
        _this[2] = z;
        _this.x = x;
        _this.y = y;
        _this.z = z;
        Object.setPrototypeOf(_this, Base.prototype);
        return _this;
    }
    Base.prototype.add = function (v1) {
        if (isVector(this, v1)) {
            return new Vector(this.x + v1.x, this.y + v1.y);
        }
        var z = this.z + v1.z;
        return new Point((this.x + v1.x) / z, (this.y + v1.y) / z);
    };
    Base.prototype.subtract = function (v1) {
        if (isVector(this, v1)) {
            return new Vector(this.x - v1.x, this.y - v1.y);
        }
        var z = this.z - v1.z;
        return z === 0
            ? new Vector(this.x - v1.x, this.y - v1.y)
            : new Point((this.x - v1.x) / z, (this.y - v1.y) / z);
    };
    return Base;
}(Array));
var Vector = /** @class */ (function (_super) {
    __extends(Vector, _super);
    function Vector(x, y, z) {
        var _this = _super.call(this, x, y, z !== null && z !== void 0 ? z : 0) || this;
        Object.setPrototypeOf(_this, Vector.prototype);
        return _this;
    }
    Vector.prototype.toString = function () {
        return 'Vector';
    };
    Vector.prototype.dot = function (v1) {
        var _this = this;
        return v1.reduce(function (prev, cur, index) { return prev + cur * _this[index]; });
    };
    Vector.prototype.cross = function (v1) {
        return new Vector(this.y * v1.z - this.z * v1.y, this.z * v1.x - this.x * v1.z, this.x * v1.y - this.y * v1.x);
    };
    Vector.prototype.getLength = function () {
        return Math.hypot(this.x, this.y);
    };
    Vector.prototype.normalize = function () {
        var len = this.getLength();
        return new Vector(this.x / len, this.y / len);
    };
    Vector.prototype.crossZ = function (v1) {
        return this.x * v1.y - this.y * v1.x;
    };
    Vector.prototype.angle = function (v1) {
        var negative = this.crossZ(v1);
        var r = Math.acos(this.normalize().dot(v1.normalize()));
        return negative >= 0 ? r : -r;
    };
    return Vector;
}(Base));
var Point = /** @class */ (function (_super) {
    __extends(Point, _super);
    function Point(x, y) {
        var _this = _super.call(this, x, y, 1) || this;
        Object.setPrototypeOf(_this, Point.prototype);
        return _this;
    }
    Point.prototype.toString = function () {
        return 'Point';
    };
    return Point;
}(Base));
export { Vector, Point };
