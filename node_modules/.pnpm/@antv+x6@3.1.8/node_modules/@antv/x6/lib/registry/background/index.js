"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backgroundRegistry = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const patterns = tslib_1.__importStar(require("./main"));
const presets = Object.assign({}, patterns);
presets['flip-x'] = patterns.flipX;
presets['flip-y'] = patterns.flipY;
presets['flip-xy'] = patterns.flipXY;
exports.backgroundRegistry = registry_1.Registry.create({
    type: 'background pattern',
});
exports.backgroundRegistry.register(presets, true);
//# sourceMappingURL=index.js.map