"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
const common_1 = require("../common");
class Base extends common_1.Disposable {
    get options() {
        return this.graph.options;
    }
    get model() {
        return this.graph.model;
    }
    get view() {
        return this.graph.view;
    }
    constructor(graph) {
        super();
        this.graph = graph;
        this.init();
    }
    init() { }
}
exports.Base = Base;
//# sourceMappingURL=base.js.map