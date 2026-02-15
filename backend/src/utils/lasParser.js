import fs from 'fs';

/**
 * Parses a LAS (Log ASCII Standard) file
 * @param {string} filePath - Path to the LAS file
 * @returns {Object} Parsed data with metadata, curves, and data rows
 */
function parseLASFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  
  const result = {
    metadata: {},
    curves: [],
    data: []
  };
  
  let currentSection = null;
  
  for (let line of lines) {
    line = line.trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;
    
    // Detect sections
    if (line.startsWith('~')) {
      if (line.includes('Well')) currentSection = 'WELL';
      else if (line.includes('Curve')) currentSection = 'CURVE';
      else if (line.includes('Ascii')) currentSection = 'DATA';
      continue;
    }
    
    // Parse Well Information
    if (currentSection === 'WELL') {
      // Handle lines with units (e.g., STRT.F)
      /*
        - ^ - Start of line
        - (\w+) - Capture group 1: Word characters (STRT)
        - \. - Literal dot
        - \w+ - Word characters (F) - the unit, we don't capture this
        - \s+ - One or more spaces
        - (.+?) - Capture group 2: Any characters (8665.00) - the VALUE we want
        - \s*:\s* - Optional spaces, colon, optional spaces
        - (.+) - Capture group 3: Rest of line (START DEPTH) - description
        - $ - End of line
      */
      const matchWithUnit = line.match(/^(\w+)\.\w+\s+(.+?)\s*:\s*(.+)$/);
      if (matchWithUnit) {
        const [, key, value] = matchWithUnit;
        result.metadata[key] = value.trim();
        continue;
      }
      
      // Handle lines without units
      const match = line.match(/^(\w+)\.\s+(.+?)\s*:\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        result.metadata[key] = value.trim();
      }
    }
    
    // Parse Curve Information
    if (currentSection === 'CURVE') {
      const match = line.match(/^(\S+)/);
      if (match) {
        result.curves.push(match[1]);
      }
    }
    
    // Parse Data
    if (currentSection === 'DATA') {
      const values = line.split(/\s+/).map(v => parseFloat(v));
      if (values.length > 0 && !isNaN(values[0])) {
        result.data.push(values);
      }
    }
  }
  
  return result;
}

export { parseLASFile };