<div align="center">

# 🥣 Patchbowl MCP Server Template

**Start a new MCP server in TypeScript in about a minute.**

Typed tools, real tests, CI and a Patchbowl catalog entry, ready to go.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![MCP SDK](https://img.shields.io/badge/MCP%20SDK-v2-black.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-green.svg)

</div>

---

## What you get

- **The current MCP SDK.** Built on `@modelcontextprotocol/server` v2, the stable line of the official TypeScript SDK.
- **Two example tools.** `greet` (the smallest useful tool) and `word-count` (structured output with an `outputSchema`). Copy one to start your own.
- **Tests that use a real client.** In-process tests through the SDK `Client`, plus one test that spawns the built server over stdio, exactly like Claude or Cursor would.
- **CI on Node 20, 22 and 24.** Typecheck, build and test on every push and PR.
- **Works in every MCP client.** Claude Code, Claude Desktop, Cursor, Cline, Windsurf, Zed and anything else that speaks stdio MCP.
- **Patchbowl ready.** `patchbowl.yaml` is your catalog entry, so your server can be one click to install in [Patchbowl](https://github.com/patchbowl/patchbowl).
- **Agent friendly.** `AGENTS.md` (and `CLAUDE.md`) tell AI coding agents how this repo works, so they add tools the right way.

## Create your server

Click **Use this template** on GitHub, or:

```bash
gh repo create my-mcp-server --template patchbowl/mcp-server-template --public --clone
cd my-mcp-server
npm install
npm test
```

Then rename the template bits:

| File | Change |
|---|---|
| `package.json` | `name`, `description`, the `bin` command name |
| `src/server.ts` | `SERVER_NAME`, `SERVER_VERSION` |
| `src/index.ts` | the log prefix |
| `patchbowl.yaml` | every field |
| `README.md` | this file |

## Develop

```bash
npm run dev        # run from source (tsx), speaks MCP on stdio
npm run inspect    # build and open the MCP Inspector in your browser
npm test           # build, then run every test
npm run typecheck  # types only
```

`npm run inspect` is the fastest way to poke at your tools: it opens a web UI where you can list tools and call them by hand.

### Add a tool

1. Copy `src/tools/greet.ts` to `src/tools/my-tool.ts` and rename the function.
2. Register it in `createServer()` in `src/server.ts`.
3. Add a test in `test/server.test.ts`.

```ts
server.registerTool(
  'my-tool',
  {
    description: 'What this tool does, written for the model.',
    inputSchema: z.object({
      query: z.string().describe('What the model should pass here'),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ query }) => ({
    content: [{ type: 'text', text: `You asked for ${query}` }],
  }),
);
```

The one Zod schema gives you the JSON Schema the model sees, argument validation before your handler runs, and typed arguments in the handler.

### Three rules that save hours

1. **Never write to stdout.** It carries the MCP protocol, so one stray `console.log` breaks the connection. Log with `console.error`.
2. **Describe every field.** `.describe()` text is the only documentation the model gets for an argument.
3. **Return errors, don't throw them.** For expected failures return `{ content: [...], isError: true }` so the model can read the message and try again.

### Secrets

Read API keys from `process.env` inside your tool handlers, and list each one under `secrets` in `patchbowl.yaml`. Patchbowl stores them encrypted and injects them at runtime, so they never sit in plaintext in a client config.

## Connect it to a client

Build first (`npm run build`), then point your client at `dist/index.js` with an absolute path.

**Claude Code**

```bash
claude mcp add my-mcp-server -- node /absolute/path/to/my-mcp-server/dist/index.js
```

**Claude Desktop, Cursor, Cline and Windsurf** all use the same `mcpServers` shape:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/my-mcp-server/dist/index.js"],
      "env": { "EXAMPLE_API_KEY": "..." }
    }
  }
}
```

| Client | Config file |
|---|---|
| Claude Desktop | Settings → Developer → Edit Config (`claude_desktop_config.json`) |
| Cursor | `~/.cursor/mcp.json`, or `.cursor/mcp.json` in a project |
| Cline | MCP Servers panel → Configure (`cline_mcp_settings.json`) |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |

Or skip the config files entirely: add your server to [Patchbowl](https://github.com/patchbowl/patchbowl) and it writes all of them for you.

## Publish

```bash
npm login
npm publish --access public
```

Once it is on npm, anyone can run it with `npx -y <your-package>`, and you can update `source` and `runtime` in `patchbowl.yaml` to match.

### Add it to the Patchbowl catalog

Copy `patchbowl.yaml` to `catalog/<id>.yaml` in [patchbowl/patchbowl](https://github.com/patchbowl/patchbowl) and open a PR. See the [catalog guide](https://github.com/patchbowl/patchbowl/blob/main/catalog/README.md) for the schema.

## Project layout

```
src/
  index.ts           stdio entry point
  server.ts          createServer(): registers every tool
  tools/
    greet.ts         smallest useful tool
    word-count.ts    tool with structured output
test/
  server.test.ts     in-process tests through a real Client
  stdio.test.ts      spawns dist/index.js over stdio
patchbowl.yaml       Patchbowl catalog entry
AGENTS.md            guide for AI coding agents
```

## Learn more

- [MCP TypeScript SDK docs (v2)](https://ts.sdk.modelcontextprotocol.io/v2/)
- [MCP specification](https://modelcontextprotocol.io)
- [Patchbowl](https://github.com/patchbowl/patchbowl)

## License

[MIT](LICENSE). Build whatever you like on top of it.
