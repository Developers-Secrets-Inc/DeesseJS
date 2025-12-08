#!/usr/bin/env node

import prompts from 'prompts';
import pc from 'picocolors';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

async function init() {
  console.log(pc.cyan('✨ Welcome to create-deesse-app!'));

  // 1. Détection du Package Manager (npm, pnpm, yarn, bun)
  const pkgManager = detectPackageManager();

  const response = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'What is your project name?',
        initial: 'my-deesse-app',
      },
      {
        type: 'select',
        name: 'template',
        message: 'Select a template:',
        choices: [
          { title: 'Blank (Empty project)', value: 'blank' },
        ],
        initial: 0,
      },
      {
        type: 'text',
        name: 'databaseUrl',
        message: 'What is your PostgreSQL database URL?',
        initial: 'postgres://user:password@localhost:5432/mydb',
      },
    ],
    {
      onCancel: () => {
        console.log(pc.red('✖') + ' Operation cancelled.');
        process.exit(1);
      },
    }
  );

  const cwd = process.cwd();
  const targetDir = response.projectName === '.' 
    ? cwd 
    : path.join(cwd, response.projectName);

  if (response.projectName !== '.' && fs.existsSync(targetDir)) {
    if (fs.readdirSync(targetDir).length > 0) {
      console.log(pc.red(`✖ Directory "${response.projectName}" is not empty. Please choose another name.`));
      process.exit(1);
    }
  } else if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(pc.blue(`\n📂 Setting up project in ${targetDir}...`));

  const templateRoot = path.join(__dirname, '..', 'templates');
  const templateDir = path.resolve(templateRoot, response.template);

  if (!fs.existsSync(templateDir)) {
    console.error(pc.red(`✖ Template not found at ${templateDir}`));
    process.exit(1);
  }

  copyDir(templateDir, targetDir);

  const secret = crypto.randomBytes(32).toString('hex');
  const envContent = `DATABASE_URL="${response.databaseUrl}"\nDEESSE_SECRET="${secret}"\n`;
  fs.writeFileSync(path.join(targetDir, '.env'), envContent);
  console.log(pc.green('✔ .env file created.'));

  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.name = response.projectName === '.' ? path.basename(cwd) : response.projectName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }

  // 2. Installation dynamique selon le package manager
  console.log(pc.blue(`\n📦 Installing dependencies using ${pkgManager}...`));
  try {
    // on lance "pnpm install", "yarn install" ou "npm install"
    execSync(`${pkgManager} install`, { cwd: targetDir, stdio: 'inherit' });
    console.log(pc.green('✔ Dependencies installed.'));
  } catch (error) {
    console.error(pc.red('✖ Failed to install dependencies.'));
  }

  // 3. Messages de fin adaptés
  console.log(pc.green(`\n✨ Project ${response.projectName} created successfully!`));
  
  const runCommand = pkgManager === 'npm' ? 'npm run' : pkgManager; // pnpm dev, yarn dev, npm run dev
  
  console.log('\nNext steps:');
  if (response.projectName !== '.') {
    console.log(`  cd ${response.projectName}`);
  }
  console.log(`  ${runCommand} dev`);
}

function copyDir(src: string, dest: string) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((child) => {
      copyDir(path.join(src, child), path.join(dest, child));
    });
  } else {
    const destFile = path.basename(src) === '_gitignore' 
      ? path.join(path.dirname(dest), '.gitignore') 
      : dest;
    fs.copyFileSync(src, destFile);
  }
}

/**
 * Détecte le package manager utilisé pour lancer le script
 */
function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent;

  if (!userAgent) return 'npm';
  if (userAgent.startsWith('yarn')) return 'yarn';
  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('bun')) return 'bun';

  return 'npm';
}

init().catch((e) => {
  console.error(e);
});