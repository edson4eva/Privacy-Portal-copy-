# Complaints API

## Launch Profiles

This project provides multiple launch profiles for local development in Visual Studio. Each profile is intended for different development scenarios.

### 1. **HTTP Profile**

-   **URL**: `http://localhost:6010/swagger`
-   **Usage**: Default for local development. Runs the app via HTTP.

### 2. **HTTPS Profile**

-   **URL**: `https://localhost:5010/swagger`
-   **Usage**: Use this profile for HTTPS-based local development.

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
  "AzureBlobStorage": {
    "StorageAccountKey": "<Use Azure storage account key>"
  },
  "AbNotify": {
    "ALBERTA_NOTIFY_API_KEY": "<Use dev AB Notify API Key>",
    "PrivacyServiceAdvisorEmailTemplateGuid": "<Use dev privacy service advisor email template Guid>",
    "PrivacyServiceAdvisorEmailAddress": "<Use dev privacy service advisor email address>",
    "ConfirmationEmailToAlbertanTemplateGuid": "Use dev confirmation email to albertan template Guid"
  },
  "UiamSettings": {
    "DataApiAzureClientId": "Use the DataApiAzureClientId from UIAM"
  }
}

```

> **Note:** Each deployment environment has its own settings file (e.g., `appsettings.uat.json`, `appsettings.prod.json`) that overrides `appsettings.json`. **Secrets/keys should never be stored** in these files and should instead be provided via container environment variables in the deployment environment.

---