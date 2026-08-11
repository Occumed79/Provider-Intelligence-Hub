/**
 * 网格高级 majorBold 配置。
 *
 * 示例（布尔值）：
 *  - false：禁用特殊样式，opacity=1，无加粗，无虚线
 *  - true：启用默认值，opacity=0.75，每第 5 条线/点加粗/实线，
 *          虚线图案通过 getDashArrayForSize(size) 计算
 *
 * 示例（对象）：
 * {
 *   opacity: 0.6,
 *   boldIndices: [4, 8],
 *   dashArrayConfig: { pattern: [4,2,4] },
 *   customBoldWidth: 2,
 * }
 */
export type MajorBoldConfig = {
    /** 默认网格透明度 (0-1) */
    opacity: number;
    /** 一个周期内需要加粗/实线的索引列表 */
    boldIndices: number[];
    /** 虚线样式的计算配置 */
    dashArrayConfig: {
        /** 固定的虚线模式（可选） */
        pattern: number[];
    };
    /** mesh 网格的自定义加粗线宽（可选） */
    customBoldWidth?: number;
};
export declare const defaultGridConfig: MajorBoldConfig;
/**
 * 校验并规范化 GridConfig。
 * - 将 opacity 限制在 [0,1] 范围
 * - boldIndices 过滤为正整数并去重
 */
export declare function validateGridConfig(cfg: MajorBoldConfig): MajorBoldConfig;
/**
 * 合并用户行为配置与默认值。
 * - false → 关闭模式：opacity=1，bold=[]，关闭虚线
 * - true → 默认模式：采用 defaultGridConfig
 * - object → 自定义模式：校验后使用用户配置
 */
export declare function mergeMajorBoldConfig(input?: boolean | MajorBoldConfig): {
    mode: 'disabled' | 'default' | 'custom';
    config: MajorBoldConfig;
};
