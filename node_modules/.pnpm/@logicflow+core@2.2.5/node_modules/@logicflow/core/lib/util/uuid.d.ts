import LogicFlow from '../LogicFlow';
import GraphData = LogicFlow.GraphData;
export declare const createUuid: () => string;
/**
 * 重新刷新流程图的所有id
 */
export declare const refreshGraphId: (graphData: GraphData, prefix?: string) => GraphData;
