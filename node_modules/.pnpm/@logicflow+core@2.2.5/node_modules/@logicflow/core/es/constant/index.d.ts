export declare const DEFAULT_VISIBLE_SPACE = 200;
export declare const ELEMENT_MAX_Z_INDEX = 9999;
export declare enum ElementState {
    DEFAULT = 1,// 默认显示
    TEXT_EDIT = 2,// 此元素正在进行文本编辑
    SHOW_MENU = 3,// 显示菜单，废弃请使用菜单插件
    ALLOW_CONNECT = 4,// 此元素允许作为当前边的目标节点
    NOT_ALLOW_CONNECT = 5
}
export declare enum ElementType {
    NODE = "node",
    EDGE = "edge",
    GRAPH = "graph"
}
export declare enum ModelType {
    NODE = "node",
    CIRCLE_NODE = "circle-node",
    POLYGON_NODE = "polygon-node",
    RECT_NODE = "rect-node",
    TEXT_NODE = "text-node",
    ELLIPSE_NODE = "ellipse-node",
    DIAMOND_NODE = "diamond-node",
    HTML_NODE = "html-node",
    CUSTOM_HTML_NODE = "custom-html-node",
    EDGE = "edge",
    LINE_EDGE = "line-edge",
    POLYLINE_EDGE = "polyline-edge",
    BEZIER_EDGE = "bezier-edge",
    GRAPH = "graph"
}
export declare enum EventType {
    ELEMENT_CLICK = "element:click",// 是 node:click & edge:click 的并集
    NODE_ADD = "node:add",
    NODE_DELETE = "node:delete",
    NODE_CLICK = "node:click",
    NODE_DBCLICK = "node:dbclick",
    NODE_GROUP_COPY = "node:group-copy-add",
    NODE_DND_ADD = "node:dnd-add",
    NODE_DND_DRAG = "node:dnd-drag",
    NODE_MOUSEDOWN = "node:mousedown",
    NODE_DRAGSTART = "node:dragstart",
    NODE_DRAG = "node:drag",
    NODE_DROP = "node:drop",
    NODE_MOUSEUP = "node:mouseup",
    NODE_MOUSEMOVE = "node:mousemove",
    NODE_MOUSEENTER = "node:mouseenter",
    NODE_MOUSELEAVE = "node:mouseleave",
    NODE_CONTEXTMENU = "node:contextmenu",
    NODE_ROTATE = "node:rotate",
    NODE_RESIZE = "node:resize",
    NODE_FOCUS = "node:focus",
    NODE_BLUR = "node:blur",
    NODE_PROPERTIES_CHANGE = "node:properties-change",
    NODE_PROPERTIES_DELETE = "node:properties-delete",
    EDGE_ADD = "edge:add",
    EDGE_DELETE = "edge:delete",
    EDGE_CLICK = "edge:click",
    EDGE_DBCLICK = "edge:dbclick",
    EDGE_FOCUS = "edge:focus",
    EDGE_BLUR = "edge:blur",
    EDGE_MOUSEENTER = "edge:mouseenter",
    EDGE_MOUSELEAVE = "edge:mouseleave",
    EDGE_CONTEXTMENU = "edge:contextmenu",
    EDGE_ADJUST = "edge:adjust",
    EDGE_EXCHANGE_NODE = "edge:exchange-node",
    ANCHOR_CLICK = "anchor:click",
    ANCHOR_MOUSEDOWN = "anchor:mousedown",
    ANCHOR_DRAGSTART = "anchor:dragstart",
    ANCHOR_DRAG = "anchor:drag",
    ANCHOR_DROP = "anchor:drop",
    ANCHOR_DRAGEND = "anchor:dragend",
    ADJUST_POINT_MOUSEDOWN = "adjustPoint:mousedown",
    ADJUST_POINT_MOUSEUP = "adjustPoint:mouseup",
    ADJUST_POINT_MOUSEMOVE = "adjustPoint:mousemove",
    ADJUST_POINT_DRAGSTART = "adjustPoint:dragstart",
    ADJUST_POINT_DRAG = "adjustPoint:drag",
    ADJUST_POINT_DROP = "adjustPoint:drop",
    ADJUST_POINT_DRAGEND = "adjustPoint:dragend",
    BLANK_MOUSEDOWN = "blank:mousedown",
    BLANK_DRAGSTART = "blank:dragstart",
    BLANK_DRAG = "blank:drag",
    BLANK_DROP = "blank:drop",
    BLANK_MOUSEMOVE = "blank:mousemove",
    BLANK_CANVAS_MOUSEMOVE = "blank:canvas-mousemove",
    BLANK_MOUSEUP = "blank:mouseup",
    BLANK_CLICK = "blank:click",
    BLANK_CONTEXTMENU = "blank:contextmenu",
    SELECTION_MOUSEDOWN = "selection:mousedown",
    SELECTION_DRAGSTART = "selection:dragstart",
    SELECTION_DRAG = "selection:drag",
    SELECTION_DROP = "selection:drop",
    SELECTION_MOUSEMOVE = "selection:mousemove",
    SELECTION_MOUSEUP = "selection:mouseup",
    SELECTION_CONTEXTMENU = "selection:contextmenu",
    CONNECTION_NOT_ALLOWED = "connection:not-allowed",
    TEXT_MOUSEDOWN = "text:mousedown",
    TEXT_DRAGSTART = "text:dragstart",
    TEXT_DRAG = "text:drag",
    TEXT_DROP = "text:drop",
    TEXT_CLICK = "text:click",
    TEXT_DBCLICK = "text:dbclick",
    TEXT_BLUR = "text:blur",
    TEXT_MOUSEMOVE = "text:mousemove",
    TEXT_MOUSEUP = "text:mouseup",
    TEXT_FOCUS = "text:focus",
    TEXT_ADD = "text:add",
    TEXT_UPDATE = "text:update",
    TEXT_CLEAR = "text:clear",
    LABEL_MOUSEDOWN = "label:mousedown",
    LABEL_DRAGSTART = "label:dragstart",
    LABEL_DRAG = "label:drag",
    LABEL_DROP = "label:drop",
    LABEL_CLICK = "label:click",
    LABEL_DBCLICK = "label:dbclick",
    LABEL_BLUR = "label:blur",
    LABEL_MOUSEMOVE = "label:mousemove",
    LABEL_MOUSEUP = "label:mouseup",
    LABEL_FOCUS = "label:focus",
    LABEL_ADD = "label:add",
    LABEL_UPDATE = "label:update",
    LABEL_CLEAR = "label:clear",
    LABEL_DELETE = "label:delete",
    LABEL_SHOULD_ADD = "label:should-add",
    LABEL_BATCH_ADD = "label:batch-add",
    LABEL_SHOULD_UPDATE = "label:should-update",
    LABEL_SHOULD_DELETE = "label:should-delete",
    LABEL_BATCH_DELETE = "label:batch-delete",
    LABEL_NOT_ALLOWED_ADD = "label:not-allowed-add",
    HISTORY_CHANGE = "history:change",
    GRAPH_TRANSFORM = "graph:transform",
    GRAPH_RENDERED = "graph:rendered",
    GRAPH_UPDATED = "graph:updated",
    EDIT_CONFIG_CHANGED = "editConfig:changed"
}
export declare enum OverlapMode {
    STATIC = -1,// 静态(元素层级不随点击变化)
    DEFAULT = 0,// 默认
    INCREASE = 1,// 递增
    EDGE_TOP = 2
}
export declare enum SegmentDirection {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical"
}
export declare enum TextMode {
    TEXT = "text",
    LABEL = "label"
}
export * from './theme';
