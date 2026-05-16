const crypto = require('crypto');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes (64 hex characters)
const ALGORITHM = 'aes-256-gcm';

/**
 * Helper to get the 32-byte Buffer key
 */
const getKey = () => {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('Invalid ENCRYPTION_KEY in environment variables. Must be 64 hex characters (32 bytes).');
  }
  return Buffer.from(ENCRYPTION_KEY, 'hex');
};

/**
 * Encrypts a plaintext string using AES-256-GCM
 * @param {string} text - Plaintext to encrypt
 * @returns {string} - Encrypted string in format "iv:encryptedData:authTag"
 */
const encrypt = (text) => {
  if (!text) return null;
  try {
    const iv = crypto.randomBytes(12); // 12 bytes IV for GCM
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypts an encrypted string using AES-256-GCM
 * @param {string} encryptedText - Encrypted string in format "iv:encryptedData:authTag"
 * @returns {string} - Decrypted plaintext string
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const [ivHex, encryptedHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const key = getKey();
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed. Data may be corrupted or key mismatch.');
  }
};

module.exports = {
  encrypt,
  decrypt
};
