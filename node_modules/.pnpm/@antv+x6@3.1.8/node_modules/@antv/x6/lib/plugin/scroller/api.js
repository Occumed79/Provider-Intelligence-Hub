"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = require("../../graph");
graph_1.Graph.prototype.lockScroller = function () {
    const scroller = this.getPlugin('scroller');
    if (scroller) {
        scroller.lockScroller();
    }
    return this;
};
graph_1.Graph.prototype.unlockScroller = function () {
    const scroller = this.getPlugin('scroller');
    if (scroller) {
        scroller.unlockScroller();
    }
    return this;
};
graph_1.Graph.prototype.updateScroller = function () {
    const scroller = this.getPlugin('scroller');
    if (scroller) {
        scroller.updateScroller();
    }
    return this;
};
graph_1.Graph.prototype.getScrollbarPosition = function () {
    const scroller = this.getPlugin('scroller');
    if (scroller) {
        return scroller.getScrollbarPosition();
    }
    return {
        left: 0,
        top: 0,
    };
};
graph_1.Graph.prototype.setScrollbarPosition = function (left, top) {
    const scroller = this.getPlugin('scroller');
    if (scroller) {
        scroller.setScrollbarPosition(left, top);
    }
    return this;
};
//# sourceMappingURL=api.js.map