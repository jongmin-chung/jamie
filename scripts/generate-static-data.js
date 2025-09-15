#!/usr/bin/env node

const { generateStaticData } = require('../src/lib/static-generation.ts');

// Generate static data for the build process
async function main() {
  try {
    console.log('🚀 Starting static data generation...');
    await generateStaticData();
    console.log('✅ Static data generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating static data:', error);
    process.exit(1);
  }
}

main();