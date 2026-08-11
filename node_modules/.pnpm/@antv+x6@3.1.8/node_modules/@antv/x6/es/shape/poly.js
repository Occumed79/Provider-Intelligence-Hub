import { __rest } from "tslib";
import { ObjectExt } from '../common';
import { Base } from './base';
import { pointsToString } from './util';
export class Poly extends Base {
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
            this.setAttrByPath('body/refPoints', pointsToString(points), options);
        }
        return this;
    }
    removePoints() {
        this.removeAttrByPath('body/refPoints');
        return this;
    }
}
Poly.config({
    propHooks(metadata) {
        const { points } = metadata, others = __rest(metadata, ["points"]);
        if (points) {
            const data = pointsToString(points);
            if (data) {
                ObjectExt.setByPath(others, 'attrs/body/refPoints', data);
            }
        }
        return others;
    },
});
//# sourceMappingURL=poly.js.map