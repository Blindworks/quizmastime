# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuizmasTime is a Christmas-themed advent calendar quiz application for children aged 6-12. Each day from December 1st to 24th, children can answer one quiz question. If all questions are answered correctly, they receive a gift on December 24th.

## Technology Stack

**Frontend (quizmastime-frontend/)**
- Angular 20 in standalone mode
- Angular Material 20
- SCSS for styling
- TypeScript 5.9
- Components structured with .ts, .html, and .scss files
- Hosted on Netlify

**Backend (quizmastime-backend/)**
- Spring Boot 3.4.1
- Java 21
- MySQL database (local development)
- Maven build system
- Configuration via .properties files
- Hosted on Railway

**Communication:** REST API between frontend and backend

## Development Commands

### Frontend Commands
```bash
cd quizmastime-frontend

# Start development server (runs on http://localhost:4200)
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch mode for development
npm run watch
```

### Backend Commands
```bash
cd quizmastime-backend

# Run application
./mvnw spring-boot:run

# Build project
./mvnw clean install

# Run tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=ClassName

# Run specific test method
./mvnw test -Dtest=ClassName#methodName

# Package without tests
./mvnw clean package -DskipTests
```

## Architecture Overview

### Frontend Architecture
- **Standalone Components:** All components use Angular's standalone mode (no NgModules)
- **Component Structure:** Each component consists of three files:
  - `component-name.ts` - Component logic
  - `component-name.html` - Template
  - `component-name.scss` - Styles
- **Routing:** App-level routing configured in `app.routes.ts`
- **Material Design:** UI components from Angular Material library
- **State Management:** To be determined based on application complexity

### Backend Architecture
- **Package Structure:**
  - `com.quizmastime.backend.controller` - REST endpoints
  - `com.quizmastime.backend.service` - Business logic
  - `com.quizmastime.backend.repository` - Data access (Spring Data JPA)
  - `com.quizmastime.backend.model` - Entity classes
  - `com.quizmastime.backend.dto` - Data Transfer Objects
  - `com.quizmastime.backend.config` - Configuration classes
- **Data Access:** Spring Data JPA with MySQL
- **API Design:** RESTful endpoints following standard conventions
- **Validation:** Bean Validation (Jakarta Validation API)
- **Lombok:** Used for reducing boilerplate code (@Data, @Builder, @Slf4j, etc.)

### Database Configuration
Database connection is configured in `quizmastime-backend/src/main/resources/application.properties`:
- Default development database: `localhost:3306/quizmastime`
- Production credentials should be configured via environment variables on Railway

### Key Application Concepts
1. **Daily Question Access:** Users can only access questions for the current date (advent calendar logic)
2. **Answer Validation:** Questions must be answered correctly to count toward the final gift
3. **Progress Tracking:** System tracks which questions have been answered and whether answers were correct
4. **Gift Unlock:** December 24th gift is only available if all previous questions were answered correctly

## Development Standards

- Follow Clean Code principles
- Use standard design patterns (Repository, Service, DTO, etc.)
- Maintain separation of concerns between layers
- Component naming: use kebab-case for file names, PascalCase for class names
- REST endpoints: use plural nouns, proper HTTP verbs (GET, POST, PUT, DELETE)
- Error handling: Implement proper exception handling with appropriate HTTP status codes

## CORS Configuration

CORS is configured in `application.properties` with `cors.allowed.origins`. Default development setting allows `http://localhost:4200`. Update for production deployment.

## Deployment

### Frontend (Netlify)
- Deployed automatically from GitHub
- Build command: `npm run build`
- Publish directory: `dist/quizmastime-frontend`
- Environment variables: Set `API_URL` to point to Railway backend URL

### Backend (Railway)
- Deployed automatically from GitHub
- **Root Directory:** Set to `quizmastime-backend` in Railway settings
- **Build:** Automatic via Maven (`./mvnw clean package -DskipTests`)
- **Runtime:** Java 21 (configured in `nixpacks.toml`)
- **Database:** MySQL provisioned in Railway

**Required Environment Variables on Railway:**
- `CORS_ALLOWED_ORIGINS` - Your Netlify frontend URL (e.g., `https://your-app.netlify.app`)
- `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD` - Auto-provided by Railway MySQL service
- Optional: `JPA_SHOW_SQL=false`, `JPA_DDL_AUTO=update`, `QUIZ_LOCKOUT_DURATION=30`

**Important:** See `quizmastime-backend/RAILWAY_DEPLOYMENT.md` for detailed deployment instructions.
