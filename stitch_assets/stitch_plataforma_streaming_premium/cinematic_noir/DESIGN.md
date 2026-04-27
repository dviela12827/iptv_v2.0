---
name: Cinematic Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#e9bcb6'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#af8782'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4aa'
  primary: '#ffb4aa'
  on-primary: '#690003'
  primary-container: '#e50914'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0000c'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#717373'
  on-tertiary-container: '#f9f9f9'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930007'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-hero:
    fontFamily: Bebas Neue
    fontSize: 96px
    fontWeight: '400'
    lineHeight: 90%
    letterSpacing: 2px
  h1-impact:
    fontFamily: Bebas Neue
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 100%
    letterSpacing: 1px
  h2-section:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 120%
    letterSpacing: -0.02em
  body-main:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 160%
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 150%
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 100%
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 5vw
  gutter-x: 1.5rem
  section-gap: 4rem
  card-stack: 0.75rem
---

## Brand & Style

This design system is engineered to disappear, placing the spotlight entirely on high-fidelity content. The brand personality is prestigious, immersive, and unapologetically cinematic. By utilizing a "Dark Room" philosophy, the interface minimizes cognitive load and ocular strain, simulating the experience of a darkened theater.

The design style is a hybrid of **Minimalism** and **Glassmorphism**. It relies on high-contrast focal points—using the signature red to draw the eye to calls-to-action—while using subtle translucent overlays for secondary navigation. The goal is an "Entertainment-First" UX that feels expensive and curated, avoiding any structural elements that resemble productivity tools or data-heavy dashboards.

## Colors

The palette is anchored in absolute black (#000000) to ensure infinite depth on OLED displays. The primary red (#E50914) is reserved strictly for branding, active states, and primary action buttons, serving as the "heartbeat" of the interface. 

Secondary colors are shades of deep charcoal to create subtle separation between sections without breaking the immersive dark environment. Typography remains white or high-purity silver to maintain legibility against the void. No vibrant gradients or secondary hues are permitted; the color should come from the movie posters and backdrops themselves.

## Typography

The typographic hierarchy creates a clear distinction between "The Pitch" and "The Details." **Bebas Neue** is used for high-impact headlines and titles, providing a vertical, cinematic energy that feels like a movie poster. **Plus Jakarta Sans** (serving as a warm, modern alternative to Poppins) handles all metadata and body copy, ensuring high readability at small sizes on TV screens and mobile devices.

Use tight line heights for headlines to maintain a compact, "heavy" look. For body text, generous line-height is essential to ensure the interface feels relaxed and leisurely rather than dense or informative.

## Layout & Spacing

This design system utilizes a **Fixed Grid** for internal content alignment but allows for **Fluid horizontal carousels** that bleed off the edge of the screen, signaling more content to the user. The standard margin is a generous 5% of viewport width to create a "letterboxed" feel.

Spacing follows an 8px base grid. Section headers are significantly decoupled from their content rows to let the imagery breathe. Avoid tight clusters; the layout should feel expansive and premium. Vertical rhythm is driven by content "shelves" rather than columns, creating a rhythmic downward scroll through various genres and categories.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Backdrop Blurs**. Since the background is pure black, elevation is suggested by lightening the surface color slightly (e.g., a dark grey #121212) or by using 20px blur glassmorphism for navigation bars.

Shadows are rarely used as they are invisible against #000000; instead, use **Outer Glows** or **Inner Borders**. For example, a focused card should have a 2px solid white border or a soft red outer glow to denote selection. Passive layers use 10-15% white opacity masks to create a sense of being "closer" to the viewer.

## Shapes

The shape language is consistently **Rounded**, softening the "hard" nature of the black and red palette. Primary buttons and content cards utilize a 0.5rem (8px) corner radius. Large hero banners and modal containers use a more pronounced 1.5rem (24px) radius to create a containerized, friendly feel.

Avoid sharp 0px corners, as they evoke technical/data environments. The roundedness should feel organic, like a modern hardware device (a premium tablet or smart TV).

## Components

### Buttons
Primary buttons are solid Red (#E50914) with white text. Secondary buttons are "Ghost" style—transparent with a 1px white border. All buttons should have a hover state that slightly increases scale (1.05x) rather than changing color dramatically.

### Content Cards
The most critical component. Cards have a 16:9 or 2:3 aspect ratio with 8px rounded corners. There is no visible border in the rest state; metadata (title, year) appears only on hover or focus via a bottom-up gradient overlay.

### Navigation Bar
A top-anchored bar that is 100% transparent at the top of the page but transitions to a 40px blurred black background as the user scrolls. Use minimal icon labels.

### Progress Bars
Ultra-thin (4px) lines. The "played" portion is Red, and the "unplayed" portion is a 30% white opacity. No visible "knobs" or "handles" unless actively being scrubbed.

### Selection States
In a 10-foot UI (TV) context, the "focused" item must be clearly defined by a 4px white border and a subtle scale increase. This is the primary way users navigate the "Dark Room" environment.