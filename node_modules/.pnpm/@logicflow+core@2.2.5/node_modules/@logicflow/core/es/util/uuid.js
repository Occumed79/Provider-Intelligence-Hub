import { v4 as uuidV4 } from 'uuid';
export var createUuid = function () { return uuidV4(); };
/**
 * 重新刷新流程图的所有id
 */
export var refreshGraphId = function (graphData, prefix) {
    if (prefix === void 0) { prefix = ''; }
    var nodeIdMap = graphData.nodes.reduce(function (nMap, node) {
        nMap[node.id] = prefix + uuidV4();
        node.id = nMap[node.id];
        return nMap;
    }, {});
    graphData.edges.forEach(function (edge) {
        edge.id = prefix + uuidV4();
        edge.sourceNodeId = nodeIdMap[edge.sourceNodeId];
        edge.targetNodeId = nodeIdMap[edge.targetNodeId];
    });
    return graphData;
};
