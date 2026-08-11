import type { BackgroundCommonOptions, BackgroundDefinition } from './index';
export interface WatermarkOptions extends BackgroundCommonOptions {
    angle?: number;
}
export declare const watermark: BackgroundDefinition<WatermarkOptions>;
