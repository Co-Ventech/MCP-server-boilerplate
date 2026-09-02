import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const addInput = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number"),
});

const addOutput = z.object({
  sum: z.number(),
});

export function registerAddTool(server: McpServer): void {
  server.registerTool(
    "add",
    {
      title: "Add",
      description: "Adds two numbers. Shows v2 Zod validation and structured output.",
      inputSchema: addInput,
      outputSchema: addOutput,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ a, b }) => {
      const sum = a + b;
      return {
        structuredContent: { sum },
        content: [{ type: "text", text: String(sum) }],
      };
    },
  );
}
