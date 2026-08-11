"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarkup = getMarkup;
exports.getImageUrlHook = getImageUrlHook;
exports.createShape = createShape;
exports.pointsToString = pointsToString;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const geometry_1 = require("../geometry");
const base_1 = require("./base");
function getMarkup(tagName, selector = 'body') {
    return [
        {
            tagName,
            selector,
        },
        {
            tagName: 'text',
            selector: 'label',
        },
    ];
}
function getImageUrlHook(attrName = 'xlink:href') {
    const hook = (metadata) => {
        const { imageUrl, imageWidth, imageHeight } = metadata, others = tslib_1.__rest(metadata, ["imageUrl", "imageWidth", "imageHeight"]);
        if (imageUrl != null || imageWidth != null || imageHeight != null) {
            const apply = () => {
                if (others.attrs) {
                    const image = others.attrs.image;
                    if (imageUrl != null) {
                        image[attrName] = imageUrl;
                    }
                    if (imageWidth != null) {
                        image.width = imageWidth;
                    }
                    if (imageHeight != null) {
                        image.height = imageHeight;
                    }
                    others.attrs.image = image;
                }
            };
            if (others.attrs) {
                if (others.attrs.image == null) {
                    others.attrs.image = {};
                }
                apply();
            }
            else {
                others.attrs = {
                    image: {},
                };
                apply();
            }
        }
        return others;
    };
    return hook;
}
function createShape(shape, config, options = {}) {
    const defaults = {
        constructorName: shape,
        markup: getMarkup(shape, options.selector),
        attrs: {
            [shape]: Object.assign({}, base_1.BaseBodyAttr),
        },
    };
    const base = options.parent || base_1.Base;
    return base.define(common_1.ObjectExt.merge(defaults, config, { shape }));
}
function pointsToString(points) {
    return typeof points === 'string'
        ? points
        : points
            .map((p) => {
            if (Array.isArray(p)) {
                return p.join(',');
            }
            if (geometry_1.Point.isPointLike(p)) {
                return `${p.x}, ${p.y}`;
            }
            return '';
        })
            .join(' ');
}
//# sourceMappingURL=util.js.map