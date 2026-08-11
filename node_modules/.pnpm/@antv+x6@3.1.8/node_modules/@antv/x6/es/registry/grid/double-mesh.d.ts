import type { GridDefinition, GridOptions } from './index';
export interface DoubleMeshOptions extends GridOptions {
    factor?: number;
}
export declare const doubleMesh: GridDefinition<DoubleMeshOptions>[];
