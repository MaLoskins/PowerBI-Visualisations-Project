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
    /* OLE Automation serial: 25569 = 1970-01-01; 2958465 = 9999-12-31 */
    if (!isNaN(n) && n > 25569 && n < 2958465) {
        const d = new Date((n - 25569) * DAY_MS);
        return isNaN(d.getTime()) ? null : d;
    }
    /* String / other coercible value */
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

/**
 * Format a Date using the specified custom format string.
 * Returns an empty string for null/undefined or Invalid Date values
 * rather than throwing or producing "NaN" strings.
 */
export function formatDateCustom(d: Date | null | undefined, fmt: DateFormat): string {
    if (d == null || isNaN(d.getTime())) return "";
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
