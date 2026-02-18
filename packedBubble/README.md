# Packed Bubble Chart

Force-directed packed bubble chart with optional group clustering for Power BI.

## What this visual is for
- Comparing relative sizes of categories where exact axis placement is not required.
- Visualizing part-to-whole relationships across a flat set of items using bubble area.
- Spotting outliers and dominant categories at a glance within a dataset.
- Grouping bubbles into clusters to reveal category-level patterns (e.g. department, region, status).
- Displaying compact, space-efficient summaries when you have many categories and a single measure.

Not a good fit for:
- Time-series or trend analysis -- there is no axis or temporal dimension.
- Precise numeric comparison -- bubble area is harder to judge accurately than bar length or position on a scale.

## Quick start (Power BI Desktop)
1) Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2) Add the visual to a report canvas.
3) Map fields using the "Data roles (field wells)" section below.
4) (Optional) No demo CSV is included in this package. See the "Demo data" section for details.

## Demo data
No demo CSV file was found in this package directory.

If a demo file is added in the future, place it in the package root with a name such as `packedBubbleDemo.csv` and update this section with its columns and suggested field mapping.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| category | Category | Grouping | Yes | Label for each bubble. Rows with null category are skipped by the parser. |
| value | Value | Measure (Numeric) | Yes | Determines bubble size via `scaleSqrt`. Must be a positive number; rows with non-positive or non-finite values are silently skipped. |
| group | Group | Grouping | No | Optional cluster grouping field. When populated and "Split groups" is enabled, bubbles cluster by group. |
| colorField | Color | GroupingOrMeasure | No | Explicit hex colour string (e.g. `#FF5733`) or categorical field. Valid hex values override group palette and default colour. |
| tooltipFields | Tooltips | GroupingOrMeasure | No | Additional fields shown in the Power BI tooltip. Supports multiple fields (unbounded). |

Required status for `category` and `value` is enforced by `hasRequiredColumns()` in `src/model/columns.ts`, which guards the render path in `src/visual.ts`.

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| bubbleSettings | minRadius | numeric | 12 | Minimum bubble radius in pixels. Min 4, Max 40. |
| bubbleSettings | maxRadius | numeric | 80 | Maximum bubble radius in pixels. Min 20, Max 200. |
| bubbleSettings | bubbleOpacity | numeric | 85 | Bubble fill opacity as a percentage (converted to 0-1 internally). Min 0, Max 100. |
| bubbleSettings | bubbleBorderWidth | numeric | 1.5 | Stroke width around each bubble. Min 0, Max 5. |
| bubbleSettings | bubbleBorderColor | fill (color) | #FFFFFF | Stroke colour for bubble borders. |
| bubbleSettings | bubblePadding | numeric | 2 | Extra padding between bubbles during radius computation. Min 0, Max 10. |
| forceSettings | simulationStrength | numeric | 0.3 | Strength of the centering force in the d3-force simulation. Min 0.01, Max 1.0. |
| forceSettings | collisionPadding | numeric | 2 | Additional padding added to collision radius. Min 0, Max 10. |
| forceSettings | splitGroups | bool | false | When true and a Group field is provided, bubbles cluster into separate groups. |
| forceSettings | groupPadding | numeric | 40 | Spacing factor between group clusters. Min 10, Max 100. |
| labelSettings | showLabels | bool | true | Toggle bubble labels on or off. |
| labelSettings | labelContent | enumeration | name | What to display inside bubbles: "Name", "Value", or "Name & Value". |
| labelSettings | labelFontSize | numeric | 10 | Font size for bubble labels in pixels. Min 7, Max 16. |
| labelSettings | labelFontColor | fill (color) | #FFFFFF | Font colour for bubble labels. |
| labelSettings | minRadiusForLabel | numeric | 20 | Bubbles smaller than this radius will not show a label. Min 8, Max 60. |
| labelSettings | wrapLabels | bool | true | Word-wrap label text to fit inside the bubble circle. |
| colorSettings | colorByGroup | bool | true | Assign colours from the built-in 15-colour palette based on group membership. |
| colorSettings | defaultBubbleColor | fill (color) | #3B82F6 | Fallback colour when no group or explicit colour is provided. |
| colorSettings | selectedBubbleColor | fill (color) | #2563EB | Colour used to identify selected bubbles (referenced in settings but selection styling uses opacity dimming in code). |
| groupLabelSettings | showGroupLabels | bool | true | Show a text label above each group cluster (only visible when splitGroups is on). |
| groupLabelSettings | groupLabelFontSize | numeric | 14 | Font size for group labels in pixels. Min 10, Max 24. |
| groupLabelSettings | groupLabelFontColor | fill (color) | #64748B | Font colour for group labels. |
| legendSettings | showLegend | bool | true | Show or hide the colour legend (only rendered when groups exist). |
| legendSettings | legendPosition | enumeration | top | Legend placement: "Top", "Bottom", or "Right". |
| legendSettings | legendFontSize | numeric | 10 | Font size for legend text in pixels. Min 7, Max 16. |
| legendSettings | legendFontColor | fill (color) | #475569 | Font colour for legend text. |

## Interactions
- Selection & cross-filtering: Yes. `src/interactions/selection.ts` implements `handleBubbleClick` (with Ctrl/Cmd multi-select) and `handleBackgroundClick` (clear). Selection dims unselected bubbles and their labels to 0.25 opacity. Wired in `src/visual.ts` via the `ChartCallbacks` object and `selectionManager.registerOnSelectCallback`.
- Tooltips: Yes. Uses the Power BI tooltip service (`ITooltipService.show`, `move`, `hide`). Tooltip displays Category, Value (locale-formatted), Group (if present), and any additional tooltip fields.
- Zoom/pan: No (no zoom handler found in `src/interactions/` or `src/visual.ts`).
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
pbiviz package
```
Output appears in `dist/`.

Dev server:
```bash
pbiviz start
```
Confirmed via `package.json` scripts (`"start": "pbiviz start --project tsconfig.dev.json"`).

## File layout (high level)
- `src/visual.ts` -- entry point; constructor, update loop, tooltip handling, error overlay
- `src/settings.ts` -- formatting model cards and `buildRenderConfig()`
- `src/types.ts` -- shared interfaces (`BubbleNode`, `RenderConfig`, `ChartCallbacks`, etc.)
- `src/constants.ts` -- colour palettes, CSS prefix, simulation constants, error messages
- `src/model/columns.ts` -- column index resolution from DataViewTable
- `src/model/parser.ts` -- row parsing into `BubbleNode` domain objects
- `src/layout/simulation.ts` -- d3-force simulation setup, restart, stop, radii computation
- `src/render/chart.ts` -- SVG scaffold, bubble rendering, tick updates, background click binding
- `src/render/labels.ts` -- bubble label and group label rendering with word-wrap
- `src/render/legend.ts` -- HTML legend rendering with colour swatches
- `src/interactions/selection.ts` -- click selection, multi-select, opacity dimming
- `src/utils/color.ts` -- hex validation, colour resolution (explicit > group palette > default)
- `src/utils/dom.ts` -- DOM element factory, `clearChildren`, `clamp`
- `src/utils/format.ts` -- compact number formatting (K/M/B) and locale-aware full formatting
- `style/visual.less` -- all visual styles

## Known limitations / edge cases
- Rows with non-positive or non-finite values are silently skipped (`src/model/parser.ts`). Users will not see an error for these rows; they simply will not appear.
- Rows with a null category are silently skipped (`src/model/parser.ts`).
- Data reduction is capped at 10,000 rows (`capabilities.json` `dataReductionAlgorithm.top.count`).
- The `selectedBubbleColor` format property is defined in settings but the actual selection styling in `src/interactions/selection.ts` uses opacity dimming rather than recolouring.
- Group labels are only displayed when `splitGroups` is enabled and more than one group exists (`src/render/labels.ts`).

## Versioning and compatibility
- Version: 1.0.0.0 (from `pbiviz.json`)
- Power BI Visuals API: 5.3.0 (from `pbiviz.json` `apiVersion`)
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL (from `pbiviz.json`): https://github.com

## License
MIT (from `package.json`).