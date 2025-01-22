#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function init() {
  try {
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your root folder?',
        default: 'src',
      },
      {
        type: 'list',
        name: 'language',
        message: 'Which programming language do you want to use?',
        choices: ['JavaScript', 'TypeScript'],
      },
    ]);

    createProjectStructure(answers);
    initializePackageJson(answers);
    installDependencies(answers);

    console.log('Project setup complete!');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

function createProjectStructure(answers) {
  const projectRoot = process.cwd();
  const rootDir = path.join(projectRoot, answers.projectName);
  fs.mkdirSync(rootDir, { recursive: true });

  // Create entry file
  const entryFile = `index.${answers.language === 'TypeScript' ? 'ts' : 'js'}`;
  const indexFile = path.join(projectRoot, entryFile);
  const expressCode = `
    const express = require('express');
    const app = express();
    const routes = require('./${answers.projectName}/routes');
    app.use(express.json());
    app.use('/api', routes);
    
    app.listen(3000, () => 
        console.log('Server running on port 3000')
        );
  `;
  fs.writeFileSync(indexFile, expressCode.trim());

  // Create folder structure
  const folders = ['controllers', 'services', 'repositories', 'routes', 'middleware', 'config', 'utils','models'];
  const tsFolders = ['types', 'enums'];

  folders.forEach((folder) => {
    const folderPath = path.join(rootDir, folder);
    fs.mkdirSync(folderPath);
    // fs.writeFileSync(
    //   path.join(folderPath, `demo.${answers.language === 'TypeScript' ? 'ts' : 'js'}`),
    //   `// Demo file for ${folder}`
    // );
  });

  if (answers.language === 'TypeScript') {
    tsFolders.forEach((folder) => {
      const folderPath = path.join(rootDir, folder);
      fs.mkdirSync(folderPath);
      fs.writeFileSync(path.join(folderPath, 'demo.ts'), `// Demo file for ${folder}`);
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
  fs.writeFileSync(routesFile, routeCode.trim());

  // Create .env and .gitignore
  const envFile = path.join(projectRoot, '.env');
  const gitignoreFile = path.join(projectRoot, '.gitignore');
  fs.writeFileSync(envFile, 'PORT=3000\nDB_URL=your-database-url\n');
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

  const dependencies = ['express'];
  const devDependencies =
    answers.language === 'TypeScript' ? ['typescript', '@types/node', '@types/express', 'ts-node-dev'] : [];

  if (dependencies.length > 0) {
    execSync(`npm install ${dependencies.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' });
  }

  if (devDependencies.length > 0) {
    execSync(`npm install -D ${devDependencies.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' });
  }
}

init();
