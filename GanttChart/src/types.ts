import powerbi from "powerbi-visuals-api";

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
    readonly date: Date;
    readonly label: string;
    readonly styleIndex: number;
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
    readonly taskNames: number[];
    readonly startDate: number;
    readonly endDate: number;
    readonly taskId: number;
    readonly parent: number;
    readonly progress: number;
    readonly progressBase: number;
    readonly milestones: number[];
    readonly resource: number;
    readonly dependencies: number;
    readonly priority: number;
    readonly status: number;
    readonly wbs: number;
    readonly plannedStart: number;
    readonly plannedEnd: number;
    readonly colorField: number;
    readonly tooltipFields: number[];
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
    readonly x: number;
    readonly y: number;
    readonly w: number;
}
