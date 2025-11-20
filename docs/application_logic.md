# Application Logic

This document explains the working logic of the "Wheel of Destiny" game.

## Game Flow

The application has two main phases, managed by the `phase` state in `App.vue`.

### 1. Setup Phase (`phase: 'setup'`)
- **Component**: `GameSetup.vue`
- **User Action**:
  - Users input a list of options (names/items).
  - Users can mark options as "Safe" (cannot be eliminated).
  - Each option is assigned a random color from a predefined palette.
- **Transition**: Clicking "Start Game" emits `start-game` with the list of options.
- **Logic**:
  - Validates that at least 2 options exist before starting.
  - `App.vue` receives the options and switches `phase` to `'game'`.

### 2. Game Phase (`phase: 'game'`)
- **Layout**: Split view with `GameWheel` on the left and `GameStats` on the right.
- **Component**: `GameWheel.vue` (Wheel Logic)
  - Renders the wheel using HTML Canvas or SVG (implementation detail).
  - Handles the spinning animation.
  - Emits `spin-end` when the wheel stops on an option.
- **Result Handling**:
  - `App.vue` handles `spin-end`.
  - **Elimination Logic**:
    - If the selected option is **NOT Safe**, it is marked as `eliminated`.
    - Eliminated options are removed from the active `options` list after a 1-second delay.
    - If the selected option **IS Safe**, it remains in the game.
  - **History Tracking**:
    - Every spin result is added to the `history` array.
    - Records: `roundNumber`, `selectedOption`, and `eliminated` status.
- **Game Over**:
  - Checks if `options.length === 0`.
  - Displays an alert and resets the game to 'setup' phase.

## Data Structures

### GameOption
```typescript
interface GameOption {
  id: string;      // UUID
  label: string;   // Display text
  isSafe: boolean; // If true, won't be removed when selected
  color: string;   // Visual color for wheel/badges
}
```

### RoundResult
```typescript
interface RoundResult {
  roundNumber: number;
  selectedOption: GameOption;
  eliminated: boolean;
}
```

## State Management
The application uses **Local State** (Vue `ref`) in `App.vue` as the single source of truth, passed down via props.

- **`options`**: Current list of active options on the wheel.
- **`history`**: Log of all past spins.
- **`phase`**: Controls the current view ('setup' vs 'game').
- **`roundCounter`**: Increments with each spin.
