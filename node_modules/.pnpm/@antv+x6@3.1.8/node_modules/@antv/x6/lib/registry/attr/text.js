"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayEmpty = exports.eol = exports.annotations = exports.textPath = exports.textVerticalAnchor = exports.lineHeight = exports.textWrap = exports.text = void 0;
const common_1 = require("../../common");
exports.text = {
    qualify(_text, { attrs }) {
        return attrs.textWrap == null || !common_1.ObjectExt.isPlainObject(attrs.textWrap);
    },
    set(text, { view, elem, attrs }) {
        const cacheName = 'x6-text';
        const cache = common_1.Dom.data(elem, cacheName);
        const json = (str) => {
            try {
                if (typeof str === 'string') {
                    return JSON.parse(str);
                }
            }
            catch (_error) {
                // Not a valid JSON string, return as is.
            }
            return str;
        };
        const options = {
            x: attrs.x,
            eol: attrs.eol,
            annotations: json(attrs.annotations),
            textPath: json(attrs['text-path'] || attrs.textPath),
            textVerticalAnchor: (attrs['text-vertical-anchor'] ||
                attrs.textVerticalAnchor),
            displayEmpty: (attrs['display-empty'] || attrs.displayEmpty) === 'true',
            lineHeight: (attrs['line-height'] || attrs.lineHeight),
        };
        const fontSize = (attrs['font-size'] || attrs.fontSize);
        const textHash = JSON.stringify([text, options]);
        if (fontSize) {
            elem.setAttribute('font-size', fontSize);
        }
        // Updates the text only if there was a change in the string
        // or any of its attributes.
        if (cache == null || cache !== textHash) {
            const textPath = options.textPath;
            if (textPath != null && typeof textPath === 'object') {
                const selector = textPath.selector;
                if (typeof selector === 'string') {
                    const pathNode = view.find(selector)[0];
                    if (pathNode instanceof SVGPathElement) {
                        common_1.Dom.ensureId(pathNode);
                        options.textPath = Object.assign({ 'xlink:href': `#${pathNode.id}` }, textPath);
                    }
                }
            }
            common_1.Dom.text(elem, `${text}`, options);
            common_1.Dom.data(elem, cacheName, textHash);
        }
    },
};
exports.textWrap = {
    qualify: common_1.ObjectExt.isPlainObject,
    set(val, { view, elem, attrs, refBBox }) {
        var _a, _b;
        const info = val;
        // option `width`
        const width = info.width || 0;
        if (common_1.NumberExt.isPercentage(width)) {
            refBBox.width *= parseFloat(width) / 100;
            // @ts-expect-error
        }
        else if (width <= 0) {
            refBBox.width += width;
        }
        else {
            refBBox.width = width;
        }
        // option `height`
        const height = info.height || 0;
        if (common_1.NumberExt.isPercentage(height)) {
            refBBox.height *= parseFloat(height) / 100;
            // @ts-expect-error
        }
        else if (height <= 0) {
            refBBox.height += height;
        }
        else {
            refBBox.height = height;
        }
        // option `text`
        let wrappedText;
        const txt = (_b = (_a = info.text) !== null && _a !== void 0 ? _a : attrs.text) !== null && _b !== void 0 ? _b : elem === null || elem === void 0 ? void 0 : elem.textContent;
        if (txt != null) {
            wrappedText = common_1.Dom.breakText(`${txt}`, refBBox, {
                'font-weight': attrs['font-weight'] || attrs.fontWeight,
                'font-size': attrs['font-size'] || attrs.fontSize,
                'font-family': attrs['font-family'] || attrs.fontFamily,
                lineHeight: attrs.lineHeight,
            }, {
                ellipsis: info.ellipsis,
            });
        }
        else {
            wrappedText = '';
        }
        common_1.FunctionExt.call(exports.text.set, this, wrappedText, {
            view,
            elem,
            attrs,
            refBBox,
            cell: view.cell,
        });
    },
};
const isTextInUse = (_val, { attrs }) => {
    return attrs.text !== undefined;
};
exports.lineHeight = {
    qualify: isTextInUse,
};
exports.textVerticalAnchor = {
    qualify: isTextInUse,
};
exports.textPath = {
    qualify: isTextInUse,
};
exports.annotations = {
    qualify: isTextInUse,
};
exports.eol = {
    qualify: isTextInUse,
};
exports.displayEmpty = {
    qualify: isTextInUse,
};
//# sourceMappingURL=text.js.map