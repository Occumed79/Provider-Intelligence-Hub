import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useState, useRef, useEffect } from 'preact/hooks';
import { getCSSMask } from "../data-url.js";
function getMenuItemValue(item) {
    return typeof item === 'string' ? item : item.value;
}
function getMenuItemLabel(item) {
    return typeof item === 'string' ? item : item.label;
}
function getMenuItemIcon(item) {
    return typeof item === 'string' ? undefined : item.icon;
}
export const DropdownMenu = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    return (_jsx(SimpleMenu, { ...props, style: { ...props.style, position: 'absolute' }, isOpen: isOpen, onClose: () => setIsOpen(false), trigger: _jsx("button", { className: "deck-widget-dropdown-button", onClick: () => setIsOpen(!isOpen), children: _jsx("span", { className: `deck-widget-dropdown-icon ${isOpen ? 'open' : ''}` }) }) }));
};
export const SimpleMenu = (props) => {
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                props.onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleSelect = (value, item) => {
        if (value) {
            if (typeof item === 'object') {
                item.onSelect?.();
            }
            props.onSelect?.(value);
            props.onClose();
        }
    };
    // Don't render anything if there are no menu items
    if (props.menuItems.length === 0) {
        return null;
    }
    return (_jsxs("div", { className: "deck-widget-dropdown-container", ref: dropdownRef, children: [props.trigger, props.isOpen && (_jsx("ul", { className: "deck-widget-dropdown-menu", style: props.style, children: props.menuItems.map((item, i) => {
                    const value = getMenuItemValue(item);
                    const icon = getMenuItemIcon(item);
                    return (_jsxs("li", { className: `deck-widget-dropdown-item ${value ? '' : 'disabled'}`, onClick: () => handleSelect(value, item), children: [icon && (_jsx("span", { className: "deck-widget-dropdown-item-icon", style: getCSSMask(icon) })), getMenuItemLabel(item)] }, i));
                }) }))] }));
};
//# sourceMappingURL=dropdown-menu.js.map