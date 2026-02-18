# Advanced Gauge

A highly configurable radial gauge for Power BI displaying a single KPI value with qualitative ranges, animated needle, target marker, and rich data labels.

## What this visual is for
- Displaying a single KPI value against a defined min/max scale (e.g., revenue vs. target, completion percentage, utilisation rate).
- Showing performance within qualitative colour-coded ranges (e.g., good / warning / critical bands).
- Providing at-a-glance target comparison with a dedicated target marker and optional label.
- Communicating progress toward a goal where a radial representation is more intuitive than a bar.

Not a good fit for:
- Displaying multiple independent values side by side (this gauge renders a single row of data).
- Time-series or trend analysis; use a line or area chart instead.

## Quick start (Power BI Desktop)
1. Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2. Add the visual to a report canvas.
3. Map fields using the "Data roles (field wells)" section below. At minimum, add a measure to the **Value** field well.
4. (Optional) Add measures to **Target**, **Min Value**, **Max Value**, and **Range 1-3 Max** to see the full feature set.

## Demo data
No demo CSV file was found in the package directory. To test the visual, create a table with at least the columns `Value`, `Target`, `Min`, and `Max` containing single numeric values.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| value | Value | Measure (Numeric) | Yes | Parser returns null if this role is unmapped or the value is non-numeric. |
| target | Target | Measure (Numeric) | No | Rendered as a marker line on the arc when present. |
| minValue | Min Value | Measure (Numeric) | No | Defaults to 0 when unmapped. |
| maxValue | Max Value | Measure (Numeric) | No | Auto-calculated from value/target when unmapped. If maxValue <= minValue, it is auto-corrected. |
| range1Max | Range 1 Max | Measure (Numeric) | No | Upper boundary of the first qualitative range band. |
| range2Max | Range 2 Max | Measure (Numeric) | No | Upper boundary of the second qualitative range band. |
| range3Max | Range 3 Max | Measure (Numeric) | No | Upper boundary of the third qualitative range band. |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Supports multiple fields. Additional fields shown in the Power BI tooltip on hover. |

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| gaugeSettings | startAngle | numeric | -135 | Start angle of the arc in degrees. Min -180, Max 0. |
| gaugeSettings | endAngle | numeric | 135 | End angle of the arc in degrees. Min 0, Max 180. |
| gaugeSettings | arcThickness | numeric | 28 | Thickness of the arc band in pixels. Min 8, Max 60. |
| gaugeSettings | arcCornerRadius | numeric | 4 | Corner radius applied to arc segments. Min 0, Max 20. |
| gaugeSettings | backgroundArcColor | fill (color) | #E2E8F0 | Colour of the background arc behind the value/range arcs. |
| gaugeSettings | backgroundArcOpacity | numeric | 30 | Opacity of the background arc as a percentage. Min 0, Max 100. |
| needleSettings | showNeedle | bool | true | Toggle visibility of the needle indicator. |
| needleSettings | needleColor | fill (color) | #334155 | Colour of the needle polygon. |
| needleSettings | needleLength | numeric | 90 | Needle length as a percentage of outer radius. Min 0, Max 100. |
| needleSettings | needleWidth | numeric | 3 | Half-base width of the needle polygon in pixels. Min 1, Max 8. |
| needleSettings | pivotRadius | numeric | 6 | Radius of the pivot circle at the needle base. Min 2, Max 16. |
| needleSettings | pivotColor | fill (color) | #334155 | Colour of the pivot circle. |
| needleSettings | animationDuration | numeric | 800 | Needle sweep animation duration in milliseconds. Min 0, Max 2000. |
| rangeSettings | range1Color | fill (color) | #10B981 | Colour of the first qualitative range band. |
| rangeSettings | range2Color | fill (color) | #F59E0B | Colour of the second qualitative range band. |
| rangeSettings | range3Color | fill (color) | #EF4444 | Colour of the third qualitative range band. |
| rangeSettings | rangeBeyondColor | fill (color) | #94A3B8 | Colour of the arc area beyond the last defined range. |
| targetSettings | showTarget | bool | true | Toggle visibility of the target marker line. |
| targetSettings | targetMarkerColor | fill (color) | #1E293B | Colour of the target marker line. |
| targetSettings | targetMarkerWidth | numeric | 3 | Stroke width of the target marker line. Min 1, Max 8. |
| targetSettings | targetMarkerLength | numeric | 100 | Marker length as a percentage of arc thickness. Min 0, Max 100. |
| targetSettings | showTargetLabel | bool | false | Toggle visibility of the numeric label next to the target marker. |
| targetSettings | targetLabelFontSize | numeric | 10 | Font size of the target label in pixels. Min 7, Max 18. |
| labelSettings | showValueLabel | bool | true | Toggle visibility of the central value label. |
| labelSettings | valueFontSize | numeric | 28 | Font size of the central value label in pixels. Min 12, Max 72. |
| labelSettings | valueFontColor | fill (color) | #1E293B | Font colour of the central value label. |
| labelSettings | valueFormat | enumeration | auto | Display format for the value: auto, number, percent, or currency. |
| labelSettings | showMinMaxLabels | bool | true | Toggle visibility of the min and max labels at arc endpoints. |
| labelSettings | minMaxFontSize | numeric | 10 | Font size of the min/max labels in pixels. Min 7, Max 16. |
| labelSettings | minMaxFontColor | fill (color) | #94A3B8 | Font colour of the min/max labels. |
| labelSettings | showTitle | bool | false | Toggle visibility of the title text above the gauge. |
| labelSettings | titleText | text | "" | Custom title string displayed above the gauge. |
| labelSettings | titleFontSize | numeric | 14 | Font size of the title in pixels. Min 8, Max 28. |
| labelSettings | titleFontColor | fill (color) | #334155 | Font colour of the title. |
| colorSettings | defaultBarColor | fill (color) | #3B82F6 | Colour of the single value arc when no qualitative ranges are defined. |
| colorSettings | selectedBarColor | fill (color) | #2563EB | Reserved colour for the selected state of the value arc. |
| tickSettings | showTicks | bool | false | Toggle visibility of tick marks around the arc. |
| tickSettings | tickCount | numeric | 5 | Number of tick intervals (tick marks rendered = tickCount + 1). Min 2, Max 20. |
| tickSettings | tickLength | numeric | 8 | Length of each tick mark in pixels. Min 3, Max 20. |
| tickSettings | tickWidth | numeric | 1 | Stroke width of each tick mark. Min 0.5, Max 4. |
| tickSettings | tickColor | fill (color) | #94A3B8 | Colour of tick marks. |
| tickSettings | showTickLabels | bool | false | Toggle visibility of numeric labels beside tick marks. |
| tickSettings | tickLabelFontSize | numeric | 9 | Font size of tick labels in pixels. Min 7, Max 14. |
| tickSettings | tickLabelFontColor | fill (color) | #64748B | Font colour of tick labels. |

## Interactions
- Selection & cross-filtering: Yes. `src/interactions/selection.ts` exports `applySelectionStyles` and `handleGaugeClick`, both imported and wired in `src/visual.ts`. Clicking the gauge selects its data point; Ctrl/Cmd+click supports multi-select. Clicking the background clears the selection. Unselected gauges dim to 35% opacity.
- Tooltips: Yes. Uses the Power BI tooltip service (`this.host.tooltipService.show` / `hide`) confirmed in `src/visual.ts`. Displays Value, Target (if present), Min, Max, and any additional tooltip fields on hover.
- Zoom/pan: No (no zoom handler found in `src/interactions/` or `src/visual.ts`).
- Play axis: No (no play axis handler found).
- Search: No (no search handler found).

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
Output `.pbiviz` file appears in `dist/`.

Dev server:
```bash
pbiviz start
```
Confirmed via `package.json` scripts (`"start": "pbiviz start"`).

## File layout (high level)
- `src/visual.ts` -- entry point; DOM scaffolding, update loop, tooltip wiring
- `src/model/columns.ts` -- resolves data-role names to column indices
- `src/model/parser.ts` -- parses first DataViewTable row into GaugeData
- `src/render/gauge.ts` -- arc segments, needle, ticks, target marker (d3-based)
- `src/render/labels.ts` -- value label, min/max labels, title
- `src/interactions/selection.ts` -- selection styles and click handling
- `src/settings.ts` -- formatting model cards and `buildRenderConfig()`
- `src/types.ts` -- domain interfaces, RenderConfig, literal unions
- `src/constants.ts` -- palette tokens, angle defaults, CSS prefix, error strings
- `src/utils/color.ts` -- hex validation, hex-to-rgba conversion
- `src/utils/dom.ts` -- element factories, clamp helper
- `src/utils/format.ts` -- number/percent/currency formatting, min/max abbreviation
- `style/visual.less` -- all visual CSS classes

## Known limitations / edge cases
- Only the first row of the DataViewTable is used; additional rows are ignored (`src/model/parser.ts`, line: `const row = rows[0]`).
- If `maxValue <= minValue`, the parser auto-corrects maxValue to `minValue + abs(value) * 1.5 + 1` (guard clause in `src/model/parser.ts`).
- Non-finite or null values in the Value role cause the visual to show the "Required field missing" error overlay (`src/model/parser.ts`, `toNumber` helper).
- The `selectedBarColor` property is defined in settings but is not applied during rendering; the selection effect uses opacity dimming only (`src/interactions/selection.ts`).
- `assets/icon.png` is referenced in `pbiviz.json` but was not present in the provided directory listing.

## Versioning and compatibility
- Version: 1.0.0.0 (from `pbiviz.json`)
- Power BI Visuals API: 5.3.0 (from `pbiviz.json`)
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- `pbiviz.json` lists `supportUrl` as `https://github.com` (appears to be a placeholder).
- For issues, open an issue in the repository if one is configured.

## License
MIT (from `package.json`).

This visual is part of the POWERBI monorepo visual library.