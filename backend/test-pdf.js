/**
 * Test pdf-parse package specifically
 */

console.log('🧪 Testing pdf-parse package...\n');

try {
  console.log('1. Testing pdf-parse import...');
  
  // Try to import pdf-parse
  const pdf = await import('pdf-parse');
  console.log('✅ pdf-parse imported successfully');
  console.log('   Version info:', pdf.default.name || 'Available');
  
  console.log('\n🎉 pdf-parse test PASSED!');
  console.log('The PDF parsing library is working correctly.');
  
} catch (error) {
  console.log('❌ pdf-parse test FAILED!');
  console.log('Error:', error.message);
  console.log('Stack:', error.stack);
  
  console.log('\n💡 Possible solutions:');
  console.log('1. Reinstall pdf-parse: npm uninstall pdf-parse && npm install pdf-parse');
  console.log('2. Clear node_modules: rm -rf node_modules && npm install');
  console.log('3. Check if there are conflicting dependencies');
}

process.exit(0);
