import type { NodeAnchorDefinition } from './index';
export interface BBoxEndpointOptions {
    dx?: number | string;
    dy?: number | string;
    /**
     * Should the anchor bbox rotate with the terminal view.
     *
     * Default is `false`, meaning that the unrotated bbox is used.
     */
    rotate?: boolean;
}
export declare const center: NodeAnchorDefinition<BBoxEndpointOptions>;
export declare const top: NodeAnchorDefinition<BBoxEndpointOptions>;
export declare const bottom: NodeAnchorDefinition<BBoxEndpointOptions>;
export declare const left: NodeAnchorDefinition<BBoxEndpointOptions>;
export declare const right: NodeAnchorDefinition<BBoxEndpointOptions>;
export declare const topLeft: NodeAnchorDefinition<BBoxEndpointOptions>;
export declare const topRight: NodeAnchorDefinition<BBoxEndpointOptions>;
export declare const bottomLeft: NodeAnchorDefinition<BBoxEndpointOptions>;
export declare const bottomRight: NodeAnchorDefinition<BBoxEndpointOptions>;
