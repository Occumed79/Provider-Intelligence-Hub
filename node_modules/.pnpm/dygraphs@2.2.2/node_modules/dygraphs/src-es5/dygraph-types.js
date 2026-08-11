"use strict";

/**
 * @license
 * Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/license/MIT
 */

// This file contains typedefs and externs that are needed by the Closure Compiler.

/**
 * @typedef {{
 *   px: number,
 *   py: number,
 *   isZooming: boolean,
 *   isPanning: boolean,
 *   is2DPan: boolean,
 *   cancelNextDblclick: boolean,
 *   initializeMouseDown:
 *       function(!Event, !Dygraph, !DygraphInteractionContext)
 * }}
 */
var DygraphInteractionContext;

/**
 * Point structure.
 *
 * xval_* and yval_* are the original unscaled data values,
 * while x_* and y_* are scaled to the range (0.0-1.0) for plotting.
 * yval_stacked is the cumulative Y value used for stacking graphs,
 * and bottom/top/minus/plus are used for error bar graphs.
 *
 * @typedef {{
 *     idx: number,
 *     name: string,
 *     x: ?number,
 *     xval: ?number,
 *     y_bottom: ?number,
 *     y: ?number,
 *     y_stacked: ?number,
 *     y_top: ?number,
 *     yval_minus: ?number,
 *     yval: ?number,
 *     yval_plus: ?number,
 *     yval_stacked
 * }}
 */
Dygraph.PointType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeWdyYXBoSW50ZXJhY3Rpb25Db250ZXh0IiwiRHlncmFwaCIsIlBvaW50VHlwZSJdLCJzb3VyY2VzIjpbIi4uL3NyYy9keWdyYXBoLXR5cGVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDA2IERhbiBWYW5kZXJrYW0gKGRhbnZka0BnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZS9NSVRcbiAqL1xuXG4vLyBUaGlzIGZpbGUgY29udGFpbnMgdHlwZWRlZnMgYW5kIGV4dGVybnMgdGhhdCBhcmUgbmVlZGVkIGJ5IHRoZSBDbG9zdXJlIENvbXBpbGVyLlxuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHB4OiBudW1iZXIsXG4gKiAgIHB5OiBudW1iZXIsXG4gKiAgIGlzWm9vbWluZzogYm9vbGVhbixcbiAqICAgaXNQYW5uaW5nOiBib29sZWFuLFxuICogICBpczJEUGFuOiBib29sZWFuLFxuICogICBjYW5jZWxOZXh0RGJsY2xpY2s6IGJvb2xlYW4sXG4gKiAgIGluaXRpYWxpemVNb3VzZURvd246XG4gKiAgICAgICBmdW5jdGlvbighRXZlbnQsICFEeWdyYXBoLCAhRHlncmFwaEludGVyYWN0aW9uQ29udGV4dClcbiAqIH19XG4gKi9cbnZhciBEeWdyYXBoSW50ZXJhY3Rpb25Db250ZXh0O1xuXG4vKipcbiAqIFBvaW50IHN0cnVjdHVyZS5cbiAqXG4gKiB4dmFsXyogYW5kIHl2YWxfKiBhcmUgdGhlIG9yaWdpbmFsIHVuc2NhbGVkIGRhdGEgdmFsdWVzLFxuICogd2hpbGUgeF8qIGFuZCB5XyogYXJlIHNjYWxlZCB0byB0aGUgcmFuZ2UgKDAuMC0xLjApIGZvciBwbG90dGluZy5cbiAqIHl2YWxfc3RhY2tlZCBpcyB0aGUgY3VtdWxhdGl2ZSBZIHZhbHVlIHVzZWQgZm9yIHN0YWNraW5nIGdyYXBocyxcbiAqIGFuZCBib3R0b20vdG9wL21pbnVzL3BsdXMgYXJlIHVzZWQgZm9yIGVycm9yIGJhciBncmFwaHMuXG4gKlxuICogQHR5cGVkZWYge3tcbiAqICAgICBpZHg6IG51bWJlcixcbiAqICAgICBuYW1lOiBzdHJpbmcsXG4gKiAgICAgeDogP251bWJlcixcbiAqICAgICB4dmFsOiA/bnVtYmVyLFxuICogICAgIHlfYm90dG9tOiA/bnVtYmVyLFxuICogICAgIHk6ID9udW1iZXIsXG4gKiAgICAgeV9zdGFja2VkOiA/bnVtYmVyLFxuICogICAgIHlfdG9wOiA/bnVtYmVyLFxuICogICAgIHl2YWxfbWludXM6ID9udW1iZXIsXG4gKiAgICAgeXZhbDogP251bWJlcixcbiAqICAgICB5dmFsX3BsdXM6ID9udW1iZXIsXG4gKiAgICAgeXZhbF9zdGFja2VkXG4gKiB9fVxuICovXG5EeWdyYXBoLlBvaW50VHlwZTtcbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlBLHlCQUF5Qjs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQyxPQUFPLENBQUNDLFNBQVMiLCJpZ25vcmVMaXN0IjpbXX0=