# Changelog

All notable changes to the "Leptos HTML/RSX IntelliSense" extension will be documented in this file.

## [0.1.2] - 2026-05-26

### Changed
- Updated repository URLs and metadata to point to `DanarQ/leptos-html-rsx-intellisense`.

## [0.1.1] - 2026-05-26

### Fixed
- Fixed red syntax highlighting error on Rust comparison operators (like `==`) inside HTML attribute blocks (e.g. `class=move || { ... }`).
- Split syntax grammar into macro boundary injection (`leptos.tmLanguage.json`) and attribute block injection (`leptos-attributes.tmLanguage.json`).

## [0.1.0] - 2026-05-25

### Added
- Initial release of the Leptos HTML/RSX IntelliSense extension.
- Native TextMate grammar injection for the Leptos `view!` macro (both `{ ... }` and `( ... )` blocks).
- Default Emmet language mapping for Rust files.
- Support for nested Rust expressions (`{ ... }`) inside injected HTML scopes.
- Language configurations for bracket matching.
