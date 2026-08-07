import * as crypto from 'crypto';

export class EncryptionUtil {
  private static readonly ALGORITHM = 'aes-256-cbc';

  private static getSecretKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || '32-byte-long-secret-key-for-aes!!';
    return crypto.scryptSync(key, 'salt', 32);
  }

  static encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.getSecretKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(cipherText: string): string {
    if (!cipherText) return '';
    const parts = cipherText.split(':');
    if (parts.length !== 2) return cipherText; // Return plain text fallback if unencrypted
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.getSecretKey(), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
