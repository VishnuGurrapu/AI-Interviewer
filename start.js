#!/usr/bin/env node

/**
 * Startup script for the AI Interview Assistant
 * This script helps set up and run the application
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.blue}=== ${message} ===${colors.reset}`);
}

async function checkFile(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    log(`${colors.yellow}Running: ${command} ${args.join(' ')}${colors.reset}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
        resolve();
      } else {
        log(`${colors.red}❌ ${description} failed with code ${code}${colors.reset}`);
        reject(new Error(`${description} failed`));
      }
    });

    child.on('error', (error) => {
      log(`${colors.red}❌ Error running ${description}: ${error.message}${colors.reset}`);
      reject(error);
    });
  });
}

async function setup() {
  try {
    logHeader('AI Interview Assistant Setup');
    
    log(`${colors.cyan}Welcome to the AI Interview Assistant!${colors.reset}`);
    log('This script will help you set up and run the application.\n');

    // Check if we're in the right directory
    const backendExists = await checkFile('./backend/package.json');
    const frontendExists = await checkFile('./frontend/package.json');

    if (!backendExists || !frontendExists) {
      log(`${colors.red}❌ Error: Backend or frontend directories not found.${colors.reset}`);
      log('Make sure you\'re running this script from the project root directory.');
      process.exit(1);
    }

    // Check environment files
    logHeader('Checking Environment Configuration');
    
    const backendEnvExists = await checkFile('./backend/.env');
    const frontendEnvExists = await checkFile('./frontend/.env');

    if (!backendEnvExists) {
      log(`${colors.yellow}⚠️  Backend .env file not found. Creating default...${colors.reset}`);
      await fs.writeFile('./backend/.env', 'MONGODB_URI=mongodb://localhost:27017/ai-interviewer\nPORT=5000\n');
      log(`${colors.green}✅ Created backend/.env${colors.reset}`);
    }

    if (!frontendEnvExists) {
      log(`${colors.yellow}⚠️  Frontend .env file not found. Creating default...${colors.reset}`);
      await fs.writeFile('./frontend/.env', 'VITE_API_URL=http://localhost:5000/api\n');
      log(`${colors.green}✅ Created frontend/.env${colors.reset}`);
    }

    // Install dependencies
    logHeader('Installing Dependencies');
    
    log(`${colors.cyan}Installing backend dependencies...${colors.reset}`);
    await runCommand('npm', ['install'], './backend', 'Backend dependency installation');
    
    log(`${colors.cyan}Installing frontend dependencies...${colors.reset}`);
    await runCommand('npm', ['install'], './frontend', 'Frontend dependency installation');

    // Setup complete
    logHeader('Setup Complete!');
    
    log(`${colors.green}🎉 Setup completed successfully!${colors.reset}\n`);
    
    log(`${colors.bright}Next steps:${colors.reset}`);
    log(`${colors.cyan}1. Start MongoDB (if using local instance)${colors.reset}`);
    log(`${colors.cyan}2. Seed the database: cd backend && npm run seed${colors.reset}`);
    log(`${colors.cyan}3. Start the backend: cd backend && npm run dev${colors.reset}`);
    log(`${colors.cyan}4. Start the frontend: cd frontend && npm run dev${colors.reset}`);
    log(`${colors.cyan}5. Visit http://localhost:5173${colors.reset}\n`);
    
    log(`${colors.bright}Optional:${colors.reset}`);
    log(`${colors.cyan}- Test API endpoints: cd backend && npm run test-api${colors.reset}`);
    log(`${colors.cyan}- Add OpenAI API key to backend/.env for AI features${colors.reset}\n`);

  } catch (error) {
    log(`${colors.red}❌ Setup failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run setup
setup();
