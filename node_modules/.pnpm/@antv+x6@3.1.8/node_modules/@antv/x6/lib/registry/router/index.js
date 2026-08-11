"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerRegistry = exports.routerPresets = void 0;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const routers = tslib_1.__importStar(require("./main"));
exports.routerPresets = routers;
exports.routerRegistry = registry_1.Registry.create({
    type: 'router',
});
exports.routerRegistry.register(exports.routerPresets, true);
//# sourceMappingURL=index.js.map