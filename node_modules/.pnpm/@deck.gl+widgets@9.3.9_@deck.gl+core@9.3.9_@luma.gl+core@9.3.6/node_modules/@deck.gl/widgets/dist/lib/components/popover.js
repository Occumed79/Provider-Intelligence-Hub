import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useRef, useEffect, useMemo } from 'preact/hooks';
import { computePosition, flip, shift, offset, arrow, autoUpdate } from '@floating-ui/dom';
export const Popover = ({ x, y, placement = 'right', offset: pixelOffset = 0, arrow: arrowSize = false, arrowColor = 'white', children }) => {
    const anchorRef = useRef(null);
    const contentRef = useRef(null);
    const arrowRef = useRef(null);
    const updaterRef = useRef();
    updaterRef.current = () => {
        if (!anchorRef.current || !contentRef.current)
            return;
        const arrowWidth = Array.isArray(arrowSize) ? arrowSize[0] : arrowSize || 0;
        const arrowHeight = Array.isArray(arrowSize) ? arrowSize[1] : arrowSize || 0;
        const padding = pixelOffset + Math.max(arrowHeight, arrowWidth);
        const middleware = placement.includes('-')
            ? [offset(padding), flip(), shift()]
            : [offset(padding), shift(), flip()];
        if (arrowRef.current)
            middleware.push(arrow({ element: arrowRef.current }));
        computePosition(anchorRef.current, contentRef.current, {
            placement,
            strategy: 'fixed',
            middleware
        }).then(popoverPos => {
            if (contentRef.current) {
                Object.assign(contentRef.current.style, {
                    left: `${popoverPos.x}px`,
                    top: `${popoverPos.y}px`
                });
            }
            const arrowData = popoverPos.middlewareData.arrow;
            if (arrowData && arrowRef.current) {
                const arrowStyle = createArrow(arrowWidth, arrowHeight, arrowColor, popoverPos.placement);
                arrowStyle.transform = `translate(${arrowData.x || 0}px, ${arrowData.y || 0}px)`;
                Object.assign(arrowRef.current.style, arrowStyle);
            }
        });
    };
    useMemo(() => {
        updaterRef.current?.();
    }, [x, y, placement, arrowSize, pixelOffset]);
    useEffect(() => {
        // initial mount
        const anchor = anchorRef.current;
        const content = contentRef.current;
        if (!anchor || !content) {
            return undefined;
        }
        content.style.visibility = 'visible';
        const cleanup = autoUpdate(anchor, content, () => updaterRef.current?.());
        return () => {
            cleanup();
        };
    }, []);
    return (_jsx("div", { style: { position: 'absolute', left: x, top: y }, ref: anchorRef, children: _jsxs("div", { className: "deck-widget deck-widget-popover", style: { position: 'fixed', visibility: 'hidden', pointerEvents: 'none' }, ref: contentRef, children: [Boolean(arrowSize) && (_jsx("div", { className: "deck-widget-popover-arrow", style: { position: 'absolute' }, ref: arrowRef })), children] }) }));
};
function createArrow(width, height, color, placement) {
    const result = {
        width: 0,
        height: 0,
        top: '',
        bottom: '',
        left: '',
        right: ''
    };
    if (placement.startsWith('bottom')) {
        result.borderLeft = `${width / 2}px solid transparent`;
        result.borderRight = `${width / 2}px solid transparent`;
        result.borderBottom = `${height}px solid ${color}`;
        result.borderTop = '';
        result.top = `${-height}px`;
    }
    else if (placement.startsWith('top')) {
        result.borderLeft = `${width / 2}px solid transparent`;
        result.borderRight = `${width / 2}px solid transparent`;
        result.borderTop = `${height}px solid ${color}`;
        result.borderBottom = '';
        result.bottom = `${-height}px`;
    }
    else if (placement.startsWith('right')) {
        result.borderTop = `${width / 2}px solid transparent`;
        result.borderBottom = `${width / 2}px solid transparent`;
        result.borderRight = `${height}px solid ${color}`;
        result.borderLeft = '';
        result.left = `${-height}px`;
    }
    else if (placement.startsWith('left')) {
        result.borderTop = `${width / 2}px solid transparent`;
        result.borderBottom = `${width / 2}px solid transparent`;
        result.borderLeft = `${height}px solid ${color}`;
        result.borderRight = '';
        result.right = `${-height}px`;
    }
    return result;
}
//# sourceMappingURL=popover.js.map