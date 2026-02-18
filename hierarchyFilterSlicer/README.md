# Hierarchy Filter Slicer

A tree-view slicer with checkboxes, search, expand/collapse, and hierarchy filtering for Power BI.

## What this visual is for
- Filtering report data by selecting nodes in a multi-level hierarchy (e.g., Region > Country > City).
- Providing a compact, expandable tree UI when the standard Power BI slicer does not support nested groupings.
- Allowing partial selection at any level with tri-state checkboxes (checked, unchecked, indeterminate).
- Quickly locating hierarchy nodes via a built-in search box with match highlighting.

Not a good fit for:
- Flat, single-level slicing where the native Power BI slicer is sufficient.
- Hierarchies deeper than six levels (capped at six by `capabilities.json`).

## Quick start (Power BI Desktop)
1) Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2) Add the visual to a report canvas.
3) Map fields using the "Data roles (field wells)" section below. Drag one or more columns into the "Hierarchy Levels" field well, ordered from broadest to most granular.
4) (Optional) Load demo data if available and apply the suggested demo mapping.

## Demo data
No demo CSV file was found in the package directory. Demo data section is not applicable until a demo file is added.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| category | Hierarchy Levels | Grouping | Yes | Supports multiple fields: Yes (max 6). Each field becomes one hierarchy level. At least one field must be present for the visual to render (guard in `src/visual.ts` and `src/model/columns.ts`). Rows with null/blank values at any level are silently skipped (`src/model/parser.ts`). Data reduction algorithm: top 30,000 rows. |

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| treeSettings | indentSize | numeric | 20 | Horizontal indent per hierarchy level in pixels. Min 8, Max 40. |
| treeSettings | rowHeight | numeric | 28 | Height of each tree row in pixels. Min 20, Max 48. |
| treeSettings | fontSize | fontSize | 11 | Font size for node labels. Min 8, Max 18. |
| treeSettings | fontColor | fill (color) | #334155 | Color of node label text. |
| treeSettings | fontFamily | text (dropdown) | Segoe UI | Font family for node labels. Options: Segoe UI, Arial, Calibri. |
| treeSettings | selectedFontWeight | text (dropdown) | bold | Font weight applied to checked nodes. Options: normal, bold. |
| treeSettings | showIcons | bool | true | Show folder/document emoji icons next to nodes. |
| treeSettings | iconSize | numeric | 14 | Size of node icons in pixels. Min 10, Max 24. |
| checkboxSettings | checkboxSize | numeric | 16 | Size of checkbox squares in pixels. Min 12, Max 24. |
| checkboxSettings | checkedColor | fill (color) | #3B82F6 | Background and border color of checked checkboxes. |
| checkboxSettings | uncheckedBorder | fill (color) | #CBD5E1 | Border color of unchecked checkboxes. |
| checkboxSettings | indeterminateColor | fill (color) | #93C5FD | Background and border color of indeterminate checkboxes. |
| checkboxSettings | checkboxRadius | numeric | 3 | Border radius of checkboxes in pixels. Min 0, Max 8. |
| searchSettings | showSearchBox | bool | true | Show or hide the search input box. |
| searchSettings | searchPlaceholder | text | Search... | Placeholder text displayed in the empty search input. |
| searchSettings | highlightMatches | bool | true | Bold-highlight the matching substring in search results. |
| headerSettings | showHeader | bool | true | Show or hide the entire header bar. |
| headerSettings | showSelectAll | bool | true | Show the Select All checkbox and label in the header. |
| headerSettings | showExpandCollapse | bool | true | Show Expand All / Collapse All buttons in the header. |
| headerSettings | headerBackground | fill (color) | #F8FAFC | Background color of the header bar. |
| headerSettings | headerFontColor | fill (color) | #475569 | Font color for header text and labels. |
| headerSettings | headerFontSize | fontSize | 10 | Font size for header text. Min 8, Max 14. |
| headerSettings | headerBorderColor | fill (color) | #E2E8F0 | Color of the bottom border line on the header. |
| containerSettings | background | fill (color) | #FFFFFF | Background color of the visual container. |
| containerSettings | borderWidth | numeric | 1 | Width of the container border in pixels. Min 0, Max 4. |
| containerSettings | borderColor | fill (color) | #E2E8F0 | Color of the container border. |
| containerSettings | borderRadius | numeric | 4 | Corner radius of the container in pixels. Min 0, Max 12. |
| containerSettings | scrollbarWidth | numeric | 6 | Width of the custom scrollbar in pixels. Min 4, Max 14. |
| containerSettings | scrollbarThumbColor | fill (color) | #CBD5E1 | Color of the scrollbar thumb. |
| containerSettings | scrollbarTrackColor | fill (color) | #F8FAFC | Color of the scrollbar track. |

## Interactions
- Selection & cross-filtering: Yes. The visual applies a BasicFilter on the leaf-level category column using `host.applyJsonFilter`. Checking or unchecking nodes triggers `applyFilter()` in `src/interactions/filter.ts`, which is wired from `src/visual.ts`. When all leaves are checked or none are checked, the filter is removed. This is cross-filtering via the Advanced Filter API, not selection-based cross-highlighting.
- Tooltips: No. No Power BI tooltip service usage or custom tooltip DOM was found in the codebase.
- Zoom/pan: No. No zoom or pan handler exists.
- Search: Yes. `src/render/searchBox.ts` provides a text input with 150ms debounce. Typing filters the tree to matching nodes and their ancestors. Match highlighting is controlled by the `highlightMatches` setting. Wired in `src/visual.ts`.
- Select All: Yes. Header includes a Select All toggle that checks or unchecks all nodes. Wired via `src/render/header.ts` and `src/model/hierarchy.ts`.
- Expand/Collapse All: Yes. Header buttons expand or collapse the entire tree. Wired via `src/render/header.ts` and `src/model/hierarchy.ts`.

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
Confirmed via the `start` script in `package.json`.

## File layout (high level)
- `src/visual.ts` -- entry point and update orchestrator
- `src/settings.ts` -- formatting model cards and `buildRenderConfig()`
- `src/types.ts` -- domain interfaces (`HierarchyNode`, `RenderConfig`, callbacks)
- `src/constants.ts` -- palette arrays, icon characters, CSS prefix, key separator
- `src/model/columns.ts` -- resolves category columns from the data view
- `src/model/parser.ts` -- parses categorical rows into `ParsedRow` objects
- `src/model/hierarchy.ts` -- tree construction, check state propagation, search filtering, flattening
- `src/render/tree.ts` -- renders visible tree rows into the scrollable body
- `src/render/header.ts` -- header bar with Select All and Expand/Collapse buttons
- `src/render/searchBox.ts` -- search input with debounced filtering
- `src/render/checkbox.ts` -- CSS-only tri-state checkbox rendering
- `src/interactions/filter.ts` -- builds and applies BasicFilter via `host.applyJsonFilter`
- `src/utils/dom.ts` -- DOM helper functions (element creation, CSS variable setting)
- `style/visual.less` -- all visual styling with `hfslicer-` prefixed selectors

## Known limitations / edge cases
- Maximum hierarchy depth is six levels, enforced by `capabilities.json` (`"category": { "max": 6 }`). A constant `MAX_HIERARCHY_DEPTH = 6` exists in `src/constants.ts` but is not referenced elsewhere in code.
- Data reduction algorithm caps input at 30,000 rows (`capabilities.json`). Datasets exceeding this limit will be silently truncated.
- Rows with null, undefined, or blank values at any hierarchy level are silently skipped during parsing (`src/model/parser.ts`).
- The tree body is fully re-rendered on every state change (expand, check, search). No virtual scrolling or row recycling is implemented, which may affect performance with very large node counts.
- The `assets/icon.png` file is referenced in `pbiviz.json` but was not included in the provided codebase extraction. Ensure it exists before packaging.

## Versioning and compatibility
- Version: 1.0.0.0 (from `pbiviz.json`)
- Power BI Visuals API: 5.3.0 (from `pbiviz.json`)
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL in `pbiviz.json`: https://github.com

## License
MIT (from `package.json`).

This visual is part of the POWERBI monorepo visual library.