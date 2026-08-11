import { __rest } from "tslib";
import { ObjectExt } from '../common';
import { Base } from './base';
export const Path = Base.define({
    shape: 'path',
    markup: [
        {
            tagName: 'rect',
            selector: 'bg',
        },
        {
            tagName: 'path',
            selector: 'body',
        },
        {
            tagName: 'text',
            selector: 'label',
        },
    ],
    attrs: {
        bg: {
            refWidth: '100%',
            refHeight: '100%',
            fill: 'none',
            stroke: 'none',
            pointerEvents: 'all',
        },
        body: {
            fill: 'none',
            stroke: '#000',
            strokeWidth: 2,
        },
    },
    propHooks(metadata) {
        const { path } = metadata, others = __rest(metadata, ["path"]);
        if (path) {
            ObjectExt.setByPath(others, 'attrs/body/refD', path);
        }
        return others;
    },
});
//# sourceMappingURL=path.js.map