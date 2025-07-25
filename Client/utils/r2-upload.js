import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration
const R2_CONFIG = {
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY,
  },
};

const r2Client = new S3Client(R2_CONFIG);

export const uploadFileToR2 = async (file, key) => {
  try {
    // Convert File to ArrayBuffer for browser compatibility
    const arrayBuffer = await file.arrayBuffer();
    
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
      Key: key,
      Body: arrayBuffer,
      ContentType: file.type || 'image/jpeg',
    });

    await r2Client.send(command);
    
    // Return public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw error;
  }
};

export const uploadMultipleFilesToR2 = async (files, basePath) => {
  const uploadPromises = files.map(async (file, index) => {
    const key = `${basePath}/${String(index + 1).padStart(3, '0')}_${file.name}`;
    return uploadFileToR2(file, key);
  });

  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Multiple file upload error:', error);
    throw error;
  }
}; 