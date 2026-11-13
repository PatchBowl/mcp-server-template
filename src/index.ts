#!/usr/bin/env node
import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { createServer } from './server.js';

// stdout is the MCP wire. Anything you want to log goes to stderr
// (console.error), or it will corrupt the protocol stream.
serveStdio(createServer, {
  onerror: (error) => console.error('[mcp-server-template]', error),
});
