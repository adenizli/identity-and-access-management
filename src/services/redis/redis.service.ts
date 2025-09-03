import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationBootstrap {
  private readonly redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private lastConnectionTime: Date | null = null;
  private connectionAttempts = 0;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: parseInt(this.configService.get('REDIS_PORT'), 10) || 12531,
      password: this.configService.get('REDIS_PASSWORD') || undefined,
      username: this.configService.get('REDIS_USERNAME') || undefined,
      db: parseInt(this.configService.get('REDIS_DB'), 10) || 0,
      connectTimeout: parseInt(this.configService.get('REDIS_TIMEOUT'), 10) || 10000,
      lazyConnect: false, // Changed to false for immediate connection
      retryDelayOnFailover: 100,
      retryDelayOnClusterDown: 300,
      retryDelayOnFailure: 100,
      maxRetriesPerRequest: parseInt(process.env.REDIS_RETRY_ATTEMPTS, 10) || 3,
      enableReadyCheck: true,
      // TLS konfigürasyonu (gerekirse)
      ...(process.env.REDIS_TLS === 'true' && {
        tls: {
          rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
        },
      }),
    };

    this.logger.log(`Initializing Redis connection to ${redisConfig.host}:${redisConfig.port}`);
    this.redisClient = new Redis(redisConfig);
    this.setupEventListeners();
  }

  /**
   * Ensures Redis connection is established on application bootstrap.
   */
  async onApplicationBootstrap() {
    await this.waitForConnection();
  }

  /**
   * Registers Redis client event listeners for visibility and diagnostics.
   */
  private setupEventListeners(): void {
    this.redisClient.on('connect', () => {
      this.connectionStatus = 'connecting';
      this.connectionAttempts++;
      this.logger.log(`🔄 Redis connection attempt #${this.connectionAttempts} initiated`);
    });

    this.redisClient.on('ready', () => {
      this.connectionStatus = 'connected';
      this.lastConnectionTime = new Date();
      this.logger.log(`✅ Redis connection established successfully at ${this.lastConnectionTime.toISOString()}`);
      this.logger.log(
        `📊 Redis connection info: Host=${this.redisClient.options.host}, Port=${this.redisClient.options.port}, DB=${this.redisClient.options.db}`,
      );
    });

    this.redisClient.on('error', (error) => {
      this.connectionStatus = 'error';
      this.logger.error(`❌ Redis connection error:`, error);
      this.logger.error(`🔍 Error details: ${error.message}`);
    });

    this.redisClient.on('close', () => {
      this.connectionStatus = 'disconnected';
      this.logger.warn(`⚠️  Redis connection closed`);
    });

    this.redisClient.on('reconnecting', (delay) => {
      this.connectionStatus = 'connecting';
      this.logger.warn(`🔄 Redis reconnecting in ${delay}ms...`);
    });

    this.redisClient.on('end', () => {
      this.connectionStatus = 'disconnected';
      this.logger.warn(`🔚 Redis connection ended`);
    });
  }

  /**
   * Waits for Redis connection to become ready or times out.
   *
   * @param timeout - Timeout in milliseconds
   * @returns Resolves when ready, rejects on error/timeout
   */
  private async waitForConnection(timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Redis connection timeout after ${timeout}ms`));
      }, timeout);

      if (this.connectionStatus === 'connected') {
        clearTimeout(timeoutId);
        resolve();
        return;
      }

      const checkConnection = () => {
        if (this.connectionStatus === 'connected') {
          clearTimeout(timeoutId);
          resolve();
        } else if (this.connectionStatus === 'error') {
          clearTimeout(timeoutId);
          reject(new Error('Redis connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  /**
   * Sets a key/value with optional TTL (seconds).
   *
   * @param key - Key name
   * @param value - Value
   * @param ttl - Optional time to live in seconds
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      this.logOperation('SET', key);
      if (ttl) {
        await this.redisClient.set(key, value, 'EX', ttl);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      this.logger.error(`❌ Error setting Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Gets a value by key.
   *
   * @param key - Key name
   * @returns Value or null
   */
  async get(key: string): Promise<string | null> {
    try {
      this.logOperation('GET', key);
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`❌ Error getting Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a key.
   *
   * @param key - Key name
   */
  async delete(key: string): Promise<void> {
    try {
      this.logOperation('DELETE', key);
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`❌ Error deleting Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a key exists.
   *
   * @param key - Key name
   * @returns True if exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      this.logOperation('EXISTS', key);
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`❌ Error checking if Redis key exists ${key}:`, error);
      throw error;
    }
  }

  /**
   * Sets a hash field value.
   *
   * @param key - Hash key
   * @param field - Field name
   * @param value - Field value
   */
  async setHash(key: string, field: string, value: string): Promise<void> {
    try {
      this.logOperation('HSET', `${key}.${field}`);
      await this.redisClient.hset(key, field, value);
    } catch (error) {
      this.logger.error(`❌ Error setting Redis hash ${key}:`, error);
      throw error;
    }
  }

  /**
   * Gets a hash field value.
   *
   * @param key - Hash key
   * @param field - Field name
   * @returns Value or null
   */
  async getHash(key: string, field: string): Promise<string | null> {
    try {
      this.logOperation('HGET', `${key}.${field}`);
      return await this.redisClient.hget(key, field);
    } catch (error) {
      this.logger.error(`❌ Error getting Redis hash ${key}:`, error);
      throw error;
    }
  }

  /**
   * Gets all fields of a hash.
   *
   * @param key - Hash key
   * @returns Object of all fields/values
   */
  async getAllHash(key: string): Promise<Record<string, string>> {
    try {
      this.logOperation('HGETALL', key);
      return await this.redisClient.hgetall(key);
    } catch (error) {
      this.logger.error(`❌ Error getting all Redis hash ${key}:`, error);
      throw error;
    }
  }

  /**
   * Sets expiration (seconds) on a key.
   *
   * @param key - Key name
   * @param ttl - Time to live in seconds
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      this.logOperation('EXPIRE', key);
      await this.redisClient.expire(key, ttl);
    } catch (error) {
      this.logger.error(`❌ Error setting expiration for Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Gracefully disconnects the Redis client.
   */
  async disconnect(): Promise<void> {
    this.logger.log('🔌 Disconnecting from Redis...');
    await this.redisClient.quit();
    this.connectionStatus = 'disconnected';
    this.logger.log('✅ Redis disconnected successfully');
  }

  // Health check method
  /**
   * Performs a basic health check against Redis.
   *
   * @returns Connection status and metrics if available
   */
  async healthCheck(): Promise<{
    status: string;
    uptime?: number;
    lastConnection?: string;
  }> {
    try {
      await this.redisClient.ping();
      const uptime = this.lastConnectionTime ? Date.now() - this.lastConnectionTime.getTime() : null;

      return {
        status: this.connectionStatus,
        uptime: uptime ? Math.floor(uptime / 1000) : undefined, // in seconds
        lastConnection: this.lastConnectionTime?.toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
      };
    }
  }

  // Get connection status
  /**
   * Returns current connection status.
   */
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  // Get connection info
  /**
   * Returns basic connection info snapshot.
   */
  getConnectionInfo(): object {
    return {
      status: this.connectionStatus,
      host: this.redisClient.options.host,
      port: this.redisClient.options.port,
      db: this.redisClient.options.db,
      lastConnection: this.lastConnectionTime?.toISOString(),
      connectionAttempts: this.connectionAttempts,
    };
  }

  /**
   * Logs Redis operations in development when REDIS_DEBUG is true.
   */
  private logOperation(operation: string, key: string): void {
    // Only log in debug mode to avoid spam
    if (process.env.NODE_ENV === 'development' && process.env.REDIS_DEBUG === 'true') {
      this.logger.debug(`🔧 Redis ${operation}: ${key}`);
    }
  }

  /**
   * Exposes the underlying Redis client (use with caution).
   */
  getClient(): Redis {
    return this.redisClient;
  }
}
