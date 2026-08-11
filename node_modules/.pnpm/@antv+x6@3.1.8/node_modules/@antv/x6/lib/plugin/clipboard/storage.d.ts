import { type Cell } from '../../model';
export declare function save(cells: Cell[]): void;
export declare function fetch(): (import("../../model").Node<import("../../model").NodeProperties> | import("../../model").Edge<import("../../model").EdgeProperties>)[];
export declare function clean(): void;
