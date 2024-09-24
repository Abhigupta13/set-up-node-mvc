#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

async function init() {
  try {
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your root folder?',
        default: 'src'
      },
      {
        type: 'list',
        name: 'language',
        message: 'Which programming language do you want to use?',
        choices: ['JavaScript', 'TypeScript'],
      },
      {
        type: 'list',
        name: 'database',
        message: 'Which database do you want to use?',
        choices: ['MongoDB', 'MySQL', 'PostgreSQL', 'choose later'],
      },
      {
        type: 'list',
        name: 'orm',
        message: 'Select an ORM or ODM based on your database choice:',
        choices: (currentAnswers) => {
          if (currentAnswers.database === 'MongoDB') {
            return ['Mongoose'];
          } else if (currentAnswers.database === 'MySQL') {
            return ['Sequelize'];
          } else if (currentAnswers.database === 'PostgreSQL') {
            return ['prisma'];
          } else {
            return [];
          }
        }
      }
    ]);

    // Generate project structure
    createProjectStructure(answers);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

function createProjectStructure(answers) {
  const projectRoot = process.cwd(); // Current working directory where the command is run
  const rootDir = path.join(projectRoot, answers.projectName); // Subfolder for the src or main project code
  fs.mkdirSync(rootDir, { recursive: true });

  // Create index.js or index.ts in the root of the project (outside rootDir)
  const indexFile = path.join(projectRoot, `index.${answers.language === 'TypeScript' ? 'ts' : 'js'}`);
  const expressCode = `
    const express = require('express');
    const app = express();
    const routes = require('./${answers.projectName}/routes');
    app.use(express.json());
    app.use('/api', routes);
    app.listen(3000, () => console.log('Server running on port 3000'));
  `;
  fs.writeFileSync(indexFile, expressCode);

  // Create folders and demo files inside the rootDir (e.g., 'src')
  const folders = ['controllers', 'services', 'repositories', 'routes', 'middleware', 'config', 'utils'];
  const tsFolders = ['types', 'enums'];

  folders.forEach(folder => {
    const folderPath = path.join(rootDir, folder);
    fs.mkdirSync(folderPath);
    fs.writeFileSync(path.join(folderPath, 'demo.' + (answers.language === 'TypeScript' ? 'ts' : 'js')), `// Demo file for ${folder}`);
  });

  if (answers.language === 'TypeScript') {
    tsFolders.forEach(folder => {
      const folderPath = path.join(rootDir, folder);
      fs.mkdirSync(folderPath);
      fs.writeFileSync(path.join(folderPath, 'demo.ts'), `// Demo file for ${folder}`);
    });
  }

  // Create basic routing setup in routes directory inside the rootDir
  const routesFile = path.join(rootDir, 'routes', `index.${answers.language === 'TypeScript' ? 'ts' : 'js'}`);
  const routeCode = `
    const express = require('express');
    const router = express.Router();
    router.get('/', (req, res) => res.send('API is working'));
    module.exports = router;
  `;
  fs.writeFileSync(routesFile, routeCode);

  // Create .env and .gitignore in the main project directory (outside rootDir)
  const envFile = path.join(projectRoot, '.env');
  const gitignoreFile = path.join(projectRoot, '.gitignore');
  fs.writeFileSync(envFile, 'PORT=3000\nDB_URL=your-database-url\n');
  fs.writeFileSync(gitignoreFile, 'node_modules/\n.env\n');

  console.log(`Folder created with MVC architecture at ${projectRoot}`);
}

init();
