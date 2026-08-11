import { Line, Path, Point, type PointLike } from '../../geometry';
import type { EdgeView } from '../../view';
import type { ConnectorBaseOptions, ConnectorDefinition } from './index';
export declare function setupUpdating(view: EdgeView): void;
export declare function createLines(sourcePoint: PointLike, targetPoint: PointLike, route?: PointLike[]): Line[];
export declare function findLineIntersections(line: Line, crossCheckLines: Line[]): Point[];
export declare function getDistence(p1: Point, p2: Point): number;
/**
 * Split input line into multiple based on intersection points.
 */
export declare function createJumps(line: Line, intersections: Point[], jumpSize: number): Line[];
export declare function buildPath(lines: Line[], jumpSize: number, jumpType: JumpType, radius: number): Path;
export declare function buildRoundedSegment(offset: number, path: Path, curr: Point, prev: Point, next: Point): void;
export type JumpType = 'arc' | 'gap' | 'cubic';
export interface JumpoverConnectorOptions extends ConnectorBaseOptions {
    size?: number;
    radius?: number;
    type?: JumpType;
    ignoreConnectors?: string[];
}
export declare const jumpover: ConnectorDefinition<JumpoverConnectorOptions>;
