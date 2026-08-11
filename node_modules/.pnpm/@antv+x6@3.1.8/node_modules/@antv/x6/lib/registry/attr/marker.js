"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vertexMarker = exports.targetMarker = exports.sourceMarker = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const marker_1 = require("../marker");
function qualify(value) {
    return typeof value === 'string' || common_1.ObjectExt.isPlainObject(value);
}
exports.sourceMarker = {
    qualify,
    set(marker, { view, attrs }) {
        return createMarker('marker-start', marker, view, attrs);
    },
};
exports.targetMarker = {
    qualify,
    set(marker, { view, attrs }) {
        return createMarker('marker-end', marker, view, attrs, {
            transform: 'rotate(180)',
        });
    },
};
exports.vertexMarker = {
    qualify,
    set(marker, { view, attrs }) {
        return createMarker('marker-mid', marker, view, attrs);
    },
};
function createMarker(type, marker, view, attrs, manual = {}) {
    const def = typeof marker === 'string' ? { name: marker } : marker;
    const { name, args } = def, others = tslib_1.__rest(def, ["name", "args"]);
    let preset = others;
    if (name && typeof name === 'string') {
        const fn = marker_1.markerRegistry.get(name);
        if (fn) {
            preset = fn(Object.assign(Object.assign({}, others), args));
        }
        else {
            return marker_1.markerRegistry.onNotFound(name);
        }
    }
    const options = Object.assign(Object.assign(Object.assign({}, normalizeAttr(attrs, type)), manual), preset);
    return {
        [type]: `url(#${view.graph.defineMarker(options)})`,
    };
}
function normalizeAttr(attr, type) {
    const result = {};
    // The context 'fill' is disregared here. The usual case is to use the
    // marker with a connection(for which 'fill' attribute is set to 'none').
    const stroke = attr.stroke;
    if (typeof stroke === 'string') {
        result.stroke = stroke;
        result.fill = stroke;
    }
    if (type !== 'marker-mid') {
        const strokeWidth = parseFloat((attr.strokeWidth || attr['stroke-width']));
        if (Number.isFinite(strokeWidth) && strokeWidth > 1) {
            const offset = Math.ceil(strokeWidth / 2);
            result.refX = type === 'marker-start' ? offset : -offset;
        }
    }
    return result;
}
//# sourceMappingURL=marker.js.map