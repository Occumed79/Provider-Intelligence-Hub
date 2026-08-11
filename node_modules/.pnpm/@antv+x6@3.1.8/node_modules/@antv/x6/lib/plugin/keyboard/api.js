"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = require("../../graph");
graph_1.Graph.prototype.isKeyboardEnabled = function () {
    const keyboard = this.getPlugin('keyboard');
    if (keyboard) {
        return keyboard.isEnabled();
    }
    return false;
};
graph_1.Graph.prototype.enableKeyboard = function () {
    const keyboard = this.getPlugin('keyboard');
    if (keyboard) {
        keyboard.enable();
    }
    return this;
};
graph_1.Graph.prototype.disableKeyboard = function () {
    const keyboard = this.getPlugin('keyboard');
    if (keyboard) {
        keyboard.disable();
    }
    return this;
};
graph_1.Graph.prototype.toggleKeyboard = function (enabled) {
    const keyboard = this.getPlugin('keyboard');
    if (keyboard) {
        keyboard.toggleEnabled(enabled);
    }
    return this;
};
graph_1.Graph.prototype.bindKey = function (keys, callback, action) {
    const keyboard = this.getPlugin('keyboard');
    if (keyboard) {
        keyboard.bindKey(keys, callback, action);
    }
    return this;
};
graph_1.Graph.prototype.unbindKey = function (keys, action) {
    const keyboard = this.getPlugin('keyboard');
    if (keyboard) {
        keyboard.unbindKey(keys, action);
    }
    return this;
};
graph_1.Graph.prototype.clearKeys = function () {
    const keyboard = this.getPlugin('keyboard');
    if (keyboard) {
        keyboard.clear();
    }
    return this;
};
graph_1.Graph.prototype.triggerKey = function (key, action) {
    const keyboard = this.getPlugin('keyboard');
    if (keyboard) {
        keyboard.trigger(key, action);
    }
    return this;
};
//# sourceMappingURL=api.js.map