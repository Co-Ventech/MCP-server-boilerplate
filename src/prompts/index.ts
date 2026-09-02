import { z } from "zod";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

export interface PromptDefinition {
  name: string;
  title: string;
  description: string;
  argsSchema: { text: z.ZodString };
  callback: (args: { text: string }) => GetPromptResult | Promise<GetPromptResult>;
}

const summarize: PromptDefinition = {
  name: "summarize",
  title: "Summarize",
  description: "Ask the model to summarize a piece of text.",
  argsSchema: { text: z.string().describe("Text to summarize") },
  callback: ({ text }) => ({
    messages: [
      {
        role: "user",
        content: { type: "text", text: `Summarize the following text in one paragraph:\n\n${text}` },
      },
    ],
  }),
};

export const prompts: PromptDefinition[] = [summarize];
