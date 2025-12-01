# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup and planning documentation
- Comprehensive implementation plan with 10 modular phases
- Database schema design for multi-vendor marketplace
- System architecture documentation
- Features checklist with 300+ tracked features
- Project context and requirements documentation
- Contributing guidelines and code of conduct
- MIT License
- Docker setup with docker-compose.yml for PostgreSQL, Redis, Backend, Frontend
- Dockerfiles for backend and frontend with pnpm support via corepack
- Makefile with helper commands for common tasks
- start.sh script for one-command setup
- backend/package.json with Medusa.js v2.11.3 and all dependencies
- backend/medusa-config.ts with v2 configuration using defineConfig()
- @medusajs/workflows-sdk dependency for workflow engine
- Redis modules configured (cache, event-bus, workflow-engine)
- frontend/package.json with Next.js 16.0.5, React 19.2.0, Tailwind 4.1.17
- frontend/postcss.config.mjs with @tailwindcss/postcss plugin for v4.1
- Comprehensive tech documentation (MEDUSAJS_EXPLAINED.md, NEXTJS16_EXPLAINED.md, TAILWINDCSS_4_1.md)
- DEVELOPMENT_STANDARDS.md explaining package management and latest version policy
- PACKAGE_MANAGER.md explaining pnpm usage with visual examples
- IMPLEMENTATION_CHANGES.md documenting all v2 migration changes
- AI instructions in .ai/instructions.md with package management rules
- .gitignore entries for .personal folder

### Changed
- Migrated from npm to pnpm as package manager
- Updated all package versions to latest from npm registry (verified with `npm view`)
- Backend scripts simplified to Medusa v2 commands (medusa build, medusa develop)
- Backend now uses Medusa.js v2.11.3 with module-first architecture
- Backend configuration changed from medusa-config.js to medusa-config.ts
- Redis now required for events, workflows, and cache in v2
- Replaced Jest with Vitest for testing
- Frontend uses Next.js 16.0.5 with Turbopack (stable)
- Frontend uses React 19.2.0 with new Actions and use() hook
- Tailwind CSS 4.1.17 with single @import "tailwindcss" syntax
- PostCSS plugin changed to @tailwindcss/postcss
- globals.css updated from @tailwind directives to @import
- All TypeScript updated to 5.9.3
- Docker configuration to use pnpm instead of npm
- Makefile commands updated to use pnpm
- start.sh script updated to check for pnpm-lock.yaml
- README.md updated with v2 setup instructions

### Removed
- npm and yarn lock files (using pnpm-lock.yaml only)
- Temporary summary files (PHASE_1_SUMMARY.md, SETUP_COMPLETE.md, UPDATES_SUMMARY.md)
- Monorepo structure (packages folder, pnpm-workspace.yaml, root package.json)
- Babel dependencies (no longer needed in Medusa v2)
- cross-env dependency (handled internally by Medusa v2)
- Jest and related test dependencies (replaced with Vitest)
- autoprefixer from frontend (built-in to Tailwind 4.1)
- Old TypeORM references (Medusa v2 uses MikroORM)

### Fixed
- N/A

### Security
- All packages updated to latest versions for security patches
- Configured strict pnpm mode to prevent phantom dependencies

---

## How to Update This File

When you make changes:

1. Add changes under the **[Unreleased]** section
2. Use the categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. When releasing a version, move items from Unreleased to a new version section
4. Format: `## [Version] - YYYY-MM-DD`

Example:
```markdown
## [1.0.0] - 2024-12-01

### Added
- Initial MVP release
- Multi-vendor marketplace functionality
- Commission system
```
