"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const base_1 = require("./base");
exports.Path = base_1.Base.define({
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
        const { path } = metadata, others = tslib_1.__rest(metadata, ["path"]);
        if (path) {
            common_1.ObjectExt.setByPath(others, 'attrs/body/refD', path);
        }
        return others;
    },
});
//# sourceMappingURL=path.js.map