import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

/**
 * A tool with structured output: the client gets a human-readable `content`
 * block and a machine-readable `structuredContent` object that the SDK checks
 * against `outputSchema` before it leaves the server.
 */
export function registerWordCountTool(server: McpServer): void {
  server.registerTool(
    'word-count',
    {
      title: 'Count words',
      description: 'Count the words, characters and lines in a piece of text.',
      inputSchema: z.object({
        text: z.string().max(100_000).describe('The text to measure'),
      }),
      outputSchema: z.object({
        words: z.number().int().nonnegative(),
        characters: z.number().int().nonnegative(),
        lines: z.number().int().nonnegative(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ text }) => {
      const trimmed = text.trim();
      const output = {
        words: trimmed === '' ? 0 : trimmed.split(/\s+/).length,
        characters: text.length,
        lines: text === '' ? 0 : text.split(/\r\n|\r|\n/).length,
      };
      return {
        content: [
          {
            type: 'text',
            text: [
              plural(output.words, 'word'),
              plural(output.characters, 'character'),
              plural(output.lines, 'line'),
            ].join(', '),
          },
        ],
        structuredContent: output,
      };
    },
  );
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
