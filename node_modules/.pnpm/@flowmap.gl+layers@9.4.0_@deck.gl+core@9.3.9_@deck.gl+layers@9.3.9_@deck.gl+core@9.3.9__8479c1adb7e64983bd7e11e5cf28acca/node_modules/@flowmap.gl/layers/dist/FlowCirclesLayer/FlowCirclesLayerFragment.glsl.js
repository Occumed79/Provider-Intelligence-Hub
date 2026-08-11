/*
 * Copyright (c) Flowmap.gl contributors
 * Copyright (c) 2018-2020 Teralytics
 * SPDX-License-Identifier: Apache-2.0
 */
export default `\
#version 300 es
#define SHADER_NAME flow-circles-layer-fragment-shader
#define SOFT_OUTLINE 0.05
#define EPS 0.05
precision highp float;

in vec4 vColor;
in vec2 unitPosition;
in float unitInRadius;
in float unitOutRadius;
in float vOutOfScale;

out vec4 fragColor;

float when_gt(float x, float y) {
  return max(sign(x - y), 0.0);
}

void main(void) {
  geometry.uv = unitPosition;
  float distToCenter = length(unitPosition);
  if (distToCenter > 1.0) {
    discard;
  }

  // See https://stackoverflow.com/questions/47285778
  vec4 ringColor = mix(
    flowCircles.emptyColor, vColor,
    when_gt(unitInRadius, unitOutRadius)
  );
  vec4 outlineColor = mix(
    mix(vColor, flowCircles.emptyColor, flowCircles.outlineEmptyMix),
    vColor,
    when_gt(unitInRadius, unitOutRadius)
  );
  
  float innerR = min(unitInRadius, unitOutRadius) * (1.0 - SOFT_OUTLINE);
  
  // Inner circle
  float step2 = innerR - 2.0 * EPS; 
  float step3 = innerR - EPS;
  
  // Ring
  float step4 = innerR;
  // float step5 = 1.0 - SOFT_OUTLINE - EPS;
  // float step6 = 1.0 - SOFT_OUTLINE;
  float step5 = 1.0 - 5.0 * EPS;
  float step6 = 1.0;
  
  fragColor = vColor;
  fragColor = mix(fragColor, flowCircles.emptyColor, smoothstep(step2, step3, distToCenter));
  fragColor = mix(fragColor, ringColor, smoothstep(step3, step4, distToCenter));
  fragColor = mix(fragColor, outlineColor, smoothstep(step5, step6, distToCenter));
  fragColor.rgb = mix(fragColor.rgb, vec3(1.0, 0.188235, 0.188235), step(0.5, vOutOfScale));
  fragColor.a = vColor.a;
  fragColor.a *= smoothstep(0.0, SOFT_OUTLINE, 1.0 - distToCenter);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxvd0NpcmNsZXNMYXllckZyYWdtZW50Lmdsc2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvRmxvd0NpcmNsZXNMYXllci9GbG93Q2lyY2xlc0xheWVyRnJhZ21lbnQuZ2xzbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBQ0gsZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyRGQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgKGMpIEZsb3dtYXAuZ2wgY29udHJpYnV0b3JzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTgtMjAyMCBUZXJhbHl0aWNzXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5leHBvcnQgZGVmYXVsdCBgXFxcbiN2ZXJzaW9uIDMwMCBlc1xuI2RlZmluZSBTSEFERVJfTkFNRSBmbG93LWNpcmNsZXMtbGF5ZXItZnJhZ21lbnQtc2hhZGVyXG4jZGVmaW5lIFNPRlRfT1VUTElORSAwLjA1XG4jZGVmaW5lIEVQUyAwLjA1XG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbmluIHZlYzQgdkNvbG9yO1xuaW4gdmVjMiB1bml0UG9zaXRpb247XG5pbiBmbG9hdCB1bml0SW5SYWRpdXM7XG5pbiBmbG9hdCB1bml0T3V0UmFkaXVzO1xuaW4gZmxvYXQgdk91dE9mU2NhbGU7XG5cbm91dCB2ZWM0IGZyYWdDb2xvcjtcblxuZmxvYXQgd2hlbl9ndChmbG9hdCB4LCBmbG9hdCB5KSB7XG4gIHJldHVybiBtYXgoc2lnbih4IC0geSksIDAuMCk7XG59XG5cbnZvaWQgbWFpbih2b2lkKSB7XG4gIGdlb21ldHJ5LnV2ID0gdW5pdFBvc2l0aW9uO1xuICBmbG9hdCBkaXN0VG9DZW50ZXIgPSBsZW5ndGgodW5pdFBvc2l0aW9uKTtcbiAgaWYgKGRpc3RUb0NlbnRlciA+IDEuMCkge1xuICAgIGRpc2NhcmQ7XG4gIH1cblxuICAvLyBTZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDcyODU3NzhcbiAgdmVjNCByaW5nQ29sb3IgPSBtaXgoXG4gICAgZmxvd0NpcmNsZXMuZW1wdHlDb2xvciwgdkNvbG9yLFxuICAgIHdoZW5fZ3QodW5pdEluUmFkaXVzLCB1bml0T3V0UmFkaXVzKVxuICApO1xuICB2ZWM0IG91dGxpbmVDb2xvciA9IG1peChcbiAgICBtaXgodkNvbG9yLCBmbG93Q2lyY2xlcy5lbXB0eUNvbG9yLCBmbG93Q2lyY2xlcy5vdXRsaW5lRW1wdHlNaXgpLFxuICAgIHZDb2xvcixcbiAgICB3aGVuX2d0KHVuaXRJblJhZGl1cywgdW5pdE91dFJhZGl1cylcbiAgKTtcbiAgXG4gIGZsb2F0IGlubmVyUiA9IG1pbih1bml0SW5SYWRpdXMsIHVuaXRPdXRSYWRpdXMpICogKDEuMCAtIFNPRlRfT1VUTElORSk7XG4gIFxuICAvLyBJbm5lciBjaXJjbGVcbiAgZmxvYXQgc3RlcDIgPSBpbm5lclIgLSAyLjAgKiBFUFM7IFxuICBmbG9hdCBzdGVwMyA9IGlubmVyUiAtIEVQUztcbiAgXG4gIC8vIFJpbmdcbiAgZmxvYXQgc3RlcDQgPSBpbm5lclI7XG4gIC8vIGZsb2F0IHN0ZXA1ID0gMS4wIC0gU09GVF9PVVRMSU5FIC0gRVBTO1xuICAvLyBmbG9hdCBzdGVwNiA9IDEuMCAtIFNPRlRfT1VUTElORTtcbiAgZmxvYXQgc3RlcDUgPSAxLjAgLSA1LjAgKiBFUFM7XG4gIGZsb2F0IHN0ZXA2ID0gMS4wO1xuICBcbiAgZnJhZ0NvbG9yID0gdkNvbG9yO1xuICBmcmFnQ29sb3IgPSBtaXgoZnJhZ0NvbG9yLCBmbG93Q2lyY2xlcy5lbXB0eUNvbG9yLCBzbW9vdGhzdGVwKHN0ZXAyLCBzdGVwMywgZGlzdFRvQ2VudGVyKSk7XG4gIGZyYWdDb2xvciA9IG1peChmcmFnQ29sb3IsIHJpbmdDb2xvciwgc21vb3Roc3RlcChzdGVwMywgc3RlcDQsIGRpc3RUb0NlbnRlcikpO1xuICBmcmFnQ29sb3IgPSBtaXgoZnJhZ0NvbG9yLCBvdXRsaW5lQ29sb3IsIHNtb290aHN0ZXAoc3RlcDUsIHN0ZXA2LCBkaXN0VG9DZW50ZXIpKTtcbiAgZnJhZ0NvbG9yLnJnYiA9IG1peChmcmFnQ29sb3IucmdiLCB2ZWMzKDEuMCwgMC4xODgyMzUsIDAuMTg4MjM1KSwgc3RlcCgwLjUsIHZPdXRPZlNjYWxlKSk7XG4gIGZyYWdDb2xvci5hID0gdkNvbG9yLmE7XG4gIGZyYWdDb2xvci5hICo9IHNtb290aHN0ZXAoMC4wLCBTT0ZUX09VVExJTkUsIDEuMCAtIGRpc3RUb0NlbnRlcik7XG4gIERFQ0tHTF9GSUxURVJfQ09MT1IoZnJhZ0NvbG9yLCBnZW9tZXRyeSk7XG59XG5gO1xuIl19