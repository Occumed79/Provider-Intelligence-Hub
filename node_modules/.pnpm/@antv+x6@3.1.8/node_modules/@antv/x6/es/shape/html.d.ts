import type { Cell } from '../model/cell';
import { Node, type NodeProperties } from '../model/node';
type HTMLComponent = string | HTMLElement | ((cell: Cell) => HTMLElement | string);
export type HTMLShapeConfig = NodeProperties & {
    shape: string;
    html: HTMLComponent;
    effect?: (keyof NodeProperties)[];
    inherit?: string;
};
/**
 * HTML shape
 */
export declare class HTML extends Node {
    /**
     * HTML.register
     * @param config
     */
    static register(config: HTMLShapeConfig): void;
}
export {};
