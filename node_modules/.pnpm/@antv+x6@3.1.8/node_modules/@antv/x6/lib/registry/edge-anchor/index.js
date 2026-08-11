"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edgeAnchorRegistry = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const anchors = tslib_1.__importStar(require("./main"));
const presets = anchors;
exports.edgeAnchorRegistry = registry_1.Registry.create({
    type: 'edge endpoint',
});
exports.edgeAnchorRegistry.register(presets, true);
//# sourceMappingURL=index.js.map