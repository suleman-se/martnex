# Development Standards & Guidelines

This document outlines the core principles and standards for developing Martnex.

---

## 📦 Package Management

### Rule #1: Always Use Latest Package Versions

**Why?**
- **Security**: Latest versions contain security patches
- **Performance**: Newer versions are faster and more optimized
- **Features**: Access to latest features and improvements
- **Bug Fixes**: Hundreds of bugs are fixed in each release
- **Community Support**: Latest versions have better documentation and community help

**How to Check Latest Versions:**

```bash
# Check what the latest version is on npm
npm view <package-name> version

# Examples:
npm view next version          # Shows: 16.0.5
npm view @medusajs/medusa version  # Shows: 2.12.1
npm view react version         # Shows: 19.2.0
```

**How to Update Packages:**

```bash
# Inside Docker container
docker-compose exec backend pnpm outdated    # See what's outdated
docker-compose exec backend pnpm update      # Update all packages
docker-compose exec frontend pnpm outdated
docker-compose exec frontend pnpm update

# Or use the Makefile
make install  # Reinstall with latest versions
```

**Before Adding a New Package:**

1. Check the latest version first:
   ```bash
   npm view <package-name> version
   ```

2. Add it with the latest version:
   ```bash
   docker-compose exec backend pnpm add <package-name>@latest
   ```

3. Verify it was added correctly in `package.json`

**Monthly Maintenance:**

- Check for outdated packages monthly
- Update dependencies one at a time
- Test after each major update
- Read changelogs for breaking changes

---

## 🛠️ Technology Stack

### Always Use Latest Stable Versions

**Current Stack (as of 2025-11-28):**

| Technology | Current Version | Why We Use It |
|-----------|----------------|---------------|
| **Next.js** | 16.0.5 | Latest React framework with best performance |
| **React** | 19.2.0 | Latest React with new features and fixes |
| **Medusa.js** | 2.12.1 | Latest e-commerce framework version |
| **TypeScript** | 5.9.3 | Latest for best type safety |
| **Tailwind CSS** | 4.1.17 | Latest for newest CSS features |
| **pnpm** | 9.15.4+ | Fastest, most efficient package manager |
| **PostgreSQL** | 15+ | Stable, well-tested database version |
| **Redis** | 7+ | Latest cache features |
| **Node.js** | 18+ | LTS version with best stability |

**How to Know if You're Using Latest:**

Run this command monthly:
```bash
# Check all packages at once
docker-compose exec backend pnpm outdated
docker-compose exec frontend pnpm outdated
```

---

## 📋 Package Manager: pnpm

### Why pnpm? (Not npm or yarn)

**Speed:**
- npm: 45 seconds to install
- pnpm: 15 seconds to install
- **3x faster** than npm

**Disk Space:**
- npm: 500 MB per project
- pnpm: 150 MB per project (shares packages globally)
- **70% less disk space**

**Safety:**
- npm: Allows "phantom dependencies" (using packages you didn't install)
- pnpm: **Strict mode** - prevents phantom dependencies
- Catches bugs early

**Monorepo Support:**
- npm: Basic workspace support
- pnpm: **Native workspace** support
- Better for future growth

### Common Commands

```bash
# Install dependencies
pnpm install

# Add a package (latest version)
pnpm add <package-name>@latest

# Add dev dependency
pnpm add -D <package-name>@latest

# Update all packages
pnpm update

# Check what's outdated
pnpm outdated

# Remove a package
pnpm remove <package-name>

# Clean install (delete node_modules and reinstall)
pnpm install --force
```

---

## 🐳 Docker Standards

### Why Docker?

**Consistency:**
- Same environment on every developer's machine
- No "works on my machine" problems
- Same versions of Node, PostgreSQL, Redis everywhere

**Isolation:**
- Project dependencies don't conflict with your system
- Multiple projects can use different Node versions
- Clean environment, no leftovers

**Speed:**
- One command to start everything: `./start.sh`
- No manual setup of databases
- Hot reload built-in

### Docker Commands

```bash
# Start everything
./start.sh
# OR
docker-compose up -d

# View logs (see what's happening)
docker-compose logs -f          # All services
docker-compose logs -f backend   # Just backend
docker-compose logs -f frontend  # Just frontend

# Stop everything
docker-compose down

# Restart a service (after changing code)
docker-compose restart backend
docker-compose restart frontend

# Fresh start (deletes all data!)
docker-compose down -v
./start.sh

# Run commands inside containers
docker-compose exec backend pnpm add express
docker-compose exec frontend pnpm add axios

# Access container shell (for debugging)
docker-compose exec backend sh
docker-compose exec frontend sh
```

---

## 📝 Code Quality Standards

### TypeScript

**Always use TypeScript:**
- Catches errors before running code
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring

**Use strict mode:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### ESLint

**Always fix linting errors:**
```bash
# Check for errors
docker-compose exec backend pnpm lint
docker-compose exec frontend pnpm lint

# Auto-fix what can be fixed
docker-compose exec backend pnpm lint --fix
docker-compose exec frontend pnpm lint --fix
```

---

## 🔄 Update Workflow

### When to Update Packages

**Immediately:**
- Security vulnerabilities (run `pnpm audit`)
- Critical bugs affecting your code

**Monthly:**
- Check for all outdated packages
- Update one major package at a time
- Test thoroughly after each update

**Before Each Release:**
- Update all packages to latest
- Run full test suite
- Check for breaking changes

### How to Update Safely

1. **Check what's outdated:**
   ```bash
   docker-compose exec backend pnpm outdated
   ```

2. **Read the changelog:**
   - Check for breaking changes
   - See what new features are available
   - Look for migration guides

3. **Update one at a time:**
   ```bash
   # Update one package
   docker-compose exec backend pnpm update <package-name>
   ```

4. **Test after updating:**
   ```bash
   # Make sure everything still works
   docker-compose restart backend
   docker-compose logs -f backend
   ```

5. **Commit:**
   ```bash
   git add package.json pnpm-lock.yaml
   git commit -m "chore: update <package-name> to v<version>"
   ```

---

## 🚫 What NOT to Do

### ❌ Don't Use Outdated Packages
```bash
# BAD - Using old version
pnpm add react@18.0.0

# GOOD - Using latest
pnpm add react@latest
```

### ❌ Don't Mix Package Managers
```bash
# BAD - Mixing npm and pnpm
npm install
pnpm add express

# GOOD - Use only pnpm
pnpm install
pnpm add express
```

### ❌ Don't Skip Lock Files
```bash
# BAD - Deleting lock file
rm pnpm-lock.yaml

# GOOD - Always commit lock file
git add pnpm-lock.yaml
```

### ❌ Don't Install Globally Inside Docker
```bash
# BAD - Global install in Docker (it resets!)
docker-compose exec backend pnpm add -g typescript

# GOOD - Install in project
docker-compose exec backend pnpm add -D typescript
```

---

## ✅ Best Practices

### 1. Keep Dependencies Updated
- Check monthly: `pnpm outdated`
- Update regularly: `pnpm update`
- Read changelogs before major updates

### 2. Use Semantic Versioning
```json
{
  "dependencies": {
    "react": "^19.2.0"  // ^means update minor and patch
  }
}
```

**Version Meanings:**
- `^19.2.0` - Allow 19.x.x (safe updates)
- `~19.2.0` - Allow 19.2.x (patch only)
- `19.2.0` - Exact version (use for critical packages)

### 3. Commit Lock Files
```bash
# Always commit these files together
git add package.json pnpm-lock.yaml
git commit -m "chore: update dependencies"
```

### 4. Document Breaking Changes
When updating packages, document any breaking changes in your commits:
```bash
git commit -m "chore: update next.js to v16

BREAKING CHANGES:
- Updated Image component API
- Changed routing configuration
- See: https://nextjs.org/docs/v16-migration
"
```

---

## 📚 Resources

### Official Documentation
- **Next.js**: https://nextjs.org/docs
- **Medusa.js**: https://docs.medusajs.com
- **pnpm**: https://pnpm.io/
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Package Registries
- **npm**: https://www.npmjs.com/
- Check package versions, downloads, and security

### Changelogs
- Always read changelogs before updating major versions
- Look for "BREAKING CHANGES" sections
- Check migration guides

---

## 🎯 Summary

**Key Rules:**
1. ✅ Always use latest package versions
2. ✅ Use pnpm (not npm or yarn)
3. ✅ Use Docker for consistency
4. ✅ Check for updates monthly
5. ✅ Read changelogs before major updates
6. ✅ Commit lock files
7. ✅ Test after updating

**Monthly Checklist:**
- [ ] Run `pnpm outdated` in backend and frontend
- [ ] Update packages one at a time
- [ ] Test after each update
- [ ] Commit changes
- [ ] Document breaking changes

---

**Questions?** Check the official docs or ask the team!
