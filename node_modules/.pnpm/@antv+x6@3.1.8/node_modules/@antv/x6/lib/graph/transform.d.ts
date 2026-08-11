import { Rectangle, PointLike, type RectangleLike } from '../geometry';
import { Dom, NumberExt } from '../common';
import { Base } from './base';
import { Cell } from '../model';
export declare class TransformManager extends Base {
    protected viewportMatrix: DOMMatrix | null;
    protected viewportTransformString: string | null;
    protected get container(): HTMLElement;
    protected get viewport(): SVGGElement;
    protected get stage(): SVGGElement;
    protected init(): void;
    /**
     * Returns the current transformation matrix of the graph.
     */
    getMatrix(): DOMMatrix;
    /**
     * Sets new transformation with the given `matrix`
     */
    setMatrix(matrix: DOMMatrix | Dom.MatrixLike | null): void;
    resize(width?: number, height?: number): this;
    getComputedSize(): {
        width: number;
        height: number;
    };
    getScale(): Dom.Scale;
    scale(sx: number, sy?: number, ox?: number, oy?: number, translate?: boolean): this;
    clampScale(scale: number): number;
    getZoom(): number;
    zoom(factor: number, options?: ZoomOptions): this;
    getRotation(): Dom.Rotation;
    rotate(angle: number, cx?: number, cy?: number): this;
    getTranslation(): Dom.Translation;
    translate(tx: number, ty: number): this;
    setOrigin(ox?: number, oy?: number): this;
    fitToContent(gridWidth?: number | FitToContentFullOptions, gridHeight?: number, padding?: NumberExt.SideOptions, options?: FitToContentOptions): Rectangle;
    scaleContentToFit(options?: ScaleContentToFitOptions): void;
    scaleContentToFitImpl(options?: ScaleContentToFitOptions, translate?: boolean): void;
    getContentArea(options?: GetContentAreaOptions): Rectangle;
    getContentBBox(options?: GetContentAreaOptions): Rectangle;
    getGraphArea(): Rectangle;
    zoomToRect(rect: RectangleLike, options?: ScaleContentToFitOptions): this;
    zoomToFit(options?: GetContentAreaOptions & ScaleContentToFitOptions): this;
    centerPoint(x?: number, y?: number): void;
    centerContent(options?: GetContentAreaOptions): void;
    centerCell(cell: Cell): void | this;
    positionPoint(point: PointLike, x: number | string, y: number | string): void;
    positionRect(rect: RectangleLike, pos: Direction): void | this;
    positionCell(cell: Cell, pos: Direction): void | this;
    positionContent(pos: Direction, options?: GetContentAreaOptions): void | this;
}
export interface FitToContentOptions extends GetContentAreaOptions {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    contentArea?: Rectangle | RectangleLike;
    border?: number;
    allowNewOrigin?: 'negative' | 'positive' | 'any';
}
export interface FitToContentFullOptions extends FitToContentOptions {
    gridWidth?: number;
    gridHeight?: number;
    padding?: NumberExt.SideOptions;
}
export interface ScaleContentToFitOptions extends GetContentAreaOptions {
    padding?: NumberExt.SideOptions;
    minScale?: number;
    maxScale?: number;
    minScaleX?: number;
    minScaleY?: number;
    maxScaleX?: number;
    maxScaleY?: number;
    scaleGrid?: number;
    contentArea?: RectangleLike;
    viewportArea?: RectangleLike;
    preserveAspectRatio?: boolean;
}
export interface GetContentAreaOptions {
    useCellGeometry?: boolean;
}
export interface ZoomOptions {
    absolute?: boolean;
    minScale?: number;
    maxScale?: number;
    scaleGrid?: number;
    center?: PointLike;
}
export type Direction = 'center' | 'top' | 'top-right' | 'top-left' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left';
export interface CenterOptions {
    padding?: NumberExt.SideOptions;
}
export type PositionContentOptions = GetContentAreaOptions & CenterOptions;
