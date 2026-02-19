# Performance Flow — Minimal Patch (v3)

## What's in this patch

Only **3 files** were changed. Everything else stays exactly as your original:

| File | Change |
|------|--------|
| `capabilities.json` | Line 24: `"GroupingOrMeasure"` → `"Measure"` for linkColor |
| `src/model/graphBuilder.ts` | **Append only**: added `preAggregateRows()` and `applyTopNGrouping()` after existing code. Zero changes to the original `buildGraph()` or `computeMaxDepth()`. |
| `src/visual.ts` | 3-line diff: added import of new functions + call them between `parseFlowRows()` and `buildGraph()`. |

No changes to: types.ts, settings.ts, constants.ts, sankey.ts, nodes.ts, links.ts, labels.ts, selection.ts, parser.ts, columns.ts, color.ts, dom.ts, format.ts, visual.less, package.json, pbiviz.json.

## Build Instructions (CRITICAL)

The previous builds likely used **cached compiled output** from `.tmp/`.
You MUST clean the cache before rebuilding:

```bash
# 1. Navigate to your project
cd ~/path/to/performanceFlow

# 2. Copy the 3 patched files over the originals
cp patch/capabilities.json ./capabilities.json
cp patch/src/model/graphBuilder.ts ./src/model/graphBuilder.ts
cp patch/src/visual.ts ./src/visual.ts

# 3. CRITICAL: Delete build cache so webpack recompiles from source
rm -rf .tmp dist node_modules/.cache

# 4. Rebuild
pbiviz package

# 5. The new .pbiviz file is in dist/
```

## Verifying the patch works

After loading the new .pbiviz in Power BI, open the browser developer console (F12).
You should see console messages like:

```
[PFlow] Raw rows: 85 → After pre-agg: 42
[PFlow] destination: 21 leaf nodes, limit=8
[PFlow] Grouping 14 destination nodes into: Other (14 categories)
[PFlow] After grouping: 42 rows
```

If you DON'T see these messages, the old cached bundle is still being used.
Run `rm -rf .tmp dist` and rebuild.

## Hardcoded defaults

The grouping uses hardcoded defaults (no settings UI yet — keeping the patch minimal):
- Max 8 destination nodes (top 7 by value + 1 "Other" bucket)
- Max 12 source nodes
- 2% of total flow minimum threshold
