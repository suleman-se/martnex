# Martnex Design System: MASTER

This document serves as the global Source of Truth for the Martnex project's visual identity and user experience guidelines. It is synchronized with the actual implementation in `globals.css`.

## 1. Aesthetic Direction: Martnex Slate Monolith
Martnex adopts an "Architectural Monolith" aesthetic — a brutalist-adjacent, high-contrast design system that emphasizes structural clarity, mathematical precision, and monochromatic authority.

- **Keywords**: Monolithic, high-contrast, structural, architectural, razor-sharp.
- **Aesthetic Core**: **Brutalist Precision** (Jet Black primary elements against tiered Slate surfaces).
- **No-Line Rule**: Structural boundaries are primarily defined through tonal shifts (`bg-[#f2f4f6]` vs `white`) and ambient shadows. Borders are used sparingly (20% opacity) to maintain a "No-Line" feel.

## 2. Color System: The Monolith Palette
A high-authority, architecturally-inspired palette.

| Role | Color | Hex | CSS Variable |
| :--- | :--- | :--- | :--- |
| **Primary** | Jet Black | `#000000` | `--color-primary` |
| **Background** | Core Wash | `#F7F9FB` | `--color-background` |
| **Foreground** | Slate Dark | `#191C1E` | `--color-foreground` |
| **Surface (Low)** | Tonal Zinc | `#F2F4F6` | `--color-secondary` |
| **Surface (Mid)** | Neutral Gray | `#ECEEF0` | `--color-muted` |
| **Surface (High)** | Deep Slate | `#E6E8EA` | `--color-accent` |
| **Destructive** | Alert Red | `#BA1A1A` | `--color-destructive` |

## 3. Typography: Rational Universal
Strict adherence to a single, high-performance typeface to eliminate visual noise.

- **Primary Typeface**: `Inter` (Precise, technical, universal balance).
- **Headings**: `Inter` (Font weight: 900/Black, tracking-tight).
- **Body**: `Inter` (Font weight: 400-600, letter-spacing: -0.015em).
- **Scale**:
  - `h1`: Massive Display (font-black, tracking-tight).
  - `Body`: 1rem base with optimized leading (1.6).

## 4. Layout & Spacing Patterns
- **Structural Borders**: Default opacity of `border-border/20` to ensure they fade into the background.
- **Shadow System**: `.shadow-premium` uses an ambient formula: `0 12px 40px rgba(25, 28, 30, 0.04)`.
- **Surfaces**: 
  - `tonal-surface-low`: `#f2f4f6`
  - `tonal-surface-mid`: `#eceef0`
  - `tonal-surface-high`: `#e6e8ea`

## 5. Component Logic

### Buttons
- **Primary**: Solid Black background, high-contrast text (`#DAE2FD`), sharp or subtle rounded corners.
- **Tonal**: Using the `secondary` zinc background for subtle actions.

### Elevation & Depth
- **Glassmorphism**: `.glass` utility using `bg-background/80 backdrop-blur-xl` for overlays and navigation.

## 6. UX Core Values
1. **Structural Clarity**: UI components must feel like they are part of the page architecture, not floating on top (unless specifically elevated).
2. **High Information Density**: Neutral palettes allow for complex product data to stand out without competing for attention.
3. **Motion**: Subtle entry animations (fade-in, duration-700 to 1000) to soften the monochromatic sharpness.

---
*Synchronized with implementation by Martnex Design Intelligence*
