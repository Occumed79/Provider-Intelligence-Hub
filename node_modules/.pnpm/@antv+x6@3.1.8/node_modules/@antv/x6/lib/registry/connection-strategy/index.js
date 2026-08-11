"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionStrategyRegistry = exports.connectionStrategyPresets = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const strategies = tslib_1.__importStar(require("./main"));
exports.connectionStrategyPresets = strategies;
exports.connectionStrategyRegistry = registry_1.Registry.create({
    type: 'connection strategy',
});
exports.connectionStrategyRegistry.register(exports.connectionStrategyPresets, true);
//# sourceMappingURL=index.js.map