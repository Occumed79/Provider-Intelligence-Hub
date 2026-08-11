"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = require("../../graph");
graph_1.Graph.prototype.isSelectionEnabled = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.isEnabled();
    }
    return false;
};
graph_1.Graph.prototype.enableSelection = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.enable();
    }
    return this;
};
graph_1.Graph.prototype.disableSelection = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.disable();
    }
    return this;
};
graph_1.Graph.prototype.toggleSelection = function (enabled) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.toggleEnabled(enabled);
    }
    return this;
};
graph_1.Graph.prototype.isMultipleSelection = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.isMultipleSelection();
    }
    return false;
};
graph_1.Graph.prototype.enableMultipleSelection = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.enableMultipleSelection();
    }
    return this;
};
graph_1.Graph.prototype.disableMultipleSelection = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.disableMultipleSelection();
    }
    return this;
};
graph_1.Graph.prototype.toggleMultipleSelection = function (multiple) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.toggleMultipleSelection(multiple);
    }
    return this;
};
graph_1.Graph.prototype.isSelectionMovable = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.isSelectionMovable();
    }
    return false;
};
graph_1.Graph.prototype.enableSelectionMovable = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.enableSelectionMovable();
    }
    return this;
};
graph_1.Graph.prototype.disableSelectionMovable = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.disableSelectionMovable();
    }
    return this;
};
graph_1.Graph.prototype.toggleSelectionMovable = function (movable) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.toggleSelectionMovable(movable);
    }
    return this;
};
graph_1.Graph.prototype.isRubberbandEnabled = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.isRubberbandEnabled();
    }
    return false;
};
graph_1.Graph.prototype.enableRubberband = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.enableRubberband();
    }
    return this;
};
graph_1.Graph.prototype.disableRubberband = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.disableRubberband();
    }
    return this;
};
graph_1.Graph.prototype.toggleRubberband = function (enabled) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.toggleRubberband(enabled);
    }
    return this;
};
graph_1.Graph.prototype.isStrictRubberband = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.isStrictRubberband();
    }
    return false;
};
graph_1.Graph.prototype.enableStrictRubberband = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.enableStrictRubberband();
    }
    return this;
};
graph_1.Graph.prototype.disableStrictRubberband = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.disableStrictRubberband();
    }
    return this;
};
graph_1.Graph.prototype.toggleStrictRubberband = function (strict) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.toggleStrictRubberband(strict);
    }
    return this;
};
graph_1.Graph.prototype.setRubberbandModifiers = function (modifiers) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.setRubberbandModifiers(modifiers);
    }
    return this;
};
graph_1.Graph.prototype.setSelectionFilter = function (filter) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.setSelectionFilter(filter);
    }
    return this;
};
graph_1.Graph.prototype.setSelectionDisplayContent = function (content) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.setSelectionDisplayContent(content);
    }
    return this;
};
graph_1.Graph.prototype.isSelectionEmpty = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.isEmpty();
    }
    return true;
};
graph_1.Graph.prototype.cleanSelection = function (options) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.clean(options);
    }
    return this;
};
graph_1.Graph.prototype.resetSelection = function (cells, options) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.reset(cells, options);
    }
    return this;
};
graph_1.Graph.prototype.getSelectedCells = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.getSelectedCells();
    }
    return [];
};
graph_1.Graph.prototype.getSelectedCellCount = function () {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.getSelectedCellCount();
    }
    return 0;
};
graph_1.Graph.prototype.isSelected = function (cell) {
    const selection = this.getPlugin('selection');
    if (selection) {
        return selection.isSelected(cell);
    }
    return false;
};
graph_1.Graph.prototype.select = function (cells, options) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.select(cells, options);
    }
    return this;
};
graph_1.Graph.prototype.unselect = function (cells, options) {
    const selection = this.getPlugin('selection');
    if (selection) {
        selection.unselect(cells, options);
    }
    return this;
};
//# sourceMappingURL=api.js.map