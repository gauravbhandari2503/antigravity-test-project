# Theme Design

This document outlines the design system and styling approach used in the "Wheel of Destiny" application.

## Overview

The application uses **Vanilla CSS** with CSS variables for theming. The design aesthetic is modern, dark-themed, and colorful, utilizing a "Rose & Violet" primary color scheme with neon accents.

## Color Palette

The color system is defined in `:root` variables in `src/style.css`.

### Core Colors
| Variable | Value | Description |
| :--- | :--- | :--- |
| `--color-bg` | `#0f172a` | Main background (Slate 900) |
| `--color-surface` | `#1e293b` | Card/Container background (Slate 800) |
| `--color-primary` | `#f43f5e` | Primary action color (Rose 500) |
| `--color-primary-hover` | `#e11d48` | Hover state for primary (Rose 600) |
| `--color-secondary` | `#3b82f6` | Secondary elements (Blue 500) |
| `--color-accent` | `#8b5cf6` | Accents and gradients (Violet 500) |

### Text Colors
| Variable | Value | Description |
| :--- | :--- | :--- |
| `--color-text` | `#f8fafc` | Primary text (Slate 50) |
| `--color-text-muted` | `#94a3b8` | Secondary/Placeholder text (Slate 400) |
| `--color-border` | `#334155` | Borders (Slate 700) |

## Typography

- **Font Family**: 'Inter', system-ui, sans-serif.
- **Headings**: Bold, large scale (3.2em+ for h1), often using gradients.
- **Body**: Clean, readable, `optimizeLegibility` enabled.

## UI Components

### Buttons
Buttons use a flat design with subtle shadows and transitions.
- **Default**: Surface color background, text color.
- **Hover**: Primary border color, slight lift (`translateY(-1px)`), increased shadow.
- **Primary/Start Button**: Gradient background (`--color-primary` to `--color-accent`), bold text, strong shadow.

### Cards & Containers
- **Background**: `--color-surface`
- **Border Radius**: `1rem` (16px) or `24px` for larger containers.
- **Shadows**:
  - `--shadow-sm`: Subtle depth.
  - `--shadow-lg`: Deep shadow for floating elements.
  - `--shadow-neon`: Glowing effect using primary and accent colors.

### Animations
- **Title Pulse**: A continuous drop-shadow pulse animation on the main title.
- **Transitions**: Smooth `0.2s` - `0.3s` transitions on hover states and layout changes.
- **Vue Transitions**: `fade` transition for switching between Setup and Game phases.

## Global Styles
- **Reset**: Basic margin reset, `box-sizing` implicit.
- **Scrollbar**: Custom styled scrollbar to match the dark theme.
- **Background**: Radial gradient on `body` to create a spotlight effect.
