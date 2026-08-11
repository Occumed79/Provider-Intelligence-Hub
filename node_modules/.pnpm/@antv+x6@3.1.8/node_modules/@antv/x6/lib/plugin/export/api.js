"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const graph_1 = require("../../graph");
graph_1.Graph.prototype.toSVG = function (callback, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.toSVG(callback, options);
    }
};
graph_1.Graph.prototype.toSVGAsync = function (options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            this.toSVG(resolve, options);
        });
    });
};
graph_1.Graph.prototype.toPNG = function (callback, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.toPNG(callback, options);
    }
};
graph_1.Graph.prototype.toPNGAsync = function (options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            this.toPNG(resolve, options);
        });
    });
};
graph_1.Graph.prototype.toJPEG = function (callback, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.toJPEG(callback, options);
    }
};
graph_1.Graph.prototype.toJPEGAsync = function (options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            this.toJPEG(resolve, options);
        });
    });
};
graph_1.Graph.prototype.exportPNG = function (fileName, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.exportPNG(fileName, options);
    }
};
graph_1.Graph.prototype.exportJPEG = function (fileName, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.exportJPEG(fileName, options);
    }
};
graph_1.Graph.prototype.exportSVG = function (fileName, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.exportSVG(fileName, options);
    }
};
//# sourceMappingURL=api.js.map