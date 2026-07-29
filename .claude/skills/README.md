# Vendored skills

The skill directories here are vendored from the **Superpowers** plugin for Claude Code:

- Source: https://github.com/obra/superpowers
- Commit: `44c9b2d6e889982ac18c27d05a19fefe335194e1` (2026-07-28)
- License: MIT (see `LICENSE-superpowers`), Copyright (c) 2025 Jesse Vincent

## Why vendored

This repo is developed in Claude Code web sessions, where the Superpowers plugin
marketplace is not installed. Committing the skills under `.claude/skills/` makes
them available to every session automatically.

## Invocation names

When installed as a plugin, these skills are namespaced (e.g.
`/superpowers:brainstorming`). Vendored as project skills they are invoked by
their plain directory name instead:

| Plugin name | Project skill name |
|---|---|
| `superpowers:using-superpowers` | `using-superpowers` |
| `superpowers:brainstorming` | `brainstorming` |
| `superpowers:writing-plans` | `writing-plans` |
| `superpowers:executing-plans` | `executing-plans` |
| `superpowers:test-driven-development` | `test-driven-development` |
| `superpowers:systematic-debugging` | `systematic-debugging` |
| ... | (same pattern for the rest) |

Skill files are kept byte-identical to upstream (no local edits), so refreshing
them is a straight copy from a newer checkout of the source repo. The plugin's
session-start hooks, scripts outside `skills/`, and docs are intentionally not
vendored — only the skills themselves.
