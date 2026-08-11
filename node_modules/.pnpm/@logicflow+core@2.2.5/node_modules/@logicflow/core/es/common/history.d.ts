import { IDisposer } from 'mobx-utils';
import { LogicFlow } from '../LogicFlow';
import { GraphModel } from '../model';
import EventEmitter from '../event/eventEmitter';
export type HistoryData = LogicFlow.GraphConfigData;
export declare class History {
    undos: HistoryData[];
    redos: HistoryData[];
    stopWatch: IDisposer | null;
    curData: HistoryData | null;
    maxSize: number;
    waitTime: number;
    eventCenter: EventEmitter;
    constructor(eventCenter: EventEmitter);
    add(data: HistoryData): void;
    undoAble(): boolean;
    /**
     * undo 方法触发：
     * graphModel 重新渲染 nodes 和 edges
     * graphModel 发生变化，触发 watch
     * watch 触发 add
     */
    undo(): LogicFlow.GraphConfigData | undefined;
    redoAble(): boolean;
    redo(): LogicFlow.GraphConfigData | undefined;
    watch(model: GraphModel): void;
}
export default History;
