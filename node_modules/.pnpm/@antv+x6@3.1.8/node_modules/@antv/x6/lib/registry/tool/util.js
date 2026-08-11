"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnchor = getAnchor;
exports.getViewBBox = getViewBBox;
const common_1 = require("../../common");
const connection_strategy_1 = require("../connection-strategy");
function getAnchor(pos, terminalView, terminalMagnet, type) {
    const end = common_1.FunctionExt.call(connection_strategy_1.connectionStrategyPresets.pinRelative, this.graph, {}, terminalView, terminalMagnet, pos, this.cell, type, {});
    return end.anchor;
}
function getViewBBox(view, quick) {
    if (quick) {
        return view.cell.getBBox();
    }
    return view.cell.isEdge()
        ? view.getConnection().bbox()
        : view.getUnrotatedBBoxOfElement(view.container);
}
//# sourceMappingURL=util.js.map