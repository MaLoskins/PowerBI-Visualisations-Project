# Gantt Chart

A feature-rich Gantt Chart visual for Power BI with hierarchy, milestones, dependencies, and comprehensive formatting.

## What this visual is for
- Visualizing project schedules with task bars on a timeline, showing start dates, end dates, and durations at a glance.
- Tracking task progress and comparing actual versus planned (baseline) schedules.
- Displaying hierarchical work breakdown structures with collapsible parent-child task groupings.
- Identifying the critical path through a project and highlighting dependency chains between tasks.
- Showing milestones, resource assignments, and status across a project timeline.

Not a good fit for:
- Non-temporal data or datasets without meaningful start and end dates.
- Simple KPI or single-metric displays where a card or gauge visual would be more appropriate.

## Quick start (Power BI Desktop)
1) Import the visual:
   - Use the packaged `.pbiviz` from `dist/` (or build it via the "Build and run" section).
2) Add the visual to a report canvas.
3) Map fields using the "Data roles (field wells)" section below. At minimum, add a field to **Task Name**, **Start Date**, and **End Date**.
4) (Optional) Load demo data and apply the suggested demo mapping. See "Demo data" below.

## Demo data
No demo CSV file was found in this package directory. If a demo file is added in the future, place it in the package root and update this section with column names and suggested field mappings.

## Data roles (field wells)
The roles below are defined in `capabilities.json`.

| Role (capabilities.json) | Display name | Type | Required | Notes |
|---|---|---|---|---|
| taskName | Task Name | GroupingOrMeasure | Yes | Guard in `visual.ts`: error shown if no taskName columns mapped. Supports multiple fields: Yes (unbounded). Multiple columns create a multi-level hierarchy. |
| startDate | Start Date | Measure (Date) | Yes | Guard in `visual.ts`: error shown if unmapped. Rows with unparseable dates are silently skipped in `parser.ts`. |
| endDate | End Date | Measure (Date) | Yes | Guard in `visual.ts`: error shown if unmapped. If end < start, end is clamped to start. |
| taskId | Task ID | GroupingOrMeasure | No | Falls back to `"row_<index>"` when unmapped. Used for dependency references and explicit parent linking. Unique values recommended. |
| parent | Parent | GroupingOrMeasure | No | References a Task ID value to build an explicit parent-child hierarchy. Circular references are detected and severed. Ignored when multiple Task Name columns create a multi-column hierarchy. |
| progress | Progress | GroupingOrMeasure (Numeric) | No | Accepts 0-1 fraction or 0-100 percentage (auto-detected). Values above 100 are clamped to 1. Defaults to 0 when unmapped. |
| progressBase | Progress Base | GroupingOrMeasure (Numeric) | No | When provided and > 0, progress is computed as `progress / progressBase` and clamped to 0-1. |
| milestone | Milestone | Measure | No | Supports multiple fields: Yes (unbounded). A date value adds a milestone marker at that date. A boolean/truthy value flags the row as a milestone (diamond shape). Rows where start equals end are auto-detected as milestones. |
| resource | Resource | GroupingOrMeasure | No | Displayed in grid and tooltips. Used for automatic bar color assignment when "Color by Resource" is enabled. |
| dependencies | Dependencies | GroupingOrMeasure | No | Comma-, semicolon-, or pipe-separated list of Task ID values. Rendered as connector lines between bars. |
| priority | Priority | GroupingOrMeasure | No | Displayed in grid and tooltips. Available as a sort field. |
| status | Status | GroupingOrMeasure | No | Displayed in grid with semantic coloring (e.g. "In Progress" = blue, "Complete" = green, "Delayed" = red). Available as a sort field and bar color source. |
| wbs | WBS | GroupingOrMeasure | No | Work Breakdown Structure code. Displayed in grid column and tooltips. |
| plannedStart | Planned Start | Measure (Date) | No | Baseline start date. Shown as a secondary bar beneath the actual bar when "Show Planned Bars" is enabled. |
| plannedEnd | Planned End | Measure (Date) | No | Baseline end date. Used together with Planned Start. |
| colorField | Color | GroupingOrMeasure | No | Hex color string (e.g. `#3B82F6`) applied directly to the bar, or a categorical value mapped to the built-in palette. Takes priority over resource-based coloring. |
| tooltipFields | Tooltip Fields | GroupingOrMeasure | No | Supports multiple fields: Yes (unbounded). Extra columns appended to the Power BI tooltip. |

## Formatting options (Format pane)
Options below are derived from `capabilities.json` (objects) and defaults from `src/settings.ts`.

### Timeline

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| timeline | defaultZoom | text (dropdown) | fit | Initial zoom level. Values: day, week, month, quarter, year, fit. |
| timeline | showTodayLine | bool | true | Show a vertical line at today's date. |
| timeline | todayLineColor | fill (color) | #EF4444 | Color of the today line. |
| timeline | todayLineWidth | numeric | 2 | Stroke width of the today line. Min 1, Max 6. |
| timeline | todayLineStyle | text (dropdown) | solid | Today line dash style. Values: dashed, solid, dotted. |
| timeline | showWeekends | bool | false | Shade weekend columns in the timeline. |
| timeline | weekendColor | fill (color) | #F1F5F9 | Weekend shading fill color. |
| timeline | weekendOpacity | numeric | 40 | Weekend shading opacity as a percentage. Min 0, Max 100. Stored as 0-100; converted to 0-1 at render time. |
| timeline | showCurrentWeekHighlight | bool | true | Highlight the current calendar week. |
| timeline | currentWeekColor | fill (color) | #EFF6FF | Current week highlight color. |
| timeline | timelinePadding | numeric | 2 | Padding in days added before the earliest and after the latest date. Min 0, Max 60. |

### Tasks

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| taskSettings | rowHeight | numeric | 22 | Height of each row in pixels. Min 16, Max 80. |
| taskSettings | barHeight | numeric | 18 | Height of the task bar in pixels. Min 6, Max 60. |
| taskSettings | barCornerRadius | numeric | 0 | Corner radius of task bars in pixels. Min 0, Max 20. |
| taskSettings | barBorderWidth | numeric | 0 | Border width around task bars in pixels. Min 0, Max 4. |
| taskSettings | barBorderColor | fill (color) | #64748B | Border color for task bars. |
| taskSettings | showProgress | bool | true | Show progress overlay on task bars. |
| taskSettings | progressStyle | text (dropdown) | overlay | Progress display style. Values: overlay, bottomStripe. |
| taskSettings | progressOpacity | numeric | 55 | Progress overlay opacity as a percentage. Min 0, Max 100. |
| taskSettings | milestoneSize | numeric | 14 | Size of milestone markers in pixels. Min 6, Max 30. |
| taskSettings | sortBy | text (dropdown) | none | Sort tasks by the selected field. Values: none, startDate, endDate, name, progress, priority, status, duration, resource. |
| taskSettings | sortDirection | text (dropdown) | asc | Sort direction. Values: asc, desc. |
| taskSettings | showPlannedBars | bool | false | Show planned (baseline) bars beneath actual bars. |
| taskSettings | plannedBarOpacity | numeric | 80 | Planned bar opacity as a percentage. Min 0, Max 100. |
| taskSettings | groupBarStyle | text (dropdown) | thin | Visual style for group/summary bars. Values: bracket, flat, thin. |

### Colors

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| colorSettings | defaultBarColor | fill (color) | #94A3B8 | Default bar color when no resource or color field is mapped. |
| colorSettings | selectedBarColor | fill (color) | #3B82F6 | Highlight color for selected bars. |
| colorSettings | groupBarColor | fill (color) | #475569 | Color for group/summary bars. |
| colorSettings | dependencyLineColor | fill (color) | #94A3B8 | Color of dependency connector lines. |
| colorSettings | progressColor | fill (color) | #1D4ED8 | Color of the progress overlay or stripe. |
| colorSettings | milestoneFill | fill (color) | #EF4444 | Fallback color for single-milestone tasks. Multi-milestone markers cycle through a built-in palette. |
| colorSettings | plannedBarColor | fill (color) | #CBD5E1 | Color for planned (baseline) bars. |
| colorSettings | criticalPathColor | fill (color) | #DC2626 | Highlight color for critical-path task borders. |
| colorSettings | colorByResource | bool | true | Assign bar colors automatically by resource name using a built-in 15-color palette. |
| colorSettings | colorByStatus | bool | false | Override bar colors using semantic status colors (e.g. "In Progress" = blue). Takes priority over resource coloring when enabled. |
| colorSettings | rowEvenColor | fill (color) | #FFFFFF | Background color for even-numbered rows. |
| colorSettings | rowOddColor | fill (color) | #F8FAFC | Background color for odd-numbered rows. |

### Grid

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| gridSettings | showGrid | bool | true | Show or hide the left-hand grid pane. |
| gridSettings | gridWidth | numeric | 300 | Default width of the grid pane in pixels. Min 100, Max 800. User can also drag the resize handle. |
| gridSettings | textSize | numeric | 9 | Grid text size in points. Min 7, Max 24. |
| gridSettings | indentSize | numeric | 18 | Indentation per hierarchy level in pixels. Min 6, Max 40. |
| gridSettings | showDateColumns | bool | false | Show Start and End date columns in the grid. |
| gridSettings | showResourceColumn | bool | false | Show Resource column in the grid. |
| gridSettings | showProgressColumn | bool | false | Show Progress percentage column in the grid. |
| gridSettings | showDurationColumn | bool | true | Show Duration column in the grid. |
| gridSettings | showStatusColumn | bool | false | Show Status column in the grid. |
| gridSettings | showPriorityColumn | bool | false | Show Priority column in the grid. |
| gridSettings | showWbsColumn | bool | false | Show WBS column in the grid. |
| gridSettings | dateFormat | text (dropdown) | yyyy-MM-dd | Date display format. Values: yyyy-MM-dd, MM/dd/yyyy, dd/MM/yyyy, dd-MMM-yy, MMM dd, dd MMM yyyy. |
| gridSettings | gridHeaderBackground | fill (color) | #F1F5F9 | Background color for grid header row. |
| gridSettings | gridHeaderFontColor | fill (color) | #1E293B | Font color for grid header row. |
| gridSettings | gridFontColor | fill (color) | #334155 | Font color for grid body rows. |
| gridSettings | gridLineColor | fill (color) | #E2E8F0 | Color for grid row separator lines. |
| gridSettings | gridBorderColor | fill (color) | #CBD5E1 | Color for the border between grid and timeline panes. |

### Labels

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| labelSettings | showBarLabels | bool | true | Show text labels on or beside task bars. |
| labelSettings | barLabelContent | text (dropdown) | resource | Content shown in the bar label. Values: name, progress, resource, dates, nameAndProgress, nameAndResource. |
| labelSettings | barLabelPosition | text (dropdown) | right | Label placement relative to the bar. Values: inside, right, left, auto. "auto" places inside if bar width > 80px, otherwise right. |
| labelSettings | barLabelFontSize | numeric | 10 | Bar label font size in pixels. Min 7, Max 18. |
| labelSettings | barLabelFontColor | fill (color) | #334155 | Font color for bar labels (used for right/left placement; inside labels are white). |
| labelSettings | showProgressLabels | bool | true | Show progress percentage inside the bar. Hidden when bar width < 35px. |
| labelSettings | progressLabelFontSize | numeric | 9 | Progress label font size in pixels. Min 7, Max 16. |

### Dependencies

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| dependencySettings | showDependencies | bool | true | Render dependency connector lines between tasks. |
| dependencySettings | dependencyLineWidth | numeric | 1.5 | Stroke width of dependency lines. Min 0.5, Max 5. |
| dependencySettings | dependencyLineStyle | text (dropdown) | solid | Line dash style. Values: solid, dashed, dotted. |
| dependencySettings | dependencyArrowSize | numeric | 6 | Size of the arrowhead marker in pixels. Min 3, Max 14. |
| dependencySettings | dependencyRouting | text (dropdown) | orthogonal | Line routing algorithm. Values: orthogonal, straight, curved. |

### Critical Path

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| criticalPath | showCriticalPath | bool | false | Enable simplified forward/backward pass critical path analysis. |
| criticalPath | criticalPathWidth | numeric | 2 | Border width applied to critical-path task bars. Min 1, Max 5. |
| criticalPath | highlightCriticalBars | bool | true | Highlight critical bars with the critical-path color as a stroke. |

### Timeline Header

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| headerSettings | headerHeight | numeric | 38 | Height of the timeline header area in pixels. Min 24, Max 80. |
| headerSettings | headerBackground | fill (color) | #1E293B | Background color for the timeline header. |
| headerSettings | headerFontColor | fill (color) | #F1F5F9 | Font color for timeline header tick labels. |
| headerSettings | headerFontSize | numeric | 11 | Header font size in pixels. Min 8, Max 18. |
| headerSettings | showAxisLines | bool | true | Show vertical axis gridlines in the header and body. |
| headerSettings | axisLineColor | fill (color) | #CBD5E1 | Color for axis gridlines. |

### Toolbar

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| toolbarSettings | showToolbar | bool | true | Show or hide the toolbar. |
| toolbarSettings | showZoomButtons | bool | true | Show Day/Week/Month/Quarter/Year/Fit zoom buttons. |
| toolbarSettings | showExpandCollapseAll | bool | true | Show Expand All and Collapse All buttons. |
| toolbarSettings | showScrollToToday | bool | false | Show Scroll to Today button. |
| toolbarSettings | showSearchBox | bool | true | Show the task search input. Filters tasks by name, resource, status, and WBS. |
| toolbarSettings | toolbarBackground | fill (color) | #F8FAFC | Toolbar background color. |
| toolbarSettings | buttonBackground | fill (color) | #FFFFFF | Button background color. |
| toolbarSettings | buttonFontColor | fill (color) | #334155 | Button text color. |
| toolbarSettings | buttonBorderColor | fill (color) | #E2E8F0 | Button border color. |
| toolbarSettings | buttonActiveBackground | fill (color) | #2563EB | Active (selected) button background color. |
| toolbarSettings | buttonActiveFontColor | fill (color) | #FFFFFF | Active (selected) button text color. |

### Scrollbar

| Format card | Property | Type | Default | Description |
|---|---|---|---|---|
| scrollbarSettings | scrollbarWidth | numeric | 8 | Scrollbar width in pixels. Min 4, Max 20. |
| scrollbarSettings | scrollbarTrackColor | fill (color) | #F1F5F9 | Scrollbar track color. |
| scrollbarSettings | scrollbarThumbColor | fill (color) | #CBD5E1 | Scrollbar thumb color. |
| scrollbarSettings | scrollbarThumbHoverColor | fill (color) | #94A3B8 | Scrollbar thumb color on hover. |
| scrollbarSettings | scrollbarBorderRadius | numeric | 4 | Scrollbar thumb border radius in pixels. Min 0, Max 10. |

## Interactions
- Selection & cross-filtering: Yes. `src/interactions/selection.ts` is wired into `visual.ts`. Clicking a bar or grid row selects the task (Ctrl/Cmd for multi-select). Unselected items dim to 25% opacity. Clicking the empty timeline background clears the selection.
- Tooltips: Yes. Uses the Power BI tooltip service (`host.tooltipService.show/hide/move`). Tooltips display task name, dates, duration, progress, resource, status, priority, WBS, planned dates, critical path status, milestone markers, hierarchy levels, and any extra tooltip fields.
- Zoom: Yes. Toolbar buttons switch between Day, Week, Month, Quarter, Year, and Fit-to-screen zoom levels. Zoom is handled via `src/layout/timeScale.ts` and wired through the toolbar in `src/ui/toolbar.ts`.
- Search: Yes. A search input in the toolbar (`src/ui/toolbar.ts`) filters visible tasks by name, resource, status, or WBS via `flattenVisible` in `src/model/hierarchy.ts`.
- Expand/collapse: Yes. Groups are collapsible via toggle arrows in the grid and Expand All / Collapse All toolbar buttons.
- Scroll to Today: Yes. Toolbar button scrolls the timeline so the today marker is visible.
- Grid resize: Yes. A drag handle between the grid and timeline panes allows resizing (constrained to 100-800px).
- Play axis: No (no play axis logic found).

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
Output `.pbiviz` file appears in `dist/`.

Dev server:
```bash
npm start
```
This runs `pbiviz start --project tsconfig.dev.json` as defined in `package.json` scripts.

Lint:
```bash
npm run lint
```

## File layout (high level)
- `src/visual.ts` -- entry point and orchestrator (DOM scaffolding, update loop, render dispatch)
- `src/settings.ts` -- formatting model cards, slice definitions, and `buildRenderConfig()` mapping
- `src/types.ts` -- shared type definitions, literal union enums, `RenderConfig` interface
- `src/constants.ts` -- numeric constants, color palettes (resource, status, milestone)
- `src/model/columns.ts` -- resolves data role to column index mappings from the DataViewTable
- `src/model/parser.ts` -- parses table rows into leaf `GanttTask` objects
- `src/model/hierarchy.ts` -- builds hierarchy (multi-column or explicit parent), sort, flatten, expand/collapse, critical path
- `src/layout/timeScale.ts` -- d3 time scale construction and zoom-level px-per-day calculation
- `src/render/grid.ts` -- renders the left-hand grid pane (header and body rows)
- `src/render/timeline.ts` -- renders the SVG timeline (bars, milestones, groups, dependencies, today line, weekends)
- `src/interactions/selection.ts` -- applies selection highlight styles and handles task click events
- `src/ui/toolbar.ts` -- toolbar DOM with zoom buttons, expand/collapse, scroll-to-today, and search input
- `src/ui/scrollbars.ts` -- injects dynamic scrollbar CSS custom properties
- `src/utils/date.ts` -- date parsing (OLE serial, ISO, Date), formatting, and weekend detection
- `src/utils/color.ts` -- status color resolution, resource color assignment, hex validation
- `src/utils/dom.ts` -- element creation and DOM helpers
- `style/visual.less` -- all visual CSS (LESS variables, layout, toolbar, grid, timeline, SVG element styles)

## Known limitations / edge cases
- Data reduction is capped at 10,000 rows (`capabilities.json` `dataReductionAlgorithm.top.count`). Datasets exceeding this limit will be truncated.
- Maximum hierarchy depth is 50 levels (`MAX_HIERARCHY_DEPTH` in `constants.ts`). Deeper nesting is silently truncated.
- Circular parent references are detected and severed automatically (`breakCircularRefs` in `hierarchy.ts`), but the affected subtrees lose their children.
- Rows without valid start or end dates are silently skipped during parsing (no warning shown to the user).
- OLE Automation serial date parsing is limited to the range 25569-2958465 (approximately 1970-01-01 to 9999-12-31).
- Weekend shading is only rendered when pixels-per-day exceeds 1.5 (`PPD_THRESHOLD_WEEKEND`).
- Progress percentage labels inside bars are hidden when bar width is less than 35px (`PROGRESS_LABEL_MIN_BAR_WIDTH`).
- The critical path algorithm is a simplified forward/backward pass. Complex dependency networks with partial overlaps may not match dedicated scheduling tools.

## Versioning and compatibility
- Version: `1.0.0.0` (from `pbiviz.json`).
- Power BI visuals API version: `5.3.0` (from `pbiviz.json`).
- Power BI visuals tools version: not specified in this README.

## Support / maintenance
- Support URL: https://example.com/gantt-chart-visual/support (from `pbiviz.json`).

## License
MIT (from `package.json`).

This visual is part of the POWERBI monorepo visual library.