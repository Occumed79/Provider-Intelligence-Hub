import { __decorate, __rest } from "tslib";
import { Dom, disposable } from '../common';
import { Graph } from '../graph/graph';
import { Node } from '../model/node';
import { Markup } from '../view';
import { NodeView } from '../view/node';
const ViewAction = 'html';
const HTMLShapeMaps = {};
/**
 * HTML shape
 */
export class HTML extends Node {
    /**
     * HTML.register
     * @param config
     */
    static register(config) {
        const { shape, html, effect, inherit } = config, others = __rest(config, ["shape", "html", "effect", "inherit"]);
        if (!shape) {
            throw new Error('HTML.register should specify `shape` in config.');
        }
        HTMLShapeMaps[shape] = {
            html,
            effect,
        };
        Graph.registerNode(shape, Object.assign({ inherit: inherit || 'html' }, others), true);
    }
}
HTML.config({
    view: 'html-view',
    markup: [
        {
            tagName: 'rect',
            selector: 'body',
        },
        Object.assign({}, Markup.getForeignObjectMarkup()),
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
Node.registry.register('html', HTML, true);
/**
 * HTML node view
 */
class View extends NodeView {
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
            Dom.empty(container);
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
                    Dom.append(container, html);
                }
            }
        }
    }
    dispose() {
        this.cell.off('change:*', this.onCellChangeAny, this);
    }
}
__decorate([
    disposable()
], View.prototype, "dispose", null);
View.config({
    bootstrap: [ViewAction],
    actions: {
        html: ViewAction,
    },
});
NodeView.registry.register('html-view', View, true);
//# sourceMappingURL=html.js.map