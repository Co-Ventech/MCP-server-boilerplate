import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_NAME, SERVER_VERSION } from "./meta.js";
import { tools } from "./tools/index.js";
import { resources } from "./resources/index.js";
import { prompts } from "./prompts/index.js";

export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  for (const t of tools) {
    server.registerTool(
      t.name,
      { title: t.title, description: t.description, inputSchema: t.inputSchema },
      t.handler,
    );
  }

  for (const r of resources) {
    server.registerResource(r.name, r.uri, r.metadata, r.readCallback);
  }

  for (const p of prompts) {
    server.registerPrompt(p.name, { title: p.title, description: p.description, argsSchema: p.argsSchema }, p.callback);
  }

  return server;
}
