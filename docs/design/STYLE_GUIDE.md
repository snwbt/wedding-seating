# Style Guide — "Sunset Warmth"

## Current Direction

Inspired by the Russell & Siaw Min Save the Date card: golden-hour amber, warm peach sky, muted mountain tones. The palette evokes a sunset walk — copper accents, warm earthy tones, soft sky blue.

## Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#fdf8f3` | Page background (warm cream) |
| `--color-bg-secondary` | `#f7efe6` | Card backgrounds, badges, sections |
| `--color-bg-card` | `#ffffff` | Card surfaces |
| `--color-text-primary` | `#2d2419` | Headings, body text (warm dark brown) |
| `--color-text-secondary` | `#5c4f3e` | Subtitles, labels |
| `--color-text-muted` | `#9c8e7d` | Hints, captions |
| `--color-text-accent` | `#c4883a` | Accent text, highlights |
| `--color-accent` | `#c4883a` | Copper/amber CTA, highlights, glow |
| `--color-accent-light` | `#dbb07a` | Lighter amber touches |
| `--color-rose` | `#d4a088` | Sunset peach accent |
| `--color-blush` | `#faeee8` | Blush background accent |
| `--color-sage` | `#7a9465` | Dietary badge, nature touches |
| `--color-sky` | `#8ba5b8` | Muted blue from mountain photo |

## Typography

| Token | Font | Usage |
|-------|------|-------|
| `--font-script` | Great Vibes | Script/calligraphy (wedding tagline) |
| `--font-display` | Playfair Display | Headings, couple names, table numbers |
| `--font-body` | Inter | Body text, buttons, labels |
| `--font-accent` | Cormorant Garamond | Taglines, dates, italic accents |

## Where to Update

1. **Colours**: `src/index.css` → `@theme { }` block — all `--color-*` tokens
2. **Typography**: `src/index.css` → `--font-*` tokens + Google Fonts in `index.html`
3. **Shadows/Glows**: `src/index.css` → `--shadow-*` tokens
4. **Border Radius**: `src/index.css` → `--radius-*` tokens
5. **Motion**: `src/index.css` → `--ease-elegant`, `--duration-*` tokens + `src/lib/animations.ts`
6. **Hero Image**: `public/hero.jpg` — couple photo for welcome screen background
7. **Floorplan**: `src/data/floorplan.json` — table positions, shapes, decorations
8. **Wedding Details**: `src/lib/constants.ts` — couple names, date, venue

## Design Principles

- Warm sunset tones, not cold. Cream backgrounds, earthy text.
- Copper/amber accents, not champagne gold. Think sunset, not jewelry.
- Script font for the tagline, serif for headings, sans-serif for body.
- Soft shadows, not hard edges. Amber glow for highlights.
- Animations should feel graceful — slow ease-in, never bouncy.
- Mobile-first: guests use this at the venue on phones.
