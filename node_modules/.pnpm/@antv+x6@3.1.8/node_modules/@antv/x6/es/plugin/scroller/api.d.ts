declare module '../../graph/graph' {
    interface Graph {
        lockScroller: () => Graph;
        unlockScroller: () => Graph;
        updateScroller: () => Graph;
        getScrollbarPosition: () => {
            left: number;
            top: number;
        };
        setScrollbarPosition: (left?: number, top?: number) => Graph;
    }
}
export {};
