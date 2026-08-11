"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterRegistry = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const filters = tslib_1.__importStar(require("./main"));
const presets = filters;
exports.filterRegistry = registry_1.Registry.create({
    type: 'filter',
});
exports.filterRegistry.register(presets, true);
//# sourceMappingURL=index.js.map