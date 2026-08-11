import type { PortLabelLayoutCommonOptions, PortLabelLayoutDefinition } from './index';
export interface RadialArgs extends PortLabelLayoutCommonOptions {
    offset?: number;
}
export declare const radial: PortLabelLayoutDefinition<RadialArgs>;
export declare const radialOriented: PortLabelLayoutDefinition<RadialArgs>;
