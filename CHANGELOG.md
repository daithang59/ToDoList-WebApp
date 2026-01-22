# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added convenient npm scripts for better developer workflow:
  - `npm run restart` - Quick restart of docker services
  - `npm run build` - Build both backend and frontend
  - `npm test` - Run all tests (backend + frontend)
  - `npm run test:backend` - Run backend tests only
  - `npm run test:frontend` - Run frontend tests only
  - `npm run lint:fix` - Auto-fix linting issues
  - `npm run logs` - View all docker logs
  - `npm run logs:backend` - View backend logs only
  - `npm run logs:frontend` - View frontend logs only
  - `npm run status` - Check docker containers status
- Added `.editorconfig` file to maintain consistent coding styles across editors
- Added `.nvmrc` file to specify Node.js version (18.0.0)
- Updated QUICK_START.md with all new npm scripts

### Fixed
- Fixed CORS issue on Vercel production by adding frontend domains to allowed origins
- Added missing environment variables to backend (.env) including JWT_SECRET, SESSION_SECRET
- Configured CORS to support credentials for authentication flow

### Added
- Created `.env.production` file for frontend with production API URL
- Added VERCEL_DEPLOYMENT.md guide for environment variable configuration
- Added QUICK_START.md with common commands and troubleshooting tips
- Added CONTRIBUTING.md guide for open-source contributors
- Enhanced backend logging with emoji indicators and better formatting
- Added CORS configuration logging for easier debugging
- Added blocked origin warnings in CORS handler

### Improved
- Enhanced server startup messages with clearer information
- Better environment variable logging with fallback values
- Improved console output formatting for better developer experience

### Changed
- Updated frontend version to 1.0.0 for consistency with root package
- Improved frontend package.json with meaningful description and keywords
- Enhanced backend package.json with better project metadata and keywords
- Standardized license to MIT across all packages (frontend, backend, root)
- Updated backend package name from "server" to "backend" for clarity

### Chore
- Removed unnecessary "main" field from frontend package.json
- Added relevant keywords to frontend and backend packages for better discoverability

## [1.0.0] - 2026-01-04

### Added
- ✨ Core CRUD operations for todos (Create, Read, Update, Delete)
- ⭐ Mark todos as important functionality
- ✔️ Toggle completion status
- 🔍 Search todos by title/description
- 🏷️ Filter todos by status (completed, important, overdue)
- 📅 Due date management with overdue detection
- 📊 Statistics dashboard (total, completed, pending, overdue)
- 🗑️ Bulk operations (clear completed todos)
- 📱 Responsive design for desktop and mobile
- 🚀 API pagination and sorting
- 📝 Swagger API documentation
- 🐳 Docker support for local development
- ☁️ Vercel deployment configuration
- 🤖 AI Chatbot component (under development)
- 📑 Project organization features

### Technical
- React.js 18 frontend with Vite build tool
- Node.js + Express.js backend
- MongoDB database with Mongoose ODM
- Docker Compose for local development
- CORS support for cross-origin requests
- Input validation and error handling
- Environment-based configuration

### Documentation
- Comprehensive README with setup instructions
- API documentation with Swagger
- Component documentation
- Docker setup guide
- Deployment instructions for Vercel

## [0.1.0] - Initial Development

### Added
- Initial project setup
- Basic frontend structure with React
- Basic backend API with Express
- MongoDB integration
- Docker configuration

---

## Types of Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities
- `Performance` for performance improvements
- `Docs` for documentation updates
- `Chore` for maintenance tasks
