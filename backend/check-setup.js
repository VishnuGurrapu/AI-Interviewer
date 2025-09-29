/**
 * Backend Setup Checker
 * Run this to diagnose common issues
 */

import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkSetup() {
  log('\n🔍 Backend Setup Checker\n', colors.blue);

  let issues = [];
  let warnings = [];

  // Check 1: Environment file
  log('1. Checking environment file...', colors.yellow);
  if (fs.existsSync('.env')) {
    log('✅ .env file exists', colors.green);
    
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      
      if (envContent.includes('MONGODB_URI')) {
        log('✅ MONGODB_URI found', colors.green);
      } else {
        issues.push('MONGODB_URI not found in .env');
      }
      
      if (envContent.includes('OPENAI_API_KEY') || envContent.includes('OPEN_APL_KEY')) {
        log('✅ OpenAI API key found', colors.green);
      } else {
        warnings.push('OpenAI API key not found (will use mock responses)');
      }
    } catch (error) {
      issues.push('Cannot read .env file');
    }
  } else {
    issues.push('.env file missing');
  }

  // Check 2: Package.json and node_modules
  log('\n2. Checking dependencies...', colors.yellow);
  if (fs.existsSync('package.json')) {
    log('✅ package.json exists', colors.green);
    
    if (fs.existsSync('node_modules')) {
      log('✅ node_modules exists', colors.green);
      
      // Check specific packages
      const requiredPackages = ['express', 'mongoose', 'multer', 'pdf-parse', 'cors', 'dotenv'];
      const optionalPackages = ['openai'];
      
      for (const pkg of requiredPackages) {
        if (fs.existsSync(`node_modules/${pkg}`)) {
          log(`✅ ${pkg} installed`, colors.green);
        } else {
          issues.push(`Required package ${pkg} not installed`);
        }
      }
      
      for (const pkg of optionalPackages) {
        if (fs.existsSync(`node_modules/${pkg}`)) {
          log(`✅ ${pkg} installed`, colors.green);
        } else {
          warnings.push(`Optional package ${pkg} not installed (AI features disabled)`);
        }
      }
    } else {
      issues.push('node_modules not found - run npm install');
    }
  } else {
    issues.push('package.json not found');
  }

  // Check 3: Required directories
  log('\n3. Checking directories...', colors.yellow);
  const requiredDirs = ['controllers', 'models', 'routes', 'services', 'middleware', 'utils'];
  
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      log(`✅ ${dir}/ directory exists`, colors.green);
    } else {
      issues.push(`Required directory ${dir}/ not found`);
    }
  }

  // Check uploads directory
  if (!fs.existsSync('uploads')) {
    log('⚠️ Creating uploads directory...', colors.yellow);
    try {
      fs.mkdirSync('uploads/resumes', { recursive: true });
      log('✅ uploads/resumes/ directory created', colors.green);
    } catch (error) {
      issues.push('Cannot create uploads directory');
    }
  } else {
    log('✅ uploads/ directory exists', colors.green);
  }

  // Check 4: Key files
  log('\n4. Checking key files...', colors.yellow);
  const requiredFiles = [
    'index.js',
    'routes/index.js',
    'services/aiService.js',
    'middleware/upload.js',
    'utils/resumeParser.js'
  ];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      log(`✅ ${file} exists`, colors.green);
    } else {
      issues.push(`Required file ${file} not found`);
    }
  }

  // Summary
  log('\n📋 Summary:', colors.blue);
  
  if (issues.length === 0) {
    log('🎉 No critical issues found!', colors.green);
  } else {
    log(`❌ ${issues.length} critical issue(s) found:`, colors.red);
    issues.forEach(issue => log(`   • ${issue}`, colors.red));
  }
  
  if (warnings.length > 0) {
    log(`⚠️ ${warnings.length} warning(s):`, colors.yellow);
    warnings.forEach(warning => log(`   • ${warning}`, colors.yellow));
  }

  // Recommendations
  log('\n💡 Recommendations:', colors.blue);
  
  if (issues.some(i => i.includes('npm install'))) {
    log('Run: npm install', colors.magenta);
  }
  
  if (issues.some(i => i.includes('.env'))) {
    log('Create .env file with required variables', colors.magenta);
  }
  
  if (warnings.some(w => w.includes('openai'))) {
    log('Install OpenAI: npm install openai', colors.magenta);
  }

  log('\n🚀 To start the server: npm run dev', colors.blue);
  
  return issues.length === 0;
}

// Run the check
checkSetup().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`❌ Setup check failed: ${error.message}`, colors.red);
  process.exit(1);
});
