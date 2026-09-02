# mcp-server-boilerplate

[![CI](https://github.com/Co-Ventech/MCP-server-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/Co-Ventech/MCP-server-boilerplate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A tested TypeScript starter for building local [Model Context Protocol (MCP)](https://modelcontextprotocol.io) servers with the official MCP TypeScript SDK v2.

This template uses the v2 package split, Standard Schema-compatible Zod 4 schemas, the canonical stdio server runner, a real v2 client/server integration suite, MCP Inspector, and automated CI/release workflows.

## What is included

| Component | Purpose |
|---|---|
| `echo` | Minimal read-only tool with v2 structured output |
| `add` | Typed numeric input/output and schema validation |
| `server://info` | Static JSON resource with server metadata |
| `summarize` | Prompt template accepting a text argument |
| `createServer()` | Factory for isolated tests and future transports |
| `InMemoryTransport` | No-socket v2 client/server integration tests |
| `scripts/rename.mjs` | Updates package, lockfile, server name, and GitHub links |
| GitHub Actions | CI on pushes/PRs and npm provenance release on `v*` tags |

## Requirements

- Node.js 20 or newer
- npm 10 or newer

The server runtime uses `@modelcontextprotocol/server`. The test harness uses `@modelcontextprotocol/client`. The v2 SDK is split into focused packages instead of the v1 monolithic `@modelcontextprotocol/sdk` package.

## Quick start

```bash
npm ci
npm test
npm run inspect
```

`npm test` compiles the TypeScript source and runs the end-to-end tests. `npm run inspect` opens the MCP Inspector against the compiled stdio server.

The server speaks stdio, which is the normal transport when a local MCP host launches the server as a child process. Keep protocol traffic on stdout; diagnostic logging belongs on stderr.

## Connect to an MCP host

Build the server first:

```bash
npm run build
```

Example Claude Code command:

```bash
claude mcp add my-server -- node /absolute/path/to/your-repo/dist/index.js
```

Equivalent JSON configuration for Claude Desktop, Cursor, Windsurf, or VS Code:

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

After publishing a uniquely named npm package:

```bash
claude mcp add my-server -- npx -y your-package-name
```

## Add a tool

Create a registration function in `src/tools/`, then call it from `src/tools/index.ts`:

```ts
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const greetInput = z.object({
  name: z.string().min(1).max(100).describe("Name to greet"),
});

export function registerGreetTool(server: McpServer): void {
  server.registerTool(
    "greet",
    {
      title: "Greet",
      description: "Return a greeting for a person's name.",
      inputSchema: greetInput,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ name }) => ({
      content: [{ type: "text", text: `Hello, ${name}!` }],
    }),
  );
}
```

Register it explicitly:

```ts
import { registerGreetTool } from "./greet.js";

export function registerTools(server: McpServer): void {
  registerEchoTool(server);
  registerAddTool(server);
  registerGreetTool(server);
}
```

For machine-consumed data, add a v2 `outputSchema` and return matching `structuredContent` together with a readable text block. Mark tools with annotations that accurately describe their behavior. Write an end-to-end test for every new tool.

## Rename the template

Run this from the repository root. The optional second argument is the GitHub owner:

```bash
node scripts/rename.mjs your-package-name your-github-owner
```

The script updates:

- `package.json` name, binary, repository, issue tracker, and homepage;
- the package-lock root name;
- `src/meta.ts` server name;
- the README title, package references, and repository links.

Use a unique, unscoped npm package name or adapt the repository-name mapping for your organization.

## Development commands

```bash
npm ci              # install the locked dependency tree
npm run typecheck   # type-check without emitting files
npm run build       # compile TypeScript to dist/
npm test            # build and run node:test integration tests
npm run dev         # watch TypeScript files
npm run inspect     # launch MCP Inspector against dist/index.js
```

The tests use a real v2 `Client`, `McpServer`, and `InMemoryTransport` pair. They cover tool discovery, v2 annotations and schemas, structured tool results, invalid input, resource reads, and prompt retrieval.

## Publish

The package name must be available on npm. Configure an `NPM_TOKEN` repository secret before publishing. The release workflow runs tests, publishes with npm provenance, and creates a GitHub release when a `v*` tag is pushed.

```bash
npm version patch
git push --follow-tags
```

## Design and safety

This starter is intentionally local and stdio-only. It has no network calls, filesystem access, shell execution, or required API keys. If you add capabilities that access files, commands, or external services:

- validate every input with a bounded schema;
- restrict filesystem access to approved workspace roots;
- use command allowlists and timeouts instead of arbitrary shell input;
- redact secrets from results and logs;
- require confirmation for writes or destructive operations;
- return clear `isError: true` results for recoverable tool failures.

For a remote multi-client deployment, keep the `createServer()` factory and add a separately tested Streamable HTTP entry point with authentication and origin protection.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep examples small, schemas explicit, tests protocol-level, and stdout reserved for MCP messages.

## License

MIT, see [LICENSE](LICENSE).
