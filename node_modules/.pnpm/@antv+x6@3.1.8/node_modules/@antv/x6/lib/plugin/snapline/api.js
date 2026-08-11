"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = require("../../graph");
graph_1.Graph.prototype.isSnaplineEnabled = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        return snapline.isEnabled();
    }
    return false;
};
graph_1.Graph.prototype.enableSnapline = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.enable();
    }
    return this;
};
graph_1.Graph.prototype.disableSnapline = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.disable();
    }
    return this;
};
graph_1.Graph.prototype.toggleSnapline = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.toggleEnabled();
    }
    return this;
};
graph_1.Graph.prototype.hideSnapline = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.hide();
    }
    return this;
};
graph_1.Graph.prototype.setSnaplineFilter = function (filter) {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.setFilter(filter);
    }
    return this;
};
graph_1.Graph.prototype.isSnaplineOnResizingEnabled = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        return snapline.isOnResizingEnabled();
    }
    return false;
};
graph_1.Graph.prototype.enableSnaplineOnResizing = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.enableOnResizing();
    }
    return this;
};
graph_1.Graph.prototype.disableSnaplineOnResizing = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.disableOnResizing();
    }
    return this;
};
graph_1.Graph.prototype.toggleSnaplineOnResizing = function (enableOnResizing) {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.toggleOnResizing(enableOnResizing);
    }
    return this;
};
graph_1.Graph.prototype.isSharpSnapline = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        return snapline.isSharp();
    }
    return false;
};
graph_1.Graph.prototype.enableSharpSnapline = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.enableSharp();
    }
    return this;
};
graph_1.Graph.prototype.disableSharpSnapline = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.disableSharp();
    }
    return this;
};
graph_1.Graph.prototype.toggleSharpSnapline = function (sharp) {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.toggleSharp(sharp);
    }
    return this;
};
graph_1.Graph.prototype.getSnaplineTolerance = function () {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        return snapline.getTolerance();
    }
};
graph_1.Graph.prototype.setSnaplineTolerance = function (tolerance) {
    const snapline = this.getPlugin('snapline');
    if (snapline) {
        snapline.setTolerance(tolerance);
    }
    return this;
};
//# sourceMappingURL=api.js.map