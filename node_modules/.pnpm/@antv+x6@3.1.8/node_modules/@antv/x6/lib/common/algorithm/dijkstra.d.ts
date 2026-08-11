export type DijkstraAdjacencyList = {
    [key: string]: string[];
};
export type DijkstraWeight = (u: string, v: string) => number;
export declare function dijkstra(adjacencyList: DijkstraAdjacencyList, source: string, weight?: DijkstraWeight): {
    [key: string]: string;
};
