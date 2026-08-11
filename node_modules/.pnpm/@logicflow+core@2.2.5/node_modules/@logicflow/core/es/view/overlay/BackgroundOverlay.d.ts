import { Component } from 'preact/compat';
import { Options as LFOptions } from '../../options';
/**
 * 背景配置, 支持css属性配置
 * https://developer.mozilla.org/zh-CN/docs/Web/CSS/background
 * @example
 * {
 *    backgroundImage: "url('./img/grid.svg')",
      backgroundRepeat: 'repeat',
 * }
 */
type IProps = {
    background: boolean | LFOptions.BackgroundConfig;
};
export declare class BackgroundOverlay extends Component<IProps> {
    render(): import("preact/compat").JSX.Element;
}
export default BackgroundOverlay;
