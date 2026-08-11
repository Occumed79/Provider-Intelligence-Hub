import { Grid } from '../registry';
import type { GridDefinition, GridManualItem, GridNativeItem, GridOptions as GridOptionsFromRegistry, GridOptionsMap } from '../registry';
import { Base } from './base';
export declare class GridManager extends Base {
    protected instance: Grid | null;
    protected patterns: GridDefinition[];
    protected get elem(): HTMLDivElement;
    protected get grid(): GridOptions;
    protected init(): void;
    protected startListening(): void;
    protected stopListening(): void;
    protected setVisible(visible: boolean): void;
    getGridSize(): number;
    setGridSize(size: number): void;
    show(): void;
    hide(): void;
    clear(): void;
    draw(options?: GridDrawOptions): void;
    update(options?: Partial<GridOptionsFromRegistry> | Partial<GridOptionsFromRegistry>[]): void;
    protected getInstance(): Grid;
    protected resolveGrid(options?: GridDrawOptions): GridDefinition[] | never;
    dispose(): void;
}
export type GridDrawOptions = GridNativeItem | GridManualItem | {
    args?: GridOptionsMap['dot'];
};
export interface GridCommonOptions {
    size: number;
    visible: boolean;
}
export type GridOptions = GridCommonOptions & GridDrawOptions;
