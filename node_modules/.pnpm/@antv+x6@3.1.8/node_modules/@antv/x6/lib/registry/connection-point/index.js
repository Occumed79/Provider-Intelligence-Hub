"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionPointRegistry = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const connectionPoints = tslib_1.__importStar(require("./main"));
const presets = connectionPoints;
exports.connectionPointRegistry = registry_1.Registry.create({
    type: 'connection point',
});
exports.connectionPointRegistry.register(presets, true);
//# sourceMappingURL=index.js.map