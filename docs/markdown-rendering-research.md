# Comprehensive React Markdown Rendering Research (2025)

## Executive Summary

Based on extensive research of current best practices, official documentation, and community standards, **react-markdown** remains the industry-standard solution for rendering markdown in React applications in 2025. It provides a comprehensive plugin ecosystem through the unified/remark/rehype framework, excellent security by default, and support for all requested features.

**Recommended Stack:**
- **Core:** react-markdown v9+ (current: v10)
- **GFM Features:** remark-gfm (tables, task lists, strikethrough, footnotes)
- **Syntax Highlighting:** rehype-pretty-code (Shiki-based) or rehype-highlight
- **Math Equations:** remark-math + rehype-katex
- **Diagrams:** rehype-mermaid
- **HTML Support:** rehype-raw + rehype-sanitize (security critical)
- **Custom Components:** Built-in component prop support

---

## 1. Library Comparison & Recommendation

### Primary Recommendation: react-markdown

**Official Repository:** https://github.com/remarkjs/react-markdown
**NPM Package:** https://www.npmjs.com/package/react-markdown
**Current Version:** v9/v10 (compatible with Node.js 16+)
**Bundle Size:** ~42.6 kB minified + gzipped

#### Why react-markdown?

1. **Security First:** Safe by default, no `dangerouslySetInnerHTML`, prevents XSS attacks
2. **Plugin Ecosystem:** Extensive remark/rehype plugin support (100+ plugins)
3. **100% Compliant:** Full CommonMark + GitHub Flavored Markdown support
4. **Active Maintenance:** Part of the unified collective, actively maintained
5. **TypeScript Support:** Full TypeScript definitions included
6. **Custom Components:** Easy component customization via `components` prop
7. **SSR Compatible:** Works seamlessly with Next.js, Remix, and other frameworks

#### Alternatives Considered

**MDX** - Use when you need JavaScript/JSX inside markdown files
- More powerful but heavier
- Requires compilation step
- Best for component-heavy documentation

**markdown-to-jsx** - Lightweight alternative (~6 kB gzipped)
- Less plugin ecosystem
- Good for simple use cases
- Limited advanced features

**@m2d/react-markdown** - Modern alternative with MDAST/HAST access
- Newer, less proven
- Good performance on large documents
- Smaller community

---

## 2. Core Features Implementation

### 2.1 GitHub Flavored Markdown (Tables, Task Lists, Strikethrough)

**Plugin:** `remark-gfm`
**Official Docs:** https://github.com/remarkjs/remark-gfm
**Current Version:** v3+ (for footnotes support)

**Features Enabled:**
- Tables
- Task lists (checkboxes)
- Strikethrough text
- Autolink literals
- Footnotes

**Installation:**
```bash
npm install remark-gfm
```

**Usage:**
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {`
## Tables
| Header | Title |
| ------ | ----- |
| Cell 1 | Cell 2 |

## Task Lists
- [x] Completed task
- [ ] Pending task

## Other Features
~~Strikethrough text~~
Visit www.github.com (autolink)

Here's a footnote[^1]
[^1]: Footnote content
  `}
</ReactMarkdown>
```

**Security Note:** remark-gfm is safe by default and follows GitHub's implementation.

---

### 2.2 Syntax Highlighting

#### Recommended: rehype-pretty-code (Shiki-based)

**Why Shiki?**
- Runs at build time (zero JavaScript shipped to client)
- Perfect syntax highlighting using VS Code's grammar engine
- 200+ language support
- Multiple theme support (light/dark mode)
- Line numbers, highlighting, and annotations built-in

**Plugin:** `rehype-pretty-code`
**Docs:** https://rehype-pretty.pages.dev/
**Alternative Hook:** `react-shiki` for runtime highlighting

**Installation:**
```bash
npm install rehype-pretty-code shiki
```

**Usage:**
```typescript
import ReactMarkdown from 'react-markdown';
import rehypePrettyCode from 'rehype-pretty-code';

const options = {
  theme: {
    dark: 'github-dark-dimmed',
    light: 'github-light'
  },
  keepBackground: false,
  onVisitLine(node) {
    // Prevent lines from collapsing in `display: grid` mode
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className?.push('highlighted');
  }
};

<ReactMarkdown
  rehypePlugins={[[rehypePrettyCode, options]]}
>
  {`\`\`\`typescript
const greeting: string = "Hello, World!";
console.log(greeting);
\`\`\``}
</ReactMarkdown>
```

**CSS Required:**
```css
/* Add to your global styles */
pre {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
}

code {
  font-family: 'Fira Code', monospace;
}

.highlighted {
  background-color: rgba(200, 200, 255, 0.1);
}
```

#### Alternative: rehype-highlight (Highlight.js)

**Plugin:** `rehype-highlight`
**Bundle Size:** ~942 kB (274 kB minified) - Note: with SSR/SSG, not sent to client
**Best for:** Server-side rendering scenarios

**Installation:**
```bash
npm install rehype-highlight
npm install highlight.js  # For CSS themes
```

**Usage:**
```typescript
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

<ReactMarkdown
  rehypePlugins={[rehypeHighlight]}
>
  {markdownContent}
</ReactMarkdown>
```

#### Alternative: react-syntax-highlighter (Runtime)

**Package:** `react-syntax-highlighter`
**Warning:** Not actively maintained, has bugs with Next.js static generation
**Use case:** When you need runtime highlighting only

**Installation:**
```bash
npm install react-syntax-highlighter
npm install --save-dev @types/react-syntax-highlighter
```

**Usage:**
```typescript
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

<ReactMarkdown
  components={{
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  }}
>
  {markdownContent}
</ReactMarkdown>
```

**Performance Comparison:**
- **rehype-pretty-code/Shiki:** Best for SSR/SSG (build-time, zero runtime cost)
- **rehype-highlight:** Good for SSR (larger bundle, but not sent to client)
- **react-syntax-highlighter:** Runtime highlighting (impacts client performance)

---

### 2.3 Mermaid Diagrams

**Primary Plugin:** `rehype-mermaid`
**Official Docs:** https://github.com/remcohaszing/rehype-mermaid
**Current Version:** Compatible with Node.js 18+
**Alternatives:** `rehype-mermaidjs`, `@beoe/rehype-mermaid`

**Installation:**
```bash
npm install rehype-mermaid
# Requires Playwright for server-side rendering
npm install -D playwright
npx playwright install chromium
```

**Usage:**
```typescript
import ReactMarkdown from 'react-markdown';
import rehypeMermaid from 'rehype-mermaid';

const options = {
  strategy: 'inline-svg',  // Options: 'img-png', 'img-svg', 'inline-svg', 'pre-mermaid'
  dark: false,
  background: 'transparent'
};

<ReactMarkdown
  rehypePlugins={[[rehypeMermaid, options]]}
>
  {`\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\``}
</ReactMarkdown>
```

**Rendering Strategies:**

1. **inline-svg** (Recommended for SSR)
   - Renders diagrams as inline SVG in HTML
   - Best for SEO and accessibility
   - No additional requests

2. **img-svg**
   - Renders as <img> with SVG source
   - Smaller HTML output
   - Browser caching benefits

3. **img-png**
   - Renders as PNG images
   - Widest compatibility
   - Larger file sizes

4. **pre-mermaid** (Client-side rendering)
   - Renders on the client using mermaid.js
   - Requires loading mermaid.js library
   - Good for dynamic content

**Client-Side Alternative (Simpler Setup):**
```typescript
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';

function MarkdownWithMermaid({ content }) {
  useEffect(() => {
    // Load mermaid.js
    import('mermaid').then((mermaid) => {
      mermaid.default.initialize({ startOnLoad: true });
      mermaid.default.contentLoaded();
    });
  }, [content]);

  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          if (className === 'language-mermaid') {
            return (
              <pre className="mermaid">
                {children}
              </pre>
            );
          }
          return <code className={className} {...props}>{children}</code>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

---

### 2.4 Math Equations (LaTeX/KaTeX)

**Plugins:** `remark-math` + `rehype-katex`
**Official Docs:** https://github.com/remarkjs/remark-math
**Current Version:** remark-math v6, rehype-katex v7 (for MDX v3)

**Installation:**
```bash
npm install remark-math rehype-katex
```

**Usage:**
```typescript
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';  // CRITICAL: Must import CSS

<ReactMarkdown
  remarkPlugins={[remarkMath]}
  rehypePlugins={[rehypeKatex]}
>
  {`
## Inline Math
The equation $E = mc^2$ is famous.

## Block Math
$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Complex Example
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
  `}
</ReactMarkdown>
```

**Syntax Support:**
- **Inline math:** `$...$` → `<code class="language-math math-inline">`
- **Block math:** `$$...$$` → `<pre><code class="language-math math-display">`

**Alternative: MathJax**
Replace `rehype-katex` with `rehype-mathjax` if you prefer MathJax rendering.

**Installation:**
```bash
npm install rehype-mathjax
```

**Performance Note:** KaTeX is faster but MathJax has more features. For most use cases, KaTeX is recommended.

---

### 2.5 HTML Tags Support

**Plugin:** `rehype-raw` (with security considerations)
**Security Plugin:** `rehype-sanitize` (REQUIRED when using rehype-raw)

**SECURITY WARNING:** Rendering raw HTML is disabled by default for security. Only enable with proper sanitization.

**Installation:**
```bash
npm install rehype-raw rehype-sanitize
```

**Safe Usage:**
```typescript
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { deepmerge } from 'deepmerge-ts';

// Customize schema to allow specific HTML elements
const customSchema = deepmerge(defaultSchema, {
  tagNames: ['iframe', 'video', 'audio'],  // Add allowed tags
  attributes: {
    iframe: ['src', 'width', 'height', 'frameBorder', 'allow'],
    video: ['src', 'controls', 'width', 'height'],
    audio: ['src', 'controls']
  },
  protocols: {
    src: ['http', 'https', 'data']  // Allowed URL protocols
  }
});

<ReactMarkdown
  rehypePlugins={[
    rehypeRaw,
    [rehypeSanitize, customSchema]
  ]}
>
  {`
# Content with HTML

<div class="custom-container">
  <p>HTML paragraph</p>
</div>

<video src="/video.mp4" controls></video>
  `}
</ReactMarkdown>
```

**Default Security Schema (GitHub-style):**
```typescript
import { defaultSchema } from 'rehype-sanitize';

// defaultSchema includes:
// - Safe tag names: a, blockquote, br, code, em, h1-h6, hr, img, li, ol, p, pre, strong, ul
// - With remark-gfm: del, input, table, tbody, td, th, thead, tr
// - Classes removed (security vector)
// - JavaScript URLs blocked
// - Event handlers removed
```

**Custom Sanitization Schema Example:**
```typescript
const schema = {
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'u', 's',
    'a', 'img', 'code', 'pre',
    'ul', 'ol', 'li',
    'blockquote', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span'  // Additional allowed tags
  ],
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['className'],
    div: ['className'],
    span: ['className']
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https', 'data']
  },
  strip: ['script', 'style'],  // Strip these tags and their contents
  allowComments: false
};
```

**Security Best Practices:**
1. Always use `rehype-sanitize` after `rehype-raw`
2. Start with `defaultSchema` and only add what you need
3. Never allow `javascript:` protocol
4. Remove event handlers (onclick, onerror, etc.)
5. Validate user-provided content on the server
6. Implement Content Security Policy (CSP) headers
7. Use `strip` for dangerous tags like `<script>` and `<style>`

---

### 2.6 Footnotes

**Plugin:** `remark-gfm` (includes footnotes)
**Version:** v3+ required for footnotes support

**Usage:**
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {`
Here's a sentence with a footnote[^1].

Another sentence with a different footnote[^2].

[^1]: This is the first footnote.
[^2]: This is the second footnote with more detail.
    It can have multiple paragraphs.
  `}
</ReactMarkdown>
```

**Custom Footnote Styling:**
```typescript
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // Customize footnote rendering
    sup: ({ node, ...props }) => (
      <sup className="footnote-ref" {...props} />
    ),
    section: ({ node, ...props }) => {
      if (props.dataFootnotes) {
        return (
          <section className="footnotes" {...props}>
            <h2>Footnotes</h2>
            {props.children}
          </section>
        );
      }
      return <section {...props} />;
    }
  }}
>
  {content}
</ReactMarkdown>
```

---

### 2.7 Custom Components

React-markdown allows complete customization of how elements are rendered.

**Basic Component Customization:**
```typescript
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';

const components: Partial<Components> = {
  // Headings with anchor links
  h1: ({ node, ...props }) => (
    <h1 className="text-4xl font-bold mb-4" {...props} />
  ),
  h2: ({ node, ...props }) => {
    const id = props.children?.toString().toLowerCase().replace(/\s/g, '-');
    return (
      <h2 id={id} className="text-3xl font-semibold mb-3" {...props}>
        <a href={`#${id}`} className="anchor-link">
          {props.children}
        </a>
      </h2>
    );
  },

  // Custom paragraph styling
  p: ({ node, ...props }) => (
    <p className="mb-4 leading-relaxed" {...props} />
  ),

  // Links with external icon
  a: ({ node, href, children, ...props }) => {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="text-blue-600 hover:underline"
        {...props}
      >
        {children}
        {isExternal && <span className="external-icon">↗</span>}
      </a>
    );
  },

  // Custom blockquote
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic my-4"
      {...props}
    />
  ),

  // Styled tables
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border" {...props} />
    </div>
  ),

  // Custom image with lazy loading
  img: ({ node, src, alt, ...props }) => (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="max-w-full h-auto rounded-lg shadow-md"
      {...props}
    />
  ),

  // Task list items
  input: ({ node, ...props }) => (
    <input type="checkbox" disabled className="mr-2" {...props} />
  )
};

<ReactMarkdown components={components}>
  {markdownContent}
</ReactMarkdown>
```

**TypeScript Types:**
```typescript
import { Components, ReactMarkdownProps } from 'react-markdown';
import { ExtraProps } from 'react-markdown';

// Type for custom components
type ComponentProps = {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
} & ExtraProps;

// Custom heading component with proper types
const CustomHeading = ({
  node,
  level,
  children,
  ...props
}: ComponentProps & { level: number }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const id = children?.toString().toLowerCase().replace(/\s/g, '-');

  return (
    <Tag id={id} className={`heading-${level}`} {...props}>
      {children}
    </Tag>
  );
};
```

---

## 3. Complete Implementation Example

Here's a comprehensive example with all features enabled:

### Installation Commands

```bash
# Core
npm install react-markdown

# Plugins
npm install remark-gfm                    # GFM features
npm install remark-math rehype-katex      # Math equations
npm install rehype-pretty-code shiki      # Syntax highlighting (Shiki)
npm install rehype-mermaid                # Mermaid diagrams
npm install rehype-raw rehype-sanitize    # HTML support (with security)

# Optional: alternative syntax highlighters
npm install rehype-highlight              # Alternative: Highlight.js
npm install react-syntax-highlighter      # Alternative: runtime highlighting

# CSS for KaTeX (required)
npm install katex

# Development dependencies for Mermaid
npm install -D playwright
npx playwright install chromium
```

### Complete Component Implementation

```typescript
// components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeMermaid from 'rehype-mermaid';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { deepmerge } from 'deepmerge-ts';

// Import KaTeX CSS (critical for math rendering)
import 'katex/dist/katex.min.css';

// Custom sanitization schema
const customSanitizeSchema = deepmerge(defaultSchema, {
  tagNames: ['div', 'span', 'video', 'audio'],
  attributes: {
    div: ['className'],
    span: ['className'],
    code: ['className'],
    video: ['src', 'controls', 'width', 'height'],
    audio: ['src', 'controls']
  }
});

// Syntax highlighting options
const syntaxHighlightOptions = {
  theme: {
    dark: 'github-dark-dimmed',
    light: 'github-light'
  },
  keepBackground: false,
  onVisitLine(node: any) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node: any) {
    node.properties.className?.push('line-highlighted');
  }
};

// Mermaid options
const mermaidOptions = {
  strategy: 'inline-svg' as const,
  dark: false,
  background: 'transparent'
};

// Custom components for rendering
const customComponents: Partial<Components> = {
  // Headings with anchor links
  h1: ({ node, children, ...props }) => (
    <h1 className="text-4xl font-bold mb-6 mt-8" {...props}>
      {children}
    </h1>
  ),

  h2: ({ node, children, ...props }) => {
    const id = children?.toString().toLowerCase().replace(/\s+/g, '-');
    return (
      <h2 id={id} className="text-3xl font-semibold mb-4 mt-6" {...props}>
        <a href={`#${id}`} className="anchor-link hover:underline">
          {children}
        </a>
      </h2>
    );
  },

  h3: ({ node, children, ...props }) => (
    <h3 className="text-2xl font-semibold mb-3 mt-4" {...props}>
      {children}
    </h3>
  ),

  // Paragraphs
  p: ({ node, ...props }) => (
    <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />
  ),

  // Links
  a: ({ node, href, children, ...props }) => {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        {...props}
      >
        {children}
        {isExternal && (
          <svg
            className="inline-block w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </a>
    );
  },

  // Blockquotes
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic bg-blue-50 dark:bg-blue-900/20"
      {...props}
    />
  ),

  // Code blocks (inline)
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code
          className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  },

  // Pre blocks (handled by rehype-pretty-code)
  pre: ({ node, ...props }) => (
    <pre className="overflow-x-auto rounded-lg my-4 p-4" {...props} />
  ),

  // Lists
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
  ),

  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
  ),

  li: ({ node, ...props }) => (
    <li className="ml-4" {...props} />
  ),

  // Tables
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
    </div>
  ),

  thead: ({ node, ...props }) => (
    <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
  ),

  th: ({ node, ...props }) => (
    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold" {...props} />
  ),

  td: ({ node, ...props }) => (
    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
  ),

  // Images
  img: ({ node, src, alt, ...props }) => (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="max-w-full h-auto rounded-lg shadow-lg my-4"
      {...props}
    />
  ),

  // Horizontal rule
  hr: ({ node, ...props }) => (
    <hr className="my-8 border-gray-300 dark:border-gray-700" {...props} />
  ),

  // Task list checkbox
  input: ({ node, ...props }) => (
    <input
      type="checkbox"
      disabled
      className="mr-2 cursor-not-allowed"
      {...props}
    />
  )
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
  enableHTML?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  enableHTML = false
}) => {
  // Build plugins array conditionally
  const remarkPlugins = [
    remarkGfm,      // GitHub Flavored Markdown
    remarkMath      // Math support
  ];

  const rehypePlugins: any[] = [
    rehypeKatex,    // Render math with KaTeX
    [rehypePrettyCode, syntaxHighlightOptions],  // Syntax highlighting
    [rehypeMermaid, mermaidOptions]              // Mermaid diagrams
  ];

  // Add HTML support if enabled (with security)
  if (enableHTML) {
    rehypePlugins.push(
      rehypeRaw,
      [rehypeSanitize, customSanitizeSchema]
    );
  }

  return (
    <div className={`markdown-content prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
```

### CSS Styles (Tailwind + Custom)

```css
/* styles/markdown.css */

/* Syntax highlighting custom styles */
.line-highlighted {
  background-color: rgba(200, 200, 255, 0.1);
  display: block;
  margin: 0 -1rem;
  padding: 0 1rem;
  border-left: 3px solid #60a5fa;
}

/* Code blocks */
pre {
  tab-size: 2;
  -moz-tab-size: 2;
}

pre code {
  display: block;
  overflow-x: auto;
  padding: 0;
  background: transparent;
}

/* Inline code */
code:not(pre code) {
  font-size: 0.9em;
  font-weight: 500;
}

/* Anchor links */
.anchor-link {
  text-decoration: none;
  color: inherit;
}

.anchor-link:hover::before {
  content: '#';
  margin-right: 0.5rem;
  color: #60a5fa;
}

/* Mermaid diagrams */
.mermaid {
  background-color: transparent;
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.mermaid svg {
  max-width: 100%;
  height: auto;
}

/* Footnotes */
.footnotes {
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.9em;
}

.footnote-ref {
  font-size: 0.75em;
  vertical-align: super;
  font-weight: 600;
}

/* Tables */
table {
  width: 100%;
  border-spacing: 0;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .footnotes {
    border-top-color: #374151;
  }
}

/* Print styles */
@media print {
  .anchor-link::before {
    display: none;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    font-weight: normal;
  }
}
```

### Usage Example

```typescript
// pages/DocumentPage.tsx
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const markdownContent = `
# Complete Markdown Example

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✓ | Via remark-gfm |
| Math | ✓ | Via KaTeX |
| Diagrams | ✓ | Via Mermaid |

## Task Lists

- [x] Implement tables
- [x] Add syntax highlighting
- [ ] Add custom components
- [x] Configure security

## Code with Syntax Highlighting

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};
\`\`\`

## Math Equations

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

Block equation:

$$
E = mc^2
$$

## Mermaid Diagram

\`\`\`mermaid
graph TD;
    A[Start] --> B{Is it working?};
    B -->|Yes| C[Great!];
    B -->|No| D[Debug];
    D --> B;
    C --> E[End];
\`\`\`

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Links

Visit [React Documentation](https://react.dev) for more info.
`;

export default function DocumentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MarkdownRenderer
        content={markdownContent}
        enableHTML={false}  // Set to true only for trusted content
      />
    </div>
  );
}
```

---

## 4. Security Best Practices

### 4.1 Core Security Principles

1. **react-markdown is Safe by Default**
   - No `dangerouslySetInnerHTML` used
   - HTML is disabled by default
   - XSS protection built-in

2. **Never Trust User Input**
   - Always sanitize user-provided markdown
   - Use `rehype-sanitize` when enabling HTML
   - Validate content on the server

3. **Defense in Depth**
   ```typescript
   // Multiple layers of security
   const securePlugins = [
     remarkGfm,           // Safe markdown extensions
     rehypeRaw,           // Parse HTML (needed for some features)
     [rehypeSanitize, {   // CRITICAL: Sanitize after parsing
       ...defaultSchema,
       // Only add what you absolutely need
     }]
   ];
   ```

### 4.2 Content Security Policy

Implement CSP headers for additional protection:

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self';
      frame-src 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 4.3 Known Vulnerabilities to Avoid

**Recent CVE (2025):** CVE-2025-24981 in Nuxt MDC
- Unsafe URL parsing can lead to XSS
- Use established libraries like react-markdown
- Keep dependencies updated

**Dangerous Patterns to Avoid:**
```typescript
// ❌ NEVER DO THIS
<div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />

// ❌ NEVER DO THIS
import marked from 'marked';
const html = marked(userContent);  // Unsafe without sanitization

// ✓ DO THIS
<ReactMarkdown
  rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
>
  {userContent}
</ReactMarkdown>
```

### 4.4 Sanitization Schema Templates

**Minimal Safe Schema (Most Restrictive):**
```typescript
const minimalSchema = {
  tagNames: ['p', 'br', 'strong', 'em', 'code', 'pre'],
  attributes: {},
  protocols: {},
  allowComments: false
};
```

**Documentation Site Schema (Balanced):**
```typescript
const docsSchema = deepmerge(defaultSchema, {
  tagNames: ['div', 'span'],
  attributes: {
    '*': ['className'],  // Allow className on all elements
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['className']  // For syntax highlighting
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https', 'data']
  }
});
```

**Rich Content Schema (Less Restrictive - Use with Caution):**
```typescript
const richSchema = deepmerge(defaultSchema, {
  tagNames: [
    ...defaultSchema.tagNames,
    'div', 'span', 'iframe', 'video', 'audio',
    'details', 'summary', 'figure', 'figcaption'
  ],
  attributes: {
    '*': ['className', 'id'],
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'frameBorder', 'allow'],
    video: ['src', 'controls', 'width', 'height', 'poster'],
    audio: ['src', 'controls']
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https', 'data']
  },
  // Strip dangerous elements completely
  strip: ['script', 'style', 'object', 'embed'],
  allowComments: false
});
```

### 4.5 Input Validation

```typescript
// Server-side validation example
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

async function validateMarkdown(content: string): Promise<boolean> {
  try {
    // Parse markdown to check for validity
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .process(content);

    // Additional checks
    if (content.length > 1000000) {  // 1MB limit
      throw new Error('Content too large');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,  // Event handlers
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(content))) {
      throw new Error('Suspicious content detected');
    }

    return true;
  } catch (error) {
    console.error('Markdown validation failed:', error);
    return false;
  }
}
```

---

## 5. Performance Optimization

### 5.1 Bundle Size Optimization

**Current Sizes:**
- react-markdown: ~42.6 kB (gzipped)
- remark-gfm: ~20 kB (gzipped)
- rehype-katex: ~50 kB (gzipped)
- rehype-raw: ~60 kB (gzipped)
- Shiki/rehype-pretty-code: ~0 kB runtime (build-time only)

**Optimization Strategies:**

1. **Code Splitting**
   ```typescript
   // Lazy load markdown renderer
   import dynamic from 'next/dynamic';

   const MarkdownRenderer = dynamic(
     () => import('@/components/MarkdownRenderer'),
     {
       loading: () => <div>Loading content...</div>,
       ssr: true  // Enable SSR for SEO
     }
   );
   ```

2. **Plugin Tree-Shaking**
   ```typescript
   // Only import plugins you need
   import remarkGfm from 'remark-gfm';  // ~20 kB
   // Don't import if you don't use math
   // import remarkMath from 'remark-math';  // ~15 kB
   ```

3. **Server-Side Rendering**
   ```typescript
   // Pre-render markdown at build time (Next.js)
   export async function getStaticProps() {
     const markdownContent = await fetchMarkdown();

     // Render on server
     const html = await renderToStaticMarkup(
       <MarkdownRenderer content={markdownContent} />
     );

     return {
       props: { html },
       revalidate: 3600  // Revalidate every hour
     };
   }
   ```

### 5.2 Large Document Handling

**Virtualization for Large Content:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualizedMarkdown({ content }: { content: string }) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Split content into sections (by heading)
  const sections = content.split(/(?=^#{1,6} )/gm);

  const virtualizer = useVirtualizer({
    count: sections.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,  // Estimated section height
    overscan: 5
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <MarkdownRenderer content={sections[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Memoization:**
```typescript
import { memo, useMemo } from 'react';

const MemoizedMarkdownRenderer = memo(
  MarkdownRenderer,
  (prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
  }
);

// Usage with useMemo for plugin configuration
function MarkdownPage({ content }: { content: string }) {
  const plugins = useMemo(() => ({
    remark: [remarkGfm, remarkMath],
    rehype: [rehypeKatex, rehypePrettyCode]
  }), []);  // Empty deps - plugins don't change

  return <MemoizedMarkdownRenderer content={content} />;
}
```

### 5.3 Web Workers for Heavy Processing

```typescript
// workers/markdown-worker.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

self.addEventListener('message', async (e) => {
  const { content } = e.data;

  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(content);

    self.postMessage({ html: String(result) });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
});

// Component usage
function AsyncMarkdownRenderer({ content }: { content: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const worker = new Worker(new URL('./workers/markdown-worker.ts', import.meta.url));

    worker.postMessage({ content });
    worker.onmessage = (e) => {
      if (e.data.html) {
        setHtml(e.data.html);
      }
    };

    return () => worker.terminate();
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### 5.4 Caching Strategy

```typescript
// Simple cache for rendered markdown
const markdownCache = new Map<string, string>();

function getCachedMarkdown(content: string): string | null {
  return markdownCache.get(content) || null;
}

function setCachedMarkdown(content: string, rendered: string): void {
  // Limit cache size
  if (markdownCache.size > 100) {
    const firstKey = markdownCache.keys().next().value;
    markdownCache.delete(firstKey);
  }
  markdownCache.set(content, rendered);
}

// With React Query
import { useQuery } from '@tanstack/react-query';

function useMarkdownContent(filePath: string) {
  return useQuery({
    queryKey: ['markdown', filePath],
    queryFn: async () => {
      const response = await fetch(filePath);
      return response.text();
    },
    staleTime: 1000 * 60 * 60,  // 1 hour
    cacheTime: 1000 * 60 * 60 * 24  // 24 hours
  });
}
```

---

## 6. TypeScript Support

### 6.1 Type Definitions

react-markdown includes full TypeScript support with built-in types:

```typescript
import ReactMarkdown from 'react-markdown';
import type { Components, ReactMarkdownProps } from 'react-markdown';
import type { PluggableList } from 'unified';

// Type for component props
interface MarkdownRendererProps {
  content: string;
  className?: string;
  components?: Partial<Components>;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
}

// Custom component with proper typing
import type { Element } from 'hast';

interface HeadingProps {
  node?: Element;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
  [key: string]: any;
}

const CustomHeading: React.FC<HeadingProps> = ({
  level,
  children,
  ...props
}) => {
  const Tag = `h${level}` as const;
  return <Tag {...props}>{children}</Tag>;
};
```

### 6.2 Plugin Typing

```typescript
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import type { Root as HastRoot } from 'hast';

// Remark plugin type
type RemarkPlugin = Plugin<[], Root>;

// Rehype plugin type
type RehypePlugin = Plugin<[], HastRoot>;

// Usage
const remarkPlugins: PluggableList = [
  remarkGfm,
  remarkMath
];

const rehypePlugins: PluggableList = [
  rehypeKatex,
  [rehypePrettyCode, { theme: 'github-dark' }]
];
```

### 6.3 Custom Component Types

```typescript
import type {
  CodeProps,
  HeadingProps,
  ImageProps,
  LinkProps,
  TableProps
} from 'react-markdown/lib/ast-to-react';

// Using built-in types
const CustomCode: React.FC<CodeProps> = ({
  node,
  inline,
  className,
  children,
  ...props
}) => {
  if (inline) {
    return <code className={className} {...props}>{children}</code>;
  }
  return <pre><code className={className} {...props}>{children}</code></pre>;
};

// Alternative approach with utility type
import type { ExtraProps } from 'react-markdown';

type ComponentProps<T = {}> = T & ExtraProps & {
  node?: any;
  children?: React.ReactNode;
};

const CustomLink: React.FC<ComponentProps<{ href?: string }>> = ({
  href,
  children,
  ...props
}) => {
  return <a href={href} {...props}>{children}</a>;
};
```

### 6.4 Strict Type Safety

```typescript
// Strict configuration with full type checking
import { Options } from 'react-markdown';

const strictMarkdownOptions: Options = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeKatex],
  components: {
    h1: ({ node, ...props }) => <h1 {...props} />,
    p: ({ node, ...props }) => <p {...props} />
  },
  skipHtml: false,
  unwrapDisallowed: true,
  allowElement: (element, index, parent) => {
    // Custom element filtering logic
    return true;
  }
};

<ReactMarkdown {...strictMarkdownOptions}>
  {content}
</ReactMarkdown>
```

---

## 7. Framework Integration

### 7.1 Next.js Integration

**App Router (Next.js 13+):**
```typescript
// app/docs/[slug]/page.tsx
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import fs from 'fs/promises';
import path from 'path';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), 'docs');
  const files = await fs.readdir(docsDir);

  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      slug: file.replace('.md', '')
    }));
}

export default async function DocPage({ params }: PageProps) {
  const filePath = path.join(process.cwd(), 'docs', `${params.slug}.md`);
  const content = await fs.readFile(filePath, 'utf-8');

  return (
    <main className="container mx-auto py-8">
      <MarkdownRenderer content={content} />
    </main>
  );
}
```

**Pages Router (Next.js 12):**
```typescript
// pages/docs/[slug].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import fs from 'fs/promises';
import path from 'path';

interface DocPageProps {
  content: string;
  slug: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const docsDir = path.join(process.cwd(), 'docs');
  const files = await fs.readdir(docsDir);

  const paths = files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      params: { slug: file.replace('.md', '') }
    }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<DocPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const filePath = path.join(process.cwd(), 'docs', `${slug}.md`);
  const content = await fs.readFile(filePath, 'utf-8');

  return {
    props: { content, slug },
    revalidate: 3600  // Revalidate every hour
  };
};

export default function DocPage({ content }: DocPageProps) {
  return (
    <main className="container mx-auto py-8">
      <MarkdownRenderer content={content} />
    </main>
  );
}
```

### 7.2 Remix Integration

```typescript
// app/routes/docs.$slug.tsx
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { MarkdownRenderer } from '~/components/MarkdownRenderer';
import fs from 'fs/promises';
import path from 'path';

export async function loader({ params }: LoaderFunctionArgs) {
  const slug = params.slug;
  const filePath = path.join(process.cwd(), 'docs', `${slug}.md`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return json({ content });
  } catch (error) {
    throw new Response('Not Found', { status: 404 });
  }
}

export default function DocRoute() {
  const { content } = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto py-8">
      <MarkdownRenderer content={content} />
    </main>
  );
}
```

### 7.3 Vite + React Integration

```typescript
// src/pages/DocPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

export function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState('');

  useEffect(() => {
    // Vite's raw import
    import(`../docs/${slug}.md?raw`)
      .then(module => setContent(module.default))
      .catch(error => console.error('Failed to load markdown:', error));
  }, [slug]);

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container mx-auto py-8">
      <MarkdownRenderer content={content} />
    </main>
  );
}

// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.md']
});
```

---

## 8. Alternative Solutions Comparison

| Feature | react-markdown | MDX | markdown-to-jsx | marked + DOMPurify |
|---------|---------------|-----|-----------------|-------------------|
| Security | ✓ Safe by default | ✓ Safe | ⚠️ Needs sanitization | ⚠️ Manual sanitization |
| Bundle Size | 42.6 kB | ~80 kB | ~6 kB | ~15 kB |
| Plugin Ecosystem | ✓✓✓ 100+ plugins | ✓✓ Limited | ✓ Basic | ✓ Basic |
| TypeScript | ✓ Full support | ✓ Full support | ✓ Full support | ⚠️ Partial |
| Custom Components | ✓ Component prop | ✓ JSX components | ✓ Override tags | ❌ Manual |
| GFM Support | ✓ Via plugin | ✓ Via plugin | ✓ Built-in | ❌ Manual |
| Math Support | ✓ Via plugins | ✓ Via plugins | ❌ Manual | ❌ Manual |
| Mermaid Diagrams | ✓ Via plugin | ✓ Via plugin | ❌ Manual | ❌ Manual |
| SSR Compatible | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes |
| Active Maintenance | ✓ Active | ✓ Active | ⚠️ Less active | ✓ Active |
| Learning Curve | Low | Medium | Low | Medium |

**Recommendation by Use Case:**

1. **Documentation Sites:** react-markdown (comprehensive features, security, plugins)
2. **Component-Heavy Docs:** MDX (JSX support, interactive components)
3. **Simple Blog:** markdown-to-jsx (lightweight, basic features)
4. **Legacy Projects:** marked + DOMPurify (widely used, good compatibility)

---

## 9. Common Issues & Solutions

### 9.1 TypeScript Type Errors

**Issue:** Type errors with custom components
```typescript
// ❌ Error: Type 'undefined' is not assignable to type 'ReactNode'
const CustomComponent = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};
```

**Solution:**
```typescript
// ✓ Correct type definition
import type { ReactNode } from 'react';
import type { ExtraProps } from 'react-markdown';

type ComponentProps = {
  node?: any;
  children?: ReactNode;
} & ExtraProps;

const CustomComponent = ({ children, ...props }: ComponentProps) => {
  return <div {...props}>{children}</div>;
};
```

### 9.2 KaTeX CSS Not Loading

**Issue:** Math equations render as plain text

**Solution:**
```typescript
// Must import KaTeX CSS
import 'katex/dist/katex.min.css';

// Or in your _app.tsx / layout
import 'katex/dist/katex.min.css';
```

### 9.3 Mermaid Diagrams Not Rendering

**Issue:** Mermaid code blocks show as plain code

**Solution 1: Server-side (rehype-mermaid)**
```bash
# Install playwright
npm install -D playwright
npx playwright install chromium
```

**Solution 2: Client-side**
```typescript
useEffect(() => {
  import('mermaid').then(m => {
    m.default.initialize({ startOnLoad: true });
    m.default.contentLoaded();
  });
}, [content]);
```

### 9.4 HTML Not Rendering

**Issue:** HTML tags appear as text

**Solution:**
```typescript
// Enable HTML with security
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

<ReactMarkdown
  rehypePlugins={[rehypeRaw, rehypeSanitize]}
>
  {content}
</ReactMarkdown>
```

### 9.5 Tables Not Working

**Issue:** Table syntax not rendering as tables

**Solution:**
```typescript
// Must include remark-gfm
import remarkGfm from 'remark-gfm';

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {content}
</ReactMarkdown>
```

### 9.6 Syntax Highlighting Not Showing Colors

**Issue:** Code blocks render without colors

**Solution:**
```typescript
// Import syntax highlighting CSS
import 'highlight.js/styles/github-dark.css';

// Or for Prism
import 'prismjs/themes/prism-tomorrow.css';
```

---

## 10. Resources & References

### Official Documentation
- **react-markdown:** https://github.com/remarkjs/react-markdown
- **unified:** https://unifiedjs.com/
- **remark:** https://github.com/remarkjs/remark
- **rehype:** https://github.com/rehypejs/rehype

### Plugin Lists
- **awesome-remark:** https://github.com/remarkjs/awesome-remark
- **awesome-rehype:** https://github.com/rehypejs/awesome-rehype
- **Plugin Search:** Search GitHub for topics `remark-plugin` and `rehype-plugin`

### Specific Plugins
- **remark-gfm:** https://github.com/remarkjs/remark-gfm
- **remark-math:** https://github.com/remarkjs/remark-math
- **rehype-katex:** https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex
- **rehype-highlight:** https://github.com/rehypejs/rehype-highlight
- **rehype-pretty-code:** https://rehype-pretty.pages.dev/
- **rehype-mermaid:** https://github.com/remcohaszing/rehype-mermaid
- **rehype-raw:** https://github.com/rehypejs/rehype-raw
- **rehype-sanitize:** https://github.com/rehypejs/rehype-sanitize

### Security Resources
- **OWASP XSS Guide:** https://owasp.org/www-community/attacks/xss/
- **Content Security Policy:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **DOMPurify:** https://github.com/cure53/DOMPurify

### Community Examples
- **react-markdown-examples:** https://github.com/rexxars/react-markdown-examples
- **MDX Documentation:** https://mdxjs.com/
- **Nextra (Next.js docs):** https://nextra.site/

---

## 11. Migration Guides

### From markdown-it to react-markdown

```typescript
// Before (markdown-it)
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
const html = md.render(content);
<div dangerouslySetInnerHTML={{ __html: html }} />

// After (react-markdown)
import ReactMarkdown from 'react-markdown';
<ReactMarkdown>{content}</ReactMarkdown>
```

### From marked to react-markdown

```typescript
// Before (marked)
import { marked } from 'marked';
const html = marked(content);
<div dangerouslySetInnerHTML={{ __html: html }} />

// After (react-markdown)
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
```

### From showdown to react-markdown

```typescript
// Before (showdown)
import showdown from 'showdown';
const converter = new showdown.Converter();
const html = converter.makeHtml(content);
<div dangerouslySetInnerHTML={{ __html: html }} />

// After (react-markdown)
import ReactMarkdown from 'react-markdown';
<ReactMarkdown>{content}</ReactMarkdown>
```

---

## 12. Conclusion

Based on comprehensive research of 2025 best practices:

**Primary Recommendation:** react-markdown with unified/remark/rehype ecosystem

**Key Advantages:**
1. Security by default (no XSS vulnerabilities)
2. Comprehensive plugin ecosystem (100+ plugins)
3. Active maintenance and community support
4. Full TypeScript support
5. Framework agnostic (works with Next.js, Remix, Vite, etc.)
6. Production-ready (used by GitHub, Contentful, and major platforms)

**Essential Plugins:**
- remark-gfm (GFM features)
- remark-math + rehype-katex (math equations)
- rehype-pretty-code (syntax highlighting)
- rehype-mermaid (diagrams)
- rehype-raw + rehype-sanitize (HTML with security)

**Bundle Considerations:**
- Base: ~43 kB
- With all features: ~150-200 kB
- Use code splitting and SSR to optimize
- Shiki-based highlighting adds 0 kB runtime cost

**Security:**
- Always use rehype-sanitize with rehype-raw
- Never trust user input without validation
- Implement CSP headers
- Keep dependencies updated

This solution provides enterprise-grade markdown rendering with all requested features while maintaining security and performance.

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Next Review:** June 2025
