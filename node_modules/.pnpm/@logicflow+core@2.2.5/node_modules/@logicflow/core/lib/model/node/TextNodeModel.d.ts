import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant';
import LogicFlow from '../../LogicFlow';
export type ITextNodeProperties = {
    style?: LogicFlow.CommonTheme;
    textStyle?: LogicFlow.CommonTheme;
    [key: string]: unknown;
};
export declare class TextNodeModel<P extends ITextNodeProperties = ITextNodeProperties> extends BaseNodeModel<P> {
    modelType: ModelType;
    getTextStyle(): {
        [x: string]: unknown;
        fill?: string | undefined;
        stroke?: string | undefined;
        strokeWidth?: number | undefined;
        radius?: number | undefined;
        rx?: number | undefined;
        ry?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        path?: string | undefined;
        background?: LogicFlow.CommonTheme | undefined;
        color?: string | undefined;
        fontSize: number;
        textWidth?: number | undefined;
        lineHeight?: number | undefined;
        textAnchor?: "middle" | "start" | "end" | undefined;
        dominantBaseline?: "middle" | "central" | "auto" | "text-bottom" | "alphabetic" | "ideographic" | "mathematical" | "hanging" | "text-top" | undefined;
        overflowMode?: "default" | "autoWrap" | "ellipsis" | undefined;
        wrapPadding?: string | undefined;
    };
    get width(): number;
    get height(): number;
}
export default TextNodeModel;
