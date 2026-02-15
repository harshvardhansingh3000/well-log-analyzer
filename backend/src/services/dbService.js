import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Insert well metadata into database
 * @param {Object} metadata - Parsed metadata from LAS file
 * @param {string} s3Key - S3 file key
 * @returns {number} wellId - ID of inserted well
 */
async function insertWell(metadata, s3Key) {
  const query = `
    INSERT INTO wells (name, location, start_depth, stop_depth, step, s3_file_key)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  
  const values = [
    metadata.WELL || 'Unknown',
    metadata.LOC || 'Unknown',
    parseFloat(metadata.STRT) || 0,
    parseFloat(metadata.STOP) || 0,
    parseFloat(metadata.STEP) || 1,
    s3Key
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0].id;
}

/**
 * Insert well data in batches
 * @param {number} wellId - Well ID
 * @param {Array} curves - Array of curve names
 * @param {Array} data - Array of data rows
 */
async function insertWellData(wellId, curves, data) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert data in batches of 1000 rows for performance
    const batchSize = 1000;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      for (const row of batch) {
        const depth = row[0];
        
        // Create JSON object with curve names as keys
        const dataObj = {};
        curves.forEach((curve, index) => {
          dataObj[curve] = row[index];
        });
        
        const query = `
          INSERT INTO well_data (well_id, depth, data)
          VALUES ($1, $2, $3)
        `;
        
        await client.query(query, [wellId, depth, JSON.stringify(dataObj)]);
      }
      
      console.log(`Inserted ${Math.min(i + batchSize, data.length)} / ${data.length} rows`);
    }
    
    await client.query('COMMIT');
    console.log('All data inserted successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get well by ID
 * @param {number} wellId - Well ID
 * @returns {Object} Well metadata
 */
async function getWellById(wellId) {
  const query = 'SELECT * FROM wells WHERE id = $1';
  const result = await pool.query(query, [wellId]);
  return result.rows[0];
}

/**
 * Get well data by depth range
 * @param {number} wellId - Well ID
 * @param {number} startDepth - Start depth
 * @param {number} endDepth - End depth
 * @returns {Array} Well data rows
 */
async function getWellData(wellId, startDepth, endDepth) {
  const query = `
    SELECT depth, data
    FROM well_data
    WHERE well_id = $1 AND depth >= $2 AND depth <= $3
    ORDER BY depth ASC
  `;
  
  const result = await pool.query(query, [wellId, startDepth, endDepth]);
  return result.rows;
}

/**
 * Get all wells
 * @returns {Array} All wells
 */
async function getAllWells() {
  const query = 'SELECT * FROM wells ORDER BY upload_date DESC';
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Clear all data from database
 */
async function clearDatabase() {
  await pool.query('DELETE FROM well_data');
  await pool.query('DELETE FROM wells');
  console.log('Database cleared');
}

export {
  insertWell,
  insertWellData,
  getWellById,
  getWellData,
  getAllWells,
  clearDatabase,
  pool
};