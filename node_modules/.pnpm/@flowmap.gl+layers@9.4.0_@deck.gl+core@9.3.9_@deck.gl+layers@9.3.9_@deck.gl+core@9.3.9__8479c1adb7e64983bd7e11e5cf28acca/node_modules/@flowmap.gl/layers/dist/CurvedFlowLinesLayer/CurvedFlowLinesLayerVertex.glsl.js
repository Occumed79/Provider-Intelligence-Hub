/*
 * Copyright (c) Flowmap.gl contributors
 * Copyright (c) 2018-2020 Teralytics
 * SPDX-License-Identifier: Apache-2.0
 */
const HEAD_START_T = (1 - 1 / 24).toFixed(8);
export default `\
#version 300 es
#define SHADER_NAME curved-flow-line-layer-vertex-shader

in vec3 positions;
in vec3 barycentrics;
in vec3 edgeMasks;
in vec4 instanceColors;
in float instanceThickness;
in vec3 instanceSourcePositions;
in vec3 instanceTargetPositions;
in vec3 instanceSourcePositions64Low;
in vec3 instanceTargetPositions64Low;
in vec3 instancePickingColors;
in vec2 instanceEndpointOffsets;
in float instancePickable;
in float instanceCurveOffset;

out vec4 vColor;
out vec2 uv;
out vec3 vBarycentrics;
flat out vec3 vEdgeMask;

vec3 quadraticBezier(vec3 p0, vec3 p1, vec3 p2, float t) {
  float oneMinusT = 1.0 - t;
  return
    oneMinusT * oneMinusT * p0 +
    2.0 * oneMinusT * t * p1 +
    t * t * p2;
}

vec3 quadraticBezierTangent(vec3 p0, vec3 p1, vec3 p2, float t) {
  return 2.0 * (1.0 - t) * (p1 - p0) + 2.0 * t * (p2 - p1);
}

void main(void) {
  geometry.worldPosition = instanceSourcePositions;
  geometry.worldPositionAlt = instanceTargetPositions;

  vec4 source_commonspace;
  vec4 target_commonspace;
  project_position_to_clipspace(
    instanceSourcePositions,
    instanceSourcePositions64Low,
    vec3(0.0),
    source_commonspace
  );
  project_position_to_clipspace(
    instanceTargetPositions,
    instanceTargetPositions64Low,
    vec3(0.0),
    target_commonspace
  );

  vec2 chord = target_commonspace.xy - source_commonspace.xy;
  float chordLengthCommon = max(length(chord), 1e-6);
  float startTrim = clamp(
    project_pixel_size(instanceEndpointOffsets.x) / chordLengthCommon,
    0.0,
    0.35
  );
  float endTrim = 1.0 - clamp(
    project_pixel_size(instanceEndpointOffsets.y) / chordLengthCommon,
    0.0,
    0.35
  );
  endTrim = max(startTrim + 0.05, endTrim);
  float baseHeadBacktrackT = project_pixel_size(
    instanceThickness * 3.0 * flowLines.thicknessUnit
  ) / chordLengthCommon;
  float availableSpanT = max(endTrim - startTrim, 0.0);
  float headBacktrackT = min(baseHeadBacktrackT, availableSpanT * 0.45);
  float headScale = baseHeadBacktrackT > 1e-6
    ? clamp(headBacktrackT / baseHeadBacktrackT, 0.0, 1.0)
    : 1.0;
  // A soft nonlinear fade of the head deformation avoids tiny heads folding
  // into themselves while still allowing them to collapse back toward the strip.
  float headDeformation = smoothstep(0.0, 1.0, headScale);
  float shaftEndTrim = max(startTrim + 0.02, endTrim - headBacktrackT);

  float curveT = positions.x < 1.0
    ? mix(startTrim, shaftEndTrim, positions.x / ${HEAD_START_T})
    : endTrim;
  float headWeight = smoothstep(${HEAD_START_T}, 1.0, positions.x);
  float tangentT = mix(curveT, endTrim, headWeight);
  vec2 curveNormal = normalize(vec2(chord.y, -chord.x));
  if (length(curveNormal) < 1e-6) {
    curveNormal = vec2(0.0, 1.0);
  }
  vec3 control_commonspace = mix(
    source_commonspace.xyz,
    target_commonspace.xyz,
    0.5
  );
  control_commonspace.xy += curveNormal * project_pixel_size(abs(instanceCurveOffset)) * flowLines.curviness;

  vec3 curvePoint = quadraticBezier(
    source_commonspace.xyz,
    control_commonspace,
    target_commonspace.xyz,
    curveT
  );
  vec3 tangent = quadraticBezierTangent(
    source_commonspace.xyz,
    control_commonspace,
    target_commonspace.xyz,
    tangentT
  );
  if (length(tangent.xy) < 1e-6) {
    tangent = target_commonspace.xyz - source_commonspace.xyz;
  }

  vec2 flowlineDir = normalize(tangent.xy);
  vec2 perpendicularDir = vec2(-flowlineDir.y, flowlineDir.x);
  float widthScale = mix(1.0, headScale, headWeight);
  float lengthScale = mix(1.0, headScale, headWeight);
  float shapeY = mix(min(positions.y, 1.0), positions.y, headDeformation);
  float shapeZ = positions.z * headDeformation;
  float normalDistanceCommon = clamp(
    project_pixel_size(
      instanceThickness * shapeY * widthScale * flowLines.thicknessUnit
    ),
    -chordLengthCommon * 0.8,
    chordLengthCommon * 0.8
  );
  float tangentDistanceCommon = clamp(
    project_pixel_size(
      instanceThickness * shapeZ * lengthScale * flowLines.thicknessUnit
    ),
    -chordLengthCommon * 0.8,
    chordLengthCommon * 0.8
  );
  float gapCommon = project_pixel_size(flowLines.gap);
  vec3 offsetCommon = vec3(
    flowlineDir * tangentDistanceCommon -
      perpendicularDir * (normalDistanceCommon + gapCommon),
    0.0
  );

  geometry.position = vec4(curvePoint, 1.0);
  uv = vec2(curveT, positions.y);
  geometry.uv = uv;
  vBarycentrics = barycentrics;
  vEdgeMask = edgeMasks;
  if (instancePickable > 0.5) {
    geometry.pickingColor = instancePickingColors;
  }

  DECKGL_FILTER_SIZE(offsetCommon, geometry);
  vec4 position_commonspace = vec4(curvePoint + offsetCommon, 1.0);
  gl_Position = project_common_position_to_clipspace(position_commonspace);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vec4 fillColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
  vColor = fillColor;
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VydmVkRmxvd0xpbmVzTGF5ZXJWZXJ0ZXguZ2xzbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9DdXJ2ZWRGbG93TGluZXNMYXllci9DdXJ2ZWRGbG93TGluZXNMYXllclZlcnRleC5nbHNsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFDSCxNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRTdDLGVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttREFpRm9DLFlBQVk7O2tDQUU3QixZQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTBFN0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgKGMpIEZsb3dtYXAuZ2wgY29udHJpYnV0b3JzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTgtMjAyMCBUZXJhbHl0aWNzXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5jb25zdCBIRUFEX1NUQVJUX1QgPSAoMSAtIDEgLyAyNCkudG9GaXhlZCg4KTtcblxuZXhwb3J0IGRlZmF1bHQgYFxcXG4jdmVyc2lvbiAzMDAgZXNcbiNkZWZpbmUgU0hBREVSX05BTUUgY3VydmVkLWZsb3ctbGluZS1sYXllci12ZXJ0ZXgtc2hhZGVyXG5cbmluIHZlYzMgcG9zaXRpb25zO1xuaW4gdmVjMyBiYXJ5Y2VudHJpY3M7XG5pbiB2ZWMzIGVkZ2VNYXNrcztcbmluIHZlYzQgaW5zdGFuY2VDb2xvcnM7XG5pbiBmbG9hdCBpbnN0YW5jZVRoaWNrbmVzcztcbmluIHZlYzMgaW5zdGFuY2VTb3VyY2VQb3NpdGlvbnM7XG5pbiB2ZWMzIGluc3RhbmNlVGFyZ2V0UG9zaXRpb25zO1xuaW4gdmVjMyBpbnN0YW5jZVNvdXJjZVBvc2l0aW9uczY0TG93O1xuaW4gdmVjMyBpbnN0YW5jZVRhcmdldFBvc2l0aW9uczY0TG93O1xuaW4gdmVjMyBpbnN0YW5jZVBpY2tpbmdDb2xvcnM7XG5pbiB2ZWMyIGluc3RhbmNlRW5kcG9pbnRPZmZzZXRzO1xuaW4gZmxvYXQgaW5zdGFuY2VQaWNrYWJsZTtcbmluIGZsb2F0IGluc3RhbmNlQ3VydmVPZmZzZXQ7XG5cbm91dCB2ZWM0IHZDb2xvcjtcbm91dCB2ZWMyIHV2O1xub3V0IHZlYzMgdkJhcnljZW50cmljcztcbmZsYXQgb3V0IHZlYzMgdkVkZ2VNYXNrO1xuXG52ZWMzIHF1YWRyYXRpY0Jlemllcih2ZWMzIHAwLCB2ZWMzIHAxLCB2ZWMzIHAyLCBmbG9hdCB0KSB7XG4gIGZsb2F0IG9uZU1pbnVzVCA9IDEuMCAtIHQ7XG4gIHJldHVyblxuICAgIG9uZU1pbnVzVCAqIG9uZU1pbnVzVCAqIHAwICtcbiAgICAyLjAgKiBvbmVNaW51c1QgKiB0ICogcDEgK1xuICAgIHQgKiB0ICogcDI7XG59XG5cbnZlYzMgcXVhZHJhdGljQmV6aWVyVGFuZ2VudCh2ZWMzIHAwLCB2ZWMzIHAxLCB2ZWMzIHAyLCBmbG9hdCB0KSB7XG4gIHJldHVybiAyLjAgKiAoMS4wIC0gdCkgKiAocDEgLSBwMCkgKyAyLjAgKiB0ICogKHAyIC0gcDEpO1xufVxuXG52b2lkIG1haW4odm9pZCkge1xuICBnZW9tZXRyeS53b3JsZFBvc2l0aW9uID0gaW5zdGFuY2VTb3VyY2VQb3NpdGlvbnM7XG4gIGdlb21ldHJ5LndvcmxkUG9zaXRpb25BbHQgPSBpbnN0YW5jZVRhcmdldFBvc2l0aW9ucztcblxuICB2ZWM0IHNvdXJjZV9jb21tb25zcGFjZTtcbiAgdmVjNCB0YXJnZXRfY29tbW9uc3BhY2U7XG4gIHByb2plY3RfcG9zaXRpb25fdG9fY2xpcHNwYWNlKFxuICAgIGluc3RhbmNlU291cmNlUG9zaXRpb25zLFxuICAgIGluc3RhbmNlU291cmNlUG9zaXRpb25zNjRMb3csXG4gICAgdmVjMygwLjApLFxuICAgIHNvdXJjZV9jb21tb25zcGFjZVxuICApO1xuICBwcm9qZWN0X3Bvc2l0aW9uX3RvX2NsaXBzcGFjZShcbiAgICBpbnN0YW5jZVRhcmdldFBvc2l0aW9ucyxcbiAgICBpbnN0YW5jZVRhcmdldFBvc2l0aW9uczY0TG93LFxuICAgIHZlYzMoMC4wKSxcbiAgICB0YXJnZXRfY29tbW9uc3BhY2VcbiAgKTtcblxuICB2ZWMyIGNob3JkID0gdGFyZ2V0X2NvbW1vbnNwYWNlLnh5IC0gc291cmNlX2NvbW1vbnNwYWNlLnh5O1xuICBmbG9hdCBjaG9yZExlbmd0aENvbW1vbiA9IG1heChsZW5ndGgoY2hvcmQpLCAxZS02KTtcbiAgZmxvYXQgc3RhcnRUcmltID0gY2xhbXAoXG4gICAgcHJvamVjdF9waXhlbF9zaXplKGluc3RhbmNlRW5kcG9pbnRPZmZzZXRzLngpIC8gY2hvcmRMZW5ndGhDb21tb24sXG4gICAgMC4wLFxuICAgIDAuMzVcbiAgKTtcbiAgZmxvYXQgZW5kVHJpbSA9IDEuMCAtIGNsYW1wKFxuICAgIHByb2plY3RfcGl4ZWxfc2l6ZShpbnN0YW5jZUVuZHBvaW50T2Zmc2V0cy55KSAvIGNob3JkTGVuZ3RoQ29tbW9uLFxuICAgIDAuMCxcbiAgICAwLjM1XG4gICk7XG4gIGVuZFRyaW0gPSBtYXgoc3RhcnRUcmltICsgMC4wNSwgZW5kVHJpbSk7XG4gIGZsb2F0IGJhc2VIZWFkQmFja3RyYWNrVCA9IHByb2plY3RfcGl4ZWxfc2l6ZShcbiAgICBpbnN0YW5jZVRoaWNrbmVzcyAqIDMuMCAqIGZsb3dMaW5lcy50aGlja25lc3NVbml0XG4gICkgLyBjaG9yZExlbmd0aENvbW1vbjtcbiAgZmxvYXQgYXZhaWxhYmxlU3BhblQgPSBtYXgoZW5kVHJpbSAtIHN0YXJ0VHJpbSwgMC4wKTtcbiAgZmxvYXQgaGVhZEJhY2t0cmFja1QgPSBtaW4oYmFzZUhlYWRCYWNrdHJhY2tULCBhdmFpbGFibGVTcGFuVCAqIDAuNDUpO1xuICBmbG9hdCBoZWFkU2NhbGUgPSBiYXNlSGVhZEJhY2t0cmFja1QgPiAxZS02XG4gICAgPyBjbGFtcChoZWFkQmFja3RyYWNrVCAvIGJhc2VIZWFkQmFja3RyYWNrVCwgMC4wLCAxLjApXG4gICAgOiAxLjA7XG4gIC8vIEEgc29mdCBub25saW5lYXIgZmFkZSBvZiB0aGUgaGVhZCBkZWZvcm1hdGlvbiBhdm9pZHMgdGlueSBoZWFkcyBmb2xkaW5nXG4gIC8vIGludG8gdGhlbXNlbHZlcyB3aGlsZSBzdGlsbCBhbGxvd2luZyB0aGVtIHRvIGNvbGxhcHNlIGJhY2sgdG93YXJkIHRoZSBzdHJpcC5cbiAgZmxvYXQgaGVhZERlZm9ybWF0aW9uID0gc21vb3Roc3RlcCgwLjAsIDEuMCwgaGVhZFNjYWxlKTtcbiAgZmxvYXQgc2hhZnRFbmRUcmltID0gbWF4KHN0YXJ0VHJpbSArIDAuMDIsIGVuZFRyaW0gLSBoZWFkQmFja3RyYWNrVCk7XG5cbiAgZmxvYXQgY3VydmVUID0gcG9zaXRpb25zLnggPCAxLjBcbiAgICA/IG1peChzdGFydFRyaW0sIHNoYWZ0RW5kVHJpbSwgcG9zaXRpb25zLnggLyAke0hFQURfU1RBUlRfVH0pXG4gICAgOiBlbmRUcmltO1xuICBmbG9hdCBoZWFkV2VpZ2h0ID0gc21vb3Roc3RlcCgke0hFQURfU1RBUlRfVH0sIDEuMCwgcG9zaXRpb25zLngpO1xuICBmbG9hdCB0YW5nZW50VCA9IG1peChjdXJ2ZVQsIGVuZFRyaW0sIGhlYWRXZWlnaHQpO1xuICB2ZWMyIGN1cnZlTm9ybWFsID0gbm9ybWFsaXplKHZlYzIoY2hvcmQueSwgLWNob3JkLngpKTtcbiAgaWYgKGxlbmd0aChjdXJ2ZU5vcm1hbCkgPCAxZS02KSB7XG4gICAgY3VydmVOb3JtYWwgPSB2ZWMyKDAuMCwgMS4wKTtcbiAgfVxuICB2ZWMzIGNvbnRyb2xfY29tbW9uc3BhY2UgPSBtaXgoXG4gICAgc291cmNlX2NvbW1vbnNwYWNlLnh5eixcbiAgICB0YXJnZXRfY29tbW9uc3BhY2UueHl6LFxuICAgIDAuNVxuICApO1xuICBjb250cm9sX2NvbW1vbnNwYWNlLnh5ICs9IGN1cnZlTm9ybWFsICogcHJvamVjdF9waXhlbF9zaXplKGFicyhpbnN0YW5jZUN1cnZlT2Zmc2V0KSkgKiBmbG93TGluZXMuY3VydmluZXNzO1xuXG4gIHZlYzMgY3VydmVQb2ludCA9IHF1YWRyYXRpY0JlemllcihcbiAgICBzb3VyY2VfY29tbW9uc3BhY2UueHl6LFxuICAgIGNvbnRyb2xfY29tbW9uc3BhY2UsXG4gICAgdGFyZ2V0X2NvbW1vbnNwYWNlLnh5eixcbiAgICBjdXJ2ZVRcbiAgKTtcbiAgdmVjMyB0YW5nZW50ID0gcXVhZHJhdGljQmV6aWVyVGFuZ2VudChcbiAgICBzb3VyY2VfY29tbW9uc3BhY2UueHl6LFxuICAgIGNvbnRyb2xfY29tbW9uc3BhY2UsXG4gICAgdGFyZ2V0X2NvbW1vbnNwYWNlLnh5eixcbiAgICB0YW5nZW50VFxuICApO1xuICBpZiAobGVuZ3RoKHRhbmdlbnQueHkpIDwgMWUtNikge1xuICAgIHRhbmdlbnQgPSB0YXJnZXRfY29tbW9uc3BhY2UueHl6IC0gc291cmNlX2NvbW1vbnNwYWNlLnh5ejtcbiAgfVxuXG4gIHZlYzIgZmxvd2xpbmVEaXIgPSBub3JtYWxpemUodGFuZ2VudC54eSk7XG4gIHZlYzIgcGVycGVuZGljdWxhckRpciA9IHZlYzIoLWZsb3dsaW5lRGlyLnksIGZsb3dsaW5lRGlyLngpO1xuICBmbG9hdCB3aWR0aFNjYWxlID0gbWl4KDEuMCwgaGVhZFNjYWxlLCBoZWFkV2VpZ2h0KTtcbiAgZmxvYXQgbGVuZ3RoU2NhbGUgPSBtaXgoMS4wLCBoZWFkU2NhbGUsIGhlYWRXZWlnaHQpO1xuICBmbG9hdCBzaGFwZVkgPSBtaXgobWluKHBvc2l0aW9ucy55LCAxLjApLCBwb3NpdGlvbnMueSwgaGVhZERlZm9ybWF0aW9uKTtcbiAgZmxvYXQgc2hhcGVaID0gcG9zaXRpb25zLnogKiBoZWFkRGVmb3JtYXRpb247XG4gIGZsb2F0IG5vcm1hbERpc3RhbmNlQ29tbW9uID0gY2xhbXAoXG4gICAgcHJvamVjdF9waXhlbF9zaXplKFxuICAgICAgaW5zdGFuY2VUaGlja25lc3MgKiBzaGFwZVkgKiB3aWR0aFNjYWxlICogZmxvd0xpbmVzLnRoaWNrbmVzc1VuaXRcbiAgICApLFxuICAgIC1jaG9yZExlbmd0aENvbW1vbiAqIDAuOCxcbiAgICBjaG9yZExlbmd0aENvbW1vbiAqIDAuOFxuICApO1xuICBmbG9hdCB0YW5nZW50RGlzdGFuY2VDb21tb24gPSBjbGFtcChcbiAgICBwcm9qZWN0X3BpeGVsX3NpemUoXG4gICAgICBpbnN0YW5jZVRoaWNrbmVzcyAqIHNoYXBlWiAqIGxlbmd0aFNjYWxlICogZmxvd0xpbmVzLnRoaWNrbmVzc1VuaXRcbiAgICApLFxuICAgIC1jaG9yZExlbmd0aENvbW1vbiAqIDAuOCxcbiAgICBjaG9yZExlbmd0aENvbW1vbiAqIDAuOFxuICApO1xuICBmbG9hdCBnYXBDb21tb24gPSBwcm9qZWN0X3BpeGVsX3NpemUoZmxvd0xpbmVzLmdhcCk7XG4gIHZlYzMgb2Zmc2V0Q29tbW9uID0gdmVjMyhcbiAgICBmbG93bGluZURpciAqIHRhbmdlbnREaXN0YW5jZUNvbW1vbiAtXG4gICAgICBwZXJwZW5kaWN1bGFyRGlyICogKG5vcm1hbERpc3RhbmNlQ29tbW9uICsgZ2FwQ29tbW9uKSxcbiAgICAwLjBcbiAgKTtcblxuICBnZW9tZXRyeS5wb3NpdGlvbiA9IHZlYzQoY3VydmVQb2ludCwgMS4wKTtcbiAgdXYgPSB2ZWMyKGN1cnZlVCwgcG9zaXRpb25zLnkpO1xuICBnZW9tZXRyeS51diA9IHV2O1xuICB2QmFyeWNlbnRyaWNzID0gYmFyeWNlbnRyaWNzO1xuICB2RWRnZU1hc2sgPSBlZGdlTWFza3M7XG4gIGlmIChpbnN0YW5jZVBpY2thYmxlID4gMC41KSB7XG4gICAgZ2VvbWV0cnkucGlja2luZ0NvbG9yID0gaW5zdGFuY2VQaWNraW5nQ29sb3JzO1xuICB9XG5cbiAgREVDS0dMX0ZJTFRFUl9TSVpFKG9mZnNldENvbW1vbiwgZ2VvbWV0cnkpO1xuICB2ZWM0IHBvc2l0aW9uX2NvbW1vbnNwYWNlID0gdmVjNChjdXJ2ZVBvaW50ICsgb2Zmc2V0Q29tbW9uLCAxLjApO1xuICBnbF9Qb3NpdGlvbiA9IHByb2plY3RfY29tbW9uX3Bvc2l0aW9uX3RvX2NsaXBzcGFjZShwb3NpdGlvbl9jb21tb25zcGFjZSk7XG4gIERFQ0tHTF9GSUxURVJfR0xfUE9TSVRJT04oZ2xfUG9zaXRpb24sIGdlb21ldHJ5KTtcblxuICB2ZWM0IGZpbGxDb2xvciA9IHZlYzQoaW5zdGFuY2VDb2xvcnMucmdiLCBpbnN0YW5jZUNvbG9ycy5hICogbGF5ZXIub3BhY2l0eSk7XG4gIHZDb2xvciA9IGZpbGxDb2xvcjtcbiAgREVDS0dMX0ZJTFRFUl9DT0xPUih2Q29sb3IsIGdlb21ldHJ5KTtcbn1cbmA7XG4iXX0=