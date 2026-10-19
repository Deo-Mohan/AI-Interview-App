import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export class SupabaseService {
  private static clientInstance: SupabaseClient | null = null;
  private static adminInstance: SupabaseClient | null = null;

  /**
   * Safe Public Client using ANON Key
   */
  public static getClient(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !anonKey || !url.startsWith('https://')) {
      return null;
    }

    if (!this.clientInstance) {
      this.clientInstance = createClient(url, anonKey);
    }
    return this.clientInstance;
  }

  /**
   * Secure Admin Client using SERVICE ROLE KEY (Server only!)
   * NEVER exposed to the browser.
   */
  public static getAdminClient(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey || !url.startsWith('https://')) {
      return null;
    }

    if (!this.adminInstance) {
      this.adminInstance = createClient(url, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    return this.adminInstance;
  }

  public static isConnected(): boolean {
    return Boolean(this.getClient());
  }
}
