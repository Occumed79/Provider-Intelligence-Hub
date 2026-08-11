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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAnchorConnectValidateData = exports.EventType = exports.ElementType = exports.ModelType = exports.ElementState = exports.LogicFlowUtil = exports.Component = exports.createRef = exports.h = exports.LogicFlow = exports.observer = void 0;
var mobx_preact_1 = require("mobx-preact");
var compat_1 = require("preact/compat");
Object.defineProperty(exports, "h", { enumerable: true, get: function () { return compat_1.createElement; } });
Object.defineProperty(exports, "createRef", { enumerable: true, get: function () { return compat_1.createRef; } });
Object.defineProperty(exports, "Component", { enumerable: true, get: function () { return compat_1.Component; } });
var LogicFlow_1 = __importDefault(require("./LogicFlow"));
exports.LogicFlow = LogicFlow_1.default;
var LogicFlowUtil = __importStar(require("./util"));
exports.LogicFlowUtil = LogicFlowUtil;
function observer(props) {
    return (0, mobx_preact_1.observer)(props);
}
exports.observer = observer;
__exportStar(require("./util"), exports);
__exportStar(require("./tool"), exports);
__exportStar(require("./view"), exports);
__exportStar(require("./model"), exports);
__exportStar(require("./options"), exports);
__exportStar(require("./keyboard"), exports);
__exportStar(require("./constant"), exports);
__exportStar(require("./algorithm"), exports);
__exportStar(require("./event/eventEmitter"), exports);
var constant_1 = require("./constant");
Object.defineProperty(exports, "ElementState", { enumerable: true, get: function () { return constant_1.ElementState; } });
Object.defineProperty(exports, "ModelType", { enumerable: true, get: function () { return constant_1.ModelType; } });
Object.defineProperty(exports, "ElementType", { enumerable: true, get: function () { return constant_1.ElementType; } });
Object.defineProperty(exports, "EventType", { enumerable: true, get: function () { return constant_1.EventType; } });
var node_1 = require("./util/node");
Object.defineProperty(exports, "formatAnchorConnectValidateData", { enumerable: true, get: function () { return node_1.formatAnchorConnectValidateData; } });
exports.default = LogicFlow_1.default;
