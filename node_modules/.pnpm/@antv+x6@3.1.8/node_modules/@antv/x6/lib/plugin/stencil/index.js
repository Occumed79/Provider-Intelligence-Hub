"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stencil = exports.DefaultOptions = exports.DefaultGroupName = exports.ClassNames = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../common");
const graph_1 = require("../../graph");
const model_1 = require("../../model");
const view_1 = require("../../view");
const dnd_1 = require("../dnd");
const grid_1 = require("./grid");
const raw_1 = require("./style/raw");
exports.ClassNames = {
    base: 'widget-stencil',
    title: `widget-stencil-title`,
    search: `widget-stencil-search`,
    searchText: `widget-stencil-search-text`,
    content: `widget-stencil-content`,
    group: `widget-stencil-group`,
    groupTitle: `widget-stencil-group-title`,
    groupContent: `widget-stencil-group-content`,
};
exports.DefaultGroupName = '__default__';
exports.DefaultOptions = Object.assign({ stencilGraphWidth: 200, stencilGraphHeight: 800, title: 'Stencil', collapsable: false, placeholder: 'Search', notFoundText: 'No matches found', layout(model, group) {
        const options = {
            columnWidth: this.options.stencilGraphWidth / 2 - 10,
            columns: 2,
            rowHeight: 80,
            resizeToFit: false,
            dx: 10,
            dy: 10,
        };
        (0, grid_1.grid)(model, Object.assign(Object.assign(Object.assign({}, options), this.options.layoutOptions), (group ? group.layoutOptions : {})));
    } }, dnd_1.DndDefaults);
class Stencil extends view_1.View {
    get targetScroller() {
        const target = this.options.target;
        const scroller = target.getPlugin('scroller');
        return scroller;
    }
    get targetGraph() {
        return this.options.target;
    }
    get targetModel() {
        return this.targetGraph.model;
    }
    constructor(options = {}) {
        super();
        this.name = 'stencil';
        common_1.CssLoader.ensure(this.name, raw_1.content);
        this.graphs = {};
        this.groups = {};
        this.options = Object.assign(Object.assign({}, exports.DefaultOptions), options);
        this.init();
    }
    init() {
        this.dnd = new dnd_1.Dnd(this.options);
        this.onSearch = common_1.FunctionExt.debounce(this.onSearch, 200);
        this.initContainer();
        this.initSearch();
        this.initContent();
        this.initGroups();
        this.setTitle();
        this.startListening();
    }
    load(data, groupName) {
        if (Array.isArray(data)) {
            this.loadGroup(data, groupName);
        }
        else if (this.options.groups) {
            Object.keys(this.options.groups).forEach((groupName) => {
                if (data[groupName]) {
                    this.loadGroup(data[groupName], groupName);
                }
            });
        }
        return this;
    }
    unload(data, groupName) {
        if (Array.isArray(data)) {
            this.loadGroup(data, groupName, true);
        }
        else if (this.options.groups) {
            Object.keys(this.options.groups).forEach((groupName) => {
                if (data[groupName]) {
                    this.loadGroup(data[groupName], groupName, true);
                }
            });
        }
        return this;
    }
    toggleGroup(groupName) {
        if (this.isGroupCollapsed(groupName)) {
            this.expandGroup(groupName);
        }
        else {
            this.collapseGroup(groupName);
        }
        return this;
    }
    collapseGroup(groupName) {
        if (this.isGroupCollapsable(groupName)) {
            const group = this.groups[groupName];
            if (group && !this.isGroupCollapsed(groupName)) {
                this.trigger('group:collapse', { name: groupName });
                common_1.Dom.addClass(group, 'collapsed');
            }
        }
        return this;
    }
    expandGroup(groupName) {
        if (this.isGroupCollapsable(groupName)) {
            const group = this.groups[groupName];
            if (group && this.isGroupCollapsed(groupName)) {
                this.trigger('group:expand', { name: groupName });
                common_1.Dom.removeClass(group, 'collapsed');
            }
        }
        return this;
    }
    isGroupCollapsable(groupName) {
        const group = this.groups[groupName];
        return common_1.Dom.hasClass(group, 'collapsable');
    }
    isGroupCollapsed(groupName) {
        const group = this.groups[groupName];
        return group && common_1.Dom.hasClass(group, 'collapsed');
    }
    collapseGroups() {
        Object.keys(this.groups).forEach((groupName) => {
            this.collapseGroup(groupName);
        });
        return this;
    }
    expandGroups() {
        Object.keys(this.groups).forEach((groupName) => {
            this.expandGroup(groupName);
        });
        return this;
    }
    resizeGroup(groupName, size) {
        const graph = this.graphs[groupName];
        if (graph) {
            graph.resize(size.width, size.height);
        }
        return this;
    }
    addGroup(group) {
        const groups = Array.isArray(group) ? group : [group];
        if (this.options.groups) {
            this.options.groups.push(...groups);
        }
        else {
            this.options.groups = groups;
        }
        groups.forEach((group) => {
            this.initGroup(group);
        });
    }
    removeGroup(groupName) {
        const groupNames = Array.isArray(groupName) ? groupName : [groupName];
        if (this.options.groups) {
            this.options.groups = this.options.groups.filter((group) => !groupNames.includes(group.name));
            groupNames.forEach((groupName) => {
                const graph = this.graphs[groupName];
                this.unregisterGraphEvents(graph);
                graph.dispose();
                delete this.graphs[groupName];
                const elem = this.groups[groupName];
                common_1.Dom.remove(elem);
                delete this.groups[groupName];
            });
        }
    }
    // #endregion
    initContainer() {
        this.container = document.createElement('div');
        common_1.Dom.addClass(this.container, this.prefixClassName(exports.ClassNames.base));
        common_1.Dom.attr(this.container, 'data-not-found-text', this.options.notFoundText || 'No matches found');
    }
    initContent() {
        this.content = document.createElement('div');
        common_1.Dom.addClass(this.content, this.prefixClassName(exports.ClassNames.content));
        common_1.Dom.appendTo(this.content, this.container);
    }
    buildGraphConfig(group) {
        const globalGraphOptions = this.options.stencilGraphOptions || {};
        const graphOptionsInGroup = group === null || group === void 0 ? void 0 : group.graphOptions;
        const mergedGraphOptions = Object.assign(Object.assign({}, globalGraphOptions), graphOptionsInGroup);
        if (mergedGraphOptions.panning == null) {
            mergedGraphOptions.panning = false;
        }
        const width = (group && group.graphWidth) || this.options.stencilGraphWidth;
        const height = (group && group.graphHeight) || this.options.stencilGraphHeight;
        const model = mergedGraphOptions.model || new model_1.Model();
        return { mergedGraphOptions, width, height, model };
    }
    createStencilGraph(mergedGraphOptions, width, height, model) {
        const graph = new graph_1.Graph(Object.assign(Object.assign({}, mergedGraphOptions), { container: document.createElement('div'), model,
            width,
            height, interacting: false, preventDefaultBlankAction: false }));
        this.registerGraphEvents(graph);
        return graph;
    }
    initSearch() {
        if (this.options.search) {
            common_1.Dom.addClass(this.container, 'searchable');
            common_1.Dom.append(this.container, this.renderSearch());
        }
    }
    initGroup(group) {
        const groupElem = document.createElement('div');
        common_1.Dom.addClass(groupElem, this.prefixClassName(exports.ClassNames.group));
        common_1.Dom.attr(groupElem, 'data-name', group.name);
        if ((group.collapsable == null && this.options.collapsable) ||
            group.collapsable !== false) {
            common_1.Dom.addClass(groupElem, 'collapsable');
        }
        common_1.Dom.toggleClass(groupElem, 'collapsed', group.collapsed === true);
        const title = document.createElement('h3');
        common_1.Dom.addClass(title, this.prefixClassName(exports.ClassNames.groupTitle));
        title.innerHTML = group.title || group.name;
        const content = document.createElement('div');
        common_1.Dom.addClass(content, this.prefixClassName(exports.ClassNames.groupContent));
        const { mergedGraphOptions, width, height, model } = this.buildGraphConfig(group);
        const graph = this.createStencilGraph(mergedGraphOptions, width, height, model);
        common_1.Dom.append(content, graph.container);
        common_1.Dom.append(groupElem, [title, content]);
        common_1.Dom.appendTo(groupElem, this.content);
        this.groups[group.name] = groupElem;
        this.graphs[group.name] = graph;
    }
    initGroups() {
        this.clearGroups();
        this.setCollapsableState();
        if (this.options.groups && this.options.groups.length) {
            this.options.groups.forEach((group) => {
                this.initGroup(group);
            });
        }
        else {
            const { mergedGraphOptions, width, height, model } = this.buildGraphConfig();
            const graph = this.createStencilGraph(mergedGraphOptions, width, height, model);
            common_1.Dom.append(this.content, graph.container);
            this.graphs[exports.DefaultGroupName] = graph;
        }
    }
    setCollapsableState() {
        this.options.collapsable =
            this.options.collapsable &&
                this.options.groups &&
                this.options.groups.some((group) => group.collapsable !== false);
        if (this.options.collapsable) {
            common_1.Dom.addClass(this.container, 'collapsable');
            const collapsed = this.options.groups &&
                this.options.groups.every((group) => group.collapsed || group.collapsable === false);
            if (collapsed) {
                common_1.Dom.addClass(this.container, 'collapsed');
            }
            else {
                common_1.Dom.removeClass(this.container, 'collapsed');
            }
        }
        else {
            common_1.Dom.removeClass(this.container, 'collapsable');
        }
    }
    setTitle() {
        const title = document.createElement('div');
        common_1.Dom.addClass(title, this.prefixClassName(exports.ClassNames.title));
        title.innerHTML = this.options.title;
        common_1.Dom.appendTo(title, this.container);
    }
    renderSearch() {
        const elem = document.createElement('div');
        common_1.Dom.addClass(elem, this.prefixClassName(exports.ClassNames.search));
        const input = document.createElement('input');
        common_1.Dom.attr(input, {
            type: 'search',
            placeholder: this.options.placeholder || 'Search',
        });
        common_1.Dom.addClass(input, this.prefixClassName(exports.ClassNames.searchText));
        common_1.Dom.append(elem, input);
        return elem;
    }
    startListening() {
        const title = this.prefixClassName(exports.ClassNames.title);
        const searchText = this.prefixClassName(exports.ClassNames.searchText);
        const groupTitle = this.prefixClassName(exports.ClassNames.groupTitle);
        this.delegateEvents({
            [`click .${title}`]: 'onTitleClick',
            [`touchstart .${title}`]: 'onTitleClick',
            [`click .${groupTitle}`]: 'onGroupTitleClick',
            [`touchstart .${groupTitle}`]: 'onGroupTitleClick',
            [`input .${searchText}`]: 'onSearch',
            [`focusin .${searchText}`]: 'onSearchFocusIn',
            [`focusout .${searchText}`]: 'onSearchFocusOut',
        });
    }
    stopListening() {
        this.undelegateEvents();
    }
    registerGraphEvents(graph) {
        graph.on('cell:mousedown', this.onDragStart, this);
    }
    unregisterGraphEvents(graph) {
        graph.off('cell:mousedown', this.onDragStart, this);
    }
    getGraphHeight(groupName) {
        const group = this.getGroup(groupName);
        if (group && group.graphHeight != null) {
            return group.graphHeight;
        }
        return this.options.stencilGraphHeight;
    }
    loadGroup(cells, groupName, reverse) {
        const model = this.getModel(groupName);
        if (model) {
            const nodes = cells.map((cell) => model_1.Node.isNode(cell) ? cell : model_1.Node.create(cell));
            if (reverse === true) {
                model.removeCells(nodes);
            }
            else {
                model.resetCells(nodes);
            }
        }
        const group = this.getGroup(groupName);
        const height = this.getGraphHeight(groupName);
        const layout = (group && group.layout) || this.options.layout;
        if (layout && model) {
            common_1.FunctionExt.call(layout, this, model, group);
        }
        if (!height) {
            const graph = this.getGraph(groupName);
            graph.fitToContent({
                minWidth: graph.options.width,
                gridHeight: 1,
                padding: (group && group.graphPadding) ||
                    this.options.stencilGraphPadding ||
                    10,
            });
        }
        return this;
    }
    onDragStart(args) {
        const { e, node } = args;
        const group = this.getGroupByNode(node);
        if (group && group.nodeMovable === false) {
            return;
        }
        // 当在 Stencil 中拖拽节点时，禁用该分组 Graph 的平移（panning）
        const graph = this.getGraph(group ? group.name : undefined);
        const wasPannable = graph && typeof graph.isPannable === 'function'
            ? graph.isPannable()
            : false;
        if (wasPannable) {
            graph.disablePanning();
        }
        // 在拖拽结束（document mouseup/touchend）后恢复之前的 panning 状态。
        const restorePanning = () => {
            if (wasPannable) {
                graph.enablePanning();
            }
            this.undelegateDocumentEvents();
        };
        this.delegateDocumentEvents({
            mouseup: restorePanning,
            touchend: restorePanning,
            touchcancel: restorePanning,
        });
        this.dnd.start(node, e);
    }
    filter(keyword, filter) {
        const found = Object.keys(this.graphs).reduce((memo, groupName) => {
            const graph = this.graphs[groupName];
            const name = groupName === exports.DefaultGroupName ? null : groupName;
            const items = graph.model.getNodes().filter((cell) => {
                let matched = false;
                if (typeof filter === 'function') {
                    matched = common_1.FunctionExt.call(filter, this, cell, keyword, name, this);
                }
                else if (typeof filter === 'boolean') {
                    matched = filter;
                }
                else {
                    matched = this.isCellMatched(cell, keyword, filter, keyword.toLowerCase() !== keyword);
                }
                const view = graph.renderer.findViewByCell(cell);
                if (view) {
                    common_1.Dom.toggleClass(view.container, 'unmatched', !matched);
                }
                return matched;
            });
            const found = items.length > 0;
            const options = this.options;
            const model = new model_1.Model();
            model.resetCells(items);
            if (options.layout) {
                common_1.FunctionExt.call(options.layout, this, model, this.getGroup(groupName));
            }
            if (this.groups[groupName]) {
                common_1.Dom.toggleClass(this.groups[groupName], 'unmatched', !found);
            }
            const height = this.getGraphHeight(groupName);
            if (!height) {
                graph.fitToContent({
                    gridWidth: 1,
                    gridHeight: 1,
                    padding: options.stencilGraphPadding || 10,
                    contentArea: model.getAllCellsBBox() || {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                    },
                });
            }
            return memo || found;
        }, false);
        common_1.Dom.toggleClass(this.container, 'not-found', !found);
    }
    isCellMatched(cell, keyword, filters, ignoreCase) {
        if (keyword && filters) {
            return Object.keys(filters).some((shape) => {
                if (shape === '*' || cell.shape === shape) {
                    const filter = filters[shape];
                    if (typeof filter === 'boolean') {
                        return filter;
                    }
                    const paths = Array.isArray(filter) ? filter : [filter];
                    return paths.some((path) => {
                        let val = cell.getPropByPath(path);
                        if (val != null) {
                            val = `${val}`;
                            if (!ignoreCase) {
                                val = val.toLowerCase();
                            }
                            return val.indexOf(keyword) >= 0;
                        }
                        return false;
                    });
                }
                return false;
            });
        }
        return true;
    }
    onSearch(evt) {
        this.filter(evt.target.value, this.options.search);
    }
    onSearchFocusIn() {
        common_1.Dom.addClass(this.container, 'is-focused');
    }
    onSearchFocusOut() {
        common_1.Dom.removeClass(this.container, 'is-focused');
    }
    onTitleClick() {
        if (this.options.collapsable) {
            common_1.Dom.toggleClass(this.container, 'collapsed');
            if (common_1.Dom.hasClass(this.container, 'collapsed')) {
                this.collapseGroups();
            }
            else {
                this.expandGroups();
            }
        }
    }
    onGroupTitleClick(evt) {
        const group = evt.target.closest(`.${this.prefixClassName(exports.ClassNames.group)}`);
        if (group) {
            this.toggleGroup(common_1.Dom.attr(group, 'data-name') || '');
        }
        const allCollapsed = Object.keys(this.groups).every((name) => {
            const group = this.getGroup(name);
            const groupElem = this.groups[name];
            return ((group && group.collapsable === false) ||
                common_1.Dom.hasClass(groupElem, 'collapsed'));
        });
        common_1.Dom.toggleClass(this.container, 'collapsed', allCollapsed);
    }
    getModel(groupName) {
        const graph = this.getGraph(groupName);
        return graph ? graph.model : null;
    }
    getGraph(groupName) {
        return this.graphs[groupName || exports.DefaultGroupName];
    }
    getGroup(groupName) {
        const groups = this.options.groups;
        if (groupName != null && groups && groups.length) {
            return groups.find((group) => group.name === groupName);
        }
        return null;
    }
    getGroupByNode(node) {
        const groups = this.options.groups;
        if (groups) {
            return groups.find((group) => {
                const model = this.getModel(group.name);
                if (model) {
                    return model.has(node.id);
                }
                return false;
            });
        }
        return null;
    }
    clearGroups() {
        Object.keys(this.graphs).forEach((groupName) => {
            const graph = this.graphs[groupName];
            this.unregisterGraphEvents(graph);
            graph.dispose();
        });
        Object.keys(this.groups).forEach((groupName) => {
            const elem = this.groups[groupName];
            common_1.Dom.remove(elem);
        });
        this.graphs = {};
        this.groups = {};
    }
    onRemove() {
        this.clearGroups();
        this.dnd.remove();
        this.stopListening();
        this.undelegateDocumentEvents();
    }
    dispose() {
        this.remove();
        common_1.CssLoader.clean(this.name);
    }
}
exports.Stencil = Stencil;
tslib_1.__decorate([
    (0, common_1.disposable)()
], Stencil.prototype, "dispose", null);
//# sourceMappingURL=index.js.map