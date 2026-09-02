# mcp-server-boilerplate

[![CI](https://github.com/Co-Ventech/MCP-server-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/Co-Ventech/MCP-server-boilerplate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A small, tested TypeScript template for building [Model Context Protocol](https://modelcontextprotocol.io) servers.

It provides protocol wiring, Zod input validation, tools, resources, prompts, a real client-to-server test, an MCP Inspector command, and a tag-based npm release workflow. Copy the template, rename it, replace the examples, and keep the working infrastructure.

## Included

| Component | Purpose |
|---|---|
| `echo` | Minimal text tool with a string schema |
| `add` | Number validation and a typed handler example |
| `server://info` | Static JSON resource with server metadata |
| `summarize` | Prompt template accepting a text argument |
| `createServer()` | Exported factory for isolated integration tests |
| `InMemoryTransport` test | Exercises a real MCP client/server connection |
| `scripts/rename.mjs` | Renames the package, binary, server, and README title |
| Release workflow | Builds, tests, publishes to npm, and creates a GitHub release on `v*` tags |

## Quick start

1. Select **Use this template** on GitHub.
2. Clone your new repository.
3. Install, build, and test it:

```bash
npm ci
npm run build
npm test
```

4. Inspect the server during development:

```bash
npm run inspect
```

The server uses stdio, which is the simplest transport for local MCP clients.

## Connect a local checkout

Claude Code:

```bash
claude mcp add my-server -- node /absolute/path/to/your-repo/dist/index.js
```

Claude Desktop, Cursor, Windsurf, and VS Code use the same command shape in their MCP configuration:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/your-repo/dist/index.js"]
    }
  }
}
```

After publishing to npm:

```bash
claude mcp add my-server -- npx -y your-package-name
```

## Add a tool

Create a tool definition in `src/tools/`, then export it from `src/tools/index.ts`:

```ts
import { z } from "zod";
import type { ToolDefinition } from "./index.js";

export const greet: ToolDefinition = {
  name: "greet",
  title: "Greet",
  description: "Return a greeting for a person's name.",
  inputSchema: {
    name: z.string().min(1).max(100).describe("Name to greet"),
  },
  handler: async ({ name }) => ({
    content: [{ type: "text", text: `Hello, ${name}!` }],
  }),
};
```

Add the new definition to the explicit array in `src/tools/index.ts`. This keeps registration easy to trace and works reliably after bundling. Add an end-to-end test in `test/server.test.js` that connects a real MCP client and calls the tool.

For data another program will consume, add an `outputSchema` and `structuredContent` alongside a readable text result. Add MCP annotations for read-only, idempotent, or destructive behavior where appropriate.

## Rename the template

Run this from the repository root:

```bash
node scripts/rename.mjs your-package-name
```

The script validates the npm package name and updates:

- `package.json` name and binary key;
- `src/meta.ts` server name;
- the README title.

## Development

```bash
npm ci              # install the locked dependency tree
npm run build       # compile TypeScript to dist/
npm test            # run node:test end-to-end tests
npm run dev         # watch TypeScript files
npm run inspect     # open MCP Inspector against dist/index.js
```

The test suite covers tool discovery, tool calls, invalid input, resource reads, and prompt retrieval. Tests use `createServer()` and `InMemoryTransport`, so they exercise MCP protocol behavior instead of only testing helper functions.

## Publish

The release workflow requires an `NPM_TOKEN` repository secret with permission to publish the package.

```bash
npm version patch
git push --follow-tags
```

Pushing a `v*` tag runs the build and tests, publishes the package with npm provenance, and creates a GitHub release with generated notes.

## Design and safety

This starter is intentionally local and stdio-only. It has no network calls, filesystem access, shell execution, or required API keys. If you add capabilities that access files, commands, or external services:

- validate every input with a bounded schema;
- restrict filesystem access to approved workspace roots;
- use command allowlists and timeouts instead of arbitrary shell input;
- redact secrets from results and logs;
- require confirmation for writes or destructive operations;
- return clear `isError: true` results for recoverable tool failures.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Useful extensions include a resource-template example, a structured-output tool, and a test fixture showing a failing external command without invoking arbitrary shell input.

## License

MIT, see [LICENSE](LICENSE).
