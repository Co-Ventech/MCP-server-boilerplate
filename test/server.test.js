import { test } from "node:test";
import assert from "node:assert/strict";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { createServer } from "../dist/server.js";

async function connectedClient() {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.1.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return { client, server };
}

function closeAfterTest(t, { client, server }) {
  t.after(async () => {
    await client.close();
    await server.close();
  });
}

test("listTools returns v2 schemas and annotations", async (t) => {
  const connection = await connectedClient();
  closeAfterTest(t, connection);

  const { tools } = await connection.client.listTools();
  const echo = tools.find((tool) => tool.name === "echo");
  const add = tools.find((tool) => tool.name === "add");

  assert.ok(echo);
  assert.ok(add);
  assert.equal(echo.annotations.readOnlyHint, true);
  assert.equal(echo.outputSchema.type, "object");
  assert.equal(echo.outputSchema.properties.text.type, "string");
  assert.deepEqual(echo.outputSchema.required, ["text"]);
});

test("callTool echo returns text and structured output", async (t) => {
  const connection = await connectedClient();
  closeAfterTest(t, connection);

  const result = await connection.client.callTool({ name: "echo", arguments: { text: "hi" } });
  assert.equal(result.content[0].text, "hi");
  assert.deepEqual(result.structuredContent, { text: "hi" });
});

test("callTool add returns the sum and structured output", async (t) => {
  const connection = await connectedClient();
  closeAfterTest(t, connection);

  const result = await connection.client.callTool({ name: "add", arguments: { a: 2, b: 3 } });
  assert.equal(result.content[0].text, "5");
  assert.deepEqual(result.structuredContent, { sum: 5 });
});

test("callTool add rejects a string argument", async (t) => {
  const connection = await connectedClient();
  closeAfterTest(t, connection);

  const result = await connection.client.callTool({ name: "add", arguments: { a: "2", b: 3 } });
  assert.equal(result.isError, true);
});

test("listResources includes server://info and reading it returns the server name", async (t) => {
  const connection = await connectedClient();
  closeAfterTest(t, connection);

  const { resources } = await connection.client.listResources();
  assert.ok(resources.some((resource) => resource.uri === "server://info"));

  const read = await connection.client.readResource({ uri: "server://info" });
  const parsed = JSON.parse(read.contents[0].text);
  assert.equal(parsed.name, "mcp-server-boilerplate");
});

test("getPrompt summarize returns at least one message", async (t) => {
  const connection = await connectedClient();
  closeAfterTest(t, connection);

  const result = await connection.client.getPrompt({ name: "summarize", arguments: { text: "abc" } });
  assert.ok(result.messages.length >= 1);
});
