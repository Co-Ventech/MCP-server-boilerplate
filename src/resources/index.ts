import { McpServer } from "@modelcontextprotocol/server";
import { SERVER_NAME, SERVER_VERSION } from "../meta.js";

export function registerResources(server: McpServer): void {
  server.registerResource(
    "info",
    "server://info",
    {
      title: "Server info",
      description: "Returns the server name and version as JSON.",
      mimeType: "application/json",
    },
    (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ name: SERVER_NAME, version: SERVER_VERSION }, null, 2),
        },
      ],
    }),
  );
}
