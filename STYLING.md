# Amera / AmeraKey — Brand & Styling Guide

A reference for keeping graphics, slides, and any externally-created visuals
(e.g. ChatGPT-generated images) consistent with the website. Share this whole
file with ChatGPT and ask it to match these specs.

---

## 1. Typography

- **Typeface:** **Inter** everywhere — headings *and* body. (Fallbacks: `system-ui`, `sans-serif`.)
  Use a single typeface; do not mix in a second font.
- **Heading weight:** Bold (700), tight letter-spacing (`tracking-tight`).
- **Body weight:** Regular (400).

### Type hierarchy
| Role | Size | Weight | Color |
|------|------|--------|-------|
| Hero / H1 | ~2.5–3.5rem (40–56px) | Bold 700 | Near-black `#111827` |
| Section heading / H2 | 1.5rem mobile → 1.8rem desktop (24–29px) | Bold 700 | `#111827` |
| Sub-heading / H3 | ~1.125–1.25rem (18–20px) | Bold 700 | `#111827` |
| Body | 1rem (16px) | Regular 400 | Gray `#4B5563` |
| Small / caption | 0.75–0.875rem (12–14px) | Regular/Bold | Gray `#6B7280` |
| Eyebrow / badge label | 0.75rem (12px) | Bold 700, UPPERCASE, letter-spacing 0.08em | Primary blue `#4D9FD6` |

---

## 2. Color Palette

### Core brand
| Token | Hex | Use |
|-------|-----|-----|
| **Primary (blue)** | `#4D9FD6` | Brand accent, links, icons, badge text, glows |
| Primary light | `#6FB3E0` | Hover/lighter accents |
| Primary dark | `#3480B3` | Pressed states, dark hero backdrop |
| **Accent (orange)** | `#F47700` | Emphasis words inside graphics (e.g. "Sending", "Storing") |

### Neutrals
| Token | Hex | Use |
|-------|-----|-----|
| Heading text | `#111827` (gray-900) | Headings, strong text |
| Body text | `#4B5563` (gray-600) | Paragraphs |
| Muted text | `#6B7280` (gray-500) | Captions, italics |
| White | `#FFFFFF` | Section background A |
| Light gray | `#DEDEDE` / `#E5E4E2` | Section background B (alternating bands) |

### Backgrounds
- Sections alternate between **white** and **light gray** (`#DEDEDE` / `#E5E4E2`).
- Hero / immersive areas use a **dark navy-blue** backdrop with cyan-blue glow.

---

## 3. Component Looks

### Eyebrow / pill badge
Small rounded-full label that sits above section headings.
- Text: primary blue `#4D9FD6`, bold, UPPERCASE, letter-spacing 0.08em, 12px.
- Two fill variants:
  - **Pale blue:** background `#EDF5FB`, thin light-blue border `~#D2E6F3`.
  - **Gray-blue:** background `#CFD7DD`, seamless border (same color).
- Optional left-aligned play triangle icon in primary blue.

### Cards
- Corner radius: `rounded-2xl` (~16px), soft shadow, subtle hover lift.
- **On gray sections:** white surface + light blue border (`primary` @ 20% opacity).
- **On white sections:** very light blue tint (`primary` @ 5%) + blue border (`primary` @ 30%).
- Icon chip inside cards: rounded square, `primary`-at-10% background, primary-blue icon.

### Accent-bar headings (e.g. "Zero Transmission" / "Local Generation")
- Bold dark heading with a **vertical blue left-border** (`#4D9FD6`) as an accent rule,
  followed by gray body text.

---

## 4. Graphics / Illustration Guidance (for ChatGPT image generation)

When generating diagrams or marketing graphics to match the site:

- **Font:** Inter (or closest clean geometric sans). Headings bold + dark `#111827`,
  body gray `#4B5563`.
- **Primary accent:** blue `#4D9FD6` for technology glows, keys, data flows, icons.
- **Emphasis words:** orange `#F47700` (use sparingly, only on key verbs/nouns).
- **Backgrounds:** white or very light gray; avoid heavy colored fills behind text.
- **Hardware/3D renders:** dark device bodies with **cyan-blue internal glow** to match
  the brand's blue.
- Keep generous whitespace, thin rules, and a clean enterprise/security aesthetic.

---

## 5. Brand Marks

- Product names take a registered trademark superscript: **Amera®, AmeraKey®, AmeraSecrets®**.
- Exceptions (no ®): *Amera IoT*, *AmeraQ*.
- Write the company name as **AMERA** (all caps) in logo/wordmark contexts.

---

*Single source of truth: `tailwind.config.js` (colors, fonts) and `src/styles/tailwind.css`
(card system). If those change, update this file to match.*
