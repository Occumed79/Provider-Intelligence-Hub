import type { PortLayoutCommonArgs, PortLayoutDefinition } from './index';
export interface EllipseArgs extends PortLayoutCommonArgs {
    start?: number;
    step?: number;
    compensateRotate?: boolean;
    /**
     * delta radius
     */
    dr?: number;
}
export declare const ellipse: PortLayoutDefinition<EllipseArgs>;
export declare const ellipseSpread: PortLayoutDefinition<EllipseArgs>;
