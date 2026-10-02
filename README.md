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

## This copy: the NEXUS sandbox demonstration

This repository is a working copy of the Privacy Portal used to build and host a
demonstration on the Government of Alberta's NEXUS sandbox. The architecture
described above is unchanged. What this copy adds is a way to run the three
front ends with no backend behind them, and a set of pages built on top of
them.

The deployed app answers at
`https://privacy-portal-edson.sandbox.aim.int.gov.ab.ca`, serving all three
front ends from one container under path prefixes: `/complaints`,
`/account-history` and `/admin`. `deploy/sandbox/README.md` describes that
deployment, why it is one app rather than three, and the two nginx settings it
cannot do without.

### Running it

```
./deploy/sandbox/build-and-publish.sh            # build and publish
./deploy/sandbox/build-and-publish.sh --build    # build only, no publish
```

### Demo mode

`NX_PUBLIC_DEMO_MODE=true` puts a signed-in demo user in place of UIAM and
answers ten endpoints from `frontend/shared/src/lib/api/demoData.ts`:
accessed-services, account-activity, identification, inbox,
payment-preferences, personal-information, security-settings,
service-activity, staff-access and wallet. It is off unless the value is
exactly `true`, so dev, syst, uat and prod builds are untouched.

Nothing submitted in a sandbox build is saved anywhere, and every name,
address, identifier, health number and banking detail in the demo data is
invented.

### Pages this copy adds

Reached from the left navigation:

| Page | Route |
| --- | --- |
| Personal information | `/complaints/personal-information` |
| Payment preferences | `/complaints/payment-preferences` |
| My identification | `/complaints/my-identification` |
| Alberta Wallet | `/complaints/alberta-wallet` |
| Privacy features | `/complaints/features` |
| Service activity | `/account-history/accessed-services` |
| Citizen-facing experience | `/account-history/transparency` |
| Privacy complaint | `/complaints/file-complaint` |
| Security settings | `/complaints/security-settings` |
| Account activity | `/complaints/account-activity` |
| Inbox | `/complaints/inbox` |
| Demo sign-in | `/complaints/sign-in` |

The citizen-facing experience is an access log: who in government looked at the
holder's personal information, what they saw and the reason they gave. Its
fields follow "Access to Citizen Personal Information - Audit and Disclosure
Log, Field Reference", and its categories are the topics Alberta.ca groups its
services under, taken from the published services inventory. Staff are
identified by position, never by name.

### Conventions this copy enforces

Four specs fail the build rather than leaving a convention to memory:

| Spec | What it refuses |
| --- | --- |
| `shared/src/style/designSystemConformance.spec.ts` | a literal colour, a raw font weight or size, a hand-set line height, a colour property set to `none`, and overriding the line height a `--goa-typography-*` token carries |
| `shared/src/style/designTokens.spec.ts` | a reference to a `--goa-*` token nothing defines |
| `shared/src/lib/style/palette.spec.ts` | the few hard-coded colours drifting from the tokens they mirror |
| `shared/src/lib/app-header/accountMenu.spec.ts` | the account menu painting a link the colour of its own text |

Colours, spacing, type, borders and radii come from the design system's tokens.
`frontend/shared/src/style/overrides.css` lists every token this copy still
sets for itself, each with the reason beside it.

Two deliberate departures are recorded there: the side menu is one `space-xl`
wider than the design system's 256px, so the inbox entry's second name fits
beside its heading, and the callout's text is not inset.

### Branches

`design-system-2` upgrades the four `@abgov` packages to their 2.x line. It
compiles, tests and serves, but it is parked: `@abgov/design-tokens` 2.12.8
does not carry the values design.alberta.ca currently publishes, so merging it
would move this copy away from the live design system rather than towards it.

---

## Contributing
We welcome contributions! Please follow the contributing guidelines and maintain the project standards.

---

### 📧 Contact
For questions or collaboration opportunities, reach out to the team.
