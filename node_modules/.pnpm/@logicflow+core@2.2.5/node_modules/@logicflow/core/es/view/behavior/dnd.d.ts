import LogicFlow from '../../LogicFlow';
import { BaseNodeModel } from '../../model';
import Position = LogicFlow.Position;
import OnDragNodeConfig = LogicFlow.OnDragNodeConfig;
export declare class Dnd {
    nodeConfig: OnDragNodeConfig | null;
    lf: LogicFlow;
    fakeNode: BaseNodeModel | null;
    docPointerMove?: (e: PointerEvent) => void;
    docPointerUp?: (e: PointerEvent) => void;
    constructor(params: {
        lf: LogicFlow;
    });
    clientToLocalPoint({ x, y }: Position): Position;
    isInsideCanvas(e: PointerEvent): boolean;
    startDrag(nodeConfig: OnDragNodeConfig): void;
    stopDrag: () => void;
    dragEnter: (e: PointerEvent) => void;
    onDragOver: (e: MouseEvent) => boolean;
    onDragLeave: () => void;
    onDrop: (e: MouseEvent) => void;
}
export default Dnd;
