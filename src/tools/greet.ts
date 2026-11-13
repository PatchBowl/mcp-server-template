import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

/**
 * The smallest useful tool: typed input in, text out.
 * Copy this file as the starting point for a new tool.
 */
export function registerGreetTool(server: McpServer): void {
  server.registerTool(
    'greet',
    {
      title: 'Greet someone',
      description: 'Return a friendly greeting for the given name.',
      inputSchema: z.object({
        name: z.string().min(1).describe('Who to greet'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ name }) => ({
      content: [{ type: 'text', text: `Hello, ${name}! This greeting came from an MCP server.` }],
    }),
  );
}
