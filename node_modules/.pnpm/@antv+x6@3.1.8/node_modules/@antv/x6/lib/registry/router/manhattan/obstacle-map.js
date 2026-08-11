"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObstacleMap = void 0;
exports.getSharedObstacleMap = getSharedObstacleMap;
const common_1 = require("../../../common");
const geometry_1 = require("../../../geometry");
/**
 * Helper structure to identify whether a point lies inside an obstacle.
 */
class ObstacleMap {
    constructor(options) {
        this.options = options;
        this.mapGridSize = 100;
        this.map = {};
    }
    /**
     * Builds a map of all nodes for quicker obstacle queries i.e. is a point
     * contained in any obstacle?
     *
     * A simplified grid search.
     */
    build(model, edge) {
        const options = this.options;
        // source or target node could be excluded from set of obstacles
        const excludedTerminals = options.excludeTerminals.reduce((memo, type) => {
            const terminal = edge[type];
            if (terminal) {
                const cell = model.getCell(terminal.cell);
                if (cell) {
                    memo.push(cell);
                }
            }
            return memo;
        }, []);
        let excludedAncestors = [];
        const source = model.getCell(edge.getSourceCellId());
        if (source) {
            excludedAncestors = common_1.ArrayExt.union(excludedAncestors, source.getAncestors().map((cell) => cell.id));
        }
        const target = model.getCell(edge.getTargetCellId());
        if (target) {
            excludedAncestors = common_1.ArrayExt.union(excludedAncestors, target.getAncestors().map((cell) => cell.id));
        }
        // The graph is divided into smaller cells, where each holds information
        // about which node belong to it. When we query whether a point lies
        // inside an obstacle we don't need to go through all obstacles, we check
        // only those in a particular cell.
        const mapGridSize = this.mapGridSize;
        model.getNodes().reduce((map, node) => {
            const excludedTerminal = excludedTerminals.some((cell) => cell.id === node.id);
            const excludedShape = node.shape
                ? options.excludeShapes.includes(node.shape)
                : false;
            const excludedNode = options.excludeNodes.some((item) => {
                if (typeof item === 'string') {
                    return node.id === item;
                }
                return item === node;
            });
            const excludedAncestor = excludedAncestors.includes(node.id);
            const excluded = excludedShape || excludedTerminal || excludedNode || excludedAncestor;
            if (node.isVisible() && !excluded) {
                const bbox = node.getBBox().moveAndExpand(options.paddingBox);
                const origin = bbox.getOrigin().snapToGrid(mapGridSize);
                const corner = bbox.getCorner().snapToGrid(mapGridSize);
                for (let x = origin.x; x <= corner.x; x += mapGridSize) {
                    for (let y = origin.y; y <= corner.y; y += mapGridSize) {
                        const key = new geometry_1.Point(x, y).toString();
                        if (map[key] == null) {
                            map[key] = [];
                        }
                        map[key].push(bbox);
                    }
                }
            }
            return map;
        }, this.map);
        return this;
    }
    isAccessible(point) {
        const key = point.clone().snapToGrid(this.mapGridSize).toString();
        const rects = this.map[key];
        return rects ? rects.every((rect) => !rect.containsPoint(point)) : true;
    }
}
exports.ObstacleMap = ObstacleMap;
const CACHE = new WeakMap();
function markDirty(model) {
    const state = CACHE.get(model);
    if (state) {
        state.dirty = true;
    }
}
/**
 * 绑定模型事件用于缓存失效，保证共享障碍图在下一次路由计算时重建
 */
function install(model) {
    const state = CACHE.get(model);
    if (!state || state.installed)
        return;
    model.on('reseted', () => markDirty(model));
    model.on('updated', () => markDirty(model));
    model.on('cell:added', () => markDirty(model));
    model.on('cell:removed', () => markDirty(model));
    model.on('cell:change:position', () => markDirty(model));
    model.on('cell:change:size', () => markDirty(model));
    model.on('edge:change:source', () => markDirty(model));
    model.on('edge:change:target', () => markDirty(model));
    state.installed = true;
}
/**
 * 生成与障碍图相关的选项 key，当 key 变化时触发重建，避免不同配置共用缓存
 */
function getOptionsKey(options) {
    const padding = options.paddingBox;
    const pad = padding == null
        ? 'none'
        : `${padding.x},${padding.y},${padding.width},${padding.height}`;
    const terms = (options.excludeTerminals || [])
        .map((t) => t)
        .sort()
        .join('|');
    const shapes = (options.excludeShapes || []).slice().sort().join('|');
    const nodes = (options.excludeNodes || [])
        .map((n) => (typeof n === 'string' ? n : (n === null || n === void 0 ? void 0 : n.id) || 'node'))
        .slice()
        .sort()
        .join('|');
    return `${pad}#${terms}#${shapes}#${nodes}`;
}
/**
 * 共享障碍图
 */
function getSharedObstacleMap(model, edge, options) {
    let state = CACHE.get(model);
    if (!state) {
        const map = new ObstacleMap(options).build(model, edge);
        state = {
            map,
            dirty: false,
            installed: false,
            optionsKey: getOptionsKey(options),
        };
        CACHE.set(model, state);
        install(model);
        return map;
    }
    const key = getOptionsKey(options);
    if (state.dirty || state.optionsKey !== key) {
        state.map = new ObstacleMap(options).build(model, edge);
        state.dirty = false;
        state.optionsKey = key;
    }
    return state.map;
}
//# sourceMappingURL=obstacle-map.js.map