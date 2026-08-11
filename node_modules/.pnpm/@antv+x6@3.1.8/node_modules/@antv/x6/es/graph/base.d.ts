import { Disposable } from '../common';
import { Graph } from './graph';
export declare class Base extends Disposable {
    readonly graph: Graph;
    get options(): import("./options").GraphDefinition;
    get model(): import("..").Model;
    get view(): import("./view").GraphView;
    constructor(graph: Graph);
    protected init(): void;
}
