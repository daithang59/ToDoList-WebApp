---
name: Lint and Fix Code
description: Identify and fix linting and formatting issues in the codebase
---

# Lint and Fix Code Skill

This skill helps you identify and automatically fix linting and formatting issues in the To-Do List WebApp project.

## Quick Fix

To automatically fix most linting and formatting issues:

```bash
# Auto-fix linting issues
npm run lint:fix

# Auto-format code
npm run format
```

## Step-by-Step Process

### 1. Check Current Status

First, check for any linting issues:

```bash
npm run lint
```

This will show all linting errors and warnings across backend and frontend.

### 2. Auto-Fix Linting Issues

Automatically fix fixable linting issues:

```bash
npm run lint:fix
```

This runs ESLint with `--fix` flag on both backend and frontend.

### 3. Check Formatting

Check if code follows Prettier formatting rules:

```bash
npm run format:check
```

### 4. Auto-Format Code

Auto-format all code files:

```bash
npm run format
```

This runs Prettier on all:
- JavaScript files (`.js`)
- JSX files (`.jsx`)
- JSON files (`.json`)
- Markdown files (`.md`)
- CSS files (`.css`)
- YAML files (`.yml`, `.yaml`)

### 5. Verify Fixes

After fixing, verify that all issues are resolved:

```bash
# Check linting again
npm run lint

# Check formatting again
npm run format:check
```

## Backend-Specific Linting

### Check Backend Only

```bash
npm run lint:backend
```

Or from backend directory:

```bash
cd backend
npm run lint
```

### Fix Backend Issues

```bash
cd backend
npm run lint -- --fix
```

### Backend ESLint Configuration

Located in `backend/eslint.config.js`, configured for:
- Node.js environment
- ES6+ features
- Async/await patterns
- Express.js best practices

## Frontend-Specific Linting

### Check Frontend Only

```bash
npm run lint:frontend
```

Or from frontend directory:

```bash
cd frontend
npm run lint
```

### Fix Frontend Issues

```bash
cd frontend
npm run lint -- --fix
```

### Frontend ESLint Configuration

Located in `frontend/eslint.config.js`, configured for:
- React and JSX
- React Hooks rules
- Vite environment
- Browser globals
- ES6+ features

## Common Linting Issues

### Unused Variables

**Issue**: Variables declared but never used

**Fix**: Remove unused variables or prefix with `_` if intentionally unused:

```javascript
// Before
const unusedVar = 'test';

// After - Option 1: Remove
// Removed

// After - Option 2: Mark as intentionally unused
const _unusedVar = 'test';
```

### Missing Dependencies in useEffect

**Issue**: React Hook useEffect has missing dependencies

**Fix**: Add missing dependencies or use ESLint disable comment if intentional:

```javascript
// Before
useEffect(() => {
  doSomething(value);
}, []); // Missing 'value' in dependencies

// After - Option 1: Add dependency
useEffect(() => {
  doSomething(value);
}, [value]);

// After - Option 2: Intentionally ignore (rarely needed)
useEffect(() => {
  doSomething(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

### Prop Types Missing

**Issue**: Component using props without PropTypes validation

**Fix**: Add PropTypes or use TypeScript:

```javascript
import PropTypes from 'prop-types';

function MyComponent({ name, age }) {
  return <div>{name} - {age}</div>;
}

MyComponent.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
};
```

### Console Statements

**Issue**: `console.log()` statements in production code

**Fix**: Remove or replace with proper logging:

```javascript
// Before
console.log('Debug info');

// After - Development only
if (import.meta.env.DEV) {
  console.log('Debug info');
}

// Or remove entirely
// Removed
```

## Prettier Formatting Issues

### Line Length

Prettier automatically breaks long lines (default: 80 characters).

### Quotes

Prettier enforces single quotes by default (configurable in `.prettierrc`).

### Trailing Commas

Prettier adds trailing commas in multi-line arrays/objects (ES5 compatible).

### Semicolons

Prettier adds semicolons (configurable in `.prettierrc`).

## Editor Integration

### VSCode Setup

Install extensions:
1. ESLint
2. Prettier - Code formatter

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### WebStorm/IntelliJ Setup

1. Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable Prettier: Settings → Languages & Frameworks → JavaScript → Prettier
3. Enable format on save: Settings → Tools → Actions on Save

## Ignoring Files

### ESLint Ignore

Add patterns to `.eslintignore`:

```
dist/
coverage/
node_modules/
*.config.js
```

### Prettier Ignore

Add patterns to `.prettierignore`:

```
dist/
coverage/
node_modules/
package-lock.json
```

## Custom Rules

### Disable Specific Rule

In code:

```javascript
// Disable for next line
// eslint-disable-next-line no-console
console.log('Important log');

// Disable for entire file
/* eslint-disable no-console */
```

In config:

```javascript
// eslint.config.js
export default {
  rules: {
    'no-console': 'warn', // Change from error to warning
  },
};
```

## Pre-Commit Hooks

To ensure code quality before committing, consider setting up Husky:

```bash
# Install Husky
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint:fix && npm run format"
```

## Continuous Integration

In CI/CD pipeline, run:

```bash
# Check formatting (no auto-fix)
npm run format:check

# Check linting (no auto-fix)
npm run lint

# If either fails, CI should fail
```

## Troubleshooting

### ESLint Cache Issues

Clear ESLint cache:

```bash
cd backend && rm -rf .eslintcache
cd frontend && rm -rf .eslintcache
```

### Prettier and ESLint Conflicts

Ensure `eslint-config-prettier` is installed to disable conflicting rules:

```bash
npm install --save-dev eslint-config-prettier
```

### Node Modules Linting

Ensure `node_modules` is ignored in `.eslintignore` and `.prettierignore`.

## Best Practices

1. **Run linting regularly** during development
2. **Fix issues immediately** rather than letting them accumulate
3. **Enable editor integration** for real-time feedback
4. **Review changes** after auto-fix to ensure correctness
5. **Don't disable rules** without good reason
6. **Document rule exceptions** with comments

## Summary Commands

```bash
# Complete fix workflow
npm run format        # Format all files
npm run lint:fix      # Fix linting issues
npm run lint          # Verify all issues fixed
npm run format:check  # Verify formatting

# Before committing
npm run format && npm run lint:fix && npm test
```
