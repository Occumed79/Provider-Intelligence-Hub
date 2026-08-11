import type { PortLabelLayoutCommonOptions, PortLabelLayoutDefinition } from './index';
export interface InOutArgs extends PortLabelLayoutCommonOptions {
    offset?: number;
}
export declare const outside: PortLabelLayoutDefinition<InOutArgs>;
export declare const outsideOriented: PortLabelLayoutDefinition<InOutArgs>;
export declare const inside: PortLabelLayoutDefinition<InOutArgs>;
export declare const insideOriented: PortLabelLayoutDefinition<InOutArgs>;
