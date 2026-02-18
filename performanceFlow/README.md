# Performance Flow

Sankey diagram visualising flow/quantity between stages or categories.

## What this visual is for
- Showing how a total quantity splits and merges across stages (e.g., pipeline conversion, budget allocation, energy distribution).
- Identifying the largest flows between categories at a glance using proportional link widths.
- Tracing multi-level paths from sources to destinations through intermediate nodes.
- Comparing relative contribution of each source to each destination as a percentage.

Not a good fit for:
- Time-series or trend analysis (no time axis).
- Hierarchical data with a single parent per child (use a tree or decomposition visual instead).

## Quick start (Power BI Desktop)
1. Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2. Add the visual to a report canvas.
3. Map fields using the "Data roles (field wells)" section below.
4. (Optional) Load demo data and apply the suggested demo mapping (see "Demo data" section).

## Demo data
No demo CSV file was found in this package directory.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| source | Source | Grouping (Text) | Yes | Source node name for each flow row. Blank or null values are skipped. |
| destination | Destination | Grouping (Text) | Yes | Destination node name for each flow row. Blank or null values are skipped. |
| value | Value | Measure (Numeric) | Yes | Flow quantity. Must be greater than zero; zero and negative values are silently dropped. |
| linkColor | Link Color | GroupingOrMeasure | No | Optional hex colour override per link (e.g., `#FF0000`). Must be a valid 3- or 6-digit hex string; invalid values are ignored. |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Additional fields appended to the link tooltip. Supports multiple fields. |

Required roles are enforced in `src/model/columns.ts`: if any of `source`, `destination`, or `value` is unmapped, the visual displays an error message. Duplicate source-destination pairs are aggregated (values summed) in `src/model/graphBuilder.ts`.

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| nodeSettings (Nodes) | nodeWidth | numeric | 16 | Width of each node bar in pixels. Min 6, Max 40. |
| nodeSettings (Nodes) | nodePadding | numeric | 12 | Vertical padding between nodes in the same column. Min 4, Max 40. |
| nodeSettings (Nodes) | nodeCornerRadius | numeric | 2 | Corner radius of node rectangles. Min 0, Max 10. |
| nodeSettings (Nodes) | nodeColor | fill (color) | #334155 | Default node colour when "Color By Node" is off. |
| nodeSettings (Nodes) | nodeOpacity | numeric (percent) | 90 | Node fill opacity as a percentage. Min 0, Max 100. |
| nodeSettings (Nodes) | nodeAlign | enumeration | justify | Node column alignment: Left, Right, Center, or Justify. |
| linkSettings (Links) | linkOpacity | numeric (percent) | 40 | Default link stroke opacity as a percentage. Min 0, Max 100. |
| linkSettings (Links) | linkHoverOpacity | numeric (percent) | 70 | Link stroke opacity on hover as a percentage. Min 0, Max 100. |
| linkSettings (Links) | colorMode | enumeration | gradient | How links are coloured: Source Color, Dest Color, Gradient, or Fixed. |
| linkSettings (Links) | fixedLinkColor | fill (color) | #CBD5E1 | Link colour when colorMode is "Fixed". |
| linkSettings (Links) | linkCurvature | numeric | 0.5 | Bezier curvature of link paths. Min 0.1, Max 0.9. |
| labelSettings (Labels) | showNodeLabels | bool | true | Toggle node name labels on or off. |
| labelSettings (Labels) | labelFontSize | numeric | 11 | Font size for node name labels in pixels. Min 7, Max 18. |
| labelSettings (Labels) | labelFontColor | fill (color) | #334155 | Font colour for node labels. |
| labelSettings (Labels) | labelPosition | enumeration | outside | Label placement relative to the node: Inside or Outside. |
| labelSettings (Labels) | showValues | bool | true | Show a compact numeric value beneath each node label. |
| labelSettings (Labels) | valueFontSize | numeric | 9 | Font size for value sub-labels in pixels. Min 7, Max 14. |
| colorSettings (Colors) | colorByNode | bool | true | Assign a unique palette colour to each node. When off, all nodes use the nodeColor setting. |
| colorSettings (Colors) | selectedLinkColor | fill (color) | #3B82F6 | Stroke colour applied to links connected to a selected node. |
| colorSettings (Colors) | selectedNodeColor | fill (color) | #2563EB | Stroke colour applied to selected nodes. |
| layoutSettings (Layout) | iterations | numeric | 32 | Number of relaxation iterations for the Sankey layout algorithm. Min 6, Max 128. |
| layoutSettings (Layout) | sortNodes | enumeration | auto | How nodes are sorted within each column: Auto (crossing reduction), Name, Value, or None. |

## Interactions
- Selection and cross-filtering: Yes. Node and link click selection is implemented in `src/interactions/selection.ts` and wired in `src/visual.ts`. Multi-select is supported via Ctrl/Meta+click. Background click clears the selection. Selected elements are highlighted; unselected elements are dimmed to an opacity of 0.15. Cross-visual filtering is enabled via `selectionManager.registerOnSelectCallback`.
- Tooltips: Yes. Uses the Power BI tooltip service (`host.tooltipService`). Node tooltips show name, total in, and total out. Link tooltips show source name, destination name, value, and percentage of source total. User-defined tooltip fields from the `tooltipFields` data role are appended to link tooltips. Canvas tooltips are also declared as supported in `capabilities.json`.
- Zoom/pan: No zoom or pan handler found. Nodes can be vertically dragged to reposition them (implemented via `d3-drag` in `src/render/nodes.ts`); links and labels re-render to follow the new positions.
- Hover highlight: Yes. Hovering a node dims unconnected nodes and links; hovering a link dims all other links and unrelated nodes. Implemented in `applyHoverHighlight` in `src/interactions/selection.ts`.
- Play axis: Not applicable (no play axis module found).
- Search box: Not applicable (no search module found).

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
- `src/visual.ts` -- entry point and update orchestrator
- `src/settings.ts` -- formatting model cards and `buildRenderConfig()`
- `src/types.ts` -- domain interfaces, literal unions, RenderConfig
- `src/constants.ts` -- palette arrays, layout constants, CSS prefix
- `src/model/columns.ts` -- data role to column index mapping
- `src/model/parser.ts` -- DataViewTable row parsing into FlowRow objects
- `src/model/graphBuilder.ts` -- graph assembly and link aggregation
- `src/layout/sankey.ts` -- custom Sankey layout algorithm (no d3-sankey dependency)
- `src/render/nodes.ts` -- SVG node rect rendering with d3-drag support
- `src/render/links.ts` -- SVG link path rendering with gradient support
- `src/render/labels.ts` -- node label and value text rendering
- `src/interactions/selection.ts` -- selection highlighting, dimming, hover highlight
- `src/utils/color.ts` -- hex validation, palette cycling, colour interpolation
- `src/utils/dom.ts` -- DOM/SVG element factories, clamp, CSS prefix helper
- `src/utils/format.ts` -- number, percent, and compact formatting helpers
- `style/visual.less` -- visual stylesheet

## Known limitations / edge cases
- Rows with zero or negative values are silently dropped by the parser (`src/model/parser.ts`).
- Rows where source or destination is null, undefined, or blank are silently skipped.
- The `linkColor` role only accepts valid 3- or 6-digit hex strings (e.g., `#F00` or `#FF0000`); other colour formats are ignored.
- Data reduction is capped at 10,000 rows (`capabilities.json` `dataReductionAlgorithm.top.count`).
- The visual shows an error overlay if the viewport is smaller than 100x80 pixels (`MIN_CHART_WIDTH`, `MIN_CHART_HEIGHT` in `src/constants.ts`).
- Cycles in the flow graph are handled but may produce suboptimal column assignment; the layout picks the first remaining node when no acyclic source is found (`src/layout/sankey.ts`).
- Duplicate source-destination pairs are aggregated by summing their values; only the first non-null colour override and the first row's tooltip extras are kept (`src/model/graphBuilder.ts`).

## Versioning and compatibility
- Version: 1.0.0.0 (from `pbiviz.json`).
- Power BI visuals API version: 5.3.0 (from `pbiviz.json`).
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL from `pbiviz.json`: https://github.com
- This visual is part of the POWERBI monorepo visual library.

## License
MIT (from `package.json`).