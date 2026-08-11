"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registry = void 0;
const common_1 = require("../common");
class Registry {
    static create(options) {
        return new Registry(options);
    }
    constructor(options) {
        this.options = Object.assign({}, options);
        this.data = this.options.data || {};
        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
    }
    get names() {
        return Object.keys(this.data);
    }
    register(name, options, force = false) {
        if (typeof name === 'object') {
            Object.entries(name).forEach(([key, val]) => {
                this.register(key, val, options);
            });
            return;
        }
        if (this.exist(name) && !force && !(0, common_1.isApplyingHMR)()) {
            this.onDuplicated(name);
        }
        const process = this.options.process;
        const entity = process
            ? common_1.FunctionExt.call(process, this, name, options)
            : options;
        this.data[name] = entity;
        return entity;
    }
    unregister(name) {
        const entity = name ? this.data[name] : null;
        delete this.data[name];
        return entity;
    }
    get(name) {
        return name ? this.data[name] : null;
    }
    exist(name) {
        return name ? this.data[name] != null : false;
    }
    onDuplicated(name) {
        // eslint-disable-next-line no-useless-catch
        try {
            // race
            if (this.options.onConflict) {
                common_1.FunctionExt.call(this.options.onConflict, this, name);
            }
            throw new Error(`${common_1.StringExt.upperFirst(this.options.type)} with name '${name}' already registered.`);
        }
        catch (err) {
            throw err;
        }
    }
    onNotFound(name, prefix) {
        throw new Error(this.getSpellingSuggestion(name, prefix));
    }
    getSpellingSuggestion(name, prefix) {
        const suggestion = this.getSpellingSuggestionForName(name);
        const prefixed = prefix
            ? `${prefix} ${common_1.StringExt.lowerFirst(this.options.type)}`
            : this.options.type;
        return (
        // eslint-disable-next-line
        `${common_1.StringExt.upperFirst(prefixed)} with name '${name}' does not exist.${suggestion ? ` Did you mean '${suggestion}'?` : ''}`);
    }
    getSpellingSuggestionForName(name) {
        return common_1.StringExt.getSpellingSuggestion(name, Object.keys(this.data), (candidate) => candidate);
    }
}
exports.Registry = Registry;
//# sourceMappingURL=registry.js.map