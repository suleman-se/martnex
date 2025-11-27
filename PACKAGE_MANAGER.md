# Package Manager Strategy

This document defines the package manager strategy for the Martnex project.

## Chosen Package Manager: pnpm

We use **pnpm** as the official package manager for this project.

### Why pnpm?

- **Fast:** 2-3x faster installations than npm
- **Efficient:** Saves 50-70% disk space using content-addressable storage
- **Monorepo Native:** Built-in workspace support for our multi-package structure
- **Strict:** Better dependency resolution prevents phantom dependencies
- **Modern:** Actively maintained and growing ecosystem
- **Compatible:** Works seamlessly with Medusa.js and Next.js

## Installation

### Install pnpm Globally

```bash
# Using npm (one-time)
npm install -g pnpm

# Or using standalone script (recommended)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Verify installation
pnpm --version
```

Recommended pnpm version: **8.x or higher**

## Common Commands

### Installing Dependencies

```bash
# Install all dependencies
pnpm install

# Install a specific package
pnpm add <package-name>

# Install as dev dependency
pnpm add -D <package-name>

# Install globally
pnpm add -g <package-name>
```

### Running Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update a specific package
pnpm update <package-name>

# Update all packages
pnpm update

# Interactive update
pnpm update -i
```

### Security

```bash
# Audit dependencies for vulnerabilities
pnpm audit

# Auto-fix vulnerabilities (when possible)
pnpm audit --fix
```

## Lock File: pnpm-lock.yaml

**Always commit `pnpm-lock.yaml` to version control.**

### Why?
- Ensures consistent dependency versions across all environments
- Provides faster and more reliable installations
- Records exact dependency tree for reproducibility

### When to Update
The lock file is automatically updated when:
- Running `pnpm install` with new packages
- Running `pnpm update`
- Running `pnpm install` after `package.json` changes

## Workspace Strategy (Monorepo)

When we expand to a monorepo structure, we'll use pnpm workspaces.

### Project Structure

```
martnex/
├── backend/
│   └── package.json
├── frontend/
│   └── package.json
├── packages/
│   ├── shared/
│   │   └── package.json
│   └── ui/
│       └── package.json
├── pnpm-workspace.yaml
└── package.json (root)
```

### pnpm-workspace.yaml

Create this file in the project root:

```yaml
packages:
  - 'backend'
  - 'frontend'
  - 'packages/*'
```

### Root package.json

```json
{
  "name": "martnex",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter=./backend --filter=./frontend dev",
    "build": "pnpm --filter=./backend build && pnpm --filter=./frontend build",
    "lint": "pnpm --parallel lint"
  }
}
```

### Workspace Commands

```bash
# Install all workspace dependencies
pnpm install

# Run script in specific workspace
pnpm --filter backend dev
pnpm --filter frontend build

# Run script in all workspaces
pnpm -r dev

# Run in parallel
pnpm --parallel dev

# Add dependency to specific workspace
pnpm --filter backend add express
pnpm --filter frontend add react

# Add shared package to another workspace
pnpm --filter backend add @martnex/shared --workspace
```

## pnpm vs npm vs Yarn

| Feature | pnpm | npm | Yarn |
|---------|------|-----|------|
| Speed | ⚡⚡⚡ Fast | 🐌 Slow | ⚡⚡ Medium |
| Disk Space | 💾 Efficient | 💾💾💾 Large | 💾💾 Medium |
| Monorepo | ✅ Native | ⚠️ Basic | ✅ Good |
| Strictness | ✅ Strict | ⚠️ Loose | ⚡ Depends |
| Compatibility | ✅ Great | ✅ Universal | ⚠️ Issues |
| Maintenance | ✅ Active | ✅ Active | ⚠️ Split |

## Best Practices

### 1. Keep Dependencies Updated

```bash
# Check for updates
pnpm outdated

# Interactive update
pnpm update -i

# Update to latest (careful with breaking changes)
pnpm update --latest
```

### 2. Security First

```bash
# Run audit before every PR
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

### 3. Clean Installation

When things go wrong:

```bash
# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Clear pnpm store (optional, removes cached packages)
pnpm store prune

# Reinstall
pnpm install
```

### 4. Production Dependencies

```bash
# Install only production dependencies
pnpm install --prod

# Or using NODE_ENV
NODE_ENV=production pnpm install
```

### 5. Version Ranges

Use conservative version ranges in `package.json`:
- `^1.2.3` - Allow minor and patch updates (default)
- `~1.2.3` - Allow patch updates only
- `1.2.3` - Exact version (use for critical packages)

### 6. Use .npmrc for Configuration

Create `.npmrc` in project root:

```ini
# Use pnpm
shamefully-hoist=false
strict-peer-dependencies=true

# Speed optimizations
prefer-frozen-lockfile=true
package-import-method=auto

# Registry (if using private registry)
# registry=https://registry.npmjs.org/
```

## CI/CD Considerations

In GitHub Actions:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test
```

## How pnpm Saves Disk Space

Traditional package managers (npm/yarn):
```
project1/node_modules/react -> Downloads react 18.2.0
project2/node_modules/react -> Downloads react 18.2.0 AGAIN
project3/node_modules/react -> Downloads react 18.2.0 AGAIN
```

pnpm approach:
```
~/.pnpm-store/react@18.2.0 -> Downloaded ONCE
project1/node_modules/react -> Hardlink to store
project2/node_modules/react -> Hardlink to store
project3/node_modules/react -> Hardlink to store
```

**Result:** Same package stored once, referenced everywhere!

## Troubleshooting

### Cache Issues

```bash
# Clear pnpm cache
pnpm store prune

# Verify store integrity
pnpm store status
```

### Permission Errors

```bash
# Fix permissions (Unix/Mac)
sudo chown -R $USER ~/.pnpm-store
```

### Peer Dependency Warnings

pnpm is strict about peer dependencies. If you see warnings:

```bash
# Install missing peer dependency
pnpm add <peer-dependency>

# Or use --strict-peer-dependencies=false (not recommended)
pnpm install --no-strict-peer-dependencies
```

### Shamefully Hoist (Compatibility)

Some packages expect flat node_modules. If issues arise:

```bash
# Create .npmrc
echo "shamefully-hoist=true" > .npmrc

# Reinstall
pnpm install
```

### Node Modules Symlinks

pnpm uses symlinks. If a tool doesn't support them:

```bash
# Use node-linker
echo "node-linker=hoisted" > .npmrc
pnpm install
```

## Migration from npm/yarn

### From npm

```bash
# Remove npm files
rm -rf node_modules package-lock.json

# Install with pnpm
pnpm install

# Verify everything works
pnpm dev
```

### From Yarn

```bash
# Remove yarn files
rm -rf node_modules yarn.lock

# Install with pnpm
pnpm install

# Verify everything works
pnpm dev
```

### Update package.json Scripts

No changes needed! pnpm uses the same `scripts` section as npm/yarn.

## Why Not npm or Yarn?

### npm Issues
- ❌ Slower installation
- ❌ Larger disk usage (duplicate packages)
- ❌ Workspace support is basic
- ❌ Allows phantom dependencies

### Yarn Issues
- ❌ Yarn v1 is deprecated
- ❌ Yarn v2+ (Berry) has compatibility issues
- ❌ Confusing versioning (v1 vs v2+)
- ❌ Declining community adoption

### pnpm Advantages
- ✅ Fast and efficient
- ✅ Strict dependency management
- ✅ Excellent monorepo support
- ✅ Growing ecosystem
- ✅ Works with all existing tools

## Resources

- **Official Docs:** https://pnpm.io
- **Benchmarks:** https://pnpm.io/benchmarks
- **Migration Guide:** https://pnpm.io/installation#using-a-shorter-alias
- **Workspaces:** https://pnpm.io/workspaces

---

**For Contributors:** Please use `pnpm` for consistency. Installation takes 30 seconds: `npm install -g pnpm`

**Questions?** Open an issue or check the [pnpm documentation](https://pnpm.io).
