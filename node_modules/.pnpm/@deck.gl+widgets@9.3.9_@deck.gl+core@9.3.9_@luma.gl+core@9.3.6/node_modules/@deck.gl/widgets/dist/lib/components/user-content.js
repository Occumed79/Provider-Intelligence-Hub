import { jsx as _jsx } from "preact/jsx-runtime";
import { useEffect, useRef } from 'preact/hooks';
export const UserContent = ({ text, html, element, ...props }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (containerRef.current && element) {
            containerRef.current.append(element);
        }
        return () => {
            element?.remove();
        };
    }, [element]);
    return (_jsx("div", { ref: containerRef, ...props, dangerouslySetInnerHTML: html ? { __html: html } : undefined, children: text }));
};
//# sourceMappingURL=user-content.js.map