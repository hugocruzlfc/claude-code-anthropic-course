# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

UIGen is an AI-powered React component generator with live preview. The user describes a component in chat; Claude (or a mock fallback) calls editor tools that mutate an in-memory virtual file system, which is transformed in the browser via Babel standalone and rendered into a sandboxed preview.

## Commands

- `npm run dev` — start Next.js dev server (Turbopack) on port 3000
- `npm run dev:daemon` — same, but backgrounded with output written to `logs.txt` (useful when you need the server running while continuing to work in the same shell)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — Next/ESLint
- `npm test` — Vitest (jsdom). Run a single file with `npx vitest run path/to/file.test.ts`; one test with `-t "<name>"`
- `npm run setup` — install deps, `prisma generate`, `prisma migrate dev` (run once after clone)
- `npm run db:reset` — wipes and re-migrates the SQLite dev DB

Do not run `npm audit fix` — versions are pinned and bumping breaks the app.

## Architecture

### Generation loop (the core flow)

1. Browser → `POST /api/chat` with the chat history + the serialized virtual file system + optional `projectId` (`src/app/api/chat/route.ts`).
2. The route reconstructs a `VirtualFileSystem` from the payload, prepends the system prompt from `src/lib/prompts/generation.tsx` (cached via `cacheControl: ephemeral`), and calls `streamText` from the Vercel AI SDK with two tools: `str_replace_editor` and `file_manager`.
3. `getLanguageModel()` in `src/lib/provider.ts` returns the real Anthropic model when `ANTHROPIC_API_KEY` is set; otherwise a `MockLanguageModel` that streams canned tool calls. The mock keys off whether the user prompt mentions "form" / "card" / etc.
4. Tool executions on the server mutate the server-side `VirtualFileSystem`. Each tool call is also streamed back to the client, where `ChatProvider` (`src/lib/contexts/chat-context.tsx`) forwards it to `FileSystemProvider.handleToolCall` (`src/lib/contexts/file-system-context.tsx`), which mirrors the same mutation against the client-side fs and bumps `refreshTrigger`.
5. `onFinish` persists `messages` + `fileSystem.serialize()` to the `Project` row when there's a `projectId` and a session.

The server fs and the client fs are two independent instances kept in sync by replaying tool calls on both sides. Don't try to push file state through any other channel.

### Virtual file system (`src/lib/file-system.ts`)

`VirtualFileSystem` stores everything in memory — there is no disk write for generated code. Key methods used by the generation loop are `viewFile`, `createFileWithParents`, `replaceInFile`, `insertInFile` (these back the editor tool's `view`/`create`/`str_replace`/`insert` commands), plus `serialize`/`deserializeFromNodes` for round-tripping through the Project row.

### Live preview transform (`src/lib/transform/jsx-transformer.ts`)

`PreviewFrame` collects all files, runs each .js/.jsx/.ts/.tsx through Babel standalone (`react` automatic runtime + optional `typescript` preset), and registers each transformed module as a blob URL in an import map. The map includes several alias variations (`/foo`, `foo`, `@/foo`, with and without extensions) so the model's import paths resolve regardless of style. Third-party imports are rewritten to `https://esm.sh/<pkg>`. Missing local imports get a no-op placeholder module so a half-written project still renders. CSS imports are stripped from JS and concatenated into a `<style>` block. The generated HTML loads Tailwind via the CDN.

### Routing & auth

- `/` — anonymous landing. If logged in, redirects to the most recent project, creating one if none exist (`src/app/page.tsx`).
- `/[projectId]` — project view. Requires auth; missing/forbidden projects redirect home.
- `MainContent` is shared by both routes and renders the chat / preview / code-editor layout.
- Auth is JWT in an httpOnly cookie (`src/lib/auth.ts`, `jose`). `src/middleware.ts` gates `/api/projects` and `/api/filesystem` (note: those routes don't exist yet — the matcher is forward-looking). Server actions live in `src/actions/`.
- Anonymous users still get a working session via `src/lib/anon-work-tracker.ts`, which mirrors messages + fs into `sessionStorage` so work survives until they sign in.

### Prisma

Schema at `prisma/schema.prisma` (SQLite, `prisma/dev.db`). Two models: `User` and `Project`. `Project.messages` and `Project.data` are JSON-encoded strings, not relations. The Prisma client is generated to `src/generated/prisma` (not `node_modules`) — import via `@/lib/prisma`.

### Node 25+ compatibility

`node-compat.cjs` is imported at the top of `next.config.ts` to delete the experimental global `localStorage`/`sessionStorage` on the server, otherwise SSR fails when libraries detect them and assume a browser. Don't remove this import.

### UI

shadcn/ui (style: new-york, neutral base) under `src/components/ui/`. App-specific components: `chat/`, `editor/` (Monaco + file tree), `preview/` (sandboxed iframe), `auth/`. Path alias `@/*` → `src/*`.

## Conventions

- The system prompt (`src/lib/prompts/generation.tsx`) requires every project to have `/App.jsx` as the entry point and use the `@/` alias for non-library imports — both are load-bearing for the preview transformer's import-map resolution. Don't change one without updating the other.
- The mock provider's behavior is keyed on the count of `tool` messages in history; if you add tools or change the loop, update the step gating in `provider.ts` accordingly or the mock will desync.
