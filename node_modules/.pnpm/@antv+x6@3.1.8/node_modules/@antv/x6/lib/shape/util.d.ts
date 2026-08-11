import { type PointOptions } from '../geometry';
import type { CellPropHook, NodeConfig, NodeDefinition } from '../model';
import type { MarkupType } from '../view/markup';
import { Base } from './base';
export declare function getMarkup(tagName: string, selector?: string): MarkupType;
export declare function getImageUrlHook(attrName?: string): CellPropHook;
export declare function createShape(shape: string, config: NodeConfig, options?: {
    selector?: string;
    parent?: NodeDefinition | typeof Base;
}): typeof Base;
export declare function pointsToString(points: PointOptions[] | string): string;
