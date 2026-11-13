import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createServer } from '../src/server.js';

// Drives the real server through a real Client, in-process: no port, no
// child process. `handler.fetch` answers every request the transport sends.
describe('server', () => {
  let handler: ReturnType<typeof createMcpHandler>;
  let client: Client;

  beforeEach(async () => {
    handler = createMcpHandler(createServer);
    const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    });
    client = new Client(
      { name: 'test-harness', version: '1.0.0' },
      { versionNegotiation: { mode: 'auto' } },
    );
    await client.connect(transport);
  });

  afterEach(async () => {
    await client.close();
    await handler.close();
  });

  it('lists every tool', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual(['greet', 'word-count']);
  });

  it('greets by name', async () => {
    const result = await client.callTool({ name: 'greet', arguments: { name: 'Ada' } });
    expect(result.isError).toBeFalsy();
    expect(result.content).toEqual([
      { type: 'text', text: 'Hello, Ada! This greeting came from an MCP server.' },
    ]);
  });

  it('rejects arguments that fail the schema', async () => {
    const result = await client.callTool({ name: 'greet', arguments: { name: '' } });
    expect(result.isError).toBe(true);
  });

  it('returns structured output from word-count', async () => {
    const result = await client.callTool({
      name: 'word-count',
      arguments: { text: 'one two three\nfour' },
    });
    expect(result.structuredContent).toEqual({ words: 4, characters: 18, lines: 2 });
    expect(result.content).toEqual([{ type: 'text', text: '4 words, 18 characters, 2 lines' }]);
  });

  it('handles empty text', async () => {
    const result = await client.callTool({ name: 'word-count', arguments: { text: '' } });
    expect(result.structuredContent).toEqual({ words: 0, characters: 0, lines: 0 });
  });

  it('uses the singular for a count of one', async () => {
    const result = await client.callTool({ name: 'word-count', arguments: { text: 'x' } });
    expect(result.content).toEqual([{ type: 'text', text: '1 word, 1 character, 1 line' }]);
  });
});
