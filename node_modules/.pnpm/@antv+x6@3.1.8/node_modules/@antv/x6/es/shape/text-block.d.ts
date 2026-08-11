import type { Node, NodeConfig } from '../model';
export declare function getTextBlockMarkup(supportForeignobject: boolean): {
    tagName: string;
    selector: string;
    children: {
        tagName: string;
        ns: string;
        selector: string;
        style: {
            width: string;
            height: string;
            position: string;
            backgroundColor: string;
            textAlign: string;
            margin: number;
            padding: string;
            boxSizing: string;
            display: string;
            alignItems: string;
            justifyContent: string;
        };
    }[];
    attrs?: undefined;
} | {
    tagName: string;
    selector: string;
    attrs: {
        textAnchor: string;
    };
    children?: undefined;
};
export declare const TextBlockConfig: NodeConfig;
export declare const TextBlock: typeof Node;
