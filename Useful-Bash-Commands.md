
# Useful Commands (POWERBI repo)

All commands below are intended to be run from the repo root:

`~/Desktop/8-SANDBOX/POWERBI`

---

## 1) Extract ONLY root `src/` files for every visual into `SOURCE-CONTENT/`

Creates one markdown per visual in `SOURCE-CONTENT/<visual>-src-files.md`, while excluding any subdirectories under `src/`. The extractor runs against the real `./<visual>/src` path, so the markdown header shows the actual source directory (not a temp path).

```bash
mkdir -p SOURCE-CONTENT

for d in */; do
  [ -d "${d}src" ] || continue

  case "${d%/}" in
    node_modules|.git|SOURCE-CONTENT|DROPIN|"3. COMPILED-VISUALS"|"4. DEMO-DATA") continue ;;
  esac

  vis="${d%/}"
  src="./${vis}/src"
  out="./SOURCE-CONTENT/${vis}-src-files.md"

  ignore_dirs="$(
    find "$src" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' 2>/dev/null \
      | paste -sd, - \
      | tr -d '\r'
  )"

  if [ -n "$ignore_dirs" ]; then
    codebase-extractor "$src" --inc-file ".json" -i "$ignore_dirs" -o "$out"
  else
    codebase-extractor "$src" --inc-file ".json" -o "$out"
  fi

  echo "✅ ${vis} -> ${out}"
done
````

---

## 2) Copy latest `.pbiviz` from each visual’s `dist/` into `3. COMPILED-VISUALS/`

Copies the newest `.pbiviz` found in each `./<visual>/dist/` to:

`./3. COMPILED-VISUALS/<visual>.pbiviz`

Overwrites existing output files.

```bash
out_dir="./3. COMPILED-VISUALS"
mkdir -p "$out_dir"

for d in */; do
  vis="${d%/}"

  case "$vis" in
    node_modules|.git|SOURCE-CONTENT|DROPIN|"3. COMPILED-VISUALS"|"4. DEMO-DATA") continue ;;
  esac

  dist="./${vis}/dist"
  [ -d "$dist" ] || continue

  pbiviz_path="$(ls -1t "$dist"/*.pbiviz 2>/dev/null | head -n 1)"
  [ -n "$pbiviz_path" ] || continue

  cp -f "$pbiviz_path" "${out_dir}/${vis}.pbiviz"
  echo "✅ Copied: ${pbiviz_path} -> ${out_dir}/${vis}.pbiviz"
done
```

---

## 3) Copy demo `.csv` from each visual into `4. DEMO-DATA/`

Prefers `*Demo.csv` in the visual root. If none exists, falls back to any `*.csv` in the visual root (non-recursive). Renames output to:

`./4. DEMO-DATA/<visual>.csv`

Overwrites existing output files.

```bash
out_dir="./4. DEMO-DATA"
mkdir -p "$out_dir"

for d in */; do
  vis="${d%/}"

  case "$vis" in
    node_modules|.git|SOURCE-CONTENT|DROPIN|"3. COMPILED-VISUALS"|"4. DEMO-DATA") continue ;;
  esac

  csv_path="$(ls -1t "./${vis}/"*Demo.csv 2>/dev/null | head -n 1)"

  if [ -z "$csv_path" ]; then
    csv_path="$(ls -1t "./${vis}/"*.csv 2>/dev/null | head -n 1)"
  fi

  [ -n "$csv_path" ] || continue

  cp -f "$csv_path" "${out_dir}/${vis}.csv"
  echo "✅ Copied: ${csv_path} -> ${out_dir}/${vis}.csv"
done
```

