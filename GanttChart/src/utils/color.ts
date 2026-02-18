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
