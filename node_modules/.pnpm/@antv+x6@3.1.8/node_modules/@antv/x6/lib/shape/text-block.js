"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextBlock = exports.TextBlockConfig = void 0;
exports.getTextBlockMarkup = getTextBlockMarkup;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const registry_1 = require("../registry");
const base_1 = require("./base");
function getTextBlockMarkup(supportForeignobject) {
    return supportForeignobject
        ? {
            tagName: 'foreignObject',
            selector: 'foreignObject',
            children: [
                {
                    tagName: 'div',
                    ns: common_1.Dom.ns.xhtml,
                    selector: 'label',
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'static',
                        backgroundColor: 'transparent',
                        textAlign: 'center',
                        margin: 0,
                        padding: '0px 5px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                },
            ],
        }
        : {
            tagName: 'text',
            selector: 'label',
            attrs: {
                textAnchor: 'middle',
            },
        };
}
exports.TextBlockConfig = {
    shape: 'text-block',
    markup: [
        {
            tagName: 'rect',
            selector: 'body',
        },
        getTextBlockMarkup(common_1.SUPPORT_FOREIGNOBJECT),
    ],
    attrs: {
        body: Object.assign(Object.assign({}, base_1.BaseBodyAttr), { refWidth: '100%', refHeight: '100%' }),
        foreignObject: {
            refWidth: '100%',
            refHeight: '100%',
        },
        label: {
            style: {
                fontSize: 14,
            },
        },
    },
    propHooks(metadata) {
        const { text } = metadata, others = tslib_1.__rest(metadata, ["text"]);
        if (text) {
            common_1.ObjectExt.setByPath(others, 'attrs/label/text', text);
        }
        return others;
    },
    attrHooks: {
        text: {
            set(text, { cell, view, refBBox, elem, attrs }) {
                if (elem instanceof HTMLElement) {
                    elem.textContent = text;
                }
                else {
                    // No foreign object
                    const style = attrs.style || {};
                    const wrapValue = { text, width: -5, height: '100%' };
                    const wrapAttrs = Object.assign({ textVerticalAnchor: 'middle' }, style);
                    const textWrap = registry_1.attrPresets.textWrap;
                    common_1.FunctionExt.call(textWrap.set, this, wrapValue, {
                        cell,
                        view,
                        elem,
                        refBBox,
                        attrs: wrapAttrs,
                    });
                    return { fill: style.color || null };
                }
            },
            position(text, { refBBox, elem }) {
                if (elem instanceof SVGElement) {
                    return refBBox.getCenter();
                }
            },
        },
    },
};
exports.TextBlock = base_1.Base.define(exports.TextBlockConfig);
//# sourceMappingURL=text-block.js.map