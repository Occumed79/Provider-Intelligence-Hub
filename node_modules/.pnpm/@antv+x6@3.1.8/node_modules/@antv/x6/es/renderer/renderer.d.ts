import { type PointLike, Rectangle, type RectangleLike } from '../geometry';
import { Base } from '../graph/base';
import { Cell } from '../model';
import type { CellView, EdgeView } from '../view';
export declare class Renderer extends Base {
    private readonly schedule;
    requestViewUpdate(view: CellView, flag: number, options?: any): void;
    isViewMounted(view: CellView): boolean;
    setRenderArea(area?: Rectangle): void;
    findViewByElem(elem: string | Element | undefined | null): CellView<Cell<import("../model").CellProperties>, import("../view").CellViewOptions>;
    findViewByCell(cellId: string | number): CellView | null;
    findViewByCell(cell: Cell | null): CellView | null;
    findViewsFromPoint(p: PointLike): CellView[];
    findEdgeViewsFromPoint(p: PointLike, threshold?: number): EdgeView[];
    findViewsInArea(rect: RectangleLike, options?: {
        strict?: boolean;
        nodeOnly?: boolean;
    }): CellView[];
    dispose(): void;
}
