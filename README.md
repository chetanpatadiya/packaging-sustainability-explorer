# Packaging Sustainability Opportunity Explorer V0.1

A small, auditable, offline-capable progressive web app (PWA) for packaging waste baselines and improvement scenarios. **Demonstration and screening only.** Contains no employer data. No servers, external API, external libraries, analytics, account, or login requirements.

## Run locally

1. Extract the ZIP folder.
2. For the simplest calculation preview, open `index.html` in a modern browser. Browser storage works; service worker/offline install may not work on a `file://` URL.
3. For full PWA support, serve the folder locally, e.g. `python -m http.server 8000` from this directory and open `http://localhost:8000`.
4. For GitHub Pages, create a separate public repository, upload the *contents* of this folder to the repo root, and enable Pages from main / root. The files use relative paths and work in a GitHub project subdirectory.

## Workflow

1. Replace the clearly labeled synthetic demo with actual, non-confidential, period-matched material accounting records. The synthetic example is for testing only.
2. Reconcile all component balances. Each component needs opening usable units, receipts, released-product use, confirmed scrap, closing usable inventory, and other documented outflow.
3. Enter documented necessary process consumption (part of confirmed scrap) and at-risk usable inventory (part of ending inventory).
4. Provide per-component mass and optional cost, and record the baseline data provenance/source.
5. In Scenarios, choose a process intervention and enter a hypothetical reduction in **avoidable** waste.
6. Review quality-system triggers and export the results as CSV, or the assessment as JSON. Imported data must conform to the v0.1 schema.

## Privacy and storage

The app operates entirely client-side. It saves work to **localStorage in the same browser/profile**, for usability; that is not encrypted or backed up and should not be used for proprietary employer information outside approved systems. `Save JSON` downloads a portable assessment. `Clear saved assessment` resets this app's saved values. Avoid public hosting of real private data.

## Data and model validity

- Reconciliation is required; incomplete records are excluded from aggregate opportunity totals.
- Inventory at risk is *not* classified as confirmed waste.
- The percent intervention effectiveness is a user assumption, not an established process performance figure.
- Aggregated mass estimates only cover components with supplied positive mass. A zero mass field means **mass unavailable**, not genuine zero mass.
- Material cost is optional: zero means **unknown**. Cost output is a gross material value screen, not net financial benefit. Aggregate totals may have partial coverage.
- Regulatory flags signal review needs; they never indicate regulatory acceptance.
- Details in `METHODOLOGY.md`.

## Files

- `index.html`: structure
- `styles.css`: responsive styling
- `core.js`: independently testable calculation kernel
- `app.js`: browser UI, JSON/CSV, input handling and local storage
- `sw.js`, `manifest.webmanifest`, `icon.svg`: PWA support
- `tests/core.test.js`: regression/edge-case tests (requires Node.js, no packages)

## Verify calculations

Run `node tests/core.test.js` (Node 18+). This checks default example, balanced/unbalanced inventory, zero and negative values, necessary consumption, at-risk stock, annualization, missing mass, import normalization, and prevention fraction. Tests verify calculation consistency but are not external model validation.

## Version scope

V0.1 includes component audit, waste separation, modeled prevention, potential annualized mass, material value, evidence source entry and impact screening. V0.2 may add optional LCA-linked emissions with documented source factors, if defensible. V0.3 may add feasibility / decision support and richer uncertainty analysis.

## Publishing note

Review wording, citations and legal/license preferences before public deployment. Source files are provided without a license decision; add your chosen license after review.
