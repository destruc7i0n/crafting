# AGENTS.md

## Cursor Cloud specific instructions

This is a **Minecraft Crafting Recipe Generator** — a frontend-only React SPA (no backend, no database). See `README.md` for project overview.

### Key commands

All scripts are in `package.json`:

| Task | Command |
|---|---|
| Dev server | `pnpm dev` (Vite, port 5173) |
| Lint | `pnpm lint` (oxlint) |
| Format check | `pnpm format:check` (oxfmt) |
| Type check | `pnpm type-check` (tsc --noEmit) |
| Tests | `pnpm test` (vitest) |
| Build | `pnpm build` (runs tag generation + tsc + vite build) |
| Generate tags | `pnpm generate:tags` (requires Bun + Git; clones mcmeta repo) |

### Non-obvious notes

- **Bun is required** for `pnpm generate:tags` (the script at `scripts/fetch-tags.ts` runs via Bun). Bun is installed at `~/.bun/bin/bun` and must be on PATH.
- **Tag generation must run at least once** before `pnpm dev` or `pnpm build` will work correctly. The generated files live in `src/data/generated/vanilla-tags/` and are gitignored.
- The `prebuild` script automatically runs `pnpm generate:tags` before `pnpm build`, but `pnpm dev` does **not** auto-generate tags.
- There are no external service dependencies (no database, no API server). The app is entirely client-side.
