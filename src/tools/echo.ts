import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const echoInput = z.object({
  text: z.string().describe("Text to echo back"),
});

const echoOutput = z.object({
  text: z.string(),
});

export function registerEchoTool(server: McpServer): void {
  server.registerTool(
    "echo",
    {
      title: "Echo",
      description: "Returns the text you send it. Replace this with your first real tool.",
      inputSchema: echoInput,
      outputSchema: echoOutput,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ text }) => ({
      structuredContent: { text },
      content: [{ type: "text", text }],
    }),
  );
}
