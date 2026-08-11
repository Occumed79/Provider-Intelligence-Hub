import { type KeyValue } from '../../../common';
import { Point, type Rectangle } from '../../../geometry';
import type { Edge, Model } from '../../../model';
import type { ResolvedOptions } from './options';
/**
 * Helper structure to identify whether a point lies inside an obstacle.
 */
export declare class ObstacleMap {
    options: ResolvedOptions;
    /**
     * How to divide the paper when creating the elements map
     */
    mapGridSize: number;
    map: KeyValue<Rectangle[]>;
    constructor(options: ResolvedOptions);
    /**
     * Builds a map of all nodes for quicker obstacle queries i.e. is a point
     * contained in any obstacle?
     *
     * A simplified grid search.
     */
    build(model: Model, edge: Edge): this;
    isAccessible(point: Point): boolean;
}
/**
 * 共享障碍图
 */
export declare function getSharedObstacleMap(model: Model, edge: Edge, options: ResolvedOptions): ObstacleMap;
