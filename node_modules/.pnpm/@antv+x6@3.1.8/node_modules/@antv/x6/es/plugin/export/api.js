import { __awaiter } from "tslib";
import { Graph } from '../../graph';
Graph.prototype.toSVG = function (callback, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.toSVG(callback, options);
    }
};
Graph.prototype.toSVGAsync = function (options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            this.toSVG(resolve, options);
        });
    });
};
Graph.prototype.toPNG = function (callback, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.toPNG(callback, options);
    }
};
Graph.prototype.toPNGAsync = function (options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            this.toPNG(resolve, options);
        });
    });
};
Graph.prototype.toJPEG = function (callback, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.toJPEG(callback, options);
    }
};
Graph.prototype.toJPEGAsync = function (options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            this.toJPEG(resolve, options);
        });
    });
};
Graph.prototype.exportPNG = function (fileName, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.exportPNG(fileName, options);
    }
};
Graph.prototype.exportJPEG = function (fileName, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.exportJPEG(fileName, options);
    }
};
Graph.prototype.exportSVG = function (fileName, options) {
    const instance = this.getPlugin('export');
    if (instance) {
        instance.exportSVG(fileName, options);
    }
};
//# sourceMappingURL=api.js.map