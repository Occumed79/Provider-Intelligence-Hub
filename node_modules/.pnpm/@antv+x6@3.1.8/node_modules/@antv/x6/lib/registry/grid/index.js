"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gridRegistry = exports.gridPresets = exports.Grid = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const registry_1 = require("../registry");
const patterns = tslib_1.__importStar(require("./main"));
class Grid {
    constructor() {
        this.patterns = {};
        this.root = common_1.Vector.create(common_1.Dom.createSvgDocument(), {
            width: '100%',
            height: '100%',
        }, [common_1.Dom.createSvgElement('defs')]).node;
    }
    add(id, elem) {
        const firstChild = this.root.childNodes[0];
        if (firstChild) {
            firstChild.appendChild(elem);
        }
        this.patterns[id] = elem;
        common_1.Vector.create('rect', {
            width: '100%',
            height: '100%',
            fill: `url(#${id})`,
        }).appendTo(this.root);
    }
    get(id) {
        return this.patterns[id];
    }
    has(id) {
        return this.patterns[id] != null;
    }
}
exports.Grid = Grid;
exports.gridPresets = patterns;
exports.gridRegistry = registry_1.Registry.create({
    type: 'grid',
});
exports.gridRegistry.register(exports.gridPresets, true);
//# sourceMappingURL=index.js.map