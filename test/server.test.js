import { test } from "node:test";
import assert from "node:assert/strict";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createServer } from "../dist/server.js";

async function connectedClient() {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.1.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return { client, server };
}

test("listTools returns echo and add", async () => {
  const { client } = await connectedClient();
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name);
  assert.ok(names.includes("echo"));
  assert.ok(names.includes("add"));
});

test("callTool echo returns the text sent", async () => {
  const { client } = await connectedClient();
  const result = await client.callTool({ name: "echo", arguments: { text: "hi" } });
  assert.equal(result.content[0].text, "hi");
});

test("callTool add returns the sum", async () => {
  const { client } = await connectedClient();
  const result = await client.callTool({ name: "add", arguments: { a: 2, b: 3 } });
  assert.equal(result.content[0].text, "5");
});

test("callTool add rejects a string argument", async () => {
  const { client } = await connectedClient();
  const result = await client.callTool({ name: "add", arguments: { a: "2", b: 3 } });
  assert.equal(result.isError, true);
});

test("listResources includes server://info and reading it returns the server name", async () => {
  const { client } = await connectedClient();
  const { resources } = await client.listResources();
  assert.ok(resources.some((r) => r.uri === "server://info"));

  const read = await client.readResource({ uri: "server://info" });
  const parsed = JSON.parse(read.contents[0].text);
  assert.equal(parsed.name, "mcp-server-boilerplate");
});

test("getPrompt summarize returns at least one message", async () => {
  const { client } = await connectedClient();
  const result = await client.getPrompt({ name: "summarize", arguments: { text: "abc" } });
  assert.ok(result.messages.length >= 1);
});
