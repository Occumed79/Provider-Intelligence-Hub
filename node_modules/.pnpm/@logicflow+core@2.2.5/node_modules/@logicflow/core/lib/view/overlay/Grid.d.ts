import { Component } from 'preact/compat';
import { MajorBoldConfig } from './gridConfig';
import { GraphModel } from '../../model';
type IProps = {
    graphModel: GraphModel;
};
export declare class Grid extends Component<IProps> {
    gridOptions: Grid.GridOptions;
    readonly id: string;
    constructor(props: IProps);
    renderDot(): import("preact/compat").JSX.Element;
    private getDashArrayForSize;
    private getPeriod;
    private getBoldStrokeWidth;
    private renderMeshEdgeLines;
    renderMesh(): import("preact/compat").JSX.Element;
    render(): import("preact/compat").JSX.Element;
}
export declare namespace Grid {
    type GridOptions = {
        /**
         * 网格格子间距
         */
        size?: number;
        /**
         * 网格是否可见
         */
        visible?: boolean;
        /**
         * 网格类型
         * - `dot` 点状网格
         * - `mesh` 交叉线网格
         */
        type?: 'dot' | 'mesh';
        config?: {
            /**
             * 网格的颜色
             */
            color?: string;
            /**
             * 网格的宽度
             * - 对于 `dot` 点状网格，表示点的大小
             * - 对于 `mesh` 交叉线网格，表示线的宽度
             */
            thickness?: number;
        };
        /**
         * 行为配置：支持 boolean 或高级对象
         * - false: 禁用特殊样式，opacity=1，无加粗，无虚线
         * - true: 启用默认样式，opacity=0.75，每第5个加粗/实线，虚线动态计算
         * - object: 高级配置，详见 MajorBoldConfig
         */
        majorBold?: boolean | MajorBoldConfig;
    };
    function getGridOptions(options: number | boolean | GridOptions): GridOptions;
}
export {};
