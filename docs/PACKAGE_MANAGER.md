# Package Manager Guide

This guide explains why we use pnpm and how to use it effectively.

---

## Why pnpm? (Simple Answer)

**Three Main Reasons:**

### 1. Speed ⚡
```
npm install:  45 seconds
pnpm install: 15 seconds
```
**pnpm is 3x faster than npm**

### 2. Disk Space 💾
```
npm:  500 MB per project
pnpm: 150 MB per project (shares packages globally)
```
**pnpm saves 70% disk space**

### 3. Safety 🔒
```
npm:  Allows using packages you didn't install (phantom dependencies)
pnpm: Prevents this - you can only use what you explicitly installed
```
**pnpm catches bugs early**

---

## How pnpm Works (Visual)

### Traditional Package Managers (npm, yarn)

```
Your Computer:
├── project1/node_modules/
│   └── react/ (500 MB)      ← Downloaded
├── project2/node_modules/
│   └── react/ (500 MB)      ← Downloaded AGAIN
└── project3/node_modules/
    └── react/ (500 MB)      ← Downloaded AGAIN

Total: 1,500 MB for 3 projects
```

### pnpm's Smart Approach

```
Your Computer:
├── .pnpm-store/
│   └── react/ (500 MB)      ← Downloaded ONCE
│
├── project1/node_modules/react → link to store
├── project2/node_modules/react → link to store
└── project3/node_modules/react → link to store

Total: 500 MB for 3 projects
```

**Result: Same package stored once, linked everywhere!**

---

## Installation

### Install pnpm Globally (One Time Only)

```bash
# Option 1: Using npm (easiest)
npm install -g pnpm

# Option 2: Using standalone script (recommended for production)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Verify it's installed
pnpm --version
# Should show: 9.15.4 or higher
```

**You only need to do this once on your computer.**

---

## Common Commands

### Installing Packages

```bash
# Install all dependencies from package.json
pnpm install

# Add a new package (always use @latest for newest version)
pnpm add <package-name>@latest

# Examples:
pnpm add express@latest
pnpm add axios@latest

# Add as dev dependency (-D means development only)
pnpm add -D typescript@latest
pnpm add -D eslint@latest
```

### Updating Packages

```bash
# See which packages are outdated
pnpm outdated

# Update a specific package
pnpm update <package-name>

# Update all packages
pnpm update

# Interactive update (choose what to update)
pnpm update -i
```

### Removing Packages

```bash
# Remove a package
pnpm remove <package-name>

# Example:
pnpm remove axios
```

### Running Scripts

```bash
# Run scripts from package.json
pnpm dev        # Runs "dev" script
pnpm build      # Runs "build" script
pnpm test       # Runs "test" script
pnpm lint       # Runs "lint" script
```

---

## Using with Docker (Most Common)

Since we use Docker, you'll mostly run pnpm inside containers:

```bash
# Add a package to backend
docker-compose exec backend pnpm add express@latest

# Add a package to frontend
docker-compose exec frontend pnpm add axios@latest

# Check what's outdated in backend
docker-compose exec backend pnpm outdated

# Update all packages in frontend
docker-compose exec frontend pnpm update

# Remove a package from backend
docker-compose exec backend pnpm remove old-package
```

**Pattern:** `docker-compose exec <service> pnpm <command>`

---

## The Lock File: pnpm-lock.yaml

### What Is It?

When you run `pnpm install`, it creates a file called `pnpm-lock.yaml`. This file:
- Records the **exact** version of every package installed
- Ensures everyone gets the **same versions**
- Makes installations **faster** and **reproducible**

### Why It Matters

**Without lock file:**
```
Developer A installs: react 19.2.0
Developer B installs: react 19.2.1  ← Different version!
Production gets:      react 19.2.2  ← Even more different!
```
**Result: "Works on my machine" problems**

**With lock file:**
```
Developer A installs: react 19.2.0
Developer B installs: react 19.2.0  ← Same!
Production gets:      react 19.2.0  ← Same!
```
**Result: Everyone has identical packages**

### Rules for Lock File

✅ **DO:**
- Commit `pnpm-lock.yaml` to git
- Include it in every pull request
- Never manually edit it

❌ **DON'T:**
- Delete it
- Add it to .gitignore
- Modify it by hand

### When Lock File Updates

The lock file automatically updates when you:
- Add a new package: `pnpm add express`
- Remove a package: `pnpm remove axios`
- Update packages: `pnpm update`

**After any of these, commit the updated lock file:**
```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add express package"
```

---

## Troubleshooting

### Problem: "pnpm: command not found"

**Solution:** Install pnpm globally first
```bash
npm install -g pnpm
```

### Problem: Packages not installing correctly

**Solution:** Clean install
```bash
# Delete node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall everything
pnpm install
```

### Problem: Permission errors

**Solution:** Fix permissions (Mac/Linux)
```bash
sudo chown -R $USER ~/.pnpm-store
```

### Problem: Package seems outdated after install

**Solution:** Use @latest explicitly
```bash
# Instead of:
pnpm add react

# Do this:
pnpm add react@latest
```

### Problem: Different versions on different machines

**Solution:** Use the lock file
```bash
# Don't use:
pnpm install

# Use this instead:
pnpm install --frozen-lockfile
```
This ensures exact versions from lock file.

---

## pnpm vs npm vs yarn

| Feature | npm | yarn | pnpm | Winner |
|---------|-----|------|------|--------|
| **Speed** | Slow (45s) | Medium (30s) | Fast (15s) | 🏆 pnpm |
| **Disk Space** | Large (500MB) | Medium (300MB) | Small (150MB) | 🏆 pnpm |
| **Phantom Deps** | ❌ Allows | ⚠️ Depends | ✅ Prevents | 🏆 pnpm |
| **Learning Curve** | Easy | Medium | Easy | 🏆 pnpm/npm |
| **Popularity** | High | Medium | Growing | npm |
| **Workspace Support** | Basic | Good | Excellent | 🏆 pnpm |
| **Maintenance** | ✅ Active | ⚠️ Split (v1/v2) | ✅ Active | pnpm/npm |

**Verdict: pnpm is faster, safer, and more efficient**

---

## Security

### Check for Vulnerabilities

```bash
# Scan for security issues
pnpm audit

# Try to auto-fix issues
pnpm audit --fix
```

### Best Practices

1. **Run audit monthly**
   ```bash
   pnpm audit
   ```

2. **Update packages with security fixes immediately**
   ```bash
   pnpm update <vulnerable-package>
   ```

3. **Keep dependencies minimal**
   - Only install packages you actually need
   - Remove unused packages
   ```bash
   pnpm remove unused-package
   ```

---

## Configuration File: .npmrc

You can configure pnpm behavior with a `.npmrc` file:

```ini
# .npmrc (in project root)

# Strict peer dependencies (prevents version conflicts)
strict-peer-dependencies=true

# Use frozen lockfile in CI (ensures exact versions)
prefer-frozen-lockfile=true

# Auto-install peers (helpful for some packages)
auto-install-peers=true
```

**When to use:**
- Keep default config for now
- Add .npmrc only if you need custom behavior

---

## Quick Reference Card

```bash
# Installation
npm install -g pnpm              # Install pnpm globally (once)

# Daily Commands
pnpm install                     # Install all dependencies
pnpm add <package>@latest        # Add new package (latest version)
pnpm add -D <package>@latest     # Add dev dependency (latest)
pnpm remove <package>            # Remove package
pnpm update                      # Update all packages
pnpm outdated                    # Check outdated packages

# Docker Commands
docker-compose exec backend pnpm add <package>@latest
docker-compose exec frontend pnpm update
docker-compose exec backend pnpm outdated

# Troubleshooting
rm -rf node_modules pnpm-lock.yaml && pnpm install  # Clean install
pnpm store prune                                     # Clear cache
```

---

## Summary

**Why pnpm:**
- ⚡ 3x faster than npm
- 💾 70% less disk space
- 🔒 Prevents phantom dependencies
- 📦 Better for future growth (if we add more packages)

**Key Commands to Remember:**
1. `pnpm add <package>@latest` - Add new package
2. `pnpm update` - Update packages
3. `pnpm outdated` - Check what's outdated

**Important Files:**
- `package.json` - Lists your packages
- `pnpm-lock.yaml` - Locks exact versions (always commit!)

**Golden Rule:**
Always use `@latest` when adding packages to get the newest, safest version!

---

**Questions?** Check the [official pnpm docs](https://pnpm.io) or see [DEVELOPMENT_STANDARDS.md](DEVELOPMENT_STANDARDS.md) for more details.
