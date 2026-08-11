"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshGraphId = exports.createUuid = void 0;
var uuid_1 = require("uuid");
var createUuid = function () { return (0, uuid_1.v4)(); };
exports.createUuid = createUuid;
/**
 * 重新刷新流程图的所有id
 */
var refreshGraphId = function (graphData, prefix) {
    if (prefix === void 0) { prefix = ''; }
    var nodeIdMap = graphData.nodes.reduce(function (nMap, node) {
        nMap[node.id] = prefix + (0, uuid_1.v4)();
        node.id = nMap[node.id];
        return nMap;
    }, {});
    graphData.edges.forEach(function (edge) {
        edge.id = prefix + (0, uuid_1.v4)();
        edge.sourceNodeId = nodeIdMap[edge.sourceNodeId];
        edge.targetNodeId = nodeIdMap[edge.targetNodeId];
    });
    return graphData;
};
exports.refreshGraphId = refreshGraphId;
