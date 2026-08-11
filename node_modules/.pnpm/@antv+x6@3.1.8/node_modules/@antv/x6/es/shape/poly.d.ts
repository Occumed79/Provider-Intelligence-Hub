import type { PointOptions } from '../geometry';
import type { NodeSetOptions } from '../model/node';
import { Base } from './base';
export declare class Poly extends Base {
    get points(): string | undefined | null;
    set points(pts: string | undefined | null);
    getPoints(): string;
    setPoints(points?: string | PointOptions[] | null, options?: NodeSetOptions): this;
    removePoints(): this;
}
