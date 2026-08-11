import { Component } from 'preact/compat';
import LogicFlow from '../../LogicFlow';
import ArrowInfo = LogicFlow.ArrowInfo;
export type ArrowStyle = {
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    offset: number;
    refX?: number;
    refY?: number;
    verticalLength: number;
};
type ArrowAttributesType = {
    d: string;
} & ArrowStyle;
type IProps = {
    arrowInfo: ArrowInfo;
    style: ArrowStyle;
};
export declare class Arrow extends Component<IProps> {
    getArrowAttributes(): ArrowAttributesType;
    getShape(): import("preact/compat").JSX.Element;
    render(): import("preact/compat").JSX.Element;
}
export default Arrow;
