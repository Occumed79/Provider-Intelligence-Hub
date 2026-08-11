import type { PointLike } from '../../geometry';
import type { TerminalType } from '../../model/edge';
import type { CellView } from '../../view/cell';
import type { EdgeView } from '../../view/edge';
export declare function getAnchor(this: EdgeView, pos: PointLike, terminalView: CellView, terminalMagnet: Element, type: TerminalType): import("../../model/edge").NodeAnchorItem;
export declare function getViewBBox(view: CellView, quick?: boolean): any;
