import { __rest } from "tslib";
import { Dom, FunctionExt, ObjectExt, SUPPORT_FOREIGNOBJECT } from '../common';
import { attrPresets } from '../registry';
import { Base, BaseBodyAttr } from './base';
export function getTextBlockMarkup(supportForeignobject) {
    return supportForeignobject
        ? {
            tagName: 'foreignObject',
            selector: 'foreignObject',
            children: [
                {
                    tagName: 'div',
                    ns: Dom.ns.xhtml,
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
export const TextBlockConfig = {
    shape: 'text-block',
    markup: [
        {
            tagName: 'rect',
            selector: 'body',
        },
        getTextBlockMarkup(SUPPORT_FOREIGNOBJECT),
    ],
    attrs: {
        body: Object.assign(Object.assign({}, BaseBodyAttr), { refWidth: '100%', refHeight: '100%' }),
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
        const { text } = metadata, others = __rest(metadata, ["text"]);
        if (text) {
            ObjectExt.setByPath(others, 'attrs/label/text', text);
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
                    const textWrap = attrPresets.textWrap;
                    FunctionExt.call(textWrap.set, this, wrapValue, {
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
export const TextBlock = Base.define(TextBlockConfig);
//# sourceMappingURL=text-block.js.map