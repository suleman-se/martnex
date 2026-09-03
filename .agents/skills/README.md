# Skills

Knowledge base for AI agents working on Martnex — 19 skills.
Start with [AGENTS.md](../../AGENTS.md) at the repo root.

## Layout

Each skill is a directory containing a `SKILL.md` with `name` and `description`
frontmatter. **The directory name is the skill's invocable name** and must match
the `name` field. The tree is intentionally flat — agents do not discover skills
nested inside category folders.

```
.agents/skills/<skill-name>/SKILL.md
```

`.claude` is a symlink to `.agents`, so Claude Code picks these up automatically.
Other agents should read them directly from this directory.

## Project

| Skill | Purpose |
| :--- | :--- |
| [`project-identity`](project-identity/SKILL.md) | Load automatically for ALL Martnex development tasks to understand project philosophy, global rules, and AI assistant standards. This is the source of… |
| [`project-development`](project-development/SKILL.md) | This skill should be used when the user asks to "start an LLM project", "design batch pipeline", "evaluate task-model fit", "structure agent project",… |
| [`using-superpowers`](using-superpowers/SKILL.md) | Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying… |

## Medusa v2 backend

| Skill | Purpose |
| :--- | :--- |
| [`medusa-core`](medusa-core/SKILL.md) | Load automatically when planning, researching, or implementing ANY Medusa backend features (custom modules, API routes, workflows, data models, module… |
| [`medusa-admin`](medusa-admin/SKILL.md) | Load automatically when planning, researching, or implementing Medusa Admin dashboard UI (widgets, custom pages, forms, tables, data loading,… |
| [`medusa-storefront`](medusa-storefront/SKILL.md) | Load automatically when planning, researching, or implementing Medusa storefront features in Next.js (App Router, Server Components, Client Components,… |
| [`medusa-ops`](medusa-ops/SKILL.md) | Operational tasks for Medusa like migrating databases, generating migrations, and creating admin users. |

## Next.js & React

| Skill | Purpose |
| :--- | :--- |
| [`next-patterns`](next-patterns/SKILL.md) | Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font… |
| [`next-cache`](next-cache/SKILL.md) | Next.js 16 Cache Components - PPR, use cache directive, cacheLife, cacheTag, updateTag |
| [`react-best-practices`](react-best-practices/SKILL.md) | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring… |
| [`composition-patterns`](composition-patterns/SKILL.md) | React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or… |

## Design & UI

| Skill | Purpose |
| :--- | :--- |
| [`ui-ux-pro-max`](ui-ux-pro-max/SKILL.md) | UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25… |
| [`web-design-guidelines`](web-design-guidelines/SKILL.md) | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check… |

## Workflow

| Skill | Purpose |
| :--- | :--- |
| [`brainstorming`](brainstorming/SKILL.md) | You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent,… |
| [`writing-plans`](writing-plans/SKILL.md) | Use when you have a spec or requirements for a multi-step task, before touching code |
| [`executing-plans`](executing-plans/SKILL.md) | Use when you have a written implementation plan to execute in a separate session with review checkpoints |

## Quality

| Skill | Purpose |
| :--- | :--- |
| [`test-driven-development`](test-driven-development/SKILL.md) | Use when implementing any feature or bugfix, before writing implementation code |
| [`systematic-debugging`](systematic-debugging/SKILL.md) | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes |
| [`webapp-testing`](webapp-testing/SKILL.md) | Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior,… |

## Adding a skill

1. Create `.agents/skills/<name>/SKILL.md` with `name` (matching the directory)
   and a `description` that says *when* to use it, not just what it is.
2. Keep `SKILL.md` short; put long material in `references/` beside it.
3. Add it to the table above and, if broadly relevant, to the root `AGENTS.md`.
