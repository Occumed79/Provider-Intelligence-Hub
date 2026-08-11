/*
 * Copyright (c) Flowmap.gl contributors
 * Copyright (c) 2018-2020 Teralytics
 * SPDX-License-Identifier: Apache-2.0
 */
export default `\
#version 300 es
#define SHADER_NAME curved-flow-line-layer-fragment-shader

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
    vec3 edgeDistancePx = vBarycentrics / max(fwidth(vBarycentrics), vec3(1e-4));
    vec3 maskedDistancePx = mix(vec3(1e6), edgeDistancePx, step(vec3(0.5), vEdgeMask));
    float minBoundaryDistancePx = min(
      maskedDistancePx.x,
      min(maskedDistancePx.y, maskedDistancePx.z)
    );
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VydmVkRmxvd0xpbmVzTGF5ZXJGcmFnbWVudC5nbHNsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0N1cnZlZEZsb3dMaW5lc0xheWVyL0N1cnZlZEZsb3dMaW5lc0xheWVyRnJhZ21lbnQuZ2xzbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBQ0gsZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMENkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IChjKSBGbG93bWFwLmdsIGNvbnRyaWJ1dG9yc1xuICogQ29weXJpZ2h0IChjKSAyMDE4LTIwMjAgVGVyYWx5dGljc1xuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYFxcXG4jdmVyc2lvbiAzMDAgZXNcbiNkZWZpbmUgU0hBREVSX05BTUUgY3VydmVkLWZsb3ctbGluZS1sYXllci1mcmFnbWVudC1zaGFkZXJcblxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG5pbiB2ZWM0IHZDb2xvcjtcbmluIHZlYzIgdXY7XG5pbiB2ZWMzIHZCYXJ5Y2VudHJpY3M7XG5mbGF0IGluIHZlYzMgdkVkZ2VNYXNrO1xuXG5vdXQgdmVjNCBmcmFnQ29sb3I7XG5cbnZvaWQgbWFpbih2b2lkKSB7XG4gIGlmICh2Q29sb3IuYSA9PSAwLjApIHtcbiAgICBkaXNjYXJkO1xuICB9XG5cbiAgZ2VvbWV0cnkudXYgPSB1djtcbiAgZnJhZ0NvbG9yID0gdkNvbG9yO1xuXG4gIGlmIChmbG93TGluZXMuZHJhd091dGxpbmUgPiAwLjUgJiYgIWJvb2wocGlja2luZy5pc0FjdGl2ZSkpIHtcbiAgICB2ZWMzIGVkZ2VEaXN0YW5jZVB4ID0gdkJhcnljZW50cmljcyAvIG1heChmd2lkdGgodkJhcnljZW50cmljcyksIHZlYzMoMWUtNCkpO1xuICAgIHZlYzMgbWFza2VkRGlzdGFuY2VQeCA9IG1peCh2ZWMzKDFlNiksIGVkZ2VEaXN0YW5jZVB4LCBzdGVwKHZlYzMoMC41KSwgdkVkZ2VNYXNrKSk7XG4gICAgZmxvYXQgbWluQm91bmRhcnlEaXN0YW5jZVB4ID0gbWluKFxuICAgICAgbWFza2VkRGlzdGFuY2VQeC54LFxuICAgICAgbWluKG1hc2tlZERpc3RhbmNlUHgueSwgbWFza2VkRGlzdGFuY2VQeC56KVxuICAgICk7XG4gICAgZmxvYXQgb3V0bGluZU1peCA9IDEuMCAtIHNtb290aHN0ZXAoXG4gICAgICBtYXgoZmxvd0xpbmVzLm91dGxpbmVUaGlja25lc3MgLSAxLjAsIDAuMCksXG4gICAgICBmbG93TGluZXMub3V0bGluZVRoaWNrbmVzcyxcbiAgICAgIG1pbkJvdW5kYXJ5RGlzdGFuY2VQeFxuICAgICk7XG4gICAgZnJhZ0NvbG9yID0gbWl4KFxuICAgICAgZnJhZ0NvbG9yLFxuICAgICAgdmVjNChmbG93TGluZXMub3V0bGluZUNvbG9yLnJnYiwgZmxvd0xpbmVzLm91dGxpbmVDb2xvci5hICogZnJhZ0NvbG9yLmEpLFxuICAgICAgb3V0bGluZU1peFxuICAgICk7XG4gIH1cblxuICBERUNLR0xfRklMVEVSX0NPTE9SKGZyYWdDb2xvciwgZ2VvbWV0cnkpO1xufVxuYDtcbiJdfQ==