import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Spawns the built server the same way Claude, Cursor and other clients do,
// so a broken entry point or a stray console.log on stdout fails here.
// `npm test` builds first (see the "pretest" script).
const entry = fileURLToPath(new URL('../dist/index.js', import.meta.url));

describe('stdio entry point', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({ name: 'stdio-harness', version: '1.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [entry] }));
  });

  afterAll(async () => {
    await client.close();
  });

  it('answers a tool call over stdio', async () => {
    const result = await client.callTool({ name: 'greet', arguments: { name: 'stdio' } });
    expect(result.content).toEqual([
      { type: 'text', text: 'Hello, stdio! This greeting came from an MCP server.' },
    ]);
  });
});
