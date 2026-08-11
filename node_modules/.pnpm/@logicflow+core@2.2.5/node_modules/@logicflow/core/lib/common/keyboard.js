"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyboard = void 0;
var mousetrap_1 = __importDefault(require("mousetrap"));
var lodash_es_1 = require("lodash-es");
var Keyboard = /** @class */ (function () {
    function Keyboard(options) {
        var _a;
        var lf = options.lf;
        if (!options.keyboard) {
            options.keyboard = { enabled: false };
        }
        this.options = options;
        this.target = lf.container;
        this.mousetrap = new mousetrap_1.default(this.target);
        if ((_a = options.keyboard) === null || _a === void 0 ? void 0 : _a.enabled) {
            this.enable(true);
        }
    }
    Keyboard.prototype.formatKey = function (key) {
        return key
            .toLowerCase()
            .replace(/\s/g, '')
            .replace('delete', 'del')
            .replace('cmd', 'command');
    };
    Keyboard.prototype.getKeys = function (keys) {
        var _this = this;
        return ((0, lodash_es_1.isArray)(keys) ? keys : [keys]).map(function (key) { return _this.formatKey(key); });
    };
    Object.defineProperty(Keyboard.prototype, "disabled", {
        get: function () {
            var _a;
            return ((_a = this.options.keyboard) === null || _a === void 0 ? void 0 : _a.enabled) !== true;
        },
        enumerable: false,
        configurable: true
    });
    Keyboard.prototype.on = function (keys, callback, action) {
        this.mousetrap.bind(this.getKeys(keys), callback, action);
    };
    Keyboard.prototype.off = function (keys, action) {
        this.mousetrap.unbind(this.getKeys(keys), action);
    };
    Keyboard.prototype.enable = function (force) {
        if (this.disabled || force) {
            this.options.keyboard.enabled = true;
            if (this.target instanceof HTMLElement) {
                this.target.setAttribute('tabindex', '-1');
                // 去掉节点被选中时 container 出现的边框
                this.target.style.outline = 'none';
            }
        }
    };
    Keyboard.prototype.disable = function () {
        if (!this.disabled) {
            this.options.keyboard.enabled = false;
            if (this.target instanceof HTMLElement) {
                this.target.removeAttribute('tabindex');
            }
        }
    };
    Keyboard.prototype.initShortcuts = function () {
        var _this = this;
        var shortcuts = this.options.keyboard.shortcuts;
        if (shortcuts) {
            if ((0, lodash_es_1.isArray)(shortcuts)) {
                (0, lodash_es_1.forEach)(shortcuts, function (_a) {
                    var keys = _a.keys, callback = _a.callback, action = _a.action;
                    _this.on(keys, callback, action);
                });
            }
            else {
                var keys = shortcuts.keys, callback = shortcuts.callback, action = shortcuts.action;
                this.on(keys, callback, action);
            }
        }
    };
    return Keyboard;
}());
exports.Keyboard = Keyboard;
exports.default = Keyboard;
