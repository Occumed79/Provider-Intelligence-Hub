"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectorRegistry = exports.connectorPresets = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const connectors = tslib_1.__importStar(require("./main"));
exports.connectorPresets = connectors;
exports.connectorRegistry = registry_1.Registry.create({
    type: 'connector',
});
exports.connectorRegistry.register(exports.connectorPresets, true);
//# sourceMappingURL=index.js.map