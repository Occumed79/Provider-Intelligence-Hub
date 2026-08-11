import { Model, type Node, type SetPositionOptions } from '../../model';
interface GridLayoutOptions extends SetPositionOptions {
    columns?: number;
    columnWidth?: number | 'auto' | 'compact';
    rowHeight?: number | 'auto' | 'compact';
    dx?: number;
    dy?: number;
    marginX?: number;
    marginY?: number;
    /**
     * Positions the elements in the center of a grid cell.
     *
     * Default: true
     */
    center?: boolean;
    /**
     * Resizes the elements to fit a grid cell, preserving the aspect ratio.
     *
     * Default: false
     */
    resizeToFit?: boolean;
}
export declare function getMaxDim(nodes: Node[], name: 'width' | 'height'): number;
export declare function getNodesInRow(nodes: Node[], rowIndex: number, columnCount: number): Node<import("../../model").NodeProperties>[];
export declare function getNodesInColumn(nodes: Node[], columnIndex: number, columnCount: number): Node<import("../../model").NodeProperties>[];
export declare function accumulate(items: number[], start: number): number[];
export declare function grid(cells: Node[] | Model, options?: GridLayoutOptions): void;
export {};
