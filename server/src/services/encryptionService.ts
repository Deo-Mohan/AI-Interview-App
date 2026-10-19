import crypto from 'crypto';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
}

export class EncryptionService {
  private static ALGORITHM = 'aes-256-gcm';
  private static IV_LENGTH = 16; // 128-bit IV for GCM

  /**
   * Derive a 32-byte key from master encryption secret
   */
  private static getMasterKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET || 'dev_master_secret_key_must_be_32_bytes_long_minimum!';
    // Derive 256-bit key using SHA-256
    return crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Encrypt plaintext string using AES-256-GCM
   */
  static encrypt(plaintext: string): EncryptedData {
    const key = this.getMasterKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt ciphertext using AES-256-GCM and verify auth tag
   */
  static decrypt(encrypted: EncryptedData): string {
    const key = this.getMasterKey();
    const iv = Buffer.from(encrypted.iv, 'hex');
    const tag = Buffer.from(encrypted.tag, 'hex');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }

  /**
   * Extracts safe masked representation (e.g. "...x1y2")
   */
  static maskKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 6) return '****';
    const lastFour = apiKey.slice(-4);
    return `...${lastFour}`;
  }

  /**
   * SSRF Protection: Validates custom endpoints
   * Blocks private IPs, loopback, link-local, AWS/GCP metadata services, and invalid protocols
   */
  static validateCustomEndpoint(endpointUrl: string): { isValid: boolean; reason?: string } {
    try {
      const parsed = new URL(endpointUrl);

      // Must be http or https
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isValid: false, reason: 'Protocol must be http or https' };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Block metadata services & internal hosts
      const blockedHostnames = [
        'localhost',
        'metadata.google.internal',
        'instance-data',
        '169.254.169.254'
      ];
      if (blockedHostnames.includes(hostname) || hostname.endsWith('.internal') || hostname.endsWith('.local')) {
        return { isValid: false, reason: `Destination host '${hostname}' is restricted for security.` };
      }

      // Check IPv4 ranges
      const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      const match = hostname.match(ipv4Regex);
      if (match) {
        const [, o1, o2, o3, o4] = match.map(Number);
        // Check 127.0.0.0/8 (Loopback)
        if (o1 === 127) return { isValid: false, reason: 'Loopback IP addresses are not permitted.' };
        // Check 10.0.0.0/8 (Private)
        if (o1 === 10) return { isValid: false, reason: 'Private network addresses (10.0.0.0/8) are not permitted.' };
        // Check 172.16.0.0/12 (Private)
        if (o1 === 172 && o2 >= 16 && o2 <= 31) return { isValid: false, reason: 'Private network addresses (172.16.0.0/12) are not permitted.' };
        // Check 192.168.0.0/16 (Private)
        if (o1 === 192 && o2 === 168) return { isValid: false, reason: 'Private network addresses (192.168.0.0/16) are not permitted.' };
        // Check 169.254.0.0/16 (Link Local / Cloud Metadata)
        if (o1 === 169 && o2 === 254) return { isValid: false, reason: 'Cloud metadata IP (169.254.x.x) is strictly prohibited.' };
        // Check 0.0.0.0
        if (o1 === 0) return { isValid: false, reason: '0.0.0.0 address is not permitted.' };
      }

      // Check IPv6 loopback
      if (hostname === '::1' || hostname.startsWith('fe80:') || hostname.startsWith('fc00:')) {
        return { isValid: false, reason: 'IPv6 local / private addresses are not permitted.' };
      }

      return { isValid: true };
    } catch (e: any) {
      return { isValid: false, reason: 'Malformed URL: ' + e.message };
    }
  }
}
