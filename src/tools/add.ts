import { z } from "zod";
import type { ToolDefinition } from "./index.js";

export const add: ToolDefinition = {
  name: "add",
  title: "Add",
  description: "Adds two numbers. Shows the pattern for zod number validation.",
  inputSchema: {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  },
  handler: async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] }),
};
