"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
/**
 * Runs a set of callbacks to determine if a command is valid. This is
 * useful for checking if a certain action in your application does
 * lead to an invalid state of the graph.
 */
class Validator extends common_1.Basecoat {
    constructor(options) {
        super();
        this.map = {};
        this.command = options.history;
        this.cancelInvalid = options.cancelInvalid !== false;
        this.command.on('add', this.onCommandAdded, this);
    }
    onCommandAdded({ cmds }) {
        return Array.isArray(cmds)
            ? cmds.every((cmd) => this.isValidCommand(cmd))
            : this.isValidCommand(cmds);
    }
    isValidCommand(cmd) {
        if (cmd.options && cmd.options.validation === false) {
            return true;
        }
        const callbacks = (cmd.event && this.map[cmd.event]) || [];
        let handoverErr = null;
        callbacks.forEach((routes) => {
            let i = 0;
            const rollup = (err) => {
                const fn = routes[i];
                i += 1;
                try {
                    if (fn) {
                        fn(err, cmd, rollup);
                    }
                    else {
                        handoverErr = err;
                    }
                }
                catch (err) {
                    rollup(err);
                }
            };
            rollup(handoverErr);
        });
        if (handoverErr) {
            if (this.cancelInvalid) {
                this.command.cancel();
            }
            this.emit('invalid', { err: handoverErr });
            return false;
        }
        return true;
    }
    validate(events, ...callbacks) {
        const evts = Array.isArray(events) ? events : events.split(/\s+/);
        callbacks.forEach((callback) => {
            if (typeof callback !== 'function') {
                throw new Error(`${evts.join(' ')} requires callback functions.`);
            }
        });
        evts.forEach((event) => {
            if (this.map[event] == null) {
                this.map[event] = [];
            }
            this.map[event].push(callbacks);
        });
        return this;
    }
    dispose() {
        this.command.off('add', this.onCommandAdded, this);
    }
}
exports.Validator = Validator;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Validator.prototype, "dispose", null);
//# sourceMappingURL=validator.js.map