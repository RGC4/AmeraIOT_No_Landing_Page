# Amera — Brand Color System

A reference palette for the Amera website, decks, white papers, and future pages.
Typeface across everything is **Inter** (body + headings).

---

## 0. Typography / Header Hierarchy

One typeface — **Inter** — across the entire site. Three heading tiers:

| Tier             | Example                       | Style                                                              |
| ---------------- | ----------------------------- | ----------------------------------------------------------------- |
| **Hero Title**   | "Vision and Mission"          | Inter Bold, ~30.6/40.8px (`text-[1.9rem] sm:text-[2.55rem]`), white-on-image, inside the hero band (AmeraKey hero is a one-off `text-[27.2px]`) |
| **Section Header** | "Architectural Advantages"  | Inter Bold, ~40.8px (`text-[2.55rem]`, 30.6px mobile), `#111827`, ~1⁄3 inch (32px) space above, optional `#6B7280` subtitle |
| **Card Title**   | "Our Vision", "Industry Challenge" | Inter Bold/Semibold, ~20–24px, inside cards                  |

> Section Headers are the workhorse heading — bold Inter at ~40.8px in `#111827`,
> introducing each content band. Heroes and the nav bar sit outside this scale.

---

## 1. Core Brand Blue (primary)

The signature Amera blue. Defined as the Tailwind `primary` token.

| Role            | Hex       | Tailwind token   | Use                                            |
| --------------- | --------- | ---------------- | ---------------------------------------------- |
| Primary (light) | `#6FB3E0` | `primary-light`  | Hover tints, soft highlights                   |
| **Primary**     | `#4D9FD6` | `primary`        | Buttons, links, icons, accent underlines       |
| Primary (dark)  | `#3480B3` | `primary-dark`   | Button/hover states, gradients                 |

## 2. Deep Navy (authority / dark surfaces)

Used for the CEO quote band, dark CTA gradients, card borders, and the play-icon chip.

| Hex       | Use                                                        |
| --------- | --------------------------------------------------------- |
| `#134C8C` | CEO quote band background                                 |
| `#114D8F` | Card borders + eyebrow icon chip                          |
| `#0E3F75` / `#0D3D72` | Deep gradient stops                           |
| `#1C2F63` / `#1F3A6E` / `#1A2738` | Darkest navy gradient accents    |

## 3. Mid & Accent Blues

| Hex       | Use                                  |
| --------- | ------------------------------------ |
| `#2D74C4` | Mid-blue accent / diagram fills      |
| `#2F6FED` / `#3B6AD6` | Bright accent / link emphasis |

## 4. Light Blue Tints (backgrounds)

Soft, airy fills for cards and callout panels on white.

| Hex       | Use                                          |
| --------- | -------------------------------------------- |
| `#F3F9FE` | Lightest blue wash                           |
| `#EDF5FB` | Light panel / callout background             |
| `#D2E6F3` | Slightly deeper tint / borders               |
| `rgba(77,159,214,0.05)` | `.card-on-white` surface       |

## 5. Brand Green (AmeraSecrets accent)

Used for the AmeraSecrets product wordmark suffix and "secure/success" accents.

| Hex       | Use                                          |
| --------- | -------------------------------------------- |
| `#1D5C3B` | Product wordmark suffix green                |
| `#155C39` | Deep green accent                            |
| `#1F9A63` | Brighter green highlight                     |

---

## 6. Neutrals (text + surfaces)

Standard Tailwind gray ramp. These carry almost all type and backgrounds.

| Role               | Hex       | Tailwind token   |
| ------------------ | --------- | ---------------- |
| Headings           | `#111827` | `text-gray-900`  |
| Body text          | `#4B5563` | `text-gray-600`  |
| Subtitles / muted  | `#6B7280` | `text-gray-500`  |
| Light surface      | `#F9FAFB` | `bg-gray-50`     |
| Light surface 2    | `#F3F4F6` | `bg-gray-100`    |
| White surface      | `#FFFFFF` | `bg-white`       |

### Section band grays (alternating layout)

Sections alternate between **white** and a neutral gray band:

| Hex       | Where                                        |
| --------- | -------------------------------------------- |
| `#DEDEDE` | Homepage alternating gray sections           |
| `#E5E4E2` | Product page alternating gray sections        |

Colored/gray sections are full-bleed (background on the `<section>`, content in an inner `max-w-7xl` wrapper).

---

## 7. Card System

| Class            | Surface                          | Border    |
| ---------------- | -------------------------------- | --------- |
| `.card-on-gray`  | White                            | `#114D8F` |
| `.card-on-white` | `rgba(77,159,214,0.05)` blue wash | `#114D8F` |
| `.card-icon`     | `primary/10` chip, `primary` icon | —         |

Pick the variant by the parent section's background (gray section → `.card-on-gray`, white section → `.card-on-white`). All cards use `rounded-2xl`, soft shadow, and a subtle hover lift.

---

## 8. Quick "starter" palette

If you only need a handful of colors for a paper or new page:

- **Brand Blue** `#4D9FD6`
- **Deep Navy** `#114D8F`
- **Headings** `#111827`
- **Body** `#4B5563`
- **Gray band** `#DEDEDE`
- **Accent Green** `#1D5C3B`
- **White** `#FFFFFF`
