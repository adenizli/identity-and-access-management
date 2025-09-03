# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Manager
This project uses **yarn** as the package manager:
```bash
yarn install          # Install dependencies
```

### Building and Running
```bash
yarn run build        # Build the project using nest build
yarn run start        # Start the application
yarn run start:dev    # Start in watch mode for development
yarn run start:debug  # Start with debugging enabled
yarn run start:prod   # Start production build
```

### Code Quality
```bash
yarn run lint         # Run ESLint with auto-fix
yarn run format       # Format code with Prettier
```

### Testing
```bash
yarn run test         # Run unit tests
yarn run test:watch   # Run tests in watch mode
yarn run test:cov     # Run tests with coverage
yarn run test:debug   # Run tests with debugging
yarn run test:e2e     # Run end-to-end tests
```

## Architecture

This is a **NestJS-based Identity and Access Management (IAM) system** following a layered architecture pattern with three primary layers:

### Core Structure
- **Entry Point**: `src/main.ts` - Bootstraps the application, configures Swagger, CORS, and validation
- **Core Module**: `src/core.module.ts` - Imports ServicesModule and ApplicationModule
- **Path Aliases**: TypeScript paths are configured for `@common/*`, `@modules/*`, `@services/*`

### Layer Architecture
1. **Controller Layer** (`src/modules/*/controllers`)
   - Handles HTTP requests/responses and data validation
   - Converts DTOs to internal business models
   - No business logic - delegates to services

2. **Service Layer** (`src/modules/*/services`) 
   - Contains all business logic (duplication checks, JWT, caching, sessions)
   - Manages logical error handling with standardized exceptions
   - Calls repository methods after applying business rules

3. **Repository Layer** (`src/modules/*/repository`)
   - Pure CRUD operations with database
   - No business logic or error handling
   - Single source of truth for data persistence

### Main Modules
- **IAM Module** (`src/modules/iam/`):
  - **Authentication** - Sign-in, sessions, JWT handling
  - **Authorization** - Roles, permissions, guards
  - **Identity** - User management and registration
- **Communication Module** (`src/modules/communication/`) - Email services

### Infrastructure Services
- **Configuration** - Environment and config management
- **MongoDB** - Database with soft delete and ID transform plugins
- **Redis** - Caching and session storage
- **Crypto** - Password hashing and encryption utilities

### Key Features
- **JWT-based authentication** with refresh tokens
- **Role-based authorization** with permission system
- **Session management** with Redis storage
- **Swagger API documentation** available at `/swagger`
- **Global validation pipe** and exception filtering
- **Cookie-based session handling**

## Error Handling
- Uses standardized uppercase error codes (e.g., `EMAIL_ALREADY_EXIST`)
- Global `HttpExceptionFilter` converts exceptions to unified HTTP responses
- Service layer handles logical errors, repositories handle data errors only

## Database
- **MongoDB** with Mongoose ODM
- Soft delete functionality via custom plugin
- Automatic ID transformation for frontend compatibility
- Unix timestamp conversion utilities

## Development Notes
- CLI tools available in `src/cli/` for application initialization
- Email templates stored in `src/modules/iam/identity/templates/`
- Common utilities in `src/common/utility/`
- Test files should follow `*.spec.ts` naming convention
- TypeScript strict mode is disabled for flexibility