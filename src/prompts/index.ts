import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "summarize",
    {
      title: "Summarize",
      description: "Ask the model to summarize a piece of text.",
      argsSchema: z.object({
        text: z.string().describe("Text to summarize"),
      }),
    },
    ({ text }) => ({
      messages: [
        {
          role: "user",
          content: { type: "text", text: `Summarize the following text in one paragraph:\n\n${text}` },
        },
      ],
    }),
  );
}
