/*
 * Copyright (c) Flowmap.gl contributors
 * Copyright (c) 2018-2020 Teralytics
 * SPDX-License-Identifier: Apache-2.0
 */
export default `\
#version 300 es
#define SHADER_NAME flow-circles-layer-vertex-shader
#define radiusScale 100

in vec3 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceInRadius;
in float instanceOutRadius;
in vec4 instanceColors;
in float instanceOutOfScale;
in vec3 instancePickingColors;

out vec4 vColor;
out vec2 unitPosition;
out float unitInRadius;
out float unitOutRadius;
out float vOutOfScale;

void main(void) {
  geometry.worldPosition = instancePositions;

  float outerRadiusPixels = max(instanceInRadius, instanceOutRadius);
  unitInRadius = instanceInRadius / outerRadiusPixels; 
  unitOutRadius = instanceOutRadius / outerRadiusPixels; 
  vOutOfScale = instanceOutOfScale;

  // position on the containing square in [-1, 1] space
  unitPosition = positions.xy;
  geometry.uv = unitPosition;
  geometry.pickingColor = instancePickingColors;
                                                                                                    
  // Find the center of the point and add the current vertex
  vec3 offset = positions * project_pixel_size(outerRadiusPixels);
  DECKGL_FILTER_SIZE(offset, geometry);
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
                            
  // Apply opacity to instance color, or return instance picking color
  vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxvd0NpcmNsZXNMYXllclZlcnRleC5nbHNsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0Zsb3dDaXJjbGVzTGF5ZXIvRmxvd0NpcmNsZXNMYXllclZlcnRleC5nbHNsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFDSCxlQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTRDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAoYykgRmxvd21hcC5nbCBjb250cmlidXRvcnNcbiAqIENvcHlyaWdodCAoYykgMjAxOC0yMDIwIFRlcmFseXRpY3NcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGBcXFxuI3ZlcnNpb24gMzAwIGVzXG4jZGVmaW5lIFNIQURFUl9OQU1FIGZsb3ctY2lyY2xlcy1sYXllci12ZXJ0ZXgtc2hhZGVyXG4jZGVmaW5lIHJhZGl1c1NjYWxlIDEwMFxuXG5pbiB2ZWMzIHBvc2l0aW9ucztcblxuaW4gdmVjMyBpbnN0YW5jZVBvc2l0aW9ucztcbmluIHZlYzMgaW5zdGFuY2VQb3NpdGlvbnM2NExvdztcbmluIGZsb2F0IGluc3RhbmNlSW5SYWRpdXM7XG5pbiBmbG9hdCBpbnN0YW5jZU91dFJhZGl1cztcbmluIHZlYzQgaW5zdGFuY2VDb2xvcnM7XG5pbiBmbG9hdCBpbnN0YW5jZU91dE9mU2NhbGU7XG5pbiB2ZWMzIGluc3RhbmNlUGlja2luZ0NvbG9ycztcblxub3V0IHZlYzQgdkNvbG9yO1xub3V0IHZlYzIgdW5pdFBvc2l0aW9uO1xub3V0IGZsb2F0IHVuaXRJblJhZGl1cztcbm91dCBmbG9hdCB1bml0T3V0UmFkaXVzO1xub3V0IGZsb2F0IHZPdXRPZlNjYWxlO1xuXG52b2lkIG1haW4odm9pZCkge1xuICBnZW9tZXRyeS53b3JsZFBvc2l0aW9uID0gaW5zdGFuY2VQb3NpdGlvbnM7XG5cbiAgZmxvYXQgb3V0ZXJSYWRpdXNQaXhlbHMgPSBtYXgoaW5zdGFuY2VJblJhZGl1cywgaW5zdGFuY2VPdXRSYWRpdXMpO1xuICB1bml0SW5SYWRpdXMgPSBpbnN0YW5jZUluUmFkaXVzIC8gb3V0ZXJSYWRpdXNQaXhlbHM7IFxuICB1bml0T3V0UmFkaXVzID0gaW5zdGFuY2VPdXRSYWRpdXMgLyBvdXRlclJhZGl1c1BpeGVsczsgXG4gIHZPdXRPZlNjYWxlID0gaW5zdGFuY2VPdXRPZlNjYWxlO1xuXG4gIC8vIHBvc2l0aW9uIG9uIHRoZSBjb250YWluaW5nIHNxdWFyZSBpbiBbLTEsIDFdIHNwYWNlXG4gIHVuaXRQb3NpdGlvbiA9IHBvc2l0aW9ucy54eTtcbiAgZ2VvbWV0cnkudXYgPSB1bml0UG9zaXRpb247XG4gIGdlb21ldHJ5LnBpY2tpbmdDb2xvciA9IGluc3RhbmNlUGlja2luZ0NvbG9ycztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgLy8gRmluZCB0aGUgY2VudGVyIG9mIHRoZSBwb2ludCBhbmQgYWRkIHRoZSBjdXJyZW50IHZlcnRleFxuICB2ZWMzIG9mZnNldCA9IHBvc2l0aW9ucyAqIHByb2plY3RfcGl4ZWxfc2l6ZShvdXRlclJhZGl1c1BpeGVscyk7XG4gIERFQ0tHTF9GSUxURVJfU0laRShvZmZzZXQsIGdlb21ldHJ5KTtcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0X3Bvc2l0aW9uX3RvX2NsaXBzcGFjZShpbnN0YW5jZVBvc2l0aW9ucywgaW5zdGFuY2VQb3NpdGlvbnM2NExvdywgb2Zmc2V0LCBnZW9tZXRyeS5wb3NpdGlvbik7XG4gIERFQ0tHTF9GSUxURVJfR0xfUE9TSVRJT04oZ2xfUG9zaXRpb24sIGdlb21ldHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgLy8gQXBwbHkgb3BhY2l0eSB0byBpbnN0YW5jZSBjb2xvciwgb3IgcmV0dXJuIGluc3RhbmNlIHBpY2tpbmcgY29sb3JcbiAgdkNvbG9yID0gdmVjNChpbnN0YW5jZUNvbG9ycy5yZ2IsIGluc3RhbmNlQ29sb3JzLmEgKiBsYXllci5vcGFjaXR5KTtcbiAgREVDS0dMX0ZJTFRFUl9DT0xPUih2Q29sb3IsIGdlb21ldHJ5KTtcbn1cbmA7XG4iXX0=