import type { McpServer } from "@modelcontextprotocol/server";
import { registerAddTool } from "./add.js";
import { registerEchoTool } from "./echo.js";

export function registerTools(server: McpServer): void {
  registerEchoTool(server);
  registerAddTool(server);
}
