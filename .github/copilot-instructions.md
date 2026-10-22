# Copilot instructions

## Project structure and architecture

This is a dependency-free browser game. `index.html` provides the Japanese game UI and loads `style.css` and `game.js`; keep the DOM hooks used by the script (`#game`, `#game-message`, `#restart-button`, and `#status`) in sync when changing the markup.

`game.js` owns the game state and loop. It updates player physics and collisions, follows the player with a camera over the 3200px world, then draws the background, platforms, hazards, goal, and player on a 960×540 canvas. Stage layout is data in the `platforms` and `hazards` arrays. `style.css` handles the surrounding interface and responsive layout; the canvas scales to the available width while retaining its 16:9 ratio.

## Commands

There is no package manifest, build system, test suite, or linter configured. Open `index.html` directly in a browser to play. To check the JavaScript file for syntax errors, run:

```sh
node --check game.js
```

## Repository conventions

- ユーザー向けの説明やゲーム内の案内文は日本語で表示する。
- Keep player/world coordinates and drawing dimensions in the canvas's 960×540 coordinate system; use `cameraX` to translate world objects when drawing.
- Keep gameplay changes within the existing `update` / `render` loop and use `requestAnimationFrame` for frames.
- Keep player controls based on `KeyboardEvent.code`; the current controls are arrows or A/D to move and Space to jump.
- Space jump height is variable: holding it boosts upward movement for at most `MAX_JUMP_HOLD_TIME`; releasing it sooner makes a shorter jump. Keep this boost capped.
- UI copy is Japanese. Preserve the existing accessible canvas label, status live region, and keyboard-focus behavior for the clear/restart flow.
- Keep the stylesheet responsive and preserve the canvas's 16:9 aspect ratio.
