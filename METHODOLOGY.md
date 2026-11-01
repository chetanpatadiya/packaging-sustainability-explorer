# Packaging Sustainability Opportunity Explorer — Calculation and Evidence Specification (V0.1)

## Intended use

Preliminary mass-balance and prevention-scenario screening for packaging operations. Not a life-cycle assessment, validated environmental product declaration, GMP/ISO conformity evaluation, net-cost ROI, proof of implementation feasibility or authorization for a regulated change. No carbon dioxide, energy, transport, recycling, water or cradle-to-grave impact claims are calculated.

## Boundary

The user defines an assessment duration in whole months (1–120). Every component represents a consistent unit (one discrete part) and one period. Different materials/components may be added independently. The method does not imply that mass savings are environmentally equivalent across different materials or treatments.

## Material balance

Opening usable inventory + received units = released-product consumption + confirmed scrap + ending usable inventory + documented other outflows.

The difference is the unmatched balance. An unmatched nonzero balance, a negative input, necessary process units exceeding scrap, or at-risk usable stock exceeding ending usable stock invalidates a component. Invalid components are *excluded* from aggregate estimates and flagged.

“Confirmed scrap” includes consumed components used in documented necessary setup/testing operations. Such components are not assumed preventable. “At-risk” usable stock is a subset of ending usable inventory and is disclosed separately. It is *not* automatically treated as waste. Defect rework and returns must be classified consistently (avoid double counting).

## Metrics

- Confirmed waste rate (throughput basis): 100 × confirmed scrap / (released-product consumption + confirmed scrap), undefined when denominator is zero. This is **not** automatically the article's purchased-unit Label Waste Index, which uses a different denominator and audit boundary.
- Avoidable units: max(0, confirmed scrap − documented necessary process units).
- Scenario-prevented units in period: avoidable units × user-assumed reduction fraction (0..1).
- Remaining scenario scrap: confirmed scrap − scenario-prevented units.
- Avoidable mass (kg): avoidable units × component mass in g / 1000, only if a positive mass was provided.
- Annual prevented units: period prevented units × (12 / period months).
- Annual prevented mass (kg): annual prevented units × component mass in g / 1000, only if mass was supplied.
- Annual gross material value (USD): annual prevented units × input material acquisition cost/unit, only when an acquisition cost greater than zero is supplied. This is not actual procurement savings and excludes capital, recurrent operating costs, scrap handling, validation, logistics, and minimum order quantities.

A zero or unavailable unit-mass/unit-cost input is treated as *unknown* for the corresponding result, rather than evidence of zero environmental or monetary value. Aggregated mass and value results may cover only a subset of components.

Annualization presumes constant volume and mix, which is a simplifying assumption that should be tested for seasonal, short-lived, or highly variable product families.

## Evidence controls

Each input is labeled as measured, documented estimate, estimate, or synthetic. Source text should record file name, document ID, source page, or calculation basis. The synthetic example uses 10,000 received, 8,900 applied, 400 confirmed scrap (100 necessary), and 700 ending usable units. It is not employer or supplier data. Scenario reduction is an assumption even when the baseline comes from measured records.

Scenario results should be called "potential", "estimated" or "assumed" until measured after implementation. Units, denominators and time windows should accompany every external report. The model never treats an unchecked quality impact as evidence that no impact exists.

## Regulatory and verification constraints

Screen changes to labels/UDI and traceability, sterile barrier integrity, package protection/shelf life, and validated equipment/software. The impact list is not exhaustive. All proposed operational changes must follow applicable local change control, quality/risk processes, verification and validation requirements before implementation. Changes to sterile barrier designs require appropriate design verification and validation under the applicable packaging and sterilization standards. The calculator is not a risk assessment.

## Source basis

- C. Patadiya, *The Label Nobody Counted*, Healthcare Packaging (July 2026): source of conceptual distinction between confirmed waste, needed process consumption, usable at-risk stock, and avoidable waste.
- C. Patadiya, *Design for Sustainability — On-Demand Label Printing in Regulated Packaging Systems*, Smithers Sustainable Packaging Conference presentation and corresponding talk-track (2026): operational and process-change context.
- Smithers/Epson, *Sustainability in Label Printing* (2021): background regarding printing process, obsolescence, scrap, and on-demand printing. **No study-specific quantitative coefficients are used in V0.1.** They must be independently validated before incorporation.
- General inventory/material-balance accounting.

## Explicitly deferred

CO₂ / carbon equivalent comparisons, broader LCA inventory, transportation and storage credits, recycling rates, disposal impacts, payback / ROI, claims of risk reduction, and general benchmark values. Proposed follow-up: V0.2 optional emission factors linked to authoritative sources plus explicit system boundaries and uncertainty intervals.
