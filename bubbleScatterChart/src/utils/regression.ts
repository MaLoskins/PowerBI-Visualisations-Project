/* ═══════════════════════════════════════════════
   Regression Utilities
   Linear, polynomial (degree 2), exponential fits
   ═══════════════════════════════════════════════ */

"use strict";

/** A function that maps x → predicted y. */
export type PredictFn = (x: number) => number;

/* ── Linear Regression: y = mx + b ── */

export function linearRegression(
    xs: number[],
    ys: number[],
): PredictFn | null {
    const n = xs.length;
    if (n < 2) return null;

    let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
    for (let i = 0; i < n; i++) {
        sumX += xs[i];
        sumY += ys[i];
        sumXX += xs[i] * xs[i];
        sumXY += xs[i] * ys[i];
    }

    const denom = n * sumXX - sumX * sumX;
    if (Math.abs(denom) < 1e-15) return null;

    const m = (n * sumXY - sumX * sumY) / denom;
    const b = (sumY - m * sumX) / n;

    return (x: number) => m * x + b;
}

/* ── Polynomial Regression: y = ax² + bx + c (degree 2) ── */

/**
 * Solve 3×3 system via Cramer's rule for polynomial fit.
 * Normal equations for degree-2: [Σx⁴ Σx³ Σx²] [a]   [Σx²y]
 *                                 [Σx³ Σx² Σx ] [b] = [Σxy ]
 *                                 [Σx² Σx  n  ] [c]   [Σy  ]
 */
export function polynomialRegression(
    xs: number[],
    ys: number[],
): PredictFn | null {
    const n = xs.length;
    if (n < 3) return null;

    let s0 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0;
    let sy = 0, sxy = 0, sx2y = 0;

    for (let i = 0; i < n; i++) {
        const x = xs[i], y = ys[i];
        const x2 = x * x;
        s0 += 1;
        s1 += x;
        s2 += x2;
        s3 += x2 * x;
        s4 += x2 * x2;
        sy += y;
        sxy += x * y;
        sx2y += x2 * y;
    }

    // 3×3 matrix solve using Cramer's rule
    const M = [
        [s4, s3, s2],
        [s3, s2, s1],
        [s2, s1, s0],
    ];
    const rhs = [sx2y, sxy, sy];

    const det = det3(M);
    if (Math.abs(det) < 1e-15) return null;

    const a = det3(replaceCol(M, rhs, 0)) / det;
    const b = det3(replaceCol(M, rhs, 1)) / det;
    const c = det3(replaceCol(M, rhs, 2)) / det;

    return (x: number) => a * x * x + b * x + c;
}

function det3(m: number[][]): number {
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
}

function replaceCol(
    m: number[][],
    col: number[],
    idx: number,
): number[][] {
    return m.map((row, r) => row.map((v, c) => (c === idx ? col[r] : v)));
}

/* ── Exponential Regression: y = ae^(bx) ── */

/**
 * Fit by taking ln(y) and applying linear regression on (x, ln(y)).
 * Points with y ≤ 0 are skipped. If all y ≤ 0, returns null.
 */
export function exponentialRegression(
    xs: number[],
    ys: number[],
): PredictFn | null {
    const filteredX: number[] = [];
    const filteredLnY: number[] = [];

    for (let i = 0; i < xs.length; i++) {
        if (ys[i] > 0) {
            filteredX.push(xs[i]);
            filteredLnY.push(Math.log(ys[i]));
        } else {
            console.warn(
                `[bscatter] Exponential fit: skipping point (${xs[i]}, ${ys[i]}) — y ≤ 0`,
            );
        }
    }

    if (filteredX.length < 2) {
        console.warn(
            "[bscatter] Exponential fit: insufficient positive y values, falling back to linear.",
        );
        return null;
    }

    const linFn = linearRegression(filteredX, filteredLnY);
    if (!linFn) return null;

    // linFn gives ln(y) = bx + ln(a), so a = e^(ln(a)) and b = slope
    // We reconstruct from the linear coefficients
    const lnA = linFn(0);      // ln(a) = b*0 + ln(a)
    const bCoeff = linFn(1) - lnA; // slope = linFn(1) - linFn(0)
    const aCoeff = Math.exp(lnA);

    return (x: number) => aCoeff * Math.exp(bCoeff * x);
}

/* ── Dispatcher ── */

/**
 * Compute a prediction function based on regression type.
 * Falls back to linear if exponential fails (all y ≤ 0).
 */
export function computeRegression(
    xs: number[],
    ys: number[],
    type: "linear" | "polynomial" | "exponential",
): PredictFn | null {
    switch (type) {
        case "linear":
            return linearRegression(xs, ys);
        case "polynomial":
            return polynomialRegression(xs, ys);
        case "exponential": {
            const fn = exponentialRegression(xs, ys);
            if (fn) return fn;
            // Fallback to linear
            console.warn("[bscatter] Exponential fit failed, falling back to linear.");
            return linearRegression(xs, ys);
        }
        default:
            return linearRegression(xs, ys);
    }
}
