/**
 * Fix pdf-parse package issue
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function fixPdfParse() {
  console.log('🔧 Fixing pdf-parse package...\n');

  try {
    console.log('1. Uninstalling pdf-parse...');
    await execAsync('npm uninstall pdf-parse');
    console.log('✅ pdf-parse uninstalled');

    console.log('\n2. Installing pdf-parse@1.1.1...');
    await execAsync('npm install pdf-parse@1.1.1');
    console.log('✅ pdf-parse@1.1.1 installed');

    console.log('\n3. Testing pdf-parse import...');
    try {
      const pdf = await import('pdf-parse');
      console.log('✅ pdf-parse import successful');
    } catch (error) {
      console.log('❌ pdf-parse import failed:', error.message);
      
      console.log('\n4. Trying alternative version...');
      await execAsync('npm uninstall pdf-parse');
      await execAsync('npm install pdf-parse@1.2.0');
      console.log('✅ Installed pdf-parse@1.2.0');
    }

    console.log('\n🎉 PDF parsing should now work correctly!');
    console.log('Restart your server: npm run dev');

  } catch (error) {
    console.error('❌ Failed to fix pdf-parse:', error.message);
    console.log('\n💡 Manual fix:');
    console.log('1. npm uninstall pdf-parse');
    console.log('2. npm install pdf-parse@1.1.1');
    console.log('3. If that fails, try: npm install pdf-parse@1.2.0');
  }
}

fixPdfParse();
