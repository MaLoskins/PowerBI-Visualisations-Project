# Advanced Pie / Donut Chart

A versatile pie or donut chart for Power BI with configurable inner radius, rich data labels with leader lines, centre label, legend, small-slice grouping, multiple colour palettes, an optional outer ring (sunburst), and entry animation.

## What this visual is for
- Showing proportional breakdown of a single measure across categories (market share, budget allocation, survey responses).
- Comparing relative sizes of parts to a whole with a donut hole for a prominent total or KPI.
- Drilling into a second categorical dimension via the outer ring (sunburst) to show sub-category breakdown.
- Highlighting small contributors by automatically grouping them into an "Other" slice.
- Displaying a centre label that reacts to selection, showing the selected slice value.

Not a good fit for:
- Comparing precise values across many categories (a bar chart is more readable when categories exceed roughly 8-10).
- Showing trends over time (use a line or area chart instead).

## Quick start (Power BI Desktop)
1. Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2. Add the visual to a report canvas.
3. Map fields using the "Data roles (field wells)" section below. At minimum, add a Category field and a Value field.
4. (Optional) Load demo data from the demo CSV and apply the suggested demo mapping.

## Demo data
No demo CSV file was found in this package directory. If a demo file is added in the future, list its columns here and propose a mapping to the data roles below.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| category | Category | Grouping | Yes | Guard clause in `model/columns.ts` returns null when missing. Rows are aggregated by this field. |
| value | Value | Measure (Numeric) | Yes | Guard clause in `model/columns.ts` returns null when missing. Must be a positive finite number; non-positive rows are skipped. |
| outerCategory | Outer Category | Grouping | No | When populated, enables the outer ring (sunburst) breakdown within each category slice. |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Additional fields surfaced in the Power BI tooltip. Supports multiple fields (unbounded). |

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| chartSettings | chartType | enumeration | donut | Pie (no hole) or Donut (with inner radius). |
| chartSettings | innerRadiusPercent | numeric | 55 | Inner radius as a percentage of the outer radius. Min 0, Max 100. |
| chartSettings | padAngle | numeric | 0.02 | Gap angle in radians between slices. Min 0, Max 0.1. |
| chartSettings | cornerRadius | numeric | 3 | Rounded corner radius in pixels for each arc. Min 0, Max 12. |
| chartSettings | startAngle | numeric | 0 | Rotation offset in degrees for the first slice. Min 0, Max 360. |
| chartSettings | sortSlices | enumeration | valueDesc | Slice ordering: None, Value Ascending, Value Descending, Name A-Z, Name Z-A. |
| chartSettings | showOuterRing | bool | false | Show the outer ring when Outer Category data is present. |
| chartSettings | outerRingThickness | numeric | 30 | Outer ring thickness as a percentage of the available radius. Min 0, Max 100. |
| colorSettings | colorPalette | enumeration | default | Palette mode: Default, Pastel, Vivid, or Monochrome. |
| colorSettings | monochromeBase | fill (color) | #3B82F6 | Base colour used when palette is Monochrome. |
| colorSettings | selectedSliceColor | fill (color) | #2563EB | Accent colour reference for selected slices (used via scale, not fill override). |
| colorSettings | selectedSliceScale | numeric | 1.06 | Scale factor applied to the selected slice. Min 1.0, Max 1.15. |
| labelSettings | showLabels | bool | true | Toggle data labels on or off. |
| labelSettings | labelContent | enumeration | nameAndPercent | What to show in labels: Name, Value, Percent, Name & Percent, or Name & Value. |
| labelSettings | labelPosition | enumeration | outside | Label placement: Outside (with leader lines), Inside (centroid), or Auto (large slices inside, small outside). |
| labelSettings | labelFontSize | numeric | 11 | Label font size in pixels. Min 7, Max 18. |
| labelSettings | labelFontColor | fill (color) | #334155 | Label text colour. |
| labelSettings | showLeaderLines | bool | true | Draw polyline leader lines from arcs to outside labels. |
| labelSettings | leaderLineColor | fill (color) | #CBD5E1 | Colour of leader lines. |
| labelSettings | minSlicePercentForLabel | numeric | 3 | Minimum slice percentage (0-20) below which a label is hidden. Min 0, Max 20. |
| centreLabelSettings | showCentreLabel | bool | true | Show a label in the donut hole (ignored in pie mode). |
| centreLabelSettings | centreContent | enumeration | total | Centre label source: Total, Custom Text, or Measure (shows selected slice value). |
| centreLabelSettings | centreCustomText | text | (empty) | Static text shown when centreContent is Custom Text. |
| centreLabelSettings | centreFontSize | numeric | 22 | Centre label main text font size. Min 10, Max 48. |
| centreLabelSettings | centreFontColor | fill (color) | #1E293B | Centre label main text colour. |
| centreLabelSettings | centreSubText | text | (empty) | Optional sub-text line beneath the main centre label. |
| centreLabelSettings | centreSubFontSize | numeric | 11 | Centre sub-text font size. Min 7, Max 20. |
| centreLabelSettings | centreSubFontColor | fill (color) | #94A3B8 | Centre sub-text colour. |
| legendSettings | showLegend | bool | true | Toggle the legend. |
| legendSettings | legendPosition | enumeration | bottom | Legend placement: Top, Bottom, Left, or Right. |
| legendSettings | legendFontSize | numeric | 10 | Legend item font size. Min 7, Max 16. |
| legendSettings | legendFontColor | fill (color) | #475569 | Legend item text colour. |
| otherSettings | groupSmallSlices | bool | false | Merge slices below the threshold into a single "Other" slice. |
| otherSettings | otherThresholdPercent | numeric | 3 | Percentage threshold for grouping into Other. Min 1, Max 15. |
| otherSettings | otherColor | fill (color) | #94A3B8 | Fill colour for the Other slice. |
| otherSettings | otherLabel | text | Other | Display label for the grouped Other slice. |
| animationSettings | enableAnimation | bool | true | Enable arc entry and transition animation. |
| animationSettings | animationDuration | numeric | 600 | Animation duration in milliseconds. Min 0, Max 2000. |

## Interactions
- Selection & cross-filtering: Yes. `src/interactions/selection.ts` implements slice click, outer-ring slice click, legend click, and background click (clear). Multi-select is supported via Ctrl/Cmd. Unselected slices dim to 0.3 opacity; selected slices scale by the configured `selectedSliceScale`. All handlers are wired in `src/visual.ts` and the selection manager's `registerOnSelectCallback` is used.
- Tooltips: Yes. Uses the Power BI tooltip service (`host.tooltipService.show`, `move`, `hide`). Tooltips display Category, Value, Percentage, optional Sub-Category (outer ring), user-defined tooltip fields, and "Other" child breakdown when hovering the grouped Other slice.
- Zoom/pan: No (no zoom handler found in codebase).
- Play axis: No (no play axis handler found in codebase).
- Search box: No (no search handler found in codebase).

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
Confirmed via `package.json` scripts (`"start": "pbiviz start --project tsconfig.dev.json"`).

## File layout (high level)
- `src/visual.ts` -- entry point, DOM skeleton, update loop, tooltip and callback wiring
- `src/settings.ts` -- formatting model cards, `buildRenderConfig()` with percent-to-fraction conversion and enum sanitisation
- `src/types.ts` -- domain interfaces (`PieSlice`, `OuterSlice`, `RenderConfig`), literal union constants
- `src/constants.ts` -- colour palettes, layout magic numbers, opacity constants
- `src/model/columns.ts` -- maps data-role names to column indices
- `src/model/parser.ts` -- row aggregation, sorting, "Other" grouping
- `src/render/chart.ts` -- D3 arc rendering, outer ring (sunburst), geometry computation, animation
- `src/render/labels.ts` -- inside/outside data labels, leader lines, collision avoidance, centre label
- `src/render/legend.ts` -- HTML legend rendering in four positions
- `src/interactions/selection.ts` -- selection styling, click handlers
- `src/utils/color.ts` -- palette generation (default, pastel, vivid, monochrome), hex/HSL conversion
- `src/utils/dom.ts` -- DOM helpers (`el`, `clearChildren`, `clamp`)
- `src/utils/format.ts` -- number formatting, percent formatting, abbreviated labels
- `style/visual.less` -- CSS layout, transitions, error overlay

## Known limitations / edge cases
- Non-positive values are silently skipped during parsing (`parser.ts` filters rows where `value <= 0` or is not finite).
- Centre label is not rendered in pie mode (no donut hole) and is hidden when the computed inner radius is less than 20 pixels (`labels.ts`).
- "Other" grouping requires at least two slices below the threshold; if only one slice qualifies, it is left ungrouped (`parser.ts`).
- Outside label collision avoidance uses a simple forward/backward sweep; extreme numbers of small slices may still produce visual overlap.
- Data reduction is capped at 10,000 rows (`capabilities.json` `dataReductionAlgorithm`).

## Versioning and compatibility
- Visual version: 1.0.0.0 (from `pbiviz.json`).
- Power BI Visuals API: 5.3.0 (from `pbiviz.json`).
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL (from `pbiviz.json`): https://github.com

## License
MIT (declared in `package.json`).