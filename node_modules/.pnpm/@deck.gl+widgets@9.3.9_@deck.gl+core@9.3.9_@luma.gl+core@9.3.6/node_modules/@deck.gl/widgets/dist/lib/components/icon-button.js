import { jsx as _jsx } from "preact/jsx-runtime";
import { useMemo } from 'preact/hooks';
import { getCSSMask } from "../data-url.js";
/** Renders a button component with widget CSS */
export const IconButton = (props) => {
    const { className = '', style, color, icon, label, onClick, children } = props;
    const iconStyle = useMemo(() => {
        const css = getCSSMask(icon);
        if (!color)
            return css;
        return { ...css, backgroundColor: color };
    }, [color, icon]);
    return (_jsx("div", { className: "deck-widget-button", style: style, children: _jsx("button", { className: `deck-widget-icon-button ${className}`, type: "button", onClick: onClick, title: label, children: children ? children : _jsx("div", { className: "deck-widget-icon", style: iconStyle }) }) }));
};
//# sourceMappingURL=icon-button.js.map