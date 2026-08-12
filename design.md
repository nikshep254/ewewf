---
version: alpha
name: Intercom
website: "https://www.intercom.com"
description: "An editorial customer-service marketing canvas built around a soft cream-white ground, charcoal type set in Saans (Intercom's proprietary geometric sans), and a single confident Fin Orange (#ff5600) reserved for the Fin AI brand. Cards live as floating white tiles with thin hairline borders and minimal radii (8–16px). Display headlines run Saans at weight 500 with measured negative tracking. The system reads as a careful, product-led publication: product screenshots dominate, ornament is rare, and the only place chromatic energy enters is the Fin Orange CTA."

seo:
  title: "Intercom Design System for React — Fin Orange (#ff5600), Saans, and 21 components"
  metaDescription: "Intercom's design system as a DESIGN.md file. Fin Orange #ff5600, Saans, cream canvas #f5f1ec, 21 components. For React, Next.js, and AI tools."
  highlights:
    - "Cream canvas (#f5f1ec) instead of pure white — the warm ground is the brand's defining signal"
    - "Single accent — Fin Orange (#ff5600) reserved for AI-product CTAs and the Fin badge, never decorative"
    - "Saans proprietary sans carries the entire scale at weight 500 display, 400 body — no second display family"
    - "Negative tracking scales with size — -2.0px at 72px display, falling to 0 on body type"
    - "Modest radii — 12px on cards, 16px on product mockups, no pill CTAs anywhere in the system"
  tags:
    - "Communication & Messaging"
    - "AI & LLM Platforms"
  lastUpdated: "2026-05-12"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Intercom's marketing system is the rare SaaS canvas that refuses pure white. The page floor is a soft cream (#f5f1ec) and floating tiles step up onto white (#ffffff) cards bounded by warm hairlines (#d3cec6). The brand reads as editorial — closer to a product-led publication than a marketing site. Display type is Saans, Intercom's proprietary geometric sans, set at weight 500 with measured negative tracking; body type is the same family at weight 400. The only chromatic energy is Fin Orange (#ff5600), and it is scoped strictly to Fin AI product CTAs and the Fin badge. The system trusts product screenshots to do the work that bright color does on other SaaS sites.

    The DESIGN.md file packages 32 color tokens, 14 typography styles, 8 corner radii, 8 spacing values, and 21 components. Colors split into brand, surface, hairlines, ink, and an in-product report palette (#65b5ff, #0bdf50, #ff2067, #b3e01c) that lives inside analytics dashboards rendered in mockups. The format is the Google Labs DESIGN.md spec — a machine-readable file with token references like `{colors.fin-orange}` and `{typography.display-xl}` that designers and AI agents can both parse.

    Feed the file to Claude, Cursor, or GitHub Copilot and the agent will reproduce Intercom's restraint: cream over white, charcoal type, Fin Orange held in reserve. Reference the tokens directly in Tailwind config or CSS variables, or paste the components block into a design audit. The discipline worth studying is the refusal of the single most common SaaS shortcut — gradient hero, pastel section block, drop-shadow card — in favor of one editorial gesture (cream + white) repeated across every section.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://intercom.design"
      title: "Intercom Design"
      description: "Intercom's design team site — case studies on the Fin AI rebrand and the Saans typeface."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is Intercom's primary brand color?"
      answer: "Intercom's system primary is charcoal (#111111), not Fin Orange. Charcoal carries every default CTA, headline, and body label across the marketing surface. Fin Orange (#ff5600) is an AI-product accent reserved exclusively for the Fin CTA and the Fin badge inside pricing — it is not a generic primary and never appears as a section background or generic button color."
    - id: "cream-canvas"
      title: "Why does Intercom use a cream canvas instead of white?"
      answer: "The cream canvas (#f5f1ec) is the brand's defining surface signal — it reads as editorial and calm rather than bright SaaS. White (#ffffff) is reserved for floating cards that lift off the cream ground. The contrast between cream page floor and white card surface is the system's primary depth cue, replacing the drop shadows other systems lean on. There is no pure white canvas anywhere in the public marketing site."
    - id: "typography"
      title: "What typography does Intercom use, and what should I use if Saans isn't available?"
      answer: "Intercom runs Saans, its proprietary geometric sans, for the entire hierarchy — display at weight 500, body at weight 400, plus SaansMono for code inside product mockups. Negative letter-spacing scales with size, from -2.0px at 72px display down to 0 at 16px body. Inter at weight 500 is the closest free substitute; Söhne (paid) or Geist Sans also work. For SaansMono, JetBrains Mono at weight 400 is a clean swap."
    - id: "dark-mode"
      title: "Does Intercom's design system include a dark mode?"
      answer: "No — the public marketing site does not ship a dark theme. The only true-black surface in the system is the testimonial / quote callout strip, which uses inverse-canvas (#000000) and inverse-surface-1 (#313130) as a deliberate accent band rather than a global mode. The DESIGN.md file documents these inverse tokens but they are scoped to that single component."
    - id: "fin-orange-usage"
      title: "When can I use Fin Orange?"
      answer: "Only on Fin AI product surfaces — the `button-fin` CTA on Fin product pages, the Fin badge in pricing tiers, and a small set of inline emphasis moments tied to Fin. Never as a section background, never as a generic primary CTA, and never paired with charcoal CTAs in the same viewport. The system explicitly avoids combining the two button styles to keep the AI product visually distinct from the core marketing CTA."
    - id: "use-in-project"
      title: "How do I use this DESIGN.md to build a React project?"
      answer: "Feed the file to Claude, Cursor, or any agent that reads structured tokens — the AI will reproduce the cream-over-white discipline rather than a generic shadcn theme. You can also reference the 32 color tokens, 14 type styles, and 21 components directly: every value is a quoted hex or size you can paste into Tailwind config, CSS variables, or your own component library. Combine the file with shadcn/ui primitives for fastest setup."

colors:
  primary: "#111111"
  on-primary: "#ffffff"
  ink: "#111111"
  ink-muted: "#626260"
  ink-subtle: "#7b7b78"
  ink-tertiary: "#9c9fa5"
  canvas: "#f5f1ec"
  surface-1: "#ffffff"
  surface-2: "#ebe7e1"
  inverse-canvas: "#000000"
  inverse-surface-1: "#313130"
  inverse-ink: "#ffffff"
  inverse-ink-muted: "#9c9fa5"
  hairline: "#d3cec6"
  hairline-soft: "#ebe7e1"
  fin-orange: "#ff5600"
  report-orange: "#fe4c02"
  report-blue: "#65b5ff"
  report-green: "#0bdf50"
  report-pink: "#ff2067"
  report-lime: "#b3e01c"
  report-cyan: "#03b2cb"
  brand-blue: "#0007cb"
  semantic-error: "#c41c1c"
  semantic-success: "#0bdf50"

typography:
  display-xl:
    fontFamily: Saans
    fontSize: 72px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -2.0px
  display-lg:
    fontFamily: Saans
    fontSize: 56px
    fontWeight: 500
    lineHeight: 1.10
    letterSpacing: -1.4px
  display-md:
    fontFamily: Saans
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.8px
  headline:
    fontFamily: Saans
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: -0.5px
  card-title:
    fontFamily: Saans
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.3px
  subhead:
    fontFamily: Saans
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.2px
  body-lg:
    fontFamily: Saans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.1px
  body:
    fontFamily: Saans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  body-sm:
    fontFamily: Saans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: Saans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  button:
    fontFamily: Saans
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0
  eyebrow:
    fontFamily: Saans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: 0
  mono:
    fontFamily: SaansMono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 18px
  button-primary-pressed:
    backgroundColor: "{colors.inverse-canvas}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 18px
  button-tertiary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 18px
  button-fin:
    backgroundColor: "{colors.fin-orange}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 18px
  pricing-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-card-featured:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  feature-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  product-mockup-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
  testimonial-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  customer-logo-tile:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 16px
  text-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 14px
  text-input-focused:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 14px
  pricing-tab-default:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  pricing-tab-selected:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  faq-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 24px
  cta-banner:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: 48px
  startup-discount-card:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 32px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    height: 56px
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 32px
---

## Overview

Intercom's marketing canvas is a soft cream-white ground (`{colors.canvas}` ≈ #f5f1ec) — not pure white. The warmth is the brand's signal: this is editorial, calm, and product-focused, not bright SaaS. On top of the cream canvas sit white floating cards (`{colors.surface-1}`), thin hairline dividers (`{colors.hairline}`), and charcoal type (`{colors.ink}` #111111).

Display type is **Saans** — Intercom's proprietary geometric sans — set at weight 500 with measured negative letter-spacing (-2.0px on 72px display). Body type is the same family at weight 400. The single proprietary mono is **SaansMono**, used sparingly for code snippets and product UI screenshots embedded in the marketing surface.

The single chromatic accent is **Fin Orange** (`{colors.fin-orange}` #ff5600) — Intercom's AI-product brand color. It surfaces on the Fin product CTA, the Fin badge in pricing, and a few inline emphasis moments. It is NOT a system primary; the system primary is charcoal `{colors.ink}`. Intercom also maintains a small **report palette** (`{colors.report-blue}`, `{colors.report-green}`, `{colors.report-pink}`, `{colors.report-lime}`) used inside in-product analytics surfaces shown in mockups.

The page rhythm is heavy on **product mockups**: every section's payload is a high-fidelity screenshot of Intercom's product UI, framed in white cards with `{rounded.xl}` 16px corners. The marketing chrome is intentionally quiet so the product can be the protagonist.

**Key Characteristics:**
- **Cream canvas** (`{colors.canvas}` #f5f1ec) is the brand's defining surface — neither white nor gray, deliberately warm.
- Product-screenshot-led page rhythm: every section centers a product mockup card, marketing chrome stays minimal.
- **Saans** proprietary sans-serif carries the entire hierarchy; SaansMono for code-only contexts.
- **Charcoal** `{colors.ink}` (#111111) is the system primary — buttons, headlines, body type all sit on charcoal.
- **Fin Orange** (`{colors.fin-orange}` #ff5600) is the AI product color — used on the Fin CTA and Fin badge, never decoratively.
- Display tracking pulls aggressively negative (-2.0px on 72px); body stays at 0.
- Card corners stay modest at `{rounded.lg}` 12px and `{rounded.xl}` 16px — never pill-rounded; never square.

## Known Gaps

- The **report palette** lives in product analytics dashboards rendered inside marketing mockups; they are documented for completeness but are not brand surface colors.
- Form-field error and validation styling is not visible on the inspected pages.
- Dark mode is not documented because the marketing site does not ship a dark theme.
- The helpdesk / inbox product surfaces show in-product UI states that aren't formal marketing chrome.
- Saans and SaansMono are proprietary; an open-source substitute (Inter, Söhne, Geist) is acceptable.
