# Backend Service - Microservice Architecture

## 📌 Important: API-Specific Documentation

Documentation for **Accessed Services API** and **Complaints API** is located in their respective `src/` folders:

-   📁 `Services/AccessedServices/src/` – Accessed Services API
-   📁 `Services/Complaints/src/` – Complaints API

> 🔧 Refer to these folders for the information needed to get the APIs up and running.  
> 📄 For setting up the local Cosmos DB emulator, see:  
> [Develop locally using the Azure Cosmos DB emulator - (Confluence)](https://goa-dio.atlassian.net/wiki/spaces/PP/pages/3361341576/Querying+Azure+Cosmos+DB+Options+Local+Development#Local-Development)

---

This backend is designed using .NET 9 and follows a microservice architecture. It includes various libraries and frameworks to handle different responsibilities such as distributed messaging, ORM for database interactions, validation, API documentation, and more.

## Technologies Used

-   **.NET 9**: The latest version of .NET, including ASP.NET Core for web framework development.
-   **EF Core**: Modern ORM for database interactions.
-   **MassTransit**: A distributed messaging framework for building scalable and reliable applications.
-   **MediatR**: A library that simplifies the mediator pattern, enabling separation of concerns within the application.
-   **FluentValidation**: Provides strongly-typed validation rules for models and requests.
-   **Swagger UI**: Provides an interactive UI for API documentation.
-   **Serilog**: A structured logging framework for capturing logs.
-   **NewId**: Generates unique identifiers used throughout the system.
-   **Mapster**: Object mapping library that helps with converting between different object types.

## Folder Structure

The backend is organized into several key folders, each responsible for different functionality.

### 1. **AccessedServices**

Contains APIs and services related to user access and authorization.

-   **AccessedServices.API**: The API layer that exposes endpoints for user access-related actions.
-   **Features**: Business logic for handling access permissions and related operations.
-   **CosmosDB Configuration**: Configuration to connect to CosmosDB.
-   **Static Data Classes**: Contains data used by the service.
-   **DTOs and Models**: Data Transfer Objects and models used for communication between services.

### 2. **Complaints**

This folder handles all complaints management functionality.

-   **Complaints.API**: The API layer that exposes endpoints for handling complaints.
-   **Features**: Business logic and services related to complaints management.
-   **CosmosDB Configuration**: Configuration to connect to CosmosDB for complaints data.
-   **Static Data Classes**: Contains static data related to complaints.
-   **DTOs and Models**: Data Transfer Objects and models used in the complaints service.

### 3. **EServicesData**

Contains services related to external service integrations and data storage.

-   **EServicesData.API**: The API layer that exposes endpoints for handling external services and integrations.
-   **Features**: Business logic for interacting with external services and managing data.
-   **CosmosDB Configuration**: Configuration to connect to CosmosDB for external services data.
-   **Static Data Classes**: Static data related to external services.
-   **DTOs and Models**: Data Transfer Objects and models used for interaction with external services.

### 4. **MockData**

Used for simulating or seeding data into services for testing and development.

-   **MockData**: Contains mock data generators and pre-configured test data.

### 5. **UIAM Data**

Contains UI and authentication management data.

-   **UIAM Data**: Used to populate UIAM services (User Identity and Access Management).

### Additional Folders

-   **Shared**: Contains shared utility functions, middleware, and common services used across different services.
-   **Configurations**: Houses configuration classes, app settings, and environment variables.
-   **Logging**: Includes Serilog configuration and structured logging setup.
-   **Validation**: Houses FluentValidation configurations for request validation.

---

## Setting Up

### Prerequisites

1. **Install .NET 9 SDK**: Ensure that you have the .NET 9 SDK installed on your machine.
   [Download .NET 9 SDK](https://dotnet.microsoft.com/download/dotnet)

2. **Install Dependencies**: The backend uses several NuGet packages. You can restore them using the following command:

    dotnet restore

Running the Application
To run the backend, follow these steps:

Open the project in your terminal.
Run the application with the command:

dotnet run

The application will start up, and you can access the APIs at http://localhost:5000 by default.
API Documentation
Swagger UI is enabled for API documentation. You can view and interact with the API endpoints by navigating to:

http://localhost:5000/swagger
Swagger provides an interactive interface where you can test API requests and see detailed responses for all available endpoints.

Microservices Architecture
The system follows a microservice architecture with each folder representing a specific service:

AccessedServices handles user access and authentication.
Complaints manages complaints and complaint-related business logic.
EServicesData interacts with external services and stores their data.
MockData and UIAM Data provide test data and authentication management.
Each service communicates with others via HTTP APIs or message queues powered by MassTransit, and the communication is typically asynchronous to maintain decoupled services.

Logging
The application is configured with Serilog to provide structured logging. Logs can be configured to output to different sinks (console, files, databases, etc.).

You can adjust the logging settings in the appsettings.json file under the Serilog configuration section.

Validation
FluentValidation is used to handle validation of incoming requests. Each service has its own validation logic defined using strongly-typed classes for requests and models.

To add or modify validation rules, you can adjust the corresponding classes in each service's Features folder.

ID Generation
NewId is used for generating unique identifiers throughout the system. This ensures that each entity or operation within the microservices has a globally unique identifier.

Database Configuration
The application is connected to CosmosDB for data storage. Each service has its own configuration class for setting up database connections and performing operations.

Testing
Unit Testing: Unit tests are located within each service folder, and you can run them using the following command:
dotnet test

Integration Testing: Integration tests simulate communication between microservices and can be run using:
dotnet test --filter "Category=Integration"
