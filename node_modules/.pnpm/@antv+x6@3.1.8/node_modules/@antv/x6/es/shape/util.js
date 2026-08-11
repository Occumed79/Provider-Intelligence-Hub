import { __rest } from "tslib";
import { ObjectExt } from '../common';
import { Point } from '../geometry';
import { Base, BaseBodyAttr } from './base';
export function getMarkup(tagName, selector = 'body') {
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
export function getImageUrlHook(attrName = 'xlink:href') {
    const hook = (metadata) => {
        const { imageUrl, imageWidth, imageHeight } = metadata, others = __rest(metadata, ["imageUrl", "imageWidth", "imageHeight"]);
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
export function createShape(shape, config, options = {}) {
    const defaults = {
        constructorName: shape,
        markup: getMarkup(shape, options.selector),
        attrs: {
            [shape]: Object.assign({}, BaseBodyAttr),
        },
    };
    const base = options.parent || Base;
    return base.define(ObjectExt.merge(defaults, config, { shape }));
}
export function pointsToString(points) {
    return typeof points === 'string'
        ? points
        : points
            .map((p) => {
            if (Array.isArray(p)) {
                return p.join(',');
            }
            if (Point.isPointLike(p)) {
                return `${p.x}, ${p.y}`;
            }
            return '';
        })
            .join(' ');
}
//# sourceMappingURL=util.js.map