---
name: Run Tests
description: Run tests across the backend and frontend of the To-Do List WebApp
---

# Run Tests Skill

This skill provides guidance for running tests across the entire To-Do List WebApp project.

## Overview

The project uses:
- **Backend**: Jest for unit and integration tests
- **Frontend**: Vitest for component and unit tests

## Running All Tests

### Run Full Test Suite

Run all tests for both backend and frontend:

```bash
npm test
```

This will:
1. Run backend tests
2. Run frontend tests
3. Display combined results

### Run Tests in Watch Mode

For development, run tests in watch mode to auto-rerun on file changes:

```bash
# Backend tests in watch mode
cd backend && npm run test:watch

# Frontend tests in watch mode
cd frontend && npm run test:watch
```

## Backend Tests

### Run All Backend Tests

```bash
npm run test:backend
```

Or from the backend directory:

```bash
cd backend
npm test
```

### Run Specific Test File

```bash
cd backend
npm test -- path/to/test-file.test.js
```

### Run Tests with Coverage

```bash
cd backend
npm run test:coverage
```

Coverage report will be generated in `backend/coverage/`.

### Backend Test Structure

Backend tests are located in:
- `backend/tests/` - Main test directory
- Test files follow the pattern: `*.test.js` or `*.spec.js`

## Frontend Tests

### Run All Frontend Tests

```bash
npm run test:frontend
```

Or from the frontend directory:

```bash
cd frontend
npm test
```

### Run Frontend Tests in UI Mode

Vitest provides a UI for better test visualization:

```bash
cd frontend
npm run test:ui
```

### Run Tests with Coverage

```bash
cd frontend
npm run test:coverage
```

Coverage report will be generated in `frontend/coverage/`.

### Frontend Test Structure

Frontend tests are located in:
- `frontend/src/test/` - Main test directory
- Component tests alongside components: `Component.test.jsx`
- Test files follow the pattern: `*.test.jsx` or `*.spec.jsx`

## Linting and Code Quality

### Run All Linters

```bash
npm run lint
```

This runs ESLint on both backend and frontend.

### Run Backend Linter

```bash
npm run lint:backend
```

### Run Frontend Linter

```bash
npm run lint:frontend
```

### Auto-Fix Linting Issues

```bash
npm run lint:fix
```

This will automatically fix any auto-fixable linting issues.

## Code Formatting

### Check Code Formatting

```bash
npm run format:check
```

### Auto-Format Code

```bash
npm run format
```

This runs Prettier on all JavaScript, JSX, JSON, Markdown, CSS, and YAML files.

## Continuous Integration

### Pre-Commit Checks

Before committing, run:

```bash
# 1. Format code
npm run format

# 2. Fix linting issues
npm run lint:fix

# 3. Run tests
npm test
```

### Full Verification

Run a complete verification (useful before creating a PR):

```bash
# Format code
npm run format

# Lint all code
npm run lint

# Run all tests
npm test

# Build production bundles (optional)
npm run build
```

## Writing Tests

### Backend Test Example

```javascript
// backend/tests/example.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Example API Tests', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
});
```

### Frontend Test Example

```javascript
// frontend/src/components/Example.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Example from './Example';

describe('Example Component', () => {
  it('renders correctly', () => {
    render(<Example />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Common Issues

### Tests Failing Due to Environment Variables

Ensure you have test environment files:
- `backend/.env.test` - Test environment for backend
- `frontend/.env.test` - Test environment for frontend

### Database Connection Issues in Tests

Backend tests should use a separate test database. Check `backend/.env.test`:

```env
MONGODB_URI=mongodb://localhost:27017/todolist-test
```

### Port Conflicts

If tests fail due to port conflicts, ensure no development servers are running.

## Test Coverage Goals

Aim for:
- **Backend**: Minimum 80% coverage for controllers and services
- **Frontend**: Minimum 70% coverage for components and utilities

Check coverage with:

```bash
# Backend coverage
cd backend && npm run test:coverage

# Frontend coverage
cd frontend && npm run test:coverage
```

## Debugging Tests

### Debug Backend Tests

```bash
cd backend
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open Chrome DevTools at `chrome://inspect`.

### Debug Frontend Tests

```bash
cd frontend
npm run test:debug
```

## Next Steps

After running tests:
- Review coverage reports in `backend/coverage/` and `frontend/coverage/`
- Fix any failing tests
- Add tests for new features
- Update tests when modifying existing features
