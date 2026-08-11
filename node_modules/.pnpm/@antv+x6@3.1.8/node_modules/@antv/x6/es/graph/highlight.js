import { __decorate } from "tslib";
import { Dom, disposable } from '../common';
import { highlighterCheck, highlighterRegistry } from '../registry';
import { Base } from './base';
export class HighlightManager extends Base {
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
        const highlighter = highlighterRegistry.get(name);
        if (highlighter == null) {
            return highlighterRegistry.onNotFound(name);
        }
        highlighterCheck(name, highlighter);
        return {
            name,
            highlighter,
            args: def.args || {},
        };
    }
    getHighlighterId(magnet, options) {
        Dom.ensureId(magnet);
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
__decorate([
    disposable()
], HighlightManager.prototype, "dispose", null);
//# sourceMappingURL=highlight.js.map