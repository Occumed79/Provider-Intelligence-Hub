"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTML = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const graph_1 = require("../graph/graph");
const node_1 = require("../model/node");
const view_1 = require("../view");
const node_2 = require("../view/node");
const ViewAction = 'html';
const HTMLShapeMaps = {};
/**
 * HTML shape
 */
class HTML extends node_1.Node {
    /**
     * HTML.register
     * @param config
     */
    static register(config) {
        const { shape, html, effect, inherit } = config, others = tslib_1.__rest(config, ["shape", "html", "effect", "inherit"]);
        if (!shape) {
            throw new Error('HTML.register should specify `shape` in config.');
        }
        HTMLShapeMaps[shape] = {
            html,
            effect,
        };
        graph_1.Graph.registerNode(shape, Object.assign({ inherit: inherit || 'html' }, others), true);
    }
}
exports.HTML = HTML;
HTML.config({
    view: 'html-view',
    markup: [
        {
            tagName: 'rect',
            selector: 'body',
        },
        Object.assign({}, view_1.Markup.getForeignObjectMarkup()),
        {
            tagName: 'text',
            selector: 'label',
        },
    ],
    attrs: {
        body: {
            fill: 'none',
            stroke: 'none',
            refWidth: '100%',
            refHeight: '100%',
        },
        fo: {
            refWidth: '100%',
            refHeight: '100%',
        },
    },
});
node_1.Node.registry.register('html', HTML, true);
/**
 * HTML node view
 */
class View extends node_2.NodeView {
    init() {
        super.init();
        this.cell.on('change:*', this.onCellChangeAny, this);
    }
    onCellChangeAny({ key }) {
        const content = HTMLShapeMaps[this.cell.shape];
        if (content) {
            const { effect } = content;
            if (!effect || effect.includes(key)) {
                this.renderHTMLComponent();
            }
        }
    }
    confirmUpdate(flag) {
        const ret = super.confirmUpdate(flag);
        return this.handleAction(ret, ViewAction, () => this.renderHTMLComponent());
    }
    renderHTMLComponent() {
        const container = this.selectors && this.selectors.foContent;
        if (container) {
            common_1.Dom.empty(container);
            const content = HTMLShapeMaps[this.cell.shape];
            if (!content) {
                return;
            }
            let { html } = content;
            if (typeof html === 'function') {
                html = html(this.cell);
            }
            if (html) {
                if (typeof html === 'string') {
                    container.innerHTML = html;
                }
                else {
                    common_1.Dom.append(container, html);
                }
            }
        }
    }
    dispose() {
        this.cell.off('change:*', this.onCellChangeAny, this);
    }
}
tslib_1.__decorate([
    (0, common_1.disposable)()
], View.prototype, "dispose", null);
View.config({
    bootstrap: [ViewAction],
    actions: {
        html: ViewAction,
    },
});
node_2.NodeView.registry.register('html-view', View, true);
//# sourceMappingURL=html.js.map