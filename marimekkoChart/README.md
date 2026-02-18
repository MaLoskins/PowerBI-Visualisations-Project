# Marimekko Chart

A Marimekko (Mekko) chart where column width and segment height both encode data, showing market share and product mix simultaneously.

## What this visual is for
- Comparing part-to-whole relationships where both the category size and its internal composition matter (e.g., revenue by region broken down by product line).
- Visualizing market share across segments where column width represents total size and stacked segments show the internal split.
- Answering questions like "Which region contributes the most overall, and what is its product mix?" in a single view.
- Identifying disproportionate segments across categories of different sizes.
- Spotting patterns in two-dimensional categorical data (e.g., channel vs. product contribution).

Not a good fit for:
- Time-series or trend analysis; use a line or area chart instead.
- Data with a single category dimension and no segment breakdown; a standard bar chart is simpler and clearer.

## Quick start (Power BI Desktop)
1) Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2) Add the visual to a report canvas.
3) Map fields using the "Data roles (field wells)" section below.
4) (Optional) Load demo data and apply the suggested demo mapping if a demo CSV is available.

## Demo data
No demo CSV file was found in this package directory. If a demo file is added later, place it in the package root with a name such as `marimekkoChartDemo.csv` and update this section with its columns and suggested field mapping.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| xCategory | Column Category | Grouping | Yes | Category for columns (e.g., Region). Rows with empty values are skipped. |
| segmentCategory | Segment Category | Grouping | Yes | Category for stacked segments (e.g., Product). Rows with empty values are skipped. |
| value | Value | Measure (Numeric) | Yes | Size measure for column width and segment height. NaN values are skipped; negative values are converted to absolute values and rendered with a hatch overlay. |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Additional fields displayed in tooltips on hover. |

Required roles are enforced in `src/model/columns.ts`: if any of `xCategory`, `segmentCategory`, or `value` is missing, the visual displays an error message and does not render.

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| chartSettings | columnGap | numeric | 2 | Gap between columns in pixels. Min 0, Max 10. |
| chartSettings | segmentGap | numeric | 1 | Gap between stacked segments in pixels. Min 0, Max 4. |
| chartSettings | cornerRadius | numeric | 0 | Corner radius of segment rectangles in pixels. Min 0, Max 8. |
| chartSettings | showPercentages | bool | true | Whether percentage labels are eligible to display on segments. |
| chartSettings | percentThreshold | numeric | 5 | Minimum percent-of-column a segment must represent for its label to render. Min 1, Max 20. |
| axisSettings | showXAxis | bool | true | Show or hide X-axis category labels below columns. |
| axisSettings | xAxisFontSize | numeric | 10 | Font size for X-axis labels in pixels. Min 7, Max 16. |
| axisSettings | xAxisFontColor | fill | #475569 | Font color for X-axis labels. |
| axisSettings | xLabelRotation | enumeration | 0 | Rotation angle for X-axis labels. Values: 0, 45, 90 degrees. |
| axisSettings | showYAxis | bool | true | Show or hide Y-axis percentage ticks. |
| axisSettings | yAxisFontSize | numeric | 10 | Font size for Y-axis tick labels in pixels. Min 7, Max 16. |
| axisSettings | yAxisFontColor | fill | #64748B | Font color for Y-axis tick labels. |
| axisSettings | showGridlines | bool | true | Show or hide horizontal gridlines behind segments. |
| axisSettings | gridlineColor | fill | #F1F5F9 | Color of horizontal gridlines. |
| axisSettings | showWidthLabels | bool | false | Show column total values above each column. |
| colorSettings | colorPalette | enumeration | default | Segment color palette. Values: default, pastel, vivid. |
| colorSettings | selectedColor | fill | #2563EB | Stroke color applied to selected segments. |
| colorSettings | segmentBorderColor | fill | #FFFFFF | Border color around each segment rectangle. |
| colorSettings | segmentBorderWidth | numeric | 1 | Border width around each segment rectangle in pixels. Min 0, Max 3. |
| labelSettings | showSegmentLabels | bool | true | Show or hide labels inside segment rectangles. |
| labelSettings | segmentLabelContent | enumeration | nameAndPercent | Content shown in segment labels. Values: name, percent, value, nameAndPercent. |
| labelSettings | segmentLabelFontSize | numeric | 9 | Font size for segment labels in pixels. Min 7, Max 14. |
| labelSettings | segmentLabelFontColor | fill | #FFFFFF | Font color for segment labels. |
| legendSettings | showLegend | bool | true | Show or hide the segment category legend. |
| legendSettings | legendPosition | enumeration | top | Position of the legend. Values: top, bottom, right. |
| legendSettings | legendFontSize | numeric | 10 | Font size for legend labels in pixels. Min 7, Max 16. |
| legendSettings | legendFontColor | fill | #475569 | Font color for legend labels. |

## Interactions
- Selection & cross-filtering: Yes. `src/interactions/selection.ts` provides `applySelectionStyles` and `getSelectedRowSet`, both imported and wired in `src/visual.ts` via `handleSegmentClick` and `handleBackgroundClick`. Supports multi-select with Ctrl/Cmd+Click. Unselected segments dim to 0.25 opacity; selected segments receive a highlight stroke.
- Tooltips: Yes. Uses the Power BI tooltip service (`host.tooltipService`) in `src/visual.ts` (`attachTooltips` method). Tooltips display column name, segment name, value, percent-of-column, percent-of-total, a warning for negative original values, and any extra fields from the `tooltipFields` role.
- Zoom/pan: No (no zoom handler found in `src/interactions/` or `src/visual.ts`).
- Play axis: No (no play-axis handler found).
- Search box: No (no search UI found).

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
This runs `pbiviz start --project tsconfig.dev.json` as defined in `package.json` scripts.

## File layout (high level)
- `src/visual.ts` -- entry point and orchestrator (constructor, update loop, layout, tooltip wiring)
- `src/model/columns.ts` -- data-role to column index mapping
- `src/model/parser.ts` -- parses DataViewTable rows into MekkoColumn/MekkoSegment structures
- `src/render/chart.ts` -- layout pass (column/segment pixel positions) and segment rect rendering
- `src/render/axes.ts` -- X-axis, Y-axis, gridlines, width labels
- `src/render/labels.ts` -- segment data labels
- `src/render/legend.ts` -- color legend for segment categories
- `src/interactions/selection.ts` -- selection highlight and dim logic
- `src/settings.ts` -- formatting model cards and `buildRenderConfig()` converter
- `src/types.ts` -- domain interfaces, literal unions, RenderConfig definition
- `src/constants.ts` -- color palettes, layout constants, shared config values
- `src/utils/color.ts` -- palette cycling and color map builder
- `src/utils/dom.ts` -- DOM element factories, text measurement, truncation
- `src/utils/format.ts` -- number, percent, compact formatting and label text builder
- `style/visual.less` -- visual styles

## Known limitations / edge cases
- Negative values are converted to absolute values for sizing and rendered with a diagonal hatch overlay pattern. A tooltip warning is shown for negative original values (see `src/model/parser.ts` and `src/render/chart.ts`).
- Rows where `xCategory` or `segmentCategory` is empty, or where `value` is NaN, are silently skipped during parsing (see `src/model/parser.ts`).
- Data reduction is capped at 10,000 rows via `dataReductionAlgorithm` in `capabilities.json`.
- Segment labels are hidden when the segment rectangle is too small (below `fontSize * 2` pixels in height or below the `percentThreshold` fraction). Very narrow columns may truncate or hide all labels.
- A grand total of zero is guarded by setting it to 1 to avoid division by zero (see `src/model/parser.ts`).

## Versioning and compatibility
- Version: 1.0.0.0 (from `pbiviz.json`).
- Power BI visuals API: 5.3.0 (from `pbiviz.json`).
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL (from `pbiviz.json`): https://github.com

## License
MIT (from `package.json`).