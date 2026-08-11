"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Poly = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const base_1 = require("./base");
const util_1 = require("./util");
class Poly extends base_1.Base {
    get points() {
        return this.getPoints();
    }
    set points(pts) {
        this.setPoints(pts);
    }
    getPoints() {
        return this.getAttrByPath('body/refPoints');
    }
    setPoints(points, options) {
        if (points == null) {
            this.removePoints();
        }
        else {
            this.setAttrByPath('body/refPoints', (0, util_1.pointsToString)(points), options);
        }
        return this;
    }
    removePoints() {
        this.removeAttrByPath('body/refPoints');
        return this;
    }
}
exports.Poly = Poly;
Poly.config({
    propHooks(metadata) {
        const { points } = metadata, others = tslib_1.__rest(metadata, ["points"]);
        if (points) {
            const data = (0, util_1.pointsToString)(points);
            if (data) {
                common_1.ObjectExt.setByPath(others, 'attrs/body/refPoints', data);
            }
        }
        return others;
    },
});
//# sourceMappingURL=poly.js.map