export var DEFAULT_VISIBLE_SPACE = 200;
export var ELEMENT_MAX_Z_INDEX = 9999;
export var ElementState;
(function (ElementState) {
    ElementState[ElementState["DEFAULT"] = 1] = "DEFAULT";
    ElementState[ElementState["TEXT_EDIT"] = 2] = "TEXT_EDIT";
    ElementState[ElementState["SHOW_MENU"] = 3] = "SHOW_MENU";
    ElementState[ElementState["ALLOW_CONNECT"] = 4] = "ALLOW_CONNECT";
    ElementState[ElementState["NOT_ALLOW_CONNECT"] = 5] = "NOT_ALLOW_CONNECT";
})(ElementState || (ElementState = {}));
export var ElementType;
(function (ElementType) {
    ElementType["NODE"] = "node";
    ElementType["EDGE"] = "edge";
    ElementType["GRAPH"] = "graph";
})(ElementType || (ElementType = {}));
export var ModelType;
(function (ModelType) {
    ModelType["NODE"] = "node";
    ModelType["CIRCLE_NODE"] = "circle-node";
    ModelType["POLYGON_NODE"] = "polygon-node";
    ModelType["RECT_NODE"] = "rect-node";
    ModelType["TEXT_NODE"] = "text-node";
    ModelType["ELLIPSE_NODE"] = "ellipse-node";
    ModelType["DIAMOND_NODE"] = "diamond-node";
    ModelType["HTML_NODE"] = "html-node";
    ModelType["CUSTOM_HTML_NODE"] = "custom-html-node";
    ModelType["EDGE"] = "edge";
    ModelType["LINE_EDGE"] = "line-edge";
    ModelType["POLYLINE_EDGE"] = "polyline-edge";
    ModelType["BEZIER_EDGE"] = "bezier-edge";
    ModelType["GRAPH"] = "graph";
})(ModelType || (ModelType = {}));
export var EventType;
(function (EventType) {
    EventType["ELEMENT_CLICK"] = "element:click";
    // Node events
    EventType["NODE_ADD"] = "node:add";
    EventType["NODE_DELETE"] = "node:delete";
    EventType["NODE_CLICK"] = "node:click";
    EventType["NODE_DBCLICK"] = "node:dbclick";
    EventType["NODE_GROUP_COPY"] = "node:group-copy-add";
    EventType["NODE_DND_ADD"] = "node:dnd-add";
    EventType["NODE_DND_DRAG"] = "node:dnd-drag";
    EventType["NODE_MOUSEDOWN"] = "node:mousedown";
    EventType["NODE_DRAGSTART"] = "node:dragstart";
    EventType["NODE_DRAG"] = "node:drag";
    EventType["NODE_DROP"] = "node:drop";
    EventType["NODE_MOUSEUP"] = "node:mouseup";
    EventType["NODE_MOUSEMOVE"] = "node:mousemove";
    EventType["NODE_MOUSEENTER"] = "node:mouseenter";
    EventType["NODE_MOUSELEAVE"] = "node:mouseleave";
    EventType["NODE_CONTEXTMENU"] = "node:contextmenu";
    EventType["NODE_ROTATE"] = "node:rotate";
    EventType["NODE_RESIZE"] = "node:resize";
    EventType["NODE_FOCUS"] = "node:focus";
    EventType["NODE_BLUR"] = "node:blur";
    // 节点 properties 变化事件
    EventType["NODE_PROPERTIES_CHANGE"] = "node:properties-change";
    EventType["NODE_PROPERTIES_DELETE"] = "node:properties-delete";
    // Edge events
    EventType["EDGE_ADD"] = "edge:add";
    EventType["EDGE_DELETE"] = "edge:delete";
    EventType["EDGE_CLICK"] = "edge:click";
    EventType["EDGE_DBCLICK"] = "edge:dbclick";
    EventType["EDGE_FOCUS"] = "edge:focus";
    EventType["EDGE_BLUR"] = "edge:blur";
    EventType["EDGE_MOUSEENTER"] = "edge:mouseenter";
    EventType["EDGE_MOUSELEAVE"] = "edge:mouseleave";
    EventType["EDGE_CONTEXTMENU"] = "edge:contextmenu";
    EventType["EDGE_ADJUST"] = "edge:adjust";
    EventType["EDGE_EXCHANGE_NODE"] = "edge:exchange-node";
    // Anchor events
    EventType["ANCHOR_CLICK"] = "anchor:click";
    EventType["ANCHOR_MOUSEDOWN"] = "anchor:mousedown";
    EventType["ANCHOR_DRAGSTART"] = "anchor:dragstart";
    EventType["ANCHOR_DRAG"] = "anchor:drag";
    EventType["ANCHOR_DROP"] = "anchor:drop";
    EventType["ANCHOR_DRAGEND"] = "anchor:dragend";
    // Adjust point events
    EventType["ADJUST_POINT_MOUSEDOWN"] = "adjustPoint:mousedown";
    EventType["ADJUST_POINT_MOUSEUP"] = "adjustPoint:mouseup";
    EventType["ADJUST_POINT_MOUSEMOVE"] = "adjustPoint:mousemove";
    EventType["ADJUST_POINT_DRAGSTART"] = "adjustPoint:dragstart";
    EventType["ADJUST_POINT_DRAG"] = "adjustPoint:drag";
    EventType["ADJUST_POINT_DROP"] = "adjustPoint:drop";
    EventType["ADJUST_POINT_DRAGEND"] = "adjustPoint:dragend";
    // Blank events
    EventType["BLANK_MOUSEDOWN"] = "blank:mousedown";
    EventType["BLANK_DRAGSTART"] = "blank:dragstart";
    EventType["BLANK_DRAG"] = "blank:drag";
    EventType["BLANK_DROP"] = "blank:drop";
    EventType["BLANK_MOUSEMOVE"] = "blank:mousemove";
    EventType["BLANK_CANVAS_MOUSEMOVE"] = "blank:canvas-mousemove";
    EventType["BLANK_MOUSEUP"] = "blank:mouseup";
    EventType["BLANK_CLICK"] = "blank:click";
    EventType["BLANK_CONTEXTMENU"] = "blank:contextmenu";
    // Selection events
    EventType["SELECTION_MOUSEDOWN"] = "selection:mousedown";
    EventType["SELECTION_DRAGSTART"] = "selection:dragstart";
    EventType["SELECTION_DRAG"] = "selection:drag";
    EventType["SELECTION_DROP"] = "selection:drop";
    EventType["SELECTION_MOUSEMOVE"] = "selection:mousemove";
    EventType["SELECTION_MOUSEUP"] = "selection:mouseup";
    EventType["SELECTION_CONTEXTMENU"] = "selection:contextmenu";
    EventType["CONNECTION_NOT_ALLOWED"] = "connection:not-allowed";
    // Text events
    EventType["TEXT_MOUSEDOWN"] = "text:mousedown";
    EventType["TEXT_DRAGSTART"] = "text:dragstart";
    EventType["TEXT_DRAG"] = "text:drag";
    EventType["TEXT_DROP"] = "text:drop";
    EventType["TEXT_CLICK"] = "text:click";
    EventType["TEXT_DBCLICK"] = "text:dbclick";
    EventType["TEXT_BLUR"] = "text:blur";
    EventType["TEXT_MOUSEMOVE"] = "text:mousemove";
    EventType["TEXT_MOUSEUP"] = "text:mouseup";
    EventType["TEXT_FOCUS"] = "text:focus";
    EventType["TEXT_ADD"] = "text:add";
    EventType["TEXT_UPDATE"] = "text:update";
    EventType["TEXT_CLEAR"] = "text:clear";
    // label events
    EventType["LABEL_MOUSEDOWN"] = "label:mousedown";
    EventType["LABEL_DRAGSTART"] = "label:dragstart";
    EventType["LABEL_DRAG"] = "label:drag";
    EventType["LABEL_DROP"] = "label:drop";
    EventType["LABEL_CLICK"] = "label:click";
    EventType["LABEL_DBCLICK"] = "label:dbclick";
    EventType["LABEL_BLUR"] = "label:blur";
    EventType["LABEL_MOUSEMOVE"] = "label:mousemove";
    EventType["LABEL_MOUSEUP"] = "label:mouseup";
    EventType["LABEL_FOCUS"] = "label:focus";
    EventType["LABEL_ADD"] = "label:add";
    EventType["LABEL_UPDATE"] = "label:update";
    EventType["LABEL_CLEAR"] = "label:clear";
    EventType["LABEL_DELETE"] = "label:delete";
    EventType["LABEL_SHOULD_ADD"] = "label:should-add";
    EventType["LABEL_BATCH_ADD"] = "label:batch-add";
    EventType["LABEL_SHOULD_UPDATE"] = "label:should-update";
    EventType["LABEL_SHOULD_DELETE"] = "label:should-delete";
    EventType["LABEL_BATCH_DELETE"] = "label:batch-delete";
    EventType["LABEL_NOT_ALLOWED_ADD"] = "label:not-allowed-add";
    // Other events
    EventType["HISTORY_CHANGE"] = "history:change";
    EventType["GRAPH_TRANSFORM"] = "graph:transform";
    EventType["GRAPH_RENDERED"] = "graph:rendered";
    EventType["GRAPH_UPDATED"] = "graph:updated";
    EventType["EDIT_CONFIG_CHANGED"] = "editConfig:changed";
})(EventType || (EventType = {}));
export var OverlapMode;
(function (OverlapMode) {
    OverlapMode[OverlapMode["STATIC"] = -1] = "STATIC";
    OverlapMode[OverlapMode["DEFAULT"] = 0] = "DEFAULT";
    OverlapMode[OverlapMode["INCREASE"] = 1] = "INCREASE";
    OverlapMode[OverlapMode["EDGE_TOP"] = 2] = "EDGE_TOP";
})(OverlapMode || (OverlapMode = {}));
export var SegmentDirection;
(function (SegmentDirection) {
    SegmentDirection["HORIZONTAL"] = "horizontal";
    SegmentDirection["VERTICAL"] = "vertical";
})(SegmentDirection || (SegmentDirection = {}));
export var TextMode;
(function (TextMode) {
    TextMode["TEXT"] = "text";
    TextMode["LABEL"] = "label";
})(TextMode || (TextMode = {}));
export * from './theme';
