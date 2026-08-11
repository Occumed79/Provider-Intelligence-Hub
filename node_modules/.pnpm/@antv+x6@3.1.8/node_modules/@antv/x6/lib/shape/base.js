"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = exports.BaseLabelAttr = exports.BaseBodyAttr = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const model_1 = require("../model");
exports.BaseBodyAttr = {
    fill: '#ffffff',
    stroke: '#333333',
    strokeWidth: 2,
};
exports.BaseLabelAttr = {
    fontSize: 14,
    fill: '#000000',
    refX: 0.5,
    refY: 0.5,
    textAnchor: 'middle',
    textVerticalAnchor: 'middle',
    fontFamily: 'Arial, helvetica, sans-serif',
};
class Base extends model_1.Node {
    get label() {
        return this.getLabel();
    }
    set label(val) {
        this.setLabel(val);
    }
    getLabel() {
        return this.getAttrByPath('text/text');
    }
    setLabel(label, options) {
        if (label == null) {
            this.removeLabel();
        }
        else {
            this.setAttrByPath('text/text', label, options);
        }
        return this;
    }
    removeLabel() {
        this.removeAttrByPath('text/text');
        return this;
    }
}
exports.Base = Base;
Base.config({
    attrs: { text: Object.assign({}, exports.BaseLabelAttr) },
    propHooks(metadata) {
        const { label } = metadata, others = tslib_1.__rest(metadata, ["label"]);
        if (label != null) {
            common_1.ObjectExt.setByPath(others, 'attrs/text/text', label);
        }
        return others;
    },
    visible: true,
});
//# sourceMappingURL=base.js.map