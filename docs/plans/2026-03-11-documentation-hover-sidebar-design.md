# Documentation Hover Sidebar And Client Guides Design

## Goals

- Replace the fixed second documentation sidebar with a hover-triggered submenu that overlays the page content.
- Remove numeric badges from the primary sidebar navigation.
- Expand `MCP Client Setup` into an index page plus client-specific tutorial pages.
- Standardize documentation pages around a shared layout with title headers, subheaders, descriptions, tags, code blocks, examples, and FAQs.

## Navigation Model

- Keep the documentation shell rooted at `/documentation/*`.
- The left rail remains the primary section navigator with `Start`, `API`, `MCP`, and `Guides`.
- Hovering a primary section opens a floating submenu panel positioned to the right of the rail.
- The floating submenu contains the section title, description, and links to child pages.
- The submenu overlays the content area instead of reserving permanent layout width.
- On mobile, the existing sidebar drawer behavior remains tap-based.

## Documentation Route Model

- Preserve `/documentation/mcp/clients` as the client setup hub.
- Add dedicated child routes for each supported client:
  - `/documentation/mcp/clients/cursor`
  - `/documentation/mcp/clients/claude`
  - `/documentation/mcp/clients/claude-code`
  - `/documentation/mcp/clients/chatgpt`
  - `/documentation/mcp/clients/codex-cli`
  - `/documentation/mcp/clients/codex-vscode`
  - `/documentation/mcp/clients/gemini`
  - `/documentation/mcp/clients/antigravity`

## Content System

- Introduce a reusable documentation page template for all docs routes.
- Each page should support:
  - eyebrow or page tag
  - page title
  - concise summary
  - topical tags
  - structured content sections
  - code blocks
  - examples
  - FAQ entries at the bottom
- Shared content primitives reduce repeated card markup and give all docs a consistent reading flow.

## MCP Client Content

- Convert the existing `INTEGRATION_GUIDES` data into structured per-client content.
- The client hub becomes a landing page with cards linking to the detailed routes.
- Each client page includes:
  - what the client supports
  - transport recommendation
  - config file location
  - setup steps
  - copyable configuration
  - verification workflow
  - troubleshooting notes
  - FAQ

## Testing

- Add navigation tests for:
  - no numeric badges in the sidebar
  - hover/flyout shell structure
  - new client route entries
- Keep SEO and route tests green.
- Verify with:
  - `pnpm test`
  - `pnpm --filter web typecheck`
  - `pnpm --filter web build`
  - browser smoke checks for the hover submenu and at least one new client page
