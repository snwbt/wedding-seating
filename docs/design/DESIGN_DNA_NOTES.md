# Design DNA — Future Retheme Notes

## Purpose

This document explains how to use future wedding proposal design screenshots to retheme the app. The codebase is structured so ALL visual theming lives in one file (`src/index.css`), making retheme straightforward.

## Workflow When Screenshots Arrive

### Step 1: Extract Design DNA

Use the `design-dna` Claude Code skill:
```
/design-dna
```
Provide the screenshots and ask it to extract:
- Primary background colour
- Text colours (heading, body, muted)
- Accent colour(s)
- Typography feel (serif vs sans, weight, letter-spacing)
- Card/surface treatment (shadows, borders, background)
- Decorative motifs (flourishes, patterns, textures)
- Motion style (how elements enter/exit)

### Step 2: Update CSS Variables

Open `src/index.css` and update the `@theme { }` block:

```css
@theme {
  --color-bg-primary: [extracted background];
  --color-accent: [extracted accent];
  --color-text-primary: [extracted heading colour];
  /* ... etc */
}
```

### Step 3: Update Typography

1. Choose Google Fonts that match the proposal design
2. Update `index.html` `<link>` tags
3. Update `--font-display`, `--font-body`, `--font-accent` in `@theme`

### Step 4: Update Decorative Elements

- Replace `src/assets/floral-divider.svg` with a motif from the proposal
- Adjust the `#root` background gradients in `src/index.css` to match
- Update SVG glow filter colours in `FloorPlan.tsx` if accent colour changed

### Step 5: Update Floorplan Colours

The floorplan uses its own token subset:
- `--color-table-surface` — table fill
- `--color-table-border` — table stroke
- `--color-seat-default` — empty seat
- `--color-seat-highlight` — selected seat (should match accent)
- `--color-floor-bg` — SVG background

### Step 6: Update Animation Style

If the proposal has a specific animation feel:
- Adjust `--ease-elegant` for different curve
- Adjust `--duration-*` tokens
- Edit `src/lib/animations.ts` for variant timings

### Step 7: Update Card Styling

Cards use these tokens:
- `--color-card-surface` — background
- `--color-card-border` — border
- `--shadow-card` — shadow
- `--radius-card` — border radius

## Token → Component Mapping

| What changes | Where it shows |
|---|---|
| `--color-accent` | CTA button, table highlight, seat highlight, result badges |
| `--color-bg-primary` | Page background |
| `--font-display` | Couple names, "Find Your Seat", table numbers |
| `--font-accent` | Tagline, date, "Your seat assignment" |
| `--shadow-glow` | Button hover, table highlight |
| `floral-divider.svg` | Welcome screen between title and date |

## What NOT to Change

- Component structure (React files) — stable regardless of theme
- Data files (JSON) — independent of visual design
- Search logic (Fuse.js config) — independent of visual design
- SVG floorplan coordinate system — only colours/strokes change
