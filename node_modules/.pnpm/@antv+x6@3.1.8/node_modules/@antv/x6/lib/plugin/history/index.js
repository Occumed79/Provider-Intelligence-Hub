"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const model_1 = require("../../model");
const util_1 = require("./util");
const validator_1 = require("./validator");
require("./api");
class History extends common_1.Basecoat {
    constructor(options = {}) {
        super();
        this.name = 'history';
        this.batchCommands = null;
        this.batchLevel = 0;
        this.lastBatchIndex = -1;
        this.freezed = false;
        this.stackSize = 0; // 0: not limit
        this.handlers = [];
        const { stackSize = 0 } = options;
        this.stackSize = stackSize;
        this.options = (0, util_1.getOptions)(options);
        this.validator = new validator_1.Validator({
            history: this,
            cancelInvalid: this.options.cancelInvalid,
        });
    }
    init(graph) {
        this.graph = graph;
        this.model = this.graph.model;
        this.clean();
        this.startListening();
    }
    // #region api
    isEnabled() {
        return !this.disabled;
    }
    enable() {
        if (this.disabled) {
            this.options.enabled = true;
        }
    }
    disable() {
        if (!this.disabled) {
            this.options.enabled = false;
        }
    }
    toggleEnabled(enabled) {
        if (enabled != null) {
            if (enabled !== this.isEnabled()) {
                if (enabled) {
                    this.enable();
                }
                else {
                    this.disable();
                }
            }
        }
        else if (this.isEnabled()) {
            this.disable();
        }
        else {
            this.enable();
        }
        return this;
    }
    undo(options = {}) {
        if (!this.disabled) {
            const cmd = this.undoStack.pop();
            if (cmd) {
                this.revertCommand(cmd, options);
                this.redoStack.push(cmd);
                this.notify('undo', cmd, options);
            }
        }
        return this;
    }
    redo(options = {}) {
        if (!this.disabled) {
            const cmd = this.redoStack.pop();
            if (cmd) {
                this.applyCommand(cmd, options);
                this.undoStackPush(cmd);
                this.notify('redo', cmd, options);
            }
        }
        return this;
    }
    /**
     * Same as `undo()` but does not store the undo-ed command to the
     * `redoStack`. Canceled command therefore cannot be redo-ed.
     */
    cancel(options = {}) {
        if (!this.disabled) {
            const cmd = this.undoStack.pop();
            if (cmd) {
                this.revertCommand(cmd, options);
                this.redoStack = [];
                this.notify('cancel', cmd, options);
            }
        }
        return this;
    }
    getSize() {
        return this.stackSize;
    }
    getUndoRemainSize() {
        const ul = this.undoStack.length;
        return this.stackSize - ul;
    }
    getUndoSize() {
        return this.undoStack.length;
    }
    getRedoSize() {
        return this.redoStack.length;
    }
    canUndo() {
        return !this.disabled && this.undoStack.length > 0;
    }
    canRedo() {
        return !this.disabled && this.redoStack.length > 0;
    }
    clean(options = {}) {
        this.undoStack = [];
        this.redoStack = [];
        this.notify('clean', null, options);
        return this;
    }
    // #endregion
    get disabled() {
        return this.options.enabled !== true;
    }
    validate(events, ...callbacks) {
        this.validator.validate(events, ...callbacks);
        return this;
    }
    startListening() {
        this.model.on('batch:start', this.initBatchCommand, this);
        this.model.on('batch:stop', this.storeBatchCommand, this);
        if (this.options.eventNames) {
            this.options.eventNames.forEach((name, index) => {
                this.handlers[index] = this.addCommand.bind(this, name);
                this.model.on(name, this.handlers[index]);
            });
        }
        this.validator.on('invalid', (args) => this.trigger('invalid', args));
    }
    stopListening() {
        this.model.off('batch:start', this.initBatchCommand, this);
        this.model.off('batch:stop', this.storeBatchCommand, this);
        if (this.options.eventNames) {
            this.options.eventNames.forEach((name, index) => {
                this.model.off(name, this.handlers[index]);
            });
            this.handlers.length = 0;
        }
        this.validator.off('invalid');
    }
    createCommand(options) {
        return {
            batch: options ? options.batch : false,
            data: {},
        };
    }
    revertCommand(cmd, options) {
        this.freezed = true;
        const cmds = Array.isArray(cmd) ? (0, util_1.sortBatchCommands)(cmd) : [cmd];
        for (let i = cmds.length - 1; i >= 0; i -= 1) {
            const cmd = cmds[i];
            const localOptions = Object.assign(Object.assign({}, options), common_1.ObjectExt.pick(cmd.options, this.options.revertOptionsList || []));
            this.executeCommand(cmd, true, localOptions);
        }
        this.freezed = false;
    }
    applyCommand(cmd, options) {
        this.freezed = true;
        const cmds = Array.isArray(cmd) ? (0, util_1.sortBatchCommands)(cmd) : [cmd];
        for (let i = 0; i < cmds.length; i += 1) {
            const cmd = cmds[i];
            const localOptions = Object.assign(Object.assign({}, options), common_1.ObjectExt.pick(cmd.options, this.options.applyOptionsList || []));
            this.executeCommand(cmd, false, localOptions);
        }
        this.freezed = false;
    }
    executeCommand(cmd, revert, options) {
        const model = this.model;
        // const cell = cmd.modelChange ? model : model.getCell(cmd.data.id!)
        const cell = model.getCell(cmd.data.id);
        const event = cmd.event;
        if (((0, util_1.isAddEvent)(event) && revert) || ((0, util_1.isRemoveEvent)(event) && !revert)) {
            cell && cell.remove(options);
        }
        else if (((0, util_1.isAddEvent)(event) && !revert) ||
            ((0, util_1.isRemoveEvent)(event) && revert)) {
            const data = cmd.data;
            if (data.node) {
                model.addNode(data.props, options);
            }
            else if (data.edge) {
                model.addEdge(data.props, options);
            }
        }
        else if ((0, util_1.isChangeEvent)(event)) {
            const data = cmd.data;
            const key = data.key;
            if (key && cell) {
                const value = revert ? data.prev[key] : data.next[key];
                if (data.key === 'attrs') {
                    const hasUndefinedAttr = this.ensureUndefinedAttrs(value, revert ? data.next[key] : data.prev[key]);
                    if (hasUndefinedAttr) {
                        // recognize a `dirty` flag and re-render itself in order to remove
                        // the attribute from SVGElement.
                        options.dirty = true;
                    }
                }
                cell.prop(key, value, options);
            }
        }
        else {
            const executeCommand = this.options.executeCommand;
            if (executeCommand) {
                common_1.FunctionExt.call(executeCommand, this, cmd, revert, options);
            }
        }
    }
    addCommand(event, args) {
        if (this.freezed || this.disabled) {
            return;
        }
        const eventArgs = args;
        const options = eventArgs.options || {};
        if (options.dryrun) {
            return;
        }
        if (((0, util_1.isAddEvent)(event) && this.options.ignoreAdd) ||
            ((0, util_1.isRemoveEvent)(event) && this.options.ignoreRemove) ||
            ((0, util_1.isChangeEvent)(event) && this.options.ignoreChange)) {
            return;
        }
        // before
        // ------
        const before = this.options.beforeAddCommand;
        if (before != null &&
            common_1.FunctionExt.call(before, this, event, args) === false) {
            return;
        }
        if (event === 'cell:change:*') {
            // eslint-disable-next-line
            event = `cell:change:${eventArgs.key}`;
        }
        const cell = eventArgs.cell;
        const isModelChange = model_1.Model.isModel(cell);
        let cmd;
        if (this.batchCommands) {
            // In most cases we are working with same object, doing
            // same action etc. translate an object piece by piece.
            cmd = this.batchCommands[Math.max(this.lastBatchIndex, 0)];
            // Check if we are start working with new object or performing different
            // action with it. Note, that command is uninitialized when lastCmdIndex
            // equals -1. In that case we are done, command we were looking for is
            // already set
            const diffId = (isModelChange && !cmd.modelChange) || cmd.data.id !== cell.id;
            const diffName = cmd.event !== event;
            if (this.lastBatchIndex >= 0 && (diffId || diffName)) {
                // Trying to find command first, which was performing same
                // action with the object as we are doing now with cell.
                const index = this.batchCommands.findIndex((cmd) => ((isModelChange && cmd.modelChange) || cmd.data.id === cell.id) &&
                    cmd.event === event);
                if (index < 0 || (0, util_1.isAddEvent)(event) || (0, util_1.isRemoveEvent)(event)) {
                    cmd = this.createCommand({ batch: true });
                }
                else {
                    cmd = this.batchCommands[index];
                    this.batchCommands.splice(index, 1);
                }
                this.batchCommands.push(cmd);
                this.lastBatchIndex = this.batchCommands.length - 1;
            }
        }
        else {
            cmd = this.createCommand({ batch: false });
        }
        // add & remove
        // ------------
        if ((0, util_1.isAddEvent)(event) || (0, util_1.isRemoveEvent)(event)) {
            const data = cmd.data;
            cmd.event = event;
            cmd.options = options;
            data.id = cell.id;
            data.props = common_1.ObjectExt.cloneDeep(cell.toJSON());
            if (cell.isEdge()) {
                data.edge = true;
            }
            else if (cell.isNode()) {
                data.node = true;
            }
            return this.push(cmd, options);
        }
        // change:*
        // --------
        if ((0, util_1.isChangeEvent)(event)) {
            const key = args.key;
            const data = cmd.data;
            if (!cmd.batch || !cmd.event) {
                // Do this only once. Set previous data and action (also
                // serves as a flag so that we don't repeat this branche).
                cmd.event = event;
                cmd.options = options;
                data.key = key;
                if (data.prev == null) {
                    data.prev = {};
                }
                data.prev[key] = common_1.ObjectExt.cloneDeep(cell.previous(key));
                if (isModelChange) {
                    cmd.modelChange = true;
                }
                else {
                    data.id = cell.id;
                }
            }
            if (data.next == null) {
                data.next = {};
            }
            data.next[key] = common_1.ObjectExt.cloneDeep(cell.prop(key));
            return this.push(cmd, options);
        }
        // others
        // ------
        const afterAddCommand = this.options.afterAddCommand;
        if (afterAddCommand) {
            common_1.FunctionExt.call(afterAddCommand, this, event, args, cmd);
        }
        this.push(cmd, options);
    }
    /**
     * Gather multiple changes into a single command. These commands could
     * be reverted with single `undo()` call. From the moment the function
     * is called every change made on model is not stored into the undoStack.
     * Changes are temporarily kept until `storeBatchCommand()` is called.
     */
    // eslint-disable-next-line
    initBatchCommand(options) {
        if (this.freezed) {
            return;
        }
        if (this.batchCommands) {
            this.batchLevel += 1;
        }
        else {
            this.batchCommands = [this.createCommand({ batch: true })];
            this.batchLevel = 0;
            this.lastBatchIndex = -1;
        }
    }
    /**
     * Store changes temporarily kept in the undoStack. You have to call this
     * function as many times as `initBatchCommand()` been called.
     */
    storeBatchCommand(options) {
        if (this.freezed) {
            return;
        }
        if (this.batchCommands && this.batchLevel <= 0) {
            const cmds = this.filterBatchCommand(this.batchCommands);
            if (cmds.length > 0) {
                this.redoStack = [];
                this.undoStackPush(cmds);
                this.consolidateCommands();
                this.notify('add', cmds, options);
            }
            this.batchCommands = null;
            this.lastBatchIndex = -1;
            this.batchLevel = 0;
        }
        else if (this.batchCommands && this.batchLevel > 0) {
            this.batchLevel -= 1;
        }
    }
    filterBatchCommand(batchCommands) {
        let cmds = batchCommands.slice();
        const result = [];
        while (cmds.length > 0) {
            const cmd = cmds.shift();
            const evt = cmd.event;
            const id = cmd.data.id;
            if (evt != null && (id != null || cmd.modelChange)) {
                if ((0, util_1.isAddEvent)(evt)) {
                    const index = cmds.findIndex((c) => (0, util_1.isRemoveEvent)(c.event) && c.data.id === id);
                    if (index >= 0) {
                        cmds = cmds.filter((c, i) => index < i || c.data.id !== id);
                        continue;
                    }
                }
                else if ((0, util_1.isRemoveEvent)(evt)) {
                    const index = cmds.findIndex((c) => (0, util_1.isAddEvent)(c.event) && c.data.id === id);
                    if (index >= 0) {
                        cmds.splice(index, 1);
                        continue;
                    }
                }
                else if ((0, util_1.isChangeEvent)(evt)) {
                    const data = cmd.data;
                    if (common_1.ObjectExt.isEqual(data.prev, data.next)) {
                        continue;
                    }
                }
                else {
                    // pass
                }
                result.push(cmd);
            }
        }
        return result;
    }
    notify(event, cmd, options) {
        const cmds = cmd == null ? null : Array.isArray(cmd) ? cmd : [cmd];
        this.emit(event, { cmds, options });
        this.graph.trigger(`history:${event}`, { cmds, options });
        this.emit('change', { cmds, options });
        this.graph.trigger('history:change', { cmds, options });
    }
    push(cmd, options) {
        this.redoStack = [];
        if (cmd.batch) {
            this.lastBatchIndex = Math.max(this.lastBatchIndex, 0);
            this.emit('batch', { cmd, options });
        }
        else {
            this.undoStackPush(cmd);
            this.consolidateCommands();
            this.notify('add', cmd, options);
        }
    }
    /**
     * Conditionally combine multiple undo items into one.
     *
     * Currently this is only used combine a `cell:changed:position` event
     * followed by multiple `cell:change:parent` and `cell:change:children`
     * events, such that a "move + embed" action can be undone in one step.
     *
     * See https://github.com/antvis/X6/issues/2421
     *
     * This is an ugly WORKAROUND. It does not solve deficiencies in the batch
     * system itself.
     */
    consolidateCommands() {
        var _a;
        const lastCommandGroup = this.undoStack[this.undoStack.length - 1];
        const penultimateCommandGroup = this.undoStack[this.undoStack.length - 2];
        // We are looking for at least one cell:change:parent
        // and one cell:change:children
        if (!Array.isArray(lastCommandGroup)) {
            return;
        }
        const eventTypes = new Set(lastCommandGroup.map((cmd) => cmd.event));
        if (eventTypes.size !== 2 ||
            !eventTypes.has('cell:change:parent') ||
            !eventTypes.has('cell:change:children')) {
            return;
        }
        // We are looking for events from user interactions
        if (!lastCommandGroup.every((cmd) => { var _a; return cmd.batch && ((_a = cmd.options) === null || _a === void 0 ? void 0 : _a.ui); })) {
            return;
        }
        // We are looking for a command group with exactly one event, whose event
        // type is cell:change:position, and is from user interactions
        if (!Array.isArray(penultimateCommandGroup) ||
            penultimateCommandGroup.length !== 1) {
            return;
        }
        const maybePositionChange = penultimateCommandGroup[0];
        if (maybePositionChange.event !== 'cell:change:position' ||
            !((_a = maybePositionChange.options) === null || _a === void 0 ? void 0 : _a.ui)) {
            return;
        }
        // Actually consolidating the commands we get
        penultimateCommandGroup.push(...lastCommandGroup);
        this.undoStack.pop();
    }
    undoStackPush(cmd) {
        if (this.stackSize === 0) {
            this.undoStack.push(cmd);
            return;
        }
        if (this.undoStack.length >= this.stackSize) {
            this.undoStack.shift();
        }
        this.undoStack.push(cmd);
    }
    ensureUndefinedAttrs(newAttrs, oldAttrs) {
        let hasUndefinedAttr = false;
        if (newAttrs !== null &&
            oldAttrs !== null &&
            typeof newAttrs === 'object' &&
            typeof oldAttrs === 'object') {
            Object.keys(oldAttrs).forEach((key) => {
                // eslint-disable-next-line no-prototype-builtins
                if (newAttrs[key] === undefined && oldAttrs[key] !== undefined) {
                    newAttrs[key] = undefined;
                    hasUndefinedAttr = true;
                }
                else if (typeof newAttrs[key] === 'object' &&
                    typeof oldAttrs[key] === 'object') {
                    hasUndefinedAttr = this.ensureUndefinedAttrs(newAttrs[key], oldAttrs[key]);
                }
            });
        }
        return hasUndefinedAttr;
    }
    dispose() {
        this.validator.dispose();
        this.clean();
        this.stopListening();
        this.off();
    }
}
exports.History = History;
tslib_1.__decorate([
    (0, common_1.disposable)()
], History.prototype, "dispose", null);
//# sourceMappingURL=index.js.map