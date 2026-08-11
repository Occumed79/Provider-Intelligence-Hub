/*
 * Copyright (c) Flowmap.gl contributors
 * Copyright (c) 2018-2020 Teralytics
 * SPDX-License-Identifier: Apache-2.0
 */
export default `\
#version 300 es
#define SHADER_NAME flow-line-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 uv;
in vec3 vBarycentrics;
flat in vec3 vEdgeMask;

out vec4 fragColor;

void main(void) {
  if (vColor.a == 0.0) {
    discard;
  }

  geometry.uv = uv;
  fragColor = vColor;

  if (flowLines.drawOutline > 0.5 && !bool(picking.isActive)) {
    // For barycentric coordinates, each component trends to 0 on one triangle edge.
    // Dividing by fwidth converts that into an approximate edge distance in pixels.
    vec3 edgeDistancePx = vBarycentrics / max(fwidth(vBarycentrics), vec3(1e-4));
    // Ignore edges that are only part of the internal triangulation by assigning
    // them a large sentinel distance, so only true boundary edges contribute.
    vec3 maskedDistancePx = mix(vec3(1e6), edgeDistancePx, step(vec3(0.5), vEdgeMask));
    float minBoundaryDistancePx = min(
      maskedDistancePx.x,
      min(maskedDistancePx.y, maskedDistancePx.z)
    );
    // The outline is inset: fragments within 'outlineThickness' pixels of an
    // active boundary edge are mixed toward the outline color.
    float outlineMix = 1.0 - smoothstep(
      max(flowLines.outlineThickness - 1.0, 0.0),
      flowLines.outlineThickness,
      minBoundaryDistancePx
    );
    fragColor = mix(
      fragColor,
      vec4(flowLines.outlineColor.rgb, flowLines.outlineColor.a * fragColor.a),
      outlineMix
    );
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxvd0xpbmVzTGF5ZXJGcmFnbWVudC5nbHNsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0Zsb3dMaW5lc0xheWVyL0Zsb3dMaW5lc0xheWVyRnJhZ21lbnQuZ2xzbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBQ0gsZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0RkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IChjKSBGbG93bWFwLmdsIGNvbnRyaWJ1dG9yc1xuICogQ29weXJpZ2h0IChjKSAyMDE4LTIwMjAgVGVyYWx5dGljc1xuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYFxcXG4jdmVyc2lvbiAzMDAgZXNcbiNkZWZpbmUgU0hBREVSX05BTUUgZmxvdy1saW5lLWxheWVyLWZyYWdtZW50LXNoYWRlclxuXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbmluIHZlYzQgdkNvbG9yO1xuaW4gdmVjMiB1djtcbmluIHZlYzMgdkJhcnljZW50cmljcztcbmZsYXQgaW4gdmVjMyB2RWRnZU1hc2s7XG5cbm91dCB2ZWM0IGZyYWdDb2xvcjtcblxudm9pZCBtYWluKHZvaWQpIHtcbiAgaWYgKHZDb2xvci5hID09IDAuMCkge1xuICAgIGRpc2NhcmQ7XG4gIH1cblxuICBnZW9tZXRyeS51diA9IHV2O1xuICBmcmFnQ29sb3IgPSB2Q29sb3I7XG5cbiAgaWYgKGZsb3dMaW5lcy5kcmF3T3V0bGluZSA+IDAuNSAmJiAhYm9vbChwaWNraW5nLmlzQWN0aXZlKSkge1xuICAgIC8vIEZvciBiYXJ5Y2VudHJpYyBjb29yZGluYXRlcywgZWFjaCBjb21wb25lbnQgdHJlbmRzIHRvIDAgb24gb25lIHRyaWFuZ2xlIGVkZ2UuXG4gICAgLy8gRGl2aWRpbmcgYnkgZndpZHRoIGNvbnZlcnRzIHRoYXQgaW50byBhbiBhcHByb3hpbWF0ZSBlZGdlIGRpc3RhbmNlIGluIHBpeGVscy5cbiAgICB2ZWMzIGVkZ2VEaXN0YW5jZVB4ID0gdkJhcnljZW50cmljcyAvIG1heChmd2lkdGgodkJhcnljZW50cmljcyksIHZlYzMoMWUtNCkpO1xuICAgIC8vIElnbm9yZSBlZGdlcyB0aGF0IGFyZSBvbmx5IHBhcnQgb2YgdGhlIGludGVybmFsIHRyaWFuZ3VsYXRpb24gYnkgYXNzaWduaW5nXG4gICAgLy8gdGhlbSBhIGxhcmdlIHNlbnRpbmVsIGRpc3RhbmNlLCBzbyBvbmx5IHRydWUgYm91bmRhcnkgZWRnZXMgY29udHJpYnV0ZS5cbiAgICB2ZWMzIG1hc2tlZERpc3RhbmNlUHggPSBtaXgodmVjMygxZTYpLCBlZGdlRGlzdGFuY2VQeCwgc3RlcCh2ZWMzKDAuNSksIHZFZGdlTWFzaykpO1xuICAgIGZsb2F0IG1pbkJvdW5kYXJ5RGlzdGFuY2VQeCA9IG1pbihcbiAgICAgIG1hc2tlZERpc3RhbmNlUHgueCxcbiAgICAgIG1pbihtYXNrZWREaXN0YW5jZVB4LnksIG1hc2tlZERpc3RhbmNlUHgueilcbiAgICApO1xuICAgIC8vIFRoZSBvdXRsaW5lIGlzIGluc2V0OiBmcmFnbWVudHMgd2l0aGluICdvdXRsaW5lVGhpY2tuZXNzJyBwaXhlbHMgb2YgYW5cbiAgICAvLyBhY3RpdmUgYm91bmRhcnkgZWRnZSBhcmUgbWl4ZWQgdG93YXJkIHRoZSBvdXRsaW5lIGNvbG9yLlxuICAgIGZsb2F0IG91dGxpbmVNaXggPSAxLjAgLSBzbW9vdGhzdGVwKFxuICAgICAgbWF4KGZsb3dMaW5lcy5vdXRsaW5lVGhpY2tuZXNzIC0gMS4wLCAwLjApLFxuICAgICAgZmxvd0xpbmVzLm91dGxpbmVUaGlja25lc3MsXG4gICAgICBtaW5Cb3VuZGFyeURpc3RhbmNlUHhcbiAgICApO1xuICAgIGZyYWdDb2xvciA9IG1peChcbiAgICAgIGZyYWdDb2xvcixcbiAgICAgIHZlYzQoZmxvd0xpbmVzLm91dGxpbmVDb2xvci5yZ2IsIGZsb3dMaW5lcy5vdXRsaW5lQ29sb3IuYSAqIGZyYWdDb2xvci5hKSxcbiAgICAgIG91dGxpbmVNaXhcbiAgICApO1xuICB9XG5cbiAgREVDS0dMX0ZJTFRFUl9DT0xPUihmcmFnQ29sb3IsIGdlb21ldHJ5KTtcbn1cbmA7XG4iXX0=