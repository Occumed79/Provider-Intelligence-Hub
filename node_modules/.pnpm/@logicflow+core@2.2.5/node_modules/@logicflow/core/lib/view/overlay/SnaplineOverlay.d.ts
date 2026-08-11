import { Component } from 'preact/compat';
import SnaplineModel from '../../model/SnaplineModel';
import OutlineOverlay from './OutlineOverlay';
type IProps = {
    snaplineModel?: SnaplineModel;
};
export declare class SnaplineOverlay extends Component<IProps> {
    render(): import("preact/compat").JSX.Element;
}
export default OutlineOverlay;
