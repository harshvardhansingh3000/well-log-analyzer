import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Check if S3 is configured
const isS3Configured = process.env.AWS_ACCESS_KEY_ID && 
                       process.env.AWS_SECRET_ACCESS_KEY && 
                       process.env.S3_BUCKET_NAME &&
                       process.env.AWS_ACCESS_KEY_ID !== 'your_key_here';

let s3Client = null;

if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('S3 configured and ready');
} else {
  console.log('S3 not configured - files will not be uploaded to S3');
}

/**
 * Upload file to S3 (optional - skips if not configured)
 * @param {string} filePath - Local file path
 * @param {string} fileName - Desired S3 key/filename
 * @returns {string} S3 key or local filename
 */
export async function uploadToS3(filePath, fileName) {
  if (!isS3Configured) {
    console.log('S3 not configured - skipping upload');
    return `local/${fileName}`;
  }

  const fileContent = fs.readFileSync(filePath);
  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: 'text/plain',
  });

  await s3Client.send(command);
  console.log(`File uploaded to S3: ${key}`);
  
  return key;
}
