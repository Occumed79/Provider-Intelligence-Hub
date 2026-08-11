import { IDisposer } from 'mobx-utils';
import LogicFlow from '..';
import { GraphModel } from '../model';
import EventEmitter from '../event/eventEmitter';
import GraphData = LogicFlow.GraphData;
export declare class History {
    undos: GraphData[];
    redos: GraphData[];
    callbacks: never[];
    stopWatch: IDisposer | null;
    curData: GraphData | null;
    maxSize: number;
    waitTime: number;
    eventCenter: EventEmitter;
    constructor(eventCenter: EventEmitter);
    add(data: GraphData): void;
    undoAble(): boolean;
    undo(): LogicFlow.GraphData | undefined;
    redoAble(): boolean;
    redo(): LogicFlow.GraphData | undefined;
    watch(model: GraphModel): void;
    destroy(): void;
}
export default History;
