#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

async function init() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: 'my-mvc-project'
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

  // Generate project directory and files based on answers
  createProjectStructure(answers);
}

function createProjectStructure(answers) {
  const rootDir = path.join(process.cwd(), answers.projectName);
  fs.mkdirSync(rootDir, { recursive: true });

  // Example: Create an index file
  const indexFile = path.join(rootDir, 'index.' + (answers.language === 'TypeScript' ? 'ts' : 'js'));
  fs.writeFileSync(indexFile, '// Entry point of the application\n');

  console.log(`Project created at ${rootDir}`);
}

init();
