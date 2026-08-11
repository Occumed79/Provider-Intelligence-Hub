"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlighterRegistry = void 0;
exports.highlighterCheck = highlighterCheck;
const tslib_1 = require("tslib");
const registry_1 = require("../registry");
const highlighters = tslib_1.__importStar(require("./main"));
function highlighterCheck(name, highlighter) {
    if (typeof highlighter.highlight !== 'function') {
        throw new Error(`Highlighter '${name}' is missing required \`highlight()\` method`);
    }
    if (typeof highlighter.unhighlight !== 'function') {
        throw new Error(`Highlighter '${name}' is missing required \`unhighlight()\` method`);
    }
}
const presets = highlighters;
exports.highlighterRegistry = registry_1.Registry.create({
    type: 'highlighter',
});
exports.highlighterRegistry.register(presets, true);
//# sourceMappingURL=index.js.map