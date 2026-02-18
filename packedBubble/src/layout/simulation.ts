/* ═══════════════════════════════════════════════
   Packed Bubble Chart – Force Simulation (F1)
   Uses d3-force (NOT d3-hierarchy pack).
   Flat array of nodes with scaleSqrt radius.
   ═══════════════════════════════════════════════ */

"use strict";

import {
    forceSimulation,
    forceX,
    forceY,
    forceCollide,
    forceManyBody,
    Simulation,
    SimulationNodeDatum,
} from "d3-force";
import { scaleSqrt } from "d3-scale";

import { BubbleNode, RenderConfig } from "../types";
import { SIM_ALPHA_DECAY, SIM_VELOCITY_DECAY } from "../constants";

/** Mutable simulation node type (d3-force mutates x, y, vx, vy) */
export type SimNode = BubbleNode & SimulationNodeDatum;

export interface SimulationContext {
    simulation: Simulation<SimNode, undefined>;
    nodes: SimNode[];
    groupCentres: Map<string, { x: number; y: number }>;
}

/** Compute radii for all nodes using scaleSqrt */
export function computeRadii(
    nodes: BubbleNode[],
    minValue: number,
    maxValue: number,
    minRadius: number,
    maxRadius: number,
): void {
    const scale = scaleSqrt()
        .domain([Math.max(0, minValue), Math.max(minValue + 1, maxValue)])
        .range([minRadius, maxRadius])
        .clamp(true);

    for (const n of nodes) {
        n.radius = scale(n.value);
    }
}

/** Compute group cluster centre positions.
 *  Groups are laid out in a circle around the viewport centre. */
export function computeGroupCentres(
    groups: string[],
    cx: number,
    cy: number,
    spread: number,
): Map<string, { x: number; y: number }> {
    const map = new Map<string, { x: number; y: number }>();
    const count = groups.length;
    if (count === 0) return map;
    if (count === 1) {
        map.set(groups[0], { x: cx, y: cy });
        return map;
    }
    const angleStep = (2 * Math.PI) / count;
    for (let i = 0; i < count; i++) {
        const angle = angleStep * i - Math.PI / 2;
        map.set(groups[i], {
            x: cx + Math.cos(angle) * spread,
            y: cy + Math.sin(angle) * spread,
        });
    }
    return map;
}

/** Create or restart the force simulation.
 *  Calls onTick for every simulation frame. */
export function createSimulation(
    nodes: SimNode[],
    groups: string[],
    width: number,
    height: number,
    cfg: RenderConfig,
    onTick: () => void,
): SimulationContext {
    const cx = width / 2;
    const cy = height / 2;
    const spread = Math.min(width, height) * 0.25;

    const splitGroups = cfg.force.splitGroups && groups.length > 1;
    const groupCentres = splitGroups
        ? computeGroupCentres(groups, cx, cy, spread)
        : new Map<string, { x: number; y: number }>();

    const strength = cfg.force.simulationStrength;
    const collisionPadding = cfg.force.collisionPadding;

    const simulation = forceSimulation<SimNode>(nodes)
        .alphaDecay(SIM_ALPHA_DECAY)
        .velocityDecay(SIM_VELOCITY_DECAY)
        .force("x", forceX<SimNode>(
            splitGroups
                ? (d) => groupCentres.get(d.group ?? "")?.x ?? cx
                : cx,
        ).strength(strength))
        .force("y", forceY<SimNode>(
            splitGroups
                ? (d) => groupCentres.get(d.group ?? "")?.y ?? cy
                : cy,
        ).strength(strength))
        .force("collide", forceCollide<SimNode>(
            (d) => d.radius + collisionPadding,
        ).iterations(3))
        .force("charge", forceManyBody<SimNode>().strength(-2))
        .on("tick", onTick);

    return { simulation, nodes, groupCentres };
}

/** Restart an existing simulation (e.g. after resize) */
export function restartSimulation(
    ctx: SimulationContext,
    width: number,
    height: number,
    cfg: RenderConfig,
    groups: string[],
): void {
    const cx = width / 2;
    const cy = height / 2;
    const spread = Math.min(width, height) * 0.25;

    const splitGroups = cfg.force.splitGroups && groups.length > 1;
    const groupCentres = splitGroups
        ? computeGroupCentres(groups, cx, cy, spread)
        : new Map<string, { x: number; y: number }>();

    ctx.groupCentres = groupCentres;

    const strength = cfg.force.simulationStrength;
    const collisionPadding = cfg.force.collisionPadding;

    ctx.simulation
        .force("x", forceX<SimNode>(
            splitGroups
                ? (d) => groupCentres.get(d.group ?? "")?.x ?? cx
                : cx,
        ).strength(strength))
        .force("y", forceY<SimNode>(
            splitGroups
                ? (d) => groupCentres.get(d.group ?? "")?.y ?? cy
                : cy,
        ).strength(strength))
        .force("collide", forceCollide<SimNode>(
            (d) => d.radius + collisionPadding,
        ).iterations(3))
        .alpha(1)
        .restart();
}

/** Stop the simulation */
export function stopSimulation(ctx: SimulationContext | null): void {
    if (ctx) ctx.simulation.stop();
}
