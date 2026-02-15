import { parseLASFile } from './src/utils/lasParser.js';
import { insertWell, insertWellData, getAllWells } from './src/services/dbService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lasFilePath = path.join(__dirname, '../../Well_Data (las).las');

async function testDatabase() {
  try {
    console.log('Parsing LAS file...');
    const result = parseLASFile(lasFilePath);
    
    console.log('Inserting well metadata...');
    const wellId = await insertWell(result.metadata, 'test/well_data.las');
    console.log(`Well inserted with ID: ${wellId}`);
    
    console.log('Inserting well data (this may take a minute)...');
    await insertWellData(wellId, result.curves, result.data);
    
    console.log('\nFetching all wells...');
    const wells = await getAllWells();
    console.log('Wells in database:', wells);
    
    console.log('\n✅ Database test complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDatabase();