"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measure = measure;
exports.setMillimeterSize = setMillimeterSize;
exports.getMillimeterSize = getMillimeterSize;
exports.toPx = toPx;
let millimeterSize;
const supportedUnits = {
    px(val) {
        return val;
    },
    mm(val) {
        return millimeterSize * val;
    },
    cm(val) {
        return millimeterSize * val * 10;
    },
    in(val) {
        return millimeterSize * val * 25.4;
    },
    pt(val) {
        return millimeterSize * ((25.4 * val) / 72);
    },
    pc(val) {
        return millimeterSize * ((25.4 * val) / 6);
    },
};
function measure(cssWidth, cssHeight, unit) {
    const div = document.createElement('div');
    const style = div.style;
    style.display = 'inline-block';
    style.position = 'absolute';
    style.left = '-15000px';
    style.top = '-15000px';
    style.width = cssWidth + (unit || 'px');
    style.height = cssHeight + (unit || 'px');
    document.body.appendChild(div);
    const rect = div.getBoundingClientRect();
    const size = {
        width: rect.width || 0,
        height: rect.height || 0,
    };
    document.body.removeChild(div);
    return size;
}
function setMillimeterSize(pxPerMm) {
    millimeterSize = pxPerMm;
}
function getMillimeterSize() {
    return millimeterSize;
}
function toPx(val, unit) {
    if (millimeterSize == null) {
        if (typeof document === 'undefined' || !document.body) {
            // Node / 测试环境
            millimeterSize = 3.7795275591; // 1mm ≈ 3.78px
        }
        else {
            millimeterSize = measure('1', '1', 'mm').width;
        }
    }
    const convert = unit ? supportedUnits[unit] : null;
    if (convert) {
        return convert(val);
    }
    return val;
}
//# sourceMappingURL=index.js.map