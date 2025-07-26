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

// Convert image to WebP format with 85% quality
export const convertToWebP = (file, maxWidth = 1200, maxHeight = 1600) => {
  return new Promise((resolve, reject) => {
    // Skip conversion if already WebP
    if (file.type === 'image/webp') {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and convert to WebP
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new filename with .webp extension
            const fileName = file.name.replace(/\.[^/.]+$/, '.webp');
            const webpFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          } else {
            reject(new Error('WebP conversion failed'));
          }
        },
        'image/webp',
        0.85 // 85% quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Image loading failed'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const uploadFileToR2 = async (file, key) => {
  try {
    // Convert to WebP if it's an image
    let fileToUpload = file;
    if (file.type && file.type.startsWith('image/')) {
      fileToUpload = await convertToWebP(file);
    }
    
    // Convert File to ArrayBuffer for browser compatibility
    const arrayBuffer = await fileToUpload.arrayBuffer();
    
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
      Key: key,
      Body: arrayBuffer,
      ContentType: fileToUpload.type || 'image/webp',
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
    // Convert to WebP first
    const webpFile = await convertToWebP(file);
    const fileName = webpFile.name || `${String(index + 1).padStart(3, '0')}.webp`;
    const key = `${basePath}/${fileName}`;
    return uploadFileToR2(webpFile, key);
  });

  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Multiple file upload error:', error);
    throw error;
  }
}; 