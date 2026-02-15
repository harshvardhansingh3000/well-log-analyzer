import { parseLASFile } from './src/utils/lasParser.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your LAS file
const lasFilePath = path.join(__dirname, '../../Well_Data (las).las');

console.log('Parsing LAS file...\n');

try {
  const result = parseLASFile(lasFilePath);
  
  console.log('=== METADATA ===');
  console.log(result.metadata);
  console.log('\n=== CURVES ===');
  console.log(`Total curves: ${result.curves.length}`);
  console.log('First 10 curves:', result.curves.slice(0, 10));
  console.log('\n=== DATA ===');
  console.log(`Total data rows: ${result.data.length}`);
  console.log('First data row:', result.data[0]);
  console.log('Last data row:', result.data[result.data.length - 1]);
  
} catch (error) {
  console.error('Error parsing LAS file:', error.message);
}
