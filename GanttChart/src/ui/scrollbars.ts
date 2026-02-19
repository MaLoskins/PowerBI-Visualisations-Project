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
