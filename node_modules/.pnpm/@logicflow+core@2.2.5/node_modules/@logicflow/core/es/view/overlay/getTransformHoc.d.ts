import { ComponentType } from 'preact';
import GraphModel from '../../model/GraphModel';
type IProps = {
    graphModel: GraphModel;
};
export type GraphTransform = {
    transform: string;
    transformOrigin: string;
};
export declare function getTransform<P>(WrappedComponent: ComponentType<P>): {
    new (props?: (IProps & P) | undefined, context?: any): {
        getMatrixString(): GraphTransform;
        render(): import("preact").JSX.Element;
        componentWillMount?(): void;
        componentDidMount?(): void;
        componentWillUnmount?(): void;
        getChildContext?(): object;
        componentWillReceiveProps?(nextProps: Readonly<IProps & P>, nextContext: any): void;
        shouldComponentUpdate?(nextProps: Readonly<IProps & P>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUpdate?(nextProps: Readonly<IProps & P>, nextState: Readonly<{}>, nextContext: any): void;
        getSnapshotBeforeUpdate?(oldProps: Readonly<IProps & P>, oldState: Readonly<{}>): any;
        componentDidUpdate?(previousProps: Readonly<IProps & P>, previousState: Readonly<{}>, snapshot: any): void;
        componentDidCatch?(error: any, errorInfo: import("preact").ErrorInfo): void;
        state: Readonly<{}>;
        props: import("preact").RenderableProps<IProps & P, any>;
        context: any;
        base?: Element | Text | undefined;
        setState<K extends never>(state: Partial<{}> | ((prevState: Readonly<{}>, props: Readonly<IProps & P>) => Partial<{}> | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
    };
    displayName?: string | undefined;
    defaultProps?: any;
    contextType?: import("preact").Context<any> | undefined;
    getDerivedStateFromProps?(props: object, state: object): object | null;
    getDerivedStateFromError?(error: any): object | null;
};
export {};
