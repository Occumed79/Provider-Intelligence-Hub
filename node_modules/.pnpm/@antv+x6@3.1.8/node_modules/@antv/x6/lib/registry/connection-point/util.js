"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offset = offset;
exports.getStrokeWidth = getStrokeWidth;
exports.findShapeNode = findShapeNode;
const geometry_1 = require("../../geometry");
function offset(p1, p2, offset) {
    let tx;
    if (typeof offset === 'object') {
        if (Number.isFinite(offset.y)) {
            const line = new geometry_1.Line(p2, p1);
            const { start, end } = line.parallel(offset.y);
            p2 = start; // eslint-disable-line
            p1 = end; // eslint-disable-line
        }
        tx = offset.x;
    }
    else {
        tx = offset;
    }
    if (tx == null || !Number.isFinite(tx)) {
        return p1;
    }
    const length = p1.distance(p2);
    if (tx === 0 && length > 0) {
        return p1;
    }
    return p1.move(p2, -Math.min(tx, length - 1));
}
function getStrokeWidth(magnet) {
    const stroke = magnet.getAttribute('stroke-width');
    if (stroke === null) {
        return 0;
    }
    return parseFloat(stroke) || 0;
}
function findShapeNode(magnet) {
    if (magnet == null) {
        return null;
    }
    let node = magnet;
    do {
        let tagName = node.tagName;
        if (typeof tagName !== 'string')
            return null;
        tagName = tagName.toUpperCase();
        if (tagName === 'G') {
            node = node.firstElementChild;
        }
        else if (tagName === 'TITLE') {
            node = node.nextElementSibling;
        }
        else
            break;
    } while (node);
    return node;
}
//# sourceMappingURL=util.js.map