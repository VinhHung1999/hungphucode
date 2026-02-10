---
name: Project Memory Recall
description: Read project memory from .claude/memory/ before starting complex tasks. Use when user says "--project-recall" or when starting work that might benefit from past context. Skip for trivial tasks.
---

# Project Memory Recall

**Purpose**: Read context from `.claude/memory/` to avoid repeating past mistakes and leverage existing knowledge.

## Memory Files

| File | Read when... |
|------|-------------|
| `bugs-and-lessons/README.md` | Fixing a bug, debugging, or working in an area that had past issues |
| `decisions/README.md` | Making a significant technical choice, or understanding why something was built a certain way |
| `architecture/README.md` | Refactoring, adding new modules, or understanding system boundaries |

## Decision Criteria: Recall or Skip?

| Task | Action |
|------|--------|
| Implementing a new feature | **Recall** architecture (what pattern was used before) |
| Making a significant technical decision | **Recall** decisions (why current choices were made) |
| Fixing a bug in an area that had past bugs | **Recall** bugs-and-lessons |
| Fixing a typo | **Skip** |
| Reading a file | **Skip** |
| Simple 1-line change | **Skip** |

## Workflow

1. Identify the upcoming task
2. Pick the relevant memory file(s) — usually just 1-2
3. Read the file
4. Look for:
   - Past decisions that constrain current work
   - Bugs that happened in the same area
   - Patterns/conventions already established
5. Apply context to the task

## Examples

**Before adding a new tool:**
→ Read architecture README to see how existing tools are structured
→ Read decisions to follow established patterns

**Before fixing a bug:**
→ Read bugs-and-lessons — there may be past issues in the same area

**Before making an architecture change:**
→ Read decisions — understand why the current architecture was chosen

## Rules

- **Only read relevant files** — don't read all files for every task
- **Skip for simple tasks** — fixing a typo doesn't need recall
- **CLAUDE.md is always preloaded** — no need to read it again
- **Trust but verify** — memory entries may be outdated if code changed since they were written
