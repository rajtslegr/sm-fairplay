const ENCRYPTION_SALT = 'fairplay-sm-salt';

export interface StoredApiKey {
  key: string;
  timestamp: number;
}

export const encryptApiKey = (apiKey: string): string => {
  if (!apiKey) return '';

  try {
    const saltedKey = apiKey + ENCRYPTION_SALT;
    const encodedKey = btoa(saltedKey);

    return encodedKey.split('').reverse().join('');
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

export const decryptApiKey = (encryptedKey: string): string => {
  if (!encryptedKey) return '';

  try {
    const encodedKey = encryptedKey.split('').reverse().join('');
    const saltedKey = atob(encodedKey);

    return saltedKey.substring(0, saltedKey.length - ENCRYPTION_SALT.length);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

export const isApiKeyExpired = (
  timestamp: number,
  expiryTimeMs: number,
): boolean => {
  if (!timestamp) return true;

  const now = Date.now();
  return now - timestamp > expiryTimeMs;
};

export const API_KEY_EXPIRY_MS = 2 * 60 * 60 * 1000;
