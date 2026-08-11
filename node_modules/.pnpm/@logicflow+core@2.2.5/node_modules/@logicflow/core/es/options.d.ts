import type { TransformModel, BaseNodeModel, Model } from './model';
import { createElement as h } from 'preact/compat';
import LogicFlow from './LogicFlow';
import { KeyboardDef } from './keyboard';
import { OverlapMode, TextMode } from './constant';
import { Grid } from './view/overlay';
import GridOptions = Grid.GridOptions;
export declare namespace Options {
    import NodeData = LogicFlow.NodeData;
    import EdgeData = LogicFlow.EdgeData;
    import GraphData = LogicFlow.GraphData;
    import ExtensionType = LogicFlow.ExtensionType;
    type EdgeType = 'line' | 'polyline' | 'bezier' | string;
    type BackgroundConfig = {
        backgroundImage?: string;
        backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'initial' | 'inherit';
        [key: string]: any;
    };
    type AnimationConfig = {
        node: boolean;
        edge: boolean;
    };
    type EdgeGeneratorType = (sourceNode: LogicFlow.NodeData, targetNode: LogicFlow.NodeData, currentEdge?: Partial<LogicFlow.EdgeConfig>) => any;
    type customTargetAnchorType = (nodeModel: BaseNodeModel, position: LogicFlow.Point) => Model.AnchorInfo | undefined;
    interface CustomAnchorLineProps {
        sourcePoint: LogicFlow.Point;
        targetPoint: LogicFlow.Point;
        [key: string]: any;
    }
    interface GuardsConfig {
        beforeClone?: (data: NodeData | GraphData) => boolean;
        beforeDelete?: (data: NodeData | EdgeData) => boolean;
    }
    interface Common {
        container: HTMLElement;
        width?: number;
        height?: number;
        background?: false | BackgroundConfig;
        /**
         * Grid 网格配置
         */
        grid?: number | boolean | GridOptions;
        partial?: boolean;
        keyboard?: KeyboardDef;
        style?: Partial<LogicFlow.Theme>;
        edgeType?: EdgeType;
        adjustEdge?: boolean;
        textMode?: TextMode;
        edgeTextMode?: TextMode;
        nodeTextMode?: TextMode;
        allowRotate?: boolean;
        allowResize?: boolean;
        isSilentMode?: boolean;
        stopScrollGraph?: boolean;
        stopZoomGraph?: boolean;
        stopMoveGraph?: boolean | 'vertical' | 'horizontal' | [number, number, number, number];
        animation?: boolean | Partial<AnimationConfig>;
        history?: boolean;
        outline?: boolean;
        snapline?: boolean;
        snaplineEpsilon?: number;
        textEdit?: boolean;
        guards?: GuardsConfig;
        overlapMode?: OverlapMode;
        plugins?: ExtensionType[];
        pluginsOptions?: Record<string, any>;
        disabledPlugins?: string[];
        disabledTools?: string[];
        idGenerator?: (type?: string) => string;
        edgeGenerator?: EdgeGeneratorType;
        customTargetAnchor?: customTargetAnchorType;
        customTrajectory?: (props: CustomAnchorLineProps) => h.JSX.Element;
        themeMode?: LogicFlow.ThemeMode;
        parentTransform?: TransformModel;
        [key: string]: unknown;
    }
    interface ManualBooleans {
    }
    interface Manual extends Partial<Common>, Partial<ManualBooleans> {
    }
    interface Definition extends Common {
    }
}
export declare namespace Options {
    function get(options: Partial<Manual>): Definition;
}
export declare namespace Options {
    const defaults: Partial<Definition>;
}
