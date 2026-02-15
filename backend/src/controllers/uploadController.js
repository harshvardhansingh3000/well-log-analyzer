import { parseLASFile } from '../utils/lasParser.js';
import { insertWell, insertWellData } from '../services/dbService.js';
import { uploadToS3 } from '../services/s3Service.js';
import fs from 'fs';

/**
 * Handle LAS file upload
 */
export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    
    console.log('Parsing LAS file...');
    const result = parseLASFile(filePath);
    
    console.log('Uploading to S3...');
    const s3Key = await uploadToS3(filePath, req.file.originalname);
    
    console.log('Inserting well metadata...');
    const wellId = await insertWell(result.metadata, s3Key);
    
    console.log('Inserting well data...');
    await insertWellData(wellId, result.curves, result.data);
    
    // Delete temporary file
    fs.unlinkSync(filePath);
    
    console.log('Upload complete!');
    res.json({
      message: 'File uploaded successfully',
      wellId,
      wellName: result.metadata.WELL,
      totalRows: result.data.length,
      s3Key
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to upload file' });
  }
}
