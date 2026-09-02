import type { ZodRawShape } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { echo } from "./echo.js";
import { add } from "./add.js";

// `handler` args are typed `any` here (rather than inferred from `inputSchema`) because
// `tools` below is a heterogeneous array: each tool's own file still gets full zod-inferred
// argument types when it destructures its handler params, but the shared array type has to
// erase that back down to something all tools fit. The zod schema still validates at runtime
// regardless of this compile-time widening.
export interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodRawShape;
  handler: (args: any) => Promise<CallToolResult>;
}

export const tools: ToolDefinition[] = [echo, add];
