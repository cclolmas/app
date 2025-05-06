const fs = require('fs');
const path = require('path');

console.log('Setting up Chrome testing environment...');

// Check if project is built
if (!fs.existsSync(path.join(__dirname, 'dist')) || 
    !fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('Project build or dependencies missing. Running setup...');
  console.log('Please run: npm install && npm run build');
  process.exit(1);
}

console.log('Project appears to be built correctly.');
console.log('To test in Chrome:');
console.log('1. Run your development server (e.g., npm run dev or npm start)');
console.log('2. Open Chrome and navigate to the local development URL');
console.log('3. Use Chrome DevTools (F12) for debugging');
console.log('4. To test on different devices, use Chrome DevTools device emulation');

console.log('\nHappy testing!');
