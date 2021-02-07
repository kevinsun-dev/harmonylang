# HarmonyLang

HarmonyLang provides general VS compatibility with RvR's [Harmony](http://www.cs.cornell.edu/home/rvr/harmony/), a Python-like programming language for testing and experimenting with concurrent programs designed for Cornell University's CS 4410/4411 course.

> **Warning**: This release contains the Harmony 0.9 compiler, which has since been replaced by the 1.0 compiler. Code written for Harmony 1.0 is not compatible with Harmony 0.9. To use the Harmony 1.0 compiler, download [HarmonyLang Beta](https://marketplace.visualstudio.com/items?itemName=kevinsun-dev-cornell.harmonylang-beta).

## Features

Provides advanced syntax highlighting for all flow control, method definition, and literals based on the [default VSCode extension for Python](https://github.com/microsoft/vscode).

Supported syntax:

- Control statement keywords (`for`, `while`, `if`, `else`)
- Literals (`True`, `None`, and numerics)
- Assignment operators (`and=`, `//=`, and `mod=`)
- Binary operators (`and`, `**`, and `>=`)
- Comments (`#line` and `(* block *)`)

![Syntax Highlighting](images/syntax-example.jpg)

Run your Harmony files in VS Code. Press `Alt+Shift+N` to compile and run the current `.hny` file. Alternatively, press `Ctrl+Shift+P` and search `Run Harmony` to find the same command. Kill all running Harmony processes with `Alt+Shift+Q`.

![Command](images/command-example.jpg)

See your Harmony Output results, right in VS Code!

![Harmony Output](images/build-example.jpg)

> Generated `harmony.html` files are saved to the extension's internal compiler.

## Upcoming Features

- Auto-formatter
  - Format on save
  - Format via `Alt+Shift+F`
- Intellicode Support

## Developers

- Kevin Sun     `@kevinsun-dev`

- Anthony Yang     `@ayang4114`

## Release Notes

### 0.1.3
 - Updated HarmonyLang to use Harmony 0.9 LTS compiler
 - Bug fixes.

### 0.1.0
 - Massive UI overhaul with compiler output rewrite.
   - Interactive Process Visualizer
   - Crash Timeline Playback
 - Removed previous UI
 - Removed Notification Output System
 - Bug fixes

### 0.0.6

- Include `Add 'harmony' to PATH` command, which add and setup the harmony CLI compiler on the device. (Unix only)
- Include `Remove 'harmony' CLI` command, which removes the added harmony CLI compiler with the above command from the device. (Unix only)
- Lowered required VS Code version to 1.42+.
- Bug fixes.

### 0.0.5

- Add `End All Harmony Processes` command, with keybinding `Alt+Shift+Q`. For Mac users, substitute `Alt` for `Option`.
- More helpful messages.

### 0.0.4

- Built the Harmony compiler directly into the extension. Removed requirement to download the compiler separately.
- Show the Harmony Output window only if the build succeeds. The Harmony Output window is closed if the build fails.
- Bug fixes.

### 0.0.3

- Added Unix compatibility for `Run Harmony File`.

- Reworked build success/failure reporting.

### 0.0.2

- Added HarmonyLang extension icon and Harmony file icons. VS Code currently does not support icon fallback, so the latter is currently disabled.

- Added `Run Harmony File` command.

- Added Harmony Output window.

### 0.0.1

- Added Harmony syntax highlighting based on the [default VSCode extension for Python](https://github.com/microsoft/vscode)
