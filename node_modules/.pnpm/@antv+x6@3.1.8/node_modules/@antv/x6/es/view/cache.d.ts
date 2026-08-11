import { Dictionary, type JSONObject } from '../common';
import type { Ellipse, Line, Path, Polyline, Rectangle, Segment } from '../geometry';
import type { CellView } from './cell';
export interface CacheItem {
    data?: JSONObject;
    matrix?: DOMMatrix;
    boundingRect?: Rectangle;
    shape?: Rectangle | Ellipse | Polyline | Path | Line;
}
/**
 * 一个 element 的缓存类
 */
export declare class Cache {
    protected view: CellView;
    protected elemCache: Dictionary<Element, CacheItem>;
    pathCache: {
        data?: string;
        length?: number;
        segmentSubdivisions?: Segment[][];
    };
    constructor(view: CellView);
    clean(): void;
    get(elem: Element): CacheItem;
    getData(elem: Element): JSONObject;
    getMatrix(elem: Element): DOMMatrix;
    getShape(elem: Element): Ellipse | Rectangle | Line | Polyline | Path;
    getBoundingRect(elem: Element): Rectangle;
}
