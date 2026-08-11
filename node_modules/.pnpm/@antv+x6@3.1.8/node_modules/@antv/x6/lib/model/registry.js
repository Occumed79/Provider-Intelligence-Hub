"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exist = exist;
exports.setEdgeRegistry = setEdgeRegistry;
exports.setNodeRegistry = setNodeRegistry;
let edgeRegistry;
let nodeRegistry;
function exist(name, isNode) {
    return isNode
        ? edgeRegistry != null && edgeRegistry.exist(name)
        : nodeRegistry != null && nodeRegistry.exist(name);
}
function setEdgeRegistry(registry) {
    edgeRegistry = registry;
}
function setNodeRegistry(registry) {
    nodeRegistry = registry;
}
//# sourceMappingURL=registry.js.map