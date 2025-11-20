# Project Patterns & Architecture

This document outlines the technical patterns and coding standards used in the codebase.

## Technology Stack
- **Framework**: Vue 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Scoped & Global Variables)

## Vue Patterns

### Composition API
- All components use the `<script setup lang="ts">` syntax.
- State is managed using `ref` and `computed`.
- No Options API usage.

### Component Communication
- **Props**: Used for passing data down (e.g., `options` to `GameWheel`, `history` to `GameStats`).
- **Emits**: Used for notifying parent of actions (e.g., `start-game`, `spin-end`).
- **Typed Emits**: Emits are strictly typed using `defineEmits<{ ... }>()`.

### Conditional Rendering
- `v-if` / `v-else` is used for high-level phase switching (Setup vs Game).
- `<Transition>` components are used for smooth DOM entry/exit animations.

## TypeScript Usage

### Type Definitions
- Shared types are defined in `src/types.ts` and imported where needed.
- **Interfaces** are preferred over types for object shapes (`GameOption`, `RoundResult`).

### Strict Typing
- Props are typed using `defineProps<{ ... }>()`.
- Refs are explicitly typed when the inferred type is insufficient (e.g., `ref<GameOption[]>([])`).

## CSS Architecture

### Scoped Styles
- Component-specific styles are defined in `<style scoped>`.
- This prevents style leakage and maintains modularity.

### CSS Variables
- A global theme is defined in `src/style.css` using `:root`.
- Components reference these variables (e.g., `var(--color-primary)`) to ensure consistency.
- **Responsive Design**: Media queries are used (e.g., `@media (max-width: 900px)`) to adjust layouts for mobile devices.

## File Structure
```
src/
├── components/      # UI Components (GameSetup, GameWheel, GameStats)
├── App.vue          # Root component & State Container
├── main.ts          # Entry point
├── style.css        # Global styles & Theme variables
└── types.ts         # Shared TypeScript interfaces
```
