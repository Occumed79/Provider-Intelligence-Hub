# Provider Intelligence Hub / Network Development Hub Guardrails

These instructions apply to all development work in this repository.

## Product direction

The application is evolving from Provider Intelligence Hub into an Occu-Med Network Development Hub. The core workflow is:

**Needs / Targets -> Outreach -> Procurement -> Activated / Live -> Report / Share**

Core product pillars:

1. Expansion Tracking
2. Outreach / Relationship Development
3. Automatic Document Intelligence
4. Geographic / VFX Network Visualization
5. Reports + Share / Export

Procurement is a supporting workflow inside Network Development. Do not turn the product into a standalone procurement CRM.

## UI rule — mandatory

Do **not** invent, redesign, or add user-interface layouts from scratch.

Any new page, panel, dashboard section, report layout, map layout, timeline, card system, or other visual UI addition must:

1. originate from an established external UI template or published design reference;
2. be shown to the user with a link/reference before implementation;
3. receive explicit user approval before frontend code is changed to implement it.

Until approval is received, backend/data/API work may continue, but no new UI should be created.

Preserve the existing dark/luminous visual shell unless the user explicitly approves a template-driven change. Add functionality inside the existing experience rather than performing a wholesale redesign.

## Data and behavior

- Use real application/Neon data. Do not present fabricated sample counts as production data.
- The production database is Neon PostgreSQL.
- The production deployment is the unified Render web service.
- Automatic Intake should require minimal manual metadata and should extract/file provider information automatically.
- Expansion history must be time-aware (week/month/quarter/year/all-time) and support geographic, service, activation, and pipeline reporting.
- Reporting must be generated from the same expansion/outreach/provider data used by the operational views.
- Map/VFX work should remain data-driven; visual effects must represent actual network-development events or state.

## Existing UI

The user has explicitly approved the current UI direction. Do not overhaul working screens. Dead or redundant sections may be removed or repurposed only when a replacement is ready and the user has approved any new visual implementation.