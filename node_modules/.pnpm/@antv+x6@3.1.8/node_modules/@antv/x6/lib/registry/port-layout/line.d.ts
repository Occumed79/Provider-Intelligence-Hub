import { type PointLike } from '../../geometry';
import type { PortLayoutCommonArgs, PortLayoutDefinition } from './index';
export interface SideArgs extends PortLayoutCommonArgs {
    strict?: boolean;
}
export interface LineArgs extends SideArgs {
    start?: PointLike;
    end?: PointLike;
}
export declare const line: PortLayoutDefinition<LineArgs>;
export declare const left: PortLayoutDefinition<SideArgs>;
export declare const right: PortLayoutDefinition<SideArgs>;
export declare const top: PortLayoutDefinition<SideArgs>;
export declare const bottom: PortLayoutDefinition<SideArgs>;
