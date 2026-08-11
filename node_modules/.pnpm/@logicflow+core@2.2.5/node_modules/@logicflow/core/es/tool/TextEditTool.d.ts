import { Component } from 'preact/compat';
import { IToolProps } from '.';
type IState = {
    style: {
        left: number;
        top: number;
    };
};
export declare class TextEditTool extends Component<IToolProps, IState> {
    static toolName: string;
    ref: import("preact").RefObject<any>;
    __prevText: {
        type: string;
        text: string;
        id: string;
    };
    constructor(props: IToolProps);
    static getDerivedStateFromProps(props: IToolProps): IState | null;
    componentDidUpdate(): void;
    keyupHandler: (ev: KeyboardEvent) => void;
    inputHandler: (ev: any) => void;
    keydownHandler: (ev: any) => void;
    placeCaretAtEnd(el: any): void;
    render(): import("preact/compat").JSX.Element | null;
}
export default TextEditTool;
