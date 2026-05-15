# Knowledgebase contract

Lookbook's docs should work like a small Obsidian vault inside the repo:
linked, current, searchable, and opinionated about what belongs where. The goal
is not to accumulate every thought. The goal is to preserve decisions, plans,
evidence, and operating rules in the place a future agent will actually find
them.

## Principles

- **Docs are part of the product.** If code changes a documented contract, update
  the doc in the same change.
- **Prefer durable homes.** Stable rules belong in `AGENTS.md`, inline READMEs,
  ADRs, or source-adjacent comments. Plans are temporary.
- **Link like a vault.** Use relative Markdown links between related docs instead
  of repeating context. Backlink from follow-up docs to the decision or plan that
  created them.
- **Keep active surfaces small.** `docs/plans/` and `docs/specs/` are working
  surfaces, not permanent storage.
- **Delete or archive stale artifacts.** A completed plan should not keep looking
  active after the work lands.

## Document Types

| Type | Home | Use when | Lifecycle |
|---|---|---|---|
| Operating contract | `AGENTS.md`, `CLAUDE.md`, inline READMEs | Agents need rules to act safely | Keep current; update with behavior changes |
| Knowledgebase index | `docs/README.md` | Someone needs to find the right doc quickly | Keep current as docs move |
| ADR | `docs/adr/` | A durable decision constrains future work | Append-only except typo/link fixes; supersede with a new ADR |
| Spec | `docs/specs/` | A non-trivial design needs shape before tasks | Active until implemented, superseded, or abandoned |
| Plan | `docs/plans/` | A spec or audit is ready for execution | Active until completed, superseded, or abandoned |
| Audit | `docs/audits/` | A point-in-time finding needs evidence | Keep if useful; add superseded notes when follow-up lands |
| Archive | `docs/archive/` | Historical context is useful but not active | Read-only reference; do not treat as current |

## Metadata

New specs, plans, audits, and ADRs should start with a short metadata block so
agents can classify them quickly:

```md
---
status: active
owner: agents
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: link-or-short-context
supersedes:
superseded_by:
---
```

Use these `status` values:

- `active` — current work or live guidance.
- `completed` — work landed and durable docs were updated.
- `superseded` — replaced by a newer plan, spec, ADR, or code contract.
- `abandoned` — intentionally not continuing.
- `archived` — retained only for historical context.

Existing docs do not need a mass retrofit. Add metadata when you touch them for
substantive work.

## Planning Lifecycle

When starting non-trivial work:

1. Check `docs/README.md`, `docs/adr/`, active plans, active specs, and inline
   READMEs before creating a new plan.
2. If a plan already covers the work, update it instead of creating a duplicate.
3. If the work changes a durable rule, plan the doc update explicitly.
4. Keep plans scoped to executable work. Put long-lived decisions in ADRs or
   READMEs, not inside the plan body.

When finishing work:

1. Update durable docs first: `AGENTS.md`, inline READMEs, `README.md`, ADRs,
   setup docs, or source comments as appropriate.
2. Mark the plan/spec `completed` or `superseded`, with a link to the landing
   commit, PR, or durable doc.
3. Remove completed/stale plans from the active working directories. Archive only
   when the artifact contains useful historical reasoning that is not captured
   elsewhere.
4. If a plan exposed follow-up work, create a new focused plan or add a short
   note to the relevant durable doc. Do not leave broad TODOs in completed plans.

## Freshness Workflow

Every docs-impacting change should include a freshness pass:

- Search for stale references to renamed routes, moved files, old status labels,
  and old section anchors.
- Update backlinks when moving or archiving a doc.
- Prefer named sections and contract names over brittle numbered references.
- Remove count-based claims unless the count is load-bearing and cheap to verify.
- If a historical plan/spec is intentionally stale, move it to `docs/archive/`
  or add a superseded note at the top.

Suggested checks:

```bash
rg -n "post-Phase|TODO|stale|superseded|invariant #[0-9]|AGENTS.md.*§|src/app/\\(marketing\\)/variants" AGENTS.md README.md CLAUDE.md docs --glob '!**/KNOWLEDGEBASE.md' --glob '!docs/archive/**'
find docs/plans docs/specs -type f -name "*.md" ! -name README.md | sort
```

## Archiving or Deleting

Use this rule of thumb:

- **Delete** a plan when the durable knowledge has been moved into code, ADRs,
  README files, or AGENTS guidance.
- **Archive** a plan/spec when it explains why a major approach was chosen or
  rejected and that reasoning is still useful.
- **Supersede** an ADR with a new ADR instead of rewriting history.
- **Update in place** for living docs such as `README.md`, `AGENTS.md`,
  `PROJECT_SETUP.md`, and inline READMEs.

Archived files should live under `docs/archive/<year>/` and start with:

```md
> Archived: YYYY-MM-DD. Reason: ...
> Current source of truth: [link](../path.md)
```

## Agent Closeout Checklist

Before declaring a docs/planning task done:

- The source of truth is obvious from `docs/README.md` or `AGENTS.md`.
- Active plans/specs no longer claim completed or abandoned work is pending.
- Durable decisions are captured in ADRs, inline READMEs, or operating docs.
- Stale links and brittle section-number references were searched for.
- The verification loop from `AGENTS.md` passed for the scope of the change.
