# Contributing to Martnex

First off, thank you for considering contributing to Martnex! It's people like you that make Martnex such a great tool for building marketplaces.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [suleman192@gmail.com].

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear and descriptive title**
- **Detailed description of the proposed feature**
- **Explain why this feature would be useful**
- **List any alternatives you've considered**

### Your First Code Contribution

Unsure where to start? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `beginner friendly` - Easier issues for beginners

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code, add tests
3. If you've changed APIs, update documentation
4. Ensure test suite passes
5. Make sure your code follows the style guidelines
6. Write a clear commit message

---

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 15+
- Redis 7+
- Git

### Setup Steps

1. **Fork and Clone**
   ```bash
   git clone https://github.com/suleman-se/martnex.git
   cd martnex
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Up Database**
   ```bash
   # Using docker (recommended)
   ./start.sh
   
   # Or manual setup
   cd backend
   pnpm run migrate
   pnpm run seed
   ```

4. **Start Development Servers**
   ```bash
   # Frontend
   cd frontend
   pnpm dev
   
   # Backend
   cd backend
   pnpm dev
   ```

For detailed setup, see [Setup Instructions](docs/SETUP_INSTRUCTIONS.md).

---

## Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update relevant documentation
   - Update CHANGELOG.md

2. **Follow Code Style**
   - Run linter: `npm run lint`
   - Format code: `npm run format`
   - Follow existing patterns

3. **Write Tests**
   - Add unit tests for new features
   - Ensure all tests pass: `npm test`
   - Maintain or improve code coverage

4. **Commit Guidelines**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     feat: add seller payout feature
     fix: resolve commission calculation bug
     docs: update setup instructions
     style: format code with prettier
     refactor: simplify order processing
     test: add tests for commission service
     chore: update dependencies
     ```

5. **Pull Request Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] All tests pass
   - [ ] Added new tests
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

6. **Review Process**
   - At least one maintainer must approve
   - All CI checks must pass
   - Address review feedback promptly

---

## Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Prefer functional programming patterns

```typescript
// Good
const calculateCommission = (orderTotal: number, rate: number): number => {
  return orderTotal * (rate / 100)
}

// Bad
function calc(a, b) {
  return a * b / 100
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow React best practices

```typescript
// Good
interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // Component logic
}
```

### CSS/Tailwind CSS
- Use **Tailwind CSS v4** utility classes with native `@theme` support.
- Follow a mobile-first, responsive approach.
- Prioritize **Visual Excellence**: Use harmonious color palettes, modern typography, and smooth micro-animations.
- Use **Shadcn/UI** components from `@/components/ui` as the primary primitive library.
- Avoid raw divs for styling; prefer structured UI components (e.g., `<Card>`, `<Container>`).

### Git Commit Messages

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

---

## Code Review Guidelines

### For Contributors

- Be open to feedback
- Don't take criticism personally
- Ask questions if unclear
- Be patient with reviewers

### For Reviewers

- Be respectful and constructive
- Explain the "why" behind suggestions
- Approve when ready, even if minor changes remain
- Respond in a timely manner

---

## Testing

### Running Tests

```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
cd frontend
pnpm test

# E2E tests (Playwright)
cd frontend
pnpm playwright test
```

### Writing Tests

- Write tests for new features
- Update tests when changing code
- Aim for high coverage
- Test edge cases

---

## Documentation

- Update docs for new features
- Keep docs in sync with code
- Use clear, simple language
- Include code examples
- Add screenshots when helpful

---

## Project Structure

```
martnex/
├── backend/           # Medusa.js backend
├── frontend/          # Next.js frontend
├── docs/             # Documentation
├── planning/         # Planning documents
└── tests/            # Test files
```

---

## Getting Help

- 💬 [GitHub Discussions](https://github.com/suleman-se/martnex/discussions)
- 🐛 [Issue Tracker](https://github.com/suleman-se/martnex/issues)
- 📖 [Documentation](docs/)

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Martnex! 🎉
