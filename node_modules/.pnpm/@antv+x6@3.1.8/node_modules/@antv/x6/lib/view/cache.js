"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const common_1 = require("../common");
/**
 * 一个 element 的缓存类
 */
class Cache {
    constructor(view) {
        this.view = view;
        this.clean();
    }
    clean() {
        if (this.elemCache) {
            this.elemCache.dispose();
        }
        this.elemCache = new common_1.Dictionary();
        this.pathCache = {};
    }
    get(elem) {
        const cache = this.elemCache;
        if (!cache.has(elem)) {
            this.elemCache.set(elem, {});
        }
        return this.elemCache.get(elem);
    }
    getData(elem) {
        const meta = this.get(elem);
        if (!meta.data) {
            meta.data = {};
        }
        return meta.data;
    }
    getMatrix(elem) {
        const meta = this.get(elem);
        if (meta.matrix == null) {
            const target = this.view.container;
            meta.matrix = common_1.Dom.getTransformToParentElement(elem, target);
        }
        return common_1.Dom.createSVGMatrix(meta.matrix);
    }
    getShape(elem) {
        const meta = this.get(elem);
        if (meta.shape == null) {
            meta.shape = common_1.Util.toGeometryShape(elem);
        }
        return meta.shape.clone();
    }
    getBoundingRect(elem) {
        const meta = this.get(elem);
        if (meta.boundingRect == null) {
            meta.boundingRect = common_1.Util.getBBoxV2(elem);
        }
        return meta.boundingRect.clone();
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map