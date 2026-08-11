'use strict';

/**
 * To create a "drag" interaction, you typically register a mousedown event
 * handler on the element where the drag begins. In that handler, you register a
 * mouseup handler on the window to determine when the mouse is released,
 * wherever that release happens. This works well, except when the user releases
 * the mouse over an off-domain iframe. In that case, the mouseup event is
 * handled by the iframe and never bubbles up to the window handler.
 *
 * To deal with this issue, we cover iframes with high z-index divs to make sure
 * they don't capture mouseup.
 *
 * Usage:
 * element.addEventListener('mousedown', function() {
 *   var tarper = new IFrameTarp();
 *   tarper.cover();
 *   var mouseUpHandler = function() {
 *     ...
 *     window.removeEventListener(mouseUpHandler);
 *     tarper.uncover();
 *   };
 *   window.addEventListener('mouseup', mouseUpHandler);
 * });
 *
 * @constructor
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function IFrameTarp() {
  /** @type {Array.<!HTMLDivElement>} */
  this.tarps = [];
}

/**
 * Find all the iframes in the document and cover them with high z-index
 * transparent divs.
 */
IFrameTarp.prototype.cover = function () {
  var iframes = document.getElementsByTagName("iframe");
  for (var i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    var pos = utils.findPos(iframe),
      x = pos.x,
      y = pos.y,
      width = iframe.offsetWidth,
      height = iframe.offsetHeight;
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.zIndex = 999;
    document.body.appendChild(div);
    this.tarps.push(div);
  }
};

/**
 * Remove all the iframe covers. You should call this in a mouseup handler.
 */
IFrameTarp.prototype.uncover = function () {
  for (var i = 0; i < this.tarps.length; i++) {
    this.tarps[i].parentNode.removeChild(this.tarps[i]);
  }
  this.tarps = [];
};
var _default = exports["default"] = IFrameTarp;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsInV0aWxzIiwiX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQiLCJyZXF1aXJlIiwiZSIsInQiLCJXZWFrTWFwIiwiciIsIm4iLCJfX2VzTW9kdWxlIiwibyIsImkiLCJmIiwiX19wcm90b19fIiwiaGFzIiwiZ2V0Iiwic2V0IiwiX3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJJRnJhbWVUYXJwIiwidGFycHMiLCJwcm90b3R5cGUiLCJjb3ZlciIsImlmcmFtZXMiLCJkb2N1bWVudCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGVuZ3RoIiwiaWZyYW1lIiwicG9zIiwiZmluZFBvcyIsIngiLCJ5Iiwid2lkdGgiLCJvZmZzZXRXaWR0aCIsImhlaWdodCIsIm9mZnNldEhlaWdodCIsImRpdiIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsInpJbmRleCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsInB1c2giLCJ1bmNvdmVyIiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwiX2RlZmF1bHQiLCJtb2R1bGUiLCJkZWZhdWx0Il0sInNvdXJjZXMiOlsiLi4vc3JjL2lmcmFtZS10YXJwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUbyBjcmVhdGUgYSBcImRyYWdcIiBpbnRlcmFjdGlvbiwgeW91IHR5cGljYWxseSByZWdpc3RlciBhIG1vdXNlZG93biBldmVudFxuICogaGFuZGxlciBvbiB0aGUgZWxlbWVudCB3aGVyZSB0aGUgZHJhZyBiZWdpbnMuIEluIHRoYXQgaGFuZGxlciwgeW91IHJlZ2lzdGVyIGFcbiAqIG1vdXNldXAgaGFuZGxlciBvbiB0aGUgd2luZG93IHRvIGRldGVybWluZSB3aGVuIHRoZSBtb3VzZSBpcyByZWxlYXNlZCxcbiAqIHdoZXJldmVyIHRoYXQgcmVsZWFzZSBoYXBwZW5zLiBUaGlzIHdvcmtzIHdlbGwsIGV4Y2VwdCB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzXG4gKiB0aGUgbW91c2Ugb3ZlciBhbiBvZmYtZG9tYWluIGlmcmFtZS4gSW4gdGhhdCBjYXNlLCB0aGUgbW91c2V1cCBldmVudCBpc1xuICogaGFuZGxlZCBieSB0aGUgaWZyYW1lIGFuZCBuZXZlciBidWJibGVzIHVwIHRvIHRoZSB3aW5kb3cgaGFuZGxlci5cbiAqXG4gKiBUbyBkZWFsIHdpdGggdGhpcyBpc3N1ZSwgd2UgY292ZXIgaWZyYW1lcyB3aXRoIGhpZ2ggei1pbmRleCBkaXZzIHRvIG1ha2Ugc3VyZVxuICogdGhleSBkb24ndCBjYXB0dXJlIG1vdXNldXAuXG4gKlxuICogVXNhZ2U6XG4gKiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKCkge1xuICogICB2YXIgdGFycGVyID0gbmV3IElGcmFtZVRhcnAoKTtcbiAqICAgdGFycGVyLmNvdmVyKCk7XG4gKiAgIHZhciBtb3VzZVVwSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICogICAgIC4uLlxuICogICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKG1vdXNlVXBIYW5kbGVyKTtcbiAqICAgICB0YXJwZXIudW5jb3ZlcigpO1xuICogICB9O1xuICogICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNlVXBIYW5kbGVyKTtcbiAqIH0pO1xuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL2R5Z3JhcGgtdXRpbHMnO1xuXG5mdW5jdGlvbiBJRnJhbWVUYXJwKCkge1xuICAvKiogQHR5cGUge0FycmF5LjwhSFRNTERpdkVsZW1lbnQ+fSAqL1xuICB0aGlzLnRhcnBzID0gW107XG59XG5cbi8qKlxuICogRmluZCBhbGwgdGhlIGlmcmFtZXMgaW4gdGhlIGRvY3VtZW50IGFuZCBjb3ZlciB0aGVtIHdpdGggaGlnaCB6LWluZGV4XG4gKiB0cmFuc3BhcmVudCBkaXZzLlxuICovXG5JRnJhbWVUYXJwLnByb3RvdHlwZS5jb3ZlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaWZyYW1lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaWZyYW1lXCIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGlmcmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaWZyYW1lID0gaWZyYW1lc1tpXTtcbiAgICB2YXIgcG9zID0gdXRpbHMuZmluZFBvcyhpZnJhbWUpLFxuICAgICAgICB4ID0gcG9zLngsXG4gICAgICAgIHkgPSBwb3MueSxcbiAgICAgICAgd2lkdGggPSBpZnJhbWUub2Zmc2V0V2lkdGgsXG4gICAgICAgIGhlaWdodCA9IGlmcmFtZS5vZmZzZXRIZWlnaHQ7XG5cbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgZGl2LnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcbiAgICBkaXYuc3R5bGUudG9wID0geSArICdweCc7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIGRpdi5zdHlsZS56SW5kZXggPSA5OTk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIHRoaXMudGFycHMucHVzaChkaXYpO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgdGhlIGlmcmFtZSBjb3ZlcnMuIFlvdSBzaG91bGQgY2FsbCB0aGlzIGluIGEgbW91c2V1cCBoYW5kbGVyLlxuICovXG5JRnJhbWVUYXJwLnByb3RvdHlwZS51bmNvdmVyID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50YXJwcy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMudGFycHNbaV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnRhcnBzW2ldKTtcbiAgfVxuICB0aGlzLnRhcnBzID0gW107XG59O1xuXG5leHBvcnQgZGVmYXVsdCBJRnJhbWVUYXJwO1xuIl0sIm1hcHBpbmdzIjoiQUFBQSxZQUFZOztBQUVaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBeEJBQSxNQUFBLENBQUFDLGNBQUEsQ0FBQUMsT0FBQTtFQUFBQyxLQUFBO0FBQUE7QUFBQUQsT0FBQTtBQXlCQSxJQUFBRSxLQUFBLEdBQUFDLHVCQUFBLENBQUFDLE9BQUE7QUFBeUMsU0FBQUQsd0JBQUFFLENBQUEsRUFBQUMsQ0FBQSw2QkFBQUMsT0FBQSxNQUFBQyxDQUFBLE9BQUFELE9BQUEsSUFBQUUsQ0FBQSxPQUFBRixPQUFBLFlBQUFKLHVCQUFBLFlBQUFBLHdCQUFBRSxDQUFBLEVBQUFDLENBQUEsU0FBQUEsQ0FBQSxJQUFBRCxDQUFBLElBQUFBLENBQUEsQ0FBQUssVUFBQSxTQUFBTCxDQUFBLE1BQUFNLENBQUEsRUFBQUMsQ0FBQSxFQUFBQyxDQUFBLEtBQUFDLFNBQUEsbUJBQUFULENBQUEsaUJBQUFBLENBQUEsdUJBQUFBLENBQUEseUJBQUFBLENBQUEsU0FBQVEsQ0FBQSxNQUFBRixDQUFBLEdBQUFMLENBQUEsR0FBQUcsQ0FBQSxHQUFBRCxDQUFBLFFBQUFHLENBQUEsQ0FBQUksR0FBQSxDQUFBVixDQUFBLFVBQUFNLENBQUEsQ0FBQUssR0FBQSxDQUFBWCxDQUFBLEdBQUFNLENBQUEsQ0FBQU0sR0FBQSxDQUFBWixDQUFBLEVBQUFRLENBQUEsY0FBQUssRUFBQSxJQUFBYixDQUFBLGdCQUFBYSxFQUFBLE9BQUFDLGNBQUEsQ0FBQUMsSUFBQSxDQUFBZixDQUFBLEVBQUFhLEVBQUEsT0FBQU4sQ0FBQSxJQUFBRCxDQUFB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