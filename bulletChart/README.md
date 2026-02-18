# BulletChart

Bullet chart custom visual for Power BI based on the Stephen Few design, displaying an actual value bar, a target marker, and up to three qualitative range bands per category row. Supports horizontal and vertical orientations.

## What this visual is for
- Comparing a primary measure (actual) against a target across one or more categories.
- Showing performance against qualitative thresholds (bad, satisfactory, good) in a compact layout.
- Replacing dashboard gauges with a more space-efficient, information-dense alternative.
- Displaying KPI status for multiple metrics side by side in a single visual.

Not a good fit for:
- Time-series or trend analysis (no date axis or animation support).
- Visualizations requiring more than three qualitative range bands per item.

## Quick start (Power BI Desktop)
1) Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2) Add the visual to a report canvas.
3) Map fields using the "Data roles (field wells)" section below.
4) (Optional) Load demo data and apply the suggested demo mapping (see "Demo data" section).

## Demo data
No demo CSV file was found in the directory listing for this package. If a demo file is added in the future, place it in the package root with a name such as `bulletChartDemo.csv` and update this section with column names and suggested field mappings.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| category | Category | Grouping | Yes | Parser requires `cols.category >= 0` (see `src/model/parser.ts` and `src/visual.ts` guard). |
| actual | Actual | Measure (Numeric) | Yes | Parser requires `cols.actual >= 0`; rows with null actual values are skipped. |
| target | Target | Measure (Numeric) | No | Shown as a vertical/horizontal marker line. Used for conditional coloring and % of Target tooltip. |
| range1 | Range 1 (Bad) | Measure (Numeric) | No | Lowest qualitative band. Clamped so range1 <= range2 <= range3. |
| range2 | Range 2 (Satisfactory) | Measure (Numeric) | No | Middle qualitative band. Clamped to be non-decreasing relative to range1 and range3. |
| range3 | Range 3 (Good) | Measure (Numeric) | No | Highest qualitative band. Clamped to be non-decreasing. |
| maxValue | Max Value | Measure (Numeric) | No | Explicit axis maximum override. If provided and > 0, used instead of the auto-computed max. |
| tooltipFields | Tooltips | Grouping or Measure | No | Supports multiple fields (unbounded). Extra fields appended to the tooltip popup. |

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| layoutSettings | orientation | enumeration | horizontal | Chart orientation: horizontal or vertical. |
| layoutSettings | bulletHeight | numeric | 32 | Height (or width in vertical mode) of each bullet row in pixels. Min 16, Max 80. |
| layoutSettings | bulletSpacing | numeric | 8 | Spacing between bullet rows in pixels. Min 0, Max 24. |
| layoutSettings | categoryWidth | numeric | 120 | Width of the category label column in horizontal mode. Min 40, Max 300. |
| layoutSettings | showCategoryLabels | bool | true | Toggle visibility of category labels. |
| layoutSettings | categoryFontSize | numeric | 11 | Font size for category labels. Min 7, Max 18. |
| layoutSettings | categoryFontColor | fill (color) | #334155 | Font color for category labels. |
| barSettings | actualBarHeightPct | numeric | 50 | Height of the actual bar as a percentage of bullet row height. Min 0, Max 100. |
| barSettings | actualBarColor | fill (color) | #1E293B | Default color of the actual value bar. |
| barSettings | actualBarCornerRadius | numeric | 0 | Corner radius of the actual bar in pixels. Min 0, Max 8. |
| targetSettings | showTarget | bool | true | Toggle visibility of the target marker line. |
| targetSettings | targetColor | fill (color) | #0F172A | Color of the target marker line. |
| targetSettings | targetWidth | numeric | 3 | Stroke width of the target marker in pixels. Min 1, Max 8. |
| targetSettings | targetHeightPct | numeric | 65 | Height of the target marker as a percentage of bullet row height. Min 0, Max 100. |
| rangeSettings | range1Color | fill (color) | #E2E8F0 | Color for Range 1 (Bad) band. |
| rangeSettings | range2Color | fill (color) | #CBD5E1 | Color for Range 2 (Satisfactory) band. |
| rangeSettings | range3Color | fill (color) | #F1F5F9 | Color for Range 3 (Good) band. |
| rangeSettings | rangeCornerRadius | numeric | 0 | Corner radius for range band rectangles. Min 0, Max 8. |
| axisSettings | showAxis | bool | true | Toggle visibility of the value axis tick labels. |
| axisSettings | axisFontSize | numeric | 9 | Font size for axis tick labels. Min 7, Max 14. |
| axisSettings | axisFontColor | fill (color) | #94A3B8 | Font color for axis tick labels. |
| axisSettings | showGridlines | bool | true | Toggle visibility of dashed gridlines. |
| axisSettings | gridlineColor | fill (color) | #F1F5F9 | Color of gridlines. |
| labelSettings | showValueLabel | bool | true | Toggle visibility of value labels on or near the actual bar. |
| labelSettings | valueLabelPosition | enumeration | right | Position of the value label: inside, right, or left. Applies to horizontal mode. |
| labelSettings | valueFontSize | numeric | 10 | Font size for value labels. Min 7, Max 16. |
| labelSettings | valueFontColor | fill (color) | #475569 | Font color for value labels (when not positioned inside the bar). |
| labelSettings | showTargetLabel | bool | false | Toggle visibility of a label displaying the target value near the marker. |
| colorSettings | selectedBarColor | fill (color) | #2563EB | Stroke color applied to the actual bar of selected items. |
| colorSettings | conditionalColoring | bool | false | When enabled, bar color changes based on actual vs target comparison. |
| colorSettings | aboveTargetColor | fill (color) | #10B981 | Bar color when actual >= target (requires conditionalColoring enabled). |
| colorSettings | belowTargetColor | fill (color) | #EF4444 | Bar color when actual < target (requires conditionalColoring enabled). |

## Interactions
- Selection & cross-filtering: Yes. `src/interactions/selection.ts` is imported and wired in `src/visual.ts`. Clicking a bullet row selects it via `ISelectionManager.select()` with Ctrl/Cmd multi-select support. Unselected rows are dimmed to opacity 0.25. Clicking the background clears selection.
- Tooltips: Yes. Uses the Power BI tooltip service (`ITooltipService`). Shows Category, Actual, Target, % of Target, range values, and any extra tooltip fields. Canvas tooltips are enabled (`capabilities.json` declares `"canvas": true`).
- Zoom/pan: No dedicated zoom handler. The chart wrapper uses CSS `overflow: auto` to scroll when content exceeds the viewport.
- Play axis: No (no play axis handler found).
- Search box: No (no search handler found).

## Build and run (developer)
From this visual's directory:

Install dependencies:
```bash
npm install
```

Build and package:
```bash
npx pbiviz package
```
Output appears in `dist/`.

Dev server:
```bash
npm start
```
This runs `pbiviz start --project tsconfig.dev.json` (confirmed in `package.json` scripts).

Lint:
```bash
npm run lint
```

## File layout (high level)
- `src/visual.ts` -- entry point and update orchestrator
- `src/model/columns.ts` -- maps data-role names to column indices
- `src/model/parser.ts` -- parses DataViewTable rows into BulletItem domain objects
- `src/render/bullet.ts` -- renders range bands, actual bar, and target marker (horizontal and vertical)
- `src/render/axis.ts` -- renders value axis ticks and gridlines
- `src/render/labels.ts` -- renders value labels and target labels
- `src/interactions/selection.ts` -- selection highlight/dim logic
- `src/utils/color.ts` -- conditional color resolution
- `src/utils/dom.ts` -- DOM element factories and helpers
- `src/utils/format.ts` -- number formatting and nice tick computation
- `src/settings.ts` -- formatting settings model and RenderConfig builder
- `src/types.ts` -- domain interfaces, literal unions, RenderConfig type
- `src/constants.ts` -- palette arrays, layout constants, dim opacity
- `style/visual.less` -- component styling

## Known limitations / edge cases
- Qualitative ranges are clamped to be non-decreasing in `src/model/parser.ts` (range1 <= range2 <= range3). If input data violates this, values are silently adjusted.
- Rows with a null or non-numeric Actual value are silently skipped (see `parser.ts` line: `if (actual === null) continue`).
- If all items have zero or negative resolvedMax, the scale denominator falls back to 1 to avoid division by zero.
- Data reduction is capped at 10,000 rows (`capabilities.json` `dataReductionAlgorithm.top.count`).
- The value label "inside" position uses a fixed white font color (`#FFFFFF`), which may be unreadable on light-colored actual bars.

## Versioning and compatibility
- Visual version: 1.0.0.0 (from `pbiviz.json`).
- Power BI Visuals API: 5.3.0 (from `pbiviz.json` `apiVersion`).
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL (from `pbiviz.json`): https://github.com
- Author: Matthew Haskins (matthew.haskins.mh@gmail.com)

## License
MIT (from `package.json`).

This visual is part of the POWERBI monorepo visual library.