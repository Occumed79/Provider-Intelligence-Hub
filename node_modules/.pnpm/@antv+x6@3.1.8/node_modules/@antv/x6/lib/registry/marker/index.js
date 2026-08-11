"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markerNormalize = exports.markerRegistry = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const markers = tslib_1.__importStar(require("./main"));
const util_1 = require("./util");
const presets = markers;
exports.markerRegistry = registry_1.Registry.create({
    type: 'marker',
});
exports.markerRegistry.register(presets, true);
exports.markerNormalize = util_1.normalize;
//# sourceMappingURL=index.js.map