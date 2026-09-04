# Accessed Services API

## Launch Profiles

This project provides multiple launch profiles for local development in Visual Studio. Each profile is intended for different development scenarios.

### 1. **HTTP Profile**

-   **URL**: `http://localhost:6011/swagger`
-   **Usage**: Default for local development. Runs the app via HTTP.

### 2. **HTTPS Profile**

-   **URL**: `https://localhost:5011/swagger`
-   **Usage**: Use this profile for HTTPS-based local development.

### 3. **Dapr Profile**

-   **URL**: `http://localhost:6011/swagger`
-   **Usage**: Use when interacting with the cache infrastructure via Dapr. Docker must be running.
-   **Note**: You must manually attach the debugger when using this profile.

### 4. **Container (Dockerfile) Profile**

-   **Usage**: This profile allows developers to run the .NET application in a Docker container, simulating a production-like environment. It’s ideal for scenarios where the app will be deployed using a Dockerfile.
-   **Note**: Ensure the Cosmos connection string points to a cloud instance, as the local Cosmos emulator is not accessible from within the container.

---

## Running the Application

1. Open the project in Visual Studio.
2. Select your preferred launch profile from the toolbar.
3. Press `F5` to run the app.

Once running, navigate to the Swagger UI at the appropriate URL.

---

## Local Development Configuration

When running the application locally, you may need to override certain settings. To do this, create a `appsettings.Development.json` file and specify the overrides there. This file is excluded from source control and is meant for local development only.

### Required Overrides for Local Development:

Add the following settings to your `appsettings.Development.json`:

```json
{
    "AuditLogOptions": {
        "ConnectionString": "<Use local Cosmos DB emulator connection string>"
    },
    "CosmosOptions": {
        "ConnectionString": "<Use local Cosmos DB emulator connection string>"
    },
    "UiamSettings": {
        "DataApiAzureClientId": "<Use the DataApiAzureClientId from UIAM>"
    }
}
```

> **Note:** Each deployment environment has its own settings file (e.g., `appsettings.uat.json`, `appsettings.prod.json`) that overrides `appsettings.json`. **Secrets/keys should never be stored** in these files and should instead be provided via container environment variables in the deployment environment.

---

## Using Mock Data for Local Development

When developing locally, you can use mock data instead of real Unified IAM/EServices API calls by enabling the `UseMock` setting. This allows you to continue development without relying on external services, particularly when the current user may not have any accessed services. By using mock data, you are ensured a consistent set of services, allowing you to test how they appear on the screen.

### Configuration

To enable mock data, configure the application as follows:

```json
"AccessedServicesOptions": {
  "UseMock": true,
  "MockDataSource": "CODE"
}
```

### Mock Data Sources

-   **CODE**: Uses hard-coded mock data embedded in the application.
-   **DB**: Fetches mock data from a database.

### Example Configurations

-   **Hard-Coded Mock Data**:

    ```json
    "AccessedServicesOptions": {
      "UseMock": true,
      "MockDataSource": "CODE"
    }
    ```

-   **Database Mock Data**:

    ```json
    "AccessedServicesOptions": {
      "UseMock": true,
      "MockDataSource": "DB"
    }
    ```

### How It Works

-   **`UseMock = true`**: Bypasses real API calls and uses mock data.
-   **`MockDataSource`**: Defines the source of the mock data (`CODE` or `DB`).

### Conclusion

-   Use mock data during local development to simulate API responses without needing access to external services.

---

## Dapr Integration

This project uses [Dapr](https://dapr.io/) to abstract caching infrastructure. Instead of directly using Azure Redis, we leverage Dapr’s interface, allowing for a local state store running in Docker during development, thus avoiding cloud dependencies.

### Getting Started

1. **Download and install Docker**

    - https://www.docker.com/products/docker-desktop/

2. **Install Dapr CLI (Windows)**:

    - Use the MSI installer: [Install Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/#install-using-msi-installer)

3. **Initialize Dapr**:

    - Run the following command **as Administrator**:
        ```bash
        dapr init
        ```

4. **Run the API with Dapr**:
    - Use the `dapr` launch profile in Visual Studio to start the API, enabling interaction with the local state store.
    - Make sure that Docker is running

### Key Benefits

-   **Local Development**: Use a local state store without connecting to cloud services.
-   **Abstraction**: Easily switch between different state stores.
-   **Simplified Caching**: Dapr handles caching infrastructure, allowing focus on business logic.

For further details, see the [Dapr Concepts Overview](https://docs.dapr.io/concepts/overview/).

---
