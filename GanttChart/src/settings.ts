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