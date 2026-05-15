# CLAUDE.md

> Claude-specific orientation. Most rules live in [`AGENTS.md`](AGENTS.md) — read it first.

## Read this first

1. [`AGENTS.md`](AGENTS.md) — the source-of-truth conventions, invariants, surface taxonomy, and request playbook for this repo. Everything below is Claude-specific overlay.
2. If you're new to this codebase, also read [`README.md`](README.md).

## Useful skills

When working in this repo, these skills are routinely valuable:

- **`make-interfaces-feel-better`** — for any UI polish work. The repo's polish system (motion primitives, surface treatments, hit areas, tabular numbers) is documented in [`docs/UI_POLISH.md`](docs/UI_POLISH.md) and grounded in ADRs at [`docs/adr/`](docs/adr/).
- **`hostile-review`** — before declaring a non-trivial change done. Especially for theme / dev-panel / block-variant work where regressions hide easily.
- **`frontend-design`** — when scaffolding new components or pages.
- **`b95178c7d8df:shadcn`** — for shadcn component usage and CLI operations.
- **`b95178c7d8df:nextjs`** — for App Router, Server Components, Cache Components questions.
- **`b95178c7d8df:next-cache-components`** — this repo has `cacheComponents: true`. Relevant any time you touch rendering semantics.

Invoke them via the `Skill` tool when relevant.

## Local agent state — `.claude/`

The `.claude/` directory is gitignored. It holds local agent state (settings, cached context, etc.) — don't commit it; don't depend on it being present when working in a fresh clone.

## Worktrees

For isolated parallel work, prefer git worktrees over stashing or branch-switching. The repo is preconfigured with `.worktrees/` gitignored, so worktrees go there by default.

- Use the `superpowers:using-git-worktrees` skill to set one up — it handles directory selection, ignore verification, dependency install, and baseline tests.
- Pair with `superpowers:finishing-a-development-branch` when wrapping up so the worktree gets removed cleanly.
- See [`AGENTS.md`](AGENTS.md) §14 for the workflow basics that apply to every agent (location, create/cleanup commands, baseline verification).

## Verification workflow

When making visual changes, prefer the `preview_*` MCP tools over manual browser testing:

1. `preview_start` to get a dev server URL.
2. Reload (`preview_eval: window.location.reload()`) if HMR didn't catch.
3. `preview_snapshot` for content / structure.
4. `preview_inspect` for CSS values.
5. `preview_click`, `preview_fill` to test interactions, then `preview_snapshot` to confirm.
6. `preview_resize` for responsive or dark mode.
7. `preview_screenshot` as proof for the user when work is done.

For server-side or API work, `preview_logs` and `preview_network` give you the runtime story.

The dev panel toggles with `~` (tilde, no modifier) — useful for theme tweaks and dev-data swaps without a code change.

## Commit messages

This repo enforces Conventional Commits via commitlint (post-Phase 2). Pattern: `<type>(<scope>): <subject>`.

Allowed types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`, `perf`, `ci`, `build`.

Scopes are optional but encouraged. Examples from the recent log:

- `feat(route-transition): coordinate transitions with content via state machine`
- `fix(dev-panel): restore fixed positioning broken by data-touch selector`
- `docs(shaders): spec for theme-aware shader system`

`--no-verify` exists but should be a last resort, documented in the PR.

## Pre-commit hook (post-Phase 2)

Runs on every commit:

1. `lint-staged` — Biome `check --write` on staged `.ts/.tsx/.json` files.
2. `tsc --noEmit` — full typecheck.
3. `vitest --run --changed origin/main` — tests touching changed files.

If pre-commit is slow on your machine, narrow `lint-staged` scope or split tests — do **not** bypass (invariant #10 in [`AGENTS.md`](AGENTS.md)).

## Editing this file

Keep CLAUDE.md short and pointer-style. Substantive conventions belong in [`AGENTS.md`](AGENTS.md) so they're discoverable by every agent, not just Claude.
