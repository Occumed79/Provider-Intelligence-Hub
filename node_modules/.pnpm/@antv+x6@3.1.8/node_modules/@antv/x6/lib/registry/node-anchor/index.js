"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeAnchorRegistry = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const anchors = tslib_1.__importStar(require("./main"));
const presets = anchors;
exports.nodeAnchorRegistry = registry_1.Registry.create({
    type: 'node endpoint',
});
exports.nodeAnchorRegistry.register(presets, true);
//# sourceMappingURL=index.js.map