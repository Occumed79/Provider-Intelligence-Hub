"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portLabelLayoutRegistry = exports.portLabelLayoutPresets = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const layouts = tslib_1.__importStar(require("./main"));
exports.portLabelLayoutPresets = layouts;
exports.portLabelLayoutRegistry = registry_1.Registry.create({
    type: 'port label layout',
});
exports.portLabelLayoutRegistry.register(exports.portLabelLayoutPresets, true);
//# sourceMappingURL=index.js.map