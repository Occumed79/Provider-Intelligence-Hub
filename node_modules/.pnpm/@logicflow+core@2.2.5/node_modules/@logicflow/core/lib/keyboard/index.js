"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyboard = void 0;
var lodash_es_1 = require("lodash-es");
var mousetrap_1 = __importDefault(require("mousetrap"));
__exportStar(require("./shortcut"), exports);
var Keyboard = /** @class */ (function () {
    function Keyboard(options) {
        if (!options.keyboard) {
            options.keyboard = { enabled: false };
        }
        this.options = options;
        var lf = options.lf;
        this.target = lf.container;
        this.mousetrap = new mousetrap_1.default(this.target);
        // 默认开启快捷键，且不是静默模式时enable
        if (options.keyboard.enabled && !lf.options.isSilentMode) {
            this.enable(true);
        }
    }
    Keyboard.prototype.initShortcuts = function () {
        var _this = this;
        var _a;
        var shortcuts = ((_a = this.options.keyboard) !== null && _a !== void 0 ? _a : {}).shortcuts;
        if (shortcuts) {
            if ((0, lodash_es_1.isArray)(shortcuts)) {
                shortcuts.forEach(function (_a) {
                    var keys = _a.keys, callback = _a.callback, action = _a.action;
                    return _this.on(keys, callback, action);
                });
            }
            else {
                var keys = shortcuts.keys, callback = shortcuts.callback, action = shortcuts.action;
                this.on(keys, callback, action);
            }
        }
    };
    Keyboard.prototype.on = function (keys, callback, action) {
        this.mousetrap.bind(this.getKeys(keys), callback, action);
    };
    Object.defineProperty(Keyboard.prototype, "disabled", {
        get: function () {
            var _a, _b;
            return ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.keyboard) === null || _b === void 0 ? void 0 : _b.enabled) !== true;
        },
        enumerable: false,
        configurable: true
    });
    Keyboard.prototype.off = function (keys, action) {
        this.mousetrap.unbind(this.getKeys(keys), action);
    };
    Keyboard.prototype.enable = function (force) {
        if (this.disabled || force) {
            if (this.options.keyboard) {
                this.options.keyboard.enabled = true;
            }
            if (this.target instanceof HTMLElement) {
                this.target.setAttribute('tabindex', '-1');
                // 去掉节点被选中时container出现的边框
                this.target.style.outline = 'none';
            }
        }
    };
    Keyboard.prototype.disable = function () {
        if (!this.disabled) {
            if (this.options.keyboard) {
                this.options.keyboard.enabled = false;
            }
            if (this.target instanceof HTMLElement) {
                this.target.removeAttribute('tabindex');
            }
        }
    };
    Keyboard.prototype.destroy = function () {
        this.mousetrap.reset();
    };
    Keyboard.prototype.getKeys = function (keys) {
        var _this = this;
        return (Array.isArray(keys) ? keys : [keys]).map(function (key) {
            return _this.formatKey(key);
        });
    };
    Keyboard.prototype.formatKey = function (key) {
        return key
            .toLowerCase()
            .replace(/\s/g, '')
            .replace('delete', 'del')
            .replace('cmd', 'command');
    };
    return Keyboard;
}());
exports.Keyboard = Keyboard;
exports.default = Keyboard;
