# Leptos HTML/RSX IntelliSense

A lightweight Visual Studio Code extension that brings HTML syntax highlighting, autocomplete, and Emmet support inside Leptos `view!` macros in Rust files.

This extension is designed to make writing Leptos views feel closer to writing regular HTML, while still keeping Rust expressions properly highlighted inside the macro.

## Features

### HTML syntax highlighting inside `view!`

HTML tags, attributes, and text inside the Leptos `view!` macro are highlighted more clearly.

```rust
view! {
    <div class="container">
        <h1>"Hello Leptos!"</h1>
    </div>
}
```

The extension supports both macro styles:

```rust
view! {
    <div class="container"></div>
}
```

and:

```rust
view! (
    <div class="container"></div>
)
```

### HTML autocomplete

Get suggestions for common HTML tags, attributes, and ARIA attributes while working inside `view!`.

This helps reduce small typing mistakes when writing Leptos UI directly in Rust files.

### Emmet support

Emmet abbreviations can be used inside Rust files, including inside Leptos views.

For example:

```text
div.container>ul>li*3
```

Then expand it using `Tab` or `Ctrl + Space`, depending on your VS Code settings.

### Rust expression support

Rust expressions inside `{ ... }` blocks are still treated as Rust code.

```rust
view! {
    <button on:click=move |_| {
        count.set(count.get() + 1);
    }>
        "Click me"
    </button>
}
```

This keeps syntax highlighting readable when mixing HTML-like markup with Rust logic.

### Lightweight by design

The extension uses VS Code's built-in TextMate grammar system.  
It does not run a custom language server or background process.

## Usage

After installing the extension, open any Rust file that contains a Leptos `view!` macro.

The extension will automatically apply HTML-like highlighting and IntelliSense inside supported `view!` blocks.

```rust
view! {
    <main class="app">
        <h1>"Welcome"</h1>
        <p>"Build fast web apps with Rust and Leptos."</p>
    </main>
}
```

## Emmet configuration

Emmet support is enabled for Rust files through the extension configuration.

If Emmet does not expand correctly, make sure your VS Code settings include:

```json
{
  "emmet.includeLanguages": {
    "rust": "html"
  }
}
```

## Requirements

This extension is intended for projects using:

- Rust
- Leptos
- Visual Studio Code

No additional runtime dependencies are required.

## Known limitations

This extension focuses on improving the editing experience inside `view!` macros.  
It does not replace `rust-analyzer` or provide Leptos-specific type checking.

For Rust diagnostics, type inference, and code navigation, it is recommended to keep using `rust-analyzer`.

## Contributing

Issues, feature requests, and contributions are welcome.

Repository: [github.com/danar-qusyairi/leptos-html-intellisense](https://github.com/danar-qusyairi/leptos-html-intellisense)

## License

MIT
