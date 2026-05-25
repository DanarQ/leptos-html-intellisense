const vscode = require('vscode');

// Common HTML and SVG tags for Leptos
const HTML_TAGS = [
    "div", "span", "p", "a", "button", "input", "textarea", "select", "option", "label",
    "form", "img", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "table", "thead",
    "tbody", "tfoot", "tr", "th", "td", "header", "footer", "nav", "section", "article",
    "aside", "main", "hr", "br", "svg", "path", "circle", "rect", "line", "polyline",
    "polygon", "g", "text", "iframe", "canvas", "video", "audio", "source", "picture",
    "details", "summary", "dialog", "progress", "meter", "strong", "em", "code", "pre",
    "blockquote", "cite", "abbr", "address", "mark", "small", "sub", "sup", "time"
];

// Void elements that should not have closing tags
const VOID_ELEMENTS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr"
]);

// Common HTML and Leptos attributes
const ATTRIBUTES = [
    { name: "class", detail: "HTML class attribute" },
    { name: "id", detail: "HTML unique ID attribute" },
    { name: "style", detail: "Inline CSS styles" },
    { name: "href", detail: "Hypertext Reference URL" },
    { name: "src", detail: "Source URL for media/image" },
    { name: "alt", detail: "Alternative text description" },
    { name: "type", detail: "Input type" },
    { name: "placeholder", detail: "Input placeholder text" },
    { name: "value", detail: "Input value binding" },
    { name: "disabled", detail: "Disables the element" },
    { name: "readonly", detail: "Makes input read-only" },
    { name: "required", detail: "Makes input required" },
    { name: "checked", detail: "Checks the checkbox/radio" },
    { name: "name", detail: "Name of the input element" },
    { name: "target", detail: "Link target" },
    { name: "rel", detail: "Relationship of the link" },
    { name: "title", detail: "Advisory information tooltip" },
    
    // Leptos event handlers
    { name: "on:click", detail: "Leptos click event handler" },
    { name: "on:input", detail: "Leptos input event handler" },
    { name: "on:change", detail: "Leptos change event handler" },
    { name: "on:submit", detail: "Leptos submit event handler" },
    { name: "on:keydown", detail: "Leptos keydown event handler" },
    { name: "on:keyup", detail: "Leptos keyup event handler" },
    { name: "on:focus", detail: "Leptos focus event handler" },
    { name: "on:blur", detail: "Leptos blur event handler" },
    
    // Leptos directives
    { name: "class:", detail: "Leptos dynamic class toggle: class:name={bool_signal}" },
    { name: "prop:", detail: "Leptos property binding: prop:name={value}" },
    { name: "attr:", detail: "Leptos attribute binding: attr:name={value}" }
];

const attrSnippets = {
    "class": "class=\"$1\"",
    "id": "id=\"$1\"",
    "style": "style=\"$1\"",
    "href": "href=\"$1\"",
    "src": "src=\"$1\"",
    "alt": "alt=\"$1\"",
    "type": "type=\"$1\"",
    "placeholder": "placeholder=\"$1\"",
    "value": "value={$1}",
    "name": "name=\"$1\"",
    "target": "target=\"$1\"",
    "rel": "rel=\"$1\"",
    "title": "title=\"$1\"",
    
    // Leptos events
    "on:click": "on:click=move |_| $1",
    "on:input": "on:input=move |ev| $1",
    "on:change": "on:change=move |ev| $1",
    "on:submit": "on:submit=move |ev| $1",
    "on:keydown": "on:keydown=move |ev| $1",
    "on:keyup": "on:keyup=move |ev| $1",
    "on:focus": "on:focus=move |ev| $1",
    "on:blur": "on:blur=move |ev| $1",
    
    // Leptos bindings
    "class:": "class:$1={$2}",
    "prop:": "prop:$1={$2}",
    "attr:": "attr:$1={$2}"
};

function getLeptosContext(text, offset) {
    let depth = 0;
    let parenDepth = 0;
    let viewStack = [];
    
    let inString = false;
    let stringChar = null;
    let inComment = false;
    let inBlockComment = false;
    
    for (let i = 0; i < offset; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (inComment) {
            if (char === '\n') inComment = false;
            continue;
        }
        if (inBlockComment) {
            if (char === '*' && nextChar === '/') {
                inBlockComment = false;
                i++;
            }
            continue;
        }
        if (inString) {
            if (char === '\\') {
                i++; // skip escaped char
            } else if (char === stringChar) {
                inString = false;
            }
            continue;
        }
        
        if (char === '/' && nextChar === '/') {
            inComment = true;
            i++;
            continue;
        }
        if (char === '/' && nextChar === '*') {
            inBlockComment = true;
            i++;
            continue;
        }
        
        if (char === '"' || char === '\'' || char === '`') {
            inString = true;
            stringChar = char;
            continue;
        }
        
        if (char === 'v' && text.substring(i, i + 5) === 'view!') {
            let j = i + 5;
            while (j < offset && /\s/.test(text[j])) {
                j++;
            }
            if (j < offset) {
                if (text[j] === '{') {
                    viewStack.push({ type: 'brace', startDepth: depth, startParenDepth: parenDepth });
                } else if (text[j] === '(') {
                    viewStack.push({ type: 'paren', startDepth: depth, startParenDepth: parenDepth });
                }
            }
        }
        
        if (char === '{') {
            depth++;
        } else if (char === '}') {
            depth--;
            if (viewStack.length > 0) {
                const currentView = viewStack[viewStack.length - 1];
                if (currentView.type === 'brace' && depth <= currentView.startDepth) {
                    viewStack.pop();
                }
            }
        } else if (char === '(') {
            parenDepth++;
        } else if (char === ')') {
            parenDepth--;
            if (viewStack.length > 0) {
                const currentView = viewStack[viewStack.length - 1];
                if (currentView.type === 'paren' && parenDepth <= currentView.startParenDepth) {
                    viewStack.pop();
                }
            }
        }
    }
    
    if (viewStack.length > 0) {
        if (inString || inComment || inBlockComment) {
            return null;
        }
        return {
            currentView: viewStack[viewStack.length - 1],
            depth,
            parenDepth
        };
    }
    return null;
}

function getTagContext(text, offset) {
    let i = offset - 1;
    let tagStart = -1;
    
    while (i >= 0) {
        const char = text[i];
        if (char === '>') {
            return { type: 'text' };
        }
        if (char === '<') {
            if (text[i + 1] === '/') {
                return { type: 'close-tag', tagStart: i };
            }
            tagStart = i;
            break;
        }
        i--;
    }
    
    if (tagStart === -1) {
        return { type: 'text' };
    }
    
    let j = tagStart + 1;
    while (j < offset && /[a-zA-Z0-9:-]/.test(text[j])) {
        j++;
    }
    const tagName = text.substring(tagStart + 1, j).trim();
    
    const textBetween = text.substring(tagStart, offset);
    const hasWhitespace = /\s/.test(textBetween);
    
    if (!hasWhitespace) {
        return { type: 'tag-name', tagName, tagStart };
    }
    
    let quoteCount = 0;
    for (let k = tagStart; k < offset; k++) {
        const char = text[k];
        if (char === '"' || char === '\'' || char === '`') {
            quoteCount++;
        }
    }
    
    if (quoteCount % 2 !== 0) {
        return { type: 'value', tagName, tagStart };
    }
    
    return { type: 'attributes', tagName, tagStart };
}

function getTagContextAtOffset(text, scanOffset) {
    let i = scanOffset - 1;
    let tagStart = -1;
    
    while (i >= 0) {
        const char = text[i];
        if (char === '>') {
            return null;
        }
        if (char === '<') {
            if (text[i + 1] === '/') {
                return null;
            }
            tagStart = i;
            break;
        }
        i--;
    }
    
    if (tagStart === -1) return null;
    
    let j = tagStart + 1;
    while (j < scanOffset && /[a-zA-Z0-9:-]/.test(text[j])) {
        j++;
    }
    const tagName = text.substring(tagStart + 1, j).trim();
    
    return { type: 'attributes', tagName, tagStart };
}

function activate(context) {
    // 1. Register Autocomplete Provider
    const provider = vscode.languages.registerCompletionItemProvider(
        'rust',
        {
            provideCompletionItems(document, position, token, completionContext) {
                const text = document.getText();
                const offset = document.offsetAt(position);
                
                const leptosCtx = getLeptosContext(text, offset);
                if (!leptosCtx) return null;
                
                const { currentView, depth, parenDepth } = leptosCtx;
                
                // Validate HTML context
                if (currentView.type === 'brace') {
                    if (depth !== currentView.startDepth + 1) return null;
                } else if (currentView.type === 'paren') {
                    if (depth !== currentView.startDepth || parenDepth !== currentView.startParenDepth + 1) return null;
                }
                
                const tagCtx = getTagContext(text, offset);
                
                if (tagCtx.type === 'tag-name') {
                    return HTML_TAGS.map(tag => {
                        const item = new vscode.CompletionItem(tag, vscode.CompletionItemKind.Class);
                        item.detail = `HTML <${tag}> tag`;
                        return item;
                    });
                }
                
                if (tagCtx.type === 'attributes') {
                    return ATTRIBUTES.map(attr => {
                        const item = new vscode.CompletionItem(attr.name, vscode.CompletionItemKind.Property);
                        item.detail = attr.detail;
                        const snippet = attrSnippets[attr.name];
                        if (snippet) {
                            item.insertText = new vscode.SnippetString(snippet);
                        }
                        return item;
                    });
                }
                
                return null;
            }
        },
        '<', ' ', ':', '/'
    );
    
    // 2. Register Auto-Closing Tag Event Listener
    const autoCloseListener = vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== event.document) return;
        
        const changes = event.contentChanges;
        if (changes.length !== 1) return;
        
        const change = changes[0];
        if (change.text !== '>') return;
        
        const document = event.document;
        // Position right after '>'
        const position = change.range.start.translate(0, 1);
        const offset = document.offsetAt(position);
        const text = document.getText();
        
        // Verify we are inside Leptos HTML context
        const leptosCtx = getLeptosContext(text, offset);
        if (!leptosCtx) return;
        
        const { currentView, depth, parenDepth } = leptosCtx;
        if (currentView.type === 'brace') {
            if (depth !== currentView.startDepth + 1) return;
        } else if (currentView.type === 'paren') {
            if (depth !== currentView.startDepth || parenDepth !== currentView.startParenDepth + 1) return;
        }
        
        // Self-closing check (ends with '/>' before the '>')
        if (offset >= 2 && text[offset - 2] === '/') return;
        
        // Find tag info before '>'
        const tagStartCtx = getTagContextAtOffset(text, offset - 1);
        if (!tagStartCtx || !tagStartCtx.tagName) return;
        
        const tagName = tagStartCtx.tagName;
        
        // Skip void elements (like input, br, img)
        if (VOID_ELEMENTS.has(tagName.toLowerCase())) return;
        
        const closeTagText = `</${tagName}>`;
        
        editor.edit(editBuilder => {
            editBuilder.insert(position, closeTagText);
        }, { undoStopBefore: false, undoStopAfter: false }).then(success => {
            if (success) {
                // Restore cursor between the tags
                const newSelection = new vscode.Selection(position, position);
                editor.selection = newSelection;
            }
        });
    });
    
    context.subscriptions.push(provider, autoCloseListener);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
