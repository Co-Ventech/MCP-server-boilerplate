import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { SERVER_NAME, SERVER_VERSION } from "../meta.js";

export interface ResourceDefinition {
  name: string;
  uri: string;
  metadata: { title?: string; description?: string; mimeType?: string };
  readCallback: (uri: URL) => ReadResourceResult | Promise<ReadResourceResult>;
}

const info: ResourceDefinition = {
  name: "info",
  uri: "server://info",
  metadata: {
    title: "Server info",
    description: "Returns the server name and version as JSON.",
    mimeType: "application/json",
  },
  readCallback: (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({ name: SERVER_NAME, version: SERVER_VERSION }, null, 2),
      },
    ],
  }),
};

export const resources: ResourceDefinition[] = [info];
