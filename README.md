# Identity and Access Management System

A comprehensive Identity and Access Management (IAM) system built with **NestJS**, implementing modern security practices and clean architecture principles. This project demonstrates understanding of backend development, security concepts, and enterprise software design patterns through practical implementation.

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## 🎯 Project Overview

This IAM system implements core identity and access management functionalities with a focus on **security**, **scalability**, and **maintainability**. Built using modern development patterns and current technologies, it demonstrates practical implementation of user authentication, authorization, and identity management concepts.

### Why NestJS?

We chose **NestJS** over Express for this application because:

- **Object-Oriented Programming**: Closer adherence to OOP principles for better code organization
- **Structured Architecture**: Enforces consistent patterns while allowing flexibility for independent components
- **Professional Structure**: Built-in support for dependency injection, decorators, and modular architecture
- **TypeScript First**: Native TypeScript support with excellent type safety

## ✨ Key Features

### 🔐 Authentication System

- **Hybrid Session Management**: JWT tokens backed by Redis for optimal security and performance
- **Secure Token Handling**: AES-256-GCM encryption for tokens and sensitive data
- **Cookie-Based Security**: HTTP-only cookies with CSRF protection
- **Password Security**: bcrypt hashing with salt for secure password storage
- **Session Lifecycle**: Automatic session expiration and cleanup mechanisms

### 👥 Identity Management

- **User Registration**: Complete user onboarding with email verification
- **Profile Management**: Secure user profile CRUD operations
- **Email Integration**: Automated email notifications with HTML templates
- **Data Validation**: Comprehensive input validation and sanitization
- **Account Security**: Soft delete functionality for data integrity

### 🛡️ Authorization & Access Control

- **Role-Based Access Control (RBAC)**: Flexible permission system inspired by AWS IAM
- **Granular Permissions**: Fine-grained access control at endpoint level
- **Dynamic Roles**: Runtime role creation and management
- **Permission Guards**: Declarative permission requirements with decorators
- **Scope-Based Authorization**: Advanced permission overrides with inclusion/exclusion logic

### 🏗️ System Architecture

- **Clean Architecture**: Layered 3-tier pattern (Controller → Service → Repository)
- **Modular Design**: Independent, well-organized modules with clear boundaries
- **Dependency Injection**: NestJS DI container for loose coupling
- **Configuration Management**: Environment-aware configuration with type safety
- **Error Handling**: Standardized error codes and consistent response format

### 🚀 Infrastructure & Performance

- **MongoDB Integration**: Database operations with custom plugins for enhanced functionality
- **Redis Caching**: High-performance session storage and caching layer
- **Connection Pooling**: Optimized database and cache connections
- **Soft Delete**: Data retention with audit trails
- **API Documentation**: Auto-generated Swagger documentation

## 🛠️ Technology Stack

### Backend Framework

- **NestJS** - Modern Node.js framework for structured server-side applications
- **TypeScript** - Type-safe JavaScript with modern language features

### Database & Storage

- **MongoDB** - NoSQL document database with Mongoose ODM
- **Redis** - In-memory data store for caching and session management

### Security & Authentication

- **JWT** - JSON Web Tokens for secure authentication
- **bcrypt** - Password hashing and encryption
- **AES-256-GCM** - Enterprise-grade encryption for sensitive data

### Development Tools

- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting for consistent style
- **Swagger** - API documentation and testing interface

## 📋 Core Modules

### IAM Module

- **Identity Submodule**: User lifecycle and profile management
- **Authentication Submodule**: Login, session, and token management
- **Authorization Submodule**: Roles, permissions, and access control

### Communication Module

- **Email Service**: Template-based email notifications
- **SMS Integration**: Ready for SMS provider integration (development simulation)

### Infrastructure Services

- **Configuration Service**: Environment management with validation
- **Crypto Service**: Encryption and security operations
- **MongoDB Service**: Database connectivity with custom plugins
- **Redis Service**: Caching and session storage operations

### CLI System

- **Application Initializer**: Interactive CLI for creating the first admin user
- **NestJS Commander Integration**: Professional command-line interface
- **User-Friendly Setup**: Guided application bootstrap process

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Redis server
- Yarn package manager

````

### Environment Configuration (Required)
Create a `.env.dev` file in the root directory with the following required variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/iam-dev
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional

# Security Configuration
JWT_SECRET=your-jwt-secret-minimum-32-characters
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
SESSION_EXPIRATION=24h

# Crypto Configuration
CRYPTO_ALGORITHM=aes-256-gcm
CRYPTO_KEY=your-base64-encoded-32-byte-key

# Application Configuration
NODE_ENV=development
PORT=8080
````

**⚠️ Important**: The application will not start without proper environment configuration.

### Installation & Setup

````bash
# Clone the repository
git clone <repository-url>
cd identity-and-access-management

# Install dependencies
yarn install

# Configure environment (REQUIRED)
# Create .env.dev file with your database and service configurations
# See Environment Configuration section below for required variables

# Initialize application with admin user (REQUIRED for first run)
yarn run cli:init-app
# Alternative: npx nest-commander init-application

# Start development server
yarn run start:dev

### Available Scripts
```bash
# CLI Commands
yarn run cli:init-app                  # Initialize app with admin user (recommended)
npx nest-commander init-application    # Alternative CLI initialization

# Development
yarn run start:dev      # Start with hot reload
yarn run start:debug    # Start with debugging

# Code Quality
yarn run lint           # Run ESLint with auto-fix
yarn run format         # Format code with Prettier

# Building
yarn run build          # Build for production
yarn run start:prod     # Start production build
````

### API Documentation

Once the server is running, visit `http://localhost:8080/swagger` for interactive API documentation.

## 🏛️ Architecture Highlights

### Layered Architecture

- **Controller Layer**: HTTP handling, validation, and request/response management
- **Service Layer**: Business logic, authentication, and authorization rules
- **Repository Layer**: Data persistence and database operations

### Security First Design

- **Encrypted Communications**: All sensitive data encrypted before storage/transport
- **Session Security**: Redis-backed sessions with automatic expiration
- **Input Validation**: Comprehensive DTO validation with sanitization
- **Error Security**: Standardized error responses without information leakage

### Scalability Features

- **Stateless Design**: Horizontal scaling ready
- **Connection Pooling**: Efficient resource utilization
- **Modular Structure**: Independent service scaling
- **Caching Strategy**: Redis optimization for performance

## 📚 Documentation

Comprehensive architecture documentation is maintained within each module:

- **System Overview**: [`_docs/architecture.md`](_docs/architecture.md)
- **Service Documentation**: Individual `_docs/architecture.md` in each service folder
- **Module Documentation**: Detailed architecture docs in each module

## 🎓 Development Approach

This project was developed with a focus on **learning and best practices**:

- **AI-Assisted Reviews**: Used Claude Code as a **review tool and mentor**, not as a replacement for engineering decisions
- **Educational Focus**: AI served as a teacher to identify gaps and improvement opportunities
- **Manual Implementation**: All code written manually. We did not prefer AI to directly have control over our codes. It just provided guidance and feedback
- **Best Practices**: Emphasis on learning enterprise-grade development patterns

This approach ensures genuine understanding of the technologies and patterns while leveraging AI as an educational tool rather than a complete engineering replacement.

## 🔮 Future Development

The system is designed for extensibility. As time permits, planned enhancements include:

- Multi-Factor Authentication (MFA) implementation
- Single Sign-On (SSO) integration
- Advanced audit logging and compliance features
- Rate limiting and DDoS protection
- Comprehensive test suite with high coverage

## 💡 Key Learning Outcomes

This project demonstrates understanding and practical application of:

- **System Architecture**: Clean, scalable system design principles
- **Security Implementation**: Modern authentication and authorization patterns
- **Database Design**: Efficient data modeling with MongoDB and Redis
- **API Development**: RESTful APIs with comprehensive documentation
- **TypeScript Development**: Type safety and modern JavaScript features
- **Configuration Management**: Environment setup and deployment preparation

## 🤝 Contributing

This is a personal learning project showcasing backend development skills. The codebase follows modern development standards and is well-documented for easy understanding and maintenance.

## ⚠️ Academic Disclaimer

This project was developed as a **learning exercise** by a student exploring modern software development patterns and backend technologies. While the system implements current security practices and architectural patterns, it represents an **educational endeavor** demonstrating practical application of learned concepts.

**Please note:**
- This codebase may contain areas for improvement as it reflects my current learning journey
- Implementation decisions were made based on educational goals and available learning resources
- The project demonstrates understanding of concepts rather than years of professional experience
- Feedback and suggestions for improvement are welcomed as part of the continuous learning process

This project serves as a **portfolio demonstration** of technical skills acquired through self-directed learning, coursework, and practical implementation experience.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with passion for learning and excellence in software engineering** 🚀

_This project showcases modern backend development skills, security best practices, and professional architecture patterns learned through hands-on implementation._
