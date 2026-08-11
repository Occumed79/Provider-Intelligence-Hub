let edgeRegistry;
let nodeRegistry;
export function exist(name, isNode) {
    return isNode
        ? edgeRegistry != null && edgeRegistry.exist(name)
        : nodeRegistry != null && nodeRegistry.exist(name);
}
export function setEdgeRegistry(registry) {
    edgeRegistry = registry;
}
export function setNodeRegistry(registry) {
    nodeRegistry = registry;
}
//# sourceMappingURL=registry.js.map