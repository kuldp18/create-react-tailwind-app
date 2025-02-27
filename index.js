#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const CURRENT_DIR = process.cwd();

program
  .name('create-react-tailwind-app')
  .description('Create a new React 19 + Tailwind CSS v4 project with Vite')
  .argument('[project-name]', 'Name of your project')
  .option('-y, --yes', 'Skip all prompts and use defaults')
  .version('1.0.0', '-v, --version')
  .action(async (projectName, options) => {
    console.log(chalk.blue.bold('\n🚀 Creating a new React 19 + Tailwind CSS v4 project with Vite\n'));
    
    let answers = {};
    
    if (!projectName || !options.yes) {
      answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is the name of your project?',
          default: projectName || 'react-tailwind-app',
          validate: (input) => {
            if (/^([A-Za-z\-_\d])+$/.test(input)) return true;
            return 'Project name may only include letters, numbers, underscores and hashes.';
          }
        },
        {
          type: 'confirm',
          name: 'typescript',
          message: 'Would you like to use TypeScript?',
          default: true
        },
        {
          type: 'list',
          name: 'packageManager',
          message: 'Which package manager do you want to use?',
          choices: ['npm', 'yarn', 'pnpm'],
          default: 'npm'
        }
      ]);
    } else {
      answers = {
        projectName: projectName || 'react-tailwind-app',
        typescript: true,
        packageManager: 'npm'
      };
    }

    const { projectName: finalProjectName, typescript, packageManager } = answers;
    const projectPath = path.join(CURRENT_DIR, finalProjectName);

    // Create project directory
    const spinner = ora('Creating project directory...').start();
    try {
      if (fs.existsSync(projectPath)) {
        spinner.fail(`A folder named ${chalk.yellow(finalProjectName)} already exists.`);
        process.exit(1);
      }
      
      fs.mkdirSync(projectPath);
      spinner.succeed(`Created directory ${chalk.green(finalProjectName)}`);
    } catch (error) {
      spinner.fail('Failed to create project directory');
      console.error(error);
      process.exit(1);
    }

    // Generate project files
    const templateType = typescript ? 'typescript' : 'javascript';
    const spinner2 = ora('Generating project files...').start();
    try {
      await createViteProject(projectPath, finalProjectName, templateType, packageManager);
      spinner2.succeed('Project files generated');
    } catch (error) {
      spinner2.fail('Failed to generate project files');
      console.error(error);
      process.exit(1);
    }

    // Display completion message
    console.log(chalk.green.bold('\n✨ Project created successfully!\n'));
    console.log('Next steps:');
    console.log(chalk.cyan(`  cd ${finalProjectName}`));
    console.log(chalk.cyan(`  ${packageManager === 'npm' ? 'npm run' : packageManager} dev\n`));
  });

async function createViteProject(projectPath, projectName, templateType, packageManager) {
  try {
    // Create a new Vite project with React using non-interactive mode
    const reactTemplate = templateType === 'typescript' ? 'react-ts' : 'react';
    
    console.log(chalk.cyan(`\nCreating new Vite project with React template...`));
    
    // Remove the created directory as create-vite will recreate it
    fs.removeSync(projectPath);
    
    // Use the appropriate command for each package manager to avoid interactive prompts
    if (packageManager === 'npm') {
      execSync(`npm create vite@latest ${projectName} -- --template ${reactTemplate}`, {
        cwd: path.dirname(projectPath),
        stdio: 'inherit'
      });
    } else if (packageManager === 'yarn') {
      execSync(`yarn create vite ${projectName} --template ${reactTemplate}`, {
        cwd: path.dirname(projectPath),
        stdio: 'inherit'
      });
    } else if (packageManager === 'pnpm') {
      execSync(`pnpm create vite ${projectName} --template ${reactTemplate}`, {
        cwd: path.dirname(projectPath),
        stdio: 'inherit'
      });
    }

    // Install dependencies first
    const installCmd = packageManager === 'npm' ? 'npm install' : 
                      (packageManager === 'yarn' ? 'yarn' : 'pnpm install');
    
    console.log(chalk.cyan(`\nInstalling base dependencies...`));
    execSync(installCmd, {
      cwd: projectPath,
      stdio: 'inherit'
    });

    // Install Tailwind CSS and its dependencies using the latest approach
    console.log(chalk.cyan(`\nInstalling Tailwind CSS and related packages...`));
    const installDepsCmd = packageManager === 'npm' ? 'npm install' : 
                          (packageManager === 'yarn' ? 'yarn add' : 'pnpm add');
    
    execSync(`${installDepsCmd} tailwindcss @tailwindcss/postcss postcss`, {
      cwd: projectPath,
      stdio: 'inherit'
    });

    // Create only the postcss.config.mjs file as specified
    console.log(chalk.cyan(`\nCreating PostCSS configuration file...`));
    
    // Create postcss.config.mjs using the latest approach
    const postcssConfigPath = path.join(projectPath, 'postcss.config.mjs');
    const postcssConfig = `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;`;
    fs.writeFileSync(postcssConfigPath, postcssConfig);

    // Create Tailwind CSS entry file with the latest import syntax
    const cssFile = 'src/index.css';
    const tailwindCssContent = `@import "tailwindcss";`;
    fs.writeFileSync(path.join(projectPath, cssFile), tailwindCssContent);

    // Modify main file to import CSS
    const mainFile = templateType === 'typescript' ? 'src/main.tsx' : 'src/main.jsx';
    const mainFilePath = path.join(projectPath, mainFile);
    const mainContent = fs.readFileSync(mainFilePath, 'utf8');
    
    let updatedMainContent = mainContent;
    if (!mainContent.includes('./index.css')) {
      if (mainContent.includes("import React from 'react'")) {
        updatedMainContent = mainContent.replace("import React from 'react'", "import React from 'react'\nimport './index.css'");
      } else {
        // If there's no React import, add the CSS import at the top
        updatedMainContent = "import './index.css'\n" + mainContent;
      }
    }
    fs.writeFileSync(mainFilePath, updatedMainContent);

    // Add a sample component that uses Tailwind CSS
    const exampleComponentFile = templateType === 'typescript' ? 'src/components/Example.tsx' : 'src/components/Example.jsx';
    const exampleComponentPath = path.join(projectPath, exampleComponentFile);
    fs.mkdirSync(path.dirname(exampleComponentPath), { recursive: true });
    
    const exampleComponent = `${templateType === 'typescript' ? 'import React from "react"\n\n' : ''}const Example = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-16 gap-4 shadow-purple-400">
      <h1 className="text-white text-4xl font-bold mb-4 font-mono">React + Tailwind Boilerplate</h1>
      <p className="text-white text-xl">Edit <code className="bg-white/20 px-1 py-0.5 rounded animate-pulse">src/components/Example.${templateType === 'typescript' ? 'tsx' : 'jsx'}</code> to get started!</p>
      <div className="flex gap-4">

      <button className="mt-6 px-6 py-2 bg-white text-purple-600 rounded-full hover:bg-purple-100 transition-colors inline-block cursor-pointer text-lg w-32">
        <a href="https://react.dev/reference/react" target="_blank">
        React
        </a>
      </button>

      <button className="mt-6 px-6 py-2 bg-white text-purple-600 rounded-full hover:bg-purple-100 transition-colors inline-block cursor-pointer text-lg w-32">
        <a href="https://tailwindcss.com/" target="_blank">
        Tailwind
        </a>
      </button>

      </div>

    </div>
  )
}

export default Example`;
    fs.writeFileSync(exampleComponentPath, exampleComponent);

    // Update App component to use the Example component
    const appFile = templateType === 'typescript' ? 'src/App.tsx' : 'src/App.jsx';
    const appFilePath = path.join(projectPath, appFile);
    
    const appComponent = `${templateType === 'typescript' ? 'import React from "react"\n' : ''}import Example from "./components/Example"

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Example />
    </div>
  )
}

export default App`;
    fs.writeFileSync(appFilePath, appComponent);

    // Remove App.css since we're not using it
    const appCssPath = path.join(projectPath, 'src/App.css');
    if (fs.existsSync(appCssPath)) {
      fs.unlinkSync(appCssPath);
    }

    // Update package.json to use React 19
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies.react = '^19.0.0';
    packageJson.dependencies['react-dom'] = '^19.0.0';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    return true;
  } catch (error) {
    console.error('Error in createViteProject:', error);
    throw error;
  }
}

program.parse();