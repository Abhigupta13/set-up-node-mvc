
# Set-Up-Node-MVC

## ⚠️ **Disclaimer** ⚠️

### You must run it with npx to execute it directly from the npm registry, without the need for global installation.
```bash
npx set-up-node-mvc
````

### **Set-up-node-mvc** is a powerful CLI tool to quickly scaffold MVC architectures for Node.js applications, supporting various databases and configurations. It helps you set up a well-structured Node.js project with minimal effort, allowing you to focus on building your application rather than configuring the basics.

## Features:
- **Interactive Setup**: Choose the programming language (JavaScript or TypeScript) and easily configure your project.
- **MVC Architecture**: Automatically generates directories for controllers, services, repositories, routes, middleware, etc.
- **Express Setup**: Configures an Express server with basic routing to get you started immediately.
- **TypeScript Support**: Supports TypeScript, including TypeScript configuration and live-reload using `ts-node-dev`.
- **Database Support**: You can extend it with database configurations based on your needs.

## Installation

# Using npx

You can run `set-up-node-mvc` without installing it globally by using `npx`, which allows you to execute the package directly from the npm registry.

Simply run:

```bash
npx set-up-node-mvc
```

This will guide you through the setup process, asking you for your preferred programming language and project configurations, and then generating the project structure.

### Installing Locally (Optional)

If you prefer to install the package locally in your project:

1. Install the package:

   ```bash
   npm install --save-dev set-up-node-mvc
   ```

2. Run the setup:

   ```bash
   npx set-up-node-mvc
   ```

## Usage

Once the setup is complete, the project structure is generated. You can use the following commands to start your server:

### JavaScript:
If you chose JavaScript, you can start the server by running:

```bash
npm run dev
```

This will start the Express server, and your API will be accessible at `http://localhost:3000`.

### TypeScript:
For TypeScript, run:

```bash
npm run dev
```

The server will start with TypeScript compilation using `ts-node-dev` for live-reloading.

## Project Structure

The generated project structure includes:

- **controllers/** - For route handlers.
- **services/** - For business logic.
- **repositories/** - For data access (e.g., database queries).
- **routes/** - For defining the API routes.
- **middleware/** - For middleware functions like authentication.
- **config/** - For configuration files.
- **utils/** - For utility functions.

Additional files:

- **index.js / index.ts** - The entry point for your app.
- **.env** - For environment variables.
- **.gitignore** - To ignore unnecessary files in version control.
