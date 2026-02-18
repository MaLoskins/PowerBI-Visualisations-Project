# CODEBASE EXTRACTION

**Source Directory:** `C:\Users\matth\Desktop\8-SANDBOX\POWERBI\GanttChart`
**Generated:** 2026-02-18 15:40:17
**Total Files:** 24

---

## Directory Structure

```
GanttChart/
├── .gitignore
├── capabilities.json
├── eslint.config.mjs
├── package.json
├── pbiviz.json
├── src/
│   ├── constants.ts
│   ├── interactions/
│   │   └── selection.ts
│   ├── layout/
│   │   └── timeScale.ts
│   ├── model/
│   │   ├── columns.ts
│   │   ├── hierarchy.ts
│   │   └── parser.ts
│   ├── render/
│   │   ├── grid.ts
│   │   └── timeline.ts
│   ├── settings.ts
│   ├── types.ts
│   ├── ui/
│   │   ├── scrollbars.ts
│   │   └── toolbar.ts
│   ├── utils/
│   │   ├── color.ts
│   │   ├── date.ts
│   │   └── dom.ts
│   └── visual.ts
├── style/
│   └── visual.less
├── tsconfig.dev.json
└── tsconfig.json
```

## Code Files


### 📄 .gitignore

```
# Dependencies
node_modules/

# Build artifacts
dist/
.tmp/

# Webpack reports
webpack.statistics.*.html

# Power BI certificates
*.pfx
*.pem

# IDE / editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
Desktop.ini

# Environment
.env
.env.*

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Test data
*.csv
*.xlsx
```


### 📄 capabilities.json

```
{
    "dataRoles": [
        { "displayName": "Task Name", "name": "taskName", "kind": "GroupingOrMeasure", "displayNameKey": "Role_TaskName" },
        { "displayName": "Start Date", "name": "startDate", "kind": "Measure", "displayNameKey": "Role_StartDate" },
        { "displayName": "End Date", "name": "endDate", "kind": "Measure", "displayNameKey": "Role_EndDate" },
        { "displayName": "Task ID", "name": "taskId", "kind": "GroupingOrMeasure", "displayNameKey": "Role_TaskId" },
        { "displayName": "Parent", "name": "parent", "kind": "GroupingOrMeasure", "displayNameKey": "Role_Parent" },
        { "displayName": "Progress", "name": "progress", "kind": "GroupingOrMeasure", "displayNameKey": "Role_Progress" },
        { "displayName": "Progress Base", "name": "progressBase", "kind": "GroupingOrMeasure", "displayNameKey": "Role_ProgressBase" },
        { "displayName": "Milestone", "name": "milestone", "kind": "Measure", "displayNameKey": "Role_Milestone" },
        { "displayName": "Resource", "name": "resource", "kind": "GroupingOrMeasure", "displayNameKey": "Role_Resource" },
        { "displayName": "Dependencies", "name": "dependencies", "kind": "GroupingOrMeasure", "displayNameKey": "Role_Dependencies" },
        { "displayName": "Priority", "name": "priority", "kind": "GroupingOrMeasure", "displayNameKey": "Role_Priority" },
        { "displayName": "Status", "name": "status", "kind": "GroupingOrMeasure", "displayNameKey": "Role_Status" },
        { "displayName": "WBS", "name": "wbs", "kind": "GroupingOrMeasure", "displayNameKey": "Role_WBS" },
        { "displayName": "Planned Start", "name": "plannedStart", "kind": "Measure", "displayNameKey": "Role_PlannedStart" },
        { "displayName": "Planned End", "name": "plannedEnd", "kind": "Measure", "displayNameKey": "Role_PlannedEnd" },
        { "displayName": "Color", "name": "colorField", "kind": "GroupingOrMeasure", "displayNameKey": "Role_ColorField" },
        { "displayName": "Tooltip Fields", "name": "tooltipFields", "kind": "GroupingOrMeasure", "displayNameKey": "Role_TooltipFields" }
    ],
    "objects": {
        "timeline": {
            "properties": {
                "defaultZoom": { "type": { "text": true } },
                "showTodayLine": { "type": { "bool": true } },
                "todayLineColor": { "type": { "fill": { "solid": { "color": true } } } },
                "todayLineWidth": { "type": { "numeric": true } },
                "todayLineStyle": { "type": { "text": true } },
                "showWeekends": { "type": { "bool": true } },
                "weekendColor": { "type": { "fill": { "solid": { "color": true } } } },
                "weekendOpacity": { "type": { "numeric": true } },
                "showCurrentWeekHighlight": { "type": { "bool": true } },
                "currentWeekColor": { "type": { "fill": { "solid": { "color": true } } } },
                "timelinePadding": { "type": { "numeric": true } }
            }
        },
        "taskSettings": {
            "properties": {
                "rowHeight": { "type": { "numeric": true } },
                "barHeight": { "type": { "numeric": true } },
                "barCornerRadius": { "type": { "numeric": true } },
                "showProgress": { "type": { "bool": true } },
                "progressStyle": { "type": { "text": true } },
                "progressOpacity": { "type": { "numeric": true } },
                "milestoneSize": { "type": { "numeric": true } },
                "sortBy": { "type": { "text": true } },
                "sortDirection": { "type": { "text": true } },
                "showPlannedBars": { "type": { "bool": true } },
                "plannedBarOpacity": { "type": { "numeric": true } },
                "barBorderWidth": { "type": { "numeric": true } },
                "barBorderColor": { "type": { "fill": { "solid": { "color": true } } } },
                "groupBarStyle": { "type": { "text": true } }
            }
        },
        "colorSettings": {
            "properties": {
                "defaultBarColor": { "type": { "fill": { "solid": { "color": true } } } },
                "selectedBarColor": { "type": { "fill": { "solid": { "color": true } } } },
                "groupBarColor": { "type": { "fill": { "solid": { "color": true } } } },
                "dependencyLineColor": { "type": { "fill": { "solid": { "color": true } } } },
                "progressColor": { "type": { "fill": { "solid": { "color": true } } } },
                "milestoneFill": { "type": { "fill": { "solid": { "color": true } } } },
                "plannedBarColor": { "type": { "fill": { "solid": { "color": true } } } },
                "criticalPathColor": { "type": { "fill": { "solid": { "color": true } } } },
                "colorByResource": { "type": { "bool": true } },
                "colorByStatus": { "type": { "bool": true } },
                "rowEvenColor": { "type": { "fill": { "solid": { "color": true } } } },
                "rowOddColor": { "type": { "fill": { "solid": { "color": true } } } }
            }
        },
        "gridSettings": {
            "properties": {
                "showGrid": { "type": { "bool": true } },
                "gridWidth": { "type": { "numeric": true } },
                "textSize": { "type": { "numeric": true } },
                "indentSize": { "type": { "numeric": true } },
                "showDateColumns": { "type": { "bool": true } },
                "showResourceColumn": { "type": { "bool": true } },
                "showProgressColumn": { "type": { "bool": true } },
                "showDurationColumn": { "type": { "bool": true } },
                "showStatusColumn": { "type": { "bool": true } },
                "showPriorityColumn": { "type": { "bool": true } },
                "showWbsColumn": { "type": { "bool": true } },
                "dateFormat": { "type": { "text": true } },
                "gridHeaderBackground": { "type": { "fill": { "solid": { "color": true } } } },
                "gridHeaderFontColor": { "type": { "fill": { "solid": { "color": true } } } },
                "gridFontColor": { "type": { "fill": { "solid": { "color": true } } } },
                "gridLineColor": { "type": { "fill": { "solid": { "color": true } } } },
                "gridBorderColor": { "type": { "fill": { "solid": { "color": true } } } }
            }
        },
        "labelSettings": {
            "properties": {
                "showBarLabels": { "type": { "bool": true } },
                "barLabelContent": { "type": { "text": true } },
                "barLabelPosition": { "type": { "text": true } },
                "barLabelFontSize": { "type": { "numeric": true } },
                "barLabelFontColor": { "type": { "fill": { "solid": { "color": true } } } },
                "showProgressLabels": { "type": { "bool": true } },
                "progressLabelFontSize": { "type": { "numeric": true } }
            }
        },
        "dependencySettings": {
            "properties": {
                "showDependencies": { "type": { "bool": true } },
                "dependencyLineWidth": { "type": { "numeric": true } },
                "dependencyLineStyle": { "type": { "text": true } },
                "dependencyArrowSize": { "type": { "numeric": true } },
                "dependencyRouting": { "type": { "text": true } }
            }
        },
        "criticalPath": {
            "properties": {
                "showCriticalPath": { "type": { "bool": true } },
                "criticalPathWidth": { "type": { "numeric": true } },
                "highlightCriticalBars": { "type": { "bool": true } }
            }
        },
        "headerSettings": {
            "properties": {
                "headerHeight": { "type": { "numeric": true } },
                "headerBackground": { "type": { "fill": { "solid": { "color": true } } } },
                "headerFontColor": { "type": { "fill": { "solid": { "color": true } } } },
                "headerFontSize": { "type": { "numeric": true } },
                "showAxisLines": { "type": { "bool": true } },
                "axisLineColor": { "type": { "fill": { "solid": { "color": true } } } }
            }
        },
        "toolbarSettings": {
            "properties": {
                "showToolbar": { "type": { "bool": true } },
                "showZoomButtons": { "type": { "bool": true } },
                "showExpandCollapseAll": { "type": { "bool": true } },
                "showScrollToToday": { "type": { "bool": true } },
                "showSearchBox": { "type": { "bool": true } },
                "toolbarBackground": { "type": { "fill": { "solid": { "color": true } } } },
                "buttonBackground": { "type": { "fill": { "solid": { "color": true } } } },
                "buttonFontColor": { "type": { "fill": { "solid": { "color": true } } } },
                "buttonBorderColor": { "type": { "fill": { "solid": { "color": true } } } },
                "buttonActiveBackground": { "type": { "fill": { "solid": { "color": true } } } },
                "buttonActiveFontColor": { "type": { "fill": { "solid": { "color": true } } } }
            }
        },
        "scrollbarSettings": {
            "properties": {
                "scrollbarWidth": { "type": { "numeric": true } },
                "scrollbarTrackColor": { "type": { "fill": { "solid": { "color": true } } } },
                "scrollbarThumbColor": { "type": { "fill": { "solid": { "color": true } } } },
                "scrollbarThumbHoverColor": { "type": { "fill": { "solid": { "color": true } } } },
                "scrollbarBorderRadius": { "type": { "numeric": true } }
            }
        }
    },
    "dataViewMappings": [
        {
            "table": {
                "rows": {
                    "select": [
                        { "for": { "in": "taskName" } },
                        { "for": { "in": "startDate" } },
                        { "for": { "in": "endDate" } },
                        { "for": { "in": "taskId" } },
                        { "for": { "in": "parent" } },
                        { "for": { "in": "progress" } },
                        { "for": { "in": "progressBase" } },
                        { "for": { "in": "milestone" } },
                        { "for": { "in": "resource" } },
                        { "for": { "in": "dependencies" } },
                        { "for": { "in": "priority" } },
                        { "for": { "in": "status" } },
                        { "for": { "in": "wbs" } },
                        { "for": { "in": "plannedStart" } },
                        { "for": { "in": "plannedEnd" } },
                        { "for": { "in": "colorField" } },
                        { "for": { "in": "tooltipFields" } }
                    ],
                    "dataReductionAlgorithm": {
                        "top": {
                            "count": 10000
                        }
                    }
                }
            }
        }
    ],
    "tooltips": {
        "supportedTypes": { "default": true, "canvas": true },
        "roles": ["tooltipFields"]
    },
    "privileges": []
}

```


### 📄 eslint.config.mjs

```
import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";

export default [
    powerbiVisualsConfigs.configs.recommended,
    {
        ignores: ["node_modules/**", "dist/**", ".vscode/**", ".tmp/**"],
    },
    {
        files: ["src/**/*.ts"],
        rules: {
            /* E1: Function/method length threshold */
            "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true, skipComments: true }],

            /* E1: Cyclomatic complexity */
            "complexity": ["warn", { max: 15 }],

            /* E1: Forbid `any` */
            "@typescript-eslint/no-explicit-any": "warn",

            /* E1: Consistent type imports */
            "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],

            /* E1: Explicit return types for exported functions */
            "@typescript-eslint/explicit-function-return-type": ["warn", {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
            }],

            /* General cleanliness */
            "no-console": "warn",
            "prefer-const": "error",
        },
    },
];

```


### 📄 package.json

```
{
    "name": "gantt-chart-visual",
    "description": "A feature-rich Gantt Chart custom visual for Power BI.",
    "version": "1.0.0.0",
    "repository": {
        "type": "git",
        "url": "https://example.com/gantt-chart-visual"
    },
    "license": "MIT",
    "scripts": {
        "pbiviz": "pbiviz",
        "start": "pbiviz start --project tsconfig.dev.json",
        "package": "pbiviz package",
        "lint": "npx eslint .",
        "sync-version": "node -e \"const p=require('./package.json');const v=require('./pbiviz.json');if(p.version!==v.visual.version){console.error('Version mismatch');process.exit(1)}\""
    },
    "dependencies": {
        "d3-scale": "4.0.2",
        "d3-selection": "3.0.0",
        "d3-time": "3.1.0",
        "d3-time-format": "4.1.0",
        "@types/d3-scale": "4.0.8",
        "@types/d3-selection": "3.0.10",
        "@types/d3-time": "3.0.3",
        "@types/d3-time-format": "4.0.3",
        "powerbi-visuals-api": "~5.3.0",
        "powerbi-visuals-utils-formattingmodel": "6.0.4"
    },
    "devDependencies": {
        "@typescript-eslint/eslint-plugin": "8.8.0",
        "eslint": "9.11.1",
        "eslint-plugin-powerbi-visuals": "1.0.0",
        "typescript": "5.5.4"
    }
}

```


### 📄 pbiviz.json

```
{
    "visual": {
        "name": "ganttChart",
        "displayName": "GanttChart",
        "guid": "ganttChart9C46BA29CF87441AB70C5280CFCE7E17",
        "visualClassName": "Visual",
        "version": "1.0.0.0",
        "description": "A feature-rich Gantt Chart visual for Power BI with hierarchy, milestones, dependencies, and comprehensive formatting.",
        "supportUrl": "https://example.com/gantt-chart-visual/support",
        "gitHubUrl": "https://example.com/gantt-chart-visual"
    },
    "apiVersion": "5.3.0",
    "author": {
        "name": "Gantt Chart Visual Contributors",
        "email": "support@example.com"
    },
    "assets": {
        "icon": "assets/icon.png"
    },
    "externalJS": null,
    "style": "style/visual.less",
    "capabilities": "capabilities.json",
    "dependencies": null,
    "stringResources": [],
    "version": "1.0.0.0"
}

```


### 📄 src\constants.ts

```typescript
import type { ZoomLevel } from "./types";

export const MIN_BAR_WIDTH = 2;
export const DAY_MS = 86_400_000;

/** Visible-row buffer for scroll virtualization (G3) */

export const ZOOM_PX_PER_DAY: Record<Exclude<ZoomLevel, "fit">, number> = {
    day: 50,
    week: 18,
    month: 5,
    quarter: 2,
    year: 0.6,
};

/*  ── Resource palette ──────────────────────────
    Vibrant but balanced — designed for clear
    differentiation on light backgrounds while
    remaining professional. WCAG AA contrast
    against white bar labels.
    ────────────────────────────────────────────── */
export const RESOURCE_COLORS = [
    "#3B82F6", // blue-500
    "#F59E0B", // amber-500
    "#10B981", // emerald-500
    "#8B5CF6", // violet-500
    "#EF4444", // red-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
    "#EC4899", // pink-500
    "#6366F1", // indigo-500
    "#14B8A6", // teal-500
    "#84CC16", // lime-500
    "#A855F7", // purple-500
    "#0EA5E9", // sky-500
    "#D946EF", // fuchsia-500
    "#78716C", // stone-500
] as const;

/*  ── Status palette ────────────────────────────
    Semantic colours aligned with standard RAG
    conventions. Each status maps to an intuitive
    colour so readers understand state at a glance.
    ────────────────────────────────────────────── */
export const STATUS_COLORS: Record<string, string> = {
    "not started": "#94A3B8", // slate-400    – neutral/unstarted
    "in progress": "#3B82F6", // blue-500     – active work
    "complete":    "#10B981", // emerald-500  – success
    "completed":   "#10B981",
    "done":        "#10B981",
    "on hold":     "#F59E0B", // amber-500    – caution/paused
    "delayed":     "#EF4444", // red-500      – danger
    "at risk":     "#F97316", // orange-500   – warning
    "cancelled":   "#64748B", // slate-500    – deactivated
    "blocked":     "#DC2626", // red-600      – critical blocker
};

/*  ── Milestone markers ─────────────────────────
    Bold shapes that remain legible at small sizes.
    Ordered so adjacent milestones are visually
    distinguishable by both colour and shape.
    ────────────────────────────────────────────── */
export const MILESTONE_STYLES: ReadonlyArray<{ color: string; shape: string }> = [
    { color: "#EF4444", shape: "diamond"  },  // red
    { color: "#3B82F6", shape: "circle"   },  // blue
    { color: "#10B981", shape: "triangle" },  // emerald
    { color: "#F59E0B", shape: "star"     },  // amber
    { color: "#8B5CF6", shape: "diamond"  },  // violet
    { color: "#06B6D4", shape: "circle"   },  // cyan
    { color: "#F97316", shape: "triangle" },  // orange
    { color: "#EC4899", shape: "star"     },  // pink
    { color: "#6366F1", shape: "diamond"  },  // indigo
    { color: "#14B8A6", shape: "circle"   },  // teal
];
```


### 📄 src\interactions\selection.ts

```typescript
import powerbi from "powerbi-visuals-api";
import type { GanttTask, RenderConfig } from "../types";

/**
 * Apply selection highlight styles to SVG bar groups and grid rows.
 * Operates on existing DOM – does not recreate it (G2).
 */
export function applySelectionStyles(
    selectionManager: powerbi.extensibility.ISelectionManager,
    flatVisible: GanttTask[],
    timelineSvg: SVGSVGElement,
    gridBody: HTMLDivElement,
    selectedBarColor: string,
): void {
    const ids = selectionManager.getSelectionIds() as powerbi.visuals.ISelectionId[];
    const hasSelection = ids.length > 0;
    const selectedSet = new Set<string>();

    if (hasSelection) {
        for (const task of flatVisible) {
            if (!task.selectionId) continue;
            for (const sid of ids) {
                if (sid.equals(task.selectionId)) { selectedSet.add(task.id); break; }
            }
        }
    }

    timelineSvg.querySelectorAll(".gantt-bar-group").forEach((elem: Element) => {
        const tid = elem.getAttribute("data-task-id") || "";
        const isSel = selectedSet.has(tid);
        const svgEl = elem as SVGElement;
        if (hasSelection) {
            svgEl.style.opacity = isSel ? "1" : "0.25";
            const bar = elem.querySelector(".gantt-bar") as SVGRectElement | null;
            if (bar) {
                bar.style.stroke = isSel ? selectedBarColor : "";
                bar.style.strokeWidth = isSel ? "2.5" : "";
            }
        } else {
            svgEl.style.opacity = "1";
            const bar = elem.querySelector(".gantt-bar") as SVGRectElement | null;
            if (bar) { bar.style.stroke = ""; bar.style.strokeWidth = ""; }
        }
    });

    gridBody.querySelectorAll(".gantt-grid-row").forEach((elem: Element) => {
        const tid = elem.getAttribute("data-task-id") || "";
        const isSel = selectedSet.has(tid);
        const htmlEl = elem as HTMLElement;
        if (hasSelection) {
            htmlEl.style.opacity = isSel ? "1" : "0.35";
            htmlEl.classList.toggle("gantt-grid-row-selected", isSel);
        } else {
            htmlEl.style.opacity = "1";
            htmlEl.classList.remove("gantt-grid-row-selected");
        }
    });
}

export function handleTaskClick(
    task: GanttTask,
    e: MouseEvent,
    selectionManager: powerbi.extensibility.ISelectionManager,
    onDone: () => void,
): void {
    if (!task.selectionId) return;
    const isMulti = e.ctrlKey || e.metaKey;
    selectionManager.select(task.selectionId, isMulti).then(onDone);
}

```


### 📄 src\layout\timeScale.ts

```typescript
import { scaleTime } from "d3-scale";
import type { ScaleTime } from "d3-scale";
import type { GanttTask, ZoomLevel } from "../types";
import { DAY_MS, ZOOM_PX_PER_DAY } from "../constants";
import { daysBetween } from "../utils/date";

export interface TimeRange {
    min: Date;
    max: Date;
}

/** Compute the min/max date range including planned + milestone dates. */
export function computeTimeRange(leafTasks: GanttTask[], paddingDays: number): TimeRange {
    let minT = Infinity;
    let maxT = -Infinity;
    for (const t of leafTasks) {
        if (t.start.getTime() < minT) minT = t.start.getTime();
        if (t.end.getTime() > maxT) maxT = t.end.getTime();
        if (t.plannedStart && t.plannedStart.getTime() < minT) minT = t.plannedStart.getTime();
        if (t.plannedEnd && t.plannedEnd.getTime() > maxT) maxT = t.plannedEnd.getTime();
        for (const ms of t.milestoneMarkers) {
            if (ms.date.getTime() < minT) minT = ms.date.getTime();
            if (ms.date.getTime() > maxT) maxT = ms.date.getTime();
        }
    }
    if (minT === Infinity) return { min: new Date(), max: new Date() };
    return {
        min: new Date(minT - DAY_MS * paddingDays),
        max: new Date(maxT + DAY_MS * paddingDays),
    };
}

/** Get pxPerDay for the current zoom level. */
export function computePxPerDay(
    zoom: ZoomLevel,
    timeMin: Date,
    timeMax: Date,
    availableWidth: number,
): number {
    if (zoom === "fit") {
        const totalDays = Math.max(1, daysBetween(timeMin, timeMax));
        const available = Math.max(20, availableWidth - 20);
        return Math.max(0.1, available / totalDays);
    }
    return ZOOM_PX_PER_DAY[zoom] ?? 5;
}

/** Build a d3 scaleTime for the given range and pxPerDay. */
export function buildTimeScale(
    timeMin: Date,
    timeMax: Date,
    pxPerDay: number,
): ScaleTime<number, number> {
    const totalDays = Math.max(1, daysBetween(timeMin, timeMax));
    const totalWidth = totalDays * pxPerDay;
    return scaleTime<number>().domain([timeMin, timeMax]).range([0, totalWidth]);
}

```


### 📄 src\model\columns.ts

```typescript
import powerbi from "powerbi-visuals-api";
import type { ColumnIndex } from "../types";

/** Resolve data role → column index mappings from the DataViewTable. */
export function resolveColumns(table: powerbi.DataViewTable): ColumnIndex {
    const idx: ColumnIndex = {
        taskNames: [],
        startDate: -1,
        endDate: -1,
        taskId: -1,
        parent: -1,
        progress: -1,
        progressBase: -1,
        milestones: [],
        resource: -1,
        dependencies: -1,
        priority: -1,
        status: -1,
        wbs: -1,
        plannedStart: -1,
        plannedEnd: -1,
        colorField: -1,
        tooltipFields: [],
    };

    for (let i = 0; i < table.columns.length; i++) {
        const roles = table.columns[i].roles;
        if (!roles) continue;
        if (roles["taskName"]) idx.taskNames.push(i);
        if (roles["startDate"]) idx.startDate = i;
        if (roles["endDate"]) idx.endDate = i;
        if (roles["taskId"]) idx.taskId = i;
        if (roles["parent"]) idx.parent = i;
        if (roles["progress"]) idx.progress = i;
        if (roles["progressBase"]) idx.progressBase = i;
        if (roles["milestone"]) idx.milestones.push(i);
        if (roles["resource"]) idx.resource = i;
        if (roles["dependencies"]) idx.dependencies = i;
        if (roles["priority"]) idx.priority = i;
        if (roles["status"]) idx.status = i;
        if (roles["wbs"]) idx.wbs = i;
        if (roles["plannedStart"]) idx.plannedStart = i;
        if (roles["plannedEnd"]) idx.plannedEnd = i;
        if (roles["colorField"]) idx.colorField = i;
        if (roles["tooltipFields"]) idx.tooltipFields.push(i);
    }
    return idx;
}

```


### 📄 src\model\hierarchy.ts

```typescript
import type { GanttTask, SortField, SortDirection } from "../types";
import { DAY_MS } from "../constants";
import { daysBetween } from "../utils/date";

/* ─── Build hierarchy from multi-column task names ─── */
export function buildMultiColumnHierarchy(
    leafTasks: GanttTask[],
    numLevels: number,
    taskById: Map<string, GanttTask>,
    expandedSet: Set<string>,
): GanttTask[] {
    const groupMap = new Map<string, GanttTask>();
    const rootTasks: GanttTask[] = [];
    let syntheticIdx = 0;

    for (const leaf of leafTasks) {
        const path = leaf.hierarchyPath;
        const groupDepth = numLevels - 1;
        let parentGroup: GanttTask | null = null;

        for (let level = 0; level < groupDepth; level++) {
            const segmentName = path[level] || "(blank)";
            const pathKey = path.slice(0, level + 1).join("|||");

            let group = groupMap.get(pathKey);
            if (!group) {
                const groupId = "__group_" + syntheticIdx++;
                group = makeSyntheticGroup(groupId, segmentName, level, path.slice(0, level + 1));
                groupMap.set(pathKey, group);
                taskById.set(groupId, group);
                if (parentGroup) parentGroup.children.push(group);
                else rootTasks.push(group);
            }
            parentGroup = group;
        }

        leaf.depth = groupDepth;
        leaf.parentId = parentGroup ? parentGroup.id : "";
        if (parentGroup) parentGroup.children.push(leaf);
        else rootTasks.push(leaf);
    }

    rollUpGroupDates(rootTasks);
    applyExpandState(rootTasks, expandedSet);
    return rootTasks;
}

/* ─── Build hierarchy from explicit parent field ─── */
export function buildExplicitParentHierarchy(
    leafTasks: GanttTask[],
    taskById: Map<string, GanttTask>,
    expandedSet: Set<string>,
): GanttTask[] {
    for (const t of leafTasks) { t.children = []; t.depth = 0; t.isGroup = false; }
    const rootTasks: GanttTask[] = [];

    for (const t of leafTasks) {
        if (t.parentId && taskById.has(t.parentId)) {
            const par = taskById.get(t.parentId)!;
            par.children.push(t);
            par.isGroup = true;
        } else {
            rootTasks.push(t);
        }
    }

    setDepth(rootTasks, 0);
    rollUpGroupDates(rootTasks);
    applyExpandState(rootTasks, expandedSet);
    return rootTasks;
}

/* ─── Sort ─── */
export function applySortRecursive(
    tasks: GanttTask[],
    sortBy: SortField,
    sortDirection: SortDirection,
): void {
    if (sortBy === "none") return;
    const dir = sortDirection === "desc" ? -1 : 1;

    const cmp = (a: GanttTask, b: GanttTask): number => {
        let r = 0;
        switch (sortBy) {
            case "startDate": r = a.start.getTime() - b.start.getTime(); break;
            case "endDate":   r = a.end.getTime() - b.end.getTime(); break;
            case "name":      r = a.name.localeCompare(b.name); break;
            case "progress":  r = a.progress - b.progress; break;
            case "priority":  r = a.priority.localeCompare(b.priority); break;
            case "status":    r = a.status.localeCompare(b.status); break;
            case "duration":  r = a.duration - b.duration; break;
            case "resource":  r = a.resource.localeCompare(b.resource); break;
            default: r = 0;
        }
        return r * dir;
    };

    const sortRec = (t: GanttTask[]): void => {
        t.sort(cmp);
        for (const n of t) { if (n.children.length > 0) sortRec(n.children); }
    };
    sortRec(tasks);
}

/* ─── Flatten visible (respects expand + search) ─── */
export function flattenVisible(
    rootTasks: GanttTask[],
    searchTerm: string,
): GanttTask[] {
    const result: GanttTask[] = [];
    const hasSearch = searchTerm.length > 0;

    const matchesSearch = (t: GanttTask): boolean => {
        if (!hasSearch) return true;
        return (
            t.name.toLowerCase().includes(searchTerm) ||
            t.resource.toLowerCase().includes(searchTerm) ||
            t.status.toLowerCase().includes(searchTerm) ||
            t.wbs.toLowerCase().includes(searchTerm)
        );
    };

    const taskOrChildMatches = (t: GanttTask): boolean => {
        if (matchesSearch(t)) return true;
        for (const c of t.children) { if (taskOrChildMatches(c)) return true; }
        return false;
    };

    const walk = (tasks: GanttTask[]): void => {
        for (const t of tasks) {
            if (hasSearch && !taskOrChildMatches(t)) continue;
            t.isVisible = true;
            result.push(t);
            if (t.isGroup && t.isExpanded) walk(t.children);
        }
    };
    walk(rootTasks);
    return result;
}

/* ─── Expand / Collapse ─── */
export function expandAll(rootTasks: GanttTask[], expandedSet: Set<string>): void {
    walkGroups(rootTasks, t => { expandedSet.add(t.id); t.isExpanded = true; });
}

export function collapseAll(rootTasks: GanttTask[], expandedSet: Set<string>): void {
    walkGroups(rootTasks, t => { expandedSet.delete(t.id); t.isExpanded = false; });
}

export function toggleExpand(task: GanttTask, expandedSet: Set<string>): void {
    if (task.isExpanded) { expandedSet.delete(task.id); task.isExpanded = false; }
    else { expandedSet.add(task.id); task.isExpanded = true; }
}

/* ─── Critical path (simplified forward/backward pass) ─── */
export function computeCriticalPath(
    leafTasks: GanttTask[],
    taskById: Map<string, GanttTask>,
): Set<string> {
    const ids = new Set<string>();
    const leaves = leafTasks.filter(t => !t.isGroup && !t.isMilestone);
    if (leaves.length === 0) return ids;

    const earlyFinish = new Map<string, number>();
    for (const t of leaves) {
        let ef = t.end.getTime();
        for (const depId of t.dependencyIds) {
            const dep = taskById.get(depId);
            if (dep) {
                const depEf = earlyFinish.get(depId) ?? dep.end.getTime();
                const dur = t.end.getTime() - t.start.getTime();
                ef = Math.max(ef, depEf + dur);
            }
        }
        earlyFinish.set(t.id, ef);
    }

    let projectEnd = -Infinity;
    for (const [, ef] of earlyFinish) { if (ef > projectEnd) projectEnd = ef; }

    const lateStart = new Map<string, number>();
    for (let i = leaves.length - 1; i >= 0; i--) {
        const t = leaves[i];
        const dur = t.end.getTime() - t.start.getTime();
        let ls = projectEnd - dur;
        for (const other of leaves) {
            if (other.dependencyIds.includes(t.id)) {
                const otherLs = lateStart.get(other.id) ?? projectEnd;
                ls = Math.min(ls, otherLs - dur);
            }
        }
        lateStart.set(t.id, ls);
    }

    for (const t of leaves) {
        const ef = earlyFinish.get(t.id) ?? t.end.getTime();
        const ls = lateStart.get(t.id) ?? 0;
        const es = ef - (t.end.getTime() - t.start.getTime());
        t.isCritical = Math.abs(ls - es) < DAY_MS;
        if (t.isCritical) ids.add(t.id);
    }
    return ids;
}

/* ─── Internals ─── */
function makeSyntheticGroup(id: string, name: string, depth: number, hierPath: string[]): GanttTask {
    return {
        index: -1, id, name,
        start: new Date(8640000000000000), end: new Date(-8640000000000000),
        plannedStart: null, plannedEnd: null,
        progress: 0, isMilestone: false, milestoneMarkers: [],
        parentId: "", resource: "", dependencyIds: [],
        priority: "", status: "", wbs: "",
        depth, isGroup: true, isSyntheticGroup: true,
        isExpanded: true, children: [], selectionId: null,
        tooltipExtra: [], color: "", hierarchyPath: hierPath,
        isCritical: false, isVisible: true, duration: 0,
    };
}

function rollUpGroupDates(tasks: GanttTask[]): void {
    for (const t of tasks) {
        if (t.children.length === 0) continue;
        rollUpGroupDates(t.children);
        let minStart = Infinity, maxEnd = -Infinity;
        let progressSum = 0, leafCount = 0;
        collectLeafStats(t, s => {
            if (s.start.getTime() < minStart) minStart = s.start.getTime();
            if (s.end.getTime() > maxEnd) maxEnd = s.end.getTime();
            progressSum += s.progress;
            leafCount++;
        });
        if (leafCount > 0) {
            t.start = new Date(minStart);
            t.end = new Date(maxEnd);
            t.progress = progressSum / leafCount;
            t.duration = daysBetween(t.start, t.end);
        }
        t.isGroup = true;
    }
}

function collectLeafStats(node: GanttTask, cb: (leaf: GanttTask) => void): void {
    for (const c of node.children) {
        if (c.children.length === 0) cb(c);
        else collectLeafStats(c, cb);
    }
}

function applyExpandState(tasks: GanttTask[], expandedSet: Set<string>): void {
    const isFirstRun = !expandedSet.has("__initialized");
    if (isFirstRun) expandedSet.add("__initialized");
    walkGroups(tasks, t => {
        if (isFirstRun) { expandedSet.add(t.id); t.isExpanded = true; }
        else { t.isExpanded = expandedSet.has(t.id); }
    });
}

function setDepth(tasks: GanttTask[], d: number): void {
    for (const t of tasks) { t.depth = d; setDepth(t.children, d + 1); }
}

function walkGroups(tasks: GanttTask[], fn: (t: GanttTask) => void): void {
    for (const t of tasks) {
        if (t.isGroup) fn(t);
        if (t.children.length > 0) walkGroups(t.children, fn);
    }
}

```


### 📄 src\model\parser.ts

```typescript
import powerbi from "powerbi-visuals-api";
import type { ColumnIndex, GanttTask, MilestoneMarker } from "../types";
import { RESOURCE_COLORS } from "../constants";
import { toDate, daysBetween } from "../utils/date";
import { clamp } from "../utils/dom";
import { isHexColor } from "../utils/color";

export interface ParseResult {
    tasks: GanttTask[];
    taskById: Map<string, GanttTask>;
    resourceColorMap: Map<string, string>;
    colorFieldMap: Map<string, string>;
}

/**
 * Parse every row of the DataViewTable into leaf GanttTask objects.
 * Rows that lack valid start/end dates are silently skipped.
 */
export function parseLeafRows(
    table: powerbi.DataViewTable,
    cols: ColumnIndex,
    host: powerbi.extensibility.visual.IVisualHost,
): ParseResult {
    const tasks: GanttTask[] = [];
    const taskById = new Map<string, GanttTask>();
    const resourceColorMap = new Map<string, string>();
    const colorFieldMap = new Map<string, string>();
    let resourceIdx = 0;
    let colorFieldIdx = 0;

    for (let r = 0; r < table.rows.length; r++) {
        const row = table.rows[r];

        /* Hierarchy path */
        const hierPath: string[] = [];
        for (const colIdx of cols.taskNames) {
            const v = row[colIdx];
            hierPath.push(v != null ? String(v) : "");
        }
        let displayName = "";
        for (let h = hierPath.length - 1; h >= 0; h--) {
            if (hierPath[h].length > 0) { displayName = hierPath[h]; break; }
        }
        if (displayName === "") displayName = "(unnamed)";

        /* Dates */
        const startRaw = toDate(row[cols.startDate]);
        const endRaw = toDate(row[cols.endDate]);
        if (!startRaw || !endRaw) continue;
        const start = startRaw;
        const end = endRaw < startRaw ? startRaw : endRaw;

        const plannedStart = cols.plannedStart >= 0 ? toDate(row[cols.plannedStart]) : null;
        const plannedEnd = cols.plannedEnd >= 0 ? toDate(row[cols.plannedEnd]) : null;

        /* Task ID */
        let id = "row_" + r;
        if (cols.taskId >= 0 && row[cols.taskId] != null) {
            id = String(row[cols.taskId]).trim();
        }

        /* Progress (stored 0-1 internally; F2) */
        const progress = parseProgress(row, cols);

        /* Milestones */
        const milestoneMarkers: MilestoneMarker[] = [];
        let isMilestone = false;
        for (let mi = 0; mi < cols.milestones.length; mi++) {
            const mcol = cols.milestones[mi];
            const mv = row[mcol];
            if (mv == null) continue;
            const msDate = toDate(mv);
            if (msDate) {
                milestoneMarkers.push({
                    date: msDate,
                    label: table.columns[mcol].displayName || "Milestone " + (mi + 1),
                    styleIndex: mi,
                });
            } else {
                const mvStr = String(mv).toLowerCase().trim();
                if (mv === true || mv === 1 || ["true", "yes", "1", "y", "milestone"].includes(mvStr)) {
                    isMilestone = true;
                }
            }
        }
        if (!isMilestone && milestoneMarkers.length === 0 && start.getTime() === end.getTime()) {
            isMilestone = true;
        }

        const parentId = cols.parent >= 0 && row[cols.parent] != null ? String(row[cols.parent]).trim() : "";
        const resource = cols.resource >= 0 && row[cols.resource] != null ? String(row[cols.resource]).trim() : "";

        let dependencyIds: string[] = [];
        if (cols.dependencies >= 0 && row[cols.dependencies] != null) {
            const dStr = String(row[cols.dependencies]).trim();
            if (dStr.length > 0) {
                dependencyIds = dStr.split(/[,;|]+/).map(s => s.trim()).filter(s => s.length > 0);
            }
        }

        const priority = cols.priority >= 0 && row[cols.priority] != null ? String(row[cols.priority]).trim() : "";
        const status = cols.status >= 0 && row[cols.status] != null ? String(row[cols.status]).trim() : "";
        const wbs = cols.wbs >= 0 && row[cols.wbs] != null ? String(row[cols.wbs]).trim() : "";

        /* Color field / resource colour */
        let color = "";
        if (cols.colorField >= 0 && row[cols.colorField] != null) {
            const cv = String(row[cols.colorField]).trim();
            if (isHexColor(cv)) {
                color = cv;
            } else {
                if (!colorFieldMap.has(cv)) {
                    colorFieldMap.set(cv, RESOURCE_COLORS[colorFieldIdx % RESOURCE_COLORS.length]);
                    colorFieldIdx++;
                }
                color = colorFieldMap.get(cv)!;
            }
        }
        if (!color && resource.length > 0) {
            if (!resourceColorMap.has(resource)) {
                resourceColorMap.set(resource, RESOURCE_COLORS[resourceIdx % RESOURCE_COLORS.length]);
                resourceIdx++;
            }
            color = resourceColorMap.get(resource)!;
        }

        /* Tooltip extras */
        const tooltipExtra: powerbi.extensibility.VisualTooltipDataItem[] = [];
        for (const ti of cols.tooltipFields) {
            if (row[ti] != null) {
                tooltipExtra.push({ displayName: table.columns[ti].displayName || "", value: String(row[ti]) });
            }
        }

        const selectionId = host.createSelectionIdBuilder().withTable(table, r).createSelectionId();

        tasks.push({
            index: r, id, name: displayName, start, end,
            plannedStart, plannedEnd, progress,
            isMilestone, milestoneMarkers,
            parentId, resource, dependencyIds,
            priority, status, wbs,
            depth: 0, isGroup: false, isSyntheticGroup: false,
            isExpanded: true, children: [], selectionId,
            tooltipExtra, color, hierarchyPath: hierPath,
            isCritical: false, isVisible: true,
            duration: Math.max(0, daysBetween(start, end)),
        });
        taskById.set(id, tasks[tasks.length - 1]);
    }
    return { tasks, taskById, resourceColorMap, colorFieldMap };
}

function parseProgress(
    row: powerbi.DataViewTableRow,
    cols: ColumnIndex,
): number {
    if (cols.progress < 0 || row[cols.progress] == null) return 0;
    const pv = Number(row[cols.progress]);
    if (isNaN(pv)) return 0;
    if (cols.progressBase >= 0 && row[cols.progressBase] != null) {
        const base = Number(row[cols.progressBase]);
        if (!isNaN(base) && base > 0) return clamp(pv / base, 0, 1);
    }
    let normalized = pv;
    if (normalized > 1 && normalized <= 100) normalized /= 100;
    else if (normalized > 100) normalized = 1;
    return clamp(normalized, 0, 1);
}

```


### 📄 src\render\grid.ts

```typescript
import type { GanttTask, RenderConfig, DateFormat } from "../types";
import { STATUS_COLORS } from "../constants";
import { formatDateCustom } from "../utils/date";
import { el, clearChildren } from "../utils/dom";
import { resolveStatusColor } from "../utils/color";

/**
 * Render the grid pane (header + body rows).
 */
export function renderGridHeader(
    gridHeader: HTMLDivElement,
    cfg: RenderConfig,
): void {
    clearChildren(gridHeader);
    const g = cfg.grid;
    const h = cfg.header;

    gridHeader.style.height = h.headerHeight + "px";
    gridHeader.style.fontSize = g.textSize + "pt";
    gridHeader.style.background = g.gridHeaderBackground;
    gridHeader.style.color = g.gridHeaderFontColor;

    const hRow = el("div", "gantt-grid-header-row");
    addHeaderCell(hRow, "Task", "gantt-grid-cell-name");
    if (g.showWbsColumn) addHeaderCell(hRow, "WBS", "gantt-grid-cell-extra");
    if (g.showDateColumns) {
        addHeaderCell(hRow, "Start", "gantt-grid-cell-date");
        addHeaderCell(hRow, "End", "gantt-grid-cell-date");
    }
    if (g.showDurationColumn) addHeaderCell(hRow, "Dur.", "gantt-grid-cell-num");
    if (g.showProgressColumn) addHeaderCell(hRow, "%", "gantt-grid-cell-num");
    if (g.showResourceColumn) addHeaderCell(hRow, "Resource", "gantt-grid-cell-extra");
    if (g.showStatusColumn) addHeaderCell(hRow, "Status", "gantt-grid-cell-extra");
    if (g.showPriorityColumn) addHeaderCell(hRow, "Priority", "gantt-grid-cell-extra");
    gridHeader.appendChild(hRow);
}

export interface GridBodyCallbacks {
    onToggle: (task: GanttTask) => void;
    onClick: (task: GanttTask, e: MouseEvent) => void;
}

/**
 * Render all grid body rows using normal document flow.
 */
export function renderGridBody(
    gridBody: HTMLDivElement,
    flatVisible: GanttTask[],
    cfg: RenderConfig,
    cbs: GridBodyCallbacks,
): void {
    clearChildren(gridBody);
    const g = cfg.grid;
    const rowH = cfg.task.rowHeight;

    gridBody.style.fontSize = g.textSize + "pt";
    gridBody.style.color = g.gridFontColor;

    for (let idx = 0; idx < flatVisible.length; idx++) {
        const task = flatVisible[idx];
        const row = el("div", "gantt-grid-row");
        if (task.isSyntheticGroup || task.isGroup) row.className += " gantt-grid-row-group";
        row.style.height = rowH + "px";
        row.style.lineHeight = rowH + "px";
        row.style.borderBottomColor = g.gridLineColor;
        row.style.backgroundColor = idx % 2 === 0 ? cfg.colors.rowEvenColor : cfg.colors.rowOddColor;

        /* Name cell */
        const nameCell = el("span", "gantt-grid-cell gantt-grid-cell-name");
        nameCell.style.paddingLeft = (6 + task.depth * g.indentSize) + "px";

        if (task.isGroup) {
            const toggle = el("span", "gantt-toggle", task.isExpanded ? "▾" : "▸");
            toggle.addEventListener("click", (e) => { e.stopPropagation(); cbs.onToggle(task); });
            nameCell.appendChild(toggle);
        } else {
            nameCell.appendChild(el("span", "gantt-toggle-spacer"));
        }

        const nameSpan = el("span", "gantt-task-label", task.name);
        nameSpan.title = task.name;
        if (task.isCritical) nameSpan.classList.add("gantt-critical-label");
        nameCell.appendChild(nameSpan);
        row.appendChild(nameCell);

        if (g.showWbsColumn) addBodyCell(row, task.wbs, "gantt-grid-cell-extra");
        if (g.showDateColumns) {
            addBodyCell(row, formatDateCustom(task.start, g.dateFormat), "gantt-grid-cell-date");
            addBodyCell(row, formatDateCustom(task.end, g.dateFormat), "gantt-grid-cell-date");
        }
        if (g.showDurationColumn) addBodyCell(row, task.duration + "d", "gantt-grid-cell-num");
        if (g.showProgressColumn) addBodyCell(row, Math.round(task.progress * 100) + "%", "gantt-grid-cell-num");
        if (g.showResourceColumn) addBodyCell(row, task.resource, "gantt-grid-cell-extra");
        if (g.showStatusColumn) {
            const statusCell = addBodyCell(row, task.status, "gantt-grid-cell-extra");
            if (task.status) {
                const sc = resolveStatusColor(task.status);
                if (sc) { statusCell.style.color = sc; statusCell.style.fontWeight = "600"; }
            }
        }
        if (g.showPriorityColumn) addBodyCell(row, task.priority, "gantt-grid-cell-extra");

        row.addEventListener("click", (e) => cbs.onClick(task, e));
        row.dataset.taskId = task.id;
        gridBody.appendChild(row);
    }
}

function addHeaderCell(parent: HTMLElement, text: string, cls: string): void {
    const cell = el("span", "gantt-grid-cell " + cls, text);
    parent.appendChild(cell);
}

function addBodyCell(parent: HTMLElement, text: string, cls: string): HTMLSpanElement {
    const cell = el("span", "gantt-grid-cell " + cls, text);
    cell.title = text;
    parent.appendChild(cell);
    return cell;
}

```


### 📄 src\render\timeline.ts

```typescript
import powerbi from "powerbi-visuals-api";
import { select } from "d3-selection";
import type { Selection } from "d3-selection";
import { timeMonth, timeYear, timeWeek, timeDay } from "d3-time";
import type { TimeInterval } from "d3-time";
import { timeFormat } from "d3-time-format";
import type { ScaleTime } from "d3-scale";
import type { GanttTask, RenderConfig, TaskPosition, DateFormat } from "../types";
import { MIN_BAR_WIDTH, MILESTONE_STYLES, STATUS_COLORS } from "../constants";
import { formatDateCustom, isWeekend } from "../utils/date";

/* ═══════════════════════════════════════════════
   Timeline header
   ═══════════════════════════════════════════════ */
export function renderTimelineHeader(
    svg: SVGSVGElement,
    scale: ScaleTime<number, number>,
    timeMin: Date,
    timeMax: Date,
    pxPerDay: number,
    cfg: RenderConfig,
    sbWidth: number,
): void {
    const totalWidth = scale.range()[1];
    const h = cfg.header;
    const svgWidth = totalWidth + sbWidth;
    const d3svg = select(svg).attr("width", svgWidth).attr("height", h.headerHeight);
    d3svg.selectAll("*").remove();

    d3svg.append("rect")
        .attr("width", svgWidth).attr("height", h.headerHeight)
        .attr("fill", h.headerBackground);

    let topFmt: (d: Date) => string;
    let topInterval: TimeInterval;
    if (pxPerDay >= 15) { topInterval = timeMonth; topFmt = timeFormat("%B %Y"); }
    else if (pxPerDay >= 2) { topInterval = timeMonth; topFmt = timeFormat("%b %Y"); }
    else { topInterval = timeYear; topFmt = timeFormat("%Y"); }

    const topTicks = topInterval.range(timeMin, timeMax);
    const topG = d3svg.append("g").attr("class", "gantt-axis-top");
    topG.selectAll("text").data(topTicks).enter()
        .append("text")
        .attr("x", (d: Date) => scale(d) + 4)
        .attr("y", Math.min(16, h.headerHeight * 0.4))
        .style("font-size", h.headerFontSize + "px")
        .style("font-weight", "600")
        .style("fill", h.headerFontColor)
        .text((d: Date) => topFmt(d));

    if (h.showAxisLines) {
        topG.selectAll("line").data(topTicks).enter()
            .append("line")
            .attr("x1", (d: Date) => scale(d)).attr("x2", (d: Date) => scale(d))
            .attr("y1", 0).attr("y2", h.headerHeight)
            .style("stroke", h.axisLineColor).style("stroke-width", 1);
    }

    let botFmt: (d: Date) => string;
    let botInterval: TimeInterval | null;
    if (pxPerDay >= 30) { botInterval = timeDay; botFmt = timeFormat("%d"); }
    else if (pxPerDay >= 8) { botInterval = timeWeek; botFmt = timeFormat("%d %b"); }
    else if (pxPerDay >= 2) { botInterval = timeMonth; botFmt = timeFormat("%b"); }
    else {
        botInterval = timeMonth.every(3) as TimeInterval;
        botFmt = (d: Date) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
    }

    if (botInterval) {
        const botTicks = botInterval.range(timeMin, timeMax);
        d3svg.append("g").attr("class", "gantt-axis-bot")
            .selectAll("text").data(botTicks).enter()
            .append("text")
            .attr("x", (d: Date) => scale(d) + 4)
            .attr("y", h.headerHeight - 6)
            .style("font-size", (h.headerFontSize - 1) + "px")
            .style("fill", h.headerFontColor)
            .style("opacity", 0.7)
            .text((d: Date) => botFmt(d));
    }
}

/* ═══════════════════════════════════════════════
   Timeline body (virtualized)
   ═══════════════════════════════════════════════ */
export interface TimelineBodyCallbacks {
    onBarClick: (task: GanttTask, e: MouseEvent) => void;
    showTooltip: (task: GanttTask, e: MouseEvent) => void;
    hideTooltip: () => void;
    moveTooltip: (task: GanttTask, e: MouseEvent) => void;
}

export function renderTimelineBody(
    svg: SVGSVGElement,
    flatVisible: GanttTask[],
    scale: ScaleTime<number, number>,
    pxPerDay: number,
    timeMin: Date,
    timeMax: Date,
    cfg: RenderConfig,
    cbs: TimelineBodyCallbacks,
): Map<string, TaskPosition> {
    const totalWidth = scale.range()[1];
    const rowH = cfg.task.rowHeight;
    const barH = cfg.task.barHeight;
    const radius = cfg.task.barCornerRadius;
    const totalHeight = flatVisible.length * rowH;

    const d3svg = select(svg).attr("width", totalWidth).attr("height", totalHeight);
    d3svg.selectAll("*").remove();
    if (flatVisible.length === 0) return new Map();

    const bgG = d3svg.append("g").attr("class", "gantt-bg");

    /* Row stripes – full dataset for background continuity */
    bgG.selectAll("rect.gantt-row-stripe")
        .data(flatVisible).enter()
        .append("rect").attr("class", "gantt-row-stripe")
        .attr("x", 0).attr("y", (_: GanttTask, i: number) => i * rowH)
        .attr("width", totalWidth).attr("height", rowH)
        .style("fill", (_: GanttTask, i: number) =>
            i % 2 === 0 ? cfg.colors.rowEvenColor : cfg.colors.rowOddColor)
        .style("stroke", cfg.grid.gridLineColor)
        .style("stroke-width", 0.5);

    /* Weekend shading */
    if (cfg.timeline.showWeekends && pxPerDay >= 1.5) {
        const weekendDays = timeDay.range(timeMin, timeMax).filter((d: Date) => isWeekend(d));
        bgG.selectAll("rect.gantt-weekend").data(weekendDays).enter()
            .append("rect").attr("class", "gantt-weekend")
            .attr("x", (d: Date) => scale(d)).attr("y", 0)
            .attr("width", pxPerDay).attr("height", totalHeight)
            .style("fill", cfg.timeline.weekendColor)
            .style("opacity", cfg.timeline.weekendOpacity);
    }

    /* Current week highlight */
    if (cfg.timeline.showCurrentWeekHighlight) {
        const today = new Date();
        const weekStart = timeWeek.floor(today);
        const weekEnd = timeWeek.ceil(today);
        if (weekEnd > timeMin && weekStart < timeMax) {
            const x1 = scale(weekStart < timeMin ? timeMin : weekStart);
            const x2 = scale(weekEnd > timeMax ? timeMax : weekEnd);
            bgG.append("rect").attr("x", x1).attr("y", 0)
                .attr("width", x2 - x1).attr("height", totalHeight)
                .style("fill", cfg.timeline.currentWeekColor)
                .style("opacity", 0.3).style("pointer-events", "none");
        }
    }

    /* Horizontal grid lines */
    bgG.selectAll("line.gantt-hline")
        .data(flatVisible).enter()
        .append("line").attr("class", "gantt-hline")
        .attr("x1", 0).attr("x2", totalWidth)
        .attr("y1", (_: GanttTask, i: number) => (i + 1) * rowH)
        .attr("y2", (_: GanttTask, i: number) => (i + 1) * rowH);

    /* Vertical axis lines */
    if (cfg.header.showAxisLines) {
        const vInterval = pxPerDay >= 2 ? timeMonth : timeYear;
        const vTicks = vInterval.range(timeMin, timeMax);
        bgG.selectAll("line.gantt-vline").data(vTicks).enter()
            .append("line").attr("class", "gantt-vline")
            .attr("x1", (d: Date) => scale(d)).attr("x2", (d: Date) => scale(d))
            .attr("y1", 0).attr("y2", totalHeight)
            .style("stroke", cfg.header.axisLineColor)
            .style("stroke-width", 0.5).style("opacity", 0.4);
    }

    /* Task bars */
    const barsG = d3svg.append("g").attr("class", "gantt-bars");
    const taskPosMap = new Map<string, TaskPosition>();

    for (let i = 0; i < flatVisible.length; i++) {
        const task = flatVisible[i];
        const y = i * rowH + (rowH - barH) / 2;
        const x1 = scale(task.start);
        const x2 = scale(task.end);
        const w = Math.max(MIN_BAR_WIDTH, x2 - x1);

        taskPosMap.set(task.id, { x: x1, y: y + barH / 2, w });

        /* Planned bars */
        if (cfg.task.showPlannedBars && task.plannedStart && task.plannedEnd) {
            const px1 = scale(task.plannedStart);
            const px2 = scale(task.plannedEnd);
            const pw = Math.max(MIN_BAR_WIDTH, px2 - px1);
            barsG.append("rect").attr("class", "gantt-planned-bar")
                .attr("x", px1).attr("y", y + barH * 0.6)
                .attr("width", pw).attr("height", barH * 0.35)
                .attr("rx", radius).attr("ry", radius)
                .style("fill", cfg.colors.plannedBarColor)
                .style("opacity", cfg.task.plannedBarOpacity);
        }

        /* Bar colour resolution */
        let barColor = task.color || cfg.colors.defaultBarColor;
        if (cfg.colors.colorByStatus && task.status) {
            const sc = STATUS_COLORS[task.status.toLowerCase()];
            if (sc) barColor = sc;
        } else if (!cfg.colors.colorByResource) {
            barColor = cfg.colors.defaultBarColor;
        }

        /* Render the appropriate shape */
        if (task.isMilestone && task.milestoneMarkers.length === 0) {
            renderMilestone(barsG, task, scale(task.start), y, barH, i, cfg, cbs);
        } else if (task.isGroup) {
            renderGroupBar(barsG, task, x1, y, w, barH, i, cfg, cbs);
        } else {
            renderTaskBar(barsG, task, x1, y, w, barH, radius, i, barColor, cfg, cbs);
        }

        /* Milestone date markers */
        for (const ms of task.milestoneMarkers) {
            const msX = scale(ms.date);
            const style = MILESTONE_STYLES[ms.styleIndex % MILESTONE_STYLES.length];
            renderMilestoneMarker(barsG, task, msX, i * rowH, rowH, style, ms.label, cfg, cbs);
        }

        /* Bar labels */
        if (cfg.labels.showBarLabels && !task.isMilestone && !task.isGroup) {
            renderBarLabel(barsG, task, x1, y, w, barH, cfg);
        }
    }

    /* Dependencies – need positions for all visible tasks */
    if (cfg.dependencies.showDependencies) {
        renderDependencies(d3svg, flatVisible, taskPosMap, cfg);
    }

    /* Today line */
    if (cfg.timeline.showTodayLine) {
        const today = new Date();
        if (today >= timeMin && today <= timeMax) {
            const tx = scale(today);
            const style = cfg.timeline.todayLineStyle;
            let dash = "6 3";
            if (style === "solid") dash = "none";
            else if (style === "dotted") dash = "2 3";
            d3svg.append("line").attr("class", "gantt-today-line")
                .attr("x1", tx).attr("x2", tx).attr("y1", 0).attr("y2", totalHeight)
                .style("stroke", cfg.timeline.todayLineColor)
                .style("stroke-width", cfg.timeline.todayLineWidth)
                .style("stroke-dasharray", dash);
            d3svg.append("text").attr("x", tx + 3).attr("y", 12)
                .style("font-size", "9px").style("fill", cfg.timeline.todayLineColor)
                .style("font-weight", "600").style("pointer-events", "none").text("Today");
        }
    }

    return taskPosMap;
}

/* ═══════════════════════════════════════════════
   Rendering helpers (private)
   ═══════════════════════════════════════════════ */
function renderTaskBar(
    g: Selection<SVGGElement, unknown, null, undefined>,
    task: GanttTask, x: number, y: number, w: number, h: number,
    radius: number, rowIdx: number, fill: string,
    cfg: RenderConfig, cbs: TimelineBodyCallbacks,
): void {
    const barG = g.append("g").attr("class", "gantt-bar-group")
        .attr("data-task-id", task.id).attr("data-row", rowIdx);

    const rect = barG.append("rect").attr("class", "gantt-bar")
        .attr("x", x).attr("y", y).attr("width", w).attr("height", h)
        .attr("rx", radius).attr("ry", radius)
        .style("fill", fill);

    if (cfg.task.barBorderWidth > 0) {
        rect.style("stroke", cfg.task.barBorderColor).style("stroke-width", cfg.task.barBorderWidth);
    }

    if (cfg.criticalPath.showCriticalPath && cfg.criticalPath.highlightCriticalBars && task.isCritical) {
        rect.style("stroke", cfg.colors.criticalPathColor).style("stroke-width", cfg.criticalPath.criticalPathWidth);
    }

    /* Progress overlay */
    if (cfg.task.showProgress && task.progress > 0) {
        const pOpacity = cfg.task.progressOpacity;
        if (cfg.task.progressStyle === "bottomStripe") {
            const stripeH = Math.max(3, h * 0.2);
            barG.append("rect").attr("class", "gantt-progress")
                .attr("x", x).attr("y", y + h - stripeH)
                .attr("width", w * task.progress).attr("height", stripeH)
                .attr("rx", 1).attr("ry", 1)
                .style("fill", cfg.colors.progressColor);
        } else {
            barG.append("rect").attr("class", "gantt-progress")
                .attr("x", x).attr("y", y)
                .attr("width", w * task.progress).attr("height", h)
                .attr("rx", radius).attr("ry", radius)
                .style("fill", cfg.colors.progressColor)
                .style("opacity", pOpacity);
        }
    }

    /* Progress % label inside bar */
    if (cfg.labels.showProgressLabels && w > 35 && task.progress > 0) {
        barG.append("text").attr("class", "gantt-bar-progress-label")
            .attr("x", x + w / 2).attr("y", y + h / 2 + 1)
            .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
            .style("font-size", cfg.labels.progressLabelFontSize + "px")
            .style("fill", "#fff").style("font-weight", "600").style("pointer-events", "none")
            .text(Math.round(task.progress * 100) + "%");
    }

    attachBarInteraction(barG, task, cfg.grid.dateFormat, cbs);
}

function renderGroupBar(
    g: Selection<SVGGElement, unknown, null, undefined>,
    task: GanttTask, x: number, y: number, w: number, h: number,
    rowIdx: number, cfg: RenderConfig, cbs: TimelineBodyCallbacks,
): void {
    const gc = cfg.colors.groupBarColor;
    const style = cfg.task.groupBarStyle;
    const barG = g.append("g").attr("class", "gantt-bar-group gantt-group-bar")
        .attr("data-task-id", task.id).attr("data-row", rowIdx);

    if (style === "thin") {
        const lineY = y + h / 2;
        barG.append("line").attr("x1", x).attr("x2", x + w).attr("y1", lineY).attr("y2", lineY)
            .style("stroke", gc).style("stroke-width", 3);
        barG.append("line").attr("x1", x).attr("x2", x).attr("y1", lineY - 4).attr("y2", lineY + 4)
            .style("stroke", gc).style("stroke-width", 2);
        barG.append("line").attr("x1", x + w).attr("x2", x + w).attr("y1", lineY - 4).attr("y2", lineY + 4)
            .style("stroke", gc).style("stroke-width", 2);
    } else if (style === "flat") {
        const groupH = Math.max(6, h * 0.5);
        const groupY = y + (h - groupH) / 2;
        barG.append("rect").attr("x", x).attr("y", groupY).attr("width", w).attr("height", groupH)
            .attr("rx", 2).attr("ry", 2)
            .style("fill", gc).style("opacity", 0.7);
    } else {
        const groupH = Math.max(6, h * 0.4);
        const groupY = y + (h - groupH) / 2;
        barG.append("rect").attr("x", x).attr("y", groupY).attr("width", w).attr("height", groupH)
            .style("fill", gc);
        const capW = Math.min(6, w / 4);
        barG.append("polygon")
            .attr("points", `${x},${groupY} ${x + capW},${groupY} ${x},${groupY + groupH}`)
            .style("fill", gc);
        barG.append("polygon")
            .attr("points", `${x + w},${groupY} ${x + w - capW},${groupY} ${x + w},${groupY + groupH}`)
            .style("fill", gc);
    }

    attachBarInteraction(barG, task, cfg.grid.dateFormat, cbs);
}

function renderMilestone(
    g: Selection<SVGGElement, unknown, null, undefined>,
    task: GanttTask, cx: number, y: number, h: number,
    rowIdx: number, cfg: RenderConfig, cbs: TimelineBodyCallbacks,
): void {
    const s = cfg.task.milestoneSize / 2;
    const cy = y + h / 2;
    const fill = cfg.colors.milestoneFill;

    const barG = g.append("g").attr("class", "gantt-bar-group gantt-milestone")
        .attr("data-task-id", task.id).attr("data-row", rowIdx);

    barG.append("polygon")
        .attr("points", `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`)
        .style("fill", fill);

    attachBarInteraction(barG, task, cfg.grid.dateFormat, cbs);
}

function renderMilestoneMarker(
    g: Selection<SVGGElement, unknown, null, undefined>,
    task: GanttTask, cx: number, rowTop: number, rowH: number,
    style: { color: string; shape: string }, label: string,
    cfg: RenderConfig, cbs: TimelineBodyCallbacks,
): void {
    const s = cfg.task.milestoneSize / 2;
    const cy = rowTop + rowH / 2;
    const fill = style.color;
    const markerG = g.append("g").attr("class", "gantt-milestone-marker");

    if (style.shape === "circle") {
        markerG.append("circle").attr("cx", cx).attr("cy", cy).attr("r", s)
            .style("fill", fill).style("stroke", "#fff").style("stroke-width", 1.5);
    } else if (style.shape === "triangle") {
        markerG.append("polygon")
            .attr("points", `${cx},${cy - s} ${cx + s},${cy + s} ${cx - s},${cy + s}`)
            .style("fill", fill).style("stroke", "#fff").style("stroke-width", 1.5);
    } else if (style.shape === "star") {
        const points: string[] = [];
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI / 5) * i - Math.PI / 2;
            const r = i % 2 === 0 ? s : s * 0.45;
            points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        markerG.append("polygon").attr("points", points.join(" "))
            .style("fill", fill).style("stroke", "#fff").style("stroke-width", 1.5);
    } else {
        markerG.append("polygon")
            .attr("points", `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`)
            .style("fill", fill).style("stroke", "#fff").style("stroke-width", 1.5);
    }

    /* Milestone-specific tooltip */
    const node = markerG.node() as SVGGElement;
    node.addEventListener("mouseenter", (e: MouseEvent) => {
        cbs.showTooltip(task, e);
    });
    node.addEventListener("mouseleave", () => cbs.hideTooltip());
}

function renderBarLabel(
    g: Selection<SVGGElement, unknown, null, undefined>,
    task: GanttTask, x: number, y: number, w: number, h: number,
    cfg: RenderConfig,
): void {
    const ls = cfg.labels;
    const content = ls.barLabelContent;
    const position = ls.barLabelPosition;
    const fontSize = ls.barLabelFontSize;
    const fontColor = ls.barLabelFontColor;

    let text = "";
    switch (content) {
        case "name": text = task.name; break;
        case "progress": text = Math.round(task.progress * 100) + "%"; break;
        case "resource": text = task.resource; break;
        case "dates": text = formatDateCustom(task.start, cfg.grid.dateFormat) + " – " + formatDateCustom(task.end, cfg.grid.dateFormat); break;
        case "nameAndProgress": text = task.name + " (" + Math.round(task.progress * 100) + "%)"; break;
        case "nameAndResource": text = task.name + (task.resource ? " [" + task.resource + "]" : ""); break;
    }
    if (!text) return;

    const actualPosition = position === "auto" ? (w > 80 ? "inside" : "right") : position;
    let tx: number, anchor: string, color: string;
    if (actualPosition === "inside") { tx = x + w / 2; anchor = "middle"; color = "#fff"; }
    else if (actualPosition === "left") { tx = x - 4; anchor = "end"; color = fontColor; }
    else { tx = x + w + 4; anchor = "start"; color = fontColor; }

    g.append("text").attr("class", "gantt-bar-label-ext")
        .attr("x", tx).attr("y", y + h / 2 + 1)
        .attr("text-anchor", anchor).attr("dominant-baseline", "middle")
        .style("font-size", fontSize + "px").style("fill", color).style("pointer-events", "none")
        .text(text);
}

function renderDependencies(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    flatVisible: GanttTask[],
    posMap: Map<string, TaskPosition>,
    cfg: RenderConfig,
): void {
    const d = cfg.dependencies;
    const lineColor = cfg.colors.dependencyLineColor;
    let dashArray = "none";
    if (d.dependencyLineStyle === "dashed") dashArray = "6 3";
    else if (d.dependencyLineStyle === "dotted") dashArray = "2 3";

    const depG = svg.append("g").attr("class", "gantt-deps");
    const defs = svg.append("defs");
    defs.append("marker").attr("id", "gantt-arrow")
        .attr("viewBox", "0 0 10 10").attr("refX", 10).attr("refY", 5)
        .attr("markerWidth", d.dependencyArrowSize).attr("markerHeight", d.dependencyArrowSize)
        .attr("orient", "auto-start-reverse")
        .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").style("fill", lineColor);

    for (const task of flatVisible) {
        if (task.dependencyIds.length === 0) continue;
        const target = posMap.get(task.id);
        if (!target) continue;
        for (const depId of task.dependencyIds) {
            const source = posMap.get(depId);
            if (!source) continue;
            const sx = source.x + source.w, sy = source.y;
            const tx = target.x, ty = target.y;
            let pathD: string;
            if (d.dependencyRouting === "straight") { pathD = `M ${sx} ${sy} L ${tx} ${ty}`; }
            else if (d.dependencyRouting === "curved") {
                const midX = (sx + tx) / 2;
                pathD = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
            } else {
                const midX = sx + 12;
                pathD = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
            }
            depG.append("path").attr("class", "gantt-dep-line").attr("d", pathD)
                .style("stroke", lineColor).style("stroke-width", d.dependencyLineWidth)
                .style("fill", "none").style("stroke-dasharray", dashArray)
                .attr("marker-end", "url(#gantt-arrow)");
        }
    }
}

function attachBarInteraction(
    barG: Selection<SVGGElement, unknown, null, undefined>,
    task: GanttTask,
    dateFmt: DateFormat,
    cbs: TimelineBodyCallbacks,
): void {
    const node = barG.node() as SVGGElement;
    node.addEventListener("mouseenter", (e: MouseEvent) => cbs.showTooltip(task, e));
    node.addEventListener("mouseleave", () => cbs.hideTooltip());
    node.addEventListener("mousemove", (e: MouseEvent) => cbs.moveTooltip(task, e));
    node.addEventListener("click", (e: MouseEvent) => cbs.onBarClick(task, e));
}

```


### 📄 src\settings.ts

```typescript
import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import type {
    ZoomLevel, TodayLineStyle, ProgressStyle, SortField, SortDirection,
    GroupBarStyle, BarLabelContent, BarLabelPosition, DateFormat,
    LineStyle, DepRouting, RenderConfig,
} from "./types";
import {
    ZOOM_LEVELS, TODAY_LINE_STYLES, PROGRESS_STYLES, SORT_FIELDS, SORT_DIRECTIONS,
    GROUP_BAR_STYLES, BAR_LABEL_CONTENTS, BAR_LABEL_POSITIONS, DATE_FORMATS,
    LINE_STYLES, DEP_ROUTINGS,
} from "./types";

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

/* ═══════════════════════════════════════════════
   F1 – Slice factories (reduce repetition)
   ═══════════════════════════════════════════════ */

/**
 * Validator objects are cast via `as any` to work around a
 * known strict-enum narrowing issue in newer versions of
 * powerbi-visuals-utils-formattingmodel / TypeScript ≥ 5.x
 * where literal `0` is not assignable to `ValidatorType.Max`.
 */
function num(
    name: string, displayName: string, value: number, min: number, max: number,
): formattingSettings.NumUpDown {
    return new formattingSettings.NumUpDown({
        name, displayName, value,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: min } as any,
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: max } as any,
        },
    });
}

/** Percent stored as 0–100 integer in the setting (F2). */
function pct(
    name: string, displayName: string, defaultPct: number,
): formattingSettings.NumUpDown {
    return num(name, displayName, defaultPct, 0, 100);
}

function color(
    name: string, displayName: string, hex: string,
): formattingSettings.ColorPicker {
    return new formattingSettings.ColorPicker({ name, displayName, value: { value: hex } });
}

function toggle(
    name: string, displayName: string, value: boolean,
): formattingSettings.ToggleSwitch {
    return new formattingSettings.ToggleSwitch({ name, displayName, value });
}

type DropItem = { value: string; displayName: string };
function dropdown(
    name: string,
    displayName: string,
    items: readonly string[],
    labels: readonly string[],
    defaultIdx: number,
): formattingSettings.ItemDropdown {
    const dropItems: DropItem[] = items.map((v, i) => ({ value: v, displayName: labels[i] }));
    return new formattingSettings.ItemDropdown({
        name, displayName, items: dropItems,
        value: dropItems[defaultIdx],
    });
}

/* ═══════════════════════════════════════════════
   Cards – object names MUST match capabilities.json (F4)

   Design system: Slate + Blue
   ─────────────────────────────────────────────
   Base:    slate-50  #F8FAFC   slate-100 #F1F5F9
            slate-200 #E2E8F0   slate-300 #CBD5E1
            slate-400 #94A3B8   slate-500 #64748B
            slate-600 #475569   slate-700 #334155
            slate-800 #1E293B   slate-900 #0F172A
   Accent:  blue-500  #3B82F6   blue-600  #2563EB
            blue-700  #1D4ED8   blue-50   #EFF6FF
   Danger:  red-500   #EF4444   red-600   #DC2626
   ═══════════════════════════════════════════════ */
export class TimelineCardSettings extends Card {
    defaultZoom = dropdown("defaultZoom", "Default Zoom Level",
        ZOOM_LEVELS, ["Day", "Week", "Month", "Quarter", "Year", "Fit to Screen"], 5);
    showTodayLine = toggle("showTodayLine", "Show Today Line", true);
    todayLineColor = color("todayLineColor", "Today Line Color", "#EF4444");
    todayLineWidth = num("todayLineWidth", "Today Line Width", 2, 1, 6);
    todayLineStyle = dropdown("todayLineStyle", "Today Line Style",
        TODAY_LINE_STYLES, ["Dashed", "Solid", "Dotted"], 1);
    showWeekends = toggle("showWeekends", "Shade Weekends", false);
    weekendColor = color("weekendColor", "Weekend Shading Color", "#F1F5F9");
    weekendOpacity = pct("weekendOpacity", "Weekend Shading Opacity (%)", 40);
    showCurrentWeekHighlight = toggle("showCurrentWeekHighlight", "Highlight Current Week", true);
    currentWeekColor = color("currentWeekColor", "Current Week Highlight Color", "#EFF6FF");
    timelinePadding = num("timelinePadding", "Timeline Padding (days)", 2, 0, 60);

    name = "timeline";
    displayName = "Timeline";
    slices: Slice[] = [
        this.defaultZoom, this.showTodayLine, this.todayLineColor, this.todayLineWidth, this.todayLineStyle,
        this.showWeekends, this.weekendColor, this.weekendOpacity,
        this.showCurrentWeekHighlight, this.currentWeekColor, this.timelinePadding,
    ];
}

export class TaskCardSettings extends Card {
    rowHeight = num("rowHeight", "Row Height (px)", 22, 16, 80);
    barHeight = num("barHeight", "Bar Height (px)", 18, 6, 60);
    barCornerRadius = num("barCornerRadius", "Bar Corner Radius (px)", 0, 0, 20);
    barBorderWidth = num("barBorderWidth", "Bar Border Width (px)", 0, 0, 4);
    barBorderColor = color("barBorderColor", "Bar Border Color", "#64748B");
    showProgress = toggle("showProgress", "Show Progress Overlay", true);
    progressStyle = dropdown("progressStyle", "Progress Display Style",
        PROGRESS_STYLES, ["Overlay Fill", "Bottom Stripe"], 0);
    progressOpacity = pct("progressOpacity", "Progress Overlay Opacity (%)", 55);
    milestoneSize = num("milestoneSize", "Milestone Size (px)", 14, 6, 30);
    sortBy = dropdown("sortBy", "Sort Tasks By",
        SORT_FIELDS,
        ["Data Order", "Start Date", "End Date", "Task Name", "Progress", "Priority", "Status", "Duration", "Resource"],
        0);
    sortDirection = dropdown("sortDirection", "Sort Direction",
        SORT_DIRECTIONS, ["Ascending", "Descending"], 0);
    showPlannedBars = toggle("showPlannedBars", "Show Planned (Baseline) Bars", false);
    plannedBarOpacity = pct("plannedBarOpacity", "Planned Bar Opacity (%)", 80);
    groupBarStyle = dropdown("groupBarStyle", "Group Bar Style",
        GROUP_BAR_STYLES, ["Bracket (Caps)", "Flat Bar", "Thin Line"], 2);

    name = "taskSettings";
    displayName = "Tasks";
    slices: Slice[] = [
        this.rowHeight, this.barHeight, this.barCornerRadius,
        this.barBorderWidth, this.barBorderColor,
        this.showProgress, this.progressStyle, this.progressOpacity,
        this.milestoneSize, this.sortBy, this.sortDirection,
        this.showPlannedBars, this.plannedBarOpacity, this.groupBarStyle,
    ];
}

export class ColorCardSettings extends Card {
    defaultBarColor = color("defaultBarColor", "Default Bar Color", "#94A3B8");
    selectedBarColor = color("selectedBarColor", "Selected Bar Highlight", "#3B82F6");
    groupBarColor = color("groupBarColor", "Group Summary Bar Color", "#475569");
    dependencyLineColor = color("dependencyLineColor", "Dependency Line Color", "#94A3B8");
    progressColor = color("progressColor", "Progress Overlay Color", "#1D4ED8");
    milestoneFill = color("milestoneFill", "Milestone Color (Fallback)", "#EF4444");
    plannedBarColor = color("plannedBarColor", "Planned (Baseline) Bar Color", "#CBD5E1");
    criticalPathColor = color("criticalPathColor", "Critical Path Highlight Color", "#DC2626");
    colorByResource = toggle("colorByResource", "Color Bars by Resource", true);
    colorByStatus = toggle("colorByStatus", "Color Bars by Status", false);
    rowEvenColor = color("rowEvenColor", "Even Row Background", "#FFFFFF");
    rowOddColor = color("rowOddColor", "Odd Row Background", "#F8FAFC");

    name = "colorSettings";
    displayName = "Colors";
    slices: Slice[] = [
        this.defaultBarColor, this.selectedBarColor, this.groupBarColor,
        this.dependencyLineColor, this.progressColor, this.milestoneFill,
        this.plannedBarColor, this.criticalPathColor,
        this.colorByResource, this.colorByStatus,
        this.rowEvenColor, this.rowOddColor,
    ];
}

export class GridCardSettings extends Card {
    showGrid = toggle("showGrid", "Show Grid Pane", true);
    gridWidth = num("gridWidth", "Grid Width (px)", 300, 100, 800);
    textSize = num("textSize", "Text Size (pt)", 9, 7, 24);
    indentSize = num("indentSize", "Indent Per Level (px)", 18, 6, 40);
    showDateColumns = toggle("showDateColumns", "Show Date Columns", false);
    showResourceColumn = toggle("showResourceColumn", "Show Resource Column", false);
    showProgressColumn = toggle("showProgressColumn", "Show Progress Column", false);
    showDurationColumn = toggle("showDurationColumn", "Show Duration Column", true);
    showStatusColumn = toggle("showStatusColumn", "Show Status Column", false);
    showPriorityColumn = toggle("showPriorityColumn", "Show Priority Column", false);
    showWbsColumn = toggle("showWbsColumn", "Show WBS Column", false);
    dateFormat = dropdown("dateFormat", "Date Format",
        DATE_FORMATS, ["2024-01-15", "01/15/2024", "15/01/2024", "15-Jan-24", "Jan 15", "15 Jan 2024"], 0);
    gridHeaderBackground = color("gridHeaderBackground", "Header Background", "#F1F5F9");
    gridHeaderFontColor = color("gridHeaderFontColor", "Header Font Color", "#1E293B");
    gridFontColor = color("gridFontColor", "Grid Font Color", "#334155");
    gridLineColor = color("gridLineColor", "Grid Line Color", "#E2E8F0");
    gridBorderColor = color("gridBorderColor", "Grid/Timeline Border Color", "#CBD5E1");

    name = "gridSettings";
    displayName = "Grid";
    slices: Slice[] = [
        this.showGrid, this.gridWidth, this.textSize, this.indentSize,
        this.showDateColumns, this.showResourceColumn, this.showProgressColumn,
        this.showDurationColumn, this.showStatusColumn, this.showPriorityColumn, this.showWbsColumn,
        this.dateFormat, this.gridHeaderBackground, this.gridHeaderFontColor,
        this.gridFontColor, this.gridLineColor, this.gridBorderColor,
    ];
}

export class LabelCardSettings extends Card {
    showBarLabels = toggle("showBarLabels", "Show Labels on Bars", true);
    barLabelContent = dropdown("barLabelContent", "Bar Label Content",
        BAR_LABEL_CONTENTS, ["Task Name", "Progress %", "Resource", "Date Range", "Name + Progress", "Name + Resource"], 2);
    barLabelPosition = dropdown("barLabelPosition", "Bar Label Position",
        BAR_LABEL_POSITIONS, ["Inside Bar", "Right of Bar", "Left of Bar", "Auto (Inside/Right)"], 1);
    barLabelFontSize = num("barLabelFontSize", "Bar Label Font Size (px)", 10, 7, 18);
    barLabelFontColor = color("barLabelFontColor", "Bar Label Font Color", "#334155");
    showProgressLabels = toggle("showProgressLabels", "Show Progress % in Bar", true);
    progressLabelFontSize = num("progressLabelFontSize", "Progress Label Font Size (px)", 9, 7, 16);

    name = "labelSettings";
    displayName = "Labels";
    slices: Slice[] = [
        this.showBarLabels, this.barLabelContent, this.barLabelPosition,
        this.barLabelFontSize, this.barLabelFontColor,
        this.showProgressLabels, this.progressLabelFontSize,
    ];
}

export class DependencyCardSettings extends Card {
    showDependencies = toggle("showDependencies", "Show Dependency Lines", true);
    dependencyLineWidth = num("dependencyLineWidth", "Line Width (px)", 1.5, 0.5, 5);
    dependencyLineStyle = dropdown("dependencyLineStyle", "Line Style",
        LINE_STYLES, ["Solid", "Dashed", "Dotted"], 0);
    dependencyArrowSize = num("dependencyArrowSize", "Arrow Size (px)", 6, 3, 14);
    dependencyRouting = dropdown("dependencyRouting", "Line Routing",
        DEP_ROUTINGS, ["Orthogonal", "Straight", "Curved"], 0);

    name = "dependencySettings";
    displayName = "Dependencies";
    slices: Slice[] = [this.showDependencies, this.dependencyLineWidth, this.dependencyLineStyle, this.dependencyArrowSize, this.dependencyRouting];
}

export class CriticalPathCardSettings extends Card {
    showCriticalPath = toggle("showCriticalPath", "Enable Critical Path", false);
    criticalPathWidth = num("criticalPathWidth", "Critical Path Border Width (px)", 2, 1, 5);
    highlightCriticalBars = toggle("highlightCriticalBars", "Highlight Critical Bars", true);

    name = "criticalPath";
    displayName = "Critical Path";
    slices: Slice[] = [this.showCriticalPath, this.criticalPathWidth, this.highlightCriticalBars];
}

export class HeaderCardSettings extends Card {
    headerHeight = num("headerHeight", "Header Height (px)", 38, 24, 80);
    headerBackground = color("headerBackground", "Header Background", "#1E293B");
    headerFontColor = color("headerFontColor", "Header Font Color", "#F1F5F9");
    headerFontSize = num("headerFontSize", "Header Font Size (px)", 11, 8, 18);
    showAxisLines = toggle("showAxisLines", "Show Axis Gridlines", true);
    axisLineColor = color("axisLineColor", "Axis Gridline Color", "#CBD5E1");

    name = "headerSettings";
    displayName = "Timeline Header";
    slices: Slice[] = [this.headerHeight, this.headerBackground, this.headerFontColor, this.headerFontSize, this.showAxisLines, this.axisLineColor];
}

export class ToolbarCardSettings extends Card {
    showToolbar = toggle("showToolbar", "Show Toolbar", true);
    showZoomButtons = toggle("showZoomButtons", "Show Zoom Buttons (Day/Week/…)", true);
    showExpandCollapseAll = toggle("showExpandCollapseAll", "Show Expand/Collapse All", true);
    showScrollToToday = toggle("showScrollToToday", "Show Scroll to Today", false);
    showSearchBox = toggle("showSearchBox", "Show Search Box", true);
    toolbarBackground = color("toolbarBackground", "Toolbar Background", "#F8FAFC");
    buttonBackground = color("buttonBackground", "Button Background", "#FFFFFF");
    buttonFontColor = color("buttonFontColor", "Button Font Color", "#334155");
    buttonBorderColor = color("buttonBorderColor", "Button Border Color", "#E2E8F0");
    buttonActiveBackground = color("buttonActiveBackground", "Active Button Background", "#2563EB");
    buttonActiveFontColor = color("buttonActiveFontColor", "Active Button Font Color", "#FFFFFF");

    name = "toolbarSettings";
    displayName = "Toolbar";
    slices: Slice[] = [
        this.showToolbar, this.showZoomButtons, this.showExpandCollapseAll,
        this.showScrollToToday, this.showSearchBox,
        this.toolbarBackground, this.buttonBackground, this.buttonFontColor,
        this.buttonBorderColor, this.buttonActiveBackground, this.buttonActiveFontColor,
    ];
}

export class ScrollbarCardSettings extends Card {
    scrollbarWidth = num("scrollbarWidth", "Scrollbar Width (px)", 8, 4, 20);
    scrollbarTrackColor = color("scrollbarTrackColor", "Track Color", "#F1F5F9");
    scrollbarThumbColor = color("scrollbarThumbColor", "Thumb Color", "#CBD5E1");
    scrollbarThumbHoverColor = color("scrollbarThumbHoverColor", "Thumb Hover Color", "#94A3B8");
    scrollbarBorderRadius = num("scrollbarBorderRadius", "Thumb Border Radius (px)", 4, 0, 10);

    name = "scrollbarSettings";
    displayName = "Scrollbar";
    slices: Slice[] = [this.scrollbarWidth, this.scrollbarTrackColor, this.scrollbarThumbColor, this.scrollbarThumbHoverColor, this.scrollbarBorderRadius];
}

/* ═══════════════════════════════════════════════
   Root Model
   ═══════════════════════════════════════════════ */
export class VisualFormattingSettingsModel extends Model {
    timelineCard = new TimelineCardSettings();
    taskCard = new TaskCardSettings();
    colorCard = new ColorCardSettings();
    gridCard = new GridCardSettings();
    labelCard = new LabelCardSettings();
    dependencyCard = new DependencyCardSettings();
    criticalPathCard = new CriticalPathCardSettings();
    headerCard = new HeaderCardSettings();
    toolbarCard = new ToolbarCardSettings();
    scrollbarCard = new ScrollbarCardSettings();

    cards = [
        this.timelineCard, this.taskCard, this.colorCard, this.gridCard,
        this.labelCard, this.dependencyCard, this.criticalPathCard,
        this.headerCard, this.toolbarCard, this.scrollbarCard,
    ];
}

/* ═══════════════════════════════════════════════
   G6 – Build RenderConfig from formatting model.
   All percent values stored 0–100 are converted to
   0–1 fractions here. Invalid enums are sanitized to
   defaults.
   ═══════════════════════════════════════════════ */
function safeEnum<T extends string>(
    val: string | undefined,
    allowed: readonly T[],
    fallback: T,
): T {
    if (val && (allowed as readonly string[]).includes(val)) return val as T;
    return fallback;
}

function cv(cp: formattingSettings.ColorPicker): string {
    return cp.value.value;
}

function dv(dd: formattingSettings.ItemDropdown): string {
    const v = dd.value?.value;
    return v != null ? String(v) : "";
}

export function buildRenderConfig(m: VisualFormattingSettingsModel): RenderConfig {
    return {
        timeline: {
            defaultZoom: safeEnum<ZoomLevel>(dv(m.timelineCard.defaultZoom), ZOOM_LEVELS, "fit"),
            showTodayLine: m.timelineCard.showTodayLine.value,
            todayLineColor: cv(m.timelineCard.todayLineColor),
            todayLineWidth: m.timelineCard.todayLineWidth.value,
            todayLineStyle: safeEnum<TodayLineStyle>(dv(m.timelineCard.todayLineStyle), TODAY_LINE_STYLES, "dashed"),
            showWeekends: m.timelineCard.showWeekends.value,
            weekendColor: cv(m.timelineCard.weekendColor),
            weekendOpacity: m.timelineCard.weekendOpacity.value / 100,
            showCurrentWeekHighlight: m.timelineCard.showCurrentWeekHighlight.value,
            currentWeekColor: cv(m.timelineCard.currentWeekColor),
            timelinePadding: m.timelineCard.timelinePadding.value,
        },
        task: {
            rowHeight: m.taskCard.rowHeight.value,
            barHeight: m.taskCard.barHeight.value,
            barCornerRadius: m.taskCard.barCornerRadius.value,
            barBorderWidth: m.taskCard.barBorderWidth.value,
            barBorderColor: cv(m.taskCard.barBorderColor),
            showProgress: m.taskCard.showProgress.value,
            progressStyle: safeEnum<ProgressStyle>(dv(m.taskCard.progressStyle), PROGRESS_STYLES, "overlay"),
            progressOpacity: m.taskCard.progressOpacity.value / 100,
            milestoneSize: m.taskCard.milestoneSize.value,
            sortBy: safeEnum<SortField>(dv(m.taskCard.sortBy), SORT_FIELDS, "none"),
            sortDirection: safeEnum<SortDirection>(dv(m.taskCard.sortDirection), SORT_DIRECTIONS, "asc"),
            showPlannedBars: m.taskCard.showPlannedBars.value,
            plannedBarOpacity: m.taskCard.plannedBarOpacity.value / 100,
            groupBarStyle: safeEnum<GroupBarStyle>(dv(m.taskCard.groupBarStyle), GROUP_BAR_STYLES, "thin"),
        },
        colors: {
            defaultBarColor: cv(m.colorCard.defaultBarColor),
            selectedBarColor: cv(m.colorCard.selectedBarColor),
            groupBarColor: cv(m.colorCard.groupBarColor),
            dependencyLineColor: cv(m.colorCard.dependencyLineColor),
            progressColor: cv(m.colorCard.progressColor),
            milestoneFill: cv(m.colorCard.milestoneFill),
            plannedBarColor: cv(m.colorCard.plannedBarColor),
            criticalPathColor: cv(m.colorCard.criticalPathColor),
            colorByResource: m.colorCard.colorByResource.value,
            colorByStatus: m.colorCard.colorByStatus.value,
            rowEvenColor: cv(m.colorCard.rowEvenColor),
            rowOddColor: cv(m.colorCard.rowOddColor),
        },
        grid: {
            showGrid: m.gridCard.showGrid.value,
            gridWidth: m.gridCard.gridWidth.value,
            textSize: m.gridCard.textSize.value,
            indentSize: m.gridCard.indentSize.value,
            showDateColumns: m.gridCard.showDateColumns.value,
            showResourceColumn: m.gridCard.showResourceColumn.value,
            showProgressColumn: m.gridCard.showProgressColumn.value,
            showDurationColumn: m.gridCard.showDurationColumn.value,
            showStatusColumn: m.gridCard.showStatusColumn.value,
            showPriorityColumn: m.gridCard.showPriorityColumn.value,
            showWbsColumn: m.gridCard.showWbsColumn.value,
            dateFormat: safeEnum<DateFormat>(dv(m.gridCard.dateFormat), DATE_FORMATS, "yyyy-MM-dd"),
            gridHeaderBackground: cv(m.gridCard.gridHeaderBackground),
            gridHeaderFontColor: cv(m.gridCard.gridHeaderFontColor),
            gridFontColor: cv(m.gridCard.gridFontColor),
            gridLineColor: cv(m.gridCard.gridLineColor),
            gridBorderColor: cv(m.gridCard.gridBorderColor),
        },
        labels: {
            showBarLabels: m.labelCard.showBarLabels.value,
            barLabelContent: safeEnum<BarLabelContent>(dv(m.labelCard.barLabelContent), BAR_LABEL_CONTENTS, "resource"),
            barLabelPosition: safeEnum<BarLabelPosition>(dv(m.labelCard.barLabelPosition), BAR_LABEL_POSITIONS, "right"),
            barLabelFontSize: m.labelCard.barLabelFontSize.value,
            barLabelFontColor: cv(m.labelCard.barLabelFontColor),
            showProgressLabels: m.labelCard.showProgressLabels.value,
            progressLabelFontSize: m.labelCard.progressLabelFontSize.value,
        },
        dependencies: {
            showDependencies: m.dependencyCard.showDependencies.value,
            dependencyLineWidth: m.dependencyCard.dependencyLineWidth.value,
            dependencyLineStyle: safeEnum<LineStyle>(dv(m.dependencyCard.dependencyLineStyle), LINE_STYLES, "solid"),
            dependencyArrowSize: m.dependencyCard.dependencyArrowSize.value,
            dependencyRouting: safeEnum<DepRouting>(dv(m.dependencyCard.dependencyRouting), DEP_ROUTINGS, "orthogonal"),
        },
        criticalPath: {
            showCriticalPath: m.criticalPathCard.showCriticalPath.value,
            criticalPathWidth: m.criticalPathCard.criticalPathWidth.value,
            highlightCriticalBars: m.criticalPathCard.highlightCriticalBars.value,
        },
        header: {
            headerHeight: m.headerCard.headerHeight.value,
            headerBackground: cv(m.headerCard.headerBackground),
            headerFontColor: cv(m.headerCard.headerFontColor),
            headerFontSize: m.headerCard.headerFontSize.value,
            showAxisLines: m.headerCard.showAxisLines.value,
            axisLineColor: cv(m.headerCard.axisLineColor),
        },
        toolbar: {
            showToolbar: m.toolbarCard.showToolbar.value,
            showZoomButtons: m.toolbarCard.showZoomButtons.value,
            showExpandCollapseAll: m.toolbarCard.showExpandCollapseAll.value,
            showScrollToToday: m.toolbarCard.showScrollToToday.value,
            showSearchBox: m.toolbarCard.showSearchBox.value,
            toolbarBackground: cv(m.toolbarCard.toolbarBackground),
            buttonBackground: cv(m.toolbarCard.buttonBackground),
            buttonFontColor: cv(m.toolbarCard.buttonFontColor),
            buttonBorderColor: cv(m.toolbarCard.buttonBorderColor),
            buttonActiveBackground: cv(m.toolbarCard.buttonActiveBackground),
            buttonActiveFontColor: cv(m.toolbarCard.buttonActiveFontColor),
        },
        scrollbar: {
            scrollbarWidth: m.scrollbarCard.scrollbarWidth.value,
            scrollbarTrackColor: cv(m.scrollbarCard.scrollbarTrackColor),
            scrollbarThumbColor: cv(m.scrollbarCard.scrollbarThumbColor),
            scrollbarThumbHoverColor: cv(m.scrollbarCard.scrollbarThumbHoverColor),
            scrollbarBorderRadius: m.scrollbarCard.scrollbarBorderRadius.value,
        },
    };
}
```


### 📄 src\types.ts

```typescript
import powerbi from "powerbi-visuals-api";
import type ISelectionId from "powerbi-visuals-api";

/* ═══════════════════════════════════════════════
   Enum-like literal unions (A2, F3)
   Shared between settings, config, and render.
   ═══════════════════════════════════════════════ */
export const ZOOM_LEVELS = ["day", "week", "month", "quarter", "year", "fit"] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export const TODAY_LINE_STYLES = ["dashed", "solid", "dotted"] as const;
export type TodayLineStyle = (typeof TODAY_LINE_STYLES)[number];

export const PROGRESS_STYLES = ["overlay", "bottomStripe"] as const;
export type ProgressStyle = (typeof PROGRESS_STYLES)[number];

export const SORT_FIELDS = ["none", "startDate", "endDate", "name", "progress", "priority", "status", "duration", "resource"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export const GROUP_BAR_STYLES = ["bracket", "flat", "thin"] as const;
export type GroupBarStyle = (typeof GROUP_BAR_STYLES)[number];

export const BAR_LABEL_CONTENTS = ["name", "progress", "resource", "dates", "nameAndProgress", "nameAndResource"] as const;
export type BarLabelContent = (typeof BAR_LABEL_CONTENTS)[number];

export const BAR_LABEL_POSITIONS = ["inside", "right", "left", "auto"] as const;
export type BarLabelPosition = (typeof BAR_LABEL_POSITIONS)[number];

export const DATE_FORMATS = ["yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "dd-MMM-yy", "MMM dd", "dd MMM yyyy"] as const;
export type DateFormat = (typeof DATE_FORMATS)[number];

export const LINE_STYLES = ["solid", "dashed", "dotted"] as const;
export type LineStyle = (typeof LINE_STYLES)[number];

export const DEP_ROUTINGS = ["orthogonal", "straight", "curved"] as const;
export type DepRouting = (typeof DEP_ROUTINGS)[number];

/* ═══════════════════════════════════════════════
   Domain model
   ═══════════════════════════════════════════════ */
export interface MilestoneMarker {
    date: Date;
    label: string;
    styleIndex: number;
}

export interface GanttTask {
    index: number;
    id: string;
    name: string;
    start: Date;
    end: Date;
    plannedStart: Date | null;
    plannedEnd: Date | null;
    progress: number;
    isMilestone: boolean;
    milestoneMarkers: MilestoneMarker[];
    parentId: string;
    resource: string;
    dependencyIds: string[];
    priority: string;
    status: string;
    wbs: string;
    depth: number;
    isGroup: boolean;
    isSyntheticGroup: boolean;
    isExpanded: boolean;
    children: GanttTask[];
    selectionId: powerbi.visuals.ISelectionId | null;
    tooltipExtra: powerbi.extensibility.VisualTooltipDataItem[];
    color: string;
    hierarchyPath: string[];
    isCritical: boolean;
    isVisible: boolean;
    duration: number;
}

export interface ColumnIndex {
    taskNames: number[];
    startDate: number;
    endDate: number;
    taskId: number;
    parent: number;
    progress: number;
    progressBase: number;
    milestones: number[];
    resource: number;
    dependencies: number;
    priority: number;
    status: number;
    wbs: number;
    plannedStart: number;
    plannedEnd: number;
    colorField: number;
    tooltipFields: number[];
}

/* ═══════════════════════════════════════════════
   RenderConfig (G6) – single typed mapping layer.
   Produced from formatting settings in one place;
   consumed by all render modules.
   ═══════════════════════════════════════════════ */
export interface RenderConfig {
    timeline: {
        defaultZoom: ZoomLevel;
        showTodayLine: boolean;
        todayLineColor: string;
        todayLineWidth: number;
        todayLineStyle: TodayLineStyle;
        showWeekends: boolean;
        weekendColor: string;
        weekendOpacity: number; // 0-1 fraction
        showCurrentWeekHighlight: boolean;
        currentWeekColor: string;
        timelinePadding: number;
    };
    task: {
        rowHeight: number;
        barHeight: number;
        barCornerRadius: number;
        barBorderWidth: number;
        barBorderColor: string;
        showProgress: boolean;
        progressStyle: ProgressStyle;
        progressOpacity: number; // 0-1 fraction
        milestoneSize: number;
        sortBy: SortField;
        sortDirection: SortDirection;
        showPlannedBars: boolean;
        plannedBarOpacity: number; // 0-1 fraction
        groupBarStyle: GroupBarStyle;
    };
    colors: {
        defaultBarColor: string;
        selectedBarColor: string;
        groupBarColor: string;
        dependencyLineColor: string;
        progressColor: string;
        milestoneFill: string;
        plannedBarColor: string;
        criticalPathColor: string;
        colorByResource: boolean;
        colorByStatus: boolean;
        rowEvenColor: string;
        rowOddColor: string;
    };
    grid: {
        showGrid: boolean;
        gridWidth: number;
        textSize: number;
        indentSize: number;
        showDateColumns: boolean;
        showResourceColumn: boolean;
        showProgressColumn: boolean;
        showDurationColumn: boolean;
        showStatusColumn: boolean;
        showPriorityColumn: boolean;
        showWbsColumn: boolean;
        dateFormat: DateFormat;
        gridHeaderBackground: string;
        gridHeaderFontColor: string;
        gridFontColor: string;
        gridLineColor: string;
        gridBorderColor: string;
    };
    labels: {
        showBarLabels: boolean;
        barLabelContent: BarLabelContent;
        barLabelPosition: BarLabelPosition;
        barLabelFontSize: number;
        barLabelFontColor: string;
        showProgressLabels: boolean;
        progressLabelFontSize: number;
    };
    dependencies: {
        showDependencies: boolean;
        dependencyLineWidth: number;
        dependencyLineStyle: LineStyle;
        dependencyArrowSize: number;
        dependencyRouting: DepRouting;
    };
    criticalPath: {
        showCriticalPath: boolean;
        criticalPathWidth: number;
        highlightCriticalBars: boolean;
    };
    header: {
        headerHeight: number;
        headerBackground: string;
        headerFontColor: string;
        headerFontSize: number;
        showAxisLines: boolean;
        axisLineColor: string;
    };
    toolbar: {
        showToolbar: boolean;
        showZoomButtons: boolean;
        showExpandCollapseAll: boolean;
        showScrollToToday: boolean;
        showSearchBox: boolean;
        toolbarBackground: string;
        buttonBackground: string;
        buttonFontColor: string;
        buttonBorderColor: string;
        buttonActiveBackground: string;
        buttonActiveFontColor: string;
    };
    scrollbar: {
        scrollbarWidth: number;
        scrollbarTrackColor: string;
        scrollbarThumbColor: string;
        scrollbarThumbHoverColor: string;
        scrollbarBorderRadius: number;
    };
}

/** Position info for dependency routing */
export interface TaskPosition {
    x: number;
    y: number;
    w: number;
}

```


### 📄 src\ui\scrollbars.ts

```typescript
import type { RenderConfig } from "../types";

/**
 * Inject scrollbar CSS via CSS custom properties on the container (H2).
 * TS sets variables; LESS consumes them.
 * The <style> tag for webkit overrides is created once and updated.
 */
export class ScrollbarStyler {
    private styleTag: HTMLStyleElement;

    constructor() {
        this.styleTag = document.createElement("style");
        document.head.appendChild(this.styleTag);
    }

    apply(container: HTMLElement, cfg: RenderConfig["scrollbar"]): void {
        /* CSS custom properties on container for LESS consumption */
        const s = container.style;
        s.setProperty("--sb-width", cfg.scrollbarWidth + "px");
        s.setProperty("--sb-track", cfg.scrollbarTrackColor);
        s.setProperty("--sb-thumb", cfg.scrollbarThumbColor);
        s.setProperty("--sb-thumb-hover", cfg.scrollbarThumbHoverColor);
        s.setProperty("--sb-radius", cfg.scrollbarBorderRadius + "px");

        /* Webkit scrollbar overrides (can't use CSS vars in pseudo-selectors in all engines) */
        this.styleTag.textContent = `
.gantt-timeline-body::-webkit-scrollbar { width: ${cfg.scrollbarWidth}px; height: ${cfg.scrollbarWidth}px; }
.gantt-timeline-body::-webkit-scrollbar-track { background: ${cfg.scrollbarTrackColor}; }
.gantt-timeline-body::-webkit-scrollbar-thumb { background: ${cfg.scrollbarThumbColor}; border-radius: ${cfg.scrollbarBorderRadius}px; }
.gantt-timeline-body::-webkit-scrollbar-thumb:hover { background: ${cfg.scrollbarThumbHoverColor}; }
.gantt-timeline-body::-webkit-scrollbar-corner { background: ${cfg.scrollbarTrackColor}; }
.gantt-timeline-body { scrollbar-width: auto; scrollbar-color: ${cfg.scrollbarThumbColor} ${cfg.scrollbarTrackColor}; }`;
    }
}

```


### 📄 src\ui\toolbar.ts

```typescript
import type { ZoomLevel, RenderConfig } from "../types";
import { ZOOM_LEVELS } from "../types";
import { el } from "../utils/dom";

export interface ToolbarCallbacks {
    onZoom: (z: ZoomLevel) => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onScrollToToday: () => void;
    onSearch: (term: string) => void;
}

/**
 * Toolbar – DOM is created once (G2).
 * Only visibility/style attributes are updated on subsequent calls.
 */
export class Toolbar {
    private root: HTMLDivElement;
    private zoomGroup: HTMLDivElement;
    private expandGroup: HTMLDivElement;
    private todayGroup: HTMLDivElement;
    private searchGroup: HTMLDivElement;
    private searchInput: HTMLInputElement;
    private zoomButtons: HTMLButtonElement[] = [];
    private toolButtons: HTMLButtonElement[] = [];

    constructor(parent: HTMLDivElement, cbs: ToolbarCallbacks) {
        this.root = parent;

        /* Zoom group */
        this.zoomGroup = el("div", "gantt-toolbar-group gantt-toolbar-zoom");
        const zoomLabels: Record<ZoomLevel, string> = {
            day: "Day", week: "Week", month: "Month",
            quarter: "Qtr", year: "Year", fit: "Fit",
        };
        for (const key of ZOOM_LEVELS) {
            const btn = el("button", "gantt-zoom-btn", zoomLabels[key]);
            btn.dataset.zoom = key;
            btn.addEventListener("click", () => cbs.onZoom(key));
            this.zoomGroup.appendChild(btn);
            this.zoomButtons.push(btn);
        }
        this.root.appendChild(this.zoomGroup);
        this.root.appendChild(createSep());

        /* Expand/Collapse group */
        this.expandGroup = el("div", "gantt-toolbar-group gantt-toolbar-expand");
        const expandBtn = el("button", "gantt-tool-btn", "▾ Expand All");
        expandBtn.title = "Expand all groups";
        expandBtn.addEventListener("click", () => cbs.onExpandAll());
        this.expandGroup.appendChild(expandBtn);
        const collapseBtn = el("button", "gantt-tool-btn", "▸ Collapse");
        collapseBtn.title = "Collapse all groups";
        collapseBtn.addEventListener("click", () => cbs.onCollapseAll());
        this.expandGroup.appendChild(collapseBtn);
        this.toolButtons.push(expandBtn, collapseBtn);
        this.root.appendChild(this.expandGroup);
        this.root.appendChild(createSep());

        /* Today button */
        this.todayGroup = el("div", "gantt-toolbar-group gantt-toolbar-today");
        const todayBtn = el("button", "gantt-tool-btn", "⊙ Today");
        todayBtn.title = "Scroll to today";
        todayBtn.addEventListener("click", () => cbs.onScrollToToday());
        this.todayGroup.appendChild(todayBtn);
        this.toolButtons.push(todayBtn);
        this.root.appendChild(this.todayGroup);
        this.root.appendChild(createSep());

        /* Search */
        this.searchGroup = el("div", "gantt-toolbar-group gantt-toolbar-search");
        this.searchInput = el("input", "gantt-search-input");
        this.searchInput.type = "text";
        this.searchInput.placeholder = "Search tasks…";
        this.searchInput.addEventListener("input", () => {
            cbs.onSearch(this.searchInput.value.toLowerCase().trim());
        });
        this.searchGroup.appendChild(this.searchInput);
        this.root.appendChild(this.searchGroup);
    }

    /** Update active zoom highlight + toolbar formatting from config. */
    updateState(cfg: RenderConfig["toolbar"], activeZoom: ZoomLevel): void {
        const tb = cfg;
        this.root.style.display = tb.showToolbar ? "" : "none";
        this.root.style.background = tb.toolbarBackground;

        this.zoomGroup.style.display = tb.showZoomButtons ? "" : "none";
        this.expandGroup.style.display = tb.showExpandCollapseAll ? "" : "none";
        this.todayGroup.style.display = tb.showScrollToToday ? "" : "none";
        this.searchGroup.style.display = tb.showSearchBox ? "" : "none";

        for (const btn of this.zoomButtons) {
            const isActive = btn.dataset.zoom === activeZoom;
            btn.classList.toggle("active", isActive);
            btn.style.background = isActive ? tb.buttonActiveBackground : tb.buttonBackground;
            btn.style.color = isActive ? tb.buttonActiveFontColor : tb.buttonFontColor;
            btn.style.borderColor = tb.buttonBorderColor;
        }

        for (const btn of this.toolButtons) {
            btn.style.background = tb.buttonBackground;
            btn.style.color = tb.buttonFontColor;
            btn.style.borderColor = tb.buttonBorderColor;
        }

        this.searchInput.style.background = tb.buttonBackground;
        this.searchInput.style.color = tb.buttonFontColor;
        this.searchInput.style.borderColor = tb.buttonBorderColor;
    }
}

function createSep(): HTMLDivElement {
    return el("div", "gantt-toolbar-sep");
}

```


### 📄 src\utils\color.ts

```typescript
import { RESOURCE_COLORS, STATUS_COLORS } from "../constants";

export function resolveStatusColor(status: string): string | undefined {
    return STATUS_COLORS[status.toLowerCase()];
}

export function assignResourceColor(
    resource: string,
    map: Map<string, string>,
    counter: { idx: number },
): string {
    let c = map.get(resource);
    if (!c) {
        c = RESOURCE_COLORS[counter.idx % RESOURCE_COLORS.length];
        map.set(resource, c);
        counter.idx++;
    }
    return c;
}

/** Is the string a hex colour like #FFF or #FFFFFF? */
export function isHexColor(s: string): boolean {
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
}

```


### 📄 src\utils\date.ts

```typescript
import { DAY_MS } from "../constants";
import type { DateFormat } from "../types";

const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Parse any plausible date value (Date, OLE serial, ISO string). */
export function toDate(v: unknown): Date | null {
    if (v == null) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    const n = Number(v);
    if (!isNaN(n) && n > 25569 && n < 2958465) {
        const d = new Date((n - 25569) * DAY_MS);
        return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(v as string);
    return isNaN(d.getTime()) ? null : d;
}

export function daysBetween(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function isWeekend(d: Date): boolean {
    const day = d.getDay();
    return day === 0 || day === 6;
}

export function formatDateCustom(d: Date, fmt: DateFormat): string {
    const yy = d.getFullYear();
    const mm = d.getMonth();
    const dd = d.getDate();
    switch (fmt) {
        case "MM/dd/yyyy":
            return `${String(mm + 1).padStart(2, "0")}/${String(dd).padStart(2, "0")}/${yy}`;
        case "dd/MM/yyyy":
            return `${String(dd).padStart(2, "0")}/${String(mm + 1).padStart(2, "0")}/${yy}`;
        case "dd-MMM-yy":
            return `${String(dd).padStart(2, "0")}-${MONTH_SHORT[mm]}-${String(yy).slice(-2)}`;
        case "MMM dd":
            return `${MONTH_SHORT[mm]} ${dd}`;
        case "dd MMM yyyy":
            return `${dd} ${MONTH_SHORT[mm]} ${yy}`;
        default:
            return `${yy}-${String(mm + 1).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    }
}

```


### 📄 src\utils\dom.ts

```typescript
/** Clamp a number to [lo, hi]. */
export function clamp(val: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, val));
}

/** Create an element with className and optional text. */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string,
): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
}

/** Remove all child nodes. */
export function clearChildren(parent: HTMLElement): void {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
}

```


### 📄 src\visual.ts

```typescript
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import type { GanttTask, RenderConfig, ZoomLevel } from "./types";
import { VisualFormattingSettingsModel, buildRenderConfig } from "./settings";
import { resolveColumns } from "./model/columns";
import { parseLeafRows } from "./model/parser";
import {
    buildMultiColumnHierarchy, buildExplicitParentHierarchy,
    applySortRecursive, flattenVisible,
    expandAll, collapseAll, toggleExpand,
    computeCriticalPath,
} from "./model/hierarchy";
import { computeTimeRange, computePxPerDay, buildTimeScale } from "./layout/timeScale";
import { renderGridHeader, renderGridBody } from "./render/grid";
import { renderTimelineHeader, renderTimelineBody } from "./render/timeline";
import { Toolbar } from "./ui/toolbar";
import { ScrollbarStyler } from "./ui/scrollbars";
import { applySelectionStyles, handleTaskClick } from "./interactions/selection";
import { el, clamp } from "./utils/dom";
import { formatDateCustom, daysBetween } from "./utils/date";

/* ═══════════════════════════════════════════════
   Visual (orchestrator)
   ═══════════════════════════════════════════════ */
export class Visual implements IVisual {
    private host: IVisualHost;
    private selectionManager: powerbi.extensibility.ISelectionManager;
    private fmtService: FormattingSettingsService;
    private fmtModel!: VisualFormattingSettingsModel;

    /* DOM scaffolding (created once in constructor) */
    private container: HTMLDivElement;
    private errorOverlay: HTMLDivElement;
    private toolbarEl: HTMLDivElement;
    private mainArea: HTMLDivElement;
    private gridPane: HTMLDivElement;
    private gridHeader: HTMLDivElement;
    private gridBody: HTMLDivElement;
    private timelinePane: HTMLDivElement;
    private timelineHeaderWrap: HTMLDivElement;
    private timelineBodyWrap: HTMLDivElement;
    private timelineHeaderSvg: SVGSVGElement;
    private timelineBodySvg: SVGSVGElement;
    private resizeHandle: HTMLDivElement;

    /* Module instances */
    private toolbar: Toolbar;
    private scrollbarStyler: ScrollbarStyler;

    /* Data model */
    private allLeafTasks: GanttTask[] = [];
    private rootTasks: GanttTask[] = [];
    private flatVisible: GanttTask[] = [];
    private expandedSet = new Set<string>();
    private taskById = new Map<string, GanttTask>();
    private hierarchyColumnNames: string[] = [];

    /* View state */
    private timeMin = new Date();
    private timeMax = new Date();
    private currentZoom: ZoomLevel = "fit";
    private pxPerDay = 5;
    private searchTerm = "";
    private isResizingGrid = false;
    private userGridWidth: number | null = null;
    private viewportWidth = 800;
    private viewportHeight = 600;
    private hasRenderedOnce = false;
    private cfg!: RenderConfig;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.fmtService = new FormattingSettingsService();
        this.scrollbarStyler = new ScrollbarStyler();

        /* Build DOM skeleton once (G2) */
        this.container = el("div", "gantt-container");
        options.element.appendChild(this.container);

        this.errorOverlay = el("div", "gantt-error");
        this.container.appendChild(this.errorOverlay);

        this.toolbarEl = el("div", "gantt-toolbar");
        this.container.appendChild(this.toolbarEl);

        this.toolbar = new Toolbar(this.toolbarEl, {
            onZoom: (z) => this.setZoom(z),
            onExpandAll: () => this.doExpandAll(),
            onCollapseAll: () => this.doCollapseAll(),
            onScrollToToday: () => this.scrollToToday(),
            onSearch: (t) => { this.searchTerm = t; this.refreshVisibleAndRender(); },
        });

        this.mainArea = el("div", "gantt-main");
        this.container.appendChild(this.mainArea);

        this.gridPane = el("div", "gantt-grid");
        this.mainArea.appendChild(this.gridPane);

        this.gridHeader = el("div", "gantt-grid-header");
        this.gridPane.appendChild(this.gridHeader);

        this.gridBody = el("div", "gantt-grid-body");
        this.gridPane.appendChild(this.gridBody);

        this.resizeHandle = el("div", "gantt-resize-handle");
        this.mainArea.appendChild(this.resizeHandle);
        this.initResizeHandle();

        this.timelinePane = el("div", "gantt-timeline");
        this.mainArea.appendChild(this.timelinePane);

        this.timelineHeaderWrap = el("div", "gantt-timeline-header");
        this.timelinePane.appendChild(this.timelineHeaderWrap);

        this.timelineHeaderSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.timelineHeaderWrap.appendChild(this.timelineHeaderSvg);

        this.timelineBodyWrap = el("div", "gantt-timeline-body");
        this.timelinePane.appendChild(this.timelineBodyWrap);

        this.timelineBodySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.timelineBodyWrap.appendChild(this.timelineBodySvg);

        /* Scroll sync */
        this.timelineBodyWrap.addEventListener("scroll", () => {
            this.gridBody.scrollTop = this.timelineBodyWrap.scrollTop;
            this.timelineHeaderWrap.scrollLeft = this.timelineBodyWrap.scrollLeft;
        });
        this.gridBody.addEventListener("scroll", () => {
            this.timelineBodyWrap.scrollTop = this.gridBody.scrollTop;
        });

        /* Click-to-deselect */
        this.timelineBodySvg.addEventListener("click", (e: MouseEvent) => {
            if ((e.target as Element) === this.timelineBodySvg) {
                this.selectionManager.clear();
                this.applySelection();
            }
        });
    }

    /* ─── Grid resize handle ─── */
    private initResizeHandle(): void {
        let startX = 0;
        let startWidth = 0;

        const onMouseMove = (ev: MouseEvent): void => {
            if (!this.isResizingGrid) return;
            this.gridPane.style.width = clamp(startWidth + ev.clientX - startX, 100, 800) + "px";
        };
        const onMouseUp = (): void => {
            this.isResizingGrid = false;
            this.userGridWidth = this.gridPane.offsetWidth;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            this.container.classList.remove("gantt-resizing");
        };
        this.resizeHandle.addEventListener("mousedown", (ev: MouseEvent) => {
            this.isResizingGrid = true;
            startX = ev.clientX;
            startWidth = this.gridPane.offsetWidth;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            this.container.classList.add("gantt-resizing");
            ev.preventDefault();
        });
    }

    /* ═══════════════════════════════════════════════
       UPDATE – with type gating (G1)
       ═══════════════════════════════════════════════ */
    public update(options: VisualUpdateOptions): void {
        this.viewportWidth = options.viewport.width;
        this.viewportHeight = options.viewport.height;
        this.container.style.width = this.viewportWidth + "px";
        this.container.style.height = this.viewportHeight + "px";

        /* VisualUpdateType bit flags (const enum – numeric literals only):
           Data = 2, Resize = 4, ViewMode = 8, ResizeEnd = 16, Style = 32 */
        const updateType = options.type ?? 0;
        const hasData = (updateType & 2) !== 0;
        const isResizeOnly = !hasData && (updateType & (4 | 16)) !== 0;

        /* G1: Resize-only – skip data parse, just re-layout + re-render */
        if (isResizeOnly && this.cfg) {
            this.layoutAndRender();
            return;
        }

        const dv = options.dataViews?.[0];
        if (!dv) { this.showError("No data. Add fields to the visual."); return; }

        /* Always refresh formatting model from dataView */
        this.fmtModel = this.fmtService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
        this.cfg = buildRenderConfig(this.fmtModel);

        /* G1: If we already have parsed data and this is not a data update,
           skip the full parse pipeline (pure formatting / style change). */
        if (!hasData && this.flatVisible.length > 0) {
            this.layoutAndRender();
            return;
        }

        /* ─── Full data pipeline ─── */
        const table = dv.table;
        if (!table?.rows?.length) { this.showError("No rows in data."); return; }

        const cols = resolveColumns(table);
        if (cols.taskNames.length === 0 || cols.startDate < 0 || cols.endDate < 0) {
            this.showError("Required fields missing.\nAdd at least one Task Name field, plus Start Date and End Date.");
            return;
        }

        this.hierarchyColumnNames = cols.taskNames.map(i => table.columns[i].displayName || "Task");
        this.hideError();

        /* Parse → hierarchy → sort → flatten */
        const parsed = parseLeafRows(table, cols, this.host);
        this.allLeafTasks = parsed.tasks;
        this.taskById = parsed.taskById;

        if (cols.taskNames.length > 1) {
            this.rootTasks = buildMultiColumnHierarchy(this.allLeafTasks, cols.taskNames.length, this.taskById, this.expandedSet);
        } else {
            this.rootTasks = buildExplicitParentHierarchy(this.allLeafTasks, this.taskById, this.expandedSet);
        }

        applySortRecursive(this.rootTasks, this.cfg.task.sortBy, this.cfg.task.sortDirection);
        this.flatVisible = flattenVisible(this.rootTasks, this.searchTerm);

        /* Time range + critical path */
        const range = computeTimeRange(this.allLeafTasks, this.cfg.timeline.timelinePadding);
        this.timeMin = range.min;
        this.timeMax = range.max;

        if (this.cfg.criticalPath.showCriticalPath) {
            computeCriticalPath(this.allLeafTasks, this.taskById);
        } else {
            for (const t of this.allLeafTasks) t.isCritical = false;
        }

        /* Apply config zoom ONLY on first render – user toolbar choices persist */
        if (!this.hasRenderedOnce) {
            this.currentZoom = this.cfg.timeline.defaultZoom;
            this.hasRenderedOnce = true;
        }

        this.layoutAndRender();
    }

    /* ═══════════════════════════════════════════════
       Render orchestration
       ═══════════════════════════════════════════════ */

    /**
     * Single consistent exit point: apply layout CSS → recompute scale → render DOM.
     * Every update path and user interaction that needs a visual refresh
     * should call this method rather than renderAll() directly.
     */
    private layoutAndRender(): void {
        this.applyLayoutConfig();
        this.renderAll();
    }

    private renderAll(): void {
        const cfg = this.cfg;
        if (!cfg) return;

        /* Recompute pxPerDay from current layout — reading clientWidth
           forces a synchronous reflow so any pending CSS changes
           (from applyLayoutConfig) are reflected before we measure. */
        this.computeAndSetPxPerDay();
        const scale = buildTimeScale(this.timeMin, this.timeMax, this.pxPerDay);

        /* Grid */
        renderGridHeader(this.gridHeader, cfg);
        renderGridBody(this.gridBody, this.flatVisible, cfg, {
            onToggle: (t) => { toggleExpand(t, this.expandedSet); this.refreshVisibleAndRender(); },
            onClick: (t, e) => handleTaskClick(t, e, this.selectionManager, () => this.applySelection()),
        });

        /* Timeline */
        renderTimelineHeader(
            this.timelineHeaderSvg, scale, this.timeMin, this.timeMax,
            this.pxPerDay, cfg, cfg.scrollbar.scrollbarWidth,
        );
        renderTimelineBody(
            this.timelineBodySvg, this.flatVisible,
            scale, this.pxPerDay, this.timeMin, this.timeMax, cfg,
            {
                onBarClick: (t, e) => handleTaskClick(t, e, this.selectionManager, () => this.applySelection()),
                showTooltip: (t, e) => this.showTaskTooltip(t, e),
                hideTooltip: () => this.host.tooltipService.hide({ immediately: true, isTouchEvent: false }),
                moveTooltip: (t, e) => this.host.tooltipService.move({
                    coordinates: [e.clientX, e.clientY], isTouchEvent: false,
                    dataItems: [], identities: t.selectionId ? [t.selectionId] : [],
                }),
            },
        );

        /* Toolbar state */
        this.toolbar.updateState(cfg.toolbar, this.currentZoom);
    }

    private applyLayoutConfig(): void {
        const cfg = this.cfg;

        /* Grid pane visibility */
        this.gridPane.style.display = cfg.grid.showGrid ? "" : "none";
        /* Preserve user-dragged width; fall back to config default */
        const gridW = this.userGridWidth ?? cfg.grid.gridWidth;
        this.gridPane.style.width = gridW + "px";
        this.gridPane.style.borderRightColor = cfg.grid.gridBorderColor;
        this.resizeHandle.style.display = cfg.grid.showGrid ? "" : "none";

        /* Scrollbar */
        this.scrollbarStyler.apply(this.container, cfg.scrollbar);
        this.timelineHeaderWrap.style.paddingRight = cfg.scrollbar.scrollbarWidth + "px";
    }

    /* ═══════════════════════════════════════════════
       Zoom / navigation
       ═══════════════════════════════════════════════ */
    private setZoom(z: ZoomLevel): void {
        this.currentZoom = z;
        this.layoutAndRender();
    }

    private computeAndSetPxPerDay(): void {
        this.pxPerDay = computePxPerDay(
            this.currentZoom, this.timeMin, this.timeMax,
            this.timelinePane.clientWidth,
        );
    }

    private doExpandAll(): void {
        expandAll(this.rootTasks, this.expandedSet);
        this.refreshVisibleAndRender();
    }

    private doCollapseAll(): void {
        collapseAll(this.rootTasks, this.expandedSet);
        this.refreshVisibleAndRender();
    }

    private scrollToToday(): void {
        const today = new Date();
        if (today < this.timeMin || today > this.timeMax) return;
        const scale = buildTimeScale(this.timeMin, this.timeMax, this.pxPerDay);
        const tx = scale(today);
        this.timelineBodyWrap.scrollLeft = Math.max(0, tx - this.timelineBodyWrap.clientWidth / 3);
    }

    private refreshVisibleAndRender(): void {
        this.flatVisible = flattenVisible(this.rootTasks, this.searchTerm);
        this.layoutAndRender();
    }

    /* ═══════════════════════════════════════════════
       Tooltip
       ═══════════════════════════════════════════════ */
    private showTaskTooltip(task: GanttTask, e: MouseEvent): void {
        const fmt = this.cfg.grid.dateFormat;
        const items: VisualTooltipDataItem[] = [
            { displayName: "Task", value: task.name },
            { displayName: "Start", value: formatDateCustom(task.start, fmt) },
            { displayName: "End", value: formatDateCustom(task.end, fmt) },
            { displayName: "Duration", value: task.duration + " days" },
            { displayName: "Progress", value: Math.round(task.progress * 100) + "%" },
        ];
        if (task.resource) items.push({ displayName: "Resource", value: task.resource });
        if (task.status) items.push({ displayName: "Status", value: task.status });
        if (task.priority) items.push({ displayName: "Priority", value: task.priority });
        if (task.wbs) items.push({ displayName: "WBS", value: task.wbs });
        if (task.plannedStart && task.plannedEnd) {
            items.push({ displayName: "Planned Start", value: formatDateCustom(task.plannedStart, fmt) });
            items.push({ displayName: "Planned End", value: formatDateCustom(task.plannedEnd, fmt) });
        }
        if (task.isCritical) items.push({ displayName: "Critical Path", value: "Yes" });
        for (const ms of task.milestoneMarkers) {
            items.push({ displayName: ms.label, value: formatDateCustom(ms.date, fmt) });
        }
        if (task.isSyntheticGroup && task.hierarchyPath.length > 0) {
            for (let i = 0; i < task.hierarchyPath.length; i++) {
                const levelName = i < this.hierarchyColumnNames.length ? this.hierarchyColumnNames[i] : "Level " + (i + 1);
                items.push({ displayName: levelName, value: task.hierarchyPath[i] });
            }
        }
        for (const extra of task.tooltipExtra) items.push(extra);

        this.host.tooltipService.show({
            coordinates: [e.clientX, e.clientY], isTouchEvent: false,
            dataItems: items, identities: task.selectionId ? [task.selectionId] : [],
        });
    }

    /* ─── Selection helper ─── */
    private applySelection(): void {
        applySelectionStyles(
            this.selectionManager, this.flatVisible,
            this.timelineBodySvg, this.gridBody,
            this.cfg.colors.selectedBarColor,
        );
    }

    /* ─── Error state ─── */
    private showError(msg: string): void {
        this.errorOverlay.textContent = msg;
        this.errorOverlay.style.display = "flex";
        this.toolbarEl.style.display = "none";
        this.mainArea.style.display = "none";
    }
    private hideError(): void {
        this.errorOverlay.style.display = "none";
        this.toolbarEl.style.display = "";
        this.mainArea.style.display = "";
    }

    /* ═══════════════════════════════════════════════
       Formatting Model API
       ═══════════════════════════════════════════════ */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.fmtService.buildFormattingModel(this.fmtModel);
    }
}
```


### 📄 style\visual.less

```
/* ═══════════════════════════════════════════════
   Gantt Chart – Power BI Custom Visual Styles
   H1: Reduced nesting, reusable classes
   H2: CSS variables for dynamic styling
   ═══════════════════════════════════════════════ */

.gantt-container {
    --sb-width: 8px;
    --sb-track: #F0F0F0;
    --sb-thumb: #CCCCCC;
    --sb-thumb-hover: #999999;
    --sb-radius: 4px;
}

.gantt-container,
.gantt-container *,
.gantt-container *::before,
.gantt-container *::after { box-sizing: border-box; }

.gantt-container {
    position: relative;
    overflow: hidden;
    font-family: "Segoe UI", "wf_segoe-ui_normal", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 11px;
    color: #333;
    background: #fff;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.gantt-container.gantt-resizing { cursor: col-resize; user-select: none; }

.gantt-error {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 100;
    background: #fff;
    color: #888;
    font-size: 13px;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 32px;
    line-height: 1.8;
    white-space: pre-line;
}

/* ── Toolbar ── */
.gantt-toolbar {
    display: flex;
    flex-shrink: 0;
    height: 34px;
    align-items: center;
    padding: 0 6px;
    border-bottom: 1px solid #e0e0e0;
    background: #fafafa;
    overflow: hidden;
}

.gantt-toolbar-group { display: flex; align-items: center; gap: 2px; }
.gantt-toolbar-sep { width: 1px; height: 18px; background: #ddd; margin: 0 6px; flex-shrink: 0; }

.gantt-zoom-btn,
.gantt-tool-btn {
    height: 24px;
    padding: 0 8px;
    border: 1px solid #ccc;
    border-radius: 3px;
    background: #fff;
    color: #555;
    font-size: 10.5px;
    font-family: inherit;
    cursor: pointer;
    outline: none;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    white-space: nowrap;
}

.gantt-zoom-btn:hover,
.gantt-tool-btn:hover { filter: brightness(0.93); }

.gantt-search-input {
    height: 24px;
    width: 140px;
    padding: 0 8px;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 10.5px;
    font-family: inherit;
    color: #333;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.gantt-search-input:focus { border-color: #0078d4; box-shadow: 0 0 0 1px rgba(0, 120, 212, 0.2); }
.gantt-search-input::placeholder { color: #aaa; }

/* ── Main area ── */
.gantt-main { display: flex; flex: 1; overflow: hidden; min-height: 0; }

.gantt-resize-handle {
    width: 5px;
    flex-shrink: 0;
    cursor: col-resize;
    background: #d0d0d0;
    transition: background 0.15s;
    z-index: 10;
}

.gantt-resize-handle:hover { background: #0078d4; }

/* ── Grid pane ── */
.gantt-grid { flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; background: #fff; }
.gantt-grid-header { flex-shrink: 0; overflow: hidden; border-bottom: 1px solid #ccc; background: #f5f5f5; }
.gantt-grid-header-row { display: flex; width: 100%; font-weight: 600; }

.gantt-grid-body { flex: 1; overflow-y: auto; overflow-x: hidden; position: relative; }
.gantt-grid-body::-webkit-scrollbar { width: 0; height: 0; }
.gantt-grid-body { scrollbar-width: none; }

.gantt-grid-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.1s;
}

.gantt-grid-row:hover { background: rgba(0, 120, 212, 0.06) !important; }
.gantt-grid-row-group { font-weight: 600; }
.gantt-grid-row-selected { background: #e3f0ff !important; }

.gantt-grid-cell { flex-shrink: 0; padding: 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gantt-grid-cell-name { flex: 1; min-width: 0; display: flex; align-items: center; gap: 2px; }
.gantt-grid-cell-date { width: 80px; text-align: center; font-size: 10px; color: #777; }
.gantt-grid-cell-num { width: 44px; text-align: center; font-size: 10px; color: #666; }
.gantt-grid-cell-extra { width: 72px; text-align: left; font-size: 10px; color: #666; }

.gantt-toggle { cursor: pointer; user-select: none; width: 14px; flex-shrink: 0; text-align: center; font-size: 11px; color: #666; }
.gantt-toggle:hover { color: #0078d4; }
.gantt-toggle-spacer { width: 14px; flex-shrink: 0; display: inline-block; }
.gantt-task-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.gantt-critical-label { color: #D32F2F; font-weight: 600; }

/* ── Timeline pane ── */
.gantt-timeline { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.gantt-timeline-header { flex-shrink: 0; overflow: hidden; border-bottom: 1px solid #ccc; background: #f5f5f5; }
.gantt-timeline-header svg { display: block; }
.gantt-timeline-body { flex: 1; overflow: auto; }

/* ── SVG elements ── */
.gantt-hline { stroke: #f0f0f0; stroke-width: 0.5; }
.gantt-vline { pointer-events: none; }
.gantt-bar { cursor: pointer; transition: opacity 0.15s; }
.gantt-bar-group { cursor: pointer; }
.gantt-progress { pointer-events: none; }
.gantt-bar-progress-label { pointer-events: none; text-shadow: 0 0 3px rgba(0, 0, 0, 0.6); }
.gantt-bar-label-ext { pointer-events: none; }
.gantt-planned-bar { pointer-events: none; }
.gantt-group-bar rect,
.gantt-group-bar polygon,
.gantt-group-bar line { cursor: pointer; }
.gantt-milestone polygon,
.gantt-milestone circle { cursor: pointer; }
.gantt-milestone-marker { cursor: pointer; }
.gantt-today-line { pointer-events: none; }
.gantt-weekend { pointer-events: none; }
.gantt-dep-line { pointer-events: none; }

```


### 📄 tsconfig.dev.json

```
{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "sourceMap": true,
        "declaration": true
    }
}
```


### 📄 tsconfig.json

```
{
    "compilerOptions": {
        "ignoreDeprecations": "6.0",
        "allowJs": false,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "target": "es2022",
        "sourceMap": false,
        "declaration": false,
        "outDir": "./.tmp/build/",
        "rootDir": "./src",
        "moduleResolution": "node",
        "lib": ["es2022", "dom"]
    },
    "files": ["./src/visual.ts"],
    "include": ["src/**/*.ts"]
}
```
