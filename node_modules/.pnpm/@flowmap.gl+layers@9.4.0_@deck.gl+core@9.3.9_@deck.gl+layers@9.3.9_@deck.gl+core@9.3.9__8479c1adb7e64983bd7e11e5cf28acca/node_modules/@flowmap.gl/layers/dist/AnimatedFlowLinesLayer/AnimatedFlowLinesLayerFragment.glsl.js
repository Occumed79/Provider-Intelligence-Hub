/*
 * Copyright (c) Flowmap.gl contributors
 * Copyright (c) 2018-2020 Teralytics
 * SPDX-License-Identifier: Apache-2.0
 */
export default `\
#version 300 es
#define SHADER_NAME animated-flow-lines-layer-fragment-shader

precision highp float;

in vec4 vColor;
in float sourceToTarget;
in vec2 uv;

out vec4 fragColor;
                                   
void main(void) {
  geometry.uv = uv;

  fragColor = vec4(vColor.xyz, vColor.w * smoothstep(1.0 - animatedFlowLines.animationTailLength, 1.0, fract(sourceToTarget)));

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5pbWF0ZWRGbG93TGluZXNMYXllckZyYWdtZW50Lmdsc2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvQW5pbWF0ZWRGbG93TGluZXNMYXllci9BbmltYXRlZEZsb3dMaW5lc0xheWVyRnJhZ21lbnQuZ2xzbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAoYykgRmxvd21hcC5nbCBjb250cmlidXRvcnNcbiAqIENvcHlyaWdodCAoYykgMjAxOC0yMDIwIFRlcmFseXRpY3NcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgYFxcXG4jdmVyc2lvbiAzMDAgZXNcbiNkZWZpbmUgU0hBREVSX05BTUUgYW5pbWF0ZWQtZmxvdy1saW5lcy1sYXllci1mcmFnbWVudC1zaGFkZXJcblxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG5pbiB2ZWM0IHZDb2xvcjtcbmluIGZsb2F0IHNvdXJjZVRvVGFyZ2V0O1xuaW4gdmVjMiB1djtcblxub3V0IHZlYzQgZnJhZ0NvbG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbnZvaWQgbWFpbih2b2lkKSB7XG4gIGdlb21ldHJ5LnV2ID0gdXY7XG5cbiAgZnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IueHl6LCB2Q29sb3IudyAqIHNtb290aHN0ZXAoMS4wIC0gYW5pbWF0ZWRGbG93TGluZXMuYW5pbWF0aW9uVGFpbExlbmd0aCwgMS4wLCBmcmFjdChzb3VyY2VUb1RhcmdldCkpKTtcblxuICBERUNLR0xfRklMVEVSX0NPTE9SKGZyYWdDb2xvciwgZ2VvbWV0cnkpO1xufVxuYDtcbiJdfQ==