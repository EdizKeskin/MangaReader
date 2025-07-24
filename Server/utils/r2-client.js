// bu sayfanın tamamı cursor tarafindan oluşturulmuştur

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { NodeHttpHandler } = require("@smithy/node-http-handler");
const mime = require("mime-types");
const https = require("https");
require("dotenv").config();

// Create a more compatible HTTPS agent for Windows
const createHttpsAgent = () => {
  return new https.Agent({
    keepAlive: true,
    // Use system default ciphers
    ciphers: undefined,
    // Let Node.js negotiate the best TLS version
    secureProtocol: undefined,
    // Accept certificates
    rejectUnauthorized: true,
    // Increase handshake timeout
    handshakeTimeout: 20000,
  });
};

// Cloudflare R2 Client with Windows-compatible configuration
const r2Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
  // Use custom request handler with our agent
  requestHandler: new NodeHttpHandler({
    httpsAgent: createHttpsAgent(),
    // Increase timeouts
    connectionTimeout: 20000,
    socketTimeout: 20000,
  }),
  // Additional S3 settings
  apiVersion: "2006-03-01",
  maxAttempts: 3,
  retryMode: "adaptive",
});

const bucketName = process.env.R2_BUCKET_NAME;

/**
 * Upload a file to R2
 * @param {Buffer} buffer - File buffer
 * @param {string} key - File path/key in bucket
 * @param {string} mimeType - File MIME type
 * @returns {Promise<void>}
 */
async function uploadToR2(buffer, key, mimeType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await r2Client.send(command);
}

/**
 * Delete a file from R2
 * @param {string} key - File path/key in bucket
 * @returns {Promise<void>}
 */
async function deleteFromR2(key) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Delete multiple files from R2
 * @param {string} prefix - Folder prefix to delete
 * @returns {Promise<void>}
 */
async function deleteMultipleFromR2(prefix) {
  try {
    // List all objects with the given prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const listResponse = await r2Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log(`No files found with prefix: ${prefix}`);
      return;
    }

    // Delete objects in batches (max 1000 per request)
    const objects = listResponse.Contents.map((obj) => ({ Key: obj.Key }));

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: objects,
      },
    });

    await r2Client.send(deleteCommand);
    console.log(
      `Successfully deleted ${objects.length} files with prefix: ${prefix}`
    );
  } catch (error) {
    console.error(`Error deleting files with prefix ${prefix}:`, error);
    throw error;
  }
}

/**
 * Get public URL for a file
 * @param {string} key - File path/key in bucket
 * @returns {string} Public URL
 */
function getPublicUrl(key) {
  // If your R2 bucket is public, you can use direct URLs
  // Format: https://[custom-domain]/[key] or https://[bucket-name].[account-id].r2.cloudflarestorage.com/[key]
  const publicDomain =
    process.env.R2_PUBLIC_DOMAIN ||
    `${bucketName}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  return `https://${publicDomain}/${key}`;
}

/**
 * Get signed URL for a file (for private buckets)
 * @param {string} key - File path/key in bucket
 * @param {number} expiresIn - Expiration time in seconds (default: 7 days)
 * @returns {Promise<string>} Signed URL
 */
async function getSignedUrlR2(key, expiresIn = 604800) {
  const command = new HeadObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn });
  return url;
}

/**
 * Parse file name from R2 URL
 * @param {string} url - R2 URL
 * @returns {string} File key/path
 */
function parseFileKeyFromURL(url) {
  try {
    const urlObj = new URL(url);
    // Remove leading slash from pathname
    return urlObj.pathname.substring(1);
  } catch (error) {
    // Fallback for malformed URLs
    const parts = url.split("/");
    return parts.slice(3).join("/");
  }
}

module.exports = {
  uploadToR2,
  deleteFromR2,
  deleteMultipleFromR2,
  getPublicUrl,
  getSignedUrlR2,
  parseFileKeyFromURL,
  r2Client,
  bucketName,
};
