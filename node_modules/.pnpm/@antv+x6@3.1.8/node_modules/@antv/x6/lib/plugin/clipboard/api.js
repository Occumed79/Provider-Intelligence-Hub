"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = require("../../graph");
graph_1.Graph.prototype.isClipboardEnabled = function () {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        return clipboard.isEnabled();
    }
    return false;
};
graph_1.Graph.prototype.enableClipboard = function () {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        clipboard.enable();
    }
    return this;
};
graph_1.Graph.prototype.disableClipboard = function () {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        clipboard.disable();
    }
    return this;
};
graph_1.Graph.prototype.toggleClipboard = function (enabled) {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        clipboard.toggleEnabled(enabled);
    }
    return this;
};
graph_1.Graph.prototype.isClipboardEmpty = function (options) {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        return clipboard.isEmpty(options);
    }
    return true;
};
graph_1.Graph.prototype.getCellsInClipboard = function () {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        return clipboard.getCellsInClipboard();
    }
    return [];
};
graph_1.Graph.prototype.cleanClipboard = function () {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        clipboard.clean();
    }
    return this;
};
graph_1.Graph.prototype.copy = function (cells, options) {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        clipboard.copy(cells, options);
    }
    return this;
};
graph_1.Graph.prototype.cut = function (cells, options) {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        clipboard.cut(cells, options);
    }
    return this;
};
graph_1.Graph.prototype.paste = function (options, graph) {
    const clipboard = this.getPlugin('clipboard');
    if (clipboard) {
        return clipboard.paste(options, graph);
    }
    return [];
};
//# sourceMappingURL=api.js.map