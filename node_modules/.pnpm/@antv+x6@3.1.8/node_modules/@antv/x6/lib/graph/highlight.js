"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightManager = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const registry_1 = require("../registry");
const base_1 = require("./base");
class HighlightManager extends base_1.Base {
    constructor() {
        super(...arguments);
        this.highlights = {};
    }
    init() {
        this.startListening();
    }
    startListening() {
        this.graph.on('cell:highlight', this.onCellHighlight, this);
        this.graph.on('cell:unhighlight', this.onCellUnhighlight, this);
    }
    stopListening() {
        this.graph.off('cell:highlight', this.onCellHighlight, this);
        this.graph.off('cell:unhighlight', this.onCellUnhighlight, this);
    }
    onCellHighlight({ view: cellView, magnet, options = {}, }) {
        const resolved = this.resolveHighlighter(options);
        if (!resolved) {
            return;
        }
        const key = this.getHighlighterId(magnet, resolved);
        if (!this.highlights[key]) {
            const highlighter = resolved.highlighter;
            highlighter.highlight(cellView, magnet, Object.assign({}, resolved.args));
            this.highlights[key] = {
                cellView,
                magnet,
                highlighter,
                args: resolved.args,
            };
        }
    }
    onCellUnhighlight({ magnet, options = {}, }) {
        const resolved = this.resolveHighlighter(options);
        if (!resolved) {
            return;
        }
        const id = this.getHighlighterId(magnet, resolved);
        this.unhighlight(id);
    }
    resolveHighlighter(options) {
        const graphOptions = this.options;
        let highlighterDef = options.highlighter;
        if (highlighterDef == null) {
            // check for built-in types
            const type = options.type;
            highlighterDef =
                (type && graphOptions.highlighting[type]) ||
                    graphOptions.highlighting.default;
        }
        if (highlighterDef == null) {
            return null;
        }
        const def = typeof highlighterDef === 'string'
            ? {
                name: highlighterDef,
            }
            : highlighterDef;
        const name = def.name;
        const highlighter = registry_1.highlighterRegistry.get(name);
        if (highlighter == null) {
            return registry_1.highlighterRegistry.onNotFound(name);
        }
        (0, registry_1.highlighterCheck)(name, highlighter);
        return {
            name,
            highlighter,
            args: def.args || {},
        };
    }
    getHighlighterId(magnet, options) {
        common_1.Dom.ensureId(magnet);
        return options.name + magnet.id + JSON.stringify(options.args);
    }
    unhighlight(id) {
        const highlight = this.highlights[id];
        if (highlight) {
            highlight.highlighter.unhighlight(highlight.cellView, highlight.magnet, highlight.args);
            delete this.highlights[id];
        }
    }
    dispose() {
        Object.keys(this.highlights).forEach((id) => this.unhighlight(id));
        this.stopListening();
    }
}
exports.HighlightManager = HighlightManager;
tslib_1.__decorate([
    (0, common_1.disposable)()
], HighlightManager.prototype, "dispose", null);
//# sourceMappingURL=highlight.js.map