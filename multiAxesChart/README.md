# Multi-Axes Combo Chart

A combo chart supporting up to six measures rendered as bar, line, or area series across up to three independent Y-axes (left primary, left secondary, and right).

## What this visual is for
- Comparing measures that use different units or scales on the same category axis (e.g. revenue in dollars alongside unit count).
- Overlaying trend lines on top of bar totals to highlight directional movement.
- Displaying up to six KPIs in a single visual with independent axis scaling.
- Mixing chart types (bar, line, area) to visually separate actuals, targets, and forecasts.

Not a good fit for:
- Data with a legend-driven dynamic series (this visual uses a fixed set of up to six explicit measure roles, not a series/legend field).
- Scatter or bubble plots requiring X/Y numeric axes (X axis is categorical only).

## Quick start (Power BI Desktop)
1. Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2. Add the visual to a report canvas.
3. Map fields using the "Data roles (field wells)" section below.
4. (Optional) Load demo data from `multiAxesChartDemo.csv` and apply the suggested demo mapping.

## Demo data
Demo file: No demo CSV file was found in the provided codebase. If a `multiAxesChartDemo.csv` exists in the directory, use its header row to determine columns and mapping.

Demo columns:
- Not available (demo file not provided in codebase extraction).

Suggested field mapping for demo:
- Not available.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| xCategory | X Axis (Category) | Grouping | Yes | Parser returns null and visual shows error if categories are missing (see `columns.ts` and `visual.ts` guard). |
| measure1 | Measure 1 | Measure (Numeric) | Yes | Parser returns null if measure1 is not bound (see `columns.ts`: `if (measureIndices[0] === null) return null`). |
| measure2 | Measure 2 | Measure (Numeric) | No | Optional additional measure. |
| measure3 | Measure 3 | Measure (Numeric) | No | Optional additional measure. |
| measure4 | Measure 4 | Measure (Numeric) | No | Optional additional measure. |
| measure5 | Measure 5 | Measure (Numeric) | No | Optional additional measure. |
| measure6 | Measure 6 | Measure (Numeric) | No | Optional additional measure. |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Extra fields surfaced in the Power BI tooltip. Supports multiple fields (unbounded). |

Multi-field roles: Each measure role accepts a single field. The `tooltipFields` role supports multiple fields (unbounded, added to tooltip via `tooltipIndices` array in `columns.ts`).

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

Series cards 1-6 share an identical schema. Defaults shown below use Series 1 values; per-series differences are noted.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| series1Settings | chartType | enumeration (bar, line, area, none) | bar | Chart type for this series. Defaults: S1=bar, S2=line, S3=area, S4=bar, S5=line, S6=area. |
| series1Settings | axis | enumeration (leftPrimary, leftSecondary, right) | leftPrimary | Which Y-axis this series is bound to. |
| series1Settings | color | fill (color) | #3B82F6 | Series color. Defaults: S1=#3B82F6, S2=#F59E0B, S3=#10B981, S4=#8B5CF6, S5=#EF4444, S6=#06B6D4. |
| series1Settings | lineWidth | numeric | 2 | Stroke width for line/area series. Min 1, Max 6. |
| series1Settings | lineStyle | enumeration (solid, dashed, dotted) | solid | Dash pattern for line/area series. |
| series1Settings | dotRadius | numeric | 0 | Radius of data-point dots on line/area series. Min 0, Max 6. |
| series1Settings | areaOpacity | numeric | 20 | Area fill opacity as a percentage. Min 0, Max 100. Converted to 0-1 at render time. |
| series1Settings | barCornerRadius | numeric | 2 | Corner radius for bar tops. Min 0, Max 10. |
| xAxisSettings | showXAxis | bool | true | Toggle X-axis visibility. |
| xAxisSettings | xAxisFontSize | numeric | 10 | Font size for X-axis labels. Min 7, Max 16. |
| xAxisSettings | xAxisFontColor | fill (color) | #64748B | Font color for X-axis labels. |
| xAxisSettings | xLabelRotation | enumeration (0, 45, 90) | 0 | Rotation angle of X-axis tick labels. |
| xAxisSettings | showXGridlines | bool | false | Toggle vertical gridlines. |
| xAxisSettings | gridlineColor | fill (color) | #F1F5F9 | Color of vertical gridlines. |
| yAxisLeftSettings | showAxis | bool | true | Toggle left primary Y-axis visibility. |
| yAxisLeftSettings | axisLabel | text | "" (empty) | Rotated axis title text. |
| yAxisLeftSettings | axisFontSize | numeric | 10 | Font size for Y-axis tick labels. Min 7, Max 16. |
| yAxisLeftSettings | axisFontColor | fill (color) | #64748B | Font color for Y-axis tick labels. |
| yAxisLeftSettings | axisMin | numeric | null (auto) | Manual axis minimum; auto-calculated if empty. |
| yAxisLeftSettings | axisMax | numeric | null (auto) | Manual axis maximum; auto-calculated if empty. |
| yAxisLeftSettings | showGridlines | bool | true | Toggle horizontal gridlines for this axis. |
| yAxisLeftSecondarySettings | showAxis | bool | true | Toggle left secondary Y-axis visibility. |
| yAxisLeftSecondarySettings | axisLabel | text | "" (empty) | Rotated axis title text. |
| yAxisLeftSecondarySettings | axisFontSize | numeric | 10 | Font size for Y-axis tick labels. Min 7, Max 16. |
| yAxisLeftSecondarySettings | axisFontColor | fill (color) | #64748B | Font color for Y-axis tick labels. |
| yAxisLeftSecondarySettings | axisMin | numeric | null (auto) | Manual axis minimum. |
| yAxisLeftSecondarySettings | axisMax | numeric | null (auto) | Manual axis maximum. |
| yAxisLeftSecondarySettings | showGridlines | bool | true | Toggle horizontal gridlines. |
| yAxisRightSettings | showAxis | bool | true | Toggle right Y-axis visibility. |
| yAxisRightSettings | axisLabel | text | "" (empty) | Rotated axis title text. |
| yAxisRightSettings | axisFontSize | numeric | 10 | Font size for Y-axis tick labels. Min 7, Max 16. |
| yAxisRightSettings | axisFontColor | fill (color) | #64748B | Font color for Y-axis tick labels. |
| yAxisRightSettings | axisMin | numeric | null (auto) | Manual axis minimum. |
| yAxisRightSettings | axisMax | numeric | null (auto) | Manual axis maximum. |
| yAxisRightSettings | showGridlines | bool | true | Toggle horizontal gridlines. |
| legendSettings | showLegend | bool | true | Toggle legend visibility. |
| legendSettings | legendPosition | enumeration (top, bottom) | top | Legend placement relative to the chart area. |
| legendSettings | legendFontSize | numeric | 10 | Legend label font size. Min 7, Max 16. |
| legendSettings | legendFontColor | fill (color) | #475569 | Legend label font color. |
| labelSettings | showDataLabels | bool | false | Toggle data labels above bars and data points. |
| labelSettings | dataLabelFontSize | numeric | 9 | Data label font size. Min 7, Max 14. |
| labelSettings | dataLabelFontColor | fill (color) | #475569 | Data label font color. |
| colorSettings | selectedColor | fill (color) | #2563EB | Highlight stroke color applied to selected bars and dots. |

## Interactions
- Selection & cross-filtering: Yes. `src/interactions/selection.ts` is imported and wired in `src/visual.ts`. Clicking a bar or dot selects the category via `ISelectionManager.select()`. Multi-select is supported with Ctrl/Cmd+click. Clicking the chart background clears the selection. Unselected elements are dimmed to 0.25 opacity; selected bars and dots receive a highlight stroke using the `selectedColor` setting.
- Tooltips: Yes. Uses the Power BI tooltip service (`ITooltipService`). Tooltips display the category label, all active measure values, and any extra tooltip fields. Tooltip roles are declared in `capabilities.json` (`"tooltips"` section with `"supportedTypes": { "default": true, "canvas": true }`).
- Zoom/pan: No (no zoom or pan handler found in codebase).
- Play axis: No (no play-axis module found in codebase).
- Search box: No (no search UI found in codebase).

## Build and run (developer)
From this visual's directory:

Install dependencies:
```bash
npm install
```

Note: No `package-lock.json` was found in the provided codebase extraction, so `npm install` is used rather than `npm ci`.

Build/package:
```bash
npx pbiviz package
```

Output appears in `dist/`.

Dev server:
```bash
npx pbiviz start --project tsconfig.dev.json
```

Confirmed via the `"start"` script in `package.json`.

Lint:
```bash
npm run lint
```

## File layout (high level)
- `src/visual.ts` -- entry point; DOM construction, update loop, selection and tooltip wiring
- `src/model/columns.ts` -- maps data roles to value column indices
- `src/model/parser.ts` -- transforms categorical dataView into `ParsedData` domain model
- `src/render/chart.ts` -- scale computation and orchestration of all sub-renderers
- `src/render/bars.ts` -- grouped bar rendering with rounded corners
- `src/render/lines.ts` -- line and area rendering with monotone-X curve interpolation
- `src/render/axes.ts` -- X, Y-left, Y-left-secondary, Y-right axis ticks, labels, gridlines
- `src/render/legend.ts` -- legend with chart-type-specific icons
- `src/render/labels.ts` -- data labels above bars and at line/area data points
- `src/interactions/selection.ts` -- selection highlight/dimming styles
- `src/layout/margins.ts` -- computes chart margins and plot area dimensions
- `src/settings.ts` -- formatting model and `buildRenderConfig` bridge
- `src/types.ts` -- type definitions, literal unions, domain interfaces
- `src/constants.ts` -- layout constants, color palettes, dash patterns
- `src/utils/color.ts` -- color utilities (palette lookup, hex-to-rgba)
- `src/utils/format.ts` -- axis and data label number formatting (K/M/B abbreviation)
- `src/utils/dom.ts` -- DOM helper utilities
- `style/visual.less` -- styling

## Known limitations / edge cases
- X-axis labels are truncated to 20 characters (see `truncateLabel` in `src/render/axes.ts`).
- Legend text width is estimated by character count (`length * fontSize * 0.6`), not measured; long measure names may cause overlap (see `src/render/legend.ts`).
- The chart enforces a minimum plot area of 40x40 pixels (`MIN_CHART_SIZE` in `src/constants.ts`); very small viewports will clamp to this size.
- The data reduction algorithm caps categories at 10,000 rows (see `capabilities.json` `dataReductionAlgorithm`).
- Selection identity comparison uses `JSON.stringify` on `ISelectionId` objects (see `applySelection` in `src/visual.ts`), which may be fragile if the serialization format changes.
- Null measure values are skipped (not plotted); no interpolation is applied for gaps in line/area series.

## Versioning and compatibility
- Version: 1.0.0.0 (from `pbiviz.json`)
- Power BI visuals API: 5.3.0 (from `pbiviz.json` `apiVersion`)
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL in `pbiviz.json`: https://github.com (placeholder; no specific repository URL provided).

## License
MIT (as declared in `package.json`).

---
This visual is part of the POWERBI monorepo visual library.