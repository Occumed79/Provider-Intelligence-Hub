import { __rest } from "tslib";
import { ObjectExt } from '../common';
import { Node } from '../model';
export const BaseBodyAttr = {
    fill: '#ffffff',
    stroke: '#333333',
    strokeWidth: 2,
};
export const BaseLabelAttr = {
    fontSize: 14,
    fill: '#000000',
    refX: 0.5,
    refY: 0.5,
    textAnchor: 'middle',
    textVerticalAnchor: 'middle',
    fontFamily: 'Arial, helvetica, sans-serif',
};
export class Base extends Node {
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
Base.config({
    attrs: { text: Object.assign({}, BaseLabelAttr) },
    propHooks(metadata) {
        const { label } = metadata, others = __rest(metadata, ["label"]);
        if (label != null) {
            ObjectExt.setByPath(others, 'attrs/text/text', label);
        }
        return others;
    },
    visible: true,
});
//# sourceMappingURL=base.js.map