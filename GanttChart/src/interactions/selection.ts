import powerbi from "powerbi-visuals-api";
import type { GanttTask } from "../types";

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
