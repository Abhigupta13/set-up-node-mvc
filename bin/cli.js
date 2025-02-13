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
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'Source Folder',
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

    if (answers.authentication) {
      createAuthFiles(answers.language);
    }

    console.log('Project setup complete!');
  } catch (error) {
    console.error('Error occurred during project setup:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  }
}

function copyTemplateFile(templatePath, destinationPath) {
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  fs.writeFileSync(destinationPath, templateContent.trim());
}

function readTemplateFile(templatePath) {
  return fs.readFileSync(templatePath, 'utf-8');
}

function createDemoFiles(answers, rootDir) {
  const demoContent = {
    controllers: answers.language === 'TypeScript' ? fs.readFileSync(path.join(__dirname, '../templates/tsTemplates.txt'), 'utf-8') : fs.readFileSync(path.join(__dirname, '../templates/jsTemplates.txt'), 'utf-8'),
    services: answers.language === 'TypeScript' ? fs.readFileSync(path.join(__dirname, '../templates/tsTemplates.txt'), 'utf-8') : fs.readFileSync(path.join(__dirname, '../templates/jsTemplates.txt'), 'utf-8'),
    repositories: answers.language === 'TypeScript' ? fs.readFileSync(path.join(__dirname, '../templates/tsTemplates.txt'), 'utf-8') : fs.readFileSync(path.join(__dirname, '../templates/jsTemplates.txt'), 'utf-8'),
    routes: answers.language === 'TypeScript' ? fs.readFileSync(path.join(__dirname, '../templates/tsTemplates.txt'), 'utf-8') : fs.readFileSync(path.join(__dirname, '../templates/jsTemplates.txt'), 'utf-8'),
  };

  // Create demo.txt files in each directory
  fs.writeFileSync(path.join(rootDir, 'controllers', 'demo.txt'), demoContent.controllers);
  fs.writeFileSync(path.join(rootDir, 'services', 'demo.txt'), demoContent.services);
  fs.writeFileSync(path.join(rootDir, 'repositories', 'demo.txt'), demoContent.repositories);
  fs.writeFileSync(path.join(rootDir, 'routes', 'demo.txt'), demoContent.routes);
}

function createProjectStructure(answers) {
  const projectRoot = process.cwd();
  const rootDir = path.join(projectRoot, answers.projectName);
  
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
  const portAnswer = inquirer.prompt({
    type: 'input', 
    name: 'port',
    message: 'Enter the port number (default: 3000):',
    default: '3000',
  }).then(port => {
    const dbUrlAnswer = inquirer.prompt({
      type: 'input',
      name: 'dbUrl', 
      message: 'Enter your database URL:',
      default: 'your-database-url',
    }).then(dbUrl => {
      fs.writeFileSync(envFile, `PORT=${port.port}\nDB_URL=${dbUrl.dbUrl}\n`);
      fs.writeFileSync(gitignoreFile, 'node_modules/\n.env\n');
    });
  });
  
  fs.writeFileSync(envFile, `PORT=${port.port}\nDB_URL=${dbUrl.dbUrl}\n`);
  fs.writeFileSync(gitignoreFile, 'node_modules/\n.env\n');

  // Example: Create a config file for the selected database
  if (answers.database !== 'None') {
    const dbConfigFile = path.join(rootDir, 'config', 'dbConfig.js');
    const dbConfigContent = `
      // Database configuration for ${answers.database}
      module.exports = {
        // Add your ${answers.database} configuration here
      };
    `;
    fs.writeFileSync(dbConfigFile, dbConfigContent.trim());
  }

  // Example: Add middleware files based on user selection
  answers.middleware.forEach((mw) => {
    const mwFile = path.join(rootDir, 'middleware', `${mw}.${answers.language === 'TypeScript' ? 'ts' : 'js'}`);
    const mwContent = answers.language === 'TypeScript'
      ? `import { Request, Response, NextFunction } from 'express';\n\nexport const ${mw} = (req: Request, res: Response, next: NextFunction) => {\n  // Middleware for ${mw}\n  next();\n};`
      : `const ${mw} = (req, res, next) => {\n  // Middleware for ${mw}\n  next();\n};\n\nmodule.exports = ${mw};`;
    fs.writeFileSync(mwFile, mwContent.trim());
  });

  // Example: Add testing framework setup
  if (answers.testingFramework === 'Jest') {
    const jestConfig = {
      testEnvironment: 'node',
    };
    fs.writeFileSync(path.join(projectRoot, 'jest.config.js'), JSON.stringify(jestConfig, null, 2));
  } else if (answers.testingFramework === 'Mocha') {
    const mochaConfig = {
      // Basic Mocha setup
      require: ['chai/register'],
      timeout: 5000,
    };
    fs.writeFileSync(path.join(projectRoot, 'mocha.opts'), JSON.stringify(mochaConfig, null, 2));
  }

  // Create demo files
  createDemoFiles(answers, rootDir);
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
      dev: 'node index.js',
    };
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function installDependencies(answers) {
  const projectRoot = process.cwd();

  const dependencies = ['express', 'cors', 'dotenv', 'nodemon'];
  const devDependencies =
    answers.language === 'TypeScript' ? ['typescript', '@types/node', '@types/express', 'ts-node-dev', 'dotenv', 'nodemon', 'cors'] : [];

  if (dependencies.length > 0) {
    execSync(`npm install ${dependencies.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' });
  }

  if (devDependencies.length > 0) {
    execSync(`npm install -D ${devDependencies.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' });
  }
}

function createAuthFiles(language) {
  const projectRoot = process.cwd();
  let templates;

  // Select the appropriate templates based on the language
  if (language === 'JavaScript') {
    templates = jsTemplates;
  } else {
    templates = tsTemplates;
  }

  // Create the necessary files using the templates
  fs.writeFileSync(path.join(projectRoot, 'controllers/userController.js'), templates.userController);
  fs.writeFileSync(path.join(projectRoot, 'services/userService.js'), templates.userService);
  fs.writeFileSync(path.join(projectRoot, 'repositories/userRepository.js'), templates.userRepository);
  fs.writeFileSync(path.join(projectRoot, 'routes/userRoutes.js'), templates.userRoutes);

  console.log('Authentication files created successfully!');
}

init();
