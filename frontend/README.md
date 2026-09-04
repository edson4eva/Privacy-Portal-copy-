# Nx Monorepo for React Apps

The `frontend` folder in this repository is an [Nx](https://nx.dev) monorepo that contains three React applications:

- `admin`
- `account-history`
- `complaints`

All apps share reusable code through a common `shared` library. Each application also includes a corresponding end-to-end (e2e) project for automated testing.

---

## What is Nx? <a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

[Nx](https://nx.dev) is a smart, extensible build system with built-in support for monorepos. It enables teams to manage multiple applications and libraries in a single codebase with fast builds, powerful code sharing, and developer-friendly tooling.

---

## Project Structure

    apps/
    ├── admin/ # Admin React app
    ├── account-history/ # Account History React app
    ├── complaints/ # Complaints React app
    ├── admin-e2e/ # Cypress e2e tests for Admin
    ├── account-history-e2e/ # Cypress e2e tests for Account History
    └── complaints-e2e/ # Cypress e2e tests for Complaints

    shared/ # Shared React components, utilities, and hooks

---

## Running the Front-End App Locally

### ✅ Prerequisites

To run this project locally, make sure you have the following tools installed:

- [**Node.js LTS**](https://nodejs.org/)  
  Recommended version: `v20.19.2` (used by the team)

- [**Nx CLI**](https://nx.dev/getting-started/installation)  
  Install globally using:
    ```bash
    npm add --global nx
    ```
- [**Visual Studio Code**](https://code.visualstudio.com/)

Follow these steps to run the Front-End app in your local development environment:

1. Set up environment variables

    - In each app root, create a `.env` file based on the corresponding `.env.sample`.
    - This file is excluded from version control, so feel free to modify values for your local setup.

2. Navigate to the `frontend` folder in your terminal.

3. Install dependencies

    ```bash
    npm install
    ```

4. Start the desired app

    ```bash
    nx serve complaints         # Runs the Complaints app
    nx serve account-history    # Runs the Account History app
    nx serve admin              # Runs the Admin app
    ```

5. Ensure the corresponding backend app is running with the `http` launch profile

    - Complaints app → Complaints.Api
    - Account History app → AccessedServices.Api
    - Admin app → AccessedServices.Api

---

## Running the Front-End App Over HTTPS

To run the front-end app over **HTTPS** locally, follow the steps below.

### 1. Install locally trusted development certificates

1.  Navigate to the `frontend` folder.

2.  Run the following command to generate SSL certificates:

    ```bash
    npx -y mkcert-cli --outDir ./certs --cert localhost.pem --key localhost-key.pem --hosts localhost --hosts 127.0.0.1
    ```

3.  If a security prompt appears, click **"Yes"** to trust the certificate.

4.  The following files will be created in the `frontend/certs` directory:

    - `localhost.pem` — SSL certificate
    - `localhost-key.pem` — Private key

    > **Note:** These files are used in the `webpack.config.js` `devServer` settings.

### 2. Configure Front-End Environment

In the front-end `.env` file:

- Set:

    ```env
    NX_PUBLIC_LOCAL_SSL=true
    ```

- Update the API URL to use HTTPS:

    ```env
    NX_PUBLIC_API_URL=https://localhost:5010/api/    # For Complaints app
    NX_PUBLIC_API_URL=https://localhost:5011/api/    # For Accessed Services app
    ```

### 3. Configure the Backend App

- Use the **https** launch profile to start the backend.

- In `appsettings.Development.json`, set the following:

    ```json
    "PrivacyPortalOrigin": "https://localhost:3000",
    "UiamSettings": {
      "AppOriginalUrl": "https://localhost:5010",   // or 5011 for Accessed Services
      "SpaUrl": "https://localhost:3000"
    }
    ```

---

## Running Tests

To run end-to-end tests for an app:

```bash
nx e2e <app-name>-e2e --browser=chrome
```

### Examples

```bash
nx e2e admin-e2e --browser=chrome
nx e2e account-history-e2e --browser=chrome
nx e2e complaints-e2e --browser=chrome
```

### Open Cypress app for running test

To open Cypress app for running tests, navigate to the test project’s root folder and run:

```bash
npx cypress open
```

### Unit Testing

To run unit tests for an app or library:

```bash
nx test <project-name>
```

## ⚙️ Common Nx Commands (Quick Reference)

| Command                | Purpose                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `nx serve <app>`       | Serves a React app locally in development mode.                                                                             |
| `nx build <app>`       | Builds the app for production. Outputs go to `dist/apps/<app>`.                                                             |
| `nx lint <project>`    | Lints the specified app or library using the configured linter.                                                             |
| `nx test <project>`    | Runs unit tests for the given app or library (using Jest or other).                                                         |
| `nx e2e <e2e-project>` | Runs end-to-end tests using Cypress for the corresponding app.                                                              |
| `nx graph`             | Opens a visual dependency graph of all projects in the workspace.                                                           |
| `nx reset`             | Clears Nx’s local computation cache and resets internal state. Useful if you're seeing unexpected behavior or stale builds. |

> Tip: Use `nx run-many --target=<target>` to run a command (like `build` or `test`) across multiple projects at once.

## 🛑 Port 3000 Already in Use? (Windows)

If you're unable to run your app on `http://localhost:3000`, another process may already be using that port.

### 🔍 Step 1: Find the Process

Open **Command Prompt** or **PowerShell** and run:

```cmd
netstat -ano | findstr :3000
```

### 🔪 Step 2: Kill the Process

Use the PID from the previous step:

```cmd
taskkill /PID <PID> /F
```

Replace `PID` with the actual number.

---

## 📦 Nx Migrate

Nx provides a powerful migration tool to safely upgrade Nx workspace to the latest versions of Nx and related dependencies.

### 🔄 Update Dependencies and Generate Migrations

To update Nx workspace, run:

```bash
npx nx migrate latest
```

### 📚 Documentation

For detailed instructions about how to run migration and best practices, refer to the official Nx Migrations Guide:
👉 https://nx.dev/features/automate-updating-dependencies

---

## 🎨 Government of Alberta UI components

These apps use a customized version of **Government of Alberta** UI components.  
The customization is achieved by overriding the default styles using [design tokens](https://design.alberta.ca/design-tokens).
You can explore the available components and usage guidelines at:  
👉 [https://design.alberta.ca/components](https://design.alberta.ca/components)

> Make sure to follow the design and accessibility guidelines outlined in the Government of Alberta UI components documentation when building new features.

---

## 🛡️ Pre-commit Hook

We use **[Husky](https://typicode.github.io/husky)** and **[lint-staged](https://github.com/lint-staged/lint-staged)** to auto-format and lint staged files before commits.

- Hook runs from: `.husky/pre-commit`
- Linting targets: `frontend` folder
- Configured in `package.json`:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{md,json,yml,yaml,html}": ["prettier --write"]
}
```

✅ Ensures clean, consistent code before every commit.

---

## 🧩 VS Code Configuration

VS Code is preconfigured with recommended extensions and settings:

- 📦 Extensions: Prettier, ESLint (`.vscode/extensions.json`)
- ⚙️ Settings: Format on save, ESLint auto-fix, Prettier config from `frontend/` (`.vscode/settings.json`)

> Ensures consistent code formatting and linting during development.

---
