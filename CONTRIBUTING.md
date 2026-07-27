<!-- ============================================================ -->
<!--  CONTRIBUTING GUIDE                                          -->
<!-- ============================================================ -->
<div align="center">

  <h1>Contributing to AuthDoc</h1>
  <p>Thank you for considering a contribution. This guide will help you get up and running quickly.</p>

  <a href="https://github.com/your-org/AuthDoc_UI/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  </a>
  <a href="https://github.com/your-org/AuthDoc_UI/issues">
    <img src="https://img.shields.io/badge/issues-open-blue?style=flat-square" alt="Issues" />
  </a>

</div>

<br />

---

<br />

## Table of Contents

<details>
<summary><b>Click to expand navigation</b></summary>

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Convention](#commit-message-convention)
- [Code Style & Linting](#code-style--linting)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

</details>

<br />

---

<br />

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive in all interactions
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy toward other contributors

<br />

---

<br />

## Getting Started

### 1. Fork the Repository

```bash
# Fork via GitHub UI, then clone
git clone https://github.com/YOUR_USERNAME/AuthDoc_UI.git
cd AuthDoc_UI
```

### 2. Set Up the Development Environment

Follow the [Quickstart](./README.md#quickstart) section in the README to install and run all three services (Frontend, Node.js API, Python OCR).

### 3. Create a Branch

```bash
git checkout -b feat/my-new-feature
```

<br />

---

<br />

## Development Workflow

### Project Structure

```
AuthDoc_UI/
├── frontend/          # React + Vite + Tailwind
├── backend/node/      # Express API
└── backend/python/    # FastAPI OCR
```

Each service has its own dependency management. Run commands from within the respective directory.

### Running in Development

```bash
# Terminal 1 — Python OCR
cd backend/python && uvicorn main:app --reload --port 8000

# Terminal 2 — Node.js API
cd backend/node && pnpm dev

# Terminal 3 — Frontend
cd frontend && pnpm dev
```

### Running Tests

```bash
# Frontend tests (Vitest)
cd frontend && pnpm test

# Frontend lint
cd frontend && pnpm lint
```

<br />

---

<br />

## Branch Naming Convention

Use the following prefixes to categorize branches:

| Prefix | Purpose | Example |
| :--- | :--- | :--- |
| `feat/` | New feature | `feat/batch-upload-improvements` |
| `fix/` | Bug fix | `fix/ocr-null-field-handling` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code refactoring | `refactor/extractor-pipeline` |
| `test/` | Adding tests | `test/verifier-service` |
| `chore/` | Maintenance | `chore/update-dependencies` |

<br />

---

<br />

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
| :--- | :--- | :--- |
| `feat` | New feature | `feat(frontend): add dark mode toggle` |
| `fix` | Bug fix | `fix(api): handle empty UMIS gracefully` |
| `docs` | Documentation | `docs: update deployment section` |
| `style` | Formatting (no logic change) | `style: fix eslint warnings` |
| `refactor` | Code restructuring | `refactor(extractor): modularize OCR pipeline` |
| `test` | Adding/updating tests | `test(verifier): add edge case for missing CGPA` |
| `chore` | Dependencies, CI, config | `chore: update tailwind to v3.4` |

### Scope

Use the affected directory or component:

- `frontend`, `api`, `ocr`, `verifier`, `ai-audit`

### Examples

```
feat(api): add batch verify endpoint
fix(ocr): handle corrupted image gracefully
docs: add API reference section
test(frontend): add upload page unit tests
```

<br />

---

<br />

## Code Style & Linting

### Frontend (TypeScript / React)

- **ESLint** — configured in `eslint.config.js`
- **Tailwind CSS** — utility-first classes preferred
- **shadcn/ui** — use existing primitives, do not create duplicates

```bash
cd frontend
pnpm lint        # Check for issues
pnpm lint --fix  # Auto-fix
```

### Backend (Node.js / Express)

- Use CommonJS (`require` / `module.exports`)
- Follow existing file structure: `routes/`, `controllers/`, `services/`, `middleware/`
- No TypeScript — keep plain JS for consistency

### Backend (Python / FastAPI)

- Follow PEP 8 style
- Use type hints where practical
- Keep OCR pipeline functions pure (side-effect free where possible)

<br />

---

<br />

## Pull Request Process

### Before Submitting

1. **Test locally** — Ensure all three services start without errors
2. **Run linter** — `pnpm lint` in the frontend directory
3. **Update docs** — If you changed an API endpoint or added a feature, update the README
4. **No secrets** — Never commit `.env` files, API keys, or tokens

### PR Template

```markdown
## Description
<!-- What does this PR do? -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] Other (describe)

## Testing
<!-- How did you test this? -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] No console.log / print debugging left
- [ ] Documentation updated (if applicable)
```

### Review Process

1. Maintainers will review within **48 hours**
2. Address feedback with new commits (do not force-push during review)
3. Once approved, a maintainer will merge the PR

<br />

---

<br />

## Reporting Bugs

Use [GitHub Issues](https://github.com/your-org/AuthDoc_UI/issues) with the following template:

```markdown
**Describe the bug**
A clear description of the issue.

**To reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 11]
- Node.js version: [e.g., 20.10.0]
- Python version: [e.g., 3.11.5]
- Browser: [e.g., Chrome 120]
```

<br />

---

<br />

## Requesting Features

Open an issue with the `enhancement` label and include:

1. **Problem statement** — What pain point does this solve?
2. **Proposed solution** — How should it work?
3. **Alternatives considered** — Any other approaches?
4. **Impact** — Who benefits and how many users?

<br />

---

<br />

<div align="center">
  <sub>Thank you for contributing to AuthDoc! Every improvement matters.</sub>
</div>
