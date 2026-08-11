import type { KeyValue } from '../../common';
import { type ToolItemDefinition, type ToolItemOptions } from '../../view/tool';
import { Registry } from '../registry';
import { SourceAnchor, TargetAnchor } from './anchor';
import { SourceArrowhead, TargetArrowhead } from './arrowhead';
import { Boundary } from './boundary';
import { Button, Remove } from './button';
import { EdgeEditor, NodeEditor } from './editor';
import { Segments } from './segments';
import { Vertices } from './vertices';
/**
 * ========== NodeTool ==========
 */
export declare const nodeToolPresets: {
    boundary: typeof Boundary;
    button: typeof Button;
    'button-remove': typeof Remove;
    'node-editor': typeof NodeEditor;
};
export type NodeToolDefinition = ToolItemDefinition;
export declare const nodeToolRegistry: Registry<ToolItemDefinition, {
    boundary: typeof Boundary;
    button: typeof Button;
    'button-remove': typeof Remove;
    'node-editor': typeof NodeEditor;
}, ToolItemOptions & {
    inherit?: string;
} & KeyValue<any>>;
type NodeToolPresets = typeof nodeToolPresets;
type NodeToolOptionsMap = {
    readonly [K in keyof NodeToolPresets]-?: ConstructorParameters<NodeToolPresets[K]>[0];
};
export type NodeToolNativeNames = keyof NodeToolPresets;
export interface NodeToolNativeItem<T extends NodeToolNativeNames = NodeToolNativeNames> {
    name: T;
    args?: NodeToolOptionsMap[T];
}
export interface NodeToolManualItem {
    name: Exclude<string, NodeToolNativeNames>;
    args?: ToolItemOptions;
}
/**
 * ======== EdgeTool ==========
 */
export declare const edgeToolPresets: {
    boundary: typeof Boundary;
    vertices: typeof Vertices;
    segments: typeof Segments;
    button: typeof Button;
    'button-remove': typeof Remove;
    'source-anchor': typeof SourceAnchor;
    'target-anchor': typeof TargetAnchor;
    'source-arrowhead': typeof SourceArrowhead;
    'target-arrowhead': typeof TargetArrowhead;
    'edge-editor': typeof EdgeEditor;
};
export type EdgeToolDefinition = NodeToolDefinition;
export declare const edgeToolRegistry: Registry<ToolItemDefinition, {
    boundary: typeof Boundary;
    vertices: typeof Vertices;
    segments: typeof Segments;
    button: typeof Button;
    'button-remove': typeof Remove;
    'source-anchor': typeof SourceAnchor;
    'target-anchor': typeof TargetAnchor;
    'source-arrowhead': typeof SourceArrowhead;
    'target-arrowhead': typeof TargetArrowhead;
    'edge-editor': typeof EdgeEditor;
}, ToolItemOptions & {
    inherit?: string;
} & KeyValue<any>>;
type EdgeToolPresets = typeof edgeToolPresets;
type EdgeToolOptionsMap = {
    readonly [K in keyof EdgeToolPresets]-?: ConstructorParameters<EdgeToolPresets[K]>[0];
};
export type EdgeToolNativeNames = keyof EdgeToolPresets;
export interface EdgeToolNativeItem<T extends EdgeToolNativeNames = EdgeToolNativeNames> {
    name: T;
    args?: EdgeToolOptionsMap[T];
}
export interface EdgeToolManualItem {
    name: Exclude<string, EdgeToolNativeNames>;
    args?: ToolItemOptions;
}
export {};
