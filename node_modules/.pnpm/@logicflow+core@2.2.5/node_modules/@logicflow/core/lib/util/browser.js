"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIe = void 0;
var lodash_es_1 = require("lodash-es");
var isIe = function () {
    return (0, lodash_es_1.get)(window, 'navigator.userAgent', '').match(/MSIE|Trident/) !== null;
};
exports.isIe = isIe;
