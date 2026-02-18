# Hierarchical Variance Tree

A top-down or left-to-right tree layout that decomposes a total variance into hierarchical contributing factors.

## What this visual is for
- Decomposing a total actual-vs-budget variance into hierarchical contributing categories (e.g., region, department, product line).
- Identifying which branches of a hierarchy contribute most to favourable or unfavourable variance.
- Providing an interactive drill-down view where parent nodes aggregate children automatically.
- Comparing actual performance against budget at every level of a category hierarchy.

Not a good fit for:
- Time-series or trend analysis (no axis, no date handling).
- Data without a clear hierarchical grouping or without both an actual and a budget measure.

## Quick start (Power BI Desktop)
1. Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2. Add the visual to a report canvas.
3. Map fields using the "Data roles (field wells)" section below.
4. At minimum, add one or more Category fields, one Actual measure, and one Budget measure to see the tree render.

## Demo data
No demo CSV file is present in this package directory. To test the visual, provide any dataset that contains at least one categorical column and two numeric measures (actual and budget).

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| category | Category | Grouping | Yes | At least one category field is required. Supports multiple fields: Yes (unbounded). Each additional category field adds a deeper hierarchy level. |
| actual | Actual | Measure (Numeric) | Yes | Must be numeric (`requiredTypes: numeric`). Rows with non-finite values are skipped. |
| budget | Budget | Measure (Numeric) | Yes | Must be numeric (`requiredTypes: numeric`). Variance is computed as actual minus budget. |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Extra fields displayed in the tooltip for leaf nodes only. Supports multiple fields: Yes (unbounded). |

Required roles are enforced in `src/model/columns.ts`: the visual returns an error overlay if any of category, actual, or budget are missing.

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| layoutSettings | orientation | enumeration | topDown | Tree direction: "Top Down" or "Left to Right". |
| layoutSettings | nodeWidth | numeric | 160 | Width of each node in pixels. Min 80, Max 300. |
| layoutSettings | nodeHeight | numeric | 70 | Height of each node in pixels. Min 40, Max 120. |
| layoutSettings | levelSpacing | numeric | 60 | Vertical (or horizontal in left-right mode) gap between hierarchy levels. Min 20, Max 120. |
| layoutSettings | siblingSpacing | numeric | 16 | Gap between sibling nodes. Min 4, Max 40. |
| layoutSettings | nodeCornerRadius | numeric | 6 | Border radius of node rectangles. Min 0, Max 16. |
| nodeSettings | showVarianceBar | bool | true | Show a horizontal variance bar at the bottom of each node. |
| nodeSettings | barHeight | numeric | 8 | Height of the variance bar in pixels. Min 4, Max 20. |
| nodeSettings | showPercentage | bool | true | Display variance as a percentage on each node. |
| nodeSettings | showAbsoluteValue | bool | true | Display absolute variance value on each node. |
| nodeSettings | nodeFontSize | numeric | 11 | Font size for the category label in pixels. Min 8, Max 16. |
| nodeSettings | nodeFontColor | fill (color) | #334155 | Font color for the category label. |
| nodeSettings | valueFontSize | numeric | 13 | Font size for the variance value text in pixels. Min 9, Max 20. |
| nodeSettings | nodeBackground | fill (color) | #FFFFFF | Background fill color for nodes. |
| nodeSettings | nodeBorderColor | fill (color) | #E2E8F0 | Border color for nodes. |
| nodeSettings | nodeBorderWidth | numeric | 1 | Border width for nodes in pixels. Min 0, Max 4. |
| colorSettings | favourableColor | fill (color) | #10B981 | Color used when variance is positive (actual > budget). |
| colorSettings | unfavourableColor | fill (color) | #EF4444 | Color used when variance is negative (actual < budget). |
| colorSettings | neutralColor | fill (color) | #94A3B8 | Color used when variance is exactly zero. |
| colorSettings | connectorColor | fill (color) | #CBD5E1 | Color of elbow connectors between parent and child nodes. |
| colorSettings | connectorWidth | numeric | 1.5 | Stroke width of connector lines. Min 0.5, Max 4. |
| colorSettings | selectedNodeBorder | fill (color) | #3B82F6 | Border color applied to the currently selected node. |
| interactionSettings | startExpanded | enumeration | rootOnly | Initial expansion state: "All", "Root Only", or "None". |
| interactionSettings | animationDuration | numeric | 400 | Animation duration in milliseconds. Min 0, Max 1000. |

## Interactions
- Selection and cross-filtering: Yes. `src/interactions/selection.ts` is present and wired in `src/visual.ts`. Only leaf nodes are selectable (guard in `handleNodeClick`). Multi-select is supported via Ctrl/Cmd+click. Background click clears the selection. Cross-visual filtering is enabled via `registerOnSelectCallback`. Non-selected nodes are dimmed to 0.35 opacity when a selection is active.
- Tooltips: Yes. Uses the Power BI tooltip service (`ITooltipService.show`, `move`, `hide`). Tooltips display the category path, actual, budget, variance, variance percentage, and any tooltip extra fields (leaf nodes only). Both default and canvas tooltip types are supported per `capabilities.json`.
- Zoom/pan: No dedicated zoom or pan handler. The SVG host container uses CSS `overflow: auto`, so the tree is scrollable when it exceeds the viewport.
- Expand/collapse: Clicking a non-leaf node toggles its expanded/collapsed state. The expand/collapse indicator ("+" or "-") is rendered in the top-right corner of nodes with children.
- Play axis: Not applicable (no play axis logic present).
- Search box: Not applicable (no search UI present).

## Build and run (developer)
From this visual's directory:

Install dependencies:
```bash
npm install
```

Build and package:
```bash
pbiviz package
```
Output appears in `dist/`.

Dev server:
```bash
pbiviz start
```
Confirmed in `package.json` scripts (`"start": "pbiviz start --project tsconfig.dev.json"`).

Lint:
```bash
npx eslint .
```

## File layout (high level)
- `src/visual.ts` -- entry point; update loop, DOM skeleton, tooltip wiring, formatting model
- `src/settings.ts` -- formatting cards, defaults, validators, `buildRenderConfig()`
- `src/types.ts` -- domain interfaces (`VarianceNode`, `RenderConfig`, `TreeCallbacks`)
- `src/constants.ts` -- shared palette colors, layout defaults, CSS prefix
- `src/model/columns.ts` -- resolves data-role names to column indices, validates required roles
- `src/model/parser.ts` -- parses DataViewTable rows into typed `LeafRow` objects
- `src/model/hierarchy.ts` -- builds the tree from leaf rows, aggregates actual/budget bottom-up
- `src/render/tree.ts` -- d3-hierarchy layout computation, SVG rendering orchestration
- `src/render/node.ts` -- renders individual node SVG groups (label, value, variance bar, toggle)
- `src/render/connectors.ts` -- renders elbow-style orthogonal connector paths
- `src/interactions/selection.ts` -- Power BI selection manager integration (leaf-only selection)
- `src/utils/color.ts` -- variance color helper (favourable/unfavourable/neutral)
- `src/utils/dom.ts` -- DOM element creation helpers, clamp, CSS prefix utility
- `src/utils/format.ts` -- compact number formatting, percentage formatting, safe number parsing
- `style/visual.less` -- visual stylesheet

## Known limitations / edge cases
- Data reduction is capped at 10,000 rows (`dataReductionAlgorithm.top.count` in `capabilities.json`). Datasets exceeding this limit will be silently truncated.
- Rows where actual or budget is non-finite (null, undefined, NaN) are silently skipped during parsing (`src/model/parser.ts`).
- Variance percentage is NaN when budget is zero (`node.budget !== 0` guard in `src/model/hierarchy.ts`). The variance bar is not rendered for nodes with zero budget (`src/render/node.ts`).
- Only leaf nodes carry selection IDs and are selectable. Clicking a non-leaf node toggles expand/collapse but does not trigger cross-filtering.
- Label truncation uses an approximate character-width calculation (`fontSize * 0.6`) which may clip or leave excess space depending on the actual characters (`src/render/node.ts`).

## Versioning and compatibility
- Version: 1.0.0.0 (from `pbiviz.json`).
- Power BI visuals API version: 5.3.0 (from `pbiviz.json` `apiVersion` and `package.json` dependency).
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL from `pbiviz.json`: https://github.com
- Author: Matthew Haskins (matthew.haskins.mh@gmail.com)

## License
MIT (from `package.json`).