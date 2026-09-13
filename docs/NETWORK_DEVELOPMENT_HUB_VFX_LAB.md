# Network Development Hub — VFX Lab

## Purpose

Prototype a visually exceptional, data-driven Network Development Hub without redesigning the existing application shell. The current dark/glass UI, sidebar, spacing, typography hierarchy, and general interaction language remain intact. New visualization work is added to or replaces only dead/redundant sections after approval.

## Core product jobs

1. Outreach Tracker — live team view of clinic outreach, active negotiations, follow-ups, agreements, and finalization.
2. Provider Procurement Tracker — live network expansion by geography, service/category, stage, and time.
3. Expansion Reporting — weekly/monthly/quarterly views and shareable network-growth outputs.
4. Document Intake — retain the existing drop-zone/evidence/review workflow, but replace simulated extraction with real document parsing.

## VFX principle

The visualization must not be decorative. Every high-end effect maps to real data or interaction state.

- Particle = provider, procurement item, or explicitly defined event.
- Arc/trail = real geographic relationship or event path.
- Ripple/shockwave = activation/finalization event.
- Bloom intensity = meaningful activity/recency/volume.
- Morph/recluster = real filter transition (country, service, stage, period).
- Playback = recorded historical network state and event timestamps.
- Extrusion/height = explicit numeric metric such as active providers, active procurement, or unfulfilled demand.

## VFX directions to prototype

### A. Network Expansion Engine — first-choice hero

Operational world view with provider activations and time playback.

Sequence for a newly activated provider:
1. dim point appears
2. point intensifies
3. bloom flare
4. concentric ripple/shockwave
5. geographic/network arc fires
6. node settles into stable live state

Time controls: week / month / quarter / all-time, plus scrub/playback.

### B. Constellation Drilldown

GPU particle field where providers are individual marks. Filtering by service/country/stage causes relevant marks to morph and recluster rather than simply disappear.

### C. Procurement Aurora

GPU flow/advection field where density, direction, speed, and brightness encode explicitly defined procurement activity. This is secondary to the operational map because it is less precise.

### D. Outreach Pulse

A focused provider/outreach visualization showing events as a temporal pulse trail from target identification through engagement, pricing, agreement, and activation.

## Grounded implementation references

### Three.js / WebGPU

Official examples and current APIs demonstrate:
- GPU/compute particle systems
- linked particles
- attractor particle systems
- soft particles
- morph targets
- WebGPU bloom
- radial blur and other post-processing

References:
- https://threejs.org/examples/webgpu_tsl_compute_attractors_particles.html
- https://threejs.org/examples/webgpu_tsl_vfx_linkedparticles.html
- https://threejs.org/examples/webgpu_compute_particles_fluid.html
- https://threejs.org/examples/webgpu_postprocessing_bloom.html

### deck.gl

Use for high-volume geospatial GPU layers and temporal paths.

Relevant layers:
- TripsLayer — animated timestamped paths with fading trails
- ArcLayer / GreatCircleLayer — geographic connections
- PointCloudLayer — high-density provider/event marks
- GPU aggregation/extrusion layers
- MapLibreOverlay — overlay or interleaved WebGL rendering with a MapLibre-compatible basemap

References:
- https://deck.gl/examples/trips-layer
- https://deck.gl/docs/api-reference/geo-layers/trips-layer

### MapTiler SDK JS

Use as the geographic foundation for operational map/globe, camera, terrain and route playback.

Confirmed current capabilities:
- globe projection
- night/space globe styles
- terrain
- dynamic camera animation/fly-to
- animated route layer with play/pause
- camera-following along routes
- 3D GLTF models and point-cloud/LIDAR examples

References:
- https://docs.maptiler.com/sdk-js/examples/
- https://docs.maptiler.com/sdk-js/examples/animated-route/
- https://docs.maptiler.com/sdk-js/examples/3d-js-cinematic-path/
- https://docs.maptiler.com/sdk-js/examples/globe-3d-model/
- https://docs.maptiler.com/sdk-js/examples/globe-terrain/

Implementation note: MapTiler documentation recommends avoiding full terrain at distant globe scale and using Mercator/terrain when transitioning to close geographic views.

## Current repo findings

- React 19 + Vite + TypeScript + Tailwind + Framer Motion already present.
- Current map uses react-simple-maps and is U.S.-only.
- Current outreach database model already captures provider/location/contact, status, sent/received/follow-up timestamps and notes. Extend rather than discard.
- Existing upload UI is useful and should remain.
- Existing backend document extraction is simulated and must be replaced before document-derived data can drive procurement visualizations.

## Guardrails

- Do not redesign the whole UI.
- Do not replace the existing shell/sidebar just to accommodate the visualizations.
- Do not add random particles, bloom, glows, arcs or movement without a defined data meaning.
- Keep exact values, tables, filters and inspection controls in normal DOM UI around the focal GPU scene.
- Respect reduced-motion preferences and provide a static/low-motion fallback.
- Optimize mobile separately; do not attempt to render desktop GPU density unchanged on phones.
- No production deployment from this lab branch until the design/effect direction is approved.

## Proposed build order

1. Verify the live Render service and production database.
2. Add a non-production VFX lab route inside the existing UI shell.
3. Prototype Network Expansion Engine with representative provider data.
4. Bind the prototype to real provider/activation data after schema verification.
5. Add outreach/procurement event model needed for historical playback.
6. Replace simulated extraction with a real parser pipeline.
7. Fold approved visualization into the production route and remove only superseded/dead sections.
