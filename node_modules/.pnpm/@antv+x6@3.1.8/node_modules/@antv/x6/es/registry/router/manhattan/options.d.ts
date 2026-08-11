import { Point, type RectangleLike, type PointLike } from '../../../geometry';
import type { Node, TerminalType } from '../../../model';
import type { EdgeView } from '../../../view';
import type { RouterDefinition } from '../index';
export type Direction = 'top' | 'right' | 'bottom' | 'left';
type Callable<T> = T | ((this: ManhattanRouterOptions) => T);
export interface ResolvedOptions {
    /**
     * The size of step to find a route (the grid of the manhattan pathfinder).
     */
    step: number;
    /**
     * The number of route finding loops that cause the router to abort returns
     * fallback route instead.
     */
    maxLoopCount: number;
    /**
     * The number of decimal places to round floating point coordinates.
     */
    precision: number;
    /**
     * The maximum change of direction.
     */
    maxDirectionChange: number;
    /**
     * Should the router use perpendicular edgeView option? Does not connect
     * to the anchor of node but rather a point close-by that is orthogonal.
     */
    perpendicular: boolean;
    /**
     * Should the source and/or target not be considered as obstacles?
     */
    excludeTerminals: TerminalType[];
    /**
     * Should certain nodes not be considered as obstacles?
     */
    excludeNodes: (Node | string)[];
    /**
     * Should certain types of nodes not be considered as obstacles?
     */
    excludeShapes: string[];
    /**
     * Possible starting directions from a node.
     */
    startDirections: Direction[];
    /**
     * Possible ending directions to a node.
     */
    endDirections: Direction[];
    /**
     * Specify the directions used above and what they mean
     */
    directionMap: {
        top: PointLike;
        right: PointLike;
        bottom: PointLike;
        left: PointLike;
    };
    /**
     * Returns the cost of an orthogonal step.
     */
    cost: number;
    /**
     * Returns an array of directions to find next points on the route different
     * from start/end directions.
     */
    directions: {
        cost: number;
        offsetX: number;
        offsetY: number;
        angle?: number;
        gridOffsetX?: number;
        gridOffsetY?: number;
    }[];
    /**
     * A penalty received for direction change.
     */
    penalties: {
        [key: number]: number;
    };
    padding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    /**
     * The padding applied on the element bounding boxes.
     */
    paddingBox: RectangleLike;
    fallbackRouter: RouterDefinition<any>;
    draggingRouter?: ((this: EdgeView, dragFrom: PointLike, dragTo: PointLike, options: ResolvedOptions) => Point[]) | null;
    fallbackRoute?: (this: EdgeView, from: Point, to: Point, options: ResolvedOptions) => Point[] | null;
    previousDirectionAngle?: number | null;
    snapToGrid?: boolean;
}
export type ManhattanRouterOptions = {
    [Key in keyof ResolvedOptions]: Callable<ResolvedOptions[Key]>;
};
export declare const defaults: ManhattanRouterOptions;
export declare function resolve<T>(input: Callable<T>, options: ManhattanRouterOptions): any;
export declare function resolveOptions(options: ManhattanRouterOptions): ResolvedOptions;
export {};
