import { z } from "zod";
import type { ToolDefinition } from "./index.js";

export const echo: ToolDefinition = {
  name: "echo",
  title: "Echo",
  description: "Returns the text you send it. Replace this with your first real tool.",
  inputSchema: { text: z.string().describe("Text to echo back") },
  handler: async ({ text }) => ({ content: [{ type: "text", text }] }),
};
