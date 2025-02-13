#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the templates
const jsTemplates = require('../templates/jsTemplates');
const tsTemplates = require('../templates/tsTemplates');

async function init() {
  try {
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'projectName', // Fixed: Changed from 'Source Folder' to 'projectName' to match usage
        message: 'What is the name of your root folder?',
        default: 'src',
      },
      {
        type: 'list',
        name: 'language',
        message: 'Which programming language do you want to use?',
        choices: ['JavaScript', 'TypeScript'],
      },
      {
        type: 'list',
        name: 'authentication',
        message: 'Do you want to include authentication?',
        choices: ['No','Yes'],
      },
    ]);

    createProjectStructure(answers);
    initializePackageJson(answers);
    installDependencies(answers);

    if (answers.authentication === 'Yes') { // Fixed: Check for exact string match
      // Install auth dependencies
      const projectRoot = process.cwd();
      execSync('npm install jsonwebtoken bcrypt', { cwd: projectRoot, stdio: 'inherit' });
      if (answers.language === 'TypeScript') {
        execSync('npm install -D @types/jsonwebtoken @types/bcrypt', { cwd: projectRoot, stdio: 'inherit' });
      }
      createAuthFiles(answers.language, answers.projectName); // Pass projectName to createAuthFiles
    }

    console.log('Project setup complete!');
  } catch (error) {
    console.error('Error occurred during project setup:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  }
}


function createProjectStructure(answers) {
  const projectRoot = process.cwd();
  const rootDir = path.join(projectRoot, answers.projectName); // Fixed: Use consistent property access
  
  try {
    fs.mkdirSync(rootDir, { recursive: true });
  } catch (error) {
    console.error(`Failed to create directory ${rootDir}: ${error.message}`);
    return; // Exit the function if directory creation fails
  }

  // Create entry file
  const entryFile = `index.${answers.language === 'TypeScript' ? 'ts' : 'js'}`;
  const indexFile = path.join(projectRoot, entryFile);
  const expressCode = `
    const express = require('express');
    const cors = require('cors');
    const dotenv = require('dotenv');
    dotenv.config();
    const app = express();
    const routes = require('./${answers.projectName}/routes');

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    
    app.use('/api', routes);
    
    app.listen(3000, () => 
        console.log('Server running on port 3000')
        );
  `;
  
  try {
    if (!fs.existsSync(indexFile)) {
      fs.writeFileSync(indexFile, expressCode.trim());
    } else {
      console.warn(`Entry file ${indexFile} already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error(`Failed to create entry file ${indexFile}: ${error.message}`);
    return; // Exit the function if file creation fails
  }

  // Create folder structure
  const folders = ['controllers', 'services', 'repositories', 'routes', 'middleware', 'config', 'utils', 'models'];
  const tsFolders = ['types', 'enums'];

  folders.forEach((folder) => {
    const folderPath = path.join(rootDir, folder);
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      } else {
        console.warn(`Folder ${folderPath} already exists. Skipping creation.`);
      }
    } catch (error) {
      console.error(`Failed to create folder ${folderPath}: ${error.message}`);
    }
  });

  if (answers.language === 'TypeScript') {
    tsFolders.forEach((folder) => {
      const folderPath = path.join(rootDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        fs.writeFileSync(path.join(folderPath, 'demo.ts'), `// Demo file for ${folder}`);
      }
    });
  }

  // Create routes/index file
  const routesFile = path.join(rootDir, 'routes', `index.${answers.language === 'TypeScript' ? 'ts' : 'js'}`);
  const routeCode = answers.language === 'TypeScript'
    ? `
      const { Router } = require('express');
      const router = Router();
      router.get('/', (req: any, res: any) => res.send('API is working'));
      module.exports = router;
    `
    : `
      const { Router } = require('express');
      const router = Router();
      router.get('/', (req, res) => res.send('API is working'));
      module.exports = router;
    `;
  if (!fs.existsSync(routesFile)) {
    fs.writeFileSync(routesFile, routeCode.trim());
  } else {
    console.warn(`Routes file ${routesFile} already exists. Skipping creation.`);
  }

  // Create .env and .gitignore
  const envFile = path.join(projectRoot, '.env');
  const gitignoreFile = path.join(projectRoot, '.gitignore');
  
  // Fixed: Remove duplicate writes and undefined variables
  fs.writeFileSync(envFile, `PORT=3000\nDB_URL=mongodb://localhost:27017/myapp\nJWT_KEY=your_jwt_secret_key\n`);
  fs.writeFileSync(gitignoreFile, 'node_modules/\n.env\n');

}

function initializePackageJson(answers) {
  const projectRoot = process.cwd();

  execSync('npm init -y', { cwd: projectRoot, stdio: 'inherit' });

  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if (answers.language === 'TypeScript') {
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: 'ts-node-dev index.ts',
      build: 'tsc', // Added build script
      start: 'node dist/index.js' // Added start script
    };

    const tsConfig = {
      compilerOptions: {
        target: 'ES6',
        module: 'commonjs',
        outDir: './dist',
        rootDir: './',
        strict: true,
        esModuleInterop: true,
      },
    };
    fs.writeFileSync(path.join(projectRoot, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
  }
  if (answers.language === 'JavaScript') {
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: 'nodemon index.js', // Fixed: Use nodemon instead of node
      start: 'node index.js'
    };
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function installDependencies(answers) {
  const projectRoot = process.cwd();

  const dependencies = ['express', 'cors', 'dotenv', 'nodemon'];
  
  // Fixed: Remove duplicate dependencies
  const devDependencies = answers.language === 'TypeScript' 
    ? ['typescript', '@types/node', '@types/express', '@types/cors', 'ts-node-dev'] 
    : [];

  if (dependencies.length > 0) {
    execSync(`npm install ${dependencies.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' });
  }

  if (devDependencies.length > 0) {
    execSync(`npm install -D ${devDependencies.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' });
  }
}

function createAuthFiles(language, projectName) { // Add projectName parameter
  const projectRoot = process.cwd();
  let templates;

  // Select the appropriate templates based on the language
  if (language === 'JavaScript') {
    templates = jsTemplates;
  } else {
    templates = tsTemplates;
  }

  const fileExt = language === 'TypeScript' ? '.ts' : '.js';
  const rootDir = path.join(projectRoot, projectName);

  // Create auth files in their respective folders
  if (templates.userController && templates.userService && templates.userRepository && templates.userRoute) {
    const controllersDir = path.join(rootDir, 'controllers');
    const servicesDir = path.join(rootDir, 'services'); 
    const repositoriesDir = path.join(rootDir, 'repositories');
    const routesDir = path.join(rootDir, 'routes');

    fs.writeFileSync(path.join(controllersDir, `authController${fileExt}`), templates.userController);
    fs.writeFileSync(path.join(servicesDir, `authService${fileExt}`), templates.userService);
    fs.writeFileSync(path.join(repositoriesDir, `authRepository${fileExt}`), templates.userRepository);
    fs.writeFileSync(path.join(routesDir, `authRoutes${fileExt}`), templates.userRoute);
  }

  console.log('Authentication files created successfully!');
  console.log('Database update coming soon... For now set up your database manually');
}

init();
