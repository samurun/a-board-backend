# Project Setup and Testing Guide

This project is a Full-stack Web Board Application, with separate Frontend (Next.js) and Backend (NestJS) components.

#### Features

**User Management**
- [x] Username-based authentication
- [x] Simplified login (no email verification)
- [x] Basic user management

**Content Management**
- [x] Browse and view all community posts
- [x] Create new discussion topics
- [x] Full CRUD operations for posts

**Comment System**
- [x] Linear comment structure (no nesting)
- [x] User-specific permissions
- [x] Edit/Delete capabilities for own content

## Prerequisites

- Node.js (v18.17.1+)
- Docker & Docker Compose (latest stable)
- PostgreSQL v14+ (for non-Docker setup)
- Package Manager (npm/yarn)

## Quick Start

1. Initial Setup
```bash
# Clone and navigate
git clone <repository-url>
cd <project-directory>

# Dependencies
npm install

# Environment Configuration
cp .env.example .env.local
```

2. Environment Configuration
```bash
# Server Configuration
PORT=3000

# Database Settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database_name
POSTGRES_SYNCHRONIZE=true

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=3600s
```

3. Run the application

Using Docker (Recommended)

```bash
docker compose up -d
```

#### Manual PostgreSQL Setup

If you're not using Docker, ensure PostgreSQL is installed and running locally with the credentials matching your .env.local configuration.

4. Starting the Application
   Development mode

```bash
npm run start:dev
```

Production mode

```bash
npm run start:prod
```

The application will be available at http://localhost:3000 (or your configured PORT).

## Testing

Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:cov
```

### Test Coverage

This coverage report will be generated in the `coverage` directory after running:

```bash
npm run test:cov
```

### Available Test Suites

This project includes tests for:

- Auth Module (auth.\*)
- Users Module (users.\*)
- Posts Module (posts.\*)
- Comments Module (comments.\*)

# API Documentation

Once the application is running, you can access this Swagger API documentation at:

```bash
http://localhost:3000/docs
```

# Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # Users module
├── posts/          # Posts module
├── comments/       # Comments module
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```
