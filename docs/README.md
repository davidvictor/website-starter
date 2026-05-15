# Docs index

This folder is the repo knowledgebase. Keep it useful for future agents and
future client clones: durable decisions stay easy to find, active plans stay
current, and stale planning artifacts leave the working surface.

## Start here

- [`KNOWLEDGEBASE.md`](KNOWLEDGEBASE.md) — documentation lifecycle, plan cleanup,
  Obsidian-style linking, and freshness rules.
- [`CLIENT_PLAYBOOK.md`](CLIENT_PLAYBOOK.md) — client-facing request guide.
- [`PROJECT_SETUP.md`](PROJECT_SETUP.md) — per-clone setup checklist.
- [`PAYLOAD_CMS_FUTURE.md`](PAYLOAD_CMS_FUTURE.md) — forward-compat contract for
  eventual Payload migration.
- [`UI_POLISH.md`](UI_POLISH.md) — polish-system operator manual.

## Decision and planning records

- [`adr/`](adr/) — durable architecture/design decisions.
- [`audits/`](audits/) — point-in-time evidence reports.
- [`specs/`](specs/) — active design specs only.
- [`plans/`](plans/) — active execution plans only.
- [`archive/`](archive/) — historical artifacts that are useful but no longer
  active.

If a document becomes stale, either update it in the same change that made it
stale, archive it with a superseded note, or delete it when the durable
knowledge has moved into the right README/ADR/source comment.
