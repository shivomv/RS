const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
require('dotenv').config();

const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.S3_BUCKET_NAME || 's3.shivomverma.in';
const publicBaseUrl = (process.env.S3_PUBLIC_BASE_URL || `https://s3.${region}.amazonaws.com/${bucketName}`).replace(/\/$/, '');

let s3Client = null;

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

/**
 * Uploads a Buffer to AWS S3 and returns the public URL
 */
async function uploadBuffer({ buffer, fileName, contentType = 'application/octet-stream', folder = 'uploads' }) {
  if (!buffer) throw new Error('Buffer is required for S3 upload');

  const client = getS3Client();
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const uniqueId = crypto.randomBytes(6).toString('hex');
  const safeName = (fileName || 'file.bin').replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${cleanFolder}/${Date.now()}-${uniqueId}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);
  return `${publicBaseUrl}/${key}`;
}

/**
 * Uploads a base64 encoded data URI or base64 string to AWS S3.
 * If the string is already an HTTP URL, it is returned untouched.
 */
async function uploadBase64(dataUriOrBase64, folder = 'uploads') {
  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== 'string') return dataUriOrBase64;

  const trimmed = dataUriOrBase64.trim();
  // If already an HTTP/HTTPS URL, don't re-upload
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Parse Data URI format: data:[<mediatype>][;base64],<data>
  let mimeType = 'image/jpeg';
  let base64Data = trimmed;

  const matches = trimmed.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches) {
    mimeType = matches[1];
    base64Data = matches[2];
  }

  const extMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
  };
  const ext = extMap[mimeType.toLowerCase()] || 'jpg';
  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = `img.${ext}`;

  return uploadBuffer({
    buffer,
    fileName,
    contentType: mimeType,
    folder,
  });
}

/**
 * Deletes an object from AWS S3
 */
async function deleteObject(keyOrUrl) {
  if (!keyOrUrl) return;
  try {
    const client = getS3Client();
    let key = keyOrUrl;
    if (key.startsWith('http')) {
      const url = new URL(key);
      key = url.pathname.replace(/^\/+/, '');
    }
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (err) {
    console.warn(`[S3 Warning] Failed to delete object ${keyOrUrl}:`, err.message);
  }
}

module.exports = {
  uploadBuffer,
  uploadBase64,
  deleteObject,
  bucketName,
  publicBaseUrl,
};
