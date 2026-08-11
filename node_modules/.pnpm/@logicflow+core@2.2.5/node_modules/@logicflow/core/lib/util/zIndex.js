"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinIndex = exports.getZIndex = void 0;
var maxIndex = 1000;
var minIndex = 999;
var getZIndex = function () { return ++maxIndex; };
exports.getZIndex = getZIndex;
var getMinIndex = function () { return --minIndex; };
exports.getMinIndex = getMinIndex;
