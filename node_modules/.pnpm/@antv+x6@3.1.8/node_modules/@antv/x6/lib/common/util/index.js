"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMarker = void 0;
exports.transformPoint = transformPoint;
exports.transformLine = transformLine;
exports.transformPolyline = transformPolyline;
exports.transformRectangle = transformRectangle;
exports.bbox = bbox;
exports.getBBox = getBBox;
exports.getBoundingOffsetRect = getBoundingOffsetRect;
exports.toGeometryShape = toGeometryShape;
exports.translateAndAutoOrient = translateAndAutoOrient;
exports.findShapeNode = findShapeNode;
exports.getBBoxV2 = getBBoxV2;
const geometry_1 = require("../../geometry");
const path_1 = require("../../geometry/path");
const util_1 = require("../../geometry/path/util");
const util_2 = require("../../registry/marker/util");
const dom_1 = require("../dom");
exports.normalizeMarker = util_2.normalize;
/**
 * Transforms point by an SVG transformation represented by `matrix`.
 */
function transformPoint(point, matrix) {
    const ret = dom_1.Dom.createSVGPoint(point.x, point.y).matrixTransform(matrix);
    return new geometry_1.Point(ret.x, ret.y);
}
/**
 * Transforms line by an SVG transformation represented by `matrix`.
 */
function transformLine(line, matrix) {
    return new geometry_1.Line(transformPoint(line.start, matrix), transformPoint(line.end, matrix));
}
/**
 * Transforms polyline by an SVG transformation represented by `matrix`.
 */
function transformPolyline(polyline, matrix) {
    let points = polyline instanceof geometry_1.Polyline ? polyline.points : polyline;
    if (!Array.isArray(points)) {
        points = [];
    }
    return new geometry_1.Polyline(points.map((p) => transformPoint(p, matrix)));
}
function transformRectangle(rect, matrix) {
    const svgDocument = dom_1.Dom.createSvgElement('svg');
    const p = svgDocument.createSVGPoint();
    p.x = rect.x;
    p.y = rect.y;
    const corner1 = p.matrixTransform(matrix);
    p.x = rect.x + rect.width;
    p.y = rect.y;
    const corner2 = p.matrixTransform(matrix);
    p.x = rect.x + rect.width;
    p.y = rect.y + rect.height;
    const corner3 = p.matrixTransform(matrix);
    p.x = rect.x;
    p.y = rect.y + rect.height;
    const corner4 = p.matrixTransform(matrix);
    const minX = Math.min(corner1.x, corner2.x, corner3.x, corner4.x);
    const maxX = Math.max(corner1.x, corner2.x, corner3.x, corner4.x);
    const minY = Math.min(corner1.y, corner2.y, corner3.y, corner4.y);
    const maxY = Math.max(corner1.y, corner2.y, corner3.y, corner4.y);
    return new geometry_1.Rectangle(minX, minY, maxX - minX, maxY - minY);
}
/**
 * Returns the bounding box of the element after transformations are
 * applied. If `withoutTransformations` is `true`, transformations of
 * the element will not be considered when computing the bounding box.
 * If `target` is specified, bounding box will be computed relatively
 * to the `target` element.
 */
function bbox(elem, withoutTransformations, target) {
    let box = null;
    const ownerSVGElement = elem.ownerSVGElement;
    // If the element is not in the live DOM, it does not have a bounding
    // box defined and so fall back to 'zero' dimension element.
    if (!ownerSVGElement) {
        return new geometry_1.Rectangle(0, 0, 0, 0);
    }
    try {
        box = elem.getBBox();
    }
    catch (_e) {
        // Fallback for IE.
        box = {
            x: elem.clientLeft,
            y: elem.clientTop,
            width: elem.clientWidth,
            height: elem.clientHeight,
        };
    }
    if (withoutTransformations) {
        return geometry_1.Rectangle.create(box);
    }
    const matrix = dom_1.Dom.getTransformToElement(elem, target || ownerSVGElement);
    return transformRectangle(box, matrix);
}
/**
 * Returns the bounding box of the element after transformations are
 * applied. Unlike `bbox()`, this function fixes a browser implementation
 * bug to return the correct bounding box if this elemenent is a group of
 * svg elements (if `options.recursive` is specified).
 */
function getBBox(elem, options = {}) {
    let box = null;
    const ownerSVGElement = elem.ownerSVGElement;
    // If the element is not in the live DOM, it does not have a bounding box
    // defined and so fall back to 'zero' dimension element.
    // If the element is not an SVGGraphicsElement, we could not measure the
    // bounding box either
    if (!ownerSVGElement || !dom_1.Dom.isSVGGraphicsElement(elem)) {
        if (dom_1.Dom.isHTMLElement(elem)) {
            // If the element is a HTMLElement, return the position relative to the body
            const { left, top, width, height } = getBoundingOffsetRect(elem);
            return new geometry_1.Rectangle(left, top, width, height);
        }
        return new geometry_1.Rectangle(0, 0, 0, 0);
    }
    let target = options.target;
    const recursive = options.recursive;
    if (!recursive) {
        try {
            box = elem.getBBox();
        }
        catch (_e) {
            box = {
                x: elem.clientLeft,
                y: elem.clientTop,
                width: elem.clientWidth,
                height: elem.clientHeight,
            };
        }
        if (!target) {
            return geometry_1.Rectangle.create(box);
        }
        // transform like target
        const matrix = dom_1.Dom.getTransformToElement(elem, target);
        return transformRectangle(box, matrix);
    }
    // recursive
    {
        const children = elem.childNodes;
        const n = children.length;
        if (n === 0) {
            return getBBox(elem, {
                target,
            });
        }
        if (!target) {
            target = elem; // eslint-disable-line
        }
        let aggregate = null;
        for (let i = 0; i < n; i += 1) {
            const child = children[i];
            let childBBox = null;
            if (child.childNodes.length === 0) {
                childBBox = getBBox(child, {
                    target,
                });
            }
            else {
                // if child is a group element, enter it with a recursive call
                childBBox = getBBox(child, {
                    target,
                    recursive: true,
                });
            }
            if (!aggregate) {
                aggregate = geometry_1.Rectangle.create(childBBox);
            }
            else {
                aggregate = aggregate.union(childBBox);
            }
        }
        return aggregate || new geometry_1.Rectangle(0, 0, 0, 0);
    }
}
function getBoundingOffsetRect(elem) {
    let left = 0;
    let top = 0;
    let width = 0;
    let height = 0;
    if (elem) {
        let current = elem;
        while (current) {
            left += current.offsetLeft;
            top += current.offsetTop;
            current = current.offsetParent;
            if (current) {
                left += parseInt(dom_1.Dom.getComputedStyle(current, 'borderLeft'), 10);
                top += parseInt(dom_1.Dom.getComputedStyle(current, 'borderTop'), 10);
            }
        }
        width = elem.offsetWidth;
        height = elem.offsetHeight;
    }
    return {
        left,
        top,
        width,
        height,
    };
}
/**
 * Convert the SVGElement to an equivalent geometric shape. The element's
 * transformations are not taken into account.
 *
 * SVGRectElement      => Rectangle
 *
 * SVGLineElement      => Line
 *
 * SVGCircleElement    => Ellipse
 *
 * SVGEllipseElement   => Ellipse
 *
 * SVGPolygonElement   => Polyline
 *
 * SVGPolylineElement  => Polyline
 *
 * SVGPathElement      => Path
 *
 * others              => Rectangle
 */
function toGeometryShape(elem) {
    const attr = (name) => {
        const s = elem.getAttribute(name);
        const v = s ? parseFloat(s) : 0;
        return Number.isNaN(v) ? 0 : v;
    };
    switch (elem instanceof SVGElement && elem.nodeName.toLowerCase()) {
        case 'rect':
            return new geometry_1.Rectangle(attr('x'), attr('y'), attr('width'), attr('height'));
        case 'circle':
            return new geometry_1.Ellipse(attr('cx'), attr('cy'), attr('r'), attr('r'));
        case 'ellipse':
            return new geometry_1.Ellipse(attr('cx'), attr('cy'), attr('rx'), attr('ry'));
        case 'polyline': {
            const points = dom_1.Dom.getPointsFromSvgElement(elem);
            return new geometry_1.Polyline(points);
        }
        case 'polygon': {
            const points = dom_1.Dom.getPointsFromSvgElement(elem);
            if (points.length > 1) {
                points.push(points[0]);
            }
            return new geometry_1.Polyline(points);
        }
        case 'path': {
            let d = elem.getAttribute('d');
            if (!(0, util_1.isValid)(d)) {
                d = (0, path_1.normalizePathData)(d);
            }
            return geometry_1.Path.parse(d);
        }
        case 'line': {
            return new geometry_1.Line(attr('x1'), attr('y1'), attr('x2'), attr('y2'));
        }
        default:
            break;
    }
    // Anything else is a rectangle
    return getBBox(elem);
}
function translateAndAutoOrient(elem, position, reference, target) {
    const pos = geometry_1.Point.create(position);
    const ref = geometry_1.Point.create(reference);
    if (!target) {
        const svg = elem instanceof SVGSVGElement
            ? elem
            : elem.ownerSVGElement;
        target = svg; // eslint-disable-line
    }
    // Clean-up previously set transformations except the scale.
    // If we didn't clean up the previous transformations then they'd
    // add up with the old ones. Scale is an exception as it doesn't
    // add up, consider: `this.scale(2).scale(2).scale(2)`. The result
    // is that the element is scaled by the factor 2, not 8.
    const s = dom_1.Dom.scale(elem);
    elem.setAttribute('transform', '');
    const bbox = getBBox(elem, {
        target,
    }).scale(s.sx, s.sy);
    // 1. Translate to origin.
    const translateToOrigin = dom_1.Dom.createSVGTransform();
    translateToOrigin.setTranslate(-bbox.x - bbox.width / 2, -bbox.y - bbox.height / 2);
    // 2. Rotate around origin.
    const rotateAroundOrigin = dom_1.Dom.createSVGTransform();
    const angle = pos.angleBetween(ref, pos.clone().translate(1, 0));
    if (angle)
        rotateAroundOrigin.setRotate(angle, 0, 0);
    // 3. Translate to the `position` + the offset (half my width)
    //    towards the `reference` point.
    const translateFromOrigin = dom_1.Dom.createSVGTransform();
    const finalPosition = pos.clone().move(ref, bbox.width / 2);
    translateFromOrigin.setTranslate(2 * pos.x - finalPosition.x, 2 * pos.y - finalPosition.y);
    // 4. Get the current transformation matrix of this node
    const ctm = dom_1.Dom.getTransformToElement(elem, target);
    // 5. Apply transformations and the scale
    const transform = dom_1.Dom.createSVGTransform();
    transform.setMatrix(translateFromOrigin.matrix.multiply(rotateAroundOrigin.matrix.multiply(translateToOrigin.matrix.multiply(ctm.scale(s.sx, s.sy)))));
    elem.setAttribute('transform', dom_1.Dom.matrixToTransformString(transform.matrix));
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
        if (dom_1.Dom.hasClass(node, 'x6-port')) {
            node = node.nextElementSibling;
        }
        else if (tagName === 'G') {
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
// BBox is calculated by the attribute and shape of the node.
// Because of the reduction in DOM API calls, there is a significant performance improvement.
function getBBoxV2(elem) {
    const node = findShapeNode(elem);
    if (!dom_1.Dom.isSVGGraphicsElement(node)) {
        if (dom_1.Dom.isHTMLElement(elem)) {
            const { left, top, width, height } = getBoundingOffsetRect(elem);
            return new geometry_1.Rectangle(left, top, width, height);
        }
        return new geometry_1.Rectangle(0, 0, 0, 0);
    }
    const shape = toGeometryShape(node);
    const bbox = shape.bbox() || geometry_1.Rectangle.create();
    // const transform = node.getAttribute('transform')
    // if (transform) {
    //   const nodeMatrix = Dom.transformStringToMatrix(transform)
    //   return transformRectangle(bbox, nodeMatrix)
    // }
    return bbox;
}
//# sourceMappingURL=index.js.map