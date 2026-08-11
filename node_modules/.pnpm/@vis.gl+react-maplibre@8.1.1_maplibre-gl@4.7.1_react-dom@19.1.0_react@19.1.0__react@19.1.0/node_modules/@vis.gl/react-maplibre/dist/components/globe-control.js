import { useEffect, memo } from 'react';
import { applyReactStyle } from "../utils/apply-react-style.js";
import { useControl } from "./use-control.js";
function _GlobeControl(props) {
    const ctrl = useControl(({ mapLib }) => new mapLib.GlobeControl(props), {
        position: props.position
    });
    useEffect(() => {
        applyReactStyle(ctrl._container, props.style);
    }, [props.style]);
    return null;
}
export const GlobeControl = memo(_GlobeControl);
//# sourceMappingURL=globe-control.js.map