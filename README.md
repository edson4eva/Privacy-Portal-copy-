# GovAlta-EMU / DDD-TI-Privacy-Portal

![Privacy Portal Banner](image-20241219-214909.png)

🚀 **Privacy Portal** backend and frontend are built using modern architecture and technologies to support a distributed system, ensuring scalability, maintainability, and performance.

---

## 🚀 Overview

### Backend
The backend follows a microservices architecture using advanced techniques such as:
- **Vertical Slice Architecture**
- **Event Sourcing**
- **CQRS (Command Query Responsibility Segregation)**
- **Domain-Driven Design (DDD)**

### Frontend
The frontend is structured as a distributed single-page application (SPA) built with React and the Nx framework.

---

## Frameworks and Features

### Backend
- **Vertical Slice Architecture**: Implements architecture at the feature level.
- **Domain-Driven Design (DDD)**: Captures complex business processes within microservices.
- **Azure Service Bus / DaPR**: Implements event-driven architecture for microservice communication.
- **CQRS with MediatR**: Separates read and write responsibilities.
- **Testing**: Includes End-to-End Testing and Integration Testing for all dependencies.
- **Fluent Validation**: Uses a validation pipeline with MediatR.
- **Minimal API**: Utilizes Minimal API endpoints for simplicity.
- **AspNetCore OpenAPI**: Generates built-in OpenAPI documentation.
- **Health Check**: Monitors app infrastructure health.
- **Docker-Compose**: Deploys microservices seamlessly.
- **Distributed Application Runtime (DaPR)**: Manages microservice runtime.

#### Future Enhancements:
- **OpenTelemetry**: Implements distributed tracing and monitoring with Jaeger, Prometheus, and Grafana.

### Frontend
- **React**: SPA framework for building user interfaces.
- **Nx**: Monorepo framework for managing applications.
- **DDD Design System**: Follows the Government of Alberta’s design system framework.
- **State Management**: Uses React Context API.
- **ESLint**: Ensures code quality.
- **Husky**: Implements pre-commit linting hooks.

#### Future Enhancements:
- **Single-SPA**: Enables a micro-frontends architecture.

---

## 🌀 Work in Progress
This project is evolving continuously, and new features will be added over time.

---

## Technologies and Libraries

### Backend
- **.NET 9**: Includes ASP.NET Core for web framework development.
- **EF Core**: Modern ORM for database interaction.
- **MassTransit**: Framework for building distributed applications.
- **MediatR**: Simplifies the mediator pattern in .NET.
- **FluentValidation**: Defines strongly-typed validation rules.
- **Swagger UI**: Documents APIs visually.
- **Serilog**: Enables structured logging.
- **NewId**: Generates unique IDs.
- **Mapster**: Maps objects within .NET.

#### Future Enhancements:
- **Polly**: Adds resilience with Retry, Circuit Breaker, and Timeout policies.
- **Scrutor**: Enables assembly scanning and decoration for dependency injection.
- **OpenTelemetry-DotNet**: Supports observability.

### Frontend
- **Account History App**: Displays recently accessed government services for Alberta citizens.
- **Complaints App**: Allows citizens to submit complaints (guest or authenticated).

---

## Structure of the Project

### Backend
- Located in the `Backend` folder.
- Combines Clean Architecture and Vertical Slice Architecture.
- Microservices use event-driven communication.

### Frontend
- Located in the `Frontend` folder.
- Managed as a monorepo with Nx.

---

## Project Highlights

- **Vertical Slice Architecture**: Treats each request as a distinct use case to group all concerns cohesively.
- **CQRS Pattern**: Decomposes features into small, independent parts for performance, scalability, and maintainability.
- **Mediator Pattern**: Creates thin controllers with single-responsibility handlers.

This approach ensures:
1. Minimal coupling between slices.
2. Improved maintainability and scalability.
3. Optimized performance with reduced shared code.

---

## Contributing
We welcome contributions! Please follow the contributing guidelines and maintain the project standards.

---

### 📧 Contact
For questions or collaboration opportunities, reach out to the team.
