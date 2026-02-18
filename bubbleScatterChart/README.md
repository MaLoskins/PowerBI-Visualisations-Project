# Bubble Scatter Chart

A scatter plot with optional bubble sizing, quadrant overlays, trend lines, zoom/pan, play axis animation, and click-to-select cross-filtering.

## What this visual is for

- Comparing two numeric measures across categories with optional bubble sizing for a third dimension.
- Identifying clusters, outliers, and correlations between X and Y measures.
- Segmenting data into quadrants (e.g., high/low performance grids, priority matrices).
- Animating data over time or ordinal steps using the play axis.
- Overlaying linear, polynomial, or exponential trend lines to reveal relationships.

Not a good fit for:

- Categorical bar-style comparisons where a bar or column chart is more readable.
- Time-series line analysis where a continuous line chart better conveys trends over sequential dates.

## Quick start (Power BI Desktop)

1. Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2. Add the visual to a report canvas.
3. Map fields using the "Data roles (field wells)" section below. At minimum, supply X Value, Y Value, and Category.
4. (Optional) Load a demo dataset with numeric X/Y columns, a categorical column, and optionally a size measure, then apply the suggested mapping.

## Demo data

No demo CSV file was found in the package directory. To test the visual, prepare a dataset with at least one text/categorical column (for Category), two numeric columns (for X Value and Y Value), and optionally a numeric column for bubble Size.

## Data roles (field wells)

The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| xValue | X Value | Measure (Numeric) | Yes | Numeric measure for X-axis position |
| yValue | Y Value | Measure (Numeric) | Yes | Numeric measure for Y-axis position |
| size | Size | Measure (Numeric) | No | Controls bubble radius via a sqrt scale; when absent all bubbles use minBubbleRadius |
| category | Category | Grouping (Text) | Yes | Identifies each data point; used for labels and colour assignment |
| series | Series | Grouping (Text) | No | Groups points for colour legend entries; overrides category for colour key when present |
| playAxis | Play Axis | Grouping (Text/Date) | No | Time or ordinal field for play axis animation; sorted chronologically if all values are valid dates, otherwise lexicographically |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Extra fields displayed in the tooltip. Supports multiple fields: Yes (unbounded) |

Required roles are enforced in `src/model/columns.ts` (`hasRequiredColumns` guards for xValue, yValue, and category).

## Formatting options (Format pane)

Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| chartSettings | minBubbleRadius | numeric | 4 | Minimum bubble radius in pixels. Min 2, Max 20. |
| chartSettings | maxBubbleRadius | numeric | 30 | Maximum bubble radius in pixels. Min 10, Max 80. |
| chartSettings | bubbleOpacity | numeric | 75 | Bubble fill opacity as a percentage. Min 0, Max 100. Converted to 0-1 fraction at runtime. |
| chartSettings | bubbleBorderWidth | numeric | 1 | Bubble stroke width in pixels. Min 0, Max 4. |
| chartSettings | bubbleBorderColor | fill (color) | #FFFFFF | Bubble stroke colour. |
| axisSettings | xAxisLabel | text | (empty) | Custom label displayed below the X axis. |
| axisSettings | yAxisLabel | text | (empty) | Custom label displayed beside the Y axis. |
| axisSettings | xAxisScale | enumeration | linear | X axis scale type: Linear or Logarithmic. |
| axisSettings | yAxisScale | enumeration | linear | Y axis scale type: Linear or Logarithmic. |
| axisSettings | xAxisMin | numeric | 0 | Manual X axis minimum; 0 means auto. |
| axisSettings | xAxisMax | numeric | 0 | Manual X axis maximum; 0 means auto. |
| axisSettings | yAxisMin | numeric | 0 | Manual Y axis minimum; 0 means auto. |
| axisSettings | yAxisMax | numeric | 0 | Manual Y axis maximum; 0 means auto. |
| axisSettings | axisFontSize | numeric | 10 | Font size for axis tick labels in pixels. Min 7, Max 16. |
| axisSettings | axisFontColor | fill (color) | #64748B | Font colour for axis tick labels. |
| axisSettings | showGridlines | bool | true | Show horizontal and vertical grid lines. |
| axisSettings | gridlineColor | fill (color) | #F1F5F9 | Gridline stroke colour. |
| axisSettings | axisLineColor | fill (color) | #CBD5E1 | Axis line stroke colour. |
| quadrantSettings | showQuadrants | bool | false | Show quadrant dividing lines. |
| quadrantSettings | quadrantXValue | numeric | 0 | X value where the vertical quadrant line is drawn. |
| quadrantSettings | quadrantYValue | numeric | 0 | Y value where the horizontal quadrant line is drawn. |
| quadrantSettings | quadrantLineColor | fill (color) | #CBD5E1 | Quadrant line colour. |
| quadrantSettings | quadrantLineWidth | numeric | 1 | Quadrant line width in pixels. Min 0.5, Max 4. |
| quadrantSettings | quadrantLineStyle | enumeration | dashed | Quadrant line style: Solid, Dashed, or Dotted. |
| quadrantSettings | showQuadrantLabels | bool | false | Show text labels in each quadrant corner. |
| quadrantSettings | q1Label | text | Q1 | Label for top-right quadrant. |
| quadrantSettings | q2Label | text | Q2 | Label for top-left quadrant. |
| quadrantSettings | q3Label | text | Q3 | Label for bottom-left quadrant. |
| quadrantSettings | q4Label | text | Q4 | Label for bottom-right quadrant. |
| trendSettings | showTrendLine | bool | false | Show a regression trend line. |
| trendSettings | trendLineType | enumeration | linear | Regression type: Linear, Polynomial (degree 2), or Exponential. |
| trendSettings | trendLineColor | fill (color) | #94A3B8 | Trend line stroke colour. |
| trendSettings | trendLineWidth | numeric | 1.5 | Trend line width in pixels. Min 0.5, Max 4. |
| trendSettings | trendLineStyle | enumeration | dashed | Trend line style: Solid or Dashed. |
| labelSettings | showDataLabels | bool | false | Show text labels near each bubble. |
| labelSettings | labelContent | enumeration | category | Label content: Category name, Value coordinates, or Both. |
| labelSettings | labelFontSize | numeric | 9 | Data label font size in pixels. Min 7, Max 14. |
| labelSettings | labelFontColor | fill (color) | #475569 | Data label font colour. |
| colorSettings | defaultBubbleColor | fill (color) | #3B82F6 | Default bubble fill when colorByCategory is off. |
| colorSettings | selectedBubbleColor | fill (color) | #2563EB | Colour applied to selected bubbles (referenced in settings but styling is handled via opacity). |
| colorSettings | colorByCategory | bool | true | Assign distinct colours per category/series from a built-in palette. |
| legendSettings | showLegend | bool | true | Show the colour legend. |
| legendSettings | legendPosition | enumeration | top | Legend position: Top, Bottom, Left, or Right. |
| legendSettings | legendFontSize | numeric | 10 | Legend font size in pixels. Min 7, Max 16. |
| legendSettings | legendFontColor | fill (color) | #475569 | Legend text colour. |
| zoomSettings | enableZoom | bool | true | Enable scroll-wheel zoom on the chart. |
| zoomSettings | enablePan | bool | true | Enable click-drag panning on the chart. |
| zoomSettings | showResetButton | bool | true | Show a Reset Zoom button in the top-right corner. |
| playSettings | playSpeed | numeric | 1000 | Milliseconds per frame during play animation. Min 200, Max 5000. |
| playSettings | showPlayControls | bool | true | Show play/pause button, slider, and frame label when a Play Axis field is supplied. |
| playSettings | trailOpacity | numeric | 20 | Opacity percentage for ghost trail bubbles from previous frames. Min 0, Max 100. Converted to 0-1 fraction at runtime. |

## Interactions

- Selection and cross-filtering: Yes. `src/interactions/selection.ts` is wired in `src/visual.ts`. Click a bubble to select; Ctrl/Meta-click for multi-select. Click the background to deselect. Unselected bubbles dim to 0.25 opacity.
- Tooltips: Yes. Uses the Power BI tooltip service (`host.tooltipService.show`, `move`, `hide`) in `src/visual.ts`. Tooltips display Category, Series (if present), X, Y, Size (if present), and any extra tooltip fields.
- Zoom/pan: Yes. `src/interactions/zoom.ts` is wired in `src/visual.ts`. Uses d3-zoom to rescale axes on scroll (zoom) and drag (pan). Scale range is 0.1x to 20x. A Reset Zoom button restores the identity transform.
- Play axis: Yes. `src/interactions/playAxis.ts` is wired in `src/visual.ts`. When a Play Axis field is provided, a play/pause button, slider, and frame label appear. Trail bubbles from previous frames render at configurable opacity.

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

Confirmed via `package.json` scripts (`"start": "pbiviz start"`).

## File layout (high level)

- `src/visual.ts` -- entry point; DOM scaffolding, data pipeline, render orchestration
- `src/settings.ts` -- formatting card classes and `buildRenderConfig()` bridge
- `src/types.ts` -- domain interfaces, literal union types, RenderConfig definition
- `src/constants.ts` -- colour palettes, margins, magic numbers
- `src/model/columns.ts` -- maps data-role names to table column indices
- `src/model/parser.ts` -- table rows to `ScatterDataPoint` domain objects
- `src/render/axes.ts` -- d3 scale construction and axis rendering
- `src/render/chart.ts` -- bubble (circle) rendering with sqrt size scale
- `src/render/quadrants.ts` -- quadrant dividing lines and corner labels
- `src/render/trendline.ts` -- regression path rendering (linear, polynomial, exponential)
- `src/render/legend.ts` -- categorical/series colour legend
- `src/render/labels.ts` -- data labels near each bubble
- `src/interactions/selection.ts` -- click-to-select and cross-filtering
- `src/interactions/zoom.ts` -- d3-zoom with axis rescaling
- `src/interactions/playAxis.ts` -- play/pause animation through time/ordinal frames
- `src/utils/color.ts` -- colour resolution and categorical assignment
- `src/utils/dom.ts` -- element factories and helpers
- `src/utils/format.ts` -- number formatting with compact suffix notation
- `src/utils/regression.ts` -- linear, polynomial (degree 2), and exponential regression
- `style/visual.less` -- all visual styles, prefixed `bscatter-`

## Known limitations / edge cases

- Log scale axes clamp values less than or equal to zero to 0.001 (`LOG_CLAMP_VALUE` in `src/constants.ts`). A console warning is emitted for each clamped value.
- The data reduction algorithm limits input to 10,000 rows (`capabilities.json` top count).
- Exponential regression requires positive Y values. If fewer than two positive-Y points exist, it falls back to linear regression (`src/utils/regression.ts`).
- Polynomial regression (degree 2) falls back to linear when fewer than three data points are available.
- The visual shows an error overlay when the plot area is smaller than 80px in either dimension (`MIN_CHART_SIZE` in `src/constants.ts`).
- Axis min/max overrides use 0 as a sentinel for "auto"; setting an actual axis bound of zero is not possible through the format pane.
- The `pbiviz.json` description mentions "lasso selection" but no lasso implementation is present in the codebase; selection is click-based only.

## Versioning and compatibility

- Version: 1.0.0.0 (from `pbiviz.json`)
- Power BI visuals API: 5.3.0 (from `pbiviz.json`)
- Power BI visuals tools version: not specified in this README.

## Support / maintenance

Support URL from `pbiviz.json`: https://github.com

## License

License specified in `package.json`: MIT.

This visual is part of the POWERBI monorepo visual library.