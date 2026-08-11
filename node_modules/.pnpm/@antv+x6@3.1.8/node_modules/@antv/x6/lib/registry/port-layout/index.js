"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portLayoutRegistry = exports.portLayoutPresets = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const layouts = tslib_1.__importStar(require("./main"));
exports.portLayoutPresets = layouts;
exports.portLayoutRegistry = registry_1.Registry.create({
    type: 'port layout',
});
exports.portLayoutRegistry.register(exports.portLayoutPresets, true);
//# sourceMappingURL=index.js.map