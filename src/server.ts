import { McpServer } from '@modelcontextprotocol/server';

import { registerGreetTool } from './tools/greet.js';
import { registerWordCountTool } from './tools/word-count.js';

// Rename these when you create your own server from this template.
export const SERVER_NAME = 'mcp-server-template';
export const SERVER_VERSION = '0.1.0';

/**
 * Builds a fresh server with every tool registered.
 *
 * Transports call this factory once per connection, so keep it free of
 * side effects: open clients, read env vars and the like inside the tool
 * handlers (or pass them in here), not at module load time.
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  registerGreetTool(server);
  registerWordCountTool(server);

  return server;
}
