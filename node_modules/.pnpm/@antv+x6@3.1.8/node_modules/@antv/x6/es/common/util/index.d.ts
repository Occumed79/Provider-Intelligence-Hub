import { Ellipse, Line, Path, Point, Polyline, Rectangle, type RectangleLike } from '../../geometry';
import { normalize } from '../../registry/marker/util';
import type { PointLike, PointOptions } from '../../types';
export declare const normalizeMarker: typeof normalize;
/**
 * Transforms point by an SVG transformation represented by `matrix`.
 */
export declare function transformPoint(point: PointLike, matrix: DOMMatrix): Point;
/**
 * Transforms line by an SVG transformation represented by `matrix`.
 */
export declare function transformLine(line: Line, matrix: DOMMatrix): Line;
/**
 * Transforms polyline by an SVG transformation represented by `matrix`.
 */
export declare function transformPolyline(polyline: Polyline, matrix: DOMMatrix): Polyline;
export declare function transformRectangle(rect: RectangleLike, matrix: DOMMatrix): Rectangle;
/**
 * Returns the bounding box of the element after transformations are
 * applied. If `withoutTransformations` is `true`, transformations of
 * the element will not be considered when computing the bounding box.
 * If `target` is specified, bounding box will be computed relatively
 * to the `target` element.
 */
export declare function bbox(elem: SVGElement, withoutTransformations?: boolean, target?: SVGElement): Rectangle;
/**
 * Returns the bounding box of the element after transformations are
 * applied. Unlike `bbox()`, this function fixes a browser implementation
 * bug to return the correct bounding box if this elemenent is a group of
 * svg elements (if `options.recursive` is specified).
 */
export declare function getBBox(elem: SVGElement, options?: {
    target?: SVGElement | null;
    recursive?: boolean;
}): Rectangle;
export declare function getBoundingOffsetRect(elem: HTMLElement): {
    left: number;
    top: number;
    width: number;
    height: number;
};
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
export declare function toGeometryShape(elem: SVGElement): Ellipse | Rectangle | Line | Polyline | Path;
export declare function translateAndAutoOrient(elem: SVGElement, position: PointOptions, reference: PointOptions, target?: SVGElement): void;
export declare function findShapeNode(magnet: Element): Element;
export declare function getBBoxV2(elem: SVGElement): any;
