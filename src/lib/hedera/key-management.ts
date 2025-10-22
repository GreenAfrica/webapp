import * as crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY not configured on server');
  }

  return crypto.scryptSync(encryptionKey, 'salt', 32);
}

export function encryptPrivateKey(privateKey: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encryptedBuffer = Buffer.concat([
    cipher.update(privateKey, 'utf8'),
    cipher.final(),
  ]);

  const combined = Buffer.concat([iv, encryptedBuffer]);
  return combined.toString('base64');
}

export function decryptPrivateKey(encryptedPrivateKey: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedPrivateKey, 'base64');

    if (combined.length <= IV_LENGTH) {
      throw new Error('Invalid encrypted private key payload');
    }

    const iv = combined.subarray(0, IV_LENGTH);
    const encryptedBytes = combined.subarray(IV_LENGTH);

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedBytes),
      decipher.final(),
    ]);

    return decryptedBuffer.toString('utf8');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Failed to decrypt private key', { cause: error });
    }
    throw new Error('Failed to decrypt private key');
  }
}
