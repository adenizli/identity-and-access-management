import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm: string;
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.algorithm = this.configService.get<string>('CRYPTO_ALGORITHM', 'aes-256-gcm');
    const keyBase64 = this.configService.get<string>('CRYPTO_KEY');
    if (!keyBase64) {
      throw new Error('CRYPTO_KEY is not set');
    }
    this.key = Buffer.from(keyBase64, 'base64');
    if (this.algorithm.includes('256') && this.key.length !== 32) throw new Error('Invalid CRYPTO_KEY');
  }

  encryptString(value: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm as any, this.key, iv) as crypto.CipherGCM;

    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const token = Buffer.concat([iv, authTag, encrypted]).toString('base64');
    return token;
  }

  decryptString(token: string): string {
    const raw = Buffer.from(token, 'base64');
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);

    const decipher = crypto.createDecipheriv(this.algorithm as any, this.key, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString('utf8');
  }
}
