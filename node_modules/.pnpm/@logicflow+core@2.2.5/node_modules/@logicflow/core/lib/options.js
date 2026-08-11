"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Options = void 0;
var lodash_es_1 = require("lodash-es");
var Options;
(function (Options) {
    function get(options) {
        var others = __rest(options, []);
        var container = options.container;
        if (!container) {
            throw new Error('Ensure the container of LogicFlow is specified and valid.');
        }
        return (0, lodash_es_1.assign)({}, Options.defaults, others);
    }
    Options.get = get;
})(Options || (exports.Options = Options = {}));
(function (Options) {
    Options.defaults = {
        background: false,
        grid: false,
        textEdit: true,
        snapline: true,
        outline: false,
        disabledTools: [],
    };
})(Options || (exports.Options = Options = {}));
