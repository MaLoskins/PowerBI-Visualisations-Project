# Advanced Trellis

Small-multiples chart with bar, line, area, and lollipop chart types in a responsive trellis grid.

## What this visual is for
- Comparing a metric across many categories side-by-side in a small-multiples layout.
- Spotting trends or outliers across panels when a single chart would be too crowded.
- Switching between bar, line, area, and lollipop chart types without rebuilding the report page.
- Breaking down a measure by two grouping dimensions (trellis field and category) with an optional series split.

Not a good fit for:
- Showing a single chart without a trellis/split dimension; use a standard bar or line chart instead.
- Displaying hierarchical or tree-structured data; consider a hierarchy visual or decomposition tree.

## Quick start (Power BI Desktop)
1. Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2. Add the visual to a report canvas.
3. Map fields using the "Data roles (field wells)" section below.
4. (Optional) Load demo data from the demo CSV and apply the suggested demo mapping (see "Demo data").

## Demo data
No demo CSV file was identified in the provided package directory. If a demo file is added later (e.g., `advancedTrellisDemo.csv`), list its columns here and provide a suggested field mapping.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| trellisBy | Trellis By | Grouping | Yes | Field used to split data into separate panels. |
| category | Category | Grouping | Yes | X-axis category within each panel. |
| value | Value | Measure | Yes | Y-axis numeric value. Non-finite values are skipped. |
| series | Series | Grouping | No | Colour/series split within each panel. |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Additional fields shown in tooltips. Supports multiple fields. |

Required roles are enforced by the `hasRequiredColumns()` guard in `src/model/columns.ts`: the visual will not render unless `trellisBy`, `category`, and `value` are all mapped.

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| layoutSettings | columns | numeric | 0 | Number of grid columns (0 = auto-fit based on viewport width). Min 0, Max 10. |
| layoutSettings | panelPadding | numeric | 8 | Padding in pixels between panels. Min 0, Max 24. |
| layoutSettings | panelBorderWidth | numeric | 1 | Border width in pixels around each panel. Min 0, Max 4. |
| layoutSettings | panelBorderColor | fill (color) | #E2E8F0 | Border colour for each panel. |
| layoutSettings | panelBackground | fill (color) | #FFFFFF | Background colour for each panel. |
| layoutSettings | panelCornerRadius | numeric | 4 | Corner radius in pixels for panel containers. Min 0, Max 16. |
| layoutSettings | panelMinWidth | numeric | 160 | Minimum panel width in pixels. Min 80, Max 400. |
| layoutSettings | panelMinHeight | numeric | 120 | Minimum panel height in pixels. Min 60, Max 300. |
| chartSettings | chartType | enumeration | bar | Chart type rendered in each panel (Bar, Line, Area, Lollipop). |
| chartSettings | barCornerRadius | numeric | 2 | Corner radius for bar rectangles. Min 0, Max 10. |
| chartSettings | lineWidth | numeric | 2 | Stroke width for line and area-line paths. Min 1, Max 6. |
| chartSettings | lineSmoothing | bool | false | When true, lines and areas use monotone-X curve interpolation. |
| chartSettings | dotRadius | numeric | 3 | Radius of dots on line, area, and lollipop charts. Min 0, Max 8. |
| chartSettings | areaOpacity | numeric | 20 | Area fill opacity as a percentage (converted to 0-1 fraction at render time). Min 0, Max 100. |
| axisSettings | sharedYScale | bool | true | When true, all panels share the same Y-axis domain. |
| axisSettings | showXAxis | bool | true | Show or hide the X axis in each panel. |
| axisSettings | showYAxis | bool | true | Show or hide the Y axis in each panel. |
| axisSettings | showXGridlines | bool | false | Show vertical gridlines at each category position. |
| axisSettings | showYGridlines | bool | true | Show horizontal gridlines along Y-axis ticks. |
| axisSettings | axisFontSize | numeric | 9 | Font size in pixels for axis tick labels. Min 7, Max 14. |
| axisSettings | axisFontColor | fill (color) | #64748B | Font colour for axis tick labels. |
| axisSettings | gridlineColor | fill (color) | #F1F5F9 | Colour for gridlines and axis lines. |
| axisSettings | xLabelRotation | enumeration | 0 | Rotation angle for X-axis labels (0, 45, or 90 degrees). |
| titleSettings | showPanelTitles | bool | true | Show or hide the title bar on each panel. |
| titleSettings | titleFontSize | numeric | 11 | Font size in pixels for panel titles. Min 8, Max 18. |
| titleSettings | titleFontColor | fill (color) | #334155 | Font colour for panel titles. |
| titleSettings | titleAlignment | enumeration | left | Horizontal alignment of panel titles (Left or Center). |
| titleSettings | titleBackground | fill (color) | #F8FAFC | Background colour of the panel title bar. |
| colorSettings | colorPalette | enumeration | default | Colour palette for series colouring (Default, Pastel, Vivid). Each palette contains 15 colours. |
| colorSettings | defaultBarColor | fill (color) | #3B82F6 | Default colour when no Series field is mapped. |
| colorSettings | selectedBarColor | fill (color) | #2563EB | Highlight colour for selected elements (defined in settings; usage depends on selection logic). |
| labelSettings | showDataLabels | bool | false | Show value labels above each data point. |
| labelSettings | dataLabelFontSize | numeric | 9 | Font size in pixels for data labels. Min 7, Max 14. |
| labelSettings | dataLabelFontColor | fill (color) | #475569 | Font colour for data labels. |

## Interactions
- Selection and cross-filtering: Yes. `src/interactions/selection.ts` is wired into `src/visual.ts` via `buildCallbacks()`. Supports single-click selection and multi-select with Ctrl/Meta. Clicking the background clears the selection. Unselected elements are dimmed to opacity 0.25.
- Tooltips: Yes. Uses the Power BI tooltip service (`ITooltipService`). Tooltip items include Trellis, Category, Value, Series (if present), and any additional Tooltip Fields. Canvas tooltips are enabled in `capabilities.json`.
- Zoom/pan: No. No zoom or pan handler found in `src/interactions/` or wired in `src/visual.ts`.
- Play axis: No. No play-axis logic found.
- Search box: No. No search UI found.

## Build and run (developer)
From this visual's directory:

Install dependencies:
```bash
npm install
```

`package-lock.json` was not found in the provided directory listing; use `npm ci` instead if the lock file exists in your local checkout.

Build and package:
```bash
pbiviz package
```

Output appears in `dist/`.

Dev server:
```bash
npm start
```

This runs `pbiviz start --project tsconfig.dev.json` as defined in `package.json` scripts.

## File layout (high level)
- `src/visual.ts` -- entry point and update orchestrator
- `src/settings.ts` -- formatting model cards, defaults, and `buildRenderConfig()`
- `src/types.ts` -- domain interfaces and literal union types
- `src/constants.ts` -- colour palettes, layout constants, and rendering thresholds
- `src/model/columns.ts` -- column resolution and required-field guard
- `src/model/parser.ts` -- data parsing, grouping by trellis value, series bucketing
- `src/render/layout.ts` -- grid layout calculation (columns, rows, panel dimensions)
- `src/render/panel.ts` -- panel container styling, title bar, delegates to chart renderer
- `src/render/chart.ts` -- bar, line, area, and lollipop renderers plus axes and labels
- `src/interactions/selection.ts` -- click selection, multi-select, dim/highlight logic
- `src/utils/color.ts` -- palette lookup, hex validation, hex-to-rgba conversion
- `src/utils/dom.ts` -- DOM element creation, child clearing, clamp utility
- `src/utils/format.ts` -- compact number formatting and string truncation
- `style/visual.less` -- all visual styling (panel, chart elements, scrollbar, error overlay)

## Known limitations / edge cases
- The panel pool is pre-allocated to a maximum of 200 panels (`MAX_PANELS` in `src/constants.ts`). Trellis fields with more than 200 unique values will not render additional panels.
- Data reduction is capped at 10,000 rows (`capabilities.json` `dataReductionAlgorithm`).
- X-axis category labels are truncated to 10 characters (`X_LABEL_MAX_CHARS` in `src/constants.ts`).
- The Y-axis domain always includes zero (enforced in `src/model/parser.ts`), so purely negative or purely positive datasets will still show a zero baseline.
- Non-finite numeric values are silently skipped during parsing.

## Versioning and compatibility
- Version: 1.0.0.0 (from `pbiviz.json`).
- Power BI Visuals API version: 5.3.0 (from `pbiviz.json`).
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL listed in `pbiviz.json`: https://github.com
- For issues specific to this visual, open an issue at the repository if available.

## License
MIT (as specified in `package.json`).